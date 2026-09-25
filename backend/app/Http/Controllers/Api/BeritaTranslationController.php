<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BeritaTranslationController extends Controller
{
    /**
     * Terjemahkan judul dan isi berita untuk website public.
     *
     * Endpoint ini terpisah dari AiController agar proses terjemahan
     * tidak memuat seluruh database TPQ sebagai context AI.
     */
    public function translate(Request $request)
    {
        $validated = $request->validate([
            'judul' => [
                'required',
                'string',
                'max:5000',
            ],
            'isi' => [
                'required',
                'string',
                'max:50000',
            ],
            'language' => [
                'required',
                'string',
                'in:en,ar',
            ],
        ]);

        try {
            $apiKey = env('GEMINI_API_KEY');

            if (empty($apiKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'GEMINI_API_KEY belum dikonfigurasi di server.',
                ], 500);
            }

            $language = $validated['language'];

            if ($language === 'en') {
                $targetLanguage = 'English';
            } else {
                $targetLanguage = 'Arabic';
            }

            $prompt = <<<TEXT
Anda adalah penerjemah resmi konten berita website TPQ Khairunnissa.

Terjemahkan berita berikut dari Bahasa Indonesia ke {$targetLanguage}.

ATURAN PENTING:

1. Terjemahkan judul dan isi berita secara akurat.
2. Pertahankan makna asli berita.
3. Pertahankan struktur paragraf.
4. Jangan menambahkan informasi baru.
5. Jangan mengurangi informasi penting.
6. JANGAN menerjemahkan nama orang. Nama orang harus tetap persis
   seperti bentuk aslinya.
7. JANGAN menerjemahkan nama TPQ, nama lembaga, nama organisasi,
   nama tempat khusus, NIG, NIS, kode, gelar/kualifikasi,
   atau nama resmi lainnya jika merupakan proper name.
8. Angka, tanggal, dan data faktual harus tetap benar.
9. Jangan memberikan penjelasan atau komentar tambahan.
10. Hasil wajib berupa JSON valid dengan format:

{
    "judul": "judul hasil terjemahan",
    "isi": "isi hasil terjemahan"
}

Jangan gunakan markdown code fence.

==================================================
JUDUL ASLI
==================================================

{$validated['judul']}

==================================================
ISI BERITA ASLI
==================================================

{$validated['isi']}
TEXT;

            $model = 'gemini-3.1-flash-lite';

            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

            $response = Http::timeout(60)
                ->post($url, [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $prompt,
                                ],
                            ],
                        ],
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini Translation API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Layanan terjemahan sedang tidak tersedia. Silakan coba lagi.',
                ], 503);
            }

            $result = $response->json();

            $answer =
                $result['candidates'][0]['content']['parts'][0]['text']
                ?? null;

            if (!$answer) {
                Log::error('Gemini Translation Empty Response', [
                    'response' => $result,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'AI tidak memberikan hasil terjemahan.',
                ], 503);
            }

            $answer = trim($answer);

            // Bersihkan kemungkinan code fence jika Gemini tetap mengirimkannya.
            $answer = preg_replace('/^```json\s*/i', '', $answer);
            $answer = preg_replace('/^```\s*/', '', $answer);
            $answer = preg_replace('/\s*```$/', '', $answer);
            $answer = trim($answer);

            $translation = json_decode($answer, true);

            if (
                !is_array($translation) ||
                !isset($translation['judul']) ||
                !isset($translation['isi'])
            ) {
                Log::error('Gemini Translation Invalid JSON', [
                    'answer' => $answer,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Format hasil terjemahan tidak valid.',
                ], 503);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'judul' => trim($translation['judul']),
                    'isi' => trim($translation['isi']),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Berita Translation Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjemahan sedang mengalami gangguan. Silakan coba lagi.',
            ], 500);
        }
    }
}
