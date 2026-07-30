penutup<div class="page-break"></div>

<h2 align="center">
    PENUTUP
</h2>

@if(!empty($setting->narasi['penutup']))
<p style="text-align:justify; line-height:1.8;">
    {!! nl2br(e($setting->narasi['penutup'])) !!}
</p>
@endif

@if(!empty($setting->penutup))
<p style="text-align:justify; line-height:1.8;">
    {!! nl2br(e($setting->penutup)) !!}
</p>
@endif

<br><br>

<div style="width:100%;">

    <div style="
        width:40%;
        float:right;
        text-align:center;
    ">

        <div>
            Ternate, {{ date('d F Y') }}
        </div>

        <div style="margin-top:15px;font-weight:bold;">
            Kepala TPQ Khairunissa
        </div>

        <div style="height:80px;"></div>

        <div style="
            width:170px;
            margin:0 auto;
            border-bottom:1px solid #000;
        "></div>

    </div>

    <div style="clear:both;"></div>

</div>