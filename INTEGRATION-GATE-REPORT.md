# Pre-Prompt-25 Integration Gate - Final Report

<!-- BEGIN GENERATED TOTALS -->

**Generated from `node --test` on 2026-09-19. Do not edit by hand.**

| | |
| --- | --- |
| Test files | 183 |
| Tests | 5899 |
| Passing | 5899 |
| Failing | 0 |
| Node | `22.22.2` |

_All tests pass._

<!-- END GENERATED TOTALS -->

**Status: PASSED** - 17/17 conditions met from a clean checkout.

```
npm ci    → exit 0
npm test  → exit 0
          OK: app.compiled.js matches a fresh build of app.js
          OK: no undefined identifiers in app.js
          OK: all 46 standard spells satisfy the schema
          17/17 conditions met - GATE PASSED
          # (totals are generated - see the table at the top of this report)
```

The gate runs in `pretest`, so it executes **before** any test on every run and
from any clean checkout. Prompt 25 may begin.

---

## 1. Fully integrated prompt requirements

Each of these is enforced by a live reducer or service and covered by tests that
drive the real workflow.

| Area | Authoritative entry point | Enforced |
|---|---|---|
| Rules version | `state.table.rulesVersion` | Exists, migrates (`dnd5e-2014`), serializes, reaches rest + cast services |
| Build integrity | `pretest` | Clean build → freshness byte-compare → undefined-identifier scan → spell schema → this gate |
| Spell casting | `prepareSpellCast` / `commitSpellCast` / `SPELL_CAST` | All 18 steps atomically; every cast path routes through it |
| Cast authorization | same | Ownership host-side; `skipSlot` bypass removed |
| Components / materials | `spellRequirementsCheck` | V/S/M, focus + pouch substitution, structured costly materials |
| Slot selection | cast transaction | cantrip / standard / pact / feature / ritual, with `slotIndex` + `resourceId` |
| Scaling | `scaleSpell` via the plan's `scaledSpell` | Cantrips on total character level; leveled on the **spent** slot |
| Casting time | `canCastByTime` | Action/bonus/reaction/ritual, bonus-action spell rule both directions |
| Action economy | `prepareAction` / `commitAction` / `ACTION_TAKE` | All 19 action kinds, attacks-within-Attack, dedupe |
| Movement | `prepareMove` / `MOVE_TOKEN` | Clamp and charge computed together - jump exploit closed |
| Positioning | movement transaction | Modes, terrain, spaces, footprints, mounts, dragging, falling |
| Effect scheduler | `MOVE_TOKEN` + `INIT_ADVANCE` | Entry/turn triggers fire automatically; once-per-turn dedupe |
| Weapon attacks | `prepareWeaponAttack` / `WEAPON_ATTACK` | Data-driven bonus, ability, reach/range, ammo, loading, TWF |
| Grapple / shove | `GRAPPLE_ATTEMPT` / `SHOVE_ATTEMPT` | Consume one attack; auto-end on separation/incapacitation |
| Cover & targeting | `targetingContext` | Host-computed; applies to real attacks and Dex saves |
| HP pipeline | `applyHpTransaction` / `ENTITY_HP_ADJUST` | `ENTITY_PATCH` sealed; UI edits routed through it |
| Death / objects | `ENTITY_RESURRECT` / `ENTITY_REPAIR` | Healing cannot revive or repair; massive > nonlethal |
| Rest & Hit Dice | `LONG_REST` / `SHORT_REST` / `SPEND_HIT_DIE` | 24h default on 2014, multiclass pools, die-by-die spending |
| Roll modifiers | `collectRollModifiers` → resolver | Generic; live attacks and saves; source attribution |
| Multiplayer parity | host handlers reuse the same services | DM and host produce identical results |
| Conditions (v8.90) | `CONDITION_RULES` → `conditionProfile` → services | All 14 core 2014 conditions, every clause data-driven and consumed through the shared roll/movement/economy services |
| Movement preview producer (v9.38) | `movementPreviewFor`; `onAimPointer` on `MapCanvas` | The pointer now drives the ghost and shading; the region is opt-in and rAF-throttled |
| Movement overlay and aiming (v9.37) | `MovementOverlay`; `areaAimAt`; `opportunity.from` | The move ghost and reachable region are drawn; cones aim by drag; opportunity attacks name their creatures |
| Area overlay and radial (v9.36) | `AreaPreviewOverlay`; `RadialTokenMenu` → `workflowForRadialCategory` | The placed area is visible on the map; the radial opens the same flows as the drawer |
| Entry points (v9.35) | `onPlaceArea` on `MapCanvas`; `workflowForRadialCategory`; the spell picker | Area placement by pointer, and the radial routing through the drawer's own options |
| Flow adjudication (v9.34) | `adjudicateIntent` cases for attack, spell, contest and standard | Click to resolution is connected end to end; the host re-validates every flow payload |
| Workflow router (v9.33) | `workflowForOption`; `WorkflowHost`; `StandardActionForm` | The drawer now OPENS its flows; every option routes or is an explicit no-flow |
| Workflow components (v9.32) | `WorkflowFrame`; `AttackFlow` / `CastFlow` / `AreaFlow` / `MovementFlow` / `ContestFlow`; `TargetList` | Every model from prompts 14-19 now has a renderer sharing one Back/Cancel/Confirm frame |
| Consolidation (v9.31) | `spellAreaContains` → `areaContains`; `tokenTargetValidity` → `evaluateTarget`; bounded `reachableRegion` | Duplicate geometry and targeting implementations removed; preview cost cut from 104ms to 13ms |
| Movement workflow (v9.31) | `movementStatus` / `movePreview` / `reachableRegion`; `explainMoveCorrection` | Clamped previews, eight distinct modes, opportunity warnings, and host-correction explanations |
| Area placement (v9.30) | `areaContains` (cone and emanation added); `areaPreview` / `areaRevalidate` | Six shapes, preview-before-commit, rotation, cover from the origin, and host difference reporting |
| Unified target selection (v9.29) | `makeTargetingContext` / `evaluateTarget`; the three callers funnel through it | One resolver for attacks, spells, features, items and Help; token-instance selections; map scoping in one place |
| Spell-casting workflow (v9.28) | `spellTargeting` / `castSlotSources` / `castReview` | Six-stage flow with derived targeting, Pact Magic as its own source, and scaled values shown before confirmation |
| Grapple and shove (v9.27) | `contestEligibility` / `contestPreview` / `CONTEST_RESOLVE`; forced movement for a push | Full contest flow with defender choice, timeout, escape in the Actions list, and drag penalty shown |
| Weapon-attack workflow (v9.26) | `attackOptionsFor` / `attackTargetsFor` / `attackPreview`; `WEAPON_ATTACK` | Staged attack flow with pre-commitment numbers, target highlighting, and a preview that spends nothing |
| Radial as a shortcut (v9.25) | `radialPanelParity`; `radialPlacement`; `RadialTokenMenu` | Every radial action reachable from the panel, keyboard-navigable segments, edge-aware placement, and an off switch |
| Token selection (v9.24) | `tokenClickIntent` / `tokenVisualStates` / `tokenAccessibleLabel`; `TokenView` | Single-click selection, keyboard activation, long-press, five non-colour-only states, current-map scoping |
| Mobile bottom navigation (v9.23) | `MobileBottomNav`; `mobileNavModel`; the dead `.open` CSS removed | Five destinations with the map always mounted; Party/Sheet/Foes/Chat were previously unreachable on a phone |
| Right dock redesign (v9.22) | `PlayerRightDock`; `dockTabModel` / `dockBadges` | Persistent HUD above five tabs, severity badges, keyboard navigation, tablet-responsive |
| End Turn workflow (v9.21) | `END_TURN` → `INIT_ADVANCE`; `endTurnSummary`; `EndTurnControl` | Three campaign modes, non-blocking warnings, duplicate guard, rebindable shortcut |
| Unified standard actions (v9.20) | `STANDARD_ACTION` → `prepareAction` / `commitAction`; `ECONOMY_TAKE_ACTION` delegates | One path for all eight standard actions, with required details, specific confirmations, event log, and proven player/DM equivalence |
| Drawer mounted & effect coverage (v9.19) | `ActionDrawer` in the dock's Actions tab; `featureEffectCoverage` | The drawer has a home; every feature any class grants has an effect entry, enforced by a build-failing test |
| Drawer component & feature effects (v9.18) | `ActionDrawer`; `FEATURE_EFFECTS` in `FEATURE_USE` | Rendered drawer with keyboard focus preserved across list updates; feature actions apply their effect or name what the table adjudicates |
| Action drawer (v9.17) | `selectActionDrawer` over `ACTION_KINDS`, features, spells, equipment and conditions | Six sections by resource cost; every option carries cost, availability, reason, source, targeting and uses |
| Component call-site coverage (v9.16) | `dm-request-overlay.test.js` via `load-app-render` | The four previously-uncoverable UI controls now turn tests red; the harness limitation was mistaken |
| GM correction review (v9.15) | `liveRequests`; `requestSummary`; `CORRECTION_APPLY` staleness guard | Accepting a queued correction applies it; the review card shows before/after and reason; six stale status filters fixed |
| Turn-resource corrections (v9.14) | `TurnCorrectionMenu`; `canCorrectResource` / `buildCorrection`; `CORRECTION_APPLY` / `CORRECTION_UNDO` | Three permission modes, required reason, bounded values, campaign-state audit log, DM undo |
| Sticky combat HUD (v9.13) | `StickyCombatHUD` → `selectPlayerCombatSummary` | Persistent HUD across all dock sections; five states distinguished by glyph as well as colour; read-only counters with a separate validated correction menu |
| UI wiring (v9.12) | `PartyPanel` / `ActionEconomyBar` → `selectPlayerCombatSummary`; `player_intent` channel → `processIntent` | HUD reads authoritative values; the intent lifecycle carries live traffic |
| Player combat summary (v9.11) | `selectPlayerCombatSummary` | One view model for the combat HUD in three densities, computed entirely from rules services |
| Player intent lifecycle (v9.10) | `makePlayerIntent` / `adjudicateIntent` / `processIntent`; `intentTrackerReducer` | One lifecycle for every player action; duplicate suppression by intent id; success never announced before acceptance; corrections carry what changed |
| Player field permissions (v9.09) | `canPlayerWriteField`; `validateLiveAction`; `SPELL_SLOT_SPEND` / `PACT_SLOT_SPEND` / `ENTITY_TEMP_HP` | Five categories replacing one flat whitelist; damage immunities and derived stats no longer player-writable; live resources validated |
| Player UI state model (v9.08) | `playerUiReducer` + selectors; `REQUEST_STATUS` | Three-tier state separation enforced by test; modal and workflow exclusivity; seven-state request lifecycle with expired distinct from rejected |
| Final rules audit (v9.07) | `RULES-MATRIX.md` | 24-area traceability matrix; one test asserting incorrect Moonbeam mechanics rewritten; cross-system regression suite added; two stale manual-only entries corrected |
| Map lighting (v9.06) | `computePlayerVisionSources` quality tags → the fog renderer | Bright and dim rings, desaturated darkvision, ambient light drives the fog |
| Player vision & stat block UI (v9.05) | `computePlayerVisionSources` → `sensesOf`; `StatblockEditor` | Invisible creatures are no longer transmitted to clients that cannot see them; monster fields are editable without JSON |
| Environment tab (v9.04) | `EnvironmentPanel` → the environmental reducers | Rules switches, ambient light, hazards, travel and load in one DM panel; variant encumbrance now reaches `moveBudget` |
| Adventuring & environment (v9.03) | `resolveHazardSave` → universal d20 resolver; `applyEnvironmentalDamage` → central HP pipeline | Capacity, variant encumbrance, falling, suffocation, underwater, weather, forced march, food and water, travel pace - each independently switchable |
| Lighting & senses (v9.02) | `lightLevelAt` / `canSeeCreature` / `knowsLocationOf` | Three light levels, two obscurity states, five senses, invisibility and hiding, and a full passive Perception with the +/-5 swing |
| Monsters & NPCs (v9.01) | structured statblock fields → `monsterProfile` and the shared clause vocabulary | Save/skill bonuses, magic resistance, recharge with reported rolls, multiattack, legendary actions and resistances, lair and regional effects, innate spellcasting, trait modifiers |
| Multiclass UI & class coverage (v9.00) | `LevelUpPanel` → `multiclassOptionsFor` / `addClassLevel`; all 12 `CLASS_PROGRESSION` tables | Per-class levelling and subclass choice, prerequisite-aware class addition, non-spell progression for every class |
| Multiclassing (v8.99) | `classEntriesOf` → `resolveMulticlassProgression`; `spellSlotsMaxFor` | Independent class levels, prerequisites, reduced proficiencies, per-class hit dice and preparation, combined spell slots with Pact Magic separate, Extra Attack non-stacking |
| Level-up UI (v8.98) | `LevelUpPanel` → `resolveProgression().pending`; `sneakAttackFor`; `d20Floor` | Guided level-up with choices and prerequisites; Sneak Attack and Reliable Talent applied |
| Level progression (v8.97) | `CLASS_PROGRESSION` → `resolveProgression` → shared services | Class and subclass features by level, ASIs and feats, choices, prerequisites, and resource pools with rest recharge |
| Timed effects (v8.96) | `CLOCK_ADVANCE` → `expireTimedEffects` | Hour-based durations end on the clock: potions, Mage Armor, Aid; dawn recharges items |
| Backgrounds & proficiencies (v8.95) | `BACKGROUND_DEFS` → `resolveProficiencies` → `skillProfLevel` / `skillCheckMod` | Background skills, tools, languages, equipment and features; class and racial grants; expertise; half proficiency; the duplicate-replacement rule |
| Magic items (v8.94) | `MAGIC_ITEMS` → `magicItemActive` → shared services | Equipped/attuned gates, 3-item attunement limit, charges and recharge windows, consumables, and six effect kinds; five named items corrected |
| Armour (v8.92) | `AC_FORMULAS` → `resolveArmorClass`; `armorClauses` → `conditionProfile` | Mutually-exclusive AC formulas; non-proficiency penalties without an equip gate; heavy-armour Strength requirement with feature exemptions |
| Exhaustion (v8.91) | `EXHAUSTION_LEVELS` → `setExhaustionLevel` / `LONG_REST` | Six cumulative levels; HP maximum applied and removed safely; long-rest recovery with the food-and-drink proviso; death at 6; legacy label migrated |

---

## 2. Helper-only features that remain

Implemented, tested, and exposed - but not yet invoked by a live reducer or UI
control. Prompt 25+ can wire these without new rules work.

- `canCarry` / `canDrag` - capacity + size gating exists; no carry/drag UI action.
- `feetToSquares` - grid conversion helper; no caller needs it yet.
- `isTeleport` / `forcedMovementConsumesBudget` - semantics captured; the movement
  transaction encodes the same behaviour directly via `kind`.
- `mountMovesOnRiderTurn` - controlled-mount semantics are applied inline in
  `MOVE_TOKEN`; the helper itself is unused.
- `pendingOpportunityFor` - detection + the `OPPORTUNITY_PENDING` / `RESOLVE`
  flow are complete and tested, but no live UI yet raises the prompt.
- **(resolved v8.93)** `standUpCostFraction`, `conditionAutoEnds` and
  `resolveCheckWithConditions` all have live paths now - see CONTRACT §12
  "Wiring". What remains helper-only is listed below.
- **(resolved v8.96)** Hour-based durations now end on `CLOCK_ADVANCE` (Mage
  Armor, magic-item effects, Aid); `ITEM_RECHARGE` runs on a long rest and at
  each dawn; item activation spends the action economy; background selection,
  tool/language choices and duplicate-replacement all have a UI
  (`BackgroundSelector`), and attunement has one (the attunement bar and
  per-item Attune/Use buttons).
- **(resolved v9.00)** All twelve classes have progression tables, and the
  level-up panel is multiclass-aware.
- **(resolved v9.04)** The Environment tab gives the GM controls for every
  subsystem, and variant encumbrance now reaches `moveBudget`.
- Environmental effects are still **GM-triggered, not automatic**: nothing
  watches the clock to demand an hourly heat save, and no movement path applies
  the underwater rules. That is deliberate - deciding when to interrupt play is
  a design question - but it means the Hazards tab is the only way these fire.
- Lighting has **no UI and no map rendering**. `lightLevelAt` and
  `canSeeCreature` are complete and tested, but `filterStateForPlayer` still
  decides token visibility by its own rules rather than calling them, and
  nothing draws light radii on the canvas.
- The printed-save-bonus test does not currently fail when the short-circuit in
  `savingThrowMod` is removed (see tests/README.md). The behaviour is correct
  and verified by hand; the *test* is not discriminating, and should be
  tightened before it is relied on.
- The eight classes added in v9.00 cover everything except **spellcasting
  progression** - spells known, cantrips known and prepared lists are still
  driven by the slot system and the sheet, not by a per-level table.
- **(resolved v8.98)** Sneak Attack and Reliable Talent are applied; the
  level-up UI exists. Still recorded but not applied: **Cunning Action** (a flag
  no bonus-action menu reads) and **Evasion** (no area-effect save path halves
  or negates on it).
- What remains helper-only: nothing *causes* exhaustion or conditions
  automatically (forced march, starvation); there is no per-skill sight/hearing
  table; and the clock must be advanced by the GM - no rest or travel action
  advances it implicitly.

---

## 3. Manual-only rules (GM adjudicates)

- **(corrected v9.07)** *Advantage/disadvantage from conditions* was listed here
  as manual. It has been fully automatic since v8.90 - `conditionRollContext`
  derives it for attacks, checks and saves. Entry removed as stale.
- **Teleport placement** - `TOKEN_TELEPORT` and the `teleport` movement variant
  exist; there is no teleport *tool* in the UI (GM free-drag covers it).
- **Ritual timing** - ritual casting is selectable and validated, but the extra
  10 minutes is not tracked on a clock.
- **(corrected v9.07)** *Encumbrance* was listed here as computed-but-unenforced.
  Variant encumbrance has reached `moveBudget` since v9.04 and is switchable in
  the Environment tab. Entry removed as stale.
- **Cover for spell *attack* rolls** - applied for weapon attacks and Dex saves;
  spell attack rolls still take cover via the GM override path.

---

## 4. Known deviations

1. **`toast` prop in two sheet components** - `typeof`-guarded, so it cannot
   crash, but it always resolves to the fallback and those toasts never fire.
   Reported as a warning by `check-undefined`, deliberately not fixed (threading
   it through both modals was out of scope).
2. **Legacy `activeSpellEffects`** - migrated into the scheduler on first
   `INIT_ADVANCE` rather than eagerly at load; a save that never advances a turn
   keeps its legacy records (inert, since the ticker skips migrated entries).
3. **`SpellCastSection_UNUSED`** - dead component retained for reference. It is
   scanned by the undefined-identifier gate and renders correctly, but is not
   reachable from the UI.
4. **Average-damage setting is table-wide** - no per-effect override.
5. **Armour proficiency is inferred for homebrew classes** - a PC whose class
   is not in `CLASS_INFO` and has no explicit `armorProfs` is treated as
   proficient with everything, rather than nothing. Safer default, but it means
   a homebrew class never takes the non-proficiency penalty until its
   `armorProfs` are set on the gear tab.
6. **Exhaustion is not applied automatically** - nothing in the app *causes*
   exhaustion (forced march, starvation, certain spells). The GM adds and
   removes levels; features do so via `EXHAUSTION_ADJUST`.
5. **`rulesVersion` accepts both `2014` and `dnd5e-2014`** - normalized in the
   cast transaction rather than migrated to a single spelling.

---

## 5. Test coverage by live gameplay entry point

See the generated totals at the top of this report. They are produced by
`npm run report` from actual test output rather than typed by hand, because the
hand-maintained figures had drifted apart by several hundred tests.

| Entry point | Covered by |
|---|---|
| Spell manager cast | `spell-cast-transaction`, `spell-requirements`, `casting-time` |
| Token menu cast (self/target/area/summon) | `spell-cast-transaction`, `render-smoke`, `token-menu-workflow` |
| DM cast | `spell-cast-transaction`, `integration-gate` |
| Player → host cast | `spell-cast-transaction`, `integration-gate` |
| Spell scaling & previews | `spell-scaling`, `cast-level-propagation` |
| Pact Magic / progressions | `pact-magic`, `caster-progression` |
| Spell schema & library | `spell-schema` + `tools/validate-spells.js` |
| Player movement (host-validated) | `movement-transaction`, `integration-gate` |
| DM / forced / teleport / group movement | `movement-transaction`, `positioning` |
| Jumping | `jumping`, `movement-transaction` |
| Movement penalties | `movement-penalties`, `movement` |
| Scheduled effects (entry + turn) | `scheduler-integration`, `effect-scheduler` |
| Weapon attacks | `live-combat`, `weapon-attacks` |
| Grapple / shove / escape | `live-combat`, `grapple-shove`, `action-service` |
| Opportunity attacks | `live-combat`, `action-service` |
| Action economy (all 19 kinds) | `action-service` |
| Cover / sight / line of effect | `targeting-cover`, `cover` |
| HP / death / healing / objects | `hp-invariants`, `hp-pipeline`, `death-saves` |
| Rest & Hit Dice | `rest-hitdice`, `long-rest`, `hit-dice` |
| Roll modifiers | `roll-modifiers`, `integration-gate` |
| Component rendering | `render-smoke`, `token-menu-workflow` |
| Security / state filtering | `security-filter` |
| End-to-end scenario | `integration-gate` |
| Conditions (every clause, all 14) | `conditions-matrix` |
| Exhaustion (levels, HP max, rests, death) | `exhaustion` |
| Armour (formulas, proficiency, strength, shields) | `armor` |
| Follow-up wiring (Mage Armor, stand up, lapses, checks) | `followups` |
| Magic items (attunement, charges, five named items) | `magic-items` |
| Backgrounds, expertise, half proficiency, serialization | `backgrounds` |
| Clock, timed expiry, item economy, recharge | `timed-effects` |
| Progression, subclasses, ASIs, feats, resources | `progression` |
| Level-up flow, Sneak Attack, Reliable Talent | `levelup` |
| Multiclassing (prereqs, slots, hit dice, migration) | `multiclass` |
| Monster statblock mechanics | `monsters` |
| Lighting, senses, obscurity, passive Perception | `lighting` |
| Capacity, falling, suffocation, underwater, weather | `environment` |

### Rewritten to use real workflows

- `effect-scheduler` - fixtures no longer rely on damaging the caster; the
  integration path is covered by `scheduler-integration`, which moves tokens and
  advances initiative instead of dispatching `EFFECT_FIRE`.
- `death-saves` - the natural-20 branch is now asserted rather than being an
  intermittent failure.
- `spell-requirements`, `spell-cast-transaction` - updated to structured
  material data and explicit component tri-state.
- `positioning` - mount fixture uses a Large mount, since `canRide` is enforced.

---

## Runtime and reproducibility (v9.39)

### The supported runtime is declared, not guessed

`package.json` previously declared `node >=18`. The committed lockfile pins
Babel 8, and **23 packages in that tree require `^22.18.0 || >=24.11.0`** - so a
Node 18 user got either a confusing `npm ci` failure or a build that broke at
parse time. The declaration was simply false.

Chosen strategy: **raise the requirement to the truth** rather than downgrade
Babel. `engines.node` is now `^22.18.0 || >=24.11.0`, and `tools/check-engines.js`
enforces it as the first step of `pretest`, so an unsupported Node fails with a
sentence naming the cause instead of a Babel syntax error twenty lines deep.

### Every dependency resolves from the public registry

A check over `package-lock.json` confirms no entry resolves anywhere other than
`registry.npmjs.org`. `update-browserslist-db` is present as a transitive
dev-only dependency of `browserslist`; it declares no engine constraint and
installs cleanly. Nothing requires a private or non-npm source.

### `npm test` rebuilds first

`pretest` runs, in order: engine check → `build.sh` → **compiled-bundle
freshness check** → undefined-identifier check → spell schema → integration
gate. The freshness check is retained: `app.compiled.js` must match a fresh
build of `app.js`, so a stale bundle can never pass.

### Totals are generated

`npm run report` writes the totals block from actual `node --test` output. The
previous hand-maintained figures had drifted apart by several hundred tests
(one line claimed 2881, another 2336). The prose in this report remains
hand-written; no count in it is.

### Call sites are verified, not assumed

`tests/player-interface-mount.test.js` renders `PlayerInterface` itself and
asserts the required surfaces mount. This was not a hypothetical gap:
**`MobileBottomNav` was built, tested and documented in v9.23 and had zero call
sites** until this test was written. Removing its call site again turns 4 tests
red.
