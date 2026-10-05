<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\MasterHafalan;
use App\Models\ProgresHafalan;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class ProgresHafalanController extends Controller
{
    public function index()
    {
        $data = ProgresHafalan::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function masterHafalan()
    {
        return response()->json([
            'success' => true,
            'data' => MasterHafalan::withCount('progres')->orderBy('urutan')->get(['id', 'nama', 'urutan'])
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_santri'        => 'required|string|max:255',
            'nis'                => 'required|string|max:255',
            'guru_id'            => 'required|integer|exists:gurus,id',
            'master_hafalan_id'  => 'required|integer|exists:master_hafalans,id',
            'progres'            => 'nullable|string|max:255',
            'prestasi'           => 'nullable|string|max:255',
        ]);

        // Rapikan spasi (awal, akhir, dan ganda di tengah).
        $rapikan = fn (string $teks) => preg_replace('/\s+/u', ' ', trim($teks));

        $master = MasterHafalan::findOrFail($data['master_hafalan_id']);

        // Guru dipilih lewat ID. Nama dan NIG diambil dari data guru, bukan dari input.
        $guru = Guru::findOrFail($data['guru_id']);

        // Kunci unik sekarang berbasis ID master, jadi jenis hafalan tidak bisa
        // tercatat ganda walaupun penulisannya berbeda.
        $kunci = [
            'nis'                => $rapikan($data['nis']),
            'master_hafalan_id'  => $master->id,
        ];
        $nilai = [
            'nama_santri'   => $rapikan($data['nama_santri']),
            'guru_id'       => $guru->id,
            'nama_guru'     => $guru->nama_guru,
            'nig'           => $guru->nig,
            'jenis_hafalan' => $master->nama,
            'progres'       => $data['progres'] ?? null,
            'prestasi'      => $data['prestasi'] ?? null,
        ];

        try {
            ProgresHafalan::updateOrCreate($kunci, $nilai);
        } catch (QueryException $e) {
            // Dua request bersamaan untuk santri & jenis yang sama: unique index
            // menolak salah satunya. Ulangi sekali, sekarang data sudah ada, sehingga jadi update.
            if (! in_array($e->getCode(), ['23000', 1062], true)) {
                throw $e;
            }

            ProgresHafalan::updateOrCreate($kunci, $nilai);
        }

        return response()->json([
            'success' => true,
            'message' => 'Progres Hafalan berhasil disimpan'
        ]);
    }
}
