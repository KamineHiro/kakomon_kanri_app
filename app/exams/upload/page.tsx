"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function UploadExam() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    professor: "",
    year: new Date().getFullYear(),
    semester: "",
    university: "",
    faculty: "",
    has_answer: false,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("ファイルを選択してください");
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("ログインが必要です");

      // Upload file
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("exam-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("exam-files")
        .getPublicUrl(fileName);

      // Create exam record
      const { error: examError } = await supabase
        .from("exams")
        .insert({
          ...formData,
          user_id: user.id,
          file_url: fileName,
          file_type: fileExt,
        });

      if (examError) throw examError;

      toast.success("過去問がアップロードされました");
      router.push("/exams");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <Card>
        <CardHeader>
          <CardTitle>過去問のアップロード</CardTitle>
          <CardDescription>
            過去問の情報を入力し、PDFまたは画像ファイルをアップロードしてください
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">科目名</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professor">担当教員</Label>
              <Input
                id="professor"
                value={formData.professor}
                onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">年度</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">学期</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="学期を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="前期">前期</SelectItem>
                    <SelectItem value="後期">後期</SelectItem>
                    <SelectItem value="通年">通年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">大学名</Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty">学部</Label>
              <Input
                id="faculty"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="has_answer"
                checked={formData.has_answer}
                onCheckedChange={(checked) => setFormData({ ...formData, has_answer: checked })}
              />
              <Label htmlFor="has_answer">解答・解説あり</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">ファイル</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-sm text-muted-foreground">
                ※ PDF、JPG、PNGファイルのみアップロード可能です
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "アップロード中..." : "アップロード"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}