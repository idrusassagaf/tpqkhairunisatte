<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\JadwalPengajian;
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

        // Absen hanya dibuka pukul 17.30 - 20.00 WIT
        $waktuWit = now('Asia/Jayapura');

        if (
            $waktuWit->format('H:i:s') < '17:30:00'
            || $waktuWit->format('H:i:s') > '20:00:00'
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Absensi hanya dibuka pukul 17.30 - 20.00 WIT.',
            ], 422);
        }

        $tanggal = $validated['tanggal']
            ?? $waktuWit->toDateString();

        // Absen hanya dibuka pada hari yang ditandai "mengaji" di kalender
        $statusJadwal = JadwalPengajian::where('tanggal', $tanggal)
            ->value('status');

        if ($statusJadwal !== 'mengaji') {
            return response()->json([
                'success' => false,
                'message' => 'Hari ini bukan jadwal mengaji di kalender.',
            ], 422);
        }

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

        // Satu orang hanya bisa absen satu kali per hari
        $sudahAbsen = Absensi::where('tipe', $validated['tipe'])
            ->where('person_id', $personId)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if ($sudahAbsen) {
            return response()->json([
                'success' => false,
                'message' => "{$nama} sudah absen hari ini pukul {$sudahAbsen->jam}.",
            ], 409);
        }

        $absensi = Absensi::create([
            'tipe' => $validated['tipe'],
            'person_id' => $personId,
            'tanggal' => $tanggal,
            'status' => 'H',
            'jam' => $waktuWit->format('H:i:s'),
        ]);

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
