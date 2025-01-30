"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // メールドメインの確認 (.ac.jp のみ許可)
      if (!email.endsWith('.ac.jp')) {
        throw new Error('大学のメールアドレス（.ac.jp）のみ登録可能です');
      }

      // 1. まずユーザー登録を行う
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'student',
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('ユーザー登録に失敗しました');

      // 2. 少し待機してからプロフィール作成を試みる
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. プロフィールの作成を試みる（最大3回）
      let profileError;
      for (let i = 0; i < 3; i++) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: email,
            username: email.split('@')[0],
            university: email.split('@')[1].split('.')[0],
            faculty: "",
            department: "",
            grade: "",
            bio: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (!error) {
          profileError = null;
          break;
        }
        
        profileError = error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (profileError) throw profileError;
      
      toast.success("アカウントが作成されました");
      router.push("/auth/sign-in");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-16">
      <Card>
        <CardHeader>
          <CardTitle>アカウント作成</CardTitle>
          <CardDescription>
            大学のメールアドレスで登録して、過去問の共有を始めましょう
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">大学のメールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="university@example.ac.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                ※ .ac.jp ドメインのメールアドレスのみ登録可能です
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-sm text-muted-foreground">
                ※ 8文字以上で設定してください
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "作成中..." : "アカウントを作成"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/auth/sign-in")}
            >
              すでにアカウントをお持ちの方
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}