# Grove

Sovereign file storage for your Urbit ship. Upload, tag, and browse files on your own ship; publish a curated "canopy" of files for friends to subscribe to; subscribe to other ships' canopies.

- **Backend**: Gall agents (`grove`, `grove-fileserver`) serving metadata and Clay-backed blobs
- **Frontend**: React + Vite + TypeScript + Tailwind, packaged as an installable PWA
- **Kelvin**: `[%zuse 409]`

## Repository layout

```
grove/         # Urbit desk — agents, marks, libs, docket, bill
grove-ui/      # Vite React app that builds into the desk's glob
```

Two other directories exist locally but are intentionally excluded from this repo:

- `secrets/` — moon keyfile and `+code`, never committed
- `mcp/` — unrelated tooling

## Distribution

Grove is published from the moon `~midlut-sarseb-palrum-roclur`, which is then re-published by `~palrum-roclur`. End users install from the planet:

```
|install ~palrum-roclur %grove
```

The moon only needs to be online when shipping an update; `~palrum-roclur` serves end users continuously.

## Local development

### Building the UI

```
cd grove-ui
npm ci
npm run build
```

The build output needs to be placed into the desk at `grove/app/grove/` (the glob path referenced by `desk.docket-0`).

### Committing changes to the moon

With the moon's pier mounted and `grove/` synced into it:

```
|commit %grove
```

in the moon's dojo. Updates propagate to `~palrum-roclur` (subscribed via `|install`), which re-publishes to end users.

## Shipping an update

1. Edit code in `grove/` and/or `grove-ui/`
2. `npm run build` in `grove-ui/`, copy output into the desk
3. Push to this repo
4. On whichever machine hosts the moon's pier, `git pull`, then `|commit %grove`
5. `~palrum-roclur` picks up the update automatically and re-pushes to subscribers

## License

MIT
