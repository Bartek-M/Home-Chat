import { useState, useEffect } from "react";
import { UserProvider } from "../../context";

import { Card } from "../../components";
import { Settings } from "../Settings/";

import { ChannelView } from "./channels";
import { Sidebar } from "./sidebar";

export function Home() {
    const [settings, setSettings] = useState(false)
    const [card, setCard] = useState(null)

    useEffect(() => {
        const close_settings = (e) => {
            if (e.key !== "Escape") return
            if (!card && settings) setSettings(false)
            if (card) setCard(null)
        }

        document.addEventListener("keyup", close_settings)
        return () => { document.removeEventListener("keyup", close_settings) }
    }, [settings, card])

    return (
        <UserProvider>
            <div className="home-page">
                <Sidebar settings={settings} card={card} setSettings={setSettings} setCard={setCard} />
                <ChannelView setCard={setCard} />
            </div>
            {card && (
                <div className="edit-card-wrapper center-container absolute-container">
                    <div className="absolute-container" id="edit-card-overlay"></div>
                    <Card card={card} close={setCard} />
                </div>
            )}
            {settings && (<Settings setSettings={setSettings} setCard={setCard} />)}
        </UserProvider>
    )
}