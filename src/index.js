import React from "react";
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { overlay_close } from "./functions";

import Home from "./home/home";
import Login from "./account/login";
import Register from "./account/register";
import NotFound from "./error/not_found";

// Rendering
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

const root = createRoot(document.getElementById("appMount"))
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

// Overlay
document.addEventListener("keyup", (e) => { if (e.key === "Escape") overlay_close() })
document.getElementById("overlay").addEventListener("click", () => overlay_close())