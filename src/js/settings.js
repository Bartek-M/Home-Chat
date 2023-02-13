// SETTINGS
var current_page

const run = async () => { 
    await api_me(); 
    document.getElementById("settings-sidebar-info").innerText += `\n${user_os}`
    open_category() 
}
run()

// BUTTONS
const settings = document.getElementById("settings")
const open_settings_btn = document.getElementById("open-settings") // Open settings button
open_settings_btn.addEventListener("click", () => { overlay_open(main_overlay, settings) })

const open_category_btns = document.querySelectorAll("[open-settings-category]")
open_category_btns.forEach(button => { button.addEventListener("click", () => open_category(button.id.replace("settings-open-", ""))) })

const settings_dropdown_btn = document.getElementById("settings-dropdown-btn")
settings_dropdown_btn.addEventListener("click", () => { document.getElementById("settings-dropdown").classList.toggle("active") })


// ACTIONS
const actions = { "copy-id": copy_id }

function copy_id() { copy_text(me.id) }

function open_edit_window(editable) {
    document.getElementById("settings-edit-card").innerHTML += editable
    overlay_open(secnd_overlay, document.getElementById("settings-edit-card"))
}


// PAGES
function page_account() {
    return `
    <h2 class="settings-title">Account</h2>
    <div class="settings-card column-container">
        <div class="user-info all-center-container">
            <img class="settings-avatar" src="/api/photos/${me.avatar}.webp"/>
            <h1>${me.name}</h1>
        </div>
        <div class="account-settings column-container">
            <div class="spaced-container">
                <div class="column-container">
                    <p class="settings-category-info">USERNAME</p>
                    <p>${me.name}</p>
                </div>
                <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-username">Edit</button>
            </div>
            <div class="spaced-container">
                <div class="column-container">
                    <p class="settings-category-info">EMAIL</p>
                    <p>NOT YET</p>
                </div>
                <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-email">Edit</button>
            </div>
            <div class="spaced-container">
                <div class="column-container">
                    <p class="settings-category-info">PHONE NUMBER</p>
                    <p>NOT YET</p>
                </div>
                <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-phone">Edit</button>
            </div>
        </div>
    </div>
    <hr class="separator"/>
    <div class="spaced-container">
        <div class="column-container">
            <p class="settings-category-info">USER ID</p>
            <p>${me.id}<p>
        </div>
        <button settings-action class="settings-btn stng-action-btn" id="settings-action-copy-id">Copy</button>
    </div>
    <div class="spaced-container">
        <div class="column-container">
            <p class="settings-category-info">ACCOUNT REMOVAL</p>
            <p>Delete your account, this action can not be reverted!<p>
        </div>
        <button settings-edit class="settings-btn stng-warning-btn" id="settings-edit-delete-account">Delete Account</button>
    </div>
    `
}

function page_security() {
    return `
    <h2 class="settings-title">Security</h2>
    <div class="spaced-container">
        <div class="column-container">
            <p class="settings-category-info">PASSWORD</p>
            <p>It's good to have a strong password everywhere<p>
        </div>
        <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-password">Edit</button>
    </div>
    <div class="spaced-container">
        <div class="column-container">
            <p class="settings-category-info">TWO FACTOR AUTHENTICATION</p>
            <p>Good way to add an extra layer of security for your account<p>
        </div>
        <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-2fa">Edit</button>
    </div>
    <hr class="separator"/>
    <div class="spaced-container">
        <div class="column-container">
            <p class="settings-category-info">ACCOUNT VISIBILITY</p>
            <p>Change your account visibility<p>
        </div>
        <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-to-do">Edit</button>
    </div>
    <div class="spaced-container">
        <div class="column-container">
            <p class="settings-category-info">TOKEN REGENRATE</p>
            <p>Token is the most secret thing; you can regenerate it if you need to<p>
        </div>
        <button settings-edit class="settings-btn stng-warning-btn" id="settings-edit-regenerate-token">Regenerate</button>
    </div>
    `
}

function page_friends() {
    return `
    <h2 class="settings-title">Friends</h2>
    `
}

function page_appearance() {
    return `
    <h2 class="settings-title">Appearance</h2>
    `
}

function page_advanced() {
    return `
    <h2 class="settings-title">Advanced</h2>
    `
}

let settings_pages = {
    "account": page_account,
    "security": page_security,
    "friends": page_friends,
    "appearance": page_appearance,
    "advanced": page_advanced
}

function open_category(category="account") {
    if (category === current_page) { return }

    if (current_page) { document.getElementById(`settings-open-${current_page}`).style = "" }
    document.getElementById(`settings-open-${category}`).style.backgroundColor = "var(--BUTTON_HOVER)"
    document.getElementById(`settings-open-${category}`).style.color = "var(--FONT_COLOR)"

    document.getElementById("settings-content").innerHTML = settings_pages[category]()
    current_page = category

    const settings_action_btns = document.querySelectorAll("[settings-action]")
    settings_action_btns.forEach(button => { button.addEventListener("click", () => actions[button.id.replace("settings-action-", "")]()) })

    const settings_edit_btns = document.querySelectorAll("[settings-edit]")
    settings_edit_btns.forEach(button => { button.addEventListener("click", () => open_edit_window(button.id.replace("settings-edit-", "")) ) })
}