# Dots and lines: operational points, primary locations and sections of line

Slidev deck, follow-up to [One network, one truth](https://github.com/Matdata-eu/slides-railway-topology).
It takes the railway topology to the mesoscopic level: what operational points (OP), primary locations (PL)
and sections of line (SoL) are, how differently infrastructure managers fill them in, and five ways to connect
primary locations to each other. Presented on behalf of Bane NOR.

**Live slides:** https://matdata-eu.github.io/slides-railway-meso-topology/

## Getting started

```bash
npm ci
npm run dev
```

Open http://localhost:3030 to see the slides, and http://localhost:3030/presenter for presenter mode with speaker notes.

| Script | What it does |
|---|---|
| `npm run dev` | Live-reloading dev server |
| `npm run build` | Static site in `dist/` |
| `npm run export` | PDF export (`slides-export.pdf`, needs Playwright Chromium) |

## Publishing

- **GitHub Pages** (`.github/workflows/deploy.yml`): every push to `main` builds the deck with base path `/slides-railway-meso-topology/` and deploys it. Change the base path if the repository gets another name.
- **PDF release** (`.github/workflows/release.yml`): pushing a tag such as `v1.0.0` exports the slides (with click steps) to PDF and attaches it to a GitHub release.

## Interactive components

Toy networks:

- `lib/net.ts`: the single-track station from the first talk (used by `TopoBuildUp`).
- `lib/net2.ts` + `lib/catenary.ts`: the double-track station with catenary sections and signals.
- `lib/meso.ts`: a corridor with three OPs (Vest, Stasjon, Øst) and six primary locations, with PL routing on the micro topology.

| Component | Slide | What you can do live |
|---|---|---|
| `TopoBuildUp` | Where we left off | Last two steps of the first talk: meso and macro aggregation (macro keeps line ends, junctions and interchange stations) |
| `MicroViews` | One network, many topologies | Track, catenary and signal (route) topology of the same station |
| `MesoViews` | And at meso level too | Micro tracks, OP–SoL view, PL view, macro line |
| `ImVariants` | One corridor, three IMs | Three ways IMs turn the same corridor into OPs, SoLs, primary and subsidiary locations |
| `OpSplit` | What we do today: split the OP | Bane NOR's 1 OP = 1 PL |
| `PlConnect mode="assume"` | Option 1 | Assume all PLs connected inside and across OPs; check against the micro topology |
| `PlConnect mode="main"` | Option 1b | One main PL per OP; wrong and missing connections |
| `PlConnect mode="route"` | Option 2 | Click a PL to route out of it through navigable relations; generate all PL connections |
| `PlConnect mode="explicit"` | Option 3 | PL connections as objects; untick to keep one internal |
| `MesoLevel` | Option 4 | A meso topology level aggregating the micro level, with OPs, PLs, SoLs and other things positioned on it |

## License

Code under the MIT License, slide content under CC BY 4.0. The Bane NOR logos are trademarks of Bane NOR SF and are not covered. See [LICENSE](LICENSE).
