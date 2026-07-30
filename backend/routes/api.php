<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\SantriController;
use App\Http\Controllers\Api\ProgresIqraController;
use App\Http\Controllers\Api\ProgresQuranController;
use App\Http\Controllers\Api\BeritaController;
use App\Http\Controllers\PengumumanController;
use App\Http\Controllers\JadwalPengajianController;
use App\Http\Controllers\Api\GaleriController;
use App\Http\Controllers\Api\LaporanPdfController;
use App\Http\Controllers\Api\ProgresHafalanController;
use App\Http\Controllers\Api\LaporanSettingController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ✅ TEST
Route::get('/test', function () {
    return response()->json([
        'status' => true,
        'message' => 'API berjalan normal'
    ]);
});

// =============================
// 🔓 PUBLIC (TANPA LOGIN)
// =============================

// AUTH
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// =============================
// 📊 MASTER DATA (CRUD)
// =============================
Route::get('/master-data', [MasterDataController::class, 'index']);
Route::post('/master-data', [MasterDataController::class, 'store']);
Route::put('/master-data/{id}', [MasterDataController::class, 'update']);
// =============================
// 🧒 SANTRI
// =============================
Route::get('/santri', [SantriController::class, 'index']);
Route::post('/santri', [SantriController::class, 'store']);

// =============================
// 👨‍🏫 GURU
// =============================
Route::post('/guru', [MasterDataController::class, 'storeGuru']);
Route::put('/guru/{id}', [MasterDataController::class, 'updateGuru']);
Route::delete('/guru/{id}', [MasterDataController::class, 'destroyGuru']);
// =============================

// =============================
// 👨‍🏫 PROGRES IQRA
// =============================
Route::get('/progres-iqra', [ProgresIqraController::class, 'index']);
Route::post('/progres-iqra', [ProgresIqraController::class, 'store']);

// =============================
// 📖 PROGRES AL-QUR'AN
// =============================
Route::get('/progres-quran', [ProgresQuranController::class, 'index']);
Route::post('/progres-quran', [ProgresQuranController::class, 'store']);

// =============================
// 📖 PROGRES HAFALAN
// =============================

Route::get('/progres-hafalan', [ProgresHafalanController::class, 'index']);
Route::post('/progres-hafalan', [ProgresHafalanController::class, 'store']);

// =============================
// 📰 BERITA
// =============================
Route::get('/berita', [BeritaController::class, 'index']);
Route::post('/berita', [BeritaController::class, 'store']);
Route::put('/berita/{id}', [BeritaController::class, 'update']);
Route::delete('/berita/{id}', [BeritaController::class, 'destroy']);

// =============================
// 📢 PENGUMUMAN
// =============================
Route::get('/pengumuman', [PengumumanController::class, 'index']);
Route::post('/pengumuman', [PengumumanController::class, 'store']);
Route::put('/pengumuman/{id}', [PengumumanController::class, 'update']);
Route::delete('/pengumuman/{id}', [PengumumanController::class, 'destroy']);

// =============================
// GALERI
// =============================
Route::get('/galeri', [GaleriController::class, 'index']);
Route::post('/galeri', [GaleriController::class, 'store']);
Route::delete('/galeri/{id}', [GaleriController::class, 'destroy']);

// =============================
// JADWAL PENGAJIAN
// =============================
Route::get('/jadwal', [JadwalPengajianController::class, 'index']);
Route::post('/jadwal', [JadwalPengajianController::class, 'store']);

// =============================
// PDF LAPORAN
// =============================
Route::get('/laporan-ringkas/pdf', [LaporanPdfController::class, 'ringkas']);
Route::get('/laporan-ringkas/view', [LaporanPdfController::class, 'preview']);

// =============================
// PENGATURAN LAPORAN
// =============================
Route::get('/laporan-setting', [LaporanSettingController::class, 'index']);
Route::put('/laporan-setting', [LaporanSettingController::class, 'update']);

// =============================
// 🔐 PRIVATE (BUTUH LOGIN)
// =============================
