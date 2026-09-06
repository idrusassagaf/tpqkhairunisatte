<h2>BAB VIII</h2>

<h3>KESIMPULAN</h3>

<p style="text-align:justify; line-height:1.8;">

    {{ $setting->narasi['bab8'] }}

</p>

<table>

    <tr>
        <th>Keterangan</th>
        <th width="25%">Jumlah</th>
    </tr>

    <tr>
        <td>Jumlah Santri</td>

        <td align="center">
            {{ $bab8['totalSantri'] ?? $masterData['santri']->count() }}
        </td>
    </tr>

    <tr>
        <td>Jumlah Guru</td>

        <td align="center">
            {{ $bab8['totalGuru'] ?? $masterData['guru']->count() }}
        </td>
    </tr>

    <tr>
        <td>Rasio Santri / Guru</td>

        <td align="center">
            {{ $bab8['rasioGuru'] ?? '-' }}
        </td>
    </tr>

    <tr>
        <td>Data Progres Iqra</td>

        <td align="center">
            {{ $bab8['totalIqra'] ?? 0 }}
        </td>
    </tr>

    <tr>
        <td>Data Progres Al-Qur'an</td>

        <td align="center">
            {{ $bab8['totalQuran'] ?? 0 }}
        </td>
    </tr>

    <tr>
        <td>Data Progres Hafalan</td>

        <td align="center">
            {{ $bab8['totalHafalan'] ?? 0 }}
        </td>
    </tr>

</table>

<br>

<h3>Analisis Keseluruhan Data</h3>

{{-- =========================================================
     ANALISIS DATA BAB VIII
     ========================================================= --}}

<div style="margin-top:6px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab8['analysis'] ?? '') !!}
    </p>

</div>

{{-- =========================================================
     KESIMPULAN BAB VIII
     ========================================================= --}}

<div style="margin-top:4px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab8['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>