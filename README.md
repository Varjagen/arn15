# Burrows and Badgers

A lightweight, single-page **virtual tabletop** for D&D and other tabletop RPGs.
Static web app, **no backend** - the DM and players sync peer-to-peer over
WebRTC (PeerJS). Deploys to GitHub Pages in minutes.

*Internally codenamed **The Plague's Call** (storage keys & comments use
`plagues-call.*`); originally Shadowquill.*

> **Developing it?** See **[CONTRACT.md](CONTRACT.md)** for the architecture,
> the DM↔player data contract, the action catalog, and the `TUNING` knobs.
>
> **Which rules are automated?** See **[RULES-MATRIX.md](RULES-MATRIX.md)** - a
> traceability matrix covering 24 rules areas, each recording the implemented
> behaviour, source module, automated tests, what stays manual, known
> limitations, and how a GM overrides it.

---


## Deploying

Static hosting, no build step. **`vendor/` and `.nojekyll` must reach the
server** - dragging files onto a web uploader skips folders and hides dotfiles,
which produces `React is not defined` and three 404s. See
[DEPLOY.md](DEPLOY.md).

## What the rules engine does - and does not - automate

This is a **2014 (5th edition) rules engine**, not a rules-enforcing straitjacket.
The short version:

**Automated.** Ability checks, saving throws and attacks all resolve through one
d20 service, so conditions, exhaustion, armour proficiency, magic items and
class features compose without any of them knowing about each other. Damage and
healing run through one HP pipeline with resistance, vulnerability and immunity.
All 14 conditions plus 6 exhaustion levels are data-driven. AC uses seven
mutually exclusive formulas. Spell slots, Pact Magic, multiclassing, character
progression for all 12 classes, monster stat blocks, vision and lighting, and
the environmental subsystems are all modelled and tested.

**Deliberately manual.** The GM decides *when* things happen. Nothing watches a
clock to demand an hourly heat save, nothing auto-rolls death saves at the start
of a turn, and legendary and lair actions are offered rather than taken. Whether
a Perception check depends on sight, whether an effect is magical, and whether
an NPC is "named" for death-save purposes are all caller decisions.

**Always overridable.** An explicit value beats a derived one, everywhere. A
monster's printed save total replaces the calculation; `acOverride` beats every
AC formula; `attacksPerAction` beats Multiattack and Extra Attack; every
environmental subsystem has an on/off switch in the Environment tab.

**Known gaps** are listed per area in the matrix and collected in
[INTEGRATION-GATE-REPORT.md](INTEGRATION-GATE-REPORT.md). The honest summary:
46 of the SRD's spells are modelled, spells-known tables are not, a handful of
class features are recorded but inert, and some computed rules (underwater
combat, standalone map light sources) are not yet consulted by the paths that
would use them.

---

## Features

**Table & maps**
- Dual-mode interface: an authoritative **DM** view and a restricted **Player** view.
- Battle maps with grid, pan/zoom, per-map viewport memory, and breadcrumb navigation.
- Day↔night scalar with darkvision, light radius, and flickering flame sources.
- Shared freehand **drawings**, **hazard** zones, and movement **block zones**.

**Cast & combat**
- Full D&D 5e entities (PC / NPC / Monster / Familiar / Object / Label) with stat
  blocks, ability scores, conditions, money, inventory, and a tabbed character sheet.
- **Bestiary carousel** (left sidebar, next to Roster) with search and faceted filters (World / Kind / Type /
  Habitat) across a large built-in compendium - D&D, Plague's Call, and the full
  Burrows & Badgers compendium - plus homebrew inventory items.
- Standard token art: drop image files in `assets/tokens/` to auto-skin presets.
- Initiative tracker (auto-roll, hidden combatants), short/long rest, status
  conditions, token groups, and saveable encounter presets.

**Players**
- Claim an available PC - or **build a new one**: ability scores auto-rolled
  (4d6, drop lowest), level 1, and class-based starting HP.
- Self-service sheet (HP, conditions, whitelisted fields), a party sidebar, and a
  revealed-monsters panel that shows narrative HP labels, never exact numbers.
- Private per-viewer **reminder pins** (adjustable size + colour).

**Communication**
- Collapsible **chat**, synced to the table. Players speak as their character; the
  DM can speak as any token or custom name and **/whisper** a single player.
- Shared **dice roller** and a **soundboard** (DM uploads audio to play for all).

**DM controls & polish**
- Reveal/hide tokens, push players to a map, set each player's UI **theme**, and
  obfuscate monster HP.
- 8 UI themes, full-session JSON export/import, IndexedDB persistence,
  mobile-friendly layout, dark-fantasy aesthetic.

---

## Deploy to GitHub Pages

1. Install the build tools once, then build the bundle after editing `app.js`:
   ```sh
   npm install       # pulls @babel/core + @babel/preset-react (dev-only)
   npm run build     # regenerates app.compiled.js  (same as ./build.sh)
   ```
   `npm install` also marks `build.sh` executable, so `./build.sh` works too.
2. Put **all of these** in the repo root (this is the whole served app - miss one
   and you'll get a blank/background-only screen, which the app will now name for
   you on load):
   - **`index.html`**
   - **`app.compiled.js`**  (the app bundle)
   - **`game-data.js`**  (bestiary + token presets - split out so the bundle is smaller)
   - **`styles.css`**  (all the CSS - split out for caching)
   - the **`assets/`** folder
   - the **`.nojekyll`** file (already included - no rename needed)

   `app.js`, `build.sh`, `package.json`, `tests/`, `vendor/`, and the docs are
   source/dev-only and don't need to be served. React, ReactDOM, and PeerJS load
   from the unpkg CDN, so you don't upload those.
3. **Settings → Pages → Deploy from a branch → `main` / root.**

No server, no runtime bundler. `.nojekyll` stops GitHub from hiding the
`assets/` folder. Node.js 18+ is required for the build step only.

### Optional hardening: pin or self-host the CDN scripts

React/ReactDOM/PeerJS come from unpkg with pinned versions. To protect against a
CDN compromise you can either add Subresource Integrity hashes to the three
`<script>` tags in `index.html`:

```
integrity="sha384-tMH8h3BGESGckSAVGZ82T9n90ztNXxvdwvdM6UoR56cYcf+0iGXBliJ29D+wZ/x8"  <!-- react@18.2.0 -->
integrity="sha384-bm7MnzvK++ykSwVJ2tynSE5TRdN+xL418osEVF2DE/L/gfWHj91J2Sphe582B1Bh"  <!-- react-dom@18.2.0 -->
integrity="sha384-nlUQ8ZqCbvStErob+biJNzSgltf6urV3VGqhfIfzhmg9RXmpeRm76ELw0pYnKlTR"  <!-- peerjs@1.5.4 -->
```

(add each alongside the existing `crossorigin`), **or** self-host: the exact
files are in `vendor/`; upload that folder to the root and point the three
`<script src>`s at `vendor/react-18.2.0.min.js` etc. Both close the supply-chain
gap; self-hosting also removes the CDN as a dependency but is one more thing to
upload.

### TURN relay note

Peer-to-peer connections use a public STUN/TURN relay (openrelay). Players behind
symmetric NATs occasionally can't connect and will see "could not connect"; if
that happens often, run your own [peerjs-server](https://github.com/peers/peerjs-server)
or TURN relay and point the PeerJS config at it.

---

## Usage

**DM:** open the site → **Dungeon Master** tab → enter the passphrase → optional
room code → **Open the Session** → share the room code.

**Player:** same URL → **Player** tab → your name + the room code → join.

**Solo / prep:** **Local-only mode (no sync)** runs the app without peers.

During play the DM builds maps, creates and places entities, and reveals them;
players see only revealed tokens plus their own character.

---

## Configuration

- **DM passphrase** - edit the `DM_PASSWORD` constant near the top of `app.js`,
  then rebuild and redeploy. It's a client-side gate, **not real security** (the
  source is public); fine for a trusted group, not for public hosting.
- **PeerJS broker** - defaults to the free public cloud broker. To self-host,
  adjust the `new Peer(...)` / `ICE_SERVERS` config in `app.js`
  (see [peerjs-server](https://github.com/peers/peerjs-server)).
- **Behavioural knobs** - timings and limits live in the `TUNING` object at the
  top of `app.js` (see CONTRACT.md).

---

## How sync works

The DM's browser is authoritative. Players connect over WebRTC and send **action
requests** (move my PC, claim, chat, …); the DM validates each against the
sender's identity, applies it, and broadcasts a **per-player filtered** state
back - each player only receives what they're allowed to see. Room codes map to
peer IDs via the `plagues-call-` prefix. Full protocol in CONTRACT.md.

**Limitations:** if the DM closes the tab, players must rejoin; multi-MB map
images sync slowly (keep maps light or host them externally); the public broker
occasionally rate-limits.

---

## Local testing

`file://` won't work (IndexedDB/WebRTC need a real origin). Serve statically:

```sh
python -m http.server 8080   # then open http://localhost:8080
```

### Automated security tests

Real, assertion-based tests (Node's built-in runner - no browser, no Playwright)
guard the player-facing serialization boundary and map-image transport:

```sh
npm test                 # rebuilds app.compiled.js, then runs tests/ with node --test
npm run test:security    # just the security suite
```

Every check is an explicit `assert`, so a failing invariant exits non-zero (usable
in CI). See `tests/README.md` for the full list of proven invariants and the
negative-control result.

---

## Tech stack

React 18 + ReactDOM (UMD globals) · PeerJS (WebRTC) · IndexedDB (state + map
images) with `localStorage` for auth/settings · pure CSS with custom-property
theming. JSX is pre-compiled by Babel (`./build.sh`) into `app.compiled.js`; the
browser loads the compiled bundle, never raw JSX. No bundler, no backend.

---

## Security notes

- The DM passphrase is a soft, client-side gate - not authentication.
- WebRTC traffic is encrypted in transit (DTLS); the signaling broker sees only
  connection metadata.
- State lives in each device's browser (IndexedDB); use Export/Import to back up.

---

## Version history

- **v7** - synced chat with whispers, a four-phase player character creator
  (DM-approved, animated stat & HP rolls), DM-approved sheet stat/level
  requests, combat movement ranges (max + remaining, enforced on a player's
  turn), class dropdown, per-map image layers (move/rotate/lock + DM-only),
  asset token images, DM-pushed player themes, bestiary carousel + World
  filters, homebrew inventory items, soundboard, token groups, IndexedDB.
- **v6** - shared drawings, hazard zones, durable storage, annotation overhaul.
- **v5** - worldbuilding + visibility overhaul, bestiary, block zones.
- **v3-v4** - *The Plague's Call* rebrand; themes, forced onboarding, day/night,
  vision/light, reminder pins, plus a stability + polish pass.
- **v2** - Shadowquill foundation: entities, claims, initiative.

---

## License

MIT - do what you want; attribution appreciated but not required.
