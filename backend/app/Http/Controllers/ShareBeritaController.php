<?php

namespace App\Http\Controllers;

use App\Models\Berita;

class ShareBeritaController extends Controller
{
    public function show($id)
    {
        $berita = Berita::findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | URL FRONTEND
        |--------------------------------------------------------------------------
        */

        $frontendUrl =
            'http://localhost:5173/web/berita/' .
            $berita->id;

        /*
        |--------------------------------------------------------------------------
        | URL FOTO
        |--------------------------------------------------------------------------
        */

        $imageUrl = null;

        if ($berita->foto) {
            $imageUrl =
                'http://127.0.0.1:8000/storage/' .
                $berita->foto;
        }

        /*
        |--------------------------------------------------------------------------
        | DESKRIPSI
        |--------------------------------------------------------------------------
        */

        $description = trim(
            preg_replace('/\s+/', ' ', $berita->isi)
        );

        if (mb_strlen($description) > 200) {
            $description =
                mb_substr($description, 0, 200) . '...';
        }

        return view('share.berita', [
            'berita' => $berita,
            'frontendUrl' => $frontendUrl,
            'imageUrl' => $imageUrl,
            'description' => $description,
        ]);
    }
}
