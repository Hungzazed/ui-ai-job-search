"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { authService } from "@/services";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Chỉ nhận đường dẫn nội bộ. Không kiểm tra thì "?next=https://ke-gian.com"
  // sẽ biến trang đăng nhập thành bàn đạp chuyển hướng cho trang lừa đảo.
  const rawNext = params.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//")
    ? rawNext
    : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Backend đặt cookie httpOnly trong phản hồi này; nhờ withCredentials,
      // trình duyệt lưu lại và tự gửi kèm ở mọi lời gọi sau.
      await authService.login(email, password);

      // refresh() để middleware chạy lại và thấy cookie vừa được đặt; thiếu nó
      // thì router vẫn giữ kết quả điều hướng của phiên chưa đăng nhập.
      router.replace(next);
      router.refresh();
    } catch (error) {
      setError(
        apiErrorStatus(error) === 401
          ? "Email hoặc mật khẩu không đúng"
          : apiErrorMessage(error, "Đăng nhập không thành công"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Sparkles className="size-5" />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            AI Career Agent
          </h1>
          <p className="text-sm text-slate-500">
            Đăng nhập để xem việc làm phù hợp với hồ sơ của bạn
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ban@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700"
            >
              <AlertCircle className="mt-px size-4 shrink-0" />
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {!loading && <LogIn className="size-4" />}
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  // useSearchParams cần Suspense, nếu không cả trang bị ép sang render động.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
