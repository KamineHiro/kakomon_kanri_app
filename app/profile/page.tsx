"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Profile = {
  username: string;
  university: string;
  faculty: string;
  department: string;
  grade: string;
  bio: string;
  email: string;
};

const initialProfile: Profile = {
  username: "",
  university: "",
  faculty: "",
  department: "",
  grade: "",
  bio: "",
  email: "",
};

const grades = ["1年生", "2年生", "3年生", "4年生", "修士1年", "修士2年", "博士"];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setProfile({
        username: data?.username || "",
        university: data?.university || "",
        faculty: data?.faculty || "",
        department: data?.department || "",
        grade: data?.grade || "",
        bio: data?.bio || "",
        email: user.email || "",
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("認証が必要です");

      const { email, ...updateData } = profile;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...updateData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("プロフィールを更新しました");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const ProfileField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-sm text-muted-foreground">{value || "未設定"}</p>
    </div>
  );

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>プロフィール</CardTitle>
            <CardDescription>
              {isEditing ? "プロフィール情報を編集" : "あなたのプロフィール情報"}
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              編集
            </Button>
          )}
        </CardHeader>

        {isEditing ? (
          <form onSubmit={updateProfile}>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">ユーザー名</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled={true}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="university">大学</Label>
                  <Input
                    id="university"
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faculty">学部</Label>
                  <Input
                    id="faculty"
                    value={profile.faculty}
                    onChange={(e) => setProfile({ ...profile, faculty: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">学科</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">学年</Label>
                  <Select
                    value={profile.grade}
                    onValueChange={(value) => setProfile({ ...profile, grade: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="学年を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={loading}
                  rows={4}
                  placeholder="自己紹介を入力してください"
                />
              </div>
            </CardContent>
            <CardContent className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsEditing(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "更新中..." : "更新"}
              </Button>
            </CardContent>
          </form>
        ) : (
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileField label="ユーザー名" value={profile.username} />
              <ProfileField label="メールアドレス" value={profile.email} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileField label="大学" value={profile.university} />
              <ProfileField label="学部" value={profile.faculty} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileField label="学科" value={profile.department} />
              <ProfileField label="学年" value={profile.grade} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">自己紹介</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {profile.bio || "未設定"}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
} 