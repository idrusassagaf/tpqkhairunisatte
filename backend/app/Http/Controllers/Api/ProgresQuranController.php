<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgresQuran;
use Illuminate\Http\Request;

class ProgresQuranController extends Controller
{
    public function index()
    {
        $data = ProgresQuran::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        ProgresQuran::updateOrCreate(
            [
                'nis' => $request->nis
            ],
            [
                'nama_santri' => $request->nama_santri,
                'nama_guru'   => $request->nama_guru,
                'nig'         => $request->nig,
                'kelas'       => $request->kelas,
                'juz'         => $request->juz,
                'surah'       => $request->surah,
                'ayat'        => $request->ayat,
                'halaman'     => $request->halaman,
                'progres'     => $request->progres,
                'prestasi'    => $request->prestasi,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Progres Al-Qur\'an berhasil disimpan'
        ]);
    }
}
