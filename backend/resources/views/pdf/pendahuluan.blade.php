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

@include('pdf.partials.narasi', ['key' => 'pendahuluan'])

<hr>

<div style="page-break-after:always;"></div>