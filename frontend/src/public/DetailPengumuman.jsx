import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/hero-putih04.jpg";

import { ArrowLeft, CalendarDays, Download, FileText } from "lucide-react";

import jsPDF from "jspdf";

export default function DetailPengumuman() {
  const { id } = useParams();

  const [pengumuman, setPengumuman] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // LOAD DATA PENGUMUMAN
  // =========================================================

  const loadData = async () => {
    try {
      const res = await api.get("/pengumuman");

      const data = res.data.data || res.data;

      const item = data.find((p) => String(p.id) === String(id));

      setPengumuman(item);
    } catch (err) {
      console.error("Gagal mengambil data pengumuman:", err);
    }
  };

  // =========================================================
  // FUNGSI JUSTIFY UNTUK PDF
  // =========================================================
  //
  // jsPDF tidak mempunyai text-align: justify seperti CSS.
  //
  // Fungsi ini:
  // 1. Membagi teks menjadi kata.
  // 2. Menyusun kata menjadi baris.
  // 3. Menghitung lebar setiap baris.
  // 4. Menambah jarak antar kata.
  // 5. Membuat baris penuh dari margin kiri sampai kanan.
  //
  // Baris terakhir setiap paragraf tetap rata kiri.
  //
  // =========================================================

  const drawJustifiedText = (
    doc,
    text,
    x,
    y,
    maxWidth,
    lineHeight,
    pageHeight,
    bottomMargin,
  ) => {
    const paragraphs = String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split(/\n\s*\n/);

    let currentY = y;

    paragraphs.forEach((paragraph, paragraphIndex) => {
      const cleanParagraph = paragraph
        .replace(/\s*\n\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleanParagraph) {
        currentY += lineHeight;
        return;
      }

      const words = cleanParagraph.split(" ");

      let lines = [];
      let currentLine = [];

      words.forEach((word) => {
        const testLine =
          currentLine.length === 0 ? word : `${currentLine.join(" ")} ${word}`;

        const testWidth = doc.getTextWidth(testLine);

        if (testWidth <= maxWidth || currentLine.length === 0) {
          currentLine.push(word);
        } else {
          lines.push(currentLine);
          currentLine = [word];
        }
      });

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      // =====================================================
      // CETAK SETIAP BARIS
      // =====================================================

      lines.forEach((lineWords, lineIndex) => {
        // ===================================================
        // CEK BATAS BAWAH HALAMAN
        // ===================================================

        if (currentY > pageHeight - bottomMargin) {
          doc.addPage();

          currentY = 20;
        }

        // ===================================================
        // BARIS TERAKHIR
        // ===================================================
        //
        // Baris terakhir paragraf tidak dipaksa justify.
        //
        // ===================================================

        const isLastLine = lineIndex === lines.length - 1;

        if (isLastLine || lineWords.length === 1) {
          doc.text(lineWords.join(" "), x, currentY);
        } else {
          // =================================================
          // HITUNG LEBAR KATA
          // =================================================

          let totalWordWidth = 0;

          lineWords.forEach((word) => {
            totalWordWidth += doc.getTextWidth(word);
          });

          // =================================================
          // HITUNG JARAK ANTAR KATA
          // =================================================

          const jumlahSpasi = lineWords.length - 1;

          const extraSpace = (maxWidth - totalWordWidth) / jumlahSpasi;

          // =================================================
          // CETAK KATA SATU PER SATU
          // =================================================

          let posisiX = x;

          lineWords.forEach((word, wordIndex) => {
            doc.text(word, posisiX, currentY);

            posisiX += doc.getTextWidth(word);

            if (wordIndex < lineWords.length - 1) {
              posisiX += extraSpace;
            }
          });
        }

        currentY += lineHeight;
      });

      // =====================================================
      // JARAK ANTAR PARAGRAF
      // =====================================================

      if (paragraphIndex < paragraphs.length - 1) {
        currentY += 4;
      }
    });

    return currentY;
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadPDF = () => {
    try {
      if (!pengumuman) {
        alert("Data pengumuman belum tersedia.");
        return;
      }

      // =====================================================
      // TANGGAL REALTIME SAAT DOWNLOAD
      // =====================================================

      const sekarang = new Date();

      const tanggalUpdate = sekarang.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // =====================================================
      // BUAT PDF A4 PORTRAIT
      // =====================================================

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      const pageHeight = doc.internal.pageSize.getHeight();

      const centerX = pageWidth / 2;

      // =====================================================
      // HEADER
      // =====================================================

      doc.setFont("helvetica", "bold");

      doc.setFontSize(16);

      doc.text("TPQ KHAIRUNNISSA TERNATE", centerX, 15, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");

      doc.setFontSize(10);

      doc.text("Membentuk Generasi Quran'i Berakhlak", centerX, 21, {
        align: "center",
      });

      doc.setDrawColor(180, 180, 180);

      doc.line(20, 26, pageWidth - 20, 26);

      // =====================================================
      // JUDUL DOKUMEN
      // =====================================================

      doc.setFont("helvetica", "bold");

      doc.setFontSize(15);

      doc.text("PENGUMUMAN", centerX, 40, {
        align: "center",
      });

      // =====================================================
      // STATUS
      // =====================================================

      doc.setFont("helvetica", "bold");

      doc.setFontSize(9);

      doc.text(`Status: ${pengumuman.status || "-"}`, 20, 51);

      // =====================================================
      // JUDUL PENGUMUMAN
      // =====================================================

      doc.setFont("helvetica", "bold");

      doc.setFontSize(13);

      const judulPengumuman = pengumuman.judul || "-";

      const judulLines = doc.splitTextToSize(judulPengumuman, pageWidth - 40);

      let posisiY = 62;

      doc.text(judulLines, 20, posisiY);

      posisiY += judulLines.length * 6 + 4;

      // =====================================================
      // TANGGAL BERLAKU
      // =====================================================

      doc.setFont("helvetica", "normal");

      doc.setFontSize(9);

      doc.text(
        `Berlaku sampai: ${pengumuman.tanggal_berakhir || "-"}`,
        20,
        posisiY,
      );

      posisiY += 10;

      // =====================================================
      // GARIS PEMBATAS
      // =====================================================

      doc.setDrawColor(210, 210, 210);

      doc.line(20, posisiY, pageWidth - 20, posisiY);

      posisiY += 9;

      // =====================================================
      // ISI PENGUMUMAN
      // =====================================================

      doc.setFont("helvetica", "normal");

      doc.setFontSize(10);

      const isiPengumuman = pengumuman.isi || "-";

      posisiY = drawJustifiedText(
        doc,
        isiPengumuman,
        20,
        posisiY,
        pageWidth - 40,
        5.5,
        pageHeight,
        20,
      );

      // =====================================================
      // FOOTER REALTIME
      // =====================================================

      const jumlahHalaman = doc.internal.getNumberOfPages();

      for (let halaman = 1; halaman <= jumlahHalaman; halaman++) {
        doc.setPage(halaman);

        doc.setFont("helvetica", "normal");

        doc.setFontSize(7);

        doc.setTextColor(100, 100, 100);

        doc.text(
          `TPQ Khairunissa • Pengumuman • Update ${tanggalUpdate} • Halaman ${halaman}`,
          centerX,
          pageHeight - 7,
          {
            align: "center",
          },
        );

        doc.setTextColor(0, 0, 0);
      }

      // =====================================================
      // NAMA FILE PDF
      // =====================================================

      const namaFile = `pengumuman-${String(pengumuman.judul || "tpq")
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")}.pdf`;

      // =====================================================
      // SIMPAN PDF
      // =====================================================

      doc.save(namaFile);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);

      alert("PDF gagal dibuat. Silakan cek Console browser.");
    }
  };

  // =========================================================
  // JIKA DATA BELUM DITEMUKAN
  // =========================================================

  if (!pengumuman) {
    return <div className="p-10 text-center">Pengumuman tidak ditemukan</div>;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="bg-[#f8faf8] min-h-screen">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section
        className="
          relative
          overflow-hidden
          pt-8
          md:pt-10
          pb-8
        "
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10"></div>

        <div
          className="
            relative
            z-10
            max-w-5xl
            mx-auto
            px-4
            md:px-6
          "
        >
          {/* =================================================
              TOMBOL
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-3
              flex-wrap
            "
          >
            {/* =================================================
                KEMBALI
            ================================================= */}

            <Link
              to="/web/pengumuman"
              className="
                inline-flex
                items-center
                gap-2
                bg-white/35
                backdrop-blur-md
                border
                border-white/30
                px-5
                py-3
                rounded-full
                shadow-lg
                transition
                text-green-700
                font-medium
                hover:bg-white/45
              "
            >
              <ArrowLeft size={18} />
              Kembali ke Pengumuman
            </Link>

            {/* =================================================
                DOWNLOAD PDF
            ================================================= */}

            <button
              type="button"
              onClick={downloadPDF}
              className="
                inline-flex
                items-center
                gap-2
                bg-white/35
                backdrop-blur-md
                border
                border-white/30
                px-5
                py-3
                rounded-full
                shadow-lg
                transition
                text-green-700
                font-medium
                hover:bg-white/45
              "
            >
              <Download size={18} />
              Download PDF
              <FileText size={17} />
            </button>
          </div>

          {/* =================================================
              CARD PENGUMUMAN
          ================================================= */}

          <div
            className="
              bg-white/35
              border
              border-white/30
              rounded-3xl
              shadow-lg
              mt-6
              p-5
              md:p-8
            "
          >
            {/* =================================================
                STATUS
            ================================================= */}

            <div className="mb-6">
              <span
                className="
                  inline-block
                  bg-white/60
                  backdrop-blur-sm
                  text-green-700
                  px-4
                  py-2
                  rounded-full
                  text-xs
                  font-semibold
                "
              >
                {pengumuman.status}
              </span>
            </div>

            {/* =================================================
                JUDUL
            ================================================= */}

            <h1
              className="
                text-2xl
                md:text-4xl
                font-bold
                text-green-800
                leading-tight
              "
            >
              {pengumuman.judul}
            </h1>

            {/* =================================================
                TANGGAL
            ================================================= */}

            <div
              className="
                flex
                items-center
                gap-2
                text-gray-600
                text-sm
                mt-3
                mb-5
              "
            >
              <CalendarDays size={18} />
              Berlaku sampai: {pengumuman.tanggal_berakhir}
            </div>

            {/* =================================================
                ISI PENGUMUMAN PUBLIC
            ================================================= */}

            <div
              className="
                text-gray-700
                text-sm
                md:text-base
                leading-7
                w-full
              "
              style={{
                textAlign: "justify",
              }}
            >
              {(pengumuman.isi || "-")
                .split(/\n\s*\n/)
                .map((paragraf, index) => {
                  const teksParagraf = paragraf
                    .trim()
                    .replace(/\s*\n\s*/g, " ");

                  return (
                    <p
                      key={index}
                      className="
                          mb-4
                          w-full
                        "
                      style={{
                        textAlign: "justify",
                      }}
                    >
                      {teksParagraf}
                    </p>
                  );
                })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
