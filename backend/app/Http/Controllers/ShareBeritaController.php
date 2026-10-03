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

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/') .
            '/berita/' .
            $berita->id;

        /*
        |--------------------------------------------------------------------------
        | URL FOTO
        |--------------------------------------------------------------------------
        */

        $imageUrl = null;

        if ($berita->foto) {
            $imageUrl = asset('storage/' . $berita->foto);
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
