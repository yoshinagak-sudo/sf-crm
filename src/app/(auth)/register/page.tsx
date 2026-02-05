"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (name.length < 2) {
      errors.name = "名前は2文字以上で入力してください";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "有効なメールアドレスを入力してください";
    }

    if (password.length < 8) {
      errors.password = "パスワードは8文字以上で入力してください";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "パスワードが一致しません";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登録に失敗しました");
        return;
      }

      // 登録成功 - ログインページへリダイレクト
      router.push("/login?registered=true");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-4">
          <h1 className="text-xl font-semibold text-slate-800 text-center">
            新規登録
          </h1>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* 名前 */}
          <Input
            label="名前"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            required
            autoComplete="name"
            error={fieldErrors.name}
          />

          {/* メールアドレス */}
          <Input
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.com"
            required
            autoComplete="email"
            error={fieldErrors.email}
          />

          {/* パスワード */}
          <Input
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8文字以上"
            required
            autoComplete="new-password"
            error={fieldErrors.password}
          />

          {/* パスワード確認 */}
          <Input
            label="パスワード（確認）"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="もう一度入力"
            required
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />

          {/* 登録ボタン */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            disabled={!name || !email || !password || !confirmPassword}
          >
            登録する
          </Button>
        </CardBody>

        <CardFooter className="text-center">
          <p className="text-sm text-slate-600">
            すでにアカウントをお持ちの方は{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              ログイン
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
