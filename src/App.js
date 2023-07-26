import { lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { FlashProvider } from "./context"

const Home = lazy(() => import("./pages/Home").then(module => { return { default: module.Home } }))
const NotFound = lazy(() => import("./components").then(module => { return { default: module.NotFound } }))

const Login = lazy(() => import("./pages/Connection").then(module => { return { default: module.Login } }))
const Register = lazy(() => import("./pages/Connection").then(module => { return { default: module.Register } }))
const Logout = lazy(() => import("./pages/Connection").then(module => { return { default: module.Logout } }))
const EmailConfirm = lazy(() => import("./pages/Connection").then(module => { return { default: module.EmailConfirm } }))

const EmailRecover = lazy(() => import("./pages/Recovery").then(module => { return { default: module.EmailRecover } }))
const ResetPassword = lazy(() => import("./pages/Recovery").then(module => { return { default: module.ResetPassword } }))
const ResetMFA = lazy(() => import("./pages/Recovery").then(module => { return { default: module.ResetMFA } }))

export default function App() {
    return (
        <BrowserRouter>
            <FlashProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/channels/:id" element={<Home />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="register" element={<Register />} />
                    <Route path="/email-confirm" element={<EmailConfirm />} />

                    <Route path="/recovery/email" element={<EmailRecover />} />
                    <Route path="/recovery/password" element={<ResetPassword />} />
                    <Route path="/recovery/mfa" element={<ResetMFA />} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </FlashProvider>
        </BrowserRouter>
    )
}