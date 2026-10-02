import { Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
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
        <Route path="master-hafalan/:nis" element={<ProgresHafalanSantri />} />

        {/* ===================================================
            PROGRES HAFALAN
        ==================================================== */}
        <Route path="progres-hafalan" element={<ProgresHafalan />} />

        <Route path="progres-hafalan/:nis" element={<ProgresHafalanSantri />} />

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
  );
}
