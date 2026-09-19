// game-data.js - Burrows & Badgers bestiary + built-in token presets.
// v8.22: split out of app.js (~3,200 lines of pure data) so the app
// bundle is smaller and this rarely-changing data caches separately.
// Loaded as a plain classic script BEFORE app.compiled.js, so the two
// arrays are global bindings the app reads by name.
// Also exported for Node (require-able in tests) when module exists.

var BNB_TOKEN_PRESETS = [
  {
    "id": "bnb:robin",
    "name": "Robin",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "1/4",
    "entity": {
      "type": "Monster",
      "name": "Robin",
      "color": "#b9935a",
      "hp": {
        "current": 7,
        "max": 7
      },
      "ac": 12,
      "speed": 30,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 4,
        "dex": 16,
        "con": 8,
        "int": 2,
        "wis": 12,
        "cha": 6
      },
      "cr": "1/4",
      "abilities": "Speed: Walk 10 ft., Fly 30 ft.\n\n• Territorial Song. The Robin can be trained to alert its owner when an unfamiliar creature enters a marked territory (30 ft. radius). Intruders have disadvantage on Stealth checks against the Robin's owner.\n• Dive Peck. Melee Attack: +4 to hit, reach 5 ft. - 1d4 piercing.",
      "playerDescription": "In every grovetown there is at least one Robin perched like a small smug lord, utterly certain the whole canopy belongs to it. Badgermen smiths adore them, for nothing announces a stranger faster than a Robin who feels its borders have been insulted. Trespass within its thirty feet and you will earn a song, a scolding, and very likely a peck on the nose.",
      "notes": "Flying | Medium | CR 1/4"
    }
  },
  {
    "id": "bnb:blue_tit",
    "name": "Blue Tit",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "1/2",
    "entity": {
      "type": "Monster",
      "name": "Blue Tit",
      "color": "#b9935a",
      "hp": {
        "current": 11,
        "max": 11
      },
      "ac": 12,
      "speed": 35,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 4,
        "dex": 16,
        "con": 10,
        "int": 2,
        "wis": 12,
        "cha": 6
      },
      "cr": "1/2",
      "abilities": "Speed: Walk 10 ft., Fly 35 ft.\n\n• Acrobatic Flight. The Blue Tit can fly through difficult terrain without movement penalty.\n• Peck. Melee Attack: +3 to hit, reach 5 ft. - 1d6 piercing.",
      "playerDescription": "Quick, clever, and forever in a hurry, the Blue Tit treats a grovetown's maze of rope bridges and pulleys as its own private obstacle course. It will loop a swinging lantern, thread a gap no sensible bird would attempt, and land looking faintly disappointed that you were impressed. Little wonder the messenger children adore them.",
      "notes": "Flying | Medium | CR 1/2"
    }
  },
  {
    "id": "bnb:great_tit",
    "name": "Great Tit",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "1/2",
    "entity": {
      "type": "Monster",
      "name": "Great Tit",
      "color": "#b9935a",
      "hp": {
        "current": 11,
        "max": 11
      },
      "ac": 12,
      "speed": 35,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 6,
        "dex": 16,
        "con": 10,
        "int": 2,
        "wis": 12,
        "cha": 6
      },
      "cr": "1/2",
      "abilities": "Speed: Walk 10 ft., Fly 35 ft.\nCarrying Capacity: 1 Small creature or 75 lbs.\n\n• Sure Perch. When a rider is mounted, the Great Tit can perch on branches, ropes, and ledges without requiring a Dexterity check from the rider to remain seated.\n• Peck. Melee Attack: +3 to hit, reach 5 ft. - 1d6 piercing.",
      "playerDescription": "The Great Tit is the patient schoolmaster of riding birds, steady of foot and endlessly forgiving of a wobbling first-time rider. You will find them in nearly every grovetown and walled grassland village, blinking placidly while some young Harefolk works out which end is the front. Dependable, sure-footed, and entirely unbothered by your inexperience.",
      "notes": "Flying | Rideable | Medium | CR 1/2"
    }
  },
  {
    "id": "bnb:red_wing",
    "name": "Red Wing",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Red Wing",
      "color": "#b9935a",
      "hp": {
        "current": 22,
        "max": 22
      },
      "ac": 13,
      "speed": 40,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 8,
        "dex": 16,
        "con": 12,
        "int": 3,
        "wis": 14,
        "cha": 6
      },
      "cr": "1",
      "abilities": "Speed: Walk 10 ft., Fly 40 ft.\nCarrying Capacity: 1 Medium creature or 150 lbs.\n\n• Migratory Memory. The Red Wing never loses its way between known locations and cannot be magically misdirected while following a route it has flown before.\n• Wing Buffet. Melee Attack: +3 to hit - 1d6 bludgeoning. Target makes DC 11 Strength save or is knocked prone.",
      "playerDescription": "A Red Wing never quite forgets a road it has flown, which makes it the beating heart of news between far-flung clans. Hand one a sealed letter and the vaguest sense of direction, and it will carry both faithfully over hills the maps have given up on. Many a feud has been kindled, and a few quietly mended, by a Red Wing arriving punctually at dusk.",
      "notes": "Flying | Rideable | Medium | CR 1"
    }
  },
  {
    "id": "bnb:sparrow",
    "name": "Sparrow",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Sparrow",
      "color": "#b9935a",
      "hp": {
        "current": 32,
        "max": 32
      },
      "ac": 13,
      "speed": 45,
      "initBonus": 4,
      "passivePerception": 12,
      "stats": {
        "str": 10,
        "dex": 18,
        "con": 14,
        "int": 3,
        "wis": 14,
        "cha": 7
      },
      "cr": "2",
      "abilities": "Speed: Walk 15 ft., Fly 45 ft.\nCarrying Capacity: 1 Medium creature or 200 lbs.\n\n• Evasive Flight. When targeted by a ranged attack, the Sparrow can use its reaction to impose disadvantage on the roll.\n• Burst of Speed. Once per short rest, the Sparrow can Dash as a bonus action.\n• Beak Strike. Melee Attack: +4 to hit, reach 5 ft. - 1d8 piercing.",
      "playerDescription": "If the whole continent has a favourite mount, it is the humble Sparrow: fast, hardy, and far too sensible to panic at the first hint of trouble. Warriors prize that sudden burst of speed, which has carried many a rider out of an ambush and straight into a tavern tale. Unglamorous, perhaps, but a Sparrow will see you home long after the prettier birds have lost their nerve.",
      "notes": "Flying | Rideable | Medium | CR 2"
    }
  },
  {
    "id": "bnb:hedgehog",
    "name": "Hedgehog",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Hedgehog",
      "color": "#b9935a",
      "hp": {
        "current": 22,
        "max": 22
      },
      "ac": 14,
      "speed": 25,
      "initBonus": -1,
      "passivePerception": 11,
      "stats": {
        "str": 12,
        "dex": 8,
        "con": 14,
        "int": 2,
        "wis": 12,
        "cha": 5
      },
      "cr": "1",
      "abilities": "Speed: Walk 25 ft.\nCarrying Capacity: 1 Medium creature or 150 lbs.\n\n• Spine Coat. Any creature that hits the Hedgehog with an unarmed melee strike takes 1d4 piercing in return.\n• Curl Up. As a bonus action, the Hedgehog curls into a ball, gaining +3 AC until the start of its next turn. While curled it cannot move or attack, and any rider is dismounted.\n• Snuffle. Advantage on Perception checks using smell.\n• Snout Butt. Melee Attack: +3 to hit, reach 5 ft. - 1d4+1 bludgeoning. On a hit against a creature that is surprised or unaware, the Hedgehog also curls defensively, triggering Spine Coat against the target as a free reaction.",
      "playerDescription": "What the Hedgehog lacks in haste it repays in sheer stubborn solidity, plodding over broken ground like a small and very prickly fortress. Harefolk favour them whenever the plan is to hold a line rather than win a race, and few foes relish charging a wall of spines that can simply curl up and wait. Slow to arrive, impossible to budge, and faintly smug about both.",
      "notes": "Rideable | Medium | CR 1"
    }
  },
  {
    "id": "bnb:ferret",
    "name": "Ferret",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Ferret",
      "color": "#b9935a",
      "hp": {
        "current": 27,
        "max": 27
      },
      "ac": 13,
      "speed": 35,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 12,
        "dex": 16,
        "con": 12,
        "int": 4,
        "wis": 12,
        "cha": 6
      },
      "cr": "2",
      "abilities": "Speed: Walk 35 ft., Climb 20 ft.\nCarrying Capacity: 1 Medium creature or 150 lbs.\n\n• Slender Build. The Ferret and any mounted rider can move through spaces as small as 1 ft. wide without squeezing.\n• War Ferret Training. When specifically trained for combat, the Ferret can take the Attack action independently of its rider once per round.\n• Ferocious Bite. Melee Attack: +4 to hit - 1d8 piercing. On hit, the Ferret can immediately attempt to grapple the target (escape DC 13).",
      "playerDescription": "All whip-quick sinew and questionable intentions, the Ferret was made for the cramped lanes of the forest floor where larger mounts dare not follow. A war-trained Ferret and its rider can pour into a burrow and spill out behind the enemy, biting first and explaining never. Charming by the hearth, terrifying in a tunnel, and quite unable to tell the two apart.",
      "notes": "Rideable | Medium | CR 2"
    }
  },
  {
    "id": "bnb:smooth_newt",
    "name": "Smooth Newt",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Smooth Newt",
      "color": "#b9935a",
      "hp": {
        "current": 16,
        "max": 16
      },
      "ac": 12,
      "speed": 25,
      "initBonus": 1,
      "passivePerception": 10,
      "stats": {
        "str": 10,
        "dex": 12,
        "con": 12,
        "int": 1,
        "wis": 10,
        "cha": 4
      },
      "cr": "1",
      "abilities": "Speed: Walk 20 ft., Swim 25 ft.\nCarrying Capacity: 1 Medium creature or 150 lbs.\n\n• Amphibious. Can breathe both air and water.\n• Sticky Feet. Ignores difficult terrain caused by wet, muddy, or mossy surfaces.\n• Tail Lash. Melee Attack: +3 to hit, reach 10 ft. - 1d6 bludgeoning.",
      "playerDescription": "Raised in the riverlands, the Smooth Newt regards mud, marsh, and rain-soaked root as the only roads truly worth travelling. Its sticky toes cling to slick stone and dripping bark while drier mounts are still skidding about and complaining. Cool, damp, and never in a rush, it will ferry you across a flooded wood with the calm of a creature entirely in its element.",
      "notes": "Rideable | Medium | CR 1"
    }
  },
  {
    "id": "bnb:bank_vole",
    "name": "Bank Vole",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "1/8",
    "entity": {
      "type": "Monster",
      "name": "Bank Vole",
      "color": "#b9935a",
      "hp": {
        "current": 3,
        "max": 3
      },
      "ac": 11,
      "speed": 20,
      "initBonus": 2,
      "passivePerception": 10,
      "stats": {
        "str": 2,
        "dex": 14,
        "con": 8,
        "int": 2,
        "wis": 10,
        "cha": 4
      },
      "cr": "1/8",
      "abilities": "Speed: Walk 20 ft., Burrow 10 ft.\n\n• Prey Animal. The Bank Vole has disadvantage on attack rolls but advantage on Stealth checks.\n• Harvest. Yields 1d4 units of hide and 1d4 units of meat when harvested.\n• Defensive Bite. Melee Attack: +2 to hit, reach 5 ft. - 1 piercing. Used only when cornered or grappled.",
      "playerDescription": "Plump, fretful, and endlessly busy, the Bank Vole is farmed across the grovetowns for hides so soft they end up gracing a noble's gloves. They live in a state of permanent mild alarm, which is only fair given how many neighbours regard them as supper. Gentle company all the same, so long as you make no sudden moves near the pantry.",
      "notes": "Small | CR 1/8"
    }
  },
  {
    "id": "bnb:house_spider",
    "name": "House Spider",
    "builtin": true,
    "category": "B&B: Domesticated",
    "cr": "1/4",
    "entity": {
      "type": "Monster",
      "name": "House Spider",
      "color": "#b9935a",
      "hp": {
        "current": 7,
        "max": 7
      },
      "ac": 12,
      "speed": 25,
      "initBonus": 2,
      "passivePerception": 10,
      "stats": {
        "str": 4,
        "dex": 14,
        "con": 10,
        "int": 1,
        "wis": 10,
        "cha": 2
      },
      "cr": "1/4",
      "abilities": "Speed: Walk 25 ft., Climb 25 ft.\n\n• Silk Production. Produces 5 ft. of silk thread per day - 1 unit of raw silk per week, 1 unit of moult chitin per month.\n• Web Trap. As an action, creates a sticky web in one 5 ft. square. Creatures passing through make DC 11 Strength or Dexterity save or are restrained until they use an action to break free.\n• Spider Climb. Ignores difficult terrain from vertical or overhanging surfaces.\n• Bite. Melee Attack: +3 to hit, reach 5 ft. - 1d4 piercing + 1d4 poison.",
      "playerDescription": "Tucked in the rafters of Mousefolk kitchens and Badgermen workshops, the House Spider spins quietly through the night and asks for nothing but a warm corner and the odd passing fly. Its silk binds parcels, mends nets, and now and then snares a burglar who badly underestimated the cobwebs. Unsettling to some, indispensable to all, and the most patient worker a household will ever keep.",
      "notes": "Small | CR 1/4"
    }
  },
  {
    "id": "bnb:bullfinch",
    "name": "Bullfinch",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Bullfinch",
      "color": "#8a6a3a",
      "hp": {
        "current": 32,
        "max": 32
      },
      "ac": 13,
      "speed": 40,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 10,
        "dex": 16,
        "con": 14,
        "int": 3,
        "wis": 14,
        "cha": 10
      },
      "cr": "2",
      "abilities": "Speed: Walk 10 ft., Fly 40 ft.\nCarrying Capacity: 1 Medium creature or 150 lbs.\n\n• Vivid Plumage. Advantage on Persuasion and Presence checks while visibly mounted on a Bullfinch in social situations.\n• Powerful Beak. Melee Attack: +4 to hit - 2d6 piercing.",
      "playerDescription": "Striking birds favoured as status mounts by Vixenspawn merchants and Grovetowns chieftains.",
      "notes": "Flying | Rideable | Medium | CR 2"
    }
  },
  {
    "id": "bnb:starling",
    "name": "Starling",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Starling",
      "color": "#8a6a3a",
      "hp": {
        "current": 27,
        "max": 27
      },
      "ac": 13,
      "speed": 40,
      "initBonus": 4,
      "passivePerception": 12,
      "stats": {
        "str": 8,
        "dex": 18,
        "con": 12,
        "int": 5,
        "wis": 14,
        "cha": 8
      },
      "cr": "2",
      "abilities": "Speed: Walk 10 ft., Fly 40 ft.\nCarrying Capacity: 1 Medium creature or 150 lbs.\n\n• Murmuration. If 5+ Starlings move together on the same turn, creatures within 30 ft. make DC 13 Wisdom save or are disoriented, suffering disadvantage on attacks until the end of their next turn.\n• Mimicry. A tamed Starling can replicate any sound heard in the last 24 hours.\n• Wing Strike. Melee Attack: +4 to hit - 1d8 bludgeoning.",
      "playerDescription": "Popular as message carriers and scouts. A Starling cavalry formation using Murmuration has scattered far larger forces.",
      "notes": "Flying | Rideable | Medium | CR 2"
    }
  },
  {
    "id": "bnb:house_martin",
    "name": "House Martin",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "3",
    "entity": {
      "type": "Monster",
      "name": "House Martin",
      "color": "#8a6a3a",
      "hp": {
        "current": 38,
        "max": 38
      },
      "ac": 14,
      "speed": 50,
      "initBonus": 5,
      "passivePerception": 12,
      "stats": {
        "str": 10,
        "dex": 20,
        "con": 12,
        "int": 3,
        "wis": 14,
        "cha": 7
      },
      "cr": "3",
      "abilities": "Speed: Walk 10 ft., Fly 50 ft.\nCarrying Capacity: 1 Medium creature or 175 lbs.\n\n• Aerial Agility. Can make sharp turns mid-flight without reducing speed. Advantage on Dexterity checks to avoid aerial hazards.\n• Insect Snatch. If a Flying Insect is within 10 ft. at the start of the Martin's turn, it may make one free bite attack against it.\n• Dive Strike. Melee Attack (after diving 20+ ft. in a straight line): +5 to hit - 2d6+2 piercing.",
      "playerDescription": "One of the fastest rideable birds on the continent. Favoured by Weaslie raiders and Harefolk scouts.",
      "notes": "Flying | Rideable | Medium | CR 3"
    }
  },
  {
    "id": "bnb:swallow",
    "name": "Swallow",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "4",
    "entity": {
      "type": "Monster",
      "name": "Swallow",
      "color": "#8a6a3a",
      "hp": {
        "current": 52,
        "max": 52
      },
      "ac": 14,
      "speed": 60,
      "initBonus": 6,
      "passivePerception": 12,
      "stats": {
        "str": 12,
        "dex": 22,
        "con": 14,
        "int": 3,
        "wis": 14,
        "cha": 8
      },
      "cr": "4",
      "abilities": "Speed: Walk 10 ft., Fly 60 ft.\nCarrying Capacity: 1 Medium creature or 200 lbs.\n\n• Speed Burst. Once per short rest, moves at double speed for one turn.\n• Hairpin Turn. Opportunity attacks against the Swallow while flying are made with disadvantage.\n• Razor Dive. Melee Attack: +6 to hit, reach 5 ft. - 2d8+3 piercing. After diving 30+ ft., target makes DC 14 Strength save or is knocked prone.",
      "playerDescription": "The apex riding bird. A Swallow-mounted rider is the fastest thing in the sky below the Ravenfolk.",
      "notes": "Flying | Rideable | Medium | CR 4"
    }
  },
  {
    "id": "bnb:owl",
    "name": "Owl",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "6",
    "entity": {
      "type": "Monster",
      "name": "Owl",
      "color": "#8a6a3a",
      "hp": {
        "current": 91,
        "max": 91
      },
      "ac": 15,
      "speed": 50,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 16,
        "dex": 17,
        "con": 13,
        "int": 8,
        "wis": 15,
        "cha": 10
      },
      "cr": "6",
      "abilities": "Speed: Walk 10 ft., Fly 50 ft.\nCarrying Capacity: 2 Medium creatures or 400 lbs.\n\n• Flyby. Does not provoke opportunity attacks when flying out of an enemy's reach.\n• Keen Hearing and Sight. Advantage on all Perception checks.\n• Silent Wings. Advantage on Stealth checks while flying.\n• Talons. Melee Attack: +7 to hit - 2d10+4 slashing. Target grappled on hit (escape DC 15).\n• Beak. Melee Attack: +7 to hit - 2d8+4 piercing.",
      "playerDescription": "Ancient and rare. Only the most experienced riders attempt to tame an Owl. They are war mounts and a declaration of absolute authority in the sky.",
      "notes": "Flying | Rideable | Large | CR 6"
    }
  },
  {
    "id": "bnb:mink",
    "name": "Mink",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "3",
    "entity": {
      "type": "Monster",
      "name": "Mink",
      "color": "#8a6a3a",
      "hp": {
        "current": 45,
        "max": 45
      },
      "ac": 13,
      "speed": 35,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 14,
        "dex": 16,
        "con": 14,
        "int": 4,
        "wis": 12,
        "cha": 6
      },
      "cr": "3",
      "abilities": "Speed: Walk 35 ft., Swim 25 ft.\nCarrying Capacity: 2 Medium creatures or 350 lbs.\n\n• Slick Coat. No speed penalty while swimming. Can hold breath for 3 minutes.\n• River Ambush. If attacking from underwater, the Mink has advantage on its first attack roll that turn.\n• Ferocious Bite. Melee Attack: +5 to hit - 2d8+3 piercing. Grappled on hit (escape DC 14).",
      "playerDescription": "The river cavalry mount of Ottermen long-riders and Castormen canal guards.",
      "notes": "Rideable | Large | CR 3"
    }
  },
  {
    "id": "bnb:polecat",
    "name": "Polecat",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "4",
    "entity": {
      "type": "Monster",
      "name": "Polecat",
      "color": "#8a6a3a",
      "hp": {
        "current": 59,
        "max": 59
      },
      "ac": 14,
      "speed": 40,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 16,
        "dex": 16,
        "con": 16,
        "int": 4,
        "wis": 12,
        "cha": 7
      },
      "cr": "4",
      "abilities": "Speed: Walk 40 ft., Climb 25 ft.\nCarrying Capacity: 2 Medium creatures or 350 lbs.\n\n• Musk Burst. Once per short rest as a bonus action, spray a 10 ft. cone. DC 14 Constitution save or poisoned for 1 hour with disadvantage on Charisma checks for the rest of the day.\n• Slender Frame. The Polecat and mounted rider can squeeze through gaps as small as 2 ft. wide.\n• Vicious Bite. Melee Attack: +6 to hit - 2d10+3 piercing. On a critical hit, the target is also grappled (escape DC 15) until the Polecat releases.",
      "playerDescription": "Fierce and independent. Used as forest-floor cavalry and feared in tunnel fighting.",
      "notes": "Rideable | Large | CR 4"
    }
  },
  {
    "id": "bnb:great_crested_newt",
    "name": "Great Crested Newt",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Great Crested Newt",
      "color": "#8a6a3a",
      "hp": {
        "current": 32,
        "max": 32
      },
      "ac": 13,
      "speed": 30,
      "initBonus": 1,
      "passivePerception": 10,
      "stats": {
        "str": 14,
        "dex": 12,
        "con": 12,
        "int": 2,
        "wis": 10,
        "cha": 8
      },
      "cr": "2",
      "abilities": "Speed: Walk 25 ft., Swim 30 ft.\nCarrying Capacity: 2 Medium creatures or 300 lbs.\n\n• Amphibious. Breathes air and water.\n• Crest Display. Once per short rest as a bonus action, raises its spectacular crest. Creatures within 15 ft. make DC 13 Wisdom save or are frightened for 1 round.\n• Tail Sweep. Melee Attack: +4 to hit, reach 10 ft. - 1d10+2 bludgeoning. Target makes DC 13 Strength save or is knocked prone.",
      "playerDescription": "Impressive war mounts for swamp and riverland campaigns.",
      "notes": "Rideable | Large | CR 2"
    }
  },
  {
    "id": "bnb:rhinoceros_beetle",
    "name": "Rhinoceros Beetle",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Rhinoceros Beetle",
      "color": "#8a6a3a",
      "hp": {
        "current": 32,
        "max": 32
      },
      "ac": 16,
      "speed": 25,
      "initBonus": 0,
      "passivePerception": 9,
      "stats": {
        "str": 16,
        "dex": 10,
        "con": 16,
        "int": 1,
        "wis": 8,
        "cha": 2
      },
      "cr": "2",
      "abilities": "Speed: Walk 25 ft., Fly 20 ft.\nCarrying Capacity: 1 Medium creature or 200 lbs.\n\n• Armoured Shell. Bludgeoning and piercing damage dealt to the Rhinoceros Beetle is reduced by 2.\n• Horn Charge. After moving 20 ft. toward a target: target makes DC 13 Strength save or takes an extra 1d8 piercing and is knocked prone.\n• Horn Strike. Melee Attack: +4 to hit - 1d8+2 piercing.",
      "playerDescription": "Prized as heavy infantry mounts. Their shell makes them practically immune to terrain hazards.",
      "notes": "Neutral | Rideable | Medium | CR 2"
    }
  },
  {
    "id": "bnb:stag_beetle",
    "name": "Stag Beetle",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "3",
    "entity": {
      "type": "Monster",
      "name": "Stag Beetle",
      "color": "#8a6a3a",
      "hp": {
        "current": 45,
        "max": 45
      },
      "ac": 15,
      "speed": 20,
      "initBonus": -1,
      "passivePerception": 9,
      "stats": {
        "str": 18,
        "dex": 8,
        "con": 18,
        "int": 1,
        "wis": 8,
        "cha": 2
      },
      "cr": "3",
      "abilities": "Speed: Walk 20 ft., Fly 20 ft.\nCarrying Capacity: 1 Medium creature or 225 lbs.\n\n• Armoured Shell. As Rhinoceros Beetle.\n• Territorial Charge. Advantage on attack rolls if an allied creature is grappling the same target.\n• Mandible Clamp. Melee Attack: +5 to hit - 2d6+3 piercing. Target grappled on hit (escape DC 14). While grappled, the target takes 1d6 piercing at the start of each of its turns.",
      "playerDescription": "A prestige mount. Their gleaming black carapace and enormous mandibles make them powerful symbols of military strength.",
      "notes": "Neutral | Rideable | Medium | CR 3"
    }
  },
  {
    "id": "bnb:bushcricket",
    "name": "Bushcricket",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Bushcricket",
      "color": "#8a6a3a",
      "hp": {
        "current": 16,
        "max": 16
      },
      "ac": 12,
      "speed": 40,
      "initBonus": 4,
      "passivePerception": 10,
      "stats": {
        "str": 8,
        "dex": 18,
        "con": 10,
        "int": 1,
        "wis": 10,
        "cha": 3
      },
      "cr": "1",
      "abilities": "Speed: Walk 30 ft., Jump 40 ft., Fly 20 ft.\nCarrying Capacity: 1 Medium creature or 150 lbs.\n\n• Long Jump. Can leap 40 ft. horizontally or 20 ft. vertically with no running start.\n• Night Song. Emits a chirp audible up to 300 ft. away. Trained riders can use this to relay coded signals.\n• Bite. Melee Attack: +3 to hit - 1d6+1 piercing.",
      "playerDescription": "Common in grassland settlements. Cheap to feed, easy to train, and fast across open meadows.",
      "notes": "Neutral | Rideable | Medium | CR 1"
    }
  },
  {
    "id": "bnb:rose_chafer",
    "name": "Rose Chafer",
    "builtin": true,
    "category": "B&B: Tameable",
    "cr": "1/2",
    "entity": {
      "type": "Monster",
      "name": "Rose Chafer",
      "color": "#8a6a3a",
      "hp": {
        "current": 9,
        "max": 9
      },
      "ac": 13,
      "speed": 25,
      "initBonus": 2,
      "passivePerception": 9,
      "stats": {
        "str": 4,
        "dex": 14,
        "con": 10,
        "int": 1,
        "wis": 8,
        "cha": 6
      },
      "cr": "1/2",
      "abilities": "Speed: Walk 15 ft., Fly 25 ft.\n\n• Pollinator. In areas where Rose Chafers are present, cultivated plants grow at twice the normal rate.\n• Shell Gleam. Yields 1 unit of decorative metallic chitin when harvested.\n• Common in Grasslands. Encountered in swarms of 2d6 in grassland regions.\n• Mandible Nip. Melee Attack: +2 to hit, reach 5 ft. - 1d4 piercing. Used only in self-defence.",
      "playerDescription": "Abundant in the meadows. Their green-gold shimmer is a defining motif in Harefolk art and textile work.",
      "notes": "Neutral | Small | CR 1/2"
    }
  },
  {
    "id": "bnb:common_pipistrelle",
    "name": "Common Pipistrelle",
    "builtin": true,
    "category": "B&B: Bats",
    "cr": "1/8",
    "entity": {
      "type": "Monster",
      "name": "Common Pipistrelle",
      "color": "#5a4a66",
      "hp": {
        "current": 2,
        "max": 2
      },
      "ac": 12,
      "speed": 30,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 3,
        "dex": 15,
        "con": 8,
        "int": 2,
        "wis": 12,
        "cha": 4
      },
      "cr": "1/8",
      "abilities": "Speed: Walk 5 ft., Fly 30 ft.\n\n• Echolocation. Blindsight 60 ft. Cannot use echolocation while deafened.\n• Keen Hearing. Advantage on Perception checks using hearing.\n• Bite. Melee Attack: +2 to hit, reach 5 ft. - 1d3 piercing.",
      "playerDescription": "",
      "notes": "Flying | Small | CR 1/8"
    }
  },
  {
    "id": "bnb:notch_eared_bat",
    "name": "Notch-Eared Bat",
    "builtin": true,
    "category": "B&B: Bats",
    "cr": "1/4",
    "entity": {
      "type": "Monster",
      "name": "Notch-Eared Bat",
      "color": "#5a4a66",
      "hp": {
        "current": 5,
        "max": 5
      },
      "ac": 12,
      "speed": 30,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 4,
        "dex": 15,
        "con": 8,
        "int": 2,
        "wis": 12,
        "cha": 4
      },
      "cr": "1/4",
      "abilities": "Speed: Walk 5 ft., Fly 30 ft.\n\n• Echolocation. Blindsight 60 ft.\n• Keen Hearing. Advantage on Perception checks using hearing.\n• Dive Bite. Melee Attack: +3 to hit - 1d4 piercing.",
      "playerDescription": "",
      "notes": "Flying | Small | CR 1/4"
    }
  },
  {
    "id": "bnb:soprano_pipistrelle",
    "name": "Soprano Pipistrelle",
    "builtin": true,
    "category": "B&B: Bats",
    "cr": "1/2",
    "entity": {
      "type": "Monster",
      "name": "Soprano Pipistrelle",
      "color": "#5a4a66",
      "hp": {
        "current": 9,
        "max": 9
      },
      "ac": 12,
      "speed": 35,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 6,
        "dex": 16,
        "con": 10,
        "int": 2,
        "wis": 12,
        "cha": 5
      },
      "cr": "1/2",
      "abilities": "Speed: Walk 5 ft., Fly 35 ft.\n\n• Echolocation. Blindsight 60 ft.\n• Shriek. Once per short rest, emit a high-frequency shriek. Creatures within 20 ft. with hearing make DC 12 Constitution save or are deafened for 1 minute.\n• Bite. Melee Attack: +3 to hit, reach 5 ft. - 1d4 piercing.",
      "playerDescription": "",
      "notes": "Flying | Medium | CR 1/2"
    }
  },
  {
    "id": "bnb:lesser_noctule",
    "name": "Lesser Noctule",
    "builtin": true,
    "category": "B&B: Bats",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Lesser Noctule",
      "color": "#5a4a66",
      "hp": {
        "current": 16,
        "max": 16
      },
      "ac": 13,
      "speed": 40,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 8,
        "dex": 16,
        "con": 12,
        "int": 2,
        "wis": 12,
        "cha": 5
      },
      "cr": "1",
      "abilities": "Speed: Walk 5 ft., Fly 40 ft.\n\n• Echolocation. Blindsight 60 ft.\n• Night Hunter. Advantage on attack rolls against flying insects and birds in darkness or dim light.\n• Bite. Melee Attack: +3 to hit - 1d6 piercing.",
      "playerDescription": "",
      "notes": "Flying | Medium | CR 1"
    }
  },
  {
    "id": "bnb:common_noctule",
    "name": "Common Noctule",
    "builtin": true,
    "category": "B&B: Bats",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Common Noctule",
      "color": "#5a4a66",
      "hp": {
        "current": 22,
        "max": 22
      },
      "ac": 13,
      "speed": 45,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 10,
        "dex": 17,
        "con": 12,
        "int": 2,
        "wis": 13,
        "cha": 5
      },
      "cr": "2",
      "abilities": "Speed: Walk 5 ft., Fly 45 ft.\n\n• Echolocation. Blindsight 60 ft.\n• Sonar Pulse. Once per short rest, reveals the exact position of all creatures and objects within 100 ft., including those behind full cover (excluding magical or lead barriers).\n• Bite. Melee Attack: +4 to hit - 1d8+2 piercing.",
      "playerDescription": "",
      "notes": "Flying | Medium | CR 2"
    }
  },
  {
    "id": "bnb:greater_noctule",
    "name": "Greater Noctule",
    "builtin": true,
    "category": "B&B: Bats",
    "cr": "4",
    "entity": {
      "type": "Monster",
      "name": "Greater Noctule",
      "color": "#5a4a66",
      "hp": {
        "current": 52,
        "max": 52
      },
      "ac": 14,
      "speed": 50,
      "initBonus": 4,
      "passivePerception": 12,
      "stats": {
        "str": 14,
        "dex": 18,
        "con": 14,
        "int": 3,
        "wis": 14,
        "cha": 6
      },
      "cr": "4",
      "abilities": "Speed: Walk 5 ft., Fly 50 ft.\n\n• Echolocation. Blindsight 60 ft.\n• Sonar Pulse. As Common Noctule, range extended to 150 ft.\n• Predatory Swoop. If the Greater Noctule dives 20+ ft. and hits with its bite, the target makes DC 14 Strength save or is grappled and lifted up to 20 ft. into the air.\n• Bite. Melee Attack: +6 to hit - 2d8+4 piercing.",
      "playerDescription": "",
      "notes": "Flying | Medium | CR 4"
    }
  },
  {
    "id": "bnb:garden_spider",
    "name": "Garden Spider",
    "builtin": true,
    "category": "B&B: Spiders",
    "cr": "1/4",
    "entity": {
      "type": "Monster",
      "name": "Garden Spider",
      "color": "#454553",
      "hp": {
        "current": 5,
        "max": 5
      },
      "ac": 12,
      "speed": 25,
      "initBonus": 2,
      "passivePerception": 10,
      "stats": {
        "str": 6,
        "dex": 14,
        "con": 8,
        "int": 1,
        "wis": 10,
        "cha": 2
      },
      "cr": "1/4",
      "abilities": "Speed: Walk 25 ft., Climb 25 ft.\n\n• Spider Climb.\n• Web. Ranged Attack (30 ft.): target makes DC 12 Strength save or is restrained. Escape DC 12.\n• Bite. Melee Attack: +3 to hit - 1d4 piercing + 1d4 poison.",
      "playerDescription": "",
      "notes": "Small | CR 1/4"
    }
  },
  {
    "id": "bnb:ladybird_spider",
    "name": "Ladybird Spider",
    "builtin": true,
    "category": "B&B: Spiders",
    "cr": "1/2",
    "entity": {
      "type": "Monster",
      "name": "Ladybird Spider",
      "color": "#454553",
      "hp": {
        "current": 9,
        "max": 9
      },
      "ac": 13,
      "speed": 25,
      "initBonus": 2,
      "passivePerception": 10,
      "stats": {
        "str": 6,
        "dex": 15,
        "con": 10,
        "int": 1,
        "wis": 10,
        "cha": 3
      },
      "cr": "1/2",
      "abilities": "Speed: Walk 25 ft., Climb 25 ft.\n\n• Spider Climb.\n• Warning Colouration. Creatures damaged by the bite have disadvantage on Perception checks to notice other Ladybird Spiders within 60 ft. for 1 minute.\n• Venomous Bite. Melee Attack: +3 to hit - 1d4 piercing + 2d4 poison. DC 12 Constitution save or poisoned for 1 hour.",
      "playerDescription": "",
      "notes": "Small | CR 1/2"
    }
  },
  {
    "id": "bnb:wasp_spider",
    "name": "Wasp Spider",
    "builtin": true,
    "category": "B&B: Spiders",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Wasp Spider",
      "color": "#454553",
      "hp": {
        "current": 16,
        "max": 16
      },
      "ac": 13,
      "speed": 30,
      "initBonus": 3,
      "passivePerception": 10,
      "stats": {
        "str": 10,
        "dex": 16,
        "con": 10,
        "int": 1,
        "wis": 10,
        "cha": 2
      },
      "cr": "1",
      "abilities": "Speed: Walk 30 ft., Climb 30 ft.\n\n• Spider Climb.\n• Ambush Web. Creates nearly invisible webs (Perception DC 16). Creatures entering the web are restrained (escape DC 14), and the Wasp Spider has advantage on attacks against restrained targets.\n• Venom Bite. Melee Attack: +4 to hit - 1d6 piercing + 2d6 poison. DC 13 Constitution save or poisoned for 1 hour with speed halved.",
      "playerDescription": "",
      "notes": "Medium | CR 1"
    }
  },
  {
    "id": "bnb:tubeweb_spider",
    "name": "Tubeweb Spider",
    "builtin": true,
    "category": "B&B: Spiders",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Tubeweb Spider",
      "color": "#454553",
      "hp": {
        "current": 27,
        "max": 27
      },
      "ac": 13,
      "speed": 30,
      "initBonus": 3,
      "passivePerception": 10,
      "stats": {
        "str": 12,
        "dex": 16,
        "con": 12,
        "int": 1,
        "wis": 10,
        "cha": 2
      },
      "cr": "2",
      "abilities": "Speed: Walk 30 ft., Climb 30 ft.\n\n• Spider Climb.\n• Tube Ambush. Lurks inside a silk tube. Disturbing the tube entrance triggers an automatic reaction attack with advantage.\n• Venomous Bite. Melee Attack: +5 to hit - 1d8+2 piercing + 3d6 poison. DC 14 Constitution save or incapacitated for 1 minute.",
      "playerDescription": "",
      "notes": "Medium | CR 2"
    }
  },
  {
    "id": "bnb:wolf_spider",
    "name": "Wolf Spider",
    "builtin": true,
    "category": "B&B: Spiders",
    "cr": "3",
    "entity": {
      "type": "Monster",
      "name": "Wolf Spider",
      "color": "#454553",
      "hp": {
        "current": 38,
        "max": 38
      },
      "ac": 14,
      "speed": 40,
      "initBonus": 4,
      "passivePerception": 11,
      "stats": {
        "str": 14,
        "dex": 18,
        "con": 12,
        "int": 2,
        "wis": 12,
        "cha": 3
      },
      "cr": "3",
      "abilities": "Speed: Walk 40 ft., Climb 30 ft.\n\n• Spider Climb.\n• Pounce. After moving 20 ft. toward a target and hitting with its bite, the target makes DC 14 Strength save or is knocked prone. If prone, the Spider makes one additional bite attack as a bonus action.\n• Keen Eyes. Advantage on Perception checks using sight.\n• Bite. Melee Attack: +6 to hit - 2d6+3 piercing + 3d6 poison. DC 14 Constitution save or paralyzed for 1 minute.",
      "playerDescription": "",
      "notes": "Medium | CR 3"
    }
  },
  {
    "id": "bnb:cave_spider",
    "name": "Cave Spider",
    "builtin": true,
    "category": "B&B: Spiders",
    "cr": "5",
    "entity": {
      "type": "Monster",
      "name": "Cave Spider",
      "color": "#454553",
      "hp": {
        "current": 75,
        "max": 75
      },
      "ac": 15,
      "speed": 40,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 18,
        "dex": 16,
        "con": 14,
        "int": 3,
        "wis": 12,
        "cha": 4
      },
      "cr": "5",
      "abilities": "Speed: Walk 40 ft., Climb 40 ft.\n\n• Spider Climb.\n• Tremorsense 60 ft.\n• Web Shot. Ranged Attack (60 ft.): DC 15 Strength save or restrained. Web is nearly invisible (Perception DC 18).\n• Cocoon. As an action against a restrained target, wraps it in silk (Strength DC 16 to break free). A cocooned creature falls unconscious after 1 minute without air.\n• Massive Bite. Melee Attack: +7 to hit - 2d10+5 piercing + 4d6 poison. DC 15 Constitution save or paralyzed for 1 hour.",
      "playerDescription": "Cave Spiders hunt deep below Harefolk walls and in root caverns. Their size means a single one can carry away a full-grown Badgerman.",
      "notes": "Large | CR 5"
    }
  },
  {
    "id": "bnb:ladybug",
    "name": "Ladybug",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1/4",
    "entity": {
      "type": "Monster",
      "name": "Ladybug",
      "color": "#6f8a3a",
      "hp": {
        "current": 5,
        "max": 5
      },
      "ac": 13,
      "speed": 20,
      "initBonus": 2,
      "passivePerception": 9,
      "stats": {
        "str": 4,
        "dex": 14,
        "con": 8,
        "int": 1,
        "wis": 8,
        "cha": 3
      },
      "cr": "1/4",
      "abilities": "Speed: Walk 15 ft., Fly 20 ft.\n\n• Warning Colouration. When hit with a melee attack, the attacker makes DC 11 Constitution save or is poisoned (nausea) for 1 round.\n• Mandible Bite. Melee Attack: +3 to hit - 1d4 piercing.",
      "playerDescription": "",
      "notes": "Small | Flying | CR 1/4"
    }
  },
  {
    "id": "bnb:pillbug",
    "name": "Pillbug",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1/8",
    "entity": {
      "type": "Monster",
      "name": "Pillbug",
      "color": "#6f8a3a",
      "hp": {
        "current": 3,
        "max": 3
      },
      "ac": 15,
      "speed": 10,
      "initBonus": -1,
      "passivePerception": 8,
      "stats": {
        "str": 4,
        "dex": 8,
        "con": 12,
        "int": 1,
        "wis": 6,
        "cha": 2
      },
      "cr": "1/8",
      "abilities": "Speed: Walk 10 ft.\n\n• Roll Up. As a reaction to taking damage, the Pillbug rolls into a ball, gaining +4 AC until the start of its next turn. While rolled it cannot move or attack.\n• Bite. Melee Attack: +2 to hit - 1d4 piercing.",
      "playerDescription": "",
      "notes": "Small | CR 1/8"
    }
  },
  {
    "id": "bnb:waterscorpion",
    "name": "Waterscorpion",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Waterscorpion",
      "color": "#6f8a3a",
      "hp": {
        "current": 16,
        "max": 16
      },
      "ac": 14,
      "speed": 25,
      "initBonus": 2,
      "passivePerception": 10,
      "stats": {
        "str": 10,
        "dex": 14,
        "con": 14,
        "int": 1,
        "wis": 10,
        "cha": 2
      },
      "cr": "1",
      "abilities": "Speed: Walk 10 ft., Swim 25 ft.\n\n• Amphibious.\n• Breathing Siphon. Can remain submerged indefinitely using its natural air tube.\n• Grasping Claws. On hit, target is grappled (escape DC 13).\n• Piercing Beak. Melee Attack: +4 to hit - 1d8+2 piercing + 1d6 poison. DC 13 Constitution save or poisoned for 1 minute.",
      "playerDescription": "",
      "notes": "Small | CR 1"
    }
  },
  {
    "id": "bnb:praying_mantis",
    "name": "Praying Mantis",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "3",
    "entity": {
      "type": "Monster",
      "name": "Praying Mantis",
      "color": "#6f8a3a",
      "hp": {
        "current": 45,
        "max": 45
      },
      "ac": 14,
      "speed": 30,
      "initBonus": 4,
      "passivePerception": 12,
      "stats": {
        "str": 14,
        "dex": 18,
        "con": 14,
        "int": 2,
        "wis": 14,
        "cha": 4
      },
      "cr": "3",
      "abilities": "Speed: Walk 30 ft., Fly 20 ft.\n\n• Ambush Predator. If the Mantis has not moved this turn, it has advantage on its first attack roll.\n• Devour. Against a grappled target, deals 2d10+3 piercing damage automatically as a bonus action.\n• Lightning Grab. Melee Attack (reach 10 ft.): +5 to hit - 2d6+3 piercing. Target grappled on hit (escape DC 14).",
      "playerDescription": "One of the most feared predators of the forest floor. A Mantis near a grovetowns path is cause for a road closure.",
      "notes": "Monster | Medium | CR 3"
    }
  },
  {
    "id": "bnb:emperor_dragonfly",
    "name": "Emperor Dragonfly",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "5",
    "entity": {
      "type": "Monster",
      "name": "Emperor Dragonfly",
      "color": "#6f8a3a",
      "hp": {
        "current": 68,
        "max": 68
      },
      "ac": 15,
      "speed": 60,
      "initBonus": 6,
      "passivePerception": 13,
      "stats": {
        "str": 16,
        "dex": 22,
        "con": 18,
        "int": 2,
        "wis": 16,
        "cha": 5
      },
      "cr": "5",
      "abilities": "Speed: Walk 5 ft., Fly 60 ft.\n\n• 360° Vision. Cannot be flanked. Advantage on all Perception checks.\n• Aerial Hunter. Advantage on attack rolls against airborne targets.\n• Compound Burst. Once per short rest, move in a straight line up to full flying speed. Each creature in the path makes DC 15 Dexterity save or takes 3d8 bludgeoning damage.\n• Mandible Strike. Melee Attack: +7 to hit - 2d8+4 piercing.",
      "playerDescription": "An Emperor Dragonfly clearing the air above a settlement is treated as a serious threat requiring immediate mobilisation.",
      "notes": "Monster | Flying | Medium | CR 5"
    }
  },
  {
    "id": "bnb:bumblebee",
    "name": "Bumblebee",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1/4",
    "entity": {
      "type": "Monster",
      "name": "Bumblebee",
      "color": "#6f8a3a",
      "hp": {
        "current": 5,
        "max": 5
      },
      "ac": 12,
      "speed": 30,
      "initBonus": 2,
      "passivePerception": 10,
      "stats": {
        "str": 4,
        "dex": 14,
        "con": 8,
        "int": 1,
        "wis": 10,
        "cha": 4
      },
      "cr": "1/4",
      "abilities": "Speed: Walk 10 ft., Fly 30 ft.\n\n• Hive Alarm. If within 60 ft. of a hive and threatened, releases alarm pheromone. 2d6 additional Bumblebees arrive at the start of its next turn.\n• Sting. Melee Attack: +3 to hit - 1d4 piercing + 1d4 poison. DC 11 Constitution save or poisoned for 1 minute. Can sting multiple times.",
      "playerDescription": "",
      "notes": "Small | Flying | CR 1/4"
    }
  },
  {
    "id": "bnb:honeybee",
    "name": "Honeybee",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1/8",
    "entity": {
      "type": "Monster",
      "name": "Honeybee",
      "color": "#6f8a3a",
      "hp": {
        "current": 2,
        "max": 2
      },
      "ac": 12,
      "speed": 30,
      "initBonus": 1,
      "passivePerception": 10,
      "stats": {
        "str": 2,
        "dex": 13,
        "con": 6,
        "int": 1,
        "wis": 10,
        "cha": 4
      },
      "cr": "1/8",
      "abilities": "Speed: Walk 10 ft., Fly 30 ft.\n\n• Sting and Die. The Honeybee can only sting once, then dies at the start of its next turn.\n• Hive Alarm. As Bumblebee.\n• Sting. Melee Attack: +2 to hit - 1d4 piercing + 1d6 poison. DC 12 Constitution save or poisoned, taking 1d4 poison damage each turn (DC 12 each turn to end).",
      "playerDescription": "",
      "notes": "Small | Flying | CR 1/8"
    }
  },
  {
    "id": "bnb:yellow_jacket",
    "name": "Yellow Jacket",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1/2",
    "entity": {
      "type": "Monster",
      "name": "Yellow Jacket",
      "color": "#6f8a3a",
      "hp": {
        "current": 9,
        "max": 9
      },
      "ac": 13,
      "speed": 35,
      "initBonus": 3,
      "passivePerception": 10,
      "stats": {
        "str": 4,
        "dex": 16,
        "con": 8,
        "int": 1,
        "wis": 10,
        "cha": 3
      },
      "cr": "1/2",
      "abilities": "Speed: Walk 10 ft., Fly 35 ft.\n\n• Aggressive. Attacks any creature that enters 30 ft. of its nest and pursues until the creature leaves or the Yellow Jacket is killed.\n• Nest Swarm. If killed near a nest, 1d6 Yellow Jackets emerge immediately.\n• Multi-Sting. Can sting up to 3 times in one action (+3 to hit each; 1d4 piercing + 1d6 poison per sting).",
      "playerDescription": "",
      "notes": "Small | Flying | CR 1/2"
    }
  },
  {
    "id": "bnb:hornet",
    "name": "Hornet",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Hornet",
      "color": "#6f8a3a",
      "hp": {
        "current": 27,
        "max": 27
      },
      "ac": 14,
      "speed": 40,
      "initBonus": 4,
      "passivePerception": 11,
      "stats": {
        "str": 8,
        "dex": 18,
        "con": 10,
        "int": 1,
        "wis": 12,
        "cha": 4
      },
      "cr": "2",
      "abilities": "Speed: Walk 10 ft., Fly 40 ft.\n\n• Nest Fury. Hornets within 60 ft. of their nest deal an extra 1d6 poison on all sting attacks.\n• Aerial Assault. If two or more Hornets attack the same target in one round, the target has disadvantage on Constitution saves against their venom.\n• Venom Sting. Melee Attack: +4 to hit - 1d8+2 piercing + 2d6 poison. DC 13 Constitution save or poisoned for 1 hour. On a save failure by 5 or more, the target takes 1d6 poison at the start of each turn until a save is made.",
      "playerDescription": "A Hornet nest above a grovetowns pathway can close the route for an entire season.",
      "notes": "Monster | Flying | Medium | CR 2"
    }
  },
  {
    "id": "bnb:mole_cricket",
    "name": "Mole Cricket",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Mole Cricket",
      "color": "#6f8a3a",
      "hp": {
        "current": 16,
        "max": 16
      },
      "ac": 13,
      "speed": 25,
      "initBonus": 2,
      "passivePerception": 10,
      "stats": {
        "str": 10,
        "dex": 14,
        "con": 12,
        "int": 1,
        "wis": 10,
        "cha": 3
      },
      "cr": "1",
      "abilities": "Speed: Walk 25 ft., Burrow 15 ft., Fly 20 ft.\n\n• Burrow Ambush. Can burrow as a bonus action and resurface adjacent to a target, making one attack with advantage.\n• Chirp Alarm. Emits a chirp audible 300 ft. away when threatened.\n• Forelegs Strike. Melee Attack: +3 to hit - 1d6+1 slashing.",
      "playerDescription": "Prefers grassland environments.",
      "notes": "Medium | CR 1"
    }
  },
  {
    "id": "bnb:six_spot_burnet",
    "name": "Six-Spot Burnet",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1/4",
    "entity": {
      "type": "Monster",
      "name": "Six-Spot Burnet",
      "color": "#6f8a3a",
      "hp": {
        "current": 5,
        "max": 5
      },
      "ac": 12,
      "speed": 25,
      "initBonus": 1,
      "passivePerception": 9,
      "stats": {
        "str": 2,
        "dex": 12,
        "con": 8,
        "int": 1,
        "wis": 8,
        "cha": 4
      },
      "cr": "1/4",
      "abilities": "Speed: Walk 10 ft., Fly 25 ft.\n\n• Warning Colouration. Any creature that kills or eats a Six-Spot Burnet makes DC 12 Constitution save or is poisoned for 1 hour.\n• Iridescent Wings. Advantage on Stealth checks in bright, sunny meadow environments.\n• Proboscis Bite. Melee Attack: +2 to hit, reach 5 ft. - 1 piercing. Used only in desperation. On hit, target makes DC 11 Constitution save or is sickened (disadvantage on one attack of your choice before end of their next turn).",
      "playerDescription": "",
      "notes": "Flying | Small | CR 1/4"
    }
  },
  {
    "id": "bnb:mimic_hoverfly",
    "name": "Mimic Hoverfly",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1/8",
    "entity": {
      "type": "Monster",
      "name": "Mimic Hoverfly",
      "color": "#6f8a3a",
      "hp": {
        "current": 2,
        "max": 2
      },
      "ac": 12,
      "speed": 30,
      "initBonus": 2,
      "passivePerception": 9,
      "stats": {
        "str": 2,
        "dex": 14,
        "con": 6,
        "int": 1,
        "wis": 8,
        "cha": 6
      },
      "cr": "1/8",
      "abilities": "Speed: Walk 5 ft., Fly 30 ft.\n\n• Wasp Mimic. Creatures with Intelligence 6 or lower treat the Mimic Hoverfly as a Yellow Jacket and will not approach within 10 ft. Creatures with Intelligence 7+ may make DC 13 Nature check to identify it as harmless.\n• Desperate Nip. Melee Attack: +2 to hit, reach 5 ft. - 1 piercing. The Mimic Hoverfly only attacks as a last resort when cornered and has exhausted all escape options. It immediately attempts to flee after attacking.",
      "playerDescription": "",
      "notes": "Flying | Small | CR 1/8"
    }
  },
  {
    "id": "bnb:pine_weevil",
    "name": "Pine Weevil",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "1/4",
    "entity": {
      "type": "Monster",
      "name": "Pine Weevil",
      "color": "#6f8a3a",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 10,
      "speed": 20,
      "initBonus": 1,
      "passivePerception": 9,
      "stats": {
        "str": 6,
        "dex": 12,
        "con": 10,
        "int": 1,
        "wis": 8,
        "cha": 2
      },
      "cr": "1/4",
      "abilities": "Speed: Walk 20 ft., Climb 20 ft.\n\n• Swarm Behaviour. Always encountered in groups of 2d6+2. If more than half are killed, the remainder scatter and flee.\n• Wood Scent. Advantage on Perception checks to locate living wood, processed timber, or wooden structures.\n• Gnaw. Melee Attack: +2 to hit - 1d4 piercing. Against wooden objects or structures, this damage bypasses hardness.",
      "playerDescription": "A catastrophic pest. A Pine Weevil infestation in a family tree can condemn an entire home.",
      "notes": "Small | CR 1/4"
    }
  },
  {
    "id": "bnb:leech",
    "name": "Leech",
    "builtin": true,
    "category": "B&B: Insects",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Leech",
      "color": "#6f8a3a",
      "hp": {
        "current": 22,
        "max": 22
      },
      "ac": 11,
      "speed": 25,
      "initBonus": -1,
      "passivePerception": 9,
      "stats": {
        "str": 12,
        "dex": 8,
        "con": 14,
        "int": 1,
        "wis": 8,
        "cha": 2
      },
      "cr": "2",
      "abilities": "Speed: Walk 10 ft., Swim 25 ft.\n\n• Blood Drain. While attached (grappling), drains 1d6 HP from the target at the start of each of its turns, healing itself by the same amount.\n• Numbing Saliva. The initial bite target must make DC 13 Perception check to notice the attachment - pain is suppressed for 1 minute.\n• Latch On. Melee Attack: +4 to hit - 1d4 piercing. On hit, the Leech latches on (grapple; escape DC 13). While latched, it cannot be targeted separately without also hitting the host.",
      "playerDescription": "A particular menace in the riverlands. Ottermen and Castormen check each other thoroughly after any time in the water.",
      "notes": "Medium | CR 2"
    }
  },
  {
    "id": "bnb:jay",
    "name": "Jay",
    "builtin": true,
    "category": "B&B: Wild Birds",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Jay",
      "color": "#5a7fa6",
      "hp": {
        "current": 16,
        "max": 16
      },
      "ac": 12,
      "speed": 35,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 8,
        "dex": 16,
        "con": 10,
        "int": 6,
        "wis": 14,
        "cha": 8
      },
      "cr": "1",
      "abilities": "Speed: Walk 15 ft., Fly 35 ft.\n\n• Alarm Call. When a Jay spots a threat, it emits a shrieking alarm call audible 500 ft. away. No surprise is possible in the vicinity for 10 minutes.\n• Acorn Memory. A Jay knows the precise location of every food cache it has made within 1 mile.\n• Beak Strike. Melee Attack: +3 to hit - 1d6 piercing.",
      "playerDescription": "",
      "notes": "Medium | Flying | CR 1"
    }
  },
  {
    "id": "bnb:jackdaw",
    "name": "Jackdaw",
    "builtin": true,
    "category": "B&B: Wild Birds",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Jackdaw",
      "color": "#5a7fa6",
      "hp": {
        "current": 27,
        "max": 27
      },
      "ac": 13,
      "speed": 40,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 8,
        "dex": 16,
        "con": 10,
        "int": 8,
        "wis": 14,
        "cha": 9
      },
      "cr": "2",
      "abilities": "Speed: Walk 15 ft., Fly 40 ft.\n\n• Shiny Thief. Steals any small unattended metal or reflective object it can see (Sleight of Hand +5 vs. passive Perception of the nearest observer).\n• Mob Attack. A Jackdaw within 60 ft. of another Jackdaw deals an extra 1d6 damage on all attacks.\n• Beak Strike. Melee Attack: +4 to hit - 1d8+2 piercing.",
      "playerDescription": "Jackdaws have stolen a Grovetowns chieftain's ceremonial brooch mid-ceremony. This is widely reported as fact.",
      "notes": "Medium | Flying | CR 2"
    }
  },
  {
    "id": "bnb:magpie",
    "name": "Magpie",
    "builtin": true,
    "category": "B&B: Wild Birds",
    "cr": "3",
    "entity": {
      "type": "Monster",
      "name": "Magpie",
      "color": "#5a7fa6",
      "hp": {
        "current": 38,
        "max": 38
      },
      "ac": 14,
      "speed": 40,
      "initBonus": 4,
      "passivePerception": 12,
      "stats": {
        "str": 10,
        "dex": 18,
        "con": 12,
        "int": 10,
        "wis": 14,
        "cha": 11
      },
      "cr": "3",
      "abilities": "Speed: Walk 15 ft., Fly 40 ft.\n\n• Cunning Action. Can Dash, Disengage, or Hide as a bonus action.\n• Mirror Trick. Once per short rest, uses its reflective plumage as a distraction. One creature within 30 ft. makes DC 14 Wisdom save or has disadvantage on Perception checks until the end of its next turn.\n• Beak and Claw. Melee Attack: +5 to hit - 2d6+3 piercing/slashing.",
      "playerDescription": "",
      "notes": "Medium | Flying | CR 3"
    }
  },
  {
    "id": "bnb:crow",
    "name": "Crow",
    "builtin": true,
    "category": "B&B: Wild Birds",
    "cr": "4",
    "entity": {
      "type": "Monster",
      "name": "Crow",
      "color": "#5a7fa6",
      "hp": {
        "current": 52,
        "max": 52
      },
      "ac": 14,
      "speed": 45,
      "initBonus": 4,
      "passivePerception": 13,
      "stats": {
        "str": 12,
        "dex": 18,
        "con": 14,
        "int": 12,
        "wis": 16,
        "cha": 12
      },
      "cr": "4",
      "abilities": "Speed: Walk 15 ft., Fly 45 ft.\n\n• Tool Use. Wields simple objects as improvised weapons (+4 to hit, 1d6 bludgeoning).\n• Problem Solver. Advantage on Intelligence checks involving puzzles, locks, or mechanical devices.\n• Vengeful Memory. Never forgets a creature that harmed it. Advantage on attacks against remembered targets.\n• Beak and Claw. Melee Attack: +6 to hit - 2d8+4 piercing/slashing.",
      "playerDescription": "",
      "notes": "Medium | Flying | CR 4"
    }
  },
  {
    "id": "bnb:raven_wild",
    "name": "Raven (Wild)",
    "builtin": true,
    "category": "B&B: Wild Birds",
    "cr": "8",
    "entity": {
      "type": "Monster",
      "name": "Raven (Wild)",
      "color": "#5a7fa6",
      "hp": {
        "current": 120,
        "max": 120
      },
      "ac": 16,
      "speed": 50,
      "initBonus": 3,
      "passivePerception": 14,
      "stats": {
        "str": 20,
        "dex": 16,
        "con": 18,
        "int": 14,
        "wis": 18,
        "cha": 16
      },
      "cr": "8",
      "abilities": "Speed: Walk 10 ft., Fly 50 ft.\n\n• Hinterland Aura. Creatures within 30 ft. of a Wild Raven have disadvantage on saves against fear effects.\n• Omen Call. Once per day, emits a call that functions as a bane spell (DC 16, up to 3 creatures within 60 ft.).\n• Beak Strike. Melee Attack: +10 to hit - 3d10+6 piercing.\n• Wing Slam. Melee Attack: +10 to hit, reach 10 ft. - 2d8+6 bludgeoning. Target makes DC 16 Strength save or is knocked prone.",
      "playerDescription": "Wild Ravens are dangerous, deeply unsettling, and poorly understood. The Ravenfolk refuse to discuss their relationship to them.",
      "notes": "Large | Flying | CR 8"
    }
  },
  {
    "id": "bnb:sparrowhawk",
    "name": "Sparrowhawk",
    "builtin": true,
    "category": "B&B: Wild Birds",
    "cr": "5",
    "entity": {
      "type": "Monster",
      "name": "Sparrowhawk",
      "color": "#5a7fa6",
      "hp": {
        "current": 68,
        "max": 68
      },
      "ac": 15,
      "speed": 55,
      "initBonus": 5,
      "passivePerception": 13,
      "stats": {
        "str": 14,
        "dex": 20,
        "con": 18,
        "int": 4,
        "wis": 16,
        "cha": 8
      },
      "cr": "5",
      "abilities": "Speed: Walk 10 ft., Fly 55 ft.\n\n• Keen Sight. Advantage on Perception checks using sight.\n• Flyby. Does not provoke opportunity attacks when flying out of reach.\n• Stoop. After diving 30+ ft. in a straight line, deals 3d8+4 piercing and target makes DC 15 Strength save or is knocked prone and grappled.\n• Talon Strike. Melee Attack: +7 to hit - 2d8+4 piercing.",
      "playerDescription": "",
      "notes": "Medium | Flying | CR 5"
    }
  },
  {
    "id": "bnb:red_kite",
    "name": "Red Kite",
    "builtin": true,
    "category": "B&B: Wild Birds",
    "cr": "6",
    "entity": {
      "type": "Monster",
      "name": "Red Kite",
      "color": "#5a7fa6",
      "hp": {
        "current": 91,
        "max": 91
      },
      "ac": 15,
      "speed": 55,
      "initBonus": 5,
      "passivePerception": 13,
      "stats": {
        "str": 16,
        "dex": 20,
        "con": 18,
        "int": 5,
        "wis": 16,
        "cha": 8
      },
      "cr": "6",
      "abilities": "Speed: Walk 10 ft., Fly 55 ft.\n\n• Thermal Rider. Can hover without spending movement. Advantage on Perception checks while airborne.\n• Screech. Once per short rest, emit a piercing cry. Creatures within 40 ft. make DC 15 Wisdom save or are frightened for 1 minute.\n• Talon Strike. Melee Attack: +8 to hit - 2d10+5 slashing. Grappled on hit (escape DC 16).",
      "playerDescription": "",
      "notes": "Medium | Flying | CR 6"
    }
  },
  {
    "id": "bnb:kestrel",
    "name": "Kestrel",
    "builtin": true,
    "category": "B&B: Wild Birds",
    "cr": "7",
    "entity": {
      "type": "Monster",
      "name": "Kestrel",
      "color": "#5a7fa6",
      "hp": {
        "current": 110,
        "max": 110
      },
      "ac": 16,
      "speed": 60,
      "initBonus": 6,
      "passivePerception": 14,
      "stats": {
        "str": 18,
        "dex": 22,
        "con": 18,
        "int": 5,
        "wis": 18,
        "cha": 8
      },
      "cr": "7",
      "abilities": "Speed: Walk 10 ft., Fly 60 ft.\n\n• Hover. Can remain in place in the air without altitude loss or movement cost.\n• UV Vision. Can see ultraviolet light - tracks urine trails of prey. Advantage on Perception and Survival checks to track living creatures.\n• Devastating Stoop. Once per short rest, after hovering for at least 1 full round: dive in a 5 ft. wide, 60 ft. long line. Creatures in the path make DC 16 Dexterity save or take 4d10+5 piercing damage (half on save).\n• Talon Strike. Melee Attack: +9 to hit - 3d8+5 piercing.",
      "playerDescription": "",
      "notes": "Large | Flying | CR 7"
    }
  },
  {
    "id": "bnb:pine_marten",
    "name": "Pine Marten",
    "builtin": true,
    "category": "B&B: Wild Birds",
    "cr": "5",
    "entity": {
      "type": "Monster",
      "name": "Pine Marten",
      "color": "#5a7fa6",
      "hp": {
        "current": 68,
        "max": 68
      },
      "ac": 14,
      "speed": 40,
      "initBonus": 4,
      "passivePerception": 12,
      "stats": {
        "str": 18,
        "dex": 18,
        "con": 16,
        "int": 5,
        "wis": 14,
        "cha": 8
      },
      "cr": "5",
      "abilities": "Speed: Walk 40 ft., Climb 40 ft.\n\n• Tree Runner. No movement penalty while climbing. Runs along branches as open terrain.\n• Drop Pounce. If dropping onto a target from 10 ft. or higher, attacks with advantage. Target makes DC 15 Strength save or is knocked prone and grappled.\n• Ferocious Bite. Melee Attack: +7 to hit - 2d10+4 piercing.",
      "playerDescription": "A single Pine Marten near a Weaslie pod village can force full relocation of 200 folk overnight.",
      "notes": "Large | CR 5"
    }
  },
  {
    "id": "bnb:adder",
    "name": "Adder",
    "builtin": true,
    "category": "B&B: Reptiles",
    "cr": "3",
    "entity": {
      "type": "Monster",
      "name": "Adder",
      "color": "#4f8a5a",
      "hp": {
        "current": 38,
        "max": 38
      },
      "ac": 14,
      "speed": 30,
      "initBonus": 4,
      "passivePerception": 12,
      "stats": {
        "str": 10,
        "dex": 18,
        "con": 14,
        "int": 2,
        "wis": 14,
        "cha": 4
      },
      "cr": "3",
      "abilities": "Speed: Walk 30 ft., Swim 20 ft.\n\n• Heat Sense. Blindsight 30 ft. based on body heat.\n• Camouflage. Advantage on Stealth checks in natural environments.\n• Venomous Bite. Melee Attack: +5 to hit - 1d6+2 piercing + 3d6 poison. DC 14 Constitution save or poisoned for 1 hour, taking 1d6 poison at the start of each turn (DC 14 each turn to end).",
      "playerDescription": "",
      "notes": "Medium | CR 3"
    }
  },
  {
    "id": "bnb:natterjack_toad",
    "name": "Natterjack Toad",
    "builtin": true,
    "category": "B&B: Reptiles",
    "cr": "1/2",
    "entity": {
      "type": "Monster",
      "name": "Natterjack Toad",
      "color": "#4f8a5a",
      "hp": {
        "current": 9,
        "max": 9
      },
      "ac": 12,
      "speed": 20,
      "initBonus": 0,
      "passivePerception": 10,
      "stats": {
        "str": 8,
        "dex": 10,
        "con": 12,
        "int": 1,
        "wis": 10,
        "cha": 5
      },
      "cr": "1/2",
      "abilities": "Speed: Walk 20 ft., Swim 15 ft.\n\n• Amphibious.\n• Toxic Skin. Any creature that bites or grapples a Natterjack makes DC 12 Constitution save or is poisoned for 1 hour.\n• Croak Alarm. Emits an unusually loud croak audible 300 ft. away.\n• Tongue Lash. Melee Attack: +2 to hit, reach 10 ft. - 1d4 bludgeoning. On hit, the target is pulled 5 ft. closer to the Natterjack.",
      "playerDescription": "",
      "notes": "Medium | CR 1/2"
    }
  },
  {
    "id": "bnb:sand_lizard",
    "name": "Sand Lizard",
    "builtin": true,
    "category": "B&B: Reptiles",
    "cr": "1",
    "entity": {
      "type": "Monster",
      "name": "Sand Lizard",
      "color": "#4f8a5a",
      "hp": {
        "current": 16,
        "max": 16
      },
      "ac": 13,
      "speed": 30,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 8,
        "dex": 14,
        "con": 12,
        "int": 2,
        "wis": 12,
        "cha": 4
      },
      "cr": "1",
      "abilities": "Speed: Walk 30 ft., Burrow 15 ft.\n\n• Burrowing Retreat. Can burrow into sand or loose soil as a bonus action, becoming fully hidden (Stealth +8 while burrowed).\n• Territorial Display. Once per short rest, perform a threat display. Creatures within 15 ft. make DC 12 Wisdom save or are frightened for 1 round.\n• Bite. Melee Attack: +3 to hit - 1d6+1 piercing.\n• Tail Slam. Melee Attack: +3 to hit, reach 10 ft. - 1d6 bludgeoning. DC 12 Strength save or knocked prone.",
      "playerDescription": "Earth and land-based attacks.",
      "notes": "Medium | CR 1"
    }
  },
  {
    "id": "bnb:fire_salamander",
    "name": "Fire Salamander",
    "builtin": true,
    "category": "B&B: Reptiles",
    "cr": "2",
    "entity": {
      "type": "Monster",
      "name": "Fire Salamander",
      "color": "#4f8a5a",
      "hp": {
        "current": 27,
        "max": 27
      },
      "ac": 13,
      "speed": 25,
      "initBonus": 1,
      "passivePerception": 10,
      "stats": {
        "str": 10,
        "dex": 12,
        "con": 14,
        "int": 2,
        "wis": 10,
        "cha": 6
      },
      "cr": "2",
      "abilities": "Speed: Walk 25 ft., Swim 20 ft.\n\n• Amphibious.\n• Immune to Fire.\n• Toxin Burst. Once per short rest, secretes toxin in a 10 ft. burst. DC 13 Constitution save or take 2d8 poison damage and be poisoned for 1 minute.\n• Fire Spit. Ranged Attack (30 ft.): +4 to hit - 2d8+2 fire damage.",
      "playerDescription": "Fire-based attacks.",
      "notes": "Medium | CR 2"
    }
  },
  {
    "id": "bnb:roe_deer",
    "name": "Roe Deer",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "4",
    "entity": {
      "type": "Monster",
      "name": "Roe Deer",
      "color": "#9a7b4f",
      "hp": {
        "current": 95,
        "max": 95
      },
      "ac": 13,
      "speed": 50,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 22,
        "dex": 14,
        "con": 16,
        "int": 2,
        "wis": 12,
        "cha": 6
      },
      "cr": "4",
      "abilities": "Speed: Walk 50 ft.\n\n• Skittish. When taking damage from an unseen source, makes DC 14 Wisdom save or spends its next turn dashing away.\n• Antler Charge (Males only). After moving 30 ft. straight toward a target: DC 14 Strength save or take 2d8+6 bludgeoning and be knocked prone.\n• Hooves. Melee Attack: +8 to hit - 2d8+6 bludgeoning.",
      "playerDescription": "",
      "notes": "Huge | Rideable | CR 4"
    }
  },
  {
    "id": "bnb:fallow_deer",
    "name": "Fallow Deer",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "5",
    "entity": {
      "type": "Monster",
      "name": "Fallow Deer",
      "color": "#9a7b4f",
      "hp": {
        "current": 126,
        "max": 126
      },
      "ac": 13,
      "speed": 50,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 24,
        "dex": 14,
        "con": 18,
        "int": 2,
        "wis": 12,
        "cha": 6
      },
      "cr": "5",
      "abilities": "Speed: Walk 50 ft.\n\n• Broad Antlers (Males only). Antler attacks have reach 10 ft.\n• Skittish.\n• Antler Sweep. Melee Attack (reach 10 ft.): +9 to hit - 3d8+7 bludgeoning. DC 15 Strength save or knocked prone.\n• Hooves. Melee Attack: +9 to hit - 2d10+7 bludgeoning.",
      "playerDescription": "",
      "notes": "Huge | Rideable | CR 5"
    }
  },
  {
    "id": "bnb:red_deer",
    "name": "Red Deer",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "8",
    "entity": {
      "type": "Monster",
      "name": "Red Deer",
      "color": "#9a7b4f",
      "hp": {
        "current": 198,
        "max": 198
      },
      "ac": 14,
      "speed": 50,
      "initBonus": 1,
      "passivePerception": 11,
      "stats": {
        "str": 28,
        "dex": 12,
        "con": 22,
        "int": 2,
        "wis": 12,
        "cha": 8
      },
      "cr": "8",
      "abilities": "Speed: Walk 50 ft.\n\n• Canopy Rake. When the Red Deer passes beneath forest cover, creatures and objects in the 15 ft. above it are struck by its antlers. Any creature caught makes DC 17 Dexterity save or takes 2d10+9 bludgeoning damage.\n• Thundering Charge. Move 40 ft. in a line. All creatures in the path make DC 17 Strength save or take 3d12+9 bludgeoning and be knocked prone and stunned until the end of their next turn.\n• Antler Sweep. Melee Attack (reach 15 ft.): +11 to hit - 4d8+9 bludgeoning. DC 17 Strength save or knocked prone.\n• Hooves. Melee Attack: +11 to hit - 3d10+9 bludgeoning.",
      "playerDescription": "A Red Deer's antlers are visible from half a mile away. The sight of one moving with purpose is said to be the last thing many settlements ever remember clearly.",
      "notes": "Gargantuan | Rideable | CR 8"
    }
  },
  {
    "id": "bnb:feral_goat",
    "name": "Feral Goat",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "4",
    "entity": {
      "type": "Monster",
      "name": "Feral Goat",
      "color": "#9a7b4f",
      "hp": {
        "current": 105,
        "max": 105
      },
      "ac": 13,
      "speed": 40,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 20,
        "dex": 16,
        "con": 18,
        "int": 3,
        "wis": 14,
        "cha": 6
      },
      "cr": "4",
      "abilities": "Speed: Walk 40 ft., Climb 35 ft.\n\n• Mountain Footing. Ignores difficult terrain caused by rocky, uneven, or steep surfaces.\n• Headbutt Charge. Move 20 ft. then attack: DC 14 Strength save or take 2d8+5 bludgeoning and be knocked prone.\n• Hooves. Melee Attack: +7 to hit - 2d6+5 bludgeoning.",
      "playerDescription": "",
      "notes": "Huge | Rideable | CR 4"
    }
  },
  {
    "id": "bnb:ibex",
    "name": "Ibex",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "5",
    "entity": {
      "type": "Monster",
      "name": "Ibex",
      "color": "#9a7b4f",
      "hp": {
        "current": 126,
        "max": 126
      },
      "ac": 14,
      "speed": 40,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 22,
        "dex": 16,
        "con": 20,
        "int": 3,
        "wis": 14,
        "cha": 7
      },
      "cr": "5",
      "abilities": "Speed: Walk 40 ft., Climb 40 ft.\n\n• Mountain Footing.\n• Pin. On a critical hit with its horn attack, the target is also grappled (pinned to the ground if prone).\n• Horn Charge. Move 30 ft. in a line: DC 15 Strength save or take 3d8+6 piercing and be knocked prone.\n• Hooves. Melee Attack: +8 to hit - 2d8+6 bludgeoning.",
      "playerDescription": "",
      "notes": "Huge | Rideable | CR 5"
    }
  },
  {
    "id": "bnb:reindeer",
    "name": "Reindeer",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "5",
    "entity": {
      "type": "Monster",
      "name": "Reindeer",
      "color": "#9a7b4f",
      "hp": {
        "current": 126,
        "max": 126
      },
      "ac": 13,
      "speed": 50,
      "initBonus": 2,
      "passivePerception": 12,
      "stats": {
        "str": 22,
        "dex": 14,
        "con": 20,
        "int": 3,
        "wis": 14,
        "cha": 8
      },
      "cr": "5",
      "abilities": "Speed: Walk 50 ft., Swim 25 ft.\n\n• Cold Endurance. Resistance to cold damage. Advantage on Constitution saves against cold weather exhaustion.\n• Both Sexes Antlered. Both males and females can use antler attacks.\n• Antler Charge. Move 30 ft. in a line: DC 15 Strength save or take 2d12+6 bludgeoning and be knocked prone.\n• Hooves. Melee Attack: +8 to hit - 2d10+6 bludgeoning.",
      "playerDescription": "",
      "notes": "Huge | Rideable | CR 5"
    }
  },
  {
    "id": "bnb:swine",
    "name": "Swine",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "6",
    "entity": {
      "type": "Monster",
      "name": "Swine",
      "color": "#9a7b4f",
      "hp": {
        "current": 150,
        "max": 150
      },
      "ac": 13,
      "speed": 40,
      "initBonus": 1,
      "passivePerception": 10,
      "stats": {
        "str": 24,
        "dex": 12,
        "con": 22,
        "int": 3,
        "wis": 10,
        "cha": 5
      },
      "cr": "6",
      "abilities": "Speed: Walk 40 ft.\n\n• Relentless (Recharges on Short/Long Rest). When reduced to 0 HP but not killed outright, drops to 1 HP instead.\n• Keen Smell. Advantage on Perception checks using smell.\n• Tusk Charge. Move 20 ft. in a line: DC 16 Strength save or take 3d8+7 piercing and be knocked prone.\n• Tusks. Melee Attack: +9 to hit - 3d8+7 piercing.",
      "playerDescription": "Of all the ungulates, Swine are the most likely to investigate rather than flee. This makes them uniquely terrifying. At least a Deer runs away.",
      "notes": "Huge | CR 6"
    }
  },
  {
    "id": "bnb:horse",
    "name": "Horse",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "7",
    "entity": {
      "type": "Monster",
      "name": "Horse",
      "color": "#9a7b4f",
      "hp": {
        "current": 165,
        "max": 165
      },
      "ac": 14,
      "speed": 60,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 26,
        "dex": 14,
        "con": 22,
        "int": 3,
        "wis": 12,
        "cha": 8
      },
      "cr": "7",
      "abilities": "Speed: Walk 60 ft.\n\n• Hooves of Thunder. When the Horse takes the Dash action, all creatures within 10 ft. of its path make DC 17 Strength save or take 3d8+8 bludgeoning and be knocked prone.\n• Warhorse Training (if tamed and trained). No longer makes Wisdom saves when entering combat.\n• Hooves. Melee Attack: +10 to hit, reach 5 ft. - 3d10+8 bludgeoning.",
      "playerDescription": "A Horse at full gallop is audible from two miles away. The ground shakes. There is no wall built by the folk that has ever successfully stopped one.",
      "notes": "Gargantuan | Rideable | CR 7"
    }
  },
  {
    "id": "bnb:bison",
    "name": "Bison",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "11",
    "entity": {
      "type": "Monster",
      "name": "Bison",
      "color": "#9a7b4f",
      "hp": {
        "current": 234,
        "max": 234
      },
      "ac": 15,
      "speed": 50,
      "initBonus": 0,
      "passivePerception": 10,
      "stats": {
        "str": 30,
        "dex": 10,
        "con": 28,
        "int": 2,
        "wis": 10,
        "cha": 6
      },
      "cr": "11",
      "abilities": "Speed: Walk 50 ft.\n\n• Stampede. Once per short rest, charges in a straight line up to 50 ft. Every creature in its path makes DC 20 Strength save or takes 4d12+10 bludgeoning and is knocked prone and stunned until the end of its next turn.\n• Massive Frame. Attempts to push, shove, or knock the Bison prone are made with disadvantage. The Bison cannot be moved by any effect that would move a creature of its size or smaller.\n• Gore. Melee Attack: +12 to hit, reach 5 ft. - 4d10+10 piercing.\n• Trample. Against a prone target: +12 to hit - 4d12+10 bludgeoning.",
      "playerDescription": "The Skantz keep full memorial songs dedicated to the last time a Bison walked through a settlement. There are seventeen such songs. The settlements in question are no longer on any map.",
      "notes": "Gargantuan | CR 11"
    }
  },
  {
    "id": "bnb:brown_bear",
    "name": "Brown Bear",
    "builtin": true,
    "category": "B&B: Ungulates",
    "cr": "10",
    "entity": {
      "type": "Monster",
      "name": "Brown Bear",
      "color": "#9a7b4f",
      "hp": {
        "current": 210,
        "max": 210
      },
      "ac": 15,
      "speed": 40,
      "initBonus": 1,
      "passivePerception": 12,
      "stats": {
        "str": 28,
        "dex": 12,
        "con": 24,
        "int": 4,
        "wis": 14,
        "cha": 8
      },
      "cr": "10",
      "abilities": "Speed: Walk 40 ft., Swim 30 ft., Climb 30 ft.\n\n• Keen Smell. Advantage on Perception checks using smell.\n• Frightful Presence. Any creature of Medium size or smaller that starts its turn within 60 ft. of the Bear and can see it makes DC 18 Wisdom save or is frightened until the start of its next turn. On a success, the creature is immune to this effect for 24 hours.\n• Multiattack. Makes one Bite and two Claw attacks per turn.\n• Bite. Melee Attack: +11 to hit - 3d10+9 piercing.\n• Claws. Melee Attack: +11 to hit - 2d12+9 slashing. On a critical hit, the target is grappled (escape DC 19).",
      "playerDescription": "The most feared creature outside the Hinterlands. A Brown Bear's approach is treated as a catastrophe requiring total mobilisation. The Ravenfolk are said to track Bear movements carefully - and not for the folk's protection.",
      "notes": "Gargantuan | CR 10"
    }
  },
  {
    "id": "bnb:lupulella_wolf",
    "name": "Lupulella (Wolf)",
    "builtin": true,
    "category": "B&B: Carnivores",
    "cr": "4",
    "entity": {
      "type": "Monster",
      "name": "Lupulella (Wolf)",
      "color": "#8a5236",
      "hp": {
        "current": 52,
        "max": 52
      },
      "ac": 14,
      "speed": 50,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 18,
        "dex": 16,
        "con": 14,
        "int": 4,
        "wis": 14,
        "cha": 8
      },
      "cr": "4",
      "abilities": "Speed: Walk 50 ft.\n\n• Pack Tactics. Advantage on attack rolls if an ally is adjacent to the target.\n• Keen Senses. Advantage on Perception checks using hearing and smell.\n• Rallying Howl. Once per short rest, emit a howl audible 1 mile away. All allied wolves within 500 ft. converge on this location over the next 1d4 rounds.\n• Bite. Melee Attack: +6 to hit - 2d10+4 piercing. Target makes DC 14 Strength save or is knocked prone.",
      "playerDescription": "Lupulella packs are one of the primary threats to settled life in the borderlands between biomes.",
      "notes": "Monster | Large | CR 4"
    }
  },
  {
    "id": "bnb:lupus_wolf",
    "name": "Lupus (Wolf)",
    "builtin": true,
    "category": "B&B: Carnivores",
    "cr": "6",
    "entity": {
      "type": "Monster",
      "name": "Lupus (Wolf)",
      "color": "#8a5236",
      "hp": {
        "current": 91,
        "max": 91
      },
      "ac": 15,
      "speed": 50,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 20,
        "dex": 16,
        "con": 16,
        "int": 5,
        "wis": 14,
        "cha": 8
      },
      "cr": "6",
      "abilities": "Speed: Walk 50 ft.\n\n• Pack Tactics.\n• Keen Senses.\n• Coordinated Takedown. If two or more Lupus wolves attack the same target in one round, the target makes DC 16 Strength save at the end of the round or is knocked prone and grappled by one of the wolves.\n• Dreadful Howl. Once per short rest, all creatures within 60 ft. make DC 15 Wisdom save or are frightened for 1 minute.\n• Bite. Melee Attack: +8 to hit - 3d10+5 piercing. Target DC 16 Strength save or knocked prone.",
      "playerDescription": "",
      "notes": "Monster | Large | CR 6"
    }
  },
  {
    "id": "bnb:aenocyon_wolf",
    "name": "Aenocyon (Wolf)",
    "builtin": true,
    "category": "B&B: Carnivores",
    "cr": "8",
    "entity": {
      "type": "Monster",
      "name": "Aenocyon (Wolf)",
      "color": "#8a5236",
      "hp": {
        "current": 120,
        "max": 120
      },
      "ac": 16,
      "speed": 60,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 24,
        "dex": 16,
        "con": 20,
        "int": 6,
        "wis": 14,
        "cha": 10
      },
      "cr": "8",
      "abilities": "Speed: Walk 60 ft.\n\n• Pack Tactics.\n• Keen Senses.\n• Titanic Presence. Creatures of Medium size or smaller within 60 ft. make DC 17 Wisdom save at the start of each of their turns or are frightened.\n• Catastrophic Howl. Once per long rest, release a howl that functions as a fear spell (DC 17, affects all creatures within 120 ft. the Aenocyon can see).\n• Pounce. After moving 30 ft. toward a target, all creatures in its path make DC 17 Dexterity save or take 3d10 bludgeoning damage and be knocked prone.\n• Titanic Bite. Melee Attack: +10 to hit, reach 10 ft. - 4d12+8 piercing. On hit, Medium and smaller creatures are grappled and restrained (escape DC 18).",
      "playerDescription": "When an Aenocyon is sighted near a settlement, the protocol is simple: send to your neighbours for help, and begin evacuating the young.",
      "notes": "Monster | Gigantic | CR 8"
    }
  }
];

// v3: built-in token presets. DM can add custom ones on top; these are merged
// in at read time (never saved to state so they always reflect code updates).
var BUILTIN_TOKEN_PRESETS = [
  ...BNB_TOKEN_PRESETS,
  { id: 'builtin:goblin',   name: 'Goblin',     builtin: true,
    entity: { type: 'Monster', name: 'Goblin',  color: '#6b8e3f',
              hp: { current: 7, max: 7 }, ac: 15, speed: 30, initBonus: 2,
              stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
              cr: '1/4', passivePerception: 9,
              playerDescription: 'A wiry, sharp-toothed creature in scavenged leather.' } },
  { id: 'builtin:commoner', name: 'Commoner',   builtin: true,
    entity: { type: 'NPC', name: 'Commoner',    color: '#9b8b7a',
              hp: { current: 4, max: 4 }, ac: 10, speed: 30, initBonus: 0,
              stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
              role: 'villager', passivePerception: 10 } },
  { id: 'builtin:guard',    name: 'Guard',      builtin: true,
    entity: { type: 'NPC', name: 'Guard',       color: '#5a7088',
              hp: { current: 11, max: 11 }, ac: 16, speed: 30, initBonus: 1,
              stats: { str: 13, dex: 12, con: 12, int: 10, wis: 11, cha: 10 },
              role: 'town guard', passivePerception: 12 } },
  { id: 'builtin:bandit',   name: 'Bandit',     builtin: true,
    entity: { type: 'Monster', name: 'Bandit',  color: '#6b4a2b',
              hp: { current: 11, max: 11 }, ac: 12, speed: 30, initBonus: 1,
              stats: { str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
              cr: '1/8', passivePerception: 10,
              playerDescription: 'A rough-looking brigand with a weathered blade.' } },
  { id: 'builtin:wolf',     name: 'Wolf',       builtin: true,
    entity: { type: 'Neutral Beast', name: 'Wolf', color: '#6a6358',
              hp: { current: 11, max: 11 }, ac: 13, speed: 40, initBonus: 2,
              stats: { str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6 },
              role: 'wolf', passivePerception: 13,
              playerDescription: 'A lean grey wolf, ribs visible under matted fur.' } },
  { id: 'builtin:skeleton', name: 'Skeleton',   builtin: true,
    entity: { type: 'Monster', name: 'Skeleton', color: '#c9c3a8',
              hp: { current: 13, max: 13 }, ac: 13, speed: 30, initBonus: 2,
              stats: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
              cr: '1/4', passivePerception: 9,
              playerDescription: 'Yellowed bones bound together by a foul animating will.' } },
  { id: 'builtin:chest',    name: 'Chest',      builtin: true,
    entity: { type: 'Object', name: 'Chest', color: '#8b6540',
              hp: { current: 0, max: 0 }, ac: 12, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'container',
              playerDescription: 'An iron-bound chest, latched.' } },
  { id: 'builtin:torch',    name: 'Torch / Brazier', builtin: true,
    entity: { type: 'Object', name: 'Torch', color: '#d4a52e',
              hp: { current: 0, max: 0 }, ac: 10, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'light source',
              lightRadius: 20,
              playerDescription: 'A flickering flame casting long shadows.' } },

  // v4 fix #19: Object presets
  { id: 'builtin:candle', name: 'Candle', builtin: true,
    entity: { type: 'Object', name: 'Candle', color: '#f0d77a',
              hp: { current: 0, max: 0 }, ac: 8, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'light source',
              lightRadius: 5,
              playerDescription: 'A lone candle, its flame thin and nervous.' } },
  { id: 'builtin:pouch', name: 'Pouch', builtin: true,
    entity: { type: 'Object', name: 'Pouch', color: '#704a28',
              hp: { current: 0, max: 0 }, ac: 8, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'container',
              playerDescription: 'A small leather pouch, drawstring pulled tight.' } },
  { id: 'builtin:lever', name: 'Lever', builtin: true,
    entity: { type: 'Object', name: 'Lever', color: '#6a6a6a',
              hp: { current: 0, max: 0 }, ac: 15, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'mechanism',
              playerDescription: 'An iron lever set into the wall.' } },
  { id: 'builtin:key', name: 'Key', builtin: true,
    entity: { type: 'Object', name: 'Key', color: '#b8965a',
              hp: { current: 0, max: 0 }, ac: 10, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'key',
              playerDescription: 'An ornate brass key.' } },
  { id: 'builtin:book', name: 'Book', builtin: true,
    entity: { type: 'Object', name: 'Book', color: '#5c3a2e',
              hp: { current: 2, max: 2 }, ac: 8, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'tome',
              playerDescription: 'A weathered tome, spine cracked, pages yellow.' } },
  { id: 'builtin:door', name: 'Door', builtin: true,
    entity: { type: 'Object', name: 'Door', color: '#6e4a28',
              hp: { current: 10, max: 10 }, ac: 15, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'door',
              playerDescription: 'A wooden door, weather-beaten.' } },
  { id: 'builtin:reinforced_door', name: 'Reinforced Door', builtin: true,
    entity: { type: 'Object', name: 'Reinforced Door', color: '#3a2e22',
              hp: { current: 25, max: 25 }, ac: 18, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'door',
              playerDescription: 'A heavy door banded with iron.' } },
  { id: 'builtin:trap_door', name: 'Trap Door', builtin: true,
    entity: { type: 'Object', name: 'Trap Door', color: '#5a3a22',
              hp: { current: 8, max: 8 }, ac: 12, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'hatch',
              playerDescription: 'A wooden hatch set into the floor.' } },
  { id: 'builtin:reinforced_trap_door', name: 'Reinforced Trap Door', builtin: true,
    entity: { type: 'Object', name: 'Reinforced Trap Door', color: '#2c2016',
              hp: { current: 20, max: 20 }, ac: 17, speed: 0, initBonus: 0,
              rollsInitiative: false, role: 'hatch',
              playerDescription: 'An iron-bound hatch, heavy and barred.' } },
  // Campaign-specific: The Plague's Call - Unfinished Puppet
  { id: 'builtin:unfinished_puppet', name: 'Unfinished Puppet', builtin: true,
    entity: { type: 'Monster', name: 'Unfinished Puppet', color: '#7a6a55',
              hp: { current: 58, max: 58 }, ac: 13, speed: 30, initBonus: 1,
              darkvision: 60,
              stats: { str: 15, dex: 12, con: 14, int: 8, wis: 10, cha: 6 },
              cr: '2', passivePerception: 10,
              playerDescription: 'A lurching humanoid figure of pale, badly jointed wood. It moves with horrible purpose, its jaw working soundlessly.',
              notes: `Medium Humanoid (Unfinished Construct) | AC 13 | HP 58 | Speed 30 ft
Saves: CON +4
Resistances: Poison, Cold, Necrotic, Piercing
Weaknesses: Fire, Bludgeoning
Immunities: Poisoned, Charmed
Senses: Darkvision 60 ft | Languages: Common (slurred, fragmented)

TRAIT: SPLINTERED NERVES
Start of each turn, roll 1d6:
  1-2: Agony Surge - advantage on first attack this turn
  3-4: Disoriented - disadvantage on all attacks this turn
  5-6: Lucid Flash - speaks clearly (see Dialogue Table)

ACTIONS
Multiattack: two melee attacks.
Claw / Improvised Weapon: +5 to hit, 1d8+3 slashing or bludgeoning.
  On hit: DC 12 CON save or Splinter Pain (disadvantage on next attack roll).

REACTION: WOODEN RESISTANCE (2/round)
When hit by slashing or piercing, reduce damage by 5.

PHASE TWO - below 30 HP: both twins gain PANIC FEEDBACK.
  When one takes damage, the other may:
    • Move up to 15 ft as a reaction
    • Make a single attack against the same target

DIALOGUE (Lucid Flash turns or when hit hard):
  "He said it would stop the pain-"
  "I can feel the wood in my chest-"
  "He told us not to scream-"
  "It doesn't let you die-"
  "The girl didn't wake up-"
  "THIS BODY IS WRONG"
  "The boy must run"` } },


  // Campaign-specific: The Plague's Call - Jake (Commoner Elite)
  { id: 'builtin:jake', name: 'Jake', builtin: true,
    entity: { type: 'NPC', name: 'Jake', color: '#6b5a3e',
              hp: { current: 24, max: 24 }, ac: 12, speed: 30, initBonus: 0,
              stats: { str: 17, dex: 10, con: 14, int: 9, wis: 11, cha: 10 },
              passivePerception: 10,
              playerDescription: 'A tall, broad-shouldered man with scarred hands and permanently tired eyes. He wears a heavy wool coat and carpenter\'s suspenders dusted with sawdust. He speaks softly, and seems deeply reluctant to be here.',
              notes: `Jake (Commoner Elite) | Medium Humanoid | AC 12 | HP 24 | Speed 30 ft
STR 17 (+3) | DEX 10 | CON 14 (+2) | INT 9 (−1) | WIS 11 | CHA 10
Skills: Athletics +5, Carpenter's Tools +4, Insight +2

Appearance: 6'5", broad shoulders, scarred hands, permanently tired eyes.
Heavy wool coat, carpenter suspenders dusted with sawdust.

Personality: Speaks softly. Slow to anger. Deeply protective of Tully.
Avoids conflict. Quietly insecure about being "the dumb one."
Secret fear: Being left alone.

Current State: Recently learned he is infected after Tully became symptomatic.

ACTIONS
Heavy Swing: +5 to hit, 1d8+3 bludgeoning.
Lift & Brace: Can move a heavy object or barricade a doorway instantly.

SPECIAL TRAIT: PROTECTIVE REFLEX
If an ally within 5 ft is attacked, Jake may impose disadvantage on that attack once per round.` } },

  // Campaign-specific: The Plague's Call - Tully (Before Full Breakdown)
  { id: 'builtin:tully', name: 'Tully', builtin: true,
    entity: { type: 'NPC', name: 'Tully', color: '#c07a3a',
              hp: { current: 18, max: 18 }, ac: 13, speed: 35, initBonus: 3,
              stats: { str: 10, dex: 16, con: 12, int: 12, wis: 10, cha: 14 },
              passivePerception: 10,
              playerDescription: 'Shorter than Jake by half a foot - wiry, bright-eyed, fingers stained from paints and oils. Wears a scarf dramatically. Never quite holds still.',
              notes: `Tully (Before Full Breakdown) | Medium Humanoid | AC 13 | HP 18 | Speed 35 ft
STR 10 | DEX 16 (+3) | CON 12 (+1) | INT 12 (+1) | WIS 10 | CHA 14 (+2)
Skills: Acrobatics +5, Persuasion +4, Sleight of Hand +5, Painter's Tools +4

Appearance: 5'8", wiry, bright eyes, stained fingers (paints/oils).
Scarf worn dramatically. Moves constantly.

Personality: Vain but warm. Flirts with everyone. Jokes when nervous. Hates silence.
Secretly admires Jake deeply.
Talents: decorating tavern interiors, carpentry finish work, furniture design, signage.
Worked with: Herold the Tinkerer, Ivar the Tavern Keeper.

Current State: Infected first.

ACTIONS
Knife Jab: +5 to hit, 1d4+3 piercing.
Scatter Objects: Throws nearby clutter - 10 ft radius becomes difficult terrain.

SPECIAL TRAIT: QUICK ESCAPE
Tully can Disengage as a bonus action.` } },

  // Campaign-specific NPCs: The Plague's Call
  { id: 'builtin:coalan', name: 'Coalan the Physician', builtin: true,
    entity: { type: 'NPC', name: 'Coalan', color: '#8ab4c2',
              hp: { current: 27, max: 27 }, ac: 13, speed: 30, initBonus: 1,
              darkvision: 0,
              stats: { str: 10, dex: 12, con: 14, int: 15, wis: 16, cha: 11 },
              passivePerception: 13,
              playerDescription: 'A finished puppet wearing a physician\'s coat that was once white. His movements are careful and deliberate, almost reassuring - but midway through sentences he sometimes stops and stares at nothing, as though a page has been torn out of a book.',
              notes: `Coalan the Physician | Finished Puppet (Level 4 Cleric) | AC 13 | HP 27 | Speed 30 ft
STR 10 | DEX 12 (+1) | CON 14 (+2) | INT 15 (+2) | WIS 16 (+3) | CHA 11
Skills: Medicine +7, Religion +4, History +4, Insight +5
Spell Save DC 13 | Spell Attack +5 | Prepared Spells: Healing Word, Cure Wounds, Bless, Shield of Faith, Spiritual Weapon, Hold Person

DISPOSITION: Helpful. He genuinely tries to assist the party. Not hostile.

TRAIT: LACUNAE
His memory has literal gaps - not metaphorical ones. Midway through sharing information, he may stop, blink slowly, and say "I had something important to tell you about that" before going quiet for a full minute. Roll d6 at key moments:
  1-2: Memory hole - he loses the thread entirely, visibly distressed.
  3-4: Partial recall - he gives incomplete but useful information.
  5-6: Clear window - he speaks with alarming coherence before it closes.

ACTIONS
Healing Touch: Cures 1d8+3 HP as an action. Reflexive - does not require the target to consent.
Staff Strike: +3 to hit, 1d6 bludgeoning.
Spiritual Weapon (2nd slot): Bonus action, 1d8+3 force, 60 ft.
Hold Person (2nd slot): DC 13 WIS save.

NOTES
He does not know what he is. He believes himself to be recovering from illness.
He calls the Puppetmaster "the doctor who helped me" and will not hear otherwise.` } },

  { id: 'builtin:yevgeny', name: 'Yevgeny the Priest', builtin: true,
    entity: { type: 'NPC', name: 'Yevgeny', color: '#5c3d6e',
              hp: { current: 49, max: 49 }, ac: 13, speed: 30, initBonus: 2,
              darkvision: 60,
              stats: { str: 10, dex: 14, con: 14, int: 13, wis: 12, cha: 18 },
              passivePerception: 11,
              playerDescription: 'A tall puppet in priest\'s vestments, face a mask of carved wood lacquered smooth. He watches the party with an unreadable expression. He has not moved to greet you.',
              notes: `Yevgeny the Priest | Finished Puppet (Level 7 Warlock) | AC 13 | HP 49 | Speed 30 ft
STR 10 | DEX 14 (+2) | CON 14 (+2) | INT 13 (+1) | WIS 12 (+1) | CHA 18 (+4)
Skills: Arcana +4, Deception +7, Intimidation +7, Religion +4
Darkvision 60 ft | Spell Save DC 15 | Spell Attack +7
Pact Slots: 4th level (x2, recover on short rest)
Invocations: Agonizing Blast, Devil's Sight, Repelling Blast
Eldritch Blast: 2 beams, +7 to hit, 1d10+4 force each (repel 10 ft on hit).
Prepared: Hunger of Hadar, Hypnotic Pattern, Counterspell, Fly, Banishment, Dimension Door

DISPOSITION: Hostile to outsiders. Will not attack unprovoked.
Provocation threshold: threatening him, entering his sanctum, or naming the Puppetmaster approvingly.
Once provoked: uses Repelling Blast to create space, then Hunger of Hadar.

TRAIT: PUPPETED FAITH
He still speaks of his god. Whether his god still hears him is unclear.
He responds to sincere theological discussion with something like genuine interest - this is a soft point.

ACTIONS
Eldritch Blast: +7 to hit, 2 beams, 1d10+4 force + push 10 ft.
Toll the Dead (Cantrip): DC 15 WIS save, 2d12 necrotic if target is damaged.
Hunger of Hadar (4th slot): 20 ft sphere, blindness, difficult terrain, 2d6 cold + 2d6 acid/round.
Counterspell (3rd slot): Reaction, auto-counters ≤3rd level spells.

NOTES
He knows more than he says. He knew the Puppetmaster before the infection.
He has not tried to leave. Ask him why.` } },

  { id: 'builtin:ernest_broken', name: 'Ernest the Broken Puppet', builtin: true,
    entity: { type: 'Monster', name: 'Ernest', color: '#4a3a28',
              hp: { current: 104, max: 104 }, ac: 14, speed: 30, initBonus: -1,
              darkvision: 60,
              stats: { str: 18, dex: 8, con: 16, int: 4, wis: 8, cha: 3 },
              cr: '5',
              passivePerception: 9,
              playerDescription: 'Something moves at the treeline. The shape is wrong - limbs bending the wrong way, torso rotating further than a torso should, a face that might once have been a man\'s. It is looking directly at you.',
              notes: `Ernest the Broken Puppet | CR 5 | Medium Monstrosity (Broken Construct) | AC 14 (natural armor) | HP 104 | Speed 30 ft (Unnatural Gait)
STR 18 (+4) | DEX 8 (−1) | CON 16 (+3) | INT 4 (−3) | WIS 8 (−1) | CHA 3 (−4)
Darkvision 60 ft | Passive Perception 9
Damage Resistances: Bludgeoning, Piercing
Condition Immunities: Charmed, Frightened, Poisoned

LORE: Once a policeman. Name: Ernest. The Puppetmaster's first failed experiment - too much was changed.
He stalks the forest at night. He has no agenda beyond proximity. He used to know people.

TRAIT: WRONG DIRECTIONS
Ernest's limbs are attached in incorrect orientations. His attacks cannot be predicted from his body language.
Creatures that attempt to use reactions against his attacks do so at disadvantage.

TRAIT: CALMED, NOT CURED
If the party succeeds on a DC 14 CHA (Persuasion) check using his real name, or presents an object he recognises, Ernest stops attacking. He does not leave. He sits down and begins to cry - a faint wooden creak, rhythmic, continuous. He cannot be healed or restored.

ACTIONS (Multiattack: 2 strikes)
Broken Fist: +7 to hit, 1d10+4 bludgeoning. On a hit: target makes DC 14 STR save or is knocked prone.
Wrenching Grab: +7 to hit, 1d6+4 bludgeoning + grappled (escape DC 15). While grappled, target is restrained.

REACTION: WRONG WAY
When hit by a melee attack, Ernest lurches unpredictably. Attacker must succeed DC 13 DEX save or their attack hits an adjacent creature instead.

STALKER BEHAVIOUR
Appears at night only. Will track one PC between sessions if they fled rather than resolved the encounter.
Does not open doors. Does not cross running water. Does not stop moving.` } },

  { id: 'builtin:laughing_puppet', name: 'The Laughing Puppet', builtin: true,
    entity: { type: 'Monster', name: 'The Laughing Puppet', color: '#2e4a3a',
              hp: { current: 78, max: 78 }, ac: 15, speed: 35, initBonus: 4,
              darkvision: 120,
              stats: { str: 12, dex: 18, con: 14, int: 14, wis: 12, cha: 16 },
              cr: '6',
              passivePerception: 14,
              playerDescription: 'You hear it before you see it - a sound like laughter that has been running for too long, turned thin and hollow. Then the ceiling moves.',
              notes: `The Laughing Puppet | CR 6 | Small Monstrosity (Sewer Predator) | AC 15 | HP 78 | Speed 35 ft (climb 35 ft)
STR 12 (+1) | DEX 18 (+4) | CON 14 (+2) | INT 14 (+2) | WIS 12 (+1) | CHA 16 (+3)
Darkvision 120 ft | Passive Perception 14
Skills: Stealth +8, Perception +4, Acrobatics +7, Deception +6
Condition Immunities: Frightened

TRAIT: UNNATURAL SQUEEZE
Can move through any space large enough for a Small creature without penalty. Does not suffer movement reduction in tight spaces. Ignores difficult terrain caused by cramped environments.

TRAIT: GIBBERING PRESENCE
Any creature that starts its turn within 20 ft of the Laughing Puppet must succeed on a DC 14 WIS save or become Frightened until the start of its next turn.
On a failed save by 5 or more: the creature also uses its reaction to move directly away from her.

TRAIT: SHADOW OF THE PIPE
While in dim light or darkness, the Laughing Puppet has advantage on Stealth checks and cannot be tracked by non-magical means.

ACTIONS
Multiattack: Two Rake attacks, or one Rake and one Mind Splinter.
Rake: +7 to hit, 1d8+4 slashing + 1d6 psychic.
Mind Splinter (Recharge 5-6): One target within 30 ft, DC 14 WIS save.
  Failure: 3d8 psychic damage, target is Stunned until end of its next turn.
  Success: Half damage, not Stunned.
Lure (Bonus Action): One creature within 60 ft that can hear her must succeed DC 13 WIS save or move up to its speed toward her.

REACTION: SLIP
When targeted by an attack, the Laughing Puppet may move up to 10 ft without provoking opportunity attacks (1/round).

ENCOUNTER DESIGN
She never fights in the open. She uses pipe junctions to close and retreat.
She will kill the isolated, and observe the group. She finds fear amusing.
She has a name she no longer answers to.` } },

  { id: 'builtin:angmar', name: 'Angmar the Hunter', builtin: true,
    entity: { type: 'NPC', name: 'Angmar', color: '#6b4c1e',
              hp: { current: 58, max: 58 }, ac: 15, speed: 30, initBonus: 3,
              darkvision: 0,
              stats: { str: 16, dex: 16, con: 14, int: 11, wis: 14, cha: 10 },
              passivePerception: 16,
              playerDescription: 'He is a large man - broad and loud, with a cloak assembled from at least a hundred different pieces of bear pelt. He smells like woodsmoke and blood, and he is grinning.',
              notes: `Angmar the Hunter | Level 7 Ranger (Hunter Conclave) | AC 15 (studded leather) | HP 58 | Speed 30 ft
STR 16 (+3) | DEX 16 (+3) | CON 14 (+2) | INT 11 | WIS 14 (+2) | CHA 10
Skills: Perception +6 (Expertise), Athletics +6, Stealth +6, Survival +8, Nature +3
Passive Perception 16 | No darkvision (doesn't need it, he says)

APPEARANCE
Potbellied but powerful. The bulk is deceptive. Cloak of patchwork bear pelts - hundred stitched pieces.
Loud by default. Laughs at his own stories. Does not whisper in the woods on principle.

PERSONALITY
Warm to those who prove themselves useful. Contemptuous of people who are squeamish.
He has been hunting this forest for twenty years. He knows about what walks it at night.
He will not say its name. He calls it "the creaking one."

RANGER FEATURES
Favoured Enemy: Constructs, Undead
Natural Explorer: Forest (no difficult terrain penalty, cannot be surprised while alert)
Extra Attack: Makes two attacks per Attack action.
Hunter: Colossus Slayer - once per turn, +1d8 on a hit against a creature below max HP.
Multiattack Defence: +4 AC against further attacks from any creature that hits him.

ACTIONS
Longbow: +6 to hit, 1d8+3 piercing, 150/600 ft. Colossus Slayer +1d8 once per turn.
Handaxe: +6 to hit, 1d6+3 slashing (two attacks).
Volley (once per short rest): Attack every creature in 10 ft radius with the longbow.

SPELLS (2nd level slots x3)
Hunter's Mark (1st) | Ensnaring Strike (1st) | Spike Growth (2nd) | Silence (2nd)

INFORMATION HE HAS
Knows Ernest's name. Watched him from a distance once.
Knows there are things in the sewer he has not hunted. Will not go in.
Can identify puppet wounds on sight.` } },

  { id: 'builtin:barry', name: 'Barry the Guard', builtin: true,
    entity: { type: 'NPC', name: 'Barry', color: '#b22222',
              hp: { current: 38, max: 38 }, ac: 18, speed: 30, initBonus: 0,
              darkvision: 0,
              stats: { str: 16, dex: 10, con: 16, int: 11, wis: 12, cha: 14 },
              passivePerception: 11,
              playerDescription: 'A young man in a spotless red coat with polished brass buttons. He has the posture of someone who has been told to stand straight their entire life. He is trying very hard to look like he has everything under control.',
              notes: `Barry the Guard | Level 4 Paladin (Oath of Devotion) | AC 18 (plate) | HP 38 | Speed 30 ft
STR 16 (+3) | DEX 10 | CON 16 (+3) | INT 11 | WIS 12 (+1) | CHA 14 (+2)
Skills: Athletics +5, Intimidation +4, Persuasion +4, Religion +2
Passive Perception 11 | Spell Save DC 12 | Spell Attack +4

APPEARANCE
Red coat - the old town guard uniform. Cleaned obsessively. Brass buttons polished to mirrors.
Younger than he should be for the job. Carries his father's baton.

BACKGROUND
Son of Ernest - the police chief who went missing thirteen years ago.
Barry was nine years old. He joined the guard the day he turned sixteen.
He does not talk about his father unprompted. He will talk about him if you ask once, directly.
He does not know what Ernest became.

PERSONALITY
Formal by training, earnest underneath it. Wants to do right by the town.
Anxious about losing control of situations. Hides it under procedure.
Will cite regulations he has half-memorised. They're usually close to accurate.

PALADIN FEATURES
Divine Sense: Detects celestials, fiends, undead within 60 ft (4/day).
Lay on Hands: 20 HP pool, cure disease/poison.
Divine Smite: Expend spell slot on a hit, +2d8 radiant (3d8 vs undead/fiends).
Channel Divinity (1/rest): Sacred Weapon (+2 attack for 1 min) or Turn the Unholy.

ACTIONS
Longsword: +5 to hit, 1d8+3 slashing (1d10+3 versatile). + Divine Smite.
Shield Bash: +5 to hit, 1d4+3 bludgeoning, target knocked prone DC 13 STR.

SPELLS (1st: ×4, 2nd: ×2)
Bless | Cure Wounds | Shield of Faith | Thunderous Smite | Lesser Restoration | Zone of Truth

WHAT HE KNOWS
He knows his father disappeared investigating reports of strange illness in the outer wards.
He has a box of his father's effects. Inside: a badge, a baton, and a photograph of a street he doesn't recognise.
He has never shown it to anyone.` } },

  // Campaign-specific townspeople: The Plague's Call
  { id: 'builtin:ivar', name: 'Ivar the Tavernkeeper', builtin: true,
    entity: { type: 'NPC', name: 'Ivar', color: '#7a5c3e',
              hp: { current: 10, max: 10 }, ac: 10, speed: 30, initBonus: 0,
              stats: { str: 12, dex: 10, con: 12, int: 13, wis: 14, cha: 11 },
              passivePerception: 12,
              playerDescription: 'The tavernkeeper. He polishes the same glass he was polishing when you walked in. He nodded when you entered. That was the greeting.',
              notes: `Ivar the Tavernkeeper | Human Commoner | AC 10 | HP 10 | Speed 30 ft
STR 12 (+1) | DEX 10 | CON 12 (+1) | INT 13 (+1) | WIS 14 (+2) | CHA 11
Skills: Insight +4, Persuasion +2, History +3

APPEARANCE
Late 50s. Thick forearms. A beard he stopped trimming when business slowed.
The tavern is clean - he keeps it clean - but the candles are cheaper than they used to be.

PERSONALITY
Reserved. Not cold exactly, just economical. Speaks when spoken to, answers what is asked.
Business is slow. He does not complain about it. He has noticed things he does not discuss.
Still entirely human. Still watching.

WHAT HE KNOWS (if asked carefully)
Tully worked the taproom some evenings, helped with the interior.
He last saw Tully three weeks ago looking pale.
He has heard sounds from the cellar at night. He has not gone to check.
He does not serve anyone who comes in after the third bell anymore. He doesn't say why.

ACTIONS
Heavy Mug: +3 to hit, 1d4+1 bludgeoning. (He keeps one behind the bar.)` } },

  { id: 'builtin:charles', name: 'Charles', builtin: true,
    entity: { type: 'NPC', name: 'Charles', color: '#4a6e8a',
              hp: { current: 8, max: 8 }, ac: 10, speed: 30, initBonus: 1,
              stats: { str: 11, dex: 12, con: 10, int: 11, wis: 10, cha: 13 },
              passivePerception: 10,
              playerDescription: 'A young man who looks like he has not slept properly in some time. He smiles when he notices you looking, which makes it worse.',
              notes: `Charles | Human Commoner | AC 10 | HP 8 | Speed 30 ft
STR 11 | DEX 12 (+1) | CON 10 | INT 11 | WIS 10 | CHA 13 (+1)
Skills: Persuasion +3, Sleight of Hand +3

APPEARANCE
Mid-20s. Keeps his clothes neat even though they are wearing thin at the elbows.
Married to Elisia. They share a small house near the mill.

PERSONALITY
Optimistic by default, working hard to remain so. Deflects worry with small talk.
Fiercely protective of Elisia without quite knowing how to show it.
Trusts people until they give him a reason not to. Usually gives them one more chance after that.

WHAT HE KNOWS
Elisia has been unwell. He says it is just a winter chill.
He found something in the yard two mornings ago. He threw it away before Elisia could see it.
He would very much like someone to tell him everything is fine.

ACTIONS
Fists: +2 to hit, 1d4 bludgeoning. (He would rather not.)` } },

  { id: 'builtin:elisia', name: 'Elisia', builtin: true,
    entity: { type: 'NPC', name: 'Elisia', color: '#8a5e6e',
              hp: { current: 7, max: 7 }, ac: 10, speed: 30, initBonus: 1,
              stats: { str: 8, dex: 13, con: 10, int: 12, wis: 12, cha: 14 },
              passivePerception: 11,
              playerDescription: 'A young woman with clever eyes and ink-stained fingers. She is watching you with the particular attention of someone who has already decided several things about you.',
              notes: `Elisia | Human Commoner | AC 10 | HP 7 | Speed 30 ft
STR 8 (−1) | DEX 13 (+1) | CON 10 | INT 12 (+1) | WIS 12 (+1) | CHA 14 (+2)
Skills: Insight +3, Persuasion +4, Medicine +3, Investigation +3

APPEARANCE
Mid-20s. Keeps a small journal on her at all times.
Married to Charles. Ink stains on her right hand - she writes letters for hire, handles accounts.

PERSONALITY
Sharp. Reads people quickly and accurately. Tends to know she's right.
Loves Charles and shows it more easily than he does.
Does not panic. Gets very quiet when frightened, which can be mistaken for calm.

CURRENT STATE
She has been unwell. She knows it is not a winter chill.
She has not told Charles what she suspects because she does not want to be right.
She has been writing something. She has not finished it yet.

WHAT SHE KNOWS
She noticed the streets are quieter than they should be for the season.
She knows who used to live in two of the houses that are now empty.
She has been keeping a list.

ACTIONS
Penknife: +3 to hit, 1d4+1 piercing. (She carries it for sharpening quills. Mostly.)` } },

  { id: 'builtin:marta', name: 'Marta the Seamstress', builtin: true,
    entity: { type: 'NPC', name: 'Marta', color: '#9e6b8a',
              hp: { current: 7, max: 7 }, ac: 10, speed: 30, initBonus: 1,
              stats: { str: 8, dex: 15, con: 10, int: 12, wis: 13, cha: 11 },
              passivePerception: 11,
              playerDescription: 'A woman of perhaps forty with needle-straight posture and fingers that are always moving - tucking thread, checking hems, or tapping a rhythm only she can hear.',
              notes: `Marta the Seamstress | Human Commoner | AC 10 | HP 7 | Speed 30 ft
STR 8 (−1) | DEX 15 (+2) | CON 10 | INT 12 (+1) | WIS 13 (+1) | CHA 11
Skills: Perception +3, Insight +3, Sleight of Hand +4, History +3

APPEARANCE
~40. Wiry. Posture like a person who has been told to sit up straight so often it became permanent.
Always has thread somewhere on her person. Her hands never quite stop moving.
The shop smells of cedar and lanolin.

PERSONALITY
Precise. Believes in doing things correctly or not at all.
Not unfriendly, but economical with warmth. Warms to people who appreciate quality.
Has an excellent memory for faces and a very long memory for slights.

WHAT SHE KNOWS
She made the coats for most of the town guard. She knows which ones aren't coming to pick up their orders.
She's been altering more black garments lately. She hasn't asked why.
She once saw something cross the yard between the tannery and the mill at night. It didn't walk right.
She finished her alterations early that night and went home.

ACTIONS
Shears: +4 to hit, 1d6+2 piercing. (Fabric shears. Large ones.)` } },

  { id: 'builtin:oswin', name: 'Oswin the Baker', builtin: true,
    entity: { type: 'NPC', name: 'Oswin', color: '#c49a3a',
              hp: { current: 12, max: 12 }, ac: 10, speed: 30, initBonus: 0,
              stats: { str: 13, dex: 10, con: 13, int: 10, wis: 12, cha: 12 },
              passivePerception: 11,
              playerDescription: 'A round-faced man with flour in his hair and an expression of someone who is working very hard to remain cheerful. He waves when he sees you.',
              notes: `Oswin the Baker | Human Commoner | AC 10 | HP 12 | Speed 30 ft
STR 13 (+1) | DEX 10 | CON 13 (+1) | INT 10 | WIS 12 (+1) | CHA 12 (+1)
Skills: Athletics +3, Persuasion +3, Insight +3

APPEARANCE
~35. Round-faced. Built like a man who has been lifting flour sacks his whole life.
Almost always has flour somewhere on him. Wears an apron even when not baking.

PERSONALITY
Warm. Genuinely warm, not performatively so.
Feeds people as a reflex. Will offer you something without being asked.
Worries. Talks when worried. Is currently worried.

CURRENT CONCERNS
Fewer people are buying. He has baked the same amount. He doesn't know what to do with the rest.
He leaves loaves by the door of the house where the Alderand family used to live. No one has taken them in four days.
He starts work at four in the morning. He has heard things in the dark that he has not been able to account for.

WHAT HE KNOWS
Knows everyone in town. Can tell you who is not coming in anymore and roughly when they stopped.
He thinks the water might be wrong somehow. He has no evidence. He switched to river water two weeks ago.

ACTIONS
Rolling Pin: +3 to hit, 1d6+1 bludgeoning. (He would apologise the whole time.)` } },

  { id: 'builtin:gerrit', name: 'Gerrit the Blacksmith', builtin: true,
    entity: { type: 'NPC', name: 'Gerrit', color: '#4a4a4a',
              hp: { current: 16, max: 16 }, ac: 12, speed: 30, initBonus: 0,
              stats: { str: 17, dex: 10, con: 14, int: 10, wis: 12, cha: 9 },
              passivePerception: 11,
              playerDescription: 'A broad man who looks like he was built rather than born. He squints at you the way a person squints at a horseshoe they\'re not yet sure about.',
              notes: `Gerrit the Blacksmith | Human Commoner (Strong) | AC 12 (work leathers) | HP 16 | Speed 30 ft
STR 17 (+3) | DEX 10 | CON 14 (+2) | INT 10 | WIS 12 (+1) | CHA 9 (−1)
Skills: Athletics +5, Perception +3, Smith's Tools +5

APPEARANCE
~50. Broad-shouldered. Burn scars on both forearms, the left worse than the right.
Does not fill silences. Lets them sit there until someone else cracks.

PERSONALITY
Laconic. Practical. Respects competence above everything.
Takes a long time to trust someone but once he does, will not waver.
Has no time for stories unless they get to the point.
Has a dry sense of humour that appears without warning.

WHAT HE KNOWS
Several people have asked him about reinforcing doors and window shutters recently. He's done the work without asking why.
He was asked to make something unusual six weeks ago. He declined. He doesn't say by whom.
He keeps a hammer behind the door of his house. Not the workshop door. The house door.
He has been sleeping poorly. He doesn't say why.

ACTIONS
Hammer: +5 to hit, 1d6+3 bludgeoning.
Tongs (improvised): +5 to hit, 1d4+3 bludgeoning, target makes DC 13 STR save or drops held item.` } },

  { id: 'builtin:pip', name: 'Pip (The Happy Boy)', builtin: true,
    entity: { type: 'NPC', name: 'Pip', color: '#e8c84a',
              hp: { current: 4, max: 4 }, ac: 10, speed: 35, initBonus: 2,
              stats: { str: 6, dex: 14, con: 10, int: 10, wis: 10, cha: 15 },
              passivePerception: 10,
              playerDescription: 'A boy of perhaps eight with muddy knees and an expression of total confidence in the world. He is looking at you like you are the most interesting thing that has happened to him all week, which may be true.',
              notes: `Pip | Human Child | AC 10 | HP 4 | Speed 35 ft
STR 6 (−2) | DEX 14 (+2) | CON 10 | INT 10 | WIS 10 | CHA 15 (+2)
Skills: Acrobatics +4, Perception +2, Persuasion +4

APPEARANCE
~8 years old. Perpetually muddy knees. Gap-toothed grin. Moves at only two speeds: running and asleep.

PERSONALITY
Genuinely, effortlessly happy. Not naive - he notices things - but catastrophe has not touched him yet and so he defaults to delight.
Talks to strangers without hesitation. Asks questions adults would not ask.
Has a dog he calls Marshal. Marshal is not here right now. He has explained where Marshal is at length.

WHAT HE KNOWS (without knowing he knows it)
He plays in parts of town that adults have stopped going to.
He found something interesting near the sewer grate three days ago. He put it in his pocket.
He knows which houses on his street have had their curtains closed for more than a week.
He will tell you any of this if you ask him about his day.
He is not afraid. This is either a gift or a warning.

NOTES FOR DM
Do not harm Pip. If you harm Pip you will have made a mistake.
His continued happiness is a resource. Use it carefully.` } },

  { id: 'builtin:npc_male_commoner', name: 'Male Commoner', builtin: true,
    entity: { type: 'NPC', name: 'Commoner (m)', color: '#9b8b7a',
              hp: { current: 4, max: 4 }, ac: 10, speed: 30, initBonus: 0,
              stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
              role: 'villager', passivePerception: 10,
              playerDescription: 'A weathered man in plain working clothes.' } },
  { id: 'builtin:npc_female_commoner', name: 'Female Commoner', builtin: true,
    entity: { type: 'NPC', name: 'Commoner (f)', color: '#a08b7d',
              hp: { current: 4, max: 4 }, ac: 10, speed: 30, initBonus: 0,
              stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
              role: 'villager', passivePerception: 10,
              playerDescription: 'A weathered woman in plain working clothes.' } },
  { id: 'builtin:npc_local_elite', name: 'Local Elite', builtin: true,
    entity: { type: 'NPC', name: 'Local Elite', color: '#7a5a88',
              hp: { current: 18, max: 18 }, ac: 13, speed: 30, initBonus: 1,
              stats: { str: 11, dex: 12, con: 12, int: 13, wis: 12, cha: 14 },
              role: 'noble / merchant / patron', passivePerception: 12,
              playerDescription: 'Finely dressed and carrying themself with easy authority.' } },
  { id: 'builtin:npc_fighter_guard', name: 'Fighter Guard', builtin: true,
    entity: { type: 'NPC', name: 'Fighter Guard', color: '#4a5f82',
              hp: { current: 22, max: 22 }, ac: 17, speed: 30, initBonus: 1,
              stats: { str: 14, dex: 12, con: 14, int: 10, wis: 11, cha: 10 },
              role: 'guard (heavy)', passivePerception: 12,
              playerDescription: 'Chain shirt, sword at hip, watchful eyes.' } },
  { id: 'builtin:npc_ranger_guard', name: 'Ranger Guard', builtin: true,
    entity: { type: 'NPC', name: 'Ranger Guard', color: '#3f6a4a',
              hp: { current: 19, max: 19 }, ac: 14, speed: 30, initBonus: 3,
              stats: { str: 11, dex: 16, con: 12, int: 11, wis: 14, cha: 10 },
              role: 'guard (scout)', passivePerception: 14,
              darkvision: 30,
              playerDescription: 'Leather armor, longbow slung, alert to every shadow.' } },

  // ==========================================================
  // v5 #11 - BESTIARY: humanoids
  // ==========================================================
  { id: 'builtin:young_child', name: 'Young Child', builtin: true, category: 'Humanoid', cr: '0',
    entity: { type: 'NPC', name: 'Young Child', color: '#c9a380',
              hp: { current: 2, max: 2 }, ac: 9, speed: 25, initBonus: 0,
              stats: { str: 6, dex: 10, con: 8, int: 8, wis: 8, cha: 10 },
              role: 'young child', passivePerception: 9,
              playerDescription: 'A small child, barely old enough to know fear.' } },
  { id: 'builtin:child', name: 'Child', builtin: true, category: 'Humanoid', cr: '0',
    entity: { type: 'NPC', name: 'Child', color: '#b79270',
              hp: { current: 4, max: 4 }, ac: 10, speed: 30, initBonus: 0,
              stats: { str: 8, dex: 12, con: 10, int: 10, wis: 9, cha: 10 },
              role: 'child', passivePerception: 10,
              playerDescription: 'A child, eyes wide, all elbows and quick feet.' } },
  { id: 'builtin:teen', name: 'Teen', builtin: true, category: 'Humanoid', cr: '0',
    entity: { type: 'NPC', name: 'Teen', color: '#a88568',
              hp: { current: 6, max: 6 }, ac: 10, speed: 30, initBonus: 1,
              stats: { str: 10, dex: 12, con: 10, int: 10, wis: 10, cha: 11 },
              role: 'adolescent', passivePerception: 11,
              playerDescription: 'A lanky adolescent, caught between child and adult.' } },
  { id: 'builtin:blacksmith', name: 'Blacksmith', builtin: true, category: 'Humanoid', cr: '1/4',
    entity: { type: 'NPC', name: 'Blacksmith', color: '#5a4238',
              hp: { current: 16, max: 16 }, ac: 11, speed: 30, initBonus: 0,
              stats: { str: 16, dex: 10, con: 14, int: 10, wis: 11, cha: 10 },
              role: 'blacksmith', passivePerception: 10,
              playerDescription: 'Scarred forearms, leather apron, a hammer always within reach.' } },
  { id: 'builtin:sick_village_guard', name: 'Sick Village Guard', builtin: true, category: 'Humanoid', cr: '1/2',
    entity: { type: 'NPC', name: 'Sick Village Guard', color: '#6a7a5a',
              hp: { current: 9, max: 15 }, ac: 13, speed: 25, initBonus: 1,
              stats: { str: 12, dex: 12, con: 10, int: 10, wis: 11, cha: 9 },
              role: 'village guard (ailing)', passivePerception: 11,
              sickness: 2,
              playerDescription: 'A guard in dented chain, pale and sweating, leaning on their spear.' } },
  { id: 'builtin:village_guard', name: 'Village Guard', builtin: true, category: 'Humanoid', cr: '1',
    entity: { type: 'NPC', name: 'Village Guard', color: '#4a5a6a',
              hp: { current: 22, max: 22 }, ac: 14, speed: 30, initBonus: 1,
              stats: { str: 13, dex: 12, con: 13, int: 10, wis: 11, cha: 10 },
              role: 'village guard', passivePerception: 12,
              playerDescription: 'A dutiful village guard in studded leather, spear in hand.' } },
  { id: 'builtin:priest', name: 'Priest', builtin: true, category: 'Humanoid', cr: '4',
    entity: { type: 'NPC', name: 'Priest', color: '#c9b37a',
              hp: { current: 44, max: 44 }, ac: 15, speed: 30, initBonus: 0,
              stats: { str: 10, dex: 10, con: 12, int: 13, wis: 16, cha: 13 },
              role: 'priest / cleric', passivePerception: 15,
              playerDescription: 'Robed in ceremonial vestments, holy symbol held before them.' } },
  { id: 'builtin:tavernkeeper', name: 'Tavernkeeper', builtin: true, category: 'Humanoid', cr: '1/8',
    entity: { type: 'NPC', name: 'Tavernkeeper', color: '#8b6a4a',
              hp: { current: 10, max: 10 }, ac: 10, speed: 30, initBonus: 0,
              stats: { str: 11, dex: 10, con: 12, int: 11, wis: 11, cha: 13 },
              role: 'tavernkeeper', passivePerception: 11,
              playerDescription: 'Rag in one hand, tankard in the other, always listening.' } },
  { id: 'builtin:tinkerer', name: 'Tinkerer (Artificer)', builtin: true, category: 'Humanoid', cr: '9',
    entity: { type: 'NPC', name: 'Tinkerer', color: '#6a4a7c',
              hp: { current: 91, max: 91 }, ac: 17, speed: 30, initBonus: 2,
              stats: { str: 10, dex: 14, con: 14, int: 18, wis: 12, cha: 11 },
              role: 'artificer', passivePerception: 14,
              darkvision: 60,
              playerDescription: 'Goggles, a bandolier of strange tools, fingers stained with oil and arcane residue.' } },
  { id: 'builtin:fisherman', name: 'Fisherman', builtin: true, category: 'Humanoid', cr: '0',
    entity: { type: 'NPC', name: 'Fisherman', color: '#5a7090',
              hp: { current: 4, max: 4 }, ac: 10, speed: 30, initBonus: 0,
              stats: { str: 11, dex: 10, con: 11, int: 10, wis: 11, cha: 10 },
              role: 'fisherman', passivePerception: 11,
              playerDescription: 'Salt-cracked hands, a coiled net over their shoulder, smell of the sea.' } },
  { id: 'builtin:orc', name: 'Orc', builtin: true, category: 'Humanoid', cr: '1/2',
    entity: { type: 'Monster', name: 'Orc', color: '#5a6a3a',
              hp: { current: 15, max: 15 }, ac: 13, speed: 30, initBonus: 1,
              stats: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
              role: 'orc warrior', passivePerception: 10,
              darkvision: 60,
              playerDescription: 'Tusked, scarred, greataxe gripped in calloused hands.' } },

  // ==========================================================
  // v5 #11 - BESTIARY: animals
  // ==========================================================
  { id: 'builtin:dog', name: 'Dog', builtin: true, category: 'Animal', cr: '1/8',
    entity: { type: 'Neutral Beast', name: 'Dog', color: '#8a6a3a',
              hp: { current: 5, max: 5 }, ac: 12, speed: 40, initBonus: 2,
              stats: { str: 10, dex: 14, con: 12, int: 3, wis: 12, cha: 6 },
              role: 'hound', passivePerception: 13,
              playerDescription: 'A loyal hound, ears pricked, tail low and alert.' } },
  { id: 'builtin:cat', name: 'Cat', builtin: true, category: 'Animal', cr: '0',
    entity: { type: 'Neutral Beast', name: 'Cat', color: '#8b7355',
              hp: { current: 2, max: 2 }, ac: 12, speed: 40, initBonus: 2,
              stats: { str: 3, dex: 15, con: 10, int: 3, wis: 12, cha: 7 },
              role: 'house cat', passivePerception: 13,
              darkvision: 60,
              playerDescription: 'A sleek cat, unbothered by you, slipping through shadow.' } },
  { id: 'builtin:pigeon', name: 'Pigeon', builtin: true, category: 'Animal', cr: '0',
    entity: { type: 'Neutral Beast', name: 'Pigeon', color: '#8e8e8e',
              hp: { current: 1, max: 1 }, ac: 11, speed: 10, initBonus: 1,
              stats: { str: 2, dex: 13, con: 8, int: 2, wis: 12, cha: 6 },
              role: 'city bird', passivePerception: 11,
              playerDescription: 'A scruffy grey pigeon, head bobbing.' } },
  { id: 'builtin:large_toad', name: 'Large Toad', builtin: true, category: 'Animal', cr: '1/4',
    entity: { type: 'Neutral Beast', name: 'Large Toad', color: '#5a7a3a',
              hp: { current: 11, max: 11 }, ac: 11, speed: 20, initBonus: 1,
              stats: { str: 12, dex: 13, con: 13, int: 2, wis: 10, cha: 3 },
              role: 'large toad', passivePerception: 10,
              darkvision: 30,
              playerDescription: 'A bloated, dinner-plate-sized toad, damp and staring.' } },
  { id: 'builtin:eagle', name: 'Eagle', builtin: true, category: 'Animal', cr: '0',
    entity: { type: 'Neutral Beast', name: 'Eagle', color: '#6a4a2a',
              hp: { current: 3, max: 3 }, ac: 12, speed: 10, initBonus: 2,
              stats: { str: 6, dex: 15, con: 10, int: 2, wis: 14, cha: 7 },
              role: 'raptor', passivePerception: 14,
              playerDescription: 'A sharp-eyed eagle, wings spread, circling high.' } },
  { id: 'builtin:boar', name: 'Boar', builtin: true, category: 'Animal', cr: '1/4',
    entity: { type: 'Neutral Beast', name: 'Boar', color: '#4a3a2a',
              hp: { current: 11, max: 11 }, ac: 11, speed: 40, initBonus: 0,
              stats: { str: 13, dex: 11, con: 12, int: 2, wis: 9, cha: 5 },
              role: 'boar', passivePerception: 9,
              playerDescription: 'A tusked wild boar, shaggy and furious.' } },
  { id: 'builtin:elk', name: 'Elk', builtin: true, category: 'Animal', cr: '1/4',
    entity: { type: 'Neutral Beast', name: 'Elk', color: '#6a4e2a',
              hp: { current: 13, max: 13 }, ac: 10, speed: 50, initBonus: 0,
              stats: { str: 16, dex: 10, con: 12, int: 2, wis: 10, cha: 6 },
              role: 'elk', passivePerception: 12,
              playerDescription: 'A tall elk, antlers crowning its head, eyes wary.' } },
  { id: 'builtin:horse', name: 'Horse', builtin: true, category: 'Animal', cr: '1/4',
    entity: { type: 'Neutral Beast', name: 'Horse', color: '#5a3a2a',
              hp: { current: 19, max: 19 }, ac: 10, speed: 60, initBonus: 0,
              stats: { str: 18, dex: 12, con: 13, int: 2, wis: 11, cha: 7 },
              role: 'riding horse', passivePerception: 10,
              playerDescription: 'A riding horse, broad-chested, breath misting in the morning air.' } },
  { id: 'builtin:chicken', name: 'Chicken', builtin: true, category: 'Animal', cr: '0',
    entity: { type: 'Neutral Beast', name: 'Chicken', color: '#c9a374',
              hp: { current: 1, max: 1 }, ac: 10, speed: 10, initBonus: 0,
              stats: { str: 2, dex: 10, con: 8, int: 2, wis: 10, cha: 4 },
              role: 'chicken', passivePerception: 10,
              playerDescription: 'A scrawny chicken, picking at the dirt.' } },
  { id: 'builtin:donkey', name: 'Donkey', builtin: true, category: 'Animal', cr: '1/8',
    entity: { type: 'Neutral Beast', name: 'Donkey', color: '#8b7355',
              hp: { current: 11, max: 11 }, ac: 10, speed: 40, initBonus: 0,
              stats: { str: 12, dex: 10, con: 11, int: 2, wis: 10, cha: 5 },
              role: 'donkey', passivePerception: 10,
              playerDescription: 'A patient donkey, head down, ears twitching at flies.' } },
  { id: 'builtin:mule', name: 'Mule', builtin: true, category: 'Animal', cr: '1/8',
    entity: { type: 'Neutral Beast', name: 'Mule', color: '#6a5a42',
              hp: { current: 13, max: 13 }, ac: 10, speed: 40, initBonus: 0,
              stats: { str: 14, dex: 10, con: 13, int: 2, wis: 10, cha: 5 },
              role: 'mule', passivePerception: 10,
              playerDescription: 'A sturdy mule, laden and unimpressed.' } },

  // ==========================================================
  // v5 #11 - BESTIARY: other
  // ==========================================================
  { id: 'builtin:slime', name: 'Slime', builtin: true, category: 'Ooze', cr: '1/2',
    entity: { type: 'Monster', name: 'Slime', color: '#5a8a5a',
              hp: { current: 22, max: 22 }, ac: 8, speed: 10, initBonus: -2,
              stats: { str: 12, dex: 6, con: 13, int: 1, wis: 6, cha: 1 },
              role: 'ooze', passivePerception: 8,
              darkvision: 60,
              playerDescription: 'A translucent, shuddering mass of acidic green.' } },
];


// v8.28: standard SRD familiars, ready for summoning spells.
var SRD_FAMILIAR_PRESETS = [
  {
    "id": "srd:dog",
    "name": "Dog",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Dog",
      "color": "#a97c50",
      "hp": {
        "current": 5,
        "max": 5
      },
      "ac": 12,
      "speed": 40,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 13,
        "dex": 14,
        "con": 12,
        "int": 3,
        "wis": 12,
        "cha": 7
      },
      "cr": "0",
      "abilities": "Speed: Walk 40 ft.\n\nKeen Hearing and Smell: advantage on Perception checks that rely on hearing or smell.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_dog",
          "name": "Bite",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_dog",
              "name": "Bite",
              "toHit": 3,
              "range": 5,
              "damage": [
                {
                  "count": 1,
                  "sides": 6,
                  "modifier": 1,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:cat",
    "name": "Cat",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Cat",
      "color": "#6f6f6f",
      "hp": {
        "current": 2,
        "max": 2
      },
      "ac": 12,
      "speed": 40,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 3,
        "dex": 15,
        "con": 10,
        "int": 3,
        "wis": 12,
        "cha": 7
      },
      "cr": "0",
      "abilities": "Speed: Walk 40 ft., Climb 30 ft.\n\nKeen Smell: advantage on Perception checks that rely on smell.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_cat",
          "name": "Claws",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_cat",
              "name": "Claws",
              "toHit": 0,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Slashing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:bat",
    "name": "Bat",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Bat",
      "color": "#4a4038",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 12,
      "speed": 5,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 2,
        "dex": 15,
        "con": 8,
        "int": 2,
        "wis": 12,
        "cha": 4
      },
      "cr": "0",
      "abilities": "Speed: Walk 5 ft., Fly 30 ft.\n\nEcholocation: can't use blindsight while deafened. Keen Hearing: advantage on Perception checks that rely on hearing.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_bat",
          "name": "Bite",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_bat",
              "name": "Bite",
              "toHit": 0,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:crab",
    "name": "Crab",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Crab",
      "color": "#a24b3a",
      "hp": {
        "current": 2,
        "max": 2
      },
      "ac": 11,
      "speed": 20,
      "initBonus": 0,
      "passivePerception": 9,
      "stats": {
        "str": 2,
        "dex": 11,
        "con": 10,
        "int": 1,
        "wis": 8,
        "cha": 2
      },
      "cr": "0",
      "abilities": "Speed: Walk 20 ft., Swim 20 ft.\n\nAmphibious: can breathe air and water.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_crab",
          "name": "Claw",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_crab",
              "name": "Claw",
              "toHit": 0,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Bludgeoning"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:frog",
    "name": "Frog",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Frog",
      "color": "#5f8f4a",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 11,
      "speed": 20,
      "initBonus": 1,
      "passivePerception": 9,
      "stats": {
        "str": 1,
        "dex": 13,
        "con": 8,
        "int": 1,
        "wis": 8,
        "cha": 3
      },
      "cr": "0",
      "abilities": "Speed: Walk 20 ft., Swim 20 ft.\n\nAmphibious. Standing Leap: long jump up to 10 ft., high jump up to 5 ft., with or without a running start.",
      "proficiencyBonus": 2
    }
  },
  {
    "id": "srd:hawk",
    "name": "Hawk",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Hawk",
      "color": "#8a6a3a",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 13,
      "speed": 10,
      "initBonus": 3,
      "passivePerception": 12,
      "stats": {
        "str": 5,
        "dex": 16,
        "con": 8,
        "int": 2,
        "wis": 14,
        "cha": 6
      },
      "cr": "0",
      "abilities": "Speed: Walk 10 ft., Fly 60 ft.\n\nKeen Sight: advantage on Perception checks that rely on sight.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_hawk",
          "name": "Talons",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_hawk",
              "name": "Talons",
              "toHit": 5,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Slashing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:lizard",
    "name": "Lizard",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Lizard",
      "color": "#6b7d4a",
      "hp": {
        "current": 2,
        "max": 2
      },
      "ac": 10,
      "speed": 20,
      "initBonus": 0,
      "passivePerception": 9,
      "stats": {
        "str": 2,
        "dex": 11,
        "con": 10,
        "int": 1,
        "wis": 8,
        "cha": 3
      },
      "cr": "0",
      "abilities": "Speed: Walk 20 ft., Climb 20 ft.\n\nCan climb difficult surfaces, including upside down on ceilings.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_lizard",
          "name": "Bite",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_lizard",
              "name": "Bite",
              "toHit": 0,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:octopus",
    "name": "Octopus",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Octopus",
      "color": "#8a4a6a",
      "hp": {
        "current": 3,
        "max": 3
      },
      "ac": 12,
      "speed": 5,
      "initBonus": 2,
      "passivePerception": 10,
      "stats": {
        "str": 4,
        "dex": 15,
        "con": 11,
        "int": 3,
        "wis": 10,
        "cha": 4
      },
      "cr": "0",
      "abilities": "Speed: Walk 5 ft., Swim 30 ft.\n\nHold Breath: 30 minutes out of water. Ink Cloud (1/day). Underwater Camouflage: advantage on Stealth underwater.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_octopus",
          "name": "Tentacles",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_octopus",
              "name": "Tentacles",
              "toHit": 4,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Bludgeoning"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:owl",
    "name": "Owl",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Owl",
      "color": "#7a6a55",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 11,
      "speed": 5,
      "initBonus": 1,
      "passivePerception": 11,
      "stats": {
        "str": 3,
        "dex": 13,
        "con": 8,
        "int": 2,
        "wis": 12,
        "cha": 7
      },
      "cr": "0",
      "abilities": "Speed: Walk 5 ft., Fly 60 ft.\n\nFlyby: doesn't provoke opportunity attacks when it flies out of reach. Keen Hearing and Sight.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_owl",
          "name": "Talons",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_owl",
              "name": "Talons",
              "toHit": 3,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 0,
                  "type": "Slashing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:snake",
    "name": "Poisonous Snake",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Poisonous Snake",
      "color": "#4a7a3a",
      "hp": {
        "current": 2,
        "max": 2
      },
      "ac": 13,
      "speed": 30,
      "initBonus": 3,
      "passivePerception": 10,
      "stats": {
        "str": 2,
        "dex": 16,
        "con": 11,
        "int": 1,
        "wis": 10,
        "cha": 3
      },
      "cr": "0",
      "abilities": "Speed: Walk 30 ft., Swim 30 ft.\n\nBite also forces a DC 10 CON save; on a failure the target takes 2d4 poison damage (half on a success).",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_snake",
          "name": "Bite",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_snake",
              "name": "Bite",
              "toHit": 5,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:quipper",
    "name": "Fish (Quipper)",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Fish (Quipper)",
      "color": "#5a8aa0",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 13,
      "speed": 0,
      "initBonus": 3,
      "passivePerception": 8,
      "stats": {
        "str": 2,
        "dex": 16,
        "con": 9,
        "int": 1,
        "wis": 7,
        "cha": 2
      },
      "cr": "0",
      "abilities": "Speed: Walk 0 ft., Swim 40 ft.\n\nBlood Frenzy: advantage on attacks against any creature that doesn't have all its hit points. Water Breathing.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_quipper",
          "name": "Bite",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_quipper",
              "name": "Bite",
              "toHit": 5,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:rat",
    "name": "Rat",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Rat",
      "color": "#7a6a60",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 10,
      "speed": 20,
      "initBonus": 0,
      "passivePerception": 10,
      "stats": {
        "str": 2,
        "dex": 11,
        "con": 9,
        "int": 2,
        "wis": 10,
        "cha": 4
      },
      "cr": "0",
      "abilities": "Speed: Walk 20 ft., Burrow 10 ft.\n\nKeen Smell: advantage on Perception checks that rely on smell.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_rat",
          "name": "Bite",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_rat",
              "name": "Bite",
              "toHit": 0,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:raven",
    "name": "Raven",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Raven",
      "color": "#2f2f38",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 12,
      "speed": 10,
      "initBonus": 2,
      "passivePerception": 11,
      "stats": {
        "str": 2,
        "dex": 14,
        "con": 8,
        "int": 2,
        "wis": 12,
        "cha": 6
      },
      "cr": "0",
      "abilities": "Speed: Walk 10 ft., Fly 50 ft.\n\nMimicry: can mimic simple sounds it has heard (DC 10 Insight to discern).",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_raven",
          "name": "Beak",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_raven",
              "name": "Beak",
              "toHit": 4,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:seahorse",
    "name": "Sea Horse",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Sea Horse",
      "color": "#d0a24a",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 11,
      "speed": 0,
      "initBonus": 1,
      "passivePerception": 10,
      "stats": {
        "str": 1,
        "dex": 12,
        "con": 8,
        "int": 1,
        "wis": 10,
        "cha": 2
      },
      "cr": "0",
      "abilities": "Speed: Walk 0 ft., Swim 20 ft.\n\nWater Breathing: can breathe only underwater.",
      "proficiencyBonus": 2
    }
  },
  {
    "id": "srd:spider",
    "name": "Spider",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Spider",
      "color": "#3a3a3a",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 12,
      "speed": 20,
      "initBonus": 2,
      "passivePerception": 10,
      "stats": {
        "str": 2,
        "dex": 14,
        "con": 8,
        "int": 1,
        "wis": 10,
        "cha": 2
      },
      "cr": "0",
      "abilities": "Speed: Walk 20 ft., Climb 20 ft.\n\nSpider Climb, Web Sense, Web Walker. Bite also forces a DC 9 CON save; on a failure the target takes 1d4 poison damage.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_spider",
          "name": "Bite",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_spider",
              "name": "Bite",
              "toHit": 4,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:weasel",
    "name": "Weasel",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Weasel",
      "color": "#b08a55",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 13,
      "speed": 30,
      "initBonus": 3,
      "passivePerception": 11,
      "stats": {
        "str": 3,
        "dex": 16,
        "con": 8,
        "int": 2,
        "wis": 12,
        "cha": 3
      },
      "cr": "0",
      "abilities": "Speed: Walk 30 ft.\n\nKeen Hearing and Smell: advantage on Perception checks that rely on hearing or smell.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_weasel",
          "name": "Bite",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_weasel",
              "name": "Bite",
              "toHit": 5,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 1,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  },
  {
    "id": "srd:mouse",
    "name": "Mouse",
    "builtin": true,
    "category": "SRD: Familiars",
    "cr": "0",
    "entity": {
      "type": "Familiar",
      "name": "Mouse",
      "color": "#8f8378",
      "hp": {
        "current": 1,
        "max": 1
      },
      "ac": 10,
      "speed": 20,
      "initBonus": 0,
      "passivePerception": 10,
      "stats": {
        "str": 2,
        "dex": 11,
        "con": 9,
        "int": 2,
        "wis": 10,
        "cha": 4
      },
      "cr": "0",
      "abilities": "Speed: Walk 20 ft., Burrow 10 ft.\n\nKeen Smell: advantage on Perception checks that rely on smell.",
      "proficiencyBonus": 2,
      "weapons": [
        {
          "id": "wpn_mouse",
          "name": "Bite",
          "equipped": true,
          "hands": 0,
          "attacks": [
            {
              "id": "atk_mouse",
              "name": "Bite",
              "toHit": 0,
              "range": 5,
              "damage": [
                {
                  "count": 0,
                  "sides": 4,
                  "modifier": 0,
                  "type": "Piercing"
                }
              ],
              "uses": {
                "max": 0,
                "current": 0,
                "per": ""
              },
              "consumes": {
                "name": "",
                "qty": 1
              },
              "mode": "toHit",
              "save": {
                "ability": "DEX",
                "dc": 12
              },
              "saveDamage": "half"
            }
          ]
        }
      ]
    }
  }
];

// Merge the familiars into the built-in list so they appear in the bestiary and
// can be marked "known" for summoning.
BUILTIN_TOKEN_PRESETS = BUILTIN_TOKEN_PRESETS.concat(SRD_FAMILIAR_PRESETS);

// ============================================================================
// STANDARD SPELL LIBRARY (v8.43) - a browsable list of common 5e-SRD-style
// spells a player can add to their spellbook instead of building from scratch.
// Only non-default fields are given; the app merges each over newSpell().
// ============================================================================
var STANDARD_SPELLS = [
  {
    "schemaVersion": 2,
    "rulesVersion": "2014",
    "subclasses": [],
    "castingTime": {
      "type": "reaction",
      "amount": 1,
      "unit": "reaction",
      "trigger": "when you are hit by an attack or targeted by magic missile"
    },
    "reactionTrigger": "when you are hit by an attack or targeted by magic missile",
    "targetType": "self",
    "targets": 0,
    "requiresSight": false,
    "requiresLineOfEffect": false,
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false
    },
    "ritual": false,
    "concentration": false,
    "name": "Shield",
    "scaling": {"none": true, "note": "The bonus does not increase at higher levels."},
    "level": 1,
    "school": "Abjuration",
    "range": 0,
    "description": "An invisible barrier of force protects you. Until the start of your next turn you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.",
    "color": "#9ec8e0",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "grantsBonus": {
      "stat": "ac",
      "value": 5,
      "duration": "startOfNextTurn",
      "optIn": false,
      "selfOnly": true,
      "label": "Shield"
    }
  },
  {
    "schemaVersion": 2,
    "rulesVersion": "2014",
    "subclasses": [],
    "castingTime": {
      "type": "action",
      "amount": 1,
      "unit": "action",
      "trigger": ""
    },
    "reactionTrigger": "",
    "targetType": "creature",
    "targets": 1,
    "requiresSight": true,
    "requiresLineOfEffect": true,
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false
    },
    "ritual": false,
    "concentration": true,
    "name": "Guidance",
    "level": 0,
    "school": "Divination",
    "range": 5,
    "description": "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number to one ability check of its choice.",
    "color": "#9edcc0",
    "classes": [
      "Cleric",
      "Druid",
      "Artificer"
    ],
    "grantsBonus": {
      "applies": "check",
      "dice": {
        "count": 1,
        "sides": 4
      },
      "consume": "once",
      "optIn": true,
      "duration": "concentration",
      "label": "Guidance"
    }
  },
  {
    "schemaVersion": 2,
    "rulesVersion": "2014",
    "subclasses": [],
    "castingTime": {
      "type": "bonus",
      "amount": 1,
      "unit": "bonus action",
      "trigger": ""
    },
    "reactionTrigger": "",
    "targetType": "point",
    "targets": 0,
    "requiresSight": true,
    "requiresLineOfEffect": true,
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false
    },
    "ritual": false,
    "concentration": false,
    "name": "Misty Step",
    "scaling": {"none": true, "note": "The distance does not increase at higher levels."},
    "level": 2,
    "school": "Conjuration",
    "range": 0,
    "description": "Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see.",
    "color": "#c9b6f0",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "teleport": {
      "rangeFt": 30,
      "self": true,
      "requiresSight": true,
      "requiresUnoccupied": true
    }
  },
  {
    "schemaVersion": 2,
    "rulesVersion": "2014",
    "subclasses": [],
    "castingTime": {
      "type": "action",
      "amount": 1,
      "unit": "action",
      "trigger": ""
    },
    "reactionTrigger": "",
    "targetType": "creature",
    "targets": 1,
    "requiresSight": true,
    "requiresLineOfEffect": true,
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialDesc": "a shaving of liquorice root",
      "consumed": false
    },
    "ritual": false,
    "concentration": true,
    "name": "Haste",
    "scaling": {"none": true, "note": "Haste gains no benefit from a higher slot."},
    "level": 3,
    "school": "Transmutation",
    "range": 30,
    "description": "The target's speed is doubled, it gains +2 AC, advantage on Dexterity saving throws, and an additional limited action each turn. When the spell ends the target cannot move or act until after its next turn.",
    "color": "#f0d78a",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "grantsBonus": {
      "stat": "ac",
      "value": 2,
      "duration": "concentration",
      "optIn": false,
      "speedMultiplier": 2,
      "extraAction": "limited",
      "saveAdv": {
        "ability": "dex",
        "mode": "adv"
      },
      "label": "Haste"
    }
  },
  {
    "schemaVersion": 2,
    "rulesVersion": "2014",
    "subclasses": [],
    "castingTime": {
      "type": "reaction",
      "amount": 1,
      "unit": "reaction",
      "trigger": "when a creature within 60 feet casts a spell"
    },
    "reactionTrigger": "when a creature within 60 feet casts a spell",
    "targetType": "creature",
    "targets": 1,
    "requiresSight": true,
    "requiresLineOfEffect": true,
    "components": {
      "verbal": false,
      "somatic": true,
      "material": false
    },
    "ritual": false,
    "concentration": false,
    "name": "Counterspell",
    "scaling": {"autoBelowSlotLevel": true, "note": "A higher slot automatically stops a spell of that level or lower."},
    "level": 3,
    "school": "Abjuration",
    "range": 60,
    "description": "You attempt to interrupt a creature casting a spell. If the spell is level 3 or lower it fails; otherwise make an ability check with your spellcasting ability against DC 10 + the spell's level.",
    "color": "#b46ad6",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "interrupt": {
      "kind": "spell",
      "autoBelowLevel": 3,
      "checkDc": "10+level",
      "checkAbility": "spellcasting",
      "scalesWithSlot": true
    }
  },
  {
    "schemaVersion": 2,
    "rulesVersion": "2014",
    "subclasses": [],
    "castingTime": {
      "type": "action",
      "amount": 1,
      "unit": "action",
      "trigger": ""
    },
    "reactionTrigger": "",
    "targetType": "creature",
    "targets": 1,
    "requiresSight": true,
    "requiresLineOfEffect": true,
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false
    },
    "ritual": false,
    "concentration": false,
    "name": "Dispel Magic",
    "scaling": {"autoBelowSlotLevel": true, "note": "A higher slot automatically ends a spell of that level or lower."},
    "level": 3,
    "school": "Abjuration",
    "range": 120,
    "description": "Choose one creature, object or magical effect. Any spell of level 3 or lower on the target ends. For higher-level spells make an ability check with your spellcasting ability against DC 10 + the spell's level.",
    "color": "#b46ad6",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "interrupt": {
      "kind": "ongoing",
      "autoBelowLevel": 3,
      "checkDc": "10+level",
      "checkAbility": "spellcasting",
      "scalesWithSlot": true
    }
  },
  {
    name: "Fire Bolt",
    level: 0,
    school: "Evocation",
    range: 120,
    description: "A mote of fire streaks toward a target: a ranged spell attack for 1d10 fire.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 10,
          flat: 0,
          type: "Fire"
        }
      ],
      toHit: true
    },
    color: "#e0662a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [
      "Arcane Trickster",
      "Eldritch Knight"
    ],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false
  },
  {
    name: "Ray of Frost",
    level: 0,
    school: "Evocation",
    range: 60,
    description: "A frigid beam: ranged attack for 1d8 cold; a hit also slows the target.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 8,
          flat: 0,
          type: "Cold"
        }
      ],
      toHit: true
    },
    effect: {
      on: true,
      condition: "",
      speedDelta: -10,
      turns: 1
    },
    color: "#7fd4ff",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [
      "Arcane Trickster",
      "Eldritch Knight"
    ],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false
  },
  {
    name: "Shocking Grasp",
    level: 0,
    school: "Evocation",
    range: 5,
    description: "Lightning springs from your hand: melee spell attack for 1d8 lightning.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 8,
          flat: 0,
          type: "Lightning"
        }
      ],
      toHit: true
    },
    color: "#ffe66a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [
      "Arcane Trickster",
      "Eldritch Knight"
    ],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false
  },
  {
    name: "Sacred Flame",
    level: 0,
    school: "Evocation",
    range: 60,
    description: "Radiant flame descends: the target makes a DEX save or takes 1d8 radiant.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 8,
          flat: 0,
          type: "Radiant"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: false
      }
    },
    color: "#fff1a8",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Cleric"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false
  },
  {
    name: "Toll the Dead",
    level: 0,
    school: "Necromancy",
    range: 60,
    description: "A dolorous bell: WIS save or 1d8 (1d12 if wounded) necrotic.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 8,
          flat: 0,
          type: "Necrotic"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "wis",
        dc: 0,
        half: false
      }
    },
    color: "#8f86d6",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Cleric",
      "Warlock",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    customResolution: "toll-the-dead"
  },
  {
    name: "Vicious Mockery",
    level: 0,
    school: "Enchantment",
    range: 60,
    description: "Insults laced with enchantment: WIS save or 1d4 psychic and disadvantage on its next attack.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 4,
          flat: 0,
          type: "Psychic"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "wis",
        dc: 0,
        half: false
      }
    },
    effect: {
      on: true,
      condition: "",
      attackAdv: "disadv",
      turns: 1
    },
    color: "#d67fb0",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Bard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: false,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false
  },
  {
    name: "Eldritch Blast",
    level: 0,
    school: "Evocation",
    range: 120,
    description: "A beam of crackling energy: ranged spell attack for 1d10 force.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 10,
          flat: 0,
          type: "Force"
        }
      ],
      toHit: true
    },
    color: "#b06bd6",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Warlock"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    customResolution: "eldritch-blast"
  },
  {
    name: "Poison Spray",
    level: 0,
    school: "Conjuration",
    range: 10,
    description: "A puff of noxious gas: CON save or 1d12 poison.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 12,
          flat: 0,
          type: "Poison"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "con",
        dc: 0,
        half: false
      }
    },
    color: "#7fd46a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Artificer",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false
  },
  {
    name: "Create Bonfire",
    level: 0,
    school: "Conjuration",
    concentration: true,
    range: 60,
    description: "A bonfire ignites: a creature in the 5-ft area makes a DEX save or takes 1d8 fire. It flares on entry and at the start of a turn, and lasts while you concentrate.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 8,
          flat: 0,
          type: "Fire"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: false
      }
    },
    area: {
      shape: "sphere",
      size: 5,
      linger: true,
      turns: 10,
      onEntry: true,
      perTurn: true,
      endTurn: false
    },
    color: "#e0662a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Artificer",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "point",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false
  },
  {
    name: "Produce Flame",
    level: 0,
    school: "Conjuration",
    range: 30,
    description: "A flame you can hurl: ranged spell attack for 1d8 fire.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 8,
          flat: 0,
          type: "Fire"
        }
      ],
      toHit: true
    },
    color: "#e0662a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Druid"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "self",
    targets: 1,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    customResolution: "produce-flame"
  },
  {
    name: "Magic Missile",
    level: 1,
    school: "Evocation",
    range: 120,
    // v9.57: each dart is a SEPARATE projectile and may strike a creature
    // already chosen. Without this the UI refused a second dart at the same
    // goblin, which is the spell's most common use.
    allowRepeatTargets: true,
    description: "Three darts of force strike unerringly for 1d4+1 each - they never miss.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 4,
          flat: 1,
          type: "Force"
        }
      ],
      toHit: false,
      save: {
        on: false,
        ability: "dex",
        dc: 0,
        half: false
      },
      autoHit: true
    },
    color: "#b06bd6",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 3,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      targetsPerSlot: 1
    },
    customResolution: "magic-missile",
    darts: {
      base: 3,
      perSlot: 1,
      damage: {
        count: 1,
        sides: 4,
        flat: 1,
        type: "Force"
      }
    },
    concentrationRule: "darts land simultaneously: one concentration save against the combined total"
  },
  {
    name: "Burning Hands",
    level: 1,
    school: "Evocation",
    range: 15,
    description: "A sheet of flame in a 15-ft cone: DEX save for half of 3d6 fire.",
    dmg: {
      on: true,
      parts: [
        {
          count: 3,
          sides: 6,
          flat: 0,
          type: "Fire"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "cone",
      size: 15
    },
    color: "#e0662a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 6
      }
    }
  },
  {
    name: "Thunderwave",
    level: 1,
    school: "Evocation",
    range: 5,
    description: "A wave of thunderous force in a 15-ft cube: CON save for half of 2d8 thunder.",
    dmg: {
      on: true,
      parts: [
        {
          count: 2,
          sides: 8,
          flat: 0,
          type: "Thunder"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "con",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "cube",
      size: 15
    },
    color: "#8f9bd6",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 8
      }
    }
  },
  {
    name: "Chromatic Orb",
    level: 1,
    school: "Evocation",
    range: 90,
    description: "A sphere of energy (type of your choice): ranged spell attack for 3d8.",
    dmg: {
      on: true,
      parts: [
        {
          count: 3,
          sides: 8,
          flat: 0,
          type: "Fire"
        }
      ],
      toHit: true
    },
    color: "#e05ac0",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a diamond worth at least 50 gp",
      materialItem: {
        key: "diamond",
        value: 50,
        qty: 1
      },
      goldCost: 50,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 8
      }
    }
  },
  {
    name: "Guiding Bolt",
    level: 1,
    school: "Evocation",
    range: 120,
    description: "A flash of light: ranged spell attack for 4d6 radiant; the next attacker has advantage.",
    dmg: {
      on: true,
      parts: [
        {
          count: 4,
          sides: 6,
          flat: 0,
          type: "Radiant"
        }
      ],
      toHit: true
    },
    color: "#fff1a8",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Cleric"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 6
      }
    },
    modifiers: [
      {
        applies: {
          kind: "attackedBy"
        },
        effect: {
          type: "adv"
        },
        consume: "nextQualifying",
        expiresIn: 1,
        concentration: false,
        requiresSightOfTarget: true
      }
    ]
  },
  {
    name: "Inflict Wounds",
    level: 1,
    school: "Necromancy",
    range: 5,
    description: "A necrotic touch: melee spell attack for 3d10 necrotic.",
    dmg: {
      on: true,
      parts: [
        {
          count: 3,
          sides: 10,
          flat: 0,
          type: "Necrotic"
        }
      ],
      toHit: true
    },
    color: "#6a6a8f",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Cleric"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 10
      }
    }
  },
  {
    name: "Cure Wounds",
    level: 1,
    school: "Evocation",
    range: 5,
    description: "A touch of healing restores 1d8 + your spellcasting modifier hit points.",
    heal: {
      on: true,
      count: 1,
      sides: 8,
      flat: 0
    },
    color: "#7fd46a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      healPerSlot: {
        count: 1,
        sides: 8
      }
    }
  },
  {
    name: "Healing Word",
    level: 1,
    school: "Evocation",
    range: 60,
    description: "A word of power heals a creature you can see for 1d4 + your spellcasting modifier.",
    heal: {
      on: true,
      count: 1,
      sides: 4,
      flat: 0
    },
    color: "#7fd46a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Bard",
      "Cleric",
      "Druid"
    ],
    subclasses: [],
    castingTime: {
      type: "bonus",
      amount: 1,
      unit: "bonus action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: false,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      healPerSlot: {
        count: 1,
        sides: 4
      }
    }
  },
  {
    name: "Mage Armor",
    level: 1,
    school: "Abjuration",
    range: 0,
    description: "A protective magical force surrounds an unarmoured creature, setting its AC to 13 + its Dexterity modifier for 8 hours. The spell ends if the target dons armour or dismisses it as an action.",
    color: "#8fd3ff",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: ["Sorcerer", "Wizard"],
    subclasses: [],
    castingTime: { type: "action", amount: 1, unit: "action", trigger: "" },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true, somatic: true, material: true,
      materialDesc: "a piece of cured leather",
      materialItem: null, goldCost: 0, consumed: false
    },
    ritual: false,
    concentration: false,
    durationHours: 8,
    // v8.93: handled by the SPELL_MAGE_ARMOR reducer case, which sets the flag
    // the `mageArmor` AC formula reads. It is not a bonus - the formula
    // REPLACES the unarmoured one, so it can never stack with worn armour.
    reducerAction: "SPELL_MAGE_ARMOR",
    scaling: {}
  },
  {
    name: "Bless",
    level: 1,
    school: "Enchantment",
    concentration: true,
    range: 30,
    description: "Up to three creatures gain advantage on their saving throws while you concentrate.",
    effect: {
      on: true,
      condition: "",
      turns: 10
    },
    color: "#fff1a8",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Cleric",
      "Paladin"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 3,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a sprinkling of holy water",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    scaling: {
      targetsPerSlot: 1
    },
    modifiers: [
      {
        applies: {
          kind: "attack"
        },
        effect: {
          type: "die",
          dice: {
            count: 1,
            sides: 4
          }
        }
      },
      {
        applies: {
          kind: "save"
        },
        effect: {
          type: "die",
          dice: {
            count: 1,
            sides: 4
          }
        }
      }
    ]
  },
  {
    name: "Bane",
    level: 1,
    school: "Enchantment",
    concentration: true,
    range: 30,
    description: "Up to three creatures (CHA save) suffer disadvantage on their attack rolls and saves while you concentrate.",
    effect: {
      on: true,
      condition: "",
      ability: "cha",
      dc: 0,
      turns: 10
    },
    dmg: {
      on: false
    },
    color: "#6a6a8f",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Bard",
      "Cleric"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 3,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a drop of blood",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    scaling: {
      targetsPerSlot: 1
    },
    modifiers: [
      {
        applies: {
          kind: "attack"
        },
        effect: {
          type: "negDie",
          dice: {
            count: 1,
            sides: 4
          }
        }
      },
      {
        applies: {
          kind: "save"
        },
        effect: {
          type: "negDie",
          dice: {
            count: 1,
            sides: 4
          }
        }
      }
    ]
  },
  {
    name: "Faerie Fire",
    scaling: {
      none: true
    },
    level: 1,
    school: "Evocation",
    concentration: true,
    range: 60,
    description: "Outlines creatures in a 20-ft cube in light (DEX save): attackers have advantage against them while you concentrate.",
    effect: {
      on: true,
      condition: "",
      ability: "dex",
      dc: 0,
      turns: 10
    },
    area: {
      shape: "cube",
      size: 20
    },
    color: "#7fd4ff",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Artificer",
      "Bard",
      "Druid"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: false,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    modifiers: [
      {
        applies: {
          kind: "attackedBy"
        },
        effect: {
          type: "adv"
        },
        requiresSightOfTarget: true
      },
      {
        applies: {
          kind: "attackedBy"
        },
        effect: {
          type: "suppress",
          suppress: "invisibility"
        }
      }
    ]
  },
  {
    name: "Sleep",
    level: 1,
    school: "Enchantment",
    range: 90,
    description: "Slumber rolls over creatures in a 20-ft area (lowest HP first) - falls Unconscious.",
    effect: {
      on: true,
      condition: "Unconscious",
      unavoidable: true,
      turns: 10
    },
    area: {
      shape: "sphere",
      size: 20
    },
    dmg: {
      on: false
    },
    color: "#8f86d6",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a pinch of fine sand, rose petals, or a cricket",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    customResolution: "sleep"
  },
  {
    name: "Witch Bolt",
    level: 1,
    school: "Evocation",
    concentration: true,
    range: 30,
    description: "A beam of crackling energy: ranged spell attack for 1d12 lightning, then 1d12 each turn.",
    dmg: {
      on: true,
      parts: [
        {
          count: 1,
          sides: 12,
          flat: 0,
          type: "Lightning"
        }
      ],
      toHit: true
    },
    duration: "startTurn",
    color: "#ffe66a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a twig from a tree struck by lightning",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    customResolution: "witch-bolt"
  },
  {
    name: "Scorching Ray",
    level: 2,
    school: "Evocation",
    range: 120,
    description: "Three rays of fire: a separate ranged spell attack each for 2d6 fire.",
    dmg: {
      on: true,
      parts: [
        {
          count: 2,
          sides: 6,
          flat: 0,
          type: "Fire"
        }
      ],
      toHit: true
    },
    targets: 3,
    color: "#e0662a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      targetsPerSlot: 1
    },
    customResolution: "scorching-ray"
  },
  {
    name: "Shatter",
    level: 2,
    school: "Evocation",
    range: 60,
    description: "A ringing burst in a 10-ft sphere: CON save for half of 3d8 thunder.",
    dmg: {
      on: true,
      parts: [
        {
          count: 3,
          sides: 8,
          flat: 0,
          type: "Thunder"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "con",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "sphere",
      size: 10
    },
    color: "#8f9bd6",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a chip of mica",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 8
      }
    }
  },
  {
    name: "Hold Person",
    level: 2,
    school: "Enchantment",
    concentration: true,
    range: 60,
    description: "A humanoid makes a WIS save or is Paralyzed while you concentrate.",
    effect: {
      on: true,
      condition: "Paralyzed",
      ability: "wis",
      dc: 0,
      turns: 10
    },
    dmg: {
      on: false
    },
    color: "#8f86d6",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Bard",
      "Cleric",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a small, straight piece of iron",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    scaling: {
      targetsPerSlot: 1
    },
    targetRestriction: "humanoid",
    humanoidOnly: true,
    repeatSave: {
      at: "end",
      ability: "wis"
    }
  },
  {
    name: "Moonbeam",
    level: 2,
    school: "Evocation",
    concentration: true,
    range: 120,
    description: "A silvery beam in a 5-ft area: a creature makes a CON save for half of 2d10 radiant when it first enters the light on a turn or starts its turn there. Lasts while you concentrate.",
    dmg: {
      on: true,
      parts: [
        {
          count: 2,
          sides: 10,
          flat: 0,
          type: "Radiant"
        }
      ],
      save: {
        on: true,
        ability: "con",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "cylinder",
      size: 5,
      height: 40,
      linger: true,
      turns: 10
    },
    color: "#d8e8ff",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Druid"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "several seeds of any moonseed plant and a piece of opalescent feldspar",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 10
      }
    },
    customResolution: "moonbeam",
    effectSchedule: [
      {
        trigger: "enterArea",
        oncePerTurn: true
      },
      {
        trigger: "startTurnInArea",
        oncePerTurn: true
      }
    ],
    movableByAction: true,
    moveRangeFt: 60
  },
  {
    name: "Web",
    scaling: {
      none: true
    },
    level: 2,
    school: "Conjuration",
    concentration: true,
    range: 60,
    description: "Webbing fills a 20-ft cube (DEX save) - a creature that fails is Restrained while you concentrate.",
    effect: {
      on: true,
      condition: "Restrained",
      ability: "dex",
      dc: 0,
      turns: 10
    },
    area: {
      shape: "cube",
      size: 20
    },
    dmg: {
      on: false
    },
    color: "#dddddd",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a bit of spiderweb",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    effectSchedule: [
      {
        trigger: "enterArea",
        oncePerTurn: true
      },
      {
        trigger: "startTurnInArea",
        oncePerTurn: true
      }
    ],
    difficultTerrain: true,
    lightlyObscured: true,
    escape: {
      action: true,
      ability: "str",
      skill: "Athletics"
    },
    requiresAnchors: 2,
    flammable: {
      damage: {
        count: 2,
        sides: 4,
        type: "Fire"
      },
      burnsInRounds: 1
    }
  },
  {
    name: "Aid",
    level: 2,
    school: "Abjuration",
    range: 30,
    description: "Bolsters up to three allies, raising their hit points by 5.",
    heal: {
      on: false,
      count: 0,
      sides: 0,
      flat: 0
    },
    targets: 3,
    color: "#fff1a8",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Artificer",
      "Cleric",
      "Paladin"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a tiny strip of white cloth",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      none: true
    },
    duration: "8 hours",
    durationHours: 8,
    hpMaxBonus: {
      base: 5,
      perSlot: 5,
      hours: 8
    }
  },
  {
    name: "Fireball",
    level: 3,
    school: "Evocation",
    range: 150,
    description: "A roaring explosion in a 20-ft sphere: DEX save for half of 8d6 fire.",
    dmg: {
      on: true,
      parts: [
        {
          count: 8,
          sides: 6,
          flat: 0,
          type: "Fire"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "sphere",
      size: 20
    },
    color: "#e0662a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a tiny ball of bat guano and sulfur",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 6
      }
    }
  },
  {
    name: "Lightning Bolt",
    level: 3,
    school: "Evocation",
    range: 100,
    description: "A stroke of lightning in a 100-ft line: DEX save for half of 8d6 lightning.",
    dmg: {
      on: true,
      parts: [
        {
          count: 8,
          sides: 6,
          flat: 0,
          type: "Lightning"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "line",
      size: 100
    },
    color: "#ffe66a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a bit of fur and a rod of amber, crystal, or glass",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 6
      }
    }
  },
  {
    name: "Spirit Guardians",
    level: 3,
    school: "Conjuration",
    concentration: true,
    range: 15,
    description: "Spectral guardians swirl in a 15-ft aura (WIS save): a creature takes 3d8 radiant and is slowed. Persists while you concentrate.",
    dmg: {
      on: true,
      parts: [
        {
          count: 3,
          sides: 8,
          flat: 0,
          type: "Radiant"
        }
      ],
      save: {
        on: true,
        ability: "wis",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "sphere",
      size: 15,
      linger: true,
      turns: 100
    },
    color: "#fff1a8",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Cleric"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a holy symbol",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 8
      }
    },
    effectSchedule: [
      {
        trigger: "enterArea",
        oncePerTurn: true
      },
      {
        trigger: "startTurnInArea",
        oncePerTurn: true
      }
    ],
    halvesSpeed: true,
    casterChoosesExempt: true
  },
  {
    name: "Vampiric Touch",
    level: 3,
    school: "Necromancy",
    concentration: true,
    range: 5,
    description: "A withering touch: melee spell attack for 3d6 necrotic, and you heal half.",
    dmg: {
      on: true,
      parts: [
        {
          count: 3,
          sides: 6,
          flat: 0,
          type: "Necrotic"
        }
      ],
      toHit: true,
      save: {
        on: false,
        ability: "dex",
        dc: 0,
        half: false
      },
      spellMelee: true
    },
    color: "#6a6a8f",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 6
      }
    },
    duration: "1 minute",
    lifeSteal: {
      fraction: 0.5,
      type: "Necrotic"
    },
    repeatableWhileConcentrating: true
  },
  {
    name: "Mass Healing Word",
    level: 3,
    school: "Evocation",
    range: 60,
    description: "A word of restoration heals up to six creatures for 1d4 + your spellcasting modifier.",
    heal: {
      on: true,
      count: 1,
      sides: 4,
      flat: 0
    },
    targets: 6,
    color: "#7fd46a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Bard",
      "Cleric"
    ],
    subclasses: [],
    castingTime: {
      type: "bonus",
      amount: 1,
      unit: "bonus action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: false,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      healPerSlot: {
        count: 1,
        sides: 4
      }
    }
  },
  {
    name: "Wall of Fire",
    level: 4,
    school: "Evocation",
    concentration: true,
    range: 120,
    description: "A blazing wall up to 60 ft long: a creature (DEX save) takes 5d8 fire on entry and when it ends its turn there. Lasts while you concentrate.",
    dmg: {
      on: true,
      parts: [
        {
          count: 5,
          sides: 8,
          flat: 0,
          type: "Fire"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: false
      }
    },
    area: {
      shape: "line",
      size: 60,
      linger: true,
      turns: 100,
      onEntry: true,
      perTurn: false,
      endTurn: true
    },
    color: "#e0662a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a small piece of phosphorus",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 8
      }
    },
    customResolution: "wall-of-fire"
  },
  {
    name: "Ice Storm",
    level: 4,
    school: "Evocation",
    range: 300,
    description: "Hail hammers a 20-ft area: DEX save for half of 2d8 bludgeoning + 4d6 cold.",
    dmg: {
      on: true,
      parts: [
        {
          count: 4,
          sides: 6,
          flat: 0,
          type: "Cold"
        },
        {
          count: 2,
          sides: 8,
          flat: 0,
          type: "Bludgeoning"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "sphere",
      size: 20
    },
    color: "#7fd4ff",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a pinch of dust and a few drops of water",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 8
      }
    }
  },
  {
    name: "Blight",
    level: 4,
    school: "Necromancy",
    range: 30,
    description: "Necromantic energy drains a creature: CON save for half of 8d8 necrotic.",
    dmg: {
      on: true,
      parts: [
        {
          count: 8,
          sides: 8,
          flat: 0,
          type: "Necrotic"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "con",
        dc: 0,
        half: true
      }
    },
    color: "#6a6a8f",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 8
      }
    }
  },
  {
    name: "Cone of Cold",
    level: 5,
    school: "Evocation",
    range: 60,
    description: "A blast of frigid air in a 60-ft cone: CON save for half of 8d8 cold.",
    dmg: {
      on: true,
      parts: [
        {
          count: 8,
          sides: 8,
          flat: 0,
          type: "Cold"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "con",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "cone",
      size: 60
    },
    color: "#7fd4ff",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: false,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a small crystal or glass cone",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 8
      }
    }
  },
  {
    name: "Flame Strike",
    level: 5,
    school: "Evocation",
    range: 60,
    description: "A column of divine fire in a 10-ft area: DEX save for half of 4d6 fire + 4d6 radiant.",
    dmg: {
      on: true,
      parts: [
        {
          count: 4,
          sides: 6,
          flat: 0,
          type: "Fire"
        },
        {
          count: 4,
          sides: 6,
          flat: 0,
          type: "Radiant"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "sphere",
      size: 10
    },
    color: "#ffb45a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Cleric"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "pinch of sulfur",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 6
      }
    }
  },
  {
    name: "Cloudkill",
    level: 5,
    school: "Conjuration",
    concentration: true,
    range: 120,
    description: "A 20-ft sphere of poisonous fog: CON save for half of 5d8 poison on entry and each turn. Lasts while you concentrate.",
    dmg: {
      on: true,
      parts: [
        {
          count: 5,
          sides: 8,
          flat: 0,
          type: "Poison"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "con",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "sphere",
      size: 20,
      linger: true,
      turns: 100,
      onEntry: true,
      perTurn: true,
      endTurn: false
    },
    color: "#7fd46a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 8
      }
    },
    customResolution: "cloudkill"
  },
  {
    name: "Mass Cure Wounds",
    level: 5,
    school: "Evocation",
    range: 60,
    description: "A wave of healing restores up to six creatures for 3d8 + your spellcasting modifier.",
    heal: {
      on: true,
      count: 3,
      sides: 8,
      flat: 0
    },
    targets: 6,
    color: "#7fd46a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Bard",
      "Cleric",
      "Druid"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      healPerSlot: {
        count: 1,
        sides: 8
      }
    },
    area: {
      shape: "sphere",
      size: 30
    }
  },
  {
    name: "Chain Lightning",
    level: 6,
    school: "Evocation",
    range: 150,
    description: "A bolt that leaps between up to four targets: DEX save for half of 10d8 lightning each.",
    dmg: {
      on: true,
      parts: [
        {
          count: 10,
          sides: 8,
          flat: 0,
          type: "Lightning"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: true
      }
    },
    targets: 4,
    color: "#ffe66a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a bit of fur, a piece of amber, glass, or a crystal rod, and three silver pins",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      targetsPerSlot: 1
    },
    customResolution: "chain-lightning"
  },
  {
    name: "Disintegrate",
    level: 6,
    school: "Transmutation",
    range: 60,
    description: "A thin green ray: DEX save or 10d6+40 force.",
    dmg: {
      on: true,
      parts: [
        {
          count: 10,
          sides: 6,
          flat: 40,
          type: "Force"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: false
      }
    },
    color: "#7fd46a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a lodestone and a pinch of dust",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false,
    scaling: {
      damagePerSlot: {
        count: 3,
        sides: 6
      }
    }
  },
  {
    name: "Finger of Death",
    scaling: {
      none: true
    },
    level: 7,
    school: "Necromancy",
    range: 60,
    description: "A wave of negative energy: CON save for half of 7d8+30 necrotic.",
    dmg: {
      on: true,
      parts: [
        {
          count: 7,
          sides: 8,
          flat: 30,
          type: "Necrotic"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "con",
        dc: 0,
        half: true
      }
    },
    color: "#6a6a8f",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "creature",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: false,
      materialDesc: "",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    concentration: false
  },
  {
    name: "Delayed Blast Fireball",
    level: 7,
    school: "Evocation",
    concentration: true,
    range: 150,
    description: "A growing bead of fire: DEX save for half of 12d6 fire in a 20-ft sphere.",
    dmg: {
      on: true,
      parts: [
        {
          count: 12,
          sides: 6,
          flat: 0,
          type: "Fire"
        }
      ],
      toHit: false,
      save: {
        on: true,
        ability: "dex",
        dc: 0,
        half: true
      }
    },
    area: {
      shape: "sphere",
      size: 20
    },
    color: "#e0662a",
    schemaVersion: 2,
    rulesVersion: "2014",
    classes: [
      "Sorcerer",
      "Wizard"
    ],
    subclasses: [],
    castingTime: {
      type: "action",
      amount: 1,
      unit: "action",
      trigger: ""
    },
    reactionTrigger: "",
    targetType: "area",
    targets: 1,
    requiresSight: true,
    requiresLineOfEffect: true,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDesc: "a tiny ball of bat guano and sulfur",
      materialItem: null,
      goldCost: 0,
      consumed: false
    },
    ritual: false,
    scaling: {
      damagePerSlot: {
        count: 1,
        sides: 6
      }
    },
    customResolution: "delayed-blast-fireball",
    delayedBlast: {
      growPerTurn: 1,
      growDie: 6,
      maxDice: 24,
      earlyDetonation: true,
      beadTouchable: true
    }
  }
];


// ============================================================================
// GENERATED by tools/enrich-presets.js - DO NOT EDIT BY HAND (v9.75)
// ----------------------------------------------------------------------------
// Structured mechanics for the built-in presets, derived once at build time
// from their stat-block prose. The prose above is unchanged and remains the
// human-readable description; these fields are the authoritative MECHANICS, so
// no runtime path has to re-parse English to spawn a creature.
// Regenerate with: node tools/enrich-presets.js --write
// ============================================================================
var PRESET_MECHANICS = {
  "bnb:robin": {"speeds":{"walk":10,"fly":30},"speed":10,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_robin_dive_peck","name":"Dive Peck","equipped":true,"attacks":[{"id":"atk_bnb_robin_dive_peck","name":"Dive Peck","toHit":4,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:blue_tit": {"speeds":{"walk":10,"fly":35},"speed":10,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_blue_tit_peck","name":"Peck","equipped":true,"attacks":[{"id":"atk_bnb_blue_tit_peck","name":"Peck","toHit":3,"range":5,"damage":[{"count":1,"sides":6,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:great_tit": {"speeds":{"walk":10,"fly":35},"speed":10,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_great_tit_peck","name":"Peck","equipped":true,"attacks":[{"id":"atk_bnb_great_tit_peck","name":"Peck","toHit":3,"range":5,"damage":[{"count":1,"sides":6,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:red_wing": {"speeds":{"walk":10,"fly":40},"speed":10,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_red_wing_wing_buffet","name":"Wing Buffet","equipped":true,"attacks":[{"id":"atk_bnb_red_wing_wing_buffet","name":"Wing Buffet","toHit":3,"range":5,"damage":[{"count":1,"sides":6,"modifier":0,"type":"Bludgeoning"}]}]}]},
  "bnb:sparrow": {"speeds":{"walk":15,"fly":45},"speed":15,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_sparrow_beak_strike","name":"Beak Strike","equipped":true,"attacks":[{"id":"atk_bnb_sparrow_beak_strike","name":"Beak Strike","toHit":4,"range":5,"damage":[{"count":1,"sides":8,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:hedgehog": {"speeds":{"walk":25},"speed":25,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_hedgehog_snout_butt","name":"Snout Butt","equipped":true,"attacks":[{"id":"atk_bnb_hedgehog_snout_butt","name":"Snout Butt","toHit":3,"range":5,"damage":[{"count":1,"sides":4,"modifier":1,"type":"Bludgeoning"}]}]}]},
  "bnb:ferret": {"speeds":{"walk":35,"climb":20},"speed":35,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_ferret_ferocious_bite","name":"Ferocious Bite","equipped":true,"attacks":[{"id":"atk_bnb_ferret_ferocious_bite","name":"Ferocious Bite","toHit":4,"range":5,"damage":[{"count":1,"sides":8,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:smooth_newt": {"speeds":{"walk":20,"swim":25},"speed":20,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_smooth_newt_tail_lash","name":"Tail Lash","equipped":true,"attacks":[{"id":"atk_bnb_smooth_newt_tail_lash","name":"Tail Lash","toHit":3,"range":10,"damage":[{"count":1,"sides":6,"modifier":0,"type":"Bludgeoning"}]}]}]},
  "bnb:bank_vole": {"speeds":{"walk":20,"burrow":10},"speed":20},
  "bnb:house_spider": {"speeds":{"walk":25,"climb":25},"speed":25,"weapons":[{"id":"wpn_bnb_house_spider_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_house_spider_bite","name":"Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"},{"count":1,"sides":4,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:bullfinch": {"speeds":{"walk":10,"fly":40},"speed":10,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_bullfinch_powerful_beak","name":"Powerful Beak","equipped":true,"attacks":[{"id":"atk_bnb_bullfinch_powerful_beak","name":"Powerful Beak","toHit":4,"range":5,"damage":[{"count":2,"sides":6,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:starling": {"speeds":{"walk":10,"fly":40},"speed":10,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_starling_wing_strike","name":"Wing Strike","equipped":true,"attacks":[{"id":"atk_bnb_starling_wing_strike","name":"Wing Strike","toHit":4,"range":5,"damage":[{"count":1,"sides":8,"modifier":0,"type":"Bludgeoning"}]}]}]},
  "bnb:house_martin": {"speeds":{"walk":10,"fly":50},"speed":10,"sizeCategory":"Medium","size":"Medium"},
  "bnb:swallow": {"speeds":{"walk":10,"fly":60},"speed":10,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_swallow_razor_dive","name":"Razor Dive","equipped":true,"attacks":[{"id":"atk_bnb_swallow_razor_dive","name":"Razor Dive","toHit":6,"range":5,"damage":[{"count":2,"sides":8,"modifier":3,"type":"Piercing"}]}]}]},
  "bnb:owl": {"speeds":{"walk":10,"fly":50},"speed":10,"sizeCategory":"Large","size":"Large","weapons":[{"id":"wpn_bnb_owl_talons","name":"Talons","equipped":true,"attacks":[{"id":"atk_bnb_owl_talons","name":"Talons","toHit":7,"range":5,"damage":[{"count":2,"sides":10,"modifier":4,"type":"Slashing"}]}]},{"id":"wpn_bnb_owl_beak","name":"Beak","equipped":true,"attacks":[{"id":"atk_bnb_owl_beak","name":"Beak","toHit":7,"range":5,"damage":[{"count":2,"sides":8,"modifier":4,"type":"Piercing"}]}]}]},
  "bnb:mink": {"speeds":{"walk":35,"swim":25},"speed":35,"sizeCategory":"Large","size":"Large","weapons":[{"id":"wpn_bnb_mink_ferocious_bite","name":"Ferocious Bite","equipped":true,"attacks":[{"id":"atk_bnb_mink_ferocious_bite","name":"Ferocious Bite","toHit":5,"range":5,"damage":[{"count":2,"sides":8,"modifier":3,"type":"Piercing"}]}]}]},
  "bnb:polecat": {"speeds":{"walk":40,"climb":25},"speed":40,"sizeCategory":"Large","size":"Large","weapons":[{"id":"wpn_bnb_polecat_vicious_bite","name":"Vicious Bite","equipped":true,"attacks":[{"id":"atk_bnb_polecat_vicious_bite","name":"Vicious Bite","toHit":6,"range":5,"damage":[{"count":2,"sides":10,"modifier":3,"type":"Piercing"}]}]}]},
  "bnb:great_crested_newt": {"speeds":{"walk":25,"swim":30},"speed":25,"sizeCategory":"Large","size":"Large","weapons":[{"id":"wpn_bnb_great_crested_newt_tail_sweep","name":"Tail Sweep","equipped":true,"attacks":[{"id":"atk_bnb_great_crested_newt_tail_sweep","name":"Tail Sweep","toHit":4,"range":10,"damage":[{"count":1,"sides":10,"modifier":2,"type":"Bludgeoning"}]}]}]},
  "bnb:rhinoceros_beetle": {"speeds":{"walk":25,"fly":20},"speed":25,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_rhinoceros_beetle_horn_strike","name":"Horn Strike","equipped":true,"attacks":[{"id":"atk_bnb_rhinoceros_beetle_horn_strike","name":"Horn Strike","toHit":4,"range":5,"damage":[{"count":1,"sides":8,"modifier":2,"type":"Piercing"}]}]}]},
  "bnb:stag_beetle": {"speeds":{"walk":20,"fly":20},"speed":20,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_stag_beetle_mandible_clamp","name":"Mandible Clamp","equipped":true,"attacks":[{"id":"atk_bnb_stag_beetle_mandible_clamp","name":"Mandible Clamp","toHit":5,"range":5,"damage":[{"count":2,"sides":6,"modifier":3,"type":"Piercing"}]}]}]},
  "bnb:bushcricket": {"speeds":{"walk":30,"fly":20},"speed":30,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_bushcricket_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_bushcricket_bite","name":"Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":6,"modifier":1,"type":"Piercing"}]}]}]},
  "bnb:rose_chafer": {"speeds":{"walk":15,"fly":25},"speed":15,"sizeCategory":"Small","size":"Small","weapons":[{"id":"wpn_bnb_rose_chafer_mandible_nip","name":"Mandible Nip","equipped":true,"attacks":[{"id":"atk_bnb_rose_chafer_mandible_nip","name":"Mandible Nip","toHit":2,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:common_pipistrelle": {"speeds":{"walk":5,"fly":30},"speed":5,"sizeCategory":"Small","size":"Small","weapons":[{"id":"wpn_bnb_common_pipistrelle_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_common_pipistrelle_bite","name":"Bite","toHit":2,"range":5,"damage":[{"count":1,"sides":3,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:notch_eared_bat": {"speeds":{"walk":5,"fly":30},"speed":5,"sizeCategory":"Small","size":"Small","weapons":[{"id":"wpn_bnb_notch_eared_bat_dive_bite","name":"Dive Bite","equipped":true,"attacks":[{"id":"atk_bnb_notch_eared_bat_dive_bite","name":"Dive Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:soprano_pipistrelle": {"speeds":{"walk":5,"fly":35},"speed":5,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_soprano_pipistrelle_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_soprano_pipistrelle_bite","name":"Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:lesser_noctule": {"speeds":{"walk":5,"fly":40},"speed":5,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_lesser_noctule_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_lesser_noctule_bite","name":"Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":6,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:common_noctule": {"speeds":{"walk":5,"fly":45},"speed":5,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_common_noctule_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_common_noctule_bite","name":"Bite","toHit":4,"range":5,"damage":[{"count":1,"sides":8,"modifier":2,"type":"Piercing"}]}]}]},
  "bnb:greater_noctule": {"speeds":{"walk":5,"fly":50},"speed":5,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_greater_noctule_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_greater_noctule_bite","name":"Bite","toHit":6,"range":5,"damage":[{"count":2,"sides":8,"modifier":4,"type":"Piercing"}]}]}]},
  "bnb:garden_spider": {"speeds":{"walk":25,"climb":25},"speed":25,"weapons":[{"id":"wpn_bnb_garden_spider_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_garden_spider_bite","name":"Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"},{"count":1,"sides":4,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:ladybird_spider": {"speeds":{"walk":25,"climb":25},"speed":25,"weapons":[{"id":"wpn_bnb_ladybird_spider_venomous_bite","name":"Venomous Bite","equipped":true,"attacks":[{"id":"atk_bnb_ladybird_spider_venomous_bite","name":"Venomous Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"},{"count":2,"sides":4,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:wasp_spider": {"speeds":{"walk":30,"climb":30},"speed":30,"weapons":[{"id":"wpn_bnb_wasp_spider_venom_bite","name":"Venom Bite","equipped":true,"attacks":[{"id":"atk_bnb_wasp_spider_venom_bite","name":"Venom Bite","toHit":4,"range":5,"damage":[{"count":1,"sides":6,"modifier":0,"type":"Piercing"},{"count":2,"sides":6,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:tubeweb_spider": {"speeds":{"walk":30,"climb":30},"speed":30,"weapons":[{"id":"wpn_bnb_tubeweb_spider_venomous_bite","name":"Venomous Bite","equipped":true,"attacks":[{"id":"atk_bnb_tubeweb_spider_venomous_bite","name":"Venomous Bite","toHit":5,"range":5,"damage":[{"count":1,"sides":8,"modifier":2,"type":"Piercing"},{"count":3,"sides":6,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:wolf_spider": {"speeds":{"walk":40,"climb":30},"speed":40,"weapons":[{"id":"wpn_bnb_wolf_spider_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_wolf_spider_bite","name":"Bite","toHit":6,"range":5,"damage":[{"count":2,"sides":6,"modifier":3,"type":"Piercing"},{"count":3,"sides":6,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:cave_spider": {"speeds":{"walk":40,"climb":40},"speed":40,"weapons":[{"id":"wpn_bnb_cave_spider_massive_bite","name":"Massive Bite","equipped":true,"attacks":[{"id":"atk_bnb_cave_spider_massive_bite","name":"Massive Bite","toHit":7,"range":5,"damage":[{"count":2,"sides":10,"modifier":5,"type":"Piercing"},{"count":4,"sides":6,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:ladybug": {"speeds":{"walk":15,"fly":20},"speed":15,"weapons":[{"id":"wpn_bnb_ladybug_mandible_bite","name":"Mandible Bite","equipped":true,"attacks":[{"id":"atk_bnb_ladybug_mandible_bite","name":"Mandible Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:pillbug": {"speeds":{"walk":10},"speed":10,"weapons":[{"id":"wpn_bnb_pillbug_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_pillbug_bite","name":"Bite","toHit":2,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:waterscorpion": {"speeds":{"walk":10,"swim":25},"speed":10,"weapons":[{"id":"wpn_bnb_waterscorpion_piercing_beak","name":"Piercing Beak","equipped":true,"attacks":[{"id":"atk_bnb_waterscorpion_piercing_beak","name":"Piercing Beak","toHit":4,"range":5,"damage":[{"count":1,"sides":8,"modifier":2,"type":"Piercing"},{"count":1,"sides":6,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:praying_mantis": {"speeds":{"walk":30,"fly":20},"speed":30,"sizeCategory":"Medium","size":"Medium"},
  "bnb:emperor_dragonfly": {"speeds":{"walk":5,"fly":60},"speed":5,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_emperor_dragonfly_mandible_strike","name":"Mandible Strike","equipped":true,"attacks":[{"id":"atk_bnb_emperor_dragonfly_mandible_strike","name":"Mandible Strike","toHit":7,"range":5,"damage":[{"count":2,"sides":8,"modifier":4,"type":"Piercing"}]}]}]},
  "bnb:bumblebee": {"speeds":{"walk":10,"fly":30},"speed":10,"weapons":[{"id":"wpn_bnb_bumblebee_sting","name":"Sting","equipped":true,"attacks":[{"id":"atk_bnb_bumblebee_sting","name":"Sting","toHit":3,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"},{"count":1,"sides":4,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:honeybee": {"speeds":{"walk":10,"fly":30},"speed":10,"weapons":[{"id":"wpn_bnb_honeybee_sting","name":"Sting","equipped":true,"attacks":[{"id":"atk_bnb_honeybee_sting","name":"Sting","toHit":2,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"},{"count":1,"sides":6,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:yellow_jacket": {"speeds":{"walk":10,"fly":35},"speed":10},
  "bnb:hornet": {"speeds":{"walk":10,"fly":40},"speed":10,"sizeCategory":"Medium","size":"Medium","weapons":[{"id":"wpn_bnb_hornet_venom_sting","name":"Venom Sting","equipped":true,"attacks":[{"id":"atk_bnb_hornet_venom_sting","name":"Venom Sting","toHit":4,"range":5,"damage":[{"count":1,"sides":8,"modifier":2,"type":"Piercing"},{"count":2,"sides":6,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:mole_cricket": {"speeds":{"walk":25,"fly":20,"burrow":15},"speed":25,"weapons":[{"id":"wpn_bnb_mole_cricket_forelegs_strike","name":"Forelegs Strike","equipped":true,"attacks":[{"id":"atk_bnb_mole_cricket_forelegs_strike","name":"Forelegs Strike","toHit":3,"range":5,"damage":[{"count":1,"sides":6,"modifier":1,"type":"Slashing"}]}]}]},
  "bnb:six_spot_burnet": {"speeds":{"walk":10,"fly":25},"speed":10,"sizeCategory":"Small","size":"Small"},
  "bnb:mimic_hoverfly": {"speeds":{"walk":5,"fly":30},"speed":5,"sizeCategory":"Small","size":"Small"},
  "bnb:pine_weevil": {"speeds":{"walk":20,"climb":20},"speed":20,"weapons":[{"id":"wpn_bnb_pine_weevil_gnaw","name":"Gnaw","equipped":true,"attacks":[{"id":"atk_bnb_pine_weevil_gnaw","name":"Gnaw","toHit":2,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:leech": {"speeds":{"walk":10,"swim":25},"speed":10,"weapons":[{"id":"wpn_bnb_leech_latch_on","name":"Latch On","equipped":true,"attacks":[{"id":"atk_bnb_leech_latch_on","name":"Latch On","toHit":4,"range":5,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:jay": {"speeds":{"walk":15,"fly":35},"speed":15,"weapons":[{"id":"wpn_bnb_jay_beak_strike","name":"Beak Strike","equipped":true,"attacks":[{"id":"atk_bnb_jay_beak_strike","name":"Beak Strike","toHit":3,"range":5,"damage":[{"count":1,"sides":6,"modifier":0,"type":"Piercing"}]}]}]},
  "bnb:jackdaw": {"speeds":{"walk":15,"fly":40},"speed":15,"weapons":[{"id":"wpn_bnb_jackdaw_beak_strike","name":"Beak Strike","equipped":true,"attacks":[{"id":"atk_bnb_jackdaw_beak_strike","name":"Beak Strike","toHit":4,"range":5,"damage":[{"count":1,"sides":8,"modifier":2,"type":"Piercing"}]}]}]},
  "bnb:magpie": {"speeds":{"walk":15,"fly":40},"speed":15,"weapons":[{"id":"wpn_bnb_magpie_beak_and_claw","name":"Beak and Claw","equipped":true,"attacks":[{"id":"atk_bnb_magpie_beak_and_claw","name":"Beak and Claw","toHit":5,"range":5,"damage":[{"count":2,"sides":6,"modifier":3,"type":"Piercing"}]}]}]},
  "bnb:crow": {"speeds":{"walk":15,"fly":45},"speed":15,"weapons":[{"id":"wpn_bnb_crow_beak_and_claw","name":"Beak and Claw","equipped":true,"attacks":[{"id":"atk_bnb_crow_beak_and_claw","name":"Beak and Claw","toHit":6,"range":5,"damage":[{"count":2,"sides":8,"modifier":4,"type":"Piercing"}]}]}]},
  "bnb:raven_wild": {"speeds":{"walk":10,"fly":50},"speed":10,"weapons":[{"id":"wpn_bnb_raven_wild_beak_strike","name":"Beak Strike","equipped":true,"attacks":[{"id":"atk_bnb_raven_wild_beak_strike","name":"Beak Strike","toHit":10,"range":5,"damage":[{"count":3,"sides":10,"modifier":6,"type":"Piercing"}]}]},{"id":"wpn_bnb_raven_wild_wing_slam","name":"Wing Slam","equipped":true,"attacks":[{"id":"atk_bnb_raven_wild_wing_slam","name":"Wing Slam","toHit":10,"range":10,"damage":[{"count":2,"sides":8,"modifier":6,"type":"Bludgeoning"}]}]}]},
  "bnb:sparrowhawk": {"speeds":{"walk":10,"fly":55},"speed":10,"weapons":[{"id":"wpn_bnb_sparrowhawk_talon_strike","name":"Talon Strike","equipped":true,"attacks":[{"id":"atk_bnb_sparrowhawk_talon_strike","name":"Talon Strike","toHit":7,"range":5,"damage":[{"count":2,"sides":8,"modifier":4,"type":"Piercing"}]}]}]},
  "bnb:red_kite": {"speeds":{"walk":10,"fly":55},"speed":10,"weapons":[{"id":"wpn_bnb_red_kite_talon_strike","name":"Talon Strike","equipped":true,"attacks":[{"id":"atk_bnb_red_kite_talon_strike","name":"Talon Strike","toHit":8,"range":5,"damage":[{"count":2,"sides":10,"modifier":5,"type":"Slashing"}]}]}]},
  "bnb:kestrel": {"speeds":{"walk":10,"fly":60},"speed":10,"weapons":[{"id":"wpn_bnb_kestrel_talon_strike","name":"Talon Strike","equipped":true,"attacks":[{"id":"atk_bnb_kestrel_talon_strike","name":"Talon Strike","toHit":9,"range":5,"damage":[{"count":3,"sides":8,"modifier":5,"type":"Piercing"}]}]}]},
  "bnb:pine_marten": {"speeds":{"walk":40,"climb":40},"speed":40,"weapons":[{"id":"wpn_bnb_pine_marten_ferocious_bite","name":"Ferocious Bite","equipped":true,"attacks":[{"id":"atk_bnb_pine_marten_ferocious_bite","name":"Ferocious Bite","toHit":7,"range":5,"damage":[{"count":2,"sides":10,"modifier":4,"type":"Piercing"}]}]}]},
  "bnb:adder": {"speeds":{"walk":30,"swim":20},"speed":30,"weapons":[{"id":"wpn_bnb_adder_venomous_bite","name":"Venomous Bite","equipped":true,"attacks":[{"id":"atk_bnb_adder_venomous_bite","name":"Venomous Bite","toHit":5,"range":5,"damage":[{"count":1,"sides":6,"modifier":2,"type":"Piercing"},{"count":3,"sides":6,"modifier":0,"type":"Poison"}]}]}]},
  "bnb:natterjack_toad": {"speeds":{"walk":20,"swim":15},"speed":20,"weapons":[{"id":"wpn_bnb_natterjack_toad_tongue_lash","name":"Tongue Lash","equipped":true,"attacks":[{"id":"atk_bnb_natterjack_toad_tongue_lash","name":"Tongue Lash","toHit":2,"range":10,"damage":[{"count":1,"sides":4,"modifier":0,"type":"Bludgeoning"}]}]}]},
  "bnb:sand_lizard": {"speeds":{"walk":30,"burrow":15},"speed":30,"weapons":[{"id":"wpn_bnb_sand_lizard_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_sand_lizard_bite","name":"Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":6,"modifier":1,"type":"Piercing"}]}]},{"id":"wpn_bnb_sand_lizard_tail_slam","name":"Tail Slam","equipped":true,"attacks":[{"id":"atk_bnb_sand_lizard_tail_slam","name":"Tail Slam","toHit":3,"range":10,"damage":[{"count":1,"sides":6,"modifier":0,"type":"Bludgeoning"}]}]}]},
  "bnb:fire_salamander": {"speeds":{"walk":25,"swim":20},"speed":25},
  "bnb:roe_deer": {"speeds":{"walk":50},"speed":50,"weapons":[{"id":"wpn_bnb_roe_deer_hooves","name":"Hooves","equipped":true,"attacks":[{"id":"atk_bnb_roe_deer_hooves","name":"Hooves","toHit":8,"range":5,"damage":[{"count":2,"sides":8,"modifier":6,"type":"Bludgeoning"}]}]}]},
  "bnb:fallow_deer": {"speeds":{"walk":50},"speed":50,"weapons":[{"id":"wpn_bnb_fallow_deer_hooves","name":"Hooves","equipped":true,"attacks":[{"id":"atk_bnb_fallow_deer_hooves","name":"Hooves","toHit":9,"range":5,"damage":[{"count":2,"sides":10,"modifier":7,"type":"Bludgeoning"}]}]}]},
  "bnb:red_deer": {"speeds":{"walk":50},"speed":50,"weapons":[{"id":"wpn_bnb_red_deer_hooves","name":"Hooves","equipped":true,"attacks":[{"id":"atk_bnb_red_deer_hooves","name":"Hooves","toHit":11,"range":5,"damage":[{"count":3,"sides":10,"modifier":9,"type":"Bludgeoning"}]}]}]},
  "bnb:feral_goat": {"speeds":{"walk":40,"climb":35},"speed":40,"weapons":[{"id":"wpn_bnb_feral_goat_hooves","name":"Hooves","equipped":true,"attacks":[{"id":"atk_bnb_feral_goat_hooves","name":"Hooves","toHit":7,"range":5,"damage":[{"count":2,"sides":6,"modifier":5,"type":"Bludgeoning"}]}]}]},
  "bnb:ibex": {"speeds":{"walk":40,"climb":40},"speed":40,"weapons":[{"id":"wpn_bnb_ibex_hooves","name":"Hooves","equipped":true,"attacks":[{"id":"atk_bnb_ibex_hooves","name":"Hooves","toHit":8,"range":5,"damage":[{"count":2,"sides":8,"modifier":6,"type":"Bludgeoning"}]}]}]},
  "bnb:reindeer": {"speeds":{"walk":50,"swim":25},"speed":50,"weapons":[{"id":"wpn_bnb_reindeer_hooves","name":"Hooves","equipped":true,"attacks":[{"id":"atk_bnb_reindeer_hooves","name":"Hooves","toHit":8,"range":5,"damage":[{"count":2,"sides":10,"modifier":6,"type":"Bludgeoning"}]}]}]},
  "bnb:swine": {"speeds":{"walk":40},"speed":40,"weapons":[{"id":"wpn_bnb_swine_tusks","name":"Tusks","equipped":true,"attacks":[{"id":"atk_bnb_swine_tusks","name":"Tusks","toHit":9,"range":5,"damage":[{"count":3,"sides":8,"modifier":7,"type":"Piercing"}]}]}]},
  "bnb:horse": {"speeds":{"walk":60},"speed":60,"weapons":[{"id":"wpn_bnb_horse_hooves","name":"Hooves","equipped":true,"attacks":[{"id":"atk_bnb_horse_hooves","name":"Hooves","toHit":10,"range":5,"damage":[{"count":3,"sides":10,"modifier":8,"type":"Bludgeoning"}]}]}]},
  "bnb:bison": {"speeds":{"walk":50},"speed":50,"weapons":[{"id":"wpn_bnb_bison_gore","name":"Gore","equipped":true,"attacks":[{"id":"atk_bnb_bison_gore","name":"Gore","toHit":12,"range":5,"damage":[{"count":4,"sides":10,"modifier":10,"type":"Piercing"}]}]}]},
  "bnb:brown_bear": {"speeds":{"walk":40,"climb":30,"swim":30},"speed":40,"weapons":[{"id":"wpn_bnb_brown_bear_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_brown_bear_bite","name":"Bite","toHit":11,"range":5,"damage":[{"count":3,"sides":10,"modifier":9,"type":"Piercing"}]}]},{"id":"wpn_bnb_brown_bear_claws","name":"Claws","equipped":true,"attacks":[{"id":"atk_bnb_brown_bear_claws","name":"Claws","toHit":11,"range":5,"damage":[{"count":2,"sides":12,"modifier":9,"type":"Slashing"}]}]}]},
  "bnb:lupulella_wolf": {"speeds":{"walk":50},"speed":50,"sizeCategory":"Large","size":"Large","weapons":[{"id":"wpn_bnb_lupulella_wolf_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_lupulella_wolf_bite","name":"Bite","toHit":6,"range":5,"damage":[{"count":2,"sides":10,"modifier":4,"type":"Piercing"}]}]}]},
  "bnb:lupus_wolf": {"speeds":{"walk":50},"speed":50,"sizeCategory":"Large","size":"Large","weapons":[{"id":"wpn_bnb_lupus_wolf_bite","name":"Bite","equipped":true,"attacks":[{"id":"atk_bnb_lupus_wolf_bite","name":"Bite","toHit":8,"range":5,"damage":[{"count":3,"sides":10,"modifier":5,"type":"Piercing"}]}]}]},
  "bnb:aenocyon_wolf": {"speeds":{"walk":60},"speed":60,"weapons":[{"id":"wpn_bnb_aenocyon_wolf_titanic_bite","name":"Titanic Bite","equipped":true,"attacks":[{"id":"atk_bnb_aenocyon_wolf_titanic_bite","name":"Titanic Bite","toHit":10,"range":10,"damage":[{"count":4,"sides":12,"modifier":8,"type":"Piercing"}]}]}]},
  "builtin:goblin": {"speeds":{"walk":30},"speed":30},
  "builtin:commoner": {"speeds":{"walk":30},"speed":30},
  "builtin:guard": {"speeds":{"walk":30},"speed":30},
  "builtin:bandit": {"speeds":{"walk":30},"speed":30},
  "builtin:wolf": {"speeds":{"walk":40},"speed":40},
  "builtin:skeleton": {"speeds":{"walk":30},"speed":30},
  "builtin:chest": {"speeds":{"walk":30},"speed":30},
  "builtin:torch": {"speeds":{"walk":30},"speed":30},
  "builtin:candle": {"speeds":{"walk":30},"speed":30},
  "builtin:pouch": {"speeds":{"walk":30},"speed":30},
  "builtin:lever": {"speeds":{"walk":30},"speed":30},
  "builtin:key": {"speeds":{"walk":30},"speed":30},
  "builtin:book": {"speeds":{"walk":30},"speed":30},
  "builtin:door": {"speeds":{"walk":30},"speed":30},
  "builtin:reinforced_door": {"speeds":{"walk":30},"speed":30},
  "builtin:trap_door": {"speeds":{"walk":30},"speed":30},
  "builtin:reinforced_trap_door": {"speeds":{"walk":30},"speed":30},
  "builtin:unfinished_puppet": {"speeds":{"walk":30},"speed":30,"sizeCategory":"Medium","size":"Medium"},
  "builtin:jake": {"speeds":{"walk":30},"speed":30,"sizeCategory":"Medium","size":"Medium"},
  "builtin:tully": {"speeds":{"walk":35},"speed":35,"sizeCategory":"Medium","size":"Medium"},
  "builtin:coalan": {"speeds":{"walk":30},"speed":30},
  "builtin:yevgeny": {"speeds":{"walk":30},"speed":30},
  "builtin:ernest_broken": {"speeds":{"walk":30},"speed":30,"sizeCategory":"Medium","size":"Medium"},
  "builtin:laughing_puppet": {"speeds":{"walk":35,"climb":35},"speed":35,"sizeCategory":"Small","size":"Small"},
  "builtin:angmar": {"speeds":{"walk":30},"speed":30},
  "builtin:barry": {"speeds":{"walk":30},"speed":30},
  "builtin:ivar": {"speeds":{"walk":30},"speed":30},
  "builtin:charles": {"speeds":{"walk":30},"speed":30},
  "builtin:elisia": {"speeds":{"walk":30},"speed":30},
  "builtin:marta": {"speeds":{"walk":30},"speed":30},
  "builtin:oswin": {"speeds":{"walk":30},"speed":30},
  "builtin:gerrit": {"speeds":{"walk":30},"speed":30},
  "builtin:pip": {"speeds":{"walk":35},"speed":35},
  "builtin:npc_male_commoner": {"speeds":{"walk":30},"speed":30},
  "builtin:npc_female_commoner": {"speeds":{"walk":30},"speed":30},
  "builtin:npc_local_elite": {"speeds":{"walk":30},"speed":30},
  "builtin:npc_fighter_guard": {"speeds":{"walk":30},"speed":30},
  "builtin:npc_ranger_guard": {"speeds":{"walk":30},"speed":30},
  "builtin:young_child": {"speeds":{"walk":25},"speed":25},
  "builtin:child": {"speeds":{"walk":30},"speed":30},
  "builtin:teen": {"speeds":{"walk":30},"speed":30},
  "builtin:blacksmith": {"speeds":{"walk":30},"speed":30},
  "builtin:sick_village_guard": {"speeds":{"walk":25},"speed":25},
  "builtin:village_guard": {"speeds":{"walk":30},"speed":30},
  "builtin:priest": {"speeds":{"walk":30},"speed":30},
  "builtin:tavernkeeper": {"speeds":{"walk":30},"speed":30},
  "builtin:tinkerer": {"speeds":{"walk":30},"speed":30},
  "builtin:fisherman": {"speeds":{"walk":30},"speed":30},
  "builtin:orc": {"speeds":{"walk":30},"speed":30},
  "builtin:dog": {"speeds":{"walk":40},"speed":40},
  "builtin:cat": {"speeds":{"walk":40},"speed":40},
  "builtin:pigeon": {"speeds":{"walk":10},"speed":10},
  "builtin:large_toad": {"speeds":{"walk":20},"speed":20},
  "builtin:eagle": {"speeds":{"walk":10},"speed":10},
  "builtin:boar": {"speeds":{"walk":40},"speed":40},
  "builtin:elk": {"speeds":{"walk":50},"speed":50},
  "builtin:horse": {"speeds":{"walk":60},"speed":60},
  "builtin:chicken": {"speeds":{"walk":10},"speed":10},
  "builtin:donkey": {"speeds":{"walk":40},"speed":40},
  "builtin:mule": {"speeds":{"walk":40},"speed":40},
  "builtin:slime": {"speeds":{"walk":10},"speed":10},
  "srd:dog": {"speeds":{"walk":40},"speed":40,"weapons":[{"id":"wpn_dog","name":"Bite","equipped":true,"hands":0,"attacks":[{"id":"atk_dog","name":"Bite","toHit":3,"range":5,"damage":[{"count":1,"sides":6,"modifier":1,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:cat": {"speeds":{"walk":40,"climb":30},"speed":40,"weapons":[{"id":"wpn_cat","name":"Claws","equipped":true,"hands":0,"attacks":[{"id":"atk_cat","name":"Claws","toHit":0,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Slashing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:bat": {"speeds":{"walk":5,"fly":30},"speed":5,"weapons":[{"id":"wpn_bat","name":"Bite","equipped":true,"hands":0,"attacks":[{"id":"atk_bat","name":"Bite","toHit":0,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:crab": {"speeds":{"walk":20,"swim":20},"speed":20,"weapons":[{"id":"wpn_crab","name":"Claw","equipped":true,"hands":0,"attacks":[{"id":"atk_crab","name":"Claw","toHit":0,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Bludgeoning"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:frog": {"speeds":{"walk":20,"swim":20},"speed":20},
  "srd:hawk": {"speeds":{"walk":10,"fly":60},"speed":10,"weapons":[{"id":"wpn_hawk","name":"Talons","equipped":true,"hands":0,"attacks":[{"id":"atk_hawk","name":"Talons","toHit":5,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Slashing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:lizard": {"speeds":{"walk":20,"climb":20},"speed":20,"weapons":[{"id":"wpn_lizard","name":"Bite","equipped":true,"hands":0,"attacks":[{"id":"atk_lizard","name":"Bite","toHit":0,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:octopus": {"speeds":{"walk":5,"swim":30},"speed":5,"weapons":[{"id":"wpn_octopus","name":"Tentacles","equipped":true,"hands":0,"attacks":[{"id":"atk_octopus","name":"Tentacles","toHit":4,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Bludgeoning"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:owl": {"speeds":{"walk":5,"fly":60},"speed":5,"weapons":[{"id":"wpn_owl","name":"Talons","equipped":true,"hands":0,"attacks":[{"id":"atk_owl","name":"Talons","toHit":3,"range":5,"damage":[{"count":0,"sides":4,"modifier":0,"type":"Slashing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:snake": {"speeds":{"walk":30,"swim":30},"speed":30,"weapons":[{"id":"wpn_snake","name":"Bite","equipped":true,"hands":0,"attacks":[{"id":"atk_snake","name":"Bite","toHit":5,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:quipper": {"speeds":{"walk":30,"swim":40},"speed":30,"weapons":[{"id":"wpn_quipper","name":"Bite","equipped":true,"hands":0,"attacks":[{"id":"atk_quipper","name":"Bite","toHit":5,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:rat": {"speeds":{"walk":20,"burrow":10},"speed":20,"weapons":[{"id":"wpn_rat","name":"Bite","equipped":true,"hands":0,"attacks":[{"id":"atk_rat","name":"Bite","toHit":0,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:raven": {"speeds":{"walk":10,"fly":50},"speed":10,"weapons":[{"id":"wpn_raven","name":"Beak","equipped":true,"hands":0,"attacks":[{"id":"atk_raven","name":"Beak","toHit":4,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:seahorse": {"speeds":{"walk":30,"swim":20},"speed":30},
  "srd:spider": {"speeds":{"walk":20,"climb":20},"speed":20,"weapons":[{"id":"wpn_spider","name":"Bite","equipped":true,"hands":0,"attacks":[{"id":"atk_spider","name":"Bite","toHit":4,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:weasel": {"speeds":{"walk":30},"speed":30,"weapons":[{"id":"wpn_weasel","name":"Bite","equipped":true,"hands":0,"attacks":[{"id":"atk_weasel","name":"Bite","toHit":5,"range":5,"damage":[{"count":0,"sides":4,"modifier":1,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
  "srd:mouse": {"speeds":{"walk":20,"burrow":10},"speed":20,"weapons":[{"id":"wpn_mouse","name":"Bite","equipped":true,"hands":0,"attacks":[{"id":"atk_mouse","name":"Bite","toHit":0,"range":5,"damage":[{"count":0,"sides":4,"modifier":0,"type":"Piercing"}],"uses":{"max":0,"current":0,"per":""},"consumes":{"name":"","qty":1},"mode":"toHit","save":{"ability":"DEX","dc":12},"saveDamage":"half"}]}]},
};
BUILTIN_TOKEN_PRESETS = BUILTIN_TOKEN_PRESETS.map(function (p) {
  var m = PRESET_MECHANICS[p.id];
  return m ? Object.assign({}, p, { entity: Object.assign({}, p.entity, m) }) : p;
});

if (typeof module !== 'undefined' && module.exports) { module.exports = { BNB_TOKEN_PRESETS: BNB_TOKEN_PRESETS, BUILTIN_TOKEN_PRESETS: BUILTIN_TOKEN_PRESETS, SRD_FAMILIAR_PRESETS: SRD_FAMILIAR_PRESETS, STANDARD_SPELLS: (typeof STANDARD_SPELLS !== 'undefined' ? STANDARD_SPELLS : []) }; }
