import React from "react";
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./home/home";
import Login from "./account/login";
import Logout from "./account/logout"
import Register from "./account/register";
import NotFound from "./error/not_found";

// Rendering
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

const root = createRoot(document.getElementById("appMount"))
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)