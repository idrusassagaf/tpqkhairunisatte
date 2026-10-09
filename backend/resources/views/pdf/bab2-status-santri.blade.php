@php
$pdfLanguage = $language ?? 'id';

$labels = [
'id' => [
'bab' => 'BAB II',
'title' => 'STATUS SANTRI',
'status' => 'Status',
'jumlah' => 'Jumlah',
'total_santri' => 'Total Santri',
],

'en' => [
'bab' => 'CHAPTER II',
'title' => 'STUDENT STATUS',
'status' => 'Status',
'jumlah' => 'Total',
'total_santri' => 'Total Students',
],

'ar' => [
'bab' => 'الفصل الثاني',
'title' => 'حالة الطلاب',
'status' => 'الحالة',
'jumlah' => 'العدد',
'total_santri' => 'إجمالي الطلاب',
],
];

$label = $labels[$pdfLanguage] ?? $labels['id'];
@endphp

<h2>{{ $label['bab'] }}</h2>

<h3>{{ $label['title'] }}</h3>

<p style="text-align:justify; line-height:1.8;">

    {!! str_contains($setting->narasi['bab2'] ?? '', '<') ? $setting->narasi['bab2'] : nl2br(e($setting->narasi['bab2'] ?? '')) !!}

</p>

<table>

    <tr>
        <th>{{ $label['status'] }}</th>
        <th width="25%">{{ $label['jumlah'] }}</th>
    </tr>

    @foreach($bab2['rekap'] as $item)

    <tr>
        <td>
            {{ $item['nama'] }}
        </td>

        <td align="center">
            {{ $item['jumlah'] }}
        </td>
    </tr>

    @endforeach

    <tr style="font-weight:bold;background:#f5f5f5;">

        <td>
            {{ $label['total_santri'] }}
        </td>

        <td align="center">
            {{ $bab2['total'] }}
        </td>

    </tr>

</table>

{{-- =========================================================
     ANALISIS DATA
     ========================================================= --}}

<div style="margin-top:6px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab2['analysis'] ?? '') !!}
    </p>

</div>

{{-- =========================================================
     KESIMPULAN
     ========================================================= --}}

<div style="margin-top:4px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab2['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>