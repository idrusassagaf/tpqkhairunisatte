@php
$pdfLanguage = $language ?? 'id';

$labels = [
'id' => [
'title' => 'RINGKASAN EKSEKUTIF',
'data' => 'Data',
'jumlah' => 'Jumlah',
'santri' => 'Santri',
'guru' => 'Guru',
'orangTua' => 'Orang Tua',
'analisis' => 'Analisis Data',
'kesimpulan' => 'Kesimpulan',
'intro' => 'Berdasarkan data yang tersimpan dalam Sistem Informasi Manajemen TPQ Hairunissa, terdapat sebanyak',
'students' => 'santri yang didukung oleh',
'teachers' => 'guru.',
'ratioText' => 'Perbandingan jumlah santri dengan guru menunjukkan rasio rata-rata sebesar',
'ratioMeaning' => 'Artinya, secara rata-rata satu guru menangani sekitar',
'studentsBased' => 'santri berdasarkan jumlah data yang tercatat dalam sistem.',
'parentData' => 'Data orang tua yang tercatat dalam sistem berjumlah',
'parentCompare' => 'data. Jumlah tersebut setara dengan sekitar',
'comparedStudents' => 'dibandingkan dengan jumlah data santri.',
'conclusionText' => 'Secara keseluruhan, Ringkasan Eksekutif menggambarkan kondisi utama TPQ Hairunissa berdasarkan data santri, guru, dan orang tua yang tersimpan dalam sistem. Perbandingan jumlah santri dan guru memberikan gambaran mengenai kapasitas tenaga pengajar dalam mendukung proses pembelajaran, sedangkan data orang tua memberikan gambaran mengenai keterhubungan data keluarga dengan peserta didik. Data tersebut dapat menjadi dasar pemantauan kondisi kelembagaan, evaluasi pengelolaan, serta bahan pertimbangan dalam penyusunan program TPQ pada periode berikutnya. Seluruh angka dalam ringkasan ini dihasilkan secara otomatis berdasarkan data yang tersimpan dalam Sistem Informasi Manajemen TPQ Hairunissa.',
],
'en' => [
'title' => 'EXECUTIVE SUMMARY',
'data' => 'Data',
'jumlah' => 'Total',
'santri' => 'Students',
'guru' => 'Teachers',
'orangTua' => 'Parents',
'analisis' => 'Data Analysis',
'kesimpulan' => 'Conclusion',
'intro' => 'Based on the data stored in the TPQ Hairunissa Management Information System, there are',
'students' => 'students supported by',
'teachers' => 'teachers.',
'ratioText' => 'The comparison between the number of students and teachers shows an average ratio of',
'ratioMeaning' => 'This means that, on average, one teacher handles approximately',
'studentsBased' => 'students based on the data recorded in the system.',
'parentData' => 'The number of parent records stored in the system is',
'parentCompare' => 'records. This amount is equivalent to approximately',
'comparedStudents' => 'compared with the number of student records.',
'conclusionText' => 'Overall, the Executive Summary describes the main condition of TPQ Hairunissa based on the student, teacher, and parent data stored in the system. The comparison between the number of students and teachers provides an overview of the teaching staff capacity in supporting the learning process, while the parent data provides an overview of the connection between family data and students. This data can serve as a basis for monitoring institutional conditions, evaluating management, and considering the preparation of TPQ programs for the following period. All figures in this summary are generated automatically based on the data stored in the TPQ Hairunissa Management Information System.',
],
'ar' => [
'title' => 'الملخص التنفيذي',
'data' => 'البيانات',
'jumlah' => 'العدد',
'santri' => 'الطلاب',
'guru' => 'المعلمون',
'orangTua' => 'أولياء الأمور',
'analisis' => 'تحليل البيانات',
'kesimpulan' => 'الخلاصة',
'intro' => 'بناءً على البيانات المخزنة في نظام إدارة المعلومات في TPQ Hairunissa، يوجد',
'students' => 'من الطلاب الذين يشرف عليهم',
'teachers' => 'من المعلمين.',
'ratioText' => 'تُظهر المقارنة بين عدد الطلاب والمعلمين أن متوسط النسبة هو',
'ratioMeaning' => 'وهذا يعني أن المعلم الواحد يتولى في المتوسط مسؤولية حوالي',
'studentsBased' => 'من الطلاب وفقًا للبيانات المسجلة في النظام.',
'parentData' => 'يبلغ عدد بيانات أولياء الأمور المسجلة في النظام',
'parentCompare' => 'بيانات، وهو ما يعادل حوالي',
'comparedStudents' => 'مقارنة بعدد بيانات الطلاب.',
'conclusionText' => 'بشكل عام، يعرض الملخص التنفيذي الحالة الرئيسية لـ TPQ Hairunissa استنادًا إلى بيانات الطلاب والمعلمين وأولياء الأمور المخزنة في النظام. وتوفر المقارنة بين عدد الطلاب والمعلمين صورة عن قدرة الكادر التعليمي على دعم عملية التعلم، بينما توفر بيانات أولياء الأمور صورة عن ارتباط بيانات الأسرة بالطلاب. ويمكن أن تشكل هذه البيانات أساسًا لمتابعة الحالة المؤسسية وتقييم الإدارة والاستفادة منها في إعداد برامج TPQ للفترة القادمة. ويتم إنشاء جميع الأرقام الواردة في هذا الملخص تلقائيًا بناءً على البيانات المخزنة في نظام إدارة المعلومات في TPQ Hairunissa.',
],
];

$label = $labels[$pdfLanguage] ?? $labels['id'];

$totalSantri = collect($masterData['santri'])->count();
$totalGuru = collect($masterData['guru'])->count();
$totalOrangTua = collect($masterData['orang_tua'])->count();

$rasioSantriGuru = $totalGuru > 0
? round($totalSantri / $totalGuru, 2)
: 0;

$persenOrangTua = $totalSantri > 0
? round(($totalOrangTua / $totalSantri) * 100, 2)
: 0;
@endphp

<h2 style="text-align:center;">
    {{ $label['title'] }}
</h2>

<div style="
    text-align:justify;
    line-height:1.8;
    margin-bottom:20px;
">
    {!! str_contains($setting->narasi['ringkasan'] ?? '', '<') ? $setting->narasi['ringkasan'] : nl2br(e($setting->narasi['ringkasan'] ?? '')) !!}
</div>

{{-- =========================================================
     DATA RINGKASAN
     ========================================================= --}}

<table width="100%" border="1" cellspacing="0" cellpadding="6">
    <tr style="background:#eeeeee;">
        <th>
            {{ $label['data'] }}
        </th>
        <th width="120">
            {{ $label['jumlah'] }}
        </th>
    </tr>

    <tr>
        <td>
            {{ $label['santri'] }}
        </td>
        <td align="center">
            {{ $totalSantri }}
        </td>
    </tr>

    <tr>
        <td>
            {{ $label['guru'] }}
        </td>
        <td align="center">
            {{ $totalGuru }}
        </td>
    </tr>

    <tr>
        <td>
            {{ $label['orangTua'] }}
        </td>
        <td align="center">
            {{ $totalOrangTua }}
        </td>
    </tr>
</table>

<br>

{{-- =========================================================
     ANALISIS DATA
     ========================================================= --}}

<div style="margin-top:6px;">
    <p style="
        text-align:justify;
        line-height:1.6;
        margin:0;
    ">
        <b>{{ $label['analisis'] }}</b><br>

        {{ $label['intro'] }}
        <b>{{ $totalSantri }}</b>
        {{ $label['students'] }}
        <b>{{ $totalGuru }}</b>
        {{ $label['teachers'] }}

        {{ $label['ratioText'] }}
        <b>1 : {{ $rasioSantriGuru }}</b>.

        {{ $label['ratioMeaning'] }}
        <b>{{ $rasioSantriGuru }}</b>
        {{ $label['studentsBased'] }}

        <br>

        {{ $label['parentData'] }}
        <b>{{ $totalOrangTua }}</b>
        {{ $label['parentCompare'] }}
        <b>{{ $persenOrangTua }}%</b>
        {{ $label['comparedStudents'] }}
    </p>
</div>

{{-- =========================================================
     KESIMPULAN
     ========================================================= --}}

<div style="margin-top:4px;">
    <p style="
        text-align:justify;
        line-height:1.6;
        margin:0;
    ">
        <b>{{ $label['kesimpulan'] }}</b><br>
        {{ $label['conclusionText'] }}
    </p>
</div>

<div style="page-break-after: always;"></div>