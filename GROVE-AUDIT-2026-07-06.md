# Grove — Full Audit

Date: 2026-07-06 · Auditor: Claude (Fable), 6 parallel dimension audits, cross-verified
Scope: `grove/app/grove.hoon` (agent), `grove/sur`, `grove/mar`, full `grove-ui` (agent, JSON contract, UI data/sync, UI rendering, upload/blob-serving/PWA, agent↔UI contract)

## Corrections to prior assumptions
- Grove is **state-8**, not state-1.
- **Blobs live IN AGENT STATE** (`b=(map file-id octs)`), not Clay-served. The generic `grove-fileserver.hoon` only serves the `/web` frontend; blobs are served by `grove.hoon`'s own HTTP handler from the in-state `b` map. (This is the root of the large-file scaling concern below.)

## Executive summary
Grove's UI is in better shape than KIN's (no fact-heartbeat bug, no rules-of-hooks crash, stable keys, correct AND view filtering, no object-URL leaks, PDF worker configured right). But it has:
- a **security leak** (unauthenticated `/updates` → any ship reads your whole file index),
- the **same service-worker-caches-the-Urbit-channel** critical KIN had,
- the **same peer-sharing-dies-on-kick** pattern,
- and **file-app-specific** breakers: non-idempotent uploads → duplicate files, no large-file path, stale-after-OTA caching, and a corrupted default sort order.

There are **no Hoon tests** and only partial UI tests, which is why these persisted.

### Cross-check corrections (findings that did NOT survive verification)
- **`cacheUpdated` "nonexistent mark" — FALSE POSITIVE.** One auditor claimed the post-fetch cache update never reaches the browser because `%grove-update` has no mark. Verified: `mar/grove/update.hoon` **exists** (`%grove-update` → `grove/update` via Clay's `-`→`/`) and has a `grow %json` arm with a correct `%cache-updated → {type:'cacheUpdated',owner,meta}` case. It works. Downgraded to the duplicated-encoder drift risk (MEDIUM) below.
- **View filter OR-not-AND** — the *agent* scry filters with OR, but the **UI `filter.ts` correctly does AND** (`view.tags.every(...)`), so local views work as intended. The agent OR filter is a latent server-side inconsistency (wrong only if a peer relies on server-side filtering), not a user-facing break. MEDIUM, not HIGH.

---

## CRITICAL

**C1 — `/updates` subscription is unauthenticated → full metadata leak to any ship.** `app/grove.hoon:1387-1393`. `on-watch` accepts `[%updates ~]` from any `src.bowl` with no `?> =(our.bowl src.bowl)`. Every mutation broadcasts on `/updates`, so any ship that `%watch`es it receives your entire file index, trust/block lists, inbox, and share tokens. **Fix:** guard the arm with `?>(=(our.bowl src.bowl) ...)`.

**C2 — Service worker caches the live `/~/channel` SSE stream and all scries (the KIN bug, exactly).** `grove-ui/src/sw-custom.ts:49` `setDefaultHandler(new NetworkFirst())`; the channel route only matches method `PUT`, so the EventSource GET and scry GETs fall through and get `cache.put()`'d — stalling on the never-ending `text/event-stream`, severing live updates, and serving stale scry reads. Also breaks the upload-completion flow (`useUpload` waits on `fileAdded` over that SSE + `scryFiles`). **Fix:** `registerRoute(({url}) => url.pathname.startsWith('/~/'), new NetworkOnly())` before the default; make the default `NetworkOnly`.

**C3 — `err`/initial-subscribe failure never resubscribe → live sync silently dies.** `api.ts:301-346`, wired `useGroveData.ts:227-233`. Only `quit` reconnects; the `err` callback just logs, and the initial `openSubscription()` has no `.catch` (unhandled rejection, no retry). On any error the UI shows the one-shot scry result and never updates again until reload. **Fix:** give `err` and the initial-open rejection the same backoff-reconnect as `quit`.

---

## HIGH

**H1 — Peer catalog view never resubscribes after a kick → sharing silently dies (KIN-class).** `app/grove.hoon:1533-1541`. On `%kick` the agent tears down the sub and emits `catalogPeerRemoved` but never re-`%watch`es. Any transient kick permanently kills the peer view. **Fix:** on `%kick`, if still desired (`(~(has by cat-subs) k)`), re-issue the `%watch`.

**H2 — Deleting a file doesn't notify catalog peer-subscribers → phantom files persist.** `app/grove.hoon:339-358` + `catalog-broadcast-for-file:730-737`. `%delete` removes the file from catalogs *then* calls the broadcaster, which matches by current membership — now empty — so it emits nothing. Remote peers keep showing the deleted file. **Fix:** capture affected catalog-ids from the old state before removal, broadcast those.

**H3 — Uploads are not idempotent, but three layers retry them → duplicate files.** Server mints id from `sham [eny now name]` (`grove.hoon:330`); the app poke-queue re-sends on error (`api.ts:255-277`); the SW `BackgroundSyncPlugin` replays failed channel PUTs for 24h (`sw-custom.ts:35-43`). A lost ack → duplicate 20MB file (possibly a third, out-of-order, hours later). **Fix:** derive the id client-side (content hash), agent no-ops if id exists; drop BackgroundSync on `/~/channel` PUTs.

**H4 — Whole-file base64 in one poke, stored in agent state → memory/body/loom blowup.** `api.ts:404` reads the entire file to a data URI; `useUpload.ts:49-50` sends one poke; `grove.hoon:335` stores octs in state `b`, snapshotted every event. A 20MB file → ~27MB base64 string + ~27MB channel body (Eyre cap) + permanent in-state blob. No chunking, no Clay. **Fix (larger lift):** chunked uploads + store blobs in Clay. *(Architectural; flag before implementing.)*

**H5 — Cache invalidation broken on deploy → stale JS/CSS forever after OTA.** `vite.config.ts:64-68` forces unhashed `[name]` filenames; precache entries are `revision:null`. Workbox serves the old bundle indefinitely after an OTA (new shell, old code). **Fix:** restore content-hash filenames (`[name].[hash].js`) or inject real revisions.

**H6 — SW default `NetworkFirst` also caches every blob download → quota bloat.** `sw-custom.ts:49`. `/grove-file/…` downloads get cached; large files fill runtime cache → `QuotaExceededError`, evicting the precache. **Fix:** explicit `NetworkOnly` route for `/grove-file/`, `/grove-remote-file/`, `/grove-share/`.

**H7 — `beforeinstallprompt` captured too late; `window.__pwaPrompt` never set → Install button never appears.** `InstallBanner.tsx:16,113`. Listener added in `useEffect`, after Chrome fires the event; no early-capture script in `index.html`. **Fix:** capture in an inline `<head>` script into `window.__pwaPrompt` (which the component already reads).

**H8 — Default sort order is corrupted (lexicographic compare on non-zero-padded `@da`).** `sort.ts:13-14` (and `InboxView.tsx:29`, `CatalogDetailView.tsx:39`) string-compare raw Urbit `@da` (`~2026.4.15..` unpadded), so "Apr 15" sorts older than "Apr 9" and December before September. Corrupts the **default** library sort. Tests missed it (single-digit dates only). **Fix:** parse `@da` into a numeric key (via `format.ts`'s regex → tuple/`Date.UTC`) before comparing; add a ≥10-day / 2-digit-month test.

**H9 — `set-description` is a contract hole → file descriptions can never be edited.** UI `types.ts:245` declares the action, but there's no agent arm/mark/handler; a file's `description` can only ever be `''` (set at upload). If wired, the poke would nack. **Fix:** add the action arm + parser + `%file-updated` broadcast, or remove the dead UI type.

---

## MEDIUM

- **Scry↔subscription races (data layer):** `refreshAll` snapshot vs live facts unsynchronized → gap loses updates AND a late `setFiles(new Map(...))` clobbers live mutations (`useGroveData.ts:209-233`). Subscribe-first + buffer, or reconcile instead of wholesale replace.
- **IDB cache restore can overwrite fresh scry data** (`useGroveData.ts:209-225`) — order guard needed.
- **`refreshAll` `Promise.all` is fail-fast** — one bad scry blanks the whole app; use `allSettled` (`useGroveData.ts:44-60`).
- **Access-narrowing doesn't kick unauthorized subscribers** (`grove.hoon:561-589`) — a peer who loses catalog access keeps receiving facts. Kick on narrow.
- **`accept-offer` never fetches the blob** (`grove.hoon:464-470`) — accept only flips a flag; the UI must separately drive `%fetch`+`%plant`. Chain it or document.
- **Two duplicated update encoders** (inline `update-json` + `mar/grove/update.hoon`) drift-prone and already disagree on casing. Collapse to one shared enjs core.
- **Peer-sharing rides version-fragile `grad %noun` marks** (`grove-catalog-listing`; `grove-remote` has no mark) → cross-version peer `!<` crash. Add versioning/epic.
- **Content-type map too small** (`grove.hoon:1071-1088`) — webm/mov/avif/etc → octet-stream, so previews the UI advertises fail. Expand.
- **No HTTP range support** (`grove.hoon:1063-1069`) — no video/audio seek, no PDF partial load. Honor `Range` → 206.
- **pdf.worker.mjs + webmanifest not precached** (`vite.config.ts:48`) — offline PDF + install metadata break. Add `mjs,webmanifest` to globPatterns.
- **Concurrent uploads clobber shared refs** (`useUpload.ts:39-66`) — busy-guard/queue.
- **Modals: no Escape / focus trap / dialog role** (`Backdrop.tsx`) — keyboard/AT users trapped.
- **Mobile FileDetails content hidden behind MobileTabBar** (`FileDetails.tsx:57`) — add bottom padding.
- **Pull-to-refresh: per-touchmove setState + height animation** (`usePullToRefresh.ts:44`) — KIN scroll-rule violation; ref + transform.
- **Poke queue head-of-line blocking** (`api.ts:255-277`) — one failing poke stalls all queued actions.

## LOW
Orphaned share/allow state on `%delete`; `%offer` self-poke crash; silent outbound-poke failures; grid focus resets on background update; `InstallBanner` dead diagnostic panel leaks CSP/UA to users; unused agent scry arms; `normalizeUpdate` camelCase-only wrapper fields; catalog tag search case-sensitive; `size` as JS number >2^53; large libraries not virtualized.

## What's solid (don't churn)
No fact-heartbeat bug; no rules-of-hooks crash; correct AND view filtering in the UI; stable React keys; no object-URL leaks; PDF worker + code-splitting correct; auth model right (`/grove-file` authenticated, `/grove-share` public-token); channel PUT correctly `NetworkOnly`; manifest complete + correctly served; SW registration path/scope correct; base64 round-trips correctly; all emitted asset extensions have MIME marks; on-load migration 0→8 complete with no `!!`; local-action poke authorization correct; blob URL contract (all 3 routes) matches; 21/22 update facts + all scry paths + all action verbs match.

## Test gaps
No Hoon tests at all (no enjs↔dejs round-trip, no migration test, no decoder-robustness test). UI tests miss: `handleUpdate` reducers, poke queue/retry/reconnect, and the date-sort bug (single-digit dates only). Add a golden-JSON fixture shared by a Hoon test and `api.test.ts`.

## Recommended fix order (biggest win first)
1. **C1** `/updates` auth guard (security).
2. **C2** SW `NetworkOnly` for `/~/` (+ blobs, H6).
3. **C3** UI err/initial reconnect.
4. **H1** peer resubscribe-on-kick; **H2** delete notifies catalog peers.
5. **H8** date-sort fix (default sort correctness).
6. **H3** upload idempotency (client id + agent no-op) + drop BackgroundSync.
7. **H5** hashed filenames; **H7** early install-prompt; **H6** blob NetworkOnly.
8. Data races (subscribe-first/allSettled), M1 MIME map, M2 range, M3 precache, modals, mobile padding.
9. **H4** large-file chunking + Clay storage — *architectural, flag/scope separately*.
10. Backfill Hoon + reducer/reconnect tests.
