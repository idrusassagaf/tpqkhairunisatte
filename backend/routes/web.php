<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShareBeritaController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/share/berita/{id}', [
    ShareBeritaController::class,
    'show'
])->name('share.berita');
