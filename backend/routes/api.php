<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\AiController;
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
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\PengaturanSistemController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/


// ============================================================
// TEST
// ============================================================

Route::get('/test', function () {

    return response()->json([
        'status' => true,
        'message' => 'API berjalan normal'
    ]);
});


// ============================================================
// AUTH
// PUBLIC
// ============================================================

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);


// ============================================================
// WEBSITE PUBLIC
// GET SAJA / READ ONLY
// TANPA LOGIN
// ============================================================

// ------------------------------------------------------------
// AI CHAT
// PUBLIC
// ------------------------------------------------------------

Route::post(
    '/ai/chat',
    [AiController::class, 'chat']
);

// ------------------------------------------------------------
// MASTER DATA
// PUBLIC READ ONLY
// ------------------------------------------------------------

Route::get(
    '/master-data',
    [MasterDataController::class, 'index']
);

// ------------------------------------------------------------
// BERITA
// ------------------------------------------------------------

Route::get(
    '/berita',
    [BeritaController::class, 'index']
);


// ------------------------------------------------------------
// PENGUMUMAN
// ------------------------------------------------------------

Route::get(
    '/pengumuman',
    [PengumumanController::class, 'index']
);


// ------------------------------------------------------------
// GALERI
// ------------------------------------------------------------

Route::get(
    '/galeri',
    [GaleriController::class, 'index']
);


// ------------------------------------------------------------
// JADWAL PENGAJIAN
// ------------------------------------------------------------

Route::get(
    '/jadwal',
    [JadwalPengajianController::class, 'index']
);


// ------------------------------------------------------------
// LAPORAN SETTING
// PUBLIC
// ------------------------------------------------------------

Route::get(
    '/laporan-setting',
    [LaporanSettingController::class, 'index']
);


// ------------------------------------------------------------
// PENGATURAN SISTEM
// PUBLIC READ ONLY
//
// PENTING:
// Route GET ini berada DI LUAR auth:sanctum
// sehingga website public dapat mengambil:
// - nama TPQ
// - alamat
// - profil
// - visi
// - misi
// - program
// - keunggulan
// - persyaratan
// - logo
// ------------------------------------------------------------

Route::get(
    '/pengaturan-sistem',
    [PengaturanSistemController::class, 'index']
);


// ============================================================
// PDF LAPORAN
// PUBLIC
// ============================================================

Route::get(
    '/laporan-ringkas/pdf',
    [LaporanPdfController::class, 'ringkas']
);

Route::get(
    '/laporan-ringkas/view',
    [LaporanPdfController::class, 'preview']
);


// ============================================================
// PRIVATE
// WAJIB LOGIN
// ============================================================

Route::middleware('auth:sanctum')->group(function () {




    // ========================================================
    // SANTRI
    // VIEWER + ADMIN
    // ========================================================

    Route::get(
        '/santri',
        [SantriController::class, 'index']
    );


    // ========================================================
    // PROGRES IQRA
    // VIEWER + ADMIN
    // ========================================================

    Route::get(
        '/progres-iqra',
        [ProgresIqraController::class, 'index']
    );


    // ========================================================
    // PROGRES AL-QUR'AN
    // VIEWER + ADMIN
    // ========================================================

    Route::get(
        '/progres-quran',
        [ProgresQuranController::class, 'index']
    );


    // ========================================================
    // PROGRES HAFALAN
    // VIEWER + ADMIN
    // ========================================================

    Route::get(
        '/progres-hafalan',
        [ProgresHafalanController::class, 'index']
    );


    // ========================================================
    // CHANGE PASSWORD
    // ADMIN + VIEWER
    // ========================================================

    Route::post(
        '/change-password',
        [AuthController::class, 'changePassword']
    );


    // ========================================================
    // ADMIN ONLY
    // ========================================================

    Route::middleware('admin')->group(function () {


        // ====================================================
        // MASTER DATA CRUD
        // ====================================================

        Route::post(
            '/master-data',
            [MasterDataController::class, 'store']
        );

        Route::put(
            '/master-data/{id}',
            [MasterDataController::class, 'update']
        );

        Route::delete(
            '/master-data/{id}',
            [MasterDataController::class, 'destroy']
        );


        // ====================================================
        // PENGATURAN SISTEM
        // ADMIN ONLY
        //
        // GET  -> PUBLIC
        // POST -> ADMIN
        // ====================================================

        Route::post(
            '/pengaturan-sistem',
            [PengaturanSistemController::class, 'update']
        );


        // ====================================================
        // SANTRI CRUD
        // ====================================================

        Route::post(
            '/santri',
            [SantriController::class, 'store']
        );


        // ====================================================
        // GURU CRUD
        // ====================================================

        Route::post(
            '/guru',
            [MasterDataController::class, 'storeGuru']
        );

        Route::put(
            '/guru/{id}',
            [MasterDataController::class, 'updateGuru']
        );

        Route::delete(
            '/guru/{id}',
            [MasterDataController::class, 'destroyGuru']
        );


        // ====================================================
        // PROGRES IQRA
        // ====================================================

        Route::post(
            '/progres-iqra',
            [ProgresIqraController::class, 'store']
        );


        // ====================================================
        // PROGRES AL-QUR'AN
        // ====================================================

        Route::post(
            '/progres-quran',
            [ProgresQuranController::class, 'store']
        );


        // ====================================================
        // PROGRES HAFALAN
        // ====================================================

        Route::post(
            '/progres-hafalan',
            [ProgresHafalanController::class, 'store']
        );


        // ====================================================
        // BERITA CRUD
        // ====================================================

        Route::post(
            '/berita',
            [BeritaController::class, 'store']
        );

        Route::put(
            '/berita/{id}',
            [BeritaController::class, 'update']
        );

        Route::delete(
            '/berita/{id}',
            [BeritaController::class, 'destroy']
        );


        // ====================================================
        // PENGUMUMAN CRUD
        // ====================================================

        Route::post(
            '/pengumuman',
            [PengumumanController::class, 'store']
        );

        Route::put(
            '/pengumuman/{id}',
            [PengumumanController::class, 'update']
        );

        Route::delete(
            '/pengumuman/{id}',
            [PengumumanController::class, 'destroy']
        );


        // ====================================================
        // GALERI CRUD
        // ====================================================

        Route::post(
            '/galeri',
            [GaleriController::class, 'store']
        );

        Route::delete(
            '/galeri/{id}',
            [GaleriController::class, 'destroy']
        );


        // ====================================================
        // JADWAL PENGAJIAN
        // ====================================================

        Route::post(
            '/jadwal',
            [JadwalPengajianController::class, 'store']
        );


        // ====================================================
        // PENGATURAN LAPORAN
        // ====================================================

        Route::put(
            '/laporan-setting',
            [LaporanSettingController::class, 'update']
        );


        // ====================================================
        // MANAGEMENT USER
        // ADMIN ONLY
        // ====================================================

        Route::get(
            '/users',
            [UserManagementController::class, 'index']
        );

        Route::post(
            '/users',
            [UserManagementController::class, 'store']
        );

        Route::get(
            '/users/{id}',
            [UserManagementController::class, 'show']
        );

        Route::put(
            '/users/{id}',
            [UserManagementController::class, 'update']
        );

        Route::delete(
            '/users/{id}',
            [UserManagementController::class, 'destroy']
        );

        Route::patch(
            '/users/{id}/toggle-active',
            [UserManagementController::class, 'toggleActive']
        );
    });
});
