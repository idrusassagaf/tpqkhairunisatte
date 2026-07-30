<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Santri;
use Illuminate\Http\Request;

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

    // SIMPAN DATA
    public function store(Request $request)
    {
        $santri = Santri::create($request->all());

        return response()->json([
            'message' => 'berhasil disimpan',
            'data' => $santri
        ]);
    }
}
