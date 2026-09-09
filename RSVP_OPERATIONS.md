# RSVP operations guide

The invitation keeps its custom English and Arabic RSVP controls. A small Cloudflare Worker validates submissions and appends them to the couple's private Google Sheet without displaying third-party form UI.

## Links

- RSVP spreadsheet: <https://docs.google.com/spreadsheets/d/1I991DlUFqCVRogBcmf5jFwY0pRwyN0HJUj3ebgfQ0aU/edit>
- Worker health check: <https://engagement-rsvp.engagement-website.workers.dev/health>
- Public submission endpoint: <https://engagement-rsvp.engagement-website.workers.dev/rsvp>
- Temporary Google Form fallback: <https://forms.gle/daqf2ug4TypLtKwH8>

## Where responses appear

Open the spreadsheet and select the `RSVP Responses` tab. The Worker creates this tab and its headers automatically. Each accepted response records:

- Server receipt time.
- Full name.
- Attendance: `Attending` or `Not attending`.
- Optional message.
- Route language (`en` or `ar`).
- Browser submission time, invitation page URL, and generated submission ID.
- Browser user agent for limited delivery troubleshooting.

The rows named `Codex integration check`, `Codex production Worker check`, `Codex live English Sheets test — please delete`, and `اختبار جوجل شيت العربي من كوديكس — يرجى الحذف` are deployment tests and may be deleted.

## Architecture and privacy

- `assets/js/rsvp-config.js` contains only the public Worker URL.
- `worker/src/index.js` contains the editable validation and Sheets-writing logic.
- The Google service-account JSON is stored locally in the ignored `.env` file and remotely as the Cloudflare Worker secret `SERVICE_ACCOUNT_KEY`.
- The Cloudflare API token is used only by Wrangler. It must not be uploaded as a Worker secret.
- The spreadsheet is shared as Editor only with `engagement-rsvp-writer@engagement-rsvp-507313.iam.gserviceaccount.com` and the intended owners.
- Guest responses are not stored in GitHub, browser storage, query strings, or analytics.

The Worker accepts requests only from the origins listed in `ALLOWED_ORIGINS` (`https://youssef-lara.github.io` for the live site; the former `https://youssefg7.github.io` stays listed only until the move is verified, and can then be dropped), validates lengths and attendance values, treats the hidden `_honey` field as a spam trap, and writes cell values as raw data. Text beginning with a spreadsheet formula character is escaped before storage.

## Deploy Worker changes

From the repository root:

```sh
set -a
source .env
set +a
npx wrangler deploy --config worker/wrangler.jsonc
printf '%s' "$SERVICE_ACCOUNT_KEY" | npx wrangler secret put SERVICE_ACCOUNT_KEY --config worker/wrangler.jsonc
```

The second command is required only when the Google credential changes or a new Worker is created.

Commits to `main` that change `worker/` are deployed automatically by `.github/workflows/worker.yml`. The repository Actions secret `CLOUDFLARE_API_TOKEN` authorizes that workflow. Cloudflare preserves `SERVICE_ACCOUNT_KEY` across these code deployments.

## Rotate credentials

1. Create a new JSON key under the Google service account.
2. Replace `SERVICE_ACCOUNT_KEY` in the ignored `.env` file.
3. Upload it with `wrangler secret put` using the command above.
4. Submit one clearly labeled test RSVP and confirm the row appears.
5. Delete the previous Google service-account key only after the new one works.
6. Revoke and replace the Cloudflare API token separately if it is exposed; it is not required by the running Worker.

## Do

- Review the `RSVP Responses` tab periodically.
- Keep the Sheet and service-account credential private.
- Confirm a Sheet row exists before treating a browser success message as final verification during maintenance.
- Keep the Google Form link as a JavaScript-disabled or network-error fallback until the couple decides it is unnecessary.

## Do not

- Do not embed Google Forms UI; the project owner explicitly rejected that design.
- Do not commit `.env`, service-account JSON, API tokens, or guest data.
- Do not remove submission locking, validation, the honeypot, or localized error handling.
- Do not grant the service account broad project roles. Sharing this individual spreadsheet as Editor is sufficient.
