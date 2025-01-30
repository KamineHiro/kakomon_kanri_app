# ExamShare - 大学生のための過去問共有プラットフォーム

## 概要

ExamShareは、大学生が過去問や学習資料を簡単に共有・アクセスできるプラットフォームです。解答・解説も含めた学習資料を共有し、より良い学習環境を作ることを目指しています。

## 主な機能

- 🔍 **スマート検索**: 科目、教授、年度などで詳細な検索が可能
- 📚 **過去問管理**: PDFや画像形式での過去問のアップロードと管理
- 💬 **コメント機能**: 質問や解説の共有が可能
- 📊 **ダッシュボード**: アップロード数や活動履歴の確認

## 技術スタック

- **フロントエンド**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui

- **バックエンド**
  - Supabase (認証、データベース、ストレージ)

## ローカル開発環境のセットアップ

1. リポジトリのクローン 
bash
git clone https://github.com/KamineHiro/kakomon_kanri_app.git
cd kakomon_kanri_app
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env.local`ファイルを作成し、必要な環境変数を設定：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 開発サーバーの起動
```bash
npm run dev
```

## デプロイ

このプロジェクトは[Vercel](https://kakomon-share.vercel.app)でホストされています。mainブランチへのプッシュで自動的にデプロイされます。

## ライセンス

MIT License

## 作者

Hiroki Akamine
- Email: hiroki080602@gmail.com