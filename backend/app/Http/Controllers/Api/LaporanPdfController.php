<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;

use App\Models\Santri;
use App\Models\Guru;
use App\Models\OrangTua;
use App\Models\Berita;
use App\Models\Pengumuman;
use App\Models\ProgresIqra;
use App\Models\ProgresQuran;
use App\Models\Galeri;
use App\Models\ProgresHafalan;
use App\Models\PengaturanLaporan;
use App\Services\Report\ReportEngine;

class LaporanPdfController extends Controller
{

    private function dataLaporan()
    {
        return [
            'santri' => Santri::with('orangTua')->get(),
            'guru' => Guru::all(),
            'orang_tua' => OrangTua::all(),
            'berita' => Berita::all(),
            'pengumuman' => Pengumuman::all(),
            'galeri' => Galeri::all(),
            'progres_iqra' => ProgresIqra::all(),
            'progres_quran' => ProgresQuran::all(),
            'progres_hafalan' => ProgresHafalan::all(),
        ];
    }


    private function statistik()
    {
        $totalSantri = Santri::count();
        $totalGuru = Guru::count();


        $rasioGuru = $totalGuru > 0
            ? "1 : " . round($totalSantri / $totalGuru)
            : "-";


        $totalIqra = Santri::where('kelas', 'Iqra')->count();


        $totalQuran = Santri::whereIn('kelas', [
            'Al Quran',
            'AlQuran',
            "Al-Qur'an"
        ])->count();


        $persenIqra = $totalSantri > 0
            ? round(($totalIqra / $totalSantri) * 100, 1)
            : 0;


        $persenQuran = $totalSantri > 0
            ? round(($totalQuran / $totalSantri) * 100, 1)
            : 0;



        // =========================
        // PROGRES IQRA
        // =========================

        $totalProgresIqra = ProgresIqra::count();

        $iqraLancar = ProgresIqra::where(
            'progres',
            'Lancar'
        )->count();


        $persenIqraLancar = $totalProgresIqra > 0
            ? round(($iqraLancar / $totalProgresIqra) * 100, 1)
            : 0;



        // =========================
        // PROGRES QURAN
        // =========================

        $totalProgresQuran = ProgresQuran::count();

        $quranLancar = ProgresQuran::where(
            'progres',
            'Lancar'
        )->count();


        $persenQuranLancar = $totalProgresQuran > 0
            ? round(($quranLancar / $totalProgresQuran) * 100, 1)
            : 0;



        // =========================
        // PROGRES HAFALAN
        // =========================

        $totalProgresHafalan = ProgresHafalan::count();


        $hafalanLancar = ProgresHafalan::where(
            'progres',
            'Lancar'
        )->count();


        $hafalanBelum = ProgresHafalan::where(
            'progres',
            'Belum'
        )->count();


        $persenHafalanLancar = $totalProgresHafalan > 0
            ? round(($hafalanLancar / $totalProgresHafalan) * 100, 1)
            : 0;


        $persenHafalanBelum = $totalProgresHafalan > 0
            ? round(($hafalanBelum / $totalProgresHafalan) * 100, 1)
            : 0;



        return [

            'totalSantri' => $totalSantri,
            'totalGuru' => $totalGuru,
            'rasioGuru' => $rasioGuru,

            'persenIqra' => $persenIqra,
            'persenQuran' => $persenQuran,

            'persenIqraLancar' => $persenIqraLancar,
            'persenQuranLancar' => $persenQuranLancar,

            'persenHafalanLancar' => $persenHafalanLancar,
            'persenHafalanBelum' => $persenHafalanBelum,
        ];
    }



    private function generatePdf()
    {

        $setting = PengaturanLaporan::first();
        if (is_string($setting->narasi)) {
            $setting->narasi = json_decode($setting->narasi, true);
        }
        if (!$setting) {

            $setting = new PengaturanLaporan();

            $setting->judul = "Laporan Ringkas TPQ Khairunissa";

            $setting->sub_judul = "Sistem Informasi Manajemen TPQ Khairunissa";

            $setting->narasi = [];

            $setting->penutup = "";

            $setting->status = "Aktif";
        }
        $masterData = $this->dataLaporan();

        $report = new ReportEngine($masterData);

        $laporan = $report->generate();

        $pdf = Pdf::loadView(
            'pdf.laporan-ringkas',
            array_merge(
                [
                    'setting' => $setting,

                    'masterData' => $masterData,

                    'bab1' => $laporan['bab1'],
                    'bab2' => $laporan['bab2'],
                    'bab3' => $laporan['bab3'],
                    'bab4' => $laporan['bab4'],
                    'bab5' => $laporan['bab5'],
                    'bab6' => $laporan['bab6'],
                    'bab7' => $laporan['bab7'],
                    'bab8' => $laporan['bab8'],

                    'progresIqra' => ProgresIqra::all(),
                    'progresQuran' => ProgresQuran::all(),
                    'progresHafalan' => ProgresHafalan::all(),

                ],
                $this->statistik()
            )
        );

        $pdf->setPaper(
            'A4',
            'portrait'
        );


        $dompdf = $pdf->getDomPDF();

        $dompdf->render();


        $canvas = $dompdf->get_canvas();


        $font = $dompdf
            ->getFontMetrics()
            ->getFont(
                'Helvetica',
                'italic'
            );


        $canvas->page_script(function ($pageNumber, $pageCount, $canvas, $fontMetrics) {

            // Cover (halaman 1) tidak diberi footer
            if ($pageNumber == 1) {
                return;
            }

            $font = $fontMetrics->getFont('Helvetica', 'italic');

            $canvas->text(
                35,
                808,
                "Laporan Ringkas TPQ Khairunissa - Update : " . date('d-m-Y'),
                $font,
                10
            );

            $canvas->text(
                465,
                808,
                "Hal {$pageNumber} - {$pageCount}",
                $font,
                10
            );
        });

        return $pdf;
    }



    // DOWNLOAD PDF

    public function ringkas()
    {
        return $this->generatePdf()
            ->download(
                'Laporan-Ringkas-TPQ.pdf'
            );
    }



    // PREVIEW PDF DI BROWSER

    public function preview()
    {
        return $this->generatePdf()
            ->stream(
                'Laporan-Ringkas-TPQ.pdf'
            );
    }
}
