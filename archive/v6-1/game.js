"use strict";
/**
 * Football Ground Attack Lab v6 engine
 * Practice lab: 6×6 books, latched flip, no clock, stable LOS, film-sheet routes.
 */
/**
* Football Ground Attack Lab — Default feel pass
* Port of the v1 canvas sim + locked v2 mapping / AI / truck / burst / fumble.
*/
const UNIFORMS = [
	{ id: 0, helmet: "#002244", jersey: "#FB4F14", pants: "#002244", number: "#FFFFFF", facemask: "#FFFFFF", endPrimary: "#002244", endSecondary: "#FB4F14", logoFill: "#002244", logoMark: "#FB4F14" },
	{ id: 1, helmet: "#E31837", jersey: "#FFFFFF", pants: "#E31837", number: "#E31837", facemask: "#FFFFFF", endPrimary: "#E31837", endSecondary: "#FFB81C", logoFill: "#E31837", logoMark: "#FFB81C" },
	{ id: 2, helmet: "#FFFFFF", jersey: "#00338D", pants: "#FFFFFF", number: "#FFFFFF", facemask: "#00338D", endPrimary: "#00338D", endSecondary: "#FFFFFF", logoFill: "#00338D", logoMark: "#FFFFFF" },
	{ id: 3, helmet: "#101820", jersey: "#006778", pants: "#101820", number: "#D7A22A", facemask: "#D7A22A", endPrimary: "#006778", endSecondary: "#D7A22A", logoFill: "#006778", logoMark: "#D7A22A" },
	{ id: 4, helmet: "#A5ACAF", jersey: "#000000", pants: "#A5ACAF", number: "#FFFFFF", facemask: "#000000", endPrimary: "#000000", endSecondary: "#A5ACAF", logoFill: "#000000", logoMark: "#A5ACAF" },
	{ id: 5, helmet: "#B3995D", jersey: "#AA0000", pants: "#B3995D", number: "#FFFFFF", facemask: "#FFFFFF", endPrimary: "#AA0000", endSecondary: "#B3995D", logoFill: "#AA0000", logoMark: "#B3995D" },
	{ id: 6, helmet: "#4F2683", jersey: "#FFC62F", pants: "#4F2683", number: "#4F2683", facemask: "#FFC62F", endPrimary: "#4F2683", endSecondary: "#FFC62F", logoFill: "#4F2683", logoMark: "#FFC62F" },
	{ id: 7, helmet: "#FFB612", jersey: "#203731", pants: "#FFB612", number: "#FFFFFF", facemask: "#203731", endPrimary: "#203731", endSecondary: "#FFB612", logoFill: "#203731", logoMark: "#FFB612" }
];
const NUM_POOLS = {
	QB: [10, 18, 8],
	TE: [81, 85, 87, 88, 89],
	DT: [90, 93, 95, 97, 98, 99],
	FB: [
		27,
		40,
		44,
		45
	],
	HB: [
		12,
		13,
		20,
		21,
		27,
		30,
		38,
		22
	],
	DB: [
		2,
		9,
		21,
		29,
		1,
		23,
		24,
		26
	],
	LB: [
		0,
		15,
		40,
		49,
		52,
		53,
		55
	],
	OL: [
		60,
		63,
		66,
		69,
		72,
		74,
		77,
		78
	]
};
const OFF_PLAYS = [
	{
		id: "blastR",
		name: "Blast",
		arrow: [.45, .55],
		blockStyle: "zoneR",
		lockFirst: false,
		steps: [{
			dx: .35,
			dy: .55,
			t: .16
		}, {
			dx: .4,
			dy: .9,
			t: .22
		}]
	},
	{
		id: "sweepL",
		name: "Pitch",
		arrow: [-1.15],
		blockStyle: "wallL",
		lockFirst: false,
		steps: [{
			dx: -.9,
			dy: .5,
			t: .22
		}]
	},
	{
		id: "sweepR",
		name: "Sweep",
		arrow: [1.15],
		blockStyle: "wallR",
		lockFirst: false,
		steps: [{
			dx: .9,
			dy: .5,
			t: .22
		}]
	},
	{
		id: "river",
		name: "River",
		arrow: [-.4, .55, -.25, .7],
		blockStyle: "river",
		lockFirst: true,
		steps: [{
			dx: -.45,
			dy: .25,
			t: .14
		}, {
			dx: .5,
			dy: .45,
			t: .16
		}, {
			dx: -.3,
			dy: .4,
			t: .14
		}, {
			dx: .55,
			dy: .7,
			t: .2
		}]
	},
	{
		id: "diveL",
		name: "Zig Zag",
		arrow: [-.45, .55, -.5, .5, -.35],
		blockStyle: "zigzag",
		lockFirst: false,
		steps: [{
			dx: -.42,
			dy: .72,
			t: .18
		}, {
			dx: .58,
			dy: .75,
			t: .18
		}, {
			dx: -.52,
			dy: .78,
			t: .18
		}, {
			dx: .5,
			dy: .78,
			t: .18
		}, {
			dx: -.38,
			dy: .85,
			t: .22
		}]
	},
	{
		id: "wedgeL",
		name: "Wedge",
		arrow: [.4, -1.35],
		blockStyle: "wedgeL",
		lockFirst: false,
		steps: [{
			dx: .45,
			dy: .12,
			t: .13
		}, {
			dx: -1.15,
			dy: .5,
			t: .2
		}, {
			dx: -.85,
			dy: .75,
			t: .2
		}, {
			dx: -.55,
			dy: .9,
			t: .18
		}]
	},
	];
const AUDIBLE_BUTTONS = [
	// A snap · B defense menu · Y cancel · LT/RT flip — not pick slots
	{ id: "LB", label: "LB", match: (inp) => inp.jukeL },
	{ id: "RB", label: "RB", match: (inp) => inp.jukeR },
	{ id: "UP", label: "↑", match: (inp) => inp._dpadUp },
	{ id: "DN", label: "↓", match: (inp) => inp._dpadDn },
	{ id: "LEFT", label: "←", match: (inp) => inp._dpadLeft },
	{ id: "RIGHT", label: "→", match: (inp) => inp._dpadRight }
];
const DEF_SCHEMES = [
	{
		id: "cover4Quarters",
		name: "Quarters",
		depthLB: 5.5,
		depthDB: 12,
		cluster: "spread"
	},
	{
		id: "overloadBlitz",
		name: "Overload",
		depthLB: 4.4,
		depthDB: 9.2,
		cluster: "left"
	},
	{
		id: "prevent",
		name: "Prevent / Cloud",
		depthLB: 6.8,
		depthDB: 13.5,
		cluster: "spread"
	},
	{
		id: "tight",
		name: "Bear",
		depthLB: 4.2,
		depthDB: 8,
		cluster: "middle"
	},
	{
		id: "wide",
		name: "Fire Zone",
		depthLB: 5.2,
		depthDB: 9.5,
		cluster: "wide"
	},
	{
		id: "goalLine",
		name: "Walk-Up",
		depthLB: 3.6,
		depthDB: 6.2,
		cluster: "middle"
	}
];

const ROUTE_TEMPLATES = {
	ozR: [{ dx: .55, dy: .65, t: .18 }, { dx: .7, dy: .85, t: .26 }],
	ozL: [{ dx: -.55, dy: .65, t: .18 }, { dx: -.7, dy: .85, t: .26 }],
	blastR: [{ dx: .35, dy: .55, t: .16 }, { dx: .4, dy: .9, t: .22 }],
	blastL: [{ dx: -.35, dy: .55, t: .16 }, { dx: -.4, dy: .9, t: .22 }],
	arrowR: [{ dx: .85, dy: .45, t: .16 }, { dx: .5, dy: .8, t: .2 }],
	arrowL: [{ dx: -.85, dy: .45, t: .16 }, { dx: -.5, dy: .8, t: .2 }],
	needleL: [{ dx: -.55, dy: .85, t: .2 }],
	needleR: [{ dx: .55, dy: .85, t: .2 }],
	sweepL: [{ dx: -.9, dy: .5, t: .22 }, { dx: -.7, dy: .75, t: .2 }],
	sweepR: [{ dx: .9, dy: .5, t: .22 }, { dx: .7, dy: .75, t: .2 }],
	stretchR: [{ dx: .75, dy: .35, t: .16 }, { dx: .85, dy: .7, t: .24 }],
	stretchL: [{ dx: -.75, dy: .35, t: .16 }, { dx: -.85, dy: .7, t: .24 }],
	counterR: [{ dx: -.4, dy: .2, t: .14 }, { dx: .85, dy: .7, t: .22 }],
	counterL: [{ dx: .4, dy: .2, t: .14 }, { dx: -.85, dy: .7, t: .22 }],
	floodR: [{ dx: .5, dy: .6, t: .16 }, { dx: .35, dy: .9, t: .22 }],
	floodL: [{ dx: -.5, dy: .6, t: .16 }, { dx: -.35, dy: .9, t: .22 }],
	diveL: [{ dx: -.22, dy: .95, t: .28 }],
	leadL: [{ dx: -.55, dy: .7, t: .2 }, { dx: -.4, dy: .85, t: .22 }],
	plungeL: [{ dx: -.12, dy: .3, t: .12 }, { dx: -.5, dy: .95, t: .3 }],
	delayMid: [{ dx: .04, dy: .12, t: .22 }, { dx: .08, dy: .75, t: .24 }],
	pressL: [{ dx: -.9, dy: .32, t: .16 }, { dx: -.15, dy: .8, t: .22 }],
	shortL: [{ dx: -.4, dy: .72, t: .16 }],
	shortCounterR: [{ dx: -.3, dy: .18, t: .12 }, { dx: .7, dy: .65, t: .18 }],
	flatArrowL: [{ dx: -.7, dy: .25, t: .16 }, { dx: -.55, dy: .5, t: .16 }],
	// 1.1.A clip trails, truncated 10 yd past the LOS, world units (sx=8.4, sy=6.6).
	bounceR: [{ dx: .84, dy: .91, t: .18 }, { dx: .92, dy: 1.36, t: .22 }],
	cutbackR: [{ dx: -.83, dy: .94, t: .16 }, { dx: .55, dy: 1.34, t: .22 }]
};
function cloneSteps(steps) {
	return (steps || []).map((st) => ({ ...st }));
}
function stepsToArrow(steps) {
	return (steps || []).map((st) => st.dx || 0);
}
// Keeper film sheet. Dropped cells omit the facing so stock / mirrored art stays.
const ROUTE_BOOK = {
	blast: {
		overloadBlitz: { stock: { primary: "ozR" }, flipped: { primary: "diveL" } },
		prevent: { stock: { primary: "arrowR", secondary: "needleL" }, flipped: { primary: "blastL", secondary: "blastR" } },
		wide: { stock: { primary: "ozR", secondary: "blastL" }, flipped: { primary: "leadL" } },
		goalLine: { stock: { primary: "ozR", secondary: "sweepL" }, flipped: { primary: "plungeL" } },
		cover4Quarters: { stock: { primary: "bounceR", secondary: "cutbackR" }, flipped: { primary: "blastL" } }
	},
	pitch: {
		cover4Quarters: { stock: { primary: "arrowL" } },
		overloadBlitz: { stock: { primary: "leadL" } },
		prevent: { stock: { primary: "arrowL", secondary: "stretchR" } }
	},
	sweep: {
		prevent: { flipped: { primary: "ozL", secondary: "ozR" } },
		wide: { flipped: { primary: "stretchR" } }
	},
	river: {
		cover4Quarters: { stock: { primary: "counterR" } },
		overloadBlitz: { stock: { primary: "stretchR", secondary: "flatArrowL" } },
		prevent: { stock: { primary: "blastR", secondary: "arrowL" }, flipped: { primary: "arrowL", secondary: "arrowR" } },
		wide: { stock: { primary: "arrowR", secondary: "ozR" }, flipped: { primary: "counterR" } },
		tight: { flipped: { primary: "stretchR" } }
	},
	zigzag: {
		cover4Quarters: { stock: { primary: "pressL" }, flipped: { primary: "pressL" } },
		overloadBlitz: { stock: { primary: "sweepR" } },
		prevent: { stock: { primary: "floodR", secondary: "arrowR" }, flipped: { primary: "delayMid" } },
		wide: { stock: { primary: "counterR" }, flipped: { primary: "arrowL", secondary: "blastR" } },
		tight: { flipped: { primary: "sweepR" } }
	},
	wedge: {
		cover4Quarters: { stock: { primary: "counterL" } },
		prevent: { stock: { primary: "floodL", secondary: "blastL" }, flipped: { primary: "blastL" } },
		tight: { stock: { primary: "sweepL" } },
		goalLine: { stock: { primary: "sweepL", secondary: "counterL" } }
	}
};
function playBookKey(play) {
	if (!play) return "";
	const id = String(play.baseId || play.id || "");
	if (id === "blastR" || (play.name === "Blast" && !String(play.blockStyle || "").startsWith("wedge"))) return "blast";
	if (id === "sweepL" || play.name === "Pitch") return "pitch";
	if (id === "sweepR" || play.name === "Sweep") return "sweep";
	if (id.startsWith("river") || play.name === "River") return "river";
	if (id.startsWith("dive") || play.name === "Zig Zag") return "zigzag";
	if (id.startsWith("wedge") || play.name === "Wedge" || String(play.blockStyle || "").startsWith("wedge")) return "wedge";
	return "";
}
function cellFacing(play, oFlip, dFlip) {
	const key = playBookKey(play);
	if (key === "river" || key === "wedge") return dFlip ? "flipped" : "stock";
	return oFlip ? "flipped" : "stock";
}

const CAMERAS = {
	iso: {
		id: "iso",
		name: "Angled 2D",
		skew: .072,
		yScale: .72,
		yBias: .12,
		xLean: .08,
		follow: 6,
		zoom: 1,
		sc: 1.05
	},
	top: {
		id: "top",
		name: "Overhead",
		skew: 0,
		yScale: 1,
		yBias: 0,
		xLean: 0,
		follow: 6,
		zoom: 1,
		sc: 1
	},
	topZoom: {
		id: "topZoom",
		name: "Overhead Zoom",
		skew: 0,
		yScale: 1,
		yBias: 0,
		xLean: 0,
		follow: 4.2,
		zoom: 1.52,
		sc: 1.18
	},
	high: {
		id: "high",
		name: "High Angle",
		skew: .16,
		yScale: .58,
		yBias: .2,
		xLean: .16,
		follow: 8,
		zoom: .94,
		sc: 1.02
	},
	zoom: {
		id: "zoom",
		name: "Zoom",
		skew: .05,
		yScale: .78,
		yBias: .08,
		xLean: .05,
		follow: 3.5,
		zoom: 1.48,
		sc: 1.22
	},
	wide: {
		id: "wide",
		name: "Wide",
		skew: .11,
		yScale: .55,
		yBias: .18,
		xLean: .1,
		follow: 11,
		zoom: .66,
		sc: .82
	}
};
const SPRINT_MULT = 1.38;
const SPRINT_GRACE = 3;
const STORAGE_KEY = "fga_lab_top5_v5";
const DPAD_DIAG_WIN = .04;
function clamp(v, lo, hi) {
	return Math.max(lo, Math.min(hi, v));
}
function dist(a, b) {
	return Math.hypot(a.x - b.x, a.y - b.y);
}
function randChoice(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function hashSeed(str) {
	let h = 2166136261 >>> 0;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function mulberry32(a) {
	return function () {
		a |= 0;
		a = a + 0x6D2B79F5 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function shuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
function hash2(ix, iy) {
	let n = Math.imul(ix | 0, 374761393) + Math.imul(iy | 0, 668265263) | 0;
	n = Math.imul(n ^ n >>> 13, 1274126177);
	return ((n ^ n >>> 16) >>> 0) / 4294967296;
}
function $(id) {
	return document.getElementById(id);
}
function startGame(canvas) {
	const maybeCtx = canvas.getContext("2d");
	if (!maybeCtx) return () => {};
	const ctx = maybeCtx;
	let FIELD_WIDTH = 50;
	let surface = "grass";
	let ezArtMode = "mountains";
	let ezTextMode = "ee";
	let ezCustomText = "ELEVATION EDGE";
	let midLogoOn = true;
	const BASE_CANVAS_H = 620;
	const PX_PER_YARD_X = BASE_CANVAS_H / 100;
	const VISIBLE_YARDS = 54;
	let SCALE_X = PX_PER_YARD_X;
	let SCALE_Y = BASE_CANVAS_H / VISIBLE_YARDS;
	function refreshScale() {
		FIELD_WIDTH = Math.max(5, Math.min(100, FIELD_WIDTH));
		const wrap = canvas.parentElement;
		const cssW = Math.max(520, wrap && wrap.clientWidth || 900);
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.style.width = "100%";
		canvas.style.height = "auto";
		canvas.width = Math.round(cssW * dpr);
		canvas.height = Math.round(BASE_CANVAS_H * dpr);
		SCALE_X = canvas.width / FIELD_WIDTH;
		SCALE_Y = canvas.height / VISIBLE_YARDS;
	}
	function fieldLeft() {
		return 0;
	}
	function fieldRight() {
		return FIELD_WIDTH;
	}
	let cameraY = 55;
	let clock = 120;
	let gameSeconds = 120;
	let score = 0;
	let totalYards = 0;
	let tdCount = 0;
	let playActive = true;
	let paused = false;
	let pauseTimer = 0;
	let lastTime = performance.now();
	let padName = "";
	let sessionOver = false;
	let gamesPlayed = 0;
	let numOL = 5;
	let numFB = 1;
	let numTE = 3;
	let numQB = 1;
	let numDT = 3;
	let numLBs = 2;
	let numDBs = 6;
	let playSpeed = 1.0;
	let offStrength = 1.0;
	let defStrength = 1.0;
	let breakBlock = 1.0;   // defense ability to shed blocks (>1 sheds more)
	let breakTackle = 1.0;  // RB ability to break tackles (>1 more YAC / fewer wraps)
	let fumblesOn = false;
	let userStartYard = 50; // game-mode opening LOS (50)
	let practiceStartYard = 70; // practice LOS (OPP 30), fully adjustable
	let postTdMode = "random";
	let tdIncrement = 5;
	let startSide = "own"; // own triangle down, opp triangle up
	let randMin = 20;
	let randMax = 80;
	let ballYard = 50;
	let playStartYard = 50;
	let driveStartYard = 40;
	let ballX = 25;
	let sprintCharge = 1;
	let sprintHoldT = 0;
	let sprintExhausted = false;
	let fatigueOn = true;
	let camZoom = 1;
	let breakaway = false;
	let tdZoom = false;
	let cameraMode = "top";
	let camCorner = Math.random() < .5 ? "sw" : "nw";
	let playArtMode = "on";
	let padProfile = "v6";
	const PROFILE_LABELS = {
		basic: "Basic (v1)",
		classic: "Expanded (v2)",
		v3: "Wings (v3)",
		v4: "Independent (v4)",
		v6: "Classic (v6)"
	};
	function profileLabel(id) {
		return PROFILE_LABELS[id] || id;
	}
	let gameMode = "practice"; // "game" | "practice"
	let nextPlayOnSnap = true; // practice default: wait for A
	let practiceOffPlayId = null;
	let practiceDefSchemeId = null;
	let practiceOffPlayIdPrev = null;
	let practiceDefSchemeIdPrev = null;
	let practiceYCancelEdge = false;
	let practiceAwaitSnap = false;
	let practiceFlipped = false;
	let practiceFlipEdge = false;
	let practiceDefFlipped = false;
	let practiceDefFlipEdge = false;
	let showRunnerTrail = true;
	let speedTrail = false; // thickness-by-speed removed
	let runnerTrail = []; // [{x,y,spd}, ...]
	let _trailAcc = 0;
	let practiceAudibleArm = false;
	let practiceAudibleEdge = false;
	let practiceDefAudibleArm = false;
	let practiceDefAudibleEdge = false;
	let practiceFocusSide = "off"; // "off" | "def" — focused playbook
	let practiceBookLatch = false;
	let practiceNumLatch = false;
	let practiceStickNavT = 0;
	let practiceStickLatch = 0;
	let practiceDefStickLatch = 0;
	let lastRsY = 0;
	let allowSameUniform = false; // always enforce different kits
	let swapStickDpad = false;
	let replayMode = "pip";
	let playAge = 0;
	let idleCarrierT = 0;
	let ankleCam = null;
	let peekHeld = false;
	let peekToggle = false;
	let revealDefThisPlay = false;
	let fullReplay = null;
	let pipReplay = null;
	let replayBuf = [];
	let replayAcc = 0;
	let playFrames = [];
	let lastPlayFrames = [];
	const REPLAY_HZ = 20;
	const REPLAY_CAP = 1200;
	const SAVED_CLIPS_KEY = "fga_saved_clips_v1";
	const SAVED_CLIPS_MAX = 10;
	let ctrlLeft = null;
	let ctrlRight = null;
	let latchCtrlL = null;
	let latchCtrlR = null;
	let playArtAnchor = {
		x: 25,
		y: 80
	};
	let divePauseEdge = false;
	let getUpT = 0;
	let autoRun = false;
	let rb = null;
	let qb = null;
	let blockers = [];
	let defenders = [];
	let offUni = 0;
	let defUni = 4;
	const assignedNums = {
		QB: [],
		TE: [],
		DT: [],
		FB: [],
		HB: [],
		OL: [],
		LB: [],
		DB: []
	};
	let currentPlay = null;
	let currentScheme = DEF_SCHEMES[0];
	let preSnapTimer = 0;
	let handoffDone = true;
	let handoffT = 0;
	let handoffPhase = "done"; // pre | toss | done
	let handoffBall = null; // {x,y} mid-air during pitch
	let celebrateTimer = 0;
	let logoFlip = 1;
	let fieldArtSide = "def";
	let moveCooldown = 0;
	let activeMove = null;
	let moveTimer = 0;
	let moveDur = 0;
	let autoStartTimer = null;
	let scriptSteps = [];
	let scriptIndex = 0;
	let scriptTimer = 0;
	let scriptLocked = false;
	let tackleAnim = null;
	let fumbleSeq = null;
	let scoreSeq = null;
	let hurdleTarget = null;
	let hurdleOk = false;
	let hurdleDidTrip = false;
	let lastSteer = {
		dx: 0,
		dy: 1
	};
	let dive = null;
	let pauseEdge = false;
	let spinPauseEdge = false;
	let confirmEdge = false;
	let celebrateEdge = false;
	let celebFumbleLock = false;
	let prevA = false;
	let prevStart = false;
	const keys = /* @__PURE__ */ new Set();
	const touch = {
		active: false,
		ox: 0,
		oy: 0,
		dx: 0,
		dy: 0,
		burst: false
	};
	let dpadLatch = false;
	let dpadPending = null;
	let dpadPendingT = 0;
	let dpadMove = null;
	function sideYardToAbsolute(side, yd50) {
		const y = clamp(Math.round(yd50), 1, 50);
		if (side === "opp") return clamp(100 - y, 1, 99);
		return clamp(y, 1, 99);
	}
	function absoluteToSideYard(abs) {
		const a = clamp(Math.round(abs), 1, 99);
		if (a >= 50) return { side: "opp", yd: clamp(100 - a, 1, 50) };
		return { side: "own", yd: clamp(a, 1, 50) };
	}
	function userToAbsolute(userYd) {
		// legacy: treat raw number as absolute field yard
		return clamp(userYd, 1, 99);
	}
	function absoluteToUser(abs) {
		return clamp(Math.round(abs), 1, 99);
	}
	function refreshStartTri() {
		const tri = $("startSideTri");
		if (!tri) return;
		const yd = parseInt($("startYard50")?.value, 10);
		if (yd === 50) {
			tri.textContent = "◆";
			tri.className = "los-tri mid";
			tri.title = "50";
			return;
		}
		if (startSide === "opp") {
			tri.textContent = "▲";
			tri.className = "los-tri opp";
			tri.title = "OPP";
		} else {
			tri.textContent = "▼";
			tri.className = "los-tri own";
			tri.title = "OWN";
		}
	}
	function syncStartYardFromUI() {
		const ydEl = $("startYard50");
		const hidden = $("startYardInput");
		const sideEl = $("startSideSelect");
		const yd = ydEl ? parseInt(ydEl.value, 10) || 50 : 50;
		if (yd === 50) startSide = "own"; // 50 is midfield either way
		userStartYard = sideYardToAbsolute(startSide, yd);
		if (hidden) hidden.value = String(userStartYard);
		if (sideEl) sideEl.value = startSide;
		refreshStartTri();
		return userStartYard;
	}
	function nudgeStartYard(dir) {
		const el = $("startYard50");
		if (!el) return;
		let yd = clamp((parseInt(el.value, 10) || 50) + dir, 1, 50);
		el.value = String(yd);
		syncStartYardFromUI();
	}
	function syncPracticeYardFromUI() {
		const sideEl = $("practiceSideSelect");
		const ydEl = $("practiceYard50");
		const side = sideEl ? sideEl.value : "opp";
		const yd = ydEl ? parseInt(ydEl.value, 10) || 30 : 30;
		practiceStartYard = sideYardToAbsolute(side, yd);
		return practiceStartYard;
	}
	function applyPracticeLosNow() {
		if (gameMode !== "practice") return;
		const fixed = clamp(syncPracticeYardFromUI(), 1, 99);
		practiceStartYard = fixed;
		ballYard = fixed;
		playStartYard = fixed;
		driveStartYard = fixed;
		ballX = (hashLeft() + hashRight()) / 2;
		practiceAwaitSnap = true;
		playActive = false;
		try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
		updateBallOn();
		if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
		setPlayCall((currentPlay ? currentPlay.name : "Practice") + " @ " + yardLabel(fixed) + " — press A to snap");
	}
	function updateConfigPanelForMode() {
		const title = $("configPanelTitle");
		const gameBody = $("gameConfigBody");
		const pracBody = $("practiceConfigBody");
		const isPrac = gameMode === "practice";
		if (title) title.innerHTML = (isPrac ? "Practice Config" : "Game Config") + ' <span aria-hidden>▾</span>';
		if (gameBody) gameBody.classList.toggle("hidden", isPrac);
		if (pracBody) pracBody.classList.toggle("hidden", !isPrac);
	}
	function yardLabel(y) {
		if (y >= 100) return "TD";
		if (y <= 0) return "OWN G";
		if (Math.abs(y - 50) < 0.5) return "50";
		if (y > 50) return "OPP " + Math.round(100 - y);
		return "OWN " + Math.round(y);
	}
	function formatClock(t) {
		if (t <= 0) return "0:00";
		if (t >= 60) {
			const m = Math.floor(t / 60);
			const s = Math.floor(t % 60);
			return m + ":" + String(s).padStart(2, "0");
		}
		return t.toFixed(1);
	}
	function setPlayCall(name) {
		const pc = $("playCallName");
		if (!pc) return;
		pc.textContent = name;
		pc.classList.remove("play-call-flash");
		pc.offsetWidth;
		pc.classList.add("play-call-flash");
	}
	function pauseBannerHTML(kind) {
		const banner = $("pauseBanner");
		if (!banner) return;
		const inner = banner.querySelector("div");
		if (!inner) return;
		if (kind === "replay") inner.innerHTML = "Instant replay<br /><span style=\"font-size:1rem;font-weight:500\">Press A or Replay to skip</span>";
		else inner.innerHTML = "Game paused.<br /><span style=\"font-size:1rem;font-weight:500\">Press A to resume. Press B to restart.<br />Press X for Instant Replay</span>";
	}
	function setPaused(on) {
		paused = on;
		const pb = $("pauseBtn");
		if (pb) pb.textContent = paused ? "Resume" : "Pause";
		const banner = $("pauseBanner");
		if (banner) banner.classList.toggle("hidden", !paused);
		if (paused && !fullReplay) pauseBannerHTML("pause");
		if (paused) canvas.focus();
	}
	function updateBallOn() {
		const el = $("ballOn");
		if (el) el.textContent = yardLabel(ballYard);
	}
	function camSpec() {
		const base = CAMERAS[cameraMode] || CAMERAS.iso;
		if (cameraMode === "top" || cameraMode === "topZoom" || camCorner !== "sw") return base;
		return {
			...base,
			skew: -base.skew,
			xLean: -base.xLean
		};
	}
	function toScreenYRaw(absY) {
		return (cameraY - absY) * SCALE_Y + canvas.height * .55;
	}
	function project(absX, absY) {
		const cam = camSpec();
		const x = absX;
		const y = absY;
		if (cameraMode === "top" || cameraMode === "topZoom") return {
			sx: x * SCALE_X,
			sy: toScreenYRaw(y),
			sc: cam.sc
		};
		const depth = cameraY - y;
		return {
			sx: x * SCALE_X + depth * cam.skew * SCALE_X,
			sy: toScreenYRaw(y) * cam.yScale + canvas.height * cam.yBias + (x - FIELD_WIDTH / 2) * cam.xLean,
			sc: cam.sc
		};
	}
	function toScreenY(absY, absX) {
		return project(absX == null ? FIELD_WIDTH / 2 : absX, absY).sy;
	}
	function updateCamera() {
		let fy = rb ? rb.y : null;
		let fx = rb ? rb.x : FIELD_WIDTH / 2;
		if (fumbleSeq) {
			fy = fumbleSeq.ballY;
			fx = fumbleSeq.ballX;
		}
		if (scoreSeq) {
			fy = scoreSeq.player.y;
			fx = scoreSeq.player.x;
		}
		if (ankleCam && ankleCam.t > 0 && ankleCam.runner && ankleCam.defender) {
			fx = ankleCam.runner.x * .72 + ankleCam.defender.x * .28;
			fy = ankleCam.runner.y * .72 + ankleCam.defender.y * .28;
		}
		if (fy == null) return;
		const cam = camSpec();
		const targetY = fy + (cam.follow || 6);
		const snapCam = fumbleSeq && fumbleSeq.phase === "return" ? .72 : (scoreSeq ? .35 : .18);
		// Allow camera into the endzone during celebrations / near goal line
		const yMax = scoreSeq || (rb && rb.y > 92) ? 102 : 88;
		cameraY += (clamp(targetY, 8, yMax) - cameraY) * snapCam;
		// Milder TD zoom; almost none on overhead so zones stay readable
		let zBoost = 1;
		if (ankleCam && ankleCam.t > 0) zBoost = 1.32;
		else if (breakaway) zBoost = 1.28;
		else if (scoreSeq || tdZoom) zBoost = (cameraMode === "top" || cameraMode === "topZoom") ? 1.06 : 1.18;
		const want = (cam.zoom || 1) * zBoost;
		camZoom += (want - camZoom) * .1;
		if (ankleCam) {
			ankleCam.t -= 1 / 60;
			if (ankleCam.t <= 0) ankleCam = null;
		}
	}
	function offMult() {
		return offStrength;
	}
	function defMult() {
		return defStrength;
	}
	function getUni(side) {
		const id = side === "off" ? offUni : defUni;
		return UNIFORMS.find((u) => u.id === id) || UNIFORMS[0];
	}
	function paintRoster() {
		function paint(p, side) {
			if (!p) return;
			const uni = getUni(side);
			p.color = uni.jersey;
			p.helmet = uni.helmet;
		p.facemask = uni.facemask || uni.number || "#c5c8cc";
			p.pants = uni.pants;
			p.numColor = uni.number;
		}
		paint(rb, "off");
		paint(qb, "off");
		blockers.forEach((b) => paint(b, "off"));
		defenders.forEach((d) => paint(d, "def"));
	}
	function hashHalf() {
		// NFL hashes are 18'6" apart (~6.17 yd). Keep a true split even on a 50-yd-wide field.
		return Math.min(3.1, FIELD_WIDTH * 0.12);
	}
	function hashLeft() {
		return (fieldLeft() + fieldRight()) / 2 - hashHalf();
	}
	function hashRight() {
		return (fieldLeft() + fieldRight()) / 2 + hashHalf();
	}
	function capCoverageY(y) {
		return Math.min(108.5, y);
	}
	function clampToHash(x) {
		return clamp(x, hashLeft(), hashRight());
	}
	function setSpotFromPlay(x, oob) {
		if (oob) ballX = x < (fieldLeft() + fieldRight()) / 2 ? hashLeft() : hashRight();
		else ballX = clampToHash(x);
	}
	function snapX() {
		return clampToHash(ballX);
	}
	function redrawNumbersForGroup(group, count) {
		const pool = shuffle([...NUM_POOLS[group] || []]);
		assignedNums[group] = pool.slice(0, count);
	}
	function refreshAllNumbers() {
		redrawNumbersForGroup("QB", Math.max(1, numQB));
		redrawNumbersForGroup("HB", 1);
		redrawNumbersForGroup("FB", numFB);
		redrawNumbersForGroup("TE", numTE);
		redrawNumbersForGroup("OL", numOL);
		redrawNumbersForGroup("DT", numDT);
		redrawNumbersForGroup("LB", numLBs);
		redrawNumbersForGroup("DB", numDBs);
	}
	function adjustNumbersForGroup(group, count) {
		const pool = [...NUM_POOLS[group] || []];
		const keep = (assignedNums[group] || []).filter((n) => pool.includes(n));
		const used = new Set(keep);
		const result = [...keep];
		const available = shuffle(pool.filter((n) => !used.has(n)));
		while (result.length < count && available.length) result.push(available.pop());
		while (result.length > count) result.splice(Math.floor(Math.random() * result.length), 1);
		assignedNums[group] = result;
	}
	function createPlayer(x, y, group, numIdx, side) {
		const uni = getUni(side);
		const nums = assignedNums[group] || [];
		return {
			x,
			y,
			vx: 0,
			vy: 0,
			radius: group === "OL" || group === "DT" ? .95 : group === "FB" || group === "TE" ? .9 : .85,
			mass: group === "DT" || group === "OL" ? 1.35 : group === "LB" || group === "FB" || group === "TE" ? 1.05 : 0.78,
			speed: group === "OL" ? 8.15 : group === "FB" ? 8.35 : group === "TE" ? 8.55 : group === "DT" ? 7.45 : group === "QB" ? 7.2 : 9,
			baseSpeed: 0,
			color: uni.jersey,
			helmet: uni.helmet,
			facemask: uni.facemask || uni.number || "#c5c8cc",
			pants: uni.pants,
			numColor: uni.number,
			number: nums[numIdx] !== void 0 ? nums[numIdx] : 0,
			group,
			side,
			active: true,
			facing: side === "off" ? Math.PI / 2 : -Math.PI / 2,
			hasBall: false,
			slowed: 0,
			routePhase: 0,
			sprintOn: false,
			sprintT: Math.random() * 2.4,
			state: "pursue",
			whiffT: 0,
			recoverT: 0,
			engageT: 0,
			_pushYards: 0,
			blitzDelay: 0,
			driveBlock: false,
			sturdyBlock: false,
			_jitter: (Math.random() - .5) * .8,
			low: false,
			hop: 0,
			spinT: 0,
			job: "pursue",
			jobX: x,
			jobY: y,
			readT: 0,
			misfireT: 0,
			misfireIdx: -1,
			manIdx: -1,
			aggressor: false,
			reactT: 0,
			isCorner: false,
			isSafety: false,
			fakeBlitz: false,
			lagT: 0,
			pancaked: false,
			dtPenetrate: false,
			atkKind: null,
			atkT: 0,
			atkDX: 0,
			atkDY: 0,
			atkDecideT: 0,
			laneOffset: 0,
			stutter: false,
			stutterX: x,
			stutterY: y,
			artCurve: false,
			zoneRx: 3.5,
			zoneRy: 2.2,
			_userCtrl: 0,
			blockTarget: null,
			blockMode: "man",
			pullPhase: 0,
			pullVia: null,
			driveSide: 1,
			sealSide: 1,
			levelY: 3
		};
	}
	function mirrorPlay(play) {
		if (!play) return play;
		const flipId = (id) => {
			if (id.endsWith("L")) return id.slice(0, -1) + "R";
			if (id.endsWith("R")) return id.slice(0, -1) + "L";
			return id;
		};
		const flipName = (n) => n.replace(/Left/g, "§R§").replace(/Right/g, "Left").replace(/§R§/g, "Right");
		return {
			...play,
			id: flipId(play.id),
			name: flipName(play.name),
			arrow: (play.arrow || []).map((a) => -a),
			blockStyle: ({ wallL: "wallR", wallR: "wallL", pullL: "pullR", pullR: "pullL", zoneL: "zoneR", zoneR: "zoneL", swingL: "swingR", swingR: "swingL", river: "river", wedgeL: "wedgeR", wedgeR: "wedgeL", zigzag: "zigzag" })[play.blockStyle] || play.blockStyle,
			steps: (play.steps || []).map((s) => ({ ...s, dx: -s.dx })),
			altSteps: (play.altSteps || []).map((s) => ({ ...s, dx: -s.dx })),
			baseId: play.baseId || play.id
		};
	}
	function applyKeeperRoutes(play) {
		if (!play) return play;
		play.baseId = play.baseId || play.id;
		play.altSteps = null;
		const key = playBookKey(play);
		const schemeId = (currentScheme && currentScheme.id) || practiceDefSchemeId || "";
		const facing = cellFacing(play, practiceFlipped, practiceDefFlipped);
		const cell = ROUTE_BOOK[key] && ROUTE_BOOK[key][schemeId] && ROUTE_BOOK[key][schemeId][facing];
		if (!cell || !cell.primary) return play;
		const prim = ROUTE_TEMPLATES[cell.primary];
		if (!prim) return play;
		play.steps = cloneSteps(prim);
		play.arrow = stepsToArrow(prim);
		if (cell.secondary && ROUTE_TEMPLATES[cell.secondary]) {
			play.altSteps = cloneSteps(ROUTE_TEMPLATES[cell.secondary]);
		}
		return play;
	}
	function choosePlay() {
		let pool = OFF_PLAYS;
		if (gameMode === "practice" && practiceOffPlayId) {
			const found = OFF_PLAYS.find((p) => p.id === practiceOffPlayId) || pool[0];
			currentPlay = practiceFlipped ? mirrorPlay(found) : { ...found, steps: (found.steps || []).map((st) => ({ ...st })), baseId: found.id };
		} else {
			currentPlay = randChoice(pool);
			currentPlay = { ...currentPlay, steps: (currentPlay.steps || []).map((st) => ({ ...st })), baseId: currentPlay.id };
		}
		applyKeeperRoutes(currentPlay);
		preSnapTimer = 0;
		scriptSteps = (currentPlay.steps || []).map((st) => ({ ...st }));
		scriptIndex = 0;
		scriptTimer = 0;
		scriptLocked = !!currentPlay.lockFirst;
		const defName = currentScheme && currentScheme.name ? currentScheme.name : "";
		setPlayCall(currentPlay.name + (revealDefThisPlay && defName ? " · vs " + defName : ""));
		if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
	}
	function chooseScheme() {
		if (gameMode === "practice" && practiceDefSchemeId) {
			currentScheme = DEF_SCHEMES.find((s) => s.id === practiceDefSchemeId) || DEF_SCHEMES[0];
			return;
		}
		const pool = DEF_SCHEMES.slice();
		const weights = pool.map((s) => s.id === "prevent" || s.id === "cover4Quarters" ? 2 : 1);
		let total = weights.reduce((a, b) => a + b, 0);
		let r = Math.random() * total;
		let acc = 0;
		currentScheme = pool[pool.length - 1];
		for (let i = 0; i < pool.length; i++) {
			acc += weights[i];
			if (r <= acc) {
				currentScheme = pool[i];
				break;
			}
		}
	}
	function placeEntitiesForNewPlay() {
		if (gameMode === "practice") {
			const fixed = clamp(syncPracticeYardFromUI(), 1, 99);
			practiceStartYard = fixed;
			ballYard = fixed;
			playStartYard = fixed;
			driveStartYard = fixed;
		}
		revealDefThisPlay = true;
		chooseScheme();
		choosePlay();
		if (currentPlay) {
			const defName = currentScheme && currentScheme.name ? currentScheme.name : "";
			setPlayCall(currentPlay.name + (revealDefThisPlay && defName ? " · vs " + defName : ""));
		}
		tackleAnim = null;
		fumbleSeq = null;
		scoreSeq = null;
		hurdleTarget = null;
		hurdleOk = false;
		hurdleDidTrip = false;
		dive = null;
		getUpT = 0;
		celebrateTimer = 0;
		sprintCharge = 1;
		sprintHoldT = 0;
		sprintExhausted = false;
		celebFumbleLock = false;
		tdZoom = false;
		const snap = snapX();
		const behind = playStartYard - 5;
		rb = createPlayer(snap + (Math.random() - .5) * 1.4, behind, "HB", 0, "off");
		rb.speed = 9;
		rb.hasBall = false;
		qb = null;
		handoffDone = false;
		handoffT = 0;
		handoffPhase = "pre"; // pre | toss | done
		if (qb) { qb.hasBall = true; rb.hasBall = false; }
		else if (rb) { rb.hasBall = true; handoffDone = true; handoffPhase = "done"; }
		runnerTrail = [];
		_trailAcc = 0;
		blockers = [];
		for (let i = 0; i < numOL; i++) {
			const b = createPlayer(snap + (i - (numOL - 1) / 2) * 2.6, playStartYard + 1.7, "OL", i, "off");
			b.speed = 8.8;
			blockers.push(b);
		}
		for (let i = 0; i < numTE; i++) {
			const side = i % 2 === 0 ? -1 : 1;
			const rank = Math.floor(i / 2);
			const olSpan = Math.max(1, numOL) * 1.35;
			const b = createPlayer(snap + side * (olSpan + 1.7 + rank * 1.55), playStartYard + 1.55, "TE", i, "off");
			b.speed = 8.7;
			blockers.push(b);
		}
		// QB under center (or slightly offset); FB always deeper behind QB
		if (numQB > 0) {
			qb = createPlayer(snap - .35, playStartYard - .35, "QB", 0, "off");
			qb.speed = 7.35;
			blockers.push(qb);
		}
		for (let i = 0; i < numFB; i++) {
			const qbY = qb ? qb.y : playStartYard - 0.35;
			// Stack behind QB (toward own endzone = lower yard)
			const fbY = qbY - 1.85 - i * 0.55;
			const b = createPlayer(snap + (i - (numFB - 1) / 2) * 1.4, fbY, "FB", i, "off");
			b.speed = 8.95;
			blockers.push(b);
		}
		defenders = [];
		const sch = currentScheme;
		const mid = snap + ((fieldLeft() + fieldRight()) / 2 - snap) * .38;
		const flDb = fieldLeft();
		const frDb = fieldRight();
		function clusterX(i, n, mode) {
			if (n <= 1) return mid;
			const t = i / (n - 1);
			if (mode === "middle") return mid + (t - .5) * FIELD_WIDTH * .5;
			if (mode === "wide") return mid + (t - .5) * FIELD_WIDTH * .78;
			if (mode === "left") return mid - FIELD_WIDTH * .28 + t * FIELD_WIDTH * .42;
			if (mode === "right") return mid - FIELD_WIDTH * .14 + t * FIELD_WIDTH * .42;
			return mid + (t - .5) * FIELD_WIDTH * .64;
		}
		const EZ_BACK = 108.5; // keep bodies inside the endzone (back line is 110)
		function clampDefAlignY(y) {
			return clamp(y, playStartYard + 1.15, EZ_BACK);
		}
		const room = Math.max(4.2, EZ_BACK - playStartYard);
		const depthScale = Math.min(1, room / 16);
		for (let i = 0; i < numDT; i++) {
			const t = numDT <= 1 ? .5 : i / (numDT - 1);
			// Deeper alignment so DTs sit clearly on the defensive side of the OL (was ~+2.05)
			const x = snap + (t - .5) * Math.min(FIELD_WIDTH * .32, 2.8 * numDT);
			const d = createPlayer(x + (Math.random() - .5) * .4, clampDefAlignY(playStartYard + Math.min(3.25, room * 0.22) + (Math.random() - .5) * .3), "DT", i, "def");
			d.baseSpeed = 7.7;
			d.speed = d.baseSpeed;
			d.dtLag = true;
			defenders.push(d);
		}
		for (let i = 0; i < numLBs; i++) {
			const d = createPlayer(clusterX(i, numLBs, sch.cluster) + (Math.random() - .5) * 1.3, clampDefAlignY(playStartYard + Math.min(sch.depthLB * depthScale, room * 0.42) + (Math.random() - .5) * .4), "LB", i, "def");
			d.baseSpeed = 8.55;
			d.speed = d.baseSpeed;
			defenders.push(d);
		}
		{
			const Wdb = Math.max(8, frDb - flDb);
			const cbInset = Math.min(Wdb * 0.22, 9.5);
			const slots = [];
			const cbL = { x: flDb + cbInset, y: playStartYard + 2.35, role: "CB", corner: true, safety: false };
			const cbR = { x: frDb - cbInset, y: playStartYard + 2.35, role: "CB", corner: true, safety: false };
			const fs = { x: mid + (snap - mid) * 0.12, y: playStartYard + Math.min(sch.depthDB * depthScale, 13.2), role: "FS", corner: false, safety: true };
			const ss = { x: snap + (snap >= mid ? 1 : -1) * Math.min(Wdb * 0.12, 5.2), y: playStartYard + 8.4, role: "SS", corner: false, safety: true };
			const nick = { x: snap - playSideSign() * Math.min(Wdb * 0.1, 4.2), y: playStartYard + 4.1, role: "NCB", corner: false, safety: false };
			const dime = { x: snap + playSideSign() * Math.min(Wdb * 0.08, 3.4), y: playStartYard + 6.4, role: "DIME", corner: false, safety: true };
			if (numDBs <= 1) slots.push(fs);
			else if (numDBs === 2) slots.push(cbL, cbR);
			else if (numDBs === 3) slots.push(cbL, cbR, fs);
			else if (numDBs === 4) slots.push(cbL, cbR, ss, fs);
			else if (numDBs === 5) slots.push(cbL, nick, cbR, ss, fs);
			else {
				slots.push(cbL, nick, dime, cbR, ss, fs);
				for (let extra = 6; extra < numDBs; extra++) {
					const t = (extra - 5) / Math.max(1, numDBs - 5);
					slots.push({ x: mid + (t - 0.5) * Wdb * 0.28, y: playStartYard + 7.2 + extra * 0.4, role: "DB", corner: false, safety: false });
				}
			}
			for (let i = 0; i < numDBs; i++) {
				const slot = slots[i] || fs;
				const d = createPlayer(slot.x + (Math.random() - .5) * 0.45, clampDefAlignY(slot.y + (Math.random() - .5) * 0.25), "DB", i, "def");
				d.baseSpeed = 9.15;
				d.speed = d.baseSpeed;
				d.dbRole = slot.role;
				d.isCorner = !!slot.corner;
				d.isSafety = !!slot.safety;
				defenders.push(d);
			}
		}
		defenders.forEach((d) => {
			d._pushYards = 0;
			d.pancaked = false;
			d.atkKind = null;
			d.atkT = 0;
			d.atkDecideT = 0;
		});
		assignDefenseJobs();
		defenders.forEach((d) => {
			d.y = clampDefAlignY(d.y);
			if (d.jobY != null) d.jobY = Math.min(d.jobY, EZ_BACK);
			if (d.stutterY != null) d.stutterY = Math.min(d.stutterY, EZ_BACK);
			// Near the goal line, coverage landmarks used to pin at y=99 while bodies
			// aligned in the EZ — on snap they teleported back to the goal line.
			if (d.jobY != null && d.job !== "blitz" && d.job !== "man" && d.jobY < d.y - 0.45) {
				d.jobY = d.y;
			}
			if (playStartYard >= 82 && (d.job === "deep" || d.job === "robber" || d.isSafety)) {
				d.zoneRy = Math.min(d.zoneRy || 3.4, Math.max(1.4, EZ_BACK - d.y));
			}
		});
		if (practiceDefFlipped) mirrorDefenseHorizontal();
		applyCellDefenseTweaks();
		limitDtPenetration();
		assignBlockJobs();
		applyCellBlockTweaks();
		blockers.forEach((b) => {
			b.sealSide = b.driveSide || playSideSign() || 1;
		});
		applyPresnapLook();
		playAge = 0;
		idleCarrierT = 0;
		replayBuf.length;
		playFrames = [];
		playArtAnchor = {
			x: rb.x,
			y: rb.y
		};
		peekToggle = false;
		ctrlLeft = null;
		ctrlRight = null;
		updateCamera();
		if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
	}
	function limitDtPenetration() {
		// P0b: at most one DT may slant across the LOS. Everyone else 2-gaps
		// on their side of the ball so they cannot appear untouched in the backfield.
		const dts = defenders.filter((d) => d.group === "DT");
		if (!dts.length) return;
		const schemeId = (currentScheme && currentScheme.id) || "";
		const allowPen = schemeId === "overloadBlitz" || schemeId === "wide" || schemeId === "tight" || schemeId === "goalLine" || schemeId === "stormBlitz";
		const side = playSideSign();
		const snap = snapX();
		const already = dts.filter((d) => d.job === "blitz" && d.jobY != null && d.jobY < playStartYard + 0.45);
		let chosen = null;
		if (allowPen) {
			const pool = already.length ? already : dts.slice();
			pool.sort((a, b) => {
				const playRank = side ? side * (b.x - a.x) : (Math.abs(a.x - snap) - Math.abs(b.x - snap));
				return playRank;
			});
			chosen = pool[0] || null;
		}
		dts.forEach((d) => {
			d.dtPenetrate = d === chosen;
			d.dtLag = true;
			if (d.dtPenetrate) {
				d.job = "blitz";
				d.aggressor = true;
				d.jobX = d.jobX != null ? d.jobX : d.x;
				d.jobY = clamp(d.jobY != null ? d.jobY : playStartYard - 0.35, playStartYard - 0.85, playStartYard - 0.12);
				d.zoneRx = 1.2;
				d.zoneRy = 1.2;
				d.zoneFollow = false;
				if (d.stutterY != null) d.stutterY = Math.max(d.stutterY, playStartYard + 0.6);
			} else {
				d.job = "shade";
				d.aggressor = false;
				d.artCurve = false;
				d.stutter = false;
				d.fakeBlitz = false;
				d.jobX = d.x;
				d.jobY = playStartYard + 1.65 + (Math.abs(d.x - snap) < 1.2 ? 0.25 : 0);
				d.zoneRx = 1.6;
				d.zoneRy = 1.15;
				d.zoneFollow = false;
				d.y = Math.max(d.y, playStartYard + 2.15);
			}
		});
	}
	function playSideSign() {
		const id = currentPlay ? currentPlay.id : "";
		const st = currentPlay ? currentPlay.blockStyle : "";
		if (id.endsWith("L") || st === "wallL" || st === "pullL" || st === "zoneL" || st === "wedgeL" || st === "swingL") return -1;
		if (id.endsWith("R") || st === "wallR" || st === "pullR" || st === "zoneR" || st === "wedgeR" || st === "swingR") return 1;
		return 1;
	}
	function cellPlayKey() { return playBookKey(currentPlay); }
	function cellSchemeId() { return (currentScheme && currentScheme.id) || practiceDefSchemeId || ""; }
	function isStockFacing() { return cellFacing(currentPlay, practiceFlipped, practiceDefFlipped) === "stock"; }
	function isFlippedFacing() { return cellFacing(currentPlay, practiceFlipped, practiceDefFlipped) === "flipped"; }
	function applyCellBlockTweaks() {
		const key = cellPlayKey();
		const sch = cellSchemeId();
		const snap = snapX();
		const fbs = blockers.filter((b) => b.group === "FB");
		const defs = [...defenders].sort((a, b) => a.x - b.x);
		function leadFb(sideSign) {
			fbs.forEach((b, i) => {
				b.blockMode = "climb";
				b.driveSide = sideSign;
				b.driveBlock = true;
				const pack = sideSign < 0 ? defs.slice(0, 3) : defs.slice(-3);
				b.blockTarget = pack[Math.min(i, Math.max(0, pack.length - 1))] || pack[0] || null;
				b.gapAimX = snap + sideSign * (8.2 + i * 1.1);
				b.gapAimY = playStartYard + 5.4 + i * 0.5;
				b.levelY = 5.5 + i * 0.4;
			});
		}
		function retargetLeftmost(n) {
			const left = defs.slice(0, n);
			const pullers = blockers.filter((b) => b.blockMode === "pull" || b.blockMode === "climb");
			pullers.forEach((b, i) => {
				if (left[i]) b.blockTarget = left[i];
				b.driveSide = -1;
				b.gapAimX = (left[i] ? left[i].x : snap - 8) - 0.4;
				b.gapAimY = playStartYard + 4.8 + i * 0.4;
			});
			if (!pullers.length) leadFb(-1);
		}
		// Pitch vs Overload, stock: FB lead play-side / left
		if (key === "pitch" && sch === "overloadBlitz" && isStockFacing()) leadFb(-1);
		// Blast vs Fire Zone, O-flipped: FB lead left
		if (key === "blast" && sch === "wide" && practiceFlipped) leadFb(-1);
		// Sweep vs Bear, flipped: retarget 2–3 leftmost defenders
		if (key === "sweep" && sch === "tight" && practiceFlipped) retargetLeftmost(3);
	}
	function unstackGroup(list, minDist) {
		for (let pass = 0; pass < 10; pass++) {
			for (let i = 0; i < list.length; i++) {
				for (let j = i + 1; j < list.length; j++) {
					const a = list[i], b = list[j];
					if (!a || !b) continue;
					const dx = b.x - a.x, dy = b.y - a.y;
					const d = Math.hypot(dx, dy);
					if (d >= minDist || d < 0.001) {
						if (d < 0.001) {
							b.x += 0.8;
							continue;
						}
						continue;
					}
					const push = (minDist - d) * 0.52;
					const nx = dx / d, ny = dy / d;
					a.x -= nx * push * 0.85;
					b.x += nx * push * 0.85;
					a.y -= ny * push * 0.28;
					b.y += ny * push * 0.28;
				}
			}
		}
	}
	function applyPresnapLook() {
		const sch = (currentScheme && currentScheme.id) || "";
		const fl = fieldLeft();
		const fr = fieldRight();
		const mid = (fl + fr) / 2;
		const W = fr - fl;
		const snap = snapX();
		const dbs = defenders.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x);
		const lbs = defenders.filter((d) => d.group === "LB").sort((a, b) => a.x - b.x);
		const dts = defenders.filter((d) => d.group === "DT").sort((a, b) => a.x - b.x);

		function plantDeep(d, xFrac, yOff, rx) {
			d.x = clamp(fl + W * xFrac, fl + 3.2, fr - 3.2);
			d.y = playStartYard + yOff;
			d.job = "deep";
			d.jobX = d.x;
			d.jobY = d.y + 1.6;
			d.zoneRx = rx || W * 0.16;
			d.zoneRy = 5.0;
			d.zoneFollow = false;
			d.isSafety = true;
			d.isCorner = false;
			d.artCurve = false;
		}

		if (sch === "cover4Quarters" || sch === "goalLine") {
			const deepFracs = [0.125, 0.375, 0.625, 0.875];
			const deepY = sch === "goalLine" ? 10.4 : 11.6;
			dbs.slice(0, 4).forEach((d, i) => plantDeep(d, deepFracs[i], deepY, W * 0.16));
			dbs.slice(4).forEach((d, i) => {
				d.x = snap + (i % 2 === 0 ? -1 : 1) * (4.2 + i);
				d.y = playStartYard + 4.6 + i * 0.6;
				if (d.job === "deep") d.job = "curl";
				d.isSafety = false;
				d.jobX = d.x;
				d.jobY = playStartYard + 5.2;
			});
			if (sch === "cover4Quarters") {
				lbs.forEach((d) => {
					if (d.job !== "blitz") return;
					const gap = Math.sign(d.x - snap) || playSideSign() || 1;
					d.jobX = clamp(snap + gap * 1.35, snap - 3.0, snap + 3.0);
					d.jobY = playStartYard - 0.25;
					d.artCurve = false;
					d.stutter = false;
					d.x = clamp(d.x, snap - 5.4, snap + 5.4);
					d.y = playStartYard + 4.6;
				});
			}
		} else if (sch === "prevent") {
			const deepFracs = [0.10, 0.30, 0.50, 0.70, 0.90];
			dbs.slice(0, 5).forEach((d, i) => plantDeep(d, deepFracs[i], 12.2, W * 0.14));
			dbs.slice(5).forEach((d) => {
				d.x = mid + 6.2;
				d.y = playStartYard + 6.6;
				d.job = "curl";
				d.isSafety = false;
				d.isCorner = false;
				d.jobX = d.x;
				d.jobY = d.y + 0.4;
				d.zoneFollow = false;
			});
		} else if (sch === "tight") {
			const outerL = dbs[0], outerR = dbs[dbs.length - 1];
			const keepX = new Set();
			if (outerL) keepX.add(outerL);
			if (outerR) keepX.add(outerR);
			dbs.forEach((d, i, arr) => {
				if (keepX.has(d)) return;
				const t = arr.length <= 1 ? 0 : i / (arr.length - 1) - 0.5;
				d.x = mid + t * Math.min(W * 0.52, 16);
			});
			lbs.forEach((d, i, arr) => {
				const t = arr.length <= 1 ? 0 : i / (arr.length - 1) - 0.5;
				d.x = snap + t * Math.min(W * 0.48, 14.5);
				d.y = playStartYard + 4.6;
			});
			const ols = blockers.filter((b) => b.group === "OL").sort((a, b) => a.x - b.x);
			dts.forEach((d, i, arr) => {
				if (ols.length >= 2) {
					const gap = Math.min(i + 1, ols.length - 1);
					d.x = (ols[gap - 1].x + ols[gap].x) / 2;
				} else {
					d.x = snap + (i - (arr.length - 1) / 2) * 3.15;
				}
				d.y = playStartYard + 2.85;
			});
		} else if (sch === "wide") {
			if (dbs.length >= 2) {
				const L = dbs[0], R = dbs[dbs.length - 1];
				L.x = clamp(L.x - 2.6, fl + 2.4, snap - 7);
				R.x = clamp(R.x + 2.6, snap + 7, fr - 2.4);
				L.y += 2.5;
				R.y += 2.5;
				if (L.job === "spy") {
					L.stutterX = L.x + Math.min(2.2, Math.max(1.4, (mid - L.x) * 0.22));
					L.stutterY = L.y - 1.1;
					L.jobX = L.x + Math.min(3.2, Math.max(2.0, (mid - L.x) * 0.28));
					L.jobY = L.y + 2.1;
					L.zoneRx = 1.55;
					L.zoneRy = 1.45;
					L.artCurve = true;
					L.fakeBlitz = true;
				} else {
					if (L.jobX != null) L.jobX = L.x;
					if (L.jobY != null) L.jobY = L.y + 0.8;
				}
				if (R.jobX != null) R.jobX = R.x;
				if (R.jobY != null) R.jobY = R.y + 0.8;
			}
			const innerLbs = lbs.slice(1, Math.max(1, lbs.length - 1));
			const bump = innerLbs.length >= 2 ? innerLbs.slice(0, 2) : lbs.slice(0, 2);
			bump.forEach((d) => {
				d.y += 2.5;
				if (d.jobY != null && d.job !== "blitz") d.jobY = Math.max(d.jobY, d.y);
			});
		} else if (sch === "overloadBlitz") {
			const corners = dbs.length >= 2 ? [dbs[0], dbs[dbs.length - 1]] : [];
			const rest = dbs.filter((d) => !corners.includes(d)).sort((a, b) => a.x - b.x);
			if (rest.length >= 2) {
				rest[0].x = mid - 2.55;
				rest[1].x = mid + 2.55;
				rest[0].y = playStartYard + 11.3;
				rest[1].y = playStartYard + 11.3;
				rest.slice(0, 2).forEach((d) => {
					d.job = "deep";
					d.jobX = d.x;
					d.jobY = d.y + 1.4;
					d.isSafety = true;
					d.zoneFollow = false;
				});
			}
		}

		unstackGroup(defenders, 2.05);
		unstackGroup(blockers, 1.55);
		defenders.forEach((d) => {
			blockers.forEach((b) => {
				const gap = (d.radius || 0.9) + (b.radius || 0.9) + 0.25;
				const dd = dist(d, b);
				if (dd < gap && dd > 0.01) {
					const push = gap - dd;
					d.y += push * 0.7 + 0.35;
					d.x += Math.sign(d.x - b.x || d.x - snap) * push * 0.45;
				}
			});
		});
		defenders.forEach((d) => {
			d.x = clamp(d.x, fl + 2.2, fr - 2.2);
			d.y = clamp(d.y, playStartYard + 1.15, 108.5);
			if (d.jobX != null && Math.abs(d.jobX - d.x) < 1.4) d.jobX = d.x;
		});
	}
	function applyCellDefenseTweaks() {
		const key = cellPlayKey();
		const sch = cellSchemeId();
		const snap = snapX();
		const mid = (fieldLeft() + fieldRight()) / 2;
		function stiffen() {
			defenders.forEach((d) => {
				d.readT = Math.min(d.readT || 0, 0.12);
				d.reactT = Math.min(d.reactT || 0, 0.08);
				d.fakeBlitz = false;
				d.blitzDelay = Math.min(d.blitzDelay || 0, 0.08);
				if (d.job !== "deep") {
					d.y = Math.max(playStartYard + 2.2, Math.min(d.y, playStartYard + (d.group === "DT" ? 3.4 : d.group === "LB" ? 5.2 : 8.5)));
					if (d.jobY != null && d.job !== "deep") d.jobY = Math.min(d.jobY, playStartYard + (d.job === "blitz" ? -0.15 : 7.2));
				}
				if (d.job === "blitz" || d.job === "man") d.aggressor = true;
				d.baseSpeed = (d.baseSpeed || d.speed || 8.4) * 1.06;
				d.speed = d.baseSpeed;
			});
		}
		function unskewOverload() {
			defenders.forEach((d) => {
				const pull = (d.x - mid) * 0.28;
				d.x -= pull;
				if (d.jobX != null) d.jobX -= (d.jobX - mid) * 0.22;
			});
		}
		function holdFireZoneSafety() {
			defenders.filter((d) => d.group === "DB" && (d.job === "deep" || d.isSafety)).forEach((d) => {
				d.artCurve = false;
				d.stutter = false;
				d.fakeBlitz = false;
				d.zoneFollow = false;
				d.readT = Math.max(d.readT || 0, 0.35);
				d.job = "deep";
				d.jobX = d.x;
				d.jobY = Math.max(d.y, playStartYard + 12);
			});
		}
		function stabilizeQuarters() {
			const fl = fieldLeft();
			const fr = fieldRight();
			const mid = (fl + fr) / 2;
			const W = fr - fl;
			const snap = snapX();
			const stations = [0.14, 0.38, 0.62, 0.86];
			defenders.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x).forEach((d, i) => {
				d.x = fl + W * stations[Math.min(i, stations.length - 1)];
				d.artCurve = false;
				d.stutter = false;
				if (d.job === "deep") {
					d.y = playStartYard + 11.5;
					d.jobX = d.x;
					d.jobY = playStartYard + 14.2;
				} else {
					d.y = clamp(d.y, playStartYard + 3.6, playStartYard + 7.4);
					if (d.jobX != null) d.jobX = d.x;
				}
			});
			defenders.filter((d) => d.group === "LB").sort((a, b) => a.x - b.x).forEach((d, i, arr) => {
				const t = arr.length <= 1 ? 0 : (i / (arr.length - 1) - 0.5);
				d.x = mid + t * W * 0.28;
				d.y = playStartYard + 5.1;
				d.artCurve = false;
			});
			defenders.filter((d) => d.group === "DT").sort((a, b) => a.x - b.x).forEach((d, i, arr) => {
				d.x = snap + (i - (arr.length - 1) / 2) * 2.35;
				d.y = playStartYard + 2.55;
			});
		}
		function tightenOverloadForZigzag() {
			const snap = snapX();
			const fl = fieldLeft();
			const fr = fieldRight();
			const mid = (fl + fr) / 2;
			const capY = playStartYard + 11;
			defenders.forEach((d) => {
				d.x = mid + (d.x - mid) * 0.52;
				d.x = clamp(d.x, snap - 13, snap + 11);
				d.y = Math.min(d.y, capY);
				if (d.jobY != null) d.jobY = Math.min(d.jobY, capY);
				if (d.stutterY != null) d.stutterY = Math.min(d.stutterY, playStartYard + 2.6);
				d.artCurve = false;
			});
			defenders.filter((d) => d.job === "blitz").forEach((d) => {
				d.y = clamp(d.y, playStartYard + 2.2, playStartYard + 5.2);
				d.jobY = playStartYard - 0.2;
				d.stutter = false;
			});
			defenders.filter((d) => d.job === "deep").forEach((d) => {
				d.y = playStartYard + 9.6;
				d.jobY = playStartYard + 10.5;
			});
		}
		// Walk-Up / Bear cells that were standing/lazy
		if (sch === "tight" && key === "wedge" && isStockFacing()) stiffen();
		if (sch === "goalLine" && key === "wedge" && isStockFacing()) stiffen();
		if (sch === "tight" && key === "river" && practiceDefFlipped) stiffen();
		if (sch === "overloadBlitz" && key === "wedge" && practiceDefFlipped) unskewOverload();
		if (sch === "wide" && key === "zigzag" && practiceFlipped) holdFireZoneSafety();
		if (sch === "cover4Quarters" && key === "zigzag" && isFlippedFacing()) stabilizeQuarters();
		if (sch === "overloadBlitz" && key === "zigzag" && isFlippedFacing()) tightenOverloadForZigzag();
	}
	function assignBlockJobs() {
		const snap = snapX();
		const style = currentPlay ? currentPlay.blockStyle : "tight";
		const side = playSideSign();
		const ols = blockers.filter((b) => b.group === "OL").sort((a, b) => a.x - b.x);
		const tes = blockers.filter((b) => b.group === "TE").sort((a, b) => a.x - b.x);
		const fbs = blockers.filter((b) => b.group === "FB").sort((a, b) => a.x - b.x);
		const qbs = blockers.filter((b) => b.group === "QB");
		const defs = [...defenders].sort((a, b) => a.x - b.x);
		// HB Zone / Blast: drive defenders BACK — every OL/TE claims someone
		if (style === "zoneR" || style === "zoneL") {
			const zSide = style === "zoneR" ? 1 : -1;
			const used = new Set();
			function takeDef(preferX, maxD, preferGroup) {
				let best = null, bd = maxD;
				for (const d of defs) {
					if (used.has(d)) continue;
					let dd = Math.hypot(d.x - preferX, (d.y - playStartYard) * 0.5);
					if (preferGroup && d.group === preferGroup) dd *= 0.5;
					if (dd < bd) { bd = dd; best = d; }
				}
				if (best) used.add(best);
				return best;
			}
			const bGapX = snap + zSide * (ols.length >= 3 ? 2.4 : 1.9);
			blockers.forEach((b) => {
				b.blockTarget = null; b.blockMode = "man"; b.pullPhase = 0; b.pullVia = null;
				b.driveSide = zSide; b.levelY = 2.8; b.driveBlock = true; b.sturdyBlock = false; b._userCtrl = 0;
			});
			ols.forEach((b, i) => {
				b.blockMode = "reach";
				b.driveSide = zSide;
				b.driveBlock = true;
				b.blockTarget = takeDef(b.x + zSide * 0.9, 22, "DT") || takeDef(b.x + zSide * 1.1, 24);
				b.levelY = 2.4 + i * 0.3;
			});
			tes.forEach((b, i) => {
				b.blockMode = "reach";
				b.driveSide = zSide;
				b.driveBlock = true;
				b.blockTarget = takeDef(b.x + zSide * 1.4, 20, "DT") || takeDef(b.x + zSide * 1.4, 20);
				b.levelY = 3.0 + i * 0.35;
			});
			fbs.forEach((b, i) => {
				b.blockMode = "climb";
				b.driveSide = zSide;
				b.driveBlock = true;
				b.levelY = 3.6 + i * 0.35;
				b.blockTarget = takeDef(bGapX + zSide * i * 0.7, 24) || takeDef(bGapX, 28);
				b.gapAimX = bGapX + zSide * 0.8;
				b.gapAimY = playStartYard + 4.8 + i * 0.7;
			});
			qbs.forEach((b) => {
				b.blockMode = "man";
				b.driveSide = zSide;
				b.driveBlock = true;
				b.blockTarget = takeDef(snap - zSide * 2.2, 14, "DT") || takeDef(snap - zSide * 2.2, 14);
				b.levelY = 1.2;
			});
			// Any unclaimed DT: assign nearest free OL
			defs.filter((d) => d.group === "DT" && !used.has(d)).forEach((d) => {
				const free = ols.find((b) => !b.blockTarget) || ols[0];
				if (free) { free.blockTarget = d; free.driveBlock = true; used.add(d); }
			});
			return;
		}
		// Sweep Left: rightmost two pull; backside OL must claim DTs (no free rushers)
		if (style === "wallL") {
			const wSide = -1;
			const used = new Set();
			function takeDef(preferX, maxD, preferGroup) {
				let best = null, bd = maxD;
				for (const d of defs) {
					if (used.has(d)) continue;
					let dd = Math.hypot(d.x - preferX, (d.y - playStartYard) * 0.55);
					if (preferGroup && d.group === preferGroup) dd *= 0.55;
					if (dd < bd) { bd = dd; best = d; }
				}
				if (best) used.add(best);
				return best;
			}
			blockers.forEach((b) => {
				b.blockTarget = null; b.blockMode = "man"; b.pullPhase = 0; b.pullVia = null;
				b.driveSide = wSide; b.levelY = 2.6; b.pullBoost = 1; b._userCtrl = 0;
			});
			const line = [...ols, ...tes].sort((a, b) => a.x - b.x);
			const pullers = line.slice(-2).reverse();
			pullers.forEach((b, i) => {
				b.blockMode = "pull"; b.pullPhase = 0; b.driveSide = wSide;
				b.pullVia = {
					x: b.x - wSide * 0.3, y: playStartYard - 1.5 - i * 0.35,
					x2: snap + wSide * (5.8 + i * 1.1), y2: playStartYard + 1.4 + i * 0.5
				};
				b.blockTarget = takeDef(snap + wSide * (7 + i), 24);
				b.levelY = 4.0 + i * 0.4;
			});
			// Backside (right) blockers: prioritize DTs on their side — pancakes not free runs
			line.forEach((b, i) => {
				if (pullers.includes(b)) return;
				b.blockMode = "man";
				b.driveSide = Math.sign(b.x - snap) || 1;
				const preferX = b.x + 0.6;
				b.blockTarget = takeDef(preferX, 16, "DT") || takeDef(preferX, 20);
				b.levelY = 2.0 + i * 0.25;
			});
			fbs.forEach((b, i) => {
				b.blockMode = "climb"; b.driveSide = wSide; b.levelY = 5.5 + i * 0.4;
				const outsideX = snap + wSide * (8.5 + i * 1.2);
				b.blockTarget = takeDef(outsideX, 26);
				b.gapAimX = outsideX; b.gapAimY = playStartYard + 5.5 + i * 0.6;
			});
			qbs.forEach((b) => {
				b.blockMode = "man"; b.driveSide = -wSide;
				b.blockTarget = takeDef(snap - wSide * 2.2, 12, "DT") || takeDef(snap - wSide * 2.2, 12);
				b.levelY = 1.2;
			});
			return;
		}
		// Sweep Right: leftmost pull; EVERY other blocker must claim a defender (prefer DT)
		if (style === "wallR") {
			const wSide = 1;
			const used = new Set();
			function takeDef(preferX, maxD, preferGroup) {
				let best = null, bd = maxD;
				for (const d of defs) {
					if (used.has(d)) continue;
					let dd = Math.hypot(d.x - preferX, (d.y - playStartYard) * 0.5);
					if (preferGroup && d.group === preferGroup) dd *= 0.45;
					if (dd < bd) { bd = dd; best = d; }
				}
				if (best) used.add(best);
				return best;
			}
			blockers.forEach((b) => {
				b.blockTarget = null; b.blockMode = "man"; b.pullPhase = 0; b.pullVia = null;
				b.driveSide = wSide; b.levelY = 3.0; b.pullBoost = 1; b.driveBlock = true; b._userCtrl = 0;
			});
			const line = [...ols, ...tes].sort((a, b) => a.x - b.x);
			const pullers = line.slice(0, Math.min(2, line.length));
			pullers.forEach((b, i) => {
				b.blockMode = "pull"; b.pullPhase = 0; b.driveSide = wSide; b.driveBlock = true;
				b.pullVia = {
					x: b.x + wSide * 0.8, y: playStartYard + 0.4 + i * 0.2,
					x2: snap + wSide * (6.0 + i * 1.1), y2: playStartYard + 3.4 + i * 0.6
				};
				b.blockTarget = takeDef(snap + wSide * (7 + i), 26);
				b.levelY = 4.5 + i * 0.3;
			});
			line.forEach((b) => {
				if (pullers.includes(b)) return;
				b.blockMode = "reach";
				b.driveSide = Math.sign(b.x - snap) || -1;
				b.driveBlock = true;
				b.blockTarget = takeDef(b.x, 18, "DT") || takeDef(b.x, 22);
				b.levelY = 2.4;
			});
			// Force-cover remaining DTs
			defs.filter((d) => d.group === "DT" && !used.has(d)).forEach((d) => {
				const free = line.find((b) => !pullers.includes(b) && (!b.blockTarget || b.blockTarget.group !== "DT"));
				const host = free || line[line.length - 1];
				if (host) { host.blockTarget = d; host.blockMode = "reach"; host.driveBlock = true; used.add(d); }
			});
			fbs.forEach((b, i) => {
				b.blockMode = "climb"; b.driveSide = wSide; b.driveBlock = true; b.levelY = 5.8;
				const ox = snap + wSide * (8.5 + i);
				b.blockTarget = takeDef(ox, 26); b.gapAimX = ox; b.gapAimY = playStartYard + 6;
			});
			qbs.forEach((b) => {
				b.blockMode = "man"; b.driveBlock = true;
				b.blockTarget = takeDef(snap - 2, 14, "DT") || takeDef(snap - 2, 14);
				b.levelY = 1.2;
			});
			return;
		}
		// Swing Right: literal swinging door — leftmost arcs all the way to far right of hinge
		if (style === "swingR" || style === "swingL") {
			const gSide = style === "swingR" ? 1 : -1;
			const used = new Set();
			function takeDef(preferX, maxD) {
				let best = null, bd = maxD;
				for (const d of defs) {
					if (used.has(d)) continue;
					const dd = Math.hypot(d.x - preferX, (d.y - playStartYard) * 0.65);
					if (dd < bd) { bd = dd; best = d; }
				}
				if (best) used.add(best);
				return best;
			}
			blockers.forEach((b) => {
				b.blockTarget = null; b.blockMode = "man"; b.pullPhase = 0; b.pullVia = null;
				b.driveSide = gSide; b.levelY = 2.8; b.pullBoost = 1; b.driveBlock = true; b._userCtrl = 0;
			});
			const line = [...ols, ...tes].sort((a, b) => a.x - b.x);
			if (!line.length) return;
			const n = line.length;
			const pivot = gSide > 0 ? line[n - 1] : line[0];
			const hingeX = pivot.x;
			const hingeY = playStartYard + 0.2;
			// Hinge + next 1–2: punch DOWNFIELD to open the door swing
			const hingeGroup = gSide > 0 ? line.slice(-Math.min(3, n)) : line.slice(0, Math.min(3, n));
			hingeGroup.forEach((b, i) => {
				b.blockMode = "reach";
				b.driveSide = gSide;
				b.driveBlock = true;
				b.levelY = 3.6 + i * 0.35;
				b.blockTarget = takeDef(b.x + gSide * (0.8 + i * 0.3), 16);
				b.gapAimX = b.x + gSide * 0.5;
				b.gapAimY = playStartYard + 3.5 + i * 0.5;
			});
			// Door panel: everyone else swings on a circular arc around hinge
			// rank 1 = nearest non-hinge traveler … rank high = leftmost → ends furthest outside hinge
			const panel = line.filter((b) => !hingeGroup.includes(b));
			panel.forEach((b) => {
				const i = line.indexOf(b);
				// For swingR: leftmost (i=0) has highest rank
				const rank = gSide > 0 ? (n - 1 - i) : i;
				const radius = Math.max(2.2, Math.abs(b.x - hingeX) + 0.4);
				// Arc through backfield: start left of hinge, midpoint deep, end right of hinge
				// Angle in field plane: 0 = +x, π/2 = +y (downfield)
				const startAng = gSide > 0 ? Math.PI * 0.92 : Math.PI * 0.08;
				const endAng = gSide > 0 ? -0.25 - rank * 0.08 : Math.PI + 0.25 + rank * 0.08;
				const midAng = gSide > 0
					? startAng + (endAng - startAng) * 0.45
					: startAng + (endAng - startAng) * 0.45;
				const midR = radius * (0.85 + rank * 0.06);
				const endR = radius * 0.55 + 1.2 + rank * 1.35;
				const midX = hingeX + Math.cos(midAng) * midR;
				const midY = hingeY + Math.sin(midAng) * midR - (0.8 + rank * 0.55);
				const endX = hingeX + gSide * (1.3 + rank * 1.55);
				const endY = playStartYard + 1.3 + rank * 0.25;
				b.blockMode = "pull";
				b.pullPhase = 0;
				b.driveSide = gSide;
				b.pullBoost = 1.05 + Math.min(0.22, rank * 0.05);
				b.pullVia = { x: midX, y: Math.min(playStartYard - 0.3, midY), x2: endX, y2: endY };
				b.blockTarget = takeDef(endX + gSide * 0.8, 20);
				b.levelY = 2.5 + rank * 0.3;
			});
			fbs.forEach((b) => {
				b.blockMode = "climb"; b.driveSide = gSide; b.driveBlock = true; b.levelY = 4.6;
				b.blockTarget = takeDef(hingeX + gSide * 5, 20);
				b.gapAimX = hingeX + gSide * 5.2; b.gapAimY = playStartYard + 4.5;
			});
			qbs.forEach((b) => {
				b.blockMode = "man";
				b.blockTarget = takeDef(snap - gSide * 2, 12);
				b.levelY = 1.2;
			});
			return;
		}
		// River: purge middle — inside blockers drive defenders SIDEWAYS; levels downfield; sturdy holds
		if (style === "river") {
			const used = new Set();
			function takeDef(preferX, maxD) {
				let best = null, bd = maxD;
				for (const d of defs) {
					if (used.has(d)) continue;
					const dd = Math.hypot(d.x - preferX, (d.y - playStartYard) * 0.6);
					if (dd < bd) { bd = dd; best = d; }
				}
				if (best) used.add(best);
				return best;
			}
			blockers.forEach((b) => {
				b.blockTarget = null; b.blockMode = "man"; b.pullPhase = 0; b.pullVia = null;
				b.driveSide = 0; b.levelY = 3; b.sturdyBlock = true; b.driveBlock = false; b._userCtrl = 0;
			});
			const line = [...ols, ...tes].sort((a, b) => a.x - b.x);
			const midI = (line.length - 1) / 2;
			line.forEach((b, i) => {
				const outward = Math.sign(i - midI) || (i % 2 === 0 ? -1 : 1);
				// Inside: wash defenders out of the A/B gaps
				b.blockMode = "reach";
				b.driveSide = outward;
				b.sturdyBlock = true;
				b.blockTarget = takeDef(b.x + outward * 1.4, 18);
				// Staggered levels so RB can weave S-path through channels
				b.levelY = 2.2 + Math.abs(i - midI) * 0.9 + (i % 2) * 0.35;
			});
			fbs.forEach((b, i) => {
				b.blockMode = "climb";
				b.sturdyBlock = true;
				b.driveSide = i % 2 === 0 ? 1 : -1;
				b.levelY = 5.0 + i * 0.8;
				b.blockTarget = takeDef(snap + b.driveSide * 2.5, 20);
				b.gapAimX = snap + b.driveSide * 3.2;
				b.gapAimY = playStartYard + 5.5;
			});
			qbs.forEach((b) => {
				b.blockMode = "man";
				b.sturdyBlock = true;
				b.blockTarget = takeDef(snap, 12);
				b.levelY = 1.5;
			});
			return;
		}

		// Wedge Left: mass pull left like a swinging gate, staggered levels; RB fake R then pitch L
		if (style === "wedgeL") {
			const used = new Set();
			function takeDef(preferX, maxD) {
				let best = null, bd = maxD;
				for (const d of defs) {
					if (used.has(d)) continue;
					const dd = Math.hypot(d.x - preferX, (d.y - playStartYard) * 0.55);
					if (dd < bd) { bd = dd; best = d; }
				}
				if (best) used.add(best);
				return best;
			}
			const line = [...ols, ...tes].sort((a, b) => a.x - b.x);
			const hinges = line.slice(0, 2); // two leftmost stay — the hinge
			blockers.forEach((b) => {
				b.blockTarget = null; b.blockMode = "man"; b.pullPhase = 0; b.pullVia = null;
				b.driveSide = -1; b.levelY = 3; b.driveBlock = true; b.sturdyBlock = true; b._userCtrl = 0;
			});
			line.forEach((b, i) => {
				const rank = line.length - 1 - i; // rightmost travels farthest left
				if (hinges.includes(b)) {
					b.blockMode = "reach";
					b.driveBlock = true;
					b.sturdyBlock = true;
					b.pullVia = null;
					b.pullPhase = 0;
					b.gapAimX = b.x - 0.8;
					b.gapAimY = playStartYard + 2.2;
					b.blockTarget = takeDef(b.x - 1.1, 14);
					b.levelY = 2.2;
					return;
				}
				b.blockMode = "pull";
				b.pullPhase = 0;
				b.pullBoost = 1 + rank * 0.06;
				const midX = snap - 2.8 - rank * 0.55;
				const midY = playStartYard - (1.1 + rank * 0.65);
				const endX = snap - (6.5 + rank * 1.55);
				const endY = playStartYard + 2.4 + rank * 0.95; // staggered levels
				b.pullVia = { x: midX, y: midY, x2: endX, y2: endY };
				b.pullBoost = 1.08 + rank * 0.08;
				b.blockTarget = takeDef(endX, 22);
				b.gapAimX = endX;
				b.gapAimY = endY + 1.2;
				b.levelY = 3 + rank * 0.9;
				b.driveBlock = true;
			});
			fbs.forEach((b, i) => {
				b.blockMode = "man";
				b.pullVia = null;
				b.pullPhase = 0;
				b.driveSide = 1;
				b.sealSide = 1;
				b.backsideSeal = true;
				b.driveBlock = true;
				b.sturdyBlock = true;
				b.facing = 0;
				b.x = snap + 3.2 + i * 0.7;
				b.y = playStartYard - 1.1;
				b.blockTarget = takeDef(snap + 4.2 + i * 0.8, 18);
				b.gapAimX = snap + 4.4;
				b.gapAimY = playStartYard + 2.8;
				b.levelY = 2.6;
			});
			qbs.forEach((b) => {
				b.blockMode = "man";
				b.pullVia = null;
				b.driveSide = 1;
				b.sealSide = 1;
				b.backsideSeal = true;
				b.driveBlock = true;
				b.sturdyBlock = true;
				b.facing = 0;
				b.x = snap + 2.4;
				b.y = playStartYard - 0.55;
				b.blockTarget = takeDef(snap + 3.2, 16);
				b.gapAimX = snap + 3.6;
				b.gapAimY = playStartYard + 2.4;
				b.levelY = 2.2;
			});
			return;
		}

		if (style === "wedgeR") {
			const used = new Set();
			function takeDef(preferX, maxD) {
				let best = null, bd = maxD;
				for (const d of defs) {
					if (used.has(d)) continue;
					const dd = Math.hypot(d.x - preferX, (d.y - playStartYard) * 0.55);
					if (dd < bd) { bd = dd; best = d; }
				}
				if (best) used.add(best);
				return best;
			}
			const line = [...ols, ...tes].sort((a, b) => a.x - b.x);
			const hinges = line.slice(-2); // two rightmost stay — the hinge
			blockers.forEach((b) => {
				b.blockTarget = null; b.blockMode = "man"; b.pullPhase = 0; b.pullVia = null;
				b.driveSide = 1; b.levelY = 3; b.driveBlock = true; b.sturdyBlock = true; b._userCtrl = 0;
			});
			line.forEach((b, i) => {
				const rank = i;
				if (hinges.includes(b)) {
					b.blockMode = "reach";
					b.driveBlock = true;
					b.sturdyBlock = true;
					b.pullVia = null;
					b.pullPhase = 0;
					b.gapAimX = b.x + 0.8;
					b.gapAimY = playStartYard + 2.2;
					b.blockTarget = takeDef(b.x + 1.1, 14);
					b.levelY = 2.2;
					return;
				}
				b.blockMode = "pull";
				b.pullPhase = 0;
				b.pullBoost = 1 + rank * 0.06;
				const midX = snap + 2.8 + rank * 0.55;
				const midY = playStartYard - (1.1 + rank * 0.65);
				const endX = snap + (6.5 + rank * 1.55);
				const endY = playStartYard + 2.4 + rank * 0.95;
				b.pullVia = { x: midX, y: midY, x2: endX, y2: endY };
				b.pullBoost = 1.08 + rank * 0.08;
				b.blockTarget = takeDef(endX, 22);
				b.gapAimX = endX;
				b.gapAimY = endY + 1.2;
				b.levelY = 3 + rank * 0.9;
				b.driveBlock = true;
			});
			fbs.forEach((b, i) => {
				b.blockMode = "man";
				b.pullVia = null;
				b.pullPhase = 0;
				b.driveSide = -1;
				b.sealSide = -1;
				b.backsideSeal = true;
				b.driveBlock = true;
				b.sturdyBlock = true;
				b.facing = Math.PI;
				b.blockTarget = takeDef(snap - 3.4 - i * 0.8, 16);
				b.gapAimX = snap - 3.8;
				b.gapAimY = playStartYard + 1.2;
				b.levelY = 1.8;
			});
			qbs.forEach((b) => {
				b.blockMode = "man";
				b.pullVia = null;
				b.driveSide = -1;
				b.sealSide = -1;
				b.backsideSeal = true;
				b.driveBlock = true;
				b.sturdyBlock = true;
				b.facing = Math.PI;
				b.blockTarget = takeDef(snap - 2.4, 14);
				b.gapAimX = snap - 2.8;
				b.gapAimY = playStartYard + 1.1;
				b.levelY = 1.4;
			});
			return;
		}
		// Zig Zag: blockers form staggered lane matching runner path L-R-L-R-L
		if (style === "zigzag") {
			const used = new Set();
			function takeDef(preferX, maxD) {
				let best = null, bd = maxD;
				for (const d of defs) {
					if (used.has(d)) continue;
					const dd = Math.hypot(d.x - preferX, (d.y - playStartYard) * 0.55);
					if (dd < bd) { bd = dd; best = d; }
				}
				if (best) used.add(best);
				return best;
			}
			const zSign = playSideSign();
			// Path waypoints follow flipped play id / playSideSign()
			const zigs = [
				{ x: snap + zSign * -2.4, y: playStartYard + 3.2, side: -1 * zSign },
				{ x: snap + zSign * 2.6, y: playStartYard + 6.4, side: 1 * zSign },
				{ x: snap + zSign * -2.7, y: playStartYard + 9.5, side: -1 * zSign },
				{ x: snap + zSign * 2.4, y: playStartYard + 12.4, side: 1 * zSign },
				{ x: snap + zSign * -1.4, y: playStartYard + 15.0, side: -1 * zSign }
			];
			blockers.forEach((b) => {
				b.blockTarget = null; b.blockMode = "man"; b.pullPhase = 0; b.pullVia = null;
				b.driveSide = -1; b.levelY = 3; b.driveBlock = true; b.sturdyBlock = true; b._userCtrl = 0;
			});
			const line = [...ols, ...tes].sort((a, b) => a.x - b.x);
			// Pair blockers to zig points: seal outside of each bend
			line.forEach((b, i) => {
				const z = zigs[Math.min(i, zigs.length - 1)];
				const sealX = z.x + z.side * 1.35; // outside the lane
				b.blockMode = "reach";
				b.driveSide = z.side;
				b.sturdyBlock = true;
				b.driveBlock = true;
				b.levelY = (z.y - playStartYard) * 0.55;
				b.blockTarget = takeDef(sealX, 18);
				b.gapAimX = sealX;
				b.gapAimY = z.y;
			});
			fbs.forEach((b, i) => {
				const z = zigs[Math.min(1 + i, zigs.length - 1)];
				b.blockMode = "climb";
				b.driveSide = z.side;
				b.sturdyBlock = true;
				b.levelY = z.y - playStartYard;
				b.blockTarget = takeDef(z.x + z.side * 1.8, 20);
				b.gapAimX = z.x + z.side * 1.5;
				b.gapAimY = z.y + 0.5;
			});
			qbs.forEach((b) => {
				b.blockMode = "man";
				b.blockTarget = takeDef(snap + 1.5, 12);
				b.levelY = 1.2;
			});
			return;
		}
		let nPull = 0;
		if (style === "pullL" || style === "pullR") nPull = 1 + (Math.random() < .42 ? 1 : 0);
		else nPull = Math.random() < .38 ? 1 : Math.random() < .12 ? 2 : 0;
		nPull = Math.min(nPull, Math.max(0, ols.length - 1));
		const pullers = [];
		if (nPull >= 1 && ols.length) pullers.push(side < 0 ? ols[ols.length - 1] : ols[0]);
		if (nPull >= 2 && ols.length >= 3) {
			const second = side < 0 ? ols[ols.length - 2] : ols[1];
			if (!pullers.includes(second)) pullers.push(second);
		}
		const used = /* @__PURE__ */ new Set();
		function takeDef(preferX, maxD) {
			let best = null;
			let bd = maxD;
			for (const d of defs) {
				if (used.has(d)) continue;
				const dd = Math.hypot(d.x - preferX, (d.y - playStartYard) * .65);
				if (dd < bd) {
					bd = dd;
					best = d;
				}
			}
			if (best) used.add(best);
			return best;
		}
		blockers.forEach((b, i) => {
			b.blockTarget = null;
			b.blockMode = "man";
			b.pullPhase = 0;
			b.pullVia = null;
			b.driveSide = Math.sign(b.x - snap) || (i < blockers.length / 2 ? -1 : 1);
			b.levelY = 2.4 + i % 5 * .85 + Math.random() * .45;
			b._userCtrl = 0;
		});
		ols.forEach((b, i) => {
			if (pullers.includes(b)) {
				b.blockMode = "pull";
				b.pullPhase = 0;
				const behindY = playStartYard - 1.6 - Math.random() * .7;
				b.pullVia = {
					x: snap + side * .4,
					y: behindY,
					x2: snap + side * (5.5 + Math.random()),
					y2: playStartYard + 1.2
				};
				b.blockTarget = takeDef(snap + side * 7, 22);
				b.levelY = 4.2 + Math.random();
			} else {
				b.blockMode = i % 2 === 0 ? "man" : "reach";
				b.blockTarget = takeDef(b.x + b.driveSide * .8, 22);
				b.levelY = 2.1 + i * .75 + Math.random() * .4;
			}
		});
		fbs.forEach((b, i) => {
			b.blockMode = "climb";
			b.blockTarget = defs.filter((d) => d.group === "LB" && !used.has(d))[i] || takeDef(b.x + side * 2.2, 18);
			b.levelY = 5.2 + i * 1.5;
		});
		tes.forEach((b, i) => {
			b.blockMode = "reach";
			b.driveSide = Math.sign(b.x - snap) || (i % 2 === 0 ? -1 : 1);
			b.blockTarget = takeDef(b.x + b.driveSide * 1.4, 18);
			b.levelY = 3.4 + i * .8;
		});
		qbs.forEach((b) => {
			b.blockMode = "man";
			b.blockTarget = takeDef(b.x, 10);
			b.levelY = 1.2;
		});
	}


	function assignOverloadBlitzJobs(fl, fr, mid, _rnd) {
		const W = fr - fl;
		const used = new Set();
		const dts = defenders.filter((d) => d.group === "DT").sort((a, b) => a.x - b.x);
		const lbs = defenders.filter((d) => d.group === "LB").sort((a, b) => a.x - b.x);
		const dbs = defenders.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x);

		function claimBlitz(d, jobX, jobY, opts) {
			opts = opts || {};
			d.job = "blitz";
			d.jobX = clamp(jobX, fl + 2.5, fr - 2.5);
			d.jobY = jobY;
			d.zoneRx = 1.2;
			d.zoneRy = 1.2;
			d.zoneFollow = false;
			d.artCurve = !!opts.curve;
			d.stutter = !!opts.stutter;
			if (d.stutter) {
				d.stutterX = clamp(opts.stutterX != null ? opts.stutterX : (d.x + jobX) / 2, fl + 3, fr - 3);
				d.stutterY = opts.stutterY != null ? opts.stutterY : playStartYard + 1.1;
				d.artCurve = true;
			}
			d.readT = 0.1 + _rnd() * 0.18;
			d.isSafety = false;
			d.isCorner = false;
			d.aggressor = true;
			used.add(d);
		}
		function claimZone(d, job, x, y, rx, ry, follow) {
			d.job = job;
			d.jobX = clamp(x, fl + 2.5, fr - 2.5);
			d.jobY = y;
			d.zoneRx = rx;
			d.zoneRy = ry;
			d.zoneFollow = !!follow || job === "drop" || job === "spy";
			d.artCurve = false;
			d.stutter = false;
			d.readT = job === "deep" ? 0.4 + _rnd() * 0.3 : 0.22 + _rnd() * 0.25;
			d.isSafety = job === "deep";
			d.isCorner = job === "curl" || job === "flat";
			d.aggressor = false;
			used.add(d);
		}

		// --- Overload LEFT (matches Madden OverloadBlitz art) ---
		// Leftmost DB: blitz down-and-in, force contain
		if (dbs[0]) {
			claimBlitz(dbs[0], mid - W * 0.08, playStartYard - 0.35, {
				curve: true,
				stutter: true,
				stutterX: dbs[0].x + W * 0.06,
				stutterY: playStartYard + 1.4
			});
		}
		// Leftmost LB: sweep into next available gap (inside the DB path)
		if (lbs[0]) {
			claimBlitz(lbs[0], mid - W * 0.04, playStartYard - 0.15, {
				curve: true,
				stutter: true,
				stutterX: lbs[0].x + W * 0.1,
				stutterY: playStartYard + 0.9
			});
		}
		// Leftmost DT: inside angle — pull OL in, open lanes for LB/DB
		if (dts[0]) {
			claimBlitz(dts[0], mid - W * 0.02, playStartYard - 0.45, {
				curve: true,
				stutter: false
			});
		}
		// Other DTs: straight-ahead blitz
		dts.slice(1).forEach((d) => {
			claimBlitz(d, d.x, playStartYard - 0.25 - _rnd() * 0.35, { curve: false });
		});
		// Middle LB (or second from left): also blitz overloaded side
		if (lbs[1]) {
			claimBlitz(lbs[1], mid - W * 0.06, playStartYard - 0.2, {
				curve: true,
				stutter: false
			});
		}
		// Any further LBs: straight / light contain-side blitz
		lbs.slice(2).forEach((d, i) => {
			claimBlitz(d, d.x - W * 0.03, playStartYard - 0.15, { curve: i === 0 });
		});

		// --- Backside / residual: ZONE (not man) ---
		const freeDbs = dbs.filter((d) => !used.has(d));
		// Nearest available DB → left curl/flat
		if (freeDbs[0]) {
			claimZone(freeDbs[0], "curl", fl + W * 0.16, playStartYard + 4.4, W * 0.13, 1.9, false);
		}
		// Next two DBs → deep halves
		if (freeDbs[1]) {
			claimZone(freeDbs[1], "deep", fl + W * 0.32, capCoverageY(playStartYard + 15), W * 0.2, 5.0, false);
		}
		if (freeDbs[2]) {
			claimZone(freeDbs[2], "deep", fr - W * 0.32, capCoverageY(playStartYard + 15), W * 0.2, 5.0, false);
		}
		// Remaining DB slots / leftover defenders: drop + curl flat right
		const rest = defenders.filter((d) => !used.has(d)).sort((a, b) => a.x - b.x);
		const zoneTail = [
			{ job: "drop", x: mid + W * 0.04, y: playStartYard + 8.0, rx: W * 0.11, ry: 2.5, follow: true },
			{ job: "curl", x: fr - W * 0.16, y: playStartYard + 4.4, rx: W * 0.13, ry: 1.9, follow: false },
			{ job: "deep", x: mid, y: capCoverageY(playStartYard + 14.5), rx: W * 0.18, ry: 4.5, follow: false },
			{ job: "flat", x: fr - W * 0.22, y: playStartYard + 3.6, rx: W * 0.12, ry: 1.5, follow: false }
		];
		rest.forEach((d, i) => {
			const slot = zoneTail[Math.min(i, zoneTail.length - 1)];
			claimZone(d, slot.job, slot.x, slot.y, slot.rx, slot.ry, slot.follow);
		});

		defenders.forEach((d, i) => {
			d.laneOffset = (i - (defenders.length - 1) / 2) * 1.7;
		});
	}



	function assignStormBlitzJobs(fl, fr, mid, _rnd) {
		// Storm Blitz: front 4 angle-right; outside contains arc; one cross blitz; deep middle + flat L/R
		const W = fr - fl;
		const used = new Set();
		const dts = defenders.filter((d) => d.group === "DT").sort((a, b) => a.x - b.x);
		const lbs = defenders.filter((d) => d.group === "LB").sort((a, b) => a.x - b.x);
		const dbs = defenders.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x);

		function claimBlitz(d, jobX, jobY, opts) {
			opts = opts || {};
			d.job = "blitz";
			d.jobX = clamp(jobX, fl + 2.5, fr - 2.5);
			d.jobY = jobY;
			d.zoneRx = 1.2;
			d.zoneRy = 1.2;
			d.zoneFollow = false;
			d.artCurve = !!opts.curve;
			d.stutter = !!opts.stutter;
			if (d.stutter) {
				d.stutterX = clamp(opts.stutterX != null ? opts.stutterX : (d.x + jobX) / 2, fl + 3, fr - 3);
				d.stutterY = opts.stutterY != null ? opts.stutterY : playStartYard + 1.0;
			}
			d.readT = 0.08 + _rnd() * 0.15;
			d.isSafety = false;
			d.isCorner = false;
			d.aggressor = true;
			used.add(d);
		}
		function claimZone(d, job, x, y, rx, ry, follow) {
			d.job = job;
			d.jobX = clamp(x, fl + 2.5, fr - 2.5);
			d.jobY = y;
			d.zoneRx = rx;
			d.zoneRy = ry;
			d.zoneFollow = !!follow || job === "drop" || job === "spy";
			d.artCurve = false;
			d.stutter = false;
			d.readT = job === "deep" ? 0.45 + _rnd() * 0.3 : 0.22 + _rnd() * 0.25;
			d.isSafety = job === "deep";
			d.isCorner = job === "flat" || job === "curl";
			d.aggressor = false;
			used.add(d);
		}

		// Front 4 (DTs, pad with LBs if fewer than 4 DTs): all blitz angle RIGHT
		const front = [...dts];
		while (front.length < 4 && lbs.length) {
			const lb = lbs.find((d) => !front.includes(d) && !used.has(d));
			if (!lb) break;
			front.push(lb);
		}
		front.slice(0, 4).forEach((d, i) => {
			const angX = d.x + W * (0.06 + i * 0.015); // angle right
			claimBlitz(d, angX, playStartYard - 0.25 - _rnd() * 0.3, {
				curve: true,
				stutter: false
			});
		});

		// Outside contain: leftmost free LB/DB and rightmost free LB/DB — angled curved arc blitz
		const freeLbDb = [...lbs, ...dbs].filter((d) => !used.has(d)).sort((a, b) => a.x - b.x);
		const leftContain = freeLbDb[0];
		const rightContain = freeLbDb.length > 1 ? freeLbDb[freeLbDb.length - 1] : null;
		if (leftContain) {
			claimBlitz(leftContain, fl + W * 0.12, playStartYard - 0.1, {
				curve: true,
				stutter: true,
				stutterX: fl + W * 0.22,
				stutterY: playStartYard + 1.6
			});
			leftContain.job = "contain"; // show as contain art color while still rushing
			leftContain.zoneRx = 2.2;
			leftContain.zoneRy = 2.0;
		}
		if (rightContain && rightContain !== leftContain) {
			claimBlitz(rightContain, fr - W * 0.12, playStartYard - 0.1, {
				curve: true,
				stutter: true,
				stutterX: fr - W * 0.22,
				stutterY: playStartYard + 1.6
			});
			rightContain.job = "contain";
			rightContain.zoneRx = 2.2;
			rightContain.zoneRy = 2.0;
		}

		// Next LB/DB to the right of left contain: cross blitz between 3rd and 4th DT
		const gapX = dts.length >= 4
			? (dts[2].x + dts[3].x) / 2
			: dts.length >= 2
				? (dts[dts.length - 2].x + dts[dts.length - 1].x) / 2
				: mid + W * 0.05;
		const crossCands = [...lbs, ...dbs].filter((d) => !used.has(d)).sort((a, b) => a.x - b.x);
		// prefer one just right of left contain / mid-left
		let cross = crossCands.find((d) => d.x >= mid - W * 0.15) || crossCands[0];
		if (cross) {
			claimBlitz(cross, gapX, playStartYard - 0.35, {
				curve: true,
				stutter: true,
				stutterX: cross.x - W * 0.04,
				stutterY: playStartYard + 0.8
			});
		}

				// 4 deepest DBs: move 30% closer to LOS
		const byDepth = [...dbs].sort((a, b) => b.y - a.y);
		byDepth.slice(0, 4).forEach((d) => {
			const depth = d.y - playStartYard;
			d.y = playStartYard + depth * 0.7;
		});

		// Two free DBs/safeties: cross-blitz into adjacent gaps (no cross-field flat)
		const freeSaf = defenders.filter((d) => !used.has(d) && d.group === "DB").sort((a, b) => a.x - b.x);
		const gapA = mid - W * 0.06;
		const gapB = mid + W * 0.06;
		if (freeSaf[0] && freeSaf[1]) {
			// Cross: left safety attacks right gap, right safety attacks left gap — land one gap apart
			claimBlitz(freeSaf[0], gapB, playStartYard - 0.3, {
				curve: true, stutter: true,
				stutterX: mid, stutterY: playStartYard + 1.2
			});
			claimBlitz(freeSaf[1], gapA, playStartYard - 0.3, {
				curve: true, stutter: true,
				stutterX: mid, stutterY: playStartYard + 1.2
			});
		} else if (freeSaf[0]) {
			claimBlitz(freeSaf[0], gapA, playStartYard - 0.3, { curve: true, stutter: true });
		}

		// Coverage residual: flats on matching side only + optional deep
		const cov = defenders.filter((d) => !used.has(d)).sort((a, b) => a.x - b.x);
		const leftCov = cov.filter((d) => d.x <= mid);
		const rightCov = cov.filter((d) => d.x > mid);
		if (leftCov[0]) claimZone(leftCov[0], "flat", fl + W * 0.18, playStartYard + 4.0, W * 0.12, 1.6, false);
		if (rightCov[0]) claimZone(rightCov[0], "flat", fr - W * 0.18, playStartYard + 4.0, W * 0.12, 1.6, false);
		const rest = defenders.filter((d) => !used.has(d));
		if (rest[0]) claimZone(rest[0], "deep", mid, capCoverageY(playStartYard + 14), W * 0.2, 4.8, false);
		rest.slice(1).forEach((d, i) => {
			const side = d.x < mid ? -1 : 1;
			claimZone(d, "drop", mid + side * W * 0.1, playStartYard + 8, W * 0.1, 2.4, true);
		});

		defenders.forEach((d, i) => {
			d.laneOffset = (i - (defenders.length - 1) / 2) * 1.7;
		});
	}

	function assignJamMiddleJobs(fl, fr, mid, _rnd) {
		const W = fr - fl;
		const used = new Set();
		const dbs = defenders.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x);
		const others = defenders.filter((d) => d.group !== "DB").sort((a, b) => a.x - b.x);
		// Spread DBs: wider horizontally, deeper vertically — no LOS stack
		if (dbs.length >= 2) {
			dbs[0].x = clamp(mid - W * 0.36, fl + 3, mid - 3);
			dbs[dbs.length - 1].x = clamp(mid + W * 0.36, mid + 3, fr - 3);
		}
		dbs.forEach((d, i) => {
			const t = dbs.length <= 1 ? 0.5 : i / (dbs.length - 1);
			d.x = clamp(mid + (t - 0.5) * W * 0.72, fl + 3, fr - 3);
			d.y = playStartYard + 9.5 + Math.abs(t - 0.5) * 3.5 + _rnd() * 0.6;
		});
		others.forEach((d, i) => {
			const t = others.length <= 1 ? 0.5 : i / (others.length - 1);
			d.x = clamp(mid + (t - 0.5) * W * 0.45, fl + 4, fr - 4);
			if (d.group === "DT") d.y = playStartYard + 3.2 + _rnd() * 0.5;
			else d.y = playStartYard + 5.5 + Math.abs(t - 0.5) * 1.5 + _rnd() * 0.4;
		});
		function claimZone(d, job, x, y, rx, ry, follow) {
			d.job = job;
			d.jobX = clamp(x, fl + 2.5, fr - 2.5);
			d.jobY = y;
			d.zoneRx = rx; d.zoneRy = ry;
			d.zoneFollow = !!follow || job === "drop";
			d.artCurve = false; d.stutter = false;
			d.blitzDelay = 0;
			d.readT = 0.25 + _rnd() * 0.25;
			d.isSafety = false;
			d.aggressor = false;
			// Misdirection: show as blitz first, then settle into zone
			d.fakeBlitz = true;
			d.reactT = 0.55 + _rnd() * 0.45;
			used.add(d);
		}
		function claimBlitz(d, jobX, delay, curve, cross) {
			d.job = "blitz";
			d.jobX = clamp(jobX, mid - W * 0.2, mid + W * 0.2);
			d.jobY = playStartYard - 0.2 - _rnd() * 0.3;
			d.zoneRx = 1.2; d.zoneRy = 1.2;
			d.zoneFollow = false;
			d.artCurve = !!curve || !!cross;
			d.stutter = !!cross;
			if (cross) {
				d.stutterX = mid + (d.x < mid ? W * 0.08 : -W * 0.08);
				d.stutterY = playStartYard + 1.0;
			}
			d.blitzDelay = delay || 0;
			d.readT = (delay || 0) + 0.06;
			d.aggressor = true;
			// Misdirection: show drop/coverage first, then fire
			d.fakeBlitz = true;
			d.reactT = 0.5 + _rnd() * 0.55 + (delay || 0) * 0.3;
			used.add(d);
		}
		// 2 DBs drop
		const dropDbs = dbs.slice(0, 2);
		dropDbs.forEach((d, i) => {
			claimZone(d, "drop", mid + (i === 0 ? -W * 0.1 : W * 0.1), playStartYard + 10.5, W * 0.11, 2.4, true);
		});
		// Flat each side — prefer remaining DBs then LB
		const free = [...dbs.filter((d) => !used.has(d)), ...others.filter((d) => !used.has(d))];
		const leftFlat = free.find((d) => d.x <= mid) || free[0];
		if (leftFlat) claimZone(leftFlat, "flat", mid - W * 0.28, playStartYard + 5.2, W * 0.12, 1.6, false);
		const rightFlat = free.find((d) => !used.has(d) && d.x >= mid) || free.find((d) => !used.has(d));
		if (rightFlat) claimZone(rightFlat, "flat", mid + W * 0.28, playStartYard + 5.2, W * 0.12, 1.6, false);
		// Rest: curved / crossover / delayed blitzes into pocket
		const delays = [0, 0.45, 0.75, 1.05, 0.6, 1.2, 0.3];
		const rush = defenders.filter((d) => !used.has(d)).sort((a, b) => a.x - b.x);
		rush.forEach((d, i) => {
			const t = rush.length <= 1 ? 0.5 : i / (rush.length - 1);
			const gap = mid - W * 0.14 + t * W * 0.28;
			const cross = i % 3 === 1;
			const curve = true;
			const delay = delays[i % delays.length];
			claimBlitz(d, gap, delay, curve, cross);
		});
		defenders.forEach((d, i) => { d.laneOffset = (i - (defenders.length - 1) / 2) * 1.5; });
	}

	function assignFreeFireJobs(fl, fr, mid, _rnd) {
		// Free Fire: aggressive arcing / delayed blitzes; corners tighter to LOS & hash
		const W = fr - fl;
		const used = new Set();
		const dts = defenders.filter((d) => d.group === "DT").sort((a, b) => a.x - b.x);
		const lbs = defenders.filter((d) => d.group === "LB").sort((a, b) => a.x - b.x);
		const dbs = defenders.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x);
		// Pull wide DBs 5 yd closer to LOS and 5 yd toward center (pre-snap align)
		if (dbs.length >= 2) {
			const left = dbs[0], right = dbs[dbs.length - 1];
			left.x = clamp(left.x + 5, fl + 2, mid - 2);
			left.y = Math.max(playStartYard + 2.5, left.y - 5);
			right.x = clamp(right.x - 5, mid + 2, fr - 2);
			right.y = Math.max(playStartYard + 2.5, right.y - 5);
		}
		const delays = [0, 0.35, 0.6, 0.95, 1.25, 0.75, 1.05];
		function claimBlitz(d, jobX, jobY, delay, curve) {
			d.job = "blitz";
			d.jobX = clamp(jobX, fl + 2.5, fr - 2.5);
			d.jobY = jobY;
			d.zoneRx = 1.2; d.zoneRy = 1.2;
			d.zoneFollow = false;
			d.artCurve = !!curve;
			d.stutter = !!curve;
			if (curve) {
				d.stutterX = (d.x + jobX) / 2 + (_rnd() - 0.5) * 2;
				d.stutterY = playStartYard + 1.2 + _rnd();
			}
			d.blitzDelay = delay || 0;
			d.readT = (delay || 0) + 0.05;
			d.aggressor = true;
			used.add(d);
		}
		function claimZone(d, job, x, y, rx, ry, follow) {
			d.job = job;
			d.jobX = clamp(x, fl + 2.5, fr - 2.5);
			d.jobY = y;
			d.zoneRx = rx; d.zoneRy = ry;
			d.zoneFollow = !!follow || job === "drop";
			d.artCurve = false; d.stutter = false;
			d.blitzDelay = 0;
			d.readT = 0.3 + _rnd() * 0.25;
			d.isSafety = job === "deep";
			d.aggressor = false;
			used.add(d);
		}
		// Most rush with arcs; keep 1–2 deep/flat
		const pool = [...defenders].sort((a, b) => a.x - b.x);
		const coverN = Math.min(2, Math.max(1, Math.floor(pool.length * 0.2)));
		const cover = pool.filter((d) => d.group === "DB").slice(-coverN);
		if (!cover.length && pool.length) cover.push(pool[pool.length - 1]);
		cover.forEach((d, i) => {
			if (i === 0) claimZone(d, "deep", mid, playStartYard + 14, W * 0.2, 5, false);
			else claimZone(d, "flat", d.x < mid ? fl + W * 0.2 : fr - W * 0.2, playStartYard + 4, W * 0.12, 1.6, false);
		});
		let di = 0;
		const gapL = mid - W * 0.15;
		const gapR = mid + W * 0.15;
		const rushers = defenders.filter((d) => !used.has(d)).sort((a, b) => a.x - b.x);
		rushers.forEach((d, i) => {
			const t = rushers.length <= 1 ? 0.5 : i / (rushers.length - 1);
			const gap = gapL + t * (gapR - gapL);
			const delay = delays[di++ % delays.length];
			claimBlitz(d, gap + (_rnd() - 0.5) * 0.6, playStartYard - 0.3, delay, true);
		});
		const spyDb = dbs[0];
		if (spyDb) {
			spyDb.job = "spy";
			spyDb.fakeBlitz = true;
			spyDb.artCurve = true;
			spyDb.stutter = true;
			spyDb.aggressor = false;
			spyDb.blitzDelay = 0;
			spyDb.readT = 0.42;
			spyDb.reactT = 0.48;
			spyDb.zoneFollow = false;
			spyDb.isSafety = false;
			spyDb.stutterX = spyDb.x + Math.min(2.2, Math.max(1.4, (mid - spyDb.x) * 0.22));
			spyDb.stutterY = spyDb.y - 1.1;
			spyDb.jobX = spyDb.x + Math.min(3.2, Math.max(2.0, (mid - spyDb.x) * 0.28));
			spyDb.jobY = spyDb.y + 2.1;
			spyDb.zoneRx = 1.55;
			spyDb.zoneRy = 1.45;
			spyDb.spyPhase = "fake";
			used.add(spyDb);
		}
		defenders.forEach((d, i) => { d.laneOffset = (i - (defenders.length - 1) / 2) * 1.7; });
	}

	function assignZoneBlitzJobs(fl, fr, mid, _rnd) {
		const W = fr - fl;
		const used = new Set();
		const dts = defenders.filter((d) => d.group === "DT").sort((a, b) => a.x - b.x);
		const lbs = defenders.filter((d) => d.group === "LB").sort((a, b) => a.x - b.x);
		const dbs = defenders.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x);
		function claimZone(d, job, x, y, rx, ry, follow) {
			d.job = job;
			d.jobX = clamp(x, fl + 2.5, fr - 2.5);
			d.jobY = y;
			d.zoneRx = rx; d.zoneRy = ry;
			d.zoneFollow = !!follow || job === "drop";
			d.artCurve = false; d.stutter = false;
			d.blitzDelay = 0;
			d.readT = job === "deep" ? 0.4 + _rnd() * 0.3 : 0.25 + _rnd() * 0.2;
			d.isSafety = job === "deep";
			d.aggressor = false;
			used.add(d);
		}
		function claimBlitz(d, jobX) {
			d.job = "blitz";
			d.jobX = clamp(jobX, fl + 2.5, fr - 2.5);
			d.jobY = playStartYard - 0.25;
			d.zoneRx = 1.2; d.zoneRy = 1.2;
			d.zoneFollow = false;
			d.artCurve = false; // no crossover
			d.stutter = false;
			d.blitzDelay = 0;
			d.readT = 0.1 + _rnd() * 0.12;
			d.aggressor = true;
			used.add(d);
		}
		// DTs drop on opposite sides: one flat, one curl
		if (dts[0]) claimZone(dts[0], "flat", fl + W * 0.2, playStartYard + 4.0, W * 0.12, 1.7, false);
		if (dts[dts.length - 1] && dts[dts.length - 1] !== dts[0]) {
			claimZone(dts[dts.length - 1], "curl", fr - W * 0.2, playStartYard + 4.5, W * 0.13, 1.9, false);
		}
		// Extra DTs also soft drop mid if any
		dts.forEach((d) => {
			if (used.has(d)) return;
			claimZone(d, "drop", d.x, playStartYard + 7.5, W * 0.1, 2.3, true);
		});
		// Priority: 2 deep halves — 1 DB, 1 LB if available
		if (dbs[0]) claimZone(dbs[0], "deep", fl + W * 0.32, playStartYard + 15, W * 0.18, 5, false);
		if (lbs[0]) claimZone(lbs[0], "deep", fr - W * 0.32, playStartYard + 15, W * 0.18, 5, false);
		else if (dbs[1]) claimZone(dbs[1], "deep", fr - W * 0.32, playStartYard + 15, W * 0.18, 5, false);
		// 1 DB drop
		const freeDb = dbs.find((d) => !used.has(d));
		if (freeDb) claimZone(freeDb, "drop", mid, playStartYard + 8.5, W * 0.11, 2.5, true);
		// Optional extra drop LB/DB
		const extraDrop = [...lbs, ...dbs].find((d) => !used.has(d));
		if (extraDrop && _rnd() < 0.85) claimZone(extraDrop, "drop", mid + (_rnd() - 0.5) * W * 0.1, playStartYard + 7.8, W * 0.1, 2.3, true);
		// Remaining: straight gap blitzes, unique gaps, no cross
		// Gaps stay inside the pocket (between the tackles), not outside contain
		const gaps = [];
		const nGap = 6;
		const gapL = mid - W * 0.16;
		const gapR = mid + W * 0.16;
		for (let i = 0; i < nGap; i++) gaps.push(gapL + (i / Math.max(1, nGap - 1)) * (gapR - gapL));
		let gi = 0;
		defenders.filter((d) => !used.has(d)).sort((a, b) => a.x - b.x).forEach((d) => {
			claimBlitz(d, gaps[gi++ % gaps.length]);
		});
		defenders.forEach((d, i) => { d.laneOffset = (i - (defenders.length - 1) / 2) * 1.7; });
	}

	function assignPreventJobs(fl, fr, mid, _rnd) {
		const W = fr - fl;
		const used = new Set();
		const sorted = [...defenders].sort((a, b) => a.x - b.x);
		const dbs = defenders.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x);
		const nonDb = defenders.filter((d) => d.group !== "DB").sort((a, b) => a.x - b.x);

		const deepY = capCoverageY(playStartYard + 16.5);
		const quarters = [
			{ id: "q1", job: "deep", x: fl + W * 0.125, y: deepY, rx: W * 0.15, ry: 5.4 },
			{ id: "q2", job: "deep", x: fl + W * 0.375, y: deepY + 0.4, rx: W * 0.15, ry: 5.6 },
			{ id: "q3", job: "deep", x: fl + W * 0.625, y: deepY + 0.4, rx: W * 0.15, ry: 5.6 },
			{ id: "q4", job: "deep", x: fl + W * 0.875, y: deepY, rx: W * 0.15, ry: 5.4 }
		];
		// Middle two quarters prioritized when fewer than 4 available
		const midQuarters = [quarters[1], quarters[2]];
		const outerQuarters = [quarters[0], quarters[3]];

		function claim(d, slot) {
			d.job = slot.job;
			d.jobX = clamp(slot.x, fl + 2.5, fr - 2.5);
			d.jobY = slot.y;
			d.zoneRx = slot.rx;
			d.zoneRy = slot.ry;
			d.zoneFollow = !!slot.follow || slot.job === "drop" || slot.job === "spy";
			d.artCurve = false;
			d.stutter = false;
			d.isSafety = slot.job === "deep";
			d.isCorner = slot.job === "curl" || slot.job === "flat";
			d.readT = slot.job === "deep" ? 0.5 + _rnd() * 0.35 : 0.25 + _rnd() * 0.3;
			d.aggressor = slot.job === "blitz";
			used.add(d);
		}
		function freePool(preferDbFirst) {
			const a = preferDbFirst
				? [...dbs.filter((d) => !used.has(d)), ...nonDb.filter((d) => !used.has(d))]
				: [...nonDb.filter((d) => !used.has(d)), ...dbs.filter((d) => !used.has(d))];
			return a;
		}

		// Priority 1: 4 deep quarters — middle 2 filled first, then outers; DBs preferred
		const deepSlots = [];
		const n = defenders.length;
		if (n >= 4) deepSlots.push(...midQuarters, ...outerQuarters);
		else if (n === 3) deepSlots.push(...midQuarters, outerQuarters[0]);
		else if (n === 2) deepSlots.push(...midQuarters);
		else if (n === 1) deepSlots.push(midQuarters[0]);

		const deepPool = freePool(true);
		deepSlots.forEach((slot, i) => {
			if (i >= deepPool.length) return;
			// Match L→R among assigned: sort chosen by x against slot x
			claim(deepPool[i], slot);
		});
		// Re-sort deep assignees L→R onto quarters L→R for cleaner art when 4 filled
		if (deepSlots.length >= 4) {
			const deepDefs = defenders.filter((d) => used.has(d) && d.job === "deep").sort((a, b) => a.x - b.x);
			deepDefs.forEach((d, i) => {
				if (quarters[i]) {
					d.jobX = quarters[i].x;
					d.jobY = quarters[i].y;
					d.zoneRx = quarters[i].rx;
					d.zoneRy = quarters[i].ry;
				}
			});
		}

		// Priority 2: curl/flat L and R (2)
		const curls = [
			{ job: "curl", x: fl + W * 0.17, y: playStartYard + 4.5, rx: W * 0.13, ry: 1.9, side: -1 },
			{ job: "curl", x: fr - W * 0.17, y: playStartYard + 4.5, rx: W * 0.13, ry: 1.9, side: 1 }
		];
		const curlPool = freePool(true);
		curls.forEach((slot) => {
			if (!curlPool.length) return;
			// pick spatially closest free
			let best = 0, bestD = 1e9;
			curlPool.forEach((d, i) => {
				if (used.has(d)) return;
				const pen = (slot.side < 0 && d.x > mid) || (slot.side > 0 && d.x < mid) ? 30 : 0;
				const dist = Math.abs(d.x - slot.x) + pen;
				if (dist < bestD) { bestD = dist; best = i; }
			});
			const d = curlPool.splice(best, 1)[0];
			if (d && !used.has(d)) claim(d, slot);
		});

		// Priority 3: drop zone (2)
		const drops = [
			{ job: "drop", x: mid - W * 0.08, y: playStartYard + 8.5, rx: W * 0.1, ry: 2.6, follow: true },
			{ job: "drop", x: mid + W * 0.08, y: playStartYard + 8.5, rx: W * 0.1, ry: 2.6, follow: true }
		];
		const dropPool = freePool(false); // LBs/DTs fine for hook drops
		drops.forEach((slot) => {
			const cand = dropPool.find((d) => !used.has(d));
			if (cand) claim(cand, slot);
		});

		// Priority 4: blitz (3) — randomized which defenders + which gaps (not always same side)
		const blitzPool = freePool(false).filter((d) => !used.has(d));
		// Shuffle with seeded rng
		for (let i = blitzPool.length - 1; i > 0; i--) {
			const j = Math.floor(_rnd() * (i + 1));
			const tmp = blitzPool[i]; blitzPool[i] = blitzPool[j]; blitzPool[j] = tmp;
		}
		const gapXs = [
			mid - W * 0.18, mid - W * 0.06, mid + W * 0.06, mid + W * 0.18,
			fl + W * 0.22, fr - W * 0.22
		];
		for (let i = gapXs.length - 1; i > 0; i--) {
			const j = Math.floor(_rnd() * (i + 1));
			const tmp = gapXs[i]; gapXs[i] = gapXs[j]; gapXs[j] = tmp;
		}
		blitzPool.slice(0, 3).forEach((d, i) => {
			let gap = gapXs[i % gapXs.length];
			if (d.group === "DB") {
				const near = gapXs.filter((x) => Math.sign(x - mid) === Math.sign(d.x - mid) || Math.abs(x - mid) < W * 0.08);
				gap = near.length ? near.reduce((a, x) => Math.abs(x - d.x) < Math.abs(a - d.x) ? x : a, near[0]) : (d.x < mid ? mid - W * 0.14 : mid + W * 0.14);
			}
			claim(d, {
				job: "blitz",
				x: gap,
				y: playStartYard - 0.2 - _rnd() * 0.4,
				rx: 1.2,
				ry: 1.2
			});
			d.artCurve = d.group === "DB" || _rnd() < 0.45;
			d.stutter = _rnd() < 0.35;
		});

		// Priority 5: any remaining → drop zone
		defenders.filter((d) => !used.has(d)).forEach((d, i) => {
			const side = i % 2 === 0 ? -1 : 1;
			claim(d, {
				job: "drop",
				x: mid + side * W * (0.12 + (i * 0.04)),
				y: playStartYard + 7.5 + (i % 3) * 0.6,
				rx: W * 0.1,
				ry: 2.4,
				follow: true
			});
		});

		defenders.forEach((d, i) => {
			d.laneOffset = (i - (defenders.length - 1) / 2) * 1.7;
		});
	}

	function assignCover4QuartersJobs(fl, fr, mid, _rnd) {
		const W = fr - fl;
		const deepY = capCoverageY(playStartYard + 15.5);
		const quarters = [
			{ id: "q1", job: "deep", x: fl + W * 0.125, y: deepY, rx: W * 0.16, ry: 5.2 },
			{ id: "q2", job: "deep", x: fl + W * 0.375, y: deepY, rx: W * 0.16, ry: 5.2 },
			{ id: "q3", job: "deep", x: fl + W * 0.625, y: deepY, rx: W * 0.16, ry: 5.2 },
			{ id: "q4", job: "deep", x: fl + W * 0.875, y: deepY, rx: W * 0.16, ry: 5.2 }
		];
		const under = [
			{ id: "curlL", job: "curl", x: fl + W * 0.18, y: playStartYard + 4.6, rx: W * 0.14, ry: 2.0, side: -1 },
			{ id: "drop", job: "drop", x: mid, y: playStartYard + 6.8, rx: W * 0.105, ry: 2.4, side: 0, follow: true },
			{ id: "curlR", job: "curl", x: fr - W * 0.18, y: playStartYard + 4.6, rx: W * 0.14, ry: 2.0, side: 1 }
		];
		const used = new Set();
		function claim(d, slot) {
			d.job = slot.job;
			d.jobX = clamp(slot.x, fl + 2.5, fr - 2.5);
			d.jobY = slot.y;
			d.zoneRx = slot.rx;
			d.zoneRy = slot.ry;
			d.zoneFollow = !!slot.follow || slot.job === "drop" || slot.job === "spy";
			d.artCurve = false;
			d.stutter = false;
			d.isSafety = slot.job === "deep";
			d.isCorner = slot.job === "curl" || slot.job === "flat";
			d.readT = slot.job === "deep" ? 0.45 + _rnd() * 0.35 : 0.25 + _rnd() * 0.3;
			// Drop defender: mild nudge toward center (halfway vs prior aggressive pull)
			if (slot.job === "drop") {
				d.x = d.x * 0.55 + mid * 0.45;
				d.y = Math.min(d.y, playStartYard + 7.2);
				d.y = Math.max(d.y, playStartYard + 5.6);
			}
			used.add(d);
		}
function remaining(group) {
			return defenders.filter((d) => !used.has(d) && (!group || d.group === group)).sort((a, b) => a.x - b.x);
		}
		function remainingAny() {
			return defenders.filter((d) => !used.has(d)).sort((a, b) => a.x - b.x);
		}
		// On this play: all DBs take zone coverage (deep / curl / drop) — never blitz.
		const dbs = remaining("DB");
		const nonDb = defenders.filter((d) => d.group !== "DB").sort((a, b) => a.x - b.x);

		// --- Priority 1: deep quarters — fill with DBs first (L→R), then other positions ---
		function pickDeepSlotList(count) {
			if (count >= 4) return quarters.slice();
			if (count === 3) {
				const meanX = (dbs.length ? dbs : nonDb).slice(0, 3).reduce((s, d) => s + d.x, 0) / Math.max(1, Math.min(3, (dbs.length || nonDb.length)));
				return meanX < mid ? [quarters[0], quarters[1], quarters[2]] : [quarters[1], quarters[2], quarters[3]];
			}
			if (count === 2) return [quarters[1], quarters[2]]; // middle two preferred
			if (count === 1) return null; // handled per-player
			return [];
		}
		// Assign DBs to deep first
		const dbDeepBudget = Math.min(4, dbs.length);
		if (dbDeepBudget === 1) {
			claim(dbs[0], dbs[0].x < mid ? quarters[1] : quarters[2]);
		} else if (dbDeepBudget > 0) {
			const slots = pickDeepSlotList(dbDeepBudget);
			for (let i = 0; i < dbDeepBudget; i++) claim(dbs[i], slots[i]);
		}
		// Fill remaining deep slots with non-DB (only if fewer than 4 deep filled)
		let deepFilled = [...used].filter((d) => d.job === "deep").length;
		if (deepFilled < 4) {
			const need = 4 - deepFilled;
			const open = quarters.filter((q) => ![...used].some((d) => d.job === "deep" && Math.abs(d.jobX - q.x) < 0.01));
			// Match open quarters L→R with remaining non-DB L→R
			const pool = remainingAny().filter((d) => d.group !== "DB");
			const nAssign = Math.min(need, open.length, pool.length);
			// Prefer middle quarters when only 2 total deep desired was already handled; here fill empties L→R
			for (let i = 0; i < nAssign; i++) claim(pool[i], open[i]);
			deepFilled += nAssign;
		}
		// If we still have < 2 deep and only 2 total defenders scenario already handled via DB path.

		// --- Priority 2: underneath — remaining DBs first, then LB/DT, spatial match ---
		const freeSlots = under.slice();
		function assignUnder(pool) {
			const freeDefs = pool.filter((d) => !used.has(d));
			while (freeSlots.length && freeDefs.length) {
				let best = null, bestScore = 1e9;
				for (const d of freeDefs) {
					if (used.has(d)) continue;
					for (const s of freeSlots) {
						const sidePen = (s.side < 0 && d.x > mid + W * 0.08) ? 40
							: (s.side > 0 && d.x < mid - W * 0.08) ? 40
							: (s.side === 0 ? Math.abs(d.x - mid) * 0.15 : 0);
						const dist = Math.hypot(d.x - s.x, (d.y - s.y) * 0.55) + sidePen;
						if (dist < bestScore) {
							bestScore = dist;
							best = { d, s };
						}
					}
				}
				if (!best) break;
				claim(best.d, best.s);
				freeSlots.splice(freeSlots.indexOf(best.s), 1);
				const ix = freeDefs.indexOf(best.d);
				if (ix >= 0) freeDefs.splice(ix, 1);
			}
		}
		assignUnder(remaining("DB"));
		assignUnder(remainingAny().filter((d) => d.group !== "DB"));

		// Any DB still unassigned (more DBs than 7 zone slots): put on nearest deep quarter as extra help / soft deep
		remaining("DB").forEach((d) => {
			const q = quarters.reduce((best, slot) => {
				const dist = Math.abs(d.x - slot.x);
				return !best || dist < best.dist ? { slot, dist } : best;
			}, null);
			if (q) claim(d, { ...q.slot, rx: q.slot.rx * 0.85, ry: q.slot.ry });
		});

		// --- Priority 3+: blitz — LB and DT only (no DB blitz on this play) ---
		remainingAny().filter((d) => d.group !== "DB").forEach((d) => {
			d.job = "blitz";
			const gap = Math.sign(d.x - snapX()) || 1;
			d.jobX = clamp(snapX() + gap * (d.group === "LB" ? 1.25 : 1.8), fl + 2.7, fr - 2.7);
			d.jobY = playStartYard - 0.2 - _rnd() * 0.5;
			d.zoneRx = 1.2;
			d.zoneRy = 1.2;
			d.zoneFollow = false;
			d.artCurve = d.group !== "LB";
			d.stutter = false;
			d.readT = 0.12 + _rnd() * 0.2;
			d.isSafety = false;
			d.isCorner = false;
			used.add(d);
		});
		defenders.filter((d) => d.group === "DB" && d.isCorner && d.job === "deep").forEach((d) => {
			const inward = Math.sign(mid - d.x) || 1;
			d.jobX = clamp((d.jobX != null ? d.jobX : d.x) + inward * Math.min(2.8, W * 0.06), fl + 3, fr - 3);
			d.artCurve = true;
		});

		defenders.forEach((d, i) => {
			d.laneOffset = (i - (defenders.length - 1) / 2) * 1.7;
			d.aggressor = d.job === "blitz";
		});
		const ranked = [...defenders].filter((d) => d.job === "blitz").sort((a, b) => a.y - b.y);
		ranked.slice(0, Math.min(3, ranked.length)).forEach((d) => { d.aggressor = true; });
	}


	function mirrorDefenseHorizontal() {
		const mid = (fieldLeft() + fieldRight()) / 2;
		defenders.forEach((d) => {
			d.x = mid - (d.x - mid);
			if (d.jobX != null) d.jobX = mid - (d.jobX - mid);
			if (d.stutterX != null) d.stutterX = mid - (d.stutterX - mid);
			if (d.laneOffset != null) d.laneOffset = -d.laneOffset;
		});
	}

	function assignSpinCycleJobs(fl, fr, mid, _rnd) {
		// Spin Cycle: cyclone — body paths arc CCW around a storm center (not torso spin)
		const W = fr - fl;
		const cx = mid;
		const cy = playStartYard + 8.0;
		const defs = [...defenders];
		// Keep normal front / LB / DB depths (like Grizzly / Safety Strike / Chaos) — only jobs arc
		const dts = defs.filter((d) => d.group === "DT").sort((a, b) => a.x - b.x);
		const lbs = defs.filter((d) => d.group === "LB").sort((a, b) => a.x - b.x);
		const dbs = defs.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x);
		dts.forEach((d, i) => {
			const t = dts.length <= 1 ? 0.5 : i / (dts.length - 1);
			d.x = clamp(mid + (t - 0.5) * W * 0.28, fl + 4, fr - 4);
			d.y = playStartYard + 3.1 + _rnd() * 0.35;
		});
		lbs.forEach((d, i) => {
			const t = lbs.length <= 1 ? 0.5 : i / (lbs.length - 1);
			d.x = clamp(mid + (t - 0.5) * W * 0.42, fl + 4, fr - 4);
			d.y = playStartYard + 5.2 + _rnd() * 0.4;
		});
		dbs.forEach((d, i) => {
			const t = dbs.length <= 1 ? 0.5 : i / (dbs.length - 1);
			d.x = clamp(mid + (t - 0.5) * W * 0.62, fl + 3, fr - 3);
			d.y = playStartYard + 9.5 + Math.abs(t - 0.5) * 2.2 + _rnd() * 0.5;
		});
		defs.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
		const n = defs.length;
		defs.forEach((d, i) => {
			const ang0 = Math.atan2(d.y - cy, d.x - cx);
			const right = d.x >= cx;
			const deep = d.y > cy + 1.5;
			// Quadrant-flavored destinations (CCW cyclone feel)
			let job, jobX, jobY, midAng;
			if (!right && !deep) {
				// upper-left-ish → blitz down and in
				job = "blitz";
				jobX = cx - W * 0.04;
				jobY = playStartYard - 0.25;
				midAng = ang0 + 0.7;
			} else if (right && !deep) {
				// lower-right front → arc back into coverage
				job = i % 2 === 0 ? "curl" : "flat";
				jobX = cx + W * 0.22;
				jobY = playStartYard + 6.5;
				midAng = ang0 + 0.85;
			} else if (right && deep) {
				// upper right → spin left and down toward LOS
				job = "blitz";
				jobX = cx + W * 0.06;
				jobY = playStartYard - 0.15;
				midAng = ang0 + 0.95;
			} else {
				// deep left → drop / deep, continuing CCW
				job = d.group === "DB" ? "deep" : "drop";
				jobX = cx - W * 0.18;
				jobY = playStartYard + (job === "deep" ? 14 : 9);
				midAng = ang0 + 0.65;
			}
			const rad0 = Math.hypot(d.x - cx, d.y - cy);
			const midR = rad0 * 0.9;
			d.job = job;
			d.jobX = clamp(jobX, fl + 2.5, fr - 2.5);
			d.jobY = jobY;
			d.zoneRx = job === "deep" ? W * 0.16 : job === "blitz" ? 1.2 : W * 0.11;
			d.zoneRy = job === "deep" ? 4.5 : job === "blitz" ? 1.2 : 2.0;
			d.zoneFollow = job === "drop";
			d.aggressor = job === "blitz";
			d.artCurve = true;
			d.stutter = true;
			// Arc waypoint: CCW along the ring (cyclone path)
			d.stutterX = clamp(cx + Math.cos(midAng) * midR, fl + 3, fr - 3);
			d.stutterY = cy + Math.sin(midAng) * midR * 0.55;
			d.readT = 0.12 + _rnd() * 0.25;
			d.reactT = 0.2 + _rnd() * 0.25;
			d.fakeBlitz = false;
			d.spinT = 0; // no torso whirl
			d.isSafety = job === "deep";
			d.isCorner = job === "flat" || job === "curl";
			d.blitzDelay = job === "blitz" ? 0.05 + _rnd() * 0.2 : 0;
			d.laneOffset = (i - (n - 1) / 2) * 1.2;
		});
	}

	function assignDefenseJobs() {
		// Practice: deterministic jobs for a given scheme + personnel so offense play changes
		// do not reshuffle defense art when the defensive call is unchanged.
		const _rnd = mulberry32(hashSeed([
					(practiceDefSchemeId || (currentScheme && currentScheme.id) || "base"),
					numDT, numLBs, numDBs, numOL, numTE, numFB,
					Math.round(playStartYard), Math.round(FIELD_WIDTH)
				].join("|")));
		const fl = fieldLeft();
		const fr = fieldRight();
		const mid = (fl + fr) / 2;
		const schemeId = (currentScheme && currentScheme.id) || (practiceDefSchemeId) || "base";
		if (schemeId === "cover4Quarters") {
			assignCover4QuartersJobs(fl, fr, mid, _rnd);
			return;
		}
		if (schemeId === "overloadBlitz") {
			assignOverloadBlitzJobs(fl, fr, mid, _rnd);
			return;
		}
		if (schemeId === "prevent") {
			assignPreventJobs(fl, fr, mid, _rnd);
			return;
		}
		if (schemeId === "stormBlitz") {
			assignStormBlitzJobs(fl, fr, mid, _rnd);
			return;
		}
		if (schemeId === "wide") {
			assignFreeFireJobs(fl, fr, mid, _rnd);
			return;
		}
		if (schemeId === "tight") {
			assignZoneBlitzJobs(fl, fr, mid, _rnd);
			return;
		}
		if (schemeId === "goalLine") {
			assignJamMiddleJobs(fl, fr, mid, _rnd);
			return;
		}
		if (schemeId === "base") {
			assignSpinCycleJobs(fl, fr, mid, _rnd);
			return;
		}
		const dbs = defenders.filter((d) => d.group === "DB").sort((a, b) => a.x - b.x);
		const lbs = defenders.filter((d) => d.group === "LB").sort((a, b) => a.x - b.x);
		const ol = blockers.filter((b) => b.group === "OL").sort((a, b) => a.x - b.x);
		const lanes = [];
		if (ol.length >= 2) {
			lanes.push(ol[0].x - 2.05);
			for (let i = 0; i < ol.length - 1; i++) {
				const ax = ol[i].x, bx = ol[i + 1].x;
				lanes.push((ax + bx) / 2);
				if (bx - ax > 2.4) lanes.push(ax + (bx - ax) * .33);
			}
			lanes.push(ol[ol.length - 1].x + 2.05);
		} else {
			const n = Math.max(6, defenders.length + 1);
			for (let i = 0; i < n; i++) lanes.push(fl + 3.1 + i / Math.max(1, n - 1) * (fr - fl - 6.2));
		}
		const usedLane = new Set();
		function takeLane(preferX) {
			let best = -1, bestD = 1e9;
			for (let i = 0; i < lanes.length; i++) {
				if (usedLane.has(i)) continue;
				const dd = Math.abs(lanes[i] - preferX);
				if (dd < bestD) {
					bestD = dd;
					best = i;
				}
			}
			if (best < 0) {
				let fx = preferX, far = -1;
				for (let i = 0; i < lanes.length; i++) {
					let minE = 1e9;
					defenders.forEach((d) => {
						if (d.job === "blitz" && d.jobX != null) minE = Math.min(minE, Math.abs(d.jobX - lanes[i]));
					});
					if (minE > far) {
						far = minE;
						fx = lanes[i];
					}
				}
				return clamp(fx, fl + 2.7, fr - 2.7);
			}
			usedLane.add(best);
			return clamp(lanes[best], fl + 2.7, fr - 2.7);
		}
		function setBlitz(d, preferX, opts) {
			opts = opts || {};
			d.job = "blitz";
			d.jobX = takeLane(preferX != null ? preferX : d.x);
			d.jobY = playStartYard - .25 - _rnd() * .85;
			d.artCurve = opts.curve != null ? opts.curve : _rnd() < .42;
			d.stutter = !!opts.stutter;
			if (d.stutter) {
				const swing = opts.swing != null ? opts.swing : d.x < mid ? 1.7 : -1.7;
				d.stutterX = clamp((d.x + d.jobX) / 2 + swing, fl + 3.4, fr - 3.4);
				d.stutterY = playStartYard + 1.05 + _rnd() * 1.2;
				d.artCurve = true;
			}
		}
		defenders.filter((d) => d.group === "DT").forEach((d, i) => {
			d.readT = .12 + _rnd() * .28;
			setBlitz(d, d.x + (i % 2 === 0 ? -.4 : .4), { curve: _rnd() < .3, stutter: false });
		});
		let corners = [];
		let safeties = [];
		if (dbs.length <= 1) {
			if (dbs[0]) {
				if (_rnd() < .5) corners = dbs;
				else safeties = dbs;
			}
		} else if (dbs.length === 2) corners = dbs;
		else {
			corners = [dbs[0], dbs[dbs.length - 1]];
			safeties = dbs.slice(1, -1);
		}
		function zoneFor(d, kind, x, y, rx, ry, follow) {
			d.job = kind;
			d.jobX = clamp(x, fl + 3, fr - 3);
			d.jobY = y;
			d.zoneRx = rx;
			d.zoneRy = ry;
			d.artCurve = false;
			d.stutter = false;
			// drop / spy zones track the defender; most others are fixed field points
			d.zoneFollow = !!follow || kind === "drop" || kind === "spy";
		}
		corners.forEach((d) => {
			d.isCorner = true;
			d.isSafety = false;
			d.readT = .35 + _rnd() * .55;
			const side = d.x < mid ? -1 : 1;
			const r = _rnd();
			if (r < .22) d.job = "blitz";
			else if (r < .28) d.job = "man";
			else if (r < .42) d.job = "deep";
			else if (r < .62) d.job = "flat";
			else d.job = "contain";
			if (d.job === "contain") zoneFor(d, "contain", side < 0 ? fl + FIELD_WIDTH * .16 : fr - FIELD_WIDTH * .16, playStartYard + 5 + _rnd() * 2, 2.4, 2.8);
			else if (d.job === "deep") zoneFor(d, "deep", side < 0 ? fl + FIELD_WIDTH * .24 : fr - FIELD_WIDTH * .24, capCoverageY(playStartYard + 12 + _rnd() * 4), 6.4, 5);
			else if (d.job === "flat") zoneFor(d, "flat", side < 0 ? fl + FIELD_WIDTH * .2 : fr - FIELD_WIDTH * .2, playStartYard + 3.2 + _rnd(), 5.4, 1.32);
			else if (d.job === "man") {
				const sorted = [...blockers].sort((a, b) => a.x - b.x);
				const t = side < 0 ? sorted[0] : sorted[sorted.length - 1];
				d.manIdx = t ? blockers.indexOf(t) : -1;
				d.jobX = d.x;
				d.jobY = playStartYard + 6;
			} else setBlitz(d, d.x - side * 2.4, {
				curve: _rnd() < .55,
				stutter: _rnd() < .4,
				swing: side * 1.8
			});
		});
		if (corners.length >= 2 && corners.every((c) => c.job === "blitz")) {
			const keep = corners[1];
			zoneFor(keep, "flat", keep.x < mid ? fl + FIELD_WIDTH * .1 : fr - FIELD_WIDTH * .1, playStartYard + 4.2, 5.2, 1.3);
		}
		safeties.forEach((d) => {
			d.isSafety = true;
			d.isCorner = false;
			d.readT = .4 + _rnd() * .65;
		});
		const shells = ["cover2", "cover3", "cover4", "tampa2", "cover6", "palms"];
		const shell = shells[Math.floor(_rnd() * shells.length)];
		function deepAt(d, x, y, rx, ry, job) {
			zoneFor(d, job || "deep", x, capCoverageY(y), rx, ry);
			if (job === "deep" || job === "robber") d.isSafety = true;
		}
		const poolDb = [...safeties, ...corners.filter((c) => c.job !== "contain")];
		if (shell === "cover2") {
			const two = (safeties.length >= 2 ? safeties : poolDb).slice(0, 2);
			two.forEach((d, i) => deepAt(d, mid + (i === 0 ? -1 : 1) * FIELD_WIDTH * .2, playStartYard + 14.5 + _rnd() * 2.4, 8.4, 5.2, "deep"));
		} else if (shell === "cover3") {
			const midS = safeties[0] || poolDb[0];
			if (midS) deepAt(midS, mid, playStartYard + 15.5 + _rnd() * 2, 6.2, 5.6, "deep");
			const wings = corners.filter((c) => c !== midS).slice(0, 2);
			wings.forEach((d, i) => deepAt(d, mid + (i === 0 ? -1 : 1) * FIELD_WIDTH * .22, playStartYard + 13 + _rnd() * 2, 5.4, 4.6, "deep"));
		} else if (shell === "cover4") {
			const four = poolDb.slice(0, Math.min(4, poolDb.length));
			four.forEach((d, i) => {
				const t = four.length <= 1 ? .5 : i / (four.length - 1);
				deepAt(d, fl + 3.6 + t * (fr - fl - 7.2), playStartYard + 16 + (i % 2) * 2.8, 4.6, 4.5, "deep");
			});
		} else if (shell === "cover6") {
			const half = safeties[0] || poolDb[0];
			if (half) deepAt(half, mid + FIELD_WIDTH * .16, playStartYard + 15, 7.6, 5.1, "deep");
			const qs = poolDb.filter((d) => d !== half).slice(0, 2);
			qs.forEach((d, i) => deepAt(d, mid - FIELD_WIDTH * (.08 + i * .16), playStartYard + 16.5, 4.4, 4.4, "deep"));
		} else if (shell === "palms") {
			const midS = safeties[0] || poolDb[0];
			if (midS) deepAt(midS, mid, playStartYard + 14.2, 5.5, 5.8, "robber");
			corners.forEach((d, i) => {
				if (d === midS) return;
				const side = d.x < mid ? -1 : 1;
				deepAt(d, side < 0 ? fl + FIELD_WIDTH * .18 : fr - FIELD_WIDTH * .18, playStartYard + 11.5 + _rnd() * 1.8, 6.2, 2.2, "curl");
			});
		} else {
			const two = (safeties.length >= 2 ? safeties : poolDb).slice(0, 2);
			two.forEach((d, i) => deepAt(d, mid + (i === 0 ? -1 : 1) * FIELD_WIDTH * .2, playStartYard + 15.5, 8, 5, "deep"));
		}
		safeties.forEach((d, i) => {
			if (d.job === "deep" || d.job === "robber" || d.job === "curl") return;
			const side = i % 2 === 0 ? -1 : 1;
			deepAt(d, mid + side * FIELD_WIDTH * .14, playStartYard + 13 + i * 3, 6.4, 5, "deep");
		});
		lbs.forEach((d, i) => {
			d.readT = .3 + _rnd() * .5;
			if (shell === "tampa2" && i === Math.floor(lbs.length / 2)) {
				zoneFor(d, "hook", mid, playStartYard + 11.2 + _rnd(), 3.5, 3.3);
				return;
			}
			const r = _rnd();
			if (r < .38) {
				const cross = lbs.length >= 2 && _rnd() < .5;
				setBlitz(d, cross ? lbs[(i + 1) % lbs.length].x : d.x, {
					curve: true,
					stutter: cross || _rnd() < .28,
					swing: (i % 2 === 0 ? 1 : -1) * (1.5 + _rnd())
				});
				if (_rnd() < .2) {
					d.fakeBlitz = true;
					d.reactT = .45 + _rnd() * .35;
				}
			} else if (r < .5) {
				d.job = "man";
				const fbs = blockers.filter((b) => b.group === "FB");
				const ols = blockers.filter((b) => b.group === "OL");
				const pool = fbs.length ? fbs : ols.length ? ols : blockers;
				const t = pool.length ? pool[i % pool.length] : null;
				d.manIdx = t ? blockers.indexOf(t) : -1;
				d.jobX = t ? t.x : d.x;
				d.jobY = playStartYard + 3;
				d.artCurve = lbs.length >= 2 && _rnd() < .4;
			} else if (r < .72) {
				const depth = 4.6 + i * 2.1 + _rnd() * 1.4;
				zoneFor(d, "drop", mid + (i - (lbs.length - 1) / 2) * Math.max(5.4, FIELD_WIDTH * .12), playStartYard + depth, 2.6, 2.4);
			} else if (r < .88) {
				zoneFor(d, "hook", mid + (i - (lbs.length - 1) / 2) * Math.max(4.6, FIELD_WIDTH * .1) + (_rnd() - .5) * 1.4, playStartYard + 8.2 + _rnd() * 2.4, 3.2, 3);
			} else zoneFor(d, "flat", d.x < mid ? fl + FIELD_WIDTH * .2 : fr - FIELD_WIDTH * .2, playStartYard + 3.6, 5.2, 1.28);
		});
		// Deep coverage: either one deep-middle OR left+right deep DBs
		{
			const midX = (fieldLeft() + fieldRight()) / 2;
			const fl = fieldLeft(), fr = fieldRight();
			const deeps = defenders.filter((d) => d.job === "deep" || d.job === "robber");
			const hasDeepMid = deeps.some((d) => Math.abs((d.jobX != null ? d.jobX : d.x) - midX) < FIELD_WIDTH * .22);
			const hasLeftDeep = deeps.some((d) => (d.jobX != null ? d.jobX : d.x) < midX - FIELD_WIDTH * .1);
			const hasRightDeep = deeps.some((d) => (d.jobX != null ? d.jobX : d.x) > midX + FIELD_WIDTH * .1);
			const dualDeep = hasLeftDeep && hasRightDeep;
			if (!hasDeepMid && !dualDeep && defenders.length) {
				const dbs = defenders.filter((d) => d.group === "DB");
				if (dbs.length >= 2 && _rnd() < 0.55) {
					// Dual deep halves
					const left = dbs.slice().sort((a, b) => a.x - b.x)[0];
					const right = dbs.slice().sort((a, b) => b.x - a.x)[0];
					[left, right].forEach((d, i) => {
						const side = i === 0 ? -1 : 1;
						d.job = "deep";
						d.jobX = midX + side * FIELD_WIDTH * 0.18;
						d.jobY = capCoverageY(playStartYard + 12 + _rnd() * 4);
						d.zoneRx = 6.4;
						d.zoneRy = 5.2;
						d.isSafety = true;
						d.artCurve = false;
					});
				} else {
					const cands = defenders.filter((d) => d.job !== "blitz" || d.group === "DT").sort((a, b) => {
						const da = Math.abs(a.x - midX) + (a.group === "DB" ? 0 : a.group === "LB" ? 1 : 2);
						const db = Math.abs(b.x - midX) + (b.group === "DB" ? 0 : b.group === "LB" ? 1 : 2);
						return da - db;
					});
					const pick = cands[0] || defenders[0];
					pick.job = "deep";
					pick.jobX = midX + (_rnd() - .5) * 2.2;
					pick.jobY = capCoverageY(playStartYard + 11 + _rnd() * 3);
					pick.zoneRx = 7.2;
					pick.zoneRy = 5.5;
					pick.isSafety = pick.group === "DB";
					pick.artCurve = false;
				}
			}
		}
		const blitzCount = defenders.filter((d) => d.job === "blitz").length;
		const need = Math.ceil(defenders.length * .3);
		if (blitzCount < need) {
			const candidates = defenders.filter((d) => d.job !== "blitz" && d.job !== "deep" && d.job !== "curl" && d.job !== "robber" && d.job !== "hook" && !d.isSafety).sort(() => _rnd() - .5);
			for (let i = 0; i < need - blitzCount && i < candidates.length; i++) {
				const d = candidates[i];
				if (d.job === "contain" && defenders.filter((x) => x.job === "contain").length <= 1) continue;
				setBlitz(d, d.x, {
					curve: _rnd() < .5,
					stutter: _rnd() < .28
				});
			}
		}
		function countJob(k) {
			return defenders.filter((d) => d.job === k).length;
		}
		const wantDeep = dbs.length >= 3 ? 2 : dbs.length >= 1 ? 1 : 0;
		if (countJob("deep") + countJob("robber") < wantDeep && dbs.length) {
			const cands = dbs.filter((d) => d.job !== "deep" && d.job !== "robber").sort((a, b) => b.y - a.y);
			cands.forEach((d, i) => {
				if (countJob("deep") + countJob("robber") >= wantDeep) return;
				const side = i % 2 === 0 ? -1 : 1;
				const depth = countJob("deep") === 0 ? 13.5 : 18;
				zoneFor(d, "deep", mid + side * FIELD_WIDTH * .14, capCoverageY(playStartYard + depth), 6.6, 5);
				d.isSafety = true;
			});
		}
		if (countJob("contain") < 2 && corners.length) {
			const cands = corners.filter((d) => d.job !== "contain" && d.job !== "deep").sort((a, b) => a.x - b.x);
			if (cands[0]) zoneFor(cands[0], "contain", fl + FIELD_WIDTH * .16, playStartYard + 5.2, 2.4, 2.8);
			if (cands[cands.length - 1] && cands[cands.length - 1] !== cands[0]) zoneFor(cands[cands.length - 1], "contain", fr - FIELD_WIDTH * .16, playStartYard + 5.2, 2.4, 2.8);
		}
		if (_rnd() < .32 && blockers.length && defenders.length) {
			const victim = defenders[Math.floor(_rnd() * defenders.length)];
			victim.misfireT = 1.8 + _rnd() * 1.4;
			victim.misfireIdx = Math.floor(_rnd() * blockers.length);
		}
		const ranked = [...defenders].sort((a, b) => {
			const as = a.job === "blitz" ? 0 : 1;
			const bs = b.job === "blitz" ? 0 : 1;
			if (as !== bs) return as - bs;
			return a.y - b.y;
		});
		const nAgg = defenders.length <= 3 ? 2 : 3;
		ranked.slice(0, nAgg).forEach((d) => {
			d.aggressor = true;
		});
		defenders.forEach((d, i) => {
			d.laneOffset = (i - (defenders.length - 1) / 2) * 1.7;
		});
		for (let pass = 0; pass < 3; pass++) {
			for (let i = 0; i < defenders.length; i++) {
				for (let j = i + 1; j < defenders.length; j++) {
					const a = defenders[i], b = defenders[j];
					if (a.jobX == null || b.jobX == null) continue;
					const dx = b.jobX - a.jobX, dy = (b.jobY || 0) - (a.jobY || 0);
					const dd = Math.hypot(dx, dy);
					if (dd < 2.15 && dd > .01) {
						const push = (2.15 - dd) * .52;
						const ang = Math.atan2(dy, dx);
						a.jobX = clamp(a.jobX - Math.cos(ang) * push, fl + 2.7, fr - 2.7);
						b.jobX = clamp(b.jobX + Math.cos(ang) * push, fl + 2.7, fr - 2.7);
						if (Math.abs(dy) < .8) {
							a.jobY = (a.jobY || playStartYard) - .45;
							b.jobY = (b.jobY || playStartYard) + .45;
						}
					}
				}
			}
		}
		const xs = defenders.map((d) => d.jobX != null ? d.jobX : d.x);
		const span = Math.max(...xs) - Math.min(...xs);
		if (span < FIELD_WIDTH * .34 && defenders.length >= 3) {
			defenders.forEach((d, i) => {
				const t = defenders.length <= 1 ? .5 : i / (defenders.length - 1);
				d.jobX = fl + 3.2 + t * (fr - fl - 6.4);
			});
		}
	}
	function radialDeadzone(x, y, dz = .18) {
		const m = Math.hypot(x, y);
		if (m < dz) return {
			x: 0,
			y: 0
		};
		const scale = (m - dz) / (1 - dz) / m;
		return {
			x: x * scale,
			y: y * scale
		};
	}
	function padTeammate() {
		return padProfile === "v3" || padProfile === "v4" || padProfile === "v6";
	}
	function classifyDpad(b) {
		const n = (b.u ? 1 : 0) + (b.d ? 1 : 0) + (b.l ? 1 : 0) + (b.r ? 1 : 0);
		if (n === 0 || n >= 3) return null;
		if (b.u && b.d) return null;
		if (b.l && b.r) return null;
		if (padProfile === "v4" || padProfile === "v6") {
			if (b.u && b.l) return inGoal() ? "hurdleL" : "stiffL";
			if (b.u && b.r) return inGoal() ? "hurdleR" : "stiffR";
			if (b.d && b.l) return "deadlegL";
			if (b.d && b.r) return "deadlegR";
			if (b.u) return "hurdle";
			if (b.d) return "deadleg";
			if (b.l) return "shakeL";
			if (b.r) return "shakeR";
			return null;
		}
		if (padProfile === "v3") {
			if (b.u && b.l) return inGoal() ? "truckL" : "stiffL";
			if (b.u && b.r) return inGoal() ? "truckR" : "stiffR";
			if (b.d && b.l) return "deadlegL";
			if (b.d && b.r) return "deadlegR";
			if (b.u) return "truck";
			if (b.d) return "deadleg";
			if (b.l) return "shakeL";
			if (b.r) return "shakeR";
			return null;
		}
		if (b.u && b.l) return "hurdleL";
		if (b.u && b.r) return "hurdleR";
		if (b.d && b.l) return "deadlegL";
		if (b.d && b.r) return "deadlegR";
		if (b.u) return "hurdle";
		if (b.d) return "deadleg";
		if (b.l) return "shakeL";
		if (b.r) return "shakeR";
		return null;
	}
	function getInput(dt) {
		let dx = 0;
		let dy = 0;
		let rsY = 0;
		let sprint = false;
		let spin = false;
		let dive = false;
		let truck = false;
		let jukeL = false;
		let jukeR = false;
		let stiffL = false;
		let stiffR = false;
		let hurdle = false;
		let celebrate = false;
		let pausePress = false;
		let confirm = false;
		let padLive = false;
		let peek = false;
		let replayPress = false;
		let ctrlL = false;
		let ctrlR = false;
		let blockLdx = 0, blockLdy = 0, blockRdx = 0, blockRdy = 0;
		dpadMove = null;
		autoRun = false;
		const typing = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLSelectElement;
		if (!typing) {
			if (keys.has("ArrowLeft") || keys.has("KeyA")) dx -= 1;
			if (keys.has("ArrowRight") || keys.has("KeyD")) dx += 1;
			if (keys.has("ArrowUp") || keys.has("KeyW")) dy += 1;
			if (keys.has("ArrowDown") || keys.has("KeyS")) dy -= 1;
			if (keys.has("Space")) sprint = true;
			if (keys.has("KeyF")) spin = true;
			if (keys.has("KeyC")) dive = true;
			if (padProfile === "v4" || padProfile === "v6") {
				if (keys.has("KeyV") || keys.has("KeyY")) truck = true;
			} else if (padProfile === "v3") {
				if (keys.has("KeyV") || keys.has("KeyY")) hurdle = true;
			} else if (keys.has("KeyV") || keys.has("KeyY")) truck = true;
			if (keys.has("KeyQ")) jukeL = true;
			if (keys.has("KeyE")) jukeR = true;
			if (keys.has("KeyH")) peek = true;
			if (keys.has("KeyR")) replayPress = true;
			if (padTeammate()) {
				if (keys.has("KeyZ")) ctrlL = true;
				if (keys.has("KeyX")) ctrlR = true;
				if (keys.has("Comma") || keys.has("KeyN")) dpadMove = dpadMove || "shakeL";
				if (keys.has("Period") || keys.has("KeyM")) dpadMove = dpadMove || "shakeR";
			} else {
				if (keys.has("KeyZ")) stiffL = true;
				if (keys.has("KeyX")) stiffR = true;
			}
			if (keys.has("KeyG") && padProfile !== "v6") celebrate = true;
			if (keys.has("KeyP") || keys.has("Escape")) pausePress = true;
			if (keys.has("Enter")) confirm = true;
		}
		if (touch.active) {
			dx += touch.dx;
			dy += touch.dy;
			if (touch.burst) sprint = true;
		}
		const pads = navigator.getGamepads ? navigator.getGamepads() : [];
		let gp = null;
		let fallback = null;
		for (let i = 0; i < pads.length; i++) {
			const p = pads[i];
			if (!p || p.connected === false) continue;
			if (!fallback) fallback = p;
			let live = false;
			for (let b = 0; b < p.buttons.length; b++) {
				const gb = p.buttons[b];
				if (gb && (gb.pressed || gb.value > .25)) {
					live = true;
					break;
				}
			}
			if (!live) {
				for (let a = 0; a < p.axes.length; a++) if (Math.abs(p.axes[a] || 0) > .2) {
					live = true;
					break;
				}
			}
			if (live) {
				gp = p;
				break;
			}
		}
		if (!gp && fallback) {
			gp = fallback;
			fallback.index;
		}
		if (!gp);

		// --- T-3 / Terios (Vendor:1949 Product:0402) remapper ---
		const isT3 = !!(gp && /1949.*0402|Vendor:\s*1949\s*Product:\s*0402/i.test(gp.id || ""));
		const t3Map = [0, 1, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14]; // standard → actual index
		const btn = (i) => {
			if (!gp) return false;
			const idx = isT3 ? (t3Map[i] !== undefined ? t3Map[i] : -1) : i;
			if (idx < 0 || !gp.buttons[idx]) return false;
			const b = gp.buttons[idx];
			return !!(b.pressed || b.value > .4);
		};
		// -------------------------------------------------------
		const kbDpad = {
			u: !typing && keys.has("KeyI"),
			d: !typing && keys.has("KeyK"),
			l: !typing && keys.has("KeyJ"),
			r: !typing && keys.has("KeyL")
		};
		let gpDpad = {
			u: btn(12),
			d: btn(13),
			l: btn(14),
			r: btn(15)
		};
		if (isT3 && gp) {
			// D-pad is a hat switch on axes[9] — full 8-way decoder
			const hat = gp.axes[9] ?? 3.29;
			const targets = [
				{v: -1.00, u:1, d:0, l:0, r:0}, // Up
				{v:  1.00, u:1, d:0, l:1, r:0}, // Up-Left
				{v: -0.71, u:1, d:0, l:0, r:1}, // Up-Right
				{v:  0.71, u:0, d:0, l:1, r:0}, // Left
				{v:  0.43, u:0, d:1, l:1, r:0}, // Down-Left
				{v:  0.14, u:0, d:1, l:0, r:0}, // Down
				{v: -0.14, u:0, d:1, l:0, r:1}, // Down-Right
				{v: -0.43, u:0, d:0, l:0, r:1}  // Right
			];
			let best = null, bestDist = 0.35; // max distance to accept
			if (hat < 2.5) { // ignore the weird centered value ~3.29
				for (const t of targets) {
					const dist = Math.abs(hat - t.v);
					if (dist < bestDist) {
						bestDist = dist;
						best = t;
					}
				}
			}
			gpDpad = best
				? { u: !!best.u, d: !!best.d, l: !!best.l, r: !!best.r }
				: { u: false, d: false, l: false, r: false };
		}
		const bits = {
			u: kbDpad.u || gpDpad.u,
			d: kbDpad.d || gpDpad.d,
			l: kbDpad.l || gpDpad.l,
			r: kbDpad.r || gpDpad.r
		};
		const anyD = bits.u || bits.d || bits.l || bits.r;
		if (dpadLatch) {
			if (!anyD) dpadLatch = false;
		} else if (anyD) {
			if (!dpadPending) {
				dpadPending = { ...bits };
				dpadPendingT = 0;
			} else {
				dpadPending = {
					u: dpadPending.u || bits.u,
					d: dpadPending.d || bits.d,
					l: dpadPending.l || bits.l,
					r: dpadPending.r || bits.r
				};
				dpadPendingT += dt;
				if ((dpadPending.u ? 1 : 0) + (dpadPending.d ? 1 : 0) + (dpadPending.l ? 1 : 0) + (dpadPending.r ? 1 : 0) >= 2 || dpadPendingT >= DPAD_DIAG_WIN) {
					dpadMove = (padProfile === "basic" || swapStickDpad) ? null : classifyDpad(dpadPending);
					dpadLatch = true;
					dpadPending = null;
				}
			}
		} else if (dpadPending) {
			dpadPendingT += dt;
			if (dpadPendingT >= DPAD_DIAG_WIN) {
				dpadMove = (padProfile === "basic" || swapStickDpad) ? null : classifyDpad(dpadPending);
				dpadLatch = true;
				dpadPending = null;
			}
		}
		if (gp) {
			padLive = true;
			padName = gp.id || "Xbox";
			const st = radialDeadzone(gp.axes[0] || 0, -(gp.axes[1] || 0), .18);
			const rst = isT3
				? radialDeadzone(gp.axes[2] || 0, -(gp.axes[5] || 0), .22)   // right stick Y is on axis 5
				: radialDeadzone(gp.axes[2] || 0, -(gp.axes[3] || 0), .22);
				rsY = rst.y;
			const lt = isT3
				? (gp.buttons[8] && gp.buttons[8].value || 0)
				: (gp.buttons[6] && gp.buttons[6].value || 0);
			const rt = isT3
				? (gp.buttons[9] && gp.buttons[9].value || 0)
				: (gp.buttons[7] && gp.buttons[7].value || 0);
			if (padTeammate()) {
				ctrlL = ctrlL || lt > .52;
				ctrlR = ctrlR || rt > .52;
			}
			// Stick ↔ D-pad swap support
			const stickMove = (st.x !== 0 || st.y !== 0);
			const dpadDigital = {
				x: (bits.r ? 1 : 0) - (bits.l ? 1 : 0),
				y: (bits.u ? 1 : 0) - (bits.d ? 1 : 0)
			};
			const dpadMag = Math.hypot(dpadDigital.x, dpadDigital.y);
			if (dpadMag > 1) { dpadDigital.x /= dpadMag; dpadDigital.y /= dpadMag; }

			if (swapStickDpad) {
				// Physical D-pad → continuous movement, physical left stick → specials
				if (dpadMag > 0.1) {
					dx = dpadDigital.x;
					dy = dpadDigital.y;
					autoRun = false;
				} else if (padTeammate() && (ctrlL || ctrlR)) autoRun = true;
				else autoRun = false;
				// Classify left stick into special moves (same thresholds as right-stick extras)
				if (!ctrlR) {
					if (st.x < -.55) dpadMove = dpadMove || "shakeL";
					if (st.x > .55) dpadMove = dpadMove || "shakeR";
					if (st.y > .65) dpadMove = dpadMove || "hurdle";
					if (st.y < -.65) dpadMove = dpadMove || "deadleg";
				}
				// Still allow right-stick extras when not swapped away
				// Right stick does NOT fire specials — only steers teammates when LT/RT held
			} else {
				// Normal: left stick → continuous movement, D-pad → specials
				if (stickMove) {
					dx = st.x;
					dy = st.y;
					autoRun = false;
					// Blocker steer comes from right stick when triggers held (see main loop)
				} else if (padTeammate() && (ctrlL || ctrlR)) autoRun = true;
				else autoRun = false;
				// v4/v6: right stick only steers teammates (LT/RT). v3: RS specials still available.
				if (padProfile === "v3" && !ctrlR) {
					if (rst.x < -.55) dpadMove = dpadMove || "shakeL";
					if (rst.x > .55) dpadMove = dpadMove || "shakeR";
					if (rst.y > .65) dpadMove = dpadMove || "hurdle";
					if (rst.y < -.65) dpadMove = dpadMove || "deadleg";
				}
			}
			if (btn(0)) sprint = true;
			if (btn(1)) spin = true;
			if (btn(2)) dive = true;
			if (btn(3)) {
				if (padProfile === "v3") hurdle = true;
				else truck = true;
			}
			if (btn(4)) jukeL = true;
			if (btn(5)) jukeR = true;
			if (padProfile === "v6") {
				if (btn(8)) stiffL = true;
				if (btn(9)) stiffR = true;
			} else if (padProfile !== "v3") {
				if (btn(6) || gp.axes[2] !== void 0 && gp.axes[2] > .4) stiffL = true;
				if (btn(7) || gp.axes[5] !== void 0 && gp.axes[5] > .4) stiffR = true;
			}
			if (btn(8) && padProfile !== "v6") celebrate = true;
			if (padProfile === "basic") {
				if (btn(9)) pausePress = true;
			} else if (btn(11)) pausePress = true;
			if (btn(9) && padProfile !== "basic" && padProfile !== "v6") peek = true;
			const aNow = btn(0);
			const sNow = btn(9);
			if (aNow && !prevA || (sNow && !prevStart && padProfile !== "v6")) confirm = true;
			prevA = aNow;
			prevStart = sNow;
		} else {
			padName = "";
			prevA = false;
			prevStart = false;
		}
		if (padProfile === "basic" && anyD) {
			if (bits.l) dx -= 1;
			if (bits.r) dx += 1;
			if (bits.u) dy += 1;
			if (bits.d) dy -= 1;
			dpadMove = null;
		}
		if (padTeammate() && !gp) {
			if (ctrlL) {
				blockLdx = dx;
				blockLdy = dy;
			}
			if (ctrlR) {
				blockRdx = dx;
				blockRdy = dy;
			}
			if ((ctrlL || ctrlR) && Math.hypot(dx, dy) < .12) autoRun = true;
		}
		const mag = Math.hypot(dx, dy);
		if (mag > 1) {
			dx /= mag;
			dy /= mag;
		}
		if (keys.has("BracketLeft") || keys.has("PageUp")) rsY = -1;
		if (keys.has("BracketRight") || keys.has("PageDown")) rsY = 1;
		peekHeld = peek || peekToggle;
		return {
			dx,
			dy,
			sprint,
			spin,
			dive,
			truck,
			hurdle,
			jukeL,
			jukeR,
			stiffL,
			stiffR,
			celebrate,
			pausePress,
			confirm,
			padLive,
			peek,
			replayPress,
			ctrlL,
			ctrlR,
			blockLdx,
			blockLdy,
			blockRdx,
			blockRdy,
			_dpadUp: !!(bits && bits.u),
			_dpadDn: !!(bits && bits.d),
			_rsY: rsY
		};
	}
	function chooseDefenderAttack(d, distToRb) {
		if (!rb || !d) return;
		if (d.pancaked || d.engageT > 0) return;
		if (d.state === "whiff" || d.state === "recover") return;
		if (d.atkT > 0) return;
		if ((d.atkDecideT || 0) > 0) return;
		d.atkDecideT = 0.12 + Math.random() * 0.1;
		if (distToRb > 5.2 || distToRb < 1.05) return;
		// Shade DTs holding the LOS do not launch into the backfield
		if (d.group === "DT" && !d.dtPenetrate && rb.y < playStartYard + 0.25) return;
		const closing = Math.hypot(d.vx || 0, d.vy || 0);
		const ang = Math.atan2(rb.y - d.y, rb.x - d.x);
		const face = d.facing || 0;
		let turn = Math.abs(ang - face);
		if (turn > Math.PI) turn = Math.PI * 2 - turn;
		const headUp = turn < 0.85;
		const crossing = Math.abs(rb.vx || 0) > 2.4 && Math.abs(rb.x - d.x) < 3.2;
		const r = Math.random();
		let kind = null;
		if (d.group !== "DT" && distToRb > 1.85 && distToRb < 5.15) {
			let diveP = d.group === "DB" ? 0.56 : 0.48;
			if (crossing) diveP += 0.22;
			if (r < diveP) kind = "dive";
		}
		if (!kind && d.group !== "DT" && distToRb > 1.55 && distToRb < 3.45 && headUp && closing > 5.4 && r < 0.3) kind = "hit";
		if (!kind && distToRb < 2.95) kind = "wrap";
		if (!kind) return;
		d.atkKind = kind;
		d.atkDX = Math.cos(ang);
		d.atkDY = Math.sin(ang);
		if (kind === "dive") {
			d.state = "dive";
			d.atkT = 0.5 + Math.random() * 0.16;
			d.low = true;
			d.hop = 0.22;
		} else if (kind === "hit") {
			d.state = "hit";
			d.atkT = 0.26 + Math.random() * 0.1;
			d.low = false;
		} else {
			d.state = "commit";
			d.atkT = 0.18;
		}
	}
	function clearAttack(d) {
		if (!d) return;
		d.atkKind = null;
		d.atkT = 0;
		d.hop = 0;
	}
	function playerMass(p) {
		return (p && p.mass) || 1;
	}
	function carrierDir(p) {
		if (!p) return { x: 0, y: 1 };
		let dx = p.vx || 0, dy = p.vy || 0;
		if (Math.hypot(dx, dy) < 0.55) {
			dx = Math.cos(p.facing || Math.PI / 2);
			dy = Math.sin(p.facing || Math.PI / 2);
		}
		const L = Math.hypot(dx, dy) || 1;
		return { x: dx / L, y: dy / L };
	}
	function tryMiss(kind) {
		if (!rb) return;
		for (const d of defenders) {
			// P0a / P0c: miss moves beat engaged, diving, and hit-sticking defenders.
			if (d.pancaked || d.state === "whiff") continue;
			const engaged = d.engageT > 0;
			const diving = d.atkKind === "dive" && d.atkT > 0;
			const hitting = d.atkKind === "hit" && d.atkT > 0;
			if (!engaged && !diving && !hitting && d.state !== "commit" && d.state !== "breakdown" && d.state !== "recover") continue;
			const dd = dist(d, rb);
			if (dd > (diving ? 4.2 : 3.2)) continue; // dive commit can be beaten from a step farther
			const side = Math.sign(d.x - rb.x) || 1;
			const trail = rb.y - d.y;
			let chance = 0;
			if (kind === "jukeL") chance = side > 0 ? .88 : .38;
			else if (kind === "jukeR") chance = side < 0 ? .88 : .38;
			else if (kind === "shakeL" || kind === "shakeR") chance = d.state === "commit" ? .95 : .82;
			else if (kind === "spin") chance = Math.abs(side) && trail > -.8 ? .92 : .55;
			else if (kind.startsWith("deadleg")) chance = trail > .2 ? .9 : .45;
			else continue;
			if (d.state === "breakdown") chance *= .75;
			if (engaged) chance = Math.min(0.97, chance + 0.22);
			if (diving || hitting) {
				if (kind.startsWith("shake") || kind.startsWith("deadleg") || kind === "spin" || kind.startsWith("juke")) chance = Math.min(0.97, Math.max(chance, 0.9) + 0.04);
			} else if (d.state === "commit" && !engaged && (kind.startsWith("juke") || kind === "spin")) {
				chance *= 0.72; // square wrap: finesse is weaker
			}
			if (d.state === "recover") chance *= 0.7;
			if (Math.random() > chance) continue;
			d.engageT = 0;
			clearAttack(d);
			d.state = "whiff";
			d.whiffT = diving ? 0.72 + Math.random() * 0.2 : kind.startsWith("shake") ? .48 : .38;
			d.low = true;
			const spd = Math.min(4.5, Math.hypot(d.vx, d.vy) || d.speed * .45);
			const ang = Math.atan2(d.vy, d.vx) || d.facing;
			const boost = kind.startsWith("shake") ? 1.15 : 1.08;
			d.vx = Math.cos(ang) * spd * boost;
			d.vy = Math.sin(ang) * spd * boost * 0.55; // less downfield slide
			if (kind === "shakeL") d.vx += 1.6;
			else if (kind === "shakeR") d.vx -= 1.6;
			if (kind === "spin") {
				const bite = Math.sign(d.x - rb.x) || 1;
				d.vx += bite * (2.0 + Math.random() * 1.1);
				d.vy *= 0.35;
				d.whiffT = 0.45 + Math.random() * 0.15;
				d.laneOffset = (d.laneOffset || 0) + bite * 1.2;
			}
			if (kind.startsWith("shake") || kind === "spin" || d.state === "whiff" && dd < 2.35 && chance >= .7) triggerAnkleCam(rb, d);
		}
	}
	function resolveHurdle() {
		if (!rb) return {
			target: null,
			ok: false
		};
		const carrier = rb;
		const aimX = activeMove === "hurdleL" ? -1 : activeMove === "hurdleR" ? 1 : 0;
		const inLane = defenders.filter((d) => {
			if (d.state === "whiff" || d.state === "recover") return false;
			const dy = d.y - carrier.y;
			const dx = d.x - carrier.x;
			if (dy < -.35 || dy > 4.5) return false;
			if (Math.abs(dx) > 2.55) return false;
			if (aimX !== 0 && aimX * dx < -.4) return false;
			return true;
		});
		inLane.sort((a, b) => dist(a, carrier) - dist(b, carrier));
		if (inLane.length === 0) return {
			target: null,
			ok: true
		};
		if (carrier.y >= 94.2) {
			const front = inLane.filter((d) => Math.abs(d.x - carrier.x) < 1.35 && d.y >= carrier.y - .15);
			return {
				target: front[0] || inLane[0] || null,
				ok: true
			};
		}
		const close = inLane.filter((d) => dist(d, carrier) < 3.05);
		if (close.length >= 2) return {
			target: close[0],
			ok: false
		};
		if (inLane.length >= 2) {
			const a = inLane[0];
			const b = inLane[1];
			const split = Math.sign(a.x - carrier.x) !== Math.sign(b.x - carrier.x) && a.x !== carrier.x;
			const similar = Math.abs(dist(a, carrier) - dist(b, carrier)) < 1.35;
			if (split && similar && dist(a, carrier) < 3.5 && dist(b, carrier) < 3.5) return {
				target: a,
				ok: false
			};
		}
		return {
			target: inLane[0],
			ok: true
		};
	}
	function clonePose(p) {
		if (!p) return null;
		return {
			x: p.x,
			y: p.y,
			vx: p.vx,
			vy: p.vy,
			radius: p.radius,
			color: p.color,
			helmet: p.helmet,
			pants: p.pants,
			numColor: p.numColor,
			number: p.number,
			group: p.group,
			side: p.side,
			active: p.active,
			facing: p.facing,
			hasBall: p.hasBall,
			low: p.low,
			hop: p.hop,
			spinT: p.spinT,
			state: p.state
		};
	}
	function captureFrame() {
		return {
			cameraY,
			camZoom,
			cameraMode,
			rb: clonePose(rb),
			qb: clonePose(qb),
			blockers: blockers.map(clonePose),
			defenders: defenders.map(clonePose),
			playStartYard,
			ballYard,
			celebrateTimer,
			scoreSeq: scoreSeq && {
				...scoreSeq,
				player: clonePose(scoreSeq.player)
			},
			fumbleSeq: fumbleSeq && { ...fumbleSeq },
			currentPlayName: currentPlay ? currentPlay.name : "",
			currentSchemeName: currentScheme ? currentScheme.name : "",
			trail: showRunnerTrail && runnerTrail.length ? runnerTrail.map((p) => ({ x: p.x, y: p.y, spd: p.spd || 0 })) : null
		};
	}
	function triggerAnkleCam(runner, defender) {
		ankleCam = {
			t: 1.25,
			runner,
			defender
		};
		startPip(3.2);
	}
	function startPip(seconds) {
		if (replayMode === "off") return;
		const n = Math.max(8, Math.round(seconds * REPLAY_HZ));
		const frames = replayBuf.slice(-n);
		if (frames.length < 6) return;
		pipReplay = {
			frames,
			i: 0,
			acc: 0
		};
	}

	function loadSavedClips() {
		try {
			const raw = localStorage.getItem(SAVED_CLIPS_KEY);
			const list = raw ? JSON.parse(raw) : [];
			return Array.isArray(list) ? list : [];
		} catch {
			return [];
		}
	}
	function persistSavedClips(list) {
		localStorage.setItem(SAVED_CLIPS_KEY, JSON.stringify(list.slice(0, SAVED_CLIPS_MAX)));
	}
	function renderSavedClips() {
		const host = $("savedClipsList");
		if (!host) return;
		const list = loadSavedClips();
		host.innerHTML = "";
		if (!list.length) {
			host.innerHTML = "<div class=\"clip-empty\">No saved plays yet</div>";
			return;
		}
		list.forEach((clip, idx) => {
			const row = document.createElement("div");
			row.className = "clip-row";
			const name = document.createElement("span");
			name.className = "clip-name";
			name.textContent = clip.name || ("Clip " + (idx + 1));
			const meta = document.createElement("span");
			meta.className = "clip-meta";
			meta.textContent = (clip.playName || "?") + " vs " + (clip.schemeName || "?") + " · " + (clip.frames ? clip.frames.length : 0) + "f";
			const playBtn = document.createElement("button");
			playBtn.type = "button";
			playBtn.textContent = "▶";
			playBtn.title = "Play clip";
			playBtn.onclick = () => playSavedClip(clip);
			const dlBtn = document.createElement("button");
			dlBtn.type = "button";
			dlBtn.textContent = "↓";
			dlBtn.title = "Download JSON";
			dlBtn.onclick = () => downloadClipJson(clip);
			const delBtn = document.createElement("button");
			delBtn.type = "button";
			delBtn.textContent = "×";
			delBtn.title = "Delete";
			delBtn.onclick = () => {
				const next = loadSavedClips().filter((c) => c.id !== clip.id);
				persistSavedClips(next);
				renderSavedClips();
			};
			row.appendChild(name);
			row.appendChild(meta);
			row.appendChild(playBtn);
			row.appendChild(dlBtn);
			row.appendChild(delBtn);
			host.appendChild(row);
		});
	}
	function downloadClipJson(clip) {
		const blob = new Blob([JSON.stringify(clip)], { type: "application/json" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = (clip.name || "fga-clip").replace(/[^\w\-]+/g, "_") + ".json";
		a.click();
		URL.revokeObjectURL(a.href);
	}
	function playSavedClip(clip) {
		if (!clip || !clip.frames || clip.frames.length < 6) return;
		fullReplay = {
			frames: clip.frames,
			i: 0,
			acc: 0
		};
		setPaused(true);
		pauseBannerHTML("replay");
	}
	function saveLastPlayClip() {
		const frames = lastPlayFrames && lastPlayFrames.length >= 6 ? lastPlayFrames : playFrames;
		if (!frames || frames.length < 6) {
			setPlayCall("Nothing to save — run a play first");
			return;
		}
		const defaultName = (currentPlay ? currentPlay.name : "Play") + " vs " + (currentScheme ? currentScheme.name : "D");
		const name = window.prompt("Name this clip", defaultName);
		if (name === null) return;
		const clip = {
			id: "c" + Date.now().toString(36),
			name: (name || defaultName).slice(0, 48),
			playName: currentPlay ? currentPlay.name : "",
			schemeName: currentScheme ? currentScheme.name : "",
			savedAt: new Date().toISOString(),
			frames: frames.map((f) => ({
				cameraY: f.cameraY,
				camZoom: f.camZoom,
				cameraMode: f.cameraMode,
				rb: f.rb,
				qb: f.qb,
				blockers: f.blockers,
				defenders: f.defenders,
				playStartYard: f.playStartYard,
				trail: f.trail
			}))
		};
		const list = loadSavedClips();
		list.unshift(clip);
		persistSavedClips(list.slice(0, SAVED_CLIPS_MAX));
		renderSavedClips();
		setPlayCall("Saved \"" + clip.name + "\" (" + list.length + "/" + SAVED_CLIPS_MAX + ")");
	}

	function startFullReplay() {
		const frames = lastPlayFrames && lastPlayFrames.length >= 6 ? lastPlayFrames : null;
		if (!frames) return;
		fullReplay = {
			frames,
			i: 0,
			acc: 0
		};
		setPaused(true);
		pauseBannerHTML("replay");
	}
	function nearestTeammate(side, skip = null) {
		if (!rb || !blockers.length) return null;
		const f = rb.facing || Math.PI / 2;
		const rx = Math.sin(f);
		const ry = -Math.cos(f);
		const behind = rb.y < playStartYard - .2;
		let best = null;
		let nd = behind ? 32 : 22;
		for (const b of blockers) {
			if (!b.active || b === skip) continue;
			const lat = (b.x - rb.x) * rx + (b.y - rb.y) * ry;
			if (side < 0 && lat > .55) continue;
			if (side > 0 && lat < -.55) continue;
			const dd = dist(b, rb);
			if (dd < nd) {
				nd = dd;
				best = b;
			}
		}
		if (!best) for (const b of blockers) {
			if (!b.active || b === skip) continue;
			const dd = dist(b, rb);
			if (dd < nd + 8) {
				nd = dd;
				best = b;
			}
		}
		return best;
	}
	function steerTeammate(b, sdx, sdy, dt) {
		if (!b || !rb) return;
		b._userCtrl = 0.22; // short linger; do not retarget all nearby blockers
		let dx = Math.cos(rb.facing || Math.PI / 2);
		let dy = Math.sin(rb.facing || Math.PI / 2);
		const mag = Math.hypot(sdx, sdy);
		if (mag >= .12) {
			dx = sdx / mag;
			dy = sdy / mag;
		}
		const spd = Math.min(10.5, (b.speed || 8.6) * offMult() * 1.05);
		const step = spd * Math.min(dt, 0.05);
		b.x += dx * step;
		b.y += dy * step;
		b.facing = Math.atan2(dy, dx);
		b.x = clamp(b.x, fieldLeft() + .8, fieldRight() - .8);
		b.y = clamp(b.y, playStartYard - 10, 105);
	}
	function stiffTarget(side) {
		if (!rb) return null;
		let best = null;
		let nd = 3.35;
		for (const d of defenders) {
			if (d.state === "whiff" || d.state === "recover") continue;
			const dx = d.x - rb.x;
			if (side < 0 && dx > -.2) continue;
			if (side > 0 && dx < .2) continue;
			const dd = dist(d, rb);
			if (dd < nd) {
				nd = dd;
				best = d;
			}
		}
		return best;
	}
	function startFumble(hitter) {
		if (!fumblesOn || !rb) return;
		const playYards = Math.round(rb.y - playStartYard);
		score = Math.max(0, score - 50);
		rb.hasBall = false;
		rb.low = false;
		rb.hop = 0;
		celebrateTimer = 0;
		const house = rb.y <= 20;
		const playY = rb.y;
		if (Math.random() < .4) {
			hitter.hasBall = true;
			hitter.facing = -Math.PI / 2;
			fumbleSeq = {
				phase: "return",
				t: 0,
				defender: hitter,
				ballX: hitter.x,
				ballY: hitter.y,
				ballVx: 0,
				ballVy: 0,
				ballHop: 0,
				ballHopV: 0,
				bounces: 0,
				returnStartY: hitter.y,
				house,
				playYards,
				fumbleY: playY,
				actLock: 0,
				scored: false
			};
			rb.low = true;
			return;
		}
		const away = Math.atan2(hitter.y - rb.y, hitter.x - rb.x) || (Math.random() - .5) * Math.PI;
		const chaos = (Math.random() - .5) * 2.6;
		const ang = away * .4 + chaos;
		const pop = 1.15 + Math.random() * 3.5;
		fumbleSeq = {
			phase: "loose",
			t: 0,
			defender: null,
			ballX: rb.x + Math.cos(ang) * .4,
			ballY: rb.y + Math.sin(ang) * .4,
			ballVx: Math.cos(ang) * pop * (.85 + Math.random() * .5),
			ballVy: Math.sin(ang) * pop * (.85 + Math.random() * .5),
			ballHop: 1.8 + Math.random() * 1.4,
			ballHopV: 5.5 + Math.random() * 3.5,
			bounces: 0,
			returnStartY: rb.y,
			house,
			playYards,
			fumbleY: rb.y,
			actLock: 0,
			scored: false
		};
		rb.vx = -Math.cos(ang) * 1.4;
		rb.vy = -Math.sin(ang) * .6;
	}
	function offenseNearBall(bx, by, range) {
		if (rb && dist(rb, {
			x: bx,
			y: by
		}) < range) return true;
		return blockers.some((b) => b.active && dist(b, {
			x: bx,
			y: by
		}) < range);
	}
	function chaseToBall(p, bx, by, spd, dt) {
		const ang = Math.atan2(by - p.y, bx - p.x);
		p.x += Math.cos(ang) * spd * dt;
		p.y += Math.sin(ang) * spd * dt;
		p.facing = ang;
		p.x = clamp(p.x, fieldLeft() + .8, fieldRight() - .8);
	}
	function finishOffFumbleRecover(spotY, down) {
		if (!fumbleSeq || !rb) return;
		score += 50;
		score = Math.max(0, score);
		rb.hasBall = false;
		if (down) {
			rb.low = true;
			const yg = Math.round(spotY - playStartYard);
			fumbleSeq = null;
			endPlay("Fumble recovered", yg, clamp(spotY, 0, 100));
		} else fumbleSeq = null;
	}
	function pickSpikeStyle(player) {
		// 7 horizontal zones across the goal line
		// 1 & 7: near pylons (2.5 yd) → pylon leap
		// 2: between 1 and left post → nonchalant / casual
		// 3: left post area → windmill
		// 4: between posts → punt through uprights
		// 5: right post area → windmill
		// 6: between right post and right pylon → windmill spike
		const fl = fieldLeft(), fr = fieldRight();
		const mid = (fl + fr) / 2;
		// Uprights ~18.5 ft apart ≈ 3.1 yd from center each side
		const postHalf = Math.max(2.4, FIELD_WIDTH * 0.052);
		const leftPost = mid - postHalf;
		const rightPost = mid + postHalf;
		const pylonW = 2.8;
		const postR = 4.2; // windmill zone radius around each upright
		const x = player.x;
		if (x <= fl + pylonW) return "pylon";              // zone 1 near left pylon
		if (x >= fr - pylonW) return "pylon";              // zone 7 near right pylon
		// Zone 4: between the uprights
		if (x >= leftPost && x <= rightPost) return "punt";
		// Zones 3, 5, 6: windmill spike (dunk removed)
		if (Math.abs(x - leftPost) <= postR) return "force"; // zone 3
		if (Math.abs(x - rightPost) <= postR) return "force"; // zone 5
		if (x < leftPost - postR) return "casual";          // zone 2
		return "force"; // zone 6 windmill
	}
	function spikeDirFromInput(player) {
		if (Math.abs(lastSteer.dx) > .18) return lastSteer.dx < 0 ? -1 : 1;
		if (player && Math.abs(player.vx) > .45) return player.vx < 0 ? -1 : 1;
		const mid = (fieldLeft() + fieldRight()) / 2;
		return player && player.x < mid ? -1 : 1;
	}
	function startScoreSeq(who, player, spike, playYards, nextStart) {
		tdZoom = true;
		const doSpike = true; // always celebrate based on cross location
		const style = who === "off" ? pickSpikeStyle(player) : (spike ? "force" : "casual");
		scoreSeq = {
			who,
			t: 0,
			spike: doSpike,
			spikeStyle: style,
			spikeDir: spikeDirFromInput(player),
			player,
			ballX: player.x,
			ballY: player.y,
			ballHop: 0,
			ballHopV: 0,
			ballOut: false,
			nextStart,
			playYards,
			bounced: false,
			bounceN: 0,
			hanging: false
		};
		player.hasBall = !doSpike;
		player.hop = 0;
		player.low = false;
		// Snapshot frames at TD so PIP/full replay include run to the plane
		lastPlayFrames = playFrames.slice();
		if (who === "off") startPip(6.5);
	}
	function tickScore(dt) {
		const s = scoreSeq;
		if (!s) return;
		// Celebration rate tracks game speed linearly but milder (k≈0.45)
		const celebRate = Math.max(0.55, 1 + 0.45 * (playSpeed - 1));
		const cdt = dt * celebRate;
		s.t += cdt;
		const p = s.player;
		const dir = s.spikeDir || 1;
		if (s.who === "off") {
			p.y = Math.min(105.5, p.y + 3.2 * cdt);
			p.vy = 3.2;
		} else {
			p.y = Math.max(-6.2, p.y - 8.2 * celebRate * dt);
			p.vy = -8.2 * celebRate;
		}
		if (s.spikeStyle === "pylon" && s.spike) {
			// Diagonal leap toward pylon — stay mostly in camera frame
			const toward = (p.x < (fieldLeft() + fieldRight()) / 2) ? -1 : 1;
			const edge = toward < 0 ? fieldLeft() + 0.6 : fieldRight() - 0.6;
			if (s.t < .5) {
				p.x += (edge - p.x) * Math.min(1, 3.2 * cdt);
				p.y = Math.min(101.2, p.y + 2.8 * cdt);
				p.hop = Math.sin(s.t / .5 * Math.PI) * 2.6;
				p.low = false;
			} else {
				p.x = edge;
				p.hop = Math.max(0, 1.3 - (s.t - .5) * 3.2);
				p.low = s.t > .65;
			}
		} else if (s.spikeStyle === "force" && s.spike) {
			if (s.t < .28) {
				p.x = clamp(p.x + dir * 6.4 * dt, fieldLeft() + 1.2, fieldRight() - 1.2);
				p.hop = .28 + Math.abs(Math.sin(s.t * 26)) * .32;
				p.low = false;
			} else if (s.t < .62) {
				p.hop = .45 + (s.t - .28) * 1.35;
				p.low = false;
			} else p.low = true;
		} else p.x = clamp(p.x, fieldLeft() + 1, fieldRight() - 1);
		const releaseAt = s.spikeStyle === "force" ? .62 : s.spikeStyle === "pylon" ? .48 : s.spikeStyle === "post" ? .42 : .32;
		if (s.spike && !s.ballOut && s.t > releaseAt) {
			s.ballOut = true;
			p.hasBall = false;
			// Keep dunk hang hop; only set hop for styles that need it
			if (s.spikeStyle === "force") p.hop = .7;
			else if (s.spikeStyle !== "pylon") p.hop = 1.1;
			const mid = (fieldLeft() + fieldRight()) / 2;
			if (s.spikeStyle === "punt") {
				s.ballX = p.x;
				s.ballY = p.y + .4;
				s.ballHop = 5.2;
				s.ballHopV = 11.4;
				s.ballVx = (mid - p.x) * .35;
				s.ballVy = s.who === "off" ? 14.5 : -14.5;
			} else if (s.spikeStyle === "throw") {
				s.ballX = p.x;
				s.ballY = p.y + .5;
				s.ballHop = 3.6;
				s.ballHopV = 6.2;
				s.ballVx = (mid - p.x) * .55;
				s.ballVy = s.who === "off" ? 18 : -18;
			} else if (s.spikeStyle === "post") {
				s.ballX = p.x;
				s.ballY = p.y + .35;
				s.ballHop = 3.4;
				s.ballHopV = 10.4;
				s.ballVx = (mid - p.x) * 1.25;
				s.ballVy = 11.6;
				p.low = true;
			} else if (s.spikeStyle === "pylon") {
				const toward = (p.x < (fieldLeft() + fieldRight()) / 2) ? -1 : 1;
				s.ballX = p.x + toward * 0.9;
				s.ballY = p.y + 0.3;
				s.ballHop = 1.8;
				s.ballHopV = 4.2;
				s.ballVx = toward * (3.2 + Math.random() * 2);
				s.ballVy = 2.5;
				p.low = true;
				s.pylonHit = true;
			} else if (s.spikeStyle === "force") {
				s.ballX = p.x + dir * .85;
				s.ballY = p.y + .15;
				s.ballHop = 2.35;
				s.ballHopV = -7.2;
				s.ballVx = dir * (6.4 + Math.random() * 2.8);
				s.ballVy = .5 + Math.random() * 1.6;
				p.low = true;
			} else {
				s.ballX = p.x + .35;
				s.ballY = p.y + (s.who === "off" ? .6 : -.6);
				s.ballHop = 2.15;
				s.ballHopV = 7.2;
				s.ballVx = (Math.random() - .5) * 1.2;
				s.ballVy = s.who === "off" ? 1.6 : -1.6;
			}
		}
		if (s.ballOut) {
			const g = s.spikeStyle === "punt" || s.spikeStyle === "throw" || s.spikeStyle === "post" ? 11.2 : s.spikeStyle === "force" ? 28 : 18;
			s.ballHopV -= g * dt;
			s.ballHop += s.ballHopV * dt;
			s.ballX += (s.ballVx || 0) * dt;
			s.ballY += (s.ballVy || (s.who === "off" ? 1.4 : -1.4)) * dt;
			if (s.spikeStyle === "punt" || s.spikeStyle === "throw" || s.spikeStyle === "post") s.ballVy = (s.ballVy || 0) - 1.6 * dt;
			if (s.ballHop <= 0) {
				s.ballHop = 0;
				s.bounceN = (s.bounceN || 0) + 1;
				if (s.spikeStyle === "force" && s.bounceN <= 5) {
					s.bounced = true;
					s.ballHop = .05;
					s.ballHopV = (8.4 - s.bounceN * 1.05) * (.75 + Math.random() * .7);
					const kick = s.bounceN % 2 === 0 ? 1 : .28;
					s.ballVx = dir * (2.8 + Math.random() * 5.2) * kick + (Math.random() - .5) * 4.2;
					s.ballVy = (Math.random() - .28) * 6.5;
				} else {
					s.ballHopV *= s.spikeStyle === "force" ? -.38 : -.35;
					if (Math.abs(s.ballHopV) < 1.2) s.ballHopV = 0;
				}
			}
		}
		if (p.hop > 0 && !(s.spikeStyle === "force" && s.t < .68)) p.hop = Math.max(0, p.hop - 4 * dt);
		const hold = s.who === "def" ? s.spike ? 1.18 : .48 : s.spikeStyle === "force" ? 1.85 : s.spikeStyle === "pylon" ? 1.7 : s.spikeStyle === "punt" || s.spikeStyle === "throw" ? 1.55 : s.spikeStyle === "post" ? 1.4 : s.spike ? 1.12 : 1.55;
		if (s.t > hold) {
			const next = s.nextStart;
			const who = s.who;
			const yg = s.playYards;
			scoreSeq = null;
			fumbleSeq = null;
			if (who === "off") endPlay("Touchdown! +100", yg, next);
			else endPlay("Pick-six! −50", yg, next);
		}
	}
	function tickFumble(dt, inp) {
		const fs = fumbleSeq;
		if (!fs) return;
		fs.t += dt;
		if (fs.actLock > 0) fs.actLock -= dt;
		if (fs.phase === "loose") {
			fs.ballHopV -= 22 * dt;
			fs.ballHop += fs.ballHopV * dt;
			fs.ballX += fs.ballVx * dt;
			fs.ballY += fs.ballVy * dt;
			if (fs.ballHop <= 0) {
				fs.ballHop = 0;
				if (Math.abs(fs.ballHopV) > 2.4 && fs.bounces < 6) {
					fs.bounces += 1;
					fs.ballHopV *= -.52 - Math.random() * .12;
					const mag = Math.hypot(fs.ballVx, fs.ballVy) * (.55 + Math.random() * .55);
					const ang = Math.atan2(fs.ballVy, fs.ballVx) + (Math.random() - .5) * 2.5;
					fs.ballVx = Math.cos(ang) * mag * (.7 + Math.random() * .7);
					fs.ballVy = Math.sin(ang) * mag * (.7 + Math.random() * .7);
				} else {
					fs.ballHopV = 0;
					fs.ballVx *= .86;
					fs.ballVy *= .86;
				}
			}
			fs.ballX = clamp(fs.ballX, fieldLeft() + .6, fieldRight() - .6);
			fs.ballY = clamp(fs.ballY, -8, 108);
			const ball = {
				x: fs.ballX,
				y: fs.ballY
			};
			if (rb) {
				let spd = rb.speed * .95;
				if (inp.sprint) spd *= SPRINT_MULT;
				const mx = inp.dx * spd;
				const my = inp.dy * spd;
				rb.x += mx * dt;
				rb.y += my * dt;
				rb.vx = mx;
				rb.vy = my;
				if (Math.hypot(mx, my) > .4) rb.facing = Math.atan2(my, mx);
				rb.x = clamp(rb.x, fieldLeft() + .8, fieldRight() - .8);
				rb.low = false;
			}
			blockers.forEach((b) => {
				if (!b.active) return;
				chaseToBall(b, fs.ballX, fs.ballY, b.speed * .92, dt);
			});
			defenders.forEach((d) => {
				if (d.state === "whiff") return;
				chaseToBall(d, fs.ballX, fs.ballY, Math.max(d.speed, 8.3) * 1.05, dt);
			});
			const rbRange = rb ? dist(rb, ball) : 99;
			if (rb && fs.actLock <= 0 && rbRange < 2.15 && inp.dive) {
				fs.actLock = .4;
				if (Math.random() < .9) {
					rb.low = true;
					rb.x = fs.ballX;
					rb.y = fs.ballY;
					finishOffFumbleRecover(fs.ballY, true);
					return;
				}
				fs.ballVx += (Math.random() - .5) * 6;
				fs.ballVy += (Math.random() - .5) * 6;
				fs.ballHop = 1.1;
				fs.ballHopV = 4;
			}
			if (rb && fs.actLock <= 0 && rbRange < 2 && inp.truck) {
				fs.actLock = .4;
				if (Math.random() < .58) {
					rb.x = fs.ballX;
					rb.y = fs.ballY;
					finishOffFumbleRecover(fs.ballY, false);
					return;
				}
				fs.ballVx += (Math.random() - .5) * 5;
				fs.ballVy += (Math.random() - .5) * 5;
				fs.ballHop = .9;
				fs.ballHopV = 3.4;
			}
			let best = null;
			let nd = 1.12;
			defenders.forEach((d) => {
				if (d.state === "whiff" || d.state === "recover") return;
				const dd = dist(d, ball);
				if (dd < nd) {
					nd = dd;
					best = d;
				}
			});
			if (best && fs.t > .22) {
				const rec = best;
				rec.hasBall = true;
				if (offenseNearBall(fs.ballX, fs.ballY, 3.8)) {
					rec.low = true;
					rec.hasBall = true;
					const spot = clamp(fs.ballY, 0, 100);
					fumbleSeq = null;
					endPlay("Fumble! −50", fs.playYards, clamp((fs.fumbleY ?? fs.ballY) - 10, 1, 99));
					return;
				}
				fs.phase = "return";
				fs.t = 0;
				fs.defender = rec;
				fs.returnStartY = rec.y;
				fs.house = true;
				fs.returnSpd = Math.max(70, (rec.y - 5) / .22);
				rec.facing = -Math.PI / 2;
			}
			if (fs.t > 6.5) {
				const spot = clamp(fs.ballY, 0, 100);
				fumbleSeq = null;
				endPlay("Fumble! −50", fs.playYards, clamp((fs.fumbleY ?? fs.ballY) - 10, 1, 99));
			}
			return;
		}
		const rec = fs.defender;
		if (!rec) return;
		rec.hasBall = true;
		rec.sprintOn = true;
		const cruise = Math.max(rec.baseSpeed || 8.4, 8.4) * SPRINT_MULT * 1.05 * playSpeed;
		rec.vy = rec.y > 5.15 ? -(fs.returnSpd || 70) : -cruise;
		rec.vx = 0;
		rec.y += rec.vy * dt;
		rec.facing = -Math.PI / 2;
		fs.ballX = rec.x;
		fs.ballY = rec.y;
		if (rec.y <= 0) {
			rec.hasBall = true;
			const nextStart = clamp((fs.fumbleY ?? rec.y) - 20, 1, 99);
			startScoreSeq("def", rec, true, fs.playYards, nextStart);
			fumbleSeq = null;
			return;
		}
	}
	function startMove(id) {
		if (moveCooldown > 0 || !handoffDone) return;
		activeMove = id;
		const durs = {
			jukeL: .28,
			jukeR: .28,
			shakeL: .34,
			shakeR: .34,
			deadleg: .32,
			deadlegL: .34,
			deadlegR: .34,
			hurdle: .58,
			hurdleL: .62,
			hurdleR: .62,
			spin: .56,
			dive: 1.65,
			truck: .85,
			truckL: .85,
			truckR: .85,
			stiffL: .45,
			stiffR: .45
		};
		const cds = {
			jukeL: .75,
			jukeR: .75,
			shakeL: 1.05,
			shakeR: 1.05,
			deadleg: .9,
			deadlegL: .95,
			deadlegR: .95,
			hurdle: 1.1,
			hurdleL: 1.15,
			hurdleR: 1.15,
			spin: 1.1,
			dive: 1.3,
			truck: .95,
			truckL: .95,
			truckR: .95,
			stiffL: .95,
			stiffR: .95
		};
		moveDur = durs[id] ?? .3;
		moveTimer = moveDur;
		moveCooldown = cds[id] ?? .8;
		if (id === "stiffL" || id === "stiffR") {
			if (!stiffTarget(id === "stiffL" ? -1 : 1)) {
				activeMove = null;
				moveTimer = 0;
				moveCooldown = .08;
				return;
			}
		}
		if (id === "truck" || id === "truckL" || id === "truckR") {
			if (rb) rb.truckDir = id === "truckL" ? -1 : id === "truckR" ? 1 : 0;
		}
		if (id.startsWith("juke") || id.startsWith("shake") || id.startsWith("deadleg") || id === "spin") tryMiss(id);
		if (id === "spin" && rb) {
			let near = null, nd = 9;
			for (const d of defenders) {
				if (d.state === "whiff" || d.state === "recover") continue;
				const dd = dist(d, rb);
				if (dd < nd) {
					nd = dd;
					near = d;
				}
			}
			let side = Math.abs(lastSteer.dx) > .2 ? Math.sign(lastSteer.dx) : near ? Math.sign(rb.x - near.x) : 0;
			if (!side) side = rb.x >= snapX() ? 1 : -1;
			rb.spinSide = side;
			rb.spinT = 1;
		}
		if (id.startsWith("hurdle")) {
			const h = resolveHurdle();
			hurdleTarget = h.target;
			hurdleOk = h.ok;
			hurdleDidTrip = false;
			h.ok && h.target;
		} else if (id === "dive" && rb) {
			let dx = lastSteer.dx;
			let dy = lastSteer.dy;
			const mag = Math.hypot(dx, dy);
			if (mag < .14) {
				dx = 0;
				dy = 1;
			} else {
				dx /= mag;
				dy /= mag;
			}
			const near = defenders.filter((d) => d.state !== "whiff" && d.state !== "recover" && dist(d, rb) < (inGoal() ? 4.4 : 3.55)).sort((a, b) => dist(a, rb) - dist(b, rb));
			const squeeze = near.length >= 2 || inGoal() && near.length >= 1;
			if (squeeze && near.length) {
				const a = near[0];
				const b = near[1] || {
					x: a.x + (a.x >= rb.x ? 2.4 : -2.4),
					y: a.y
				};
				let tx = (a.x + b.x) / 2 - rb.x;
				let ty = (a.y + b.y) / 2 - rb.y;
				if (Math.abs(tx) < .35) tx = (rb.x < a.x ? -1 : 1) * .8;
				let tm = Math.hypot(tx, ty) || 1;
				dx = dx * .28 + tx / tm * .72;
				dy = Math.max(.45, dy * .28 + ty / tm * .72);
				const nm = Math.hypot(dx, dy) || 1;
				dx /= nm;
				dy /= nm;
			}
			const nearLeft = rb.x - fieldLeft() < 5.4;
			const nearRight = fieldRight() - rb.x < 5.4;
			const pylonDive = rb.y >= 94.4 && (nearLeft || nearRight);
			if (pylonDive) {
				const pylX = nearLeft ? fieldLeft() + .62 : fieldRight() - .62;
				const pylY = 100.2;
				let tx = pylX - rb.x;
				let ty = pylY - rb.y;
				ty = Math.max(ty, Math.abs(tx) * 1.22);
				const tm = Math.hypot(tx, ty) || 1;
				dx = tx / tm;
				dy = ty / tm;
			}
			const pylonReach = pylonDive ? Math.hypot((nearLeft ? fieldLeft() + .62 : fieldRight() - .62) - rb.x, 100.2 - rb.y) : 0;
			let launchYards = pylonDive ? Math.min(6.1, pylonReach + .7) : near.length ? 4.2 + Math.random() * .9 : 5;
			if (inGoal() && !pylonDive) launchYards = Math.max(launchYards, 4.6);
			if (pylonDive && dy > .08) launchYards = Math.min(launchYards, (100.85 - rb.y) / dy + .35);
			dive = {
				dx,
				dy,
				startX: rb.x,
				startY: rb.y,
				phase: "launch",
				launchYards,
				slideYards: pylonDive ? 0 : inGoal() ? 2.4 : near.length ? 0 : 3 + Math.random() * 2,
				squeeze,
				contacted: false,
				contactX: rb.x,
				contactY: rb.y,
				afterContactYards: inGoal() ? 5.6 : 2 + Math.random() * 1.05,
				pylon: pylonDive,
				duck: inGoal()
			};
		} else if (id.startsWith("shake"));
		else if (id.startsWith("deadleg"));
	}
	function finishDive(reason) {
		if (!rb) {
			dive = null;
			activeMove = null;
			return;
		}
		if (ballBrokePlane(rb)) {
			dive = null;
			activeMove = null;
			scoreTouchdown();
			return;
		}
		// No defender contact → brief grounded recovery, then get back up
		if (dive && !dive.contacted) {
			rb.hop = 0;
			rb.low = true;
			dive = null;
			activeMove = null;
			moveTimer = 0;
			moveCooldown = 0.95;   // can't start another move immediately
			getUpT = 0.95;     // stays low while getting up
			return;
		}
		const yg = Math.round(rb.y - playStartYard);
		rb.hop = 0;
		rb.low = true;
		dive = null;
		activeMove = null;
		endPlay(reason, yg);
		awardPlayYards(yg);
	}
	function ballBrokePlane(carrier) {
		if (!carrier) return false;
		if (carrier.y >= 100) return true;
		const nearL = carrier.x - fieldLeft() < 3.5;
		const nearR = fieldRight() - carrier.x < 3.5;
		const pylonish = nearL || nearR;
		const diving = !!(dive && dive.pylon) || activeMove === "dive" && pylonish;
		if (pylonish && carrier.y >= 98.25 && (diving || carrier.hop > .2)) return true;
		return false;
	}
	function isSidelineOob(carrier) {
		if (!carrier) return false;
		if (ballBrokePlane(carrier)) return false;
		if (carrier.x < fieldLeft() - 1.2 || carrier.x > fieldRight() + 1.2) return true;
		if (dive && dive.pylon && carrier.y >= 95.6 && carrier.y < 100) return false;
		if (activeMove === "dive" && carrier.y >= 97.2 && (carrier.x - fieldLeft() < 4 || fieldRight() - carrier.x < 4)) return false;
		return carrier.x <= fieldLeft() + .2 || carrier.x >= fieldRight() - .2;
	}
	function scoreTouchdown() {
		if (!rb || scoreSeq) return;
		// Seal trail at the goal line — fill any gap so path reaches plane
		if (showRunnerTrail && rb) {
			for (const p of runnerTrail) { if (p.y > 100) p.y = 100; }
			const last = runnerTrail.length ? runnerTrail[runnerTrail.length - 1] : null;
			const x0 = last ? last.x : rb.x;
			const y0 = last ? last.y : rb.y;
			if (!last || y0 < 99.2) {
				const steps = 4;
				for (let i = 1; i <= steps; i++) {
					const t = i / steps;
					runnerTrail.push({
						x: x0 + (rb.x - x0) * t,
						y: Math.min(100, y0 + (100 - y0) * t)
					});
				}
			} else {
				runnerTrail.push({ x: rb.x, y: 100 });
			}
		}
		const yg = Math.max(0, Math.round(rb.y - playStartYard));
		tdCount += 1;
		score += 100;
		tdZoom = true;
		postTdMode = postTdMode || "random";
		tdIncrement = Number.isFinite(parseInt($("incrementInput")?.value, 10)) ? parseInt($("incrementInput").value, 10) : 0;
		randMin = clamp(parseInt($("randMin")?.value || "20", 10) || 20, 1, 99);
		randMax = clamp(parseInt($("randMax")?.value || "80", 10) || 80, 1, 99);
		const nextStart = chooseNextStartAfterTD();
		refreshAllNumbers();
		driveStartYard = nextStart;
		dive = null;
		activeMove = null;
		startScoreSeq("off", rb, celebrateTimer > 0, yg, nextStart);
	}
	function inGoal() {
		return playStartYard >= 95 || !!(rb && rb.y >= 94.6);
	}
	function yieldBlocker(b, minD, dd) {
		if (!rb || !b) return;
		let lat = b.sealSide || b.driveSide || Math.sign(b.x - rb.x) || 1;
		const need = minD - dd;
		if (b._escortFrom == null) b._escortFrom = rb.y;
		const shoved = rb.y - b._escortFrom;
		const peel = shoved > 1.8;
		b.x += lat * need * (peel ? 1.85 : 1.25);
		if (peel || b.y <= rb.y + 0.55) {
			b.y = Math.min(b.y + need * 0.12, rb.y + 0.7);
			b.x += lat * Math.min(0.28, 0.06 + shoved * 0.02);
		}
		b.x = clamp(b.x, fieldLeft() + .8, fieldRight() - .8);
	}
	function yieldToCarrier() {
		if (!rb) return;
		blockers.forEach((b) => {
			if (!b.active) return;
			const minD = rb.radius + b.radius + .1;
			const dd = dist(rb, b);
			if (dd < minD && dd > .01) yieldBlocker(b, minD, dd);
			else b._escortFrom = null;
		});
	}
	function separate(group, minDist) {
		for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) {
			const a = group[i], b = group[j];
			if (!a.active || !b.active) continue;
			const d = dist(a, b);
			if (d < minDist && d > .01) {
				const overlap = (minDist - d) * .38;
				const ang = Math.atan2(b.y - a.y, b.x - a.x);
				a.x -= Math.cos(ang) * overlap;
				a.y -= Math.sin(ang) * overlap * .85;
				b.x += Math.cos(ang) * overlap;
				b.y += Math.sin(ang) * overlap * .85;
				if (Math.abs(a.x - b.x) < .7) {
					const push = (.7 - Math.abs(a.x - b.x)) * .5;
					const s = a.x <= b.x ? -1 : 1;
					a.x += s * push;
					b.x -= s * push;
				}
			}
		}
	}
	function chooseNextStartAfterTD() {
		if (postTdMode === "random") {
			// Always OWN 20 through OPP 20 on a 5-yard line: abs 20,25,...,80
			const spots = [];
			for (let y = 20; y <= 80; y += 5) spots.push(y);
			return spots[Math.floor(Math.random() * spots.length)];
		}
		if (postTdMode === "fixed") return clamp(userStartYard, 1, 99);
		const step = Math.abs(tdIncrement) || 5;
		if (postTdMode === "decreasing") return clamp(driveStartYard - step, 1, 99);
		return clamp(driveStartYard + step, 1, 99); // increasing
	}
	function endPlay(reason, yardsGained, forcedBallYard = null) {
		playActive = false;
		pauseTimer = /Touchdown|Pick-six/.test(reason) ? .16 : .36;
		const yg = clamp(yardsGained, -20, 100);
		if (forcedBallYard !== null) ballYard = forcedBallYard;
		else ballYard = clamp(playStartYard + yg, 0, 100);
		if (rb) {
			const oob = reason === "Out of bounds";
			setSpotFromPlay(rb.x, oob);
		}
		if (forcedBallYard !== null) ballX = (hashLeft() + hashRight()) / 2;
		lastPlayFrames = playFrames.slice();
		if (!/Fumble|Pick-six/.test(reason)) totalYards += Math.max(0, Math.round(yg));
		updateBallOn();
		updateHUD();
		activeMove = null;
		sprintCharge = 1;
		sprintHoldT = 0;
		sprintExhausted = false;
	}
	function awardPlayYards(yg) {
		if (yg > 0) score += yg;
		if (yg >= 10) score += 10;
		if (yg < 0) score = Math.max(0, score - 2);
	}
	function clearAutoStart() {
		if (autoStartTimer) {
			clearInterval(autoStartTimer);
			autoStartTimer = null;
		}
	}
	function kitLabel(u) {
		return "Kit " + ((u && u.id != null ? u.id : 0) + 1);
	}
	function syncAbbrFromOffense() {
		const el = $("teamAbbr");
		if (el && !el.value) el.value = "EE";
		const ni = $("nameInput");
		if (ni && !ni.value) ni.value = "EE";
	}
	function getTeamAbbr() {
		const el = $("teamAbbr");
		if (!el) return "EE";
		el.value = (el.value || "EE").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "EE";
		return el.value;
	}
	function rebuildWidthSelect() {
		const sel = $("widthSelect");
		if (!sel) return;
		const current = parseInt(sel.value, 10) || FIELD_WIDTH;
		sel.innerHTML = "";
		for (let w = 5; w <= 100; w += 5) {
			const opt = document.createElement("option");
			opt.value = String(w);
			opt.textContent = w + " yd";
			if (w === current) opt.selected = true;
			sel.appendChild(opt);
		}
		FIELD_WIDTH = parseInt(sel.value, 10) || 50;
		refreshScale();
	}
	function rebuildUniformSelects() {
		const offSel = $("offUniform");
		const defSel = $("defUniform");
		if (offSel && defSel) {
			offSel.innerHTML = "";
			defSel.innerHTML = "";
			UNIFORMS.forEach((u) => {
				const o1 = document.createElement("option");
				o1.value = String(u.id);
				o1.textContent = kitLabel(u);
				if (u.id === offUni) o1.selected = true;
				offSel.appendChild(o1);
				const o2 = document.createElement("option");
				o2.value = String(u.id);
				o2.textContent = kitLabel(u);
				if (u.id === defUni) o2.selected = true;
				defSel.appendChild(o2);
			});
		}
		buildUniformBanner();
	}
	function makeUniSwatch(u, selected) {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "uni-swatch";
		btn.setAttribute("role", "option");
		btn.setAttribute("aria-selected", selected ? "true" : "false");
		btn.dataset.id = String(u.id);
		btn.setAttribute("aria-label", kitLabel(u));
		const helm = document.createElement("div");
		helm.className = "uni-helmet";
		helm.style.background = u.helmet;
		const jer = document.createElement("div");
		jer.className = "uni-jersey";
		jer.style.background = u.jersey;
		const pants = document.createElement("div");
		pants.className = "uni-pants";
		pants.style.background = u.pants;
		btn.appendChild(helm);
		btn.appendChild(jer);
		btn.appendChild(pants);
		return btn;
	}
	function buildUniformBanner() {
		const offRow = $("offUniRow");
		const defRow = $("defUniRow");
		if (!offRow || !defRow) return;
		offRow.innerHTML = "";
		defRow.innerHTML = "";
		UNIFORMS.forEach((u) => {
			const ob = makeUniSwatch(u, u.id === offUni);
			ob.onclick = () => selectOffUni(u.id);
			offRow.appendChild(ob);
			const db = makeUniSwatch(u, u.id === defUni);
			db.onclick = () => selectDefUni(u.id);
			defRow.appendChild(db);
		});
	}
	function selectOffUni(id) {
		id = parseInt(id, 10);
		if (!Number.isFinite(id)) return;
		offUni = id;
		if (defUni === offUni) {
			const alt = UNIFORMS.find((u) => u.id !== offUni);
			if (alt) defUni = alt.id;
		}
		rebuildUniformSelects();
		if (typeof paintRoster === "function") paintRoster();
	}
	function selectDefUni(id) {
		id = parseInt(id, 10);
		if (!Number.isFinite(id)) return;
		defUni = id;
		if (defUni === offUni) {
			const alt = UNIFORMS.find((u) => u.id !== defUni);
			if (alt) offUni = alt.id;
		}
		rebuildUniformSelects();
		if (typeof paintRoster === "function") paintRoster();
	}
	function refreshPersonnelUI() {
		Object.entries({
			ol: numOL,
			te: numTE,
			fb: numFB,
			qb: numQB,
			dt: numDT,
			lb: numLBs,
			db: numDBs
		}).forEach(([k, v]) => {
			const el = $(k + "Val");
			if (el) el.textContent = String(v);
		});
	}
	function modalShow(id, on) {
		const el = $(id);
		if (!el) return;
		el.classList.toggle("hidden", !on);
		el.classList.toggle("flex", on);
	}
	function randomizeSurface() {
		surface = randChoice([
			"grass",
			"fieldturf",
			"astroturf"
		]);
		turfPattern = null;
		turfPatternKey = "";
		turfTile = null;
		const sel = $("surfaceSelect");
		if (sel) sel.value = surface;
		// EZ art: diamonds 75%, mountains 25% (off/solid only if user picks)
		ezArtMode = Math.random() < 0.75 ? "diamonds" : "mountains";
		const ez = $("ezArtSelect");
		if (ez) ez.value = ezArtMode;
	}
	function fullRestart(keepOffense = false) {
		clearAutoStart();
		modalShow("nameModal", false);
		userStartYard = (typeof syncStartYardFromUI === "function") ? syncStartYardFromUI() : clamp(parseInt($("startYardInput")?.value || "90", 10) || 90, 1, 99);
		tdIncrement = Number.isFinite(parseInt($("incrementInput")?.value, 10)) ? parseInt($("incrementInput").value, 10) : 0;
		randMin = clamp(parseInt($("randMin")?.value || "20", 10) || 20, 1, 99);
		randMax = clamp(parseInt($("randMax")?.value || "80", 10) || 80, 1, 99);
		postTdMode = postTdMode || "random";
		gameSeconds = parseInt($("minSelect")?.value || "120", 10) || 120;
		clock = gameSeconds;
		if (defUni === offUni) {
			const alt = UNIFORMS.find((u) => u.id !== offUni);
			if (alt) defUni = alt.id;
		}
		randomizeSurface();
		rebuildUniformSelects();
		syncAbbrFromOffense();
		logoFlip = (() => { const r = Math.random(); return r < 0.5 ? 0 : r < 0.75 ? 1 : 2; })();
		fieldArtSide = Math.random() < .5 ? "off" : "def";
		camCorner = Math.random() < .5 ? "sw" : "nw";
		const cornerEl = $("camCornerSelect");
		if (cornerEl) cornerEl.value = camCorner;
		refreshAllNumbers();
		score = 0;
		totalYards = 0;
		tdCount = 0;
		if (gameMode === "practice") {
			const fixed = clamp(syncPracticeYardFromUI(), 1, 99);
			practiceStartYard = fixed;
			ballYard = fixed;
			playStartYard = fixed;
			driveStartYard = fixed;
		} else {
			ballYard = userToAbsolute(userStartYard);
			playStartYard = ballYard;
			driveStartYard = ballYard;
		}
		ballX = (hashLeft() + hashRight()) / 2;
		sprintCharge = 1;
		sprintHoldT = 0;
		sprintExhausted = false;
		camZoom = 1;
		breakaway = false;
		tdZoom = false;
		sessionOver = false;
		playActive = true;
		paused = false;
		pauseTimer = 0;
		activeMove = null;
		moveTimer = 0;
		moveCooldown = 0;
		celebrateTimer = 0;
		const pb = $("pauseBtn");
		if (pb) pb.textContent = "Pause";
		const banner = $("pauseBanner");
		if (banner) banner.classList.add("hidden");
		placeEntitiesForNewPlay();
		updateBallOn();
		updateHUD();
	}
	function updateHUD() {
		const s = $("score");
		if (s) s.textContent = String(score);
		const ty = $("totalYards");
		if (ty) {
			let shown = totalYards;
			if (scoreSeq && scoreSeq.who === "off") shown = totalYards + Math.max(0, Math.round(scoreSeq.playYards || 0));
			else if (playActive && rb && !scoreSeq && !fumbleSeq) shown = totalYards + Math.max(0, Math.round(rb.y - playStartYard));
			ty.textContent = String(shown);
		}
		const td = $("tdCount");
		if (td) td.textContent = String(tdCount);
		const clockEl = $("clock");
		if (clockEl) {
			if (gameMode === "practice") {
				clockEl.textContent = "OFF";
				clockEl.classList.remove("text-red-400", "font-bold", "clock-expired");
			} else {
				clockEl.textContent = formatClock(clock);
				const expired = clock <= 0;
				const low = clock > 0 && clock <= 10;
				clockEl.classList.toggle("text-red-400", low || expired);
				clockEl.classList.toggle("font-bold", low || expired);
				clockEl.classList.toggle("clock-expired", expired && !sessionOver);
			}
		}
		document.body.classList.toggle("practice-mode", gameMode === "practice");
		const ps = $("padStatus");
		if (ps) ps.textContent = padName ? "Pad · " + profileLabel(padProfile) : "Pad: — · " + profileLabel(padProfile);
	}
	function loadScores() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
		} catch {
			return [];
		}
	}
	function saveScores(list) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	}
	function renderScores() {
		const list = loadScores();
		const ol = $("scoreList");
		if (!ol) return;
		ol.innerHTML = "";
		if (!list.length) {
			ol.innerHTML = "<li class=\"text-muted\">No scores yet</li>";
			return;
		}
		list.forEach((s) => {
			const li = document.createElement("li");
			li.textContent = s.name + " — " + s.score;
			ol.appendChild(li);
		});
	}
	function tryAddScore(name, finalScore) {
		let list = loadScores();
		list.push({
			name: (name || "EE").toUpperCase().slice(0, 3),
			score: finalScore
		});
		list.sort((a, b) => b.score - a.score);
		list = list.slice(0, 5);
		saveScores(list);
		renderScores();
	}
	function expireGame() {
		clock = 0;
		sessionOver = true;
		playActive = false;
		gamesPlayed = (gamesPlayed || 0) + 1;
		const fs = $("finalScore");
		if (fs) fs.textContent = String(score);
		const ni = $("nameInput");
		if (ni) ni.value = $("teamAbbr")?.value || "EE";
		modalShow("nameModal", true);
		ni?.focus();
	}
	function submitScore() {
		clearAutoStart();
		tryAddScore(($("nameInput")?.value || $("teamAbbr")?.value || "EE").toUpperCase().slice(0, 3), score);
		modalShow("nameModal", false);
		if (gamesPlayed >= 5) modalShow("continueModal", true);
		else fullRestart(true);
	}
	function continueSet() {
		gamesPlayed = 0;
		modalShow("continueModal", false);
		fullRestart();
	}
	let replayEdge = false;
	let peekEdge = false;
	function update(dt) {
		const inp = getInput(dt);
		if (inp.replayPress && !replayEdge) startFullReplay();
		replayEdge = !!inp.replayPress;
		if (inp.peek && !peekEdge) peekToggle = !peekToggle;
		peekEdge = !!inp.peek;
		if (fullReplay) {
			if (inp.confirm || inp.replayPress || inp.pausePress) {
				fullReplay = null;
				setPaused(true);
				pauseBannerHTML("pause");
			} else {
				fullReplay.acc += dt * 1.05;
				const step = 1 / REPLAY_HZ;
				while (fullReplay && fullReplay.acc >= step) {
					fullReplay.acc -= step;
					fullReplay.i += 1;
					if (fullReplay.i >= fullReplay.frames.length) {
						fullReplay = null;
						setPaused(true);
						pauseBannerHTML("pause");
					}
				}
			}
			return;
		}
		if (pipReplay) {
			pipReplay.acc += dt;
			const step = 1 / REPLAY_HZ;
			while (pipReplay && pipReplay.acc >= step) {
				pipReplay.acc -= step;
				pipReplay.i += 1;
				if (pipReplay.i >= pipReplay.frames.length) pipReplay = null;
			}
		}
		if (Math.hypot(inp.dx, inp.dy) > .12) lastSteer = {
			dx: inp.dx,
			dy: inp.dy
		};
		// Right stick steers teammates activated by LT/RT
		if (playActive && !paused && (inp.ctrlL || inp.ctrlR)) {
			const pads = navigator.getGamepads ? navigator.getGamepads() : [];
			let g = null;
			for (let i = 0; i < pads.length; i++) {
				const p = pads[i];
				if (p && p.connected !== false) { g = p; break; }
			}
			if (g) {
				const isT3pad = /1949.*0402|Vendor:\s*1949\s*Product:\s*0402/i.test(g.id || "");
				const rx = g.axes[2] || 0;
				const ry = -(isT3pad ? (g.axes[5] || 0) : (g.axes[3] || 0));
				const rmag = Math.hypot(rx, ry);
				if (rmag > 0.18) {
					const scale = Math.min(1, (rmag - 0.18) / 0.82) / rmag;
					const rdx = rx * scale, rdy = ry * scale;
					if (inp.ctrlL) { inp.blockLdx = rdx; inp.blockLdy = rdy; }
					if (inp.ctrlR) { inp.blockRdx = rdx; inp.blockRdy = rdy; }
				}
			}
		}
		if (playActive && (inp.ctrlL || inp.ctrlR) && autoRun && Math.hypot(inp.dx, inp.dy) < .12 && Math.hypot(lastSteer.dx, lastSteer.dy) > .08) {
			inp.dx = lastSteer.dx;
			inp.dy = lastSteer.dy;
			if (inp.ctrlL && Math.hypot(inp.blockLdx, inp.blockLdy) < .12) {
				inp.blockLdx = lastSteer.dx;
				inp.blockLdy = lastSteer.dy;
			}
			if (inp.ctrlR && Math.hypot(inp.blockRdx, inp.blockRdy) < .12) {
				inp.blockRdx = lastSteer.dx;
				inp.blockRdy = lastSteer.dy;
			}
		}
		ctrlLeft = null;
		ctrlRight = null;
		if (playActive && !paused && !sessionOver) {
			if (inp.ctrlL) {
				if (!latchCtrlL || !latchCtrlL.active) latchCtrlL = nearestTeammate(-1);
				ctrlLeft = latchCtrlL;
				steerTeammate(ctrlLeft, inp.blockLdx, inp.blockLdy, dt);
			} else latchCtrlL = null;
			if (inp.ctrlR) {
				if (!latchCtrlR || !latchCtrlR.active || latchCtrlR === latchCtrlL) latchCtrlR = nearestTeammate(1, ctrlLeft);
				ctrlRight = latchCtrlR;
				steerTeammate(ctrlRight, inp.blockRdx, inp.blockRdy, dt);
			} else latchCtrlR = null;
		}
		const nameOpen = !$("nameModal")?.classList.contains("hidden");
		const contOpen = !$("continueModal")?.classList.contains("hidden");
		if (nameOpen || contOpen) {
			if (inp.confirm && !confirmEdge) {
				if (nameOpen) submitScore();
				else continueSet();
			}
			confirmEdge = inp.confirm;
			return;
		}
		confirmEdge = false;
		// Practice mode: hold at pre-snap until A / confirm; RT flips the called play
		if (practiceAwaitSnap && !paused && !fullReplay) {
			// Menu toggles: X = offense focus, B = defense focus
			if (inp.dive && !practiceAudibleEdge) {
				practiceAudibleArm = !practiceAudibleArm;
				if (practiceAudibleArm) {
					practiceDefAudibleArm = false;
					practiceFocusSide = "off";
					if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
				} else if (typeof refreshPracticePreviews === "function") {
					refreshPracticePreviews();
				}
				updateAudibleHint();
			}
			practiceAudibleEdge = !!inp.dive;
			if (inp.spin && !practiceDefAudibleEdge) {
				practiceDefAudibleArm = !practiceDefAudibleArm;
				if (practiceDefAudibleArm) {
					practiceAudibleArm = false;
					practiceFocusSide = "def";
					if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
				} else if (typeof refreshPracticePreviews === "function") {
					refreshPracticePreviews();
				}
				updateAudibleHint();
			}
			practiceDefAudibleEdge = !!inp.spin;

			const sy = inp.dy || 0;
			const rsy = inp._rsY || 0;
			const stickUp = (v) => Math.abs(v) > 0.55;

			function cycleOffense(step) {
				practiceFocusSide = "off";
				const idx = Math.max(0, OFF_PLAYS.findIndex((p) => p.id === (practiceOffPlayId || (currentPlay && currentPlay.id))));
				const ni = (idx + step + OFF_PLAYS.length) % OFF_PLAYS.length;
				if (OFF_PLAYS[ni].id !== (practiceOffPlayId || (currentPlay && currentPlay.id))) {
					practiceOffPlayIdPrev = practiceOffPlayId || (currentPlay && currentPlay.id) || null;
				}
				practiceOffPlayId = OFF_PLAYS[ni].id;
				const sel = $("practiceOffPlay");
				if (sel) sel.value = practiceOffPlayId;
				try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
				setPlayCall(OFF_PLAYS[ni].name + (practiceDefAudibleArm || practiceAudibleArm ? "  (menu)" : " — press A to snap"));
				renderPracticePlayList();
				if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
			}
			function cycleDefense(step) {
				practiceFocusSide = "def";
				const idx = Math.max(0, DEF_SCHEMES.findIndex((s) => s.id === (practiceDefSchemeId || (currentScheme && currentScheme.id))));
				const ni = (idx + step + DEF_SCHEMES.length) % DEF_SCHEMES.length;
				if (DEF_SCHEMES[ni].id !== (practiceDefSchemeId || (currentScheme && currentScheme.id))) {
					practiceDefSchemeIdPrev = practiceDefSchemeId || (currentScheme && currentScheme.id) || null;
				}
				practiceDefSchemeId = DEF_SCHEMES[ni].id;
				const sel = $("practiceDefScheme");
				if (sel) sel.value = practiceDefSchemeId;
				try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
				setPlayCall((currentPlay ? currentPlay.name : "Play") + " · vs " + DEF_SCHEMES[ni].name + (practiceDefAudibleArm ? "  (B menu — LS↕)" : " — press A to snap"));
				renderPracticeDefList();
				if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
			}


			function pickFocusedByIndex(n) {
				// n is 1-6
				const i = n - 1;
				if (practiceFocusSide === "def") {
					if (!DEF_SCHEMES[i]) return;
					if (DEF_SCHEMES[i].id !== (practiceDefSchemeId || (currentScheme && currentScheme.id))) {
						practiceDefSchemeIdPrev = practiceDefSchemeId || (currentScheme && currentScheme.id) || null;
					}
					practiceDefSchemeId = DEF_SCHEMES[i].id;
					const sel = $("practiceDefScheme");
					if (sel) sel.value = practiceDefSchemeId;
					try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
					setPlayCall((currentPlay ? currentPlay.name : "Play") + " · vs " + DEF_SCHEMES[i].name + " — press A to snap");
					renderPracticeDefList();
				} else {
					if (!OFF_PLAYS[i]) return;
					if (OFF_PLAYS[i].id !== (practiceOffPlayId || (currentPlay && currentPlay.id))) {
						practiceOffPlayIdPrev = practiceOffPlayId || (currentPlay && currentPlay.id) || null;
					}
					practiceOffPlayId = OFF_PLAYS[i].id;
					const sel = $("practiceOffPlay");
					if (sel) sel.value = practiceOffPlayId;
					try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
					setPlayCall(OFF_PLAYS[i].name + " — press A to snap");
					renderPracticePlayList();
				}
				if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
			}
			let numPick = 0;
			for (let n = 1; n <= 6; n++) {
				if (keys.has("Digit" + n) || keys.has("Numpad" + n)) { numPick = n; break; }
			}
			const bookOpen = !!(practiceAudibleArm || practiceDefAudibleArm);
			if (numPick && !practiceNumLatch && bookOpen) {
				pickFocusedByIndex(numPick);
				practiceNumLatch = true;
			} else if (!numPick) practiceNumLatch = false;

			// ← / → switch books only while a menu is open
			const bookLeft = !!(inp._dpadLeft || keys.has("ArrowLeft"));
			const bookRight = !!(inp._dpadRight || keys.has("ArrowRight"));
			if (bookOpen && (bookLeft || bookRight) && !practiceBookLatch) {
				practiceFocusSide = bookLeft ? "off" : "def";
				practiceAudibleArm = bookLeft;
				practiceDefAudibleArm = bookRight;
				practiceBookLatch = true;
				if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
				if (typeof updateAudibleHint === "function") updateAudibleHint();
			} else if (!bookLeft && !bookRight) practiceBookLatch = false;

			// Left stick / ↑↓ browse only while X or B menu is open
			if (bookOpen && !inp.ctrlL && !inp.ctrlR && stickUp(sy)) {
				if (practiceStickLatch === 0) {
					const step = sy > 0 ? -1 : 1;
					if (practiceDefAudibleArm || practiceFocusSide === "def") cycleDefense(step);
					else cycleOffense(step);
					practiceStickLatch = sy > 0 ? 1 : -1;
				}
			} else if (!stickUp(sy) || inp.ctrlL || inp.ctrlR) practiceStickLatch = 0;

			// Right stick cycles defense only in the B menu
			if (practiceDefAudibleArm && !inp.ctrlL && !inp.ctrlR && stickUp(rsy)) {
				if (practiceDefStickLatch === 0) {
					cycleDefense(rsy > 0 ? -1 : 1);
					practiceDefStickLatch = rsy > 0 ? 1 : -1;
				}
			} else if (!stickUp(rsy) || inp.ctrlL || inp.ctrlR) practiceDefStickLatch = 0;

			// Optional hotkeys (no A/B): Y/LB/RB/LT/D-pad while a menu is open
			if (practiceAudibleArm) {
				for (const m of getAudibleMap()) {
					if (m.match(inp)) {
						practiceOffPlayIdPrev = practiceOffPlayId || (currentPlay && currentPlay.id) || null;
						practiceOffPlayId = m.play.id;
						practiceAudibleArm = false;
						const sel = $("practiceOffPlay");
						if (sel) sel.value = practiceOffPlayId;
						try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
						setPlayCall(m.play.name + " — Y cancel · A snap");
						updateAudibleHint();
						if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
						confirmEdge = true;
						return;
					}
				}
			}
			if (practiceDefAudibleArm) {
				for (const m of getDefAudibleMap()) {
					if (m.match(inp)) {
						practiceDefSchemeIdPrev = practiceDefSchemeId || (currentScheme && currentScheme.id) || null;
						practiceDefSchemeId = m.scheme.id;
						practiceDefAudibleArm = false;
						const sel = $("practiceDefScheme");
						if (sel) sel.value = practiceDefSchemeId;
						try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
						setPlayCall((currentPlay ? currentPlay.name : "Play") + " · vs " + m.scheme.name + " — Y cancel · A snap");
						updateAudibleHint();
						if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
						confirmEdge = true;
						return;
					}
				}
			}

			if (inp.ctrlR && !practiceFlipEdge) {
				practiceFlipped = !practiceFlipped;
				try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
				setPlayCall((currentPlay ? currentPlay.name : "Practice") + (practiceFlipped ? " ⇄" : "") + " — press A to snap");
			}
			practiceFlipEdge = !!inp.ctrlR;
			// LT flips defensive alignment / jobs horizontally
			if (inp.ctrlL && !practiceDefFlipEdge) {
				practiceDefFlipped = !practiceDefFlipped;
				try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
				setPlayCall((currentPlay ? currentPlay.name : "Play") + (currentScheme ? " · vs " + currentScheme.name : "") + (practiceDefFlipped ? " (D⇄)" : "") + " — press A to snap");
				if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
			}
			practiceDefFlipEdge = !!inp.ctrlL;

			// Y closes the open book, or restores the last audible if no menu is open
			const yPressed = !!(inp.truck || inp.hurdle);
			if (yPressed && !practiceYCancelEdge && (practiceAudibleArm || practiceDefAudibleArm)) {
				practiceAudibleArm = false;
				practiceDefAudibleArm = false;
				setPlayCall((currentPlay ? currentPlay.name : "Play") + (currentScheme ? " · vs " + currentScheme.name : "") + " — press X/B for book · A snap");
				if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
				updateAudibleHint();
			} else if (yPressed && !practiceYCancelEdge && !practiceAudibleArm && !practiceDefAudibleArm) {
				let restored = false;
				if (practiceFocusSide === "def" && practiceDefSchemeIdPrev) {
					const tmp = practiceDefSchemeId;
					practiceDefSchemeId = practiceDefSchemeIdPrev;
					practiceDefSchemeIdPrev = tmp;
					restored = true;
				} else if (practiceOffPlayIdPrev) {
					const tmp = practiceOffPlayId;
					practiceOffPlayId = practiceOffPlayIdPrev;
					practiceOffPlayIdPrev = tmp;
					restored = true;
				} else if (practiceDefSchemeIdPrev) {
					const tmp = practiceDefSchemeId;
					practiceDefSchemeId = practiceDefSchemeIdPrev;
					practiceDefSchemeIdPrev = tmp;
					restored = true;
				}
				if (restored) {
					try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
					const on = currentPlay ? currentPlay.name : "Play";
					const dn = currentScheme ? currentScheme.name : "";
					setPlayCall(on + (dn ? " · vs " + dn : "") + " — audible cancelled · A snap");
					if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
					updateAudibleHint();
				}
			}
			practiceYCancelEdge = yPressed;

			// A snaps the ball (closes any open menu first).
			if (inp.confirm && !confirmEdge) {
				practiceAudibleArm = false;
				practiceDefAudibleArm = false;
				practiceAwaitSnap = false;
				playActive = true;
				const defName = currentScheme && currentScheme.name ? currentScheme.name : "";
				setPlayCall((currentPlay ? currentPlay.name : "Play") + (defName ? " · vs " + defName : ""));
				updateAudibleHint();
				if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
			}
			confirmEdge = inp.confirm;
			return;
		}
		practiceAudibleArm = false;
		practiceFlipEdge = false;
		if (inp.pausePress && !pauseEdge && !sessionOver) setPaused(!paused);
		pauseEdge = inp.pausePress;
		if (paused) {
			if (inp.confirm && !confirmEdge) setPaused(false);
			if ((inp.dive || keys.has("KeyX")) && !divePauseEdge) startFullReplay();
			if (inp.spin && !spinPauseEdge) {
				setPaused(false);
				fullRestart();
				confirmEdge = inp.confirm;
				spinPauseEdge = true;
				divePauseEdge = true;
				return;
			}
			confirmEdge = inp.confirm;
			spinPauseEdge = inp.spin;
			divePauseEdge = inp.dive;
			return;
		}
		confirmEdge = false;
		spinPauseEdge = inp.spin;
		divePauseEdge = inp.dive;
		if (sessionOver) return;
		if (scoreSeq) {
			if (inp.celebrate && !celebrateEdge && scoreSeq.who === "off") {
				if (!scoreSeq.spike || scoreSeq.spikeStyle === "none") {
					scoreSeq.spike = true;
					scoreSeq.spikeStyle = pickSpikeStyle(scoreSeq.player);
					scoreSeq.spikeDir = spikeDirFromInput(scoreSeq.player);
					scoreSeq.player.hasBall = false;
					scoreSeq.t = Math.min(scoreSeq.t, .06);
					scoreSeq.ballOut = false;
					celebrateTimer = 99;
				}
			}
			celebrateEdge = !!inp.celebrate;
			tickScore(dt);
			updateCamera();
			return;
		}
		if (fumbleSeq) {
			tickFumble(dt, inp);
			updateCamera();
			return;
		}
		if (!playActive) {
			pauseTimer -= dt;
			if (pauseTimer <= 0) {
				if (clock <= 0 && gameMode !== "practice") {
					expireGame();
					return;
				}
				pauseTimer = 0;
				tackleAnim = null;
				if (gameMode === "practice") {
					const fixed = clamp(practiceStartYard, 1, 99);
					ballYard = fixed;
					playStartYard = fixed;
					driveStartYard = fixed;
					ballX = (hashLeft() + hashRight()) / 2;
				} else if (nextPlayOnSnap) {
					playStartYard = ballYard;
				} else {
					playStartYard = ballYard;
				}
				try {
					placeEntitiesForNewPlay();
					currentPlay && currentPlay.name;
				} catch (err) {
					console.error(err);
				}
				if (nextPlayOnSnap || gameMode === "practice") {
					playActive = false;
					practiceAwaitSnap = true;
					practiceAudibleArm = false;
					practiceDefAudibleArm = false;
					setPlayCall((currentPlay ? currentPlay.name : "Practice") + " — X/B book · A snap");
					updateBallOn();
				} else {
					playActive = true;
					practiceAwaitSnap = false;
				}
			}
			return;
		}
		if (gameMode !== "practice" && clock > 0 && preSnapTimer <= 0) {
			clock -= dt;
			if (clock < 0) clock = 0;
		}
		if (preSnapTimer > 0) {
			preSnapTimer = Math.max(0, preSnapTimer - dt);
			updateCamera();
			updateHUD();
			return;
		}
		playAge += dt;
		const userDrive = Math.hypot(inp.dx, inp.dy) > .16 || inp.sprint || inp.spin || inp.jukeL || inp.jukeR || inp.truck || inp.hurdle || inp.dive || !!activeMove;
		if (rb && !userDrive && Math.hypot(rb.vx || 0, rb.vy || 0) < 2.4) idleCarrierT += dt;
		else idleCarrierT = 0;
		if (inp.celebrate && !celebrateEdge && rb) {
			if (celebrateTimer > 0) {
				celebrateTimer = 0;
				currentPlay && currentPlay.name;
			} else celebrateTimer = 99;
		}
		celebrateEdge = inp.celebrate;
		if (celebrateTimer > 0 && rb && fumblesOn) {
			let touching = false;
			for (const d of defenders) {
				if (d.state === "whiff" || d.state === "recover" || d.engageT > 0) continue;
				if (dist(d, rb) < rb.radius + d.radius + .32) {
					touching = true;
					if (!celebFumbleLock) {
						celebFumbleLock = true;
						if (Math.random() < .95) {
							startFumble(d);
							return;
						}
					}
					break;
				}
			}
			if (!touching) celebFumbleLock = false;
		} else celebFumbleLock = false;
		if (moveCooldown > 0) moveCooldown -= dt;
		if (getUpT > 0) {
			getUpT -= dt;
			if (rb) {
				rb.low = true;
				rb.hop = 0;
			}
			if (getUpT <= 0) {
				getUpT = 0;
				if (rb) rb.low = false;
			}
		}
		if (moveTimer > 0) {
			moveTimer -= dt;
			if (moveTimer <= 0) {
				if (activeMove === "dive" && dive) {
					finishDive(dive.phase === "slide" ? "Dive — slide" : "Dive");
					return;
				}
				if (rb && activeMove === "spin") rb.spinT = 0;
				activeMove = null;
				if (rb && getUpT <= 0) rb.low = false;
				if (rb) rb.hop = 0;
				hurdleTarget = null;
				hurdleOk = false;
			}
		}
		if (handoffDone && moveCooldown <= 0) {
			if (dpadMove) startMove(dpadMove);
			else if (inp.spin) startMove("spin");
			else if (inp.jukeL) startMove("jukeL");
			else if (inp.jukeR) startMove("jukeR");
			else if (inp.stiffL) startMove("stiffL");
			else if (inp.stiffR) startMove("stiffR");
			else if (inp.dive) startMove("dive");
			else if (inp.hurdle) startMove("hurdle");
			else if (inp.truck && celebrateTimer <= 0) startMove("truck");
		}
		if (rb) {
			const carrier = rb;
			let spd = carrier.speed * offMult() * playSpeed;
			if (!fatigueOn) {
				sprintCharge = 1;
				sprintHoldT = 0;
				sprintExhausted = false;
				if (inp.sprint) spd *= SPRINT_MULT;
			} else if (inp.sprint && !sprintExhausted && sprintCharge > .06) {
				const mix = .2 + .8 * sprintCharge;
				spd *= 1 + (SPRINT_MULT - 1) * mix;
				sprintHoldT += dt;
				if (sprintHoldT >= SPRINT_GRACE) {
					sprintCharge = Math.max(0, sprintCharge - .32 * dt);
					if (sprintCharge <= .04) sprintExhausted = true;
				}
			} else {
				sprintHoldT = 0;
				sprintCharge = Math.min(1, sprintCharge + (sprintExhausted ? .12 : .18) * dt);
				if (sprintExhausted && sprintCharge >= .42) sprintExhausted = false;
			}
			if (fatigueOn && sprintExhausted) spd *= .86;
			breakaway = false;
			if (handoffDone && defenders.length) {
				let nearestD = defenders[0];
				let nd = dist(nearestD, carrier);
				defenders.forEach((d) => {
					const dd = dist(d, carrier);
					if (dd < nd) {
						nd = dd;
						nearestD = d;
					}
				});
				const trail = rb.y - nearestD.y;
				if (nd > 6.5 && trail > 2.4) breakaway = true;
			}
			// Clear-field 1.55× only while burst is held (not a free runaway gear)
			if (breakaway && inp.sprint && !(fatigueOn && sprintExhausted)) spd *= 1.55 / SPRINT_MULT;
			let useScript = scriptIndex < scriptSteps.length;
			let sdx = 0, sdy = 0;
			if (useScript) {
				const step = scriptSteps[scriptIndex];
				sdx = step.dx;
				sdy = step.dy;
				scriptTimer += dt;
				if ((scriptIndex > 0 || !scriptLocked) && (Math.abs(inp.dx) > .15 || Math.abs(inp.dy) > .15)) {
					scriptIndex = scriptSteps.length;
					useScript = false;
				} else if (scriptTimer >= step.t) {
					scriptTimer = 0;
					scriptIndex++;
				}
			}
			let extraDx = 0, extraDy = 0;
			const phase = moveDur > 0 ? 1 - moveTimer / moveDur : 1;
			if (activeMove === "jukeL") {
				extraDx = -4.5;
				spd *= .7;
			}
			if (activeMove === "jukeR") {
				extraDx = 4.5;
				spd *= .7;
			}
			if (activeMove === "shakeL") {
				if (phase < .35) {
					extraDx = 2.4;
					spd *= .42;
				} else {
					extraDx = -5.4;
					spd *= 1.05;
				}
			}
			if (activeMove === "shakeR") {
				if (phase < .35) {
					extraDx = -2.4;
					spd *= .42;
				} else {
					extraDx = 5.4;
					spd *= 1.05;
				}
			}
			if (activeMove === "deadleg") {
				if (phase < .48) spd *= .08;
				else spd *= 1.08;
			}
			if (activeMove === "deadlegL") {
				if (phase < .45) spd *= .08;
				else {
					extraDx = -5.2;
					spd *= 1.1;
				}
			}
			if (activeMove === "deadlegR") {
				if (phase < .45) spd *= .08;
				else {
					extraDx = 5.2;
					spd *= 1.1;
				}
			}
			if (activeMove?.startsWith("hurdle")) {
				const air = Math.sin(Math.min(1, Math.max(0, phase)) * Math.PI);
				const gl = inGoal();
				rb.hop = air * (gl ? 3.85 : rb.y >= 90 ? 3.35 : 2.25);
				extraDy = (gl ? 5.1 : 3.7) + (rb.y >= 90 ? 1.85 : 0);
				spd *= gl ? 1.22 : 1.1;
				rb.low = false;
				if (activeMove === "hurdleL") extraDx = -2.4;
				if (activeMove === "hurdleR") extraDx = 2.4;
			} else if (rb && activeMove !== "spin") rb.hop = 0;
			if (activeMove === "spin") {
				const u = phase;
				const side = rb.spinSide || 1;
				rb.spinT = 1 - u;
				if (u < .26) {
					spd *= .22;
					extraDx = side * 2.05;
					extraDy = .15;
					rb.low = true;
					rb.hop = 0;
					rb.facing = Math.PI / 2 + side * .62;
				} else if (u < .78) {
					const t = (u - .26) / .52;
					spd *= 1.16;
					extraDx = -side * (6.8 * Math.sin(t * Math.PI));
					extraDy = 1.4 + 2.1 * Math.sin(t * Math.PI);
					rb.low = false;
					rb.hop = .12 * Math.sin(t * Math.PI);
					rb.facing = Math.PI / 2 + side * .62 - side * t * Math.PI * 1.7;
				} else {
					spd *= 1.2;
					extraDx = -side * 1.15;
					extraDy = 2.7;
					rb.low = false;
					rb.hop = 0;
					rb.facing = Math.PI / 2 - side * .18;
				}
			}
			const trucking = activeMove === "truck" || activeMove === "truckL" || activeMove === "truckR";
			if (trucking) {
				const dir = rb.truckDir || 0;
				const gl = inGoal();
				spd *= gl ? 1.32 : 1.08;
				extraDy += gl ? 4.6 : 1.15;
				extraDx += dir * (gl ? 3.4 : 1.35);
				rb.low = true;
				rb.hop = 0;
			}
			if (celebrateTimer > 0 && !activeMove) {
				spd *= .93;
				extraDy += .08;
			}
			if (activeMove === "dive" && dive) {
				const prog = (rb.x - dive.startX) * dive.dx + (rb.y - dive.startY) * dive.dy;
				if (dive.phase === "launch") {
					const u = clamp(prog / Math.max(.4, dive.launchYards), 0, 1);
					if (dive.duck) {
						rb.hop = 0;
						rb.low = true;
					} else {
						rb.hop = Math.sin(u * Math.PI) * (dive.pylon ? 3.65 : 1.4);
						rb.low = false;
					}
					const launchSpd = dive.launchYards / .36;
					rb.vx = dive.dx * launchSpd;
					rb.vy = dive.dy * launchSpd;
					if (prog >= dive.launchYards) {
						if (dive.pylon) rb.hop = Math.max(rb.hop, 1.25);
						else if (dive.slideYards > 0 && !dive.contacted) {
							dive.phase = "slide";
							rb.low = true;
						} else {
							finishDive("Dive");
							return;
						}
					}
				} else {
					rb.hop = 0;
					rb.low = true;
					const slideSpd = 8.5;
					rb.vx = dive.dx * slideSpd;
					rb.vy = dive.dy * slideSpd;
					if (prog >= dive.launchYards + dive.slideYards) {
						finishDive("Dive — slide");
						return;
					}
				}
			} else if (useScript) {
				rb.vx = sdx * spd;
				rb.vy = sdy * spd;
			} else {
				rb.vx = inp.dx * spd + extraDx * playSpeed;
				rb.vy = inp.dy * spd + extraDy * playSpeed;
			}
			rb.x += rb.vx * dt;
			rb.y += rb.vy * dt;
			if (Math.hypot(rb.vx, rb.vy) > .5) rb.facing = Math.atan2(rb.vy, rb.vx);
			if (activeMove?.startsWith("hurdle") && hurdleOk && hurdleTarget && !hurdleDidTrip && rb.y >= hurdleTarget.y - .2) {
				hurdleDidTrip = true;
				let trip = .46;
				if (defenders.filter((d) => d !== hurdleTarget && dist(d, hurdleTarget) < 4.3).length) trip += .14;
				if (rb.y >= 90) trip += .22;
				trip = Math.min(.86, trip);
				if (Math.random() < trip) {
					const t = hurdleTarget;
					t.state = "whiff";
					t.whiffT = .92;
					t.low = true;
					t.spinT = .95;
					t.vx = (Math.random() - .5) * 2.2;
					t.vy = 6.2 + Math.random() * 3.4;
				}
			}
			if (rb.x <= fieldLeft() + .15 || rb.x >= fieldRight() - .15) {
				const yg = Math.round(rb.y - playStartYard);
				endPlay("Out of bounds", yg);
				awardPlayYards(yg);
				return;
			}
			blockers.forEach((b) => {
				if (!b.active || !rb) return;
				const minD = rb.radius + b.radius + .08;
				const dd = dist(rb, b);
				if (dd < minD && dd > .01) yieldBlocker(b, minD, dd);
			});
		}
		const style = currentPlay ? currentPlay.blockStyle : "tight";
		const fl = fieldLeft();
		const fr = fieldRight();
		const claimedDefs = /* @__PURE__ */ new Set();
		blockers.forEach((b) => {
			if (b.blockTarget && b.blockTarget.active) claimedDefs.add(b.blockTarget);
		});
		blockers.forEach((b, idx) => {
			if (!b.active || !rb) return;
			if (b._userCtrl > 0) {
				b._userCtrl -= dt;
				return;
			}
			const nB = blockers.length;
			let targetX = b.x;
			let targetY = b.y;
			let tgt = b.blockTarget && b.blockTarget.active && b.blockTarget.state !== "whiff" ? b.blockTarget : null;
			if (tgt && rb && !b.backsideSeal) {
				const beaten = tgt.y < rb.y - 1.8 && dist(tgt, rb) + .4 < dist(b, rb);
				const stale = rb.y - tgt.y > 6.2;
				if (beaten || stale) {
					tgt.engageT = 0;
					if (tgt.state !== "whiff") tgt.state = "pursue";
					claimedDefs.delete(tgt);
					b.blockTarget = null;
					tgt = null;
				}
			}
			if (!tgt && !b.backsideSeal) {
				let best = null, nd = 8.8;
				const hole = rb.x;
				const seal = b.sealSide || b.driveSide || playSideSign() || 1;
				defenders.forEach((d) => {
					if (d.state === "whiff" || d.state === "recover" || claimedDefs.has(d)) return;
					if (d.y < rb.y - 1.6) return;
					const sameLane = Math.abs(d.x - b.x) < 3.6;
					const playSide = seal > 0 ? d.x >= hole - 1.4 : d.x <= hole + 1.4;
					if (!sameLane && !playSide) return;
					const groupBias = (b.group === "OL" && d.group === "DT") ? 0.72 : 1;
					const sideBias = playSide ? 0.82 : 1;
					const dd = (dist(d, b) * .65 + dist(d, rb) * .35) * groupBias * sideBias;
					if (dd < nd) {
						nd = dd;
						best = d;
					}
				});
				if (best) {
					claimedDefs.add(best);
					b.blockTarget = best;
					tgt = best;
				}
			}
			const behindLos = rb.y < playStartYard - .35;
			if (b.backsideSeal) {
				const side = b.sealSide || b.driveSide || 1;
				const snap = snapX();
				if (tgt && (tgt.x - snap) * side < 1.1) {
					claimedDefs.delete(tgt);
					b.blockTarget = null;
					tgt = null;
				}
				if (!tgt) {
					let best = null, bd = 12;
					defenders.forEach((d) => {
						if (d.state === "whiff" || d.state === "recover" || claimedDefs.has(d)) return;
						if ((d.x - snap) * side < 1.1) return;
						const dd = Math.hypot(d.x - (snap + side * 3.8), d.y - (playStartYard + 2.4));
						if (dd < bd) { bd = dd; best = d; }
					});
					if (best) { claimedDefs.add(best); b.blockTarget = best; tgt = best; }
				}
				if (tgt) {
					targetX = Math.max(tgt.x + side * 0.7, snap + side * 2.6);
					targetY = Math.max(tgt.y + 0.85, playStartYard + 2.4);
				} else {
					targetX = snap + side * 3.8;
					targetY = playStartYard + 2.6;
				}
				if (side > 0) targetX = Math.max(targetX, snap + 2.6);
				else targetX = Math.min(targetX, snap - 2.6);
			} else if (b.blockMode === "pull" && b.pullVia) {
				if (b.pullPhase === 0) {
					targetX = b.pullVia.x;
					targetY = b.pullVia.y;
					if (b.y <= playStartYard - .6 || dist(b, {
						x: b.pullVia.x,
						y: b.pullVia.y
					}) < 1.1) b.pullPhase = 1;
				} else if (b.pullPhase === 1) {
					targetX = b.pullVia.x2;
					targetY = b.pullVia.y2;
					if (Math.abs(b.x - b.pullVia.x2) < 1.4) b.pullPhase = 2;
				} else if (tgt) {
					const side = b.sealSide || b.driveSide || 1;
					targetX = tgt.x + side * .85;
					targetY = tgt.y + .35;
				} else {
					targetX = rb.x + (b.sealSide || playSideSign()) * 3.2;
					targetY = Math.max(playStartYard + 3.5, rb.y + 2.2);
				}
			} else if (tgt) {
				const side = b.sealSide || b.driveSide || 1;
				targetX = tgt.x + side * .9;
				targetY = tgt.y + (b.blockMode === "climb" ? .25 : .35);
				if (b.blockMode === "reach") {
					targetX = tgt.x + side * 1.15;
					targetY = tgt.y + .12;
				}
			} else if (behindLos) {
				let best = null;
				let nd = 12;
				defenders.forEach((d) => {
					if (d.state === "whiff" || d.state === "recover" || claimedDefs.has(d)) return;
					if (d.y > playStartYard + 6) return;
					const dd = dist(d, rb);
					if (dd < nd) {
						nd = dd;
						best = d;
					}
				});
				if (best) {
					claimedDefs.add(best);
					b.blockTarget = best;
					targetX = best.x + (b.sealSide || b.driveSide || 1) * .8;
					targetY = best.y + .3;
				} else {
					const f = rb.facing || Math.PI / 2;
					targetX = rb.x + Math.cos(f) * 2.4 + (idx - (nB - 1) / 2) * 1.6;
					targetY = rb.y + Math.sin(f) * 2.4;
				}
			} else {
				const lane = idx - (nB - 1) / 2;
				const gained = rb.y - playStartYard;
				let threat = null, td = 8.2;
				defenders.forEach((d) => {
					if (d.state === "whiff" || d.state === "recover" || claimedDefs.has(d)) return;
					if (d.y < rb.y - 1.2 || d.y > rb.y + 7) return;
					if (Math.abs(d.x - rb.x) > 5.5) return;
					const seal = b.sealSide || playSideSign() || 1;
					if (seal > 0 && d.x < rb.x - 3.2) return;
					if (seal < 0 && d.x > rb.x + 3.2) return;
					const dd = dist(d, b) * 0.55 + dist(d, rb) * 0.45;
					if (dd < td) {
						td = dd;
						threat = d;
					}
				});
				if (threat) {
					claimedDefs.add(threat);
					b.blockTarget = threat;
					targetX = threat.x + (b.sealSide || b.driveSide || 1) * .8;
					targetY = threat.y + .3;
				} else if (gained > 6.2) {
					const side = b.sealSide || b.driveSide || Math.sign(b.x - rb.x) || 1;
					targetX = rb.x + side * (3.3 + Math.min(3.6, (gained - 6) * .32));
					targetY = rb.y + .55;
				} else {
					const side = b.sealSide || b.driveSide || 1;
					targetX = rb.x + side * (2.2 + Math.abs(lane) * 0.55);
					targetY = Math.max(playStartYard + (b.levelY || 3), rb.y + 3.1);
					if (idleCarrierT > .4) {
						targetX = rb.x + (lane === 0 ? (b.driveSide || 1) : lane) * 3.4;
						targetY = rb.y + 3.6;
					}
				}
			}
			if (!b.backsideSeal && (playStartYard >= 95 || rb.y >= 96)) {
				const lane = idx - (nB - 1) / 2;
				targetX = snapX() + lane * 3.05 + (b.driveSide || 1) * .35;
				targetY = Math.min(103.2, playStartYard + 3.4 + Math.abs(lane) * .8);
			}
			const ang = Math.atan2(targetY - b.y, targetX - b.x);
			let bspd = b.speed * offMult() * playSpeed;
			const fatigue = playAge < 4.5 ? 1 : Math.max(.55, 1 - (playAge - 4.5) * .1);
			bspd *= fatigue;
			if (style === "wallL" || style === "wallR") bspd *= 1.12;
			if (style === "zoneR" || style === "zoneL") bspd *= 1.08;
			if (b.blockMode === "pull" && b.pullPhase < 2) bspd *= 1.18 * (b.pullBoost || 1);
			if (b.backsideSeal) bspd *= 1.22;
			if (!tgt) bspd *= 1.06;
			const step = Math.min(bspd * dt, 0.55);
			b.x += Math.cos(ang) * step;
			b.y += Math.sin(ang) * step;
			turnToward(b, ang, dt, 10);
			const backLimit = behindLos ? Math.min(playStartYard - 8, rb.y - 2) : playStartYard - 6;
			b.y = clamp(b.y, backLimit, Math.min(104.8, Math.max(rb.y + 10, playStartYard + 12)));
			b.x = clamp(b.x, fl + 1, fr - 1);
			if (b.backsideSeal) {
				const side = b.sealSide || b.driveSide || 1;
				const snap = snapX();
				if (side > 0) b.x = Math.max(b.x, snap + 2.15);
				else b.x = Math.min(b.x, snap - 2.15);
			}
		});
		blockers.forEach((b) => {
			if (!b.active) return;
			defenders.forEach((d) => {
				const gap = b.radius + d.radius + .12;
				const dd = dist(b, d);
				if (dd < gap + .08) {
					if (d.state === "whiff" || d.state === "recover" || d.recoverT > 0) return;
					// Wrong-side / past-the-defender = don't cling (anti-holding)
					const pastDef = rb && (b.y > d.y + 0.35) && dist(b, rb) > dist(d, rb);
					const wrongSide = rb && Math.sign(b.x - d.x) === Math.sign(d.x - rb.x) && Math.abs(b.x - d.x) > 0.4 && dist(b, rb) > dist(d, rb) + 0.15;
					const holding = rb && dist(d, rb) + .25 < dist(b, rb);
					if (holding || pastDef || wrongSide || rb && dist(d, rb) > 9.2) {
						d.engageT = 0;
						if (b.blockTarget === d) b.blockTarget = null;
						d.state = "recover";
						d.recoverT = .08;
						d.low = false;
						const ang = rb ? Math.atan2(rb.y - d.y, rb.x - d.x) : -Math.PI / 2;
						d.vx = Math.cos(ang) * 9;
						d.vy = Math.sin(ang) * 9;
						return;
					}
					if (d.engageT <= 0) {
						const holding2 = rb && dist(d, rb) + .25 < dist(b, rb);
						const farPlay = rb && dist(d, rb) > 8.5;
						const isDt = d.group === "DT";
						const olOnDt = isDt && (b.group === "OL" || b.group === "TE" || b.group === "FB");
						// P0a: hold the point long enough to make a lane. Slip only after
						// the block has done work, not on first contact.
						let slipP = (d._pushYards || 0) > 1.15 || d.y > 95.5 || rb && d.y > rb.y + 2.4 || playAge > 2.15 || idleCarrierT > .45 ? .72 : .28;
						if (olOnDt) slipP = (d._pushYards || 0) > 2.1 || d.y > 95.5 || playAge > 2.8 ? .38 : .1;
						// breakBlock > 1 → shed more; < 1 → stay engaged longer
						slipP = clamp(slipP * (0.55 + 0.45 * breakBlock), 0.06, 0.92);
						if (b._userCtrl > 0) slipP *= 0.35; // user-steered blockers hold much better
						if (holding2 || farPlay || idleCarrierT > .4 || Math.random() < slipP) {
							d.engageT = 0;
							d.state = "recover";
							d.recoverT = holding2 ? .08 : (olOnDt ? .28 : .16) + Math.random() * .12;
							d.low = false;
							const ang = rb ? Math.atan2(rb.y - d.y, rb.x - d.x) : -Math.PI / 2;
							d.vx = Math.cos(ang) * (8 + Math.random() * 3);
							d.vy = Math.sin(ang) * (8 + Math.random() * 3);
							return;
						}
						const fatigue = playAge < 2.2 ? 1 : Math.max(.42, 1 - (playAge - 2.2) * .22);
						// P0a: OL–DT ~1.15–1.6s; other sturdy contacts ~0.55–0.85s
						d.engageT = ((olOnDt || b.driveBlock ? 1.15 : .55) + Math.random() * (olOnDt || b.driveBlock ? .45 : .3)) * fatigue * (b.sturdyBlock ? 1.2 : 1) / Math.max(0.45, breakBlock);
						if (b._userCtrl > 0) d.engageT *= 1.65;
						// Prefer sustained blocks over pancakes; rare short pancake only
						if (b.y <= d.y + .55 && Math.random() < (d.group === "DT" ? (b.group === "OL" ? .11 : .08) : (b.group === "FB" ? .1 : .07))) {
							d.state = "whiff";
							d.pancaked = true;
							d.whiffT = 0.7 + Math.random() * .3;
							d.low = true;
							d.spinT = .35 + Math.random() * .2;
							d.vx = (Math.sign(d.x - b.x) || 1) * (1.1 + Math.random() * 0.9);
							d.vy = 1.2 + Math.random() * 1.0; // ~1–2 yd, not 20
							d.engageT = 0;
							return;
						}
					}
					d.slowed = Math.max(d.slowed, d.group === "DT" ? .62 : .42);
					const hole = rb ? rb.x : snapX();
					const side = b.sealSide || Math.sign(d.x - hole) || Math.sign(d.x - b.x) || 1;
					if (Math.sign(b.x - d.x) !== side) b.x += side * 0.1;
					const overlap = Math.max(.04, gap - dd + .1);
					let pushScale = d.group === "DT" ? 1.65 : 1;
					if (b.driveBlock) pushScale *= 1.45;
					if (b._userCtrl > 0) pushScale *= 1.55;
					// River / sturdy: hold the point, less lateral skating
					if (b.sturdyBlock && !b.backsideSeal) {
						pushScale *= 0.55;
						d.slowed = Math.max(d.slowed, 0.78);
					}
					if (b.backsideSeal) {
						pushScale *= 1.55;
						d.slowed = Math.max(d.slowed, 0.7);
						d.y += 0.16;
					}
					d.x += side * Math.min(b.sturdyBlock ? .22 : .48, (.09 + overlap * .55) * pushScale);
					let dyPush = Math.min(b.sturdyBlock ? .28 : .58, (.12 + overlap * .7) * pushScale);
					if (b.driveBlock && !b.sturdyBlock) dyPush *= 1.35;
					if (d.y > 94 && !inGoal()) dyPush *= .12;
					if (inGoal()) dyPush *= 1.15;
					if (rb && d.y > rb.y + 3.2) dyPush *= .18;
					d.y += dyPush;
					d.y = Math.min(d.y, 104.6);
					// Engaged DTs lose lag so they don't feel frozen while blocked
					if (d.group === "DT") d.dtLag = false;
					if (rb && (d.y > rb.y + 6 || dist(d, rb) > 9)) {
						d.engageT = 0;
						d.state = "recover";
						d.recoverT = .42;
						const ang = rb ? Math.atan2(rb.y - d.y, rb.x - d.x) : -Math.PI / 2;
						d.vx = Math.cos(ang) * 8.5;
						d.vy = Math.sin(ang) * 8.5;
					}
					b.x -= side * .028;
					b.y += .05;
					d._pushYards = (d._pushYards || 0) + overlap * (d.group === "DT" ? 1.25 : 1);
				}
			});
		});
		if (activeMove === "stiffL" || activeMove === "stiffR") {
			const n = stiffTarget(activeMove === "stiffL" ? -1 : 1);
			if (n && rb) {
				n.slowed = Math.max(n.slowed, .5);
				const push = 2.1;
				const ang = Math.atan2(n.y - rb.y, n.x - rb.x);
				n.x += Math.cos(ang) * push * dt * 8;
				n.y += Math.sin(ang) * push * dt * 8;
			}
		}
		blockers.forEach((b) => { if (b._userCtrl > 0) b._userCtrl = Math.max(0, b._userCtrl - dt * 0.85); });
		separate(blockers, playStartYard >= 92 || rb && rb.y >= 95 ? 2.85 : 2.65);
		separate(defenders, 2.35);
		yieldToCarrier();
		blockers.forEach((b) => {
			if (!b.backsideSeal) return;
			const side = b.sealSide || b.driveSide || 1;
			const snap = snapX();
			if (side > 0) b.x = Math.max(b.x, snap + 2.15);
			else b.x = Math.min(b.x, snap - 2.15);
		});
		defenders.forEach((d) => {
			if (!rb) return;
			if (d.engageT > 0) {
				d.engageT -= dt;
				d.y = Math.min(d.y, 104.6);
				// P0a: runner proximity must not pop the block. Only release
				// once the runner has clearly cleared the engagement.
				if (rb && d.y > rb.y + 4.2) {
					d.engageT = 0;
					d.state = "recover";
					d.recoverT = .18;
				}
				d.x = clamp(d.x, fieldLeft() + .8, fieldRight() - .8);
				return;
			}
			if (d.whiffT > 0) {
				d.whiffT -= dt;
				if (d.spinT > 0) {
					d.spinT -= dt;
					d.facing += 18 * dt;
				}
				// Hard cap slide distance while pancaked / missing
				d.vx = clamp(d.vx, -5.5, 5.5);
				d.vy = clamp(d.vy, -2.5, 4.0);
				d.x += d.vx * dt;
				d.y += d.vy * dt;
				d.low = true;
				d.state = "whiff";
				if (d.whiffT <= 0) {
					d.state = "recover";
					// Pancakes stay down longer so they cannot wrap on the get-up
					d.recoverT = d.pancaked ? 0.7 : .4;
					d.vx *= .15;
					d.vy *= .15;
				}
				d.x = clamp(d.x, fieldLeft() + .8, fieldRight() - .8);
				return;
			}
			if (d.recoverT > 0) {
				d.recoverT -= dt;
				d.state = "recover";
				if (d.spinT > 0) {
					d.spinT -= dt;
					d.facing += 10 * dt;
				}
				d.x += d.vx * dt * .3;
				d.y += d.vy * dt * .3;
				if (d.recoverT <= 0) {
					d.state = "pursue";
					d.low = false;
					d.pancaked = false;
				}
				d.x = clamp(d.x, fieldLeft() + .8, fieldRight() - .8);
				return;
			}
			if (d.readT > 0) d.readT -= dt;
			if (d.reactT > 0) d.reactT -= dt;
			if (d.misfireT > 0) d.misfireT -= dt;
			if (d.atkDecideT > 0) d.atkDecideT -= dt;
			if (d.atkT > 0) {
				d.atkT -= dt;
				if (d.atkT <= 0 && (d.atkKind === "dive" || d.atkKind === "hit")) {
					d.state = "whiff";
					d.whiffT = d.atkKind === "dive" ? 0.62 + Math.random() * 0.18 : 0.36 + Math.random() * 0.12;
					d.low = true;
					d.vx = (d.atkDX || 0) * (d.atkKind === "dive" ? 7.2 : 4.4);
					d.vy = (d.atkDY || 0) * (d.atkKind === "dive" ? 5.4 : 3.2);
					clearAttack(d);
					d.x = clamp(d.x, fieldLeft() + .8, fieldRight() - .8);
					return;
				}
				if (d.atkT <= 0) clearAttack(d);
			}
			if (d.lagT > 0) {
				d.lagT -= dt;
				if (d.lagT <= 0) d.lagT = -1;
			} else if (d.lagT < 0 && dist(d, rb) > 6) d.lagT = 0;
			d.sprintT += dt;
			const distToRb = dist(d, rb);
			const trail = rb.y - d.y;
			const zoneBehind = d.jobY != null && rb.y > d.jobY + 1.15;
			const dancing = Math.abs(rb.vx) > 9 && playAge > 8; // don't drop assignments just because the play is long
			// Moving zones (drop / spy): center tracks defender; fixed zones keep original jobX/Y
			if (d.zoneFollow) {
				d.jobX = d.x;
				d.jobY = d.y;
			}
			const zoneJob = d.job === "deep" || d.job === "drop" || d.job === "flat" || d.job === "curl" || d.job === "hook" || d.job === "robber" || d.job === "contain" || d.job === "spy" || d.job === "shade";
			const nearSideline = rb.x <= fieldLeft() + 7.2 || rb.x >= fieldRight() - 7.2;
			const wideRun = nearSideline || Math.abs(rb.x - snapX()) > 9.5;
			const outsideZoneX = d.jobX != null && Math.abs(rb.x - d.jobX) > (d.zoneRx || 5) * 0.52;
			const pastZone = (d.jobY != null && rb.y > d.jobY + 2.4) || outsideZoneX || nearSideline || wideRun;
			const atLevel = zoneJob && d.jobY != null && !pastZone && rb.y > playStartYard - 1 && rb.y > d.jobY - 8 && d.readT > 0;
			const keepDeep = (d.job === "deep" || d.job === "robber" || d.isSafety) && !pastZone && !wideRun && distToRb > 7.2 && rb.y < (d.jobY || d.y) - 1.5 && d.readT > 0;
			const rbBehindLos = rb.y < playStartYard - 0.35;
			// Close in the backfield, but not with full chase-down sprint intensity
			d.sprintOn = !rbBehindLos && (distToRb < 8.6 && trail < 3.4 || distToRb < 4.2);
			if (d.slowed > 0) {
				d.speed = d.baseSpeed * .55 * defMult() * playSpeed;
				d.slowed -= dt;
			} else {
				let lag = 1;
				if (d.dtLag && rb && (rb.y - d.y) < 10) lag = 0.55 + Math.max(0, (rb.y - d.y) / 10) * 0.45;
				else if (d.dtLag && rb && (rb.y - d.y) >= 10) d.dtLag = false;
				d.speed = d.baseSpeed * defMult() * playSpeed * lag;
			}
			if (d.sprintOn) d.speed *= SPRINT_MULT;
			// Behind LOS: still pursue, but dial back closing speed so RB can burst back to the line
			if (rbBehindLos) {
				const depth = playStartYard - rb.y; // yards behind LOS
				const closeMult = clamp(0.78 - Math.min(0.18, depth * 0.025), 0.58, 0.82);
				d.speed *= closeMult;
			}
			if (d.engageT > 0) d.speed *= (d.group === "DT" ? .18 : .32);
			if (d.lagT > 0) d.speed *= .45;
			if (trail > 2.2 && distToRb > 3.6) d.speed *= .94;
			chooseDefenderAttack(d, distToRb);
			if (!(d.atkT > 0 && (d.atkKind === "dive" || d.atkKind === "hit"))) {
				if (distToRb < 2.9) d.state = "commit";
				else if (distToRb < 5.6) d.state = "breakdown";
				else d.state = "pursue";
			}
			if (d.state === "commit" && d.lagT === 0 && distToRb < 4.4 && distToRb > 3.2) d.lagT = .04 + Math.random() * .05;
			let shownJob = d.job;
			if (d.fakeBlitz && d.reactT > 0) shownJob = d.job === "blitz" ? "drop" : "blitz";
			const runKnown = d.readT <= 0;
			const behindLos = rb.y < playStartYard - .35;
			let tx = d.x;
			let ty = d.y;
			const wrong = d.misfireT > 0 && distToRb > 7 ? blockers[d.misfireIdx] : null;
			const keepContain = d.job === "contain" && !pastZone && !wideRun && distToRb > 4 && Math.abs(rb.x - d.x) < 10;
			const holdZone = zoneJob && !pastZone && !wideRun && d.readT > 0 && distToRb > 6.4 && (atLevel || rbBehindLos);
			if (d.atkT > 0 && (d.atkKind === "dive" || d.atkKind === "hit")) {
				tx = d.x + (d.atkDX || 0) * 10;
				ty = d.y + (d.atkDY || 0) * 10;
				d.speed *= d.atkKind === "dive" ? 1.38 : 1.2;
			} else if (d.job === "spy") {
				if (playAge < 0.28) {
					tx = d.stutterX != null ? d.stutterX : d.x + 1.6;
					ty = d.stutterY != null ? d.stutterY : d.y - 1.0;
					d.spyPhase = "fake";
				} else if (Math.hypot((d.jobX != null ? d.jobX : d.x) - d.x, (d.jobY != null ? d.jobY : d.y) - d.y) > 0.85 && playAge < 0.85) {
					tx = d.jobX != null ? d.jobX : d.x;
					ty = d.jobY != null ? d.jobY : playStartYard + 6.4;
					d.spyPhase = "catch";
				} else {
					d.spyPhase = "follow";
					d.zoneFollow = true;
					tx = rb.x + (d.x < rb.x ? -0.8 : 0.8);
					ty = rb.y + 0.35;
					d.jobX = d.x;
					d.jobY = d.y;
				}
			} else if (d.stutter && playAge < .5) {
				tx = d.stutterX;
				ty = d.stutterY;
			} else if (wrong) {
				tx = wrong.x;
				ty = wrong.y;
			} else if (distToRb < 3.2) {
				tx = rb.x + (d.laneOffset || 0) * .18;
				ty = rb.y;
			} else if (keepDeep || holdZone) {
				const rx = (d.zoneRx || 5) * 1.2;
				const ry = (d.zoneRy || 3.4) * 1.15;
				tx = clamp(rb.x, (d.jobX || d.x) - rx, (d.jobX || d.x) + rx);
				ty = clamp(rb.y + .8, (d.jobY || d.y) - ry, (d.jobY || d.y) + 2.2);
				if (d.y >= 99 && rb.y < playStartYard + 1.2) ty = Math.max(ty, d.y - 0.4);
			} else if (keepContain) {
				tx = rb.x;
				ty = Math.max(rb.y - .2, playStartYard);
			} else if (d.blitzDelay && playAge < d.blitzDelay) {
				// Delayed blitz: hold / soft drift until delay elapses
				tx = d.x + (d.jobX - d.x) * 0.08;
				ty = d.y + 0.15;
			} else if (!runKnown && playAge < (.7 + (d.blitzDelay || 0)) && shownJob === "blitz") {
				tx = d.jobX;
				ty = d.jobY;
			} else if (shownJob === "man" && playAge < 1.05 && distToRb > 5) {
				const t = blockers[d.manIdx];
				if (t) {
					tx = t.x;
					ty = t.y + .8;
				} else {
					tx = rb.x + (d.laneOffset || 0) * .4;
					ty = rb.y;
				}
			} else {
				// Level-based contain: don't all collapse to the same point
				const level = d.job === "deep" || d.isSafety ? 2 : d.job === "drop" || d.job === "hook" || d.job === "robber" ? 1 : 0;
				const lead = distToRb < 3.2 ? 0 : Math.min(2.4, distToRb * (.12 + level * .04));
				const sideBias = wideRun ? 0 : (d.laneOffset || 0) * (0.35 + level * 0.15);
				const containY = wideRun ? rb.y : level === 2 ? rb.y + 2.8 : level === 1 ? rb.y + 1.1 : rb.y;
				tx = rb.x + (rb.vx || 0) * lead * .12 + sideBias;
				ty = (behindLos ? rb.y : containY) + (rb.vy || 0) * lead * .06;
				if (wideRun) tx = rb.x;
				// Support angle: shade toward the ball-carrier's open side relative to other defenders
				if (level < 2 && distToRb > 4.5) {
					let nearestAlly = null, nad = 99;
					defenders.forEach((o) => {
						if (o === d || o.state === "whiff") return;
						const dd = dist(o, d);
						if (dd < nad && dd < 9) { nad = dd; nearestAlly = o; }
					});
					if (nearestAlly) {
						const away = Math.sign(d.x - nearestAlly.x) || 1;
						tx += away * 0.55;
					}
				}
			}
			if (rb.y >= 98.4 && (d.isSafety || d.job === "deep")) {
				tx = rb.x * .7 + d.x * .3;
				ty = Math.min(98.8, Math.max(rb.y + 1.4, 96.5));
			}
			// P0b: unblocked DTs stay on their side of the LOS unless they are
			// the single designated slanter. After the runner crosses they can chase.
			if (d.group === "DT" && d.engageT <= 0 && !d.pancaked) {
				if (!d.dtPenetrate) {
					if (!rb || rb.y < playStartYard + 0.25) {
						tx = d.jobX != null ? d.x * 0.35 + d.jobX * 0.65 : tx;
						ty = Math.max(ty, d.jobY != null ? d.jobY : playStartYard + 1.6);
						ty = Math.max(ty, playStartYard + 0.45);
					}
				} else {
					ty = Math.max(ty, playStartYard - 1.05);
				}
			}
			const ang = Math.atan2(ty - d.y, tx - d.x);
			let mx = Math.cos(ang) * d.speed * dt;
			let my = Math.sin(ang) * d.speed * dt;
			const step = Math.hypot(mx, my);
			const maxStep = 1.15;
			if (step > maxStep) {
				mx *= maxStep / step;
				my *= maxStep / step;
			}
			d.x += mx;
			d.y += my;
			d.vx = mx / Math.max(dt, .001);
			d.vy = my / Math.max(dt, .001);
			turnToward(d, ang, dt, 10);
			d.x = clamp(d.x, fieldLeft() + .8, fieldRight() - .8);
			d.y = Math.min(d.y, 108.5);
			if (d.group === "DT" && d.engageT <= 0 && !d.pancaked && d.state !== "whiff") {
				if (!d.dtPenetrate && (!rb || rb.y < playStartYard + 0.25)) d.y = Math.max(d.y, playStartYard + 0.4);
				else if (d.dtPenetrate) d.y = Math.max(d.y, playStartYard - 1.15);
			}
		});
		if (tackleAnim) {
			tackleAnim.timer -= dt;
			const prog = 1 - Math.max(0, tackleAnim.timer) / tackleAnim.dur;
			const e = prog * prog;
			if (rb) {
				if (tackleAnim.mode === "truckDrive") {
					rb.x = tackleAnim.ox + tackleAnim.fx * e * tackleAnim.dist;
					rb.y = tackleAnim.oy + tackleAnim.fy * e * tackleAnim.dist;
					if (tackleAnim.defender) {
						tackleAnim.defender.x = rb.x - tackleAnim.fx * .55;
						tackleAnim.defender.y = rb.y - tackleAnim.fy * .55;
						tackleAnim.defender.low = true;
					}
				} else {
					const travel = (tackleAnim.dist || 1.2) * e;
					rb.x = tackleAnim.ox + tackleAnim.fx * travel;
					rb.y = tackleAnim.oy + tackleAnim.fy * travel;
					if (tackleAnim.defender) {
						const hold = tackleAnim.hold != null ? tackleAnim.hold : 0.55;
						tackleAnim.defender.x = rb.x - tackleAnim.fx * hold;
						tackleAnim.defender.y = rb.y - tackleAnim.fy * hold;
						tackleAnim.defender.low = true;
					}
				}
			}
			if (rb && ballBrokePlane(rb)) {
				tackleAnim = null;
				scoreTouchdown();
				return;
			}
			if (tackleAnim.timer <= 0) {
				const yg = tackleAnim.yards;
				endPlay(tackleAnim.mode === "truckDrive" ? "Truck — tackled" : "Tackled", yg);
				awardPlayYards(yg);
				tackleAnim = null;
				updateCamera();
				return;
			}
			updateCamera();
			return;
		}
		if (!playActive) {
			updateCamera();
			return;
		}
		if (handoffDone && rb && !tackleAnim) {
			const hurdling = !!activeMove?.startsWith("hurdle");
			for (const d of defenders) {
				if (d.pancaked || d.state === "whiff" || d.state === "recover") continue;
				let tackleRadius = rb.radius + d.radius + .14;
				// P0a: an engaged defender is occupied — shrink the wrap, do not
				// skip the check entirely (runner can slip the gap).
				if (d.engageT > 0) tackleRadius *= 0.38;
				const divingAtk = d.atkKind === "dive" && d.atkT > 0;
				const hittingAtk = d.atkKind === "hit" && d.atkT > 0;
				if (divingAtk) tackleRadius *= 1.55;
				else if (hittingAtk) tackleRadius *= 1.18;
				if (idleCarrierT > .5) tackleRadius += .42;
				if (rb.y - playStartYard > 10) tackleRadius *= .96;
				if (activeMove === "spin") tackleRadius *= (moveTimer / Math.max(.01, moveDur) > .28) ? .38 : .7;
				const trucking = activeMove === "truck" || activeMove === "truckL" || activeMove === "truckR";
				if (activeMove === "dive" && (dive?.squeeze || dive?.duck)) tackleRadius *= .48;
				else if (activeMove === "dive") tackleRadius *= .82;
				if (hurdling && d.low) continue;
				if (hurdling && rb.hop > .22) {
					if (d === hurdleTarget) continue;
					if (hurdleOk && Math.abs(d.x - rb.x) < 1.4) continue;
					if (rb.y >= 90 && Math.abs(d.x - rb.x) < 1.6) continue;
				}
				if (dist(rb, d) < tackleRadius) {
					if (divingAtk) {
						const toRbX = rb.x - d.x;
						const toRbY = rb.y - d.y;
						const span = Math.hypot(toRbX, toRbY) || 1;
						const align = (toRbX * (d.atkDX || 0) + toRbY * (d.atkDY || 0)) / span;
						if (align < 0.32) {
							d.state = "whiff";
							d.whiffT = 0.48 + Math.random() * 0.16;
							d.low = true;
							d.vx = (d.atkDX || 0) * 5.2;
							d.vy = (d.atkDY || 0) * 3.4;
							clearAttack(d);
							continue;
						}
						const cd = carrierDir(rb);
						const ygDive = Math.round(rb.y - playStartYard);
						clearAttack(d);
						tackleAnim = {
							mode: "tackle",
							timer: 0.42,
							dur: 0.42,
							ox: rb.x,
							oy: rb.y,
							fx: cd.x * 0.55 + (d.atkDX || 0) * 0.45,
							fy: cd.y * 0.55 + (d.atkDY || 0) * 0.45,
							dist: 1.15,
							hold: 0.5,
							yards: ygDive,
							defender: d
						};
						const flD = Math.hypot(tackleAnim.fx, tackleAnim.fy) || 1;
						tackleAnim.fx /= flD;
						tackleAnim.fy /= flD;
						return;
					}
					if (hittingAtk) {
						const finesse = !!(activeMove && (activeMove === "spin" || activeMove.startsWith("juke") || activeMove.startsWith("shake") || activeMove.startsWith("deadleg")));
						let hitWin = 0.6;
						if (finesse) hitWin = 0.22;
						if (trucking) hitWin = 0.78;
						if (d.engageT > 0) hitWin *= 0.45;
						if (Math.random() > hitWin) {
							d.state = "recover";
							d.recoverT = 0.48 + Math.random() * 0.16;
							d.low = true;
							d.vx = -(d.atkDX || Math.sign(d.x - rb.x) || 1) * 5.2;
							d.vy = -(d.atkDY || 0) * 3.4;
							clearAttack(d);
							rb.x += Math.sign(rb.x - d.x || 1) * 0.45;
							rb.y += 0.85;
							continue;
						}
					}
					if (activeMove === "dive" && dive) {
						if (ballBrokePlane(rb)) {
							finishDive("Dive");
							return;
						}
						if (!dive.contacted) {
							dive.contacted = true;
							dive.contactX = rb.x;
							dive.contactY = rb.y;
							rb.low = true;
							rb.hop = 0;
							if (dive.phase === "slide" && !dive.duck) {
								finishDive("Dive — contact");
								return;
							}
							d.state = "recover";
							d.recoverT = .28;
							d.low = true;
							d.vx = (d.x - rb.x) * 2.2;
							d.vy = 1.4;
							continue;
						}
						if (Math.hypot(rb.x - dive.contactX, rb.y - dive.contactY) >= dive.afterContactYards) {
							if (dive.duck && rb.y >= 99.2) {
								finishDive("Dive");
								return;
							}
							finishDive(dive.squeeze ? "Dive — squeezed" : "Dive — down");
							return;
						}
						continue;
					}
					if (hurdling && !(hurdleOk && d === hurdleTarget)) {
						if (inGoal()) {
							d.state = "recover";
							d.recoverT = .32;
							d.whiffT = .2;
							d.vx = (d.x - rb.x) * 3.4;
							d.vy = 2.2;
							rb.x += Math.sign(rb.x - d.x || 1) * .45;
							rb.y += .55;
							continue;
						}
						const yg = Math.round(rb.y - playStartYard);
						tackleAnim = {
							mode: "tackle",
							timer: .48,
							dur: .48,
							ox: rb.x,
							oy: rb.y,
							fx: rb.x - d.x,
							fy: rb.y - d.y,
							dist: 1.4,
							yards: yg,
							defender: d
						};
						const flen = Math.hypot(tackleAnim.fx, tackleAnim.fy) || 1;
						tackleAnim.fx /= flen;
						tackleAnim.fy /= flen;
						rb.hop = 0;
						return;
					}
					if (hurdling && hurdleOk && d === hurdleTarget) {
						if (inGoal()) {
							d.state = "whiff";
							d.whiffT = .7;
							d.low = true;
							d.vy = 5.2;
							d.vx = (d.x - rb.x) * 2;
							rb.y += .4;
						}
						continue;
					}
					if (trucking) {
						const carrier = rb;
						const pile = defenders.filter((od) => od !== d && dist(carrier, od) < 2.35).length;
						const td = carrierDir(carrier);
						if (divingAtk && pile < 1 && !inGoal()) {
							const yg = Math.round(rb.y - playStartYard);
							clearAttack(d);
							tackleAnim = {
								mode: "tackle",
								timer: .42,
								dur: .42,
								ox: rb.x,
								oy: rb.y,
								fx: rb.x - d.x,
								fy: rb.y - d.y,
								dist: 1.2,
								yards: yg,
								defender: d
							};
							const flDive = Math.hypot(tackleAnim.fx, tackleAnim.fy) || 1;
							tackleAnim.fx /= flDive;
							tackleAnim.fy /= flDive;
							return;
						}
						if (inGoal()) {
							if (pile >= 3 && Math.random() < .32) {
								const yg = Math.round(rb.y - playStartYard);
								tackleAnim = {
									mode: "truckDrive",
									timer: .4,
									dur: .4,
									ox: rb.x,
									oy: rb.y,
									fx: td.x * 0.45 + (rb.truckDir || 0) * 0.2,
									fy: Math.max(0.35, td.y),
									dist: Math.max(1.6, 101.2 - rb.y),
									yards: yg + 2,
									defender: d
								};
								return;
							}
							const dir = rb.truckDir || 0;
							d.state = "recover";
							d.recoverT = .38;
							d.low = true;
							d.x += (dir || Math.sign(d.x - rb.x) || 1) * 0.7;
							d.y += td.y * 0.55;
							d.vx = (dir || Math.sign(d.x - rb.x) || 1) * 3.2 + td.x * 1.4;
							d.vy = td.y * 2.4;
							rb.y += td.y * 0.55;
							rb.x += td.x * 0.45 + dir * .25;
							continue;
						}
						if (pile >= 1) {
							const yg = Math.round(rb.y - playStartYard);
							tackleAnim = {
								mode: "truckDrive",
								timer: .45,
								dur: .45,
								ox: rb.x,
								oy: rb.y,
								fx: td.x,
								fy: td.y,
								dist: 2.2,
								yards: yg + 2,
								defender: d
							};
							return;
						}
						const roll = Math.random();
						// P0c: open-field truck is no longer the safe button (was 55% fall-forward)
						if (roll < .28) {
							const yg = Math.round(rb.y - playStartYard);
							const extra = 1.6 + Math.random() * 2.4;
							tackleAnim = {
								mode: "truckDrive",
								timer: .7,
								dur: .7,
								ox: rb.x,
								oy: rb.y,
								fx: td.x,
								fy: td.y,
								dist: extra,
								yards: yg + Math.round(extra),
								defender: d
							};
							return;
						} else if (roll < .85) {
							d.state = "whiff";
							d.whiffT = 0.32 + Math.random() * 0.14;
							d.low = true;
							d.x += Math.sign(d.x - rb.x || 1) * (0.55 + Math.random() * 0.35);
							d.y += td.y * 0.45;
							d.vx = Math.sign(d.x - rb.x || 1) * 3.4 + td.x * 1.6;
							d.vy = td.y * 2.2;
							d.slowed = .7;
							rb.x += td.x * 0.45;
							rb.y += td.y * 0.5;
							activeMove = null;
							moveTimer = 0;
							continue;
						} else {
							d.x += (d.x - rb.x) * .4;
							d.slowed = .9;
							activeMove = null;
							continue;
						}
					}
					const yg = Math.round(rb.y - playStartYard);
					clearAttack(d);
					const mR = playerMass(rb);
					const mD = playerMass(d);
					const rvx = rb.vx || 0, rvy = rb.vy || 0;
					const dvx = clamp(d.vx || 0, -7, 7), dvy = clamp(d.vy || 0, -7, 7);
					const comx = (mR * rvx + mD * dvx) / (mR + mD);
					const comy = (mR * rvy + mD * dvy) / (mR + mD);
					let comSpd = Math.hypot(comx, comy);
					const cd = carrierDir(rb);
					if (comSpd < 0.7) {
						comSpd = 0.7;
					}
					let fx = comx / (Math.hypot(comx, comy) || 1);
					let fy = comy / (Math.hypot(comx, comy) || 1);
					if (Math.hypot(comx, comy) < 0.7) {
						fx = cd.x;
						fy = cd.y;
					}
					const along = rvx * fx + rvy * fy;
					const chasedown = along > 1.2 && (d.y < rb.y - 0.15);
					let drag = comSpd * (chasedown ? 0.26 : 0.16) * (mR / (mR + mD * 0.85));
					drag *= clamp(breakTackle, 0.55, 1.6);
					if (d.group === "DT") drag *= 0.72;
					else if (d.group === "DB") drag *= 1.12;
					drag = clamp(drag, chasedown ? 1.35 : 0.7, chasedown ? 4.4 : 2.4);
					if (breakTackle > 1.05 && Math.random() < clamp((breakTackle - 1) * 0.35, 0, 0.55)) {
						d.slowed = Math.max(d.slowed, 0.55);
						d.recoverT = 0.2 + Math.random() * 0.15;
						d.state = "recover";
						rb.x += fx * 0.25 * breakTackle;
						rb.y += fy * 0.25 * breakTackle;
						continue;
					}
					const dur = clamp((chasedown ? 0.52 : 0.38) + drag * 0.08, 0.4, 0.88);
					tackleAnim = {
						mode: "tackle",
						timer: dur,
						dur,
						ox: rb.x,
						oy: rb.y,
						fx,
						fy,
						dist: drag,
						hold: chasedown ? 0.42 : 0.55,
						yards: yg + Math.round(drag * (chasedown ? 0.7 : 0.35)),
						defender: d
					};
					return;
				}
			}
		}
		if (handoffDone && rb && !tackleAnim && !scoreSeq) {
			if (ballBrokePlane(rb)) {
				scoreTouchdown();
				return;
			}
			if (isSidelineOob(rb)) {
				const yg = Math.round(rb.y - playStartYard);
				endPlay("Out of bounds", yg);
				awardPlayYards(yg);
				return;
			}
		}
		if (rb && rb.y >= 100 && handoffDone && !scoreSeq) {
			scoreTouchdown();
			return;
		}

		// Runner path trail

		// Mesh exchange: QB → RB (handoff or pitch)
		if (playActive && !handoffDone && rb) {
			handoffT += dt;
			const style = currentPlay ? currentPlay.blockStyle : "";
			const isPitch = /wall|sweep|wedge|swing|pull/.test(style) || (currentPlay && /sweep|wedge|swing|pitch/i.test(currentPlay.name || ""));
			const tossDur = isPitch ? 0.42 : 0.28;
			if (handoffPhase === "pre") {
				if (qb) {
					qb.hasBall = true;
					rb.hasBall = false;
					// QB opens toward RB
					const ang = Math.atan2(rb.y - qb.y, rb.x - qb.x);
					qb.facing = ang;
				}
				if (handoffT > 0.08) {
					handoffPhase = "toss";
					handoffT = 0;
					if (qb) qb.hasBall = false;
					handoffBall = { x: qb ? qb.x : rb.x, y: qb ? qb.y : playStartYard };
				}
			} else if (handoffPhase === "toss") {
				const t = Math.min(1, handoffT / tossDur);
				const sx = qb ? qb.x : (handoffBall ? handoffBall.x : rb.x);
				const sy = qb ? qb.y : playStartYard;
				// Pitch arcs slightly behind LOS; handoff is tighter
				const arc = isPitch ? Math.sin(t * Math.PI) * 1.4 : Math.sin(t * Math.PI) * 0.35;
				handoffBall = {
					x: sx + (rb.x - sx) * t,
					y: sy + (rb.y - sy) * t - arc
				};
				if (t >= 1) {
					handoffDone = true;
					handoffPhase = "done";
					handoffBall = null;
					rb.hasBall = true;
					if (qb) qb.hasBall = false;
				}
			}
		}
		if (showRunnerTrail && rb && !paused && (playActive || scoreSeq) && (handoffDone || dive || activeMove === "dive" || scoreSeq)) {
			_trailAcc += dt;
			const last = runnerTrail.length ? runnerTrail[runnerTrail.length - 1] : null;
			const moved = !last || Math.hypot(rb.x - last.x, rb.y - last.y) > 0.15;
			const nearGoal = rb.y >= 96 || (dive && dive.pylon) || activeMove === "dive";
			const minT = nearGoal || dive || activeMove === "dive" ? 0.016 : 0.04;
			if ((moved || nearGoal) && _trailAcc > minT) {
				const spd = Math.hypot(rb.vx || 0, rb.vy || 0);
				runnerTrail.push({ x: rb.x, y: Math.min(100, rb.y), spd });
				_trailAcc = 0;
				if (runnerTrail.length > 600) runnerTrail.shift();
			}
		}
		updateCamera();
	}
	function wrapAng(a) {
		while (a > Math.PI) a -= Math.PI * 2;
		while (a < -Math.PI) a += Math.PI * 2;
		return a;
	}
	function turnToward(p, ang, dt, rate) {
		if (p.facing == null) {
			p.facing = ang;
			return;
		}
		const dlt = wrapAng(ang - p.facing);
		const max = (rate || 9) * dt;
		p.facing += Math.abs(dlt) < max ? dlt : Math.sign(dlt) * max;
	}
	function facingToPreset(p) {
		const facing = typeof p === "number" ? p : p && p.facing != null ? p.facing : Math.PI / 2;
		const a = (facing % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
		const raw = Math.round(a / (Math.PI / 4)) % 8;
		if (!p || typeof p === "number") return raw;
		if (p._sector == null) p._sector = raw;
		const center = p._sector * (Math.PI / 4);
		if (Math.abs(wrapAng(a - center)) > Math.PI / 4 * .78) p._sector = raw;
		return p._sector;
	}
	const TORSO_POSES = [
		{
			rx: .52,
			ry: .62,
			rot: .42,
			hx: .22,
			hy: -.82,
			nx: .18,
			ny: -.02,
			ns: .72,
			hip: .18
		},
		{
			rx: .58,
			ry: .6,
			rot: .22,
			hx: .12,
			hy: -.86,
			nx: .08,
			ny: -.06,
			ns: .55,
			hip: .1
		},
		{
			rx: .72,
			ry: .58,
			rot: 0,
			hx: 0,
			hy: -.88,
			nx: 0,
			ny: -.1,
			ns: .48,
			hip: 0
		},
		{
			rx: .58,
			ry: .6,
			rot: -.22,
			hx: -.12,
			hy: -.86,
			nx: -.08,
			ny: -.06,
			ns: .55,
			hip: -.1
		},
		{
			rx: .52,
			ry: .62,
			rot: -.42,
			hx: -.22,
			hy: -.82,
			nx: -.18,
			ny: -.02,
			ns: .72,
			hip: -.18
		},
		{
			rx: .7,
			ry: .62,
			rot: -.18,
			hx: -.1,
			hy: -.84,
			nx: -.06,
			ny: .02,
			ns: .85,
			hip: -.08
		},
		{
			rx: .85,
			ry: .65,
			rot: 0,
			hx: 0,
			hy: -.85,
			nx: 0,
			ny: .02,
			ns: 1,
			hip: 0
		},
		{
			rx: .7,
			ry: .62,
			rot: .18,
			hx: .1,
			hy: -.84,
			nx: .06,
			ny: .02,
			ns: .85,
			hip: .08
		}
	];
	function drawFootball(sx, sy, r, angle = -.4) {
		ctx.beginPath();
		ctx.ellipse(sx, sy, r * .36, r * .2, angle, 0, Math.PI * 2);
		ctx.fillStyle = "#6B3A2A";
		ctx.fill();
		ctx.strokeStyle = "#F5E6C8";
		ctx.lineWidth = .8;
		ctx.stroke();
	}
	function jerseyRingColor() {
		return getUni("off").jersey || "#3b82f6";
	}
	function drawControlRing(sx, sy, r, dashed, label) {
		const col = jerseyRingColor();
		ctx.save();
		ctx.beginPath();
		ctx.arc(sx, sy, r + 4.6, 0, Math.PI * 2);
		ctx.strokeStyle = "rgba(0,0,0,0.55)";
		ctx.lineWidth = 5.4;
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(sx, sy, r + 4.6, 0, Math.PI * 2);
		ctx.strokeStyle = col;
		ctx.lineWidth = 3.8;
		if (dashed) ctx.setLineDash([7, 5]);
		ctx.stroke();
		ctx.setLineDash([]);
		if (label) {
			ctx.font = "bold " + Math.max(11, r * .7) + "px Barlow Condensed, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
			ctx.lineWidth = 3;
			ctx.strokeStyle = "rgba(0,0,0,0.7)";
			ctx.strokeText(label, sx, sy - r - 8);
			ctx.fillStyle = col;
			ctx.fillText(label, sx, sy - r - 8);
		}
		ctx.restore();
	}
	function drawPlayer(p, isBallCarrier) {
		const pr = project(p.x, p.y);
		const r = p.radius * SCALE_X * (pr.sc || 1) * .92;
		const celebrating = isBallCarrier && celebrateTimer > 0 && p.hasBall;
		const tdSpike = !!(scoreSeq && scoreSeq.player === p && scoreSeq.spike);
		const st = tdSpike ? scoreSeq.t : 0;
		const spikeStyle = tdSpike ? scoreSeq.spikeStyle : "none";
		const spikeDir = tdSpike ? scoreSeq.spikeDir || 1 : 1;
		const spiking = tdSpike && st > .08;
		const forceSpike = spikeStyle === "force";
		const postSpike = spikeStyle === "post";
		const dunkSpike = spikeStyle === "dunk";
		const t = performance.now();
		const shuffle = forceSpike && st < .28;
		const legSwing = Math.sin(t / (celebrating || shuffle ? 68 : 90) + p.x * 3) * (celebrating || shuffle ? 1.05 : .35);
		const hopPx = (p.hop || 0) * SCALE_Y * .85 + (celebrating ? Math.abs(legSwing) * r * .28 : 0) + (spiking ? r * .16 : 0);
		const sx = pr.sx + (shuffle ? spikeDir * r * .42 * Math.sin(st / .28 * Math.PI) : 0);
		const sy = pr.sy - hopPx;
		const sector = facingToPreset(p);
		const pose = TORSO_POSES[sector] || TORSO_POSES[6];
		const d = [
			{
				lx: .55,
				ly: .5,
				rx: .55,
				ry: -.15
			},
			{
				lx: .4,
				ly: .55,
				rx: .35,
				ry: -.35
			},
			{
				lx: .25,
				ly: .55,
				rx: -.25,
				ry: .55
			},
			{
				lx: -.35,
				ly: .35,
				rx: -.4,
				ry: -.55
			},
			{
				lx: -.55,
				ly: .15,
				rx: -.55,
				ry: -.5
			},
			{
				lx: -.4,
				ly: -.35,
				rx: -.35,
				ry: .55
			},
			{
				lx: -.25,
				ly: -.55,
				rx: .25,
				ry: -.55
			},
			{
				lx: .35,
				ly: -.55,
				rx: .4,
				ry: .35
			}
		][sector];
		ctx.save();
		if (isBallCarrier && activeMove === "spin") {
			const u = moveDur > 0 ? 1 - moveTimer / Math.max(.01, moveDur) : 1;
			const side = p.spinSide || 1;
			if (u < .26) {
				ctx.translate(sx, sy + r * .14);
				ctx.scale(1.14, .74);
				ctx.translate(-sx, -(sy + r * .14));
			} else {
				ctx.translate(sx, sy);
				ctx.rotate(side * .22 * Math.sin(Math.min(1, (u - .26) / .52) * Math.PI));
				ctx.translate(-sx, -sy);
			}
		} else if (p.spinT > 0 && !(isBallCarrier && activeMove === "spin")) {
			ctx.translate(sx, sy);
			ctx.rotate(p.spinT * 16);
			if (p.low) ctx.scale(1.2, .55);
			ctx.translate(-sx, -sy);
		} else if (p.low) {
			ctx.translate(sx, sy + r * .15);
			ctx.scale(1.08, .72);
			ctx.translate(-sx, -(sy + r * .15));
		}
		ctx.strokeStyle = p.pants;
		ctx.lineWidth = Math.max(2, r * .35);
		ctx.lineCap = "round";
		ctx.beginPath();
		const knee = celebrating ? .55 : .85;
		ctx.moveTo(sx + pose.hip * r, sy + r * .2);
		ctx.lineTo(sx + d.lx * r * (.9 + legSwing * .3), sy + r * knee);
		ctx.moveTo(sx + pose.hip * r, sy + r * .2);
		ctx.lineTo(sx + d.rx * r * (.9 - legSwing * .3), sy + r * (celebrating ? .95 : .85));
		ctx.stroke();
		ctx.save();
		ctx.translate(sx + pose.hip * r, sy + r * .25);
		ctx.rotate(pose.rot * .45);
		ctx.beginPath();
		ctx.ellipse(0, 0, r * .7 * (.75 + pose.rx * .3), r * .45, pose.rot * .3, 0, Math.PI * 2);
		ctx.fillStyle = p.pants;
		ctx.fill();
		ctx.restore();
		ctx.strokeStyle = p.color;
		ctx.lineWidth = Math.max(2, r * .28);
		const armSwing = celebrating ? .15 : legSwing * .8;
		const armL = sector <= 4 ? -1 : 1;
		const puntSpike = spiking && scoreSeq && scoreSeq.spikeStyle === "punt";
		const throwSpike = spiking && scoreSeq && scoreSeq.spikeStyle === "throw";
		ctx.beginPath();
		// Skip the default free arm during special spike poses so it doesn't read as a third limb
		if (!forceSpike && !puntSpike && !dunkSpike && !postSpike) {
			ctx.moveTo(sx - r * (.45 - pose.rot * .2), sy - r * .1);
			ctx.lineTo(sx - r * .9 + armSwing * r * .3 * armL, sy + r * .35);
		}
		if (forceSpike) {
			// Windmill: shorter arc, opposite arm tucked
			ctx.moveTo(sx - r * .35, sy - r * .05);
			ctx.lineTo(sx - r * .55, sy + r * .25);
			if (st < .28) {
				ctx.moveTo(sx + r * .2, sy - r * .12);
				ctx.lineTo(sx + spikeDir * r * .7, sy - r * .28);
			} else if (!scoreSeq.ballOut) {
				const ang = -Math.PI * .15 + spikeDir * ((st - .28) / .34) * Math.PI * 2.15;
				const reach = r * 0.78;
				ctx.moveTo(sx + spikeDir * r * .1, sy - r * .08);
				ctx.lineTo(sx + Math.cos(ang) * reach, sy + Math.sin(ang) * reach);
			} else {
				ctx.moveTo(sx + spikeDir * r * .12, sy - r * .08);
				ctx.lineTo(sx + spikeDir * r * .55, sy + r * .35);
			}
		} else if (dunkSpike) {
			if (st < .48) {
				ctx.moveTo(sx - r * .22, sy - r * .2);
				ctx.lineTo(sx - r * .08, sy - r * 1.72);
				ctx.moveTo(sx + r * .24, sy - r * .2);
				ctx.lineTo(sx + r * .1, sy - r * 1.78);
			} else {
				ctx.moveTo(sx - r * .18, sy - r * .12);
				ctx.lineTo(sx + r * .04, sy + r * .62);
				ctx.moveTo(sx + r * .22, sy - r * .12);
				ctx.lineTo(sx + r * .16, sy + r * .68);
			}
		} else if (postSpike) {
			ctx.moveTo(sx - r * .15, sy - r * .2);
			ctx.lineTo(sx - r * .05, sy - r * 1.15);
			ctx.moveTo(sx + r * .2, sy - r * .2);
			ctx.lineTo(sx + r * .12, sy - r * 1.18);
		} else if (puntSpike) {
			// Plant arm + short kicking leg extension (not a long arm through the body)
			ctx.moveTo(sx - r * .4, sy - r * .05);
			ctx.lineTo(sx - r * .65, sy + r * .2);
			ctx.moveTo(sx + r * .15, sy + r * .15);
			ctx.lineTo(sx + r * .35, sy + r * .55);
		} else if (throwSpike) {
			ctx.moveTo(sx - r * .35, sy - r * .05);
			ctx.lineTo(sx - r * .55, sy + r * .22);
			ctx.moveTo(sx + r * .2, sy - r * .2);
			ctx.lineTo(sx + r * .65, sy - r * .75);
		} else if (celebrating) {
			ctx.moveTo(sx + r * .35, sy - r * .2);
			ctx.lineTo(sx + r * .85, sy - r * .55);
		} else {
			ctx.moveTo(sx + r * (.45 + pose.rot * .2), sy - r * .1);
			ctx.lineTo(sx + r * .9 - armSwing * r * .3 * armL, sy + r * .35);
		}
		ctx.stroke();
		ctx.save();
		ctx.translate(sx, sy - r * .15);
		ctx.rotate(pose.rot);
		ctx.beginPath();
		ctx.ellipse(0, 0, r * pose.rx, r * pose.ry, 0, 0, Math.PI * 2);
		ctx.fillStyle = p.color;
		ctx.fill();
		ctx.restore();
		ctx.beginPath();
		ctx.ellipse(sx + pose.hx * r, sy + pose.hy * r - r * .04, r * .46, r * .4, pose.rot * .25, 0, Math.PI * 2);
		ctx.fillStyle = p.helmet;
		ctx.fill();
		ctx.beginPath();
		ctx.ellipse(sx + pose.hx * r, sy + pose.hy * r - r * .16, r * .34, r * .16, pose.rot * .25, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(0,0,0,0.18)";
		ctx.fill();
		const visor = [
			{ hx: .22, hy: -.04 },
			{ hx: .16, hy: -.14 },
			{ hx: 0, hy: -.2 },
			{ hx: -.16, hy: -.14 },
			{ hx: -.22, hy: -.04 },
			{ hx: -.14, hy: .12 },
			{ hx: 0, hy: .18 },
			{ hx: .14, hy: .12 }
		][sector] || { hx: 0, hy: 0 };
		const mx = sx + pose.hx * r + visor.hx * r * .55;
		const my = sy + pose.hy * r + visor.hy * r * .42 + r * .08;
		ctx.strokeStyle = p.facemask || p.numColor || "#c5c8cc";
		ctx.lineWidth = Math.max(1.1, r * .07);
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(mx - r * .2, my + r * .02);
		ctx.lineTo(mx + r * .2, my + r * .02);
		ctx.moveTo(mx - r * .16, my + r * .14);
		ctx.lineTo(mx + r * .16, my + r * .14);
		ctx.moveTo(mx - r * .18, my);
		ctx.lineTo(mx - r * .18, my + r * .16);
		ctx.moveTo(mx + r * .18, my);
		ctx.lineTo(mx + r * .18, my + r * .16);
		ctx.stroke();
		ctx.save();
		ctx.translate(sx + pose.nx * r, sy - r * .05 + pose.ny * r);
		ctx.rotate(pose.rot * .65);
		ctx.globalAlpha = .35 + pose.ns * .65;
		ctx.fillStyle = p.numColor;
		ctx.font = "bold " + Math.max(8, r * 0.7) + "px IBM Plex Sans, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(String(p.number), 0, 0);
		ctx.restore();
		if (p.hasBall || isBallCarrier) {
			if (forceSpike && !scoreSeq.ballOut) {
				if (st < .28) drawFootball(sx + spikeDir * r * .9, sy - r * .4, r * 1.08, -.5);
				else {
					const ang = -Math.PI * .15 + spikeDir * ((st - .28) / .34) * Math.PI * 2.15;
					drawFootball(sx + Math.cos(ang) * r * 0.82, sy + Math.sin(ang) * r * 0.82, r * 1.08, ang);
				}
			} else if (dunkSpike && !scoreSeq.ballOut) drawFootball(sx + r * .02, sy - r * (st < .48 ? 1.72 : .2), r * 1.18, st < .48 ? -1.55 : .8);
			else if (postSpike && !scoreSeq.ballOut) drawFootball(sx + r * .05, sy - r * 1.22, r * 1.08, -1.4);
			else if (spiking && scoreSeq && (scoreSeq.spikeStyle === "punt" || scoreSeq.spikeStyle === "throw") && !scoreSeq.ballOut) drawFootball(sx + r * (scoreSeq.spikeStyle === "throw" ? .85 : .15), sy - r * (scoreSeq.spikeStyle === "throw" ? 1.2 : .2), r * 1.05, scoreSeq.spikeStyle === "throw" ? -.9 : 1.1);
			else if (celebrating) drawFootball(sx + r * 1.22, sy - r * .78, r * 1.15, -.9);
			else if (activeMove === "dive" && dive && dive.pylon && isBallCarrier) drawFootball(sx + r * 1.15, sy - r * .55, r * 1.2, -.2);
			else if (p.hasBall) drawFootball(sx + r * (.55 + pose.hx * .4), sy + r * .08, r);
		}
		ctx.restore();
		if (isBallCarrier && p.hasBall) drawControlRing(sx, sy, r, false, null);
		if (p === ctrlLeft) drawControlRing(sx, sy, r, true, null);
		if (p === ctrlRight) drawControlRing(sx, sy, r, true, null);
		if (p.state === "whiff") {
			ctx.globalAlpha = .35;
			ctx.fillStyle = "#fbbf24";
			ctx.beginPath();
			ctx.ellipse(sx, sy + r * .9, r * 1.1, r * .35, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.globalAlpha = 1;
		}
		if (forceSpike && scoreSeq && scoreSeq.ballOut && scoreSeq.t < 1.05) {
			ctx.strokeStyle = "rgba(255,255,255,0.55)";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(sx, sy + r * 1.15, r * (.4 + scoreSeq.t), 0, Math.PI * 2);
			ctx.stroke();
		}
	}
	function stripeFill(yd) {
		const stripe = Math.floor((yd + 1000) / 5) % 2 === 0;
		if (surface === "grass") return stripe ? "#5d8f4a" : "#4e7d3e";
		if (surface === "astroturf") return stripe ? "#32b056" : "#228a42";
		return stripe ? "#1f5230" : "#143820";
	}
	function turfBase() {
		if (surface === "grass") return "#4a753b";
		if (surface === "astroturf") return "#278a42";
		return "#163d24";
	}
	function fillWorldQuad(x0, y0, x1, y1, color, alpha) {
		const a = project(x0, y0), b = project(x1, y0), c = project(x1, y1), d = project(x0, y1);
		ctx.save();
		if (alpha != null && alpha < 1) ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(a.sx, a.sy);
		ctx.lineTo(b.sx, b.sy);
		ctx.lineTo(c.sx, c.sy);
		ctx.lineTo(d.sx, d.sy);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
	function fillTurfRange(y0, y1) {
		const lo = Math.min(y0, y1), hi = Math.max(y0, y1);
		const fl = fieldLeft(), fr = fieldRight();
		const start = Math.floor(lo / 5) * 5;
		for (let yd = start; yd < hi; yd += 5) {
			const a = Math.max(yd, lo), b = Math.min(yd + 5, hi);
			if (b <= a) continue;
			fillWorldQuad(fl, a, fr, b, stripeFill(yd), 1);
		}
		const pat = getTurfPattern();
		if (!pat) return;
		const a = project(fl, lo), b = project(fr, lo), c = project(fr, hi), d = project(fl, hi);
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(a.sx, a.sy);
		ctx.lineTo(b.sx, b.sy);
		ctx.lineTo(c.sx, c.sy);
		ctx.lineTo(d.sx, d.sy);
		ctx.closePath();
		ctx.clip();
		ctx.globalAlpha = surface === "astroturf" ? 0.28 : surface === "grass" ? 0.2 : 0.32;
		ctx.fillStyle = pat;
		const minX = Math.min(a.sx, b.sx, c.sx, d.sx);
		const maxX = Math.max(a.sx, b.sx, c.sx, d.sx);
		const minY = Math.min(a.sy, b.sy, c.sy, d.sy);
		const maxY = Math.max(a.sy, b.sy, c.sy, d.sy);
		ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
		ctx.restore();
	}
	function drawDiamondEndzone(yGoal, yBack, uni) {
		const fl = fieldLeft(), fr = fieldRight();
		const n = 8;
		const w = (fr - fl) / n;
		const midY = (yGoal + yBack) / 2;
		for (let i = 0; i < n; i++) {
			const cx = fl + (i + .5) * w;
			const left = fl + i * w;
			const right = fl + (i + 1) * w;
			const t = project(cx, yGoal);
			const btm = project(cx, yBack);
			const L = project(left, midY);
			const R = project(right, midY);
			ctx.beginPath();
			ctx.moveTo(t.sx, t.sy);
			ctx.lineTo(R.sx, R.sy);
			ctx.lineTo(btm.sx, btm.sy);
			ctx.lineTo(L.sx, L.sy);
			ctx.closePath();
			ctx.fillStyle = i % 2 === 0 ? (uni.endPrimary || uni.jersey) : (uni.endSecondary || uni.helmet);
			ctx.globalAlpha = .86;
			ctx.fill();
			ctx.globalAlpha = .85;
			ctx.strokeStyle = "rgba(255,255,255,0.5)";
			ctx.lineWidth = 1.3;
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
	function fillEzBackground(yGoal, yBack) {
		fillTurfRange(yGoal, yBack);
	}
	function drawMountainEndzoneWorld(yGoal, yBack, primary, secondary) {
		const uni = getUni(fieldArtSide);
		fillEzBackground(yGoal, yBack);
		if (ezArtMode === "off") {
			drawEzText(yGoal, yBack);
			return;
		}
		if (ezArtMode === "solid") {
			fillWorldQuad(fieldLeft(), yGoal, fieldRight(), yBack, uni.jersey || primary, 0.88);
			drawEzText(yGoal, yBack);
			return;
		}
		if (ezArtMode === "diamonds") {
			drawDiamondEndzone(yGoal, yBack, uni);
			drawEzText(yGoal, yBack);
			return;
		}
		const fl = fieldLeft(), fr = fieldRight();
		const a = project(fl, yGoal), b = project(fr, yGoal), c = project(fr, yBack), d = project(fl, yBack);
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(a.sx, a.sy);
		ctx.lineTo(b.sx, b.sy);
		ctx.lineTo(c.sx, c.sy);
		ctx.lineTo(d.sx, d.sy);
		ctx.closePath();
		ctx.clip();
		ctx.globalAlpha = 0.86;
		ctx.fillStyle = primary;
		ctx.fill();
		const pts = [
			[0, 0],
			[.06, .12],
			[.14, .58],
			[.22, .1],
			[.36, .92],
			[.48, .08],
			[.6, .54],
			[.72, .12],
			[.84, .64],
			[.94, .14],
			[1, 0]
		];
		ctx.globalAlpha = 0.8;
		ctx.fillStyle = secondary;
		ctx.beginPath();
		ctx.moveTo(a.sx, a.sy);
		for (const [xf, hf] of pts) {
			const p = project(fl + xf * (fr - fl), yGoal + (yBack - yGoal) * hf);
			ctx.lineTo(p.sx, p.sy);
		}
		ctx.lineTo(b.sx, b.sy);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
		drawEzText(yGoal, yBack);
	}
	function drawEzText(yGoal, yBack) {
		if (ezTextMode === "off") return;
		let label = ezTextMode === "custom" ? String(ezCustomText || "").trim() : "ELEVATION EDGE";
		if (!label) return;
		// Allow letters, numbers, spaces, punctuation, symbols, emoji — no forced case
		label = Array.from(label).slice(0, 48).join("");
		const fl = fieldLeft(), fr = fieldRight();
		const midY = yGoal + (yBack - yGoal) * .52;
		const mid = project((fl + fr) / 2, midY);
		const left = project(fl + 1.2, midY);
		const right = project(fr - 1.2, midY);
		const ang = Math.atan2(right.sy - left.sy, right.sx - left.sx);
		const span = Math.hypot(right.sx - left.sx, right.sy - left.sy);
		ctx.save();
		ctx.translate(mid.sx, mid.sy);
		ctx.rotate(ang);
		const fs = Math.max(14, Math.min(span * .13, 56) * Math.min(1, 16 / Math.max(8, label.length)));
		ctx.font = "bold " + fs + "px Barlow Condensed, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.lineJoin = "round";
		ctx.lineWidth = Math.max(4, fs * .12);
		ctx.strokeStyle = "rgba(0,0,0,0.7)";
		ctx.strokeText(label, 0, 0);
		ctx.fillStyle = "#FFFFFF";
		ctx.globalAlpha = .95;
		ctx.fillText(label, 0, 0);
		ctx.restore();
		ctx.globalAlpha = 1;
	}


	function drawMidfieldLogo() {
		if (!midLogoOn) return;
		const fl = fieldLeft(), fr = fieldRight();
		const midP = project(fl + FIELD_WIDTH / 2, 50);
		if (midP.sy < -120 || midP.sy > canvas.height + 120) return;
		const left = project(fl, 50);
		const right = project(fr, 50);
		const ang = Math.atan2(right.sy - left.sy, right.sx - left.sx);
		const uni = getUni(fieldArtSide);
		const span = Math.hypot(right.sx - left.sx, right.sy - left.sy);
		const radX = Math.min(span * .11, FIELD_WIDTH * .15 * SCALE_X);
		const radY = radX * .72;
		ctx.save();
		ctx.translate(midP.sx, midP.sy);
		ctx.rotate(ang + (logoFlip === 1 ? Math.PI / 2 : logoFlip === 2 ? -Math.PI / 2 : 0));
		ctx.fillStyle = uni.logoFill || uni.helmet;
		ctx.globalAlpha = .86;
		ctx.beginPath();
		ctx.moveTo(-radX * 1.3, radY * .7);
		ctx.lineTo(-radX * .5, -radY * .55);
		ctx.lineTo(-radX * .05, radY * .15);
		ctx.lineTo(radX * .45, -radY * .75);
		ctx.lineTo(radX * 1.3, radY * .7);
		ctx.closePath();
		ctx.fill();
		ctx.globalAlpha = .95;
		ctx.beginPath();
		ctx.ellipse(0, 0, radX, radY * .85, 0, 0, Math.PI * 2);
		ctx.strokeStyle = uni.logoMark || uni.jersey;
		ctx.lineWidth = Math.max(2.5, radY * .08);
		ctx.stroke();
		ctx.globalAlpha = .92;
		ctx.fillStyle = uni.logoMark || uni.jersey;
		ctx.font = "bold " + Math.max(20, radY * .85) + "px Barlow Condensed, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("EE", 0, 0);
		ctx.restore();
		ctx.globalAlpha = 1;
	}
	function stepsToWorldPts(steps, ax, ay, sx, sy) {
		sx = sx == null ? 8.4 : sx;
		sy = sy == null ? 6.6 : sy;
		let px = ax, py = ay;
		const pts = [[px, py]];
		(steps || []).forEach((st) => {
			px += (st.dx || 0) * sx;
			py += (st.dy || 0) * sy;
			pts.push([px, py]);
		});
		return pts;
	}
	function playArrowWorld(play, ax, ay) {
		if (play && play.steps && play.steps.length) {
			const pts = stepsToWorldPts(play.steps, ax, ay);
			return { type: pts.length >= 3 ? "poly" : "poly", pts };
		}
		if (play && play.arrow && play.arrow.length) {
			let px = ax, py = ay;
			const pts = [[px, py]];
			play.arrow.forEach((dx) => {
				px += dx * 6;
				py += 5;
				pts.push([px, py]);
			});
			return { type: "poly", pts };
		}
		return { type: "poly", pts: [[ax, ay], [ax, ay + 7]] };
	}
	function drawWorldPoly(pts, color, width, alpha, arrow, dashed) {
		if (!pts || pts.length < 2) return;
		const scr = pts.map((p) => project(p[0], p[1]));
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.lineWidth = width;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		if (dashed) ctx.setLineDash([7, 5]);
		ctx.beginPath();
		ctx.moveTo(scr[0].sx, scr[0].sy);
		for (let i = 1; i < scr.length; i++) ctx.lineTo(scr[i].sx, scr[i].sy);
		ctx.stroke();
		if (dashed) ctx.setLineDash([]);
		if (arrow) {
			const last = scr[scr.length - 1];
			const prev = scr[scr.length - 2];
			const ang = Math.atan2(last.sy - prev.sy, last.sx - prev.sx);
			ctx.beginPath();
			ctx.moveTo(last.sx, last.sy);
			ctx.lineTo(last.sx - Math.cos(ang - .4) * 10, last.sy - Math.sin(ang - .4) * 10);
			ctx.lineTo(last.sx - Math.cos(ang + .4) * 10, last.sy - Math.sin(ang + .4) * 10);
			ctx.closePath();
			ctx.fill();
		}
		ctx.restore();
	}
	function drawWorldCurve(pts, color, width, a0, a1) {
		if (!pts || pts.length < 3) return;
		if (a1 == null) a1 = a0;
		if (a0 <= .02 && a1 <= .02) return;
		const ax = pts[0][0], ay = pts[0][1];
		const cx = pts[1][0], cy = pts[1][1];
		const bx = pts[2][0], by = pts[2][1];
		function q(t) {
			const u = 1 - t;
			return [u * u * ax + 2 * u * t * cx + t * t * bx, u * u * ay + 2 * u * t * cy + t * t * by];
		}
		ctx.save();
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		const n = 10;
		for (let i = 0; i < n; i++) {
			const t0 = i / n, t1 = (i + 1) / n;
			const p0 = q(t0), p1 = q(t1);
			const al = a0 + (a1 - a0) * t0;
			if (al < .03) continue;
			const s0 = project(p0[0], p0[1]), s1 = project(p1[0], p1[1]);
			ctx.strokeStyle = colorAlpha(color, al);
			ctx.lineWidth = width;
			ctx.beginPath();
			ctx.moveTo(s0.sx, s0.sy);
			ctx.lineTo(s1.sx, s1.sy);
			ctx.stroke();
		}
		if (a1 > .05) {
			const c = project(cx, cy);
			const b = project(bx, by);
			const ang = Math.atan2(b.sy - c.sy, b.sx - c.sx);
			ctx.fillStyle = colorAlpha(color, a1);
			ctx.beginPath();
			ctx.moveTo(b.sx, b.sy);
			ctx.lineTo(b.sx - Math.cos(ang - .4) * 10, b.sy - Math.sin(ang - .4) * 10);
			ctx.lineTo(b.sx - Math.cos(ang + .4) * 10, b.sy - Math.sin(ang + .4) * 10);
			ctx.closePath();
			ctx.fill();
		}
		ctx.restore();
	}

	function speedTrailColor(spd) {
		// Smooth blue→cyan→green→yellow→orange→red (more stops + wider speed range)
		const t = Math.max(0, Math.min(1, (spd - 1.5) / 14));
		const stops = [
			[35, 70, 210],
			[30, 140, 220],
			[40, 190, 140],
			[80, 210, 60],
			[200, 220, 45],
			[240, 170, 35],
			[235, 100, 30],
			[210, 35, 35]
		];
		const x = t * (stops.length - 1);
		const i = Math.floor(x);
		const f = x - i;
		const a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
		// smoothstep for less banding
		const s = f * f * (3 - 2 * f);
		return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * s) + "," + Math.round(a[1] + (b[1] - a[1]) * s) + "," + Math.round(a[2] + (b[2] - a[2]) * s) + ")";
	}
	function strokeTrailWorld(pts) {
		if (!pts || pts.length < 2) return;
		ctx.save();
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.strokeStyle = "rgba(120, 12, 18, 0.88)";
		ctx.lineWidth = 2.6;
		ctx.beginPath();
		const p0 = project(pts[0].x, pts[0].y);
		ctx.moveTo(p0.sx, p0.sy);
		for (let i = 1; i < pts.length; i++) {
			const p = project(pts[i].x, pts[i].y);
			ctx.lineTo(p.sx, p.sy);
		}
		ctx.stroke();
		ctx.restore();
	}

	function drawHandoffBall() {
		if (!handoffBall || handoffDone) return;
		const p = project(handoffBall.x, handoffBall.y);
		ctx.save();
		ctx.fillStyle = "#c45a1a";
		ctx.beginPath();
		ctx.ellipse(p.sx, p.sy, 5.2, 3.4, -0.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
	function drawRunnerTrail() {
		if (!showRunnerTrail || !runnerTrail || runnerTrail.length < 2) return;
		strokeTrailWorld(runnerTrail);
	}
	function drawRouteArrow() {
		if (!currentPlay) return;
		if (playArtMode === "off" || playArtMode === "defense") return;
		const a0 = artAlpha(0), a1 = artAlpha(1);
		if (a0 <= .02 && a1 <= .02) return;
		const ax = playArtAnchor.x;
		const ay = playArtAnchor.y;
		if (currentPlay.altSteps && currentPlay.altSteps.length) {
			const alt = { type: "poly", pts: stepsToWorldPts(currentPlay.altSteps, ax, ay) };
			drawWorldPoly(alt.pts, "#FBBF24", 2.4, Math.max(a0, a1) * .7, true, true);
		}
		const art = playArrowWorld(currentPlay, ax, ay);
		if (art.type === "curve") drawWorldCurve(art.pts, "#FBBF24", 3.2, a0, a1);
		else drawWorldPoly(art.pts, "#FBBF24", 3.2, Math.max(a0, a1) * .9, true, false);
	}
	function drawPlayingSurface(sx0, fTop, sx1, fBot) {
		fillTurfRange(0, 100);
	}
	function fillWorldPattern(pat, sx0, fTop, w, h) {
		const originY = toScreenY(0);
		ctx.save();
		ctx.translate(sx0, originY);
		ctx.fillStyle = pat;
		ctx.fillRect(0, fTop - originY, w, h);
		ctx.restore();
	}
	let turfPattern = null;
	let turfPatternKey = "";
	let turfTile = null;
	function getTurfPattern() {
		const key = surface;
		if (turfPattern && turfPatternKey === key) return turfPattern;
		turfPatternKey = key;
		const tile = document.createElement("canvas");
		tile.width = 64;
		tile.height = 64;
		const t = tile.getContext("2d");
		if (!t) return null;
		if (surface === "grass") {
			t.fillStyle = "#466f38";
			t.fillRect(0, 0, 64, 64);
			for (let i = 0; i < 220; i++) {
				const x = hash2(i, 3) * 64;
				const y = hash2(i, 9) * 64;
				t.fillStyle = hash2(i, 17) > .55 ? "#6a9a56" : "#35582c";
				t.globalAlpha = 0.45 + hash2(i, 21) * 0.5;
				t.fillRect(x, y, 1.2 + hash2(i, 5), 2.4 + hash2(i, 7) * 2.2);
			}
			t.globalAlpha = 1;
		} else if (surface === "astroturf") {
			// Old carpet turf: bright green + tight weave, almost no crumb rubber
			t.fillStyle = "#2b9348";
			t.fillRect(0, 0, 64, 64);
			t.strokeStyle = "rgba(18, 70, 32, 0.55)";
			t.lineWidth = 1;
			for (let x = 0; x <= 64; x += 3) {
				t.beginPath(); t.moveTo(x + 0.5, 0); t.lineTo(x + 0.5, 64); t.stroke();
			}
			t.strokeStyle = "rgba(12, 55, 26, 0.4)";
			for (let y = 0; y <= 64; y += 3) {
				t.beginPath(); t.moveTo(0, y + 0.5); t.lineTo(64, y + 0.5); t.stroke();
			}
			t.fillStyle = "rgba(180, 230, 160, 0.18)";
			t.fillRect(0, 0, 64, 64);
		} else {
			// Field turf: dark modern turf + crumb-rubber speckle
			t.fillStyle = "#163d24";
			t.fillRect(0, 0, 64, 64);
			t.fillStyle = "#0a0a0a";
			for (let i = 0; i < 160; i++) {
				const x = hash2(i + 40, 5) * 64;
				const y = hash2(i + 40, 11) * 64;
				const r = .5 + hash2(i, 19) * 1.2;
				t.globalAlpha = .5 + hash2(i, 23) * .45;
				t.beginPath();
				t.arc(x, y, r, 0, Math.PI * 2);
				t.fill();
			}
			t.globalAlpha = 1;
		}
		turfPattern = ctx.createPattern(tile, "repeat");
		return turfPattern;
	}
	function colorAlpha(color, a) {
		const al = clamp(a, 0, 1);
		if (!color) return "rgba(255,255,255," + al + ")";
		if (color.startsWith("rgba")) return color.replace(/rgba\(([^)]+)\)/, (_, inner) => {
			const parts = inner.split(",").map((s) => s.trim());
			return "rgba(" + parts[0] + "," + parts[1] + "," + parts[2] + "," + al + ")";
		});
		if (color[0] === "#" && (color.length === 7 || color.length === 4)) {
			let r, g, b;
			if (color.length === 7) {
				r = parseInt(color.slice(1, 3), 16);
				g = parseInt(color.slice(3, 5), 16);
				b = parseInt(color.slice(5, 7), 16);
			} else {
				r = parseInt(color[1] + color[1], 16);
				g = parseInt(color[2] + color[2], 16);
				b = parseInt(color[3] + color[3], 16);
			}
			return "rgba(" + r + "," + g + "," + b + "," + al + ")";
		}
		return color;
	}
	function artAlpha(along) {
		if (peekHeld || peekToggle) return .92;
		if (preSnapTimer > 0) return Math.min(1, preSnapTimer / .25) * .95;
		const practice = gameMode === "practice";
		const hold = (practice ? 0.42 : 0.22) + clamp(along, 0, 1) * 0.12;
		const fadeDur = practice ? 0.55 : 0.32;
		const t = playAge - hold;
		if (t <= 0) return .82;
		return Math.max(0, .82 * (1 - t / fadeDur));
	}
	function artAlphaOff(along) {
		if (peekHeld || peekToggle) return .92;
		if (preSnapTimer > 0) return Math.min(1, preSnapTimer / .25) * .95;
		const practice = gameMode === "practice";
		const hold = (practice ? 0.92 : 0.72) + clamp(along, 0, 1) * 0.12;
		const fadeDur = practice ? 0.55 : 0.32;
		const t = playAge - hold;
		if (t <= 0) return .82;
		return Math.max(0, .82 * (1 - t / fadeDur));
	}
	function zoneAlpha() {
		if (peekHeld || peekToggle) return .9;
		if (preSnapTimer > 0) return Math.min(1, preSnapTimer / .25) * .95;
		const practice = gameMode === "practice";
		// Start the fade when def arrows die, then 1s to off
		const hold = practice ? 0.97 : 0.54;
		const fadeDur = 1.0;
		const t = playAge - hold;
		if (t <= 0) return .62;
		return Math.max(0, .62 * (1 - t / fadeDur));
	}
	function drawAssignmentArrow(x0, y0, x1, y1, color, a0, a1, noHead) {
		if (a0 == null) a0 = .9;
		if (a1 == null) a1 = a0;
		if (a0 <= .02 && a1 <= .02) return;
		const n = 7;
		ctx.save();
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		for (let i = 0; i < n; i++) {
			const t0 = i / n, t1 = (i + 1) / n;
			const xa = x0 + (x1 - x0) * t0, ya = y0 + (y1 - y0) * t0;
			const xb = x0 + (x1 - x0) * t1, yb = y0 + (y1 - y0) * t1;
			const al = a0 + (a1 - a0) * t0;
			if (al < .03) continue;
			const pa = project(xa, ya), pb = project(xb, yb);
			ctx.globalAlpha = 1;
			ctx.strokeStyle = colorAlpha(color, al);
			ctx.lineWidth = 2.2;
			ctx.beginPath();
			ctx.moveTo(pa.sx, pa.sy);
			ctx.lineTo(pb.sx, pb.sy);
			ctx.stroke();
		}
		// Arrowheads only for attack paths (blitz/man). Zone links are plain lines to zone center.
		if (!noHead && a1 > .05) {
			const a = project(x0, y0);
			const b = project(x1, y1);
			const ang = Math.atan2(b.sy - a.sy, b.sx - a.sx);
			ctx.fillStyle = colorAlpha(color, a1);
			ctx.beginPath();
			ctx.moveTo(b.sx, b.sy);
			ctx.lineTo(b.sx - Math.cos(ang - .4) * 8, b.sy - Math.sin(ang - .4) * 8);
			ctx.lineTo(b.sx - Math.cos(ang + .4) * 8, b.sy - Math.sin(ang + .4) * 8);
			ctx.closePath();
			ctx.fill();
		}
		ctx.restore();
	}
	function drawBlockT(x0, y0, segs, a0, a1) {
		if (!segs || !segs.length) return;
		if (a0 == null) a0 = .9;
		if (a1 == null) a1 = a0;
		if (a0 <= .02 && a1 <= .02) return;
		const pts = [[x0, y0], ...segs];
		ctx.save();
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		for (let i = 0; i < pts.length - 1; i++) {
			const t0 = i / Math.max(1, pts.length - 1);
			const al = a0 + (a1 - a0) * t0;
			if (al < .03) continue;
			const p0 = project(pts[i][0], pts[i][1]);
			const p1 = project(pts[i + 1][0], pts[i + 1][1]);
			ctx.strokeStyle = colorAlpha("rgba(210,214,208,0.9)", al);
			ctx.lineWidth = 2.1;
			ctx.beginPath();
			ctx.moveTo(p0.sx, p0.sy);
			ctx.lineTo(p1.sx, p1.sy);
			ctx.stroke();
		}
		const last = segs[segs.length - 1];
		const prev = segs.length > 1 ? segs[segs.length - 2] : [x0, y0];
		if (a1 > .05) {
			const ang = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
			const cap = .85;
			const c1 = project(last[0] + Math.cos(ang + Math.PI / 2) * cap, last[1] + Math.sin(ang + Math.PI / 2) * cap);
			const c2 = project(last[0] + Math.cos(ang - Math.PI / 2) * cap, last[1] + Math.sin(ang - Math.PI / 2) * cap);
			ctx.strokeStyle = colorAlpha("rgba(210,214,208,0.9)", a1);
			ctx.lineWidth = 2.1;
			ctx.beginPath();
			ctx.moveTo(c1.sx, c1.sy);
			ctx.lineTo(c2.sx, c2.sy);
			ctx.stroke();
		}
		ctx.restore();
	}
	function drawZoneCloud(x, y, rx, ry, color, alpha) {
		if (alpha <= .02) return;
		const c = project(x, y);
		const r = project(x + rx, y);
		const t = project(x, y + ry);
		const px = Math.max(9, Math.abs(r.sx - c.sx));
		const py = Math.max(8, Math.abs(t.sy - c.sy));
		ctx.save();
		ctx.globalAlpha = 1;
		ctx.fillStyle = colorAlpha(color, alpha);
		ctx.strokeStyle = colorAlpha(color, Math.min(1, alpha * 2.4));
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.ellipse(c.sx, c.sy, px, py, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}
	
	function getDefAudibleMap() {
		const schemes = DEF_SCHEMES.slice();
		return AUDIBLE_BUTTONS.map((b, i) => ({
			...b,
			scheme: schemes[i] || null
		})).filter((x) => x.scheme);
	}
	function getAudibleMap() {
		const plays = OFF_PLAYS.slice();
		return AUDIBLE_BUTTONS.map((b, i) => ({
			...b,
			play: plays[i] || null
		})).filter((x) => x.play);
	}
	function updateAudibleHint() {
		const el = $("audibleHint");
		if (!el) return;
		if (!practiceAwaitSnap) {
			el.classList.add("hidden");
			return;
		}
		if (practiceAudibleArm) {
			const lines = [
				"OFFENSE MENU — Left stick ↕ to browse",
				...getAudibleMap().map((m) => m.label + "  " + m.play.name),
				"A = confirm · X = close"
			];
			el.classList.remove("hidden");
			el.textContent = lines.join("\n");
			return;
		}
		if (practiceDefAudibleArm) {
			const lines = [
				"DEFENSE MENU — Left stick ↕ to browse",
				...getDefAudibleMap().map((m) => m.label + "  " + m.scheme.name),
				"A = confirm · B = close"
			];
			el.classList.remove("hidden");
			el.textContent = lines.join("\n");
			return;
		}
		el.classList.remove("hidden");
		el.textContent = "X offense book · B defense book · Y close · A snap";
	}
	function audibleLabelForPlay(playId) {
		const map = getAudibleMap();
		const hit = map.find((m) => m.play && m.play.id === playId);
		return hit ? hit.label : "";
	}
		function stylePrevBlock(side) {
		const uni = getUni(side);
		const jer = uni.jersey || "#888";
		const block = $(side === "def" ? "prevDefBlock" : "prevOffBlock");
		const banner = $(side === "def" ? "prevDefBanner" : "prevOffBanner");
		const label = $(side === "def" ? "prevDefLabel" : "prevOffLabel");
		const btn = $(side === "def" ? "prevDefBtn" : "prevOffBtn");
		const numEl = $(side === "def" ? "prevDefNum" : "prevOffNum");
		if (block) block.style.borderColor = jer;
		if (banner) {
			banner.style.background = jer;
			const hex = jer.replace("#", "");
			let lum = 128;
			if (hex.length >= 6) {
				const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
				lum = 0.299 * r + 0.587 * g + 0.114 * b;
			}
			banner.style.color = lum > 160 ? "#111" : "#fff";
		}
		if (side === "def") {
			const idx = Math.max(0, DEF_SCHEMES.findIndex((s) => s.id === (practiceDefSchemeId || (currentScheme && currentScheme.id))));
			const scheme = DEF_SCHEMES[idx] || currentScheme;
			if (numEl) numEl.textContent = scheme ? String(idx + 1) : "";
			if (label) label.textContent = scheme ? scheme.name + (practiceDefFlipped ? " ⇄" : "") : "Defense";
			if (btn) {
				const hit = getDefAudibleMap().find((m) => m.scheme && scheme && m.scheme.id === scheme.id);
				btn.textContent = hit ? hit.label : "";
				btn.style.display = hit ? "" : "none";
			}
		} else {
			const stockId = practiceOffPlayId || (currentPlay && currentPlay.baseId) || (currentPlay && currentPlay.id) || "";
			const idx = Math.max(0, OFF_PLAYS.findIndex((p) => p.id === stockId));
			const play = OFF_PLAYS[idx] || currentPlay;
			if (numEl) numEl.textContent = play ? String(idx + 1) : "";
			if (label) label.textContent = play ? play.name + (practiceFlipped ? " ⇄" : "") : "Offense";
			if (btn) {
				let lab = play ? audibleLabelForPlay(play.id) : "";
				if (!lab && play) {
					const base = String(play.id).replace(/[LR]$/, "");
					const hit = getAudibleMap().find((m) => m.play.id.replace(/[LR]$/, "") === base);
					lab = hit ? hit.label : "";
				}
				btn.textContent = lab || "";
				btn.style.display = lab ? "" : "none";
			}
		}
	}
function drawMiniPreview(canvas, kind) {
		if (!canvas) return;
		const c = canvas.getContext("2d");
		if (!c) return;
		const W = canvas.width, H = canvas.height;
		c.clearRect(0, 0, W, H);
		c.fillStyle = "#0a1210";
		c.fillRect(0, 0, W, H);
		const pad = 12;
		const snap = typeof snapX === "function" ? snapX() : FIELD_WIDTH / 2;
		const span = Math.min(FIELD_WIDTH, 30);
		const x0 = snap - span / 2;
		const losY = H * 0.58;
		const toPX = (wx) => pad + ((wx - x0) / span) * (W - pad * 2);
		const toPY = (wy) => losY - (wy - playStartYard) * 3.4;
		// LOS
		c.strokeStyle = "rgba(255,255,255,0.4)";
		c.lineWidth = 1.2;
		c.setLineDash([4, 3]);
		c.beginPath();
		c.moveTo(pad, losY);
		c.lineTo(W - pad, losY);
		c.stroke();
		c.setLineDash([]);
		function dot(wx, wy, color, r) {
			const x = toPX(wx), y = toPY(wy);
			if (y < 2 || y > H - 2) return;
			c.fillStyle = color;
			c.beginPath();
			c.arc(x, y, r || 3.4, 0, Math.PI * 2);
			c.fill();
			c.strokeStyle = "rgba(0,0,0,0.35)";
			c.lineWidth = 1;
			c.stroke();
		}
		function arrow(x0w, y0w, x1w, y1w, color, dashed) {
			const a = { x: toPX(x0w), y: toPY(y0w) };
			const b = { x: toPX(x1w), y: toPY(y1w) };
			c.strokeStyle = color;
			c.lineWidth = dashed ? 1.25 : 1.5;
			if (dashed) c.setLineDash([5, 4]);
			c.beginPath();
			c.moveTo(a.x, a.y);
			c.lineTo(b.x, b.y);
			c.stroke();
			c.setLineDash([]);
			const ang = Math.atan2(b.y - a.y, b.x - a.x);
			c.beginPath();
			c.moveTo(b.x, b.y);
			c.lineTo(b.x - 5 * Math.cos(ang - 0.4), b.y - 5 * Math.sin(ang - 0.4));
			c.lineTo(b.x - 5 * Math.cos(ang + 0.4), b.y - 5 * Math.sin(ang + 0.4));
			c.closePath();
			c.fillStyle = color;
			c.fill();
		}
		function zoneEllipse(wx, wy, rx, ry, color, follow) {
			const x = toPX(wx), y = toPY(wy);
			const sx = Math.max(6, rx * (W - pad * 2) / span);
			const sy = Math.max(5, ry * 3.4);
			c.save();
			c.globalAlpha = follow ? 0.22 : 0.16;
			c.fillStyle = color;
			c.beginPath();
			c.ellipse(x, y, sx, sy, 0, 0, Math.PI * 2);
			c.fill();
			c.globalAlpha = 0.55;
			c.strokeStyle = color;
			c.lineWidth = follow ? 1.6 : 1.1;
			c.setLineDash(follow ? [3, 2] : []);
			c.stroke();
			c.setLineDash([]);
			c.restore();
		}
		if (kind === "def") {
			// Priority draw: deep zones → linebackers → DTs → blitz arrows
			const order = [...defenders].sort((a, b) => {
				const rank = (d) => d.job === "deep" || d.job === "robber" ? 0 : d.job === "drop" || d.job === "hook" || d.job === "spy" ? 1 : d.group === "DT" ? 3 : 2;
				return rank(a) - rank(b);
			});
			order.forEach((d) => {
				const col = d.job === "blitz" ? "#ef4444" : d.job === "deep" || d.job === "robber" ? "#a78bfa" : d.job === "drop" || d.job === "spy" ? "#facc15" : d.job === "flat" || d.job === "contain" || d.job === "curl" || d.job === "shade" ? "#38bdf8" : d.job === "hook" ? "#ddd6fe" : "#e2e8f0";
				const tx = d.jobX != null ? d.jobX : d.x;
				const ty = d.jobY != null ? d.jobY : d.y + 2;
				const zoneish = d.job === "deep" || d.job === "drop" || d.job === "flat" || d.job === "curl" || d.job === "hook" || d.job === "robber" || d.job === "contain" || d.job === "spy" || d.job === "shade";
				if (zoneish) {
					zoneEllipse(tx, ty, d.zoneRx || 4, d.zoneRy || 2.4, col, !!d.zoneFollow);
					// plain connector to zone center (no arrowhead)
					const a = { x: toPX(d.x), y: toPY(d.y) }, b = { x: toPX(tx), y: toPY(ty) };
					c.strokeStyle = col;
					c.lineWidth = 1.3;
					c.beginPath();
					c.moveTo(a.x, a.y);
					c.lineTo(b.x, b.y);
					c.stroke();
				} else if (d.job === "blitz" || d.job === "man") {
					arrow(d.x, d.y, tx, ty, col);
				}
				dot(d.x, d.y, col, d.group === "DT" ? 4.2 : 3.3);
			});
		} else {
			// Offense priority: OL → TE → FB → QB → RB path
			const groups = ["OL", "TE", "FB", "QB"];
			groups.forEach((g) => {
				blockers.filter((b) => b.group === g).forEach((b) => {
					const col = g === "OL" ? "#94a3b8" : g === "FB" ? "#fbbf24" : g === "TE" ? "#34d399" : "#cbd5e1";
					dot(b.x, b.y, col, 3.3);
					// Match on-field art: grey stroke + perpendicular T-cap (not yellow arrows)
					function miniBlockT(x0, y0, x1, y1) {
						const a = { x: toPX(x0), y: toPY(y0) };
						const bpt = { x: toPX(x1), y: toPY(y1) };
						c.strokeStyle = "rgba(210,214,208,0.92)";
						c.lineWidth = 1.6;
						c.lineCap = "round";
						c.beginPath();
						c.moveTo(a.x, a.y);
						c.lineTo(bpt.x, bpt.y);
						c.stroke();
						const ang = Math.atan2(bpt.y - a.y, bpt.x - a.x);
						const cap = 5;
						c.beginPath();
						c.moveTo(bpt.x + Math.cos(ang + Math.PI / 2) * cap, bpt.y + Math.sin(ang + Math.PI / 2) * cap);
						c.lineTo(bpt.x + Math.cos(ang - Math.PI / 2) * cap, bpt.y + Math.sin(ang - Math.PI / 2) * cap);
						c.stroke();
					}
					function aimShort(tx, ty, maxDist) {
						const dx = tx - b.x, dy = ty - b.y;
						const len = Math.hypot(dx, dy) || 1;
						const s = Math.min(1, maxDist / len);
						return [b.x + dx * s, b.y + dy * s];
					}
					if (b.blockMode === "pull" && b.pullVia) {
						const p = aimShort(b.pullVia.x2 || b.pullVia.x, b.pullVia.y2 || b.pullVia.y, 5.5);
						miniBlockT(b.x, b.y, p[0], p[1]);
					} else if (b.blockTarget || b.gapAimX != null) {
						const tx = b.blockTarget ? b.blockTarget.x : b.gapAimX;
						const ty = b.blockTarget ? b.blockTarget.y : (b.gapAimY != null ? b.gapAimY : playStartYard + 4.5);
						// Climb / next-level blocks draw longer so they read clearly vs base blocks
						const maxD = b.blockMode === "climb" ? 6.2 : b.blockMode === "reach" ? 3.8 : 2.6;
						const p = aimShort(tx, ty, maxD);
						miniBlockT(b.x, b.y, p[0], p[1]);
					}
				});
			});
			if (rb) {
				dot(rb.x, rb.y, "#fb4f14", 4.5);
				function drawStepPath(steps, color, dashed) {
					if (!steps || !steps.length) return;
					let px = rb.x, py = rb.y;
					steps.forEach((st) => {
						const nx = px + (st.dx || 0) * 9;
						const ny = py + (st.dy || 0) * 7;
						arrow(px, py, nx, ny, color, dashed);
						px = nx; py = ny;
					});
				}
				if (currentPlay && currentPlay.altSteps && currentPlay.altSteps.length) {
					drawStepPath(currentPlay.altSteps, "rgba(251,191,36,0.8)", true);
				}
				if (currentPlay && currentPlay.steps && currentPlay.steps.length) {
					drawStepPath(currentPlay.steps, "#fb4f14", false);
				} else if (currentPlay && currentPlay.arrow) {
					const a = currentPlay.arrow;
					let px = rb.x, py = rb.y;
					a.forEach((dx) => {
						const nx = px + dx * 6;
						const ny = py + 5;
						arrow(px, py, nx, ny, "#fb4f14", false);
						px = nx; py = ny;
					});
				}
			}
		}
	}


	function renderPracticeDefList() {
		const list = $("practiceDefList");
		if (!list) return;
		const cur = practiceDefSchemeId || (currentScheme && currentScheme.id);
		const btnMap = getDefAudibleMap();
		list.innerHTML = "";
		DEF_SCHEMES.forEach((s, i) => {
			const row = document.createElement("div");
			row.className = "play-item" + (s.id === cur ? " selected" : "");
			row.dataset.id = s.id;
			const num = document.createElement("span");
			num.className = "play-num";
			num.textContent = String(i + 1);
			const name = document.createElement("span");
			name.className = "play-name";
			name.textContent = s.name;
			const btn = document.createElement("span");
			btn.className = "play-btn";
			const hit = btnMap.find((m) => m.scheme && m.scheme.id === s.id);
			btn.textContent = hit ? hit.label : "";
			row.appendChild(num);
			row.appendChild(name);
			row.appendChild(btn);
			row.onclick = () => {
				practiceDefSchemeId = s.id;
				const sel = $("practiceDefScheme");
				if (sel) sel.value = s.id;
				try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
				setPlayCall((currentPlay ? currentPlay.name : "Play") + " · vs " + s.name + " — press A to snap");
				renderPracticeDefList();
				refreshPracticePreviews();
			};
			list.appendChild(row);
		});
	}
	function renderPracticePlayList() {
		const list = $("practicePlayList");
		if (!list) return;
		const cur = practiceOffPlayId || (currentPlay && currentPlay.id);
		const btnMap = getAudibleMap();
		list.innerHTML = "";
		OFF_PLAYS.forEach((p, i) => {
			const row = document.createElement("div");
			row.className = "play-item" + (p.id === cur ? " selected" : "");
			row.dataset.id = p.id;
			const num = document.createElement("span");
			num.className = "play-num";
			num.textContent = String(i + 1);
			const name = document.createElement("span");
			name.className = "play-name";
			name.textContent = p.name;
			const btn = document.createElement("span");
			btn.className = "play-btn";
			const hit = btnMap.find((m) => m.play && m.play.id === p.id);
			btn.textContent = hit ? hit.label : "";
			row.appendChild(num);
			row.appendChild(name);
			row.appendChild(btn);
			row.onclick = () => {
				practiceOffPlayId = p.id;
				const sel = $("practiceOffPlay");
				if (sel) sel.value = p.id;
				try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
				setPlayCall(p.name + " — press A to snap");
				renderPracticePlayList();
				refreshPracticePreviews();
			};
			list.appendChild(row);
		});
	}

	function wirePracticePreviewClicks() {
		const offB = $("prevOffBlock");
		const defB = $("prevDefBlock");
		if (offB && !offB._fgaClick) {
			offB._fgaClick = true;
			offB.style.cursor = "pointer";
			offB.title = "Click to focus — then ↑↓ cycles offense plays";
			offB.addEventListener("click", (e) => {
				if (e.target.closest(".play-item")) return; // list row handles itself
				practiceFocusSide = "off";
				practiceAudibleArm = false;
				practiceDefAudibleArm = false;
				if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
				if (typeof updateAudibleHint === "function") updateAudibleHint();
			});
		}
		if (defB && !defB._fgaClick) {
			defB._fgaClick = true;
			defB.style.cursor = "pointer";
			defB.title = "Click to focus — then ↑↓ cycles defense schemes";
			defB.addEventListener("click", (e) => {
				if (e.target.closest(".play-item")) return;
				practiceFocusSide = "def";
				practiceAudibleArm = false;
				practiceDefAudibleArm = false;
				if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
				if (typeof updateAudibleHint === "function") updateAudibleHint();
			});
		}
	}
	function refreshPracticePreviews() {
		const panel = $("practicePreview");
		if (panel) panel.classList.remove("hidden");
		const offB = $("prevOffBlock");
		const defB = $("prevDefBlock");
		// Closer to field = lower order (field is left of this column)
		if (offB && defB) {
			// Offense always left of defense
			offB.style.order = "0";
			defB.style.order = "1";
			offB.classList.toggle("prev-focused", practiceFocusSide === "off");
			defB.classList.toggle("prev-focused", practiceFocusSide === "def");
		}
		stylePrevBlock("def");
		stylePrevBlock("off");
		drawMiniPreview($("prevDefCanvas"), "def");
		drawMiniPreview($("prevOffCanvas"), "off");
		renderPracticePlayList();
		renderPracticeDefList();
		updateAudibleHint();
		wirePracticePreviewClicks();
	}

	function drawPlayArt() {
		const holdPeek = peekHeld || peekToggle;
		const artOn = playArtMode !== "off";
		const wantOff = artOn && (playArtMode === "on" || playArtMode === "offense");
		const wantDef = artOn && (playArtMode === "on" || playArtMode === "defense") || holdPeek;
		const returning = !!(fumbleSeq && (fumbleSeq.phase === "return" || fumbleSeq.defender && fumbleSeq.phase !== "loose") || scoreSeq && scoreSeq.who === "def");
		const showOff = wantOff && !!currentPlay && (preSnapTimer > 0 || playAge < 6.2 || holdPeek || (practiceAwaitSnap && practiceAudibleArm));
		const showDef = !returning && wantDef && (holdPeek || (!practiceAwaitSnap && (revealDefThisPlay || preSnapTimer > .2 || playAge < 6.4)) || (practiceAwaitSnap && practiceDefAudibleArm));
		if (!showOff && !showDef) return;
		const aOrigin = artAlpha(0);
		const aDest = artAlpha(1);
		const oOrigin = artAlphaOff(0);
		const oDest = artAlphaOff(1);
		const zA = zoneAlpha();
		if (showOff && currentPlay && (oOrigin > .02 || oDest > .02 || holdPeek)) blockers.forEach((b) => {
			const segs = [];
			// Shorten art paths so "next level" blocks don't draw stadium-long arrows
			function shortAim(tx, ty, maxDist) {
				maxDist = maxDist == null ? 3.2 : maxDist;
				const dx = tx - b.x, dy = ty - b.y;
				const len = Math.hypot(dx, dy) || 1;
				const s = Math.min(1, maxDist / len);
				return [b.x + dx * s, b.y + dy * s];
			}
			if (b.blockMode === "pull" && b.pullVia) {
				const p1 = shortAim(b.pullVia.x, b.pullVia.y, 2.4);
				segs.push(p1);
				const p2 = shortAim(b.pullVia.x2, b.pullVia.y2, 3.6);
				segs.push(p2);
			} else if (b.blockTarget) {
				const t = b.blockTarget;
				const aim = shortAim(t.x + (b.driveSide || 1) * 0.35, t.y, b.blockMode === "climb" ? 3.4 : 2.8);
				segs.push(aim);
			} else if (b.gapAimX != null) {
				segs.push(shortAim(b.gapAimX, b.gapAimY != null ? b.gapAimY : playStartYard + 4.5, 3.2));
			} else segs.push(shortAim(b.x + (b.driveSide || 0) * 1.2, playStartYard + Math.min(3.2, b.levelY || 2.5), 2.6));
			drawBlockT(b.x, b.y, segs, oOrigin, oDest);
		});
		if (showDef && (aOrigin > .02 || aDest > .02 || zA > .02 || holdPeek)) {
			defenders.forEach((d) => {
				const col = d.job === "blitz" ? "#ef4444" : d.job === "spy" ? "#f97316" : d.job === "contain" || d.job === "shade" ? "#38bdf8" : d.job === "curl" ? "#67e8f9" : d.job === "hook" || d.job === "robber" ? "#c4b5fd" : d.job === "deep" ? "#a78bfa" : d.job === "drop" ? "#facc15" : d.job === "flat" ? "#7dd3fc" : "#f8fafc";
				const fl = fieldLeft(), fr = fieldRight();
				const tx = clamp(d.jobX != null ? d.jobX : d.x, fl + 2.6, fr - 2.6);
				const ty = d.jobY != null ? d.jobY : d.y + 3;
				if (d.job === "spy") {
					const zx = d.spyPhase === "follow" ? d.x : tx;
					const zy = d.spyPhase === "follow" ? d.y : ty;
					if (zA > .02 || holdPeek) drawZoneCloud(zx, zy, d.zoneRx || 1.55, d.zoneRy || 1.45, col, zA * .42);
					if (aOrigin > .02 || holdPeek) {
						const midX = d.stutterX != null ? d.stutterX : (d.x + tx) / 2;
						const midY = d.stutterY != null ? d.stutterY : (d.y + ty) / 2;
						drawWorldCurve([
							[d.x, d.y],
							[midX, midY],
							[tx, ty]
						], col, 2.3, aOrigin * .9, aDest * .95);
					}
				} else if (d.job === "deep" || d.job === "drop" || d.job === "flat" || d.job === "curl" || d.job === "hook" || d.job === "robber" || d.job === "contain" || d.job === "shade") {
					if (zA > .02 || holdPeek) drawZoneCloud(tx, ty, d.zoneRx || 4, d.zoneRy || 2.4, col, zA * .3);
					if (aOrigin > .02 || holdPeek) drawAssignmentArrow(d.x, d.y, tx, ty, col, aOrigin * .9, aDest * .55, true);
				} else if (d.job === "blitz" && (d.artCurve || d.stutter)) {
					const inward = tx > (fl + fr) / 2 ? -1.35 : 1.35;
					const midX = clamp(d.stutter ? d.stutterX : (d.x + tx) / 2 + inward, fl + 3.2, fr - 3.2);
					const midY = d.stutter ? d.stutterY : (d.y + ty) / 2;
					drawWorldCurve([
						[d.x, d.y],
						[midX, midY],
						[tx, ty]
					], col, 2.3, aOrigin * .9, aDest * .95);
				} else drawAssignmentArrow(d.x, d.y, tx, ty, col, aOrigin * .9, aDest * .95);
			});
			if (currentScheme && currentScheme.name && aOrigin > .12) {
				ctx.save();
				ctx.fillStyle = colorAlpha("rgba(248,250,252,0.8)", Math.min(1, aOrigin + .1));
				ctx.font = "bold 13px Barlow Condensed, sans-serif";
				ctx.textAlign = "left";
				ctx.fillText("D: " + currentScheme.name, 14, 22);
				ctx.restore();
			}
		}
	}
	function drawPip() {
		if (!pipReplay || !pipReplay.frames.length) return;
		const frame = pipReplay.frames[Math.min(pipReplay.i, pipReplay.frames.length - 1)];
		if (!frame) return;
		const split = replayMode === "split";
		const pipW = split ? canvas.width * .4 : canvas.width * .22;
		const pipH = split ? canvas.height * .84 : canvas.height * .3;
		const pipX = split ? canvas.width * .59 : canvas.width - pipW - 10;
		const pipY = split ? canvas.height * .08 : canvas.height - pipH - 12;
		ctx.save();
		ctx.fillStyle = "rgba(8,12,10,0.88)";
		ctx.strokeStyle = "rgba(251,79,20,0.9)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		if (typeof ctx.roundRect === "function") ctx.roundRect(pipX, pipY, pipW, pipH, 8);
		else ctx.rect(pipX, pipY, pipW, pipH);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.rect(pipX, pipY, pipW, pipH);
		ctx.clip();
		ctx.fillStyle = "#1a5c32";
		ctx.fillRect(pipX + 3, pipY + 18, pipW - 6, pipH - 22);
		ctx.fillStyle = "#fb4f14";
		ctx.font = "bold 11px Barlow Condensed, sans-serif";
		ctx.textAlign = "left";
		ctx.fillText(split ? "REPLAY · SPLIT" : "REPLAY", pipX + 10, pipY + 14);
		const focus = frame.rb || {
			x: FIELD_WIDTH / 2,
			y: 50
		};
		const cam = camSpec();
		const innerW = pipW - 16;
		const innerH = pipH - 36;
		const k = Math.min(innerW / 22, innerH / 28);
		function map(wx, wy) {
			const depth = (focus.y - wy);
			const sx = pipX + pipW / 2 + (wx - focus.x) * k + depth * cam.skew * k * .55;
			const sy = pipY + 22 + innerH * .62 - (wy - focus.y) * k * cam.yScale;
			return {
				sx,
				sy
			};
		}
		ctx.strokeStyle = "rgba(255,255,255,0.28)";
		ctx.lineWidth = 1;
		for (let y = Math.floor(focus.y / 10) * 10 - 20; y <= focus.y + 30; y += 5) {
			const a = map(0, y), b = map(FIELD_WIDTH, y);
			ctx.beginPath();
			ctx.moveTo(a.sx, a.sy);
			ctx.lineTo(b.sx, b.sy);
			ctx.stroke();
		}
		// Runner path trail up to this frame
		if (frame.trail && frame.trail.length >= 2) {
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.strokeStyle = "rgba(120, 12, 18, 0.9)";
			ctx.lineWidth = 2.4;
			ctx.beginPath();
			const t0 = map(frame.trail[0].x, frame.trail[0].y);
			ctx.moveTo(t0.sx, t0.sy);
			for (let i = 1; i < frame.trail.length; i++) {
				const t = map(frame.trail[i].x, frame.trail[i].y);
				ctx.lineTo(t.sx, t.sy);
			}
			ctx.stroke();
		}
		const uniOff = getUni("off");
		const uniDef = getUni("def");
		const defJer = (uniDef && uniDef.jersey) || "#e8ece6";
		const offJer = (uniOff && uniOff.jersey) || "#fbbf24";
		(frame.defenders || []).forEach((d) => {
			const p = map(d.x, d.y);
			ctx.fillStyle = d.color || defJer;
			ctx.beginPath();
			ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
			ctx.fill();
		});
		(frame.blockers || []).forEach((b) => {
			const p = map(b.x, b.y);
			ctx.fillStyle = b.color || offJer;
			ctx.beginPath();
			ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
			ctx.fill();
		});
		if (frame.rb) {
			const p = map(frame.rb.x, frame.rb.y);
			ctx.fillStyle = frame.rb.color || offJer || "#fb4f14";
			ctx.beginPath();
			ctx.arc(p.sx, p.sy, 5.4, 0, Math.PI * 2);
			ctx.fill();
			// ball marker
			ctx.fillStyle = "#fb4f14";
			ctx.beginPath();
			ctx.arc(p.sx, p.sy - 3.2, 2.2, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	}
	function drawSky() {
		const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
		g.addColorStop(0, "#0c1828");
		g.addColorStop(0.38, "#1c3144");
		g.addColorStop(0.68, "#2e4650");
		g.addColorStop(1, "#1a2c2a");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	function drawVenueBehind() {
		const fl = fieldLeft(), fr = fieldRight();
		const midX = (fl + fr) / 2;
		function deck(y0, y1, pad0, pad1, fill) {
			const a = project(fl - pad0, y0), b = project(fr + pad0, y0);
			const c = project(fr + pad1, y1), d = project(fl - pad1, y1);
			ctx.beginPath();
			ctx.moveTo(a.sx, a.sy);
			ctx.lineTo(b.sx, b.sy);
			ctx.lineTo(c.sx, c.sy);
			ctx.lineTo(d.sx, d.sy);
			ctx.closePath();
			ctx.fillStyle = fill;
			ctx.fill();
			ctx.strokeStyle = "rgba(8,12,14,0.35)";
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.strokeStyle = "rgba(255,255,255,0.06)";
			for (let i = 1; i <= 3; i++) {
				const t = i / 4;
				const y = y0 + (y1 - y0) * t;
				const p = pad0 + (pad1 - pad0) * t;
				const l = project(fl - p, y), r = project(fr + p, y);
				ctx.beginPath();
				ctx.moveTo(l.sx, l.sy);
				ctx.lineTo(r.sx, r.sy);
				ctx.stroke();
			}
		}
		ctx.save();
		const hill = [
			[0, 16], [12, 34], [24, 20], [38, 46], [52, 22], [66, 52], [80, 26], [92, 40], [100, 18]
		];
		ctx.beginPath();
		const hStart = project(fl - 24, 116);
		ctx.moveTo(hStart.sx, hStart.sy);
		hill.forEach(([xf, h]) => {
			const p = project(fl + (fr - fl) * (xf / 100), 118);
			ctx.lineTo(p.sx, p.sy - h * 1.35);
		});
		const hEnd = project(fr + 24, 116);
		ctx.lineTo(hEnd.sx, hEnd.sy);
		ctx.closePath();
		ctx.fillStyle = "#1a2832";
		ctx.fill();
		deck(111.2, 122.5, 6, 11, "#2a3338");
		deck(122.5, 135, 11, 16, "#232b30");
		deck(-11.2, -20.5, 5, 9, "#252c30");
		deck(-20.5, -29, 9, 13, "#1e2528");
		const board = project(midX, 141);
		if (board.sy > -80 && board.sy < canvas.height + 40) {
			const sc = Math.max(0.7, board.sc || 1);
			const bw = 168 * sc, bh = 42 * sc;
			ctx.fillStyle = "#12181c";
			ctx.fillRect(board.sx - bw / 2, board.sy - bh, bw, bh);
			ctx.strokeStyle = "#fb4f14";
			ctx.lineWidth = 1.6 * sc;
			ctx.strokeRect(board.sx - bw / 2, board.sy - bh, bw, bh);
			ctx.fillStyle = "#e8ece6";
			ctx.font = "bold " + Math.max(11, 15 * sc) + "px Barlow Condensed, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			const clk = gameMode === "practice" ? "OFF" : formatClock(clock);
			ctx.fillText("EE  " + score + "     " + clk, board.sx, board.sy - bh * 0.52);
		}
		ctx.restore();
	}
	function draw() {
		let savedLive = null;
		if (fullReplay && fullReplay.frames[fullReplay.i]) {
			const f = fullReplay.frames[fullReplay.i];
			savedLive = {
				rb,
				qb,
				blockers,
				defenders,
				cameraY,
				camZoom,
				celebrateTimer,
				scoreSeq,
				fumbleSeq
			};
			rb = f.rb;
			qb = f.qb;
			blockers = f.blockers || [];
			defenders = f.defenders || [];
			cameraY = f.cameraY;
			camZoom = f.camZoom;
			scoreSeq = f.scoreSeq;
			fumbleSeq = f.fumbleSeq;
		}
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		drawSky();
		if (scoreSeq && (scoreSeq.who === "off" || scoreSeq.who === "def")) {
			const jersey = getUni(scoreSeq.who).jersey || (scoreSeq.who === "def" ? "#E31837" : "#FB4F14");
			ctx.fillStyle = jersey;
			ctx.globalAlpha = .42;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.globalAlpha = 1;
			const g = ctx.createRadialGradient(canvas.width / 2, 0, 10, canvas.width / 2, canvas.height * .28, canvas.height * .85);
			g.addColorStop(0, jersey);
			g.addColorStop(.55, "rgba(0,0,0,0)");
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			const ezTop = project(FIELD_WIDTH / 2, 116);
			const glow = ctx.createRadialGradient(ezTop.sx, Math.max(8, ezTop.sy), 6, ezTop.sx, Math.max(8, ezTop.sy), canvas.height * .62);
			glow.addColorStop(0, jersey);
			glow.addColorStop(1, "rgba(0,0,0,0)");
			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
		const splitOn = replayMode === "split" && pipReplay && pipReplay.frames.length && !fullReplay;
		if (splitOn) {
			const paneW = canvas.width * .58;
			const s = paneW / canvas.width;
			ctx.save();
			ctx.beginPath();
			ctx.rect(0, 0, paneW, canvas.height);
			ctx.clip();
			ctx.translate(0, (canvas.height - canvas.height * s) / 2);
			ctx.scale(s, s);
		}
		ctx.save();
		if (Math.abs(camZoom - 1) > .02) {
			let focus = scoreSeq?.player || fumbleSeq && fumbleSeq.phase === "return" && fumbleSeq.defender || rb;
			let fx = focus ? focus.x : FIELD_WIDTH / 2;
			let fy = focus ? focus.y : cameraY;
			if (ankleCam && ankleCam.runner && ankleCam.defender) {
				fx = ankleCam.runner.x * .72 + ankleCam.defender.x * .28;
				fy = ankleCam.runner.y * .72 + ankleCam.defender.y * .28;
			}
			const z = project(fx, fy);
			ctx.translate(z.sx, z.sy);
			ctx.scale(camZoom, camZoom);
			ctx.translate(-z.sx, -z.sy);
		}
		const uni = getUni(fieldArtSide);
		const fl = fieldLeft(), fr = fieldRight();
		drawVenueBehind();
		function fillBand(y0, y1, color) {
			fillWorldQuad(fl, y0, fr, y1, color, 1);
		}
		function strokeWorld(x0, y0, x1, y1, color, width) {
			const a = project(x0, y0), b = project(x1, y1);
			ctx.strokeStyle = color;
			ctx.lineWidth = width;
			ctx.beginPath();
			ctx.moveTo(a.sx, a.sy);
			ctx.lineTo(b.sx, b.sy);
			ctx.stroke();
		}
		fillTurfRange(0, 100);
		drawMountainEndzoneWorld(0, -10, uni.endPrimary, uni.endSecondary);
		drawMountainEndzoneWorld(100, 110, uni.endPrimary, uni.endSecondary);
		function strokePaint(x0, y0, x1, y1, paint, width) {
			strokeWorld(x0, y0, x1, y1, "rgba(12,20,16,0.75)", width + 1.4);
			strokeWorld(x0, y0, x1, y1, paint, width);
		}
		strokePaint(fl, -10, fr, -10, "rgba(236,240,230,0.55)", 2);
		strokePaint(fl, 110, fr, 110, "rgba(236,240,230,0.6)", 2);
		for (let yd = 0; yd <= 100; yd += 5) {
			const isTen = yd % 10 === 0;
			strokePaint(fl, yd, fr, yd, isTen ? "rgba(236,240,230,0.5)" : "rgba(236,240,230,0.28)", isTen ? 1.35 : 1.05);
			const label = yd === 0 || yd === 100 ? "G" : String(yd > 50 ? 100 - yd : yd);
			const numY = yd === 0 || yd === 5 || yd === 95 || yd === 100 ? yd + (yd < 50 ? .4 : yd > 50 ? -.4 : 0) : yd;
			const lp = project(fl + 1.4, numY);
			const rp = project(fr - 1.4, numY);
			ctx.font = (isTen ? "11px" : "9px") + " IBM Plex Sans, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.lineJoin = "round";
			ctx.lineWidth = isTen ? 3.2 : 2.6;
			function paintNum(p, rot) {
				ctx.save();
				ctx.translate(p.sx, p.sy);
				ctx.rotate(rot);
				ctx.strokeStyle = "rgba(12,20,16,0.82)";
				ctx.strokeText(label, 0, 0);
				ctx.fillStyle = isTen ? "rgba(236,240,230,0.82)" : "rgba(236,240,230,0.55)";
				ctx.fillText(label, 0, 0);
				ctx.restore();
			}
			paintNum(lp, -Math.PI / 2);
			paintNum(rp, Math.PI / 2);
		}
		const hashXs = [
			fl,
			hashLeft(),
			hashRight(),
			fr
		];
		for (let decade = 0; decade < 100; decade += 10) for (const off of [
			1,
			2,
			3,
			4,
			6,
			7,
			8,
			9
		]) {
			const y = decade + off;
			for (const hx of hashXs) strokePaint(hx, y, hx + (hx === fl ? .7 : hx === fr ? -.7 : .35), y, "rgba(236,240,230,0.48)", 1.15);
		}
		drawMidfieldLogo();
		function drawPylon(yardY, side) {
			const pt = project(side === "L" ? fl : fr, yardY);
			if (pt.sy < -20 || pt.sy > canvas.height + 20) return;
			const sc = Math.max(4, 5 * (pt.sc || 1));
			ctx.fillStyle = "#f97316";
			ctx.fillRect(pt.sx - sc * .35, pt.sy - sc * 1.4, sc * .7, sc * 1.5);
			ctx.fillStyle = "#fdba74";
			ctx.fillRect(pt.sx - sc * .35, pt.sy - sc * 1.7, sc * .7, sc * .35);
		}
		drawPylon(0, "L");
		drawPylon(0, "R");
		drawPylon(-10, "L");
		drawPylon(-10, "R");
		drawPylon(100, "L");
		drawPylon(100, "R");
		drawPylon(110, "L");
		drawPylon(110, "R");
		{
			const midX = (fl + fr) / 2;
			const postHalf = FIELD_WIDTH * .11;
			ctx.strokeStyle = "#facc15";
			ctx.lineWidth = 3.2;
			ctx.lineCap = "round";
			if (cameraMode === "top" || cameraMode === "topZoom") {
				const stem = 3.2;
				const postH = 6.6;
				strokeWorld(midX, 110, midX, 110 + stem, "#facc15", 3.2);
				strokeWorld(midX - postHalf, 110 + stem, midX + postHalf, 110 + stem, "#facc15", 3.2);
				strokeWorld(midX - postHalf, 110 + stem, midX - postHalf, 110 + stem + postH, "#facc15", 3.2);
				strokeWorld(midX + postHalf, 110 + stem, midX + postHalf, 110 + stem + postH, "#facc15", 3.2);
			} else {
				const base = project(midX, 110);
				const leftU = project(midX - postHalf, 110);
				const rightU = project(midX + postHalf, 110);
				const h = 74 * (base.sc || 1);
				ctx.beginPath();
				ctx.moveTo(base.sx, base.sy);
				ctx.lineTo(base.sx, base.sy - h * .5);
				ctx.moveTo(leftU.sx, leftU.sy - h * .5);
				ctx.lineTo(rightU.sx, rightU.sy - h * .5);
				ctx.moveTo(leftU.sx, leftU.sy - h * .5);
				ctx.lineTo(leftU.sx, leftU.sy - h * 1.38);
				ctx.moveTo(rightU.sx, rightU.sy - h * .5);
				ctx.lineTo(rightU.sx, rightU.sy - h * 1.38);
				ctx.stroke();
			}
		}
		strokeWorld(fl, playStartYard, fr, playStartYard, "#3b82f6", 2.6);
		strokeWorld(fl, 0, fl, 100, "rgba(255,255,255,0.4)", 2.5);
		strokeWorld(fr, 0, fr, 100, "rgba(255,255,255,0.4)", 2.5);
		strokeWorld(fl, 20, fl, 80, "rgba(236,240,230,0.92)", Math.max(5, SCALE_X * .28));
		strokeWorld(fr, 20, fr, 80, "rgba(236,240,230,0.92)", Math.max(5, SCALE_X * .28));
		if (qb && qb.active && !blockers.includes(qb)) drawPlayer(qb, false);
		blockers.forEach((b) => {
			if (b.active) drawPlayer(b, false);
		});
		defenders.forEach((d) => drawPlayer(d, false));
		if (rb) drawPlayer(rb, rb.hasBall);
		if (fumbleSeq && fumbleSeq.phase === "loose") {
			const br = .9 * SCALE_X;
			const bp = project(fumbleSeq.ballX, fumbleSeq.ballY);
			drawFootball(bp.sx, bp.sy - fumbleSeq.ballHop * SCALE_Y * .45, br, fumbleSeq.t * 11);
		}
		if (scoreSeq && scoreSeq.ballOut) {
			const br = .9 * SCALE_X;
			const bp = project(scoreSeq.ballX, scoreSeq.ballY);
			drawFootball(bp.sx, bp.sy - scoreSeq.ballHop * SCALE_Y * .45, br, scoreSeq.t * 8);
		}
		drawHandoffBall();
		drawRunnerTrail();
		if (fullReplay && fullReplay.frames[fullReplay.i] && fullReplay.frames[fullReplay.i].trail) {
			strokeTrailWorld(fullReplay.frames[fullReplay.i].trail);
		}
		drawRouteArrow();
		drawPlayArt();
		ctx.restore();
		if (splitOn) ctx.restore();
		if (savedLive) {
			rb = savedLive.rb;
			qb = savedLive.qb;
			blockers = savedLive.blockers;
			defenders = savedLive.defenders;
			cameraY = savedLive.cameraY;
			camZoom = savedLive.camZoom;
			celebrateTimer = savedLive.celebrateTimer;
			scoreSeq = savedLive.scoreSeq;
			fumbleSeq = savedLive.fumbleSeq;
		}
		drawPip();
		drawSprintMeter();
		if (ctrlLeft || ctrlRight) {
			ctx.fillStyle = "rgba(251,79,20,0.85)";
			ctx.font = "bold 12px Barlow Condensed, sans-serif";
			ctx.textAlign = "right";
			ctx.fillText(ctrlLeft && ctrlRight ? "DUAL CONTROL" : "BLOCKER", canvas.width - 12, 18);
		}
	}
	function drawSprintMeter() {
		const x = 14;
		const y = canvas.height - 20;
		const w = 108;
		const h = 9;
		ctx.fillStyle = "rgba(0,0,0,0.55)";
		ctx.fillRect(13, y - 1, 110, 11);
		ctx.fillStyle = "rgba(255,255,255,0.12)";
		ctx.fillRect(x, y, w, h);
		ctx.fillStyle = sprintExhausted ? "#ef4444" : sprintCharge > .22 ? "#fbbf24" : "#f97316";
		ctx.fillRect(x, y, w * sprintCharge, h);
		ctx.fillStyle = "rgba(255,255,255,0.7)";
		ctx.font = "9px IBM Plex Sans, sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "bottom";
		ctx.fillText("SPRINT", x, y - 2);
	}
	let raf = 0;
	function loop(now) {
		try {
			const dt = Math.min((now - lastTime) / 1e3, .05);
			lastTime = now;
			update(dt);
			if (!paused && !fullReplay && !sessionOver) {
				replayAcc += dt;
				if (replayAcc >= 1 / REPLAY_HZ) {
					replayAcc = 0;
					const frame = captureFrame();
					replayBuf.push(frame);
					playFrames.push(frame);
					if (replayBuf.length > REPLAY_CAP) replayBuf.shift();
					if (playFrames.length > REPLAY_CAP) playFrames.shift();
				}
			}
			draw();
			updateHUD();
		} catch (err) {
			console.error(err);
		}
		raf = requestAnimationFrame(loop);
	}
	function onKeyDown(e) {
		keys.add(e.code);
		if ([
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight",
			"Space",
			"KeyI",
			"KeyJ",
			"KeyK",
			"KeyL",
			"KeyH",
			"KeyR"
		].includes(e.code)) e.preventDefault();
		if (paused && !fullReplay && !sessionOver && (e.code === "KeyX" || e.code === "KeyC")) {
			if (!(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLSelectElement)) startFullReplay();
		}
		if (e.code === "KeyR" && !e.repeat) {
			if (!(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLSelectElement)) startFullReplay();
		}
		if (e.key === "Enter") {
			const nameModal = $("nameModal");
			const contModal = $("continueModal");
			if (nameModal && !nameModal.classList.contains("hidden")) {
				e.preventDefault();
				submitScore();
			} else if (contModal && !contModal.classList.contains("hidden")) {
				e.preventDefault();
				continueSet();
			}
		}
	}
	function onKeyUp(e) {
		keys.delete(e.code);
	}
	function onBlur() {
		keys.clear();
	}
	function onVisibility() {
		if (document.hidden) keys.clear();
	}
	function onPadConnect(e) {
		e.gamepad.index;
		navigator.getGamepads?.();
	}
	function onPadDisconnect() {}
	function wakePad() {
		navigator.getGamepads?.();
		canvas.focus();
	}
	function pointerToStick(e) {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		if (x < rect.width * .55) {
			if (!touch.active) {
				touch.active = true;
				touch.ox = x;
				touch.oy = y;
			}
			const dx = (x - touch.ox) / 48;
			const dy = -(y - touch.oy) / 48;
			const m = Math.hypot(dx, dy);
			const s = m > 1 ? 1 / m : 1;
			touch.dx = dx * s;
			touch.dy = dy * s;
		} else touch.burst = true;
	}
	function onPointerDown(e) {
		canvas.focus();
		canvas.setPointerCapture(e.pointerId);
		pointerToStick(e);
	}
	function onPointerMove(e) {
		if (touch.active) pointerToStick(e);
	}
	function onPointerUp() {
		touch.active = false;
		touch.dx = 0;
		touch.dy = 0;
		touch.burst = false;
	}
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	window.addEventListener("blur", onBlur);
	document.addEventListener("visibilitychange", onVisibility);
	
		const trailEl = $("runnerTrailToggle");
		if (trailEl) {
			showRunnerTrail = !!trailEl.checked;
			trailEl.addEventListener("change", () => { showRunnerTrail = !!trailEl.checked; });
		}
		const fatigueEl = $("fatigueToggle");
		if (fatigueEl) {
			const host = fatigueEl.closest("label") || fatigueEl.parentElement;
			if (host) {
				const nodes = [...host.childNodes];
				nodes.forEach((n) => {
					if (n.nodeType === 3 && /fatigue/i.test(n.textContent)) n.textContent = " Runner Fatigue";
				});
			}
			fatigueOn = !!fatigueEl.checked;
			fatigueEl.addEventListener("change", () => {
				fatigueOn = !!fatigueEl.checked;
				if (!fatigueOn) {
					sprintCharge = 1;
					sprintHoldT = 0;
					sprintExhausted = false;
				}
			});
		}
		const speedTrailEl = $("speedTrailToggle");
		if (speedTrailEl) {
			speedTrail = !!speedTrailEl.checked;
			speedTrailEl.addEventListener("change", () => { speedTrail = !!speedTrailEl.checked; });
		}
		const saveClipBtn = $("saveClipBtn");
		if (saveClipBtn) saveClipBtn.addEventListener("click", () => saveLastPlayClip());
		renderSavedClips();
		const nextPlayEl = $("nextPlaySelect");
		if (nextPlayEl) {
			nextPlayOnSnap = nextPlayEl.value === "snap";
			nextPlayEl.addEventListener("change", () => {
				nextPlayOnSnap = nextPlayEl.value === "snap";
			});
		}
		const syncStartUI = () => { syncStartYardFromUI(); };
		$("startYard50")?.addEventListener("change", syncStartUI);
		$("startYard50")?.addEventListener("input", syncStartUI);
		$("startYardMinus")?.addEventListener("click", () => nudgeStartYard(-1));
		$("startYardPlus")?.addEventListener("click", () => nudgeStartYard(1));
		$("startSideTri")?.addEventListener("click", () => {
			startSide = startSide === "opp" ? "own" : "opp";
			const yd = parseInt($("startYard50")?.value, 10);
			if (yd === 50) $("startYard50").value = "45";
			syncStartYardFromUI();
		});
		function setPostTdMode(mode) {
			postTdMode = mode;
			document.querySelectorAll(".los-mode").forEach((b) => {
				b.classList.toggle("on", b.getAttribute("data-mode") === mode);
			});
			const row = $("incrementRow");
			if (row) row.classList.toggle("hidden", mode !== "increasing" && mode !== "decreasing");
			const inc = $("incrementInput");
			if (inc) tdIncrement = Number.isFinite(parseInt(inc.value, 10)) ? parseInt(inc.value, 10) : 5;
		}
		document.querySelectorAll(".los-mode").forEach((b) => {
			b.addEventListener("click", () => setPostTdMode(b.getAttribute("data-mode")));
		});
		$("incrementInput")?.addEventListener("change", () => {
			tdIncrement = Number.isFinite(parseInt($("incrementInput").value, 10)) ? parseInt($("incrementInput").value, 10) : 5;
		});
		setPostTdMode("random");
		syncStartYardFromUI();
		const onPracLos = () => applyPracticeLosNow();
		$("practiceSideSelect")?.addEventListener("change", onPracLos);
		$("practiceYard50")?.addEventListener("change", onPracLos);
		// debounce-ish input: apply on change only to avoid restage every keystroke mid-type
		$("practiceYard50")?.addEventListener("input", () => {
			const v = parseInt($("practiceYard50").value, 10);
			if (Number.isFinite(v) && v >= 1 && v <= 50) onPracLos();
		});
		syncPracticeYardFromUI();
		updateConfigPanelForMode();
	window.addEventListener("gamepadconnected", onPadConnect);
	window.addEventListener("gamepaddisconnected", onPadDisconnect);
	window.addEventListener("pointerdown", wakePad);
	canvas.addEventListener("pointerdown", onPointerDown);
	canvas.addEventListener("pointermove", onPointerMove);
	canvas.addEventListener("pointerup", onPointerUp);
	canvas.addEventListener("pointercancel", onPointerUp);
	function rebuildAfterPersonnelChange() {
		refreshPersonnelUI();
		// Practice: immediately restage players + play art for the new roster
		if (gameMode === "practice") {
			const fixed = clamp(practiceStartYard, 1, 99);
			ballYard = fixed;
			playStartYard = fixed;
			driveStartYard = fixed;
			ballX = (hashLeft() + hashRight()) / 2;
			practiceAwaitSnap = true;
			practiceAudibleArm = false;
			practiceDefAudibleArm = false;
			playActive = false;
			try {
				placeEntitiesForNewPlay();
			} catch (err) {
				console.error(err);
			}
			const offName = currentPlay ? currentPlay.name : "Practice";
			const defName = currentScheme ? currentScheme.name : "";
			setPlayCall(offName + (defName ? " · vs " + defName : "") + " — press A to snap");
			updateBallOn();
			if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
		}
	}
	function bindCount(idMinus, idPlus, getter, setter, lo, hi, group) {
		const minus = $(idMinus), plus = $(idPlus);
		if (minus) minus.onclick = () => {
			setter(clamp(getter() - 1, lo, hi));
			if (group) adjustNumbersForGroup(group, group === "QB" ? Math.max(1, getter()) : getter());
			rebuildAfterPersonnelChange();
		};
		if (plus) plus.onclick = () => {
			setter(clamp(getter() + 1, lo, hi));
			if (group) adjustNumbersForGroup(group, group === "QB" ? Math.max(1, getter()) : getter());
			rebuildAfterPersonnelChange();
		};
	}
	bindCount("olMinus", "olPlus", () => numOL, (v) => { numOL = v; }, 0, 5, "OL");
	bindCount("teMinus", "tePlus", () => numTE, (v) => { numTE = v; }, 0, 3, "TE");
	bindCount("fbMinus", "fbPlus", () => numFB, (v) => { numFB = v; }, 0, 2, "FB");
	bindCount("qbMinus", "qbPlus", () => numQB, (v) => { numQB = v; }, 0, 1, "QB");
	bindCount("dtMinus", "dtPlus", () => numDT, (v) => { numDT = v; }, 0, 4, "DT");
	bindCount("lbMinus", "lbPlus", () => numLBs, (v) => { numLBs = v; }, 0, 4, "LB");
	bindCount("dbMinus", "dbPlus", () => numDBs, (v) => { numDBs = v; }, 0, 6, "DB");
	$("widthSelect").onchange = (e) => {
		FIELD_WIDTH = parseInt(e.target.value, 10) || 50;
		refreshScale();
		ballX = clampToHash(ballX);
	};
	const surfaceSel = $("surfaceSelect");
	if (surfaceSel) surfaceSel.onchange = () => {
		const v = surfaceSel.value;
		surface = v === "fieldturf" || v === "astroturf" ? v : "grass";
		turfPattern = null;
		turfPatternKey = "";
	};
	const minSel = $("minSelect");
	if (minSel) minSel.onchange = (e) => {
		gameSeconds = parseInt(e.target.value, 10) || 120;
	};
	const offUniSel = $("offUniform");
	if (offUniSel) offUniSel.onchange = (e) => {
		selectOffUni(parseInt(e.target.value, 10));
		paintRoster();
	};
	const defUniSel = $("defUniform");
	if (defUniSel) defUniSel.onchange = (e) => {
		selectDefUni(parseInt(e.target.value, 10));
		paintRoster();
	};
	function populatePracticeSelects() {
		const op = $("practiceOffPlay");
		const ds = $("practiceDefScheme");
		if (op) {
			op.innerHTML = "";
			OFF_PLAYS.forEach((p) => {
				const o = document.createElement("option");
			o.value = p.id;
			o.textContent = p.name;
				if (practiceOffPlayId ? p.id === practiceOffPlayId : false) o.selected = true;
				op.appendChild(o);
			});
			if (!practiceOffPlayId && OFF_PLAYS[0]) practiceOffPlayId = OFF_PLAYS[0].id;
		}
		if (ds) {
			ds.innerHTML = "";
			DEF_SCHEMES.forEach((s) => {
				const o = document.createElement("option");
			o.value = s.id;
			o.textContent = s.name;
				if (practiceDefSchemeId ? s.id === practiceDefSchemeId : false) o.selected = true;
				ds.appendChild(o);
			});
			if (!practiceDefSchemeId && DEF_SCHEMES[0]) practiceDefSchemeId = DEF_SCHEMES[0].id;
		}
	}
	function randomizeCamCorner() {
		camCorner = Math.random() < 0.5 ? "sw" : "nw";
		const cornerEl = $("camCornerSelect");
		if (cornerEl) cornerEl.value = camCorner;
	}
	function resetSessionClock() {
		const sel = $("minSelect");
		if (sel && !sel.value) sel.value = "120";
		gameSeconds = parseInt($("minSelect")?.value || "120", 10) || 120;
		clock = gameSeconds;
		const clockEl = $("clock");
		if (clockEl) clockEl.textContent = formatClock(clock);
	}
	function setGameMode(mode) {
		gameMode = mode === "practice" ? "practice" : "game";
		const pc = $("practiceControls");
		if (pc) pc.classList.remove("hidden");
		updateConfigPanelForMode();
		const np = $("nextPlaySelect");
		if (np) {
			np.value = "snap";
			nextPlayOnSnap = true;
		}
		populatePracticeSelects();
		practiceAwaitSnap = true;
		practiceAudibleArm = false;
		if (gameMode !== "practice") resetSessionClock();
		randomizeCamCorner();
		document.body.classList.toggle("practice-mode", gameMode === "practice");
		if (gameMode === "practice") {
			applyPracticeLosNow();
			updateHUD();
		} else {
			syncStartYardFromUI();
			ballYard = userToAbsolute(userStartYard);
			playStartYard = ballYard;
			driveStartYard = ballYard;
			playActive = false;
			practiceAwaitSnap = true;
			resetSessionClock();
			try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
			updateHUD();
		}
		if (typeof refreshPracticePreviews === "function") refreshPracticePreviews();
	}
	const modeEl = $("modeSelect");
	if (modeEl) {
		setGameMode(modeEl.value);
		modeEl.onchange = () => setGameMode(modeEl.value);
	}
	const pop = $("practiceOffPlay");
	if (pop) pop.onchange = (e) => {
		practiceOffPlayId = e.target.value;
		if (!playActive) {
			try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
		}
	};
	const pds = $("practiceDefScheme");
	if (pds) pds.onchange = (e) => {
		practiceDefSchemeId = e.target.value;
		if (!playActive) {
			try { placeEntitiesForNewPlay(); } catch (err) { console.error(err); }
		}
	};
	const offStrEl = $("offStrSlider");
	const offStrLab = $("offStrLabel");
	if (offStrEl) {
		offStrength = parseFloat(offStrEl.value) || 1.00;
		if (offStrLab) offStrLab.textContent = offStrength.toFixed(2) + "×";
		offStrEl.oninput = () => {
			offStrength = parseFloat(offStrEl.value) || 1.00;
			if (offStrLab) offStrLab.textContent = offStrength.toFixed(2) + "×";
		};
	}
	const defStrEl = $("defStrSlider");
	const defStrLab = $("defStrLabel");
	if (defStrEl) {
		defStrength = parseFloat(defStrEl.value) || 1.00;
		if (defStrLab) defStrLab.textContent = defStrength.toFixed(2) + "×";
		defStrEl.oninput = () => {
			defStrength = parseFloat(defStrEl.value) || 1.00;
			if (defStrLab) defStrLab.textContent = defStrength.toFixed(2) + "×";
		};
	}
	const spdEl = $("speedSlider");
	if (spdEl) {
		spdEl.value = "1.00";
		playSpeed = 1.0;
		const lab = $("speedLabel");
		const syncSpd = () => {
			playSpeed = parseFloat(spdEl.value) || 1.0;
			if (lab) lab.textContent = playSpeed.toFixed(2) + "×";
		};
		syncSpd();
		spdEl.oninput = syncSpd;
	}
	function wireStrengthSlider(id, labId, getter, setter) {
		const el = $(id);
		const lab = $(labId);
		if (!el) return;
		setter(parseFloat(el.value) || 1);
		if (lab) lab.textContent = getter().toFixed(2) + "×";
		el.oninput = () => {
			setter(parseFloat(el.value) || 1);
			if (lab) lab.textContent = getter().toFixed(2) + "×";
		};
	}
	wireStrengthSlider("breakBlockSlider", "breakBlockLabel", () => breakBlock, (v) => { breakBlock = v; });
	wireStrengthSlider("breakTackleSlider", "breakTackleLabel", () => breakTackle, (v) => { breakTackle = v; });
	const fumCheck = $("fumblesCheck");
	const fumLab = $("fumblesLabel");
	function syncFumblesForProfile() {
		if (padProfile === "v6") {
			fumblesOn = false;
			if (fumCheck) fumCheck.checked = false;
			if (fumLab) fumLab.textContent = "Off";
		}
	}
	if (fumCheck) {
		fumblesOn = fumCheck.checked;
		fumCheck.onchange = () => {
			if (padProfile === "v6") {
				fumCheck.checked = false;
				fumblesOn = false;
			} else fumblesOn = fumCheck.checked;
			if (fumLab) fumLab.textContent = fumblesOn ? "On" : "Off";
		};
	}
	const ezSel = $("ezArtSelect");
	if (ezSel) {
		ezArtMode = ezSel.value || "mountains";
		ezSel.onchange = () => {
			ezArtMode = ezSel.value || "mountains";
		};
	}
	const ezTextSel = $("ezTextSelect");
	const ezTextRow = $("ezTextCustomRow");
	const ezTextInp = $("ezTextCustom");
	function syncEzTextUi() {
		if (ezTextRow) ezTextRow.style.display = ezTextMode === "custom" ? "" : "none";
	}
	if (ezTextSel) {
		ezTextMode = ezTextSel.value || "ee";
		ezTextSel.onchange = () => {
			ezTextMode = ezTextSel.value || "ee";
			syncEzTextUi();
		};
	}
	if (ezTextInp) {
		ezCustomText = ezTextInp.value || "ELEVATION EDGE";
		ezTextInp.oninput = () => {
			ezCustomText = ezTextInp.value || "";
		};
	}
	syncEzTextUi();
	const logoCheck = $("midLogoCheck");
	const logoLab = $("midLogoLabel");
	if (logoCheck) {
		midLogoOn = logoCheck.checked;
		logoCheck.onchange = () => {
			midLogoOn = logoCheck.checked;
			if (logoLab) logoLab.textContent = midLogoOn ? "On" : "Off";
		};
	}
	$("pauseBtn").onclick = () => {
		if (sessionOver) return;
		setPaused(!paused);
	};
	$("restartBtn").onclick = () => fullRestart();
	$("continueBtn").onclick = () => continueSet();
	$("saveScoreBtn").onclick = () => submitScore();
	const camSel = $("cameraSelect");
	function syncCamCornerUi() {
		const corner = $("camCornerSelect");
		if (corner) corner.disabled = cameraMode === "top" || cameraMode === "topZoom";
	}
	if (camSel) {
		if (![...camSel.options].some((o) => o.value === "topZoom")) {
			const opt = document.createElement("option");
			opt.value = "topZoom";
			opt.textContent = "Overhead Zoom";
			const after = [...camSel.options].find((o) => o.value === "top");
			if (after && after.nextSibling) camSel.insertBefore(opt, after.nextSibling);
			else camSel.appendChild(opt);
		}
		camSel.value = "top";
		cameraMode = "top";
		camSel.onchange = () => {
			cameraMode = CAMERAS[camSel.value] ? camSel.value : "top";
			syncCamCornerUi();
			refreshScale();
		};
	}
	const cornerSel = $("camCornerSelect");
	if (cornerSel) {
		cornerSel.value = camCorner;
		cornerSel.onchange = () => {
			camCorner = cornerSel.value === "sw" ? "sw" : "nw";
		};
	}
	syncCamCornerUi();
	const profSel = $("profileSelect");
	if (profSel) {
		padProfile = profSel.value || "v6";
		syncFumblesForProfile();
		profSel.onchange = () => {
			padProfile = profSel.value || "v6";
			syncFumblesForProfile();
		};
	}
	const swapCheck = $("swapStickDpadCheck");
	const swapLab = $("swapStickDpadLabel");
	if (swapCheck) {
		swapStickDpad = swapCheck.checked;
		if (swapLab) swapLab.textContent = swapStickDpad ? "On" : "Off";
		swapCheck.onchange = () => {
			swapStickDpad = swapCheck.checked;
			if (swapLab) swapLab.textContent = swapStickDpad ? "On" : "Off";
		};
	}
	const repSel = $("replayModeSelect");
	if (repSel) {
		replayMode = repSel.value || "pip";
		repSel.onchange = () => {
			replayMode = repSel.value || "pip";
		};
	}
	const modeSel = $("modeSelect");
	if (modeSel) {
		const pc0 = $("practiceControls");
		if (pc0) pc0.classList.remove("hidden");
	}
	const artSel = $("playArtSelect");
	if (artSel) {
		playArtMode = artSel.value || "on";
		artSel.onchange = () => {
			playArtMode = artSel.value || "on";
		};
	}
	const peekBtn = $("peekBtn");
	if (peekBtn) peekBtn.onclick = () => {
		peekToggle = !peekToggle;
	};
	const replayBtn = $("replayBtn");
	if (replayBtn) replayBtn.onclick = () => startFullReplay();
	const teamAbbrEl = $("teamAbbr");
	if (teamAbbrEl) teamAbbrEl.addEventListener("input", () => {
		const v = getTeamAbbr();
		const ni = $("nameInput");
		if (ni) ni.value = v;
	});
	rebuildWidthSelect();
	rebuildUniformSelects();
	refreshPersonnelUI();
	refreshAllNumbers();
	if (defUni === offUni) defUni = randChoice(UNIFORMS.filter((u) => u.id !== offUni)).id;
	logoFlip = (() => { const r = Math.random(); return r < 0.5 ? 0 : r < 0.75 ? 1 : 2; })();
	fieldArtSide = Math.random() < .5 ? "off" : "def";
	syncAbbrFromOffense();
	randomizeSurface();
	ballX = (hashLeft() + hashRight()) / 2;
	placeEntitiesForNewPlay();
	updateBallOn();
	renderScores();
	canvas.tabIndex = 0;
	canvas.style.outline = "none";
	refreshScale();
	const ro = new ResizeObserver(() => refreshScale());
	if (canvas.parentElement) ro.observe(canvas.parentElement);
	window.__controlsTest = {
		getX: () => rb?.x ?? 0,
		getY: () => rb?.y ?? 0,
		getYaw: () => rb?.facing ?? 0,
		getSpeed: () => rb ? Math.hypot(rb.vx, rb.vy) : 0,
		getPlayAge: () => playAge,
		getCelebrate: () => celebrateTimer > 0,
		getYards: () => totalYards,
		getClock: () => clock,
		setClock: (v) => {
			clock = v;
		},
		getCamCorner: () => camCorner,
		getPlayArt: () => playArtMode,
		getReplayReady: () => lastPlayFrames.length,
		getCamera: () => cameraMode,
		getCamDebug: () => ({
			mode: cameraMode,
			skew: camSpec().skew,
			xLean: camSpec().xLean,
			yScale: camSpec().yScale,
			a: project(0, 50),
			b: project(FIELD_WIDTH, 50),
			c: project(0, 60)
		}),
		getSnapState: () => ({
			play: currentPlay && (currentPlay.baseId || currentPlay.id),
			scheme: currentScheme && currentScheme.id,
			yard: playStartYard,
			steps: currentPlay && currentPlay.steps ? currentPlay.steps.map((s) => ({ dx: s.dx, dy: s.dy, t: s.t })) : [],
			altSteps: currentPlay && currentPlay.altSteps ? currentPlay.altSteps.map((s) => ({ dx: s.dx, dy: s.dy, t: s.t })) : null,
			pad: padProfile,
			awaitSnap: !!practiceAwaitSnap,
			sprintCharge,
			sprintHoldT,
			sprintExhausted,
			fatigue: fatigueOn,
			defYs: (defenders || []).map((d) => +Number(d.y).toFixed(2)),
			jobYs: (defenders || []).map((d) => d.jobY == null ? null : +Number(d.jobY).toFixed(2)),
			hash: [hashLeft(), hashRight()].map((v) => +Number(v).toFixed(2))
		}),
		getSpikeStyle: () => scoreSeq?.spikeStyle || null,
		getEzArt: () => ezArtMode,
		setEzArt: (v) => {
			ezArtMode = v === true ? "mountains" : v === false ? "off" : v || "mountains";
			const s = $("ezArtSelect");
			if (s) s.value = ezArtMode;
		},
		nearGoal: (x) => {
			if (rb) {
				rb.x = x != null ? x : FIELD_WIDTH / 2;
				rb.y = 99.1;
			}
			cameraY = 102;
			camZoom = 1;
		},
		celebrateTd: (dx, x) => {
			lastSteer = {
				dx: dx || 0,
				dy: 1
			};
			scoreSeq = null;
			if (rb) {
				rb.x = x != null ? x : rb.x;
				rb.y = Math.max(rb.y, 100.15);
				rb.vx = dx || 0;
				rb.vy = 4;
			}
			celebrateTimer = 99;
			scoreTouchdown();
			return scoreSeq?.spikeStyle || null;
		},
		pylonPlace: () => {
			if (!rb) return;
			rb.x = fieldLeft() + 1.4;
			rb.y = 96.8;
			lastSteer = {
				dx: -.35,
				dy: 1
			};
			cameraY = 100;
		},
		startReplay: () => startFullReplay(),
		setKeys: (codes) => {
			keys.clear();
			codes.forEach((c) => keys.add(c));
		}
	};
	raf = requestAnimationFrame(loop);
	return () => {
		cancelAnimationFrame(raf);
		clearAutoStart();
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
		window.removeEventListener("blur", onBlur);
		document.removeEventListener("visibilitychange", onVisibility);
		window.removeEventListener("gamepadconnected", onPadConnect);
		window.removeEventListener("gamepaddisconnected", onPadDisconnect);
		window.removeEventListener("pointerdown", wakePad);
		canvas.removeEventListener("pointerdown", onPointerDown);
		canvas.removeEventListener("pointermove", onPointerMove);
		canvas.removeEventListener("pointerup", onPointerUp);
		canvas.removeEventListener("pointercancel", onPointerUp);
		ro.disconnect();
		delete window.__controlsTest;
	};
}


window.startGame = startGame;
window.UNIFORMS = UNIFORMS;
window.OFF_PLAYS = OFF_PLAYS;
window.DEF_SCHEMES = DEF_SCHEMES;
