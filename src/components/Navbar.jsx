import search from "../assets/search.svg"
import { Link } from "react-router-dom"

export default function Navbar() {

    return(
        <div className="w-full flex flex-col justify-start items-center">
            <div className=" w-full bg-[#00845B] flex flex-col justify-start items-center">
                <div className="w-[70%] h-16  flex items-center justify-between p-4">
                    
                    <p className="text-white text-3xl font-bold px-2">MIRIM WIKI</p>
                    <form action="" className="flex items-center gap-2">
                        <input type="text" placeholder="검색" className="py-2 px-4 rounded-lg min-w-[180px]" />
                        <button type="submit" className="ml-2 py-2 px-2 rounded-lg cursor-pointer">
                            <img src={search} alt="Search" className="h-5 w-5 object-contain" />
                        </button>
                    </form>

                </div>
                
                
            </div>
            
        </div>
    )

 }