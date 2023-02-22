import React, { useState } from "react"
import LoadingScreen from "./LoadingScreen"

export default function App() {
    var Hello = useState(0)
    const test = () => { Hello += 1; console.log(Hello) }

    return (
        <>
            {/* <LoadingScreen /> */}
            <p>Hello World!</p>
            <p>Testing React Code :)</p>
            <p>2 + 2 = {2 + 2}</p>
            <p>{Hello}</p>
            <button onClick={test}>Click Me!</button>
        </>
    )
}