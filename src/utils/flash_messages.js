const info_icon = (
    <svg width="20" height="20" fill="#3ba55c" viewBox="0 0 16 16">
        <path stroke="#3ba55c" stroke-width="2" d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
    </svg>
)

const error_icon = (
    <svg width="14" height="14" fill="#c24246" viewBox="0 0 16 16">
        <path stroke="#c24246" stroke-width="2" d="M9.41423 7.99943L15.7384 1.67529L14.3242 0.261078L8.00001 6.58522L1.67587 0.261078L0.261658 1.67529L6.5858 7.99943L0.261658 14.3236L1.67587 15.7378L8.00001 9.41365L14.3242 15.7378L15.7384 14.3236L9.41423 7.99943Z"></path>
    </svg>
)

function flash_message(text, type = "info") {
    let id = text.toLowerCase().replaceAll(" ", "")

    if (!document.getElementById(id)) {
        document.getElementById("flash-box").innerHTML += (
            <div className="flash-message center-container" id={id}>
                {type === "error" ? error_icon : info_icon}
                <p>{text}</p>
            </div>
        )

        setTimeout(() => document.getElementById(id).remove(), 3000)
    }
}