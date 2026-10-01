"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { TripleBar } from "@/components/brand/TripleBar";
import { Button } from "@/components/ui/Button";
import { a11y, cta, navItems } from "@/content/landing";
import { siteConfig, mailtoHref } from "@/config/site";

const SCROLL_SOLID_PX = 40;
const XL_QUERY = "(min-width: 1280px)";
const MENU_ID = "menu-movil";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Everything outside <header> that must not be reachable while the menu is modal. */
const BACKGROUND = 'main, footer, a[href="#contenido"]';
// Module scope: a stable reference keeps the IntersectionObserver effect from re-subscribing on every render.
const NAV_IDS = navItems.map((n) => n.id);

function setBackgroundInert(inert: boolean) {
  document.querySelectorAll<HTMLElement>(BACKGROUND).forEach((el) => el.toggleAttribute("inert", inert));
}

/** Tracks which section sits around the reading line of the viewport. */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
          else setActive((current) => (current === entry.target.id ? null : current));
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(NAV_IDS);
  const contactHref = mailtoHref(cta.mailSubject);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Anchor navigation: release the inert background first so the target is live when the browser scrolls
  // to it, and do not move focus to the toggle (the link's own navigation sets the focus starting point).
  const closeForNavigation = useCallback(() => {
    setBackgroundInert(false);
    setOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_SOLID_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu open: lock scroll, close on Escape, trap Tab inside the header, close when the desktop layout takes over.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setBackgroundInert(true);
    const panelLink = headerRef.current?.querySelector<HTMLElement>(`#${MENU_ID} a`);
    panelLink?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !headerRef.current) return;
      const nodes = Array.from(headerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!headerRef.current.contains(document.activeElement)) {
        // Focus escaped (e.g. clicked on the body): pull it back in instead of tabbing through the page.
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const mq = window.matchMedia(XL_QUERY);
    const onBreakpoint = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    mq.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      setBackgroundInert(false);
      document.removeEventListener("keydown", onKeyDown);
      mq.removeEventListener("change", onBreakpoint);
    };
  }, [open, close]);

  const solid = scrolled && !open;
  const linkTone = solid ? "text-m3-green-900" : "text-white";
  const barTone = solid ? "bg-m3-green-900" : "bg-m3-green-400";

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 h-[72px] ${solid ? "" : "on-dark"}`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 border-b transition-colors duration-300 ${
          solid
            ? "border-m3-green-900/10 bg-white/95 backdrop-blur"
            : "border-transparent bg-transparent"
        }`}
      />
      <div className="relative z-10 mx-auto flex h-full max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a href="#inicio" className="shrink-0 rounded-sm" onClick={open ? closeForNavigation : undefined}>
          <Logo variant={solid ? "color" : "reverse"} label={a11y.homeLink} className="w-[104px] sm:w-32" />
        </a>

        <nav aria-label={a11y.mainNav} className="hidden xl:block">
          <ul className="flex items-center gap-7">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                  className={`relative block py-2 text-[0.9375rem] font-medium transition-opacity hover:opacity-70 ${linkTone}`}
                >
                  {item.label}
                  {active === item.id ? (
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-0.5 mx-auto h-[3px] w-6 rounded-full ${barTone}`}
                    />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            href={siteConfig.platformUrl}
            variant={solid ? "primary-on-light" : "primary-on-dark"}
            icon={<ArrowUpRight size={18} strokeWidth={1.5} className="max-sm:hidden" />}
            className="max-sm:px-4"
          >
            <span>
              <span className="max-sm:sr-only">{cta.platformVerb} </span>
              <span className="max-sm:capitalize">{cta.platformNoun}</span>
            </span>
          </Button>
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={MENU_ID}
            aria-label={open ? a11y.closeMenu : a11y.openMenu}
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex size-11 items-center justify-center rounded-full xl:hidden ${linkTone}`}
          >
            {open ? <X size={24} strokeWidth={1.5} aria-hidden="true" /> : <Menu size={24} strokeWidth={1.5} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id={MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label={a11y.menuDialog}
        hidden={!open}
        className="on-dark fixed inset-0 z-0 overflow-y-auto bg-m3-green-900 pt-[72px] xl:hidden"
      >
        <nav aria-label={a11y.mobileNav} className="mx-auto flex min-h-full max-w-[1320px] flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <ul className="flex flex-col">
            {navItems.map((item, i) => (
              <li key={item.id} className="border-b border-white/15">
                <a
                  href={`#${item.id}`}
                  onClick={closeForNavigation}
                  aria-current={active === item.id ? "true" : undefined}
                  className="flex min-h-14 items-center gap-4 py-3 text-[clamp(1.5rem,1.1rem+2vw,2.25rem)] font-extrabold leading-none tracking-tight text-white"
                >
                  <span aria-hidden="true" className="text-meta w-7 font-medium text-m3-green-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                  {active === item.id ? <TripleBar active={3} className="ml-auto w-5 text-m3-green-400" /> : null}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row">
            <Button href={siteConfig.platformUrl} variant="primary-on-dark" size="lg" icon={<ArrowUpRight size={20} strokeWidth={1.5} />}>
              {cta.platform}
            </Button>
            {contactHref ? (
              <Button href={contactHref} variant="ghost-on-dark" size="lg" onClick={closeForNavigation}>
                {cta.writeTeam}
              </Button>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
