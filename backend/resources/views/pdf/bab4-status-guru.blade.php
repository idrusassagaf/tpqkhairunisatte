<h2>BAB IV</h2>

<h3>PROFIL GURU</h3>

<p style="text-align:justify; line-height:1.8;">
    {{ $setting->narasi['bab4'] }}
</p>

<table>

    <tr>
        <th>Keterangan</th>
        <th width="25%">Jumlah</th>
    </tr>

    <tr>
        <td>Total Guru</td>
        <td align="center">
            {{ $masterData['guru']->count() }}
        </td>
    </tr>

    <tr>
        <td>Guru Laki-laki</td>
        <td align="center">
            {{ $masterData['guru']->where('jenis_kelamin','L')->count() }}
        </td>
    </tr>

    <tr>
        <td>Guru Perempuan</td>
        <td align="center">
            {{ $masterData['guru']->where('jenis_kelamin','P')->count() }}
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

    @foreach($masterData['guru']->groupBy('pendidikan') as $pendidikan => $guru)

    <tr>
        <td>{{ $pendidikan ?: '-' }}</td>
        <td align="center">{{ $guru->count() }}</td>
    </tr>

    @endforeach

</table>

<br>

<h3>Rekap Pekerjaan Guru</h3>

<table>

    <tr>
        <th>Pekerjaan</th>
        <th width="25%">Jumlah</th>
    </tr>

    @foreach($masterData['guru']->groupBy('pekerjaan') as $pekerjaan => $guru)

    <tr>
        <td>{{ $pekerjaan ?: '-' }}</td>
        <td align="center">{{ $guru->count() }}</td>
    </tr>

    @endforeach

</table>

<div style="page-break-after:always;"></div>