<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">

    <style>
        @page {
            margin: 25mm 20mm;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            color: #222;
            font-size: 12px;
            line-height: 1.6;
        }

        header {
            position: fixed;
            top: -18mm;
            left: 0;
            right: 0;
            height: 15mm;
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 5px;
        }

        footer {
            position: fixed;
            bottom: -15mm;
            left: 0;
            right: 0;

            font-size: 10px;
            color: #444;
        }

        .footer-table {
            width: 100%;
            border: none;
            border-collapse: collapse;
        }

        .footer-table td {
            border: none;
            padding: 0;
        }

        .footer-left {
            text-align: left;
        }

        .footer-right {
            text-align: right;
        }

        h1 {
            margin: 0;
            font-size: 22px;
        }

        h2 {
            margin-top: 8px;
            color: #0f172a;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #bbb;
            padding: 8px;
        }

        th {
            background: #1e3a8a;
            color: #ffffff;
            font-weight: bold;
            text-align: center;
        }


        .page-break {
            page-break-after: always;
        }
        /* =====================================================
           NARASI DARI TINYMCE (ikuti format editor)
        ===================================================== */

        .narasi {
            line-height: 1.8;
        }

        .narasi p {
            margin: 0 0 8px 0;
        }

        .narasi ul,
        .narasi ol {
            margin: 0 0 8px 0;
            padding-left: 22px;
        }

        .narasi ul {
            list-style-type: disc;
        }

        .narasi ol {
            list-style-type: decimal;
        }

        .narasi li {
            margin-bottom: 3px;
        }

        .narasi h1,
        .narasi h2,
        .narasi h3,
        .narasi h4,
        .narasi h5,
        .narasi h6 {
            border: none;
            padding: 0;
            margin: 10px 0 6px 0;
            color: #0f172a;
        }

        .narasi h1 { font-size: 18px; }
        .narasi h2 { font-size: 16px; }
        .narasi h3 { font-size: 14px; }
        .narasi h4 { font-size: 13px; }
        .narasi h5,
        .narasi h6 { font-size: 12px; }

        .narasi strong,
        .narasi b {
            font-weight: bold;
        }

        .narasi em,
        .narasi i {
            font-style: italic;
        }

        .narasi u {
            text-decoration: underline;
        }

        .narasi a {
            color: #2563eb;
            text-decoration: underline;
        }

        .narasi img {
            max-width: 100%;
            height: auto;
        }

        .narasi pre {
            white-space: pre-wrap;
            font-family: DejaVu Sans Mono, monospace;
            font-size: 11px;
        }
    </style>

</head>

<body>

    <main>

        @yield('content')

    </main>

</body>

</html>
