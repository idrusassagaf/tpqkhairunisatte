@php
$pdfLanguage = $language ?? 'id';

$labels = [
'id' => [
'bab' => 'BAB IV',
'title' => 'PROFIL GURU',
'keterangan' => 'Keterangan',
'jumlah' => 'Jumlah',
'total_guru' => 'Total Guru',
'guru_laki' => 'Guru Laki-laki',
'guru_perempuan' => 'Guru Perempuan',
'rekap_pendidikan' => 'Rekap Pendidikan Guru',
'pendidikan' => 'Pendidikan',
'rekap_pekerjaan' => 'Rekap Pekerjaan Guru',
'pekerjaan' => 'Pekerjaan',
],

'en' => [
'bab' => 'CHAPTER IV',
'title' => 'TEACHER PROFILE',
'keterangan' => 'Description',
'jumlah' => 'Total',
'total_guru' => 'Total Teachers',
'guru_laki' => 'Male Teachers',
'guru_perempuan' => 'Female Teachers',
'rekap_pendidikan' => 'Teacher Education Summary',
'pendidikan' => 'Education',
'rekap_pekerjaan' => 'Teacher Occupation Summary',
'pekerjaan' => 'Occupation',
],

'ar' => [
'bab' => 'الفصل الرابع',
'title' => 'ملف المعلمين',
'keterangan' => 'البيان',
'jumlah' => 'العدد',
'total_guru' => 'إجمالي المعلمين',
'guru_laki' => 'المعلمون الذكور',
'guru_perempuan' => 'المعلمات',
'rekap_pendidikan' => 'ملخص تعليم المعلمين',
'pendidikan' => 'التعليم',
'rekap_pekerjaan' => 'ملخص مهن المعلمين',
'pekerjaan' => 'المهنة',
],
];

$label = $labels[$pdfLanguage] ?? $labels['id'];
@endphp

<h2>{{ $label['bab'] }}</h2>

<h3>{{ $label['title'] }}</h3>

<p style="text-align:justify; line-height:1.8;">

    {!! $setting->narasi['bab4'] ?? '' !!}

</p>

<table>

    <tr>
        <th>{{ $label['keterangan'] }}</th>
        <th width="25%">{{ $label['jumlah'] }}</th>
    </tr>

    <tr>
        <td>{{ $label['total_guru'] }}</td>
        <td align="center">
            {{ $bab4['total'] }}
        </td>
    </tr>

    <tr>
        <td>{{ $label['guru_laki'] }}</td>
        <td align="center">
            {{ $bab4['guru_laki'] }}
        </td>
    </tr>

    <tr>
        <td>{{ $label['guru_perempuan'] }}</td>
        <td align="center">
            {{ $bab4['guru_perempuan'] }}
        </td>
    </tr>

</table>

<br>

<h3>{{ $label['rekap_pendidikan'] }}</h3>

<table>

    <tr>
        <th>{{ $label['pendidikan'] }}</th>
        <th width="25%">{{ $label['jumlah'] }}</th>
    </tr>

    @foreach($bab4['rekap_pendidikan'] as $item)

    <tr>

        <td>
            {{ $item['nama'] }}
        </td>

        <td align="center">
            {{ $item['jumlah'] }}
        </td>

    </tr>

    @endforeach

    <tr style="font-weight:bold; background:#f5f5f5;">

        <td>
            {{ $label['total_guru'] }}
        </td>

        <td align="center">
            {{ $bab4['total'] }}
        </td>

    </tr>

</table>

<br>

<h3>{{ $label['rekap_pekerjaan'] }}</h3>

<table>

    <tr>
        <th>{{ $label['pekerjaan'] }}</th>
        <th width="25%">{{ $label['jumlah'] }}</th>
    </tr>

    @foreach($bab4['rekap_pekerjaan'] as $item)

    <tr>

        <td>
            {{ $item['nama'] }}
        </td>

        <td align="center">
            {{ $item['jumlah'] }}
        </td>

    </tr>

    @endforeach

    <tr style="font-weight:bold; background:#f5f5f5;">

        <td>
            {{ $label['total_guru'] }}
        </td>

        <td align="center">
            {{ $bab4['total'] }}
        </td>

    </tr>

</table>

{{-- =========================================================
     ANALISIS DATA
     ========================================================= --}}

<div style="margin-top:6px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab4['analysis'] ?? '') !!}
    </p>

</div>

{{-- =========================================================
     KESIMPULAN
     ========================================================= --}}

<div style="margin-top:4px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab4['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>