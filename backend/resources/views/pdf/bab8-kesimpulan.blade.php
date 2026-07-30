<div style="page-break-after:always;"></div>

<h2 align="center">
    BAB VIII
    <br>
    KESIMPULAN DAN STATISTIK TPQ
</h2>

<p style="text-align:justify; line-height:1.8;">
    {{ $setting->narasi['bab8'] }}
</p>

<table width="100%" border="1" cellspacing="0" cellpadding="5">

    <thead style="background:#e5e5e5;">

        <tr>
            <th width="5%">No</th>
            <th align="left">Informasi</th>
            <th width="25%">Hasil</th>
        </tr>

    </thead>

    <tbody>

        <tr>
            <td align="center">1</td>
            <td>Total Santri</td>
            <td align="center">{{ $totalSantri }}</td>
        </tr>

        <tr>
            <td align="center">2</td>
            <td>Total Guru</td>
            <td align="center">{{ $totalGuru }}</td>
        </tr>

        <tr>
            <td align="center">3</td>
            <td>Rasio Guru : Santri</td>
            <td align="center">{{ $rasioGuru }}</td>
        </tr>

        <tr>
            <td align="center">4</td>
            <td>Persentase Santri Iqra</td>
            <td align="center">{{ $persenIqra }} %</td>
        </tr>

        <tr>
            <td align="center">5</td>
            <td>Persentase Santri Al-Qur'an</td>
            <td align="center">{{ $persenQuran }} %</td>
        </tr>

        <tr>
            <td align="center">6</td>
            <td>Persentase Hafalan Lancar</td>
            <td align="center">{{ $persenHafalanLancar }} %</td>
        </tr>

        <tr>
            <td align="center">7</td>
            <td>Persentase Hafalan Belum</td>
            <td align="center">{{ $persenHafalanBelum }} %</td>
        </tr>

        <tr>
            <td align="center">8</td>
            <td>Persentase Progres Al-Qur'an Lancar</td>
            <td align="center">{{ $persenQuranLancar }} %</td>
        </tr>

        <tr>
            <td align="center">9</td>
            <td>Persentase Progres Iqra Lancar</td>
            <td align="center">{{ $persenIqraLancar }} %</td>
        </tr>

    </tbody>

</table>