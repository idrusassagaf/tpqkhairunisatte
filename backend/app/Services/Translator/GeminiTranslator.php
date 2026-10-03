<?php

namespace App\Services\Translator;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Helper terjemahan bersama dipakai oleh Profil TPQ, Berita,
 * Pengumuman, Galeri, dan Laporan Ringkas.
 *
 * Dipakai di WRITE path (saat admin simpan data), bukan di READ
 * path, supaya pengunjung publik / PDF tidak perlu menunggu AI
 * setiap kali membuka halaman.
 */
class GeminiTranslator
{
    protected string $model = 'gemini-3.1-flash-lite';

    /**
     * Terjemahkan satu set field teks (key => text) ke bahasa target.
     *
     * Struktur JSON (key) dipertahankan persis, hanya nilainya yang
     * diterjemahkan. Mengembalikan null kalau gagal (API key kosong,
     * request gagal, atau hasil tidak valid) -- caller wajib punya
     * fallback (biasanya: pakai teks Bahasa Indonesia aslinya).
     */
    public function translateFields(array $fields, string $targetLanguage): ?array
    {
        $apiKey = env('GEMINI_API_KEY');

        if (empty($apiKey)) {
            Log::warning('GEMINI_API_KEY tidak tersedia untuk terjemahan.');

            return null;
        }

        $jsonPayload = json_encode(
            $fields,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
        );

        if ($jsonPayload === false) {
            return null;
        }

        $languageLabel = $targetLanguage === 'ar' ? 'Arabic' : 'English';

        $prompt = <<<TEXT
You are the official translator for the TPQ Khairunnissa website.

Translate every text value in the JSON below from Indonesian into {$languageLabel}.

STRICT RULES:

1. Keep the JSON structure exactly the same.
2. Do not change the JSON keys.
3. Only translate the text values.
4. Do not change numbers, dates, codes, or proper names.
5. Do NOT translate people's names.
6. Do NOT translate the official name "TPQ Khairunnissa" / "TPQ Hairunissa".
7. Preserve simple HTML tags such as <br> if present.
8. Do not add new information. Do not remove information.
9. Do not add explanations or comments.
10. Return ONLY valid JSON, no markdown code fences.

ORIGINAL JSON:

{$jsonPayload}
TEXT;

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/"
                . "{$this->model}:generateContent?key={$apiKey}";

            $response = Http::timeout(60)
                ->connectTimeout(10)
                // Panggilan berturut-turut ke host yang sama kadang
                // "menggantung" karena koneksi keep-alive yang stale.
                // Paksa koneksi baru + retry sekali.
                ->withOptions([
                    'curl' => [
                        CURLOPT_FRESH_CONNECT => true,
                        CURLOPT_FORBID_REUSE => true,
                    ],
                ])
                ->retry(2, 2000)
                ->post($url, [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                        'responseMimeType' => 'application/json',
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini Translation API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $text = $response->json('candidates.0.content.parts.0.text');

            if (!$text) {
                Log::error('Gemini Translation Empty Response', [
                    'response' => $response->json(),
                ]);

                return null;
            }

            $text = trim($text);
            $text = preg_replace('/^```json\s*/i', '', $text);
            $text = preg_replace('/^```\s*/', '', $text);
            $text = preg_replace('/\s*```$/', '', $text);
            $text = trim($text);

            $jsonObject = $this->extractJsonObject($text);

            if ($jsonObject === null) {
                Log::error('Gemini Translation JSON Object Not Found', [
                    'answer' => $text,
                ]);

                return null;
            }

            $decoded = json_decode($jsonObject, true);

            if (!is_array($decoded)) {
                Log::error('Gemini Translation Invalid JSON', [
                    'answer' => $jsonObject,
                ]);

                return null;
            }

            $result = [];

            foreach (array_keys($fields) as $key) {
                $result[$key] = isset($decoded[$key]) && is_string($decoded[$key])
                    ? trim($decoded[$key])
                    : ($fields[$key] ?? '');
            }

            return $result;
        } catch (\Throwable $e) {
            Log::error('Gemini Translation Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return null;
        }
    }

    /**
     * Terjemahkan satu set field ke beberapa bahasa sekaligus.
     *
     * Return: ['en' => [...]|null, 'ar' => [...]|null]
     */
    public function translateToAll(array $fields, array $languages = ['en', 'ar']): array
    {
        $result = [];

        foreach ($languages as $language) {
            $result[$language] = $this->translateFields($fields, $language);
        }

        return $result;
    }

    /**
     * Ambil objek JSON pertama yang benar-benar seimbang dari teks.
     *
     * Gemini kadang menambahkan karakter setelah JSON yang valid.
     */
    private function extractJsonObject(string $text): ?string
    {
        $length = strlen($text);

        $start = null;
        $depth = 0;
        $inString = false;
        $escaped = false;

        for ($i = 0; $i < $length; $i++) {
            $char = $text[$i];

            if ($inString) {
                if ($escaped) {
                    $escaped = false;
                    continue;
                }

                if ($char === '\\') {
                    $escaped = true;
                    continue;
                }

                if ($char === '"') {
                    $inString = false;
                }

                continue;
            }

            if ($char === '"') {
                $inString = true;
                continue;
            }

            if ($char === '{') {
                if ($start === null) {
                    $start = $i;
                }

                $depth++;
                continue;
            }

            if ($char === '}') {
                if ($start === null) {
                    continue;
                }

                $depth--;

                if ($depth === 0) {
                    return substr($text, $start, $i - $start + 1);
                }
            }
        }

        return null;
    }
}
