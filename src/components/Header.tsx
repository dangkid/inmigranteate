"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";

export interface NavItem {
  href: string;
  label: string;
  /** Botón destacado (llamada a la acción) */
  cta?: boolean;
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
              <span className="logo-mark">
                <Icon name="home" size={19} />
              </span>
              <span>
                Inmigrante<span className="ate">ate</span>
              </span>
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="menu-principal"
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name="menu" size={20} /> {menuLabel}
            </button>
          </div>
          <nav id="menu-principal" className="main-nav" data-open={open} aria-label={menuLabel}>
            <ul>
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={it.cta ? "nav-cta" : undefined}
                    aria-current={!it.cta && (pathname === it.href || pathname.startsWith(`${it.href}/`)) ? "page" : undefined}
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
