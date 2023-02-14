// SETTINGS
var current_page

var current_theme
var current_message_display

const run = async () => {
    await api_me()
    await api_settings()

    current_theme = me_settings.theme
    current_message_display = me_settings.message_display

    open_category()
    document.getElementById("settings-sidebar-info").innerText += `\n${user_os}`
}
run()

// ELEMENTS
const settings = document.getElementById("settings")
const edit_card = document.getElementById("settings-edit-card")

document.getElementById("open-settings").addEventListener("click", () => { overlay_open(main_overlay, settings); open_category() })
document.querySelectorAll("[open-settings-category]").forEach(button => { button.addEventListener("click", () => open_category(button.id.replace("settings-open-", ""))) })
document.getElementById("settings-dropdown-btn").addEventListener("click", () => { document.getElementById("settings-dropdown").classList.toggle("active") })


// ACTIONS
const ACTIONS = {
    copy_id: () => copy_text(me.id),
    delete_account: () => {} 
}

function theme_change(theme) {
    if (theme == current_theme) { return }

    if (theme == "auto") { set_prefered_theme() }
    else { document.documentElement.setAttribute("data-theme", theme) }

    document.getElementById(`select-theme-${theme}`).classList.add("active")
    document.getElementById(`btn-theme-${theme}`).classList.add("active")

    document.getElementById(`select-theme-${current_theme}`).classList.remove("active")
    document.getElementById(`btn-theme-${current_theme}`).classList.remove("active")

    current_theme = theme
}

function message_display_change(message_display) {
    if (message_display == current_message_display) { return }

    document.getElementById(`select-message-display-${message_display}`).classList.add("active")
    document.getElementById(`btn-message-display-${message_display}`).classList.add("active")

    document.getElementById(`select-message-display-${current_message_display}`).classList.remove("active")
    document.getElementById(`btn-message-display-${current_message_display}`).classList.remove("active")

    current_message_display = message_display
}


// EDIT WINDOWS
const EDIT_WINDOWS = {
    username: () => `
    <div class="all-center-column-container">
        <h2>Change your username</h2>
        <p class="edit-card-info">Enter a new username and your existing password.</p>
        <button class="all-center-container" id="close-edit-card">
            <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
            </svg>
        </button>
    </div>
    <div class="column-container">
        <p class="category-text">USERNAME</p>
        <input class="input-field" name="username" value="${me.name}" maxlength=100 required />

        <p class="category-text">CURRENT PASSWORD</p>
        <input class="input-field" type="password" name="passwd" maxlength=50 required />
    </div>
    <button edit-submit class="edit-submit-btn" id="submit-username">Done</button>
    `,
    email: () => `
    <div class="all-center-column-container">
        <h2>Change your email</h2>
        <p class="edit-card-info">Enter a new email and your existing password.</p>
        <button class="all-center-container" id="close-edit-card">
            <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
            </svg>
        </button>
    </div>
    <div class="column-container">
        <p class="category-text">EMAIL</p>
        <input class="input-field" name="email" maxlength=100 required />

        <p class="category-text">CURRENT PASSWORD</p>
        <input class="input-field" type="password" name="passwd" maxlength=50 required />
    </div>
    <button edit-submit class="edit-submit-btn" id="submit-email">Done</button>
    `,
    phone: () => `
    <div class="all-center-column-container">
        <h2>Change your phone number</h2>
        <p class="edit-card-info">Enter a new phone number and your existing password.</p>
        <button class="all-center-container" id="close-edit-card">
            <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
            </svg>
        </button>
    </div>
    <div class="column-container">
        <p class="category-text">PHONE NUMBER</p>
        <input class="input-field" name="email" maxlength=100 required />

        <p class="category-text">CURRENT PASSWORD</p>
        <input class="input-field" type="password" name="passwd" maxlength=50 required />
    </div>
    <button edit-submit class="edit-submit-btn" id="submit-phone">Done</button>
    `,
    password: () => `
    <div class="all-center-column-container">
        <h2>Update your password</h2>
        <p class="edit-card-info">Enter your current password and a new password.</p>
        <button class="all-center-container" id="close-edit-card">
            <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
            </svg>
        </button>
    </div>
    <div class="column-container">
        <p class="category-text">CURRENT PASSWORD</p>
        <input class="input-field" type="password" name="passwd" maxlength=50 required />

        <p class="category-text">NEW PASSWORD</p>
        <input class="input-field" type="password" name="new_passwd" maxlength=50 required />

        <p class="category-text">CONFIRM NEW PASSWORD</p>
        <input class="input-field" type="password" name="confirm_passwd" maxlength=50 required />
    </div>
    <button edit-submit class="edit-submit-btn" id="submit-password">Done</button>
    `
}

function open_edit_window(edit_window) {
    edit_card.innerHTML = EDIT_WINDOWS[edit_window]()
    document.getElementById("close-edit-card").addEventListener("click", () => { overlay_close(secnd_overlay) })
    document.querySelector("[edit-submit]")

    overlay_open(secnd_overlay, edit_card)
}


// PAGES
const SETTINGS_PAGES = {
    // ACCOUNT PAGE
    account: () => `
    <h2 class="settings-title">Account</h2>
    <div class="settings-card column-container">
        <div class="user-info all-center-container">
            <img class="settings-avatar" src="/api/photos/${me.avatar}.webp"/>
            <h1>${me.name}</h1>
        </div>
        <div class="account-settings column-container">
            <div class="spaced-container">
                <div class="column-container">
                    <p class="category-text">USERNAME</p>
                    <p>${me.name}</p>
                </div>
                <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-username">Edit</button>
            </div>
            <div class="spaced-container">
                <div class="column-container">
                    <p class="category-text">EMAIL</p>
                    <p>NOT YET</p>
                </div>
                <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-email">Edit</button>
            </div>
            <div class="spaced-container">
                <div class="column-container">
                    <p class="category-text">PHONE NUMBER</p>
                    <p>NOT YET</p>
                </div>
                <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-phone">Edit</button>
            </div>
        </div>
    </div>
    <hr class="separator"/>
    <div class="spaced-container">
        <div class="column-container">
            <p class="category-text">USER ID</p>
            <p>${me.id}<p>
        </div>
        <button settings-action class="settings-btn stng-action-btn" id="settings-action-copy_id">Copy</button>
    </div>
    <div class="spaced-container">
        <div class="column-container">
            <p class="category-text">ACCOUNT REMOVAL</p>
            <p>Delete your account (This action can not be reverted!)<p>
        </div>
        <button settings-action class="settings-btn stng-warning-btn" id="settings-edit-delete_account">Delete Account</button>
    </div>
    `,

    // SECURITY PAGE
    security: () => `
    <h2 class="settings-title">Security</h2>
    <div class="spaced-container">
        <div class="column-container">
            <p class="category-text">PASSWORD</p>
            <p>It's good to have a strong password everywhere<p>
        </div>
        <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-password">Edit</button>
    </div>
    <div class="spaced-container">
        <div class="column-container">
            <p class="category-text">TWO FACTOR AUTHENTICATION</p>
            <p>Good way to add an extra layer of security for your account<p>
        </div>
        <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-2fa">Edit</button>
    </div>
    <hr class="separator"/>
    <div class="spaced-container">
        <div class="column-container">
            <p class="category-text">ACCOUNT VISIBILITY</p>
            <p>Change your account visibility<p>
        </div>
        <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-to-do">Edit</button>
    </div>
    <div class="spaced-container">
        <div class="column-container">
            <p class="category-text">TOKEN REGENRATE</p>
            <p>Token is the most secret thing<br>For safety reasons, you can regenerate it</p>
        </div>
        <button settings-edit class="settings-btn stng-warning-btn" id="settings-edit-regenerate-token">Regenerate</button>
    </div>
    `,

    // FRIENDS PAGE
    friends: () => `
    <h2 class="settings-title">Friends</h2>
    
    `,

    // APPEARANCE PAGE
    appearance: () => `
    <h2 class="settings-title">Appearance</h2>
    <div class="column-container">
        <p class="category-text">THEME</p>
        <button theme-btn class="settings-full-btn container" id="btn-theme-dark">
            <div class="select-indicator-wrapper all-center-container"><div class="select-indicator" id="select-theme-dark"></div></div>
            Dark
        </button>
        <button theme-btn class="settings-full-btn container" id="btn-theme-light">
            <div class="select-indicator-wrapper all-center-container"><div class="select-indicator" id="select-theme-light"></div></div>
            Light
        </button>
        <button theme-btn class="settings-full-btn container" id="btn-theme-auto">
            <div class="select-indicator-wrapper all-center-container"><div class="select-indicator" id="select-theme-auto"></div></div>
            Auto
        </button>
    </div>
    <hr class="separator"/>
    <div class="column-container">
        <p class="category-text">MESSAGE DISPLAY</p>
        <button message-display-btn class="settings-full-btn container" id="btn-message-display-standard">
            <div class="select-indicator-wrapper all-center-container"><div class="select-indicator" id="select-message-display-standard"></div></div>
            Standard
        </button>
        <button message-display-btn class="settings-full-btn container" id="btn-message-display-compact">
            <div class="select-indicator-wrapper all-center-container"><div class="select-indicator" id="select-message-display-compact"></div></div>
            Compact
        </button>
    </div>
    `,

    // ADVANCED PAGE
    advanced: () => `<h2 class="settings-title">Advanced</h2>`,
}

function open_category(category = "account") {
    if (category === current_page) { return }

    if (current_page) { document.getElementById(`settings-open-${current_page}`).style = "" }
    document.getElementById(`settings-open-${category}`).style.backgroundColor = "var(--BUTTON_HOVER)"

    document.getElementById("settings-content").innerHTML = SETTINGS_PAGES[category]()
    current_page = category

    document.querySelectorAll("[settings-action]").forEach(button => { button.addEventListener("click", () => ACTIONS[button.id.replace("settings-action-", "")]()) })  
    document.querySelectorAll("[settings-edit]").forEach(button => { button.addEventListener("click", () => open_edit_window(button.id.replace("settings-edit-", ""))) })

    if (category == "appearance") {
        document.querySelectorAll("[theme-btn]").forEach(button => { button.addEventListener("click", () => theme_change(button.id.replace("btn-theme-", ""))) })
        document.querySelectorAll("[message-display-btn]").forEach(button => { button.addEventListener("click", () => message_display_change(button.id.replace("btn-message-display-", ""))) })

        document.getElementById(`select-theme-${current_theme}`).classList.add("active")
        document.getElementById(`btn-theme-${current_theme}`).classList.add("active")

        document.getElementById(`select-message-display-${current_message_display}`).classList.add("active")
        document.getElementById(`btn-message-display-${current_message_display}`).classList.add("active")
    }
}