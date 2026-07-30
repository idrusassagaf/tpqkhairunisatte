export default function Navbar({ setOpen }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-gray-200 border-b flex items-center px-4 z-50">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-2xl text-gray-800"
      >
        ☰
      </button>
      <div className="ml-3 font-semibold">TPQ KHAIRUNISA</div>
    </div>
  );
}
