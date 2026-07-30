<h2>BAB V</h2>

<h3>PROGRES PEMBELAJARAN IQRA</h3>

<p style="text-align:justify; line-height:1.8;">
    {{ $setting->narasi['bab5'] }}
</p>

<table>

    <tr>
        <th>Keterangan</th>
        <th width="25%">Jumlah</th>
    </tr>

    <tr>
        <td>Total Santri Iqra</td>
        <td align="center">
            {{ $masterData['santri']->where('kelas','Iqra')->count() }}
        </td>
    </tr>

</table>

<br>

<h3>Rekapitulasi Progres Iqra Santri</h3>

<table>

    <tr>
        <th width="10%">No</th>
        <th>Jilid</th>
        <th width="20%">Lancar</th>
        <th width="20%">Belum</th>
    </tr>

    @for($i = 1; $i <= 6; $i++)

        <tr>

        <td align="center">{{ $i }}</td>

        <td>Iqra {{ $i }}</td>

        <td align="center">
            {{ $progresIqra->where('jilid', "Iqra $i")->where('progres', 'Lancar')->count() }}
        </td>

        <td align="center">
            {{ $progresIqra->where('jilid', "Iqra $i")->where('progres', 'Belum')->count() }}
        </td>

        </tr>

        @endfor

</table>

<div style="page-break-after:always;"></div>