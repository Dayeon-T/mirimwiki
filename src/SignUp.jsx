import Mirim from "./assets/Mirim.jpg";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { signUp } from "./api/auth";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const focus =
    "focus:outline-none focus:ring-2 focus:ring-[#00845B]/50 border border-gray-200 p-2 rounded-lg";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await signUp(email, password, name, birth);
    if (error) {
      if (error.message === "Password should be at least 6 characters.") {
        toast.error("비밀번호는 6자리 이상이어야 합니다.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("회원가입 성공! 이메일을 확인하세요.");
    setBirth("");
    setEmail("");
    setPassword("");
    setName("");
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
            <div className="flex flex-col gap-4">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                className={focus}
              />

              <input
                type="text"
                required
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                placeholder="생년월일 8자리"
                className={focus}
              />
            </div>
            <button
              type="submit"
              className="bg-[#00845B] p-2 rounded-lg text-white font-semibold text-lg cursor-pointer"
            >
              회원가입
            </button>
          </form>
          <p className="text-center mt-5 text-sm text-gray-500">
            이미 회원이신가요?
            <Link
              href="/login"
              className="ml-2 text-[#00845B] hover:underline hover:font-semibold"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
