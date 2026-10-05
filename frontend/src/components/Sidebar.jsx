import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Database,
  UserRound,
  Newspaper,
  Bell,
  CalendarDays,
  Images,
  BarChart3,
  BookOpen,
  BookMarked,
  FileText,
  ChevronDown,
  ChevronRight,
  CircleUser,
  UserCog,
  Settings,
  User,
  ClipboardCheck,
  QrCode,
  CreditCard,
} from "lucide-react";

import { useEffect, useState } from "react";

import { api } from "../api";
import { Skeleton } from "./Skeleton";

export default function Sidebar({ open, setOpen }) {
  // =========================================================
  // ROLE USER LOGIN
  // =========================================================

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Gagal membaca data user:", error);
      return null;
    }
  });

  const role = user?.role || "Viewer";
  const isAdmin = role === "Admin";

  // =========================================================
  // MENU UTAMA
  // =========================================================

  const menu = [
    {
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          to: "/dashboard",
        },

        // =====================================================
        // MASTER MENU — HANYA ADMIN
        // =====================================================

        ...(isAdmin
          ? [
              {
                name: "Master Progres",
                icon: Database,
                to: "/dashboard/master-progres",
              },
              {
                name: "Jenis Hafalan",
                icon: BookOpen,
                to: "/dashboard/jenis-hafalan",
              },
            ]
          : []),
      ],
    },

    {
      label: "DATA SANTRI",
      items: [
        {
          name: "Database Santri",
          icon: Users,
          to: "/dashboard/data-santri",
        },
        {
          name: "Raport Santri",
          icon: FileText,
          to: "/dashboard/raport-santri",
        },
        {
          name: "Progres Iqra",
          icon: BookOpen,
          to: "/dashboard/progres-iqra",
        },
        {
          name: "Progres Qur'an",
          icon: BookMarked,
          to: "/dashboard/progres-quran",
        },
        {
          name: "Progres Hafalan",
          icon: BarChart3,
          to: "/dashboard/progres-hafalan",
        },
      ],
    },

    {
      label: "DATA GURU",
      items: [
        {
          name: "Database Guru",
          icon: UserRound,
          to: "/dashboard/data-guru",
        },
        {
          name: "Status & Gaji Guru",
          icon: CircleUser,
          to: "/dashboard/status-guru",
        },
      ],
    },
  ];

  // =========================================================
  // STATE DROPDOWN
  // =========================================================

  const [openSantri, setOpenSantri] = useState(true);
  const [openGuru, setOpenGuru] = useState(true);
  const [openAbsensi, setOpenAbsensi] = useState(true);
  const [openInformasi, setOpenInformasi] = useState(true);
  const [openLaporan, setOpenLaporan] = useState(true);
  const [openManagement, setOpenManagement] = useState(true);

  // =========================================================
  // JUMLAH DATA
  // =========================================================

  const [countSantri, setCountSantri] = useState(0);
  const [countGuru, setCountGuru] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  // =========================================================
  // REFRESH USER ROLE
  // =========================================================

  useEffect(() => {
    const refreshUser = () => {
      try {
        const savedUser = localStorage.getItem("user");
        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch (error) {
        console.error("Gagal membaca role user:", error);
        setUser(null);
      }
    };

    window.addEventListener("storage", refreshUser);
    window.addEventListener("tpq-user-updated", refreshUser);

    return () => {
      window.removeEventListener("storage", refreshUser);
      window.removeEventListener("tpq-user-updated", refreshUser);
    };
  }, []);

  // =========================================================
  // AMBIL JUMLAH SANTRI & GURU
  // =========================================================

  const fetchCounts = async () => {
    try {
      const res = await api.get("/master-data");

      const santri = res?.data?.data?.santri || [];
      const guru = res?.data?.data?.guru || [];

      setCountSantri(santri.length);
      setCountGuru(guru.length);
    } catch (err) {
      console.error("Gagal ambil count:", err);
    } finally {
      setLoadingCount(false);
    }
  };

  // =========================================================
  // FOTO USER
  // =========================================================

  const getUserPhoto = () => {
    if (!user?.foto) {
      return null;
    }

    // Jika API sudah mengirim URL lengkap
    if (user.foto.startsWith("http://") || user.foto.startsWith("https://")) {
      return user.foto;
    }

    // Jika hanya path foto dari backend
    return `${api.defaults.baseURL.replace(
      /\/api\/?$/,
      "",
    )}/storage/${user.foto.replace(/^\/+/, "")}`;
  };

  const userPhoto = getUserPhoto();

  const handleMenuClick = (e) => {
    if (window.innerWidth < 768 && e.target.closest("a")) {
      setOpen(false);
    }
  };

  // =========================================================
  // TOOLTIP
  // =========================================================

  const tooltipClass =
    "absolute left-14 bg-gray-200 text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition shadow z-50";

  // =========================================================
  // STYLE MENU
  // =========================================================

  const navItemClass = ({ isActive }, sidebarOpen) => {
    return `
      group relative flex items-center
      ${sidebarOpen ? "gap-3 px-3" : "justify-center px-0"}
      py-2 rounded-xl text-sm font-medium
      transition-all duration-200
      ${
        isActive
          ? "bg-white/80 text-purple-700 shadow-sm ring-1 ring-purple-100"
          : "text-gray-700 hover:bg-white/60 hover:text-gray-900"
      }
    `;
  };

  const sectionBtnClass = (sidebarOpen) => `
    relative group
    flex items-center
    ${sidebarOpen ? "justify-between px-3" : "justify-center"}
    w-full
    py-2 mt-3
    text-[11px] font-semibold uppercase tracking-[0.18em]
    text-gray-500 hover:text-purple-700
    transition
  `;

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div
      className={`
        fixed left-0 top-14 md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] border-r z-40
        transition-all duration-300 overflow-hidden
        ${open ? "w-64" : "w-0 md:w-16"}
      `}
      style={{
        backgroundImage: "url('/bg-islamic.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* =====================================================
          OVERLAY
      ====================================================== */}

      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />

      {/* =====================================================
          ISI SIDEBAR
      ====================================================== */}

      <div
        className={`
          relative z-10 h-full overflow-y-auto
          ${!open ? "hidden md:block" : ""}
        `}
      >
        {/* ===================================================
            MENU
        ==================================================== */}

        <nav className="flex flex-col gap-0.5 p-3" onClick={handleMenuClick}>
          {/* =================================================
              DASHBOARD + MASTER
          ================================================== */}

          {menu[0].items.map((item, i) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={i}
                to={item.to}
                end={item.to === "/dashboard"}
                className={(props) => navItemClass(props, open)}
              >
                <Icon size={18} />

                {open ? (
                  <span>{item.name}</span>
                ) : (
                  <span className={tooltipClass}>{item.name}</span>
                )}
              </NavLink>
            );
          })}

          {/* =================================================
              DATA SANTRI
          ================================================== */}

          <button
            type="button"
            onClick={() => setOpenSantri(!openSantri)}
            className={sectionBtnClass(open)}
          >
            {open ? (
              <>
                <span>DATA SANTRI</span>

                {openSantri ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </>
            ) : (
              <ChevronRight size={18} />
            )}

            {!open && <span className={tooltipClass}>DATA SANTRI</span>}
          </button>

          {openSantri &&
            menu[1].items.map((item, i) => {
              const Icon = item.icon;

              let badge = null;

              if (item.to === "/dashboard/data-santri") {
                badge = countSantri;
              }

              return (
                <NavLink
                  key={i}
                  to={item.to}
                  className={(props) => navItemClass(props, open)}
                >
                  <Icon size={16} />

                  {open ? (
                    <div className="flex justify-between items-center w-full">
                      <span>{item.name}</span>

                      {badge !== null && (
                        <span className="text-[10px] px-2 py-[1px] rounded-full bg-purple-600 text-white font-semibold">
                          {loadingCount ? (
                            <span className="inline-block h-3 w-6 animate-pulse rounded bg-white/70" />
                          ) : (
                            badge
                          )}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className={tooltipClass}>{item.name}</span>
                  )}
                </NavLink>
              );
            })}

          {/* =================================================
              DATA GURU
          ================================================== */}

          <button
            type="button"
            onClick={() => setOpenGuru(!openGuru)}
            className={sectionBtnClass(open)}
          >
            {open ? (
              <>
                <span>DATA GURU</span>

                {openGuru ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </>
            ) : (
              <ChevronRight size={16} />
            )}

            {!open && <span className={tooltipClass}>DATA GURU</span>}
          </button>

          {openGuru &&
            menu[2].items.map((item, i) => {
              const Icon = item.icon;

              let badge = null;

              if (item.to === "/dashboard/data-guru") {
                badge = countGuru;
              }

              return (
                <NavLink
                  key={i}
                  to={item.to}
                  className={(props) => navItemClass(props, open)}
                >
                  <Icon size={16} />

                  {open ? (
                    <div className="flex justify-between items-center w-full">
                      <span>{item.name}</span>

                      {badge !== null && (
                        <span className="text-[10px] px-2 py-[1px] rounded-full bg-purple-600 text-white font-semibold">
                          {loadingCount ? (
                            <span className="inline-block h-3 w-6 animate-pulse rounded bg-white/70" />
                          ) : (
                            badge
                          )}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className={tooltipClass}>{item.name}</span>
                  )}
                </NavLink>
              );
            })}

          {/* =================================================
              ABSENSI
              HANYA UNTUK ADMIN
          ================================================== */}

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setOpenAbsensi(!openAbsensi)}
                className={sectionBtnClass(open)}
              >
                {open ? (
                  <>
                    <span>ABSENSI</span>

                    {openAbsensi ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </>
                ) : (
                  <ChevronRight size={16} />
                )}

                {!open && <span className={tooltipClass}>ABSENSI</span>}
              </button>

              {openAbsensi && (
                <>
                  {/* KEHADIRAN SANTRI */}

                  <NavLink
                    to="/dashboard/kehadiran-santri"
                    className={(props) => navItemClass(props, open)}
                  >
                    <ClipboardCheck size={16} />

                    {open ? (
                      <span>Kehadiran Santri</span>
                    ) : (
                      <span className={tooltipClass}>Kehadiran Santri</span>
                    )}
                  </NavLink>

                  {/* KEHADIRAN GURU */}

                  <NavLink
                    to="/dashboard/kehadiran-guru"
                    className={(props) => navItemClass(props, open)}
                  >
                    <ClipboardCheck size={16} />

                    {open ? (
                      <span>Kehadiran Guru</span>
                    ) : (
                      <span className={tooltipClass}>Kehadiran Guru</span>
                    )}
                  </NavLink>

                  {/* SCAN QR */}

                  <NavLink
                    to="/dashboard/scan-absensi"
                    className={(props) => navItemClass(props, open)}
                  >
                    <QrCode size={16} />

                    {open ? (
                      <span>Scan QR</span>
                    ) : (
                      <span className={tooltipClass}>Scan QR</span>
                    )}
                  </NavLink>

                  {/* KARTU QR */}

                  <NavLink
                    to="/dashboard/kartu-qr-santri"
                    className={(props) => navItemClass(props, open)}
                  >
                    <CreditCard size={16} />

                    {open ? (
                      <span>Kartu QR</span>
                    ) : (
                      <span className={tooltipClass}>Kartu QR</span>
                    )}
                  </NavLink>
                </>
              )}
            </>
          )}

          {/* =================================================
              INFORMASI
          ================================================== */}

          <button
            type="button"
            onClick={() => setOpenInformasi(!openInformasi)}
            className={sectionBtnClass(open)}
          >
            {open ? (
              <>
                <span>INFORMASI</span>

                {openInformasi ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </>
            ) : (
              <ChevronRight size={16} />
            )}

            {!open && <span className={tooltipClass}>INFORMASI</span>}
          </button>

          {openInformasi && (
            <>
              <NavLink
                to="/dashboard/berita"
                className={(props) => navItemClass(props, open)}
              >
                <Newspaper size={16} />

                {open ? (
                  <span>Berita</span>
                ) : (
                  <span className={tooltipClass}>Berita</span>
                )}
              </NavLink>

              <NavLink
                to="/dashboard/pengumuman"
                className={(props) => navItemClass(props, open)}
              >
                <Bell size={16} />

                {open ? (
                  <span>Pengumuman</span>
                ) : (
                  <span className={tooltipClass}>Pengumuman</span>
                )}
              </NavLink>

              <NavLink
                to="/dashboard/kalender-pengajian"
                className={(props) => navItemClass(props, open)}
              >
                <CalendarDays size={16} />

                {open ? (
                  <span>Kalender Pengajian</span>
                ) : (
                  <span className={tooltipClass}>Kalender Pengajian</span>
                )}
              </NavLink>

              <NavLink
                to="/dashboard/galeri"
                className={(props) => navItemClass(props, open)}
              >
                <Images size={16} />

                {open ? (
                  <span>Galeri</span>
                ) : (
                  <span className={tooltipClass}>Galeri</span>
                )}
              </NavLink>
            </>
          )}

          {/* =================================================
              LAPORAN
          ================================================== */}

          <button
            type="button"
            onClick={() => setOpenLaporan(!openLaporan)}
            className={sectionBtnClass(open)}
          >
            {open ? (
              <>
                <span>LAPORAN</span>

                {openLaporan ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </>
            ) : (
              <ChevronRight size={16} />
            )}

            {!open && <span className={tooltipClass}>LAPORAN</span>}
          </button>

          {openLaporan && (
            <NavLink
              to="/dashboard/laporan-ringkas"
              className={(props) => navItemClass(props, open)}
            >
              <BarChart3 size={16} />

              {open ? (
                <span>Laporan Ringkas</span>
              ) : (
                <span className={tooltipClass}>Laporan Ringkas</span>
              )}
            </NavLink>
          )}

          {/* =================================================
              MANAGEMENT DATA
              HANYA UNTUK ADMIN
          ================================================== */}

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setOpenManagement(!openManagement)}
                className={sectionBtnClass(open)}
              >
                {open ? (
                  <>
                    <span>MANAGEMENT DATA</span>

                    {openManagement ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </>
                ) : (
                  <ChevronRight size={16} />
                )}

                {!open && <span className={tooltipClass}>MANAGEMENT DATA</span>}
              </button>

              {openManagement && (
                <>
                  {/* MANAGEMENT USER */}

                  <NavLink
                    to="/dashboard/management-user"
                    className={(props) => navItemClass(props, open)}
                  >
                    <UserCog size={16} />

                    {open ? (
                      <span>Management User</span>
                    ) : (
                      <span className={tooltipClass}>Management User</span>
                    )}
                  </NavLink>

                  {/* PENGATURAN SISTEM */}

                  <NavLink
                    to="/dashboard/pengaturan-sistem"
                    className={(props) => navItemClass(props, open)}
                  >
                    <Settings size={16} />

                    {open ? (
                      <span>Pengaturan Sistem</span>
                    ) : (
                      <span className={tooltipClass}>Pengaturan Sistem</span>
                    )}
                  </NavLink>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
