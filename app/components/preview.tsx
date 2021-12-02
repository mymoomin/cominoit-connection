export type Theme = "dark" | "light"

export type PreviewData = {
  theme?: Theme,
  title?: string,
  avatarUrl?: string,
  username?: string,
  color?: string,
  lastEntryTitle?: string,
  lastEntryUrl?: string
}

export default function Preview({
  theme = "dark",
  avatarUrl = "/webhook_icon.svg",
  username = "RSS to Webhook",
  title = "Default Comic",
  color = "",
  lastEntryTitle = "Default Comic: Page 2",
  lastEntryUrl = "#"
}:
  PreviewData
) {
  return (
    <div className={`preview theme-${theme}`}>
      <div className="message">
        <div className="contents">
          <img className="avatar" src={avatarUrl} alt="avatar" loading="lazy" />
          <h2 className="header">
            <span id="message-username" className="headerText">
              <span className="username">{username}</span>
              <span className="botTag">
                <span className="botText">BOT</span>
              </span>
            </span>
            <span className="timestamp">
              <time id="message-timestamp">
                <i className="separator">-</i>
                07/11/2021
              </time>
            </span>
          </h2>
          <div id="message-content" className="messageContent">
            <span className="roleMention">@{title}</span>
          </div>
        </div>
        <div className="embedContainer">
          <div className="embedWrapper" style={{ borderLeftColor: color || "var(--background-tertiary)" }}>
            <div className="grid">
              <div className="embedTitle embedCommon">
                <a href={lastEntryUrl} target="_blank" className="embedTitleLink embedTitle">
                  <strong>{lastEntryTitle || title}</strong>
                </a>
              </div>
              <div className="embedDescription embedCommon">New {title}!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

