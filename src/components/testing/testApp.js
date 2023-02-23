import React from "react"
import Button from "./Button"
import Input from "./Input"

export default function App() {
    return (
        <React.StrictMode>
            {/* <LoadingScreen /> */}
            <p>Hello World!</p>
            <p>Testing React Code :)</p>
            <p>2 + 2 = {2 + 2}</p>
            <hr className="separator"/>
            <Button />
            <Button />
            <Button />            
            <hr className="separator"/>
            <Input />
        </React.StrictMode>
    )
}