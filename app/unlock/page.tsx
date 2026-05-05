"use client";

// Unlock-sidan — enkel form för att skicka access-koden
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Loader2 } from "lucide-react";

export default function UnlockPage() {
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        // Hård navigering så middlewaren ser den nya cookien
        window.location.href = "/";
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Fel kod");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-950 p-3">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold">Fluentic AI</h1>
            <p className="text-sm text-slate-500">
              Ange access-koden för att fortsätta.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <Input
              type="password"
              placeholder="Access-kod"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              disabled={loading}
            />
            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2 text-center">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || !code.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Lås upp
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
