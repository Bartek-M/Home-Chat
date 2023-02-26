import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { api_get, UserContext } from "./functions";

import Home from "./components/home/home";
import Login from "./components/account/login";
import Register from "./components/account/register";
import NotFound from "./components/error/not_found";

// Rendering
export default function App() {
    const [user, setUser] = useState({
        id: "n/a",
        name: "n/a",
        tag: "0000",
        email: "n/a",
        phone: "n/a",
        avatar: "generic",
        theme: "auto",
        messsage_display: "standard",
        auth: "n/a",
        create_time: "n/a",
        visibility: "n/a",
    })
    const user_state = useMemo(() => ({user, setUser}), [user, setUser])

    useEffect(() => {
        const fetch_data = async () => {
            const user_obj = await api_get("user", user_id)
            const settings_obj = await api_get("user_settings", user_id)
            setUser({...user_obj, ...settings_obj})
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