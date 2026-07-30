<h2 style="text-align:center;">
    RINGKASAN EKSEKUTIF
</h2>

<div style="
    text-align:justify;
    line-height:1.8;
    margin-bottom:20px;
">

    {!! $setting->narasi['ringkasan'] ?? '' !!}

</div>

<table width="100%" border="1" cellspacing="0" cellpadding="6">

    <tr style="background:#eeeeee;">
        <th>Data</th>
        <th width="120">Jumlah</th>
    </tr>

    <tr>
        <td>Santri</td>
        <td align="center">{{ count($masterData['santri']) }}</td>
    </tr>

    <tr>
        <td>Guru</td>
        <td align="center">{{ count($masterData['guru']) }}</td>
    </tr>

    <tr>
        <td>Orang Tua</td>
        <td align="center">{{ count($masterData['orang_tua']) }}</td>
    </tr>

    <tr>
        <td>Berita</td>
        <td align="center">{{ count($masterData['berita']) }}</td>
    </tr>

    <tr>
        <td>Pengumuman</td>
        <td align="center">{{ count($masterData['pengumuman']) }}</td>
    </tr>

    <tr>
        <td>Galeri</td>
        <td align="center">{{ count($masterData['galeri']) }}</td>
    </tr>

</table>

<div style="page-break-after: always;"></div>