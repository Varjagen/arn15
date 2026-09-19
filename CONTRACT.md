# CONTRACT.md - developer guide & data contract

A single reference for how this app is put together: its identity, the data
shapes that flow between the DM and players (the "contract"), and the
conventions that keep changes safe. Read this before adding a feature.

---

## 1. Identity & codenames

This codebase has worn three names. They coexist in the source, so knowing
the mapping prevents confusion:

| Name | Where it shows up | Meaning |
| --- | --- | --- |
| **Burrows and Badgers** | UI title, zip name | The current public brand. |
| **The Plague's Call** | `STORAGE_KEY` etc. (`plagues-call.*`), file comments | The internal/original product name. Storage keys and most code comments use this. |
| **Shadowquill** | `LEGACY_*` keys (`shadowquill.*`) | The first name; only referenced for backward-compatible session loading. |
| **Weekend_Wonders-main** | repo folder name | The on-disk folder / zip root. |

Treat "Plague's Call" as the canonical internal name (it's what the storage
namespace and migration code key on). Don't rename storage keys without a
migration path in `migrateState()`.

---

## 2. Architecture at a glance

- **Single-file React app.** All logic lives in `app.js` (~25.8k lines) as
  classic JSX. It is compiled ahead-of-time to `app.compiled.js`, which is
  what the browser actually loads.
- **`index.html`** loads `app.compiled.js`, `game-data.js` and `styles.css`.
  The CSS was split out of the `<style>` block into **`styles.css`** (~5.8k
  lines) so browsers can cache it; the bestiary and spell data live in
  **`game-data.js`** to keep the bundle smaller. There is still no CSS build
  step.
- **`build.sh`** runs Babel over `app.js` → `app.compiled.js`. It pins the
  **classic** JSX runtime (`runtime: 'classic'`) so the output uses
  `React.createElement` and never emits `import` statements - required
  because the bundle is loaded as a plain `<script>`, not a module.
- **Stack:** React 18 + ReactDOM (UMD globals), **PeerJS** (WebRTC sync, no
  backend), **IndexedDB** (large assets), `localStorage` (small prefs).
- **`assets/tokens/`** holds optional standard token images named after
  presets (see that folder's README).

### Build & deploy

```sh
# edit app.js, then:
./build.sh                 # regenerates app.compiled.js (needs @babel/core + @babel/preset-react)
```

Deploy needs **`index.html` + `app.compiled.js` + `game-data.js` +
`styles.css` + `assets/` + `.nojekyll`** - miss one and you get a blank screen.
`app.js` is source only. After every build, sanity-check:

```sh
head -1 app.compiled.js            # must be the file comment, NOT "import …"
grep -c jsx-runtime app.compiled.js  # must be 0
```

---

## 3. The two-mode model (authority)

The app runs in one of two modes, chosen on the auth screen:

- **DM mode** (`DMInterface`) - the **host** and the single source of truth.
  Holds the authoritative reducer state, owns all writes, and broadcasts a
  per-player **filtered** view to each connected peer.
- **Player mode** (`PlayerInterface`) - a **client**. Never mutates shared
  state directly. It *requests* changes by sending **player actions** to the
  DM, and renders whatever filtered state the DM broadcasts back.

> **Golden rule:** players propose, the DM disposes. Any new player-driven
> change must go through a player action that the DM validates, never a
> direct `dispatch` on the player side.

---

## 4. Data contract - the shared state

`state` is one plain object, produced by the reducer and run through
`migrateState()` on load/import for forward-compat. Top-level keys:

| Key | Shape | Notes |
| --- | --- | --- |
| `entities` | `{ id → entity }` | The cast: PCs, NPCs, Monsters, Familiars, Objects, Labels. See §5. |
| `entityOrder` | `[id, …]` | Sidebar ordering. |
| `tokens` | `{ id → { id, entityId, mapId, x, y, visible, scale? } }` | Placed instances of entities on maps. |
| `maps` | `{ id → { id, name, imageUrl, gridSize, … } }` | Battle maps. Image bytes are offloaded to IDB (sentinel `__idb__`). |
| `currentMapId` | `string` | DM's active map. |
| `claims` | `{ peerId → claim }` | Who controls what. See §6. |
| `initiative` | `{ entries: [...], active, round }` | Turn order. |
| `presets` | encounter snapshots | DM-saved token layouts. |
| `tokenPresets` | `{ id → { id, name, entity } }` | DM-defined bestiary presets. |
| `reminders` | `{ peerId → [reminder] }` | **Per-viewer** private map pins (DM key = `'dm'`). |
| `playerThemes` | `{ peerId → { theme, ts } }` | DM-pushed UI theme per player (applied once per `ts`). |
| `chat` | `[{ id, ts, senderId, senderName, text, whisperTo, whisperToName }]` | Synced log, capped at `CHAT_MAX`. Whispers filtered per viewer. |
| `forcedView` / `forcedViewPerPeer` | view push | DM forces players to a map/region (global or per-peer). |
| `blockZones` | `{ mapId → [zone] }` | Movement-blocking rectangles. |
| `drawings` | `{ mapId → [drawing] }` | Shared freehand overlay. |
| `hazards` | `{ mapId → [hazard] }` | Environmental hazard polygons. |
| `layers` | `{ mapId → [layer] }` | Image overlays per map (above the map, below tokens). Each: `{id, mapId, name, imageUrl, x, y, w, h, rotation, mode:'locked'|'move'|'rotate', dmOnly}`. Image bytes offloaded to IDB and synced via the image envelope (keyed `layer:<id>`), exactly like map images. `dmOnly` restricts *editing* to the DM; players still see the layer. |
| `pendingRequests` | `{ id → request }` | Player→DM approval queue. Each: `{id, peerId, playerName, kind:'new_character'|'stat_change'|'level_change', payload, ts, status:'pending'|'accepted'|'rejected', resolvedTs}`. Players see only their *own* requests (filtered). The DM surfaces pending ones as accept/reject popups; unresolved ones auto-decline after 2 min. A `new_character` grant gates the multi-phase character creator. |
| `lockOffTurn` | `boolean` | DM toggle (Initiative panel). When true, during active combat a player may only move the token whose initiative turn it currently is; off-turn drags are blocked client-side (`canDragToken`) and rejected server-side (`move_token`). The DM is never restricted (DM moves use `TOKEN_MOVE`). |
| `tokenGroups` | `{ mapId → [group] }` | DM encounter grouping (hidden from players). |
| `diceLog` | `[roll]` | Shared dice results. |
| `sounds` / `soundEvents` | registry + play/stop events | Soundboard. |
| `timeOfDay` | `0..1` | Day→night scalar (drives lighting). |
| `mapScale` | number | Global DM-controlled grid scale. |

### Player-visible subset

`filterStateForPlayer(state, peerId)` is the **read contract**: it returns
the version of state a given player may see. It spreads `...state` then
**overrides** sensitive slices. Crucially, `entities` is **rebuilt from only
the IDs the peer may know about** - never the whole roster - so hidden
monsters, unrevealed NPCs, and staged encounter creatures never enter the
payload (not just hidden in the UI). The allowed set is: all PCs/Familiars
(party-class), any entity behind a token that survived visibility + vision
filtering, any entity in the player-facing initiative, and everything the peer
owns. Each surviving entity is then run through `sanitizeEntityForPlayer`
(strips DM notes/abilities, zeroes death saves). It also hides non-visible and
out-of-vision tokens, filters initiative to those same visible entities,
narrows `reminders`/`forcedViewPerPeer` to that peer, strips `tokenGroups`, and
filters `chat` via `chatForViewer` (public + their own whispers only).
**Spectators** get a parallel branch with the same entity-set gating (no vision
cutoff; party + visible tokens + visible initiative). When you add a DM-only
field to state, decide whether it must be stripped here - by default
`...state` would leak it.

---

## 5. The entity model

`makeEntity(overrides)` is the single constructor. Core fields: `id`, `type`
(`PC|NPC|Monster|Familiar|Object|Label`), `name`, `color`, `imageUrl`,
`hp:{current,max}`, `ac`, `speed`, `initBonus`, `stats:{str,dex,con,int,wis,cha}`,
`conditions:[]`, `exhaustion` (0-6, see §12), `passivePerception`,
`passiveHiding`, `sickness`, plus the
full D&D sheet: `class`, `level`, `race`, `background`, `alignment`,
`proficiencyBonus`, `hitDice`, `xp`, `money:{pp,gp,ep,sp,cp}`, `attacks`,
`spells`, `features`, `proficiencies`, `inventory`, `traits`, `ideals`,
`bonds`, `flaws`, `backstory`, `notes` (DM-only), `playerDescription`.

When adding an entity field that players may edit, add it to
`PLAYER_FIELD_WHITELIST` (or `PLAYER_STATS_WHITELIST` for ability scores).

---

## 6. The claims model

A **claim** records what a connected peer controls:

```js
{ pc: entityId|null, familiars: [entityId, …], playerName: string, spectator: bool }
```

`state.claims[peerId]` is keyed by the player's PeerJS id. The DM's own
pseudo-id for per-viewer data (reminders, chat sender) is the literal
`'dm'` (`DM_KEY`). `displayNameForPeer(state, peerId)` resolves a peer's
chat/label name: claimed PC name → playerName → `'Spectator'`/`'Player'`.

---

## 7. Sync protocol (the write contract)

```
Player UI  ──player action──▶  sync.sendPlayerAction({type, payload, peerId})
                                         │  (WebRTC)
                                         ▼
DM: handlePlayerAction(action, peerId)   ── validates & authorizes ──▶ dispatch(reducerAction)
                                         │
                          state changes ─┤
                                         ▼
        broadcast filterStateForPlayer(state, peerId) to every peer  ──▶  Player renders
```

- **Player actions** (lowercase types) are *requests*. The DM resolves
  identity from the connection's `peerId` - never trusts a name/id in the
  payload (prevents spoofing). Catalog: `claim_pc`, `claim_familiar`,
  `claim_spectator`, `create_and_claim_pc`, `unclaim_pc`, `unclaim_familiar`,
  `patch_own_entity`, `move_token`, `dice_roll`, `chat_send`,
  `reminder_upsert`, `reminder_delete`, `drawing_upsert`, `drawing_delete`,
  `drawing_clear_owner`, `sound_play`, `sound_stop`, `layer_transform`,
  `submit_request`, `creation_roll`, `roll_levelup_hp`.
- **Reducer actions** (UPPER_CASE types) are *authoritative mutations*, only
  ever dispatched on the DM side (or locally in solo mode). They are pure;
  see the reducer for the full ~185-case catalog (`ENTITY_UPSERT`,
  `TOKEN_MOVE`, `CLAIM_PC`, `CHAT_ADD`, `SET_PLAYER_THEME`, …).
- **Idempotency:** player actions may be re-sent (the onboarding gate retries
  until a claim confirms). Handlers must be safe to run twice - e.g.
  `create_and_claim_pc` ignores the request if the peer already holds a PC.
- **Character creation & approvals (v7.8):** a player who wants a new PC sends
  `submit_request {kind:'new_character'}`; the DM accepts via the popup, which
  flips the request to `accepted` and opens the 4-phase creator
  (`NewCharacterBuilder`). The builder logs each rolled value to a DM-only chat
  line (`creation_roll`) and persists to localStorage so a reload can't re-roll.
  Finishing sends `create_and_claim_pc`, which *requires* the accepted grant and
  consumes it. On the sheet, players don't edit `level` or ability scores
  directly (both removed from the player write-whitelist) - they send
  `submit_request {kind:'stat_change'|'level_change'}` (level is ±1 only,
  validated server-side). When the DM accepts, the change is applied via
  `ENTITY_PATCH`; a level-*up* sets `awaitingHpRoll`, after which the player
  rolls the new die (`roll_levelup_hp`). Unresolved requests auto-decline after
  2 minutes; the player is toasted on every resolution.
- **`pushSoon()`** sends a fresh filtered snapshot to the acting player
  ~`TUNING.pushSoonMs` after a state-changing action, so claims/edits feel
  instant instead of waiting for the next idle broadcast.

---

## 8. Component map

`app.js` is organized in banner-delimited sections. The big ones:

- **CONSTANTS / TUNING** - storage keys, `DM_PASSWORD`, themes, `TUNING`,
  condition tables (`CONDITION_GROUPS`, `CONDITION_COLORS`, and the mechanical
  `CONDITION_RULES` - see §12), the bestiary presets (BnB + builtins),
  `PRESET_ITEMS`, `DND_CLASSES`, `CLASS_HIT_DIE`.
- **IDB STORAGE / UTILITIES** - persistence and helpers (`uid`, `clamp`, …).
- **DEFAULT STATE / MIGRATION / REDUCER / VISIBILITY FILTER** - the data core.
- **Shared UI** - `TokenComponent`, `MapCanvas`, `EntityForm`, `CharacterSheet`,
  `ClassSelect`, `InventoryItemPicker`, `LiveInput`, `useDraggable`, `ChatPanel`.
- **DM panels** - `EntitySidebar`, `InitiativeTracker`, `MapManager`,
  `BestiaryMenu`, `PresetsPanel`, `DMWorldPanel`, `HazardsPanel`, `ToolsMenu`,
  `TokenGroupsPanel`, `SoundboardPanel`, `DMClaimsPanel`, `TokenContextMenu`.
- **Player surfaces** - `PlayerOnboardingGate`, `NewCharacterBuilder`,
  `PartySidebar`, `RevealedMonstersSidebar`, `EditMySheetModal`.
- **`DMInterface` / `PlayerInterface` / `Root`** - the two mode shells.
- **PLAYER ACTION VALIDATION HELPERS** - the `handlePlayerAction` switch and
  whitelists, at the bottom (module-level, closure-free where possible).

---

## 9. Tuning & configuration

All behavioural "knobs" live in the **`TUNING`** object at the top of
`app.js`. The previously-loose constants now derive from it, so this is the
single place to adjust the table's feel:

| `TUNING` key | Default | Effect |
| --- | --- | --- |
| `pushSoonMs` | 60 | Delay before a targeted post-action push to one player. |
| `claimResendMs` | 2500 | Onboarding: re-send a pending claim until confirmed. |
| `claimGiveUpMs` | 12000 | Onboarding: stop the spinner if a claim never confirms. |
| `connectTimeoutMs` | 20000 | Peer connection attempt timeout (`CONNECT_TIMEOUT_MS`). |
| `chatMaxMessages` | 250 | Synced chat history cap (`CHAT_MAX`). |
| `chatMaxChars` | 600 | Per-message character cap. |
| `measureLingerMs` | 10000 | Lifetime of a lingering on-map measurement. |
| `reminderSizeMin/Max` | 0.6 / 2.4 | Reminder pin scale bounds. |
| `exhaustionOnMigrate` | 1 | Level given to a creature carrying the pre-v8.91 binary `Exhausted` label. |

Other notable config: `DM_PASSWORD` (auth passphrase), `STORAGE_KEY` family
(§1), `THEMES` (the 8 UI themes), `CONDITION_GROUPS`/`CONDITION_COLORS`,
`CLASS_HIT_DIE` (level-1 HP rules).

---

## 10. Storage

- **IndexedDB** (`IDB_STORES`): `session` (lean state JSON), `mapImages`
  (`mapId → data URL`), `sounds`. Large base64 is kept out of the state blob;
  the JSON carries an `__idb__` sentinel that is re-inflated on load.
- **Image sync (DM → peers):** map/layer image bytes travel in a separate
  `map_image` envelope, not the lean `state_update`. The DM remembers what it
  has sent each peer as `imageKey → content fingerprint` (`imageFingerprint`,
  a cyrb53 hash + length). Keying by id alone would treat a *replaced* image
  (same id, new bytes) as already-delivered and never resend it, stranding
  players on stale art; keying by fingerprint resends whenever the bytes
  change. On receipt the player overwrites both its rendered state
  (`MAP_IMAGE_RECEIVED`/`LAYER_IMAGE_RECEIVED`) and its IDB cache. When a peer
  disconnects or is kicked, the DM drops that peer's fingerprint + sound caches
  (keyed off `peerList`), so a fresh reconnect re-receives the current map and
  sound library even if the client cleared its own IDB while away.
- **localStorage**: `AUTH_KEY`, `SETTINGS_KEY`, `PLAYER_ID_KEY` (stable
  per-device identity) - all small. Legacy `shadowquill.*` keys are read on
  migration only.

---

## 11. Conventions & gotchas

- **Build runtime:** keep `build.sh` on the **classic** JSX runtime. A fresh
  Babel 8 defaults to *automatic*, which injects `import react/jsx-runtime`
  and breaks the script load.
- **`grep -c` returns exit code 1 when the count is 0** - don't chain
  `grep -c … && cp …`; the `&&` short-circuits and leaves a stale bundle.
  Use `cp -f` unconditionally.
- **Adding state that's DM-only:** remember `filterStateForPlayer` spreads
  `...state`; override/strip the new field in both the spectator and main
  return, or it leaks to players.
- **Player writes:** route through a `handlePlayerAction` case + a whitelist;
  resolve identity from `peerId`, not the payload.
- **Controlled inputs:** use `LiveInput`/`LiveTextarea`/`LiveNumberInput`,
  which keep a local draft while focused and re-sync to the external value on
  blur - important so synced updates don't fight the user's typing.
- **Reducers are pure;** side effects (broadcast, IDB, toasts) live in the
  interfaces, not the reducer.
- **Conditions are DATA, never code.** Every mechanical consequence of a
  condition lives in `CONDITION_RULES` (§12). Never test for a condition by
  name outside that table - ask the services instead
  (`conditionProfile`, `conditionRollContext`, `conditionSpeedProfile`, ...).
  A `conditions.includes('Stunned')` anywhere else is a bug: it will drift the
  moment the rule changes, and it will miss conditions that *imply* Stunned's
  behaviour.

---

## 11fm. The folder was never pushed (v17.6)

The deployed repository has **thirteen entries and no directories**: every root
file, and no `vendor/`, `tests/` or `tools/` at all. Dragging files onto
GitHub's web uploader takes files and skips folders.

`.nojekyll` was present and correct. It could not help, because the folder it
protects was not there.

### A diagnostic is ordered, and the order is part of being right

§ 11fl led with Jekyll. That is a real failure and a rarer one, and leading with
it sent the reader to add a file that could not fix their problem while the
actual cause went unmentioned until the second clause.

The message now names the missing folder first, says plainly that uploading by
drag-and-drop skips folders, and keeps Jekyll as the secondary case. A test
asserts the ORDER, comparing the user-visible strings - the code comment above
says "Jekyll" too, and matching that would have passed while the copy said the
wrong thing first.

### What to upload is now written down

`DEPLOY.md` lists every runtime file with its folder structure, flags
`.nojekyll` as easy to miss because file browsers hide dotfiles, and gives a
check that works from the deployed site rather than the author's machine:

    https://<your-site>/vendor/react-18.2.0.min.js

A 404 there settles it, whatever the local copy looks like. A test asserts
DEPLOY.md mentions every local URL `index.html` actually requests, so the
manifest cannot drift from the page it describes.

### The wider point

§ 11fh removed a runtime dependency on a third party and replaced it with a
dependency on the deploy being complete. That is the better trade, but it is a
trade: the failure moved from "unpkg is blocked" to "the folder did not make
it", and the second is invisible from a working local checkout.

## 11fl. Two deploys that did not work (v17.5)

### GitHub Pages dropped vendor/

Vendoring the libraries (§ 11fh) moved the failure rather than removing it. On
Pages the app reported all three as missing from the upload. They were in the
repository - **Pages runs Jekyll by default, and Jekyll does not publish
`vendor/`**, so every request 404d and the app would not boot.

A zero-byte `nojekyll.txt` was already in the repository - someone had reached
for this fix and the filename is wrong, so it did nothing while looking like the
problem was handled. It is deleted; a decoy is worse than an absence.

`.nojekyll` next to `index.html` turns Jekyll off. It is committed with an
explanation inside it, because an empty file gets deleted as clutter by the
next person tidying the root.

`tools/check-asset-versions.js` now refuses a build that references `vendor/`
without a `.nojekyll`. **A dependency on a local file is only as good as the
host's willingness to serve it**, and that is a property of the deploy, not of
the code - so it needs a gate, since no amount of testing app.js would find it.

The diagnostic said "These files are missing from the upload", which was FALSE
here and sent the reader to check something that was already correct. It now
says the browser could not load them, gives both causes, and names
`.nojekyll`.

### npm install failed on Windows

    "postinstall": "chmod +x build.sh || true"

Neither `chmod` nor `true` exists in `cmd.exe`, and `|| true` cannot rescue a
command that the shell cannot find - so `npm install` exited 1 before installing
anything. It is a node one-liner now, with the failure caught, so a filesystem
that has no executable bit is a no-op rather than a failed install.

`pretest` still runs `bash build.sh`, deliberately: a contributor uses WSL or
Git Bash for that. But INSTALLING must not require a POSIX shell, and a test
asserts that distinction rather than banning the shell everywhere.

## 11fk. The modals were divs (v17.4)

Measured before: 14 `modal-overlay` mounts, **0** with `role="dialog"`, 2
`.focus()` calls in 45,000 lines, `useEscClose` on 10 of the 14. Focus stayed on
the trigger BEHIND the overlay, Tab walked the page underneath, nothing
announced that a dialog had appeared, closing left focus nowhere, and four
modals could not be dismissed with Escape.

One `<Modal>` supplies the role, the accessible name, focus move and restore,
the Tab trap and `useEscClose`. Fourteen conversions rather than fourteen
hand-edits, so the next modal gets this by construction.

### It clones rather than wraps

The dialog props go onto the existing panel with `cloneElement`. A wrapper div
would have inserted a level between `.modal-overlay` and `.modal` and changed
appearance, which this task was not allowed to do.

### `onClose` is optional, deliberately

The table setup overlay and the attack cinematic are non-dismissable by design.
They get the role and the name and no backdrop handler - forcing a close
affordance onto them would have changed behaviour.

### What could not be tested, and was not faked

`react-test-renderer` returns null for host refs without `createNodeMock`, so
"focus landed on the first control" is not observable in this harness.
Asserting it through a fake node would have tested the fake. The tests assert
what IS observable - that focus is not left nowhere after close, and that the
restore target is captured on open rather than on close - and say so.

The harness gained `document.activeElement` tracking: `focus()` was a no-op and
`activeElement` did not exist, so no test could observe focus moving at all.
That is part of why fourteen modals shipped without managing it.

### Icon buttons

336 `title=` attributes against 88 `aria-label` in the file. A tooltip is
invisible on touch and inconsistently announced, so the close buttons inside
these modals gained `aria-label` ALONGSIDE `title` - 90 to 117. The other ~500
buttons are out of scope here.

## 11fj. Three guards at the seams (v17.3)

The suite was 5,743 tests across 177 files, green, while every recent defect
shipped. None was a logic bug. Every one lived at a **seam**: a component and
its mount, a reducer action and its caller, a feature and its door. 74 of 177
files assert against app.js as source text, which cannot see across a seam and
passes whether or not the code runs.

### 1. Mount contracts

Each multi-mount component is rendered with each mount's ACTUAL prop set, then
every button is clicked. This is what catches "written from memory and came up
short" - the defect that shipped three drawer panels, one of which crashed the
app on use.

The prop sets are hand-listed, as the brief allowed. A parser that silently
stops matching when the JSX is reformatted is worse than a list someone must
update, because it keeps passing.

### 2. Reducer reachability

Extended `tools/check-orphans.js` rather than writing a second analyser - it
already does this shape for functions, components and CSS classes, and could
not see a `case` nobody dispatches.

**It reports 63 undispatched reducer actions** (67 raw, less four commented
opt-outs). `UI_HOVER` and `UI_UPDATE_MOVEMENT` appear in app.js exactly once,
as their case labels. This task was told not to fix app.js, so the count is a
CEILING the suite will not let rise. Lowering it is the work; raising it is a
regression.

Each opt-out carries a reason, and a test asserts that: a bare allowlist is
where dead code hides.

### 3. Feature reachability

Renders both shells with a realistic table and asks, PER ROLE, whether each
advertised feature has a door - opening the popovers first, because a menu that
is never clicked hides its contents from the scan exactly as it would from a
user.

Asserting by role is the point. Three defects came from verifying in one role
and shipping for both.

### What writing them turned up

`initiative: { order: [...] }` is an invented shape - the field is `entries`,
and the DM shell throws on `order[turn]` without it. Worth knowing on its own:
the tree has no tolerance for a malformed initiative block.

And the first version of guard 3 reported settings and entity-create missing
from shells that have both. An icon button has no text - its accessible name is
in `title` or `aria-label` - and the New button uses a FULLWIDTH plus. A
reachability check that reads only text would have failed honest code and, worse,
taught its author to loosen it.

## 11fi. The familiar case, and an empty stack (v17.2)

Both reported defects were fixed in § 11ff and are verified here rather than
assumed: both senders use `entityId`, and all three kinds of consumable render
an enabled button. The brief's follow-up checks found one thing that was not.

### Every other sender was already correct

`targetId` appears in no `patch_own_entity` payload. All sixteen senders use
`entityId`, and a test now asserts that, because the failure mode was invisible:
the handler falls back to `claims[peerId].pc`, so a wrong key **works by
accident** for a player's own PC and only misroutes for a familiar. A silent
fallback that masks a wiring error is worse than none.

### One op, one gate

`player_use_item` covers both kinds, as the brief preferred. `canActivateItem`
is the single gate: the sidebar button asks it for its disabled state and title,
and `validateLiveAction` asks it before dispatching. A test asserts the two
agree on the same entity and item - the `fieldIsEditable` / `canPlayerWriteField`
symmetry, which only holds if there is literally one function.

### The gate let you drink a potion you did not have

Writing test 4 turned up a real hole: `qty: 0` passed everything. The charge and
uses checks do not cover a plain consumable, which has neither - so a spent
stack still offered an ENABLED button and the validator agreed with it.

That is exactly what asserting "the control and the server agree" is for. The
test was written to check a symmetry and found a case where both sides were
wrong together, which no amount of comparing them to each other would reveal -
it took a case where the right answer was known independently.

## 11fh. Nothing is fetched from a CDN (v17.1)

`index.html` loaded React, ReactDOM and PeerJS from `unpkg.com` with no
`integrity` attribute, while `vendor/` held byte-identical copies at the same
pinned versions that **nothing referenced**. The protection had been prepared
and never wired.

Two consequences. unpkg being down, slow or blocked took the entire app down -
the boot diagnostic's "check that unpkg isn't blocked on this network" message
existed because that happens. And without SRI, a compromised or MITM'd CDN
executed arbitrary JavaScript in a page holding campaign data and an open
WebRTC channel.

### Verified before trusting

All three were checked byte-for-byte against the published builds rather than
assumed:

| | |
|---|---|
| `react-18.2.0.min.js` | matches `node_modules/react/umd/react.production.min.js` |
| `react-dom-18.2.0.min.js` | matches `node_modules/react-dom/umd/react-dom.production.min.js` |
| `peerjs-1.5.4.min.js` | matches `dist/peerjs.min.js` from `npm pack peerjs@1.5.4` |

Shipping an unverified bundle would have traded a CDN you can audit for a blob
you cannot.

### The gate is the point

`tools/check-asset-versions.js` now refuses any `<script>` or `<link>` pointing
at unpkg, jsdelivr, cdnjs, esm.sh or skypack; requires the three vendor files to
be referenced, cache-busted to `APP_VERSION`, present on disk and non-empty. The
files sat unused for a reason nobody had written down, and without a gate the
next hand edit puts unpkg back.

### The font link stays, deliberately

A missing stylesheet degrades to the fallback stack in the font declaration; a
missing script does not boot. The cost of a blocked `fonts.googleapis.com` is
different typography, not a white page, so it is not worth vendoring the file
and the licence question that comes with it. The gate allows `<link>` to a font
host and refuses everything else.

### The boot diagnostic said the wrong thing

"Could not load React from the CDN (unpkg.com). Check your internet connection"
is now false in both halves. If React is undefined it means a `vendor/` file is
missing from the upload, so it says that, names the files, and states plainly
that this is not a network problem.

## 11fg. An error boundary (v17.0)

There was **no error handling of this kind anywhere**: `componentDidCatch` and
`getDerivedStateFromError` appeared zero times in 45,000 lines. A throw during
render took the whole tree down and left a white page holding unsaved campaign
state. Every crash in recent history - `onRoll is not a function`,
`setPlacingHazard is not a function` - did exactly that, hours into a session.

The boot diagnostic in `index.html` looks like a net and is not one. It returns
early when the root already has children, so it covers a failure to MOUNT and
nothing that happens afterwards.

### Three boundaries, not one

One inside `ToastProvider` around `Root`, so a toast still works and a crash in
the shell is caught; one each around `DMInterface` and `PlayerInterface`, so a
crash in one panel does not have to take the topbar with it. A test renders a
shell with chrome outside the boundary and asserts the chrome survives.

The fallback says what a user needs: that it is a bug and not their fault, that
the session is saved, a Reload button and a "copy error details" button carrying
the message, the component stack and the version.

**Nothing auto-reloads and nothing is swallowed.** An auto-retry would loop on a
deterministic crash, and the user may want to copy the error first. The error
goes to `console.error` - one of eight such calls in the file, and a legitimate
one.

### Two harness gaps this exposed

`class X extends React.Component` throws at LOAD time when the stub has no
`Component`, so every test using `tests/load-app.js` died before running - 135
failures from one line. The stub has a `Component` now.

And `tests/load-app-render.js` could only see `function` declarations: `const`
and `class` are block-scoped in a script and never become properties of the vm
context, so `APP_VERSION` and `ErrorBoundary` were invisible while every
function was reachable. `get` falls back to evaluating the identifier inside the
context, which unblocks every `const` in the file for future tests.

### Not done: the host_error broadcast

Requirement 4 wants every open connection told when the DM's tree catches. The
sync object exposes `destroy`, `hostSession`, `joinSession`, `sendPlayerAction`,
`sendSoundData` and `sendSoundDataTo` - there is no broadcast, and `conn.send`
is private to the hook. Adding one is a change to the sync layer's public
surface, which the brief said to stop and report rather than make.

## 11ff. Plain consumables, and a payload key (v16.9)

### The Use button was disabled for everything a table actually makes

`canActivateItem` opened with "not an activatable magic item" for any item
without a `MAGIC_ITEMS` definition:

    Potion of Healing (made in-app)   disabled
    Hard Cheese                       disabled
    Potion of Giant Strength          enabled

Drinking a potion you built is not a lesser act than drinking one that ships
with the app. A consumable that HAS an effect is now activatable, and the whole
path follows: `spendItemActivation` returned early without a definition too, so
even once the gate passed the potion healed you and then stayed in your pack for
ever.

The refusal for a consumable with no effect is now "Water does nothing when
used" rather than the magic-item line, because that was never the reason.

**I did not branch the sidebar onto `consume()`**, which the report offered as
the fix. Two implementations of "use an item" is what § 11fd spent a version
removing. Fixing the gate makes one path correct for every caller instead.

### `targetId` where the handler reads `entityId`

Both call sites sent `targetId`; `patch_own_entity` destructures
`{ entityId, op }` and falls back to `curr.claims[peerId].pc`. It worked by
accident for a player's own PC and would have looked a familiar's item up
against the PC's inventory and refused "no such item".

Every other caller of that action sends `entityId`; these two were the odd ones
out. A silent fallback made a wrong key behave correctly in the common case,
which is the worst way for a mismatch to present.

## 11fe. Using a consumable from the sidebar (v16.8)

Steps 0, 1 and 4 of the brief landed in § 11fc and § 11fd. This is steps 2 and
3, plus two bugs the required tests found.

### The player route now matches the house pattern

§ 11fd sent `item_activate` as a bespoke top-level case with its own inlined
ownership check. It is `player_use_item` in the `liveOps` map now, beside
`player_hp` and the rest: validated by `validateLiveAction`, refused through the
existing system-chat path, ownership checked once by `ownedByPeer` rather than
re-implemented per action.

The validator returns `canActivateItem`'s reason strings, which is what the
button shows in its title - so a refusal reads identically wherever you meet it.

**It is not gated on `perms.inventory`**, as the brief directed and I agree:
that permission governs changing what you carry, not spending it.

### The sidebar button

One `btn xs` "Use" on consumable rows only, disabled with the reason in its
title when `canActivateItem` refuses. `PartyInventoryView` gets `onUseItem` and
nothing else - no `onField`, so the § 11cw reason for withholding a writer from
the sidebar still holds, and the editing footer is unchanged.

### Two bugs the tests found

**A consumable spent the whole stack.** `spendItemActivation` returned
`item: null` whenever `def.consumable`, ignoring `qty` - so drinking one of two
potions threw both away. It decrements now, and the stack disappears only on the
last one.

**The 0 HP test in the brief asks for something the rules forbid.** An
Unconscious creature cannot take actions, so `canActivateItem` refuses its own
potion with "cannot act right now". That is correct. The test asserts what was
actually meant - that the HEALING path wakes and stabilises - and separately
that the refusal does not spend the potion.

### 68 reducer cases have no dispatcher

Widening the § 11en check from `ENTITY_` to every prefix turns up 68 cases whose
name appears in app.js exactly once, as the case label: `STAND_UP`, `LEVEL_UP`,
`CHAT_CLEAR` and 65 more.

That is far outside this task, which said to stop rather than widen. It is
measured and recorded as a CEILING the suite will not let rise, and left for its
own change. Asserting zero would freeze a number I have not investigated;
asserting nothing would lose the finding.

## 11fd. One Use button, through the reducer that already worked (v16.7)

Four faults with one shared fix.

**Drinking a potion was classified as a build edit.** `inventory` is in
`BUILD_TABS`, so opening it flips `sheetMode` to edit and `consume()`'s patch
was STAGED into a draft - a player had to press Submit to lose their potion. And
`items` is a build field gated on `perms.inventory`, so on a table set to
`'request'` a healing potion mid-combat became a GM approval request.

**`ITEM_ACTIVATE` was dead code**: 55 lines that did the job properly - the
`canActivateItem` gate, the action cost through prepare/commit, charge spending,
consumable removal, temp effects, a chat log - and nothing dispatched it.

**The magic-item Use button wrote `__activateItemId`**, a field nothing reads.
For a DM it was stored on the entity as a stray key; for a player
`filterPlayerPatch` refused it as unrecognised. The item was never used either
way.

**Two buttons labelled "Use" sat adjacent** with different behaviour, because
`itemIsConsumable` and `magicItemDef(...).activation` both hold for a Potion of
Giant Strength.

### The fix was to use what was already there

`ITEM_ACTIVATE` gained the one thing it lacked - healing, applied through
`applyHpTransaction` so quaffing at 0 HP wakes and stabilises the drinker - and
the Use button dispatches it. That is not a field patch, so it is neither staged
into a draft nor gated on a build permission: **using an item is play, not
character editing**, and it now travels on a play channel.

The DM dispatches straight to the reducer; a player sends `item_activate`
through the request pipeline, and the host checks the peer actually holds the
creature before applying it.

`consume()` remains for items that declare no activation.

### Dead code is not free

Fifty-five correct lines sat unreachable while three worse paths grew around
them to do the same job badly. The orphan audit finds functions nobody calls and
components nobody mounts; it does not find a REDUCER CASE nobody dispatches -
§ 11en added that check for `ENTITY_` actions only, and this was an `ITEM_` one.
The check now has no excuse not to cover every prefix.

## 11fc. Healing potions did not heal (v16.6)

`consume()` built `{items, tempEffects, hp, conditions, deathSaves}` and sent it
through `onField`. For a DM that becomes `ENTITY_PATCH`, whose § 11at guard
strips `hp`, `tempHp` and `deathSaves` unless `viaPipeline` is set:

    potion qty: 1 (was 2)
    hp after  : {"current":4,"max":20}   (consume() computed 13/20)
    chat      : HP guard: Blocked a direct edit of hp, deathSaves

**The potion was spent and the hit points were not.** For a player,
`filterPlayerPatch` refused the same three keys for the same reason.

The guard was not the bug. `consume()` was the caller that should have been
using the pipeline, and the guard said so in the chat log every single time.

### Both values now travel on the channel built for them

Healing goes through `onHpAdjust`, which the sheet already uses for every other
HP change and which each shell routes correctly for its role - the DM to
`ENTITY_HP_ADJUST`, a player to the request pipeline. Waking and stabilising at
0 HP is that pipeline's job, so `consume` no longer computes it. The applied
condition goes through `onToggleCondition` for the same reason.

The heal is dispatched AFTER the item is spent, so a refused heal cannot also
refund the potion.

### The test was reading the patch, not the outcome

§ 11eb's bread test asserted `got.hp.current > 4` - on the patch object
`consume` produced, not on the entity after the reducer ran. So it passed for
three versions while nothing healed. **A test that inspects the message instead
of the result cannot see a receiver that throws the message away.**

It now asserts the heal arrives on `onHpAdjust`, and a second test drives the
real reducer to prove `ENTITY_HP_ADJUST` restores the HP while a raw
`ENTITY_PATCH` is still refused - because the guard working is as important as
the potion working.

## 11fb. A default should be the right answer, not no answer (v16.5)

`onRoll = () => {}` (§ 11ew) stopped the crash and replaced it with something
worse to diagnose: the dice animate, the result vanishes, and nothing anywhere
says so. A white screen is at least unmissable.

It defaults to the real behaviour now:

    onRoll = (entry) => dispatch({ type: 'DICE_ROLL', entry })

`dispatch` is destructured BEFORE `onRoll`, because a parameter default can only
reference a binding already made.

### The distinction worth keeping

A no-op default is right when doing nothing is VISIBLY nothing:
`onToggleBlockPlace = () => {}` leaves a toggle that does not toggle, and the
reader sees that immediately. It is wrong for anything carrying a payload,
because the payload disappears without a trace.

Audited the other seven no-op defaults against that line:

| | |
|---|---|
| the four block toggles, and the two hazard setters | correct - a toggle that does nothing is visible |
| `spendSlot` | defaults to `true`, the safe direction; not a callback |
| `toast` | WRONG by the same argument - a dropped message is invisible to the user and to the developer. It warns to the console now. |

### Why this matters beyond one prop

A default is a decision about what happens when a caller forgets. "Nothing" is
almost never the best available answer: usually the component knows what the
right answer is, because every real caller passes the same thing. Defaulting to
that makes a forgotten prop a non-event instead of a silent data loss - and the
mount still passes the real one, so nothing depends on the default being hit.

## 11fa. Comment and documentation pass (v16.4)

A survey first, because the assumption going in was that the code was
over-commented and it mostly is not:

| | |
|---|---|
| comment ratio in `app.js` | 19% (8,180 of 43,646 lines) |
| identifiers named in comments but absent from code | 5, and 4 of those deliberately record a REMOVED thing |
| comment lines duplicated verbatim | 4 real pairs, all in parallel DM/player code |
| CONTRACT entries | 169, median 1,822 bytes; the v14-16 entries average 1,694 |

So no sweeping cut was warranted. Two specific problems were.

### Bug narration duplicated between the code and this file

Eight comment blocks retold a fix at length - the panel manager's z-index
merge, the drag-delta storage, the Entity tab snapshot - when this file already
holds the story. Each is now the RULE plus a reference: "a caller that positions
itself deliberately wins; the manager owns only the default. (CONTRACT 11el)"

42 lines, and more importantly the reader of the code gets the invariant rather
than an incident report. The history belongs here; the code should say what is
true now and where to read why.

The v14.7 noun glossary was KEPT in full. It is a definition a gate enforces,
not a story, and a reader needs it in place.

### Entries that a later one quietly overturned

An append-only log has a failure mode: a reader lands on § 11er, reads that the
mobile input trap is fixed, and never learns § 11ev found the fix was one level
too deep. Five entries now carry a forward pointer at the top, where a reader
lands, rather than leaving the correction three hundred entries away.

## 11ez. Three close buttons in one drawer (v16.3)

Each panel keeps its own `.float-panel-header` and its own `×`, and every
drawer `onClose` is `setMobileSection('map')`. Stacked, that is one close per
panel plus the drawer's own - four controls doing one thing.

The panels take `hideClose` and the drawer mounts pass it. The **headers stay**:
in a stacked layout they are what labels each section, and suppressing them
would leave four unlabelled panels in a column.

### Why this was not a CSS rule

`.float-panel.in-drawer .close-x { display: none }` is one line and would have
been wrong. `MapManager`'s map-editing branch has a `close-x` too, and it calls
`setEditing(null)` - it is the way OUT of the editor, not a panel close. Hiding
every `close-x` in the drawer would have trapped a DM inside the map editor with
no way back.

Two buttons that look identical and sit in the same slot can mean different
things. The distinguishing fact is the handler, which CSS cannot see, so the
suppression is explicit per panel and a test asserts the editing cancel survives
`hideClose`.

### The fixed-window trap, again

A new assertion sliced 400 characters after `mobile-drawer-head` and missed the
button, because a v15.3 comment sits between them. That is the fifth time this
session. Every source-scanning assertion should be bounded by the NEXT
STRUCTURAL LANDMARK - the closing element, the next prop, the next function -
never by a character count.

## 11ey. Placement from a phone (v16.2)

The World panel's block controls were inert in the drawer for the same reason
the Hazards buttons threw: § 11eu wrote the mount from memory. § 11ew wired all
eight props, so this report predates the fix - verified by driving each toggle.

### The second half of the report is the part that matters

Hazard placement and block drawing work by tapping the **map**, which on a phone
is behind the drawer. Wiring the toggles is necessary and not sufficient: a mode
that engages while a full-screen drawer covers the map is a dead control that
merely looks alive.

Three links have to hold, and each was fixed in a different version:

| | |
|---|---|
| the toggle flips the mode | § 11ew wired the props |
| it closes the drawer | § 11ew, so the map is visible |
| the tap reaches the map | § 11ev, `.mobile-shell` passes input through |

A test drives all four block modes end to end and asserts both that the mode
engages AND that the drawer leaves for the map. Before § 11ev the third link was
broken, so this same chain would have ended in a tap that died on a transparent
box - the feature would have read as working right up to the last step.

### Whether they belong in a drawer at all

They work, so they stay. A phone DM who cannot place a hazard is worse off than
one who taps a control and is handed the map. But the flow is
tap-toggle-then-tap-map with a disappearing panel in between, and if that reads
badly in practice the honest alternative is a persistent mode indicator on the
map rather than a panel in a drawer.

## 11ex. Pressing the buttons, not counting the props (v16.1)

Six of the eight buttons in the drawer's Hazards panel threw
`setPlacingHazard is not a function` - from an onClick, so the tree came down
rather than the button doing nothing.

§ 11ew had already fixed that MOUNT, and the report predates it. What it exposed
was the weakness of the test § 11ew added: it compares the two mounts' prop
NAMES and never presses anything. A prop passed as `undefined`, a component
calling something it was never given, a shape mismatch - all invisible to it.

### Defaults, then a sweep that actually clicks

`HazardsPanel` and `DMWorldPanel` default every callback they call, as
`DiceTray.onRoll` now does. **A component that calls a prop unconditionally has
to survive not being handed it**, because the failure mode is not a dead button,
it is a dead application.

The new sweep mounts each drawer panel with the MINIMUM props and clicks every
button, one fresh mount per button - one of them closes the panel, and clicking
on in the same tree fails with "Unable to find node on an unmounted component",
which is the harness rather than a defect.

### The sweep found something on its first run

`MapManager`'s edit button died on **`structuredClone is not defined`** - absent
from the test sandbox, though browsers have had it since 2022. So it was a
harness gap, not an app bug; but it meant any test reaching `deepClone` died
there instead of testing anything. The sandbox has it now.

A static check on prop names would never have found that. Counting the props
tells you the wiring looks right; pressing the button tells you it is.

## 11ew. The drawer mounts were written from memory (v16.0)

> **Later:** § 11ex found that comparing prop NAMES is not enough - the
> check has to press the buttons.

§ 11eu filled the Tools drawer with four panels. The `InPanelDrawerContext`
mechanism works; **three of the four mounts were short of props** their desktop
counterparts pass.

`DiceTray`'s `onRoll` had no default, and `finishRoll` calls it directly:

    const finishRoll = () => { setRolling(r => { if (r) onRoll(r.entry); return null; }); };

That is inside a state updater, so a DM rolling dice from their phone did not
get a dead button - they took the whole tree down. `DMWorldPanel` and
`HazardsPanel` were missing their placement modes, which is most of what those
panels do.

### Copied, not recalled

All three now pass exactly what the desktop mounts pass. `onRoll` also gained a
no-op default, because a prop a component calls unconditionally should not be
able to crash it - but the drawer passes a real one regardless. A default stops
the crash; it does not make the dice reach the table.

A placement toggle now also CLOSES the drawer. You cannot place a block on a map
the drawer is covering, so engaging the mode and leaving the drawer up would be
a second dead control.

### The sweep is the real fix

A test compares each panel's two mounts and fails when the drawer one is missing
a prop the desktop one passes. Writing a second mount from memory is the whole
defect, and it is exactly the kind of thing a machine should check.

This is the third defect in the § 11eu drawer and the same root as § 11eq's
`peerId={null}`: **wiring a component into a second place is not done when it
renders.** Rendering proves the JSX parses. It says nothing about whether the
props are the ones the component needs.

## 11ev. The mobile input block, actually fixed (v15.9)

§ 11er put `pointer-events: none` on `.mobile-map` - **one level too deep**. That
element is conditionally rendered and has no children to render, so the rule
applied to nothing at all, while the element that actually covers the viewport
went on swallowing every tap on the map for both roles:

    .mobile-shell { display: block; position: fixed; inset: 0; }

Full-viewport, fixed, later in the DOM than `.main`, no `pointer-events`
declaration. A transparent box is still a hit target.

The shell passes input through now; the nav, the scrim and the drawer are all
direct children and opt back in.

### Fixing the wrong element looked like fixing it

The previous version shipped a correct-looking CSS rule, a test asserting that
rule existed, and the bug entirely intact. The test passed because it checked
the DECLARATION rather than the effect - `.mobile-map` really does have
`pointer-events: none`, and that fact is worth nothing.

### The sweep, and what it turned up

Every full-viewport fixed layer is now checked: any that does not declare
pointer-events must be named `overlay`, `scrim` or `backdrop`. It flagged
`.reminder-edit-backdrop`, which turned out to be legitimate - transparent, but
with a pointerdown that closes the editor.

That is the distinction the rule encodes. **A layer with a dismiss handler is
meant to intercept; a structural wrapper is not**, and the naming convention is
what tells them apart. Each of the three named interceptors was verified to
actually have a handler, so the convention is not just a spelling.

## 11eu. The Tools drawer (v15.8)

> **Later:** its four mounts were written from memory and came up short -
> see § 11ew (missing props, one crash), § 11ex (buttons that threw) and
> § 11ez (three redundant close buttons).

Four faults, one shipped surface.

### A FloatPanel inside a fixed drawer

The Tools drawer mounted `MapManager`, which is a `FloatPanel`: it registered
with the panel manager, took a cascade offset and a drag handler, and was
absolutely positioned at right:16+/top:80+ **inside a fixed, full-screen
drawer** - so it sat over the drawer's own header.

A panel rendered in a drawer now drops its chrome and lays out in flow, and does
not register at all. Registering would take a cascade slot and a z-order place
it never uses, and shift the panels that do.

### A drawer called Tools that held one map manager

Dice, drawing, hazards, world and layers had **no mobile route at all** - the
topbar menus that open them are hidden below the breakpoint. The drawer holds
Maps, World, Hazards and Dice as sections now.

### A slot recomputed on every remount

`MapManager`'s two branches are separate `FloatPanel`s sharing
`id="map-manager"`, so opening a map for editing unmounts one and mounts the
other. That unregisters and re-registers, and `cascadeSlot` was recomputed
against the current open list - with other panels up, the panel visibly jumped
28px per index change. `TokenDetailPanel` has the same shape.

A slot is computed **once per id** and held, and deliberately kept on
unregister: a branch switch is not a close. **A panel's position must not
depend on how many times it has been re-rendered.**

### Four dead props

`ToolsMenu` still took `showDice` / `setShowDice` / `showSounds` /
`setShowSounds` and rendered none of them after § 11ek. Threading live state
into a component that ignores it is how § 11eo hid: the props looked wired, so
the dice tray looked reachable, and nobody asked whether anything called them.

## 11et. One commit model, and a comment that is true (v15.7)

The Roster's three buttons had two commit models one click apart. § 11es closed
most of that gap by making the sheet autosave throughout, so the cog and the
scroll now agree; **"+ New" keeps an explicit Save**, and that difference is
real rather than accidental - an entity that does not exist yet has nothing to
autosave into.

### A comment that described an intention

The § 11eh comment promised the scroll "opens it where you last were".
`DMSheetModal` remounted with `initialTab={null}`, so it always landed on
Overview. Either the comment was wrong or the feature was missing.

Remembering is the more useful of the two readings, so it is real now:
`onTabChange` already existed on `CharacterSheet` and was simply not forwarded.
`DMSheetModal` forwards it, the DM shell keeps `lastSheetTab`, and opening with
no explicit tab restores it. An explicit tab still wins, so the cog always
reaches the Entity tab. The memory survives closing the sheet - only the
one-shot `sheetTab` is cleared.

### The class of defect

A comment is not a test. This one had been describing behaviour the code never
had since § 11eh, and read as documentation of a deliberate choice. The same
shape as § 11er, where a v9.23 comment described a fix that had only been
applied to one role, and § 11ep, where a note about role-awareness sat two lines
from two lookups that ignored it.

Where a comment claims behaviour, the cheapest guard is an assertion that the
behaviour exists - and the suite now asserts the old wording is GONE as well as
that the new one is backed by working code.

## 11es. The Entity tab clobbered live state (v15.6)

Every other tab in the sheet commits on blur through `LiveInput`. The Entity tab
embedded `EntityForm`, which seeds `useState(() => initial)` **once**, never
re-syncs, and wrote its whole 19-key snapshot through `onField`.

Render the sheet on the Entity tab, take a monster to 3/10 and Poisoned as a
round would, then press Save:

    entity is really at hp 3, conditions ['Poisoned']
    patch written: hp = {"current":10,"max":10}   conditions = []

A DM who left the tab open during a round and saved a note **silently healed the
monster and cured its condition**. Switching tabs without pressing Save threw
the edits away instead, with no warning. It was the only tab in the sheet that
behaved either way.

### A create-form embedded in a live surface

§ 11eh moved `EntityForm` into the sheet to end the two-editor split, and that
was right - but a form built to CREATE something has a frozen snapshot and a
Save button by design, and neither survives contact with a surface where the
underlying entity changes underneath it.

It now runs in a `live` mode: autosave on blur, like its siblings, and the patch
is a **diff against what the form was seeded with**, so a field the form never
touched is never written. It re-baselines after each commit, and is remounted
per entity id so a baseline can never belong to a creature you have navigated
away from.

The footer says "Changes are saved as you make them" rather than offering Save
and Cancel, both of which promise something untrue once every field commits on
blur. The standalone create form keeps them: there is nothing to autosave into
until the entity exists.

### This shipped half-applied

The diff, the blur handler and the `live` prop were written but never wired,
tested, versioned or documented - v15.5 shipped with the fix inert and the bug
live. Code that is written is not code that runs. The verification that matters
is driving the reported scenario through the real component, which is what the
new tests do: hurt the monster, type a note, blur, and assert `hp` and
`conditions` appear in no patch.

## 11er. An empty overlay covered the map (v15.5)

> **Superseded by § 11ev.** This fixed `.mobile-map`, which is one level too
> deep and does not render; `.mobile-shell` was the element covering the map.

`MobileBottomNav` rendered `<div className="mobile-map">{children}</div>`, and
**neither mount has ever passed children** - both are self-closing.
`.mobile-map` is `position: absolute; inset: 0` inside a `position: fixed`
shell, later in the DOM than `.main`, with no `pointer-events: none`.

Below 768px that is an invisible transparent div over the whole map area,
swallowing pans, zooms, token drags and taps. The nav bar and the drawers sit at
z-index 200 and kept working, so it presented as **"the drawers work but the map
is dead"** - which points attention at the map, the one part that was fine.

### Two fixes, because either alone is fragile

The wrapper is only rendered when something is actually passed in, so today it
does not exist. And `.mobile-map` takes no pointer events, with its children
opting back in - because a layer positioned over the map must never eat input
meant for what is beneath it, whatever it happens to contain.

The scrim deliberately keeps its pointer events: intercepting is its job.

### It was there for six versions

This dates to § 11bp and only affected players; § 11ee gave the DM a nav and
extended it to them. It survived a targeted mobile review last round.

An empty element is invisible in every way except the one that matters. Nothing
in the DOM inspector draws attention to it, no test renders it because it has no
content to assert on, and the symptom names the wrong component. The lesson that
generalises: when a fixed-position shell layers surfaces, every layer needs an
explicit answer for pointer events - defaulting is how a decorative div becomes
an input trap.

## 11eq. The DM's chat badge never cleared (v15.4)

The § 11ee mount passed `peerId={null}` and `ui={null}`. In `dockBadges` that
makes `lastRead` 0 and `m.senderId !== peerId` true for **every** message,
including the DM's own. Three messages, two of them the DM's, produced
"3 unread". It counted total messages forever, and there was no
`lastReadChatTs` for it to advance.

A badge that can only grow is not a badge.

### Two halves were missing, not one

`peerId` gives the badge an identity to exclude - the DM sends as `DM_KEY` -
and `lastReadChatTs` gives it a horizon. Supplying either alone still misreads:
with an identity but no marker the DM sees every player message ever sent; with
a marker but no identity their own messages count against them.

The player shell keeps its marker in the ui reducer through `UI_CHAT_READ`. The
DM shell has no ui reducer, so the marker is local state, advanced to the newest
message whenever the Chat drawer is actually open and never moved backwards.

### `null` is not a neutral default

Both were passed as `null` because the DM had nothing obvious to put there, and
`null` reads like "not applicable". For a function that means "exclude nobody,
and treat nothing as read", which is the worst possible answer rather than a
neutral one.

Third bug from the same § 11ee mount, after § 11ep's blank titles. Wiring a
shared component into a second shell is not done when it renders; every
parameter needs an answer that is true for the NEW caller, not merely one the
type accepts.

## 11ep. The drawers opened with a blank title (v15.3)

§ 11ee made `mobileIsDrawer` and `normalizeMobileSection` role-aware and stopped
there. Two lookups inside `MobileBottomNav` still read `MOBILE_NAV` directly -
the drawer's header text and its `aria-label` - and `roster` and `tools` are not
in the player array:

    section=roster  title=[]        aria-label="Panel"
    section=tools   title=[]        aria-label="Panel"
    section=chat    title=["Chat"]  aria-label="Chat"

Chat and Combat worked, because those ids exist in both arrays. A DM opening
Roster got an unlabelled panel and a screen reader got "Panel".

### The same note, from the same version

§ 11ee closed with: *"a shared component that takes a role has to take it all
the way down; stopping at the top and leaving two constants hardcoded is how the
original bug happened."* Two more hardcoded lookups were sitting in that same
component, unfound, while the note was being written.

Writing down the lesson is not the same as applying it. The check that would
have worked is mechanical and takes seconds: after making a component
role-aware, grep for the role's constant and confirm every hit is inside the
selector.

The suite asserts that directly now - `MOBILE_NAV.find` appears nowhere - and
titles every section in both roles, rather than the two ids that happened to
break.

## 11eo. The player lost the dice tray (v15.2)

§ 11ek moved Dice and the Soundboard out of `ToolsMenu` into the new **Table**
menu - which is DM-only. `ToolsMenu` with `isDM={false}` then returned Line,
Radius, Token-to-Token, the drawing palette and Reminder. No dice.

`PlayerInterface` still held `showDice` / `setShowDice` and still rendered
`<DiceTray>` when the flag was true, but `setShowDice` was passed only to
`ToolsMenu`, which no longer called it. **State with a reader and no writer**:
the flag could not be set by anything a player could touch.

A shared roller only the DM can open is not a shared roller.

### One button, not a one-item menu

The DM has a Table MENU because they also have the Soundboard. A player has
exactly one item, so it is one button beside Initiative. The Soundboard stays
DM-only deliberately - a player triggering audio for the whole room is a
different feature, not a missing one.

### The regrouping itself stands

Tools is still map instruments, for both roles. The § 11ek grouping was right;
what it missed was that one of the things it moved had TWO audiences and the
new home only served one.

That is the same asymmetry as § 11ee, where the mobile layout was built for the
player and not the DM, and § 11el, where the radial bug was invisible from the
player's seat. Three regressions from the same blind spot: **a change made in
one role's surface, verified in that role, shipped for both.** The question to
ask before moving any control is not "does this belong here" but "who else
reaches it, and through what".

## 11en. Delete and Duplicate had no door (v15.1)

`ENTITY_DELETE` had exactly one dispatcher: a footer gated on
`state.entities[editingEntity.id]`. After § 11eh, `setEditingEntity` is only
ever called with a **brand new** entity - `makeEntity()` from +New, or one built
from a stat block - so that lookup was always `undefined` and the footer never
rendered.

A DM could remove a token from the map but never delete the creature. The
Roster grew without bound across a campaign. Duplicate went the same way, and
the context menu's `onEditEntity` survived only as a truthiness guard on a prop
nothing invoked.

**The reducers were correct the whole time.** Only the way IN was gone, which is
why nothing threw, no test failed, and the orphan audit stayed quiet - it looks
for actions with no reducer case, not cases with no dispatcher.

### Both actions now take an id

`deleteEntityById` and `duplicateEntityById` work on any entity rather than
reading `editingEntity`, and they live on the sheet's Entity tab - where the
entity itself moved in § 11eh. Deleting closes the sheet it was opened from.

### Four more were found the same way

`ENTITY_TEMP_HP_SET`, `ENTITY_TEMP_HP_GRANT`, `ENTITY_RESURRECT` and
`ENTITY_REPAIR` each have a reducer case and test coverage but **no UI
dispatcher**: reachable by tests, not by a DM. They are not fixed here, because
four features guessed at blind is worse than four recorded honestly.

They are an explicit allowlist in the suite, with a second assertion that the
list has not GROWN. A silent orphan becomes a tracked one, and the next
regression of this kind fails a test instead of waiting for a bug report.

## 11em. Saved positions were drag deltas spread as CSS (v15.0)

`move(id, pos)` stored `offsetRef.current` - `{dx, dy}` - and `FloatPanel`
spread it straight into `style`. The element was handed `dx: 120, dy: 60`,
which are **not CSS properties** and do nothing, so a restored position survived
only through the transform.

Worse, a saved value short-circuited the cascade slot, so the base silently
reverted to the bare `right: 16, top: 80` the caller passes. The transform had
been measured against a **cascaded** base. A panel opened third and dragged
therefore reopened 84px (3 x 28) from where it was left, and **the drift changed
with open order** - which is why it would have read as random.

### Absolute, not relative

Keeping the delta and re-applying the slot as its base - the other obvious fix -
does not hold: the slot depends on how many panels were open when you dragged,
so the same panel opened first instead of third restores against a different
base and drifts again.

The delta is converted to an absolute box at settle time and that is what is
stored. A right-anchored panel moving right gets a SMALLER right offset, which
is the sign that is easy to get backwards, so it is commented and tested.

`useDraggable` gained a `reset`, called the moment the box is banked: the
absolute position already contains the move, and a live transform would apply
the same drag twice.

### The test that would have caught it

Not "a position round-trips" - the old code would have passed that, since the
transform did carry the move within a session. The one that matters is that the
same saved panel reopens **identically whether it is opened alone or third**.
That is the property that was broken, and it only fails when open order varies.

## 11el. The panel manager overrode its own callers (v14.9)

`FloatPanel` merged the manager's values **after** the caller's style:

    style={{ ...style, ...place, ...drag.style, ...(z ? { zIndex: z } : {}) }}

`TokenDetailPanel` sets `zIndex: 400` precisely to clear the radial menu's scrim
at 320. It was overwritten with 50. The panel landed BEHIND the dark overlay, so
clicks meant for it hit the scrim - whose handler closes the radial. **HP and
Status were unusable from the DM's radial menu.**

`PlayerInterface` is not wrapped in the provider, so the player's radial kept
working. The bug was invisible to anyone testing as a player, which is most
casual testing.

### The same fault twice over

The cascade slot had it too: it applied `right`/`top` over a caller's
`left`/`top`, so `TokenDetailPanel` came out with BOTH `left: 16` and
`right: 16` and stretched across the window. It did not only sink, it moved.

The caller wins now: `style?.zIndex ?? managedZ`, and a slot is skipped when the
caller anchors from an opposing edge.

### The narrow rule mattered

The first fix exempted any caller that positioned itself - which is all twelve
managed panels, since they all pass the shared `right: 16, top: 80`. That would
have silently undone § 11ed's cascade while looking like a fix. Only `left` and
`bottom` opt a panel out, because only those CONFLICT with the slot.

A test asserts two right-anchored panels still cascade to 16/80 and 44/108, so
the exemption cannot quietly widen again.

### A general-purpose component must not out-rank its callers

The manager owns the DEFAULT stacking, not the final say. A component that
overrides an explicit value passed to it is a component whose props are
suggestions, and this is the second time in two versions that a v14.1 merge
order has produced a bug the author could not see from their own seat.

## 11ek. Tools was the leftover bin (v14.8)

After § 11da grouped the top bar into Scene / Combat / Tools / Players /
Session, **Tools kept everything that did not obviously belong elsewhere**:
Measure, Draw, Shapes & Areas, Encounter (token groups), Reminder, Dice and
Soundboard - the last two under a heading literally called "Other".

A dice tray and a soundboard are things the whole ROOM shares. They were sitting
next to a polygon eraser.

### Where each went

**Table** is a new menu for what everyone shares: the dice tray and the
soundboard. **Token groups** moved to Combat, beside Encounter presets -
revealing a cluster of ambushers is encounter management, not an instrument for
marking up a map. Tools now holds map instruments only, and its last section is
"Annotate" rather than "Other", because a bin named Other refills itself.

### The cross-link admitted the grouping did not hold

"Push view / player themes…" sat under Players and opened the World panel under
Scene. It reads **"Pull players to my view"** now, titled with the panel it
opens. The controls stay with world state, because what players see IS a
property of the world rather than of the player list - the honest fix was to
stop hiding the jump, not to move the controls.

### Two existing gates caught regressions

`icon-family` failed because the new labels carried emoji, and § 11dk migrated
the DM toolbar to SVG icons - these would have been the only astral-plane
characters left in the bar. And a sweep for icon names with no glyph caught
`icon: 'sound'`, which does not exist in `ICON_PATHS` and would have rendered
nothing at all, silently.

Both are the same lesson from a different angle: a rule enforced by a gate
survives a later author who does not know it exists.

## 11ej. One noun per concept (v14.7)

The same object was an **Entity** in the sidebar modals, a **Character** in the
context menu and claim flow, a **Token** on the map, a **Creature** in stat
block copy, and a **Preset** in the bestiary. The DM had to keep a translation
table in their head.

There is a real distinction underneath, and the labels did not track it:

| | |
|---|---|
| **Entity** | the thing with stats. Lives in the Roster, exists whether or not it is on a map. The umbrella, because it covers monsters and objects too. |
| **Token** | an entity's representation ON a map. |
| **Stat block** | a bestiary template you copy FROM. Never an entity in play. |
| **Character** | a PLAYER'S entity, from the player's side. |

### The distinction is now taught at the point of use

"Remove token" and "Delete Entity" are genuinely different actions, and the old
labels relied on the reader already knowing which noun the app meant. They read
**"Remove token from map"** - with a confirm saying the entity stays in the
Roster - and **"Delete entity"**, titled as removing all of its tokens.

Deleting a stat block now says entities already created from it are unaffected,
which is the same question asked from the other end.

### "Character" was kept deliberately

Flattening the player-facing copy to "entity" would have been jargon aimed at
the person least equipped for it. A player has a character and a character
sheet; the DM has entities and tokens. That is not drift, it is two audiences,
and the rule is written down rather than left to be inferred.

### A gate, because six versions have taught that lesson

`tools/check-vocabulary.js` reads only USER-FACING strings - `title=`,
`confirm()` and plain JSX text - because the code is free to call things
whatever it likes internally. It is deliberately narrow: it flags the specific
confusions that existed rather than every use of a common word, since a gate
that cries wolf gets disabled.

It caught two strings on its first run that the manual pass had missed.

## 11ei. Two features wearing each other's names (v14.6)

The DM's left sidebar was titled **Bestiary** and listed the current session's
entities - which is a **roster**. The actual bestiary, the built-in compendium
with World / Kind / Type / Habitat facets, was behind a small `❈ Preset`
button inside that panel's header.

Two headline features with each other's names, and the compendium was the one
hiding.

Calling it "Preset" undersold it twice over. A preset is a shortcut for
something you already know the name of; a bestiary is somewhere you GO to
browse. The label described the mechanism rather than the purpose, so the
faceted compendium looked like a convenience button.

The panel is **Roster** and the button is **⚔ Bestiary**.

### Naming has to be checked across the app, not in one file

v14.2 already named the DM's mobile section "Roster" - so the phone and the
desktop now agree, where before the phone was right and the desktop was wrong.

The README described the compendium as "a large built-in **roster**", which was
fine while "roster" meant nothing else and became a collision the moment the
sidebar took that word. It says compendium now, and names where the bestiary
lives, since the two were previously swapped.

A test asserts the renamed button still mounts `BestiaryMenu` with its facets
intact: renaming a control that no longer works would be worse than the bug.

## 11eh. One canonical entity editor (v14.5)

Every sidebar card carried two buttons - a pencil opening `EntityForm` in a
modal, a scroll opening `CharacterSheet` - and `TokenContextMenu` offered both
again plus a third route. **Two full editors for the same entity, one icon
apart**, overlapping on name, level, class, player name, AC, HP, ability
scores, conditions and portrait, in two layouts with different field sets and
different validation.

### EntityForm could not simply be deleted

It is the ONLY home for `faction`, `nature`, `passiveHiding`, Nimble Escape,
rolls-initiative, `lightSource` and token image. Removing it would have been
§ 11dx again - a redesign that quietly does less than what it replaced.

So it became a **section**: a DM-only Entity tab inside the sheet, saving
through the sheet's own `onField` path, because two surfaces writing two ways is
how they drift apart in the first place.

### One door per purpose

The sidebar's pencil is a cog that opens the sheet on that tab; the scroll opens
it where you were. The context menu's "Edit entity" is "Entity fields" and goes
to the same place.

"Open details" is now "**Actions**". It sat beside two editors with no stated
difference, which made it look like a third editor; it is the play-time panel -
use an item, cast, dash - and never edited anything. The name was the whole
problem.

### The tab argument had to be threaded

`onOpenSheet` took an entity and nothing else, so "open the sheet ON this tab"
had no way to be expressed. The DM shell tracks `sheetTab`, hands it to
`DMSheetModal`, and clears it on close so the next open is not sticky.

`EntityForm` still owns CREATION, where one form genuinely beats a tabbed sheet
for an entity that does not exist yet.

## 11eg. Four themes flashed on every load (v14.4)

`index.html`'s no-FOUC boot script validated the saved theme against a
**hand-typed** list of eight ids:

    var valid = { dark: 1, light: 1, cherry: 1, river: 1,
                  meadow: 1, forest: 1, darkcherry: 1, ocean: 1 };

`THEMES` in app.js and the `[data-theme]` blocks in styles.css both defined
twelve. Sketchbook, Charcoal, Accessible Dark and Accessible Light were not on
the list, so the boot script **discarded the saved value and painted `dark`**
until React mounted.

The script exists specifically to prevent a flash of the wrong theme, and for a
third of the palettes it caused one. Two of the four are the colourblind-safe
palettes, whose entire purpose is contrast - a palette that paints the wrong
colours first is worse than useless to the person who chose it.

### Generated, not maintained

Adding the four ids would have fixed today and left the trap for the
thirteenth theme. `tools/sync-theme-whitelist.js` derives the list from
`THEMES`, the build regenerates it, and `--check` in the pretest chain refuses a
mismatch - naming the themes that WOULD flash rather than reporting a generic
difference.

A test drops a theme from the whitelist and asserts the check fails and names
it, because a gate nobody has seen fail is a gate nobody knows works.

### Sixth in this family

§ 11dx, § 11dz, § 11ea, § 11eb, § 11ec and this. Every one is a list written
beside a source of truth that kept growing: fields to copy, keys that count,
lists that are consumable, definitions that qualify, theme ids that are valid.

The fix that holds is always the same - derive it, or check it - and the ones
that only corrected the CONTENTS of the list have all come back.

## 11ef. The Combat button went nowhere (v14.3)

The topbar strip offers **core / combat / spells / gear / story**.
`SHEET_TAB_ALIASES` mapped `combat` to `actions`, and § 11dy deleted that tab.
`normalizeSheetTab` fell through to `ids[0]` - Overview - so **Combat did
exactly what Core did**, silently, and looked like it had worked. One of five
buttons in the most-used strip in the app was a no-op.

### The fallback hid it, and so did the test

`normalizeSheetTab` falls back rather than leaving the sheet blank, which is
right - a stored tab that no longer exists must not break the sheet. But a
fallback that fires on a CURRENT, shipped control is a silent failure, not a
recovery.

The test was worse. It asserted `normalizeSheetTab('combat') === 'actions'` and
kept passing after the tab was removed, because it checked the ALIAS MAP rather
than whether the destination was a real tab. It tested that two constants
matched each other.

The suite now asserts every button in the strip resolves to a tab the creature
actually has, and that **no two buttons share a destination** - which is the
property that was violated.

### This was § 11dy's fault, not the alias's

Moving the weapon readout to Inventory read sensibly at the time, but it left
"combat" with nowhere to point. The readout is in **Abilities** now, which is
the ROLL surface, and Inventory keeps the weapon MANAGER.

Roll on one tab, configure on the other - the split spells already have. That
gives Combat a destination that is about combat rather than the nearest
surviving tab.

## 11ee. The DM had no mobile layout (v14.2)

> **Later:** this mount had three further faults - § 11ep (blank drawer
> titles), § 11eq (a chat badge that never cleared) and § 11ew (under-propped
> panels).

`styles.css` hides `.sidebar:not(.mobile-drawer)` and `.panel-toggle` below
768px. `MobileBottomNav` and the drawers existed only inside
`PlayerInterface`. So a DM on a phone or a small tablet lost the **entire**
entity sidebar - bestiary, roster, HP steppers, reveal toggles, drag-to-place -
with nothing in its place.

The v9.23 comment sitting in that CSS block describes having fixed exactly this
problem. **The fix was applied to the player and not to the DM**, and the
comment then documented it as solved for everyone. The README's
"mobile-friendly layout" was true for one role and false for the other.

### The DM's sections are not the player's

Roster, Combat, Map, Tools, Chat. A DM has no Party and no Character, because
they never claim a PC - and the player rules gate Combat and Character on
having claimed one, which would have disabled half the DM's nav. The roster IS
their party view.

The drawer holds the REAL `EntitySidebar`, with the same props the desktop
layout passes, rather than a reduced copy that would drift from it.

### Two lookups searched the player nav directly

`mobileIsDrawer` and the `drawerSide` line both read `MOBILE_NAV`, so Roster
and Tools highlighted their tab and opened nothing. A shared component that
takes a role has to take it all the way down; stopping at the top and leaving
two constants hardcoded is how the original bug happened.

`normalizeMobileSection` is role-aware too, so a stored player section cannot
strand a DM on a tab that does not exist: `party` becomes `roster`, `character`
falls back to `map`.

## 11ed. One manager for every floating panel (v14.1)

All twelve DM panels rendered `<FloatPanel style={{ right: 16, top: 80 }}>`.
Open two and the second landed exactly on the first: no cascade, no collision
avoidance, and `z-index: 50` flat across all of them with no raise-on-click, so
stacking was fixed by DOM order in `DMInterface`'s JSX. Groups always covered
Initiative however recently you had clicked it.

`useDraggable` kept its offset in component-local state, so dragging a panel
aside and closing it threw the position away.

Position and z-order live in one manager now, keyed by a panel id. New panels
cascade 28px and WRAP after eight rather than marching off a short window;
pointer-down raises, so a drag comes forward as it starts moving rather than
after it is dropped; and positions persist.

**The z-order is deliberately not persisted.** It is a session's worth of "what
did I click last", and a panel that was on top yesterday should not outrank the
one you just opened.

### The loop

The first attempt rebuilt the manager's methods whenever `order` changed. That
changed the identity of the object `FloatPanel`'s registration effect depended
on, so the effect re-ran on every raise, which re-registered, which changed the
order again: React stopped it with "Maximum update depth exceeded".

**Identity is the dependency.** The methods live in a ref now and the changing
values travel beside them, so an effect can depend on the methods without
depending on the state they mutate.

### Two smaller things

The id-assignment pass named panels after the nearest enclosing function, which
produced `d-m-world` and `d-m-claims` from `DMWorld`/`DMClaims`, and rewrote a
line inside this version's own comment. Both were caught by reading the result
rather than trusting the script.

`map-manager` and `token-detail` each appear twice, because each is ONE panel
rendered in two states. They SHOULD share a position; a test asserts those are
the only two duplicates, so two genuinely different panels sharing an id would
still fail.

## 11ec. A custom item can be an action (v14.0)

`drawerEquipmentOptions` skipped any item that did not resolve to a built-in
`MAGIC_ITEMS` entry with `activation` metadata:

    const def = magicItemDef(it);
    if (!def?.activation) continue;

and `canActivateItem` refused one outright with "not an activatable magic item".
So a Smoke Bomb built in the app - three uses, a speed penalty, plainly a thing
you DO on your turn - never appeared in Actions at all. The only equipment
option a custom-only character ever saw was the basic object interaction.

An item now carries its own activation in the same shape the built-in
definitions use: action cost, target kind, uses and charges consumed, and an
`inActions` flag for gear the author wants kept out.

`itemActivationSpec` resolves the item's own spec over the built-in one, so a
custom activation can override a definition and a definition still works alone.
It is deliberately NOT called `itemActivation` - that name has been the v12.7
gate answering "is this item doing anything right now" since requirements
landed.

### The targeting was hardcoded too

Every equipment option was `workflow: 'selfOnly'`, so even a built-in item that
targets a creature or a point aimed at nobody. The workflow now follows the
declared target.

### An unusable option is shown, not hidden

A spent bomb still appears in the drawer with `preChecked` explaining why - the
§ 11cd principle, that a control which vanishes is indistinguishable from a
feature that does not exist. A player who cannot find their bomb does not know
whether it is spent or broken.

### Fifth in a row, and the same shape

"Only a built-in definition counts" is the same defect as § 11eb's "only a
potion counts" and § 11ea's list of what counts as an effect: a rule about
which THINGS qualify, written when only one kind existed. Each was correct on
the day it was written and wrong as soon as the app let users make their own.

## 11eb. Food that could not be eaten (v13.9)

Three places said a consumable was `potion || food`: the inventory badge, the
library's Consumable facet, and the reference card. One place said `potion`: the
**Use button**.

So bread was labelled Consumable, filtered as Consumable and described as
Consumable, and had no way to be eaten. `itemIsConsumable` answers it once now,
and all four sites ask it.

`consume` needed no changes to handle food - it never looked at the list. The
only thing stopping bread was the condition on whether to draw the button.

### The same fix, twice, because the copies disagreed

`consume` carried its OWN enumeration of what counts as an effect - a LONGER one
than § 11ea replaced, which is exactly how it survived that fix. It listed
resistances, immunities and vulnerabilities, so it did not look like the short
list that had just been removed; but it still missed saving throws, senses and
advantage clauses.

**Two lists that disagree about the same question are worse than one list that
is wrong**, because fixing the one you can see leaves the other looking
plausible. Both paths call `itemHasEffects` and build through `itemTempEffect`
now.

### Fourth version in a row

§ 11dx, § 11dz, § 11ea and this: a case list written beside a schema that kept
growing, or a question answered independently in several places. The defect is
never in the answer - each list was right when written. It is in there being a
list at all.

## 11ea. A use that applied nothing (v13.8)

The activate path decided whether an item DID anything with a hardcoded list:

    eff.ac || eff.speed || eff.pp || eff.hpMax || eff.damage
      || Object.keys(eff.stats).length || Object.keys(eff.skills).length

Everything else was invisible to it. An item whose only effect was a
saving-throw bonus, a sense, a resistance, an immunity, a vulnerability, an
advantage clause or a condition **spent a use and applied nothing**.

`itemHasEffects` asks the effect for its contents instead of listing what
counts. `effectBagIsEmpty` underneath it distinguishes absence from presence, so
`{ stats: {} }` and `resist: []` are still nothing.

### Two more things fell out of looking

The temp effect the activation leaves behind carried only the effect BAG, so an
item granting advantage for three turns left its clauses behind and granted
none. `itemTempEffect` carries the saves and the clauses too, which is what the
tempEffects clause collector (§ 11dw) has been reading since auras landed.

And the reducer's `ITEM_ACTIVATE` only copied effects from a built-in
`MAGIC_ITEMS` definition, so a CUSTOM item built in the app - with its own bag,
saves, clauses or condition - spent a charge through that path and left nothing
behind either.

### The third time in three versions

An enumeration of what counts, which silently drops whatever is not on it and
never fails as the schema grows:

- § 11dx, the preset copier, which listed the fields to keep
- § 11dz, the saving-throw row, written to one name and read from another
- this, the list of what counts as an effect

The common defect is a list of cases written once beside a schema that keeps
growing. Nothing errors when they diverge; the data just stops arriving. The
countermeasure that actually works is the § 11dz sweep: ask the ENGINE what it
sees, for every kind, and fail if any kind is unreachable.

## 11dz. A saving-throw row that did nothing (v13.7)

The builder wrote saving-throw modifiers to `item.effect.saves`.
`magicItemSaveBonus` reads `item.magicEffects.saves`. Nothing bridged them, so
a **+2 WIS saves** row serialized, deserialized, rendered its label, survived a
reload - and added exactly zero to a saving throw.

Saves live on `magicEffects` now, which is where the engine has always looked.
`itemModifierRows` takes the ITEM rather than its effect bag so it can read them
back, and `saveRowsToMagicEffects` writes them, preserving any other
`magicEffects` key and deleting the object when the last row goes.

### The test was the real defect

The old test asserted that a save row round-tripped through the effect bag. It
passed, every run, while the feature did nothing - because a round trip proves
SERIALIZATION and says nothing about behaviour. "The builder offers it" and
"the game uses it" are separate claims, and only one was being made.

It rolls a real saving throw now: the same character, with and without the
amulet, must differ by exactly 2.

### The sweep that should have existed from the start

Every other row type was checked the same way, by reading the value back out of
the ENGINE that consumes it rather than out of the item. All eight were already
wired correctly; `save` was the only break. That sweep is a standing test now,
and it fails if a row type is added and connected to nothing - including a check
that the sweep still covers every entry in `ITEM_MODIFIER_TYPES`, so it cannot
silently fall behind the list it guards.

This is section 11co's lesson in its sharpest form. The orphan audit finds a
function nobody calls. It cannot find a field written under one name and read
under another, because both ends ARE used - just not by each other.

## 11dy. The sheet's Actions tab (v13.6)

> **Later:** § 11ef moved the weapon readout again, from Inventory to
> Abilities, so the topbar Combat button has a destination.

The character sheet had an **Actions** tab sitting beside the Actions **drawer**
- the surface a player actually acts from. Two things with one name doing
different jobs is the § 11cs fault, and the tab was the one carrying its weight
least.

But it was not empty, and deleting it wholesale would have repeated § 11dx from
one version earlier. It held four things:

| | |
|---|---|
| Features & Traits box | shown VERBATIM on the Features tab already |
| Weapon attack section | the only copy |
| Attacks & Weapons free text | the only copy |
| Monster stat block editor | the only copy |

The duplicate was dropped. The three unique pieces moved.

### Where each went, and why

The weapon section and its free-text box joined **Inventory**, beside the weapon
manager, because weapons belong with weapons rather than under a second heading
called Actions.

The stat block editor went to **Overview**, which is the one tab EVERY type has.
An Object has no Inventory tab, so Inventory would have quietly taken challenge
rating, legendary actions and damage immunities away from exactly the entity
type that most needs them. A PC still never sees it.

A stored sheet tab pointing at `actions` falls back through
`normalizeSheetTab` rather than blanking the sheet, which is what that function
has always been for.

### Two tests pinned the old layout

One asserted eight tabs including Actions; one asserted the weapon section sat
under `tab === 'actions'`. Both were updated to the new placement rather than
weakened - and the second was rewritten to find the guard that ENCLOSES the
section rather than scanning a fixed window backwards from it, which is the
third time this session a fixed-size source window has failed on length rather
than content.

## 11dx. Three regressions (v13.5)

All three were self-inflicted, and two of them are the same mistake in
different clothes: a list of what to handle, which silently drops whatever is
not on it.

### A preset lost most of itself on the way in

`newItemFromPreset` ENUMERATED the fields to copy. Everything else - category,
cost, source, world, tags, rarity, `magicItem`, `attunement`, `requirements`,
`magicEffects`, `aura`, `charges` - was dropped. A Ring of Protection added from
the library arrived as a plain ring with no magic identity at all.

It deep-clones the preset now and overrides the INSTANCE fields (id, qty,
equipped, attuned, uses, chargesUsed). Same idea inverted: an allow-list has to
be updated every time the schema grows and nothing fails when it is not, while
a deny-list lets new preset fields survive by default.

### Two of the four doors had no lock

`evaluateItemRequirements` was wired into the sheet's equip, attune and consume
buttons in v12.7 - but `canActivateItem` and `canAttune`, which the REDUCER
paths use, never asked it. So a Strength 10 character could drink a potion
requiring Strength 15 through `ITEM_ACTIVATE`, and could attune through
`ITEM_ATTUNE`.

Having a centralized evaluator is not the same as routing every path through
it, and "the rule exists" is not the same as "the rule is enforced". Both gates
now call it, and a test drives the reducer rather than the gate, because the
gate is not what a player touches.

### The new builder did LESS than the editor it replaced

Resistance, immunity, vulnerability, applied conditions, healing dice, the
recharge period, saving-throw modifiers and requirement scopes were all settable
in the inline `inv-editor` and not in the builder. Replacing an editor with one
that does less is the worst kind of redesign, and it shipped because the tests
checked that the new sections EXISTED rather than that nothing had been lost.

All eight are back. The damage types are modifier rows like everything else, and
a resistance row shows no number box, because a resistance has no magnitude.
The recharge period appears only once an item has uses - an empty period on a
permanent item is a control that cannot do anything (§ 11cs). A requirement's
scope list can never be emptied: a requirement that guards nothing does nothing.

### A test-window note

Two v13.1 assertions sliced a fixed 22,000 characters from the start of
`ItemBuilder`. The builder grew past it and they stopped reaching the sections
they were checking - passing or failing on the component's LENGTH rather than
its content. They bound to the next function declaration now.

## 11dw. Auras, skill bonuses and skill requirements (v13.4)

Item effects were all SELF: the wearer got them and nobody else. A clan banner
that hurries everyone near it, or a censer that hampers them, had no way to say
so.

### An aura is a turn-start effect, which is why it needed no new plumbing

An aura applies to creatures who **start their turn** inside it. That is how
these effects are worded at the table, and it is also the implementation: at
turn start the aura is written onto the creature as an ordinary temp effect, and
every existing consumer picks it up unchanged.

The alternative was threading map state into `activeItemEffects` and its dozen
callers - `itemSpeedDelta`, `itemSkillBonus`, `itemStatBoosts` and the rest -
none of which has any business knowing where anyone is standing. The clauses
travel in the temp effect too, so `magicItemClauses` stays entity-only.

It also gives the right behaviour for free: moving out of a banner's reach does
not strip the bonus halfway through the move it is paying for.

The temp effect is REWRITTEN each turn under a fixed id, never appended, so an
aura cannot accumulate across rounds. Unrelated temp effects are untouched.

An aura obeys the same activation gate as everything else (§ 11dp): an
unequipped, unattuned or unqualified banner radiates nothing. Range is measured
edge to edge (§ 11db), so a big creature's own body counts.

### `sameSide` did not exist

Allies-only auras need a notion of sides, and the faction comparison was inlined
wherever it was needed rather than named once. PCs and Familiars are one side;
anything else compares by `faction`. Two creatures with **no** faction set count
as allies, because an unconfigured table should not have its banner refuse the
party.

### Skill requirements

"Animal Handling +4 to ride" and "History +2 to read" are the requirements a
table actually states; a minimum ability score is a poor proxy for training.
They evaluate against `skillCheckMod`, the same total the app would roll
against, and - like ability requirements - the candidate item is removed first,
so a treatise granting +2 History cannot be the reason you can read it.

Negative minimums are allowed here, unlike ability scores: a skill modifier can
legitimately be below zero.

## 11dv. Quantities (v13.3)

One button that adds one item suits a glaive, a suit of chain, or a map. Arrows,
rations, stones, eggs and torches arrive in tens - and reaching forty arrows
took **forty clicks**, with forty more to adjust them afterwards.

Two places, both now typed with coarse steps:

**In the library**, each row carries its own count beside Add. Twenty arrows are
one action. The count is PER ROW rather than one shared number, or choosing
twenty arrows would also choose twenty shields.

**In the inventory row**, the old single `-` / `+` pair became
`-5 / -1 / [ 40 ] / +1 / +5`, matching the coin steppers from § 11dd. The box is
typed, so any quantity is one action rather than a multiple of five.

### The boring parts that matter

A junk count falls back to 1 in the library and to 0 in the row rather than
becoming `NaN` and poisoning the stack. Quantities clamp at zero, and the
decrement buttons disable there rather than silently doing nothing. A batch
stacks onto an existing pristine stack by the same § 11do rules, so twenty then
twenty is one stack of forty and not two of twenty.

### A test-fixture note

The row tests first rendered nothing at all: the manager opens on the
`equipment` tab and the fixture item was `misc`, so there was no row to find. A
fixture that puts its subject on a tab the component is not showing tests
nothing - the same shape as the initiative fixtures in § 11cy, and worth
recognising quickly because the symptom is "the control is missing" rather than
"the value is wrong".

## 11du. The item type side menu (v13.2)

The library grouped every category into one scrolling column AND offered a
Category dropdown - two controls for one dimension, able to contradict each
other. The side menu owns it now and the facet is gone (§ 11cs, again).

A persistent type list on the left, results on the right. Each entry has an
icon, a label, a count and `aria-current`. A category with no items is not
offered at all, so a D&D-only table never sees "Clan gear".

### Counts come from the search, not the catalogue

Search and the secondary facets apply FIRST, and the counts are computed from
what survives. A category badge therefore promises exactly what clicking it
delivers. Counting the whole catalogue would have been easier and would have
displayed a number the reader could not reach.

**Search survives a type change**, deliberately: carrying one query across
categories is how you compare them, and clearing it would make the side menu
hostile to the thing it is for.

**A type that empties under a search falls back to All items** rather than
leaving the reader on a blank panel with no obvious way out.

### Mobile

Below 620px the sidebar becomes a Types drawer above the results, with the same
choices, counts and selected state. A 178px column squeezed beside a result list
helps nobody.

### The quick-add dropdown is gone

With the side menu there were THREE ways to add a preset item. The per-tab flat
`<select>` was the worst of them - no counts, no search, no detail - and gave a
different result from the library for the same intent.

A v12.6 test asserted that control still existed. Correcting it was part of the
change: a test that pins a control the brief asks you to remove is describing
the past, not protecting the present.

### The brief is complete

All eleven sections of the item redesign are done across v12.6 through v13.2.

## 11dt. Advantage and disadvantage from items (v13.1)

An item could grant advantage to its bearer (`effects.advantage`), or
disadvantage to someone rolling AGAINST them (`effects.againstDisadvantage`) -
but **not disadvantage to its bearer.** Cursed rings and clanking boots had no
way to say "disadvantage on Stealth".

The interesting part is where the gap was. `resolveCheckWithConditions` pushes
`g.mode` generically and never assumed advantage; the CONSUMER was already
general. Only `magicItemClauses`, the collector, had no list to read a
self-disadvantage from. One loop fixed it.

### The builder writes the existing vocabulary

Rows read from and write to `magicEffects`, which is what `MAGIC_ITEMS` use and
what `magicItemClauses` already resolves - so an item built here is
indistinguishable from a built-in one to the rules. A separate item-only
advantage resolver would have been a second answer to a question that already
had one (§ 11cg).

A row can name a roll type, an ability, a skill, and a free-text context. The
context is DISPLAYED and not evaluated, and the builder says so rather than
implying the app adjudicates "while hiding" on its own.

Empty fields are not stored, so a cleared note leaves no `note: ''` behind, and
removing every row deletes `magicEffects` rather than leaving `{}`.

### Verified against a real roll, not the data

The test that matters is that a Stealth check comes back `advantage` with the
cloak, `disadvantage` with the boots, `normal` with both - and normal again when
the item is unequipped. Two opposing clauses CANCEL rather than one silently
winning, which is the 5e rule and also the thing a data-shape test would never
have noticed.

## 11ds. The item builder (v13.0)

The inline `inv-editor` put every field into dense rows of abbreviations - "AC",
"PP", "Dmg", a bare signed number - and expanded UNDERNEATH the row it belonged
to, so the list reflowed while you typed in it.

`ItemBuilder` is a modal with a **local draft**. Nothing reaches the inventory
until Save, which is what makes Cancel mean something: it restores the original
rather than undoing a series of writes that already happened.

**Cancelling a brand-new custom item removes it.** The manager tracks which ids
were created blank in this session, so Cancel on a fresh item undoes the
creation while Cancel on an existing one never deletes anything. Leaving a blank
"Custom item" behind is the cost of changing your mind, and nobody wants to then
delete it by hand.

### The modifier list is repeatable

One row per modifier instead of one hard-coded row per effect type: Armor Class,
walking speed, maximum HP, damage, passive perception, ability scores, skills,
and the four senses with all four operations. Each row shows its own signed
summary, and every type writes to a field an engine already reads - **nothing in
this editor is decorative.**

The effect BAG stays the storage format and the rows are derived from it, so no
save needs migrating. Writing back is done whole, so deleting the last row of a
kind clears it rather than leaving a stale key: a test asserts an emptied
`senses` key is removed rather than left as `{}`.

### Three collisions worth recording

`MODIFIER_TYPES` was already taken - it is the ROLL modifier vocabulary
(`die`, `negDie`, `flat`, `adv`, `disadv`, `suppress`). The item one is
`ITEM_MODIFIER_TYPES`.

Removing the old editor by scanning for a closing `)}` matched the WRONG one and
produced a dangling brace; a brace counter failed too, on template literals.
Counting paren depth from the opening guard found the true boundary, 29949 to
30049. That is the third time this session a structural edit needed depth rather
than a pattern.

And `assert.deepEqual` on an array that crossed the vm realm boundary fails even
when the contents match - spread it first. That trap is now in this file twice.

### The report generator had outgrown its bucket

`generate-report.js` refused to write a total, reporting that it could not parse
the test output. The tests were fine. `execSync` defaults to a **1MB**
`maxBuffer`, and the suite's own output passed that at ~5,200 tests - so the
trailing `# tests N` summary was truncated away and the generator could no
longer see the number it exists to read.

It now allows 256MB and warns explicitly when a run produces no summary line,
rather than reporting the symptom as a parse failure. A tool that silently
stops working as the project grows is worse than one that breaks loudly.

### Still outstanding

§ 1's side-menu library navigation and § 4's advantage rows. The advantage
CLAUSES already work and already reach real rolls through `magicItemClauses`;
what is missing is a row type in this builder that writes them, which is now a
small addition to a list rather than new machinery.

## 11dr. Inventory badges and a readable summary (v12.9)

An inventory row carried one dense effect string. The facts a player checks
mid-turn - is it on, is it working, how many charges are left - were either
buried in that string or shown nowhere.

Each row now carries badges: Equipped, Attuned, Magical, Consumable, charges
remaining, Preset, and Requirements not met. A row with nothing to say renders
no badge strip, so the list does not gain a blank line per item.

The summary spelled out its abbreviations. `PP` and `dmg` are shorthand a
player has to be taught, and the row has space for the words.

It also summarises SENSE modifications, which § 11dq made expressible and
nothing displayed - the § 11cf shape in miniature, caught this time before it
shipped rather than after. A cap reads as a cap ("Darkvision capped at 30 ft")
rather than as a bonus, because the four operations mean different things and a
single signed number would flatten them.

### On the rest of the brief

Sections 1, 2, 3 and 4 - the side-menu library, the sectioned `ItemBuilder`,
the repeatable modifier editor, and advantage rows - remain. They are one piece
of work rather than four: the builder is the vehicle for the modifier editor,
and the modifier editor is how advantage rows and sense operations get created.

The rules those controls will write to are all in place now: `requirements`
(§ 11dp), `effect.senses` (§ 11dq), signed `effect.skills` (§ 11dp), and the
existing `magicEffects.advantage` clause vocabulary, which already reaches real
rolls through `magicItemClauses`. Nothing is stubbed and no field is unread.

## 11dq. Four senses, one resolver (v12.8)

`magicItemVision` handled **darkvision only**, and only through the magic-item
layer. `sensesOf` read blindsight, truesight and tremorsense straight off the
entity, so no item could touch them at all - and ordinary gear could not touch
darkvision either, only a named entry in `MAGIC_ITEMS`.

An item now declares operations per sense:

    effect.senses = { darkvision: [{ op: 'min' | 'add' | 'set' | 'cap', ft: 60 }] }

### Resolution is fixed, so two items never fight

    1. the creature's own base sense
    2. exact SETS (highest wins), then MINIMUM grants (highest wins)
    3. the SUM of increases and decreases
    4. the strictest CAP
    5. clamped at zero

Order-independence is the property that matters, and it is asserted directly:
the same three operations in two different orders must give the same number. A
resolver where the answer depends on which item was equipped first is a bug
report waiting to happen.

The distinction between `min` and `add` is the one that carries the rules: a
minimum does NOT stack on an equal base (60 ft of darkvision plus a 60 ft
minimum is still 60), while two increases do sum, because each is a separate
grant.

### The senses reach the RULES, not just the readout

`sensesOf` is the single chokepoint every visibility consumer already used, so
routing all four through the resolver updated them together. The test that
matters is not that the character sheet shows truesight - it is that a
**blinded** viewer holding an item that grants truesight can now see an
invisible creature, and stops when the item comes off.

Senses obey the v12.7 activation gate too: an unequipped, unattuned, or
requirement-failing item grants nothing.

### Legacy data is normalized at read time, never rewritten

`effects.vision.darkvisionFt` with `mode: 'grantOrExtend'` becomes a minimum
when the creature is blind in the dark and an increase when it is not - exactly
what the old code did, expressed in the new vocabulary. Goggles of Night still
give 60 ft to a creature with none and 120 ft to a creature with 60. A test
asserts that reading an item's senses does not mutate it.

### Still outstanding from the brief

The side-menu library (§1), the sectioned `ItemBuilder` (§2), the repeatable
modifier editor (§3), advantage and disadvantage rows (§4), and the inventory
presentation pass (§9). The rules layer they will edit is now in place.

## 11dp. Item requirements and one activation gate (v12.7)

A large brief covering the item library, a new builder, structured modifiers,
vision effects and requirements. This version does the **rules layer**: the part
where "every modifier affects actual gameplay calculations" is decided. The UI
rebuild is deliberately not attempted here (see the end).

### The two pipelines disagreed

`activeItemEffects` gated on `equipped` alone. `magicItemActive` also required
attunement. So an unattuned Ring of Protection **contributed its basic effect
bag while its magic-item effects were suppressed** - the same item on and off at
once, depending which pipeline asked.

`itemActivation` is now the single answer to "is this item doing anything", and
both pipelines ask it. It considers equipped state, attunement, and
requirements.

### Requirements

`evaluateItemRequirements(entity, item, purpose)` returns exactly the specified
shape - `{ ok, failures: [{ ability, required, actual }], reason }` - and is
used at equip, attune, activate, and for passive effects.

**An item cannot satisfy its own requirement.** Scores are evaluated with the
candidate item removed, so boots that grant +4 Strength and require Strength 15
do not qualify themselves on a Strength 12 character. Another item's bonus does
count, which is the distinction that makes it correct rather than merely strict.

When a character stops meeting a requirement, the item **stays**: equipped,
attuned, in the inventory, marked "Requirements not met", effects suppressed.
Requirements are checked on the way IN only. Silently unequipping would discard
a player's choice over a condition that may be temporary.

Malformed data fails SAFE. An unrecognised `appliesTo` scope falls back to
gating all three purposes rather than filtering down to an empty list, which
would have left a requirement that gates nothing. A test caught that: the
permissive direction is the wrong default for a check whose job is to refuse.

### Skill modifiers are signed

The control added a skill at `+1` and rendered it as a read-only tag, so `+2
Acrobatics` took two clicks and `-3 Stealth` was impossible. It is a number
input now. The value has ALWAYS reached real skill checks through
`itemSkillBonus`; only the control could not express it.

### What this version does NOT do

The brief also asks for a side-menu library, a sectioned `ItemBuilder` modal, a
repeatable modifier editor, advantage/disadvantage rows, and a four-sense vision
model with grant/increase/set/cap resolution and updates to every visibility
consumer. Each is substantial. They are not started, and nothing here half
implements them: no dead schema, no unread fields.

## 11do. The item library (v12.6)

There were **two preset-item datasets**.

`ITEM_PRESETS` (29 entries) fed the structured inventory: `newItemFromPreset`,
body slots, effects, healing, the item editor. `PRESET_ITEMS` (79 entries of
Burrows & Badgers gear) fed `InventoryItemPicker` - **a component nothing
mounted**, which the orphan audit flagged in v10.0 and which has now been read
properly. Its data was flat `{cat, name, cost, weight, desc}`, a shape the
structured inventory could not consume, so 79 items were unreachable from the
running app.

All 79 are migrated into the structured model and carry `world: 'bnb'`, so they
gate like every other B&B content set (§ 11ct). 108 presets, one dataset, one
constructor, one inventory. The dead picker and its dataset are deleted.

`ItemLibraryModal` is the THIRD of its kind after the spell library and the
armoury, and deliberately reuses `CatalogFilterBar` and `filterCatalog` rather
than growing a third search. Its facets are item-specific - category, slot,
attunement, magical, consumable, source - but nothing about the interaction is
new to learn.

### Stacking is keyed on the preset, and only when nothing would be lost

`preset` is the stable library id items have always carried, so a homebrew
"Torch" a player renamed never merges into the preset one. Beyond that, only a
PRISTINE copy stacks: an item that is equipped, or partly used, or renamed is a
different thing from a fresh one, and merging them would silently discard that
state. A second instance is added instead.

An item with no `preset` at all - every pre-migration save - can never match,
so old inventories are unaffected by construction rather than by special case.

### Three things that went wrong on the way

Generating 79 object literals from data, I converted double quotes to single
without escaping: **"Forager's Pack" broke the parse.** The build caught it.

Removing the dead picker, I cut from its declaration to the next top-level
`function`. Between them sat `ABILITY_KEYS`, `DND_CLASSES` and
`SPELLCASTING_ABILITY_BY_CLASS`; 22 identifiers went undefined.
`check-undefined.js` caught that. A brace-counting second attempt failed too -
it counted braces inside template literals. Line boundaries worked.

The dash gate rejected my own search placeholder, which is the third time a
gate written earlier in this session has caught this session's work.

## 11dn. "drawings should be a list" (v12.5)

Importing a session failed outright.

`validateSessionImport` listed `drawings` and `blockZones` among its ARRAY
keys. Both are keyed by mapId - `{ [mapId]: [...] }` - exactly like `hazards`
and `layers` sitting beside them in the OBJECT list. `migrateState`, two
functions below, has always written `{}` for both.

**The validator and the migrator disagreed about the format, and the migrator
is the one that defines it.**

### Why it survived

The check only bites once the key is PRESENT. An empty session imports fine, so
every test and every quick manual check passed. It took a table that had
actually been drawn on - which is every real table - to hit it.

That is the same shape as § 11cd and § 11db: a defect that needs REAL data to
appear, sitting behind a green suite built on empty fixtures.

### The test is the invariant, not the two keys

Re-asserting that `drawings` is an object would fix today's bug and miss
tomorrow's. Instead the suite reads both key lists out of the validator and
checks each against a freshly migrated state, and then asserts the strongest
form directly: **what the app produces, the app must accept.** A default
session, migrated and serialised, has to validate as importable.

Both lists agree with a real state today; the test will notice the day a new
container is added to one and not the other.

## 11dm. One owner per setting (v12.4)

Three conflicts, all the same kind: **a control that does not own what it
claims to.**

### "Hide exact HP" existed twice

Device settings and Table configuration both offered it. The device copy wrote
`settings.obfuscateHp`, which is per-machine, while every reader takes the
TABLE's value - so the DM could toggle the device one and watch nothing happen.
HP obfuscation is a fact about the table; the duplicate is gone.

### The dice checkbox claimed an authority it never had

A DM checkbox said *"players follow this setting automatically"*. They did not.
`effectivePhysicalDice` consults `settings.physicalDice` **only** when the table
is on "Both", and then only for the person whose settings it is. The label
described behaviour the code had never implemented.

The table's Digital / Physical / Both selector is the sole owner. The personal
choice appears only when the table says "Both" - and appears for everyone then,
including the GM, because they roll too.

**Two player surfaces bypassed the resolver entirely**, reading
`state.physicalDice` directly. A player on a Physical table still got digital
rolls in the radial panel and the attack cinematic. Both go through
`effectivePhysicalDice` now, and a test asserts the raw field is read nowhere.

The player's SettingsModal was also mounted **without a table**, so the personal
choice could never have appeared for the people it is mainly for.

### Three preferences nobody could set

`density`, `reducedMotion` and `radialMenu` were read on every load and settable
only by editing browser storage. They have controls now. `reducedMotion` is
tri-state - null means follow the operating system - so the control offers
"Follow system" rather than collapsing it to a checkbox that would write an
explicit `false`.

A test asserts each control writes a value the corresponding reader actually
understands, which is the same failure this version removes: a control writing
somewhere nothing reads.

## 11dl. The type scale, migrated (v12.3)

723 font-size declarations carried **44 distinct values**. v12.1 defined a scale
and deliberately did not sweep, on the grounds that snapping hundreds of sizes
blind would reflow dense surfaces in ways nobody could see.

What made the sweep safe was measuring first. The rungs were chosen **from the
observed distribution** rather than from a typographic ideal:

    10  11  12  13  14  15  16  18  20  22  24

With those, **534 of 704 declarations do not move at all**, and the largest
movement anywhere is **1px, on 8 declarations** (the six 17px and two 19px
rules). The fractional values - 10.24, 11.52, 12.16 - were `rem` conversions and
all land within half a pixel of a rung.

A scale picked for its ratios instead would have moved almost everything.

### Display type is left alone

19 declarations above 24px stay literal. A hero number is bespoke by nature, and
a scale stretched to cover 64px would stop being small. The gate allows
literals above 24px for exactly that reason.

### The gate had to learn to resolve tokens

The tiny-and-faint check read literal pixel values. Once every size became
`var(--fs-*)`, it would have matched **19 declarations instead of 704** and
quietly stopped protecting anything. It resolves a rung back to pixels now, and
a test proves it: `font-size: var(--fs-micro); opacity: 0.4` is still caught.

That is the shape to watch when a codebase moves to tokens - checks that read
the old literal form silently narrow to whatever did not migrate.

### Three earlier tests moved with it

The v12.1 assertions counted literal sizes and built fixtures with them, so
correct new behaviour failed them. They resolve rungs now, and their fixtures
define the rungs they use.

## 11dk. One icon family (v12.2)

A count of the glyphs actually in use, rather than an impression of them:
**82 distinct emoji across 200 occurrences, and 109 typographic glyphs across
601.**

That split decides the work. The emoji are the cross-platform problem - they
render as Apple, Google or Windows artwork, at different weights and baselines,
and as tofu wherever a font is missing. The geometric characters (arrows,
carets, checks, diamonds) render as text and are consistent enough to leave.
Replacing all 801 would have been a much larger change for most of it no
benefit.

`Icon` draws inline SVG on a 24x24 grid in **`currentColor`**, so an icon
themes with the text beside it. An icon with a baked-in fill would be § 11dj's
hardcoded gold in a new shape. It is `aria-hidden` by default, because every
icon in the chrome sits next to its own label, and takes a `title` for the
cases where it does not.

The DM toolbar is fully migrated and now contains **no astral-plane character
at all**: menu triggers, menu items, both settings cogs and the time-of-day
indicator. Labels are plain words with an icon beside them rather than a glyph
welded onto the front of a string.

### Two things worth keeping

The first draft split path data on `' M'` to emit one `<path>` per subpath. It
broke on shapes whose subpaths abut - `h.01M15.5` has no space - so the dice
silently lost its pips. A single `<path>` is both simpler and correct: SVG path
data already supports several subpaths in one `d`.

The settings cog existed on **both** the DM and the player bar. A replacement
asserting one occurrence would have left the player looking at an emoji.

### The long tail

Roughly 190 emoji uses remain outside the primary chrome - the character sheet,
inventory, spell cards, chat. They are a separate pass, and each needs an icon
drawn rather than a name mapped. The family and the pattern are in place; the
work is bounded and dull rather than uncertain.

## 11dj. Semantic tokens and a legibility floor (v12.1)

An audit of visual drift, confirmed against the source: 406 inline style
objects, 805 font-size declarations, 66 z-index declarations, 45 uses of the
literal gold, 25 class names with no CSS rule.

Two of those were doing active harm, and both are fixed.

### The themes only half applied

The newer combat, dock, workflow and mobile rules hardcoded the DARK theme's
gold: 38 bare `#c9a34a` and 27 `rgba(201,163,74,...)`. **A literal cannot be
recoloured.** The app ships 12 themes, and the surfaces a player looks at most
stayed gold whatever they picked.

A semantic layer names what colours MEAN - `--accent`, `--warning`,
`--critical`, `--positive`, `--selected`, `--focus-ring`, `--surface-overlay`
and the wash variants - and each is DERIVED from the theme's own palette
(`--accent: var(--gold)`). A theme that sets `--gold` gets a matching accent
for free and never restates a literal. All 65 hardcodes now resolve through it;
the rgba forms became `color-mix` at the same strength, so nothing changed
visually on the dark theme while the other 11 gained the surfaces.

### Tiny and faint

81 rules set type below 10px. 85 combined type under 12px with opacity under
0.75. Either alone is a defensible choice; **together they are unreadable** on a
projector, a tablet, or any light theme.

Sub-10px type is now `--fs-micro`, and below 12px the opacity floor is 0.75.
The rules were RAISED, not removed - a test asserts more than 700 sized rules
survive, because deleting the styling would also have passed a "nothing is
tiny" check.

`tools/check-design-tokens.js` runs in `pretest` and rejects both a new palette
literal and a new tiny-or-faint rule, with the token to use instead.

### What was NOT done, and why

**The type scale is defined but not migrated.** 426 of 804 declarations sit
below 12px. Lifting them wholesale would visibly reflow dense surfaces - chips,
badges, coin labels - and I cannot see the result. The rungs exist for new
work, the harmful cases are fixed, and the migration is a deliberate follow-up
rather than a blind sweep.

**The SVG icon family is not started.** Replacing mixed emoji and typographic
glyphs is right - they do render differently across platforms, and this session
has already shipped `\u2316` as literal text - but it touches several hundred
call sites and needs a real icon set chosen first. Doing it badly is worse than
the inconsistency.

**Inline styles and z-index are untouched.** 406 and 66 respectively. Both are
real drift; neither is currently breaking a theme or a reader.

## 11di. The button and the rule must agree (v12.0)

v11.3 made reach edge-to-edge, and the attack option was **still greyed out**
at 9 ft centres.

`prepareWeaponAttack` was fixed. `attackTargetsFor` - which decides whether a
target is offered at all, and therefore whether the button is enabled - had its
own `Math.hypot` and measured CENTRE to centre. So the rule allowed the attack
and the gate refused it, and the gate is what the player sees.

**Fixing a rule without its gate is half a fix.** § 11cf was the same shape from
the other side: there the preview promised an attack the rule would not make;
here the rule permits one the button will not offer.

Two more sites measured their own way: `contestEligibility` (grapple, shove,
escape) and the check that ends a grapple when the pair is separated. All three
go through `tokenEdgeDistanceFt` now, so there is ONE measurement in the app.

The test that matters is not any single distance but the invariant: for every
distance from 5 to 20 ft and every size from Tiny to Huge, the gate and the
rule must return the same answer.

### Two readouts moved, and that is correct

"20 ft away" became "15 ft away" for a grapple, and "out of range (30 ft)"
became "(25 ft)". The refusals are unchanged - both were far out of reach
before and still are - but the number quoted is now the gap the player can
measure on the map rather than the span between token centres.

### `SRC` was undefined in four test files

The new assertions threw `ReferenceError: SRC is not defined` rather than
failing, which reads as a broken test rather than a broken app. Three earlier
suites had the same hole. A sweep now declares it wherever it is used: a test
that cannot run is worse than one that fails, because a failure is at least
about the code.

## 11dh. Escapes on screen, a cog and the time of day (v11.9)

The new menus read *"\u2316 Scene"*, and the online readout showed a literal
*"\u00b7"*.

**JSX does not process `\uXXXX` in attribute strings or in text children.**
Only JavaScript string literals do. So `label="\u2316 Scene"` is eight
characters of backslash-u, while `label: '\u2316 Scene'` inside the items array
a few lines below is the glyph. The same escape was correct in one position and
broken in the other, in the same component - which is exactly why it shipped:
the item labels looked right, so the trigger labels seemed fine too.

Everything in the toolbar is a real character now, and a test scans the WHOLE
app for the two positions where an escape cannot work. It found two more:
a curly-quote pair on the request card and the spell search placeholder.

The scan's first version also flagged nine false positives - `if (t >= 0.95)
return '\u263e Night'` matches "a `>` followed by an escape" - so the pattern
excludes `>=`. A checker with a 9:2 false-positive rate is one nobody reads.

### The cog and the clock

Settings gets its own button. It is frequent enough that two clicks is one too
many, and it stays in the Session menu as well, so a GM who looks for it there
still finds it. Icon-only, so it carries an `aria-label`.

The time of day sits beside the map name. It was a live glyph on the old World
button and § 11dg turned it into a hint INSIDE a menu, which meant a GM could
no longer see nightfall without opening one. Glyph plus word; below 1100px the
word goes and the glyph stays, because the icon still says which time it is.

## 11dg. The DM toolbar, grouped (v11.8)

Eighteen controls in one flex row: Maps, Initiative, Presets, Claims, Reveal
All, Hide All, Layers, Environment, Tools, World, Long Rest, 24h Rest, Short
Rest, Check, Export, Import, Settings, Exit. Below roughly 1200px it wrapped
into a second and third row of buttons, eating the map, and it offered no
hierarchy: Long Rest, Export and Layers all looked equally important.

Five destinations now, four of them menus plus the existing Tools:

| Destination | Contains |
|---|---|
| Scene | Maps, layers, reveal/hide, World (time of day), Environment |
| Combat | Initiative, encounter presets, ability check, short and long rest |
| Tools | unchanged - measure, draw, hazards, blocks, reminders, groups, dice, sound |
| Players | claims, push view, connected count |
| Session | settings, export, import, leave |

`TopbarMenu` shares `ToolsMenu`'s popover behaviour and its `.tools-menu-pop`
styles rather than introducing a second kind of dropdown.

### What deliberately stayed OUT of a menu

Connection status and the active map name. They are STATUS, not actions: the GM
needs them at a glance and should not have to open something to find out
whether players are connected. The map name is the first thing dropped below
900px, before anything clickable.

The World button carried a live time-of-day glyph. Folding it into a menu would
have lost that, so `timeOfDayLabel` travels with the item as a hint.

### The 24h rest switch

It sat between Long Rest and Short Rest - two things pressed every session -
and read like a third rest button. It is a campaign RULE, and it now lives with
the others in Campaign Rules.

### On testing a restructure

The risk is not that it looks worse; it is that a command quietly disappears.
The first suite is a coverage check: sixteen assertions, one per action the old
bar could reach, each failing if that action is no longer wired to anything.

One existing test broke, and for an instructive reason: it sliced the
stylesheet from the first `@media (max-width: 1200px)` to the first
`@media (max-width: 900px)` ANYWHERE in the file. Adding a 900px block earlier
in the file made the slice run backwards and come back empty. It searches
forwards from the 1200px block now.

## 11df. A staged edit shows before it is submitted (v11.7)

A player typed a new value, watched it snap back to the old one, and saw the
change only after submitting the draft.

**The draft machinery was all there.** `draftProjectedEntity` merges staged
changes over the entity and `workingEntity` held the result, exactly for this.
The CONTROLS did not read it: they read `entity`, the authoritative record,
which by definition does not contain the staged change. So the write landed in
the draft and the input re-rendered from a value that had not moved.

34 reads across the sheet - money, level, xp, stats, race, background, hit
dice, languages, items, spellbook and the rest - now come from the projection.
Cancelling drops the draft, so the sheet re-reads the entity and the original
values return with no extra code.

This is the same illusion as § 11dd: a refused or unapplied write is
indistinguishable from a field resetting itself, because the input always
re-reads its source.

### A temporal dead zone the static check could not see

`const money` sat 47 lines ABOVE `const workingEntity`, so pointing it at the
projection made the whole sheet throw *"Cannot access 'workingEntity' before
initialization"* and render nothing.

`check-undefined.js` passed it: the identifier IS defined in that scope, just
later. Only rendering the component found it. A test that renders the sheet and
asserts it does not throw is now the guard, and it is worth remembering that a
name-resolution check says nothing about ORDER.

### Coin counters in the sidebar

The left inventory tab listed only the denominations the player actually held,
so an empty purse showed nothing and there was no way to tell a zero from a
missing line. All five are counters now, with the empty ones dimmed rather than
hidden.

## 11de. The GM can set what players may edit (v11.6)

`playerPermissions` has been the authority behind `canPlayerWriteField` since
v9.58 - buildEditing, abilityScores, levelUp, multiclass, spellPreparation,
inventory - and **nothing wrote it.** No reducer case, no control. The defaults
were the only value a table could ever have, so "ability scores need GM
approval" was a rule every campaign was permanently stuck with, and the
delegation model was decoration.

This is § 11co from the other side: not a producer with no consumer, but a
**consumer with no producer.** The orphan audit looks for the first shape and
would never have found this one - the function was called constantly, just
never fed anything but its defaults. Worth adding to that tool: state keys that
are read and never written.

### The control

A section in the GM's Gameplay settings: a master switch for sheet editing, and
Free / Ask / Locked per build area. The three modes are the values the rules
already understood; "Ask" routes the change to the GM as a request rather than
refusing it, which is what `'request'` has always meant.

Per-area rather than one global switch, because the granularity already existed
in the model and a table that lets players manage their own gear while still
approving a level-up is the common case. The per-area rows are hidden when the
master switch is off, so the panel cannot show settings that do nothing.

Players never see the control, and the GM is unaffected by every value of it.

The setting is announced in the chat log: it changes what everyone at the table
may do, so it should not change silently.

## 11dd. The GM was treated as a player (v11.5)

Money reverted to 0 the instant it was typed, and no ability score could be
changed at all.

`CharacterSheet` built its permission context as:

    writeCtx = { isDM: !isPC, owns: canEdit, sheetMode, state }

It inferred **"am I the GM" from whether the CREATURE was a player character.**
So a GM editing a PC was treated as that PC's player, and every BUILD field went
through the campaign's player permissions: money was refused, and the input then
re-read the unchanged entity, which is the snap back to zero. Ability scores
became a GM approval request that the GM was sending to themselves.

The expression is right for the case it was written for - a GM editing a MONSTER
is the only one who ever does - and wrong for every other. It is now a fallback:
the role is passed by the two mount points, which know for certain.
`DMSheetModal` is always the GM; `EditMySheetModal` never is.

### Why this looked like a display bug

A refused write leaves the entity untouched, and `LiveNumberInput` re-reads its
value from the entity - so a refusal is indistinguishable from the field
resetting itself. § 11cf again in a new place: the control was rendered
editable, the write was refused, and nothing said so.

### Steppers

Coins get -5 / -1 / +1 / +5 buttons. They add to the current amount rather than
replacing it, cannot take a purse below zero, and are disabled by
`fieldOK('money')` - the same gate as the input beside them, so the two cannot
disagree about whether money is writable.

## 11dc. The left sidebar gets tabs (v11.4)

The right dock has been switchable between Foes, Sheet, Actions and Chat since
v8. The left one was a fixed party list, so a player checking what they were
carrying had to open the full character sheet and lose sight of the map.

Party and Inventory now share a tab strip built from the same shape as
`.dock-tab`, so the two sidebars read as siblings rather than as two different
ideas that happen to sit either side of the map.

### A glance, not a second editor

`PartyInventoryView` deliberately takes no `onField`. `InventoryManager` is the
sheet's full editor and needs a writer; giving the sidebar one would put item
editing in two places, and two surfaces that edit the same thing drift - the
lesson of § 11cg, where three copies of one status check were all wrong the same
way. The panel reads, and says where to edit.

It shows what is worth knowing at a glance beside the map: equipped separated
from carried, stack quantities, remaining uses on a limited-use item, weight
against capacity flagged when over, and only the coin denominations the player
actually has.

The Inventory tab is DISABLED rather than hidden for a player with no character
yet, so the sidebar does not change shape when they claim one.

## 11db. Reach is measured from the bodies, and size can be changed (v11.3)

Two faults, reported together.

### The range buffer ignored size

v9.82 wired `tokenEdgeDistanceFt` into the attack path, but the buffer it
subtracts was a **flat 3 ft whatever the tokens were**, so size was invisible to
reach. Two Medium creatures 9 ft apart centre-to-centre are 4 ft apart edge to
edge and a 5 ft weapon plainly reaches; 9 - 3 = 6 refused it.

The error grows with size, because a big creature's own body is most of the
gap: two Large tokens 10 ft apart are touching, and an Ogre could not reach
something it was standing against.

The gap is now each creature's half-footprint, taken from `SIZE_INFO.spaceFt` -
the same table that sizes the token on the map, so what the eye measures and
what the rule measures are the same numbers. NOT `creatureSpaceFt`, which
floors every category at one 5 ft square and would have made a Tiny creature
measure like a Medium one.

Entities are optional, so the display list and any bare-token caller keep the
old flat buffer as a fallback.

**This is more generous than strict grid counting**, where two Medium creatures
one square apart are 10 ft apart and out of a 5 ft weapon's reach. It measures
what the table sees: 5 ft of reach from your body reaches 5 ft of air. The flat
buffer was already an approximation in the same direction; this one is at least
proportionate to the creatures involved.

### Size could not be changed at all

`sizeCategory` and `size` were in **no field set**, so `fieldCategory` returned
null and `canPlayerWriteField` refused them as *"not a recognised field"*. That
check runs BEFORE the `ctx.isDM` branch, so the GM could not change a
creature's size either: both size controls - the stat-block dropdown and the
token panel's size row - wrote to a field the write path discarded.

They are DM fields, with `reach` and `scale`: size is a stat-block fact about a
creature, not something a player picks while building a character.

### Three tests encoded the flat buffer

`range-buffer`, `attack-workflow` and `live-combat` each asserted the old
constant - including, exactly, *"but 9 ft is genuinely too far for a 5 ft
weapon"*, which is the reported bug written down as intended behaviour. Fifth
time this session.

## 11da. The bonus-action spell rule is turn-scoped too (v11.2)

v11.0 made the action economy replenish outside combat and **missed the spell
half of it.** The 2014 bonus-action spell rule reads "you may cast no other
spell THIS TURN except a cantrip with a casting time of 1 action" - it is
scoped to a turn, exactly like the action and bonus slots - so a caster who
used a bonus-action spell out of combat stayed locked out of every levelled
spell for the rest of the session.

`canCastByTime` was already **given** `inCombat` by both of its callers and
consulted it only for long casts. It now gates the whole turn-scoped group: the
bonus-action rule in both directions, and the action and bonus slot checks.

`castingTimeEconomyPatch` records nothing out of combat, matching
`commitAction` (§ 11cy). A permissive check alone would still have written
`bonusSpellThisTurn`, which then blocks the moment a fight starts - the bug
moved rather than fixed.

What is deliberately unchanged: a long cast is still refused during a turn,
which is the one thing `inCombat` was already used for.

### The fixture, again

`spell-cast-transaction.test.js` set `initiative: { active: false }` while
asserting that a spent action blocks a cast and that a cast spends one. Both are
turn mechanics. That is the fourth fixture this session that contradicted the
rule it was testing, and the second where the contradiction was `active: false`
written out explicitly rather than merely omitted.

## 11cz. "No room left" on a second spell (v11.1)

Reported as an action-economy problem - a second cast refused after v11.0 made
the economy replenish out of combat. It is not the economy. The message comes
from `evaluateTarget`: **the target selection was already full.**

Only an `ACCEPTED` result closed the workflow. A `CORRECTED` one kept it open
with its selection intact - and CORRECTED means the host DID the thing,
differently, not that it refused. So a one-target spell whose cast was
corrected left its single slot filled, and the next spell answered "no room
left" on the first click.

A corrected action now clears `targets` and `targeting.selected` while the
workflow stays open, because the correction still has to be shown. The three
outcomes are deliberately different:

| Result | Workflow | Selection | Why |
|---|---|---|---|
| Accepted | closed | gone | done, nothing to show |
| Corrected | open | **cleared** | done, but the player must see what changed |
| Rejected | open | **kept** | did not happen; a retry should be one click |

Keeping the selection on a rejection is the point of the asymmetry: a refused
cast should not make the player re-aim.

**The reported symptom named the wrong subsystem.** "A second spell is refused"
after a change to action economy reads as an economy bug, and the economy was
innocent. The message text was the thing that identified it.

## 11cy. Outside combat there is no turn (v11.0)

The action, bonus action, reaction and free object interaction are **per-turn**
resources. With initiative inactive there is no turn for them to belong to, and
`prepareAction` enforced them anyway - so a creature that opened a door once
could not open another, and a party exploring between fights had to start
combat to get its actions back.

Three changes, because a permissive read alone would have left the HUD lying:

**The rules read fresh.** `economyOf(state, entity)` returns a blank economy
whenever combat is not running, and `prepareAction` reads through it.

**The spend is skipped, not just ignored.** `commitAction` does not record a
per-turn slot out of combat, so nothing accumulates in state to be cleaned up
later. The action's OTHER effects still apply: Dodging, Hidden, Disengage and a
readied action are all real outside a fight; only the slots are left alone.

**Ending combat wipes what the fight left behind.** `INIT_SET` clears every
creature's economy when initiative goes inactive, because the HUD reads the
stored flags directly and would otherwise show "action used" on everyone who
acted in the last round of a battle that finished ten minutes ago. Starting
combat deliberately does NOT clear anything - that would hand out a free action
to anyone who acted in the surprise round.

The three readouts (`selectActionResources`, `selectPlayerCombatSummary`,
`readResourceValue`) read through `economyOf` too. A rule and its display
disagreeing is § 11cf in miniature.

### Thirty-one test files said `initiative: null`

Fifty-five tests failed, across twelve files, every one of them asserting
per-turn spending in a fixture that described a world with **no combat**. The
same contradiction as § 11cp, and at more than five times the scale: the
fixtures passed only because the code never asked whether a turn was running.

That is the third time this session that correcting a fixture WAS the fix
rather than fallout from it. A fixture that contradicts the rule under test
does not prove the rule; it proves the rule is unreachable.

## 11cx. The costs are paid and the drain heals (v10.9)

v9.98 added drain, recharge and `attackUnavailableReason`. The orphan audit
found all three called from **nowhere**: each appeared exactly once in
`app.js`, its own definition. A weapon set to "heals half the damage dealt"
edited correctly, described itself correctly on its card, and healed nobody.

Worse, v10.0 reported the payment as fixed by putting it in `ECONOMY_ATTACK` -
**a reducer case nothing dispatches**. The fix was itself dead code. The line
an attack actually commits on is in `case 'WEAPON_ATTACK'`, next to where
ammunition is already spent, and that is where uses, components and the
recharge charge are now paid.

### The gate

`weaponFireCheck` already covered the WEAPON'S `ammunition` property, which is
why running out of arrows always worked. What was never checked was the
attack's own limited uses, its recharge and its own `consumes` list, so a spent
breath weapon fired again and an attack needing a component fired without one.
`prepareWeaponAttack` now refuses with the reason, in the same stat-block
wording the card uses.

### The drain

Applied in the cinematic's `onApply`, the one point where the damage ACTUALLY
DEALT is known - a miss must heal nobody, and the amount depends on the total
after saves and resistances. The heal is logged, because a rule that fires
silently cannot be checked by the table.

### The audit category that hid it

All three sat under "Functions defined and never called - (referenced only by
tests)", a NOTE nobody read. That is the worst case, not a milder one: a green
test beside a function the app never calls proves the function works and says
nothing about whether the feature does. It is its own named section now.

It is deliberately **not** fatal. There are ~80 today, most of them pure helpers
genuinely reached through another entry point, and a gate that red-lines on day
one gets switched off. Reviewing that list is a standing task, and the three
that mattered are off it.

## 11cw. The dash gate walks the whole tree (v10.8)

A re-check after v10.7 found the UI already clean: zero em dashes in `app.js`,
`game-data.js`, `styles.css`, `index.html` and, most importantly,
`app.compiled.js` - the file players actually download.

Three files were still dirty, and none of them reach the UI: `build.sh` and two
READMEs. They were missed because `filesToCheck` named **eight files and two
directories by hand**, and a list like that is only correct on the day it is
written. It walks the tree now, skipping `vendor/` because third-party bundles
are not ours to edit.

### What is NOT a dash

The tree also contains 47 U+2212 MINUS SIGN and 2 U+FF0D FULLWIDTH
HYPHEN-MINUS. These are deliberate: they are the glyphs on decrement buttons
and the fullwidth pair to the fullwidth plus on the zoom control, and
`(-5 ft)` speed penalties. A minus sign on a minus button is correct
typography, not a stray dash, and the checker does not touch them. A test
asserts they survive, so a future tightening of this gate cannot quietly strip
them.

### If one appears in the UI again

The gate covers everything the project ships. The remaining way a player could
see one is text THEY typed - a homebrew spell description pasted from
elsewhere. That is their content and is deliberately not rewritten.

## 11cv. No em dashes (v10.7)

Reported as spell text containing em dashes. **The spell data had none** -
`game-data.js` was already clean. The dashes were generated by the UI: the
reference card built its damage line as

    `${spellDamageLabel(spell.dmg)} [em dash] ${how}`

so every save-based spell grew one on screen, and the weapon card did the same
for its property notes. Fixing the record the reader was looking at would have
found nothing wrong with it.

1,049 occurrences removed across 103 files, in four forms: the literal
characters, the unicode escapes, and the HTML entities. A
spaced dash became a spaced hyphen and a tight one a tight hyphen, so line
breaks and word spacing are unchanged.

`tools/check-dashes.js` runs in `pretest`. This is a style rule worth enforcing
mechanically rather than by review: the characters are almost invisible in a
diff, they arrive automatically from editors and pasted prose, and a single one
inside a template literal reaches players.

**Every form is rejected, not just the literal.** The escape and entity forms render
identically to the reader, so a check that caught only the literal character
would have quietly relocated the habit into the escapes.

Two things the tool caught while being written, both worth keeping in mind for
any future gate of this shape: `INTEGRATION-GATE-REPORT.md` is REGENERATED, so a
dash can return there without anyone editing a source file, and the test file
itself is checked by the tool it tests - its fixtures now BUILD the characters
from `String.fromCharCode` rather than containing them.

## 11cu. A teleport's range is not its range (v10.6)

Misty Step reported **0 ft** while aiming, and no destination was legal.

The record was never wrong. A teleport has `range: 0` because you do not target
a creature at a distance - you name a point - and the real 30 ft lives in
`teleport.rangeFt`.

**Nothing read it.** `spell.teleport` was consulted exactly once in the whole
codebase, to print "teleports the target" on the reference card, and
`teleport.rangeFt` had no consumer at all. Four separate sites each did their
own `Number(spell.range) || null`, so every range display and every targeting
check took the 0 at face value - and a targeting context with `rangeFt: 0`
makes every point out of reach, which is why the spell could be selected and
never cast.

Another producer with no consumer (§ 11co), and the same multiplication as
§ 11cu's neighbours: four copies of one derivation, so fixing it in the place
you noticed would have left the other three.

`spellReachFt` is the single answer to "how far does this spell reach", and all
five sites now ask it. The label says *"Self (teleport 30 ft)"* rather than
"Self", because "Self" is true of Misty Step and useless - the question at the
table is how far.

**Left unimplemented, deliberately:** `teleport.requiresUnoccupied` still has no
consumer, so a teleport destination is not checked against occupancy. That is a
rule the data describes and the engine does not enforce - the § 11cf shape - but
it needs a destination-validation path rather than a one-line read, and is
recorded here rather than half-built.

## 11ct. The world setting reaches every catalogue (v10.5)

Weapons were gated by the table's enabled worlds in v9.97 and languages in
v9.99. **Spells never were** - there was no world on a spell at all - and the
two pickers that WERE gated only received the setting at one of their mount
points each. A GM who switched a world off still met its content from the
character builder and the summon stat-block editor.

### Spells now carry a world, and homebrew carries none

All 52 standard spells are SRD material, so the built-in library is `dnd`. A
spell with **no** world tag is homebrew and survives every filter: a world
toggle should hide the content that ships with a setting, never something the
GM wrote themselves. That is the opposite default from weapons, where an
untagged custom weapon inherits `dnd` from its group - and it is the right one
in each case, because a weapon without a group has nowhere else to belong while
a spell without a tag is by definition not from a shipped list.

### An empty catalogue is not a failed search

Both libraries said *"No spells match your search"* when the real reason was a
world being off, sending the reader to fix the wrong thing. They now
distinguish the two: an empty catalogue names the world setting, an
over-narrow query names the search.

### Composition with § 11cs

Spells get a Source facet like the armoury, and it does **not** currently
appear - no B&B spells exist, so it has one reachable option and the
"a dropdown with one option is not a control" rule hides it. It will appear by
itself the moment a second world's spells do. The two rules compose rather than
fighting, and the test asserts the absence deliberately so nobody 'fixes' it.

### Every mount, not just the sheet

A test now walks every `<SpellLibraryModal` and `<WeaponLibraryModal` in the
source and fails if any is mounted without a `worlds` prop - the gap here was
never the gating logic, it was the call sites that quietly defaulted to showing
everything.

## 11cs. One facet per dimension (v10.4)

The armoury offered **three dropdowns for two dimensions.** `Group` listed
"Simple melee", "Martial ranged" and so on - the exact product of the
`Proficiency` and `Type` facets sitting beside it.

Two settings that each looked reasonable could therefore contradict each other:
Group: Simple melee with Proficiency: Martial returns nothing, and the reader
has no way to see why. `Group` also filtered by the heading the list is
**already divided under**, so it narrowed by something visible on screen.

It is gone. Nothing is lost - "simple melee" is Proficiency: Simple plus Type:
Melee, which is what the combination always meant - and `Natural` joins
Proficiency rather than being an axis of its own.

`Property` offered `two-handed` and `natural`, which are the `Hands` and
`Proficiency` facets restated. Removed from the list; the properties that ARE
their own dimension (finesse, light, heavy, thrown, versatile) stay.

### The spell library was not the same problem

Its eight facets - level, school, class, casting time, damage, save,
concentration, shape - are all distinct, and none is derivable from the others.
Nothing was removed. Density is not duplication, and cutting a working filter to
make a bar look tidier costs the reader more than it saves.

### A dropdown with one option is not a control

Extends § 11cl's rule from zero reachable options to fewer than two. With a
single option a facet can only do nothing or narrow to exactly what is already
shown. On a B&B-only table this collapses the armoury bar from six dropdowns to
one, because every weapon there is natural and melee. A facet the user has
already set stays visible so it can be changed.

Still computed against the whole catalogue rather than the current results, so
choosing one facet does not make the others flicker.

### A beak is not one-handed

`Number(w.hands || 1)` - and `0 || 1` is `1`, so every natural weapon, which has
`hands: 0`, answered "one-handed". `??` instead. This is the second time this
session that `||` has swallowed a meaningful zero.

## 11cr. The nameless spell (v10.3)

A spell made on the sheet appeared as a blank row in the player's dock.

Two causes, stacked.

`newSpell()` set `name: ''`. The spell is added to the spellbook the instant the
button is pressed, while `LiveTextInput` only commits on blur - so a spell with
no name genuinely existed in state, and anything rendering the list in that
window drew a nameless row. If the rename was never committed at all (the sheet
closed, or a player's edit staged into a draft that was never submitted) it
stayed nameless. New spells are now born as "New Spell", which the author
overwrites.

The dock rendered `{sp.name}` raw, so a blank name drew an **empty span** - a
row with nothing to read and nothing to aim at, on the surface a player uses
mid-turn. The sheet's read-only path had been saying "Unnamed spell" for exactly
this case all along; the fallback now lives in `spellListModel`, so both
surfaces answer the question the same way rather than one of them having
remembered to.

The cast target is the spell record, not the label, so a nameless spell was
always castable - the row was usable and unreadable at the same time, which is
why it read as a display glitch rather than a broken spell.

## 11cq. One move behind (v10.2)

A player moves A->B, then quickly B->C. The DM sees C. **The player sees B, and
stays there.**

### Reconciliation assumed it saw every state

`INTENT_RECONCILE` cleared a preview only when authoritative state sat exactly
on that preview's destination. The host debounces broadcasts by 120ms, so two
rapid moves send only C - B is never observed. C's preview cleared; B's, having
nothing to match, stayed applied forever, and `optimisticTokenPos` fell back to
it. The renderer showed a position the host had left two moves ago.

Coalescing broadcasts is correct and stays. The invariant is now explicit:
**if authoritative state agrees with move N for a token, every older move
preview for that token is behind the host and stops rendering** - its
destination never having been observed proves nothing. Reconciliation walks
newest-first and supersedes per token, so another token's in-flight move is
untouched.

### A corrected move pointed at a place the host never went

`INTENT_RESULT` kept `previewApplied` for CORRECTED as well as ACCEPTED, but
left `preview.to` at what the player ASKED for. A 100 ft request corrected to
30 ft left a preview at 100 that authoritative state could never agree with - a
permanent preview, and being older than any later move it kept winning. The
preview now adopts `correction.actual` (or the token's `stateChanges` entry).

### The host judged rapid intents against stale state

`stateRef.current` is refreshed on render, and React does not render between two
intents arriving in the same tick. The second move was adjudicated from the
position the creature had already left - wrong distance, wrong remaining budget,
wrong terrain cost, wrong opportunity check. Out of combat this hid, because
destinations are absolute.

The handler now reduces as it dispatches and advances the ref. The reducer stays
the single authority; this only replays its own output so the next intent in the
tick sees it, and the following render overwrites the ref with the reducer's
result - the same reducer produced both, so they agree.

### One selector for "where is this token"

`startTokenDrag` was fixed in v10.1 to start from the rendered position, but
`tokenMove` still read raw `state.tokens`, so a second drag recorded `from` as
the position the player had already moved away from. `effectiveTokenPos` is now
the single answer, used by the drag origin and the transaction alike.

**Left unchanged deliberately:** `movementPreviewFor` still measures from
authoritative state, so a client-side cost preview taken mid-flight can
under-report. The host adjudicates from its own state and corrects, and a
correction now updates the preview, so this self-heals rather than stranding
anything.

## 11cp. The out-of-combat snap back (v10.1)

A player repositions a token with initiative inactive; the next drag jumps it
almost back to where it started. Four independent causes, each sufficient on its
own, which is why two earlier passes at the symptom (§ v9.63, § v9.64) did not
end it.

### 1. Opportunity attacks fired outside combat

v9.91 wired `pendingOpportunityFor` into `MOVE_TOKEN` and never asked whether
combat was running. An opportunity attack is a REACTION, and reactions exist
only on a turn. So walking past an adjacent hostile out of combat parked the
move waiting for a prompt nobody could answer: **the host held the token at its
old position while telling the player the move was accepted.** The client kept
drawing the destination; the authoritative state never had it.

Both the enforcement and `prepareMove`'s preview now check `initiative.active`,
from the same value, so the overlay cannot advertise an attack that will not
happen (§ 11cf).

### 2. A turn's movement budget applied when there was no turn

`prepareMove` built a budget unconditionally, so an 80 ft reposition was cut to
a 30 ft walking speed - again landing the token short of where it was dropped
while reporting success. Out of combat it now returns early, alongside the
existing forced/teleport exemption. Ownership, cannot-move, frightened,
occupancy and collision all still run: the early return sits after them and
passes their results through. Only the distance limit is lifted.

### 3. The drag started from a position the player could not see

`visibleTokens` renders a token at its optimistic position; `startTokenDrag`
initialised `offsetX` from `tokensRef.current` - the AUTHORITATIVE position. With
the token drawn at 200 and recorded at 0, the offset was 200px wrong, so the
first pointer move threw it back to nearly its original coordinates. **This is
the snap the report describes.** `renderedTokenPos` now returns what is actually
drawn, and both the drag and the render read it.

### 4. The oldest preview won

`optimisticTokenPos` walked `order` oldest-first and returned the first match,
so with two moves in flight the token drew at the FIRST destination. Newest wins
now. `optimisticMovementUsedFt` still sums every outstanding intent - position
is last-write-wins, cost is cumulative, because both moves really happened.

### And a fifth, found on the way

`options.kind` is the workflow discriminator and is always `'move'`;
`moveKind` is the movement mode. Adjudication read the former, so `prepareMove`
received `kind: 'move'` and `walk`/`fly`/`swim` never reached the budget.

### Six test fixtures encoded the bug

`opportunity-attack.test.js` had **no `initiative` at all**, and five movement
suites set `initiative: null` outright - while asserting combat movement budgets
and opportunity attacks, both of which are turn mechanics. The fixtures
contradicted the behaviour under test and passed only because the code never
asked whether combat was on. Correcting them was part of the fix, not fallout
from it: a test that asserts a rule fires outside combat is asserting the bug.

## 11co. The orphan audit (v10.0)

Five bugs this session were one shape: **a producer with no consumer.**

- `build_change` requests created, displayed, and never applied (§ 11ca)
- `end_turn` appearing exactly once in the codebase - the line that made it (§ 11ce)
- `pendingOpportunityFor` written, correct, never called, while the movement
  preview advertised the rule it did not enforce (§ 11cf)
- a dock panel shipped with no stylesheet at all (§ 11cd)
- three copies of one status comparison, all wrong the same way (§ 11cg)

Every one was found by a player hitting it. **None was findable by a test**, and
that is the point: a test asserts that code which RUNS behaves correctly, and
this class of defect is code that never runs. 4700 passing tests said nothing
about any of them.

`tools/check-orphans.js` looks for the shape directly: actions dispatched with
no reducer case, reducer cases nothing dispatches, request kinds missing a
summary or an apply branch, functions never called, components never mounted,
classNames with no CSS rule, and tool scripts nobody runs. Only the categories
that are ALWAYS a bug exit non-zero; the rest report for a human to triage,
because an unused helper may be a deliberate API.

### What the first run found

**`payResourceCost` was called by nothing.** It is the function that spends an
attack's limited uses and its ammunition. So "3 uses per short rest" on an
attack was a number that only ever went down if someone edited it by hand, and
an attack that consumed arrows consumed none. `dischargeAttackIn` (v9.98) had
just joined it. Both are now paid in `ECONOMY_ATTACK`, the moment an attack is
actually made.

This corrects § 11cm: "once per short or long rest" could be *expressed* and
was *restored* by a rest, but was never *spent*. Two thirds of a feature, and
the third that was missing is the one that makes it a limit.

**`.icon-btn` had ten uses and no rule anywhere** - including the close button
on both library modals, which rendered as a default browser button on a dark
panel. `.spinner` had five and never spun. The § 11cd shape again, found by
tooling this time rather than by a player.

### Two bugs in the auditor, both worth recording

The first version stripped comments with a regex. A `/*` inside a string opened
a comment that ran to the next `*/` far below: **32% of app.js vanished**, 151
reducer cases with it, and the tool reported all 151 as missing. It is now
line-based and conservative - a trailing comment can still hide an orphan, which
is a false negative, the safe direction for a tool that fails a build.

It also read `type: 'PC'` as an action. Entity types are not actions; an action
name must contain an underscore.

Both were caught because the tool was run against the real project before being
trusted. A checker whose first output is 151 findings is wrong about something.

## 11cn. Languages by world (v9.99)

Creature presets have carried a world since v8.37 and weapons since v9.97.
Languages were a flat list of the 16 SRD tongues - so a Burrows & Badgers table
scrolled past Infernal and Abyssal to reach nothing at all, because the B&B
languages were not in the app and had to be retyped as homebrew on every
character.

Fifteen added: High Grovish, Low Grovish, Hammings, Dentrivis, Weaslie, Omor,
Mhinning, Unney, Alper, Psalmic, Dalmic, Slannic, Laagspraak, Ravenspeak,
Mylium.

### `STANDARD_LANGUAGES` had to keep meaning "not homebrew"

The picker tests every known language against `STANDARD_LANGUAGES` to decide
whether to render it as a removable *custom* chip. Leaving that list SRD-only
while adding a separate B&B list would have shown every B&B language as
homebrew - on a B&B table. It is now derived from the whole catalogue, and the
world tag lives beside each entry rather than in a second list.

`languageWorld` returns `null` for an unrecognised name rather than defaulting
into a world, which is what keeps a genuine homebrew language removable.

### A filtered-out language the character already knows still shows

Dimmed and labelled, not hidden. Hiding it would read as the filter having
un-taught the character - the same reasoning as § 11cd, where a display that
omits something is indistinguishable from the thing not existing.

The world filter itself only appears when more than one world is available: on
a D&D-only table it would be a control with one option, which is a control that
does nothing.

## 11cm. Weapons that do more than damage (v9.98)

Five situations were asked for. **Four already worked**, which is worth
recording so nobody rebuilds them:

| Situation | Already modelled as |
|---|---|
| An effect on a hit | `attack.effect` + optional save |
| Damage AND an effect on a failed save | `mode: 'both'` with `saveDamage` |
| Once per short or long rest | `attack.uses.per` |
| Poison that ticks and fades | `effect.turns` / `tickDamage` / `decay` |

Two did not.

### Recharge

`rollRechargeAbilities` already rolled recharges at the start of a turn - for
ABILITIES. A weapon attack had nowhere to declare "Recharge 5-6", and nothing
would have rolled for it: once spent it stayed spent for the whole fight.

A recharge is **not** limited uses, so it is a separate field rather than
another `uses.per` value. Uses are spent deliberately and return on a rest; a
recharge is chance and is rolled every turn. One attack can have both.

`attackUnavailableReason` puts every reason an attack cannot be used - no uses,
not recharged, no ammunition - in one function, so the button and the resolver
cannot disagree about it.

### Drain

An attack that heals when it lands could not be expressed at all. `to: 'ally'`
heals the most wounded ally in range: deterministic, so it needs no target
picker in the middle of a cinematic, and ties break on id so the same board
always gives the same answer. It never heals an enemy however hurt they are,
and falls back to the attacker rather than letting the heal vanish when nobody
nearby is wounded.

### The bug the tests found

**A rest did not restore per-attack uses.** `restoreUsesFor` walked
`weapons[]`, `spellbook[]` and `items[]` at the top level only - but
`UsesEditor` is rendered PER ATTACK, and attacks are nested inside weapons. So
"once per short rest" on an attack was spent for good: the editor offered a
setting the rest logic could not see. Weapons are the only one of the three
lists with that nesting, which is why it survived.

That was found by asserting the rest *actually restored* the counter rather
than that the field could be set - the same distinction as § 11cf, where a rule
was advertised and never enforced.

## 11cl. Two worlds of weapons (v9.97)

Creature presets have carried a world since v8.37 and the bestiary honours the
table's choice. Weapons did not. The armoury was the SRD table and nothing
else, so a Burrows & Badgers table hand-built every beak, and a pure-SRD table
had no way to say so.

Weapons now carry a world - from `preset.world`, else the group's, else `dnd`,
so an untagged custom weapon stays visible rather than vanishing from every
world.

### Derived, not retyped

The 59 B&B weapons are read out of `BUILTIN_TOKEN_PRESETS`, where they already
exist on 74 creatures. A hand-copied second list would be wrong the first time
one of those stat blocks was edited. Each derived weapon also names the
creatures it came from.

**The source damage carries the CREATURE'S ability modifier** - 44 of the
entries do. A preset holds base dice only, because `weaponFromPreset` adds the
wielder's modifier when the weapon is built; keeping it would have doubled every
natural attack's damage. The test asserts both that no derived preset has a
modifier AND that the source data still has some to strip, so it cannot quietly
become vacuous.

Eight creatures have a "Bite" and they are not the same bite, so a name used by
several different dice is disambiguated - "Bite (2d8)" - while a name used once
is left uncluttered.

Natural weapons use no hands and are always proficient: `weaponProficiencyFor`
short-circuits `prof: 'natural'` rather than asking `weaponProficient`, which
would otherwise tell a creature it is untrained with its own beak.

### The gate runs before the search

`weaponPresetsForWorlds` filters the catalogue BEFORE the facets and the
keyword, so no query can reach a world the table has switched off. An unset or
empty world list shows everything - a table that has never been configured must
not get an empty armoury.

### A filter that cannot match anything is not offered

Writing the test caught the Group dropdown still listing "Natural weapons" on a
D&D-only table: a filter guaranteed to return nothing, which reads as a broken
filter rather than as a world that is off. `CatalogFilterBar` now hides options
no item can match, and drops a facet whose options are all unreachable. Computed
against the whole catalogue rather than the current results, so choosing one
facet does not make the others flicker.

This benefits the spell library too, from the same shared component.

## 11ck. Filtering a catalogue (v9.96)

Both libraries had a search box that read two or three NAMED FIELDS and one
dropdown. The spell search read name, school and description; the weapon search
read name and property keywords.

So a keyword only matched if it happened to land in a field the filter listed.
Searching the spell library for `dex` found nothing, though every card displays
its save; searching for `fire` missed spells whose only fire is in
`dmg.parts[].type`. And neither could answer the question a catalogue is
actually opened with - *fire spells that need no concentration*, *finesse
weapons that deal piercing*.

### One engine, two catalogues

`parseSearchQuery` / `matchesSearchQuery` / `filterCatalog` / `CatalogFilterBar`
are defined once and mounted twice. Two copies of a search box is how the two
drift into behaving differently for the same typing - the shape this session has
already produced three times (§ 11ca, § 11ce, § 11cg, the last of which was
*three* copies of one broken comparison).

The searchable text of an entry is built from its REFERENCE CARD, so a keyword
reaches everything a reader can see rather than the fields the filter thought to
name: damage types, save abilities, casting times, property explanations, and
booleans that have no text of their own (`concentration`, `ritual`).

Facets are declarative - `{ key, label, options, test }` - so adding one is a
list entry, not a new branch in a filter expression. A facet value may be an
array, which ORs within that facet while facets AND with each other.

### The query language, and what typing it half-finished does

Bare words AND (typing more narrows), `"quoted phrases"` are single terms, and
`-term` excludes.

Both edge cases here came from the same thought: a search box is read on EVERY
keystroke, so it must behave while a query is half-typed. A lone `"` became a
literal search term for a quote character and matched nothing - the box appeared
to break mid-type. A lone `-`, typed before the word it will exclude, did the
same. A term now needs at least one letter or digit, and stray quotes are
stripped from bare words.

### A test that was wrong about its own premise

The first version asserted `matches('fireball, no save', parse('fire save'))`
was false. It is true, and correctly so: *fireball* contains *fire*. The miss
has to be demonstrated on a term that is genuinely absent. Substring matching is
the intended behaviour, and a test asserting otherwise would have been "fixed"
by breaking it.

## 11cj. The armoury (v9.95)

Weapons were a flat `<select>` of 19 names. No categories, and **no properties
at all** - nothing in the data recorded versatile, thrown, light, heavy,
loading, ammunition or reach, so a longsword and a battleaxe differed only in
their dice and nothing told a player why they might pick one. The picker also
sat in the same undifferentiated run of controls as the weapon list itself, so
"browse" and "build" read as the same activity.

The table is now the full simple/martial list - **37 weapons in four groups** - and the picker is built like the spell library: search, group filter, and rows
that expand to a reference card. Deliberately the same shape, because two
pickers doing the same job should not have to be learned twice.

### Properties that the app can honour become attack modes

`attacks[]` already supports several modes per weapon and the attack UI already
lets you choose between them, so **versatile** and **thrown** are built as real
modes rather than prose: a longsword arrives with both grips, a dagger with a
20 ft throw. Everything else - light, heavy, loading, ammunition, special - is
printed with an explanation and **not** simulated. Nothing here claims a rule
the engine does not actually apply, which is the failure mode of § 11cf: a rule
advertised and never enforced is worse than an absent one.

Proficiency delegates to the existing `weaponProficient` rather than reading
`weaponProfs` a second time, and inherits its `null` - a creature with no
declared proficiencies is told nothing rather than told it is unproficient with
its own weapon.

### Two things the build caught

`WEAPON_CATEGORIES` already existed and already meant something else: the
PROFICIENCY vocabulary, `['simple', 'martial']`. The new groups are
`WEAPON_GROUPS`, each naming the proficiency category it belongs to - so the
card can say whether the character is actually proficient.

The armoury also had to adopt the spell library's modal convention - `ReactDOM.createPortal`, `.modal-overlay`, `useEscClose` - rather than the
plain-div scrim it was first written with. Two modal conventions in one app is
how one ends up rendering behind the other.

### On the test

`WEAPON_PRESETS` is a `const`, invisible to the render sandbox's global, so the
table is parsed out of source. The first assertion is that the parse **found**
something: a regex that silently matched nothing would make every count test
below it vacuously pass. A separate test checks that all 19 weapons from the old
list survive, since an expanded table that quietly drops entries breaks existing
characters.

## 11ci. A list of the ways a spell can matter is always one short (v9.94)

v9.93 stopped the sheet casting aimed spells at nobody, and recorded one known
gap: Bless, whose buff is not modelled as a condition, `speedDelta`, `attackAdv`
or `saveAdv`, so the predicate returned false.

It was not one spell. It was **eight** - Bless, Bane, Aid, Haste, Guidance,
Mage Armor, Counterspell and Dispel Magic - each still spending a slot and an
action on nobody from the Spells tab.

`spellNeedsTargetToResolve` enumerated EFFECT SHAPES: damage, healing, a
condition, a speed change, advantage. That list is a proxy for a question the
data already answers directly. `targetType === 'creature'` **is** the question:
a spell that targets a creature needs one, however its benefit is modelled. The
proxy had to grow an entry for every new way a spell can matter, so it was
always going to be one short - which is what a "known gap" of exactly one spell
should have suggested.

All 31 creature-targeted spells in the library now hand off, and the 21 that
self-resolve (2 self, 2 point, 17 area) still do.

### A test that encoded the bug

`spell-needs-target.test.js` asserted `needs('Mage Armor') === false` under the
heading *"a SELF spell does not"*. Mage Armor is `targetType: 'creature'` and
castable on an ally - § 11cb established exactly that when fixing its range
label, in this same session. Writing the assertion made the gap look intended,
and a reader checking whether Mage Armor was handled would have found a green
test saying it was.

The replacement asserts over the WHOLE library in both directions: no
creature-targeted spell may self-resolve, and no self or area spell may be sent
to target picking. Neither can go one entry short.

## 11ch. A spell that spent itself on nobody (v9.93)

Reported as "Vicious Mockery never rolls dice or deals damage". It is not
Vicious Mockery. It is **every aimed spell cast from the character sheet's
Spells tab**.

`SpellManager.cast` builds its request with no `targetIds`, and
`resolveTargetedSpellCast` returns immediately on an empty list. The cast spent
the slot, the action and the materials, logged a cheerful *"Cast Vicious
Mockery"*, and rolled nothing at anyone.

A CANTRIP shows this worst, which is why a cantrip is what got reported: there
is no slot to notice missing, so the only evidence is that the target's HP never
moves. Cast Fire Bolt from the same button and it is equally inert - the report
named one spell, the fault covers all of them.

### The engine was never broken

`SPELL_CAST` → `resolveTargetedSpellCast` → `buildSpellTargetAttack` → the
cinematic all work, and the tests prove that FIRST so the fix stays where the
fault is: given a target, Vicious Mockery rolls its 1d4, sets a WIS save at the
caster's DC, and offers Apply. The v9.67 note on `SPELL_CAST` describes exactly
this class of bug being fixed for the workflow - the sheet was simply never
given targets to pass.

Two false leads worth recording, both my own probes rather than the app:
`resolveHit(crit, nat1, null, ac)` returns TRUE for a save spell, so a missing
to-hit roll is not read as a miss; and `validateIntentShape` requires `targets`
at the intent's TOP level, not inside `options`, so a hand-built intent is
rejected with "targets must be a list" while the real sender is fine.

### The fix is a handoff, not a silent resolution

`spellNeedsTargetToResolve` decides whether a spell can do anything without
something aimed at. If it needs a target the sheet hands off to the SAME cast
workflow the map uses, and **spends nothing** - the workflow spends the
resources itself once a target is chosen. The test pins the ordering: the
handoff must return before `onCommitCast`, or the slot is spent twice.

Self spells, teleports and area spells are exempt; an area spell has its own
placement flow and routing it to single-target picking would break it.

**The gap recorded here was wider than Bless, and is closed in v9.94 below.**

## 11cg. A button that said nothing (v9.92)

A player presses "Request a new character". The request is sent, the GM sees it,
and the player's screen does not change at all.

The "Waiting for the DM to approve…" element existed at **three call sites** - the onboarding gate, the claim panel and the topbar control - and all three were
guarded by `status === 'pending'`.

**No live request carries that string.** `'pending'` is the LEGACY spelling of
`'submitted'`; `normalizeRequestStatus` exists precisely to translate it. The
waiting state was unreachable at every site, so the only evidence the button had
worked was the GM saying so out loud.

### A correct status check is still not enough

The request lives in synced state, so nothing local can change until the host
has received it and echoed back. Even with the comparison fixed there is a round
trip of silence - which is the complaint, in a shorter form. The controls now
carry an optimistic `sending` state that clears when the real request appears,
with a `claimGiveUpMs` timeout so a dropped packet is not a permanent spinner.

`newCharacterGrantView` is one pure function returning `{ state, text, canAsk,
busy }` for all three sites, so they cannot drift apart again - which is what
happened here: three copies of one comparison, all wrong the same way.

### Statuses that had no message at all

The old check knew `pending`, `accepted` and `rejected`. `corrected` - the GM
approved a MODIFIED version - was not treated as a grant, leaving an approved
player stuck. `expired` fell through to the plain button, and had it been
lumped in with `rejected` it would have told the player the GM refused them when
in fact nobody answered. Both are now distinct states, and an unrecognised
status fails safe as *busy* rather than as an invitation to ask again.

### Two more instances of the same mistake

`status !== 'pending'` is **always true**, so two other guards were firing
unconditionally:

- `AttackCinematicLayer` cleared the cinematic whenever a backing request
  existed, resolved or not. Its own comment says "if this attack's request was
  resolved elsewhere".
- The host's submit handler removed prior requests of a kind whether or not they
  were resolved. Harmless only because the duplicate guard above it returns
  first - the guard was the only thing making it safe.

Both now ask `requestStatusIsTerminal(normalizeRequestStatus(...))`. A test
scans for any remaining comparison against the legacy spelling, exempting only
the translator function itself.

## 11cf. The rule was advertised and never enforced (v9.91)

`pendingOpportunityFor` existed. `OPPORTUNITY_PENDING`, `OPPORTUNITY_RESOLVE`
and `OPPORTUNITY_ATTACK` existed in the reducer. `provokesOpportunityAttack`
existed and was correct. `prepareMove` computed `opportunity.provokes` and the
movement overlay **displayed** *"Leaving the reach of X provokes an opportunity
attack."*

`MOVE_TOKEN` never asked. The move completed, and nothing was provoked - while
the preview told the player otherwise. That is worse than an absent rule: a
missing feature is discovered, a rule that announces itself and then does not
fire is trusted.

Third producer-without-a-consumer this session (§ 11ca, § 11ce). The reducer
cases had a further twist: they had **no UI either**, so even a caller would
have parked a move that nothing could finish.

### The exemptions are read, not re-derived

The first attempt re-checked the exemptions at the call site - `!req.forced && !isTeleport(req.kind)`. Forced movement is flagged by
`kind: 'forced'`, not by a `forced` property, so **a shove parked for an
opportunity attack against itself**. Two existing tests caught it.

`MOVE_TOKEN` now keys off `res.opportunity.provokes`, the value `prepareMove`
already computed and the preview already displays. One source, so the preview
and the enforcement cannot disagree - which is the actual bug this section is
about, in its general form.

Nimble Escape therefore belongs in `prepareMove` too, not only at the call site.

### Nimble Escape reads free text on purpose

Monster traits in this app are prose: `entity.abilities` is a text block and 91
of the 152 built-in presets use it. A structured flag alone would mean every
stat block that already documents the trait still provoked. Three sources are
accepted, most explicit first - `nimbleEscape === true`, a named entry in
`features`, then a word-boundary match in the prose - so existing content works
untouched, `nimbleEscape: false` is an override that beats the prose, and
"Nimble. Escape artist." does not match.

**This is not RAW.** By the 2014 rules Nimble Escape grants Disengage as a bonus
action; it does not make a creature immune to opportunity attacks. This
implements the table rule as asked, per creature, and the GM toggle turns it off.

### Chaining, and the loop guard

The original helper returned only the FIRST provoker, so a move past two enemies
could offer at most one reaction. It now returns all of them, and
`OPPORTUNITY_RESOLVE` re-dispatches the move with the resolved reactor appended
to `oaAsked`, so each provoker parks in turn and none can be asked twice.

The reactor is appended **in the resolver**, from `pend.reactorId`, not trusted
from the stored request. Resolving a reactor must always exclude that reactor
whoever parked the attack, or a pending record created by any other path - a
test, a future caller, an old save - resumes a move that immediately re-parks
against the same creature, forever. An existing test that parked one by hand
found this.

### On the four test files that had to change

Wiring a rule into the movement path changes every test whose fixture happens to
stand a token next to a hostile. Four did. They are about movement, so they now
resolve the reaction and assert on where the token ended up - with
`movement-workflow` asserting the parking explicitly first, so the drain helper
cannot quietly swallow a regression in the thing it steps over.

One of the new tests was wrong in the same way the code was: it asserted on a
`forced: true` property that nothing in the app sets, so it passed while a shove
was in fact parking. A test written against the same misunderstanding as the
code confirms the misunderstanding.

## 11ce. "? Request", and accepting it did nothing (v9.90)

`END_TURN_MODE` defaults to `'request'`, so asking the GM is how a player ends
their turn on an out-of-the-box table. The string `'end_turn'` appeared
**exactly once in the codebase**: the line that creates the request.

Nothing displayed it - `requestSummary` fell through to its
`{ icon: '?', title: 'Request' }` placeholder - and nothing applied it, so
accepting resolved the request, toasted *"Request accepted"*, and left the
initiative order where it was.

This is the same producer-with-no-consumer shape as `build_change` (§ 11ca), in
the **same switch**, four versions later, found the same way: a player reported
it. Two of the request kinds this app defines had no consumer. That is a
pattern, not a coincidence - the switch is a list of `if (r.kind === …)` with a
silent fallthrough, so a new kind costs nothing to add and nothing warns that it
resolves to a no-op.

### Advance, do not re-dispatch

Accepting dispatches `INIT_ADVANCE`, not `END_TURN`. The request path already
set the `turnEnd` marker, so `END_TURN` would hit `alreadyEndedTurn` and refuse
*itself* - a fix that looks right and does nothing. `INIT_ADVANCE` is what the
direct path delegates to anyway, and it clears the marker.

A queued request can outlive its turn. Accepting a stale one would advance
**somebody else's** turn, which is worse than doing nothing, so the entity is
re-checked against the live initiative index at the moment of approval and the
card warns the GM before they click.

### The two dead ends behind it

`turnEnd` was cleared only by `INIT_ADVANCE`. So a GM who **declined** left the
marker standing, `alreadyEndedTurn` kept matching, and every further attempt
answered "has already ended this turn" - the player could not end their turn for
the rest of the round. An **ignored** request reached the same dead end by
expiry instead. `TURN_END_CLEAR` releases the marker (and any `readyToEndTurn`
flag) on both paths.

The tests cover all four outcomes a request can reach - accept, accept-when-
stale, decline, expire - because three of the four were broken and only the
first was reported.

## 11cd. "Level 23 of 3" (v9.89)

The dock's spell panel shipped in v9.52 with **no stylesheet at all**. Not a
thin one: `.spellbook`, `.spellbook-row`, `.spellbook-group-head`,
`.spellbook-meta` and `.tag` had no rule anywhere in `styles.css`.

Two things followed, and a player reported both as one complaint.

`.spellbook-row` is a bare `<button>`. The only global rule touching `button` is
a tap-highlight reset, so every row rendered with the browser's default
light-grey chrome, black text and system font, inside a dark panel.

And the group header put the level label and the slot count in **adjacent spans
with no gap**, so they abutted. "Level 2" followed by "3 of 3" reads as
*"Level 23 of 3"*.

### Why the fix is not only CSS

A gap would have separated them today. The readout is still two bare numbers,
and a bare number pair is misreadable wherever it lands - a wrap at a narrow
width, a future header that puts something else beside it, a screen reader
running the two spans together. `spellSlotSummaryLabel` gives it words:
**"1 of 2 slots left"**. Singular at one slot, and an exhausted level still
names its total, because how many return on a rest is the thing the player
wants next.

The header is a flex row with `space-between` and a `gap`, which is the
belt-and-braces half. Below 340px it stacks rather than wrapping the readout
into the label.

### Two more raw values in the same rows

The meta line rendered `sp.castingTime` - the internal key, so a bonus-action
spell displayed **"bonus"** - and `${sp.rangeFt} ft` unconditionally, so a spell
with no range printed **"null ft"**. Both now come from the model as
display-ready strings, with the range going through `spellRangeLabel` so the
dock and the reference card agree.

Four adjacent meta spans had no separator either; they are dotted now, which is
the same bug as the header in a different row.

### On the test

Asserting that a class name appears in the stylesheet would pass the moment
anyone added one empty rule. The tests assert the properties that prevent the
collision - `display: flex`, `justify-content: space-between`, a `gap`, the six
button defaults the row has to undo - and that the readout carries its own
words. 18 of the 22 fail against the previous build.

## 11cc. A casting time you could read but not change (v9.88)

`castingTime.type` already drove everything that matters: which slot a cast
spends (`castingTimeSlot`), the 2014 bonus-action rule, whether a spell may be
readied, and the refusal messages when a slot is gone. **Nothing wrote to it.**
The field was set once - when a spell was created, or imported from the library - and there was no control anywhere to change it. A homebrew cantrip intended
as a bonus action, or a spell re-timed by a subclass feature, could not be
expressed at all.

The rules end of this was already built, so the work was a select and a patch
helper, and the risk was not "does the control render" but "does the new value
reach the rules". The tests assert the consequences rather than the field: the
slot spent, `isActionCantrip` going false, the reference card updating.

`spellCastingTimePatch` always writes a COMPLETE `{ type, amount, unit,
trigger }`. `validateSpellSchema` requires `castingTime.type`, so a half-written
record here is a spell that fails validation on export - the reason the helper
exists rather than an object literal at the call site.

### The trigger, and a bug the edit created

A reaction spell needs a `reactionTrigger` or it cannot be cast. Switching a
spell away from reaction PRESERVES the trigger text, so flipping the type and
back does not silently lose what the player typed.

That preservation broke the card. `spellCastingTimeLabel` appended
`ct.trigger || spell.reactionTrigger` unconditionally, which was harmless while
the type was fixed at import - a trigger only ever existed on a reaction spell.
With the type editable, an action spell with a remembered trigger read
**"1 action, when you are hit by an attack"**. The label now gates on the type.
This is the shape to watch when a read-only field becomes editable: the readers
were written against a guarantee that the write path has just removed.

### Said where the choice is made

A leveled spell cast as a bonus action limits the rest of that turn to a
cantrip. `castRequirements` already warned about it - mid-turn, when the cast
was refused. The editor now says it at the point of choosing, and says nothing
for a CANTRIP set to bonus action, because the rule does not apply there; a
warning that does not apply is how players learn to ignore warnings.

A non-action casting time also shows in the COLLAPSED spell row and in the
library summary, since otherwise it is discoverable only by opening the editor - and it is the fact a player most needs at a glance on their turn.

## 11cb. A spell you could add but not read (v9.87)

The library row showed a name, a school and a one-line summary. Casting time,
range, components, duration, the save, and what an upcast slot buys were all
present in the record and displayed nowhere. The description was hung on a
`title` attribute - **a tooltip, which does not exist on a touchscreen**, so on
a phone there was no way to read a spell at all before adding it to a spellbook.

Rows expand now, and the derivations are pure functions (`spellReferenceCard`
and friends) rather than JSX, because there is no browser in the suite and the
thing that has to be correct is the derivation. The tests run them over all 52
standard records, not five hand-picked ones: that is what caught the two below.

### Two things the real data said that a fixture would not have

**`duration` is not always a duration.** Three records carry a scheduler key
there - Witch Bolt's is `"startTurn"`. Printing the field would have shown a
player "Duration: startTurn". The string is used only when it parses as one,
and otherwise the duration is built from `durationHours`, `effect.turns` (× 6
seconds) and the concentration flag.

**Range 0 is not always Self.** Mage Armor is range 0 with
`targetType: 'creature'` - you may cast it on an ally. Reporting "Self" states
the opposite of the rule, so range 0 reads as Touch when the target is another
creature and Self only when the spell says `targetType: 'self'`.

### And one thing left out

`requiresSight` is true for **40 of the 52** spells. A badge on three quarters
of a list is decoration, not information; it stays in the targeting rules, where
it does work. `Concentration` and `Ritual` are badged, because they distinguish.

Absent data drops its row rather than being filled in with a plausible default.
A card that invents "Touch" for a spell whose record does not say so is worse
than one that stays quiet, because a player cannot tell which lines were read
and which were guessed.

## 11ca. The GM approved it and nothing happened (v9.86)

A player picks a Sorcerous Origin in Edit Build and submits. `multiclass`
defaults to `'request'`, so `canPlayerWriteField` routes `classes` and
`subclass` to the GM as a `build_change`. The GM accepts. The request leaves the
queue, the toast reads *"Request accepted"* - and the character still has no
subclass.

`DMRequestsOverlay.resolve()` handled `join_request`, `hp_change`,
`turn_correction`, `place_token`, `stat_change` and `level_change`. It had **no
branch for `build_change`**, which is the kind every approval-gated build field
uses. Accepting fell through to the closing toast, which announces success
unconditionally.

Both halves were individually correct, which is why nothing caught it: the sheet
sent a well-formed request, `requestSummary` rendered it properly for the GM,
and `ENTITY_PATCH` would have applied it - it was never asked to. A producer
with a queue and no consumer; the fifth appearance of that shape this session.

### Not every `build_change` is a field write

Two senders use the kind for transactions: `field: 'rest'` and
`field: 'spellSlotsUsed', value: { restore: n }`. A blanket
`ENTITY_PATCH { [field]: value }` would have written `spellSlotsUsed:
{ restore: 1 }` over the counter - worse than doing nothing, because it
corrupts state instead of losing an edit. Those dispatch `LONG_REST` /
`SHORT_REST` and `SPELL_SLOT_RESTORE`.

Everything else has its category re-checked **at the moment of approval**, not
trusted from the payload. The request crossed the network from a player and may
have sat in the queue for minutes; `fieldCategory(field) === BUILD` is the gate,
so a request naming `ac` or `hp` is refused with a reason rather than applied
because a GM clicked yes.

### The second fault, in the same panel

`addClassLevel` returns a whole ENTITY. `LevelUpPanel.levelClass` handed all of
it to `onField` *as if it were a patch*. For a GM that wrote every field back
unchanged and looked fine. For a player it staged the entire sheet - sixty-odd
fields - into the draft, where `partitionDraft` then refused `hp`, `ac` and the
rest, so "add a class" produced a wall of denials and applied almost nothing.
It now stages the diff. The test pins the diff at under twelve fields and
asserts `hp` and `ac` are not among them, so a future grant that widens the
blast radius fails here rather than in a player's draft.

## 11bz. The v9.84 fix shipped and did not arrive (v9.85)

`.ability-score` was fixed in v9.84 and reported still broken. The stylesheet
was right; the browser never asked for it.

`index.html` requested `styles.css`, `game-data.js` and `app.compiled.js` by
bare filename. GitHub Pages serves static files with a long cache life, so a
returning visitor keeps the copy they already have. Nothing in a CSS fix can
make a browser go and look for a newer one - and every gate in this project
passed while the deployed page still rendered the bug: `verify-build.js`
confirmed `app.compiled.js` matched `app.js`, and the suite was green.

**A build gate can only see the repository.** It cannot see what the browser
actually loaded, so this class of failure has to be designed out rather than
tested for after the fact. The URL now carries the build:
`styles.css?v=9.85`. Every deploy is a new URL, so no returning player - or
tester - can be left on an old build.

`tools/check-asset-versions.js` fails the build if the `?v=` drifts from
`APP_VERSION`, and runs in `pretest`. The test asserts the check REJECTS a
mismatched version as well as accepting a matching one; a checker that cannot
fail is decoration.

The version badge in the top bar (§ v9.62) exists for the other half of this
problem: it tells you which build a tester is actually running. It reads from
`APP_VERSION`, so a stale page shows the stale number - which is how this was
identified.

## 11by. A DEX of 13 displayed as "1" (v9.84)

On the Abilities tab, `.ability-score` set `width: 46px` and left the global
input padding of `7px 10px` in place. Border-box, that is 24px of content - and
a number input's spin buttons live *inside* the content box, reserving about
15px whether or not they are painted (Chrome draws them on hover only, but
always keeps the room). Nine pixels remained. One digit at 0.9rem monospace is
8.6px, so the field showed the first digit and clipped the rest.

| field | width | content box | after spinner | digits |
| --- | --- | --- | --- | --- |
| `.ability-score` before | 46px | 24px | 9px | **1** |
| `.prof-pb` before | 48px | 26px | 11px | **1** |
| `.spell-slot-cfg-item .spell-num` | 34px | 20px | 5px | **0** |
| `.ability-score` after | flex ≤54px | 48px | 48px | 5 |

The spin buttons are the cause, so they are suppressed **once, globally**,
rather than per-rule. Three separate rules were already suppressing them
locally - `.csheet-ability-score` does it with `!important` on three
declarations - which is the shape of a fix being rediscovered. Nothing in the
app needs them: every numeric field is typed, and the ones worth stepping have
their own ± buttons.

`.ability-score` also stops pinning a pixel width; it flexes to its grid cell
with a cap, so a narrow sheet shrinks the field instead of overflowing it. The
read-only form of the same value is a `<span>`, where `width` does nothing at
all - it is now `inline-block`, so the two forms are the same size.

### The test that had to do arithmetic

There is no browser in the suite, so `number-field-width.test.js` reads the
declared width, padding and font size out of the stylesheet and computes the
content box, subtracting the spinner reservation when the stylesheet does not
suppress it. Asserting that the CSS *contains* some string would have passed
against the broken rule; asserting that two digits fit does not. Checked
against the shipped geometry, it fails.

## 11bx. "＋ Add to map" looked dead while it worked (v9.83)

`newFromPreset` is `async`: before it opens the edit form it calls
`resolvePresetImage`, which probes `assets/tokens/` for a matching file. There
is no directory listing on a static host, so it tries up to six name slugs
against five extensions - thirty sequential `<img>` loads, each a 404
round-trip to GitHub Pages - and takes the first hit.

Cached per preset for the session, so only the FIRST add of a session is slow.
That is exactly the add during which a DM has no reason to believe the button
works, and the button gave no sign it had been pressed.

The button now carries the state: it reads `◐ Adding…` while its own preset
resolves, and every add button on the carousel is disabled until it settles, so
an impatient second click cannot start a second creature. `addingId` holds the
preset id rather than a boolean, so only the pressed card changes label.

The generic `.btn:disabled` rule drops a button to 40% opacity. Applied here it
would have made the busy button *less* visible than the idle one - the opposite
of the signal - so `.bes-add.is-adding:disabled` restores full opacity and
pulses instead.

**Not fixed here: the lag itself.** The probe loop is still sequential and
still the whole delay. Firing all thirty probes at once and resolving in
priority order would cut it to roughly one round-trip, at the cost of a burst
of 404s per preset.

## 11bw. The attack range buffer was never applied (v9.82)

`tokenEdgeDistanceFt` subtracts a flat ~3 ft from the centre-to-centre distance
so two tokens do not have to nearly overlap before a 5 ft melee "reaches". It
has existed since v8.39, is documented, and had a dedicated passing test.

**It had exactly one caller - a display list.** `prepareWeaponAttack` measured
raw centre-to-centre, so two tokens visibly touching could be *"out of reach"* of
a 5 ft weapon while the readout beside them said 5 ft.

| centres apart | 5 ft weapon, before | after |
| --- | --- | --- |
| 5 ft | reaches | reaches (measured 2) |
| 7 ft (a diagonal) | **out of reach** | reaches (measured 4) |
| 8 ft | **out of reach** | reaches (measured 5) |
| 9 ft | out of reach | out of reach |

A 10 ft reach weapon extends by the same buffer (13 ft yes, 14 ft no), and
ranged bands are measured identically. An explicitly supplied `distFt` still
wins, so a replayed attack is unaffected.

### The test that could not have caught it

`range-buffer.test.js` exercised the pure function only - the arithmetic, the
clamp at zero, the behaviour with missing tokens. All correct, all passing,
while nothing in the game called it.

This is the fourth time this session the shape has appeared: a producer with no
consumer, tested in isolation. The file now asserts that the ATTACK agrees with
`tokenEdgeDistanceFt` at several distances, which is the property that matters - the reach ring, the token-to-token readout and the attack must tell the player
the same thing.

## 11bv. Class features expanded (v9.81)

Coverage was uneven - Wizard had **three** features across twenty levels, Druid
four, Cleric three - and two of the grants that did exist were **decorative**.

### Two more grants that nothing read

`CLASS_PROGRESSION` declared `evasion` (Rogue 7) and `martialArts` (Monk 1), and
nothing consumed either. Same defect as Land's Stride the version before: a
feature on the sheet with no mechanical effect.

**Evasion** - `applyEvasion` turns a successful DEX save against an area effect
into *no* damage and a failure into half. It sees the FULL damage, because
halving first and then applying it would quarter a failed save. Gated on the
save being Dexterity and the effect being an area, so a CON save is untouched.
Monk 7 now grants it too.

**Martial Arts** - the monk's die (1d4 → 1d6 at 5, 1d8 at 11, 1d10 at 17) and
its use of Dexterity now reach `unarmedStrikeFor`. The ability is the *better*
of Strength and Dexterity, because the rule is "instead of", not "always
Dexterity"; and the die reads **monk levels**, so a Monk 1 / Fighter 10 punches
with a d4. An explicit `entity.unarmedStrike` still wins.

### Levels filled

| Class | at 20, before → after |
| --- | --- |
| Monk | 5 → 12 |
| Barbarian | 5 → 12 |
| Fighter | 4 → 6 |
| Druid | 4 → 6 |
| Sorcerer | 4 → 5 |
| Cleric | 3 → 4 |
| Wizard | 3 → 4 |

Tiered features use `replaces`, so Brutal Critical, Indomitable and Wild Shape
show one current entry rather than stacking every tier.

### The project's own guard caught the gap

Adding an `indomitable` resource turned *"every resource any class can grant has
an effect entry"* red, naming it exactly. `FEATURE_EFFECTS` now describes it - and says the new roll **must be used**, since a reroll that implies a free retry
is a rules error.

## 11bu. Land's Stride actually works (v9.80)

An audit of Druid and Warlock support found one feature that was **listed and
did nothing**.

`moveBudget` already halves the budget through difficult terrain and already
honours an `ignoreDifficult` trait. But `movementTraits` read that trait only
from a structured `moveTraits` object or from ability PROSE - never from a class
feature. So a Circle of the Land druid at level 6 had Land's Stride on the sheet
and still paid double.

Both places with the feature were affected: **Druid** (Circle of the Land, 6) and
**Ranger** (8). Each now carries `grants: { ignoreDifficultTerrain: true }`, and
`movementTraits` folds `resolveProgression(entity).grants` in beside the other
two sources.

The gates are real: not before level 6, not for Circle of the Moon, not for a
druid with no circle chosen, and not for any other class. The prose fallback
still works for imported creatures, and an explicit `moveTraits.ignoreDifficult:
false` still wins.

### What the same audit found to be fine

- **Circle of the Land** otherwise resolves correctly - selecting it grants
  Natural Recovery (2) and Land's Stride (6); Circle of the Moon grants Combat
  Wild Shape instead.
- **Warlock Pact Magic** is correct: a level 5 warlock has 2 slots at level 3,
  and `spellSlotsMaxFor` is empty because pact slots are a separate pool.
- Druid has 15 spells on its list, Warlock 13.

## 11bt. Six iconic spells and their mechanics (v9.79)

Counterspell, Shield, Misty Step, Haste, Dispel Magic and Guidance were all
missing. Between them they need four things the library had never expressed.

### Reaction casting

`castingTime.type: 'reaction'` with a stated `reactionTrigger`. The economy
service already understood it - `castingTimeEconomyPatch` spends the reaction
and not the action - so Shield and Counterspell needed data, not code. A test
asserts no reaction spell exists without a trigger, since one would be unusable.

Misty Step likewise spends the **bonus** action.

### Teleportation

`teleport: { rangeFt, self, requiresSight, requiresUnoccupied }`. The movement
engine already had `teleport` as a mode costing no movement and provoking no
opportunity attack, so the spell describes a movement the engine can already
perform.

### Interrupts with a level threshold

`interrupt: { kind, autoBelowLevel, checkDc, checkAbility, scalesWithSlot }` - Counterspell against a cast, Dispel Magic against an ongoing effect. Both record
`scaling.autoBelowSlotLevel`, so a higher slot raises the automatic threshold.

### Granted bonuses, and the opt-in case

`grantsBonus` covers Shield (+5 AC until the start of your next turn) and Haste
(+2 AC, doubled speed, DEX save advantage).

**Guidance is the interesting one.** It is a d4 the holder adds to ONE ability
check before the spell ends, and *choosing when* is the whole decision. A
modifier that applied itself to the next check would spend the spell on the
player's behalf.

So `makeRollModifier` gained an `optIn` flag, and the collection boundary split
in two:

| | |
| --- | --- |
| `collectRollModifiers` | everything that could apply |
| `offeredRollModifiers` | the opt-in ones, shown to the player as a choice |
| `activeRollModifiers(…, accepted)` | applies non-opt-in always, opt-in only when armed |

Bless still applies automatically and is **not** offered as a choice; Guidance
waits. Each roll row in the roll surface carries an arm/disarm chip, held per
roll (`${option.id}:${modifier.id}`) so arming it for a check does not spend it
on a save, and a spent one-shot is disarmed everywhere afterwards.

`performRoll` reports `usedModifierIds`, so the caller can consume a once-only
bonus - and reports nothing when the player declined.

## 11bs. Automatic criticals against a helpless target (v9.78)

5e: *"Any attack that hits an incapacitated creature is a critical hit if the
attacker is within 5 feet of it."*

### The mechanic already existed

`CONDITION_RULES` carries a `crit: { withinFt: 5 }` clause, `conditionProfile`
merges it, and `prepareWeaponAttack` sets `attack.nat20` so `withCrit` doubles
the dice. Paralyzed and Unconscious worked correctly throughout.

**Petrified was missing the clause** - the only one of the three without it - so
a petrified creature took ordinary damage from a blow that should have been
doubled. That is the whole fix: one line in the condition table.

### What was deliberately left alone

- **Stunned** is Incapacitated but grants **advantage only** in the 2014 rules,
  not an automatic critical. A test pins that, because *"every incapacitating
  condition auto-crits"* is the obvious wrong generalisation.
- **Prone** grants advantage in melee and is not incapacitating. A control that
  adds the crit clause to Prone turns three tests red.
- The rule is about **reach, not weapon**: a ranged attack from within 5 ft
  crits; a paralyzed target shot from 30 ft does not.

### The matrix caught it

`conditions-matrix.test.js` failed with *"uncovered condition clauses:
Petrified.crit"* the moment the clause was added - a pre-existing guard
requiring every clause of every condition to be claimed by a named test. It did
exactly its job, and the fix is not complete until a test claims the new rule.

## 11br. The HUD reflects the sheet's states (v9.77)

The sheet gained staged editing (v9.58, v9.71) and one-click rolls (v9.76). The
HUD - the one surface a player always sees - knew about none of it.

That was not merely cosmetic. `draft` lives inside `EditMySheetModal`, so a
player could stage six spell changes, close the sheet, and have **no surface
anywhere** showing that unsubmitted work existed.

### Unsaved changes are now visible

The HUD shows *"3 unsaved changes"* whenever a draft is dirty, **including after
the sheet is closed**. It is a button that reopens the sheet on the Build tab.

A conflict escalates rather than blending in: different styling, the clashing
field named in the tooltip, and - per v9.71 - wording that does not claim to
know who made the change.

### Initiative, one tap away

The roll a player reaches for most in combat was two taps behind a modal. It now
sits in the vitals row with its modifier shown, and uses **`rollOptionsFor`** - the same model the sheet's roll surface uses - rather than its own arithmetic. A
control asserting the source catches a second implementation.

### Status lifted, draft not

Only the *status* is lifted: `onEditStatus` reports `{ sheetMode, dirtyCount,
conflicts }` upward and clears on unmount, so a stale count cannot linger. The
draft stays in the modal - moving it would have touched 26 call sites for no
gain here, and a test asserts it did not move.

## 11bq. One-click player rolls (v9.76)

Every modifier a player needs was already computed - `skillCheckMod`,
`savingThrowMod`, `abilityCheckMod` - and displayed as a number you could not
click. The only routine route was **"Request Check"**, which asks the GM to roll
on the player's behalf, so a player could not make their own Perception check
without interrupting someone.

### One model behind every button

`rollOptionsFor` returns 32 rollable things - six checks, six saves, every
skill, initiative - each carrying:

- the **final modifier**, shown before the roll
- a **source-attributed breakdown**: ability, proficiency, expertise, half
  proficiency, equipment, feat
- the **passive score** (10 + modifier)
- the advantage the *rules* already give

A test asserts the breakdown parts sum to the modifier, and that the modifier
equals the app's own calculator - so the surface cannot drift from the sheet.

`performRoll` uses `resolveD20`, the universal resolver, with an injectable
`rng` so tests pin the die rather than sampling.

### Permissions

Public and **GM-only** rolls; a GM-only roll is whispered rather than posted.

Manual advantage appears **only** where `playerManualAdvantage` is set, and a
forbidden request is ignored rather than honoured. Where it is not allowed the
surface says *"advantage follows the rules"* rather than silently omitting a
control. A manual advantage cannot erase a rules disadvantage - they cancel, as
they should.

DM-requested checks are untouched; they are simply no longer the only route.

### Two shapes I had to look up

`combineAdvModes` takes the **short** forms (`'adv'`, `'disadv'`) and *returns*
the long ones (`'advantage'`). Feeding its output back in silently yields
`'normal'`, so a permitted manual advantage did nothing. Normalised at the
boundary rather than changing a function twenty other callers use.

And advantage lives in **`tempEffects`**, not on the condition list:
`entitySaveAdvMode` reads only `tempEffects`, and
`conditionProfile('Restrained').saves.disadvantage` is an empty per-source map.
My first tests asserted "Restrained disadvantages a DEX save" - a rule this
engine does not implement there - and would have been three green tests
describing fiction.

## 11bp. Modernized built-in presets (v9.75)

All 152 built-in presets predated the structured systems: every one carried a
scalar `speed` and free-text `abilities`, and **not one** had `speeds`, a
`sizeCategory` or a `spellbook`. Their mechanics lived in prose, so a creature's
fly speed existed only if a runtime path happened to re-parse the English at
spawn time - and the paths did not agree.

### Build-time enrichment, not runtime parsing

`tools/enrich-presets.js` reads the prose **once** and writes canonical fields
into `game-data.js` as a generated `PRESET_MECHANICS` merge table. The authored
stat blocks are untouched; the diff shows only mechanics.

It reuses the app's own parsers - `deriveSpeeds`, `parseAttacksFromAbilities`,
`WEAPON_PRESETS`, `STANDARD_SPELLS` - rather than reimplementing them, so the
build and any legacy import cannot disagree about what a stat block meant.

| | |
| --- | --- |
| presets | 152 |
| structured movement | **152** |
| with alternate speeds | 79 |
| structured size | 38 |
| structured weapons | 82 |
| using the shared weapon library | 0 (see below) |
| structured spellbooks | 0 (see below) |
| manual overrides | 0 |
| reported unconverted | 6 |

Weapon and attack ids are **deterministic** (`wpn_bnb_robin_dive_peck`), so a
rebuild produces no diff and tests are stable. A test asserts no built-in id
looks generated.

### The size trap

Sizes appear in a tag line - `Flying | Medium | CR 1/4` - but the same words
appear in *"Carrying Capacity: 1 Small creature or 75 lbs."*, which describes the
**load**. Matching that would have labelled Medium birds Small. Anchoring on the
pipe-delimited tag avoids the whole class of error, and a test asserts carriers
are not sized from their capacity.

### Validation in the pipeline

`tools/validate-presets.js` runs in `pretest` beside the spell check and fails
on: missing or invalid movement, unsupported movement keys, legacy `speed`
drifting from `speeds.walk`, malformed weapons or attacks, duplicate ids,
unresolved spells, invalid sizes or ability keys, and `NaN` anywhere in the
structured data. I confirmed it catches each by injection rather than assuming.

## 11bo. The combat HUD follows the theme (v9.74)

`.combat-hud` used `var(--panel, #23232b)`. **No theme defines `--panel`**, so
the fallback always won and the HUD stayed dark under all twelve themes while
everything around it changed.

Theme propagation was never broken - `data-theme` is set on the root and the
rest of the app responds. This was a token-contract bug.

### Undefined tokens found

| Token | Uses | Fixed by |
| --- | --- | --- |
| `--panel` | 3 (HUD, mobile drawer, mobile nav) | `var(--bg-1)` / `var(--bg-0)` |
| `--panel-2` | 3 | `var(--bg-2)` |
| `--line` | 2 | `var(--border)` |
| `--ink-soft` | 2 | `var(--ink-dim)` |
| `--danger` | 27 | now defined as `var(--blood-bright)` |
| `--mono` | 2 | now defined |
| `--mobile-nav-h` | 4 | now defined as `56px` |

`--mobile-nav-h` is the one worth noting: it had **no fallback**, so
`bottom: var(--mobile-nav-h)` computed to nothing and the mobile map ran under
the nav bar. Mine, from v9.42, and found only because the test enumerates rather
than checking the tokens the brief listed.

### Hard-coded HUD colours replaced

`#c9a34a → --gold`, `#b43c3c → --blood-bright`, `#6a9e5a → --emerald`,
`#c8a03c → --amber`, `#8fd3ff → --azure`, `#7ac07a → --emerald`,
`#e07a7a → --blood-bright`, `#d9a05a → --amber`, plus the `.hud-hp-text` and
`.hud-stat-value.blocked` states.

Two muted surfaces were `rgba(255,255,255,0.05)` - a white wash that assumes a
dark base and disappears on a light theme. Both now use `var(--bg-2)` with a
`var(--border-soft)` edge.

Every replacement token is defined by **all twelve** themes; a test asserts that
count rather than merely that each exists.

## 11bn. The DM's placement preview (v9.73)

`RequestPlacementMap` resolved the map and then **never drew it** - only the
grid, the neighbours and the crosshair. And an unknown `mapId` made it
`return null`, taking the crosshair with it: the DM lost every piece of
positional information because of a field they cannot see.

The host made that state reachable by storing whatever `mapId` the client sent
without checking the map existed.

### The crop

The map image renders at **natural size** on the real canvas, so world
coordinates are image pixels 1:1. The preview frames a 60 ft window around the
requested point and applies

```
scale(size / span) translate(-minX, -minY)   with transform-origin 0 0
```

to the artwork - the *same* numbers the SVG's `toPx` uses for the neighbours and
the crosshair. One transform, so the three cannot drift apart. A test restates
the arithmetic independently and checks a token 5 ft east lands 5 ft of box to
the right of centre.

### Nothing blanks the preview

| Condition | Result |
| --- | --- |
| unknown `mapId` | falls back to the current map |
| no maps at all | grid + crosshair + *"map unknown"* |
| map with no image | grid + crosshair + *"no image"* |
| image fails to load (`onError`) | falls back to the grid, keeps the crosshair |
| unhydrated `IMG_SENTINEL` | treated as no image |
| no coordinates | renders nothing, as before |

The crosshair is drawn **twice** - a dark casing under a bright line - so it
reads against artwork of any brightness.

The host now resolves `mapId` against the real map list, falling back to the
current map and refusing only when the table has no maps at all. Ownership and
coordinate validation are untouched, as are the accept and reject paths.

## 11bm. Player area spells use the area lifecycle (v9.72)

The area branch of `adjudicateIntent` converted the creatures caught by the area
into `targetIds` and dispatched a generic `SPELL_CAST`. That sent an AoE through
**targeted** resolution and bypassed the area lifecycle entirely - no
`SpellAreaResolver`, no template, no per-target queue.

### The lifecycle, restored

```
player confirms → areaRevalidate → SPELL_CAST (pays once)
                                 → AREA_RESOLVE_SET
                                 → pendingAreaResolve → SpellAreaResolver
                                 → SPELL_TEMPLATE_SET → tokensInSpellArea
                                 → buildSpellTargetAttack → ATTACK_SET → reducers
```

`SPELL_CAST` remains the single authoritative place resources are spent, and now
carries **no `targetIds`**. The resolver decides who is caught from the host's
geometry, so a forged `clientAffected` cannot reach resolution by any route - it
is used only to report a correction.

### Three bugs on the same path

**The cast level was dropped.** The request sent `slotLevel`;
`prepareSpellCast` reads **`castAtLevel`**. An upcast Fireball paid for a level 5
slot and rolled base 8d6. A test pins both field names so the mismatch cannot
return silently.

**Library spells were not found.** `SpellAreaResolver` and the legacy
`cast_area` handler matched on `id` only, and a library spell has no `id` - the
resolver fell through to `areaSpells[0]`, resolving whatever area spell happened
to be first in the book. Both now accept id **or** name.

**The resolver never scaled.** It now scales with the authorized level
(`scaleSpell(spell, { slotLevel, casterLevel })` - an options object, not a bare
level) and builds damage from the scaled copy: 8d6 at level 3, 10d6 at level 5.
Area *geometry* still uses the base spell, since size does not scale.

## 11bl. Staging multiple spell edits (v9.71)

Four faults, all introduced with the draft model in v9.58.

### 1. Editable controls rendered from the authoritative entity

Edits stage into `draft.changes`, but `SpellManager` read `entity.spellbook`. So
the second edit computed its new list from one that did not contain the first,
and **replaced** it:

```
live [Magic Missile] → add Fireball → draft [MM, Fireball]
panel still shows [MM] → add Mage Armor → draft [MM, Mage Armor]   ← lost
```

`draftProjectedEntity(entity, draft, sheetMode)` is the canonical editable
representation, and **every** build control now receives it - SpellManager,
InventoryManager, ProficiencyManager, ArmorManager, AbilityScoreBlock - since
they all had the same defect. Only staged fields are projected, so an untouched
field still reads through and a real change to it is still seen.

The authoritative entity is never mutated; a test asserts that.

### 2. The library's Add button read the same stale list

`SpellLibraryModal` derives selection from the panel's `spells`, which is now
projected - so a staged add flips the button to **✓ Added** and disables it with
no round trip, and removing the pending spell returns it. No new local state was
needed; the projection was the whole fix.

### 3. Submissions rebased on stale data

`submitDraft` did `makeSheetDraft(entity.id, entity)` immediately after sending,
when `entity` still held the pre-submit state. The authoritative echo of the
player's **own** change then looked like someone else's edit.

`draftRebasedAfterSubmit(draft, entity, submitted)` bases the new draft on the
values just sent (Option A). Fields that were only **requested** are not rebased - the GM has not applied them, so the live value is still correct.

Detection is untouched: a control disabling it fails. A genuine concurrent
change after a rebase is still caught.

The warning is now neutral - *"spellbook changed while you were editing"* - because nothing here knows who changed it, and the commonest cause was the
player's own echo.

### 4. Permissions consulted `state: null`

`writeCtx` passed no campaign state, so `canPlayerWriteField` fell back to
defaults and could disagree with the host on a table with customised
permissions. `campaignState` is threaded from `PlayerInterface` into the sheet.

## 11bk. Movement rings for DM-controlled creatures (v9.70)

`moveMarker` refused to draw for anything but a PC or Familiar. That rule exists
to keep monster speeds off the **player** map - but `MapCanvas` is shared, so it
blanked the ring for the DM too.

Movement *locking* already worked for those creatures, so the DM was clamped by a
budget they could not see.

### The rule is about the viewer

| Viewer | PC / Familiar | Monster / NPC / Neutral Beast | Object / Label |
| --- | --- | --- | --- |
| player | ring | **no ring** | no ring |
| dm | ring | ring | no ring |

`ENTITY_TYPES` has seven members, so this is an **allow-list** rather than a
`mode === 'dm'` pass: an Object or a map Label taking a turn has no movement to
draw, and a ring round a crate is noise. A control removing the allow-list rings
an Object and turns two tests red.

The ring already read `moveBudget(ent, movement)` - the same function the drag
clamp uses - so there is still exactly one calculation. A test asserts the drawn
radius equals `moveBudget().remainingFt` at several spend levels, so the ring and
the restriction cannot disagree.

### A shadowed name

`moveMarker`'s closure declares a local `mode` for the *movement* type
(walk/jump) which shadows the `mode` **prop**. Reading the prop directly threw
`Cannot access 'mode' before initialization` and turned 73 tests red. The viewer
mode is captured as `viewerMode` outside the closure.

## 11bj. The Initiative panel had no position (v9.69)

The button worked, the state updated, and `PlayerInitiative` mounted - the v9.57
test asserting exactly that passed the whole time.

`FloatPanel` is `position: absolute`, and `.init-float` defined only `width` and
`max-height`. With no `top` / `left` / `right`, the panel was laid out at the
container's origin and clipped by `.canvas-container`'s `overflow: hidden`. It
rendered perfectly, off-screen.

It was the **only** `FloatPanel` in the app without a position; the other twelve
all pass `style={{ right: 16, top: 80, ... }}`. This one now does too, so it sits
where the DM's panels sit rather than somewhere new.

Below 420px a 300px panel anchored 16px from the right can sit part-way off a
phone, so a media query spans it `left: 8px; right: 8px` with a scrollable
`60vh`. The shared `max-width: calc(100vw - 16px)` guard is untouched.

Toggling, dragging, the dialog role and initiative state are all unchanged.

### The generalisable guard

A test now scans every `<FloatPanel>` in the source and fails any that has
neither an inline anchor nor a positioned class - a vertical **and** a
horizontal edge. Breaking any panel's anchor turns it red, not just this one's.

## 11bi. Draining the attack queue (v9.68)

v9.67 built a queue for multi-target spells and **nothing ever read it**. The
first dart resolved; the rest sat in `state.attackQueue` forever. Building a
queue is not the same as draining one, and I shipped it as a known gap rather
than finishing it.

`ATTACK_CLEAR` now promotes the next cinematic when one is waiting, which is how
the area-spell queue already behaved. A targeted clear for a different id still
changes nothing, so clearing the wrong cinematic cannot skip a target.

Draining spends **no further slot or action** - a test asserts the slot count
after all three darts of a Magic Missile.

### Dice ownership, verified rather than assumed

The cinematic carries what the EXISTING handlers need, so no second dice UI was
introduced:

- a weapon or spell attack names `attackerId`; `attack_rolltohit` checks
  `ownedByPeer(...).has(atk.attackerId)` and only flips `rolled` - the d20 is
  already the host's, and a test asserts the reveal contains no `Math.random`
- a save spell carries `effect.save.dc` and `.ability`; `attack_save_roll`
  checks the **target's** owner, so a caster cannot roll their victim's save
- an auto-hitting spell asks for neither
- a hand-entered roll (physical-dice mode) is clamped to 1-20

Each of those is pinned by a negative control, including two that simulate a
privilege failure: revealing another player's roll, and rolling the target's
saving throw as the attacker.

## 11bh. Player combat resolution (v9.67)

Three faults, each letting a player spend a resource and see nothing happen.

### 1. The unarmed strike could not be prepared

`attackOptionsFor` offered `__unarmed`; `prepareWeaponAttack` looked the id up in
`attacker.weapons`, where it cannot exist. Always *"That weapon is not
equipped."*

`unarmedStrikeFor(entity)` is the one canonical representation and
`resolveWeaponFor` the one resolver every path uses. The strike is **not
improvised** - marking it so would strip proficiency - uses Strength, reaches
5 ft, and deals `1 + STR` bludgeoning. `entity.unarmedStrike` is the override
point for Martial Arts and similar.

`weaponDamage` also had to stop forcing `count || 1`, which turned the strike's
flat 1 into a `1d4`.

### 2. Two rolls, and no cinematic

The adjudicator called `prepareWeaponAttack` (rolling a d20 and reporting hit or
miss), then dispatched `WEAPON_ATTACK`, whose reducer **re-prepared from the
same request and rolled again**. The intent could say "hit" while the log said
"miss".

And the reducer only spent resources and logged. It never created
`activeAttack` - so no cinematic, no "Roll to hit", no damage. That is why player
attacks appeared to do nothing.

The host's plan now travels on the action, marked `__hostPlan`.
`buildWeaponAttackCinematic` converts that same plan into the existing
`ATTACK_SET` payload, so the roll the player was told about is the roll the
cinematic shows. **A plan without the host's mark is ignored and re-prepared** - a client cannot supply a trusted plan.

HP is untouched here: damage stays with the cinematic and the DM's controls.

The result metadata was corrected too. It claimed `{ kind: 'entity', field: 'hp' }`
for a reducer that never touched hit points, and announced hit or miss from a
roll the cinematic then re-made. It now reports the economy change and the
active attack, and says *"roll to hit"*.

### 3. Targeted spells discarded their targets

`commitSpellCast` spent the slot, the action and the materials and **never
looked at `targetIds`**. `resolveTargetedSpellCast` routes them through the
existing `buildSpellTargetAttack`: attack and save cases become cinematics,
direct effects go through the central HP and condition reducers. Several targets
form a queue, resolved one at a time, on **one slot and one action**.

The plan's field is `scaledSpell`, so an upcast resolves with its scaled dice.

## 11bg. The Cast button dead end (v9.66)

A player picked Magic Missile, picked a slot, reached review - and Cast was
permanently grey.

### Fault 1: the review screen offered an action it could not enable

The stage order was already right (`pickSpell → pickSlot → review → target →
confirm`), but **review rendered the final Cast button** while `canConfirm`
required targets that could only be chosen at the *next* stage. The button that
would have advanced was the button that was disabled.

At `review`, a spell that needs targets now shows **"Choose targets"**, enabled
when the cast itself is legal, and advances. A spell that needs none still shows
Cast, so a targetless spell is not sent into a targeting dead end.

### Fault 2: two targeting contexts, and the wrong one validated

CastFlow held a local `ctx` and received the workflow's `targetingCtx`. The
target list read `targetingCtx || ctx`; **validation and the payload read
`ctx`**. A target clicked on the map appeared in the list, was ignored by the
Cast button, and never reached the payload.

One `activeCtx = targetingCtx || ctx` now feeds the list, `targetingStatus`, the
enable/disable decision and `targets:` in the payload. A test asserts no
consumer reads the local context directly.

### Fault 3: the spell picker seeded no context

`pickSpell` opened the workflow without dispatching `UI_WORKFLOW_TARGETING`,
which every other entry point does - so a spell chosen from the picker had no
shared context and map clicks went nowhere.

### And stale state on upcast

Changing slot or mode rebuilds the local context, because upcasting changes how
many targets are allowed and a stale selection may exceed the new limit.

**Validation was not weakened.** A control that force-enables Cast
(`canConfirm: !!review?.canCast`) turns two tests red.

## 11bf. The intent pipeline was never connected (v9.65)

### Root cause

`SyncManager`'s constructor **omitted `onPlayerIntent` and `onIntentResult` from
its destructured parameters** and hardcoded both instance properties to `null`:

```
constructor({ mode, onStateUpdate, onPlayerAction, /* ...both missing... */ }) {
  this.onPlayerIntent = null;   // supplied by the caller, thrown away
  this.onIntentResult = null;
}
```

Every other callback was stored from its argument. These two were passed at the
call site and silently discarded.

The DM therefore received `player_intent` messages and dropped them on a null
optional-call, and players never received a result. **Every player-originated
action died at the same point**, which is why movement, casting and end-turn
failed together while the reducers worked when invoked directly - and why the
symptom looked like several unrelated rule bugs.

Both are now destructured and stored, guarded with a `typeof` check so a
non-function becomes `null` rather than throwing on the first message.

### A second bug: the reconnect replay could never run

```
if (syncStatus !== 'connected') return;
```

`setStatus` only ever emits **offline, connecting, live, error**. `'connected'`
is not a status this project has, so the condition was always true and **nothing
was ever replayed** after a reconnect - an intent sent while the link was down
stayed pending until it expired. It now tests for `'live'`, with a test
asserting `'connected'` is still not emitted anywhere.

### A third, already fixed

`sendIntent` returns `false` when the client is not in player mode or the DM
connection is closed. Callers ignoring that was fixed in v9.60 (`sendIntent`)
and v9.64 (`submitWorkflow`); both are now pinned by tests here.

### Why this hid for so long

The tests exercised `adjudicateIntent`, `processIntent` and the reducers
directly - all of which were correct. Nothing drove a message **across the
transport**. `tests/sync-pipeline.test.js` now joins two `SyncManager` instances
through a stand-in for the peer link and runs the whole path: player →
`sendIntent` → wire → `onPlayerIntent` → adjudicate → apply → result →
`onIntentResult`.

## 11be. The optimistic position was never drawn (v9.64)

Movement still snapped back after v9.63, and the range readout never changed.

### A producer with no consumer

`optimisticTokenPos` and `optimisticMovementUsedFt` have existed since **v9.51**
and **nothing ever called them**. The map built its token list straight from
`state.tokens`, so a move showed nothing until the host's broadcast arrived.

Holding the preview longer (v9.63) could not possibly help while nothing drew
it. I wrote the producer, tested the producer thoroughly, and never checked that
anyone consumed it - `grep -c` would have found this three versions ago.

The map's memo now applies the ghost position (and depends on the tracker, so it
re-runs), and `MovementFlow` subtracts pending movement from the readout.

### And a hang one layer above the fix

v9.60 made `sendIntent` mark an unsent intent `__unsent` rather than pretending
it was pending. But `submitWorkflow` **marked the workflow pending anyway**, so
the "waiting for the table" spinner survived for casting and every other
workflow submission. It now reports the failure instead.

### A test for the class of bug

*"Every optimistic selector is consumed somewhere"* counts call sites and fails
when a selector has only its own definition. **A producer nobody calls is
indistinguishable from a missing feature, and passes all of its own tests.**

## 11bd. The move snap-back (v9.63)

A player walked in combat, the token moved, and then jumped back.

### The move was never the problem

The adjudication accepted it, the host applied `MOVE_TOKEN`, and the token
really moved - all verified before changing anything. The fault was **ordering
on the client**.

`INTENT_RESULT` set `previewApplied: false` for *every* status, acceptance
included. The result arrives on its own message, **ahead of the state broadcast
that carries the move** - so between the two, the optimistic ghost was gone and
the authoritative token had not moved yet. That gap is the snap. It was
guaranteed on every accepted move and longer on a slow link.

### Hold, then reconcile

A **refusal** still rolls back at once: the move did not happen and the token
must return immediately.

An **acceptance** now holds the preview, and `INTENT_RECONCILE` - dispatched
whenever `state.tokens` or `state.entities` changes - drops it once the
authoritative state **agrees** with it. Removing a ghost the real token has
caught up with is invisible, which is what makes holding it safe.

The two halves only work together: holding without reconciling leaves a
permanent ghost, and reconciling without holding changes nothing. A control
disabling either turns tests red.

### The test that describes the symptom

*"There is no window where BOTH are at the old position"* walks the frames - submitted, answered, reconciled - and asserts none of them renders the token
back at its start. That is the snap stated as a property rather than as a
sequence of implementation details.

## 11bc. A visible build marker (v9.62)

Beta testers reported two issues - the level field and the roll animation - that
were **already fixed in v9.61**. Both were implemented, documented and covered
by 27 passing tests before the report arrived.

I verified that before changing anything: rendered `NewCharacterBuilder` with a
DM-supplied pool and confirmed no value appears before rolling, and confirmed
the stepper's 44px buttons and `inputMode="numeric"`. The code was right.

**Neither the testers nor I could tell which build they were running**, because
nothing in the interface said. That is the actual defect this round, and it
nearly cost more than a round trip: the obvious response to a bug report is to
change the code, and changing working code on the strength of a stale report is
how a fix becomes a regression.

`APP_VERSION` now sits beside the app name in every interface, titled *"Build
version - quote this when reporting a problem"*. A test asserts it is at least
as new as the newest version documented in this file, so shipping without
bumping it fails the suite.

## 11bb. Character creation on a phone (v9.61)

### The level field fought the player

A bare `type="number"`: spinner arrows a few pixels tall on a phone, and
clamping on **every keystroke** - so clearing the box to type "12" snapped it to
1 the moment it was empty.

It is a stepper now, with 44px buttons, `inputMode="numeric"` for the right
keypad, and the text kept separate from the committed number so a half-typed
value survives. Clamping happens on **commit**, not while typing.

### The DM's roll was handed over, not revealed

When the DM pre-rolled the pool, the six values appeared as plain text - a
character's abilities delivered with no moment at all. `RollSlot` now takes a
`reveal`: the total is **predetermined and authoritative**, but the player still
presses Roll and watches the dice.

`diceForTotal` works backwards from the total to four d6 whose top three sum to
it, because **an animation that does not add up is worse than none** - an
observant player checks. A test reads the dice faces off the rendered component
and asserts they make the number shown.

Assignment now waits until every value is revealed: `allRolled` was true
immediately for a host-rolled pool, so the table appeared before the player had
rolled anything.

## 11ba. Why the beta fixes did not work (v9.60)

Testers reported the **same six issues** after v9.57 addressed them. They were
right, and my fixes were at the wrong layer.

### One root cause under all six

`SyncManager.sendPlayerAction` and `sendIntent` both `return false` when the
connection is not open. **Every caller discarded that.** Worse, `sendIntent`
marked the intent `PENDING` *first* - so the workflow said *"waiting for the
table"* about a message that was never sent, forever.

That single silent `return false` explains casting, moving, placing and every
sheet edit all appearing to do nothing. Both senders now check, report *"Not
connected to the table"*, and - critically - **do not mark an unsent intent
pending**, because there is nothing to wait for.

I had been fixing symptoms one layer above this.

### The refusal was delivered somewhere nobody looks

Adding a spell in play mode *is* correctly refused, and the host replies with a
**chat message** - which a player on the Spells tab never sees. So "Add" looked
inert.

Two changes: the **build tabs put the sheet in edit mode**, because that is what
those tabs are for; and the spell panel now asks `fieldIsEditable` **before**
sending and shows the reason inline. A control that can only fail should say so
where the player is looking.

### The GM now sees the spot

v9.57 added coordinates to the placement summary - *"at 10, 0 ft"* - and testers
still had to do rough maths against a map elsewhere. `RequestPlacementMap` draws
a 60 ft window around the requested square with a 5 ft grid, the surrounding
creatures, and a crosshair. Approving on trust was the complaint; a picture is
the answer.

### A lesson about layers

Five of the six reports had a plausible per-feature cause, and I fixed five
plausible per-feature causes. The actual fault was one shared transport
returning `false` into a void. **When several unrelated features all "do
nothing", suspect the thing they share before fixing them separately.**

## 11az. Live resource controls (v9.59)

### A security bypass

The host read **`raw.money`** - the *unfiltered* patch - and wrote it back into
`patch` **after** `filterPlayerPatch` had already refused it. Money is a build
field, so a player in play mode could set their purse to anything by sending a
patch the filter had thrown away. A refusal that refuses nothing is worse than
no filter, because it reads as protection.

It now uses the filtered patch, and a test asserts **no field anywhere** is read
from `raw` after filtering.

### Controls that looked functional and did nothing

Hit points, temporary hit points, spell slots and concentration all wrote
through `onField` - a generic patch the host **refuses** for live fields. Each
now uses its dedicated transaction:

| Control | Transaction |
| --- | --- |
| current HP | the HP pipeline, with **no generic fallback** |
| temporary HP | `player_temp_hp` (takes the higher value; never stacks) |
| spell slots | `player_spend_slot` |
| hit dice | `player_spend_hit_die`, applying pool and healing **atomically** |
| features | `player_feature_use` |
| conditions, concentration | `player_condition` |
| restoring a slot, long rest | a **request** - a player cannot refill unilaterally |

Spending a hit die previously sent the pool and the hit points in one generic
patch: the host refused the `hp` half and applied the pool, so **the die was
spent and no healing arrived**.

### Three op names that did not exist

`player_use_slot`, `player_use_feature` and `player_hit_die` were invented at
their call sites; the host implements `player_spend_slot`, `player_feature_use`
and `player_spend_hit_die`. `player_use_slot` had been dead since v9.49. A test
now cross-checks **every op the sheet names against the host's table**.

### The source guard

A test walks the source for `onField({ <live field>: … })` - including inside a
spread - and fails with the field name and line number. It is what caught max
HP writing the whole `hp` object, and the hit-die pool-plus-HP patch.

## 11ay. Play and Edit Build modes (v9.58)

### The modes existed and the sheet used neither

`sheetMode` and `canPlayerWriteField` have been in the state model since v9.08.
v9.57 papered over the gap with a hidden `sheetEditMode` constant pinned to
`true` - **worse than having no modes at all**, because the model claimed to
have them while every build field was writable with no way to turn that off.

There is a visible switch now, defaulting to **Play**: a sheet that opens in
edit mode invites accidental build changes.

| Mode | Live fields | Build fields |
| --- | --- | --- |
| Play | dedicated transactions (`player_hp`, `player_condition`) | read-only, with the reason |
| Edit Build | still dedicated - live state is never a build field | editable, request-only, or denied |

### One permission function, three outcomes

`canPlayerWriteField` returns **allow**, **request**, or **deny** per field, and
both the sheet and the host call it. A test asserts the UI's partition and the
host's filter agree on exactly which fields are writable - the sheet must never
render a control whose write is destined to be refused.

`requestMode` was a **parallel model**: a boolean deciding whether edits became
requests, sitting beside a function that decides the same thing per field and
knows about denials a boolean cannot express. The function is now the single
source.

### Edits are staged

Sending every keystroke meant a name change was twenty round trips, each a
chance for the host to answer out of order. A **draft** holds them: typing
twenty characters is one staged change, and setting a field back to its original
value removes it from the draft rather than submitting a no-op.

`draftSubmissionPlan` says what submitting will do **before** it is sent - *"2 change(s) applied straight away; 1 sent to the GM for approval"* - and
refuses to submit a draft where nothing can happen.

### Conflicts are surfaced, not silently won

A draft records the **baseline** each field had when editing began. If a GM edit
moves it, `draftConflicts` reports the clash and Submit is blocked until the
player chooses **keep mine** or **take theirs**. Keeping yours re-bases, so the
same conflict is not raised twice.

## 11ax. Beta regressions (v9.57)

Six bugs from beta testing. Two were mine, and both were the same **kind** of
mistake.

### The endless "waiting for the table"

The intent tracker expires a stuck request after a timeout - and **nothing told
the workflow**, so `pendingIntentId` stayed set and the panel span forever with
no way out but Cancel. Introduced in v9.41 when workflows began staying open
until the host answered. The timeout now releases the workflow with a readable
explanation.

### Casting spent no action

`commitSpellCast` matched the spell on `id` only. Library spells carry no `id`,
so the lookup found nothing - and the economy patch, **guarded on `spell`**,
silently never ran. A caster could act again in the same turn, forever.

This is the identical bug fixed in `prepareSpellCast` in v9.45. I fixed one copy
and **missed the other**. A test now asserts *both* lookups accept a name.

### The Initiative button did nothing

I wrapped the panel in `modal-scrim` / `modal` classes that **do not exist in
this stylesheet**, so it rendered unpositioned and invisible. It uses
`FloatPanel` now, and a test checks that **every class the panel names is
actually defined in the CSS**.

### Magic Missile refused a second dart at one target

Each dart is a separate projectile and may strike a creature already chosen - the spell's most common use. `allowRepeatTargets: true`, with a test asserting
three darts cost one slot and one action.

### The GM approved placements blindly

The request summary said only *"wants to place Wren on the map"*. It now reads
*"at 10, 0 ft on The Hollow"* with *"Nearest: Orc 2 ft"*, plus a focus point the
review panel can draw.

### A player could not add spells, items or training

`onField` never sent `sheetMode`, so the host defaulted it to `'play'` and
refused **every build field** - spellbook, items, proficiencies, subclass. The
Add button produced no change, no request and no message.

Subclass additionally needs GM approval, and the refusal named `submit_request`
as the way forward - which the allowlist then **dropped**. `build_change` is now
an accepted kind with a summary naming the field and the new value.

### And no touch route to reposition a token

The `◉ Place` control was gated on `!onMap`, so a phone player could place a
token once and never move it. `⤢ Move` opens the movement workflow, so the
reposition is costed and adjudicated like any other move.

## 11aw. The character sheet, reorganised (v9.56)

### The five tabs mixed subjects

Proficiencies and level progression lived under **Gear** - a player looking for
their backpack found a level-up button. Weapons appeared in **both** Combat and
Spells, so two lists could disagree after an edit. And every character was shown
the monster `StatblockEditor`, offering challenge rating and legendary actions
to a Fighter.

Eight sections now, one subject each: **Overview, Actions, Abilities, Spells,
Inventory, Features, Biography, Edit Build**.

| Moved from | To |
| --- | --- |
| Gear → level progression, background | Edit Build |
| Gear → proficiencies | Abilities |
| Spells → the duplicate weapon list | removed |
| Combat → the monster statblock | guarded on `!isPC` |

A test counts `<WeaponAttackSection` across the whole file and asserts **one**
call site.

### Derived values are shown, never typed

Saves and skills were editable number inputs - figures the rules compute - so a
player could type a bonus the next recalculation would silently overwrite.
`DerivedValue` renders them read-only **with their source**: *"STR +3 ·
proficient +3"*. The ability SCORE stays editable, because that is real data;
the modifier beside it is not.

`FeatureListBlock` lists the features the progression actually grants, grouped
by level with remaining uses - rather than a free-text box a player had to keep
in step with their own level-ups by hand.

### Old tab ids still work

`SHEET_TAB_ALIASES` maps `core → overview`, `combat → actions`,
`gear → inventory`, `story → biography`, so a deep link or saved preference from
before this change opens the right section. `normalizeSheetTab` also resolves
against **what the creature has**, so an alias pointing at a tab a monster lacks
falls back rather than blanking the sheet.

## 11av. Player initiative (v9.55)

### Read-only reuse was the wrong shape

The player was shown the DM's tracker with `dispatch={() => {}}`. The guard is
`mode === 'dm'` at each editable field, so **one missed guard exposes an
editable initiative to a player** - and the no-op dispatch means it would fail
*silently* rather than loudly. A dedicated component cannot have that bug,
because it has no editable field to guard.

### One model, three presentations

`playerInitiativeModel` is pure and player-shaped. The **strip** sits in the
topbar (round, whose turn, End Turn - so a player never has to open a panel to
learn the fight reached them), the **panel** in the initiative modal, and the
**mobile** variant leads the Combat drawer, because *"is it me?"* is the question
a player opens that drawer to ask. A test asserts every variant hides the same
secret combatant.

### What is hidden stays hidden

A secret combatant is **omitted**, so the list is genuinely shorter than the real
order - a greyed row would still reveal how many creatures are in the fight and
when one acts. When a hidden creature is acting, the panel says *"Someone
unseen"* rather than naming them.

**Another creature's roll is never shown.** A player sees their own number and
everyone else's order. Conditions run through `conditionCanSee` with the same
+N overflow as the rosters.

### Accessibility

An `aria-live="polite"` status region announces *"Round 3. It is your turn."* - polite, so it does not interrupt what a screen reader is already saying, and
`sr-only`, so it is not shown twice. The turn sound is **opt-in** and fires only
on your own turn: a chime on every creature's turn is noise, not a cue.

## 11au. Party and foe rosters (v9.54)

### The Party was clickable `<div>`s

No role, no accessible name, no keyboard route - invisible to a screen reader
and unreachable without a mouse. `PlayerPartyPanel` is a **listbox** of real
buttons with a roving tabindex, arrow/Home/End navigation, and a spoken label
per row: *"Wren, yours, taking its turn"*.

Each row offers: select as actor, focus a token, summary, full sheet, place,
whisper. Plus current-turn state, on/off-map state, hit points with temporary
hit points, concentration, and conditions.

### Token scoping, and instances

`tokensForEntityHere` returns a **list**, scoped to the current map. A creature
with two instances gets **two focus controls**, each labelled *"instance 1"* and
*"instance 2"* - the panel never silently picks one. A creature whose only token
is on another map offers **no** focus control at all, rather than one that would
jump somewhere the player cannot see.

### Foes are token instances

Two goblins are two numbered rows. `foeRosterModel` reports distance from the
selected actor, cover, a health **band**, and visible conditions. While a
workflow is targeting, each row becomes a target control judged by
`evaluateTarget` - **the same resolver the map uses**, so the two cannot
disagree. Otherwise Attack and Cast are offered directly.

### Nothing hidden leaks

An invisible token is **omitted entirely**, not listed with its position
blanked - a blanked row still tells the player something is there. Health is
never a number. Conditions run through `conditionCanSee`, so a blinded viewer
is told nothing, and at most three are shown with a **+N** overflow. Your own
conditions are always known to you.

## 11at. Explicit token placement (v9.53)

### A phone player could not place their character

The Party panel offered exactly one route: **HTML5 drag-and-drop**, which does
not fire on touch. The card's tooltip said *"Drag onto the map"*, as though that
were the only way there was.

`◉ Place` is now an explicit button. The map takes the spot via `pointerdown` - which covers mouse, pen and touch alike - and the button is **44px tall below
the breakpoint**, the minimum comfortable tap target. Desktop drag survives as a
shortcut; a test asserts `draggable={isYou}` is still there, because removing it
would trade one exclusion for another.

### Validation is pure, and runs at both ends

`canPlaceToken` answers *may this player place this creature at all* before a
pointer is involved, so the button can be disabled with a reason. It checks
ownership, the current map, whether the creature is already on it, and the
table's `playerTokenPlacement` setting - which the **host re-checks**, so a
client ignoring it cannot place anyway.

`placementPreview` then judges the point: collision against real footprints,
blocking zones, and the map edge. Footprint comes from creature size, so a Huge
creature is refused nearer an edge than a Medium one.

### It goes through the lifecycle

`placement` is a declared payload shape requiring `entityId` and `point`.
Pending keeps the workflow open, acceptance closes it, and a rejection **keeps
the chosen point** so the player can adjust rather than start again.

## 11as. Dock content and unread state (v9.52)

### The tabs held whatever was nearest to hand

Character used `CompactSheet`, Spells a bare `SpellSlotGrid`, and Foes an entire
`RevealedMonstersSidebar` - a **`.sidebar` nested inside the dock**, a layout
container inside a layout container. Four content-only panels replace them, and
a test asserts none renders a `.sidebar` at all.

`PlayerCharacterPanel` shows saves, skills with proficiency marked, features,
proficiency bonus, initiative and passive Perception - and deliberately **no hit
points**, because the persistent HUD above shows those on every tab. A test
asserts the absence.

`PlayerFoesPanel` lists **token instances**. Two goblins are two rows, numbered,
so a player can tell which one they hurt - the old sidebar grouped by creature
type. Health is a **band** (`unhurt` / `hurt` / `bloodied` / `near death`), and a
test asserts exact hit points are not leaked.

The mobile drawer keeps `CompactSheet`: it is compact by design and a phone has
no room for the full panel.

### Unread chat never cleared

`UI_CHAT_READ` existed in the reducer and **nothing ever dispatched it**, so the
badge could not clear once it appeared. Nothing excluded the player's own
messages either, so typing raised your own unread count.

`unreadChatFor` excludes your own messages, messages from your character, and
anything `chatMessageVisibleTo` says you cannot see - a whisper to someone else
is invisible, not unread. `PlayerChatPanel` dispatches `UI_CHAT_READ` only when
`visible` is true, which the dock passes from the active tab.

## 11ar. Movement and direct drag (v9.51)

### The drag bypassed everything

Dragging a token sent a bare `move_token` player action - no intent, no
adjudication - and made **two independent optimistic mutations**:
`TOKEN_MOVE_EPHEMERAL` for the position and `MOVEMENT_USE` for the budget.
Nothing tied them together, so a host clamp could correct one and leave the
other wrong.

### One intent, one reversible record

The drag now sends a move intent carrying a single optimistic record, and the
optimistic position is **derived** from the tracker by `optimisticTokenPos`
rather than written into state. That is what makes rollback automatic: when the
record leaves `previewApplied`, the token is back where it was and the banked
movement is back with it - there is no second mutation to remember to undo.

`optimisticMovementUsedFt` reads the **same records**, so the readout and the
token cannot disagree about how far you have gone.

### One preview, three consumers

The map overlay, the movement panel and the confirm payload all read one
`movementPreviewFor` result. The workflow stores the **accepted** destination as
the pointer moves, so confirming submits somewhere the token can actually go
rather than wherever the cursor happened to be.

### Mode changes are local

A `moveMode` payload patches the workflow and never reaches the host - it is a
UI choice, not a move. It is deliberately **not** a declared payload shape, and
a test asserts that: declaring a local choice as submittable is how it ends up
being submitted.

## 11aq. Spell casting and area commitment (v9.49, v9.50)

### The Spells tab held no way to cast

It was a grid of **slot boxes** - a resource counter. `SpellListPanel` replaces
it: searchable, grouped by level, each group showing slots remaining, each row
showing prepared/known, ritual, concentration, casting time, range, components
and what it targets.

Manual slot adjustment survives as a **correction**, behind a toggle, labelled
*"Casting spends slots for you. Use this only to fix a mistake."* Making it the
primary UI was why the tab had no casting workflow at all.

### Legacy quick casting is gone

Quick cast from the compact sheet set `castTargeting` or `aimingSpell` - two
paths that bypass `castReview` entirely, so a slotless cast or one replacing
concentration produced **no warning**. Every player entry point - sheet, drawer,
radial, spell list - now calls one `openSpellWorkflow`.

### The area workflow carries the whole cast plan

It guessed `castLevel` from the spell's base level and carried **no slot at
all**, so an upcast Fireball was submitted as a level 3 one. A `plan` object now
carries spell, level, mode and slot, and survives while the placement changes - a test moves the pointer after changing the slot and asserts neither is lost.

`clientAffected` still travels, so the host can name what it added or removed.

## 11ap. Complete attack and contest workflows (v9.47, v9.48)

### The sheet's weapon button never attacked

It was labelled **"Use"**, drew a range circle on the map, and closed the sheet.
It is now **⚔ Attack**, opening the attack workflow with that weapon; the range
preview keeps its own **◎** icon and no longer closes the sheet.

### Weapon modes were never offered

`weaponModesFor` returns the real choices - one-handed, two-handed for a
versatile weapon, thrown for a thrown one - and always at least one, so the
control renders the same either way. `weaponAbilityChoices` offers **both**
Strength and Dexterity for a finesse weapon with each modifier shown; the code
previously always took the higher, which is usually right and occasionally not.

### A loading weapon could fire twice

The check read `w.loading` only, so a crossbow declaring `loading` in its
**property list** was never limited. It now reads both, and the limit is per
**action** - so a second attack from Extra Attack is refused too.

### Extra Attack keeps the flow open

An accepted attack with attacks remaining keeps the workflow open with the
**weapon retained** and the target cleared, returning to target selection. The
count comes from the host's `attacksLeft`, computed from the real economy - not
a client guess. With none left, the flow closes as before.

### Contests had no way to choose a target

`ContestFlow` could *receive* a target but opened from the drawer it arrived
with `targetId: null` and could never proceed. `contestStagesFor` now yields
`pickTarget → review → resolved`, plus `pickMode` for a shove and
`awaitDefender` when the defender is player-controlled. A caller that already
knows the target - the radial, a foe's contextual action - skips the picking
stage.

`contestPushOptions` previews the destination and offers **two diagonal
alternates** beside the straight push, marking each legal or not with a reason.
When nowhere is legal it says so plainly: *"the shove succeeds but the creature
does not move"* - which is the rule, and better than appearing to do nothing.

`grappleReleaseInfo` exposes the drag penalty, the grappler's free release, and
the escape action **addressed to the grappled creature**.

## 11ao. Live map targeting (v9.46)

The unified targeting model (v9.29) existed and the map ignored it. `CastFlow`
kept its selection in **local component state**, so a map click could never
reach it; attack targets were confined to a panel list; grapple and shove began
with no target at all.

### The context lives in the workflow

`targetingContextForWorkflow` builds one from **any** targeting flow - attack,
spell, grapple, shove, Help, feature, item - and `ui.workflow.targeting` holds
it. Adding or removing a target updates the list **and** the context together,
so the map, the panel and the keyboard edit one selection.

An area workflow deliberately produces none: it places a point, not creatures.

### The map evaluates through the shared model

`tokenVisualStates` now calls `evaluateTarget` with the workflow's context, so
range, cover, sight, line of effect, allegiance and duplicates are judged
exactly as the confirm step will judge them. A regex test pins that it is the
shared call and not a second implementation.

### Clicking

| Click | Effect |
| --- | --- |
| a valid token | adds it |
| an already-chosen token | **removes** it - how a map-only user corrects a mistake |
| an invalid token | explains why, and **changes nothing else** |

A duplicate is refused unless the spell permits it - several Magic Missile darts
may strike one creature; Bless's three targets must differ.

### Keyboard

While targeting, the arrows cycle **valid targets only** and Enter takes the
focused one. A keyboard player could previously reach a token but had no way to
add it.

### Panel and map are one selection

`CastFlow` used `targetingCtx || ctx`, and its add/remove route to
`UI_WORKFLOW_ADD_TARGET`. Those edits are **local** - a target adjustment is not
a submission and must not enter the intent lifecycle, which a test asserts by
checking no `sendIntent` appears in that branch.

## 11an. Workflow payload contracts (v9.45)

Nothing checked that what a workflow **sends** matches what `adjudicateIntent`
**reads**. They did not match, and one of the mismatches meant a core action had
never worked.

### Movement was broken end to end

The confirm handler submitted `{ kind: 'move' }` - no token, no destination. The
host rejected every confirmed move with *"that token does not exist."* The
payload now carries `tokenId`, `toX`, `toY`, the movement kind, the transaction
version and a client preview summary; the preview is computed **once** and used
by both the map overlay and the payload, so what the player sees is what gets
submitted.

### An area cast carried no spell

Only the placement travelled. It now carries `spellId`, `castLevel`, `mode`,
`slotId`, the full placement and the client's affected token ids.

### `kind` meant two different things

The payload's `kind` names the **workflow**; the contest adjudicator read it as
the **contest type** - so every contest was refused with *`"contest" is not a
contest`*. The contest's own type is now `contestKind`, and the adjudicator
accepts either so an older client is not broken.

### Library spells still had no id

`prepareSpellCast` matched on `id` only. The adjudicator accepted a cast by name
and the reducer then discarded it - the worst of both. Both match on id **or**
name now.

### One identity rule, enforced

| Kind | Addresses |
| --- | --- |
| TOKEN id | a thing on the map: movement, placement, cast targets |
| ENTITY id | a creature: attacker, attack target, contest participants |

`validateWorkflowIdentity` checks every id against real state and names the
error precisely - *"an ENTITY id where a TOKEN id belongs"* - rather than
letting it surface as a confusing downstream refusal.

### Validated at both ends

`checkWorkflowPayload` runs **before** the wire, so a missing field is reported
into the workflow rather than travelling to the host. The host checks the shape
too. `intentActionForPayload` replaces a hand-written kind ladder in the submit
path, so the mapping has one source.

## 11am. The radial's live integration (v9.44)

Four defects, all confirmed before being fixed.

### The disable preference was inert

`radialEnabled(prefs)` worked; the player never passed `prefs`. A player who
turned the radial off still got it.

### `radialPlacement` was computed and discarded

Two lines below it, a legacy clamp recomputed the position - and it knew nothing
about a ring too large for the viewport, so on a short screen the menu pinned to
an edge with segments off screen instead of centring. The clamp is gone.

### The radial had no state of its own

v9.40 derived its subject from `selectedTokenId`, which by then meant the
**acting token** - so every single click popped the menu. The opposite of a
secondary shortcut. `ui.radialTokenId` is now its own slot, and a test opens the
radial on a *different* token than the selected actor to prove the two cannot
be conflated.

### Four ways in, none of them primary

Double-click, touch long-press, the keyboard's **ContextMenu key or Shift+F10**,
and an explicit **⊙ Actions…** button in the HUD. A gesture-only shortcut is
undiscoverable, and a keyboard without a ContextMenu key had no route at all.

### The legacy cast paths are gone

`onCastTarget`, `onCastSelf`, `onCastSummon` and `onCastArea` each did something
different. All four now call one `openSpellWorkflow`, which asks the router
which flow a spell needs - targeted spells reach `CastFlow`, area and summon
spells reach `AreaFlow`, self spells reach `CastFlow` with no target stage.
Parity was verified for each shape **before** the old paths were removed.

### HP and conditions stay inline

They are not workflows and should not be. They remain validated: an HP change
must be a **delta**, so a player cannot write an arbitrary total - a test
asserts the refusal.

## 11al. Token selection reaches the live map (v9.43)

`tokenClickIntent`, `tokenVisualStates`, `tokenAccessibleLabel` and the keyboard
helpers were built and tested in v9.24. **`MapCanvas` used none of them.**
`TokenView` had accepted `a11yLabel`, `tokenStates` and `isFocusable` since then
and nothing ever passed them - so every token rendered with no spoken label, no
visual state beyond selection, and no keyboard reachability.

Worse: the player interface passed **only `onTokenDoubleClick`**. Selecting a
token required a double-click, which is exactly the defect v9.24 set out to
remove - the model was fixed and the call site was not.

### What is wired now

Every player `TokenView` receives its label, its states and its focusability.
The label and states come from the **shared helpers**, and a test compares the
rendered prop against a direct call, so the map cannot compute its own.

`tokenSingleClick` routes through `tokenClickIntent`:

| Intent | Effect |
| --- | --- |
| `selectActor` | select it as the acting token |
| `chooseTarget` | record the target - **and leave the actor alone** |
| `rejectTarget` | say why, rather than ignoring the click |
| `inspect` | move keyboard focus to it |

Double-click survives as an optional shortcut.

### Focus is separate from selection

`ui.keyboardTokenId` is its own slot. Moving the arrows must not change what you
are acting with, or a player could not look around the map without losing their
actor. A test asserts exactly that.

Exactly one token is tabbable, ordered the same way the arrows traverse, so Tab
and the arrow keys agree about where the list starts.

### Touch

`onContextMenu` was gated on `mode === 'dm'`, so long-press - the touch gesture
for "tell me more" - was unreachable for a phone player. It is passed for both
now.

### A control that needed a source check

Injecting an extra `UI_SELECT_OWNED` into the `chooseTarget` branch turned
**nothing** red at first: the actor-survival tests exercise the reducer, and the
handler is a closure the tests cannot call. The defect would have been an *extra
dispatch inside a function nothing reaches*. A source assertion over that branch
now catches it.

## 11ak. Mobile navigation, actually integrated (v9.42)

The nav was mounted in v9.39 - **with all four panel nodes null.** Every drawer
opened empty. The component tests passed because each supplied its own nodes;
nothing checked that the *application* supplied real ones.

That is the original orphan defect one level down: **a live call site is
necessary but not sufficient.** A component can be mounted and still be useless.

### The drawers now carry real content

| Drawer | Contains |
| --- | --- |
| Party | `PartySidebar` |
| Combat | `StickyCombatHUD`, then the active workflow **or** `ActionDrawer`, with End Turn through the HUD |
| Character | `CompactSheet` - **and deliberately no HUD**, which would be two views of the same numbers a tap apart |
| Chat | `ChatPanel` |

`submitWorkflow` and `chooseDrawerOption` were inline in the desktop dock, which
is why the mobile drawer could not be given the same behaviour without
duplicating it. They are now shared callbacks, so the two surfaces cannot drift.

### Escape closes a drawer from anywhere

The nav handled Escape, but only while the **nav strip itself had focus** - almost never, since the player is reading the drawer. An open drawer is now the
`surface` layer of `uiEscapeAction`, so it unwinds after the workflow and before
nothing. Escape on the map does nothing, so it cannot trap the player.

### What was already right

One `MapCanvas`, mounted at all times, with drawers overlaying rather than
replacing it - so viewport and zoom survive. `.panel-toggle { display: none }`
already removed the desktop collapse controls below the breakpoint, and
`.sidebar:not(.mobile-drawer)` already hid the desktop sidebars. Both are now
covered by tests rather than left to chance.

## 11aj. The intent lifecycle reaches every workflow (v9.41)

Four defects, all confirmed before being fixed.

### `workflowPending` was declared and never called

`grep` found exactly one occurrence: the declaration. Nothing set it, so nothing
could disable a second confirmation while the first was in flight.

### A submission was not associated with its intent

`sendIntent` already returned the intent; the return value was discarded. The
workflow now stores `intentId` and **ignores any result carrying a different
one** - so a late answer to an abandoned attempt cannot close the current
workflow. A test drives exactly that sequence.

### The workflow closed before the host answered

`setActiveWorkflow(null)` fired immediately after sending. A rejection therefore
arrived with nowhere to display it, and the player's choices were already gone.

Now only **acceptance** closes a workflow:

| Answer | Effect |
| --- | --- |
| accepted | close, record the authoritative outcome |
| rejected | **stay open, choices intact**, return to the stage that can fix it, show the exact reason |
| corrected | stay open, show requested *versus* applied |
| expired | stay open, and say it timed out - never that the GM refused |

`uiStageForRetry` reads the rejection: a slot problem returns to `pickSlot`, a
range problem to target selection. An unrecognised reason **leaves the player
where they were**, because re-deciding everything to fix one thing is worse than
staying put.

### Success was reported before acceptance

`lastOutcome` is written only from a host answer. A test asserts a workflow that
has merely submitted has no outcome at all, and that only `ACCEPTED` yields an
accepted one.

### Newly routed through intents

`featureUse` and `place` join the existing set. Feature use previously went
through `entity_field` and failed silently when a feature was spent; it now
refuses with *"Second Wind has no uses left; it returns on a short rest"*.
Placement validates through the movement path, so a token cannot be dropped
where a move could not reach - and reports a **correction** when clamped.

## 11ai. One UI state model (v9.40)

`PlayerInterface` held **eleven competing pieces of UI state** in local hooks:
`activeWorkflow`, `castTargeting`, `aimingSpell`, `areaPoint`, `areaAim`,
`movePoint`, `selectedTokenId`, `interactingId`, `workflowPending` and more.
Nothing prevented two being set at once, because exclusivity depended on every
call site remembering to clear the others.

### Ownership

| Value | Owner |
| --- | --- |
| actor selection | `ui.selectedOwnedTokenId` |
| target selection | `ui.selectedTargetTokenId` |
| the active workflow | `ui.workflow` |
| workflow draft data | `ui.workflow.{stage, targets, spellId, weaponId, slotId, castLevel, placement, destination}` |
| pointer position | `ui.workflow.pointer` |
| pending confirmation | `ui.pendingIntentId` |
| every modal, including object interaction | `ui.modal` |
| preferences, draw tools, hover, cursor | local - genuinely per-component |

`castTargeting` and `aimingSpell` are **removed**; both duplicated `ui.targeting`
and each could be set while the other was not. The independent
`selectedTokenId` is gone from the player interface. (The DM interface keeps its
own local selection - a different surface with different rules, and merging them
is a larger change than this prompt asks for.)

### Exclusivity is enforced in the reducer

`UI_OPEN_WORKFLOW` clears the previous workflow, its drafts, targeting and
movement. A test walks a sequence of opens asserting the invariant after every
step; making OPEN *merge* rather than replace turns 3 tests red.

### The pointer cannot outlive its workflow

High-frequency pointer positions are stored on the workflow rather than in a
component, so closing one and opening another cannot carry a stale point across - the bug that let `areaPoint` leak between casts.

### Escape unwinds one layer per press

`pending → workflow → target → actor → surface`. Opening a workflow deliberately
**preserves** the map-level target selection, because the workflow keeps its own
`targets` list and the two are separate layers.

### A bug this found

`UI_MOVEMENT_MODES` and `MOVE_MODE_IDS` had drifted into **two vocabularies**:
the UI knew `'move'` where the rules knew `'walk'`, and the UI list contained
neither crawl, climb, swim nor fly. `UI_BEGIN_MOVEMENT` was **silently refusing
four of the eight real movement modes**. A test now asserts every rules-side
mode is accepted.

## 11ah. Build reproducibility and test truthfulness (v9.39)

Four defects, all confirmed before being fixed.

### 1. The declared runtime was false

`engines.node` said `>=18`. The committed lockfile pins Babel 8, and **23
packages in that tree require `^22.18.0 || >=24.11.0`**. A Node 18 user got a
confusing `npm ci` failure or a build that broke at parse time.

Chosen strategy: **raise the declaration to the truth** rather than downgrade
Babel. `tools/check-engines.js` enforces it as the *first* step of `pretest`, so
an unsupported runtime fails with a sentence naming the cause. Verified at the
boundary: 18.20 and 22.17 rejected, 22.18 and 24.11 accepted.

`tests/build-reproducibility.test.js` walks the lockfile and fails if **any**
package excludes the declared minimum - so the declaration and the lockfile
cannot drift apart again. One test asserts the *old* `>=18` claim would have
failed that check, which is what makes it a regression test rather than a
tautology.

### 2. Registry availability

Every entry in the lockfile resolves from `registry.npmjs.org`; none is a git,
file or link reference. `update-browserslist-db` is a transitive dev-only
dependency declaring no engine constraint, and installs cleanly.

### 3. Totals were hand-maintained and had drifted

One line of the report claimed 2881 tests, another 2336. `npm run report`
now writes the totals block from actual `node --test` output, and **exits
non-zero if any test fails** - it will not print a green summary over a red
suite. A test asserts no hand-typed total survives outside the generated block.

### 4. Components were tested without being mounted

Every component test rendered its component *directly*. That proves the
component works and nothing about whether the application renders it.

**`MobileBottomNav` was built, tested and documented in v9.23 with zero call
sites.** `tests/player-interface-mount.test.js` renders `PlayerInterface` itself
and asserts the required surfaces mount; removing that call site again turns 4
tests red.

Two surfaces are legitimately conditional - `WorkflowHost` renders null until a
flow opens, `ActionDrawer` only on its tab - so they are verified by their call
site and by being *supplied* to the dock, rather than by presence. A call site
that exists but can never fire is the same defect as none.

### The harness gained a DOM event surface

Rendering a whole interface touches `addEventListener`, `matchMedia`,
`requestAnimationFrame` and `history`. The sandbox now provides inert versions,
with **timers unref'd** so a component scheduling an interval cannot hold the
test process open.

## 11ag. The movement preview producer (v9.38)

`MovementOverlay` rendered whatever it was given, but **nothing produced a
preview** - no pointer tracking, no region request. This is that producer.

### One call, one cost

`movementPreviewFor(state, { tokenId, point, mode, withRegion })` returns
everything the overlay draws. The **region is opt-in**, because it is the
expensive part - a transaction per sampled cell - so a pointer move cannot cost
one by accident. Making it unconditional turns a test red.

The preview it returns is the **same** one the panel shows: a test compares
distance, cost and clamping against a direct `movePreview` call rather than
asserting literals.

### The pointer is throttled to a frame

`onAimPointerMove` reports world coordinates through `requestAnimationFrame`, so
a raw `pointermove` - which fires far faster than a frame - cannot queue a
preview per event. The rAF handle is cancelled on unmount.

### Two controls that correctly report zero

- **Changing the region's `mode`** turns nothing red, because `reachableRegion`
  derives its budget from `state.movement` when that transaction belongs to the
  creature. The parameter only matters for a creature with no live transaction.
  Recorded in a comment at the code.
- **Removing the pointer throttle** turns nothing red, because the throttle
  lives inside `MapCanvas` and no test renders it with a pointer stream. That is
  a real coverage gap rather than a redundant guard, and it is recorded as one.

## 11af. The movement overlay and drag-to-aim (v9.37)

### The ghost is where the token will land

`MovementOverlay` draws the planned move. The ghost sits at the preview's
**accepted** destination, so a clamp is visible: aiming 100 ft with 30 ft of
movement draws the ghost at 30 ft and marks the requested point with a dashed
ring, rather than the token silently stopping short.

A **refused** move draws no ghost at all - the same rule `movePreview` enforces,
carried onto the canvas.

The reachable region is shaded from `reachableRegion`, and a **truncated** cell
is drawn as `mv-unknown` rather than as unreachable: a sampling limit must not
read as a wall.

### A bug this found

`prepareMove` computed **which** creatures a move leaves behind - then reduced
it to a boolean and discarded the list. `opportunity` reported `{ provokes, why }`
and nothing else, so the overlay had nothing to ring and `movePreview`'s
`provokers` array was always empty.

`leftReach` is now a filter rather than a `some`, with the boolean derived from
the list so the two cannot disagree. `opportunity.from` carries token ids;
`movePreview` reports names for the panel and ids for the map.

### Drag-to-aim

`areaAimAt` points a cone or line at a map position: its origin is the caster,
so a click sets the **facing** rather than the origin. `MapCanvas` routes the
click to `onAimArea` for rotatable shapes and `onPlaceArea` for the rest. A test
asserts aiming east catches a creature that aiming west does not.

## 11ae. The area overlay and the radial call site (v9.36)

### You can now see the circle

`AreaPreviewOverlay` draws the shape being placed. All six shapes have a
rendering: circle for sphere and cylinder, **dashed** circle for emanation so it
is not mistaken for one, centred square for cube, beam for line, and a **wedge**
for cone matching `CONE_HALF_ANGLE` exactly.

**The highlight is read from the service, not re-derived.** Tokens are ringed
because `areaPreview().affected` says so - enlarging the area enlarges the
highlight because both come from the same call. A test asserts that
relationship rather than a fixed count.

Tokens inside the area but **shielded** by total cover get a dashed grey ring
rather than no ring, so "why was that one spared" is answerable from the map.

An **illegal** placement is drawn in warning colours rather than hidden - the
player should see where they aimed and why it was refused. Hiding it turns a
test red.

The layer is `pointerEvents: 'none'` (it must not eat the map click that
positions it) and `aria-hidden` (the panel already says it in words).

### The radial opens flows

`RadialTokenMenu`'s segment handler now calls `workflowForRadialCategory` and
opens the flow in the dock, switching to the Actions tab. Categories with **no**
flow - HP, conditions - keep their inline panel, which is the right home for a
quick adjustment.

A test asserts every category either opens a flow or is a known inline panel, so
a new category cannot silently become a dead segment.

## 11ad. The remaining entry points (v9.35)

Two gaps remained after v9.34. Both are closed.

### A map click positions an area preview

`MapCanvas` takes `onPlaceArea`, which claims the click **only while an area
flow is open** - normal map interaction is untouched when the handler is null.
The click **moves** the preview and never commits, so a mis-click costs nothing
and the player confirms from the panel.

The clicked point wins over the stored origin, so dragging around the map keeps
updating the preview. A test asserts a second click moves it rather than
committing.

### The radial reaches the same flows as the drawer

`workflowForRadialCategory` resolves each category through its **own
`drawerOption`** and then calls `workflowForOption` - a lookup rather than a
second mapping, which is precisely what stops the two entry points from
drifting. A test asserts every category's flow matches what the drawer would
produce; giving the radial its own mapping turns 4 tests red.

"Cast a Spell" names no spell, so it opens a **spell picker** that routes each
choice onward through the same function. Picking Magic Missile reaches
`CastFlow`; picking Fireball reaches `AreaFlow`.

### An end-to-end assertion

The strongest test here submits a placement made through the flow to
`adjudicateIntent` and asserts the host does **not** reject it. A flow that
produces payloads the host refuses would otherwise pass every component test
while being useless.

### A control that correctly reports zero

The `!cat?.drawerOption` guard is defensive rather than load-bearing: without
it, `workflowForOption({ id: undefined })` returns null anyway. Recorded rather
than dressed up.

## 11ac. Flow adjudication (v9.34)

The last link. `WorkflowHost` submitted each flow as an intent, and
`adjudicateIntent` rejected them as unadjudicable - so every flow was a dead
end. These are the cases that turn a flow payload into a reducer action.

**Click → flow → intent → adjudication → reducer** is now connected end to end.

### The host re-validates; it never trusts the preview

Each case calls the same service the flow's preview called:

| Action | Re-validated with | Applies |
| --- | --- | --- |
| `attack` | `prepareWeaponAttack` | `WEAPON_ATTACK` **from the request**, so the host rolls |
| `spell` | `castReview`, or `areaRevalidate` for a placement | the existing `SPELL_CAST` |
| `contest` | `contestEligibility` | `CONTEST_RESOLVE` |
| `standard` | `validateStandardAction` | `STANDARD_ACTION` |

An area cast **recomputes** who is caught and returns `corrected` when it
differs from the client's list, naming what changed. A forged `clientAffected`
cannot add a target.

### Two duplicate cases found and merged

`attack` and `spell` cases already existed further down the switch, so the ones
I added were unreachable. The old `spell` case only spent a slot - it never ran
the cast - so the richer version replaced it rather than sitting dead beneath
it.

**But the old contract was kept.** Callers outside the cast flow (quick casts,
the sheet) submit a bare `expectedCosts.slotLevel` with no known spell.
Requiring a spellbook lookup would have broken them; the case now handles both
shapes and says why in a comment. Four tests caught this - the merge was only
safe because they existed.

### `INTENT_ACTIONS` is derived

From `TRANSACTION_VERSIONS`, so a new action must be registered there or it is
refused as unknown before reaching the switch. Removing either new registration
turns five tests red.

## 11ab. The workflow router (v9.33)

The flows existed and the drawer listed the actions, but **nothing connected
them**: choosing "Attack" entered a bare targeting mode and `AttackFlow` was
unreachable. This is that connection.

### `workflowForOption` is pure

So a drawer option with **no** flow is explicit rather than silently doing
nothing. The load-bearing test walks **every option the drawer offers** and
asserts each either routes somewhere or appears in an explicit no-flow set - so
a new option that routes nowhere fails the suite instead of shipping as a dead
button.

Spells route **by their targeting shape**, read from the model: an area or
summon spell opens `AreaFlow`, everything else `CastFlow`. A test derives the
expectation from `spellTargeting` rather than a hardcoded list.

### A bug this found

Library spells carry **no `id`** - the name is their only stable key. The drawer
built `spell:${sp.id}`, producing `spell:undefined` for every standard spell, so
none of them could route. Fixed at the source (`sp.id || sp.name`), with
`spellById` matching on either.

That bug was invisible until something tried to *use* the option id. Listing an
option and being able to act on it are different things.

### `StandardActionForm`

Driven by `STANDARD_ACTION_DEFS`, so adding a field to an action is a data
change rather than a component change. A test renders **every** standard action
and asserts each produces a form with a way out. Help offers allies only;
Search offers Perception or Investigation and nothing else.

### `WorkflowHost`

Renders whichever flow the drawer opened, and a test asserts **every flow offers
Cancel** - no workflow is a trap.

## 11aa. The workflow components (v9.32)

Every model from prompts 14-19 was complete and tested but had **no renderer**.
These are those renderers. They hold no rules logic: each reads a selector and
dispatches, so the behaviour under test is the behaviour on screen.

### One frame, five flows

`WorkflowFrame` supplies the title, the step indicator, and **Back / Cancel /
Confirm** for all of them. Written once, so the controls cannot drift between
flows - and Confirm is disabled until the flow's own model says it is ready,
carrying the model's reason as its tooltip.

| Component | Renders |
| --- | --- |
| `AttackFlow` | weapon list with bonus, damage, reach, ammunition and attacks left → targets with distance and band → preview with to-hit, cover and cost |
| `CastFlow` | mode → slot source (with upcast marked) → review with components, duration, concentration and warnings → targets |
| `AreaFlow` | dimensions, origin, who is caught, who is shielded, and rotation for cones and lines |
| `MovementFlow` | the readout, mode switcher, preview cost, clamp note and opportunity warning |
| `ContestFlow` | both rolls, the shove mode picker, what success does, and the defender wait |

`TargetList` is shared by the flows that select targets, so the ordered,
numbered, removable list behaves identically in each.

### A bug the tests found

`AttackFlow` never threaded the actor's authority into `attackPreview`, so every
preview was refused for ownership - *"You do not control that creature"* - before it reached the rules. A component that renders a model still has to pass
that model its arguments.

### Tests compare against the model, not against literals

Where a component shows a number, the test reads it from the selector and
asserts the rendered text contains **that**. A literal would have passed while
silently diverging from the rules.

## 11z. Consolidation: performance and migration (v9.31)

Prompts 17-19 each added a complete, tested model whose call sites were left
unmigrated. Three duplicate implementations had accumulated. This closes them.

### `reachableRegion` was 104ms per preview

It called `prepareMove` for every sampled cell, on every pointer move. Two
bounds cut it to **13ms** without changing a single verdict:

1. **Straight-line pruning.** No path is shorter than the straight line, so a
   cell whose direct distance already exceeds the budget is provably
   unreachable and needs no transaction. Calls fell from 224 to 112.
2. **A call ceiling** (`maxCalls`, default 400) reporting `truncated` rather
   than silently returning a partial region.

A test verifies **every pruned cell against the real transaction**, so the
shortcut's premise is checked rather than assumed. Another compares the full
region cell-by-cell against brute force: zero disagreements.

A bug the tests caught: the ceiling originally `continue`d without emitting the
cell, leaving **holes in the shading**. Truncated cells are now emitted with
`reachable: null, unknown: true`.

### `spellAreaContains` now delegates to `areaContains`

The cast path knew only sphere, cylinder, cube and line - so **Burning Hands
and Cone of Cold had no area at all**. It now delegates, which makes cone and
emanation reachable from a real cast. A test asserts the two entry points agree
shape by shape across a range of distances.

### `tokenTargetValidity` now delegates to `evaluateTarget`

Click-targeting checked sight and range but never cover or allegiance. It now
builds a v9.29 context and defers, so all three targeting paths share one
resolver - and the click path gains cover and distance reporting it never had.

**One consequence worth stating:** the refusal wording changed. "you cannot
attack yourself" became "you cannot target yourself", because there is now one
vocabulary rather than three. Tests were updated to the shared wording rather
than the old path's.

## 11y. The movement workflow (v9.31)

`prepareMove` already reported terrain, collision, zones, opportunity attacks,
falling and jumping. What was missing was the **presentation layer**: a player
saw a line and a number, with no ghost, no reachable region, no warning before
stepping out of a reach, and no explanation when the host moved them somewhere
other than where they clicked.

### Never show an illegal move as if it will succeed

`movePreview` clamps to the furthest legal point and says so:
*"Clamped to the furthest point you can reach."* The **ghost is the accepted
destination, not the cursor** - aiming 100 ft with 30 ft of movement draws the
token at 30 ft, and keeps `requested` alongside so the UI can show both.

A move that is refused outright draws **no ghost at all**. Drawing one turns a
test red.

### Eight modes

Walk, Dash, crawl, climb, swim, fly, **teleport** and **forced**. The last two
are visibly distinct: they cost nothing and provoke nothing, and say so rather
than silently reporting zero.

An unavailable mode is **listed and disabled** with its reason - "you have no
flying speed", "you are prone - stand up or crawl", "only an effect can move you
this way". So mode switching needs no radial menu and answers its own questions.

### The readout

Mode, speed, spent, remaining, Dash uses, cost multiplier, prone, squeezing,
**grapple dragging** with its halved speed, and jump limits - all in one
`movementStatus` call.

### Correction and reconciliation

`explainMoveCorrection` states what changed: *"You aimed 70 ft further than you
could reach. Your movement ran out; you stopped at the furthest legal point,
spending 30 ft."* Both destinations are kept.

`moveReconciliation` keeps an optimistic ghost **only on an exact match**. Any
difference means the local prediction was wrong and must be replaced rather than
reconciled - a sub-pixel difference still counts as agreement, but a real one
does not.

## 11x. Area placement (v9.30)

### Two shapes were missing

`spellAreaContains` handled sphere, cylinder, cube and line. **Cone had no
geometry at all** - Burning Hands and Cone of Cold could not be placed - and
neither did emanation, which differs from a sphere in that it is centred on the
caster and moves with them.

`areaContains` now covers all six. A cone is a wedge: within its length and
within `CONE_HALF_ANGLE` of the facing, with the acceptance widened near the
origin so a token touching the tip counts.

### A click moves the preview; it never commits

`areaPlacementAt` sets the origin and leaves `confirmed: false`. Clicking again
moves it. Only an explicit confirm casts - the first map click used to *be* the
cast, which is what this workflow exists to fix. Making the click commit turns 2
tests red.

### Origin legality, reported separately

Range from the caster, line of effect, and line of sight are each checked and
each named, so the UI says *which* failed rather than "you can't put it there".
A cone, line or emanation reports `fixedToCaster: true` and needs no placement
at all.

### Affected versus shielded

`areaAffectedTokens` splits them: a token geometrically inside the area but
behind **total cover from the origin** is listed as shielded with the reason. A
fireball does not go round a corner.

### Rotation

Only cones and lines. `areaRotate` steps by `ROTATION_STEP` (15 degrees) for
keyboard; `areaRotateTo` sets an absolute angle for touch or drag. The preview
reports `angleDegrees` so a control can be readable. Rotating a sphere is a
no-op rather than an error.

### Host revalidation reports the difference

`areaRevalidate` recomputes from the host's own state and compares against the
client's list, reporting `added` and `removed` by name: *"The area caught 2 more
than your preview showed."* The host **recomputes** rather than filtering the
client's list - a test asserts a token on another map can never be affected even
if the client claims it.

## 11w. Unified target selection (v9.29)

Three targeting paths had grown separately and **disagreed at the edges**:

- `tokenTargetValidity` (v9.24) checked sight and range, but not cover or allies
- `attackTargetsFor` (v9.26) checked sight and range, but not cover
- `spellTargeting` (v9.28) described counts but validated nothing

One `makeTargetingContext` now describes what is being aimed, and
`evaluateTarget` answers *"may I target this token, and if not why"* for every
caller. `targetingContextForWeapon`, `targetingContextForSpell` and
`targetingContextForHelp` funnel the three paths through it, so they cannot
drift again.

### Token instances, not entity definitions

Selections are **token ids** throughout. Two identical goblins share a stat
block but are different creatures, and a spell targeting "three creatures" must
be able to pick two of them. A test asserts exactly that, and that the same
token twice is still refused.

### One verdict, with the reason and the numbers

Every evaluation returns `{ valid, reason, detail, distFt, cover, name }` - so a
UI can highlight valid and invalid differently, explain the refusal, and show
distance and cover on hover or focus without a second pass.

Checks, in order: current map · self · allegiance · reach or range · sight ·
line of effect · duplicates · capacity. **Current-map scoping happens in exactly
one place** now, rather than three.

### Selection

Ordered, numbered, removable, with `targetingStatus` reporting chosen, remaining,
`complete` and `canConfirm`. A minimum is enforced for confirmation but a player
may cast at fewer than the maximum. Duplicates are refused unless
`allowDuplicates` - which is how several Magic Missile darts strike one
creature.

Keyboard traversal moves between **valid targets only**, so tabbing never lands
somewhere unusable.

## 11v. The spell-casting workflow (v9.28)

Casting was a quick-cast shortcut that guessed the rest - and guessed wrongly in
the way that matters most: **every non-area spell became a single-target spell.**
Magic Missile's three darts and Bless's three creatures both collapsed to one.

### Targeting is derived, never defaulted

`spellTargeting(spell, castLevel)` reads what the spell declares and returns one
of six shapes:

| Kind | Picks | Example |
| --- | --- | --- |
| `self` | nothing | Mage Armor |
| `single` | one creature | Fire Bolt |
| `multi` | up to *n* creatures | Magic Missile (3), Bless (3) |
| `area` | a point | Fireball |
| `summon` | a location | Find Familiar |

A test asserts at least three distinct kinds occur across the library, so a
regression that collapses them is caught rather than merely losing a count.

**Duplicates are refused unless the spell allows them** - several Magic Missile
darts may strike one creature; Bless's three targets must differ. Targets can be
removed individually, and removing one duplicate leaves the others.

### Six stages, with the inapplicable ones skipped

`pickSpell → pickMode → pickSlot → review → target → confirm`. A cantrip skips
the slot stage; a self spell skips targeting; the mode stage appears only when
there is a mode to choose. Choices survive stepping back because the flow
returns *stage names* and the selections live in the caller's state.

### Slot sources

Every slot at or above the spell's level (**never below** - you cannot
downcast), each with what is left, and **Pact Magic as a separate source** with
its own pool and a note that it returns on a short rest. An exhausted level is
listed and disabled rather than hidden.

### Warnings that distinguish choice from restriction

Replacing concentration names the spell being lost and does **not** block - it
is the player's decision. The bonus-action restriction, a missing requirement
and an invalid slot source **do** block. `canCast` reflects only the blocking
ones.

### A bug this found

`scaleSpell` takes an options object (`{ slotLevel, casterLevel }`), not a bare
level. Passing a number silently returned the **unscaled** spell, so every
review showed base damage regardless of the slot used. The test that caught it
compares a base-level review with an upcast one rather than asserting a literal.

## 11u. Grapple and shove workflows (v9.27)

The rules services existed - `canInitiateGrapple`, `grappleContest`,
`grappleMoveMultiplier` - but there was no player-facing flow: no way to see
whether a grapple was legal before trying, no defender skill choice, no route to
escape one.

### A contest is not an attack

Both are **contests**, and a contest is the one place where the defender
participates rather than being a target. That shapes the design: there is a
`pending` state while the defender chooses Athletics or Acrobatics, and a
**timeout** so an absent player never stalls the table
(`DEFENDER_CHOICE_TIMEOUT_MS`, defaulting to Athletics and reporting
`defaulted: true` so the table knows).

### Eligibility before target selection

`contestEligibility` reports every reason up front, with detail: *"Huge; you are
Medium"*, *"20 ft away, and your reach is 5 ft"*, *"no free hand"*, *"already
grappled"*. A disabled control can explain itself rather than the player
discovering the problem after aiming.

**A bug this found:** shove was borrowing `canInitiateGrapple`, which checks for
a free hand. You may shove with both hands full. Shove now checks size and reach
directly.

### One qualifying attack

A grapple or shove replaces one attack of the Attack action - spent **whether or
not it succeeds**, because the attempt costs the attack. A Fighter with Extra
Attack can grapple and still swing.

### Resolution through authoritative paths

A won grapple applies `Grappled` through the condition reducer and records
`grappledBy`. A shove applies `Prone`, or pushes 5 feet through **forced
movement** - `prepareMove` with `kind: 'forced'`, so it costs the target nothing,
provokes nothing, and cannot put a creature somewhere the movement path would
refuse.

### Escape and dragging

`grappleEscapeInfo` gives the held creature everything it needs: who holds it,
both its skill options with modifiers, what the grappler rolls, and the other
ways a grapple ends. **Escape appears in the affected creature's Actions list**
and disappears when it is free.

`dragPenaltyInfo` states the cost rather than silently applying it: *"Dragging
Orc halves your speed to 15 ft"* - or notes when a creature is small enough to
drag at full speed.

## 11t. The weapon-attack workflow (v9.26)

`prepareWeaponAttack` already resolved attacks authoritatively. What was missing
was everything around it: a player had a range preview and nothing else - no way
to see an attack bonus before committing, no target validity, no confirmation.

Four stages, each reversible: `pickWeapon → pickTarget → preview → resolved`.

### Stage 1 - `attackOptionsFor`

Every attack option with the numbers needed *before* choosing: attack bonus,
damage and type, reach or range band, ammunition count, action cost and attacks
remaining, plus the property list (finesse, thrown, versatile, loading, light,
reach, improvised). An unarmed strike is always present.

**An unusable weapon is listed and disabled, not hidden** - "why can I not
attack with my bow" must be answerable from the list. Hiding them turns 6 tests
red.

The bonus shown comes from a real `prepareWeaponAttack`, so the number displayed
is the number rolled - asserted directly against the transaction.

### Stage 2 - `attackTargetsFor`

Every creature on the current map with its distance, range band and validity,
nearest first. Invalid targets carry the reason: out of range with the distance,
or "you cannot see it".

### Stage 3 - `attackPreview`

Distance, cover, advantage with its reasons, range band, attack bonus, target
AC, damage, and **what confirming will cost** - action, attack-of-action,
ammunition by name, and attacks left afterwards.

**Preview consumes nothing** - and that is a property of `prepareWeaponAttack`
being pure, not of a flag. A negative control adding `preview: true` changed
nothing, because there was nothing for it to switch off; the flag was removed
rather than left implying a safety mechanism that does not exist. Spending
happens in `WEAPON_ATTACK`, which re-prepares from the *request* so the host
never trusts a client-sent plan.

### Two-weapon fighting

`twoWeaponOption` is a **bonus-action** option, separate from the main list
because it is a different resource. It requires two light melee weapons, an
unspent bonus action, and the Attack action already taken - each with its own
reason.

### The separate range preview

`rangePreviewFor` returns the bands without entering the attack flow, so a
player can measure without committing to aim. It reports `consumes: null`
explicitly.

## 11s. The radial menu as a shortcut (v9.25)

The radial was the **only** route to Attack, Cast, Move, HP and Status. That
makes it load-bearing rather than optional: a player who cannot open it - by
keyboard, on touch with a shaky hand, or because it renders off the edge of a
phone - cannot play.

It stays, because it is fast once learned. But it is now a **shortcut**.

### Parity is enforced, not asserted

`radialPanelParity(state, ...)` walks the categories the radial would actually
show for a creature and checks each is reachable without it - an action-drawer
option that really exists, or a real dock/mobile panel. It returns the **gaps**,
so a failure names them.

Tested across a Fighter, a Wizard, a Warlock and a locked object, since each
exercises a different set of categories. One test deliberately breaks a route
and asserts the check catches it, so the parity guarantee cannot pass vacuously.

`RADIAL_CATEGORIES` also declares each category's `workflow`, and a test asserts
it **matches the drawer option's** - so the two routes cannot invoke different
code paths.

### End Turn joins the ring

Previously the radial reached four core actions and the fifth (End Turn) lived
elsewhere. It is now on the ring too - and, like the rest, not only there.

### Accessibility

Segments are `role="menuitem"` with a roving `tabIndex`, arrow/Home/End
navigation and Escape to close. Their `aria-label` names the panel that also
holds the action, so a screen-reader user learns the alternative route.

Text labels are **always rendered**, not hover-only: a touch user has no hover,
and a low-vision user should not have to recognise an emoji.

### Placement

`radialPlacement` nudges the centre inward so the whole ring - including the
label band outside the wedges - stays on screen. A ring too large for the
viewport is **centred** rather than clipped on one side. It replaces an older
inline clamp that read `window` directly (throwing in a headless host) and
ignored the labels.

### It can be switched off

`prefs.radialMenu === false` hides it entirely. A test asserts parity still
holds with it disabled - which is the point: turning it off must lose nothing.

## 11r. Token selection (v9.24)

Selecting a token meant **double-clicking** it: unreachable by keyboard,
awkward on touch, undiscoverable. Single click now selects; double-click
survives as an optional shortcut for people who learned it.

### Actor and target are separate

The model separates two things the old code conflated: the **actor** you are
acting with, and the **target** you are acting upon. `tokenClickIntent` returns
one of `selectActor` / `chooseTarget` / `rejectTarget` / `inspect` depending on
whether a workflow is running - and choosing a target **never** changes the
actor. That is how a player ends up casting with the wrong character, and a test
asserts the actor survives.

An invalid target is **rejected with a reason**, not ignored: "out of range
(30 ft of 15 ft)", "you cannot see it", "you cannot attack yourself".

### Five states, none of them colour-only

| State | Glyph | Also |
| --- | --- | --- |
| selected | ◆ | solid outline |
| target | ⌖ | dashed outline |
| valid target | ○ | green outline |
| invalid target | ⊘ | **dimmed to 45%**, dotted |
| pending | ◐ | pulsing (stilled under `prefers-reduced-motion`) |

A test asserts the glyphs are distinct and that every state has a `::after` rule
rather than only a border colour.

### Screen-reader labels

`tokenAccessibleLabel` names the creature, whether it is **yours**, its
conditions, whether it is at 0 hit points, and every selection state - so the
spoken description carries everything the visual states do. A test asserts each
visual state has a spoken equivalent.

### Keyboard and touch

`Enter`/`Space` activate a token; arrows, Home and End traverse them.
**Escape undoes one thing at a time** - the workflow first, then the target,
then the actor - because clearing everything on one press is how a player loses
a carefully chosen target by reflex.

Long-press opens the contextual menu on touch. It is **cancelled by movement**
beyond `LONG_PRESS_SLOP_PX`, so dragging a token never fires it and a shaky tap
is still a tap.

### Scoping

`tokensOnCurrentMap` is the single place map scoping happens. A token on another
map is not clickable, not targetable, has no visual states, and cannot be
reached by keyboard traversal - each asserted separately.

## 11q. Mobile bottom navigation (v9.23)

### The defect this fixes

The mobile CSS translated both sidebars off-screen and relied on a `.open`
class to bring them back - and **nothing in the application ever applied that
class.** Party, Sheet, Foes and Chat were therefore unreachable on a phone: the
CSS existed, the trigger did not. A test now asserts no sidebar rule depends on
`.open`, and that no code applies it.

### Five destinations

**Party · Combat · Map · Character · Chat**, with Map the default and the other
four as drawers over it.

**The map is mounted at all times.** A drawer overlays it rather than replacing
it, which is precisely what preserves map position and zoom across an
open/close - replacing the map would reset both. A test renders every drawer and
asserts the map sentinel is still present; making the drawer replace it turns 2
tests red.

### Combat holds the HUD

On a phone the combat HUD lives in the Combat drawer, so that drawer also
carries the **urgent badges** - 0 hit points, pending requests, concentration
risk - that the desktop dock spreads across Actions, Character and Spells.
Badges come from the same `dockBadges`, so a phone and a desktop cannot
disagree about what is urgent.

On your turn Combat is **emphasised, not selected**. Same rule as the desktop
dock: a cue, never a hijack.

### Browser back

Opening a drawer pushes a history entry; back closes the drawer rather than
leaving the room. Back from the map is left alone - hijacking it would trap the
player. The scrim and a close button do the same thing for people who do not use
the gesture.

The history and listener calls are guarded: an embedded host may supply neither,
and a drawer that cannot register a back handler should still open.

### Safe areas

`env(safe-area-inset-bottom)` on the nav so the home indicator does not overlap
it, `-left` and `-right` for landscape cutouts, and `-top` on the drawer header.
The map reserves `--mobile-nav-h` rather than sitting under the bar.

Landscape phones are short, so below 500px height the labels drop - **the icon,
the badge and the accessible `title` all survive**, each asserted separately.

## 11p. The right dock, redesigned (v9.22)

The dock was three mutually exclusive panels - Foes, Sheet, Chat - with the HUD
living **inside** one of them. Switching to Chat meant losing sight of your hit
points, which is exactly backwards during combat.

Now a **persistent HUD above a tabbed lower area**. The HUD is a sibling of the
tab content, never a child of a branch, so no tab switch can unmount it. A test
renders every tab and asserts the HUD is still there; moving it inside the
content turns 3 tests red.

### Five tabs

**Actions · Character · Spells · Foes · Chat.** The first three need a claimed
character; Foes and Chat do not, so a spectator still has a usable dock. An
active tab that becomes unavailable falls back to one that works.

`normalizeDockTab` maps the pre-redesign preferences (`revealed` → `foes`,
`sheet` → `character`), so a stored tab from before v9.22 still resolves. The
tab lives in the PREFERENCE tier, so it is remembered locally across reloads.

### Prominence is a cue, not a hijack

On your turn, Actions is **highlighted** - `prominent: true`, styled with
`.dock-tab-v2.prominent:not(.active)` - but the active tab is **not changed**.
Yanking someone out of the Foes tab mid-read is worse than a missed cue. A test
asserts `activeId` is untouched while `prominent` is set; making it auto-select
turns a test red.

### Badges make a tabbed layout honest

A tabbed layout hides problems unless the tabs can speak. Three severities:

| Level | Shown for |
| --- | --- |
| `alert` | 0 hit points (with the death-save tally); concentration ending at 0 |
| `warn` | pending GM requests; outstanding level-up choices; concentration at risk |
| `info` | unread chat |

**Concentration "risk" is concrete**: you are concentrating *and* something could
break it - bloodied, or Poisoned/Frightened/Restrained. Being merely bloodied
while concentrating on nothing is not a risk, and a test asserts that
specifically. Unread chat excludes your own messages.

### Keyboard

Arrows (both axes), Home and End, with a roving `tabIndex` so the strip is one
tab stop. Navigation **skips unavailable tabs** rather than landing on a dead
one. Full `tablist` / `tab` / `tabpanel` ARIA.

### Responsive

Markup is identical at every width. At 1200px the labels shrink; at 900px they
are hidden, but the **icon, the badge and the accessible `title` all survive** - a test asserts each of those specifically.

## 11o. The End Turn workflow (v9.21)

Ending a turn gives up everything unspent, so the control says what is being
given up - and then lets the player do it anyway. **Warnings inform; they never
block.** A test asserts no warning is marked `blocking` and that the turn ends
regardless.

### Three campaign modes

`state.playerPermissions.endTurn`:

| Mode | Effect |
| --- | --- |
| `direct` | the player advances initiative themselves |
| `request` *(default)* | queues an `end_turn` request; the GM advances |
| `ready` | marks `readyToEndTurn`; the GM advances manually |

`request` is the default because it works whether or not the GM is watching the
tracker, and never takes control away from them. The GM always advances
directly, in every mode.

### What the summary reports

Unspent action and bonus action, remaining movement in feet, attacks left
mid-Attack, an unfinished target selection or move, a **Ready with no trigger
recorded** (which would otherwise waste the action silently), and pending GM
requests - noting that those survive the turn boundary.

An unfinished aim is **cancelled** on confirm rather than carried into the next
turn.

### Duplicate submissions

`state.turnEnd` records entity + round + turn. A second End Turn in the same
turn is refused and logged. The marker is cleared on advance, but that is
**defensive rather than load-bearing**: the guard keys on round and turn, so a
stale marker never matches a later turn anyway. A negative control removing the
clearing correctly turns nothing red, and that is recorded rather than dressed
up as coverage.

### Effects go through the scheduler

`END_TURN` delegates to `INIT_ADVANCE`, which already fires end-of-turn effects.
The first implementation called `fireTurnEffects` *as well* - **doubling every
end-of-turn effect.** A test comparing the number of effect firings against a
plain `INIT_ADVANCE` caught it.

### Keyboard binding

Default **Alt+E**, rebindable through `prefs.endTurnBinding` (PREFERENCE tier).
The matcher is strict about modifiers - Ctrl+Alt+E is not Alt+E - and the
shortcut opens the summary rather than ending outright, so a mistyped chord
cannot silently cost a turn. It is ignored while typing in an input.

## 11n. Unified standard actions (v9.20)

Two execution paths existed. `prepareAction` / `commitAction` was the real
transaction; `ECONOMY_TAKE_ACTION` re-implemented a subset - and did it
differently:

- it returned `state` unchanged on failure, so the UI could not tell a refusal
  from a no-op;
- it wrote **no log entry**, so nothing recorded what happened;
- it applied `Dodging` but **not `Hidden`**, so Hide through that path did
  nothing at all;
- it collected **no details**, so Help recorded neither who was helped nor with
  what, and Ready recorded no trigger.

### One path

`STANDARD_ACTION` validates through `prepareAction`, commits through
`commitAction`, applies effects through the rules services, and returns specific
confirmation text. `ECONOMY_TAKE_ACTION` is retained as a **delegating alias**
so no old call site can diverge; actions outside the standard set (Attack, Cast
a Spell) keep the original path.

### Details are collected and required

| Action | Required |
| --- | --- |
| Help | target ally **and** purpose |
| Ready | trigger **and** response |
| Search | Perception or Investigation |
| Use an Object | the object |
| Hide | Stealth result, **optional** - you may roll instead |
| Dash / Disengage / Dodge | none |

`missingActionDetails` reports what is still needed; an action missing a
required detail is refused and says so. Help additionally validates that the
ally exists, is not the actor, and is not incapacitated.

### No direct condition toggles

Dodge and Hide apply their conditions through `commitAction`, not by pushing a
string. **Help grants the ALLY a modifier** (`helpedBy`) rather than giving the
helper a condition - the advantage belongs to the creature being helped. Dash
raises the budget through `MOVEMENT_MODE`.

### Confirmation states the consequence

Not "Wren takes the Dodge action" but *"Wren Dodges - attacks against them have
disadvantage, and they have advantage on Dexterity saves, until their next
turn."* A test asserts each of the eight names a distinct mechanical
consequence, and that none falls back to generic text.

### Player and DM paths are identical

A test runs all eight actions through both - player with `actorPeerId` and
ownership, DM with `isDM` - and compares the resulting entities and movement
state. They match exactly, as does the confirmation text. A player acting for a
creature they do not control is refused and changes nothing.

`standardActionDisabledReason` returns the same verdict the commit would give,
so a disabled control's explanation can never be stale.

## 11m. Drawer mounted, effect coverage complete (v9.19)

### The Actions tab

`ActionDrawer` is mounted as a fourth dock tab - **Foes · Sheet · Actions ·
Chat** - alongside the sticky HUD, which stays visible across all four.
`'actions'` was added to `UI_PANELS`; without it `UI_SET_PANEL` would refuse the
tab and the button would silently do nothing. A test asserts every dock tab
names a panel the reducer accepts, so a fifth tab cannot be added without the
enum entry.

Choosing a **feature action** spends its use through the validated
`player_feature_use` op; every other option is handed to the workflow the drawer
has already entered via `uiDispatch`.

### Effect coverage is enforced, not aspirational

`featureEffectCoverage()` walks **every class, every subclass, every level 1-20**
and reports any feature resource with no `FEATURE_EFFECTS` entry. A test fails
the build when one appears - so adding a class feature forces a decision about
what using it does, rather than letting it become a silent no-op six months
later.

That check found four Mystic Arcanum ids and three subclass resources
(`feyPresence`, `wholenessOfBody`, `warPriest`) that the hand-written table had
missed. **Wholeness of Body** now heals three times the monk level; the rest
carry notes.

## 11l. The drawer component & feature effects (v9.18)

### `ActionDrawer`

A rendering of `selectActionDrawer` that performs no rules logic. Every disabled
state carries the reason the selector attached, shown as **visible text** on the
option - not only in a `title`, which a keyboard or touch user never sees.

### Keyboard focus, and a bug the tests caught

The option list re-derives on every state change, and combat changes state
constantly. Focus is therefore keyed to the **option id**, not to a DOM
position, and resolved **during render** rather than in an effect - so there is
never a frame where focus has been lost.

When the focused option disappears (a spell filtered out, an option no longer
offered), focus moves to whatever now occupies the nearest position rather than
falling back to the document.

The first implementation derived the resolved id but never **committed** it. The
recovery held for exactly one render: the next compared against the
already-updated order, found no previous position, and dropped focus after all.
A test written permissively (`sel.length <= 1`) passed anyway. Tightening it to
*"focus must LAND on a surviving option"* exposed the bug.

The list is one tab stop (roving `tabIndex`), with arrow keys, Home, End, and
Escape to clear the filter.

### Feature actions now do something

`FEATURE_USE` previously spent the use and applied nothing. `FEATURE_EFFECTS`
now supplies either a mechanical effect or an explicit note:

- **Second Wind** heals `1d10 + fighter level` through `applyHpTransaction`, so
  it respects the maximum like any other healing.
- **Rage** applies its condition.
- **Action Surge**, Channel Divinity, Bardic Inspiration, Wild Shape and the
  rest carry a note - *"take one additional action this turn"* - because their
  effect is a table adjudication.

The rule: **never a silent no-op.** A feature either changes state or says what
the table must do. A test asserts this for every resource a character actually
has, rather than reading the table back - `FEATURE_EFFECTS` is a `const` and so
is not on the render sandbox global (§11j), and asserting on behaviour is the
stronger test regardless.

## 11k. The action drawer (v9.17)

`selectActionDrawer(state, { entityId, filter })` returns every option a
creature can take right now, grouped into the six sections by what it costs.

### Nothing is a hardcoded label

Each base action names a `kind` from `ACTION_KINDS` - the same key the action
economy validates - so an option cannot drift from what the transaction will
accept. A test asserts every `BASE_ACTIONS` entry names a real kind.

Options come from five sources, and each records which:

| Source | Contributes |
| --- | --- |
| `BASE_ACTIONS` | the twelve: Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use an Object, Grapple, Shove |
| features | `resolveMulticlassProgression` - feature actions with uses, plus Cunning Action's three bonus options |
| spells | the spellbook, grouped by **casting time** so a bonus-action spell lands under Bonus Actions |
| equipment | items with an `activation`, plus the free object interaction |
| conditions | Escape the grapple (Grappled), Stand up (Prone) |

One naming wrinkle: `ACTION_KINDS.grapple.label` is `'Attack'`, because a
grapple *replaces* an attack. The drawer supplies its own label so the option
reads "Grapple", not a second "Attack".

### An option is never silently missing

A stunned Fighter still sees **Attack**, disabled, with `reason:
'incapacitated'` and a detail explaining which slots are gone. Hiding it would
leave the player guessing whether the app had forgotten the option or the rules
had removed it.

Every disabled option carries a reason. Surprise and incapacitation report
**different** reasons, because they have different remedies.

### Availability agrees with the transaction

The economy check runs through `prepareAction` - the same call the action
itself makes - so an option shown as available cannot then be refused on
submission. Requirements the economy does not cover (a weapon for Attack, a
free hand for Grapple, known spells and wearable armour for casting) are
checked separately and reported in the same shape.

An **unsynced** feature pool reads as full, matching §11e: a character imported
from before the progression framework has not spent Action Surge, and the
drawer falls back to the progression's definition so it still shows "1 / 1".

### Selecting an option

`drawerOptionWorkflow(option)` returns the UI action to dispatch rather than
performing it, so the mapping is testable and the component stays declarative.
A test asserts every workflow names a mode `playerUiReducer` actually accepts,
and that dispatching the returned action produces the expected targeting or
movement state.

### Filtering

Offered only when the list exceeds `DRAWER_FILTER_THRESHOLD` (12) - below that
it is noise. Matches label, description and source, so "cunning" finds all three
Cunning Action options. `totalUnfiltered` is preserved so the UI can say
"3 of 26".

## 11j. Component call sites are now testable (v9.16)

Four negative controls across v9.12 and v9.15 reported **0 failures** - reverting
the party card to raw `hp.max`, removing the host's sender stamp, reverting the
GM queue's status filter, and removing the accept-applies-it branch. Each was
recorded as an accepted limitation on the grounds that "React components are
unreachable from the test harness".

**That was wrong.** `tests/load-app-render.js` runs the real React with
`react-test-renderer`. It had been used for the HUD tests since v9.13. The
components were reachable the whole time; the gap was that nothing rendered
them.

### The technique

Render the component, capture what `dispatch` receives, and assert on the
**actions it emits** - which tests the wiring (which prop reaches which reducer
action) without asserting on markup that changes cosmetically.

```js
const tree = H.renderTree(get('DMRequestsOverlay'), { state, dispatch, ... });
const handlers = tree.root.findAll(n => typeof n.props?.onClick === 'function');
tree.unmount();                    // ← REQUIRED
```

**Unmounting is not optional.** `DMRequestsOverlay` starts a `setInterval` for
its auto-decline countdown; a tree left mounted keeps the timer alive and the
test process never exits. The first run of `dm-request-overlay.test.js` hung
until this was fixed - worth knowing before writing the next component test.

Note also that **`const` declarations are not visible on the render sandbox
global**, only hoisted `function` declarations. A test needing `REQUEST_STATUS`
must use the literal - which is the stronger assertion anyway, since it pins the
on-the-wire value rather than agreeing with the implementation about it.

### Result

All four controls now bite: 12, 3, 2 and 2 tests respectively. The
"component wiring is not regression-protected" caveat is withdrawn.

## 11i. GM correction review (v9.15)

Accepting a queued `turn_correction` now **applies** it, and the GM can see what
they are approving.

### A live bug this uncovered

v9.08 renamed the request status `'pending'` to `'submitted'`. **Six UI filters
were left comparing against the retired literal**, including the one that
populates the GM's review queue - so a queued request matched nothing and the
queue rendered empty. Every one of those filters sat inside a React component,
which is why no test caught it.

The fix is not just the comparison. `liveRequests(pendingRequests)` and
`liveRequestsOfKind(...)` extract the decision into pure functions, tested
directly, and every filter now routes through them. They compare via
`normalizeRequestStatus`, so a legacy save and a current one both match.

### Review

`requestSummary` formats a correction as *"Wren - Action: spent → available"*
with the player's stated reason on its own line (`because`), because a
correction is only reviewable if the GM can see **why** it was asked for.

### Staleness

A correction queued for review can go stale - the player may spend the slot, or
another correction may land, between queueing and approval. If the recorded
`oldValue` no longer matches reality, applying it would be silently wrong and a
later undo would restore a value that was never current. `CORRECTION_APPLY`
refuses and says what changed: *"Action is now available, not spent. Make the
correction again from the current value."* The GM can `force` through.

A correction also **re-anchors** its `oldValue` to the live value on apply, so
the audit trail records what was actually there rather than what the client
claimed.

## 11h. Turn-resource corrections (v9.14)

Table state goes wrong - a reaction is never ticked, a Dash is missed, an attack
is counted twice. The fix must exist, but it must not become how people normally
spend resources, because a correction bypasses every validation that makes
spending meaningful.

### Four constraints

1. **Not the primary interaction.** Collapsed behind a quiet toggle in
   `TurnCorrectionMenu`, never on the counter. §11g asserts the counters are
   read-only `<div>`s.
2. **A reason is required.** Not optional, not defaulted. Blank, whitespace or
   under three characters is refused. If you cannot say why, the state is
   probably not wrong.
3. **Audited.** Old value, new value, user, reason and time go into
   `state.correctionLog` - campaign state, so it survives a reload and every
   peer sees it.
4. **Through intents.** Adjudicated by the host like any other player action, so
   a modified client cannot self-authorise by claiming a mode in its payload.

### Three permission modes

`state.playerPermissions.turnCorrections`:

| Mode | GM | Player (own creature) |
| --- | --- | --- |
| `dmOnly` | applies | **refused**, with a reason |
| `request` *(default)* | applies | **queued** for GM review as a `turn_correction` request |
| `self` | applies | applies, and is recorded |

`request` is the default because most tables want a player to be able to say
"my reaction is still up" without either being ignored or being able to silently
rewrite the turn.

### Seven correctable resources

Action, bonus action, reaction, object interaction, attacks used, movement
spent, dash count. Each is bounded: attacks cannot go negative or exceed
`attacksPerAction` (so Extra Attack raises the ceiling), movement moves in
5-foot steps and cannot exceed a triple Dash, a slot is boolean and nothing
else. **The host re-validates on apply** - the wire is not trusted to have done
it, and a forged value is refused and logged.

### Undo, and its honest limits

DM-only, and only where technically safe. `correctionUndoable` refuses when a
later correction to the same resource is outstanding (undoing out of order would
clobber a newer value) and when the turn has moved on (the economy has since
reset, so the old value no longer exists to restore). Undo **marks** the entry
rather than deleting it - the audit trail must show that a correction was made
*and* withdrawn.

## 11g. The sticky combat HUD (v9.13)

`StickyCombatHUD` is pinned above the right dock's body. It is mounted as
`hudNode` **outside** the Foes / Sheet / Chat branches in
`RevealedMonstersSidebar`, so switching sections cannot unmount it, and it is a
sibling of the scroller rather than a child - which is what lets
`position: sticky` work.

Every value comes from `selectPlayerCombatSummary`. The component performs no
rules arithmetic; it decides only presentation.

### Five states, distinguished by glyph as well as colour

| State | Glyph | Meaning |
| --- | --- | --- |
| available | ● filled | ready to spend |
| spent | ○ hollow | used this turn; returns next turn |
| unavailable | ⊘ barred | a condition denies it |
| not applicable | - dash | this creature has none |
| pending | ◐ half | an intent is in flight |

Colour is never the only carrier: spent and blocked also take a
`text-decoration: line-through`, so the state survives greyscale, a projector,
and the ~8% of players with a colour vision deficiency. Every pip carries an
`aria-label` and `role="img"`.

The fourth slot is labelled **Object Interaction**, not "Free" - a test asserts
the string "Free" never appears.

### Read-only counters, with a separate correction path

A pip is a `<div>`, never a `<button>`. Clicking a counter to fix a miscount
would be an unvalidated write of live state, which §11c forbids. Authorised
users get a collapsible **Correct…** menu whose entries dispatch the proper
validated actions (`ECONOMY_TOGGLE`, `MOVEMENT_RESET`, `CONCENTRATION_END`)
through the owner-gated player-action path. The menu says what it is for:
*"For fixing a miscount. Normal spending happens through the action you take."*

### Tooltips explain unavailability

Not just *that* a resource is unavailable but *why*, and what would change it - "incapacitated - an incapacitating condition removes your action, bonus action
and reaction", versus "already used this turn; it returns at the start of your
next turn". The two are different problems with different remedies.

### Responsive behaviour is CSS-only

The same markup is emitted at every width, so there is no viewport-conditional
JSX and therefore no width-dependent render bug. Breakpoints at 1200px and
900px drop the least load-bearing text first - the class line, then the turn
text, then the pip labels. **The glyph, the tooltip and every value survive at
every width**; a test asserts that nothing carrying state alone is ever hidden.

## 11f. UI wiring (v9.12)

The two follow-ups from v9.10 and v9.11 are landed.

### The HUD reads the summary

`PartyPanel` and `ActionEconomyBar` now call `selectPlayerCombatSummary` instead
of computing their own values. This fixed three real display bugs:

- The party card used `e.hp.max` **raw**, so a character at exhaustion 4 showed
  a half-empty bar when it was actually full, and temporary hit points never
  appeared.
- The card printed `L{level} {class}`, showing only the primary class and the
  primary class's level - a Fighter 3 / Rogue 2 read as "L3 Fighter".
- `ActionEconomyBar` read `entity.economy` alone, so a **stunned** character saw
  its action pip as available. A slot a condition DENIES now renders distinctly
  from one that has been SPENT, because the remedies differ.

### The intent lifecycle is the transport

A dedicated `player_intent` / `intent_result` channel, separate from
`player_action` so the host can route it through `processIntent`.

- **The host stamps the sender.** `{ ...intent, userId: peerId }` - a modified
  client cannot claim to be another user.
- **A result is returned even for a duplicate**, so a client that re-sent after
  a dropped connection learns the outcome instead of waiting for its own
  timeout.
- The client submits to its tracker **before** the wire, so a pending state and
  any optimistic preview exist immediately.
- A 2-second sweep expires unanswered intents into a visible status; a
  reconnect re-sends whatever is still in flight, which the host ledger makes
  harmless.

### A gap worth knowing

**Neither wiring point is regression-protected.** Reverting the party card to
raw `hp.max`, or removing the sender stamp, leaves the suite green - both live
inside React components that the `vm`-sandbox harness cannot reach. The
*behaviour* is thoroughly tested (`selectPlayerCombatSummary` computes
correctly; `processIntent` dedupes and adjudicates correctly, exercised through
a mirror of the host handler), but *that the component calls it* is not.

This is the same class of gap as the printed-save-bonus mechanic in
RULES-MATRIX §21. Closing it needs a component-level test harness, which this
project does not have.

## 11e. Player combat summary (v9.11)

`selectPlayerCombatSummary(state, { entityId, peerId, density, ui })` produces
everything a combat HUD needs, as a plain view model. Three rules govern it:

1. **Authoritative state only.** Every number comes from a rules service - `resolveArmorClass`, `moveBudget`, `attacksPerAction`, `effectiveMaxHp`,
   `conditionEconomyProfile`, `resolveMulticlassProgression`. Tests assert the
   summary *agrees with the service* rather than asserting a literal, so a rules
   change cannot leave the HUD quietly stale.
2. **No rules in the component.** The view model holds decided values and
   labels. A renderer reads fields; it never branches on a condition name or
   does arithmetic on a speed.
3. **Missing fields are normal.** A summoned bear has no class, no death saves
   and no portrait. Every optional field degrades, and `summary.partial` lists
   what was absent so a UI can show a placeholder rather than `undefined`.

### Densities

`compact` / `regular` / `expanded` differ **only** in the `show` map - the data
is identical at every density, so switching does not re-query. Kept as data so
three components cannot disagree about what "compact" means.
`summaryConditionsToShow` and `summaryResourcesToShow` apply it; `regular`
surfaces only resources that are depleted or nearly so, rather than a wall of
counters.

### Two judgement calls worth knowing

**Conditions are ordered by how much they restrict the player**
(`SUMMARY_PRIORITY_CONDITIONS`), not alphabetically - Stunned outranks Prone
outranks Poisoned. Compact mode shows only the important ones, and implied
conditions appear (Unconscious surfaces Incapacitated and Prone).

**An uninitialised resource pool reads as FULL.** A character imported from
before the progression framework has no `featureUses` record; reporting `0 left`
would tell a fresh Fighter it had already spent Action Surge. Each resource
carries `tracked`, so a partially-synced character reports each pool honestly.

## 11d. Player intent lifecycle (v9.10)

Player actions took **four different shapes**: `sendPlayerAction` fired and
forgot; `submit_request` used the adjudication queue; weapon and spell
transactions carried their own `dedupeKey`; movement was optimistic with a
silent server correction. Four mechanisms, and one consequence in common - **the
UI told the player it had worked before the host had agreed.** A rejected move
snapped back with no explanation; a duplicate tap could double-spend on a slow
link.

### One lifecycle

```
PlayerIntent ──sent──▶ host adjudicates ──▶ IntentResult
     │                                          │
 optimistic preview                 accepted / corrected / rejected
     │                                          │
     └──────────── reconciled ──────────────────┘
```

**Intent**: `intentId`, `actorId`, `userId`, `action`, `targets`, `options`,
`expectedCosts`, `clientTs`, `txVersion`, `preview`.
**Result**: `intentId`, `status`, `outcome`, `resourcesSpent`, `stateChanges`,
`correction`, `explanation`, `logEntry`, `hostTs`.

Covers `move`, `attack`, `spell`, `rest`, `hp`, `economy`, `edit`, `condition`,
`item` - each with its own `TRANSACTION_VERSIONS` entry, so a client running
different rules from the host gets `versionMismatch` on the result rather than a
silent surprise.

### The invariant

**A success is only ever announced from an IntentResult.** While pending the
notification tone is `'pending'` and is not dismissible. A test asserts that no
lifecycle state other than `accepted` can yield a success tone - so the rule
cannot be broken by adding a state later.

`corrected` is a distinct tone from `success`, and carries
`{ requested, actual }` so the UI can show *what changed* rather than silently
replacing the value. `expired` is `'warning'`, not `'error'` - a timeout is not
a refusal.

### Duplicate suppression

`processIntent` consults an intent ledger keyed by `intentId`. A repeat replays
the **original result** and applies nothing, so a double-tap or a resend after a
flaky connection cannot double-spend. This generalises the per-transaction
`dedupeKey` to every action type.

**The ledger must migrate on host change.** A test documents the hazard
explicitly: a new host with an empty ledger *will* re-apply a re-sent intent.
That test exists to make the requirement visible rather than to assert desirable
behaviour.

### Cancellation

Permitted only while nothing irreversible has happened: a draft always, a
pending reversible intent yes, a committed one never.
`IRREVERSIBLE_ACTIONS = { attack, spell, rest }` - once the host has rolled a
die the outcome exists and cancelling would mean un-rolling it.

### Optimistic preview

The tracker owns the preview and its rollback, so no component has to remember
to undo one. `activePreviewFor(tracker, actorId)` returns the ghost to draw;
**any** result - accepted, corrected or rejected - drops it, as does a
cancellation or a timeout.

## 11c. Player field permissions (v9.09)

One flat `PLAYER_FIELD_WHITELIST` decided every player write, and it had
drifted. Three defects, all real:

- `resist`, `immune` and `vulnerable` were **player-writable**. A client could
  grant itself immunity to fire by editing its own sheet, and the rules engine
  trusts those fields.
- `ac`, `passivePerception` and `proficiencyBonus` were writable but **derived**.
  A player could set AC 30 and the value would be silently discarded the next
  time the gear manager recomputed it - a control that could not round-trip.
- Build-time choices (`spellSlotsMax`, `armorProfs`, `background`) sat in the
  same bucket as live play (`spellSlotsUsed`), so a campaign could not lock
  builds without also freezing play.

### The five categories

| Category | Who may write | When | Enforced by |
| --- | --- | --- | --- |
| **LIVE** | the owner | only via a **dedicated validated transaction** | `LIVE_FIELDS[field]` names the action |
| **BUILD** | the owner | **edit mode**, subject to campaign permission | `PLAYER_PERMISSIONS_DEFAULT` |
| **DM** | the DM | unless explicitly delegated | `perms.dmDelegated` |
| **DERIVED** | **nobody** | the value is computed; a write is lost | rendered read-only |
| **COSMETIC** | the owner | always | - |

`canPlayerWriteField(field, ctx)` is the single decision, returning
`{ ok, category, reason, action }`. **The UI calls the same function the write
path does** - `fieldIsEditable` and `fieldReadOnlyReason` are thin wrappers - so
a control is read-only exactly when a write would be refused. A test asserts the
two can never drift.

### Refusals explain themselves

The old whitelist dropped disallowed fields **silently**, so a control that
could never work looked identical to one that did. Now a refusal carries a
reason, and where a dedicated action exists it is named:

- `hp` → *"changes through play, not by editing (use player_hp)"*
- `stats` in edit mode → *"changing ability scores needs GM approval (use submit_request)"*
- `ac` → *"is calculated from your character sheet and cannot be set directly"*
- `immune` → *"is set by the GM"*

### Live-resource transactions

`validateLiveAction` checks before applying: you cannot spend a slot, a Pact
slot, a Hit Die or a feature use you do not have, and cannot clear a condition
the GM imposed. `SPELL_SLOT_SPEND`, `PACT_SLOT_SPEND` and `ENTITY_TEMP_HP` are
new reducer cases - spending a slot was previously a raw `ENTITY_PATCH`, which
meant nothing checked you had one.

### Campaign permissions

`state.playerPermissions` overrides `PLAYER_PERMISSIONS_DEFAULT`. Defaults are
conservative: builds are editable, but ability scores, levelling and
multiclassing default to `'request'` (GM approval), `derivedOverrides` is
`false`, and `dmDelegated` is empty. Each of `allow` / `request` / `deny` is
honoured per area.

`LEGACY_PLAYER_FIELD_WHITELIST` is retained solely as the record of what used to
be writable; a test asserts every field it contained now has an explicit
category, so nothing was silently dropped or silently kept in the migration.

## 11b. Player UI state model (v9.08)

`PlayerInterface` carried 25 `useState` hooks, several encoding the same concept
in different shapes: `showSheet` / `showClaim` / `showDice` / `showDraw` /
`showInit` / `creatingChar` were all *"which modal is open"* - mutually
exclusive in intent, with nothing enforcing it. `castTargeting` / `aimingSpell`
/ `interactingId` / `measureMode` / `drawMode` were all *"what workflow is the
pointer in"*.

### Three tiers, and which is which

| Tier | Lives | Contents | Serialized? |
| --- | --- | --- | --- |
| **LOCAL** | this browser, this session | selection, panels, workflows, modals, focus, draft request, unread count | **never** - not into a save, not to a peer |
| **PREFERENCE** | this browser, `localStorage` | density, reduced motion, panel collapse, last panel | to `plagues-call.ui.prefs.v1` only |
| **CAMPAIGN** | the DM's reducer, synced to peers | requests, turn order, resources, entities | yes, this is the save |

The boundary is **enforced, not documented**: `assertNoEphemeralInSave` walks a
save object for any key from the local slice, and a test fails the build if one
appears. (`movement` is exempt at the top level - it is also the name of the
shared movement transaction, which is legitimately campaign state.)

### The local reducer

`playerUiReducer` is pure and owns the invariants that scattered booleans could
not:

- **at most one modal** - `UI_OPEN_MODAL` replaces rather than accumulates
- **targeting and movement are mutually exclusive** - beginning either cancels the other
- **changing the controlled token abandons the workflow** - a spell aimed by one
  character cannot be finished by another
- **unknown enum values are refused** rather than stored

`PlayerInterface` now derives `showSheet`, `showClaim`, `showDice`, `showDraw`,
`showInit` and `creatingChar` from `ui.modal.id`, so existing JSX is unchanged
while there is exactly one source of truth.

### Selectors

Components ask questions rather than reaching into either tree:
`selectPrimaryCharacter`, `selectTurnStatus`, `selectActionResources`,
`selectMovementRemaining`, `selectConcentration`, `selectPendingRequests`, and
`selectPlayerHud` which answers all of them in one call so a component cannot
drift out of sync between them.

Each reports **why** as well as what: `turn.reason` is `"waiting for Brann"`,
`resources.blockedBy` is `"incapacitated"`, `movement.blockedBy` is
`"speed is 0"`. The UI can explain itself instead of just disabling controls.

### The request lifecycle

Seven states, with legal transitions enforced in the reducer:

```
draft ──▶ submitted ──┬──▶ accepted
  │           │       ├──▶ corrected   (DM approved a MODIFIED version)
  └──▶ cancelled      ├──▶ rejected
                      ├──▶ cancelled
                      └──▶ expired     (nobody answered)
```

Terminal states are final; re-resolving is refused and logged. **`expired` is
distinct from `rejected`** - before v9.08 a timed-out request was recorded as
rejected, which told the player the DM had refused when in fact nobody
answered. `corrected` records `originalPayload` alongside the correction so a
player can see what changed. Legacy `pending` normalises to `submitted` on load.

## 11a. Rules coverage: automated vs manual

**[RULES-MATRIX.md](RULES-MATRIX.md)** is the authoritative per-rule record - 24
areas, each with implemented behaviour, source module, tests, manual-only
behaviour, known limitation and GM override. Read it before changing a rules
service; it says what is load-bearing.

Three conventions hold across every subsystem and are worth stating once:

1. **An explicit value beats a derived one.** A stat block's printed save total
   replaces the computation, `acOverride` beats every AC formula,
   `attacksPerAction` beats Multiattack and Extra Attack. This is how a GM
   overrides the engine, and it is uniform.
2. **The engine computes; the GM triggers.** Hazards, death saves, legendary
   actions and clock advancement are all offered rather than imposed. Where a
   rule is computed but not automatically invoked, the matrix says so under
   *manual-only* rather than implying full automation.
3. **New mechanics enter through the clause vocabulary.** Conditions,
   exhaustion, armour, magic items, class features and monster traits all emit
   the same clause shapes, merged by `conditionProfile`. Adding a mechanic means
   adding a clause, not a call site.

## 12. Conditions (v8.90)

`CONDITION_RULES` is the single source of truth for what a condition *does*.
Each of the fourteen core 2014 conditions is one entry; every clause of its
rules text is one key. Nothing else in the codebase encodes condition
behaviour.

### The derivation chain

```
CONDITION_RULES  (data: one entry per condition, one key per clause)
        │
        ▼
conditionProfile(entity)      merges the active set, resolving `implies`
        │                     transitively and dropping immune conditions
        ├──▶ conditionRollContext()   attack / save / check adv, auto-fail, auto-crit
        ├──▶ conditionSpeedProfile()  speed 0, crawl cost, cannot-move
        ├──▶ conditionEconomyProfile()action / bonus / reaction / speech / awareness
        ├──▶ conditionVisibilityProfile()
        ├──▶ conditionDamageMods()    blanket resistance, type immunity
        └──▶ conditionAutoEnds()      documented `endsWhen` reasons
```

Roll effects are emitted as ordinary **roll-modifier records** (§ the v8.81
framework), so conditions reach `resolveD20` through exactly the same pipeline
as spell modifiers. There is no second code path. The two things a modifier
record cannot express - automatic failure and automatic critical hits - are
returned alongside on the context object.

### Consumers

| Consumer | Reads |
| --- | --- |
| `prepareWeaponAttack` | `conditionRollContext` (adv, Charmed block, auto-crit) |
| `resolveSaveWithConditions` | auto-failed STR/DEX, Restrained's DEX disadvantage |
| `resolveCheckWithConditions` | sight/hearing auto-fail, Poisoned/Frightened disadvantage |
| `moveBudget` | `conditionSpeedProfile` (speed 0, crawl cost, cannot-move) |
| `prepareMove` | `conditionApproachRestriction` (Frightened) |
| `canAct` / `canMove` / `canTakeReaction` / `isIncapacitated` | `conditionProfile` - all four are **derived** |
| `damageModsOf` / `autoMitigationForType` | `conditionDamageMods` (Petrified) |
| `ENTITY_TOGGLE_CONDITION` | `applyConditionOnset`, `conditionIsIncapacitating`, `conditionDeprivesMovement` |

### Adding or changing a condition

1. Edit **`CONDITION_RULES` only**. If the clause fits an existing key, you are
   done - every consumer picks it up.
2. If it needs a genuinely new *kind* of clause, add the key, then teach
   `conditionProfile` to merge it and exactly one service to expose it.
3. Add the clause to the matrix in `tests/conditions-matrix.test.js`. The
   completeness test at the bottom **fails the build** if a table key has no
   test claiming it, so this step is enforced rather than remembered.
4. Source-tracking conditions (Charmed / Frightened / Grappled) record their
   cause in `entity.conditionSources[name]`; pass `sourceId` on the toggle
   action. Absent a recorded source the clause degrades to its documented
   default rather than throwing.

### Exhaustion (v8.91)

Exhaustion is **not** a condition you have or lack - it is a level `0..6` on
`entity.exhaustion`, and every level keeps the effects of those beneath it. The
old binary `'Exhausted'` pill no longer exists; `migrateState` converts it to a
level (`TUNING.exhaustionOnMigrate`, default 1) and strips the label.

`EXHAUSTION_LEVELS` uses **the same clause vocabulary as `CONDITION_RULES`**, so
`conditionProfile` merges conditions and exhaustion in one pass and every
service downstream picks exhaustion up with no new call sites:

| Level | Effect | Expressed as | Consumed by |
| --- | --- | --- | --- |
| 1 | Disadvantage on ability checks | `checks.self` | `conditionRollContext` |
| 2 | Speed halved | `movement.speedMultiplier` | `moveBudget` |
| 3 | Disadvantage on attacks **and all saves** | `attack.self`, `saves.disadvantageAll` | `prepareWeaponAttack`, `resolveSaveWithConditions` |
| 4 | Hit point maximum halved | `hp.maxMultiplier` | `effectiveMaxHp` |
| 5 | Speed reduced to 0 | `movement.speed` | `moveBudget` |
| 6 | Death | `death` | `setExhaustionLevel` |

**Changing a level goes through `setExhaustionLevel` / `adjustExhaustion`
only** (reducer: `EXHAUSTION_SET`, `EXHAUSTION_ADJUST`). That is where the hit
point maximum is recomputed and current HP clamped, and where level 6 applies
death. Two rules worth knowing:

- Gaining level 4 **clamps** current HP down to the new maximum. Losing it
  restores the *maximum* but **not** the hit points already lost.
- The multiplier applies **after** additive bonuses, so Aid raises the base
  that is then halved.

**Long rest:** `exhaustionAfterLongRest` reduces the level by one, *provided the
creature has eaten and drunk* (2014). `LONG_REST` passes
`action.foodAndDrink` (defaults true) and drops the level **before** healing, so
a creature shedding level 4 wakes at its restored maximum.

**Terminal states.** `Dead` and `Broken` also have `CONDITION_RULES` entries
(marked `terminal: true`, so they are excluded from `CORE_CONDITIONS`). They
were previously special-cased inside `isIncapacitated`, which meant the derived
helpers missed them - `canAct` on a corpse returned `true`.

### Armour (v8.92)

Three rules, all previously missing or tangled:

**AC formulas are mutually exclusive.** `AC_FORMULAS` is a registry of base
formulas - `explicit`, `worn`, `natural`, `mageArmor`, `barbarianUnarmored`,
`monkUnarmored`, `unarmored`. `resolveArmorClass(entity)` picks **exactly one**
(the highest-valued eligible one; ties go to the earlier, more specific entry)
and returns a full breakdown: `{ ac, formulaId, base, dexCap, shieldBonus,
itemDelta, parts, candidates }`. A shield and magic-item deltas are **additive
on top** of whichever base won - they are not formulas. `computeArmorAc` is now
a thin wrapper returning just the number.

Two subtleties worth knowing:

- Heavy armour (`dexCap: 0`) contributes **exactly 0** Dexterity, not
  `min(dexMod, 0)` - it "doesn't let you add your Dexterity modifier", so a
  *negative* modifier is not applied either. Medium armour caps the bonus at +2
  but **does** still take a penalty.
- A Monk who takes up a shield **loses** Unarmored Defense. The resolver
  re-runs without the monk formula rather than silently keeping an illegal AC.

**Proficiency is never a gate.** Nothing prevents equipping armour you are not
trained in. `armorProficiencyState` reports the penalty instead: disadvantage on
Strength and Dexterity ability checks, saving throws and attack rolls, and no
spellcasting at all.

**Heavy armour has a Strength requirement.** `heavyArmorStrengthCheck` returns
the shortfall and a flat 10 ft speed penalty, waived when
`ignoresHeavyArmorStrength` finds an explicit `ignoreArmorStrengthReq` flag or a
matching racial/creature feature.

Both penalties reach the rest of the app as **condition clauses**:
`armorClauses(entity)` emits them in the same vocabulary as `CONDITION_RULES`
and `EXHAUSTION_LEVELS`, `conditionProfile` merges them, and the existing
services apply them. Nothing in the attack, save, check or movement path knows
armour exists. Two clause kinds were added for this:

| Clause | Meaning |
| --- | --- |
| `checks.disadvantageAbilities: ['str','dex']` | disadvantage only on checks governed by those abilities |
| `attack.selfByAbility: ['str','dex']` | disadvantage only on attacks made with those abilities |
| `movement.speedPenaltyFt: 10` | a flat speed loss, applied **before** any multiplier |
| `spellcasting.blocked` | consumed by `spellRequirementsCheck` |

The ability-gated clauses need to know which ability is in play:
`prepareWeaponAttack` passes `attackAbility`, and `resolveCheckWithConditions`
passes `ability`/`skill` (the skill's governing ability is derived via
`CHECK_ABILITY_OF`). **With no known ability the clause is skipped rather than
guessed at** - so a Wisdom spell attack is correctly unaffected.

### Level progression (v8.97)

`CLASS_INFO` describes a class in prose; nothing knew what a character *gains*
at each level, so features were typed into free text or hardcoded onto the
entity (`extraAttacks`, `unarmoredDefense`).

`CLASS_PROGRESSION` is the data - class → level → features, plus subclasses,
ASI levels and resources. `resolveProgression(entity)` walks it to the
character's level and returns `{ features, featureIds, resources, choices,
pending, grants, effects, feats, asiCount }`.

**Feature schema:** `grants` (direct field grants), `resource`
(`{ id, name, max, recharge }` - `max` may be a function of level), `choices`
(`kind`: skill / expertise / feat / asi / subclass / fightingStyle), `effects`
(the shared clause vocabulary), `replaces` (supersedes an earlier feature so it
cannot double-apply), and `prereq`.

**Everything outstanding is `pending`** - an unchosen subclass at the subclass
level, an untaken ASI, a half-made expertise pick. `LEVEL_UP` reports the count
so a character is never silently incomplete.

**Resources.** `syncFeatureResources` creates and resizes pools *preserving what
has been spent* - levelling a Monk from 5 to 9 with 3 ki spent leaves 6 of 9.
`restoreFeatureUses` runs on both rests; a long rest also restores short-rest
pools, a short rest does not restore long-rest ones.

**Rules integration.** Features reach the app through channels that already
exist: `attacksPerAction` reads `grants.extraAttacks`; expertise picks feed the
proficiency ledger; `unarmoredDefense` selects an AC formula;
`movement.speedBonusFt` is a new clause the `conditionProfile` merge handles
(and which Grappled/Restrained correctly suppress, since they deny *bonuses* to
speed); `saves.advantage` covers Danger Sense. Feats modify existing
calculations - Observant adds to `passivePerception`, Tough to `effectiveMaxHp`.

**Migration.** `migrateProgression` derives state for pre-v8.97 characters
without overwriting anything already set, and is idempotent (`progressionVersion`).

Representative content: Fighter (Fighting Style, Second Wind, Action Surge,
Extra Attack ×3, Champion, Eldritch Knight), Rogue (Expertise ×2, Sneak Attack,
Cunning Action, Evasion, Reliable Talent, Arcane Trickster, Thief), Barbarian
(Rage, Unarmored Defense, Danger Sense, Fast Movement, Berserker), Monk
(Unarmored Defense, Martial Arts, Ki, Unarmored Movement, Open Hand); feats
Observant, Alert, Tough, Heavily Armored, Heavy Armor Master.

### Multiclassing (v8.99)

`entity.classes = [{ class, level, subclass }]`. A single-class character keeps
`class` + `level` and is normalised into the same shape by `classEntriesOf`, so
nothing downstream needs a special case. The legacy fields are kept pointing at
the **primary** (first-taken) class, and `level` at the total, so older code and
saved games keep working.

| Rule | Where |
| --- | --- |
| Total character level | `totalCharacterLevel` - the sum, clamped to 20 |
| Proficiency bonus | from **total** level, never a class level |
| Cantrip scaling | from **total** level |
| Feature progression | `resolveMulticlassProgression` - each class on **its own** level |
| ASIs | per class, on that class's ASI levels |
| Prerequisites | `MULTICLASS_PREREQS`, checked for the new class **and** every class held |
| Proficiencies on entry | `MULTICLASS_PROFICIENCIES` - the reduced set, not the starting package |
| Hit Dice | `hitDicePoolsForClasses` - one pool per die size, spent dice preserved |
| Spell slots | `spellSlotsMaxFor` - caster levels combine, read the full-caster table |
| Pact Magic | separate, in `pactSlots`; contributes nothing to standard slots |
| Spellcasting ability | `spellcastingAbilityForClass` - per class |
| Preparation | `preparedLimitForClass` - per class on its own level, summed |

**Extra Attack does not stack.** The merge in `resolveMulticlassProgression`
takes the **maximum** across classes, not the sum: a Fighter 5 / Barbarian 5
attacks twice. Sneak Attack dice and rage damage merge the same way.

**A third caster's progression comes from its subclass.** `subclassCasterKind`
reads `CLASS_PROGRESSION[...].subclasses[...].grants.casterProgression`, so an
Eldritch Knight contributes `floor(level / 3)` caster levels and a Champion
contributes none. Before v8.99 `casterClassesOf` only looked at the base class,
so a Fighter/Wizard silently lost the fighter's contribution.

**Migration changes nothing.** `migrateMulticlass` derives the array from the
class and level the character already has, so every downstream calculation
returns the number it returned before. It is idempotent and skips monsters.

### Lighting on the map (v9.06)

The fog of war now renders the light *model*, not just a radius.
`computePlayerVisionSources` tags every source with a **quality**, and the
canvas styles each differently:

| Quality | Produced by | Player view | DM ring |
| --- | --- | --- | --- |
| `bright` | a light's bright radius, truesight | fully revealed | solid warm |
| `dim` | a light's dim radius, blindsight, the baseline square on a dark map | partially revealed (62%) - visibly murkier, matching *lightly obscured* | dashed blue |
| `darkvision` | darkvision, in anything but bright light | revealed at 70% **and desaturated** | dotted cyan |

**A torch now emits two rings**, bright and dim, instead of one. **Darkvision
drains colour**: a `mix-blend-mode: saturation` layer covers exactly the
darkvision area and is punched back out by any real light, so a creature relying
on darkvision sees shape without colour - which is what the rule says and was
previously only a boolean in the data model.

`visionEnabled` now also keys off `ambientLightOf`, so setting a map to Dim or
Darkness in the Environment tab fogs it regardless of the time of day.

Browsers without `mix-blend-mode` get a faint grey wash via `@supports not`
rather than a broken view.

### Player vision & the stat block editor (v9.05)

**The player filter now consults the sense model.** `computePlayerVisionSources`
previously read `entity.darkvision` raw and knew nothing about the rest of the
model. It now uses `sensesOf`, so:

- darkvision from a **magic item** counts (Goggles of Night),
- **blindsight** and **truesight** contribute a vision radius,
- a **blinded** character contributes no vision at all (radius 0; it still
  receives its own token),
- an **invisible** creature is only sent to a player whose character has
  truesight or blindsight *reaching it*.

That last one is a **security boundary**, not a rules nicety: before v9.05 an
invisible creature's token was transmitted to every client whose ordinary vision
radius covered it. `tests/lighting.test.js` asserts on what
`filterStateForPlayer` actually sends, and three negative controls cover it.

**`StatblockEditor`** replaces JSON editing for monsters and NPCs. It sits on
the sheet's Combat tab for any non-PC and edits every field `monsterProfile`
exposes: size and reach, per-ability saving throws and per-skill bonuses, the
four damage/condition lists, Magic Resistance, death-save eligibility,
multiattack routine, recharge abilities (with a spend/restore control and a
ready/spent indicator), legendary actions and resistances, lair actions and
regional effects, reactions, spellcasting DC and innate spells, the five senses,
and traits. Live readouts show the derived values - effective spell save DC,
attacks per Attack action, legendary uses remaining.

### The Environment tab (v9.04)

`EnvironmentPanel` is a DM float panel behind a **🗺️ Environment** toolbar
button, with five tabs. It re-implements nothing - every control dispatches the
action that runs the shared services.

| Tab | What it does |
| --- | --- |
| **Rules** | A switch per subsystem, writing `CAMPAIGN_RULES_SET` |
| **Light** | Sets the map's `ambientLight`, and lists who can see at that level and by which sense |
| **Hazards** | Fall, extreme heat (with the rising DC), extreme cold, forced march, food and water |
| **Travel** | Pace, distance, the pace's cost, and an *advance the clock* button |
| **Load** | Carried weight against capacity for every PC, with the encumbrance tier |

**Targeting**: an effect applies to the selected tokens, or to every player
character on the current map when nothing is selected. The panel says which,
always.

Controls for a disabled subsystem are greyed with an explicit note ("Falling is
disabled in this campaign") rather than hidden, so a GM can see the rule exists
and why nothing happens.

**This closed the encumbrance wiring gap.** `conditionProfile` is entity-scoped
but variant encumbrance is a *campaign* rule, so the rules now ride along on the
entity as `__campaignRules`, stamped by both `migrateState` and
`CAMPAIGN_RULES_SET`. Turning the switch on genuinely slows an overloaded
character through `moveBudget`; turning it off restores the speed.

### Adventuring & environment (v9.03)

Every hazard resolves through the **universal d20 resolver**
(`resolveSaveWithConditions`) and every point of damage through the **central HP
pipeline** - nothing in this section rolls or subtracts on its own. That is why
exhaustion imposes disadvantage on a forced-march save, and a Ring of Protection
helps against extreme cold, without either being mentioned here.

**Every subsystem is switchable.** `CAMPAIGN_RULES_DEFAULT` is the shape; a
campaign overrides it on `state.campaignRules`. Detailed survival tracking
(`foodAndWater`, `extremeWeather`, variant `encumbrance`) is **off by default**,
because most tables do not want it.

| Subsystem | Service |
| --- | --- |
| Carrying capacity | `carryingCapacityOf` (STR × 15 × size), `pushDragLiftOf` (×2) |
| Variant encumbrance | `encumbranceOf` / `encumbranceClauses` - 5× and 10× STR tiers |
| Falling | `fallingDamageDice` (1d6/10 ft, capped 20d6), `FALL` reducer, lands prone |
| Holding breath | `holdBreathSeconds` (1 + CON minutes, min 30 s) |
| Suffocation | `advanceSuffocation` → holding / suffocating / out-of-air |
| Underwater | `underwaterMovementFor`, `underwaterAttackRule` |
| Extreme heat / cold | `extremeHeatHazard` (DC 5 rising), `extremeColdHazard` (DC 10) |
| Forced march | `forcedMarchHazard` - DC 10 + 1 per hour beyond 8 |
| Food and water | `starvationCheck`, `dehydrationCheck` |
| Travel pace | `TRAVEL_PACES`, `travelDistance` |
| Hazard resolution | `resolveHazardSave` → `HAZARD_SAVE` reducer |
| Environmental damage | `applyEnvironmentalDamage` |

**One asymmetry worth knowing.** `applyHpTransaction` takes an *already
mitigated* amount - the attack path resolves resistance upstream before calling
it. Environmental damage has no such caller, so `applyEnvironmentalDamage`
resolves mitigation itself via `autoMitigationForType` and reports both
`rawAmount` and `appliedAmount`. Passing a raw number straight to
`applyHpTransaction` silently ignores resistance.

**Encumbrance and armour compose.** Both emit `movement.speedPenaltyFt`, which
the `conditionProfile` merge sums, and both are applied before the exhaustion
multiplier.

### Lighting & senses (v9.02)

Four questions the engine previously collapsed into one boolean, now kept apart:

| Question | Function |
| --- | --- |
| What light is at a point? | `lightLevelAt(state, point, mapId)` |
| Can A **see** B? | `canSeeCreature(state, viewerId, targetId)` |
| Is the path unblocked by **opaque** cover? | `hasLineOfSight` |
| Is the path unblocked by **anything**? | `hasLineOfEffect` |
| Does A **know where** B is? | `knowsLocationOf` |

The distinction matters: a creature can have line of sight and still not see
(darkness, invisibility), and can be unable to see yet still know the location
(blindsight, tremorsense, or simply having noticed it).

**Light and obscurity.** A map has `ambientLight`; tokens and `state.lights[mapId]`
are sources with a bright and a dim radius. `bright → none`, `dim → lightly
obscured`, `darkness → heavily obscured`. Lightly obscured gives disadvantage on
sight-based Perception; heavily obscured blocks sight outright.

**Darkvision** (`perceivedLight`) does exactly three things, each tested:
darkness becomes **dim** within range, dim becomes **bright**, and darkness seen
this way is **colourless**. Note the consequence: a creature relying on
darkvision in darkness is still *lightly* obscured, so Perception is at
disadvantage. Goggles of Night extend the range through the magic-item layer.

**Other senses.** `blindsight` sees without light and while blinded;
`tremorsense` locates ground-bound creatures without conferring sight;
`truesight` beats darkness, invisibility and blindness alike and is checked
first.

**Passive Perception** (`passivePerceptionOf`) is 10 + Wisdom + proficiency /
expertise / half proficiency + feats + items, **+5 for advantage and -5 for
disadvantage**. Advantage from any source counts, including a condition; a
lightly or heavily obscured target contributes disadvantage. A stat block's
printed value replaces the base but still takes the swing.

### Monsters & NPCs (v9.01)

A monster was a name, an AC, hit points and a wall of free text. These fields
are now structured data on the entity, and the services turn them into the same
clause vocabulary the rest of the engine consumes - so Magic Resistance reaches
`resolveSaveWithConditions` through the pipeline a player's Ring of Protection
already uses. **A monster with none of these fields behaves exactly as before.**

| Field | Service |
| --- | --- |
| `saveBonuses` / `skillBonuses` | printed totals **replace** the derived value |
| `vulnerable` / `resist` / `immune` | `damageModsOf` (pre-existing) |
| `conditionImmunities` | `conditionImmunitiesOf` (pre-existing) |
| `magicResistance` | clause `saves.advantageAgainstSpells`, keyed off `opts.magical` |
| `rechargeAbilities` | `rollRechargeAbilities` / `spendRechargeAbility` |
| `multiattack` | `monsterAttacksPerAction` → `attacksPerAction` |
| `legendaryActions` | `spendLegendaryAction`, reset at the start of its turn |
| `legendaryResistances` | `useLegendaryResistance` turns a failed save into a success |
| `lairActions` | `lairActionsDue(state, 20)` |
| `regionalEffects`, `reactions`, `traits` | exposed on `monsterProfile` |
| `usesDeathSaves` | `usesDeathSavesFor` - PCs and named NPCs by default |
| `size`, `reach` | `creatureSpaceFt`, `creatureReachFt` |
| `innateSpellcasting`, `spellcasting` | `innateSpellsOf`, `monsterSpellSaveDc` |

**Recharge is rolled and reported, never silent.** At the start of a creature's
turn `INIT_ADVANCE` rolls for every spent ability and logs the result in full:
*"Ancient Red Dragon: Fire Breath recharge - rolled 6 on a d6, needs 5+ - RECHARGED"*, or *"… - still spent"*. `parseRecharge` accepts the printed
notation, including the several ways stat blocks phrase a rest recharge.

**Trait-triggered modifiers.** A trait carrying `effects` is merged like any
other clause, so `{ saves: { advantage: ['wis'] } }` gives a goblin's Brave
advantage without anything in the save path knowing what a trait is.

### Multiclass UI & full class coverage (v9.00)

`LevelUpPanel` is now multiclass-aware. It lists each class with its own level
and subclass, marks the primary, gives every class a **+1** button, and offers
an **Add a class** selector built from `multiclassOptionsFor` - classes already
held are omitted and illegal ones are disabled with their prerequisite failure
as the label. Pending choices, features and resources all come from
`resolveMulticlassProgression`, so each is tagged with the class that owes it
and a subclass prompt applies to the right class.

**All twelve classes now have progression tables.** The eight added in v9.00
(Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard) cover
everything *except* spellcasting, which the slot system already handled: subclass
level and label, ASI levels, features, choices and resources. Each class has at
least two subclasses, and a test enforces that plus globally unique feature ids.

Three of the new tables exercise rules the framework already had:

- **Bard 2** grants `halfProficiency: 'jackOfAllTrades'`.
- **Paladin 5**, **Ranger 5** and **College of Valor 6** all grant Extra Attack,
  giving four more ways to prove it does not stack.
- **Cleric** chooses its subclass at level 1, **Wizard** and **Druid** at 2,
  the rest at 3 - so the subclass prompt fires at a different level per class.

### Level-up UI & wired features (v8.98)

`LevelUpPanel` renders `resolveProgression().pending` - it does not restate any
class's contents. It shows the current features and resources, walks the player
through each outstanding choice (subclass, ASI or feat, expertise picks,
fighting style), and offers a **Level up to N** button that previews what the
next level grants. Feats list their prerequisite failure as the reason they are
disabled. A class with no progression table says so rather than pretending.

Two features that were recorded but inert are now applied:

- **Sneak Attack** - `sneakAttackFor(state, ...)` is pure and asks the
  progression table for the dice rather than knowing what a rogue is. Evaluated
  against the **resolved** advantage, not the requested one, because a target's
  Blinded condition grants advantage through the condition service and is not
  known until the attack resolves. Returned on the plan as `plan.sneakAttack`.
- **Reliable Talent** - `resolveD20` gained `d20Floor`, applied **after**
  advantage and only to checks that include the proficiency bonus. The result
  reports `rawNat` and `floored` so a log can show both numbers.

### Timed effects & the clock (v8.96)

Three features recorded an hour-based duration but nothing advanced a clock, so
each survived until a long rest. `CLOCK_ADVANCE` is the general mechanism:

```
CLOCK_ADVANCE { hours }
  → state.clockHours += hours
  → expireTimedEffects(entities, now)      pure; returns { entities, expired }
      · tempEffects with durationHours + startedAtHour   (potions, item effects)
      · entity.mageArmor.expiresAtHour
      · hpMaxBonuses[].expiresAtHour        (Aid - via removeHpMaxBonus, so the
                                             creature is never left above its max)
  → rechargeItems(..., 'dawn') once per dawn crossed (dawnsBetween, 06:00)
```

An effect with **no** `durationHours` is left alone - turn-based effects belong
to the INIT_ADVANCE ticker. A long rest also calls `rechargeItems(..., 'longRest')`.

Item activation now spends the action economy through the **same
prepare/commit transaction** every other action uses (`useObject` for an action,
`castBonus` / `castReaction` for the others); `activation.action: 'none'` costs
nothing, and `force: true` is the GM override.

### Backgrounds & proficiencies (v8.95)

`entity.background` was free text and `entity.skillProfs` a flat map with no
idea where an entry came from - which makes two rules unenforceable: the
duplicate rule, and expertise's requirement that you already be proficient.

`BACKGROUND_DEFS` is the data (13 PHB backgrounds plus this setting's own eight,
so the character builder's flavour list now confers real grants).
`resolveProficiencies(entity)` is the service: it merges every source **with
provenance**, applies the duplicate rule, and resolves expertise.

Grant sources, in application order:

| # | Source | Field |
| --- | --- | --- |
| 1 | race / species | `raceProfs: { skills, tools, languages }` |
| 2 | class | `classSkills`, `classTools` |
| 3 | background | `BACKGROUND_DEFS[...]` + `background*Choices` |
| 4 | manual | `skillProfs`, `toolProfs`, `languages` - always win |
| 5 | expertise | `expertise`, `toolExpertise` - double an existing proficiency |

**Duplicates never stack.** A background granting a skill the class already gave
does not become expertise; the collision is recorded in `conflicts` so the UI
can prompt for a replacement, and `proficiencyReplacements: { Stealth:
'Investigation' }` moves the grant. `replacementOptionsFor` lists the legal
choices. Expertise that names a skill you lack is refused and reported in
`expertiseErrors` rather than silently creating the proficiency.

**Half proficiency.** `HALF_PROFICIENCY_FEATURES` covers Jack of All Trades (any
ability check) and Remarkable Athlete (STR/DEX/CON only). Both add half the
bonus **rounded down**, and only to checks that do *not* already include
proficiency. `skillCheckMod` and `abilityCheckMod` both apply it, so it reaches
passive checks and the d20 resolver without further wiring.

**Serialization.** `serializeProficiencySelection` / `applyProficiencySelection`
round-trip just the selection state (deep-copied, JSON-safe) without dragging
the whole entity along.

**Selection UI (v8.96).** `BackgroundSelector` sits above `ProficiencyManager`
on the sheet: it picks a background, edits a custom one, consumes the
`toolChoices` and language slots the background offers, and - the point of the
whole duplicate rule - **prompts for a replacement** when a skill is granted
twice, offering only skills from `replacementOptionsFor`. Expertise errors and
the active half-proficiency feature are surfaced there too.

Note the existing `BACKGROUNDS` array is the setting's flavour list (name +
blurb + ability-score improvement) used by the character builder; it is
unchanged, and every entry now has a matching `BACKGROUND_DEFS` record.

### Magic items (v8.94)

`MAGIC_ITEMS` is the item model; the additive `effect` bag (`{ ac, stats,
skills, pp, ... }`) remains for mundane gear but can no longer express a real
magic item, which is why every named item was previously an approximation.

**Two gates, one function.** `magicItemActive(item)` is the only place that
decides whether an item does anything: it must be **equipped**, and if it
requires attunement, **attuned**. Every effect reads through it.

**Attunement.** Limit `ATTUNEMENT_LIMIT_DEFAULT = 3`, overridable per creature
with `attunementLimit`. `canAttune` is the single check (limit, already-attuned,
doesn't-need-it, class requirement) and `ITEM_ATTUNE` enforces it - no caller
can exceed the limit.

**Effect kinds**, all reaching the app through existing services:

| Kind | Example | Consumed by |
| --- | --- | --- |
| `setStats` | Amulet of Health: CON 19 | `effectiveStat` |
| `ac` | Ring of Protection +1 | `resolveArmorClass` |
| `saves` | `{ all: 1 }` | `resolveSaveWithConditions` |
| `advantage` | Cloak: Stealth to hide | `conditionRollContext` (as `grants`) |
| `againstDisadvantage` | Cloak: Perception to see you | `magicItemObserverPenalty` |
| `vision` | Goggles: darkvision 60 | `effectiveDarkvision` |

**Set versus bonus is the important distinction.** A `setStats` value *replaces*
the score and only when it is higher ("no effect if already 19 or higher"), so
duplicates do **not** stack - the best one wins. A `ac` or `saves` value is a
bonus and does stack. Two Rings of Protection give +2; two Potions of Giant
Strength give the stronger score, not the sum.

**Charges and activation.** `charges: { max, recharge, regain }` with windows
`dawn` / `dusk` / `longRest` / `shortRest` (a long rest also triggers `dawn`).
`canActivateItem` / `spendItemActivation` handle the cost; a consumable is
removed and, if it has a duration, becomes a `tempEffect` carrying the same
`magicEffects` shape - so a drunk potion and a worn ring are handled identically.

**Adding an item:** add an entry to `MAGIC_ITEMS`, point a preset at it with
`magicItem: '<name>'`, and leave the preset's `effect` empty. Add a block to
`tests/magic-items.test.js`.

### Wiring (v8.93)

The helpers below were previously computed but never called. They now have live
paths:

| Mechanic | Live path |
| --- | --- |
| Mage Armor | the `Mage Armor` spell (`SPELL_MAGE_ARMOR` / `MAGE_ARMOR_END`); ends the moment armour is donned |
| Stat-block AC | the `explicit` formula is **authoritative** - a non-PC's printed `ac` wins outright rather than competing on value |
| Standing up from Prone | `STAND_UP`, spending `standUpCostFraction` of the creature's speed |
| `conditionAutoEnds` | `applyConditionAutoEnds` runs on `MOVE_COMMIT` and `INIT_ADVANCE` |
| `resolveCheckWithConditions` | `grappleContest`, `MEDICINE_STABILIZE`, escape attempts, and group checks |

Two things worth knowing:

- `STAND_UP` asks the implication **closure**, not the raw label list, so an
  Unconscious creature counts as prone and is refused on the cannot-move rule.
- `conditionRollContext` accepts an `actorId` *and* an `actor`. Stateless
  callers (contests, previews) pass both; the lookup falls back to the passed
  entity rather than losing it.

### Deliberate gaps

- **Sight/hearing dependency** on a check is supplied by the caller
  (`requiresSight` / `requiresHearing`); there is no per-skill table saying
  which checks need which sense.
- **Mage Armor's 8-hour duration is not ticked.** The flag records
  `expiresAtHour`, but nothing expires it automatically - the GM ends it, or a
  long rest does.
- **Nothing inflicts exhaustion or conditions automatically** (forced march,
  starvation). The GM and features apply them.

---

## 13. Recipe: adding a player-driven feature

1. **State:** add the field to DEFAULT STATE; default-guard it in the reducer
   (`state.x || …`) so old sessions migrate cleanly.
2. **Reducer:** add an UPPER_CASE action that applies the mutation purely.
3. **Visibility:** decide what players may see; override it in
   `filterStateForPlayer` if it isn't safe to broadcast verbatim.
4. **Player action:** add a lowercase `handlePlayerAction` case that
   validates, resolves identity from `peerId`, sanitizes the payload, and
   dispatches the reducer action (+ `pushSoon()` for snappiness).
5. **UI:** build the component; players call `playerActionSender(...)`, the DM
   calls `dispatch(...)` directly.
6. **CSS** goes in `index.html`. **Tunables** go in `TUNING`.
7. **Build** (`./build.sh`), verify the bundle (classic runtime, no imports),
   test, ship `index.html` + `app.compiled.js` + `game-data.js` + `styles.css` + `assets/`.
