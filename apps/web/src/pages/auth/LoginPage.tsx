import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email.includes("@")) newErrors.email = "Email non valida";
    if (form.password.length < 8) newErrors.password = "La password deve essere di almeno 8 caratteri";
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

    const result = await signIn.email({
      email: form.email,
      password: form.password,
    });

    if (result.error) {
      setError(result.error.message ?? "Errore durante il login");
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bentornato</CardTitle>
          <CardDescription>Accedi al tuo account FocusFlow</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
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

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Accesso in corso..." : "Accedi"}
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
            Non hai un account?{" "}
            <Link to="/register" className="underline hover:text-primary">Registrati</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}