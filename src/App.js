import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home/";
import { Login, Logout, Register } from "./pages/Connection/"
import { NotFound } from "./components/";

export default function App() {
    return (
        <>
            <div className="center-column-container" id="flash-box"></div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="register" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}


                    