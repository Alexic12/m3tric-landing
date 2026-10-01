import { Logo } from "@/components/brand/Logo";
import { TripleBar } from "@/components/brand/TripleBar";
import { a11y, brand, contact, cta, footer, navItems } from "@/content/landing";
import { mailtoHref, siteConfig } from "@/config/site";

const BUILD_YEAR = new Date().getFullYear();

const linkClass = "inline-flex min-h-11 items-center text-m3-green-200 transition-colors hover:text-white";

export function Footer() {
  const { email, phone } = siteConfig.contact;
  const mailHref = mailtoHref(cta.mailSubject);

  return (
    <footer className="on-dark bg-m3-green-950 text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="#inicio" className="inline-block rounded-sm">
              <Logo variant="reverse" label={a11y.homeLink} className="w-44" />
            </a>
            <p className="text-h3 mt-8 max-w-sm font-light text-white">{brand.tagline}</p>
          </div>

          <nav aria-label={a11y.footerNav} className="lg:col-span-4 lg:col-start-6">
            <p className="text-meta text-m3-green-400">{footer.sections}</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-6">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {email || phone ? (
            <div className="lg:col-span-3">
              <p className="text-meta text-m3-green-400">{contact.kicker}</p>
              <ul className="mt-3">
                {email && mailHref ? (
                  <li>
                    <a href={mailHref} className={`${linkClass} break-all`}>
                      {email}
                    </a>
                  </li>
                ) : null}
                {phone ? (
                  <li>
                    <a href={`tel:${phone}`} className={linkClass}>
                      {phone}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-m3-green-200">
            © {BUILD_YEAR} M3TRIC. {brand.rights}
          </p>
          <TripleBar active={3} className="w-6 text-m3-green-400" />
        </div>
      </div>
    </footer>
  );
}
