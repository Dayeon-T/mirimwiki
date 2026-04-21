import { createClient_ as supabase } from '../supabaseClient'

// 문서 1건 조회 (제목으로)
export async function getDocument(title) {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('title', title)
        .single()
    return { data, error }
}

// 문서 목록 조회 (최신순)
export async function getDocuments() {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false })
    return { data, error }
}

// 문서 생성
export async function createDocument(title, content, authorId) {
    const { data, error } = await supabase
        .from('documents')
        .insert({ title, content, author_id: authorId })
        .select()
        .single()
    return { data, error }
}

// 문서 수정
export async function updateDocument(id, title, content) {
    const { data, error } = await supabase
        .from('documents')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single()
    return { data, error }
}

// 문서 삭제
export async function deleteDocument(id) {
    const { data, error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
    return { data, error }
}

// 문서의 카테고리 조회
export async function getDocumentCategories(documentId) {
    const { data, error } = await supabase
        .from('document_categories')
        .select('categories(*)')
        .eq('document_id', documentId)
    return { data, error }
}
