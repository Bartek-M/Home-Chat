import React, {useState, useRef} from "react";

export default function Input() {
    const myInpt = useRef(null)

    const [text, setText] = useState(null)
    const handleConfirm = () => {         
        setText(myInpt.current.value)
        myInpt.current.value = null 
    }    

    return (
        <>
            <p>Your text: {text}</p>
            <input ref={myInpt} />
            <button onClick={() => handleConfirm()}>Confirm Text!</button>
        </>
    )
}