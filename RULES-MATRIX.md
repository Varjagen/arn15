# 2014 D&D 5e Rules Traceability Matrix

**Audit date:** v9.07 · **Suite:** 68 test files, 1499 tests, 0 failures ·
**Gates:** build freshness, undefined identifiers, spell schema, 17/17 integration - all pass.

Every row records: what is **implemented**, the **source module** (function or
table in `app.js`), the **automated tests**, what remains **manual**, the
**known limitation**, and how a **GM override** works.

Throughout, "GM override" has a consistent meaning: the GM may set the resulting
field directly on the entity, and an explicit value always beats a derived one.
That is a deliberate design rule, not a per-feature accident.

---

## 1. Ability checks

| | |
| --- | --- |
| **Implemented** | `d20 + ability modifier + proficiency / expertise / half proficiency + item bonus`. Advantage and disadvantage combine and cancel. Sight- and hearing-dependent checks auto-fail for Blinded / Deafened. Reliable Talent floors the die at 10 for proficient checks. |
| **Source** | `resolveCheckWithConditions` (L1868), `skillCheckMod`, `abilityCheckMod`, `resolveD20` (L19238) |
| **Tests** | `d20-service`, `proficiencies`, `backgrounds`, `levelup` (Reliable Talent), `conditions-matrix` (auto-fail) |
| **Manual** | Whether a given check *requires* sight or hearing - the caller passes `requiresSight` / `requiresHearing`. There is no per-skill sense table. |
| **Limitation** | Group checks and passive-vs-active contests are supported, but "working together" (help granting advantage) is a generic modifier, not a modelled action. |
| **GM override** | `entity.skillProfs[skill]` sets any level directly; `skillBonuses[skill]` on a stat block replaces the whole computation. |

## 2. Saving throws

| | |
| --- | --- |
| **Implemented** | Proficiency, magic-item bonuses (Ring of Protection `+1` to all), condition-driven auto-failure (STR/DEX while Paralyzed, Petrified, Stunned, Unconscious), condition disadvantage (Restrained on DEX, exhaustion 3 on all), advantage (Danger Sense on DEX, Magic Resistance vs spells), and Legendary Resistance converting a failure to a success. |
| **Source** | `resolveSaveWithConditions` (L1842), `savingThrowMod`, `useLegendaryResistance` |
| **Tests** | `conditions-matrix`, `exhaustion`, `armor`, `magic-items`, `monsters`, `cross-system` |
| **Manual** | Whether an effect is *magical* - the caller passes `opts.magical`, which gates Magic Resistance. |
| **Limitation** | Aura of Protection (Paladin 6, adding CHA to allies' saves) is a recorded feature with no mechanical effect. |
| **GM override** | `saveBonuses[ability]` replaces the derived total outright. |

## 3. Attacks

| | |
| --- | --- |
| **Implemented** | Prepare/commit transaction with ability selection, proficiency, range and reach, cover, ranged-in-melee disadvantage, condition advantage from both sides, Prone's range-dependent rule, auto-crit within 5 ft of a Paralyzed/Unconscious target, Sneak Attack eligibility, and Multiattack. |
| **Source** | `prepareWeaponAttack` (L4946), `commitAction`, `conditionRollContext`, `sneakAttackFor` |
| **Tests** | `weapon-attacks`, `targeting-cover`, `cover`, `conditions-matrix`, `levelup`, `monsters`, `cross-system` |
| **Manual** | Improvised weapons and called shots. Underwater attack restrictions are computed (`underwaterAttackRule`) but the attack path does not consult them. |
| **Limitation** | Two-weapon fighting and the ready action are modelled in the economy but not as distinct attack transactions. |
| **GM override** | `attacksPerAction` on the entity beats both Multiattack and Extra Attack; `advMode` can be forced on any request. |

## 4. Damage and healing

| | |
| --- | --- |
| **Implemented** | One pipeline for every source. Resistance halves (rounding down), vulnerability doubles, immunity negates, and resistance plus vulnerability cancel. Massive damage causes instant death. Healing cannot exceed the maximum and cannot revive the dead. Critical hits double dice, not modifiers. |
| **Source** | `applyHpTransaction` (L5881), `autoMitigationForType`, `damageModsOf`, `applyEnvironmentalDamage` (L4807) |
| **Tests** | `hp-pipeline`, `hp-invariants`, `mitigation`, `healing-spells`, `environment`, `cross-system` |
| **Manual** | Damage type for improvised sources - the caller supplies it. |
| **Limitation** | **`applyHpTransaction` expects an already-mitigated amount.** The attack path resolves resistance upstream; `applyEnvironmentalDamage` resolves it itself. Passing a raw number directly silently ignores resistance. |
| **GM override** | `mitigation` may be forced per transaction to `'normal'`, `'resist'`, `'immune'` or `'weak'`. |

## 5. Temporary hit points

| | |
| --- | --- |
| **Implemented** | Absorbed before hit points; they do not stack - a new grant only replaces an existing pool if it is larger. Not affected by healing. |
| **Source** | `grantTempHp` (L6016), `applyHpTransaction` |
| **Tests** | `temp-hp`, `cross-system` |
| **Manual** | None. |
| **Limitation** | Temporary hit points have no duration; they persist until spent or cleared. |
| **GM override** | `grantTempHp(entity, n, 'replace' \| 'keep')` forces either outcome. |

## 6. Death and dying

| | |
| --- | --- |
| **Implemented** | Dropping to 0 knocks a creature unconscious; death saves at three successes / three failures; a natural 20 restores 1 hit point; a natural 1 counts double; damage while at 0 causes an automatic failure and a critical hit causes two; stabilising; massive damage instant death; exhaustion 6. |
| **Source** | `applyHpTransaction`, `MEDICINE_STABILIZE`, `usesDeathSavesFor` (L4326 region), `setExhaustionLevel` |
| **Tests** | `death-saves`, `stabilize-nonlethal`, `hp-invariants`, `exhaustion` |
| **Manual** | Who counts as a "named NPC" for death-save eligibility. |
| **Limitation** | Death saves are not rolled automatically at the start of a turn; the GM or player triggers them. |
| **GM override** | `usesDeathSaves: true \| false` forces eligibility either way. |

## 7. Concentration

| | |
| --- | --- |
| **Implemented** | One concentration effect at a time; a new cast ends the old; a CON save on damage at DC 10 or half the damage, whichever is higher; incapacitation and death end it. |
| **Source** | `endConcentration`, the `CONCENTRATION_CHECK` path in `applyHpTransaction`, `conditionIsIncapacitating` |
| **Tests** | `concentration-damage`, `concentration-library`, `control-spells`, `exhaustion` |
| **Manual** | Concentration on non-spell effects. |
| **Limitation** | The save is prompted, not auto-rolled, when `concentrationCheck` is returned on the transaction result. |
| **GM override** | `ENTITY_PATCH` clears `concentratingOn` directly. |

## 8. Conditions

| | |
| --- | --- |
| **Implemented** | All **14** core conditions as data in `CONDITION_RULES`, plus the terminal states Dead and Broken. Every clause - advantage, auto-failed saves, speed, action economy, crits, visibility, dropped items, falling prone, resistance, condition immunity - is derived, never hardcoded. Implications resolve transitively (Unconscious → Incapacitated + Prone). |
| **Source** | `CONDITION_RULES` (L446), `conditionProfile` (L1448), `conditionRollContext` |
| **Tests** | `conditions-matrix` (109 tests, one per clause, with a completeness check that fails the build if a table key is untested) |
| **Manual** | Nothing *inflicts* conditions automatically outside spells and the hazard path. |
| **Limitation** | `conditionAutoEnds` covers only Grappled's two documented end conditions. |
| **GM override** | `ENTITY_TOGGLE_CONDITION`; `conditionImmunities` blocks application entirely. |

## 9. Movement

| | |
| --- | --- |
| **Implemented** | Speed by mode, difficult terrain, crawling while prone, Dash, squeezing, condition speed overrides (Grappled/Restrained to 0), exhaustion halving and zeroing, heavy-armour and encumbrance flat penalties, class speed bonuses, opportunity attacks, forced movement and teleportation exempt from Frightened's approach restriction. |
| **Source** | `moveBudget` (L1164), `prepareMove` (L6295), `conditionSpeedProfile` |
| **Tests** | `movement`, `movement-penalties`, `movement-transaction`, `positioning`, `jumping`, `conditions-matrix`, `environment`, `cross-system` |
| **Manual** | Underwater movement cost (`underwaterMovementFor` is computed but not consulted by `prepareMove`). |
| **Limitation** | Ordering is fixed: flat penalties apply to base speed, then multipliers. This is correct for the cases tested but is a convention, not a rule the books state. |
| **GM override** | Forced and teleport movement kinds bypass willing-movement restrictions; `isDM` bypasses budget checks. |

## 10. Resting

| | |
| --- | --- |
| **Implemented** | Short rest restores short-rest feature resources, Pact Magic slots and hit dice spending; long rest restores hit points, half the hit dice, all slots, all feature uses, magic-item charges, and reduces exhaustion by one **given food and drink**. |
| **Source** | `SHORT_REST` / `LONG_REST` reducers, `restoreFeatureUses`, `rechargeItems`, `exhaustionAfterLongRest` |
| **Tests** | `long-rest`, `rest-hitdice`, `hit-dice`, `exhaustion`, `timed-effects`, `progression` |
| **Manual** | Interrupting a rest. |
| **Limitation** | A creature at 0 hit points cannot benefit from a long rest, which is enforced - but partial rests are not modelled. |
| **GM override** | `foodAndDrink: false` on the action suppresses exhaustion recovery. |

## 11. Action economy

| | |
| --- | --- |
| **Implemented** | Action, bonus action, reaction and free interaction per turn, tracked per creature; Extra Attack; Action Surge; item activation spending the declared cost; reactions blocked while incapacitated or surprised. |
| **Source** | `prepareAction` / `commitAction`, `normalizeEconomy`, `ACTION_KINDS`, `conditionEconomyProfile` |
| **Tests** | `action-economy`, `action-service`, `live-combat`, `timed-effects`, `cross-system` |
| **Manual** | Readied actions fire by GM decision. |
| **Limitation** | Legendary actions are tracked separately from the normal economy and reset on `INIT_ADVANCE`, not on a strict "end of another creature's turn" trigger. |
| **GM override** | `ECONOMY_TOGGLE` sets any slot; `force: true` bypasses the check. |

## 12. Weapons

| | |
| --- | --- |
| **Implemented** | Proficiency by category, finesse, versatile, thrown, two-handed, loading, reach, ammunition, ranged range bands with long-range disadvantage, and magic bonuses. |
| **Source** | `weaponAttackAbility`, `weaponIsRanged`, `prepareWeaponAttack` |
| **Tests** | `weapon-attacks`, `range-buffer`, `armor` (proficiency penalties) |
| **Manual** | Improvised weapons; the underwater weapon list is computed but not enforced. |
| **Limitation** | Weapon mastery properties are not a 2014 concept and are absent by design. |
| **GM override** | A weapon's fields are freely editable, including an explicit `attackBonus`. |

## 13. Armour and AC

| | |
| --- | --- |
| **Implemented** | **7 mutually exclusive** base formulas - explicit/stat-block, worn, natural, Mage Armor, Barbarian and Monk Unarmored Defense, unarmoured. Exactly one applies; shields and magic items stack on top. Light/medium/heavy Dexterity rules, including heavy armour contributing exactly 0 (not a negative). Non-proficiency penalties without an equip gate. Heavy-armour Strength requirement with feature exemptions. |
| **Source** | `AC_FORMULAS` (L2291), `resolveArmorClass` (L2410), `armorProficiencyState`, `heavyArmorStrengthCheck` |
| **Tests** | `armor` (67 tests), `magic-items`, `progression`, `cross-system` |
| **Manual** | None. |
| **Limitation** | A Draconic Sorcerer's `acFormula: 'draconic'` is granted by the progression table but has no registry entry, so it falls through to unarmoured. |
| **GM override** | `acOverride` wins outright; `acFormula` forces a specific eligible formula. |

## 14. Spell slots

| | |
| --- | --- |
| **Implemented** | Full, half and third-caster tables; multiclass caster levels combine and read the full-caster table; a single-class caster uses its own table; subclass-granted casting (Eldritch Knight, Arcane Trickster) counts. |
| **Source** | `spellSlotsMaxFor` (L17941), `casterClassesOf`, `subclassCasterKind` |
| **Tests** | `caster-progression`, `slot-enforcement`, `multiclass` |
| **Manual** | None. |
| **Limitation** | Spells known and cantrips known are not tabulated per class per level; the sheet tracks them freely. |
| **GM override** | `spellSlotsMax` per level overrides the derived table entirely. |

## 15. Pact Magic

| | |
| --- | --- |
| **Implemented** | Kept entirely separate from standard slots; Warlock levels contribute nothing to the multiclass caster level; recharges on a short rest; Mystic Arcanum tracked as long-rest resources. |
| **Source** | `pactSlots` on the entity, `spellSlotsMaxFor` (Warlock exclusion), `SHORT_REST` |
| **Tests** | `pact-magic`, `multiclass` |
| **Manual** | Choosing which Arcanum spell is bound. |
| **Limitation** | Invocations are a recorded choice with no mechanical effect. |
| **GM override** | `pactSlots` is directly editable. |

## 16. Spellcasting restrictions

| | |
| --- | --- |
| **Implemented** | Verbal, somatic and material components; costly and consumed materials; ritual eligibility; preparation and known-spell lists; class spell-list eligibility; slot availability; **armour you are not proficient with prevents casting entirely**; one-leveled-spell-per-turn with a bonus action. |
| **Source** | `spellRequirementsCheck` (L18675), `armorBlocksSpellcasting`, `castingTimeEconomyPatch` |
| **Tests** | `spell-requirements`, `casting-time`, `spell-cast-transaction`, `armor` |
| **Manual** | Whether a creature is silenced or bound for component purposes. |
| **Limitation** | Ritual casting does not advance a clock by 10 minutes. |
| **GM override** | Any individual check can be bypassed with `isDM`. |

## 17. Spell scaling

| | |
| --- | --- |
| **Implemented** | Cantrips scale on **total character level** (5/11/17); leveled spells scale by slot level for dice, targets, duration and area; the cast level propagates through the whole transaction. |
| **Source** | `scaleSpell` (L18793), `cantripDiceMultiplier`, `castLevelFor` |
| **Tests** | `spell-scaling`, `cast-level-propagation`, `multiclass` (cantrips on total level) |
| **Manual** | None. |
| **Limitation** | Scaling is expressed per spell in the library; a spell with an unusual progression needs an explicit entry. |
| **GM override** | The cast level is chosen per cast. |

## 18. Corrected spells

| | |
| --- | --- |
| **Implemented** | **46** library spells validated against a schema. Corrections carried out in this project include **Moonbeam** (cylinder not sphere; CON save for half; triggers on entry *or* start of turn - see below), Mage Armor (a formula, not a bonus), and the five named magic items. |
| **Source** | `STANDARD_SPELLS` in `game-data.js`, `tools/validate-spells.js` |
| **Tests** | `spell-schema`, `named-spells`, `control-spells`, `remaining-spells`, `lingering-zones`, `healing-spells`, `sleep-spell` |
| **Manual** | Spells outside the library are free text. |
| **Limitation** | 46 of the SRD's ~319 spells are modelled. |
| **GM override** | Any spell's fields are editable per cast. |

> **Audit correction.** `tests/lingering-zones.test.js` previously asserted
> *"Moonbeam: damages only at the end of a turn (not entry, not start)"*. That is
> **not** the 2014 rule - Moonbeam triggers when a creature first enters the area
> on a turn **or starts its turn there** (PHB p.261) - and it directly
> contradicted `tests/control-spells.test.js`, which asserted the correct
> behaviour. The incorrect test has been rewritten to describe the generic
> end-of-turn zone shape it actually exercised, the spell's description text in
> `game-data.js` has been corrected (it also claimed an end-of-turn trigger), and
> a new test asserts the correct rule so the contradiction cannot return.

## 19. Character progression

| | |
| --- | --- |
| **Implemented** | **All 12 classes** have level tables: features, subclass level and label, ASI levels, resources with recharge, and per-feature choices. Features that replace others do not stack. Proficiency bonus from total level. Feats with prerequisites. Backgrounds (**20**) granting skills, tools, languages, equipment and features, with duplicate detection and replacement. Expertise and half proficiency. |
| **Source** | `CLASS_PROGRESSION` (L3577 region), `resolveProgression`, `BACKGROUND_DEFS`, `resolveProficiencies`, `FEATS` |
| **Tests** | `progression` (82), `backgrounds` (62), `levelup` (31) |
| **Manual** | Spells known/prepared per class level. |
| **Limitation** | The eight classes added later cover everything **except spellcasting progression**. Several features are recorded but inert: Cunning Action, Evasion, invocations, Aura of Protection. |
| **GM override** | `extraAttacks`, `unarmoredDefense`, `halfProficiency` and `skillProfs` can all be set directly. |

## 20. Multiclassing

| | |
| --- | --- |
| **Implemented** | Independent class levels; total character level; prerequisites checked for the class being entered **and every class already held**; the reduced multiclass proficiency package; hit dice pooled by die size preserving spent dice; combined spell slots; Pact Magic separate; per-class spellcasting ability and preparation limits; ASIs per class; **Extra Attack does not stack**. |
| **Source** | `classEntriesOf`, `canMulticlassInto`, `resolveMulticlassProgression` (L3906), `hitDicePoolsForClasses` |
| **Tests** | `multiclass` (90) |
| **Manual** | None. |
| **Limitation** | Migration derives the `classes` array from the existing class and level, so no statistic changes - verified by test. |
| **GM override** | `addClassLevel(..., { force: true })` bypasses prerequisites. |

## 21. Monsters

| | |
| --- | --- |
| **Implemented** | Printed saving-throw and skill totals replacing derived ones; damage vulnerabilities, resistances, immunities; condition immunities; Magic Resistance; recharge abilities **rolled at the start of the turn with the roll reported in full**; Multiattack; legendary actions with per-option costs; legendary resistances; lair actions on an initiative count; regional effects; reactions; death-save eligibility; size, space and reach; innate and standard spellcasting; trait-carried modifiers. Fully editable in `StatblockEditor`. |
| **Source** | `monsterProfile` (L4326), `rollRechargeAbilities`, `spendLegendaryAction`, `useLegendaryResistance`, `lairActionsDue` |
| **Tests** | `monsters` (81) |
| **Manual** | Legendary and lair actions are *offered*, not auto-taken. |
| **Limitation** | **The printed-save-bonus test is not discriminating** - removing the short-circuit in `savingThrowMod` does not turn the suite red, though the behaviour is correct and verified by hand. Do not treat that one mechanic as regression-protected. |
| **GM override** | Every field is a control in the stat block editor. |

## 22. Vision

| | |
| --- | --- |
| **Implemented** | Three light levels and two obscurity states; normal vision, darkvision (darkness→dim, dim→bright, **colourless**), blindsight, tremorsense, truesight; invisibility; hiding. **Vision, line of sight, line of effect and knowledge of location are four separate functions.** Passive Perception with proficiency, expertise, half proficiency, feats, items and the **±5 advantage swing**. The fog renders bright, dim and darkvision distinctly, and desaturates darkvision areas. |
| **Source** | `lightLevelAt` (L4403), `canSeeCreature` (L4451), `knowsLocationOf`, `passivePerceptionOf` (L4544), `computePlayerVisionSources` |
| **Tests** | `lighting` (85), `security-filter`, `cross-system` |
| **Manual** | Whether a specific Perception check depends on sight. |
| **Limitation** | The renderer composites each **viewer's** sources; standalone `state.lights[mapId]` entries not attached to a token affect the rules but are not drawn. |
| **GM override** | `passivePerception` on a stat block replaces the base (but still takes the ±5 swing). |

**Security note.** `filterStateForPlayer` is the boundary that decides what each
client receives. It now honours the sense model, including sending an invisible
creature's token only to a viewer with truesight or blindsight reaching it.
Before v9.05 that token was transmitted to any client whose ordinary vision
radius covered it. Treat changes here as security-relevant.

## 23. Environmental rules

| | |
| --- | --- |
| **Implemented** | Carrying capacity (STR × 15 × size) and push/drag/lift; variant encumbrance behind a campaign switch, reaching `moveBudget`; falling (1d6/10 ft, capped 20d6, lands prone); holding breath and suffocation timing; underwater movement and weapon rules; extreme heat and cold; forced march; food and water; travel pace. **Every hazard resolves through the universal d20 resolver and every point of damage through the central HP pipeline.** All **8** subsystems independently switchable. |
| **Source** | `CAMPAIGN_RULES_DEFAULT`, `resolveHazardSave` (L4795), `applyEnvironmentalDamage` (L4807), `encumbranceOf`, `advanceSuffocation` |
| **Tests** | `environment` (87), `cross-system` |
| **Manual** | **Triggering.** Nothing watches the clock to demand an hourly heat save; the GM applies hazards from the Environment tab. |
| **Limitation** | Underwater rules are computed but not consulted by the attack or movement paths. |
| **GM override** | Every subsystem has an on/off switch; hazards accept an injected `d20`. |

## 24. Magic items

| | |
| --- | --- |
| **Implemented** | Equipped and attuned state as a single gate; attunement requirements and the **limit of three** (configurable); charges with dawn/dusk/short/long recharge; consumables; activation costing the declared action; six effect kinds - set-scores, AC, saves, advantage, disadvantage-on-others, vision. **5** named items with **11** entries including variants. |
| **Source** | `MAGIC_ITEMS` (L2593), `magicItemActive`, `canAttune`, `resolveArmorClass`, `magicItemSaveBonus` |
| **Tests** | `magic-items` (62), `item-effects`, `timed-effects`, `cross-system` |
| **Manual** | Identifying items; cursed items. |
| **Limitation** | Item durations record `expiresAtHour` but only expire when the GM advances the clock. |
| **GM override** | `ITEM_ATTUNE` respects the limit; `attunementLimit` on the entity changes it. |

---

## Uncovered critical paths found by this audit

The per-subsystem suites are thorough in isolation; the gaps were all at the
**interactions**. `tests/cross-system.test.js` (26 tests) was added to cover:

- exhaustion against long rest, Aid, hazard saves, layered speed modifiers and the proficiency bonus
- Petrified resistance applied to falling damage; Petrified suppressing Poisoned
- temporary hit points absorbing before hit points and refusing a lower grant
- non-proficient armour hitting STR/DEX saves but **not** a CON hazard save
- multiclass proficiency bonus reaching skills, saves and passive scores alike
- Multiattack overriding the class calculation
- a set-score item raising carrying capacity
- Pact Magic never leaking into standard slots
- Goggles of Night reaching `canSeeCreature`; Blinded + truesight; darkvision leaving Perception at disadvantage
- a live attack composing condition, armour and item modifiers simultaneously

## Confidence

Every mechanical claim above is backed by a passing test, and most subsystems
additionally have **negative controls** recorded in `tests/README.md` - an
injected regression that must turn the suite red. Five times during this project
a negative control revealed something a green suite had hidden; three of those
were weak tests rather than weak code.

The one place where confidence is **lower than the green suite suggests** is the
printed-save-bonus mechanic in §21, which is documented there and in
`tests/README.md` rather than left implied.
