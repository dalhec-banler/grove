# Grove — Project Handoff / Status

_Last updated 2026-07-06. Companion to the full audit in `GROVE-AUDIT-2026-07-06.md` (this repo) and Austin's cross-project handoff at `~/Desktop/AI-HANDOFF-2026-07-06.md`._

## What Grove is
`%grove` Urbit Gall agent + React/TS UI (`@urbit/http-api`, react-pdf, workbox PWA). A file manager: files, tags, **tag-filtered views (AND semantics — intentional)**, catalogs, peer-browsing, and inbox sharing.

**Two facts worth pinning (earlier notes were wrong):** the agent state is **version 8**, and file **blobs live IN AGENT STATE** (`b=(map file-id octs)`), served by the agent's own HTTP handler — they are **not** Clay-served. This is the root of the large-file scaling item below.

**Design constraint:** the desktop UI design is FIXED — never redesign it; mobile/PWA changes are additive via responsive breakpoints.

## Status: ✅ audited, fixed, merged to `main`
Full 6-dimension audit, cross-verified; all fixes on `main` (PR #1). Highlights:

- **CRITICAL security:** `/updates` was unauthenticated — any ship could subscribe and read your entire private file index, trust/block lists, inbox, and share tokens. Now guarded (`?>(=(our.bowl src.bowl))`).
- **Service worker cached the Urbit channel/scries/blobs** (severed live updates, broke upload completion). Now `NetworkOnly` for `/~/` and blob routes; BackgroundSync dropped.
- **Live sync died on error** — only `quit` reconnected; `err`/initial-failure did nothing. Now all route through one exponential-backoff reconnect.
- **Peer-sharing died on kick** (never resubscribed) → fixed. **Deleting a file left phantom copies on peers** → `%delete` now notifies catalog subscribers.
- **Uploads weren't idempotent** (entropy id + 3 retry layers → duplicate files) → UI sends a stable content-derived `@uv` id; agent no-ops if it exists.
- **Default sort was corrupted** — lexicographic compare on non-zero-padded `@da` ("Apr 15" sorted older than "Apr 9") → parse to a numeric key.
- Hashed filenames (no stale-after-OTA), early install prompt, added `set-description`, expanded MIME map, HTTP Range, modal a11y, mobile padding, pull-to-refresh via transform.

## Verified live
On dev moon `~sipsun-monbel-dozzod-hobdem` (grove desk mounted): agent compiles + reloads clean, served UI matches the built glob, SW carries the `/~/` fix, and **upload idempotency** (same-id upload twice → one file), **set-description** (new action), and `%delete` were exercised live. **160 UI tests pass.**

## Deferred / next — needs Austin's sign-off (architectural)
- **Large-file support.** Today the whole file is base64'd into one poke and blobs live in agent state → memory/loom pressure, and Eyre's body cap limits size. The real fix is **chunked uploads + moving blobs to Clay**. This changes how Grove stores files, so it wants a design pass + approval before implementation.

## How to continue
Drive the dev ship headlessly per the cross-project handoff playbook. Deploy = `rsync` the desk into `<pier>/grove/` then dojo `|commit %grove` (clean `gall: reloading %grove` = compiles). UI dev: `cd grove-ui && npm i && npm run dev`; tests `npm test`.
