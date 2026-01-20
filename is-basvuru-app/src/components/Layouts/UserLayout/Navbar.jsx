import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import MobileMenu from "./MobileMenuNavbar";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-around">
        {/* Sol Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/src/images/group.png"
            alt="Group Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Masaüstü Menü */}
        <ul className="hidden md:flex items-center gap-10">
          <li>
            <Link to="/" className="hover:underline font-semibold">
              Anasayfa
            </Link>
          </li>
          <li className="relative group">
            <button className="inline-flex items-center gap-x-1.5 font-semibold hover:underline cursor-pointer">
              Kurumsal
              <ChevronDownIcon className="w-4 h-4 mt-0.5 text-white" />
            </button>
            {/* Hover ile açılan */}
            <div className="absolute left-0 top-full z-20 w-44 rounded-md bg-gray-900 shadow-lg invisible opacity-0 translate-y-1 transition group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
              <ul className="py-1">
                <li>
                  <Link
                    to="/JobApplicationForm"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    Kariyer
                  </Link>
                </li>
                <li>
                  <Link
                    to="/Hakkımızda"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    Hakkımızda
                  </Link>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link to="/Iletisim" className="hover:underline font-semibold">
              Chamada Club
            </Link>
          </li>
          <li>
            <Link to="/Iletisim" className="hover:underline font-semibold">
              İletişim
            </Link>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded p-2 hover:bg-white/10"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobil menü paneli */}
      <MobileMenu open={mobileOpen} setOpen={setMobileOpen} />
    </nav>
  );
}
