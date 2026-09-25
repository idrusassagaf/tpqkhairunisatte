<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Santri;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AbsensiController extends Controller
{
    /**
     * Rekap absensi berdasarkan tipe dan bulan.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'tipe' => [
                'required',
                'string',
                'in:santri,guru',
            ],
            'bulan' => [
                'required',
                'date_format:Y-m',
            ],
        ]);

        $tanggalAwal = Carbon::createFromFormat(
            'Y-m',
            $validated['bulan']
        )->startOfMonth();

        $tanggalAkhir = $tanggalAwal->copy()->endOfMonth();

        $absensi = Absensi::where('tipe', $validated['tipe'])
            ->whereBetween('tanggal', [
                $tanggalAwal->toDateString(),
                $tanggalAkhir->toDateString(),
            ])
            ->orderBy('tanggal')
            ->orderBy('person_id')
            ->get();

        if ($validated['tipe'] === 'santri') {
            $orang = Santri::select(
                'id',
                'nama',
                'nis'
            )
                ->orderBy('nama')
                ->get();
        } else {
            $orang = Guru::select(
                'id',
                'nama_guru',
                'nig'
            )
                ->orderBy('nama_guru')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $orang,
            'absensi' => $absensi,
            'bulan' => $validated['bulan'],
        ]);
    }

    /**
     * Simpan atau perbarui absensi harian.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipe' => [
                'required',
                'string',
                'in:santri,guru',
            ],
            'person_id' => [
                'required',
                'integer',
            ],
            'tanggal' => [
                'required',
                'date',
            ],
            'status' => [
                'required',
                'string',
                'in:H,I,S,A',
            ],
            'jam' => [
                'nullable',
                'date_format:H:i:s',
            ],
        ]);

        if ($validated['tipe'] === 'santri') {
            Santri::findOrFail($validated['person_id']);
        } else {
            Guru::findOrFail($validated['person_id']);
        }

        $absensi = Absensi::updateOrCreate(
            [
                'tipe' => $validated['tipe'],
                'person_id' => $validated['person_id'],
                'tanggal' => $validated['tanggal'],
            ],
            [
                'status' => $validated['status'],
                'jam' => $validated['jam'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil disimpan.',
            'data' => $absensi,
        ]);
    }

    /**
     * Absensi melalui QR.
     *
     * QR santri berisi NIS.
     * QR guru berisi NIG.
     */
    public function scan(Request $request)
    {
        $validated = $request->validate([
            'tipe' => [
                'required',
                'string',
                'in:santri,guru',
            ],
            'kode' => [
                'required',
                'string',
                'max:100',
            ],
            'tanggal' => [
                'nullable',
                'date',
            ],
        ]);

        $tanggal = $validated['tanggal']
            ?? now()->toDateString();

        if ($validated['tipe'] === 'santri') {
            $orang = Santri::where(
                'nis',
                $validated['kode']
            )->first();

            if (!$orang) {
                return response()->json([
                    'success' => false,
                    'message' => 'NIS santri tidak ditemukan.',
                ], 404);
            }

            $personId = $orang->id;
            $nama = $orang->nama;
            $nomor = $orang->nis;
        } else {
            $orang = Guru::where(
                'nig',
                $validated['kode']
            )->first();

            if (!$orang) {
                return response()->json([
                    'success' => false,
                    'message' => 'NIG guru tidak ditemukan.',
                ], 404);
            }

            $personId = $orang->id;
            $nama = $orang->nama_guru;
            $nomor = $orang->nig;
        }

        $absensi = Absensi::updateOrCreate(
            [
                'tipe' => $validated['tipe'],
                'person_id' => $personId,
                'tanggal' => $tanggal,
            ],
            [
                'status' => 'H',
                'jam' => now()->format('H:i:s'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil dicatat.',
            'data' => [
                'id' => $absensi->id,
                'tipe' => $validated['tipe'],
                'nama' => $nama,
                'kode' => $nomor,
                'tanggal' => $tanggal,
                'status' => $absensi->status,
                'jam' => $absensi->jam,
            ],
        ]);
    }
}
