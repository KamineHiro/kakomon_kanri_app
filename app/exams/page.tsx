"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Upload,
  Star,
  Eye,
  MessageCircle,
  Search as SearchIcon,
  Building2,
  GraduationCap,
  Calendar,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

type Exam = {
  id: string;
  title: string;
  subject: string;
  professor: string;
  year: number;
  semester: string;
  university: string;
  faculty: string;
  rating: number;
  views: number;
  has_answer: boolean;
  created_at: string;
  user: {
    username: string;
  };
  exam_comments: {
    id: string;
  }[];
};

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    university: "all",
    faculty: "all",
    year: "all",
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          exam_comments (count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error: any) {
      toast.error("過去問の取得に失敗しました");
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = 
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      exam.subject.toLowerCase().includes(search.toLowerCase()) ||
      exam.professor.toLowerCase().includes(search.toLowerCase());

    const matchesUniversity = filter.university === "all" || exam.university === filter.university;
    const matchesFaculty = filter.faculty === "all" || exam.faculty === filter.faculty;
    const matchesYear = filter.year === "all" || exam.year.toString() === filter.year;

    return matchesSearch && matchesUniversity && matchesFaculty && matchesYear;
  });

  const universities = Array.from(new Set(exams.map((exam) => exam.university)));
  const faculties = Array.from(new Set(exams.map((exam) => exam.faculty)));
  const years = Array.from(new Set(exams.map((exam) => exam.year))).sort((a, b) => b - a);

  if (loading) {
    return <div className="container py-16 text-center">読み込み中...</div>;
  }

  return (
    <div className="container py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">過去問一覧</h1>
        <Button asChild className="group">
          <Link href="/exams/upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4 group-hover:scale-110 transition-transform" />
            アップロード
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[200px_1fr] mb-8">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              大学
            </h3>
            <Select
              value={filter.university}
              onValueChange={(value) => setFilter({ ...filter, university: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {universities.map((uni) => (
                  <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              学部
            </h3>
            <Select
              value={filter.faculty}
              onValueChange={(value) => setFilter({ ...filter, faculty: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              年度
            </h3>
            <Select
              value={filter.year}
              onValueChange={(value) => setFilter({ ...filter, year: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}年度</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="タイトル、科目名、教員名で検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {exam.subject} • {exam.professor}
                  </p>
                  <p className="text-sm">
                    {exam.university} {exam.faculty}
                  </p>
                  <p className="text-sm">
                    {exam.year}年度 {exam.semester}
                  </p>
                  {exam.has_answer && (
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      解答・解説あり
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {exam.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {exam.exam_comments?.length || 0}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild className="group">
                    <Link href={`/exams/${exam.id}`} className="flex items-center gap-2">
                      詳細
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}