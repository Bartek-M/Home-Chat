import { lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

const Home = lazy(() => import("./pages/Home").then(module => { return { default: module.Home } }))
const NotFound = lazy(() => import("./components").then(module => { return { default: module.NotFound } }))

const Login = lazy(() => import("./pages/Connection").then(module => { return { default: module.Login } }))
const Register = lazy(() => import("./pages/Connection").then(module => { return { default: module.Register } }))
const Logout = lazy(() => import("./pages/Connection").then(module => { return { default: module.Logout } }))

export default function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/channels/:id" element={<Home />} />


                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="register" element={<Register />} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
            <div className="layer"></div>
        </>
    )
}


