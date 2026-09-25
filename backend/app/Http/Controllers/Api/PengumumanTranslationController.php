<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PengumumanTranslationController
{
    public function translate(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:5000',
            'isi' => 'required|string|max:50000',
            'language' => 'required|in:en,ar',
        ]);

        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'GEMINI_API_KEY belum tersedia.',
            ], 500);
        }

        $targetLanguage = $request->language === 'ar'
            ? 'Arabic'
            : 'English';

        $prompt = <<<PROMPT
Translate the following TPQ announcement into {$targetLanguage}.

STRICT RULES:
- Return valid JSON only.
- JSON format must be exactly: {"judul":"...","isi":"..."}
- Translate only the meaning of the text.
- Preserve all people's names exactly as written.
- Do not translate people's names.
- Preserve official names, organization names, abbreviations, codes, NIG, qualifications, dates, numbers, and proper names unless translation is clearly required for meaning.
- Do not add explanations.
- Do not add information.
- Preserve paragraph structure.

JUDUL:
{$request->judul}

ISI:
{$request->isi}
PROMPT;

        $response = Http::timeout(60)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=' . $apiKey,
                [
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
                ]
            );

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menerjemahkan pengumuman.',
                'error' => $response->json(),
            ], $response->status());
        }

        $text = $response->json(
            'candidates.0.content.parts.0.text'
        );

        if (!$text) {
            return response()->json([
                'success' => false,
                'message' => 'Hasil terjemahan kosong.',
            ], 500);
        }

        $text = trim($text);
        $text = preg_replace('/^```json\s*/i', '', $text);
        $text = preg_replace('/\s*```$/', '', $text);

        $translated = json_decode($text, true);

        if (
            !is_array($translated) ||
            !isset($translated['judul']) ||
            !isset($translated['isi'])
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Format hasil terjemahan tidak valid.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'judul' => $translated['judul'],
                'isi' => $translated['isi'],
            ],
        ]);
    }
}
