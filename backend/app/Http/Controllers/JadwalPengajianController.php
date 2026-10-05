<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JadwalPengajian;

class JadwalPengajianController extends Controller
{
    public function index()
    {
        return response()->json(
            JadwalPengajian::all()->pluck('status', 'tanggal')
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'status' => 'required'
        ]);

        JadwalPengajian::updateOrCreate(
            ['tanggal' => $request->tanggal],
            ['status' => $request->status]
        );

        return response()->json([
            'message' => 'success'
        ]);
    }

    /**
     * Menghapus status Mengaji / Libur pada satu tanggal.
     */
    public function destroy(string $tanggal)
    {
        $validator = validator(['tanggal' => $tanggal], [
            'tanggal' => 'required|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Format tanggal tidak valid.'
            ], 422);
        }

        JadwalPengajian::where('tanggal', $tanggal)->delete();

        return response()->json([
            'message' => 'Status jadwal berhasil dihapus.'
        ]);
    }
}
