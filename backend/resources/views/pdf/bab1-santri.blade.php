<h2 style="text-align:left;">
    BAB I
</h2>

<h3 style="text-align:left;">
    DATA SANTRI
</h3>

{{-- ========================= --}}
{{-- Narasi Admin --}}
{{-- ========================= --}}

<p style="text-align:justify; line-height:1.8;">
    {!! $setting->narasi['bab1'] ?? '' !!}
</p>

{{-- ========================= --}}
{{-- Narasi Otomatis --}}
{{-- ========================= --}}

<p style="text-align:justify; line-height:1.8;">
    {!! $bab1['intro'] !!}
</p>

{{-- ========================= --}}
{{-- TABEL REKAP SANTRI --}}
{{-- ========================= --}}

<table width="100%" border="1" cellspacing="0" cellpadding="6">

    <thead>
        <tr style="background:#1e3a8a;color:white;">
            <th>Jenis Data</th>
            <th width="18%">Laki-laki</th>
            <th width="18%">Perempuan</th>
            <th width="18%">Jumlah</th>
        </tr>
    </thead>

    <tbody>

        @foreach($bab1['rekap'] as $r)

        <tr>
            <td>{{ $r['nama'] }}</td>

            <td align="center">
                {{ $r['l'] }}
            </td>

            <td align="center">
                {{ $r['p'] }}
            </td>

            <td align="center">
                {{ $r['j'] }}
            </td>
        </tr>

        @endforeach

        <tr style="font-weight:bold;background:#f3f4f6;">

            <td>
                Jumlah
            </td>

            <td align="center">
                {{ $bab1['totalL'] }}
            </td>

            <td align="center">
                {{ $bab1['totalP'] }}
            </td>

            <td align="center">
                {{ $bab1['total'] }}
            </td>

        </tr>

    </tbody>

</table>

{{-- ========================= --}}
{{-- Analisis Data --}}
{{-- ========================= --}}

<div style="margin-top:6px;">

    <p style="
        text-align:justify;
        line-height:1.6;
        margin:0;
    ">
        {!! str_replace('<br><br>', '<br>', $bab1['analysis'] ?? '') !!}
    </p>

</div>

{{-- ========================= --}}
{{-- Kesimpulan --}}
{{-- ========================= --}}

<div style="margin-top:4px;">

    <p style="
        text-align:justify;
        line-height:1.6;
        margin:0;
    ">
        {!! str_replace('<br><br>', '<br>', $bab1['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>