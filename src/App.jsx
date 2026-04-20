import { Routes, Route, Navigate } from "react-router-dom"
import SignIn from "./SignIn"
import SignUp from "./SignUp"
import Home from "./Home"

function App() {
  return (
    <div className="flex justify-center items-start h-screen">
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />  {/* 루트 접속 시 /home으로 리다이렉트 */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
    </Routes>
    </div>
  )
}

export default App