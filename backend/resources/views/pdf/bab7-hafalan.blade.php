<h2>BAB VII</h2>

<h3>PROGRES HAFALAN SANTRI</h3>

<p style="text-align:justify; line-height:1.8;">
    {{ $setting->narasi['bab7'] }}
</p>

<table>

    <tr>
        <th>Keterangan</th>
        <th width="25%">Jumlah</th>
    </tr>

    <tr>
        <td>Total Data Hafalan</td>
        <td align="center">
            {{ $progresHafalan->count() }}
        </td>
    </tr>

</table>

<br>

<h3>Rekapitulasi Progres Hafalan Santri</h3>

<table>

    <tr>
        <th width="8%">No</th>
        <th>Jenis Hafalan</th>
        <th width="15%">Lancar</th>
        <th width="15%">Belum</th>
        <th width="15%">Jumlah</th>
    </tr>

    @php
    $jenisHafalan = $progresHafalan
    ->pluck('jenis_hafalan')
    ->unique()
    ->sort()
    ->values();
    @endphp

    @foreach($jenisHafalan as $i => $jenis)

    @php
    $lancar = $progresHafalan
    ->where('jenis_hafalan', $jenis)
    ->where('progres', 'Lancar')
    ->count();

    $belum = $progresHafalan
    ->where('jenis_hafalan', $jenis)
    ->where('progres', 'Belum')
    ->count();
    @endphp

    <tr>

        <td align="center">{{ $i + 1 }}</td>

        <td>{{ $jenis }}</td>

        <td align="center">{{ $lancar }}</td>

        <td align="center">{{ $belum }}</td>

        <td align="center">{{ $lancar + $belum }}</td>

    </tr>

    @endforeach

</table>

<div style="page-break-after:always;"></div>