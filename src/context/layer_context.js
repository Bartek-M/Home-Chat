import React, { useState, useContext, useEffect } from "react"

// Flash messages
const FlashContext = React.createContext()
export function useFlash() { return useContext(FlashContext) }

// Context menus
const MenuContext = React.createContext()
export function useMenu() { return useContext(MenuContext) }

// Layer
export function LayerProvider({ children }) {
    const [flash, setFlash] = useState(null)
    const [menu, setMenu] = useState(null)

    useEffect(() => {
        console.log("FLASH:", flash)
        console.log("MENU:", menu)
    })

    return (
        <>
            <FlashContext.Provider value={setFlash}>
                <MenuContext.Provider value={setMenu}>
                    {children}
                </MenuContext.Provider>
            </FlashContext.Provider>
            <div className="layer">
                {flash && <>Hello Flash</>}
                {menu && <>Hello Menu</>}
            </div>
        </>
    )
}