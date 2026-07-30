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
}
