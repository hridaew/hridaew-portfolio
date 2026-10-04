# Running the One Splat lab locally

The lab pages are ordinary routes in this Next app:

| Route | What it is |
|---|---|
| `/lab/one-splat` | Site hero card, work index, 3D splat, the home page's three cards per project |
| `/lab/one-splat-open` | Same, with a light card-less header; "About me" opens the bio in a sheet from the left |

## First time

```powershell
git fetch origin
git checkout claude/amazing-fermi-fe5rlr
npm install
```

## Every time

```powershell
npm run dev
```

Then open http://localhost:3000/lab/one-splat (or `/lab/one-splat-open`). Edits to anything in
`src/components/lab/one-splat/` hot-reload in the browser.

Where things live:

- `src/components/lab/one-splat/OneSplatPage.tsx`: layout, project list, subtitles, which object shows when
- `src/components/lab/one-splat/OneSplat.module.css`: all lab styling (card positions and arc, masthead, sheet)
- `src/components/lab/one-splat/splatEngine.ts`: the WebGL splat renderer, drag/jiggle physics, each object's best angle (`FRONTS`)
- `public/variants/one-splat/media/*.json`: the splat data, one file per object

## Regenerating splats (only when you change an object)

One-time Python setup (Python 3.10+):

```powershell
pip install -r docs/home-variants/requirements.txt
```

Then:

```powershell
npm run splats -- domis          # just the house (about a minute)
npm run splats -- virdio domis   # several
npm run splats                   # everything; the Mighty Hand needs SAVOR_PLY (below)
```

Objects: `about` (face), `domis` (house model in `docs/home-variants/one-splat-house.py`),
`virdio` (cone), `obscura` (print), `mc` (cat), `side` (Mighty Hand). Reload the page to see the result.

The Mighty Hand is a real Savor capture. To rebuild it, point `SAVOR_PLY` at `samples/sample.ply` from
github.com/hridaew/savor:

```powershell
$env:SAVOR_PLY = "C:\path\to\savor\samples\sample.ply"; npm run splats -- side
```

## Dropping in your own Savor captures

Export the `.ply` from Savor, then in `docs/home-variants/one-splat-gen.py` point that object's entry in
`BUILDERS` at it, for example `"mc": lambda: ply("C:/captures/cat.ply")`, and run `npm run splats -- mc`.
After that, set the object's best viewing angle in `FRONTS` in `splatEngine.ts`.
