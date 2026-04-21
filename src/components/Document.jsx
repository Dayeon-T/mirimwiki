import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { getDocument, getDocumentCategories } from "../api/document"

export default function Document() {
    const [document, setDocument] = useState(null)
    const [categories, setCategories] = useState([])

    useEffect(() => {
        async function fetchDocument() {
            const { data, error } = await getDocument("미림위키:대문")
            if (error) {
                console.error("문서 조회 실패:", error)
                return
            }
            setDocument(data)

            // 문서의 카테고리 조회
            const { data: catData, error: catError } = await getDocumentCategories(data.id)
            if (catError) {
                console.error("카테고리 조회 실패:", catError)
                return
            }
            setCategories(catData.map(item => item.categories))
        }
        fetchDocument()
    }, [])

    if (!document) return <p>로딩 중...</p>

    return(
        <>
        <div className="w-[70%] px-4 my-3 grid grid-cols-[3fr_1fr] gap-4">
            <div className="bg-white rounded-sm border border-gray-300 p-4">
                <p className="text-3xl font-semibold">{document.title}</p>
                <p className="text-xs mt-2">최근 수정 시각 : {new Date(document.updated_at).toLocaleString()}</p>
                <div className="bg-white rounded-sm border border-gray-400 mt-4 p-1 ">
                    <p className="text-xs"> 분류 : {categories.map((cat, i) => (
                        <span key={cat.id}>
                            {i > 0 && ", "}
                            <Link to="#" className="text-[#00845B] font-semibold">{cat.name}</Link>
                        </span>
                    ))}</p>
                </div>
                <div className="bg-[#00845B] my-4 w-full h-24">

                </div>
                <div className="grid grid-cols-[4fr_7fr] gap-4">
                    <div>
                   <div className="border border-gray-400 p-2 rounded-sm">
                        <p>목차</p>
                   </div>
                   </div>
                <div>
                    <pre className="whitespace-pre-wrap break-words">
                        {document.content}
                    </pre>
                </div>

                </div>
            </div>
            <div className="bg-white rounded-sm border border-gray-300">dd</div>
            </div>
        </>
    )

}
