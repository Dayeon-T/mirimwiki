import Mirim from "./assets/Mirim.jpg";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from "./api/auth"

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const focus =
    "focus:outline-none focus:ring-2 focus:ring-[#00845B]/50 border border-gray-200 p-2 rounded-lg";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await signIn(email, password);
    if (error) {
      if (error) {
        toast.error(error.message);
      } 
      return;
    }
    toast.success("로그인 성공! 환영합니다.");
    setEmail("");
    setPassword("");
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col justify-center items-center pt-10 w-[480px]">
        <img src={Mirim} alt="" className="w-32 h-32 object-contain" />
        <div className="text-5xl mt-5 font-black text-[#272727]">
          <span className="text-6xl text-[#00845B]">M</span>IRIM{" "}
          <span className="text-6xl text-[#00845B]">W</span>IKI
        </div>
        <div className="w-full">
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                className={focus}
              />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className={focus}
              />
            </div>
            
            <button
              type="submit"
              className="bg-[#00845B] p-2 rounded-lg text-white font-semibold text-lg cursor-pointer"
            >
              로그인
            </button>
          </form>
          <p className="text-center mt-5 text-sm text-gray-500">
            아직 회원이 아니신가요?
            <Link
              to="/signup"
              className="ml-2 text-[#00845B] hover:underline hover:font-semibold"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
