{{--
    Narasi laporan dari TinyMCE (Laporan Ringkas).
    HTML dari editor dirender apa adanya supaya format (rata, tebal,
    daftar, judul) sama dengan di editor. Narasi lama berupa teks
    biasa tetap ditampilkan dengan baris baru dan rata kiri-kanan.
--}}
@php($isiNarasi = (string) ($setting->narasi[$key] ?? ''))

@if (str_contains($isiNarasi, '<'))
    <div class="narasi">{!! $isiNarasi !!}</div>
@elseif (trim($isiNarasi) !== '')
    <div class="narasi">
        <p style="text-align: justify;">{!! nl2br(e($isiNarasi)) !!}</p>
    </div>
@endif
