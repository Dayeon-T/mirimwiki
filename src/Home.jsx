import Navbar from "./components/Navbar"
import Document from "./components/Document"

export default function Home() {
  return (
    <div className="flex flex-col justify-start items-start w-full h-screen">
     
      <Navbar />
      <div className="w-full flex justify-center items-start">
        <Document />
      </div>
      
    </div>
  );
}