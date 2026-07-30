import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
  const [open, setOpen] = useState(window.innerWidth >= 768);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* CONTENT AREA */}
      <div
        className={`
    flex-1 flex flex-col pt-14
    transition-all duration-300 ease-in-out

    ${open ? "md:ml-64" : "md:ml-16"}

    pl-16 md:pl-0
  `}
      >
        {/* NAVBAR */}
        <Navbar setOpen={setOpen} />

        {/* CONTENT */}
        <main className="px-4 pb-6 bg-gray-50 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
