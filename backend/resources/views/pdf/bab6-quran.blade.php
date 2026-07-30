<h2>BAB VI</h2>

<h3>PROGRES PEMBELAJARAN AL-QUR'AN</h3>

<p style="text-align:justify; line-height:1.8;">
    {{ $setting->narasi['bab6'] }}
</p>

<table>

    <tr>
        <th>Keterangan</th>
        <th width="25%">Jumlah</th>
    </tr>

    <tr>
        <td>Total Santri Al-Qur'an</td>
        <td align="center">
            {{ $masterData['santri']->where('kelas','Al Quran')->count() }}
        </td>
    </tr>

</table>

<br>

<h3>Rekapitulasi Progres Al-Qur'an Santri</h3>

<table>

    <tr>
        <th width="8%">No</th>
        <th width="15%">Juz</th>
        <th>Hal</th>
        <th width="10%">L</th>
        <th width="10%">B</th>
        <th width="12%">L+B</th>
    </tr>

    @php
    $no = 1;
    $dataJuz = $progresQuran->groupBy('juz');
    @endphp

    @foreach($dataJuz as $juz => $items)

    @php
    $halaman = $items
    ->pluck('halaman')
    ->filter()
    ->unique()
    ->sort()
    ->implode('-');

    $lancar = $items
    ->where('progres','Lancar')
    ->count();

    $belum = $items
    ->where('progres','Belum')
    ->count();
    @endphp

    <tr>

        <td align="center">{{ $no++ }}</td>

        <td align="center">Juz {{ $juz }}</td>

        <td align="center">{{ $halaman ?: '-' }}</td>

        <td align="center">{{ $lancar }}</td>

        <td align="center">{{ $belum }}</td>

        <td align="center">{{ $lancar + $belum }}</td>

    </tr>

    @endforeach

</table>

<div style="page-break-after:always;"></div>