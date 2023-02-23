import React from "react";

export default function Appearance() {
    return (
        <>
            <h2 class="settings-title">Appearance</h2>
            <div class="column-container">
                <p class="category-text">THEME</p>
                <button theme-btn class="settings-full-btn container" id="btn-theme-dark">
                    <div class="select-indicator-wrapper center-container"><div class="select-indicator" id="select-theme-dark"></div></div>
                    Dark
                </button>
                <button theme-btn class="settings-full-btn container" id="btn-theme-light">
                    <div class="select-indicator-wrapper center-container"><div class="select-indicator" id="select-theme-light"></div></div>
                    Light
                </button>
                <button theme-btn class="settings-full-btn container" id="btn-theme-auto">
                    <div class="select-indicator-wrapper center-container"><div class="select-indicator" id="select-theme-auto"></div></div>
                    Auto
                </button>
            </div>
            <hr class="separator" />
            <div class="column-container">
                <p class="category-text">MESSAGE DISPLAY</p>
                <button message-display-btn class="settings-full-btn container" id="btn-message-display-standard">
                    <div class="select-indicator-wrapper center-container"><div class="select-indicator" id="select-message-display-standard"></div></div>
                    Standard
                </button>
                <button message-display-btn class="settings-full-btn container" id="btn-message-display-compact">
                    <div class="select-indicator-wrapper center-container"><div class="select-indicator" id="select-message-display-compact"></div></div>
                    Compact
                </button>
            </div>
        </>
    )
}