@php
$pdfLanguage = $language ?? 'id';

$labels = [
'id' => [
'bab' => 'BAB III',
'title' => 'DATA GURU',
'no' => 'No',
'nama_guru' => 'Nama Guru',
'nig' => 'NIG',
'jenis_kelamin' => 'Jenis Kelamin',
'pekerjaan' => 'Pekerjaan',
],

'en' => [
'bab' => 'CHAPTER III',
'title' => 'TEACHER DATA',
'no' => 'No',
'nama_guru' => 'Teacher Name',
'nig' => 'NIG',
'jenis_kelamin' => 'Gender',
'pekerjaan' => 'Occupation',
],

'ar' => [
'bab' => 'الفصل الثالث',
'title' => 'بيانات المعلمين',
'no' => 'الرقم',
'nama_guru' => 'اسم المعلم',
'nig' => 'NIG',
'jenis_kelamin' => 'الجنس',
'pekerjaan' => 'المهنة',
],
];

$label = $labels[$pdfLanguage] ?? $labels['id'];
@endphp

<h2>{{ $label['bab'] }}</h2>

<h3>{{ $label['title'] }}</h3>

<p style="text-align:justify; line-height:1.8;">

    {!! $setting->narasi['bab3'] ?? '' !!}

</p>

<table>

    <tr>
        <th width="8%">{{ $label['no'] }}</th>
        <th>{{ $label['nama_guru'] }}</th>
        <th width="18%">{{ $label['nig'] }}</th>
        <th width="18%">{{ $label['jenis_kelamin'] }}</th>
        <th width="22%">{{ $label['pekerjaan'] }}</th>
    </tr>

    @foreach($masterData['guru'] as $guru)

    <tr>

        <td align="center">
            {{ $loop->iteration }}
        </td>

        <td>
            {{ $guru->nama_guru }}
        </td>

        <td align="center">
            {{ $guru->nig }}
        </td>

        <td align="center">
            {{ $guru->jenis_kelamin }}
        </td>

        <td align="center">
            {{ $guru->pekerjaan }}
        </td>

    </tr>

    @endforeach

</table>

{{-- =========================================================
     ANALISIS DATA
     ========================================================= --}}

<div style="margin-top:6px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab3['analysis'] ?? '') !!}
    </p>

</div>

{{-- =========================================================
     KESIMPULAN
     ========================================================= --}}

<div style="margin-top:4px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab3['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>