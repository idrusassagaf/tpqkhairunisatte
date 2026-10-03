<?php

namespace App\Console\Commands;

use App\Models\Berita;
use App\Models\Galeri;
use App\Models\Pengumuman;
use App\Models\PengaturanSistem;
use App\Services\Translator\GeminiTranslator;
use Illuminate\Console\Command;

class BackfillTranslations extends Command
{
    protected $signature = 'translations:backfill {--force : Terjemahkan ulang walau sudah ada translations}';

    protected $description = 'Terjemahkan konten lama (Profil, Berita, Pengumuman, Galeri) yang belum punya kolom translations terisi';

    public function handle(): int
    {
        $translator = new GeminiTranslator();
        $force = (bool) $this->option('force');

        // =====================================================
        // PROFIL / PENGATURAN SISTEM
        // =====================================================

        $setting = PengaturanSistem::first();

        if ($setting && ($force || empty($setting->translations))) {
            $this->info('Menerjemahkan Pengaturan Sistem (Profil)...');

            $fields = [];

            foreach ([
                'profil', 'visi', 'misi',
                'nilai_akhlak', 'nilai_quran', 'nilai_disiplin', 'nilai_prestasi',
                'program_iqra', 'program_quran', 'program_tahfidz',
                'keunggulan_iqra_quran', 'keunggulan_ibadah', 'keunggulan_akhlak', 'keunggulan_guru',
                'syarat_gratis', 'syarat_form', 'syarat_kk', 'syarat_ktp',
            ] as $key) {
                $fields[$key] = (string) ($setting->{$key} ?? '');
            }

            $hasil = $translator->translateToAll($fields, ['en', 'ar']);
            $existing = is_array($setting->translations) ? $setting->translations : [];

            foreach ($hasil as $language => $translated) {
                if ($translated !== null) {
                    $existing[$language] = $translated;
                }
            }

            $setting->translations = $existing;
            $setting->save();

            $this->line('  Selesai.');
        } else {
            $this->line('Pengaturan Sistem dilewati (sudah ada translations).');
        }

        // =====================================================
        // BERITA
        // =====================================================

        $this->backfillCollection(
            Berita::all(),
            $translator,
            $force,
            fn ($item) => [
                'judul' => (string) $item->judul,
                'isi' => (string) $item->isi,
            ],
            'Berita'
        );

        // =====================================================
        // PENGUMUMAN
        // =====================================================

        $this->backfillCollection(
            Pengumuman::all(),
            $translator,
            $force,
            fn ($item) => [
                'judul' => (string) $item->judul,
                'isi' => (string) $item->isi,
            ],
            'Pengumuman'
        );

        // =====================================================
        // GALERI
        // =====================================================

        $this->backfillCollection(
            Galeri::all(),
            $translator,
            $force,
            fn ($item) => [
                'judul' => (string) $item->judul,
            ],
            'Galeri'
        );

        $this->info('Backfill terjemahan selesai.');

        return self::SUCCESS;
    }

    private function backfillCollection(
        $items,
        GeminiTranslator $translator,
        bool $force,
        callable $fieldsResolver,
        string $label
    ): void {
        foreach ($items as $item) {
            if (!$force && !empty($item->translations)) {
                continue;
            }

            $this->info("Menerjemahkan {$label} #{$item->id}...");

            $fields = $fieldsResolver($item);

            $hasil = $translator->translateToAll($fields, ['en', 'ar']);
            $existing = is_array($item->translations) ? $item->translations : [];

            foreach ($hasil as $language => $translated) {
                if ($translated !== null) {
                    $existing[$language] = $translated;
                }
            }

            $item->translations = $existing;
            $item->save();
        }
    }
}
