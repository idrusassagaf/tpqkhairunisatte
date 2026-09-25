<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

use App\Models\Santri;
use App\Models\Guru;
use App\Models\OrangTua;
use App\Models\Berita;
use App\Models\Pengumuman;
use App\Models\ProgresIqra;
use App\Models\ProgresQuran;
use App\Models\Galeri;
use App\Models\ProgresHafalan;
use App\Models\PengaturanLaporan;

use App\Services\Report\ReportEngine;

class LaporanPdfController extends Controller
{
    private function dataLaporan()
    {
        return [
            'santri' => Santri::with('orangTua')->get(),
            'guru' => Guru::all(),
            'orang_tua' => OrangTua::all(),
            'berita' => Berita::all(),
            'pengumuman' => Pengumuman::all(),
            'galeri' => Galeri::all(),
            'progres_iqra' => ProgresIqra::all(),
            'progres_quran' => ProgresQuran::all(),
            'progres_hafalan' => ProgresHafalan::all(),
        ];
    }

    private function statistik()
    {
        $totalSantri = Santri::count();
        $totalGuru = Guru::count();

        $rasioGuru = $totalGuru > 0
            ? "1 : " . round($totalSantri / $totalGuru)
            : "-";

        $totalIqra = Santri::where('kelas', 'Iqra')->count();

        $totalQuran = Santri::whereIn('kelas', [
            'Al Quran',
            'AlQuran',
            "Al-Qur'an"
        ])->count();

        $persenIqra = $totalSantri > 0
            ? round(($totalIqra / $totalSantri) * 100, 1)
            : 0;

        $persenQuran = $totalSantri > 0
            ? round(($totalQuran / $totalSantri) * 100, 1)
            : 0;

        $totalProgresIqra = ProgresIqra::count();

        $iqraLancar = ProgresIqra::where(
            'progres',
            'Lancar'
        )->count();

        $persenIqraLancar = $totalProgresIqra > 0
            ? round(($iqraLancar / $totalProgresIqra) * 100, 1)
            : 0;

        $totalProgresQuran = ProgresQuran::count();

        $quranLancar = ProgresQuran::where(
            'progres',
            'Lancar'
        )->count();

        $persenQuranLancar = $totalProgresQuran > 0
            ? round(($quranLancar / $totalProgresQuran) * 100, 1)
            : 0;

        $totalProgresHafalan = ProgresHafalan::count();

        $hafalanLancar = ProgresHafalan::where(
            'progres',
            'Lancar'
        )->count();

        $hafalanBelum = ProgresHafalan::where(
            'progres',
            'Belum'
        )->count();

        $persenHafalanLancar = $totalProgresHafalan > 0
            ? round(($hafalanLancar / $totalProgresHafalan) * 100, 1)
            : 0;

        $persenHafalanBelum = $totalProgresHafalan > 0
            ? round(($hafalanBelum / $totalProgresHafalan) * 100, 1)
            : 0;

        return [
            'totalSantri' => $totalSantri,
            'totalGuru' => $totalGuru,
            'rasioGuru' => $rasioGuru,
            'persenIqra' => $persenIqra,
            'persenQuran' => $persenQuran,
            'persenIqraLancar' => $persenIqraLancar,
            'persenQuranLancar' => $persenQuranLancar,
            'persenHafalanLancar' => $persenHafalanLancar,
            'persenHafalanBelum' => $persenHafalanBelum,
        ];
    }

    private function normalizeLanguage(?string $language): string
    {
        return in_array($language, ['id', 'en', 'ar'], true)
            ? $language
            : 'id';
    }

    /**
     * Ambil objek JSON pertama yang valid dari response Gemini.
     *
     * Gemini kadang mengembalikan JSON valid kemudian menambahkan
     * karakter/bracket tambahan. Parser ini mencari object JSON
     * yang benar-benar seimbang dan mengabaikan karakter setelahnya.
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
                    return substr(
                        $text,
                        $start,
                        $i - $start + 1
                    );
                }
            }
        }

        return null;
    }

    /**
     * Kirim satu payload ke Gemini untuk diterjemahkan.
     */
    private function translatePayload(
        array $payload,
        string $targetLanguage,
        string $section
    ): ?array {
        $apiKey = env('GEMINI_API_KEY');

        if (empty($apiKey)) {
            Log::warning(
                'GEMINI_API_KEY tidak tersedia untuk PDF translation.'
            );

            return null;
        }

        $jsonPayload = json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE |
                JSON_UNESCAPED_SLASHES |
                JSON_PRETTY_PRINT
        );

        if ($jsonPayload === false) {
            Log::error(
                'PDF Translation JSON Encode Error',
                [
                    'section' => $section,
                ]
            );

            return null;
        }

        $prompt = <<<TEXT
Anda adalah penerjemah resmi Laporan Ringkas TPQ Khairunissa.

Terjemahkan seluruh teks Bahasa Indonesia di dalam JSON berikut
ke {$targetLanguage}.

ATURAN WAJIB:

1. Pertahankan struktur JSON secara persis.
2. Jangan mengubah nama key JSON.
3. Hanya terjemahkan nilai teks Bahasa Indonesia.
4. Jangan mengubah angka.
5. Jangan mengubah persentase.
6. Jangan mengubah rasio.
7. Jangan mengubah tanggal.
8. Jangan mengubah data faktual.
9. JANGAN menerjemahkan nama orang.
10. JANGAN menerjemahkan nama TPQ.
11. JANGAN menerjemahkan nama lembaga.
12. JANGAN menerjemahkan nama organisasi.
13. JANGAN menerjemahkan nama tempat khusus.
14. JANGAN menerjemahkan NIG, NIS, kode, atau proper name.
15. Istilah Iqra dan Al-Qur'an tetap dipertahankan sesuai konteks.
16. Jika terdapat HTML sederhana seperti <br>, pertahankan.
17. Jangan menambahkan informasi baru.
18. Jangan mengurangi informasi.
19. Jangan memberikan komentar atau penjelasan.
20. Kembalikan HANYA JSON valid.
21. Jangan gunakan markdown code fence.

JSON ASLI:

{$jsonPayload}

TEXT;

        try {
            $model = 'gemini-3.1-flash-lite';

            $url =
                "https://generativelanguage.googleapis.com/v1beta/models/"
                . "{$model}:generateContent?key={$apiKey}";

            $response = Http::timeout(45)
                ->connectTimeout(10)
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
                        'temperature' => 0.1,
                        'responseMimeType' => 'application/json',
                    ],
                ]);

            if (!$response->successful()) {
                Log::error(
                    'Gemini PDF Translation API Error',
                    [
                        'section' => $section,
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]
                );

                return null;
            }

            $result = $response->json();

            $translated =
                $result['candidates'][0]['content']['parts'][0]['text']
                ?? null;

            if (!$translated) {
                Log::error(
                    'Gemini PDF Translation Empty Response',
                    [
                        'section' => $section,
                        'response' => $result,
                    ]
                );

                return null;
            }

            $translated = trim($translated);

            // Bersihkan markdown code fence jika ada.
            $translated = preg_replace(
                '/^```json\s*/i',
                '',
                $translated
            );

            $translated = preg_replace(
                '/^```\s*/',
                '',
                $translated
            );

            $translated = preg_replace(
                '/\s*```$/',
                '',
                $translated
            );

            $translated = trim($translated);

            /*
             * Gemini kadang memberikan JSON valid lalu menambahkan
             * karakter tambahan. Ambil hanya object JSON pertama
             * yang benar-benar seimbang.
             */
            $jsonObject = $this->extractJsonObject($translated);

            if ($jsonObject === null) {
                Log::error(
                    'Gemini PDF Translation JSON Object Not Found',
                    [
                        'section' => $section,
                        'answer' => $translated,
                    ]
                );

                return null;
            }

            $decoded = json_decode(
                $jsonObject,
                true
            );

            if (!is_array($decoded)) {
                Log::error(
                    'Gemini PDF Translation Invalid JSON',
                    [
                        'section' => $section,
                        'json_error' => json_last_error_msg(),
                        'answer' => $jsonObject,
                    ]
                );

                return null;
            }

            return $decoded;
        } catch (\Throwable $e) {
            Log::error(
                'PDF Translation Error',
                [
                    'section' => $section,
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            );

            return null;
        }
    }

    /**
     * Terjemahkan seluruh isi laporan menggunakan
     * tiga request Gemini terpisah.
     */
    private function translateAll(
        array $settingNarrasi,
        ?string $settingPenutup,
        array $laporan,
        string $language
    ): array {
        if ($language === 'id') {
            return [
                'narasi' => $settingNarrasi,
                'penutup' => $settingPenutup ?? '',
                'laporan' => $laporan,
            ];
        }

        $targetLanguage = $language === 'en'
            ? 'English'
            : 'Arabic';

        /*
         * ==========================================================
         * REQUEST 1
         * Narasi + Penutup
         * ==========================================================
         */

        $narasiPayload = [
            'narasi' => $settingNarrasi,
            'penutup' => $settingPenutup ?? '',
        ];

        $translatedNarasi = $this->translatePayload(
            $narasiPayload,
            $targetLanguage,
            'narasi_penutup'
        );

        if (
            is_array($translatedNarasi) &&
            isset($translatedNarasi['narasi'])
        ) {
            foreach ($settingNarrasi as $key => $value) {
                if (
                    is_string($value) &&
                    isset($translatedNarasi['narasi'][$key]) &&
                    is_string($translatedNarasi['narasi'][$key])
                ) {
                    $settingNarrasi[$key] =
                        trim($translatedNarasi['narasi'][$key]);
                }
            }
        }

        if (
            is_array($translatedNarasi) &&
            isset($translatedNarasi['penutup']) &&
            is_string($translatedNarasi['penutup'])
        ) {
            $settingPenutup =
                trim($translatedNarasi['penutup']);
        }

        /*
         * ==========================================================
         * REQUEST 2
         * Bab 1 - Bab 4
         * ==========================================================
         */

        $bab1Sampai4 = [];

        foreach (
            ['bab1', 'bab2', 'bab3', 'bab4'] as $bab
        ) {
            $bab1Sampai4[$bab] = [
                'intro' =>
                $laporan[$bab]['intro'] ?? '',

                'analysis' =>
                $laporan[$bab]['analysis'] ?? '',

                'conclusion' =>
                $laporan[$bab]['conclusion'] ?? '',
            ];
        }

        $translatedBab1Sampai4 = $this->translatePayload(
            $bab1Sampai4,
            $targetLanguage,
            'bab1_bab4'
        );

        if (is_array($translatedBab1Sampai4)) {
            foreach (
                ['bab1', 'bab2', 'bab3', 'bab4'] as $bab
            ) {
                foreach (
                    ['intro', 'analysis', 'conclusion'] as $field
                ) {
                    if (
                        isset(
                            $translatedBab1Sampai4[$bab][$field]
                        ) &&
                        is_string(
                            $translatedBab1Sampai4[$bab][$field]
                        )
                    ) {
                        $laporan[$bab][$field] =
                            trim(
                                $translatedBab1Sampai4[$bab][$field]
                            );
                    }
                }
            }
        }

        /*
         * ==========================================================
         * REQUEST 3
         * Bab 5 - Bab 8
         * ==========================================================
         */

        $bab5Sampai8 = [];

        foreach (
            ['bab5', 'bab6', 'bab7', 'bab8'] as $bab
        ) {
            $bab5Sampai8[$bab] = [
                'intro' =>
                $laporan[$bab]['intro'] ?? '',

                'analysis' =>
                $laporan[$bab]['analysis'] ?? '',

                'conclusion' =>
                $laporan[$bab]['conclusion'] ?? '',
            ];
        }

        $translatedBab5Sampai8 = $this->translatePayload(
            $bab5Sampai8,
            $targetLanguage,
            'bab5_bab8'
        );

        if (is_array($translatedBab5Sampai8)) {
            foreach (
                ['bab5', 'bab6', 'bab7', 'bab8'] as $bab
            ) {
                foreach (
                    ['intro', 'analysis', 'conclusion'] as $field
                ) {
                    if (
                        isset(
                            $translatedBab5Sampai8[$bab][$field]
                        ) &&
                        is_string(
                            $translatedBab5Sampai8[$bab][$field]
                        )
                    ) {
                        $laporan[$bab][$field] =
                            trim(
                                $translatedBab5Sampai8[$bab][$field]
                            );
                    }
                }
            }
        }

        return [
            'narasi' => $settingNarrasi,
            'penutup' => $settingPenutup ?? '',
            'laporan' => $laporan,
        ];
    }

    private function generatePdf(string $language = 'id')
    {
        set_time_limit(180);

        $language = $this->normalizeLanguage($language);

        $setting = PengaturanLaporan::first();

        if (!$setting) {
            $setting = new PengaturanLaporan();

            $setting->judul =
                "Laporan Ringkas TPQ Khairunissa";

            $setting->sub_judul =
                "Sistem Informasi Manajemen TPQ Khairunissa";

            $setting->narasi = [];
            $setting->penutup = "";
            $setting->status = "Aktif";
        }

        if (is_string($setting->narasi)) {
            $decodedNarasi = json_decode(
                $setting->narasi,
                true
            );

            $setting->narasi = is_array($decodedNarasi)
                ? $decodedNarasi
                : [];
        }

        $narasiAsli = is_array($setting->narasi)
            ? $setting->narasi
            : [];

        $masterData = $this->dataLaporan();

        $report = new ReportEngine($masterData);

        $laporan = $report->generate();

        $translated = $this->translateAll(
            $narasiAsli,
            $setting->penutup ?? '',
            $laporan,
            $language
        );

        $displaySetting = clone $setting;

        $displaySetting->narasi =
            $translated['narasi'];

        $displaySetting->penutup =
            $translated['penutup'];

        $displayLaporan =
            $translated['laporan'];

        $pdf = Pdf::loadView(
            'pdf.laporan-ringkas',
            array_merge(
                [
                    'setting' => $displaySetting,
                    'masterData' => $masterData,

                    'language' => $language,

                    'bab1' => $displayLaporan['bab1'],
                    'bab2' => $displayLaporan['bab2'],
                    'bab3' => $displayLaporan['bab3'],
                    'bab4' => $displayLaporan['bab4'],
                    'bab5' => $displayLaporan['bab5'],
                    'bab6' => $displayLaporan['bab6'],
                    'bab7' => $displayLaporan['bab7'],
                    'bab8' => $displayLaporan['bab8'],

                    'progresIqra' =>
                    ProgresIqra::all(),

                    'progresQuran' =>
                    ProgresQuran::all(),

                    'progresHafalan' =>
                    ProgresHafalan::all(),
                ],
                $this->statistik()
            )
        );

        $pdf->setPaper(
            'A4',
            'portrait'
        );

        $dompdf = $pdf->getDomPDF();

        $dompdf->render();

        $canvas = $dompdf->get_canvas();

        $canvas->page_script(
            function (
                $pageNumber,
                $pageCount,
                $canvas,
                $fontMetrics
            ) use ($language) {
                if ($pageNumber == 1) {
                    return;
                }

                $font = $fontMetrics->getFont(
                    'Helvetica',
                    'italic'
                );

                $footerText = $language === 'en'
                    ? 'TPQ Khairunissa Summary Report - Update : '
                    : (
                        $language === 'ar'
                        ? 'Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…ÙˆØ¬Ø² Ù„Ù€ TPQ Khairunissa - Ø§Ù„ØªØ­Ø¯ÙŠØ« : '
                        : 'Laporan Ringkas TPQ Khairunissa - Update : '
                    );

                $pageText = $language === 'en'
                    ? "Page {$pageNumber} - {$pageCount}"
                    : (
                        $language === 'ar'
                        ? "ØµÙÙØ­Ø© {$pageNumber} - {$pageCount}"
                        : "Hal {$pageNumber} - {$pageCount}"
                    );

                $canvas->text(
                    35,
                    808,
                    $footerText . date('d-m-Y'),
                    $font,
                    10
                );

                $canvas->text(
                    465,
                    808,
                    $pageText,
                    $font,
                    10
                );
            }
        );

        return $pdf;
    }

    public function ringkas(Request $request)
    {
        $language = $this->normalizeLanguage(
            $request->query('language', 'id')
        );

        return $this->generatePdf($language)
            ->download(
                'Laporan-Ringkas-TPQ.pdf'
            );
    }

    public function preview(Request $request)
    {
        $language = $this->normalizeLanguage(
            $request->query('language', 'id')
        );

        return $this->generatePdf($language)
            ->stream(
                'Laporan-Ringkas-TPQ.pdf'
            );
    }
}
