<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use Illuminate\Http\Request;

class BeritaController extends Controller
{
    // TAMPILKAN SEMUA BERITA
    public function index()
    {
        $data = Berita::latest()->get();

        return response()->json([
            'message' => 'success',
            'data' => $data
        ]);
    }

    // SIMPAN BERITA BARU
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required',
            'isi' => 'required',
            'penulis' => 'required',
        ]);

        $fotoPath = null;

        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')
                ->store('berita', 'public');
        }

        $berita = Berita::create([
            'judul' => $request->judul,
            'isi' => $request->isi,
            'penulis' => $request->penulis,
            'status' => $request->status ?? 'Draft',
            'foto' => $fotoPath,
        ]);

        return response()->json([
            'message' => 'Berita berhasil disimpan',
            'data' => $berita
        ]);
    }

    // UPDATE BERITA
    public function update(Request $request, $id)
    {
        $berita = Berita::findOrFail($id);

        $fotoPath = $berita->foto;

        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')
                ->store('berita', 'public');
        }

        $berita->update([
            'judul' => $request->judul,
            'isi' => $request->isi,
            'penulis' => $request->penulis,
            'status' => $request->status,
            'foto' => $fotoPath,
        ]);

        return response()->json([
            'message' => 'Berita berhasil diupdate',
            'data' => $berita
        ]);
    }

    // HAPUS BERITA
    public function destroy($id)
    {
        $berita = Berita::findOrFail($id);

        $berita->delete();

        return response()->json([
            'message' => 'Berita berhasil dihapus'
        ]);
    }
}
