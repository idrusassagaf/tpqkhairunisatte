import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import MasterData from "./pages/MasterData";
import DataSantri from "./pages/datasantri";
import DataGuru from "./pages/databaseguru";
import ProgresIqra from "./pages/progresiqra";
import ProgresQuran from "./pages/progresquran";
import StatusGuru from "./pages/statusguru";
import MasterProgres from "./pages/MasterProgres";

import ProgresHafalan from "./pages/ProgresHafalan";
import ProgresHafalanSantri from "./pages/ProgresHafalanSantri";
import MasterHafalan from "./pages/MasterHafalan";
import RaportSantri from "./pages/RaportSantri";
import KehadiranSantri from "./pages/KehadiranSantri";
import KehadiranGuru from "./pages/KehadiranGuru";
import ScanAbsensi from "./pages/ScanAbsensi";
import KartuQRSantri from "./pages/KartuQRSantri";

import Berita from "./pages/Berita";
import Pengumuman from "./pages/Pengumuman";
import KalenderPengajian from "./pages/KalenderPengajian";
import Galeri from "./pages/Galeri";
import LaporanRingkas from "./pages/LaporanRingkas";

import ManagementUser from "./pages/ManagementUser";
import ManagementPassword from "./pages/ManagementPassword";
import PengaturanSistem from "./pages/PengaturanSistem";

import PublicLayout from "./public/PublicLayout";

import Home from "./public/Home";
import ProfilTPQ from "./public/ProfilTPQ";
import BeritaPublic from "./public/BeritaPublic";
import DetailBerita from "./public/DetailBerita";
import PengumumanPublic from "./public/PengumumanPublic";
import DetailPengumuman from "./public/DetailPengumuman";
import KalenderPublic from "./public/KalenderPublic";
import GaleriPublic from "./public/GaleriPublic";
import LaporanPublic from "./public/LaporanPublic";
import KontakPublic from "./public/KontakPublic";
import LoginAdmin from "./public/LoginAdmin";
import NotificationCenter from "./components/NotificationCenter";

const SITE_URL = "https://tpq-hairunnisa.site";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo-tpq.png`;

const seoMap = {
  "/": {
    title: "TPQ Hairunnisa | Taman Pendidikan Al-Qur'an Ternate",
    description:
      "TPQ Hairunnisa Ternate adalah lembaga pendidikan Al-Qur'an yang fokus pada pembelajaran Iqra, membaca Al-Qur'an, hafalan, dan pembinaan akhlak islami.",
    image: DEFAULT_OG_IMAGE,
  },
  "/profil": {
    title: "Profil TPQ Hairunnisa | Sejarah, Visi & Misi",
    description:
      "Kenali profil TPQ Hairunnisa Ternate, visi, misi, program unggulan, serta komitmen dalam membentuk generasi Qurani yang berakhlak.",
    image: DEFAULT_OG_IMAGE,
  },
  "/berita": {
    title: "Berita TPQ Hairunnisa | Informasi Terbaru",
    description:
      "Baca berita dan informasi terbaru seputar kegiatan, pembelajaran, dan aktivitas santri TPQ Hairunnisa Ternate.",
    image: DEFAULT_OG_IMAGE,
  },
  "/pengumuman": {
    title: "Pengumuman TPQ Hairunnisa",
    description:
      "Temukan pengumuman resmi, jadwal kegiatan, dan informasi penting bagi santri, guru, dan wali santri TPQ Hairunnisa.",
    image: DEFAULT_OG_IMAGE,
  },
  "/kalender": {
    title: "Kalender Kegiatan TPQ Hairunnisa",
    description:
      "Lihat kalender kegiatan dan jadwal pengajian TPQ Hairunnisa Ternate untuk kegiatan pembelajaran dan program islami.",
    image: DEFAULT_OG_IMAGE,
  },
  "/galeri": {
    title: "Galeri TPQ Hairunnisa | Dokumentasi Kegiatan",
    description:
      "Lihat galeri dokumentasi kegiatan santri TPQ Hairunnisa, mulai dari belajar Iqra, Al-Qur'an, hafalan, hingga kegiatan islami lainnya.",
    image: DEFAULT_OG_IMAGE,
  },
  "/laporan": {
    title: "Laporan TPQ Hairunnisa | Arsip Dokumentasi",
    description:
      "Akses laporan resmi, arsip dokumentasi, dan ringkasan kegiatan TPQ Hairunnisa Ternate secara lengkap.",
    image: DEFAULT_OG_IMAGE,
  },
  "/kontak": {
    title: "Kontak TPQ Hairunnisa | Hubungi Kami",
    description:
      "Hubungi TPQ Hairunnisa Ternate untuk informasi pendaftaran santri, jadwal, dan pertanyaan seputar kegiatan pembelajaran.",
    image: DEFAULT_OG_IMAGE,
  },
  "/login": {
    title: "Login Admin TPQ Hairunnisa",
    description:
      "Halaman login admin untuk mengelola data santri, guru, berita, pengumuman, dan kegiatan TPQ Hairunnisa.",
    image: DEFAULT_OG_IMAGE,
  },
};

function SeoUpdater() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    let match = seoMap[pathname] || seoMap["/"];

    if (pathname.startsWith("/berita/")) {
      match = {
        title: "Berita TPQ Hairunnisa | Informasi Terbaru",
        description:
          "Baca berita dan informasi terbaru seputar kegiatan, pembelajaran, dan aktivitas santri TPQ Hairunnisa Ternate.",
        image: DEFAULT_OG_IMAGE,
      };
    }

    if (pathname.startsWith("/pengumuman/")) {
      match = {
        title: "Pengumuman TPQ Hairunnisa",
        description:
          "Temukan pengumuman resmi, jadwal kegiatan, dan informasi penting bagi santri, guru, dan wali santri TPQ Hairunnisa.",
        image: DEFAULT_OG_IMAGE,
      };
    }

    const currentUrl = `${SITE_URL}${pathname}`;

    document.title = match.title;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "name", "description");
    setMeta('meta[name="description"]', "content", match.description);

    setMeta('meta[property="og:site_name"]', "property", "og:site_name");
    setMeta('meta[property="og:site_name"]', "content", "TPQ Hairunnisa");

    setMeta('meta[property="og:type"]', "property", "og:type");
    setMeta('meta[property="og:type"]', "content", "website");

    setMeta('meta[property="og:locale"]', "property", "og:locale");
    setMeta('meta[property="og:locale"]', "content", "id_ID");

    setMeta('meta[property="og:title"]', "property", "og:title");
    setMeta('meta[property="og:title"]', "content", match.title);

    setMeta('meta[property="og:description"]', "property", "og:description");
    setMeta('meta[property="og:description"]', "content", match.description);

    setMeta('meta[property="og:url"]', "property", "og:url");
    setMeta('meta[property="og:url"]', "content", currentUrl);

    setMeta('meta[property="og:image"]', "property", "og:image");
    setMeta('meta[property="og:image"]', "content", match.image);

    setMeta('meta[property="og:image:alt"]', "property", "og:image:alt");
    setMeta('meta[property="og:image:alt"]', "content", match.title);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card");
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");

    setMeta('meta[name="twitter:title"]', "name", "twitter:title");
    setMeta('meta[name="twitter:title"]', "content", match.title);

    setMeta('meta[name="twitter:description"]', "name", "twitter:description");
    setMeta('meta[name="twitter:description"]', "content", match.description);

    setMeta('meta[name="twitter:image"]', "name", "twitter:image");
    setMeta('meta[name="twitter:image"]', "content", match.image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <SeoUpdater />
      <NotificationCenter />
      <Routes>
        {/* =====================================================
            WEBSITE PUBLIC
        ====================================================== */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="profil" element={<ProfilTPQ />} />
          <Route path="berita" element={<BeritaPublic />} />
          <Route path="berita/:id" element={<DetailBerita />} />
          <Route path="pengumuman" element={<PengumumanPublic />} />
          <Route path="pengumuman/:id" element={<DetailPengumuman />} />
          <Route path="kalender" element={<KalenderPublic />} />
          <Route path="galeri" element={<GaleriPublic />} />
          <Route path="laporan" element={<LaporanPublic />} />
          <Route path="kontak" element={<KontakPublic />} />
          <Route path="login" element={<LoginAdmin />} />
        </Route>

        {/* =====================================================
            ADMIN / VIEWER AREA
            WAJIB LOGIN
        ====================================================== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="master-data" element={<MasterData />} />
          <Route path="master-progres" element={<MasterProgres />} />
          <Route path="master-hafalan" element={<MasterHafalan />} />

          <Route path="data-santri" element={<DataSantri />} />

          {/* ===================================================
              RAPORT SANTRI
          ==================================================== */}
          <Route path="raport-santri" element={<RaportSantri />} />

          <Route path="data-guru" element={<DataGuru />} />
          <Route path="kehadiran-santri" element={<KehadiranSantri />} />
          <Route path="kehadiran-guru" element={<KehadiranGuru />} />
          <Route path="scan-absensi" element={<ScanAbsensi />} />
          <Route path="kartu-qr-santri" element={<KartuQRSantri />} />

          <Route path="progres-iqra" element={<ProgresIqra />} />
          <Route path="progres-quran" element={<ProgresQuran />} />

          {/* ===================================================
              MASTER HAFALAN
          ==================================================== */}
          <Route
            path="master-hafalan/:nis"
            element={<ProgresHafalanSantri />}
          />

          {/* ===================================================
              PROGRES HAFALAN
          ==================================================== */}
          <Route path="progres-hafalan" element={<ProgresHafalan />} />

          <Route
            path="progres-hafalan/:nis"
            element={<ProgresHafalanSantri />}
          />

          {/* ===================================================
              INFORMASI
          ==================================================== */}
          <Route path="berita" element={<Berita />} />
          <Route path="pengumuman" element={<Pengumuman />} />
          <Route path="kalender-pengajian" element={<KalenderPengajian />} />
          <Route path="galeri" element={<Galeri />} />

          {/* ===================================================
              LAPORAN
          ==================================================== */}
          <Route path="laporan-ringkas" element={<LaporanRingkas />} />

          {/* ===================================================
              DATA GURU
          ==================================================== */}
          <Route path="status-guru" element={<StatusGuru />} />

          {/* ===================================================
              MANAGEMENT DATA
              Menu akan dibatasi berdasarkan Role di Sidebar.
              Proteksi API tetap dilakukan oleh AdminOnly.
          ==================================================== */}
          <Route path="management-user" element={<ManagementUser />} />

          <Route path="management-password" element={<ManagementPassword />} />

          <Route path="pengaturan-sistem" element={<PengaturanSistem />} />
        </Route>

        {/* =====================================================
            FALLBACK
            URL yang tidak dikenal dilempar ke beranda
        ====================================================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
