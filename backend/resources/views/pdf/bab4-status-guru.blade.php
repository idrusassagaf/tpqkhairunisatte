<h2>BAB IV</h2>

<h3>PROFIL GURU</h3>

<p style="text-align:justify; line-height:1.8;">

    {{ $setting->narasi['bab4'] ?? '' }}

</p>

<table>

    <tr>
        <th>Keterangan</th>
        <th width="25%">Jumlah</th>
    </tr>

    <tr>
        <td>Total Guru</td>
        <td align="center">
            {{ $bab4['total'] }}
        </td>
    </tr>

    <tr>
        <td>Guru Laki-laki</td>
        <td align="center">
            {{ $bab4['guru_laki'] }}
        </td>
    </tr>

    <tr>
        <td>Guru Perempuan</td>
        <td align="center">
            {{ $bab4['guru_perempuan'] }}
        </td>
    </tr>

</table>

<br>

<h3>Rekap Pendidikan Guru</h3>

<table>

    <tr>
        <th>Pendidikan</th>
        <th width="25%">Jumlah</th>
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
            Total Guru
        </td>

        <td align="center">
            {{ $bab4['total'] }}
        </td>

    </tr>

</table>

<br>

<h3>Rekap Pekerjaan Guru</h3>

<table>

    <tr>
        <th>Pekerjaan</th>
        <th width="25%">Jumlah</th>
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
            Total Guru
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