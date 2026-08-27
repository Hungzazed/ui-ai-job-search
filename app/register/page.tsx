"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkle, UserPlus, WarningCircle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { authService } from "@/services";

/**
 * Khớp với `MinLength(8)` của `RegisterDto` ở backend.
 *
 * Kiểm ở client là để người dùng biết ngay, KHÔNG phải để thay backend kiểm:
 * backend vẫn từ chối độc lập, và phải như vậy vì client nào cũng sửa được.
 */
const MIN_PASSWORD_LENGTH = 8;

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Cùng cách chặn như trang đăng nhập: chỉ nhận đường dẫn nội bộ, nếu không
  // "?next=https://ke-gian.com" biến trang này thành bàn đạp chuyển hướng.
  const rawNext = params.get("next") ?? "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setDuplicate(false);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự`);
      return;
    }
    // Chỉ kiểm ở client: backend không nhận trường này, và cũng không nên nhận -
    // nó là cách bắt lỗi gõ nhầm, không phải một phần của hồ sơ.
    if (password !== confirm) {
      setError("Hai lần nhập mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      // Backend đặt cookie httpOnly ngay trong phản hồi đăng ký, nên không phải
      // đăng nhập lại sau khi tạo tài khoản.
      await authService.register(email, password, name);

      router.replace(next);
      // refresh() để middleware chạy lại và thấy cookie vừa đặt; thiếu nó thì
      // router vẫn giữ kết quả điều hướng của phiên chưa đăng nhập.
      router.refresh();
    } catch (err) {
      // 409 là email đã có người dùng — một kết luận, không phải sự cố. Nó cần
      // một lối đi tiếp (sang đăng nhập) chứ không chỉ một dòng chữ đỏ.
      if (apiErrorStatus(err) === 409) {
        setDuplicate(true);
      } else {
        setError(apiErrorMessage(err, "Tạo tài khoản không thành công"));
      }
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <span className="inline-flex size-11 items-center justify-center text-primary-600">
            <Sparkle className="size-5.5" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Tạo tài khoản
          </h1>
          <p className="text-sm text-slate-500">
            Điền hồ sơ một lần, hệ thống tự chấm điểm mọi tin tuyển dụng mới
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

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
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-400">
              Ít nhất {MIN_PASSWORD_LENGTH} ký tự
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Nhập lại mật khẩu</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {duplicate && (
            <p
              role="alert"
              className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800"
            >
              Email này đã được đăng ký.{" "}
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="font-semibold underline underline-offset-2"
              >
                Đăng nhập thay vì tạo mới
              </Link>
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700"
            >
              <WarningCircle className="mt-px size-4.5 shrink-0" />
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {!loading && <UserPlus className="size-4.5" />}
            Tạo tài khoản
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Đã có tài khoản?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-slate-900 underline underline-offset-2"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  // useSearchParams cần Suspense, nếu không cả trang bị ép sang render động.
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
