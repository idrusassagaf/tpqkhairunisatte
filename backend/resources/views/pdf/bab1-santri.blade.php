@php
    $pdfLanguage = $language ?? 'id';

    $labels = [
        'id' => [
            'bab' => 'BAB I',
            'title' => 'DATA SANTRI',
            'jenis_data' => 'Jenis Data',
            'laki' => 'Laki-laki',
            'perempuan' => 'Perempuan',
            'jumlah' => 'Jumlah',
        ],

        'en' => [
            'bab' => 'CHAPTER I',
            'title' => 'STUDENT DATA',
            'jenis_data' => 'Data Type',
            'laki' => 'Male',
            'perempuan' => 'Female',
            'jumlah' => 'Total',
        ],

        'ar' => [
            'bab' => 'الفصل الأول',
            'title' => 'بيانات الطلاب',
            'jenis_data' => 'نوع البيانات',
            'laki' => 'ذكور',
            'perempuan' => 'إناث',
            'jumlah' => 'المجموع',
        ],
    ];

    $label = $labels[$pdfLanguage] ?? $labels['id'];
@endphp

<h2 style="text-align:left;">
    {{ $label['bab'] }}
</h2>

<h3 style="text-align:left;">
    {{ $label['title'] }}
</h3>

{{-- ========================= --}}
{{-- Narasi Admin --}}
{{-- ========================= --}}

<p style="text-align:justify; line-height:1.8;">
    {!! str_contains($setting->narasi['bab1'] ?? '', '<') ? $setting->narasi['bab1'] : nl2br(e($setting->narasi['bab1'] ?? '')) !!}
</p>

{{-- ========================= --}}
{{-- Narasi Otomatis --}}
{{-- ========================= --}}

<p style="text-align:justify; line-height:1.8;">
    {!! $bab1['intro'] ?? '' !!}
</p>

{{-- ========================= --}}
{{-- TABEL REKAP SANTRI --}}
{{-- ========================= --}}

<table width="100%" border="1" cellspacing="0" cellpadding="6">

    <thead>
        <tr style="background:#1e3a8a;color:white;">
            <th>{{ $label['jenis_data'] }}</th>
            <th width="18%">{{ $label['laki'] }}</th>
            <th width="18%">{{ $label['perempuan'] }}</th>
            <th width="18%">{{ $label['jumlah'] }}</th>
        </tr>
    </thead>

    <tbody>

        @foreach($bab1['rekap'] as $r)

        <tr>
            <td>{{ $r['nama'] }}</td>

            <td align="center">
                {{ $r['l'] }}
            </td>

            <td align="center">
                {{ $r['p'] }}
            </td>

            <td align="center">
                {{ $r['j'] }}
            </td>
        </tr>

        @endforeach

        <tr style="font-weight:bold;background:#f3f4f6;">

            <td>
                {{ $label['jumlah'] }}
            </td>

            <td align="center">
                {{ $bab1['totalL'] }}
            </td>

            <td align="center">
                {{ $bab1['totalP'] }}
            </td>

            <td align="center">
                {{ $bab1['total'] }}
            </td>

        </tr>

    </tbody>

</table>

{{-- ========================= --}}
{{-- Analisis Data --}}
{{-- ========================= --}}

<div style="margin-top:6px;">

    <p style="
        text-align:justify;
        line-height:1.6;
        margin:0;
    ">
        {!! str_replace('<br><br>', '<br>', $bab1['analysis'] ?? '') !!}
    </p>

</div>

{{-- ========================= --}}
{{-- Kesimpulan --}}
{{-- ========================= --}}

<div style="margin-top:4px;">

    <p style="
        text-align:justify;
        line-height:1.6;
        margin:0;
    ">
        {!! str_replace('<br><br>', '<br>', $bab1['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>
