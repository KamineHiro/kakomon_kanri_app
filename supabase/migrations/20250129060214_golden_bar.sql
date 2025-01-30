/*
  # Create exams and related tables

  1. New Tables
    - `exams`
      - `id` (uuid, primary key)
      - `title` (text)
      - `subject` (text)
      - `professor` (text)
      - `year` (integer)
      - `semester` (text)
      - `university` (text)
      - `faculty` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `rating` (numeric)
      - `views` (integer)
      - `has_answer` (boolean)

    - `exam_comments`
      - `id` (uuid, primary key)
      - `exam_id` (uuid, references exams)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `exam_ratings`
      - `id` (uuid, primary key)
      - `exam_id` (uuid, references exams)
      - `user_id` (uuid, references profiles)
      - `rating` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  professor text,
  year integer NOT NULL,
  semester text NOT NULL,
  university text NOT NULL,
  faculty text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  rating numeric DEFAULT 0,
  views integer DEFAULT 0,
  has_answer boolean DEFAULT false
);

-- Comments table
CREATE TABLE IF NOT EXISTS exam_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS exam_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, user_id)
);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_ratings ENABLE ROW LEVEL SECURITY;

-- Exams policies
CREATE POLICY "Everyone can view exams"
  ON exams FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own exams"
  ON exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams"
  ON exams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments"
  ON exam_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON exam_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON exam_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Anyone can view ratings"
  ON exam_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON exam_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON exam_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_comments_updated_at
  BEFORE UPDATE ON exam_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for exam files
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-files', 'exam-files', true);

-- Allow authenticated users to upload files to the exam-files bucket
CREATE POLICY "Users can upload exam files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'exam-files'
  );

-- Allow everyone to download files from the exam-files bucket
CREATE POLICY "Anyone can download exam files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'exam-files'
  );

  -- Add foreign key constraints
ALTER TABLE exams
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE exam_comments
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES profiles(id);

-- Create increment_views function
CREATE OR REPLACE FUNCTION increment_views(exam_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE exams
  SET views = COALESCE(views, 0) + 1
  WHERE id = exam_id;
END;
$$ LANGUAGE plpgsql;