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
  GraduationCap,
  Banknote,
  ChevronDown,
  ChevronRight,
  CircleUser,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Sidebar({ open }) {
  const menu = [
    {
      items: [
        { name: "Dashboard", icon: LayoutDashboard, to: "/" },
        { name: "Master Data", icon: Database, to: "/master-data" },
        { name: "Master Progres", icon: Database, to: "/master-progres" },
        { name: "Master Hafalan", icon: Database, to: "/master-hafalan" },
      ],
    },
    {
      label: "DATA SANTRI",
      items: [
        { name: "Database Santri", icon: Users, to: "/data-santri" },
        { name: "Progres Iqra", icon: BookOpen, to: "/progres-iqra" },
        { name: "Progres Qur'an", icon: BookMarked, to: "/progres-quran" },
        { name: "Progres Hafalan", icon: BarChart3, to: "/progres-hafalan" },
      ],
    },
    {
      label: "DATA GURU",
      items: [
        { name: "Database Guru", icon: UserRound, to: "/data-guru" },
        { name: "Status & Gaji Guru", icon: CircleUser, to: "/status-guru" },
      ],
    },
  ];

  // STYLE TOOLTIP
  const tooltipClass =
    "absolute left-14 bg-gray-200 text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition shadow";

  const [countSantri, setCountSantri] = useState(0);
  const [countGuru, setCountGuru] = useState(0);

  // DROPDOWN MENU
  const [openSantri, setOpenSantri] = useState(true);
  const [openGuru, setOpenGuru] = useState(true);
  const [openInformasi, setOpenInformasi] = useState(true);
  const [openLaporan, setOpenLaporan] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

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

  // 👇 INI TEMPAT HELPER (WAJIB DI SINI)
  const navItemClass = ({ isActive }, open) => {
    return `
    group relative flex items-center
    ${open ? "gap-2 ml-3" : "justify-center"}
    px-2 py-1 rounded-md text-sm
    ${
      isActive
        ? "bg-white/70 text-purple-700 shadow-sm"
        : "text-gray-700 hover:bg-white/50"
    }
  `;
  };

  const sectionBtnClass = (open) => `
  flex items-center
  ${open ? "justify-between px-5" : "justify-center"}
  py-1 mt-2
  text-xs font-light tracking-widest text-gray-800
`;

  // RETURN UTAMA
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
      {/* OVERLAY (BIAR ORNAMEN HALUS) */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>

      {/* ISI SIDEBAR */}
      <div className="relative z-10">
        {/* HEADER */}
        <div className="p-4 font-semibold border-b text-center text-gray-800">
          {open ? "TPQ SYSTEM" : "TPQ"}
        </div>
        {/* MENU */}
        <nav className="flex flex-col gap-1 p-4 mt-">
          {/* DASHBOARD + MASTER */}
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

          {/* DATA SANTRI */}
          <button
            onClick={() => setOpenSantri(!openSantri)}
            className={`relative group ${sectionBtnClass(open)}`}
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

          {(open || !open) &&
            openSantri &&
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
                    <div className="flex justify-between w-full">
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

          {/* DATA GURU */}
          <button
            onClick={() => setOpenGuru(!openGuru)}
            className={`
    relative group flex items-center
    ${open ? "justify-between px-5" : "justify-center"}
    py-1 mt-2
    text-xs font-light tracking-widest text-gray-800
    h-9
  `}
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

            {/* TOOLTIP SAAT COLLAPSED */}
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
                    <div className="flex justify-between w-full">
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

          {/* INFORMASI */}
          <button
            onClick={() => setOpenInformasi(!openInformasi)}
            className={`relative group ${sectionBtnClass(open)}`}
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

            {/* TOOLTIP HAMBURGER MODE */}
            {!open && <span className={tooltipClass}>INFORMASI</span>}
          </button>

          {openInformasi && (
            <>
              <NavLink
                to="/berita"
                className={`
group relative flex items-center
${open ? "gap-2 ml-3" : "justify-center"}
px-2 py-1 rounded-md text-sm
text-gray-700 hover:bg-white/50
`}
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
                className={`
    group relative flex items-center
    ${open ? "gap-2 ml-3" : "justify-center"}
    px-2 py-1 rounded-md text-sm
    text-gray-700 hover:bg-white/50
  `}
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
                className={`
    group relative flex items-center
    ${open ? "gap-2 ml-3" : "justify-center"}
    px-2 py-1 rounded-md text-sm
    text-gray-700 hover:bg-white/50
  `}
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
                className={`
    group relative flex items-center
    ${open ? "gap-2 ml-3" : "justify-center"}
    px-2 py-1 rounded-md text-sm
    text-gray-700 hover:bg-white/50
  `}
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

          {/* LAPORAN */}
          <button
            onClick={() => setOpenLaporan(!openLaporan)}
            className={`relative group ${sectionBtnClass(open)}`}
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

            {/* TOOLTIP HAMBURGER MODE */}
            {!open && <span className={tooltipClass}>LAPORAN</span>}
          </button>
          {openLaporan && (
            <>
              <NavLink
                to="/laporan-ringkas"
                className={`
    group relative flex items-center
    ${open ? "gap-2 ml-3" : "justify-center"}
    px-2 py-1 rounded-md text-sm
    text-gray-700 hover:bg-white/50
  `}
              >
                <BarChart3 size={16} />

                {open ? (
                  <span>Laporan Ringkas</span>
                ) : (
                  <span className={tooltipClass}>Laporan Ringkas</span>
                )}
              </NavLink>
            </>
          )}
        </nav>{" "}
      </div>
    </div>
  );
}
