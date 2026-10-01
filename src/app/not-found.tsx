import { Logo } from "@/components/brand/Logo";
import { TripleBar } from "@/components/brand/TripleBar";
import { Button } from "@/components/ui/Button";
import { notFound } from "@/content/landing";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-m3-beige px-6 text-center">
      <Logo variant="color" className="w-48" />
      <TripleBar className="w-10 text-m3-green-400" />
      <div>
        <p className="text-meta text-m3-green-700">{notFound.code}</p>
        <h1 className="text-h2 mt-3 text-m3-green-900">{notFound.title}</h1>
        <p className="text-lead mx-auto mt-4 max-w-md text-m3-muted">
          {notFound.text}
        </p>
      </div>
      <Button href="/" variant="primary-on-light" size="lg">
        {notFound.back}
      </Button>
    </main>
  );
}
