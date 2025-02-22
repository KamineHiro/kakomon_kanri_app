"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Upload,
  MessageCircle,
  Eye,
  Clock,
  FileText,
  ArrowRight,
  LayoutDashboard
} from "lucide-react";

type DashboardData = {
  totalUploads: number;
  totalComments: number;
  recentExams: {
    id: string;
    title: string;
    subject: string;
    views: number;
    created_at: string;
    file_url?: string;
    file_status?: string;
  }[];
  recentComments: {
    id: string;
    content: string;
    created_at: string;
    exam: {
      id: string;
      title: string;
    };
  }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    totalUploads: 0,
    totalComments: 0,
    recentExams: [],
    recentComments: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }

      // アップロード数を取得
      const { data: examsData, error: examsError } = await supabase
        .from("exams")
        .select("id")
        .eq("user_id", user.id);

      if (examsError) throw examsError;

      // コメント数を取得
      const { data: commentsData, error: commentsError } = await supabase
        .from("exam_comments")
        .select("id")
        .eq("user_id", user.id);

      if (commentsError) throw commentsError;

      // 最近のアップロード
      const { data: recentExams, error: recentExamsError } = await supabase
        .from("exams")
        .select(`
          id, 
          title, 
          subject, 
          views, 
          created_at,
          file_url,
          file_status
        `)
        .eq("user_id", user.id)
        .eq("file_status", "processed")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentExamsError) throw recentExamsError;

      // 最近のコメント
      const { data: recentComments, error: recentCommentsError } = await supabase
        .from("exam_comments")
        .select(`
          id,
          content,
          created_at,
          exams!exam_id(
            id,
            title
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentCommentsError) throw recentCommentsError;

      // データの形式を変換
      const formattedComments = recentComments?.map(comment => ({
        ...comment,
        exam: comment.exams[0] // 配列の最初の要素を取得
      }));

      setData({
        totalUploads: examsData.length,
        totalComments: commentsData.length,
        recentExams: recentExams || [],
        recentComments: formattedComments || [],
      });
    } catch (error: any) {
      toast.error("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container py-16 text-center">読み込み中...</div>;
  }

  return (
    <div className="container py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary animate-in fade-in slide-in-from-left-5 duration-500" />
          <span className="animate-in fade-in slide-in-from-left-5 duration-500 delay-150">
            マイダッシュボード
          </span>
        </h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                アップロード数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{data.totalUploads}</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                コメント数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{data.totalComments}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                最近のアップロード
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {data.recentExams.length > 0 ? (
                <div className="divide-y">
                  {data.recentExams.map((exam) => (
                    <div key={exam.id} className="py-4 first:pt-0 last:pb-0 group/item">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link
                            href={`/exams/${exam.id}`}
                            className="font-medium hover:text-primary flex items-center gap-2 mb-1"
                          >
                            {exam.title}
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                          </Link>
                          <p className="text-sm text-muted-foreground">{exam.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(exam.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">            
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {exam.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>まだアップロードがありません</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                最近のコメント
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {data.recentComments.length > 0 ? (
                <div className="divide-y">
                  {data.recentComments.map((comment) => (
                    <div key={comment.id} className="py-4 first:pt-0 last:pb-0 group/item">
                      <p className="text-sm mb-2 line-clamp-2">{comment.content}</p>
                      <Link
                        href={`/exams/${comment.exam.id}`}
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        <span className="flex-1">{comment.exam.title}</span>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>まだコメントがありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 