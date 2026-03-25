import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// ─── Tipi ─────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: "violet" | "amber" | "teal" | "coral";
  delay?: number;
}

// ─── Palette accent ───────────────────────────────────────
const accentMap = {
  violet: {
    bg:     "bg-[--ff-violet-light]",
    text:   "text-[--ff-violet-dark]",
    border: "border-[--ff-violet-light]",
    dot:    "bg-[--ff-violet]",
  },
  amber: {
    bg:     "bg-[--ff-amber-light]",
    text:   "text-[--ff-amber-dark]",
    border: "border-[--ff-amber-light]",
    dot:    "bg-[--ff-amber]",
  },
  teal: {
    bg:     "bg-[--ff-teal-light]",
    text:   "text-[--ff-teal]",
    border: "border-[--ff-teal-light]",
    dot:    "bg-[--ff-teal]",
  },
  coral: {
    bg:     "bg-[--ff-coral-light]",
    text:   "text-[--ff-coral]",
    border: "border-[--ff-coral-light]",
    dot:    "bg-[--ff-coral]",
  },
};

// ─── Hook: intersection observer per animazioni ───────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { const entry = entries[0]; if (entry?.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── SVG: Illustrazione Hero ──────────────────────────────
// Una composizione astratta: cerchi sovrapposti, linee morbide,
// piccoli task-chip che "fluttuano" — evoca organizzazione senza
// essere un wireframe di un'app (troppo generico).
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto"
      aria-hidden="true"
    >
      {/* Cerchio grande sfondo — caldo */}
      <circle cx="260" cy="210" r="180" fill="var(--ff-violet-light)" opacity="0.6" />

      {/* Cerchio medio accent ambra */}
      <circle cx="160" cy="280" r="100" fill="var(--ff-amber-light)" opacity="0.7" />

      {/* Cerchio piccolo teal */}
      <circle cx="340" cy="100" r="60" fill="var(--ff-teal-light)" opacity="0.8" />

      {/* Card task 1 — grande, in primo piano */}
      <g>
        <rect x="80" y="120" width="210" height="68" rx="16"
          fill="white" stroke="var(--ff-sand-dark)" strokeWidth="1.2"
          style={{ filter: "drop-shadow(0 4px 16px rgba(92,74,228,0.10))" }}
        />
        {/* Check completato */}
        <circle cx="108" cy="154" r="11" fill="var(--ff-teal-light)" />
        <path d="M103 154l4 4 8-8" stroke="var(--ff-teal)" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Testo simulato */}
        <rect x="128" y="146" width="100" height="8" rx="4" fill="var(--ff-sand)" />
        <rect x="128" y="160" width="68" height="6" rx="3" fill="var(--ff-sand)" opacity="0.6" />
        {/* Badge priorità */}
        <rect x="240" y="144" width="36" height="18" rx="9"
          fill="var(--ff-violet-light)" />
        <rect x="248" y="150" width="20" height="6" rx="3" fill="var(--ff-violet)" opacity="0.5" />
      </g>

      {/* Card task 2 — a destra, più piccola */}
      <g>
        <rect x="260" y="200" width="180" height="60" rx="14"
          fill="white" stroke="var(--ff-sand-dark)" strokeWidth="1.2"
          style={{ filter: "drop-shadow(0 4px 16px rgba(239,159,39,0.10))" }}
        />
        <circle cx="284" cy="230" r="10" fill="var(--ff-amber-light)" />
        <path d="M284 224v6l4 3" stroke="var(--ff-amber)" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
        <rect x="302" y="223" width="90" height="7" rx="3.5" fill="var(--ff-sand)" />
        <rect x="302" y="236" width="56" height="5" rx="2.5" fill="var(--ff-sand)" opacity="0.6" />
      </g>

      {/* Card task 3 — in basso a sinistra */}
      <g>
        <rect x="60" y="236" width="168" height="56" rx="14"
          fill="white" stroke="var(--ff-sand-dark)" strokeWidth="1.2"
          style={{ filter: "drop-shadow(0 4px 12px rgba(216,90,48,0.08))" }}
        />
        <circle cx="84" cy="264" r="10" fill="var(--ff-coral-light)" />
        <path d="M80 264h8M84 260v8" stroke="var(--ff-coral)" strokeWidth="1.8"
          strokeLinecap="round" />
        <rect x="102" y="257" width="80" height="7" rx="3.5" fill="var(--ff-sand)" />
        <rect x="102" y="270" width="52" height="5" rx="2.5" fill="var(--ff-sand)" opacity="0.6" />
      </g>

      {/* Progress bar flottante */}
      <g>
        <rect x="190" y="314" width="150" height="36" rx="18"
          fill="white" stroke="var(--ff-sand-dark)" strokeWidth="1"
          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }}
        />
        <rect x="204" y="327" width="88" height="10" rx="5" fill="var(--ff-sand)" />
        <rect x="204" y="327" width="58" height="10" rx="5" fill="var(--ff-violet)" opacity="0.7" />
        <text x="300" y="336" fontSize="10" fill="var(--ff-violet)"
          fontFamily="sans-serif" fontWeight="600">66%</text>
      </g>

      {/* Linee decorative morbide */}
      <path d="M180 100 Q220 60 280 80" stroke="var(--ff-violet)" strokeWidth="1.5"
        strokeDasharray="4 6" strokeLinecap="round" opacity="0.35" />
      <path d="M380 260 Q420 300 390 350" stroke="var(--ff-amber)" strokeWidth="1.5"
        strokeDasharray="4 6" strokeLinecap="round" opacity="0.35" />

      {/* Pallini decorativi */}
      <circle cx="70"  cy="110" r="5" fill="var(--ff-violet)" opacity="0.25" />
      <circle cx="400" cy="360" r="7" fill="var(--ff-amber)"  opacity="0.25" />
      <circle cx="430" cy="160" r="4" fill="var(--ff-teal)"   opacity="0.30" />
      <circle cx="100" cy="360" r="5" fill="var(--ff-coral)"  opacity="0.20" />
    </svg>
  );
}

// ─── SVG: Icone Feature ───────────────────────────────────
function IconTasks() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
      <rect x="4" y="8" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.25" />
      <rect x="4" y="15" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.45" />
      <rect x="4" y="22" width="13" height="3" rx="1.5" fill="currentColor" opacity="0.65" />
      <circle cx="25" cy="23.5" r="4.5" fill="currentColor" opacity="0.9" />
      <path d="M23 23.5l1.5 1.5 3-3" stroke="white" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
      <rect x="4" y="7" width="24" height="20" rx="4" stroke="currentColor"
        strokeWidth="1.8" fill="currentColor" opacity="0.08" />
      <path d="M4 13h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 4v6M21 4v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="11" cy="20" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="16" cy="20" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="21" cy="20" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
      <path d="M5 9h22M9 16h14M13 23h6" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
      <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="1.8"
        fill="currentColor" opacity="0.08" />
      <path d="M20 20l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 14h6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Feature Card ─────────────────────────────────────────
function FeatureCard({ icon, title, description, accent, delay = 0 }: FeatureCardProps) {
  const { ref, visible } = useReveal();
  const a = accentMap[accent];

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease",
      }}
      className="group relative bg-card border border-border rounded-[--radius-xl]
                 p-7 flex flex-col gap-4
                 hover:shadow-[0_8px_32px_-8px_rgba(92,74,228,0.12)]
                 hover:-translate-y-1 hover:border-[--ff-violet-light]
                 transition-all duration-300"
    >
      {/* Icona con sfondo accent */}
      <div className={`w-12 h-12 rounded-[--radius-lg] ${a.bg} ${a.text}
                       flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>

      {/* Titolo */}
      <h3 className="text-base font-medium text-foreground leading-snug">
        {title}
      </h3>

      {/* Descrizione */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Dot decorativo in basso a destra */}
      <div className={`absolute bottom-5 right-5 w-2 h-2 rounded-full ${a.dot} opacity-30
                       group-hover:opacity-70 transition-opacity duration-300`} />
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
        }`}
    >
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <span className="font-display text-xl text-foreground tracking-tight select-none">
          FocusFlow
        </span>

        {/* CTA */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5
                     bg-primary text-primary-foreground
                     rounded-[--radius-pill] text-sm font-medium
                     hover:opacity-90 active:scale-95
                     transition-all duration-200"
        >
          Accedi
        </Link>
      </nav>
    </header>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────
export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    // Hero entra con un leggero delay dopo il mount
    const t = setTimeout(() => setHeroVisible(true), 80);

    // Forza light mode sulla landing rimuovendo .dark da <html>
    // e la ripristina quando si lascia la pagina
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.remove("dark");

    return () => {
      clearTimeout(t);
      if (wasDark) html.classList.add("dark");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Sfondo decorativo: blob caldo dietro il contenuto */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, var(--ff-violet-light) 0%, transparent 70%)",
              opacity: 0.5,
            }}
          />
          <div
            className="absolute top-40 -left-40 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, var(--ff-amber-light) 0%, transparent 70%)",
              opacity: 0.5,
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── Testo Hero ── */}
            <div
              ref={heroRef}
              style={{
                transform: heroVisible ? "translateY(0)" : "translateY(32px)",
                opacity:   heroVisible ? 1 : 0,
                transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease",
              }}
              className="flex flex-col gap-6"
            >
              {/* Chip sopra il titolo */}
              <div className="inline-flex items-center gap-2 w-fit
                              bg-[--ff-violet-light] text-[--ff-violet-dark]
                              px-4 py-1.5 rounded-full text-xs font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[--ff-violet] inline-block" />
                Organizza. Concentrati. Completa.
              </div>

              {/* Headline — Georgia display */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem]
                             text-foreground leading-[1.1] tracking-tight">
                Il tuo flusso di lavoro,{" "}
                <span
                  className="relative inline-block"
                  style={{ color: "var(--ff-violet)" }}
                >
                  finalmente
                  {/* Sottolineatura decorativa SVG */}
                  <svg
                    viewBox="0 0 160 10"
                    fill="none"
                    className="absolute -bottom-1 left-0 w-full"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7 Q40 2 80 6 Q120 10 158 5"
                      stroke="var(--ff-amber)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                in ordine.
              </h1>

              {/* Sottotitolo — Geist body */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
                FocusFlow ti aiuta a gestire task, scadenze e priorità senza
                sentirti sopraffatto. Semplice da usare, potente quando serve.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5
                             bg-primary text-primary-foreground font-medium
                             rounded-[--radius-pill] text-sm
                             hover:opacity-90 active:scale-95
                             transition-all duration-200 shadow-sm"
                >
                  Inizia gratis
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor"
                      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5
                             bg-transparent text-foreground font-medium
                             rounded-[--radius-pill] text-sm
                             border border-border
                             hover:bg-muted hover:border-[--ff-sand-dark]
                             transition-all duration-200"
                >
                  Accedi
                </Link>
              </div>

              {/* Social proof minimale */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <div className="flex -space-x-1.5">
                  {["var(--ff-violet)", "var(--ff-amber)", "var(--ff-teal)", "var(--ff-coral)"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-background"
                        style={{ background: color, opacity: 0.8 }}
                      />
                    )
                  )}
                </div>
                <span>Usato da chi vuole fare le cose, non solo pianificarle.</span>
              </div>
            </div>

            {/* ── Illustrazione Hero ── */}
            <div
              style={{
                transform: heroVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
                opacity:   heroVisible ? 1 : 0,
                transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.9s ease",
                transitionDelay: "120ms",
              }}
            >
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-5xl mx-auto">

          {/* Intestazione sezione */}
          <div className="text-center mb-14">
            <p className="text-xs font-medium tracking-widest uppercase
                          text-[--ff-violet] mb-3">
              Funzionalità
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground
                           leading-tight tracking-tight">
              Tutto quello che ti serve,<br className="hidden sm:block" />
              niente di superfluo.
            </h2>
            <p className="mt-4 text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
              FocusFlow è costruito per chi vuole uno strumento che funziona
              — non uno da dover imparare per settimane.
            </p>
          </div>

          {/* Grid feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
            <FeatureCard
              icon={<IconTasks />}
              accent="violet"
              delay={0}
              title="Gestione task completa"
              description="Crea, organizza e completa i tuoi task con priorità, status personalizzati e scadenze. Categorie e tag per tenere tutto in ordine."
            />
            <FeatureCard
              icon={<IconCalendar />}
              accent="amber"
              delay={80}
              title="Vista calendario"
              description="Visualizza i tuoi task nel calendario. Trascina per spostare le scadenze. Hai sempre chiaro cosa ti aspetta oggi, questa settimana, questo mese."
            />
            <FeatureCard
              icon={<IconFilter />}
              accent="teal"
              delay={160}
              title="Filtri avanzati"
              description="Filtra per status, priorità, categoria, tag o intervallo di date. I filtri attivi restano sincronizzati nell'URL — condividi o riprendi da dove hai lasciato."
            />
            <FeatureCard
              icon={<IconSearch />}
              accent="coral"
              delay={240}
              title="Ricerca istantanea"
              description="Trova qualsiasi task in meno di un secondo con Cmd+K. La ricerca è globale, veloce e intelligente — niente più scroll infiniti."
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row
                        items-center justify-between gap-4">
          <span className="font-display text-lg text-foreground select-none">
            FocusFlow
          </span>
          <p className="text-xs text-muted-foreground">
            Fatto per chi ha cose da fare.
          </p>
          <Link
            to="/login"
            className="text-xs text-[--ff-violet] hover:underline
                       underline-offset-4 transition-all"
          >
            Accedi →
          </Link>
        </div>
      </footer>
    </div>
  );
}