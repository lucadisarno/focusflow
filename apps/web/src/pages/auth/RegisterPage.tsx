import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, signIn } from "@/lib/auth-client";

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Forza light mode ────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.remove("dark");
    return () => { if (wasDark) html.classList.add("dark"); };
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.length < 2)                   e.name = "Minimo 2 caratteri";
    if (!form.email.includes("@"))              e.email = "Email non valida";
    if (form.password.length < 8)               e.password = "Minimo 8 caratteri";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Le password non coincidono";
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    if (result.error) {
      setError(result.error.message ?? "Errore durante la registrazione");
      setLoading(false);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--ff-warm-bg)" }}
    >
      {/* ── Pannello sinistro decorativo — ambra ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12"
        style={{ backgroundColor: "var(--ff-amber-light)" }}
      >
        {/* Logo */}
        <Link to="/">
          <span className="font-display text-2xl" style={{ color: "var(--ff-amber-dark)" }}>
            FocusFlow
          </span>
        </Link>

        {/* Testo centrale */}
        <div className="space-y-4">
          <p
            className="font-display text-3xl leading-snug"
            style={{ color: "var(--ff-amber-dark)" }}
          >
            "Il momento migliore per iniziare era ieri. Il secondo momento migliore è adesso."
          </p>
          <p className="text-sm" style={{ color: "var(--ff-amber)" }}>
            — crea il tuo account
          </p>
        </div>

        {/* Illustrazione mini SVG — tre step */}
        <svg viewBox="0 0 300 160" fill="none" className="w-full opacity-60" aria-hidden="true">
          {/* Step 1 */}
          <rect x="10" y="50" width="80" height="60" rx="12"
            fill="white" stroke="var(--ff-amber)" strokeWidth="1" opacity="0.8" />
          <circle cx="30" cy="72" r="8" fill="var(--ff-amber-light)" />
          <text x="30" y="76" textAnchor="middle" fontSize="9"
            fill="var(--ff-amber-dark)" fontWeight="600">1</text>
          <rect x="44" y="67" width="36" height="5" rx="2.5" fill="var(--ff-sand)" />
          <rect x="44" y="77" width="24" height="4" rx="2" fill="var(--ff-sand)" opacity="0.6" />
          <rect x="16" y="90" width="68" height="12" rx="6"
            fill="var(--ff-amber)" opacity="0.7" />
          <rect x="24" y="94" width="36" height="4" rx="2" fill="white" opacity="0.8" />

          {/* Freccia */}
          <path d="M94 80h22" stroke="var(--ff-amber)" strokeWidth="1.5"
            strokeLinecap="round" markerEnd="url(#arr-amber)" />
          <defs>
            <marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="6" markerHeight="6" orient="auto">
              <path d="M2 2L8 5L2 8" fill="none" stroke="var(--ff-amber)"
                strokeWidth="1.5" strokeLinecap="round" />
            </marker>
          </defs>

          {/* Step 2 */}
          <rect x="110" y="50" width="80" height="60" rx="12"
            fill="white" stroke="var(--ff-amber)" strokeWidth="1" opacity="0.8" />
          <circle cx="130" cy="72" r="8" fill="var(--ff-violet-light)" />
          <text x="130" y="76" textAnchor="middle" fontSize="9"
            fill="var(--ff-violet-dark)" fontWeight="600">2</text>
          <rect x="144" y="67" width="36" height="5" rx="2.5" fill="var(--ff-sand)" />
          <rect x="144" y="77" width="24" height="4" rx="2" fill="var(--ff-sand)" opacity="0.6" />
          <rect x="116" y="90" width="68" height="12" rx="6"
            fill="var(--ff-violet)" opacity="0.7" />
          <rect x="124" y="94" width="36" height="4" rx="2" fill="white" opacity="0.8" />

          {/* Freccia */}
          <path d="M194 80h22" stroke="var(--ff-amber)" strokeWidth="1.5"
            strokeLinecap="round" />

          {/* Step 3 */}
          <rect x="210" y="50" width="80" height="60" rx="12"
            fill="white" stroke="var(--ff-teal)" strokeWidth="1" opacity="0.8" />
          <circle cx="230" cy="72" r="8" fill="var(--ff-teal-light)" />
          <path d="M226 72l3 3 6-6" stroke="var(--ff-teal)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
          <rect x="244" y="67" width="36" height="5" rx="2.5" fill="var(--ff-sand)" />
          <rect x="244" y="77" width="24" height="4" rx="2" fill="var(--ff-sand)" opacity="0.6" />
          <rect x="216" y="90" width="68" height="12" rx="6"
            fill="var(--ff-teal)" opacity="0.7" />
          <rect x="224" y="94" width="36" height="4" rx="2" fill="white" opacity="0.8" />

          {/* Etichette step */}
          <text x="50"  y="124" textAnchor="middle" fontSize="9"
            fill="var(--ff-amber-dark)" fontFamily="sans-serif">Registrati</text>
          <text x="150" y="124" textAnchor="middle" fontSize="9"
            fill="var(--ff-amber-dark)" fontFamily="sans-serif">Organizza</text>
          <text x="250" y="124" textAnchor="middle" fontSize="9"
            fill="var(--ff-amber-dark)" fontFamily="sans-serif">Completa</text>
        </svg>
      </div>

      {/* ── Pannello destro: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Logo mobile */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="font-display text-2xl text-foreground">
            FocusFlow
          </Link>
        </div>

        <div className="w-full max-w-sm space-y-8">

          {/* Titolo */}
          <div className="space-y-1">
            <h1 className="font-display text-3xl text-foreground">Crea account.</h1>
            <p className="text-sm text-muted-foreground">
              Inizia a usare FocusFlow gratuitamente.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">

            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Mario Rossi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11 rounded-[--radius-lg] border-border bg-background
                           focus-visible:ring-[--ff-violet] focus-visible:ring-2
                           focus-visible:ring-offset-0 focus-visible:border-[--ff-violet]"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@esempio.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 rounded-[--radius-lg] border-border bg-background
                           focus-visible:ring-[--ff-violet] focus-visible:ring-2
                           focus-visible:ring-offset-0 focus-visible:border-[--ff-violet]"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-11 rounded-[--radius-lg] border-border bg-background
                           focus-visible:ring-[--ff-violet] focus-visible:ring-2
                           focus-visible:ring-offset-0 focus-visible:border-[--ff-violet]"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Conferma password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Conferma password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="h-11 rounded-[--radius-lg] border-border bg-background
                           focus-visible:ring-[--ff-violet] focus-visible:ring-2
                           focus-visible:ring-offset-0 focus-visible:border-[--ff-violet]"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Errore globale */}
            {error && (
              <div
                className="rounded-[--radius-lg] px-4 py-3 text-sm"
                style={{
                  backgroundColor: "var(--ff-coral-light)",
                  color: "var(--ff-coral)",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-[--radius-pill] text-sm font-medium
                         transition-all duration-200 active:scale-95
                         disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--ff-violet)",
                color: "white",
              }}
            >
              {loading ? "Registrazione in corso..." : "Crea account"}
            </button>

            {/* Divisore */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-3 text-xs text-muted-foreground"
                  style={{ backgroundColor: "var(--ff-warm-bg)" }}
                >
                  oppure
                </span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => signIn.social({ provider: "google", callbackURL: "/dashboard" })}
              className="w-full h-11 rounded-[--radius-pill] text-sm font-medium
                         border border-border bg-background text-foreground
                         hover:bg-muted hover:border-[--ff-sand-dark]
                         transition-all duration-200 active:scale-95
                         flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continua con Google
            </button>
          </form>

          {/* Link login */}
          <p className="text-center text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link
              to="/login"
              className="font-medium underline underline-offset-4 text-foreground
                         hover:text-[--ff-violet] transition-colors"
            >
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}