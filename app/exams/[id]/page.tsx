import { supabase } from "@/lib/supabase";
import { ExamDetail } from "./exam-detail";

// サーバーコンポーネント
export async function generateStaticParams() {
  try {
    const { data: exams, error } = await supabase.from("exams").select("id");

    if (error) {
      console.error("Failed to fetch exams:", error);
      return [];
    }

    return (exams || []).map((exam) => ({
      id: exam.id.toString(), // IDを文字列に統一
    }));
  } catch (err) {
    console.error("Unexpected error in generateStaticParams:", err);
    return [];
  }
}

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // params を await で解決
  const { id: examId } = await params;

  if (!examId) {
    return <div className="container py-16 text-center">過去問が見つかりません</div>;
  }

  return <ExamDetail examId={examId} />;
}
