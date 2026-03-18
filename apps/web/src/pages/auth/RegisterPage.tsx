import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (form.name.length < 2) newErrors.name = "Il nome deve essere di almeno 2 caratteri";
    if (!form.email.includes("@")) newErrors.email = "Email non valida";
    if (form.password.length < 8) newErrors.password = "La password deve essere di almeno 8 caratteri";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Le password non coincidono";
    return newErrors;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crea account</CardTitle>
          <CardDescription>Inizia a usare FocusFlow gratuitamente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Mario Rossi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@esempio.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrazione in corso..." : "Registrati"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn.social({ provider: "google", callbackURL: "/dashboard" })}
            >
              Continua con Google
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Hai già un account?{" "}
            <Link to="/login" className="underline hover:text-primary">Accedi</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}