"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface NavItem {
  href: string;
  label: string;
}

export function Header({
  homeHref,
  items,
  menuLabel,
  skipLabel,
}: {
  homeHref: string;
  items: NavItem[];
  menuLabel: string;
  skipLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <a className="skip-link" href="#contenido">
        {skipLabel}
      </a>
      <header className="site-header">
        <div className="container">
          <div className="bar">
            <Link href={homeHref} className="logo" onClick={() => setOpen(false)}>
              Inmigrante<span>ate</span>
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="menu-principal"
              onClick={() => setOpen((o) => !o)}
            >
              <span aria-hidden="true">☰</span> {menuLabel}
            </button>
          </div>
          <nav id="menu-principal" className="main-nav" data-open={open} aria-label={menuLabel}>
            <ul>
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={pathname === it.href || pathname.startsWith(`${it.href}/`) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
