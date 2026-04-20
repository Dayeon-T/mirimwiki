-- ============================================================
-- 미림위키 Supabase DB 스키마
-- Supabase SQL Editor에 붙여넣기 하면 바로 실행됩니다
-- ============================================================


-- ============================================================
-- 1. 테이블 생성
-- ============================================================

-- 1-1. profiles: 사용자 프로필 (auth.users 연동)
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname   TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-2. categories: 문서 분류
CREATE TABLE categories (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT ''
);

-- 1-3. documents: 위키 문서 (핵심 테이블)
CREATE TABLE documents (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title      TEXT NOT NULL UNIQUE,           -- 위키는 제목이 곧 URL
  content    TEXT NOT NULL DEFAULT '',       -- 마크다운 본문
  author_id  UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-4. document_versions: 문서 수정 이력
CREATE TABLE document_versions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,                 -- 수정 시점의 본문 스냅샷
  editor_id   UUID NOT NULL REFERENCES profiles(id),
  summary     TEXT DEFAULT '',               -- 편집 요약 (예: "오타 수정")
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1-5. document_categories: 문서 ↔ 분류 (다대다)
CREATE TABLE document_categories (
  document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, category_id)
);


-- ============================================================
-- 2. 인덱스
-- ============================================================

-- trigram 확장 활성화 (검색 인덱스에 필요)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 문서 제목 검색용 (한글 Full-text Search 대신 LIKE 검색 최적화)
CREATE INDEX idx_documents_title ON documents USING gin (title gin_trgm_ops);

-- 문서 목록 정렬용
CREATE INDEX idx_documents_updated ON documents (updated_at DESC);

-- 버전 이력 조회용
CREATE INDEX idx_versions_document ON document_versions (document_id, created_at DESC);

-- 분류별 문서 조회용
CREATE INDEX idx_doc_categories_cat ON document_categories (category_id);


-- ============================================================
-- 3. RLS (Row Level Security) 정책
-- ============================================================

-- ── profiles ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 모든 사람이 프로필 조회 가능 (작성자 이름 표시용)
CREATE POLICY "profiles: 누구나 조회"
  ON profiles FOR SELECT
  USING (true);

-- 본인 프로필만 수정 가능
CREATE POLICY "profiles: 본인만 수정"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── documents ──
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 문서는 누구나 읽기 가능 (위키니까!)
CREATE POLICY "documents: 누구나 조회"
  ON documents FOR SELECT
  USING (true);

-- 로그인한 사용자만 문서 작성 가능
CREATE POLICY "documents: 로그인 시 작성"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 로그인한 사용자 누구나 문서 수정 가능 (위키 특성)
CREATE POLICY "documents: 로그인 시 수정"
  ON documents FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- 삭제는 작성자 또는 admin만
CREATE POLICY "documents: 작성자/관리자만 삭제"
  ON documents FOR DELETE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ── document_versions ──
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "versions: 누구나 조회"
  ON document_versions FOR SELECT
  USING (true);

CREATE POLICY "versions: 로그인 시 추가"
  ON document_versions FOR INSERT
  WITH CHECK (auth.uid() = editor_id);

-- ── categories ──
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: 누구나 조회"
  ON categories FOR SELECT
  USING (true);

-- 분류 생성/수정/삭제는 admin만
CREATE POLICY "categories: 관리자만 생성"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "categories: 관리자만 수정"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "categories: 관리자만 삭제"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ── document_categories ──
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doc_categories: 누구나 조회"
  ON document_categories FOR SELECT
  USING (true);

CREATE POLICY "doc_categories: 로그인 시 추가"
  ON document_categories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "doc_categories: 로그인 시 삭제"
  ON document_categories FOR DELETE
  USING (auth.uid() IS NOT NULL);


-- ============================================================
-- 4. Trigger: 자동 처리
-- ============================================================

-- 4-1. 회원가입 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'nickname',
      NEW.email
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4-2. 문서 수정 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_document_updated
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_timestamp();

-- 4-3. 문서 수정 시 이전 버전 자동 저장
CREATE OR REPLACE FUNCTION save_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- 본문이 실제로 변경된 경우에만 버전 저장
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO document_versions (document_id, content, editor_id, summary)
    VALUES (OLD.id, OLD.content, auth.uid(), '');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_document_content_changed
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION save_document_version();


-- ============================================================
-- 5. 유용한 View (선택)
-- ============================================================

-- 최근 변경된 문서 목록 (사이드바/대문 페이지에서 쓰기 좋음)
CREATE VIEW recent_documents AS
SELECT
  d.id,
  d.title,
  d.updated_at,
  p.nickname AS author_name
FROM documents d
JOIN profiles p ON p.id = d.author_id
ORDER BY d.updated_at DESC;


-- ============================================================
-- 6. 초기 데이터 (시드)
-- ============================================================

-- 기본 분류
INSERT INTO categories (name, description) VALUES
  ('미림위키', '미림위키 운영 관련 문서'),
  ('학교생활', '학교 생활 정보'),
  ('교과목',   '교과목 관련 정보'),
  ('동아리',   '동아리 관련 정보'),
  ('행사',     '학교 행사 관련 정보');