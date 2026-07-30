@extends('pdf.layout')

@section('content')

@include('pdf.cover')

@include('pdf.pendahuluan')

@include('pdf.ringkasan')

@include('pdf.bab1-santri')

@include('pdf.bab2-status-santri')

@include('pdf.bab3-guru')

@include('pdf.bab4-status-guru')

@include('pdf.bab5-iqra')

@include('pdf.bab6-quran')

@include('pdf.bab7-hafalan')

@include('pdf.bab8-kesimpulan')

@include('pdf.penutup')

@endsection