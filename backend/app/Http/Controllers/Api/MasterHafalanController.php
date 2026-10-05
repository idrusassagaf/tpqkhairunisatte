<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterHafalan;
use App\Models\ProgresHafalan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MasterHafalanController extends Controller
{
    // Rapikan spasi (awal, akhir, dan ganda di tengah).
    private function rapikan(string $teks): string
    {
        return preg_replace('/\s+/u', ' ', trim($teks));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
        ]);

        $nama = $this->rapikan($data['nama']);

        if (MasterHafalan::whereRaw('LOWER(nama) = ?', [mb_strtolower($nama)])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis hafalan dengan nama tersebut sudah ada',
            ], 422);
        }

        $urutan = (int) MasterHafalan::max('urutan') + 1;

        $master = MasterHafalan::create([
            'nama' => $nama,
            'urutan' => $urutan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jenis hafalan berhasil ditambahkan',
            'data' => $master,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $master = MasterHafalan::findOrFail($id);

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
        ]);

        $nama = $this->rapikan($data['nama']);

        if (MasterHafalan::whereRaw('LOWER(nama) = ?', [mb_strtolower($nama)])
            ->where('id', '!=', $master->id)
            ->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis hafalan dengan nama tersebut sudah ada',
            ], 422);
        }

        DB::transaction(function () use ($master, $nama) {
            $master->update(['nama' => $nama]);

            // Nama di progres ikut diperbarui agar tampilan dan laporan tetap sama.
            ProgresHafalan::where('master_hafalan_id', $master->id)
                ->update(['jenis_hafalan' => $nama]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Jenis hafalan berhasil diperbarui',
            'data' => $master->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $master = MasterHafalan::findOrFail($id);

        $terpakai = ProgresHafalan::where('master_hafalan_id', $master->id)->count();

        if ($terpakai > 0 && ! $request->boolean('force')) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis hafalan sudah dipakai di data progres santri',
                'terpakai' => $terpakai,
            ], 422);
        }

        DB::transaction(function () use ($master) {
            // Hapus paksa: data progres yang memakai jenis ini ikut dihapus.
            ProgresHafalan::where('master_hafalan_id', $master->id)->delete();
            $master->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Jenis hafalan berhasil dihapus',
            'terhapus_progres' => $terpakai,
        ]);
    }
}
