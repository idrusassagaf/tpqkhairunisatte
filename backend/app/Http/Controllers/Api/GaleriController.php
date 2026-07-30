<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Galeri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GaleriController extends Controller
{
    // TAMPILKAN SEMUA FOTO
    public function index()
    {
        return response()->json([
            'message' => 'success',
            'data' => Galeri::latest()->get()
        ]);
    }

    // SIMPAN FOTO
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required',
            'foto' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048'
        ]);

        $path = $request->file('foto')->store('galeri', 'public');

        $galeri = Galeri::create([
            'judul' => $request->judul,
            'foto' => $path
        ]);

        return response()->json([
            'message' => 'Foto berhasil ditambahkan',
            'data' => $galeri
        ]);
    }

    // HAPUS FOTO
    public function destroy($id)
    {
        $galeri = Galeri::findOrFail($id);

        if ($galeri->foto) {
            Storage::disk('public')->delete($galeri->foto);
        }

        $galeri->delete();

        return response()->json([
            'message' => 'Foto berhasil dihapus'
        ]);
    }
}
