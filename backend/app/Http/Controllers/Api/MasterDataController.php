<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use App\Models\Galeri;
use App\Models\Pengumuman;
use App\Models\Berita;
use App\Models\Santri;
use App\Models\OrangTua;
use App\Models\Guru;

class MasterDataController extends Controller
{
    // =============================
    // 🔹 GET MASTER DATA
    // =============================
    public function index()
    {
        return response()->json([
            'message' => 'success',
            'data' => [
                'santri' => Santri::with('orangTua')->get()->map(function ($s) {
                    $s->foto_url = $s->foto
                        ? asset('storage/' . $s->foto)
                        : null;

                    return $s;
                }),
                'guru' => Guru::all()->map(function ($g) {
                    $g->foto_url = $g->foto
                        ? asset('storage/' . $g->foto)
                        : null;

                    return $g;
                }),


                'orang_tua' => OrangTua::all(),
                'berita' => Berita::all(),
                'pengumuman' => Pengumuman::all(),
                'galeri' => Galeri::all(),
            ]
        ]);
    }

    // =============================
    // 🔥 STORE MASTER DATA
    // =============================
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {

            // ===============================
            // 🔹 MODE GURU
            // ===============================
            if ($request->filled('nama_guru')) {

                $request->validate([
                    'nama_guru' => 'required',
                    'tanggal_lahir' => 'required',
                    'jenis_kelamin' => 'required',
                    'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                ]);

                // 🔥 AUTO USIA
                $usia = $request->usia;
                if (!$usia && $request->tanggal_lahir) {
                    $lahir = new \DateTime($request->tanggal_lahir);
                    $today = new \DateTime();
                    $usia = $today->diff($lahir)->y;
                }

                // 🔥 AUTO NIG
                $nig = $request->nig ?: 'G-' . rand(1000, 9999);

                // ================= FOTO =================
                $fotoPath = null;

                if ($request->hasFile('foto')) {
                    $fotoPath = $request->file('foto')->store('guru', 'public');
                }

                $guru = Guru::create([
                    'nama_guru' => $request->nama_guru,
                    'nig' => $nig,
                    'jenis_kelamin' => $request->jenis_kelamin,
                    'tanggal_lahir' => $request->tanggal_lahir,
                    'usia' => $usia,
                    'pendidikan' => $request->pendidikan,
                    'pekerjaan' => $request->pekerjaan,
                    'kontak' => $request->kontak,
                    'foto' => $fotoPath, // 🔥 INI KUNCI
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Guru berhasil disimpan',
                    'data' => $guru
                ]);
            }

            // ===============================
            // 🔹 MODE SANTRI
            // ===============================
            $request->validate([
                'nama' => 'required',
                'tanggal_lahir' => 'required',
                'jenis_kelamin' => 'required',
                'orang_tua.nama_ayah' => 'required',
                'orang_tua.nama_ibu' => 'required',
            ]);

            // 🔥 AUTO USIA
            $usia = $request->usia;
            if (!$usia && $request->tanggal_lahir) {
                $lahir = new \DateTime($request->tanggal_lahir);
                $today = new \DateTime();
                $usia = $today->diff($lahir)->y;
            }

            // 🔥 AUTO NIS
            $nis = $request->nis ?: 'S-' . rand(1000, 9999);

            // 🔥 AUTO STATUS ANAK
            $statusAnak = $request->status_anak;
            if (!$statusAnak) {
                if ($request->status_orangtua === 'ayah_wafat') {
                    $statusAnak = 'Anak Yatim';
                } elseif ($request->status_orangtua === 'ibu_wafat') {
                    $statusAnak = 'Anak Piatu';
                } elseif ($request->status_orangtua === 'keduanya_wafat') {
                    $statusAnak = 'Yatim Piatu';
                } elseif ($request->status_orangtua === 'hidup') {
                    $statusAnak = 'Santunan OT';
                }
            }

            $orangTuaData = $request->input('orang_tua', []);

            $orangTua = OrangTua::firstOrCreate(
                [
                    'nama_ayah' => $orangTuaData['nama_ayah'] ?? null,
                    'nama_ibu' => $orangTuaData['nama_ibu'] ?? null,
                ],
                [
                    'pekerjaan_ayah' => $orangTuaData['pekerjaan_ayah'] ?? null,
                    'pekerjaan_ibu' => $orangTuaData['pekerjaan_ibu'] ?? null,
                    'no_hp' => $orangTuaData['no_hp'] ?? null,
                    'alamat' => $orangTuaData['alamat'] ?? null,
                ]
            );

            // ================= FOTO =================
            $fotoPath = null;

            if ($request->hasFile('foto')) {
                $fotoPath = $request->file('foto')->store('santri', 'public');
            }

            // ================= SIMPAN SANTRI =================
            $santri = Santri::create([
                'nama' => $request->nama,
                'nis' => $nis,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'usia' => $usia,
                'alamat' => $request->alamat,
                'kontak' => $request->kontak,
                'status_orangtua' => $request->status_orangtua,
                'status_anak' => $statusAnak,
                'kelas' => $request->kelas,
                'foto' => $fotoPath, // 🔥 INI KUNCI
                'orang_tua_id' => $orangTua->id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Santri berhasil disimpan',
                'data' => $santri
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Gagal simpan master data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // =============================
    // ✏️ UPDATE SANTRI (EDIT)
    // =============================
    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {

            $santri = Santri::findOrFail($id);

            $request->validate([
                'nama' => 'required',
                'tanggal_lahir' => 'required',
                'jenis_kelamin' => 'required',
                'orang_tua.nama_ayah' => 'required',
                'orang_tua.nama_ibu' => 'required',
                'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            ]);

            // 🔥 AUTO USIA
            $usia = $request->usia;
            if (!$usia && $request->tanggal_lahir) {
                $lahir = new \DateTime($request->tanggal_lahir);
                $today = new \DateTime();
                $usia = $today->diff($lahir)->y;
            }

            // 🔥 AUTO STATUS ANAK
            $statusAnak = $request->status_anak;
            if (!$statusAnak) {
                if ($request->status_orangtua === 'ayah_wafat') {
                    $statusAnak = 'Anak Yatim';
                } elseif ($request->status_orangtua === 'ibu_wafat') {
                    $statusAnak = 'Anak Piatu';
                } elseif ($request->status_orangtua === 'keduanya_wafat') {
                    $statusAnak = 'Yatim Piatu';
                } elseif ($request->status_orangtua === 'hidup') {
                    $statusAnak = 'Santunan OT';
                }
            }

            // 🔹 UPDATE ORANG TUA (AMAN)
            $orangTuaData = $request->input('orang_tua', []);
            $orangTua = OrangTua::find($santri->orang_tua_id);

            if ($orangTua) {
                $orangTua->update([
                    'nama_ayah' => $orangTuaData['nama_ayah'] ?? null,
                    'pekerjaan_ayah' => $orangTuaData['pekerjaan_ayah'] ?? null,
                    'nama_ibu' => $orangTuaData['nama_ibu'] ?? null,
                    'pekerjaan_ibu' => $orangTuaData['pekerjaan_ibu'] ?? null,
                    'no_hp' => $orangTuaData['no_hp'] ?? null,
                    'alamat' => $orangTuaData['alamat'] ?? null,
                ]);
            }

            // ================= FOTO UPDATE =================
            if ($request->hasFile('foto')) {

                // hapus foto lama (opsional tapi bagus)
                if ($santri->foto) {
                    Storage::disk('public')->delete($santri->foto);
                }

                $fotoPath = $request->file('foto')->store('santri', 'public');

                $santri->foto = $fotoPath;
            }

            // 🔹 UPDATE SANTRI
            $santri->update([
                'nama' => $request->nama,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'usia' => $usia,
                'alamat' => $request->alamat,
                'kontak' => $request->kontak,
                'status_orangtua' => $request->status_orangtua,
                'status_anak' => $statusAnak,
                'kelas' => $request->kelas, // ✅ TAMBAHAN
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Santri berhasil diupdate',
                'data' => $santri
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Gagal update data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeGuru(Request $request)
    {
        return response()->json([
            'message' => 'OK'
        ]);
    }
    public function destroy($id)
    {
        $santri = Santri::find($id);

        if (!$santri) {
            return response()->json([
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        $santri->delete();

        return response()->json([
            'message' => 'Berhasil dihapus'
        ]);
    }

    public function updateGuru(Request $request, $id)
    {
        $guru = Guru::findOrFail($id);

        $request->validate([
            'nama_guru' => 'required',
            'tanggal_lahir' => 'required',
            'jenis_kelamin' => 'required',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', //
        ]);

        // 🔥 AUTO USIA
        $usia = $request->usia;
        if (!$usia && $request->tanggal_lahir) {
            $lahir = new \DateTime($request->tanggal_lahir);
            $today = new \DateTime();
            $usia = $today->diff($lahir)->y;
        }

        // ================= FOTO UPDATE =================
        if ($request->hasFile('foto')) {

            // hapus foto lama
            if ($guru->foto) {
                Storage::disk('public')->delete($guru->foto);
            }

            $fotoPath = $request->file('foto')->store('guru', 'public');
            $guru->foto = $fotoPath;
        }

        $guru->update([
            'nama_guru' => $request->nama_guru,
            'jenis_kelamin' => $request->jenis_kelamin,
            'tanggal_lahir' => $request->tanggal_lahir,
            'usia' => $usia,
            'pendidikan' => $request->pendidikan,
            'pekerjaan' => $request->pekerjaan,
            'kontak' => $request->kontak,
        ]);

        return response()->json([
            'message' => 'Guru berhasil diupdate',
            'data' => $guru
        ]);
    }
    public function destroyGuru($id)
    {
        $guru = Guru::find($id);

        if (!$guru) {
            return response()->json([
                'message' => 'Guru tidak ditemukan'
            ], 404);
        }

        $guru->delete();

        return response()->json([
            'message' => 'Guru berhasil dihapus'
        ]);
    }
}
