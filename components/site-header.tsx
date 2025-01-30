"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User2, 
  LogOut, 
  Home, 
  Search, 
  Info, 
  Menu, 
  X,
  BookOpen,
  Upload,
  Settings 
} from "lucide-react";
import { isIP } from "net";

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const routes = [
    {
      href: "/",
      label: "ホーム",
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: "/exams",
      label: "過去問検索",
      icon: <Search className="h-4 w-4" />,
    },
    {
      href: "/about",
      label: "このアプリについて",
      icon: <Info className="h-4 w-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 transition-colors hover:opacity-80">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold hidden md:inline">過去問シェア</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center space-x-2 text-sm transition-all duration-200 hover:scale-105",
                "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                pathname === route.href 
                  ? "text-foreground after:w-full" 
                  : "text-foreground/60 hover:text-foreground"
              )}
            >
              {route.icon}
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 transition-all duration-200 hover:scale-105 hover:bg-accent/80"
                >
                  <User2 className="h-4 w-4" />
                  <span className="hidden md:inline">マイページ</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center transition-colors duration-200 hover:bg-accent/80"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    ダッシュボード
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User2 className="h-4 w-4 mr-2" />
                    プロフィール編集
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/exams/upload" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    過去問アップロード
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="transition-all duration-200 hover:scale-105 hover:bg-accent/80"
              >
                <Link href="/auth/sign-in" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  ログイン
                </Link>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                asChild
                className="transition-all duration-200 hover:scale-105 hover:bg-primary/90"
              >
                <Link href="/auth/sign-up">新規登録</Link>
              </Button>
            </div>
          )}
          
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニューを開く"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="container py-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "block py-2 text-base transition-colors hover:text-foreground/80",
                  pathname === route.href ? "text-foreground" : "text-foreground/60"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            {user ? (
              <div className="border-t mt-4 pt-4 space-y-2">
                <Link
                  href="/dashboard"
                  className="block py-2 text-base text-foreground/60 hover:text-foreground/80"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/profile"
                  className="block py-2 text-base text-foreground/60 hover:text-foreground/80"
                  onClick={() => setIsMenuOpen(false)}
                >
                  プロフィール編集
                </Link>
                <Link
                  href="/exams/upload"
                  className="block py-2 text-base text-foreground/60 hover:text-foreground/80"
                  onClick={() => setIsMenuOpen(false)}
                >
                  過去問アップロード
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-base text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="border-t mt-4 pt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/auth/sign-in" onClick={() => setIsMenuOpen(false)}>
                    <span className="text-lg mr-2">🔑</span>
                    ログイン
                  </Link>
                </Button>
                <Button variant="default" className="w-full" asChild>
                  <Link href="/auth/sign-up" onClick={() => setIsMenuOpen(false)}>
                    新規登録
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}