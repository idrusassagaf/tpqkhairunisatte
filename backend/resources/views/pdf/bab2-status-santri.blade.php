<h2>BAB II</h2>

<h3>STATUS SANTRI</h3>

<p style="text-align:justify; line-height:1.8;">

    {{ $setting->narasi['bab2'] ?? '' }}

</p>

<table>

    <tr>
        <th>Status</th>
        <th width="25%">Jumlah</th>
    </tr>

    @foreach($bab2['rekap'] as $item)

    <tr>
        <td>
            {{ $item['nama'] }}
        </td>

        <td align="center">
            {{ $item['jumlah'] }}
        </td>
    </tr>

    @endforeach

    <tr style="font-weight:bold;background:#f5f5f5;">

        <td>
            Total Santri
        </td>

        <td align="center">
            {{ $bab2['total'] }}
        </td>

    </tr>

</table>

{{-- =========================================================
     ANALISIS DATA
     ========================================================= --}}

<div style="margin-top:6px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab2['analysis'] ?? '') !!}
    </p>

</div>

{{-- =========================================================
     KESIMPULAN
     ========================================================= --}}

<div style="margin-top:4px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab2['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>