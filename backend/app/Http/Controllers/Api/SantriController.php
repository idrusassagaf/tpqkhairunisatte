<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Santri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SantriController extends Controller
{
    // GET DATA
    public function index()
    {
        return response()->json([
            'message' => 'success',
            'data' => Santri::all()
        ]);
    }

    // STATISTIK PUBLIK
    // Hanya jumlah, tanpa data pribadi santri.
    public function stats()
    {
        return response()->json([
            'message' => 'success',
            'data' => [
                'total' => Santri::count(),
                'total_iqra' => Santri::where('kelas', 'Iqra')->count(),
                'total_quran' => Santri::where('kelas', 'Al Quran')->count(),
            ],
        ]);
    }

    // SIMPAN DATA
    public function store(Request $request)
    {
        $santri = DB::transaction(function () use ($request) {
            // NIS selalu otomatis; nilai 'nis' dari client diabaikan.
            return Santri::create(array_merge(
                $request->except('nis'),
                ['nis' => Santri::nisBerikutnya()]
            ));
        });

        return response()->json([
            'message' => 'berhasil disimpan',
            'data' => $santri
        ]);
    }
}
