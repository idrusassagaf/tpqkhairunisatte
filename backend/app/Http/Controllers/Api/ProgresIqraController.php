<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgresIqra;
use Illuminate\Http\Request;

class ProgresIqraController extends Controller
{
    public function index()
    {
        $data = ProgresIqra::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        ProgresIqra::updateOrCreate(
            [
                'nis' => $request->nis
            ],
            [
                'nama_santri' => $request->nama_santri,
                'nama_guru'   => $request->nama_guru,
                'nig'         => $request->nig,
                'kelas'       => $request->kelas,
                'jilid'       => $request->jilid,
                'halaman'     => $request->halaman,
                'progres'     => $request->progres,
                'prestasi'    => $request->prestasi,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Progres Iqra berhasil disimpan'
        ]);
    }
}
