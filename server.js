/**
 * Shri Ram M&A Conquest – Finance Wordle
 * Backend Server: Express + Socket.IO
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",   // allows GitHub Pages and any browser origin
    methods: ["GET", "POST"]
  }
});

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "conquest2025";
const ROUND_TIME_LIMIT = 120; // seconds per round
const MAX_GUESSES = 6;

// ─── WORD BANK ────────────────────────────────────────────────────────────────
// Finance-themed 5-letter words (answers per round)
const ROUND_WORDS = ["STOCK", "ASSET", "BONDS", "DEBIT", "FUNDS", "TRADE", "YIELD", "AUDIT", "SHARE", "FOREX"];

// Large valid word list (so players can guess non-finance words too)
const VALID_WORDS = new Set([
  // Finance words
  "STOCK","ASSET","BONDS","DEBIT","FUNDS","TRADE","YIELD","AUDIT","SHARE","FOREX",
  "MONEY","PRICE","VALUE","PROFIT","EQUITY","HEDGE","RATIO","RATES","LOANS","NOTES",
  "BEARS","BULLS","RALLY","CRASH","PANIC","MERGER","AGENT","BUYER","QUOTE","INDEX",
  "DELTA","ALPHA","OMEGA","GAMMA","THETA","SIGMA","LIBOR","SWIFT","SWIFT","TRUST",
  "GRANT","FLOAT","DRAFT","CHECK","CREDIT","DAILY","EARLY","ENTRY","TOTAL","DAILY",
  // Common English words (Wordle-style valid guesses)
  "ABOUT","ABOVE","ABUSE","ACTOR","ACUTE","ADMIT","ADOPT","ADULT","AFTER","AGAIN",
  "AGATE","AGILE","AGING","AGONY","AGREE","AHEAD","AIMED","AIRED","ALARM","ALBUM",
  "ALERT","ALGAE","ALIGN","ALIKE","ALIVE","ALLAY","ALLEY","ALLOT","ALLOW","ALLOY",
  "ALONE","ALONG","ALOOF","ALOUD","ALTAR","ALTER","AMAZE","AMBLE","AMEND","AMONG",
  "AMPLE","ANGEL","ANGER","ANGLE","ANGRY","ANIME","ANNEX","ANNOY","ANTIC","ANVIL",
  "AORTA","APART","APPLE","APPLY","APRIL","APRON","ARBOR","ARDOR","ARGUE","ARISE",
  "ARMOR","AROMA","AROSE","ARRAY","ARROW","ARSON","ASCOT","ASIDE","ASKED","ATLAS",
  "ATTIC","AUDIO","AUDIT","AUGUR","AVAIL","AVIAN","AVOID","AWAKE","AWARD","AWARE",
  "AWFUL","BADLY","BAKER","BASIC","BASIS","BASTE","BATCH","BATHE","BAYOU","BEACH",
  "BEADY","BEGIN","BEING","BELLY","BENCH","BIBLE","BIGOT","BIRDS","BIRTH","BISON",
  "BITE","BITTY","BLAND","BLAST","BLAZE","BLEAK","BLEND","BLESS","BLIMP","BLIND",
  "BLISS","BLITZ","BLOOM","BLOWN","BLUES","BLUNT","BLURB","BLURT","BOGUS","BOLTS",
  "BONUS","BOOST","BOOTH","BORNE","BRAIN","BRAND","BRAVE","BRAVO","BRAWN","BREAD",
  "BREAK","BREED","BREVE","BRIDE","BRINE","BRISK","BROOD","BROTH","BROWN","BROWS",
  "BRUNT","BRUTE","BUDDY","BUILD","BUILT","BULGE","BULLY","BUMPY","BUNCH","BUNNY",
  "BURNT","CABAL","CABLE","CACHE","CADRE","CAIRO","CANDY","CANNY","CANON","CAPER",
  "CARRY","CAUSE","CEASE","CEDAR","CHAIN","CHAIR","CHAOS","CHARD","CHARM","CHART",
  "CHASE","CHASM","CHEAP","CHEER","CHEST","CHIEF","CHILD","CHILL","CHINA","CHORD",
  "CIVIC","CIVIL","CLAIM","CLAMP","CLASH","CLASP","CLASS","CLEAN","CLEAR","CLERK",
  "CLICK","CLIFF","CLING","CLOCK","CLONE","CLOSE","CLOUD","CLOWN","CLUCK","CLUMP",
  "COMET","COMIC","COMMA","COUCH","COUGH","COUNT","COURT","COVER","COVET","CRAFT",
  "CRANE","CRAVE","CRAZY","CREED","CREEK","CRIMP","CRISP","CROSS","CROWD","CROWN",
  "CRUEL","CRUMB","CRUSH","CRUST","CURLY","CURVE","CYCLE","DAISY","DANCE","DATUM",
  "DECAY","DECOY","DEFER","DELAY","DENSE","DEPOT","DEPTH","DERBY","DEVIL","DISCO",
  "DITTY","DITTO","DIVVY","DIZZY","DODGE","DOGMA","DOING","DONOR","DOUBT","DOUGH",
  "DOWRY","DOZEN","DRAMA","DRAWL","DREAD","DREAM","DRESS","DRIVE","DROIT","DRONE",
  "DROVE","DROWN","DRYER","DWARF","DYING","EAGER","EAGLE","EARLY","EARTH","EASEL",
  "EATEN","EDICT","EIGHT","EJECT","ELDER","ELECT","ELFIN","ELITE","ELOPE","EMPTY",
  "ENDED","ENDOW","ENTER","ENVOY","EQUAL","EQUIP","ESSAY","EVOKE","EXACT","EXERT",
  "EXIST","EXPEL","EXTRA","EXULT","FABLE","FACET","FAINT","FAIRY","FAITH","FALSE",
  "FATED","FEAST","FERAL","FERRY","FEVER","FIBER","FIELD","FIERY","FIFTH","FIGHT",
  "FINAL","FIRST","FIXED","FIZZY","FLAME","FLANK","FLARE","FLASH","FLASK","FLAUNT",
  "FLEET","FLESH","FLICK","FLIER","FLUNG","FLUTE","FOAMY","FOCAL","FOCUS","FOLLY",
  "FORGE","FORTE","FORUM","FOUND","FRAIL","FRAME","FRANK","FRAUD","FREAK","FRESH",
  "FRONT","FROZE","FRUGAL","FULLY","GAWKY","GECKO","GENRE","GHOST","GIANT","GIVEN",
  "GLAND","GLARE","GLAZE","GLEAM","GLEAN","GLIDE","GLINT","GLOAT","GLOOM","GLOSS",
  "GLOVE","GOING","GORGE","GOUGE","GRACE","GRADE","GRAFT","GRAIN","GRASP","GRASS",
  "GRATE","GRAVE","GRAZE","GREED","GREEN","GREET","GRIEF","GRIND","GROAN","GROIN",
  "GROPE","GROUP","GUARD","GUAVA","GUESS","GUILD","GUILE","GUISE","GUSTO","GYPSY",
  "HABIT","HAIKU","HANDY","HARDY","HARSH","HASTY","HAVEN","HEART","HEAVY","HENCE",
  "HERBS","HINGE","HIPPO","HOIST","HOMER","HONOR","HOPED","HOTEL","HOUND","HOVER",
  "HUMAN","HUMID","HURRY","HYENA","HYPER","ICING","IDEAL","IDIOM","IDIOT","IGLOO",
  "IMPLY","INANE","INCUR","INNER","INPUT","INSET","INTER","INTRO","IRONY","ISSUE",
  "IVORY","JAUNT","JAZZY","JOKER","JOINT","JOUST","JOWLS","JUMBO","JUROR","KEBAB",
  "KNACK","KNEEL","KNELT","KNIFE","KNOCK","KNOWN","KUDOS","LABEL","LADEN","LAPEL",
  "LARGE","LASER","LATCH","LATER","LATTE","LAUGH","LAYER","LEAFY","LEARN","LEASE",
  "LEECH","LEGAL","LEMMA","LEMON","LEVEL","LIGHT","LIMIT","LINGO","LIVER","LOCAL",
  "LODGE","LOGIC","LOOSE","LOVER","LOWLY","LOYAL","LUCID","LUCKY","LUMPY","LUSTY",
  "LYING","MAGIC","MAJOR","MAMBO","MANOR","MAPLE","MARCH","MARSH","MATCH","MAXIM",
  "MAYOR","MEALY","MEDIA","MERCY","MERIT","MIGHT","MIMIC","MINOR","MINUS","MIRTH",
  "MISER","MISTY","MITRE","MIXED","MODEL","MORAL","MOURN","MUDDY","MURKY","MURAL",
  "NADIR","NAIVE","NASTY","NERVE","NEVER","NIGHT","NOBLE","NOISE","NORTH","NOTCH",
  "NOVEL","NUDGE","NYMPH","OAKEN","OFTEN","ORDER","ORGAN","OTHER","OUGHT","OUNCE",
  "OUTDO","OWNED","OXIDE","OZONE","PACED","PADRE","PAGAN","PAINT","PALSY","PATIO",
  "PATSY","PAUSE","PEACE","PENAL","PENNY","PERCH","PERIL","PERKY","PETTY","PHASE",
  "PHONE","PIANO","PILOT","PIQUE","PIXEL","PIZZA","PLACE","PLAIN","PLAIT","PLANK",
  "PLANT","PLATE","PLAZA","PLEAD","PLUMB","PLUME","PLUMP","PLUNK","PLUSH","POACH",
  "POINT","POKER","POLAR","POLED","POLIO","POLKA","POUCH","POWER","PRANK","PRAWN",
  "PRESS","PRIDE","PRIME","PRIMP","PRINT","PRIOR","PRISM","PRIVY","PROBE","PRONE",
  "PROOF","PROSE","PROUD","PROVE","PROWL","PRUDE","PRUNE","PSALM","PUBIC","PULSE",
  "PUNCH","PURGE","QUEEN","QUERY","QUEUE","QUICK","QUIET","QUIRK","QUOTA","QUOTH",
  "RABBI","RADAR","RADII","RAINY","RAISE","RAMEN","RANCH","RANGE","RAPID","RATED",
  "RATIO","REACH","REALM","REBEL","REIGN","RELAX","REPAY","REPEL","RERUN","RESET",
  "REUSE","REVEL","RIDER","RIDGE","RIFLE","RIGOR","RIPEN","RISEN","RISKY","RIVAL",
  "RIVER","RIVET","ROAST","ROCKY","ROUGE","ROUGH","ROUND","ROUTE","ROYAL","RUGBY",
  "RULER","RURAL","SAINT","SALAD","SANDY","SATAY","SAUCE","SAVOR","SCALE","SCOPE",
  "SCORE","SCOUT","SCRAM","SCREW","SCRUB","SEDAN","SEIZE","SENSE","SERVE","SETUP",
  "SEVEN","SHARD","SHARP","SHEER","SHELF","SHELL","SHIFT","SHINE","SHINY","SHIRT",
  "SHOCK","SHOOT","SHORE","SHORT","SHOWN","SHRUG","SIEVE","SIGHT","SINCE","SIXTH",
  "SKILL","SLANT","SLASH","SLEEK","SLEET","SLICE","SLIDE","SLIME","SLOPE","SLUMP",
  "SMART","SMEAR","SMELL","SMIRK","SMITE","SMOKE","SMOTE","SNACK","SNAIL","SNAKE",
  "SNARE","SNEAK","SNOOP","SOLAR","SOLID","SOLVE","SONIC","SORRY","SOUTH","SPARE",
  "SPARK","SPAWN","SPEAR","SPEED","SPELL","SPEND","SPILL","SPINE","SPITE","SPLAT",
  "SPLIT","SPOKE","SPOON","SPORT","SPRAY","SPREE","SPRIG","SQUAD","SQUAT","SQUID",
  "STAIR","STALE","STALK","STAMP","STAND","STARK","START","STATE","STEAK","STEAL",
  "STEAM","STEEL","STEER","STERN","STIFF","STILL","STILT","STING","STINK","STIPE",
  "STOMP","STONE","STOOD","STORM","STOVE","STRAP","STRAW","STRAY","STRIP","STRUT",
  "STUDY","STUFF","STUNT","SUAVE","SUPER","SURGE","SWAMP","SWEAR","SWEAT","SWEEP",
  "SWEET","SWEPT","SWIFT","SWIRL","SWOOP","SYRUP","TACIT","TAKEN","TALLY","TALON",
  "TANGO","TAUNT","TEACH","TEASE","TEMPO","TENSE","TENOR","TEPID","TERMS","TERSE",
  "THEFT","THEIR","THERE","THICK","THIRD","THORN","THREE","THREW","THROE","THROW",
  "THUMB","TIARA","TIGER","TIGHT","TIMED","TIPSY","TIRED","TITLE","TOAST","TOKEN",
  "TONIC","TOPIC","TORCH","TOUCH","TOUGH","TOWEL","TOWER","TOXIC","TRACK","TRAIL",
  "TRAIN","TRAMP","TRASH","TRAWL","TREAD","TREMBLE","TREND","TRICK","TRIED","TRITE",
  "TROLL","TROMP","TROOP","TROUT","TROVE","TRUCE","TRUCK","TRULY","TRUMP","TRUNK",
  "TRUSS","TRUTH","TULIP","TUNER","TUNIC","TUTOR","TWEED","TWICE","TWIST","TYPED",
  "ULCER","ULTRA","UNCUT","UNDER","UNFIT","UNION","UNITE","UNITY","UNTIL","UPPER",
  "UPSET","URBAN","USHER","USUAL","UTTER","VAPOR","VAULT","VENOM","VERSE","VIGOR",
  "VIRAL","VIRUS","VOGUE","VOICE","VOILA","VOTER","WAGON","WAKEN","WATCH","WATER",
  "WEAVE","WEIGH","WEIRD","WHILE","WHIFF","WHIRL","WHISK","WHITE","WHOLE","WIDEN",
  "WIDER","WINDY","WIRED","WITCH","WITTY","WORLD","WORDY","WORSE","WORST","WORTH",
  "WOUND","WRATH","WREST","WRING","WROTE","YEAST","YOUNG","ZEBRA","ZESTY","ZIPPY",
  "ZONED","ZONE"
]);

// ─── GAME STATE ───────────────────────────────────────────────────────────────
const gameState = {
  phase: "lobby",       // lobby | countdown | playing | round_end | game_over
  round: 0,
  currentWord: "",
  roundStartTime: null,
  roundTimer: null,
  countdownTimer: null,
  teams: {},            // socketId → teamData
  roundResults: [],     // per round summary
};

function resetRoundState() {
  Object.values(gameState.teams).forEach(team => {
    team.guesses = [];
    team.solved = false;
    team.timeTaken = null;
    team.roundScore = 0;
    team.finished = false;
  });
}

function getLeaderboard() {
  const teams = Object.values(gameState.teams);
  return teams
    .map(t => ({
      name: t.name,
      socketId: t.socketId,
      totalScore: t.totalScore,
      roundScore: t.roundScore,
      guesses: t.guesses.length,
      timeTaken: t.timeTaken,
      solved: t.solved,
      finished: t.finished,
    }))
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (a.guesses !== b.guesses) return a.guesses - b.guesses;
      return (a.timeTaken ?? 9999) - (b.timeTaken ?? 9999);
    });
}

function checkAllFinished() {
  const teams = Object.values(gameState.teams);
  return teams.length > 0 && teams.every(t => t.finished);
}

function startRound() {
  gameState.round++;
  if (gameState.round > 3) {
    endGame();
    return;
  }
  gameState.currentWord = ROUND_WORDS[gameState.round - 1];
  gameState.phase = "playing";
  gameState.roundStartTime = Date.now();
  resetRoundState();

  io.emit("round_start", {
    round: gameState.round,
    totalRounds: 3,
    timeLimit: ROUND_TIME_LIMIT,
  });

  // Round timer
  if (gameState.roundTimer) clearTimeout(gameState.roundTimer);
  gameState.roundTimer = setTimeout(() => {
    if (gameState.phase === "playing") {
      // Force-finish anyone who hasn't finished
      Object.values(gameState.teams).forEach(team => {
        if (!team.finished) {
          team.finished = true;
          team.roundScore = 0;
        }
      });
      endRound();
    }
  }, ROUND_TIME_LIMIT * 1000);
}

function endRound() {
  if (gameState.roundTimer) clearTimeout(gameState.roundTimer);
  gameState.phase = "round_end";

  const leaderboard = getLeaderboard();
  io.emit("round_end", {
    round: gameState.round,
    word: gameState.currentWord,
    leaderboard,
  });

  // Next round after 8 seconds
  setTimeout(() => {
    if (gameState.round < 3) {
      startCountdown();
    } else {
      endGame();
    }
  }, 8000);
}

function startCountdown() {
  gameState.phase = "countdown";
  let count = 5;
  io.emit("countdown", { count });

  if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);
  gameState.countdownTimer = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(gameState.countdownTimer);
      startRound();
    } else {
      io.emit("countdown", { count });
    }
  }, 1000);
}

function endGame() {
  gameState.phase = "game_over";
  const leaderboard = getLeaderboard();
  io.emit("game_over", { leaderboard });
}

// ─── WORD VALIDATION ─────────────────────────────────────────────────────────
function isValidWord(word) {
  return VALID_WORDS.has(word.toUpperCase());
}

function evaluateGuess(guess, answer) {
  const result = [];
  const answerArr = answer.split("");
  const guessArr = guess.split("");
  const used = Array(5).fill(false);

  // First pass: correct positions
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = "correct";
      used[i] = true;
    } else {
      result[i] = "absent";
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guessArr[i] === answerArr[j]) {
        result[i] = "present";
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[CONNECT] ${socket.id}`);

  // Send current state to newly joined client
  socket.emit("state_sync", {
    phase: gameState.phase,
    round: gameState.round,
    totalRounds: 3,
    timeLimit: ROUND_TIME_LIMIT,
    leaderboard: getLeaderboard(),
    teamCount: Object.keys(gameState.teams).length,
  });

  // ── JOIN ──
  socket.on("join", ({ name }) => {
    if (!name || typeof name !== "string") return;
    const teamName = name.trim().substring(0, 30);
    if (!teamName) return;

    // Prevent duplicate names
    const existing = Object.values(gameState.teams).find(
      t => t.name.toLowerCase() === teamName.toLowerCase()
    );
    if (existing) {
      socket.emit("join_error", { message: "Team name already taken. Choose another." });
      return;
    }

    gameState.teams[socket.id] = {
      socketId: socket.id,
      name: teamName,
      totalScore: 0,
      guesses: [],
      solved: false,
      timeTaken: null,
      roundScore: 0,
      finished: false,
    };

    socket.emit("joined", { name: teamName, socketId: socket.id });
    io.emit("team_joined", { name: teamName, teamCount: Object.keys(gameState.teams).length });
    io.emit("leaderboard_update", getLeaderboard());
    console.log(`[JOIN] ${teamName} (${socket.id})`);
  });

  // ── GUESS ──
  socket.on("guess", ({ word }) => {
    const team = gameState.teams[socket.id];
    if (!team) return socket.emit("error", { message: "Not in game. Please join first." });
    if (gameState.phase !== "playing") return socket.emit("error", { message: "No round in progress." });
    if (team.finished) return socket.emit("error", { message: "You have already finished this round." });
    if (!word || typeof word !== "string") return socket.emit("error", { message: "Invalid guess." });

    const guessWord = word.toUpperCase().trim();
    if (guessWord.length !== 5) return socket.emit("error", { message: "Guess must be exactly 5 letters." });
    if (!/^[A-Z]+$/.test(guessWord)) return socket.emit("error", { message: "Only letters allowed." });
    if (!isValidWord(guessWord)) return socket.emit("error", { message: "Not a valid word. Try again." });

    const result = evaluateGuess(guessWord, gameState.currentWord);
    team.guesses.push(guessWord);

    const solved = result.every(r => r === "correct");
    const outOfGuesses = team.guesses.length >= MAX_GUESSES;

    if (solved) {
      const timeTaken = Math.floor((Date.now() - gameState.roundStartTime) / 1000);
      team.solved = true;
      team.timeTaken = timeTaken;
      const extraGuesses = team.guesses.length - 1;
      team.roundScore = Math.max(0, 100 - (extraGuesses * 10) - timeTaken);
      team.totalScore += team.roundScore;
      team.finished = true;

      socket.emit("guess_result", { word: guessWord, result, solved: true, roundScore: team.roundScore, timeTaken });
      io.emit("team_solved", { name: team.name, guesses: team.guesses.length, timeTaken, roundScore: team.roundScore });
      io.emit("leaderboard_update", getLeaderboard());

      if (checkAllFinished()) endRound();

    } else if (outOfGuesses) {
      team.finished = true;
      team.roundScore = 0;
      team.timeTaken = Math.floor((Date.now() - gameState.roundStartTime) / 1000);
      team.totalScore += 0;

      socket.emit("guess_result", { word: guessWord, result, solved: false, outOfGuesses: true });
      io.emit("team_failed", { name: team.name });
      io.emit("leaderboard_update", getLeaderboard());

      if (checkAllFinished()) endRound();

    } else {
      socket.emit("guess_result", { word: guessWord, result, solved: false });
    }
  });

  // ── ADMIN ──
  socket.on("admin_start", ({ key }) => {
    if (key !== ADMIN_KEY) return socket.emit("admin_error", { message: "Invalid admin key." });
    if (gameState.phase !== "lobby" && gameState.phase !== "game_over") {
      return socket.emit("admin_error", { message: "Game already in progress." });
    }
    // Reset cumulative scores if restarting
    Object.values(gameState.teams).forEach(t => { t.totalScore = 0; });
    gameState.round = 0;
    gameState.phase = "lobby";
    startCountdown();
    socket.emit("admin_ok", { message: "Game starting!" });
  });

  socket.on("admin_next_round", ({ key }) => {
    if (key !== ADMIN_KEY) return socket.emit("admin_error", { message: "Invalid admin key." });
    if (gameState.phase !== "playing") return socket.emit("admin_error", { message: "No round in progress." });
    endRound();
    socket.emit("admin_ok", { message: "Forced round end." });
  });

  socket.on("admin_reset", ({ key }) => {
    if (key !== ADMIN_KEY) return socket.emit("admin_error", { message: "Invalid admin key." });
    if (gameState.roundTimer) clearTimeout(gameState.roundTimer);
    if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);
    gameState.phase = "lobby";
    gameState.round = 0;
    gameState.currentWord = "";
    Object.values(gameState.teams).forEach(t => {
      t.totalScore = 0;
      t.guesses = [];
      t.solved = false;
      t.timeTaken = null;
      t.roundScore = 0;
      t.finished = false;
    });
    io.emit("game_reset");
    socket.emit("admin_ok", { message: "Game reset." });
  });

  socket.on("admin_get_state", ({ key }) => {
    if (key !== ADMIN_KEY) return socket.emit("admin_error", { message: "Invalid admin key." });
    socket.emit("admin_state", {
      phase: gameState.phase,
      round: gameState.round,
      word: gameState.currentWord,
      teams: Object.values(gameState.teams).map(t => ({
        name: t.name,
        solved: t.solved,
        guesses: t.guesses.length,
        finished: t.finished,
        totalScore: t.totalScore,
        roundScore: t.roundScore,
        timeTaken: t.timeTaken,
      })),
      leaderboard: getLeaderboard(),
    });
  });

  // ── DISCONNECT ──
  socket.on("disconnect", () => {
    const team = gameState.teams[socket.id];
    if (team) {
      console.log(`[LEAVE] ${team.name} (${socket.id})`);
      // Don't delete so scores persist; mark as disconnected
      io.emit("team_left", { name: team.name });
      // If they were the last one needed to finish a round
      if (gameState.phase === "playing" && !team.finished) {
        team.finished = true;
        if (checkAllFinished()) endRound();
      }
      delete gameState.teams[socket.id];
      io.emit("leaderboard_update", getLeaderboard());
    }
  });
});

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "admin.html"));
});

// ─── START ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔑 Admin panel: http://localhost:${PORT}/admin  (key: ${ADMIN_KEY})`);
});
