<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgresHafalan;
use Illuminate\Http\Request;

class ProgresHafalanController extends Controller
{
    public function index()
    {
        $data = ProgresHafalan::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        ProgresHafalan::updateOrCreate(
            [
                'nis' => $request->nis,
                'jenis_hafalan' => $request->jenis_hafalan,
            ],
            [
                'nama_santri' => $request->nama_santri,
                'nama_guru'   => $request->nama_guru,
                'nig'         => $request->nig,
                'progres'     => $request->progres,
                'prestasi'    => $request->prestasi,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Progres Hafalan berhasil disimpan'
        ]);
    }
}
