import htmlparser2 from "htmlparser2"
import assert, {isEnum} from "~/my-assert"

type Feed = {
  "valid": true,
  "title": string,
  "lastEntryUrl": string,
  "lastEntryTitle"?: string,
}

type FeedError = {
  valid: false,
  error: ErrorReason,
  message?: string
}

enum ErrorReason {
  BAD_URL,
  BAD_STATUS,
  BAD_FEED,
  NO_TITLE,
  NO_ITEMS,
  UKNOWN,
}

type ComicError = {
  feedUrl?: string
  title?: string
  avatarUrl?: string
  username?: string
  color?: string
}

export async function checkFeed(feedUrl: string) : Promise<Feed | FeedError> {
  try {
    assert(/^https?:\/\/.+\..+/.test(feedUrl), ErrorReason.BAD_URL)
    const res = await fetch(feedUrl)
    assert(res.status === 200, `${res.status}: ${res.statusText}`)
    const html = await res.text()
    const feed = htmlparser2.parseFeed(html)
    assert(feed, ErrorReason.BAD_FEED)
    assert("title" in feed && feed.title, ErrorReason.NO_TITLE)
    assert(feed.items.length > 0, ErrorReason.NO_ITEMS)
    assert(feed.items[0].link)
    return  {
      "valid": true,
      "title": feed.title,
      "lastEntryUrl": feed.items[0].link,
      "lastEntryTitle": feed.items[0].title || feed.title,
    }
  } catch(e) {
    if (isEnum<ErrorReason>(e, ErrorReason)) {
      return {
        valid: false,
        error: e,
      }
    } else if (typeof e === "string") {
      return {
        valid: false,
        error: ErrorReason.BAD_STATUS,
        message: e
      }
    } else if (e instanceof Error){
      return {
        valid: false,
        error: ErrorReason.UKNOWN,
        message: `${e.name}: ${e.message}`
      }
    } else {
      const error = e as never
      throw error
    }
  }
}

export async function proposeComic(formData: FormData) {
  const errors: ComicError = {}

  const feedUrl = formData.get("feedUrl")
  const title = formData.get("title")
  const color = formData.get("color")
  const username = formData.get("username")
  const avatarUrl = formData.get("avatarUrl")
  // return [{title: "Not implemented"}, {feedUrl, title, color, username, avatarUrl}]
  if (typeof feedUrl === "string") {
    const feed = await checkFeed(feedUrl)
    if (!feed.valid) errors.feedUrl = getErrorMessage(feed)
  } else {
    errors.feedUrl = "This is required"
  }
  if (typeof title !== "string" || title.length === 0) errors.title = "This is required"
  if (typeof color === "string" && color.length > 0) {
    let message = ""
    if (!/#?.{6}/.test(color)) {
      message += "Must be 6 digits. ";
    }
    if (!/^#?[\da-fA-F]*$/.test(color)) {
      message += "Digits must be either numbers 0-9 or letters A-F";
    }
    errors.color = message || undefined
  }

  if (typeof avatarUrl === "string" && avatarUrl.length > 0) {
    if(/^https?:\/\/.+\..+/.test(avatarUrl)) {
      errors.avatarUrl = "Must be a valid url"
    }
  }

  if (Object.keys(errors).length) {
    return errors
  } else {
    //add to database
    return
  }
}

function getErrorMessage(feed: FeedError) {
  switch (feed.error) {
    case ErrorReason.BAD_URL:
      return "Please enter a valid URL."
    case ErrorReason.BAD_STATUS:
      return `Got an HTTP ${feed.message} error when checking the URL.`
    case ErrorReason.NO_ITEMS:
    case ErrorReason.NO_TITLE:
      return `This feed is empty. Please check the feed.`
    case ErrorReason.BAD_FEED:
      return `Couldn't process the feed. Please check the url.`
    case ErrorReason.UKNOWN:
      return `Something went wrong. ${feed.message}. Please check the url.`
  }
}