"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Search, 
  BookOpen, 
  Users, 
  ArrowRight, 
  Info,
  FileText,
  Users2,
  School,
  BookMarked,
  UserCheck
} from "lucide-react";

const StatsSection = () => {
  const [stats, setStats] = useState({
    examCount: 0,
    userCount: 0,
    universityCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: examCount } = await supabase
          .from('exams')
          .select('id', { count: 'exact' });

        const { data: userCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });

        const { data: universities } = await supabase
          .from('exams')
          .select('university');

        const uniqueUniversities = new Set(universities?.map((exam: { university: string }) => exam.university));

        setStats({
          examCount: examCount?.length || 0,
          userCount: userCount?.length || 0,
          universityCount: uniqueUniversities.size
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex justify-center mb-4">
            <FileText className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-4xl font-bold mb-2">{stats.examCount}</h3>
          <p className="text-muted-foreground">過去問数</p>
        </div>
        <div className="group p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex justify-center mb-4">
            <UserCheck className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-4xl font-bold mb-2">{stats.userCount}</h3>
          <p className="text-muted-foreground">利用者数</p>
        </div>
        <div className="group p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex justify-center mb-4">
            <School className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-4xl font-bold mb-2">{stats.universityCount}</h3>
          <p className="text-muted-foreground">対応大学数</p>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background/95 to-accent/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          過去問を共有・アクセス
          <span className="text-primary block mt-2">簡単に</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
          大学生のための過去問共有プラットフォーム。解答・解説も含めた学習資料を共有しましょう。
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="group">
            <Link href="/auth/sign-up" className="flex items-center gap-2">
              はじめる
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="group">
            <Link href="/about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              詳しく見る
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                スマート検索
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                科目、教授、年度など、詳細な検索・フィルタリング機能で必要な過去問を素早く見つけられます。
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                学習資料
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                過去問だけでなく、解答・解説、学習ガイドなど、充実した資料を利用できます。
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                コミュニティ（未実装）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                仲間と繋がり、学習グループに参加して、一緒に解答を作成しましょう。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />
    </main>
  );
}