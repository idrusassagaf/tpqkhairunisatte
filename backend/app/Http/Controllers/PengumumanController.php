<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengumuman;

class PengumumanController extends Controller
{
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

        return Pengumuman::create($request->all());
    }

    public function show($id)
    {
        return Pengumuman::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $data = Pengumuman::findOrFail($id);
        $data->update($request->all());

        return $data;
    }

    public function destroy($id)
    {
        return Pengumuman::destroy($id);
    }
}
