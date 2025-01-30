"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Star, Eye, MessageCircle, Send, Download, CheckCircle2 } from "lucide-react";

type Exam = {
  id: string;
  title: string;
  subject: string;
  professor: string;
  year: number;
  semester: string;
  university: string;
  faculty: string;
  views: number;
  has_answer: boolean;
  file_url: string;
  created_at: string;
  exam_comments: {
    id: string;
    content: string;
    created_at: string;
    user: {
      username: string;
    };
  }[];
};

type ExamDetailProps = {
  examId: string;
};

export function ExamDetail({ examId }: ExamDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchExamDetails = useCallback(async () => {
    if (!examId) return;

    try {
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError) {
        console.error("Exam fetch error:", examError);
        throw examError;
      }

      // コメントを取得
      const { data: commentsData, error: commentsError } = await supabase
        .from("exam_comments")
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq("exam_id", examId)
        .order("created_at", { ascending: false });

      if (commentsError) {
        console.error("Comments fetch error:", commentsError);
        throw commentsError;
      }

      // ユーザー情報を取得
      const userIds = commentsData.map(comment => comment.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      if (usersError) {
        console.error("Users fetch error:", usersError);
        throw usersError;
      }

      // データを組み合わせる
      const comments = commentsData.map(comment => ({
        ...comment,
        user: usersData.find(user => user.id === comment.user_id)
      }));

      setExam({
        ...examData,
        exam_comments: comments
      });

    } catch (error: any) {
      console.error("Error details:", error);
      toast.error(error.message || "過去問の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const incrementViews = useCallback(async () => {
    if (!examId) return;

    try {
      await supabase.rpc("increment_views", { exam_id: examId });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  }, [examId]);

  useEffect(() => {
    fetchExamDetails();
    incrementViews();
  }, []);

  const handleComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      const { error } = await supabase
        .from("exam_comments")
        .insert({
          exam_id: examId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      fetchExamDetails();
      toast.success("コメントを投稿しました");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getFileUrl = (fileUrl: string) => {
    try {
      // URLからファイル名を抽出（完全なパスまたはファイル名のみに対応）
      const fileName = fileUrl.includes('/')
        ? fileUrl.split('/').pop()
        : fileUrl;

      if (!fileName) {
        console.error('Invalid file URL:', fileUrl);
        return null;
      }

      const { data } = supabase.storage
        .from('exam-files')
        .getPublicUrl(fileName);

      console.log('File name:', fileName);
      console.log('Generated URL:', data.publicUrl);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error generating file URL:', error);
      return null;
    }
  };

  if (loading) {
    return <div className="container py-16 text-center">読み込み中...</div>;
  }

  if (!exam) {
    return <div className="container py-16 text-center">過去問が見つかりません</div>;
  }

  return (
    <div className="container py-16">
      <Card>
        <CardHeader>
          <CardTitle>{exam.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {exam.views}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {exam.exam_comments.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">基本情報</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">科目</dt>
                  <dd>{exam.subject}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">担当教員</dt>
                  <dd>{exam.professor}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">年度・学期</dt>
                  <dd>{exam.year}年度 {exam.semester}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">大学・学部</dt>
                  <dd>{exam.university} {exam.faculty}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-medium mb-2">ファイル</h3>
              {exam.has_answer && (
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mb-4">
                  <CheckCircle2 className="h-4 w-4" />
                  解答・解説あり
                </p>
              )}
              <Button asChild className="w-full">
                <a 
                  href={exam?.file_url ? getFileUrl(exam.file_url) || '#' : '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    if (!exam?.file_url) {
                      e.preventDefault();
                      toast.error('ファイルが見つかりません');
                      return;
                    }

                    const url = getFileUrl(exam.file_url);
                    if (!url) {
                      e.preventDefault();
                      toast.error('ファイルのURLの生成に失敗しました');
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                  ダウンロード
                </a>
              </Button>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-4">コメント</h3>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="コメントを入力"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={handleComment} disabled={submitting}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {exam.exam_comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <p className="mb-2">{comment.content}</p>
                    <p className="text-sm text-muted-foreground">
                      {comment.user.username} • {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 