import logoTPQ from "../assets/logo-tpq.png";

export default function Navbar({ setOpen }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-gray-200 border-b flex items-center px-4 z-50">
      {/* HAMBURGER */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-2xl text-gray-800"
        aria-label="Buka menu"
      >
        ☰
      </button>

      {/* LOGO TPQ */}
      <img
        src={logoTPQ}
        alt="Logo TPQ Khairunnisa"
        className="
          ml-4
          w-10
          h-10
          rounded-full
          object-cover
          shadow-lg
          border-2
          border-white
        "
      />

      {/* NAMA TPQ */}
      <div className="ml-3 font-semibold">TPQ KHAIRUNNISA</div>
    </div>
  );
}
