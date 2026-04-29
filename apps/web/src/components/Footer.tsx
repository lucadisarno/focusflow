// ─── FOOTER ───────────────────────────────────────────────
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Sinistra: brand + copyright */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="font-display text-sm"
            style={{ color: "var(--ff-violet)" }}
          >
            FocusFlow
          </span>
          <span className="opacity-40">·</span>
          <span>© {year} Luca Di Sarno. Tutti i diritti riservati.</span>
        </div>

        {/* Destra: link alla landing */}
        <a
          href="https://focusflow-web-theta.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground
                     underline underline-offset-4 decoration-[--ff-violet-light]
                     hover:decoration-[--ff-violet] transition-colors duration-200"
        >
          focusflow.app
        </a>

      </div>
    </footer>
  );
}