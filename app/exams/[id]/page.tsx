import { ExamDetail } from "./exam-detail";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"; // サーバーコンポーネント用
import { cookies } from "next/headers";

// サーバーコンポーネント
export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies }); // Supabase クライアントを作成
  const { data: exams } = await supabase
    .from("exams")
    .select("id");

  return (exams || []).map((exam) => ({
    id: exam.id,
  }));
}

export default function ExamDetailPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    return <div className="container py-16 text-center">過去問が見つかりません</div>;
  }

  return <ExamDetail examId={params.id} />;
}
