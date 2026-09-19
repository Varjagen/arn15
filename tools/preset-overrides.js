'use strict';
// ============================================================================
// MANUAL PRESET OVERRIDES (v9.75)
// ----------------------------------------------------------------------------
// Only for what automatic enrichment cannot safely determine. Deliberately
// small: a large table here means the parser is being worked around rather than
// trusted, and every entry is a place a future stat-block edit will be ignored.
//
// Keys are real preset ids from game-data.js.
module.exports = {
  // Spellcasters whose spells are listed in PROSE and have no structured book.
  // The spell names are resolved against STANDARD_SPELLS by the pipeline, which
  // reports any that do not exist rather than inventing them.
};
