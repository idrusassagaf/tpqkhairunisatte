<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengumuman;
use App\Services\Translator\GeminiTranslator;

class PengumumanController extends Controller
{
    /**
     * Terjemahkan judul + isi ke EN/AR dan simpan ke kolom
     * `translations`, supaya halaman publik tidak perlu
     * memanggil AI setiap kali pengumuman dibuka.
     */
    private function syncTranslations(Pengumuman $pengumuman): void
    {
        $fields = [
            'judul' => (string) $pengumuman->judul,
            'isi' => (string) $pengumuman->isi,
        ];

        $translator = new GeminiTranslator();

        $hasil = $translator->translateToAll($fields, ['en', 'ar']);

        $existing = is_array($pengumuman->translations)
            ? $pengumuman->translations
            : [];

        foreach ($hasil as $language => $translated) {
            if ($translated !== null) {
                $existing[$language] = $translated;
            }
        }

        $pengumuman->translations = $existing;

        $pengumuman->save();
    }

    public function index()
    {
        return Pengumuman::latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required',
            'isi' => 'required',
            'status' => 'required',
        ]);

        $pengumuman = Pengumuman::create($request->only([
            'judul',
            'isi',
            'tanggal_berakhir',
            'status',
        ]));

        $this->syncTranslations($pengumuman);

        return $pengumuman;
    }

    public function show($id)
    {
        return Pengumuman::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $data = Pengumuman::findOrFail($id);

        $perluTerjemahUlang =
            $request->judul !== $data->judul ||
            $request->isi !== $data->isi;

        $data->update($request->only([
            'judul',
            'isi',
            'tanggal_berakhir',
            'status',
        ]));

        if ($perluTerjemahUlang) {
            $this->syncTranslations($data);
        }

        return $data;
    }

    public function destroy($id)
    {
        return Pengumuman::destroy($id);
    }
}
