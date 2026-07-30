<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PengaturanLaporan;

class LaporanSettingController extends Controller
{
    public function index()
    {
        $setting = PengaturanLaporan::first();

        if (!$setting) {
            $setting = PengaturanLaporan::create([
                'judul' => 'Laporan Ringkas TPQ Khairunissa',
                'sub_judul' => 'Sistem Informasi Manajemen TPQ Khairunissa',
                'narasi' => json_encode([
                    'cover' => '',
                    'pendahuluan' => 'Laporan Ringkas TPQ Khairunissa berisi seluruh informasi kegiatan pembelajaran TPQ yang disusun secara otomatis berdasarkan data terbaru pada sistem.',
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
                ]),

            ]);
        }

        $defaultNarasi = [
            'cover' => '',
            'pendahuluan' => 'Laporan Ringkas TPQ Khairunissa berisi seluruh informasi kegiatan pembelajaran TPQ yang disusun secara otomatis berdasarkan data terbaru pada sistem.',
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

        if (empty($setting->narasi)) {
            $setting->narasi = $defaultNarasi;
        }

        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'sub_judul' => 'required|string|max:255',
            'narasi' => 'nullable|array',
            'status' => 'required|in:Draft,Aktif',
        ]);

        $setting = PengaturanLaporan::first();

        if (!$setting) {
            $setting = new PengaturanLaporan();
        }

        $setting->judul = $request->judul;
        $setting->sub_judul = $request->sub_judul;
        $setting->narasi = $request->narasi;
        $setting->status = $request->status;

        $setting->save();

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan laporan berhasil disimpan.',
            'data' => $setting,
        ]);
    }
}
