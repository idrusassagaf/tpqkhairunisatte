<h2>BAB III</h2>

<h3>DATA GURU</h3>

<p style="text-align:justify; line-height:1.8;">
    {{ $setting->narasi['bab3'] }}
</p>

<table>

    <tr>
        <th width="8%">No</th>
        <th>Nama Guru</th>
        <th width="18%">NIG</th>
        <th width="18%">Jenis Kelamin</th>
        <th width="22%">Pekerjaan</th>
    </tr>

    @foreach($masterData['guru'] as $guru)

    <tr>

        <td align="center">
            {{ $loop->iteration }}
        </td>

        <td>
            {{ $guru->nama_guru }}
        </td>

        <td align="center">
            {{ $guru->nig }}
        </td>

        <td align="center">
            {{ $guru->jenis_kelamin }}
        </td>

        <td align="center">
            {{ $guru->pekerjaan }}
        </td>

    </tr>

    @endforeach

</table>

<div style="page-break-after:always;"></div>