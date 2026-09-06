<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PengaturanSistem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PengaturanSistemController extends Controller
{
    /**
     * =========================================================
     * NARASI DEFAULT
     * =========================================================
     *
     * Data default akan digunakan apabila database belum
     * memiliki nilai untuk field tertentu.
     *
     * CATATAN:
     * - Tidak ada nama pimpinan
     * - Tidak ada jam operasional
     * - Tidak ada deskripsi TPQ
     * - Alamat tetap diperlukan
     * - Logo bersifat global
     */
    private function defaultData(): array
    {
        return [

            // =====================================================
            // IDENTITAS TPQ
            // =====================================================

            'nama_tpq' =>
            'TPQ Khairunnissa',

            'alamat' =>
            'Jln. MT. Habib Abubakar Al-Attas.',

            'kelurahan' =>
            'Gamalama',

            'kecamatan' =>
            'Ternate Tengah',

            'kota' =>
            'Ternate',

            'provinsi' =>
            'Maluku Utara',

            'no_hp' =>
            '08xxxxxxxxxx',

            'email' =>
            'tpqkhairunnissa@gmail.com',


            // =====================================================
            // PROFIL TPQ
            // =====================================================

            'profil' =>
            'TPQ Khairunnissa merupakan lembaga pendidikan Al-Qur’an yang memberikan pembelajaran keislaman kepada santri melalui pendidikan membaca Iqra, membaca Al-Qur’an, hafalan, praktik ibadah, dan pembinaan akhlak. Kegiatan pembelajaran dilaksanakan secara bertahap sesuai kemampuan santri dengan suasana belajar yang terarah dan menyenangkan.',

            'visi' =>
            'Membentuk generasi Qurani yang mampu membaca dan memahami Al-Qur’an, memiliki akhlak mulia, disiplin, serta memiliki semangat untuk terus belajar dan berkembang.',

            'misi' =>
            'Menyelenggarakan pembelajaran Iqra dan Al-Qur’an secara bertahap, membimbing santri dalam praktik ibadah, membina akhlak dan kedisiplinan, serta mengembangkan potensi dan prestasi santri.',

            'nilai_akhlak' =>
            'Menanamkan sikap santun, hormat kepada orang tua dan guru, peduli terhadap sesama, serta membiasakan perilaku yang mencerminkan akhlakul karimah dalam kehidupan sehari-hari.',

            'nilai_quran' =>
            'Menjadikan Al-Qur’an sebagai pedoman dalam belajar dan kehidupan dengan membiasakan santri membaca, mempelajari, menghafal, serta mengamalkan nilai-nilai Al-Qur’an.',

            'nilai_disiplin' =>
            'Membentuk kebiasaan hadir tepat waktu, mengikuti kegiatan pembelajaran dengan tertib, menyelesaikan tugas, serta bertanggung jawab terhadap kewajiban sebagai santri.',

            'nilai_prestasi' =>
            'Memberikan ruang kepada santri untuk mengembangkan kemampuan dan potensi melalui pembelajaran, hafalan, kegiatan keagamaan, serta berbagai bentuk prestasi sesuai kemampuan masing-masing.',


            // =====================================================
            // HOME - PROGRAM
            // =====================================================

            'program_iqra' =>
            'Pembelajaran dasar membaca huruf hijaiyah menggunakan metode Iqra secara bertahap mulai dari pengenalan huruf, harakat, hingga santri mampu membaca dengan lancar dan benar.',

            'program_quran' =>
            'Pembelajaran membaca Al-Qur’an dengan memperhatikan kaidah tajwid dan makharijul huruf yang benar sehingga santri mampu membaca Al-Qur’an dengan fasih dan tartil.',

            'program_tahfidz' =>
            'Program hafalan surat-surat pendek, doa harian, serta pembinaan hafalan Al-Qur’an secara bertahap sesuai kemampuan santri.',


            // =====================================================
            // HOME - MENGAPA MEMILIH TPQ
            // =====================================================

            'keunggulan_iqra_quran' =>
            'Santri dibimbing secara bertahap mulai dari membaca Iqra hingga Al-Qur’an dengan memperhatikan tajwid dan makharijul huruf yang benar.',

            'keunggulan_ibadah' =>
            'Pembelajaran tidak hanya berupa teori, tetapi juga praktik ibadah seperti shalat, doa harian, wudhu, serta pembiasaan adab Islami dalam kehidupan sehari-hari.',

            'keunggulan_akhlak' =>
            'Pembentukan karakter menjadi bagian penting dalam proses belajar sehingga santri diharapkan tumbuh menjadi pribadi yang santun, disiplin, bertanggung jawab, dan berakhlakul karimah.',

            'keunggulan_guru' =>
            'Proses pembelajaran dibimbing oleh ustadz dan ustadzah yang berpengalaman serta memiliki komitmen dalam mendidik dan membimbing generasi Qurani.',


            // =====================================================
            // HOME - PERSYARATAN
            // =====================================================

            'syarat_gratis' =>
            'Tidak dipungut biaya pendaftaran dan selama santri belajar di TPQ.',

            'syarat_form' =>
            'Formulir pendaftaran diisi oleh Admin TPQ berdasarkan data yang diberikan oleh orang tua atau wali santri.',

            'syarat_kk' =>
            'Membawa fotocopy Kartu Keluarga sebagai data pendukung administrasi pendaftaran.',

            'syarat_ktp' =>
            'Membawa fotocopy KTP orang tua atau wali santri sebagai data pendukung administrasi pendaftaran.',
        ];
    }


    /**
     * =========================================================
     * FORMAT DATA RESPONSE
     * =========================================================
     *
     * Hanya field yang memang digunakan aplikasi yang
     * dikirimkan ke frontend.
     *
     * Field lama seperti "deskripsi" sengaja tidak dimasukkan.
     */
    private function responseData(PengaturanSistem $setting): array
    {
        $data = $setting->only([

            // =================================================
            // IDENTITAS
            // =================================================

            'id',
            'nama_tpq',
            'alamat',
            'kelurahan',
            'kecamatan',
            'kota',
            'provinsi',
            'no_hp',
            'email',
            'logo',


            // =================================================
            // PROFIL
            // =================================================

            'profil',
            'visi',
            'misi',
            'nilai_akhlak',
            'nilai_quran',
            'nilai_disiplin',
            'nilai_prestasi',


            // =================================================
            // PROGRAM
            // =================================================

            'program_iqra',
            'program_quran',
            'program_tahfidz',


            // =================================================
            // KEUNGGULAN
            // =================================================

            'keunggulan_iqra_quran',
            'keunggulan_ibadah',
            'keunggulan_akhlak',
            'keunggulan_guru',


            // =================================================
            // PERSYARATAN
            // =================================================

            'syarat_gratis',
            'syarat_form',
            'syarat_kk',
            'syarat_ktp',
        ]);


        // =====================================================
        // LOGO URL
        // =====================================================

        $data['logo_url'] = $setting->logo
            ? asset('storage/' . $setting->logo)
            : null;


        return $data;
    }


    /**
     * =========================================================
     * GET /api/pengaturan-sistem
     * =========================================================
     *
     * PUBLIC
     */
    public function index()
    {
        $setting = PengaturanSistem::first();


        // =====================================================
        // JIKA BELUM ADA DATA
        // =====================================================

        if (!$setting) {

            $data = $this->defaultData();

            $setting = PengaturanSistem::create($data);
        } else {

            // =================================================
            // ISI FIELD YANG MASIH KOSONG DENGAN DEFAULT
            // =================================================

            $defaults = $this->defaultData();

            $changed = false;

            foreach ($defaults as $key => $value) {

                /*
                 * Hanya isi apabila field tersebut kosong.
                 *
                 * Data yang sudah diubah Admin tidak akan
                 * ditimpa oleh default.
                 */

                if (
                    is_null($setting->{$key}) ||
                    $setting->{$key} === ''
                ) {
                    $setting->{$key} = $value;

                    $changed = true;
                }
            }

            if ($changed) {
                $setting->save();
            }
        }


        // =====================================================
        // RESPONSE
        // =====================================================

        return response()->json([
            'success' => true,
            'data' => $this->responseData($setting),
        ]);
    }


    /**
     * =========================================================
     * POST /api/pengaturan-sistem
     * =========================================================
     *
     * ADMIN ONLY
     */
    public function update(Request $request)
    {
        // =====================================================
        // VALIDASI
        // =====================================================

        $request->validate([

            // =================================================
            // IDENTITAS TPQ
            // =================================================

            'nama_tpq' =>
            'required|string|max:255',

            'alamat' =>
            'required|string',

            'kelurahan' =>
            'required|string|max:255',

            'kecamatan' =>
            'required|string|max:255',

            'kota' =>
            'required|string|max:255',

            'provinsi' =>
            'required|string|max:255',

            'no_hp' =>
            'nullable|string|max:50',

            'email' =>
            'nullable|email|max:255',


            // =================================================
            // PROFIL TPQ
            // =================================================

            'profil' =>
            'nullable|string',

            'visi' =>
            'nullable|string',

            'misi' =>
            'nullable|string',

            'nilai_akhlak' =>
            'nullable|string',

            'nilai_quran' =>
            'nullable|string',

            'nilai_disiplin' =>
            'nullable|string',

            'nilai_prestasi' =>
            'nullable|string',


            // =================================================
            // HOME - PROGRAM
            // =================================================

            'program_iqra' =>
            'nullable|string',

            'program_quran' =>
            'nullable|string',

            'program_tahfidz' =>
            'nullable|string',


            // =================================================
            // HOME - KEUNGGULAN
            // =================================================

            'keunggulan_iqra_quran' =>
            'nullable|string',

            'keunggulan_ibadah' =>
            'nullable|string',

            'keunggulan_akhlak' =>
            'nullable|string',

            'keunggulan_guru' =>
            'nullable|string',


            // =================================================
            // HOME - PERSYARATAN
            // =================================================

            'syarat_gratis' =>
            'nullable|string',

            'syarat_form' =>
            'nullable|string',

            'syarat_kk' =>
            'nullable|string',

            'syarat_ktp' =>
            'nullable|string',


            // =================================================
            // LOGO GLOBAL
            // =================================================

            'logo' =>
            'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);


        // =====================================================
        // AMBIL DATA PENGATURAN
        // =====================================================

        $setting = PengaturanSistem::first();

        if (!$setting) {
            $setting = new PengaturanSistem();
        }


        // =====================================================
        // IDENTITAS TPQ
        // =====================================================

        $setting->nama_tpq =
            $request->nama_tpq;

        $setting->alamat =
            $request->alamat;

        $setting->kelurahan =
            $request->kelurahan;

        $setting->kecamatan =
            $request->kecamatan;

        $setting->kota =
            $request->kota;

        $setting->provinsi =
            $request->provinsi;

        $setting->no_hp =
            $request->no_hp;

        $setting->email =
            $request->email;


        // =====================================================
        // PROFIL TPQ
        // =====================================================

        $setting->profil =
            $request->profil;

        $setting->visi =
            $request->visi;

        $setting->misi =
            $request->misi;

        $setting->nilai_akhlak =
            $request->nilai_akhlak;

        $setting->nilai_quran =
            $request->nilai_quran;

        $setting->nilai_disiplin =
            $request->nilai_disiplin;

        $setting->nilai_prestasi =
            $request->nilai_prestasi;


        // =====================================================
        // HOME - PROGRAM
        // =====================================================

        $setting->program_iqra =
            $request->program_iqra;

        $setting->program_quran =
            $request->program_quran;

        $setting->program_tahfidz =
            $request->program_tahfidz;


        // =====================================================
        // HOME - KEUNGGULAN
        // =====================================================

        $setting->keunggulan_iqra_quran =
            $request->keunggulan_iqra_quran;

        $setting->keunggulan_ibadah =
            $request->keunggulan_ibadah;

        $setting->keunggulan_akhlak =
            $request->keunggulan_akhlak;

        $setting->keunggulan_guru =
            $request->keunggulan_guru;


        // =====================================================
        // HOME - PERSYARATAN
        // =====================================================

        $setting->syarat_gratis =
            $request->syarat_gratis;

        $setting->syarat_form =
            $request->syarat_form;

        $setting->syarat_kk =
            $request->syarat_kk;

        $setting->syarat_ktp =
            $request->syarat_ktp;


        // =====================================================
        // LOGO GLOBAL
        // =====================================================

        if ($request->hasFile('logo')) {

            // -----------------------------------------------
            // HAPUS LOGO LAMA
            // -----------------------------------------------

            if ($setting->logo) {

                Storage::disk('public')->delete(
                    $setting->logo
                );
            }


            // -----------------------------------------------
            // SIMPAN LOGO BARU
            // -----------------------------------------------

            $setting->logo =
                $request
                ->file('logo')
                ->store(
                    'pengaturan',
                    'public'
                );
        }


        // =====================================================
        // SIMPAN
        // =====================================================

        $setting->save();


        // =====================================================
        // RESPONSE
        // =====================================================

        return response()->json([
            'success' =>
            true,

            'message' =>
            'Pengaturan sistem berhasil disimpan.',

            'data' =>
            $this->responseData($setting),
        ]);
    }
}
