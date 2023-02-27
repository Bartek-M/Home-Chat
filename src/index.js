import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { UserContext, api_get, overlay_close } from "./functions";

import Home from "./components/home/home";
import Login from "./components/account/login";
import Register from "./components/account/register";
import NotFound from "./components/error/not_found";

// Rendering
export default function App() {
    const [user, setUser] = useState(null)
    const user_state = useMemo(() => ({ user, setUser }), [user, setUser])

    useEffect(() => {
        if (user) return

        const fetch_data = async () => {
            const user_obj = await api_get("user", user_id)
            const settings_obj = await api_get("user_settings", user_id)
            setUser({ ...user_obj, ...settings_obj })
        }

        fetch_data()
    }, [])

    return (
        <BrowserRouter>
            <UserContext.Provider value={user_state}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </UserContext.Provider>
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
document.addEventListener("keyup", (e) => { if (e.key === "Escape") { overlay_close() } })
document.getElementById("overlay").addEventListener("click", () => overlay_close())