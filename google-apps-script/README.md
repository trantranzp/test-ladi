# Lead capture backend (Google Sheets + Telegram)

`Code.gs` is an Apps Script Web App, bound to your spreadsheet, that:
1. Appends every form submission to a `Leads` tab (auto-created on first lead).
2. Sends a Telegram message to your chat via the bot token.

The bot token never appears in the website's source — it only lives inside
this Apps Script project, which Google runs server-side.

## Deploy (one time)

1. Open the spreadsheet: https://docs.google.com/spreadsheets/d/1EMhKBMYuyYZcFRgC8Mduw_hncFQYQx1YcpGlGZHcYBY/edit
2. **Extensions → Apps Script**.
3. Delete the default `Code.gs` contents and paste in this file's contents.
4. Click **Save**, then **Run** once (pick the `doPost` function isn't runnable
   directly — instead just click the disk/save icon; the first real run will
   happen when the site sends data). Google will prompt you to authorize the
   script the first time it actually runs — that's expected.
5. **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, authorize when prompted.
6. Copy the **Web app URL** (ends in `/exec`).
7. Open `site/script.js` and set:
   ```js
   var GOOGLE_SCRIPT_URL = 'PASTE_YOUR_/exec_URL_HERE';
   ```

That's it — every form on the landing page (mini form, main form, sticky
bar, popup) now POSTs to that URL, which logs the row and fires the Telegram
alert.

## If Telegram messages don't arrive

Telegram chat IDs for **groups/supergroups** are usually negative and start
with `-100` (e.g. `-1003223690049`). The chat ID provided (`1003223690049`)
has no leading minus sign — if no messages show up, try adding `-100` in
front of it inside `Code.gs` (`TELEGRAM_CHAT_ID`) and redeploy. You can
confirm the right ID by sending any message in the chat and checking
`https://api.telegram.org/bot<TOKEN>/getUpdates`.

## Redeploying after edits

Apps Script Web App URLs only change if you create a **new** deployment.
If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit →
New version** to update the existing `/exec` URL in place (no need to touch
`script.js` again).
