<div style="text-align:center;">

    {{-- Logo --}}
    <img src="{{ public_path('images/logo-tpq.png') }}"
        style="width:90px;margin-top:20px;">

    <div style="margin-top:18px;"></div>

    {{-- judul --}}
    <h1 style="
        color:#173b8b;
        font-size:28px;
        margin:0;
        font-weight:bold;
        letter-spacing:1px;
    ">
        LAPORAN RINGKAS
    </h1>

    <div style="
        font-size:20px;
        margin-top:8px;
        font-weight:bold;
        color:#173b8b;
    ">
        MANAJEMEN TPQ KHAIRUNISSA KOTA TERNATE
    </div>
</div>

<div style="margin-top:100px;">

    <div style="
        border-top:1px solid #999;
        border-bottom:1px solid #999;
        padding:20px 25px;
        text-align:center;
        line-height:1.8;
        font-size:14px;
    ">
        {!! $setting->narasi['cover'] ?? '' !!}
    </div>

</div>


<div style="
    margin-top:120px;
    text-align:center;
">

    <div style="
     margin-top:70px;
        font-size:15px;
        color:#666;
    ">
        Disusun berdasarkan
    </div>

    <div style="
        margin-top:10px;
        font-size:18px;
        font-weight:bold;
    ">
        Sistem Informasi Manajemen
    </div>

    <div style="
        font-size:16px;
        margin-top:4px;
    ">
        TPQ Khairunissa
    </div>

    <div style="
        margin-top:45px;
        font-size:15px;
        color:#555;
    ">
        Update Bulan {{ \Carbon\Carbon::now()->translatedFormat('F Y') }}
    </div>

</div>

<div style="page-break-after:always;"></div>