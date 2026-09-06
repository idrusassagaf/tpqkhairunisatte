<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PengaturanLaporan;

class LaporanSettingController extends Controller
{
    /**
     * Struktur default narasi laporan.
     */
    private function defaultNarasi(): array
    {
        return [
            'cover' => '',

            'pendahuluan' =>
            'Laporan Ringkas TPQ Khairunissa berisi seluruh informasi kegiatan pembelajaran TPQ yang disusun secara otomatis berdasarkan data terbaru pada sistem.',

            'ringkasan' => '',

            'bab1' => '',
            'bab2' => '',
            'bab3' => '',
            'bab4' => '',
            'bab5' => '',
            'bab6' => '',
            'bab7' => '',
            'bab8' => '',

            'penutup' => '',
        ];
    }


    /**
     * GET /api/laporan-setting
     */
    public function index()
    {
        $setting = PengaturanLaporan::first();

        /**
         * Jika belum ada pengaturan,
         * buat data baru dengan struktur narasi yang benar.
         */
        if (!$setting) {

            $setting = PengaturanLaporan::create([
                'judul' =>
                'Laporan Ringkas TPQ Khairunissa',

                'sub_judul' =>
                'Sistem Informasi Manajemen TPQ Khairunissa',

                'narasi' =>
                $this->defaultNarasi(),

                'status' => 'Aktif',
            ]);
        }


        /**
         * Ambil narasi dari model.
         *
         * Model PengaturanLaporan sudah menggunakan:
         *
         * protected $casts = [
         *     'narasi' => 'array',
         * ];
         */
        $narasi = $setting->narasi;


        /**
         * =====================================================
         * PERBAIKAN DATA LAMA YANG RUSAK
         * =====================================================
         *
         * Data lama pernah tersimpan sebagai array karakter:
         *
         * 0 => "{"
         * 1 => "\""
         * 2 => "c"
         * 3 => "o"
         * ...
         *
         * Jika kondisi tersebut ditemukan,
         * gabungkan kembali menjadi string JSON.
         */
        if (is_array($narasi)) {

            $numericKeys = array_keys($narasi);

            $isBrokenCharacterArray =
                !empty($numericKeys) &&
                $numericKeys === range(0, count($numericKeys) - 1);

            if ($isBrokenCharacterArray) {

                $json = implode('', array_map(
                    fn($value) => $value === null ? '' : (string) $value,
                    $narasi
                ));

                $decoded = json_decode($json, true);

                if (is_array($decoded)) {
                    $narasi = $decoded;
                }
            }
        }


        /**
         * Jika narasi ternyata masih string,
         * coba decode menjadi array.
         */
        if (is_string($narasi)) {

            $decoded = json_decode($narasi, true);

            $narasi = is_array($decoded)
                ? $decoded
                : [];
        }


        /**
         * Jika bukan array sama sekali,
         * gunakan struktur default.
         */
        if (!is_array($narasi)) {
            $narasi = [];
        }


        /**
         * Gabungkan dengan default.
         *
         * Ini penting supaya key seperti:
         *
         * bab1
         * bab2
         * bab3
         * ...
         *
         * selalu tersedia.
         *
         * Data yang sudah ditulis admin tidak akan hilang
         * karena array $narasi diletakkan setelah default.
         */
        $narasi = array_merge(
            $this->defaultNarasi(),
            $narasi
        );


        /**
         * Masukkan kembali narasi yang sudah dinormalisasi
         * ke object setting.
         *
         * Tidak perlu json_encode().
         * Model akan melakukan casting otomatis.
         */
        $setting->narasi = $narasi;


        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }


    /**
     * PUT /api/laporan-setting
     */
    public function update(Request $request)
    {
        $request->validate([
            'judul' =>
            'required|string|max:255',

            'sub_judul' =>
            'required|string|max:255',

            'narasi' =>
            'nullable|array',

            'status' =>
            'required|in:Draft,Aktif',
        ]);


        $setting = PengaturanLaporan::first();


        /**
         * Jika belum ada record,
         * buat object baru.
         */
        if (!$setting) {
            $setting = new PengaturanLaporan();
        }


        $setting->judul =
            $request->judul;

        $setting->sub_judul =
            $request->sub_judul;


        /**
         * Pastikan narasi selalu array.
         */
        $narasi = $request->input(
            'narasi',
            []
        );

        if (!is_array($narasi)) {
            $narasi = [];
        }


        /**
         * Lengkapi struktur narasi.
         */
        $narasi = array_merge(
            $this->defaultNarasi(),
            $narasi
        );


        /**
         * JANGAN json_encode().
         *
         * Karena model sudah memiliki:
         *
         * protected $casts = [
         *     'narasi' => 'array',
         * ];
         *
         * Laravel akan menyimpan array tersebut
         * sebagai JSON secara otomatis.
         */
        $setting->narasi =
            $narasi;


        $setting->status =
            $request->status;


        $setting->save();


        return response()->json([
            'success' => true,

            'message' =>
            'Pengaturan laporan berhasil disimpan.',

            'data' => $setting,
        ]);
    }
}
