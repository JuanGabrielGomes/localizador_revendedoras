import Link from "next/link";

interface BrandHeaderProps {
  backHref?: string;
  backLabel?: string;
}

function CrownMark() {
  return (
    <svg
      viewBox="0 0 24 20"
      className="h-4 w-4 text-gold sm:h-5 sm:w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2 7 6 10 12 3 18 10 22 7 20 17H4L2 7Z" />
      <circle cx="2" cy="6" r="1.6" />
      <circle cx="12" cy="2" r="1.6" />
      <circle cx="22" cy="6" r="1.6" />
    </svg>
  );
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export function BrandHeader({ backHref, backLabel }: BrandHeaderProps) {
  return (
    <header className="border-b border-onyx-line bg-onyx">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-onyx"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Link
          href="/"
          className={`group flex flex-col leading-none rounded-sm ${focusRing}`}
        >
          <span className="flex items-center gap-2">
            <CrownMark />
            <span className="font-serif text-lg tracking-[0.25em] text-gold uppercase sm:text-xl">
              Sorelly
            </span>
          </span>
          <span className="mt-1.5 text-[0.7rem] font-medium tracking-[0.2em] text-foreground/70 uppercase">
            Localizador de Revendedoras
          </span>
        </Link>

        {backHref && (
          <Link
            href={backHref}
            className={`rounded-sm text-sm font-medium text-gold-light transition hover:text-gold ${focusRing}`}
          >
            {backLabel ?? "← Nova busca"}
          </Link>
        )}
      </div>
    </header>
  );
}
