import React, { useState, useEffect } from "react"

export default function Button() {
    const [count, setCount] = useState(0)
    const handleClick = () => setCount(count + 1)

    useEffect(() => { console.log("Button updated!") })

    return (
        <><button onClick={() => handleClick()}>Clicked {count} times</button></>
    )
}