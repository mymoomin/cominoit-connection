import styles from "~/styles/adder/styles.css";
import discordResets from "~/styles/adder/discord-resets.css";
import discord from "~/styles/adder/discord.css";
import { ActionFunction, Form, json, redirect, useActionData, useFetcher, useLoaderData, useSubmit } from "remix";
import { useState, useCallback } from "react";
import type { ChangeEvent, FormEvent, MouseEventHandler } from "react";
import type { LoaderFunction } from "remix"
import Preview, {Theme} from "~/components/preview";
import type {PreviewData} from "~/components/preview";
import { addToDatabase, checkFeed, proposeComic } from "~/rss.server";
import { useToggle } from "~/hooks";

export let action: ActionFunction = async ({request}) => {
  const newComic = await request.formData();
  const errors = await proposeComic(newComic);
  console.log("hi hello i exist")
  if (errors) {
    let values = Object.fromEntries(newComic);
    console.log(errors, "\n\n", values)
    return { errors, values };
  } else {
    const res = new Response(null, {
      status: 204,
      headers: {
        "X-Remix-Redirect": "/adder"
      }
    })
    return res
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const feedUrl = url.searchParams.get("feedurl");
  // console.log(process.env.MONGODB_URI)
  if (feedUrl) {
    const feed = await checkFeed(feedUrl)
    return json(feed)
  } else {
    return json({valid: false, error: 0})
  }
}


export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: discordResets },
    { rel: "stylesheet", href: discord },
    // { rel: "preload", href: "fonts/whitney-400.subset.woff2", as: "font", type: "font/woff2", crossOrigin: true},
    // { rel: "preload", href: "fonts/whitney-500.subset.woff2", as: "font", type: "font/woff2", crossOrigin: true},
    // { rel: "preload", href: "fonts/whitney-600.subset.woff2", as: "font", type: "font/woff2", crossOrigin: true},
  ]
}

export default function Page() {
  const [state, setState] = useState<PreviewData>({
    title: undefined,
    avatarUrl: undefined,
    username: undefined,
    color: undefined,
  })
  const fetcher = useFetcher()
  const actionData = useActionData()

  const [theme, toggle] = useToggle(false)

  const themeName = theme ? "light" : "dark"

  const checkFeedUrl: MouseEventHandler = async (event) => {
    const feedUrl = ((event.target as HTMLElement).previousElementSibling as HTMLInputElement).value
    fetcher.load(`/adder?feedurl=${feedUrl}`)
    console.log(fetcher.data)
  }

  function updatePreview(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement
    switch (target.name) {
      case "color":
        if (target.value) {
          target.value.replace("#", "")
          setState({ ...state, color: target.value })
        } else {
          setState({ ...state, color: undefined })
        }
        break;
      default:
        setState({ ...state, [target.name]: target.value || undefined })
        break;
    }
  }
  return (
    <main>
      <Form method="post" className="panel" onChange={updatePreview}>
        <h1>Add a Comic</h1>

        <pre>{JSON.stringify(fetcher.data, null, 4)}</pre>

        <section>
          <label htmlFor="feed" className="required">Feed URL</label>
          <div className="input-wrapper">
            <input
              id="feed"
              name="feedUrl"
              type="url"
              pattern="https?://.+\..+"
              placeholder="https://www.sleeplessdomain.com/comic/rss"
              aria-describedby="url-constraints"
              required
              defaultValue={actionData?.values.feedUrl}
            />
            <button type="button" className="notransition" onClick={checkFeedUrl}>Check feed</button>
          </div>
          <div className="descriptor" id="url-constraints">
            Remember to include the <code>https://</code>
          </div>
          { actionData?.errors.feedUrl && (<div className="form-error">{actionData?.errors.feedUrl}</div>)}
        </section>

        <section>
          <label htmlFor="title" className="required">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Sleepless Domain"
            required
            defaultValue={actionData?.values.title} />
          { actionData?.errors.title && (<div className="form-error">{actionData?.errors.title}</div>) }
        </section>

        <section>
          <label htmlFor="color">Embed colour (as hexcode)</label>
          <input
            id="color"
            name="color"
            type="text"
            pattern="#?[\da-fA-F]{6}"
            aria-describedby="color-constraints"
            defaultValue={actionData?.values.color}/>
          {actionData?.errors.color && (<div className="form-error">{actionData?.errors.color}</div>)}
          <div className="descriptor" id="color-constraints">
            Must be 6 hexadecimal digits (numbers 1-9 or letters a-f).
          </div>
        </section>

        <section>
          <label htmlFor="author">Webhook username</label>
          <input
            id="author"
            name="username"
            type="text"
            defaultValue={actionData?.values.username}/>
          {actionData?.errors.username && (<div className="form-error">{actionData?.errors.username}</div>)}
        </section>

        <section>
          <label htmlFor="avatar">Webhook avatar (as url)</label>
          <input
            id="avatar"
            name="avatarUrl"
            type="url"
            pattern="https?://.+\..+"
            defaultValue={actionData?.values.avatarUrl}
          />
          { actionData?.errors.avatarUrl && (<div className="form-error">{actionData?.errors.avatarUrl}</div>)}
        </section>

        <button id="submit" className="center">Add comic</button>
      </Form>

      <section className="panel">
        <div className="preview-position">
          <h1>Preview</h1>
          <Preview {...state} theme={themeName} />
          <button onClick={toggle} className="center">Switch to {themeName} theme</button>
        </div>
      </section>
    </main>
  )
}