<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProfilTranslationController extends Controller
{
    /**
     * Terjemahkan konten Profil TPQ.
     *
     * Endpoint:
     * POST /api/profil/translate
     */
    public function translate(Request $request)
    {
        $validated = $request->validate([
            'profil' => [
                'required',
                'string',
                'max:20000',
            ],

            'visi' => [
                'required',
                'string',
                'max:10000',
            ],

            'misi' => [
                'required',
                'string',
                'max:20000',
            ],

            'nilaiAkhlak' => [
    'nullable',
    'string',
    'max:20000',
],
'nilaiQuran' => [
    'nullable',
    'string',
    'max:20000',
],
'nilaiDisiplin' => [
    'nullable',
    'string',
    'max:20000',
],
'nilaiPrestasi' => [
    'nullable',
    'string',
    'max:20000',
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

            $targetLanguage = $validated['language'] === 'ar'
                ? 'Arabic'
                : 'English';

            $sourceContent = [
                'profil' => $validated['profil'],
                'visi' => $validated['visi'],
                'misi' => $validated['misi'],
                'nilaiAkhlak' => $validated['nilaiAkhlak'],
                'nilaiQuran' => $validated['nilaiQuran'],
                'nilaiDisiplin' => $validated['nilaiDisiplin'],
                'nilaiPrestasi' => $validated['nilaiPrestasi'],
            ];

            $sourceJson = json_encode(
                $sourceContent,
                JSON_UNESCAPED_UNICODE |
                JSON_UNESCAPED_SLASHES |
                JSON_PRETTY_PRINT
            );

            $prompt = <<<PROMPT
You are the official translator for the TPQ Khairunnissa website.

Translate the following Indonesian TPQ profile content into {$targetLanguage}.

STRICT RULES:

1. Translate the meaning accurately and naturally.
2. Do not add any new information.
3. Do not remove any information.
4. Preserve the original meaning of every field.
5. Preserve the structure of the content.
6. Preserve line breaks in the "misi" field.
7. Names of people MUST remain exactly as written.
8. Do NOT translate people's names.
9. Do NOT translate the official TPQ name "TPQ Khairunnissa".
10. Preserve official organization names, abbreviations, codes, NIG,
    educational qualifications, numbers, dates, and other proper names.
11. Religious terms such as Iqra, Al-Qur'an, Qurani, and similar
    terms may remain in their established form when appropriate.
12. Do not invent names, titles, programs, qualifications, or facts.
13. Do not provide explanations or comments.
14. Return ONLY valid JSON.
15. Do not use Markdown or code fences.
16. The JSON keys MUST remain exactly:

{
    "profil": "...",
    "visi": "...",
    "misi": "...",
    "nilaiAkhlak": "...",
    "nilaiQuran": "...",
    "nilaiDisiplin": "...",
    "nilaiPrestasi": "..."
}

SOURCE CONTENT:

{$sourceJson}
PROMPT;

            $url =
                'https://generativelanguage.googleapis.com/v1beta/models/' .
                'gemini-3.1-flash-lite:generateContent?key=' .
                $apiKey;

            $response = Http::timeout(60)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
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
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'responseMimeType' => 'application/json',
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini Profil Translation API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Layanan terjemahan Profil TPQ sedang tidak tersedia. Silakan coba lagi.',
                ], 503);
            }

            $result = $response->json();

            $answer =
                $result['candidates'][0]['content']['parts'][0]['text']
                ?? null;

            if (!$answer) {
                Log::error('Gemini Profil Translation Empty Response', [
                    'response' => $result,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'AI tidak memberikan hasil terjemahan Profil TPQ.',
                ], 503);
            }

            $answer = trim($answer);

            // Bersihkan kemungkinan code fence.
            $answer = preg_replace('/^`json\s*/i', '', $answer);
            $answer = preg_replace('/^`\s*/', '', $answer);
            $answer = preg_replace('/\s*`$/', '', $answer);
            $answer = trim($answer);

            $translation = json_decode($answer, true);

            $requiredKeys = [
                'profil',
                'visi',
                'misi',
                'nilaiAkhlak',
                'nilaiQuran',
                'nilaiDisiplin',
                'nilaiPrestasi',
            ];

            if (
                !is_array($translation) ||
                count(
                    array_diff(
                        $requiredKeys,
                        array_keys($translation)
                    )
                ) > 0
            ) {
                Log::error('Gemini Profil Translation Invalid JSON', [
                    'answer' => $answer,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Format hasil terjemahan Profil TPQ tidak valid.',
                ], 503);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'profil' => trim((string) $translation['profil']),
                    'visi' => trim((string) $translation['visi']),
                    'misi' => trim((string) $translation['misi']),
                    'nilaiAkhlak' => trim((string) $translation['nilaiAkhlak']),
                    'nilaiQuran' => trim((string) $translation['nilaiQuran']),
                    'nilaiDisiplin' => trim((string) $translation['nilaiDisiplin']),
                    'nilaiPrestasi' => trim((string) $translation['nilaiPrestasi']),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Profil Translation Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjemahan Profil TPQ mengalami gangguan. Silakan coba lagi.',
            ], 500);
        }
    }
}


