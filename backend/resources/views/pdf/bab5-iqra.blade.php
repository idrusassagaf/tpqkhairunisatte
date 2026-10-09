@php
$pdfLanguage = $language ?? 'id';

$labels = [
'id' => [
'bab' => 'BAB V',
'title' => 'PROGRES PEMBELAJARAN IQRA',
'keterangan' => 'Keterangan',
'jumlah' => 'Jumlah',
'total_santri_iqra' => 'Total Santri Iqra',
'rekap_progres' => 'Rekapitulasi Progres Iqra Santri',
'no' => 'No',
'jilid' => 'Jilid',
'lancar' => 'Lancar',
'belum' => 'Belum',
],

'en' => [
'bab' => 'CHAPTER V',
'title' => 'IQRA LEARNING PROGRESS',
'keterangan' => 'Description',
'jumlah' => 'Total',
'total_santri_iqra' => 'Total Iqra Students',
'rekap_progres' => 'Iqra Student Progress Summary',
'no' => 'No',
'jilid' => 'Volume',
'lancar' => 'Fluent',
'belum' => 'Not Yet',
],

'ar' => [
'bab' => 'الفصل الخامس',
'title' => 'تقدم تعلم إقرأ',
'keterangan' => 'البيان',
'jumlah' => 'العدد',
'total_santri_iqra' => 'إجمالي طلاب إقرأ',
'rekap_progres' => 'ملخص تقدم طلاب إقرأ',
'no' => 'الرقم',
'jilid' => 'المجلد',
'lancar' => 'متقن',
'belum' => 'لم يتقن بعد',
],
];

$label = $labels[$pdfLanguage] ?? $labels['id'];
@endphp

<h2>{{ $label['bab'] }}</h2>

<h3>{{ $label['title'] }}</h3>

<p style="text-align:justify; line-height:1.8;">

    {!! str_contains($setting->narasi['bab5'] ?? '', '<') ? $setting->narasi['bab5'] : nl2br(e($setting->narasi['bab5'] ?? '')) !!}

</p>

<table>

    <tr>
        <th>{{ $label['keterangan'] }}</th>
        <th width="25%">{{ $label['jumlah'] }}</th>
    </tr>

    <tr>
        <td>{{ $label['total_santri_iqra'] }}</td>

        <td align="center">
            {{ $masterData['santri']->where('kelas','Iqra')->count() }}
        </td>
    </tr>

</table>

<br>

<h3>{{ $label['rekap_progres'] }}</h3>

<table>

    <tr>
        <th width="10%">{{ $label['no'] }}</th>
        <th>{{ $label['jilid'] }}</th>
        <th width="20%">{{ $label['lancar'] }}</th>
        <th width="20%">{{ $label['belum'] }}</th>
    </tr>

    @for($i = 1; $i <= 6; $i++)

        <tr>

        <td align="center">
            {{ $i }}
        </td>

        <td>
            Iqra {{ $i }}
        </td>

        <td align="center">
            {{ $progresIqra
                    ->where('jilid', "Iqra $i")
                    ->where('progres', 'Lancar')
                    ->count()
                }}
        </td>

        <td align="center">
            {{ $progresIqra
                    ->where('jilid', "Iqra $i")
                    ->where('progres', 'Belum')
                    ->count()
                }}
        </td>

        </tr>

        @endfor

</table>

<br>

{{-- =========================================================
     ANALISIS DATA
     ========================================================= --}}

<div style="margin-top:6px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab5['analysis'] ?? '') !!}
    </p>

</div>

{{-- =========================================================
     KESIMPULAN
     ========================================================= --}}

<div style="margin-top:4px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab5['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>