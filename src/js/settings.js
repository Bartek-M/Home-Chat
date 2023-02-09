// SETTINGS
var current_page

const run = async () => { await get_me(); open_category() }
run()

// BUTTONS
const settings = document.getElementById("settings")
const open_settings = document.getElementById("open-settings") // Open settings button
open_settings.addEventListener("click", () => { overlay_open(settings) })

const open_category_btns = document.querySelectorAll("[open-settings-category]")
open_category_btns.forEach(button => { button.addEventListener("click", () => open_category(button.id.replace("settings-open-", ""))) })


// ACTIONS
const actions = { "copy-id": copy_id }

function copy_id() { copy_text(me.id) }


// PAGES
function open_settings_account() {
    let page = `
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

    return page
}

function open_settings_security() {
    let page = `
    <h2 class="settings-title">Security</h2>
    `

    return page
}

function open_settings_friends() {
    let page = `
    <h2 class="settings-title">Friends</h2>
    `

    return page
}

function open_settings_appearance() {
    let page = `
    <h2 class="settings-title">Appearance</h2>
    `

    return page
}

function open_settings_advanced() {
    let page = `
    <h2 class="settings-title">Advanced</h2>
    `

    return page
}

let settings_pages = {
    "account": open_settings_account,
    "security": open_settings_security,
    "friends": open_settings_friends,
    "appearance": open_settings_appearance,
    "advanced": open_settings_advanced
}

function open_category(category = "account") {
    if (category === current_page) { return }

    if (current_page) { document.getElementById(`settings-open-${current_page}`).style = "" }
    document.getElementById(`settings-open-${category}`).style.backgroundColor = "var(--BUTTON_HOVER)"

    document.getElementById("settings-content").innerHTML = settings_pages[category]()
    current_page = category

    const settings_action_btns = document.querySelectorAll("[settings-action]")
    settings_action_btns.forEach(button => { button.addEventListener("click", () => actions[button.id.replace("settings-action-", "")]()) })
}