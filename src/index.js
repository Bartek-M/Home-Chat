import React from "react";
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/home/home";
import Login from "./components/account/login";
import Register from "./components/account/register";
import NotFound from "./components/error/not_found";


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/">
                    <Route index element={<Home />} />
                    <Route path="home" element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="login" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}


const root = createRoot(document.getElementById("appMount"))
root.render(<App />)