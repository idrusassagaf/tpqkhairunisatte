<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FotoController extends Controller
{
    /**
     * Folder foto yang boleh diambil lewat endpoint ini.
     */
    private const FOLDER_DIIZINKAN = ['santri', 'guru', 'profil'];

    /**
     * Kirim file foto dari disk public lewat rute API.
     *
     * File di /storage tidak membawa header CORS, sehingga browser
     * tidak bisa menggambarnya ke canvas (dipakai saat membuat PDF
     * kartu). Rute api/* sudah memakai CORS bawaan Laravel.
     */
    public function show(Request $request)
    {
        $validated = $request->validate([
            'path' => ['required', 'string', 'max:255'],
        ]);

        $path = ltrim($validated['path'], '/');

        // Tolak path traversal dan folder di luar daftar
        $folder = explode('/', $path)[0] ?? '';

        if (
            str_contains($path, '..')
            || !in_array($folder, self::FOLDER_DIIZINKAN, true)
            || !Storage::disk('public')->exists($path)
        ) {
            abort(404);
        }

        $mime = Storage::disk('public')->mimeType($path);

        if (!is_string($mime) || !str_starts_with($mime, 'image/')) {
            abort(404);
        }

        return response()->file(Storage::disk('public')->path($path), [
            'Content-Type' => $mime,
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
