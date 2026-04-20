import { Link } from "react-router-dom"
export default function Document() {
    return(
        <>
        <div className="w-[70%] px-4 my-3 grid grid-cols-[3fr_1fr] gap-4">
            <div className="bg-white rounded-sm border border-gray-300 p-4">
                <p className="text-3xl font-semibold">미림위키:대문</p>
                <p className="text-xs mt-2">최근 수정 시각 : 2023-10-10 12:00:00</p>
                <div className="bg-white rounded-sm border border-gray-400 mt-4 p-1 ">
                    <p className="text-xs"> 분류 : <Link to="#" className="text-[#00845B] font-semibold">미림위키</Link></p>
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
                        미림위키는 미림마이스터고 학생들이 함께 만들어가는 위키입니다.
                        자유롭게 편집하고, 지식을 공유하며, 학교 생활에 도움이 되는 정보를 나누는 공간입니다.
                    </pre>
                </div>

                </div>
            </div>
            <div className="bg-white rounded-sm border border-gray-300">dd</div>
            </div>
        </>
    )

}