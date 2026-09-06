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
  ChevronDown,
  ChevronRight,
  CircleUser,
  UserCog,
  KeyRound,
  Settings,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import { api } from "../api";

export default function Sidebar({ open }) {
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
          to: "/",
        },

        // =====================================================
        // MASTER MENU — HANYA ADMIN
        // =====================================================
        ...(isAdmin
          ? [
              {
                name: "Master Data",
                icon: Database,
                to: "/master-data",
              },
              {
                name: "Master Progres",
                icon: Database,
                to: "/master-progres",
              },
              {
                name: "Master Hafalan",
                icon: Database,
                to: "/master-hafalan",
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
          to: "/data-santri",
        },
        {
          name: "Progres Iqra",
          icon: BookOpen,
          to: "/progres-iqra",
        },
        {
          name: "Progres Qur'an",
          icon: BookMarked,
          to: "/progres-quran",
        },
        {
          name: "Progres Hafalan",
          icon: BarChart3,
          to: "/progres-hafalan",
        },
      ],
    },

    {
      label: "DATA GURU",
      items: [
        {
          name: "Database Guru",
          icon: UserRound,
          to: "/data-guru",
        },
        {
          name: "Status & Gaji Guru",
          icon: CircleUser,
          to: "/status-guru",
        },
      ],
    },
  ];

  // =========================================================
  // STATE DROPDOWN
  // =========================================================
  const [openSantri, setOpenSantri] = useState(true);
  const [openGuru, setOpenGuru] = useState(true);
  const [openInformasi, setOpenInformasi] = useState(true);
  const [openLaporan, setOpenLaporan] = useState(true);
  const [openManagement, setOpenManagement] = useState(true);

  // =========================================================
  // JUMLAH DATA
  // =========================================================
  const [countSantri, setCountSantri] = useState(0);
  const [countGuru, setCountGuru] = useState(0);

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

    return () => {
      window.removeEventListener("storage", refreshUser);
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
    return `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${user.foto.replace(/^\/+/, "")}`;
  };

  const userPhoto = getUserPhoto();

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
      ${sidebarOpen ? "gap-2 ml-3" : "justify-center"}
      px-2 py-1 rounded-md text-sm
      transition-all duration-200
      ${
        isActive
          ? "bg-white/70 text-purple-700 shadow-sm"
          : "text-gray-700 hover:bg-white/50"
      }
    `;
  };

  const sectionBtnClass = (sidebarOpen) => `
    relative group
    flex items-center
    ${sidebarOpen ? "justify-between px-5" : "justify-center"}
    w-full
    py-1 mt-2
    text-xs font-light tracking-widest
    text-gray-800
    h-9
  `;

  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={`
        fixed top-0 left-0 h-screen border-r z-50
        transition-all duration-300
        ${open ? "w-64" : "w-16"}
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
      <div className="relative z-10 h-full overflow-y-auto">
        {/* ===================================================
            HEADER
        ==================================================== */}
        <div className="p-4 font-semibold border-b text-center text-gray-800">
          {open ? "TPQ SYSTEM" : "TPQ"}
        </div>

        {/* ===================================================
            INFO USER LOGIN
        ==================================================== */}
        {open && user && (
          <div className="px-4 pt-3 pb-2">
            <div
              className="
    relative
    overflow-hidden
    rounded-2xl
    px-3
    py-3
    border border-white/400
    bg-white/30
    backdrop-blur-1xl
    shadow-xl
  "
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent pointer-events-none" />

              <div className="relative flex items-center gap-3">
                {/* FOTO USER */}
                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    overflow-hidden
                    flex
                    items-center
                    justify-center
                    shrink-0
                    bg-white/10
                    border-2
                    border-gray-300                    shadow-sm
                  "
                >
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={user.name || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <User size={23} className="text-gray-600" />
                  )}
                </div>

                {/* DATA USER */}
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-600">Login sebagai</div>

                  <div className="font-semibold text-sm text-gray-800 truncate">
                    {user.name}
                  </div>

                  <div
                    className={`
                      inline-flex
                      mt-1
                      px-2
                      py-[2px]
                      rounded-full
                      text-[10px]
                      font-semibold
                      ${
                        isAdmin
                          ? "bg-purple-100/80 text-purple-700"
                          : "bg-gray-200/80 text-gray-600"
                      }
                    `}
                  >
                    {role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            MENU
        ==================================================== */}
        <nav className="flex flex-col gap-1 p-4">
          {/* =================================================
              DASHBOARD + MASTER
          ================================================== */}
          {menu[0].items.map((item, i) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={i}
                to={item.to}
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

              if (item.to === "/data-santri") {
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
                        <span className="text-[10px] px-2 py-[1px] rounded-full bg-purple-400 text-white">
                          {badge}
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

              if (item.to === "/data-guru") {
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
                        <span className="text-[10px] px-2 py-[1px] rounded-full bg-purple-400 text-white">
                          {badge}
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
                to="/berita"
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
                to="/pengumuman"
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
                to="/kalender-pengajian"
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
                to="/galeri"
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
              to="/laporan-ringkas"
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
                    to="/management-user"
                    className={(props) => navItemClass(props, open)}
                  >
                    <UserCog size={16} />

                    {open ? (
                      <span>Management User</span>
                    ) : (
                      <span className={tooltipClass}>Management User</span>
                    )}
                  </NavLink>

                  {/* MANAGEMENT PASSWORD */}
                  <NavLink
                    to="/management-password"
                    className={(props) => navItemClass(props, open)}
                  >
                    <KeyRound size={16} />

                    {open ? (
                      <span>Management Password</span>
                    ) : (
                      <span className={tooltipClass}>Management Password</span>
                    )}
                  </NavLink>

                  {/* PENGATURAN SISTEM */}
                  <NavLink
                    to="/pengaturan-sistem"
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
