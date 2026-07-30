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
    </style>

</head>

<body>

    <main>

        @yield('content')

    </main>

</body>

</html>