import { Menu, Microscope, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Experiments", path: "/experiments" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-semibold transition",
      isActive
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
    );

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white">
            <Microscope className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="truncate text-base font-bold text-slate-950 dark:text-white">CEFP Experiment Management System</span>
        </NavLink>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setIsOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass} onClick={() => setIsOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
