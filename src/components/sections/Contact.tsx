import { Fragment } from "react";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { NodeNetwork } from "@/components/brand/NodeNetwork";
import { TripleBar } from "@/components/brand/TripleBar";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { contact, cta } from "@/content/landing";
import { mailtoHref, siteConfig } from "@/config/site";
import { formatPhone } from "./contact-format";

export function Contact() {
  const mailHref = mailtoHref(cta.mailSubject);
  const { email, phone } = siteConfig.contact;

  return (
    <section
      id="contacto"
      aria-labelledby="contacto-title"
      className="on-dark relative isolate overflow-hidden border-t border-white/10 bg-m3-green-900 text-white"
    >
      <NodeNetwork className="absolute inset-0 -z-10 size-full opacity-20" seed={33} nodes={26} />
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 py-24 sm:px-6 md:py-32 lg:grid-cols-12 lg:items-stretch lg:gap-16 lg:px-8">
        <div className="flex flex-col justify-center lg:col-span-7">
          <Reveal>
            <p className="text-meta flex items-center gap-3 text-m3-green-200">
              <TripleBar className="w-4 shrink-0 text-m3-green-400" />
              <span>
                {contact.index} — {contact.kicker}
              </span>
            </p>
            <h2 id="contacto-title" className="text-display mt-6 break-words">
              {/* Literal spaces between the block spans keep the accessible name and textContent word-separated. */}
              {contact.titleBold1.split(" ").map((word) => (
                <Fragment key={word}>
                  <span className="block text-m3-green-200">{word}</span>{" "}
                </Fragment>
              ))}
              <span className="text-light block text-white">{contact.titleLight}</span>{" "}
              {contact.titleBold2.split(" ").map((word) => (
                <Fragment key={word}>
                  <span className="block text-white">{word}</span>{" "}
                </Fragment>
              ))}
            </h2>
            <p className="text-lead mt-8 max-w-xl text-m3-green-200">{contact.text}</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            {/* Without a configured email there is no contact link at all: say so instead of linking nowhere. */}
            {!email ? <p className="mb-6 max-w-xl text-lg text-white">{contact.pendingChannels}</p> : null}
            <div className="flex flex-wrap gap-3">
              {mailHref ? (
                <Button href={mailHref} variant="primary-on-dark" size="lg" icon={<Mail size={20} strokeWidth={1.5} />}>
                  {cta.writeTeam}
                </Button>
              ) : null}
              <Button
                href={siteConfig.platformUrl}
                variant={mailHref ? "ghost-on-dark" : "primary-on-dark"}
                size="lg"
                icon={<ArrowUpRight size={20} strokeWidth={1.5} />}
              >
                {cta.platform}
              </Button>
            </div>
          </Reveal>

          {email || phone ? (
            <Reveal delay={0.16}>
              <ul className="mt-10 space-y-2 border-t border-white/20 pt-6">
                {email && mailHref ? (
                  <li>
                    <a href={mailHref} className="inline-flex min-h-11 items-center gap-3 break-all text-lg text-white hover:text-m3-green-200">
                      <Mail size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-m3-green-400" />
                      <span className="sr-only">{contact.emailLabel}: </span>
                      {email}
                    </a>
                  </li>
                ) : null}
                {phone ? (
                  <li>
                    <a href={`tel:${phone}`} className="inline-flex min-h-11 items-center gap-3 text-lg text-white hover:text-m3-green-200">
                      <Phone size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-m3-green-400" />
                      <span className="sr-only">{contact.phoneLabel}: </span>
                      {formatPhone(phone)}
                    </a>
                  </li>
                ) : null}
              </ul>
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={0.1} className="lg:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-auto lg:h-full lg:min-h-[32rem]">
            {/* Static export: pre-optimised WebP, no next/image loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/aerial-tall-747.webp"
              srcSet="/images/aerial-tall-640.webp 640w, /images/aerial-tall-747.webp 747w"
              sizes="(min-width: 1024px) 480px, 100vw"
              width={747}
              height={996}
              alt={contact.imageAlt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
