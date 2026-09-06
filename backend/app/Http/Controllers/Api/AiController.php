<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PengaturanSistem;
use App\Models\Santri;
use App\Models\Guru;
use App\Models\OrangTua;
use App\Models\ProgresIqra;
use App\Models\ProgresQuran;
use App\Models\ProgresHafalan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    /**
     * Chat AI website public TPQ Khairunnissa.
     *
     * AI menggunakan data resmi dari database TPQ sebagai context.
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);

        try {

            /*
            |--------------------------------------------------------------------------
            | GEMINI API KEY
            |--------------------------------------------------------------------------
            */

            $apiKey = env('GEMINI_API_KEY');

            if (empty($apiKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'GEMINI_API_KEY belum dikonfigurasi di server.',
                ], 500);
            }


            /*
            |--------------------------------------------------------------------------
            | PENGATURAN SISTEM
            |--------------------------------------------------------------------------
            */

            $setting = PengaturanSistem::first();

            $namaTPQ = $setting?->nama_tpq ?? 'TPQ Khairunnissa';
            $alamat = $setting?->alamat ?? '';
            $profil = $setting?->profil ?? '';
            $visi = $setting?->visi ?? '';
            $misi = $setting?->misi ?? '';

            $nilaiAkhlak = $setting?->nilai_akhlak ?? '';
            $nilaiQuran = $setting?->nilai_quran ?? '';
            $nilaiDisiplin = $setting?->nilai_disiplin ?? '';
            $nilaiPrestasi = $setting?->nilai_prestasi ?? '';


            /*
            |--------------------------------------------------------------------------
            | DATA SANTRI
            |--------------------------------------------------------------------------
            */

            $santri = Santri::select([
                'id',
                'nama',
                'nis',
                'jenis_kelamin',
                'usia',
                'status_orangtua',
                'status_anak',
                'kelas',
                'orang_tua_id',
                'guru_id',
            ])->get();


            /*
            |--------------------------------------------------------------------------
            | DATA GURU
            |--------------------------------------------------------------------------
            */

            $guru = Guru::select([
                'id',
                'nama_guru',
                'nig',
                'jenis_kelamin',
                'usia',
                'pendidikan',
                'pekerjaan',
            ])->get();


            /*
            |--------------------------------------------------------------------------
            | DATA ORANG TUA
            |--------------------------------------------------------------------------
            |
            | Nomor HP dan alamat TIDAK dikirim ke Gemini.
            |
            */

            $orangTua = OrangTua::select([
                'id',
                'nama_ayah',
                'pekerjaan_ayah',
                'nama_ibu',
                'pekerjaan_ibu',
            ])->get();


            /*
            |--------------------------------------------------------------------------
            | PROGRES IQRA
            |--------------------------------------------------------------------------
            */

            $progresIqra = ProgresIqra::select([
                'id',
                'nama_santri',
                'nis',
                'nama_guru',
                'nig',
                'kelas',
                'jilid',
                'halaman',
                'progres',
                'prestasi',
                'created_at',
            ])->get();


            /*
            |--------------------------------------------------------------------------
            | PROGRES AL-QUR'AN
            |--------------------------------------------------------------------------
            */

            $progresQuran = ProgresQuran::select([
                'id',
                'nama_santri',
                'nis',
                'nama_guru',
                'nig',
                'kelas',
                'juz',
                'surah',
                'ayat',
                'halaman',
                'progres',
                'prestasi',
                'created_at',
            ])->get();


            /*
            |--------------------------------------------------------------------------
            | PROGRES HAFALAN
            |--------------------------------------------------------------------------
            */

            $progresHafalan = ProgresHafalan::select([
                'id',
                'nama_santri',
                'nis',
                'nama_guru',
                'nig',
                'jenis_hafalan',
                'progres',
                'prestasi',
                'created_at',
            ])->get();


            /*
            |--------------------------------------------------------------------------
            | UBAH DATA DATABASE MENJADI JSON
            |--------------------------------------------------------------------------
            */

            $dataSantri = json_encode(
                $santri,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            );

            $dataGuru = json_encode(
                $guru,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            );

            $dataOrangTua = json_encode(
                $orangTua,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            );

            $dataIqra = json_encode(
                $progresIqra,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            );

            $dataQuran = json_encode(
                $progresQuran,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            );

            $dataHafalan = json_encode(
                $progresHafalan,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
            );


            /*
            |--------------------------------------------------------------------------
            | CONTEXT GEMINI
            |--------------------------------------------------------------------------
            */

            $context = <<<TEXT
Anda adalah Asisten AI resmi untuk {$namaTPQ}.

Anda membantu pengunjung website {$namaTPQ}.

Gunakan DATABASE RESMI TPQ berikut sebagai sumber utama untuk
menjawab pertanyaan yang berkaitan dengan TPQ.

Jangan mengarang data.

============================================================
DATA PROFIL TPQ
============================================================

Nama TPQ:
{$namaTPQ}

Alamat:
{$alamat}

Profil:
{$profil}

Visi:
{$visi}

Misi:
{$misi}

Nilai Akhlak:
{$nilaiAkhlak}

Nilai Qurani:
{$nilaiQuran}

Nilai Disiplin:
{$nilaiDisiplin}

Nilai Prestasi:
{$nilaiPrestasi}


============================================================
DATA SANTRI
============================================================

{$dataSantri}


============================================================
DATA GURU
============================================================

{$dataGuru}


============================================================
DATA ORANG TUA
============================================================

{$dataOrangTua}


============================================================
DATA PROGRES IQRA
============================================================

{$dataIqra}


============================================================
DATA PROGRES AL-QUR'AN
============================================================

{$dataQuran}


============================================================
DATA PROGRES HAFALAN
============================================================

{$dataHafalan}


============================================================
ATURAN AI
============================================================

1. Anda adalah "Asisten AI {$namaTPQ}".

2. Gunakan database di atas sebagai sumber utama.

3. Jangan mengarang nama santri, guru, orang tua, kelas,
   progres, jumlah, alamat, jadwal, atau informasi lainnya.

4. Jika pengguna meminta JUMLAH DATA, hitung berdasarkan
   data yang tersedia di database.

5. Jika pengguna bertanya tentang santri tertentu, cari
   berdasarkan nama atau NIS.

6. Jika pengguna bertanya tentang guru tertentu, cari
   berdasarkan nama atau NIG.

7. Jika pengguna bertanya tentang progres Iqra, gunakan
   DATA PROGRES IQRA.

8. Jika pengguna bertanya tentang Al-Qur'an, gunakan
   DATA PROGRES AL-QUR'AN.

9. Jika pengguna bertanya tentang hafalan, gunakan
   DATA PROGRES HAFALAN.

10. Jika pengguna bertanya tentang orang tua, gunakan
    DATA ORANG TUA.

11. JANGAN memberikan nomor HP, alamat rumah, atau informasi
    pribadi sensitif orang tua kepada pengguna website public.

12. Jika pengguna meminta data pribadi yang tidak boleh
    diberikan, jelaskan bahwa informasi tersebut tidak dapat
    diberikan melalui asisten AI public.

13. Jika informasi yang ditanyakan tidak ada di database,
    katakan dengan jujur bahwa data tersebut belum tersedia.

14. Jangan mengaku sebagai manusia.

15. Gunakan Bahasa Indonesia yang sopan, ramah, jelas,
    dan mudah dipahami.

16. Untuk pertanyaan statistik, berikan angka yang tepat
    berdasarkan data yang tersedia.

17. Untuk pertanyaan umum yang tidak berkaitan dengan TPQ,
    Anda boleh menjawab berdasarkan pengetahuan umum.

18. Jangan memberikan informasi yang bertentangan dengan
    database resmi TPQ.

============================================================

PERTANYAAN PENGUNJUNG:
{$validated['message']}
TEXT;


            /*
            |--------------------------------------------------------------------------
            | GEMINI
            |--------------------------------------------------------------------------
            */

            $model = 'gemini-3.6-flash';

            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";


            $response = Http::timeout(60)
                ->post($url, [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $context,
                                ],
                            ],
                        ],
                    ],
                ]);


            /*
            |--------------------------------------------------------------------------
            | ERROR GEMINI
            |--------------------------------------------------------------------------
            */

            if (!$response->successful()) {

                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi.',
                ], 503);
            }


            /*
            |--------------------------------------------------------------------------
            | AMBIL JAWABAN
            |--------------------------------------------------------------------------
            */

            $result = $response->json();

            $answer =
                $result['candidates'][0]['content']['parts'][0]['text']
                ?? null;


            if (!$answer) {

                Log::error('Gemini API Empty Response', [
                    'response' => $result,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'AI tidak memberikan jawaban. Silakan coba lagi.',
                ], 503);
            }


            /*
            |--------------------------------------------------------------------------
            | RESPONSE KE REACT
            |--------------------------------------------------------------------------
            */

            return response()->json([
                'success' => true,
                'message' => trim($answer),
            ]);
        } catch (\Throwable $e) {

            Log::error('AI Chat Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Maaf, AI sedang mengalami gangguan. Silakan coba beberapa saat lagi.',
            ], 500);
        }
    }
}
