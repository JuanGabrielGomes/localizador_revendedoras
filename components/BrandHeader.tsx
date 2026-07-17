import Link from "next/link";

interface BrandHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export function BrandHeader({ backHref, backLabel }: BrandHeaderProps) {
  return (
    <header className="border-b border-onyx-line bg-onyx">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-serif text-xl tracking-wide text-gold sm:text-2xl">
            Sorelly Joias
          </span>
          <span className="mt-1 text-[0.65rem] font-medium tracking-[0.2em] text-foreground/60 uppercase">
            Localizador de Revendedoras
          </span>
        </Link>

        {backHref && (
          <Link
            href={backHref}
            className="text-sm font-medium text-gold-light transition hover:text-gold"
          >
            {backLabel ?? "← Nova busca"}
          </Link>
        )}
      </div>
    </header>
  );
}
