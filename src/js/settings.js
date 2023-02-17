document.addEventListener("DOMContentLoaded", async () => {
    globalThis.me = await api_me()
    globalThis.settings = await api_settings()

    theme_change()
    document.getElementById("settings-sidebar-info").innerText += `\n${user_os}`

    // HIDE LOADING SCREEN
    setTimeout(() => {
        const loading_screen_wrapper = document.getElementById("loading-screen-wrapper")

        loading_screen_wrapper.classList.add("deactive")
        setTimeout(() => { loading_screen_wrapper.innerHTML = ""; loading_screen_wrapper.remove() }, 170)
    }, 250)


    // SETTINGS
    var current_page

    // ELEMENTS
    const settings_page = document.getElementById("settings")
    const edit_card = document.getElementById("settings-edit-card")

    document.getElementById("open-settings").addEventListener("click", () => { overlay_close(); settings_page.classList.add("active"); open_category() })
    document.getElementById("close-settings").addEventListener("click", () => { settings_page.classList.remove("active") })
    document.addEventListener("keyup", (e) => { if (e.key === "Escape" && settings_page && active.length == 0) { settings_page.classList.remove("active") } })

    document.querySelectorAll("[open-settings-category]").forEach(button => { button.addEventListener("click", () => open_category(button.id.replace("settings-open-", ""))) })
    document.getElementById("settings-dropdown-btn").addEventListener("click", () => { document.getElementById("settings-dropdown").classList.toggle("active") })


    // ACTIONS
    const ACTIONS = {
        copy_id: () => { copy_text(me.id); flash_message("ID Copied") },
        delete_account: () => { flash_message("not working", "error") }
    }

    async function theme_change(theme) {
        if (theme == settings.theme) return
        if (!theme) theme = settings.theme

        if (theme == "auto") { set_prefered_theme() }
        else { document.documentElement.setAttribute("data-theme", theme) }

        if (document.querySelectorAll("[theme-btn]").length) {
            document.getElementById(`select-theme-${settings.theme}`).classList.remove("active")
            document.getElementById(`btn-theme-${settings.theme}`).classList.remove("active")

            document.getElementById(`select-theme-${theme}`).classList.add("active")
            document.getElementById(`btn-theme-${theme}`).classList.add("active")
        }

        if (theme != settings.theme) {
            await api_send("user_settings", me.id, { settings: `theme='${theme}'` })
            settings.theme = theme
        }
    }

    async function message_display_change(message_display) {
        if (message_display == settings.message_display) { return }

        document.getElementById(`select-message-display-${message_display}`).classList.add("active")
        document.getElementById(`btn-message-display-${message_display}`).classList.add("active")

        document.getElementById(`select-message-display-${settings.message_display}`).classList.remove("active")
        document.getElementById(`btn-message-display-${settings.message_display}`).classList.remove("active")

        await api_send("user_settings", me.id, { settings: `message_display='${message_display}'` })
        settings.message_display = message_display
        settings.message_display = settings.message_display
    }

    async function load_friends() { }


    // EDIT WINDOWS
    const PLACEHOLDER = {
        name: () => me.name,
        email: () => settings.email,
        phone: () => (settings.phone == "not set") ? ("") : (settings.phone)
    }

    const EDIT_WINDOWS = {
        username: () => `
        <div class="center-column-container">
            <h2>Change your username</h2>
            <p class="edit-card-info">Enter a new username and your existing password.</p>
            <button class="center-container" id="close-edit-card">
                <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                </svg>
            </button>
        </div>
        <div class="column-container">
            <p class="category-text">USERNAME</p>
            <input class="input-field" name="name" value="${PLACEHOLDER["name"]()}" maxlength=100 required />

            <p class="category-text">CURRENT PASSWORD</p>
            <input class="input-field" type="password" name="passwd" maxlength=50 required />
        </div>
        <button edit-submit class="edit-submit-btn submit-btn" id="submit-name">Done</button>
        `,
        email: () => `
        <div class="center-column-container">
            <h2>Change your email</h2>
            <p class="edit-card-info">Enter a new email and your existing password.</p>
            <button class="center-container" id="close-edit-card">
                <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                </svg>
            </button>
        </div>
        <div class="column-container">
            <p class="category-text">EMAIL</p>
            <input class="input-field" name="email" value=${PLACEHOLDER["email"]()} maxlength=100 required />

            <p class="category-text">CURRENT PASSWORD</p>
            <input class="input-field" type="password" name="passwd" maxlength=50 required />
        </div>
        <button edit-submit class="edit-submit-btn submit-btn" id="submit-email">Done</button>
        `,
        phone: () => `
        <div class="center-column-container">
            <h2>${(settings.phone == "not set") ? ("Add") : ("Change")} your phone number</h2>
            <p class="edit-card-info">Enter a new phone number and your existing password.</p>
            <button class="center-container" id="close-edit-card">
                <svg width="16" height="16" fill="var(--FONT_DIM_COLOR)" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
                </svg>
            </button>
        </div>
        <div class="column-container">
            <p class="category-text">PHONE NUMBER</p>
            <input class="input-field" name="phone" value="${PLACEHOLDER["phone"]()}" maxlength=100 required />

            <p class="category-text">CURRENT PASSWORD</p>
            <input class="input-field" type="password" name="passwd" maxlength=50 required />
        </div>
        <button edit-submit class="edit-submit-btn submit-btn" id="submit-phone">Done</button>
        `,
        password: () => `
        <div class="center-column-container">
            <h2>Update your password</h2>
            <p class="edit-card-info">Enter your current password and a new password.</p>
            <button class="center-container" id="close-edit-card">
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
        <button edit-submit class="edit-submit-btn submit-btn" id="submit-password">Done</button>
        `
    }

    function open_edit_window(edit_window) {
        edit_card.innerHTML = EDIT_WINDOWS[edit_window]()
        document.getElementById("close-edit-card").addEventListener("click", () => { overlay_close() })
        document.querySelector("[edit-submit]").addEventListener("click", async () => {
            let btn_id = document.querySelector("[edit-submit]").id.replace("submit-", "")

            let data = document.getElementsByName(btn_id)[0].value
            let password = document.getElementsByName("passwd")[0].value

            if (data == PLACEHOLDER[btn_id]() || password == "") { return overlay_close() }

            let response = await api_send("user", me.id, { password: password, settings: `${btn_id}='${data}'` })

            if (response.message == "401 Unauthorized") { flash_message("Wrong password!", "error") }
            else if (response.message == "406 Not Acceptable") { flash_message(response.flash_message, "error") }
            else {
                if (me[btn_id]) { me = response.data }
                else if (settings[btn_id]) { settings = response.data }

                overlay_close();
                open_category("refresh")
                flash_message("Settings saved!")
            }
        })

        overlay_open(edit_card)
    }


    // PAGES
    const SETTINGS_PAGES = {
        // ACCOUNT PAGE
        account: () => `
        <h2 class="settings-title">Account</h2>
        <div class="settings-card column-container">
            <div class="user-info center-container">
                <img class="settings-avatar" src="/api/photos/${me.avatar}.webp"/>
                <h2>${me.name}<span class="user-tag">#${me.tag}</span></h2>
            </div>
            <div class="account-settings column-container">
                <div class="spaced-container">
                    <div class="column-container">
                        <p class="category-text">USERNAME</p>
                        <p>${me.name}<span class="user-tag">#${me.tag}</span></p>
                    </div>
                    <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-username">Edit</button>
                </div>
                <div class="spaced-container">
                    <div class="column-container">
                        <p class="category-text">EMAIL</p>
                        <p>${settings.email}</p>
                    </div>
                    <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-email">Edit</button>
                </div>
                <div class="spaced-container">
                    <div class="column-container">
                        <p class="category-text">PHONE NUMBER</p>
                        <p>${(settings.phone == "not set") ? ("You haven't added a phone number yet.") : (settings.phone)}</p>
                    </div>
                    <button settings-edit class="settings-btn stng-edit-btn" id="settings-edit-phone">
                        ${(settings.phone == "not set") ? ("Add") : ("Edit")}
                    </button>
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
            <button settings-action class="settings-btn stng-warning-btn" id="settings-action-delete_account">Delete Account</button>
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
        <hr class="separator"/>
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
        `,

        // ADVANCED PAGE
        advanced: () => `<h2 class="settings-title">Advanced</h2>`,
    }

    function open_category(category = "account") {
        if (category === current_page && category == "refresh") return
        if (category == "refresh") { category = current_page }

        if (current_page) { document.getElementById(`settings-open-${current_page}`).style = "" }
        document.getElementById(`settings-open-${category}`).style.backgroundColor = "var(--BUTTON_HOVER)"

        document.getElementById("settings-content").innerHTML = SETTINGS_PAGES[category]()
        current_page = category

        document.querySelectorAll("[settings-action]").forEach(button => { button.addEventListener("click", () => ACTIONS[button.id.replace("settings-action-", "")]()) })
        document.querySelectorAll("[settings-edit]").forEach(button => { button.addEventListener("click", () => open_edit_window(button.id.replace("settings-edit-", ""))) })

        if (category == "appearance") {
            document.querySelectorAll("[theme-btn]").forEach(button => { button.addEventListener("click", () => theme_change(button.id.replace("btn-theme-", ""))) })
            document.querySelectorAll("[message-display-btn]").forEach(button => { button.addEventListener("click", () => message_display_change(button.id.replace("btn-message-display-", ""))) })

            document.getElementById(`select-theme-${settings.theme}`).classList.add("active")
            document.getElementById(`btn-theme-${settings.theme}`).classList.add("active")

            document.getElementById(`select-message-display-${settings.message_display}`).classList.add("active")
            document.getElementById(`btn-message-display-${settings.message_display}`).classList.add("active")
        }
    }
})