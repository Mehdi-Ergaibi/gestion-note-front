import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "./contexts/AuthContext";
import { api } from "./api";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReloadIcon } from "@radix-ui/react-icons";

// Schéma de validation
const formSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(4, "Le mot de passe doit contenir au moins 4 caractères"),
});

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    setLoading(true);

    try {
      const { token } = await api.login(values.email, values.password);
      await localStorage.setItem("jwtToken", token);
      login(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse e-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nom@example.com"
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••"
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
