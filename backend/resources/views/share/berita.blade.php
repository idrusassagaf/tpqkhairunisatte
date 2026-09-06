<!DOCTYPE html>
<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0">

    <title>{{ $berita->judul }}</title>

    <meta
        name="description"
        content="{{ $description }}">

    <!-- OPEN GRAPH -->

    <meta
        property="og:type"
        content="article">

    <meta
        property="og:title"
        content="{{ $berita->judul }}">

    <meta
        property="og:description"
        content="{{ $description }}">

    @if($imageUrl)

    <meta
        property="og:image"
        content="{{ $imageUrl }}">

    <meta
        property="og:image:alt"
        content="{{ $berita->judul }}">

    @endif

    <meta
        property="og:url"
        content="{{ request()->fullUrl() }}">

    <meta
        property="og:site_name"
        content="TPQ Khairunnisa">

    <!-- TWITTER / X -->

    <meta
        name="twitter:card"
        content="summary_large_image">

    <meta
        name="twitter:title"
        content="{{ $berita->judul }}">

    <meta
        name="twitter:description"
        content="{{ $description }}">

    @if($imageUrl)

    <meta
        name="twitter:image"
        content="{{ $imageUrl }}">

    @endif

    <!-- REDIRECT KE FRONTEND -->

    <meta
        http-equiv="refresh"
        content="0;url={{ $frontendUrl }}">

</head>

<body>

    <p>
        Membuka berita...
    </p>

    <p>
        <a href="{{ $frontendUrl }}">
            Buka berita
        </a>
    </p>

</body>

</html>