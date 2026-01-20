import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function MobileMenu({ open, setOpen }) {
  const [corpOpen, setCorpOpen] = useState(false);

  return (
    <div
      className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
        open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <ul className="mt-2 space-y-1 border-t border-white/10 pt-3">
        <li>
          <Link
            to="/"
            className="block px-2 py-2 rounded hover:bg-white/10 font-semibold"
            onClick={() => setOpen(false)}
          >
            Anasayfa
          </Link>
        </li>

        {/* Kurumsal alt menü */}
        <li className="px-1">
          <button
            className="w-full flex items-center justify-between px-1 py-2 rounded hover:bg-white/10 font-semibold"
            onClick={() => setCorpOpen((v) => !v)}
            type="button"
          >
            <span>Kurumsal</span>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform ${
                corpOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`pl-3 overflow-hidden transition-[max-height,opacity] duration-300 ${
              corpOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="my-1">
              <li>
                <Link
                  to="/JobApplicationForm"
                  className="block px-2 py-2 rounded text-gray-300 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setOpen(false);
                    setCorpOpen(false);
                  }}
                >
                  Kariyer
                </Link>
              </li>
              <li>
                <Link
                  to="/Hakkımızda"
                  className="block px-2 py-2 rounded text-gray-300 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setOpen(false);
                    setCorpOpen(false);
                  }}
                >
                  Hakkımızda
                </Link>
              </li>
            </ul>
          </div>
        </li>

        <li>
          <Link
            to="/Iletisim"
            className="block px-2 py-2 rounded hover:bg-white/10 font-semibold"
            onClick={() => setOpen(false)}
          >
            Chamada Club
          </Link>
        </li>
        <li>
          <Link
            to="/Iletisim"
            className="block px-2 py-2 rounded hover:bg-white/10 font-semibold"
            onClick={() => setOpen(false)}
          >
            İletişim
          </Link>
        </li>
      </ul>
    </div>
  );
}
