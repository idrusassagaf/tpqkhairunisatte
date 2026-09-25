@php
$pdfLanguage = $language ?? 'id';

$labels = [
'id' => [
'title' => 'PENDAHULUAN',
],
'en' => [
'title' => 'INTRODUCTION',
],
'ar' => [
'title' => 'المقدمة',
],
];

$label = $labels[$pdfLanguage] ?? $labels['id'];
@endphp

<h2 style="text-align:center;">
    {{ $label['title'] }}
</h2>

<p style="text-align:justify; line-height:1.8;">
    {!! nl2br(e($setting->narasi['pendahuluan'] ?? '')) !!}
</p>

<hr>

<div style="page-break-after:always;"></div>