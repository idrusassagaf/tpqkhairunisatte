<h2>BAB II</h2>

<h3>STATUS SANTRI</h3>

<p style="text-align:justify; line-height:1.8;">
    {{ $setting->narasi['bab2'] }}
</p>

<table>

    <tr>
        <th>Status</th>
        <th width="25%">Jumlah</th>
    </tr>

    <tr>
        <td>Santunan OT</td>
        <td align="center">
            {{ $masterData['santri']->where('status_orangtua','keduanya_hidup')->count() }}
        </td>
    </tr>

    <tr>
        <td>Anak Yatim</td>
        <td align="center">
            {{ $masterData['santri']->where('status_orangtua','ayah_wafat')->count() }}
        </td>
    </tr>

    <tr>
        <td>Anak Piatu</td>
        <td align="center">
            {{ $masterData['santri']->where('status_orangtua','ibu_wafat')->count() }}
        </td>
    </tr>

    <tr>
        <td>Yatim Piatu</td>
        <td align="center">
            {{ $masterData['santri']->where('status_orangtua','keduanya_wafat')->count() }}
        </td>
    </tr>

    <tr style="font-weight:bold;background:#f5f5f5;">
        <td>Total Santri</td>
        <td align="center">
            {{ $masterData['santri']->count() }}
        </td>
    </tr>

</table>

<div style="page-break-after:always;"></div>