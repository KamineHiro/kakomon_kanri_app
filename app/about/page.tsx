"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Shield,
  ArrowRight,
  UserPlus,
  Mail,
  School,
  User,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-16">
      {/* メインセクション */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6 flex items-center justify-center gap-3">
          <Info className="h-8 w-8 text-primary" />
          このサイトについて
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          このサイトは、大学生のための過去問共有プラットフォームです。
          学生同士で過去問を共有し、より良い学習環境を作ることを目指しています。
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="group">
            <Link href="/auth/sign-up" className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
              アカウントを作成
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="group">
            <Link href="/exams" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              過去問を見る
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="max-w-5xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">主な特徴</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="group hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                過去問の共有
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                大学の試験問題や解答を安全に共有できます。
                アップロードした資料は他の学生も閲覧できます。
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                セキュリティ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                大学のメールアドレスによる認証で、
                安全な学習環境を提供します。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 利用規約セクション */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
          <Lock className="h-7 w-7 text-primary" />
          利用規約
        </h2>
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none p-6">
            <h3 className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              1. 利用条件
            </h3>
            <p>
              本サービスは、大学に所属する学生のみが利用できます。
              登録には大学のメールアドレス（.ac.jp）が必要です。
            </p>

            <h3 className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              2. 投稿コンテンツについて</h3>
            <p>
              ユーザーは、著作権や他の権利を侵害しないコンテンツのみを投稿できます。
              不適切なコンテンツは予告なく削除される場合があります。
            </p>

            <h3 className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              3. 禁止事項</h3>
            <ul>
              <li>著作権を侵害するコンテンツの投稿</li>
              <li>個人情報の投稿や収集</li>
              <li>商業目的での利用</li>
              <li>システムに負荷をかける行為</li>
              <li>その他、運営が不適切と判断する行為</li>
            </ul>

            <h3 className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              4. 免責事項</h3>
            <p>
              本サービスは、投稿された情報の正確性を保証しません。
              利用者は自己責任で本サービスを利用するものとします。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 運営者セクション */}
      <section className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold mb-8">運営者情報</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-8">
              {/* プロフィール画像 */}
              <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="public/images/myImage.jpg"
                  alt="赤嶺 紘基"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              {/* プロフィール情報 */}
              <div className="text-left space-y-4">
                <div>
                  <h3 className="font-medium mb-2">運営者</h3>
                  <p className="text-muted-foreground">
                    赤嶺 紘基
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">所属</h3>
                  <p className="text-muted-foreground">
                    琉球大学 工学部 知能情報コース
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* お問い合わせセクション */}
      <section className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">お問い合わせ</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">
              ご質問やご要望がございましたら、以下のメールアドレスまでお気軽にお問い合わせください。
            </p>
            <p className="font-medium">
              hiroki080602@gmail.com
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 