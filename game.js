"use strict";
/**
 * Football Ground Attack Lab v3 engine
 * Port of v2 canvas sim + v3 cameras, replay, dual-trigger control, play art.
 */

/**
* Football Ground Attack Lab v3 engine
* Port of v2 canvas sim + v3 cameras, replay, dual-trigger control, play art.
*/
/**
* Football Ground Attack Lab — Default feel pass
* Port of the v1 canvas sim + locked v2 mapping / AI / truck / burst / fumble.
*/
const UNIFORMS = [
	{
		id: 0,
		abbr: "DEN",
		name: "Broncos",
		helmet: "#002244",
		jersey: "#FB4F14",
		pants: "#002244",
		number: "#FFFFFF",
		endPrimary: "#002244",
		endSecondary: "#FB4F14"
	},
	{
		id: 1,
		abbr: "KC",
		name: "Chiefs",
		helmet: "#E31837",
		jersey: "#FFFFFF",
		pants: "#E31837",
		number: "#E31837",
		endPrimary: "#E31837",
		endSecondary: "#FFB81C"
	},
	{
		id: 2,
		abbr: "MIN",
		name: "Vikings",
		helmet: "#4F2683",
		jersey: "#FFC62F",
		pants: "#4F2683",
		number: "#4F2683",
		endPrimary: "#4F2683",
		endSecondary: "#FFC62F"
	},
	{
		id: 3,
		abbr: "JAX",
		name: "Jaguars",
		helmet: "#101820",
		jersey: "#006778",
		pants: "#101820",
		number: "#D7A22A",
		endPrimary: "#101820",
		endSecondary: "#006778"
	},
	{
		id: 4,
		abbr: "LV",
		name: "Raiders",
		helmet: "#A5ACAF",
		jersey: "#000000",
		pants: "#A5ACAF",
		number: "#FFFFFF",
		endPrimary: "#000000",
		endSecondary: "#A5ACAF"
	},
	{
		id: 5,
		abbr: "BUF",
		name: "Bills",
		helmet: "#C60C30",
		jersey: "#00338D",
		pants: "#00338D",
		number: "#FFFFFF",
		endPrimary: "#00338D",
		endSecondary: "#C60C30"
	},
	{
		id: 6,
		abbr: "SF",
		name: "49ers",
		helmet: "#B3995D",
		jersey: "#AA0000",
		pants: "#B3995D",
		number: "#FFFFFF",
		endPrimary: "#AA0000",
		endSecondary: "#B3995D"
	},
	{
		id: 7,
		abbr: "GB",
		name: "Packers",
		helmet: "#FFB612",
		jersey: "#203731",
		pants: "#FFB612",
		number: "#FFFFFF",
		endPrimary: "#203731",
		endSecondary: "#FFB612"
	}
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
		id: "diveL",
		name: "Dive Left",
		arrow: [-.25],
		blockStyle: "tight",
		lockFirst: false,
		steps: [{
			dx: -.15,
			dy: 1,
			t: .18
		}]
	},
	{
		id: "diveR",
		name: "Dive Right",
		arrow: [.25],
		blockStyle: "tight",
		lockFirst: false,
		steps: [{
			dx: .15,
			dy: 1,
			t: .18
		}]
	},
	{
		id: "blastL",
		name: "Blast Left",
		arrow: [-.35],
		blockStyle: "push",
		lockFirst: false,
		steps: [{
			dx: -.25,
			dy: 1,
			t: .2
		}]
	},
	{
		id: "blastR",
		name: "Blast Right",
		arrow: [.35],
		blockStyle: "push",
		lockFirst: false,
		steps: [{
			dx: .25,
			dy: 1,
			t: .2
		}]
	},
	{
		id: "sweepL",
		name: "Sweep Left",
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
		name: "Sweep Right",
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
		id: "counterL",
		name: "Counter Left",
		arrow: [.7, -1.1],
		blockStyle: "pullL",
		lockFirst: true,
		steps: [{
			dx: .55,
			dy: .2,
			t: .2
		}, {
			dx: -.85,
			dy: .7,
			t: .22
		}]
	},
	{
		id: "counterR",
		name: "Counter Right",
		arrow: [-.7, 1.1],
		blockStyle: "pullR",
		lockFirst: true,
		steps: [{
			dx: -.55,
			dy: .2,
			t: .2
		}, {
			dx: .85,
			dy: .7,
			t: .22
		}]
	}
];
const DEF_SCHEMES = [
	{
		id: "base",
		name: "Cover 2 Shell",
		depthLB: 5,
		depthDB: 9,
		cluster: "spread"
	},
	{
		id: "tight",
		name: "Tight Box",
		depthLB: 4.2,
		depthDB: 8,
		cluster: "middle"
	},
	{
		id: "wide",
		name: "Spread Contain",
		depthLB: 5.2,
		depthDB: 9.5,
		cluster: "wide"
	},
	{
		id: "shadeL",
		name: "Shade Left",
		depthLB: 4.6,
		depthDB: 8.5,
		cluster: "left"
	},
	{
		id: "shadeR",
		name: "Shade Right",
		depthLB: 4.6,
		depthDB: 8.5,
		cluster: "right"
	},
	{
		id: "press",
		name: "Press Front",
		depthLB: 3.8,
		depthDB: 7.2,
		cluster: "middle"
	},
	{
		id: "soft",
		name: "Soft Zone",
		depthLB: 6.2,
		depthDB: 11,
		cluster: "spread"
	},
	{
		id: "goalLine",
		name: "Goal Line",
		depthLB: 3.6,
		depthDB: 6.2,
		cluster: "middle"
	}
];
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
const STORAGE_KEY = "fga_lab_top5_v3";
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
	const BASE_CANVAS_H = 780;
	const PX_PER_YARD_X = BASE_CANVAS_H / 100;
	const VISIBLE_YARDS = 48;
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
	let clock = 180;
	let gameSeconds = 180;
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
	let numOL = 4;
	let numFB = 1;
	let numTE = 0;
	let numQB = 0;
	let numDT = 0;
	let numLBs = 2;
	let numDBs = 3;
	let playSpeed = 1.25;
	let pendingAdvantage = -1;
	let activeAdvantage = -1;
	let fumblesOn = true;
	let userStartYard = 20;
	let postTdMode = "increment";
	let tdIncrement = -5;
	let randMin = 20;
	let randMax = 80;
	let ballYard = 80;
	let playStartYard = 80;
	let driveStartYard = 80;
	let ballX = 25;
	let sprintCharge = 1;
	let sprintHoldT = 0;
	let sprintExhausted = false;
	let camZoom = 1;
	let breakaway = false;
	let tdZoom = false;
	let cameraMode = "high";
	let camCorner = Math.random() < .5 ? "sw" : "nw";
	let playArtMode = "on";
	let padProfile = "v3";
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
	let ctrlLeft = null;
	let ctrlRight = null;
	let playArtAnchor = {
		x: 25,
		y: 80
	};
	let divePauseEdge = false;
	let autoRun = false;
	let rb = null;
	let qb = null;
	let blockers = [];
	let defenders = [];
	let offUni = 0;
	let defUni = 1;
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
	function userToAbsolute(userYd) {
		return 100 - clamp(userYd, 1, 99);
	}
	function absoluteToUser(abs) {
		return clamp(Math.round(100 - abs), 1, 99);
	}
	function yardLabel(y) {
		if (y >= 100) return "TD";
		if (y <= 0) return "OWN G";
		const u = absoluteToUser(y);
		return (y >= 50 ? "OPP " : "OWN ") + u;
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
		if (cameraMode === "top" || camCorner !== "sw") return base;
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
		if (cameraMode === "top") return {
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
		rb ? rb.x : FIELD_WIDTH / 2;
		if (fumbleSeq) {
			fy = fumbleSeq.ballY;
			fumbleSeq.ballX;
		}
		if (scoreSeq) {
			fy = scoreSeq.player.y;
			scoreSeq.player.x;
		}
		if (ankleCam && ankleCam.t > 0 && ankleCam.runner && ankleCam.defender) {
			ankleCam.runner.x * .72 + ankleCam.defender.x * .28;
			fy = ankleCam.runner.y * .72 + ankleCam.defender.y * .28;
		}
		if (fy == null) return;
		const cam = camSpec();
		const targetY = fy + (cam.follow || 6);
		const snapCam = fumbleSeq && fumbleSeq.phase === "return" ? .72 : .18;
		cameraY += (clamp(targetY, 8, 88) - cameraY) * snapCam;
		const want = (cam.zoom || 1) * (breakaway || tdZoom || !!scoreSeq || ankleCam && ankleCam.t > 0 ? 1.32 : 1);
		camZoom += (want - camZoom) * .1;
		if (ankleCam) {
			ankleCam.t -= 1 / 60;
			if (ankleCam.t <= 0) ankleCam = null;
		}
	}
	function offMult() {
		return 1 + activeAdvantage * .06;
	}
	function defMult() {
		return 1 - activeAdvantage * .05;
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
			p.pants = uni.pants;
			p.numColor = uni.number;
		}
		paint(rb, "off");
		paint(qb, "off");
		blockers.forEach((b) => paint(b, "off"));
		defenders.forEach((d) => paint(d, "def"));
	}
	function hashLeft() {
		return fieldLeft() + FIELD_WIDTH * .26;
	}
	function hashRight() {
		return fieldLeft() + FIELD_WIDTH * .74;
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
			speed: group === "OL" ? 8.15 : group === "FB" ? 8.35 : group === "TE" ? 8.55 : group === "DT" ? 7.45 : group === "QB" ? 7.2 : 9,
			baseSpeed: 0,
			color: uni.jersey,
			helmet: uni.helmet,
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
			levelY: 3
		};
	}
	function choosePlay() {
		let pool = OFF_PLAYS;
		if (playStartYard >= 95 || ballYard >= 95) pool = OFF_PLAYS.filter((p) => !p.id.startsWith("counter"));
		currentPlay = randChoice(pool);
		preSnapTimer = 0;
		scriptSteps = (currentPlay.steps || []).map((s) => ({ ...s }));
		scriptIndex = 0;
		scriptTimer = 0;
		scriptLocked = !!currentPlay.lockFirst;
		const defName = currentScheme && currentScheme.name ? currentScheme.name : "";
		setPlayCall(currentPlay.name + (revealDefThisPlay && defName ? " · vs " + defName : ""));
	}
	function chooseScheme() {
		if (playStartYard >= 95 || ballYard >= 95) {
			currentScheme = DEF_SCHEMES.find((s) => s.id === "goalLine") || DEF_SCHEMES[0];
			return;
		}
		const pool = DEF_SCHEMES.filter((s) => s.id !== "goalLine");
		const weights = pool.map((s) => s.id === "soft" || s.id === "base" || s.id === "wide" ? 2 : 1);
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
		activeAdvantage = pendingAdvantage;
		revealDefThisPlay = Math.random() < .5;
		choosePlay();
		chooseScheme();
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
		celebrateTimer = 0;
		sprintCharge = 1;
		sprintHoldT = 0;
		sprintExhausted = false;
		celebFumbleLock = false;
		tdZoom = false;
		const snap = snapX();
		const behind = playStartYard - (1.6 + Math.random() * 1.8);
		rb = createPlayer(snap + (Math.random() - .5) * 1.4, behind, "HB", 0, "off");
		rb.speed = 9;
		rb.hasBall = true;
		qb = null;
		handoffDone = true;
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
		for (let i = 0; i < numFB; i++) {
			const b = createPlayer(snap + (i - (numFB - 1) / 2) * 2, playStartYard + .4, "FB", i, "off");
			b.speed = 8.95;
			blockers.push(b);
		}
		if (numQB > 0) {
			qb = createPlayer(snap - .35, playStartYard - .35, "QB", 0, "off");
			qb.speed = 7.35;
			blockers.push(qb);
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
		const depthScale = 1;
		for (let i = 0; i < numDT; i++) {
			const t = numDT <= 1 ? .5 : i / (numDT - 1);
			const x = snap + (t - .5) * Math.min(FIELD_WIDTH * .28, 2.4 * numDT);
			const d = createPlayer(x + (Math.random() - .5) * .5, playStartYard + 2.05 + (Math.random() - .5) * .35, "DT", i, "def");
			d.baseSpeed = 7.7;
			d.speed = d.baseSpeed;
			defenders.push(d);
		}
		for (let i = 0; i < numLBs; i++) {
			const d = createPlayer(clusterX(i, numLBs, sch.cluster) + (Math.random() - .5) * 1.3, playStartYard + sch.depthLB * depthScale + (Math.random() - .5) * .9, "LB", i, "def");
			d.baseSpeed = 8.55;
			d.speed = d.baseSpeed;
			defenders.push(d);
		}
		for (let i = 0; i < numDBs; i++) {
			const wide = i === 0 || i === numDBs - 1;
			const extra = wide ? Math.random() * 1.2 : 5.5 + Math.random() * 7;
			let x;
			if (numDBs <= 1) x = mid;
			else if (i === 0) x = flDb + FIELD_WIDTH * .1;
			else if (i === numDBs - 1) x = frDb - FIELD_WIDTH * .1;
			else x = clusterX(i - 1, Math.max(1, numDBs - 2), sch.cluster);
			const d = createPlayer(x + (Math.random() - .5) * 1.2, playStartYard + sch.depthDB * depthScale + extra, "DB", i, "def");
			d.baseSpeed = 9.15;
			d.speed = d.baseSpeed;
			defenders.push(d);
		}
		defenders.forEach((d) => {
			d._pushYards = 0;
		});
		assignDefenseJobs();
		assignBlockJobs();
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
	}
	function playSideSign() {
		if ((currentPlay ? currentPlay.id : "").endsWith("L") || currentPlay && currentPlay.blockStyle === "wallL" || currentPlay && currentPlay.blockStyle === "pullL") return -1;
		return 1;
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
		let nPull = 0;
		if (style === "pullL" || style === "pullR") nPull = 1 + (Math.random() < .42 ? 1 : 0);
		else if (style === "wallL" || style === "wallR") nPull = Math.random() < .5 ? 1 : Math.random() < .2 ? 2 : 0;
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
	function assignDefenseJobs() {
		const fl = fieldLeft();
		const fr = fieldRight();
		const mid = (fl + fr) / 2;
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
			d.jobY = playStartYard - .25 - Math.random() * .85;
			d.artCurve = opts.curve != null ? opts.curve : Math.random() < .42;
			d.stutter = !!opts.stutter;
			if (d.stutter) {
				const swing = opts.swing != null ? opts.swing : d.x < mid ? 1.7 : -1.7;
				d.stutterX = clamp((d.x + d.jobX) / 2 + swing, fl + 3.4, fr - 3.4);
				d.stutterY = playStartYard + 1.05 + Math.random() * 1.2;
				d.artCurve = true;
			}
		}
		defenders.filter((d) => d.group === "DT").forEach((d, i) => {
			d.readT = .08 + Math.random() * .12;
			setBlitz(d, d.x + (i % 2 === 0 ? -.4 : .4), { curve: Math.random() < .3, stutter: false });
		});
		let corners = [];
		let safeties = [];
		if (dbs.length <= 1) {
			if (dbs[0]) {
				if (Math.random() < .5) corners = dbs;
				else safeties = dbs;
			}
		} else if (dbs.length === 2) corners = dbs;
		else {
			corners = [dbs[0], dbs[dbs.length - 1]];
			safeties = dbs.slice(1, -1);
		}
		function zoneFor(d, kind, x, y, rx, ry) {
			d.job = kind;
			d.jobX = clamp(x, fl + 3, fr - 3);
			d.jobY = y;
			d.zoneRx = rx;
			d.zoneRy = ry;
			d.artCurve = false;
			d.stutter = false;
		}
		corners.forEach((d) => {
			d.isCorner = true;
			d.isSafety = false;
			d.readT = .42 + Math.random() * .38;
			const side = d.x < mid ? -1 : 1;
			const r = Math.random();
			if (r < .12) d.job = "blitz";
			else if (r < .28) d.job = "man";
			else if (r < .42) d.job = "deep";
			else if (r < .62) d.job = "flat";
			else d.job = "contain";
			if (d.job === "contain") zoneFor(d, "contain", side < 0 ? fl + FIELD_WIDTH * .16 : fr - FIELD_WIDTH * .16, playStartYard + 5 + Math.random() * 2, 2.4, 2.8);
			else if (d.job === "deep") zoneFor(d, "deep", side < 0 ? fl + FIELD_WIDTH * .24 : fr - FIELD_WIDTH * .24, Math.min(99, playStartYard + 12 + Math.random() * 4), 6.4, 5);
			else if (d.job === "flat") zoneFor(d, "flat", side < 0 ? fl + FIELD_WIDTH * .2 : fr - FIELD_WIDTH * .2, playStartYard + 3.2 + Math.random(), 5.4, 1.32);
			else if (d.job === "man") {
				const sorted = [...blockers].sort((a, b) => a.x - b.x);
				const t = side < 0 ? sorted[0] : sorted[sorted.length - 1];
				d.manIdx = t ? blockers.indexOf(t) : -1;
				d.jobX = d.x;
				d.jobY = playStartYard + 6;
			} else setBlitz(d, d.x - side * 2.4, {
				curve: Math.random() < .55,
				stutter: Math.random() < .4,
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
			d.readT = .48 + Math.random() * .4;
		});
		const shells = ["cover2", "cover3", "cover4", "tampa2", "cover6", "palms"];
		const shell = shells[Math.floor(Math.random() * shells.length)];
		function deepAt(d, x, y, rx, ry, job) {
			zoneFor(d, job || "deep", x, Math.min(99, y), rx, ry);
			if (job === "deep" || job === "robber") d.isSafety = true;
		}
		const poolDb = [...safeties, ...corners.filter((c) => c.job !== "contain")];
		if (shell === "cover2") {
			const two = (safeties.length >= 2 ? safeties : poolDb).slice(0, 2);
			two.forEach((d, i) => deepAt(d, mid + (i === 0 ? -1 : 1) * FIELD_WIDTH * .2, playStartYard + 14.5 + Math.random() * 2.4, 8.4, 5.2, "deep"));
		} else if (shell === "cover3") {
			const midS = safeties[0] || poolDb[0];
			if (midS) deepAt(midS, mid, playStartYard + 15.5 + Math.random() * 2, 6.2, 5.6, "deep");
			const wings = corners.filter((c) => c !== midS).slice(0, 2);
			wings.forEach((d, i) => deepAt(d, mid + (i === 0 ? -1 : 1) * FIELD_WIDTH * .22, playStartYard + 13 + Math.random() * 2, 5.4, 4.6, "deep"));
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
				deepAt(d, side < 0 ? fl + FIELD_WIDTH * .18 : fr - FIELD_WIDTH * .18, playStartYard + 11.5 + Math.random() * 1.8, 6.2, 2.2, "curl");
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
			d.readT = .38 + Math.random() * .32;
			if (shell === "tampa2" && i === Math.floor(lbs.length / 2)) {
				zoneFor(d, "hook", mid, playStartYard + 11.2 + Math.random(), 3.5, 3.3);
				return;
			}
			const r = Math.random();
			if (r < .38) {
				const cross = lbs.length >= 2 && Math.random() < .5;
				setBlitz(d, cross ? lbs[(i + 1) % lbs.length].x : d.x, {
					curve: true,
					stutter: cross || Math.random() < .28,
					swing: (i % 2 === 0 ? 1 : -1) * (1.5 + Math.random())
				});
				if (Math.random() < .2) {
					d.fakeBlitz = true;
					d.reactT = .45 + Math.random() * .35;
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
				d.artCurve = lbs.length >= 2 && Math.random() < .4;
			} else if (r < .72) {
				const depth = 4.6 + i * 2.1 + Math.random() * 1.4;
				zoneFor(d, "drop", mid + (i - (lbs.length - 1) / 2) * Math.max(5.4, FIELD_WIDTH * .12), playStartYard + depth, 2.6, 2.4);
			} else if (r < .88) {
				zoneFor(d, "hook", mid + (i - (lbs.length - 1) / 2) * Math.max(4.6, FIELD_WIDTH * .1) + (Math.random() - .5) * 1.4, playStartYard + 8.2 + Math.random() * 2.4, 3.2, 3);
			} else zoneFor(d, "flat", d.x < mid ? fl + FIELD_WIDTH * .2 : fr - FIELD_WIDTH * .2, playStartYard + 3.6, 5.2, 1.28);
		});
		const blitzCount = defenders.filter((d) => d.job === "blitz").length;
		const need = Math.ceil(defenders.length * .3);
		if (blitzCount < need) {
			const candidates = defenders.filter((d) => d.job !== "blitz" && d.job !== "deep" && d.job !== "curl" && d.job !== "robber" && d.job !== "hook" && !d.isSafety).sort(() => Math.random() - .5);
			for (let i = 0; i < need - blitzCount && i < candidates.length; i++) {
				const d = candidates[i];
				if (d.job === "contain" && defenders.filter((x) => x.job === "contain").length <= 1) continue;
				setBlitz(d, d.x, {
					curve: Math.random() < .5,
					stutter: Math.random() < .28
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
				zoneFor(d, "deep", mid + side * FIELD_WIDTH * .14, Math.min(99, playStartYard + depth), 6.6, 5);
				d.isSafety = true;
			});
		}
		if (countJob("contain") < 2 && corners.length) {
			const cands = corners.filter((d) => d.job !== "contain" && d.job !== "deep").sort((a, b) => a.x - b.x);
			if (cands[0]) zoneFor(cands[0], "contain", fl + FIELD_WIDTH * .16, playStartYard + 5.2, 2.4, 2.8);
			if (cands[cands.length - 1] && cands[cands.length - 1] !== cands[0]) zoneFor(cands[cands.length - 1], "contain", fr - FIELD_WIDTH * .16, playStartYard + 5.2, 2.4, 2.8);
		}
		if (Math.random() < .32 && blockers.length && defenders.length) {
			const victim = defenders[Math.floor(Math.random() * defenders.length)];
			victim.misfireT = 1.8 + Math.random() * 1.4;
			victim.misfireIdx = Math.floor(Math.random() * blockers.length);
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
	function classifyDpad(b) {
		const n = (b.u ? 1 : 0) + (b.d ? 1 : 0) + (b.l ? 1 : 0) + (b.r ? 1 : 0);
		if (n === 0 || n >= 3) return null;
		if (b.u && b.d) return null;
		if (b.l && b.r) return null;
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
			if (padProfile === "v3") {
				if (keys.has("KeyV") || keys.has("KeyY")) hurdle = true;
			} else if (keys.has("KeyV") || keys.has("KeyY")) truck = true;
			if (keys.has("KeyQ")) jukeL = true;
			if (keys.has("KeyE")) jukeR = true;
			if (keys.has("KeyH")) peek = true;
			if (keys.has("KeyR")) replayPress = true;
			if (padProfile === "v3") {
				if (keys.has("KeyZ")) ctrlL = true;
				if (keys.has("KeyX")) ctrlR = true;
				if (keys.has("Comma") || keys.has("KeyN")) dpadMove = dpadMove || "shakeL";
				if (keys.has("Period") || keys.has("KeyM")) dpadMove = dpadMove || "shakeR";
			} else {
				if (keys.has("KeyZ")) stiffL = true;
				if (keys.has("KeyX")) stiffR = true;
			}
			if (keys.has("KeyG")) celebrate = true;
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
		const btn = (i) => !!(gp && gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > .4));
		const kbDpad = {
			u: !typing && keys.has("KeyI"),
			d: !typing && keys.has("KeyK"),
			l: !typing && keys.has("KeyJ"),
			r: !typing && keys.has("KeyL")
		};
		const gpDpad = {
			u: btn(12),
			d: btn(13),
			l: btn(14),
			r: btn(15)
		};
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
					dpadMove = padProfile === "basic" ? null : classifyDpad(dpadPending);
					dpadLatch = true;
					dpadPending = null;
				}
			}
		} else if (dpadPending) {
			dpadPendingT += dt;
			if (dpadPendingT >= DPAD_DIAG_WIN) {
				dpadMove = padProfile === "basic" ? null : classifyDpad(dpadPending);
				dpadLatch = true;
				dpadPending = null;
			}
		}
		if (gp) {
			padLive = true;
			padName = gp.id || "Xbox";
			const st = radialDeadzone(gp.axes[0] || 0, -(gp.axes[1] || 0), .18);
			const rst = radialDeadzone(gp.axes[2] || 0, -(gp.axes[3] || 0), .22);
			const lt = gp.buttons[6] && gp.buttons[6].value || 0;
			const rt = gp.buttons[7] && gp.buttons[7].value || 0;
			if (padProfile === "v3") {
				ctrlL = ctrlL || lt > .52;
				ctrlR = ctrlR || rt > .52;
			}
			if (st.x !== 0 || st.y !== 0) {
				dx = st.x;
				dy = st.y;
				autoRun = false;
				if (padProfile === "v3" && ctrlL) {
					blockLdx = st.x;
					blockLdy = st.y;
				}
				if (padProfile === "v3" && ctrlR) {
					if (ctrlL && Math.hypot(rst.x, rst.y) >= .14) {
						blockRdx = rst.x;
						blockRdy = rst.y;
					} else {
						blockRdx = st.x;
						blockRdy = st.y;
					}
				}
			} else if (padProfile === "v3" && (ctrlL || ctrlR)) autoRun = true;
			else autoRun = false;
			if (padProfile === "v3" && !ctrlR) {
				if (rst.x < -.55) dpadMove = dpadMove || "shakeL";
				if (rst.x > .55) dpadMove = dpadMove || "shakeR";
				if (rst.y > .65) dpadMove = dpadMove || "hurdle";
				if (rst.y < -.65) dpadMove = dpadMove || "deadleg";
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
			if (padProfile !== "v3") {
				if (btn(6) || gp.axes[2] !== void 0 && gp.axes[2] > .4) stiffL = true;
				if (btn(7) || gp.axes[5] !== void 0 && gp.axes[5] > .4) stiffR = true;
			}
			if (btn(8)) celebrate = true;
			if (padProfile === "basic") {
				if (btn(9)) pausePress = true;
			} else if (btn(11)) pausePress = true;
			if (btn(9) && padProfile !== "basic") peek = true;
			const aNow = btn(0);
			const sNow = btn(9);
			if (aNow && !prevA || sNow && !prevStart) confirm = true;
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
		if (padProfile === "v3" && !gp) {
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
			blockRdy
		};
	}
	function tryMiss(kind) {
		if (!rb) return;
		for (const d of defenders) {
			if (d.engageT > 0) continue;
			if (d.state !== "commit" && d.state !== "breakdown") continue;
			const dd = dist(d, rb);
			if (dd > 5.2) continue;
			const side = Math.sign(d.x - rb.x) || 1;
			const trail = rb.y - d.y;
			let chance = 0;
			if (kind === "jukeL") chance = side > 0 ? .78 : .28;
			else if (kind === "jukeR") chance = side < 0 ? .78 : .28;
			else if (kind === "shakeL" || kind === "shakeR") chance = d.state === "commit" ? .9 : .72;
			else if (kind === "spin") chance = Math.abs(side) && trail > -.5 ? .58 : .28;
			else if (kind.startsWith("deadleg")) chance = trail > .2 ? .82 : .35;
			else continue;
			if (d.state === "breakdown") chance *= .75;
			if (Math.random() > chance) continue;
			d.state = "whiff";
			d.whiffT = kind.startsWith("shake") ? .52 : .38;
			d.low = true;
			const spd = Math.hypot(d.vx, d.vy) || d.speed * .6;
			const ang = Math.atan2(d.vy, d.vx) || d.facing;
			const boost = kind.startsWith("shake") ? 1.55 : 1.4;
			d.vx = Math.cos(ang) * spd * boost;
			d.vy = Math.sin(ang) * spd * boost;
			if (kind === "shakeL") d.vx += 3.2;
			else if (kind === "shakeR") d.vx -= 3.2;
			if (kind.startsWith("shake") || d.state === "whiff" && dd < 2.35 && chance >= .7) triggerAnkleCam(rb, d);
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
			currentSchemeName: currentScheme ? currentScheme.name : ""
		};
	}
	function triggerAnkleCam(runner, defender) {
		ankleCam = {
			t: 1.25,
			runner,
			defender
		};
		startPip(2.6);
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
		b._userCtrl = .28;
		let dx = Math.cos(rb.facing || Math.PI / 2);
		let dy = Math.sin(rb.facing || Math.PI / 2);
		const mag = Math.hypot(sdx, sdy);
		if (mag >= .12) {
			dx = sdx / mag;
			dy = sdy / mag;
		}
		const spd = (b.speed || 8.6) * offMult() * 1.12;
		b.x += dx * spd * dt;
		b.y += dy * spd * dt;
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
		rb.hasBall = true;
		if (down) {
			rb.low = true;
			const yg = Math.round(spotY - playStartYard);
			fumbleSeq = null;
			endPlay("Fumble recovered", yg, clamp(spotY, 0, 100));
		} else fumbleSeq = null;
	}
	function pickSpikeStyle(player) {
		const mid = (fieldLeft() + fieldRight()) / 2;
		const postHalf = FIELD_WIDTH * .14;
		const centerHalf = Math.max(1.15, FIELD_WIDTH * .03);
		const mag = Math.hypot(lastSteer.dx, lastSteer.dy) || 1;
		const lateral = Math.abs(lastSteer.dx / mag);
		const off = Math.abs(player.x - mid);
		if (off <= postHalf) {
			if (off <= centerHalf && Math.random() < .18) return "post";
			return "dunk";
		}
		if (lateral < .32) return "casual";
		return "force";
	}
	function spikeDirFromInput(player) {
		if (Math.abs(lastSteer.dx) > .18) return lastSteer.dx < 0 ? -1 : 1;
		if (player && Math.abs(player.vx) > .45) return player.vx < 0 ? -1 : 1;
		const mid = (fieldLeft() + fieldRight()) / 2;
		return player && player.x < mid ? -1 : 1;
	}
	function startScoreSeq(who, player, spike, playYards, nextStart) {
		tdZoom = true;
		const doSpike = !!(spike || who === "def");
		const style = doSpike ? pickSpikeStyle(player) : "none";
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
			bounceN: 0
		};
		player.hasBall = !doSpike;
		player.hop = 0;
		player.low = false;
		if (who === "off") startPip(3.6);
	}
	function tickScore(dt) {
		const s = scoreSeq;
		if (!s) return;
		s.t += dt;
		const p = s.player;
		const dir = s.spikeDir || 1;
		if (s.who === "off") {
			p.y = Math.min(105.5, p.y + 3.2 * dt);
			p.vy = 3.2;
		} else {
			p.y = Math.max(-6.2, p.y - 8.2 * playSpeed * dt);
			p.vy = -8.2 * playSpeed;
		}
		if (s.spikeStyle === "dunk" && s.spike) {
			if (s.t < .48) p.hop = Math.sin(s.t / .48 * Math.PI) * 3.35;
			else p.hop = Math.max(0, 1.35 - (s.t - .48) * 4.2);
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
		const releaseAt = s.spikeStyle === "force" ? .62 : s.spikeStyle === "dunk" ? .38 : s.spikeStyle === "post" ? .42 : .32;
		if (s.spike && !s.ballOut && s.t > releaseAt) {
			s.ballOut = true;
			p.hasBall = false;
			p.hop = s.spikeStyle === "force" ? .7 : s.spikeStyle === "dunk" ? 1.2 : 1.1;
			const mid = (fieldLeft() + fieldRight()) / 2;
			if (s.spikeStyle === "dunk") {
				s.ballX = p.x;
				s.ballY = p.y + .8;
				s.ballHop = 7.4;
				s.ballHopV = 9.2;
				s.ballVx = (mid - p.x) * .2;
				s.ballVy = s.who === "off" ? 18 : -18;
			} else if (s.spikeStyle === "punt") {
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
			const g = s.spikeStyle === "punt" || s.spikeStyle === "throw" || s.spikeStyle === "post" || s.spikeStyle === "dunk" ? 11.2 : s.spikeStyle === "force" ? 28 : 18;
			s.ballHopV -= g * dt;
			s.ballHop += s.ballHopV * dt;
			s.ballX += (s.ballVx || 0) * dt;
			s.ballY += (s.ballVy || (s.who === "off" ? 1.4 : -1.4)) * dt;
			if (s.spikeStyle === "punt" || s.spikeStyle === "throw" || s.spikeStyle === "post" || s.spikeStyle === "dunk") s.ballVy = (s.ballVy || 0) - 1.6 * dt;
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
		if (p.hop > 0 && !(s.spikeStyle === "force" && s.t < .68) && s.spikeStyle !== "dunk") p.hop = Math.max(0, p.hop - 4 * dt);
		const hold = s.who === "def" ? s.spike ? 1.18 : .48 : s.spikeStyle === "force" ? 1.85 : s.spikeStyle === "dunk" || s.spikeStyle === "punt" || s.spikeStyle === "throw" ? 1.55 : s.spikeStyle === "post" ? 1.4 : s.spike ? 1.12 : 1.55;
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
		const yg = Math.max(0, Math.round(rb.y - playStartYard));
		tdCount += 1;
		score += 100;
		tdZoom = true;
		postTdMode = document.querySelector("input[name=\"postTdMode\"]:checked")?.value || "increment";
		tdIncrement = parseInt($("incrementInput")?.value || "-5", 10) || -5;
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
		let lat = Math.sign(b.x - rb.x);
		if (!lat) lat = b.driveSide || 1;
		const need = minD - dd;
		if (b._escortFrom == null) b._escortFrom = rb.y;
		const shoved = rb.y - b._escortFrom;
		const peel = shoved > 6.5;
		b.x += lat * need * (peel ? 1.75 : 1.08);
		if (peel) {
			b.y = Math.min(b.y, rb.y + .35);
			b.x += lat * Math.min(.22, .04 + shoved * .012);
		} else if (b.y <= rb.y + .45) b.y += need * .28;
		b.x = clamp(b.x, fieldLeft() + .8, fieldRight() - .8);
		const dd2 = dist(rb, b);
		if (dd2 < minD && dd2 > .01) rb.x -= lat * (minD - dd2) * .12;
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
			const lo = Math.min(randMin, randMax);
			return userToAbsolute(lo + Math.random() * (Math.max(randMin, randMax) - lo));
		}
		return userToAbsolute(clamp(absoluteToUser(driveStartYard) - tdIncrement, 1, 99));
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
	function syncAbbrFromOffense() {
		const abbr = UNIFORMS[offUni]?.abbr || "DEN";
		const el = $("teamAbbr");
		if (el) el.value = abbr;
		const ni = $("nameInput");
		if (ni) ni.value = abbr;
	}
	function getTeamAbbr() {
		const el = $("teamAbbr");
		if (!el) return "DEN";
		el.value = (el.value || "DEN").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "DEN";
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
		if (!offSel || !defSel) return;
		offSel.innerHTML = "";
		defSel.innerHTML = "";
		UNIFORMS.forEach((u) => {
			const o1 = document.createElement("option");
			o1.value = String(u.id);
			o1.textContent = u.abbr;
			if (u.id === offUni) o1.selected = true;
			offSel.appendChild(o1);
			if (u.id !== offUni) {
				const o2 = document.createElement("option");
				o2.value = String(u.id);
				o2.textContent = u.abbr;
				if (u.id === defUni) o2.selected = true;
				defSel.appendChild(o2);
			}
		});
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
	}
	function fullRestart(keepOffense = false) {
		clearAutoStart();
		modalShow("nameModal", false);
		userStartYard = clamp(parseInt($("startYardInput")?.value || "20", 10) || 20, 1, 99);
		tdIncrement = parseInt($("incrementInput")?.value || "-5", 10) || -5;
		randMin = clamp(parseInt($("randMin")?.value || "20", 10) || 20, 1, 99);
		randMax = clamp(parseInt($("randMax")?.value || "80", 10) || 80, 1, 99);
		postTdMode = document.querySelector("input[name=\"postTdMode\"]:checked")?.value || "increment";
		gameSeconds = parseInt($("minSelect")?.value || "180", 10) || 180;
		clock = gameSeconds;
		if (!keepOffense) {
			if (Math.random() < .6) offUni = 0;
			else offUni = randChoice(UNIFORMS.filter((u) => u.id !== 0)).id;
		}
		defUni = randChoice(UNIFORMS.filter((u) => u.id !== offUni)).id;
		randomizeSurface();
		rebuildUniformSelects();
		syncAbbrFromOffense();
		logoFlip = Math.random() < .5 ? 1 : -1;
		fieldArtSide = Math.random() < .5 ? "off" : "def";
		camCorner = Math.random() < .5 ? "sw" : "nw";
		const cornerEl = $("camCornerSelect");
		if (cornerEl) cornerEl.value = camCorner;
		refreshAllNumbers();
		score = 0;
		totalYards = 0;
		tdCount = 0;
		ballYard = userToAbsolute(userStartYard);
		playStartYard = ballYard;
		driveStartYard = ballYard;
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
			clockEl.textContent = formatClock(clock);
			const expired = clock <= 0;
			const low = clock > 0 && clock <= 10;
			clockEl.classList.toggle("text-red-400", low || expired);
			clockEl.classList.toggle("font-bold", low || expired);
			clockEl.classList.toggle("clock-expired", expired && !sessionOver);
		}
		const ps = $("padStatus");
		if (ps) ps.textContent = padName ? "Pad · " + padProfile : "Pad: — · " + padProfile;
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
			name: (name || "DEN").toUpperCase().slice(0, 3),
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
		if (ni) ni.value = UNIFORMS[offUni]?.abbr || "DEN";
		modalShow("nameModal", true);
		ni?.focus();
	}
	function submitScore() {
		clearAutoStart();
		tryAddScore(($("nameInput")?.value || UNIFORMS[offUni]?.abbr || "DEN").toUpperCase().slice(0, 3), score);
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
				setPaused(false);
			} else {
				fullReplay.acc += dt * 1.05;
				const step = 1 / REPLAY_HZ;
				while (fullReplay && fullReplay.acc >= step) {
					fullReplay.acc -= step;
					fullReplay.i += 1;
					if (fullReplay.i >= fullReplay.frames.length) {
						fullReplay = null;
						setPaused(false);
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
		if ((inp.ctrlL || inp.ctrlR) && autoRun && Math.hypot(inp.dx, inp.dy) < .12 && Math.hypot(lastSteer.dx, lastSteer.dy) > .08) {
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
				ctrlLeft = nearestTeammate(-1);
				steerTeammate(ctrlLeft, inp.blockLdx, inp.blockLdy, dt);
			}
			if (inp.ctrlR) {
				ctrlRight = nearestTeammate(1, ctrlLeft);
				steerTeammate(ctrlRight, inp.blockRdx, inp.blockRdy, dt);
			}
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
				if (clock <= 0) {
					expireGame();
					return;
				}
				playActive = true;
				pauseTimer = 0;
				tackleAnim = null;
				playStartYard = ballYard;
				try {
					placeEntitiesForNewPlay();
					currentPlay && currentPlay.name;
				} catch (err) {
					console.error(err);
				}
			}
			return;
		}
		if (clock > 0 && preSnapTimer <= 0) {
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
		if (moveTimer > 0) {
			moveTimer -= dt;
			if (moveTimer <= 0) {
				if (activeMove === "dive" && dive) {
					finishDive(dive.phase === "slide" ? "Dive — slide" : "Dive");
					return;
				}
				if (rb && activeMove === "spin") rb.spinT = 0;
				activeMove = null;
				if (rb) rb.low = false;
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
			if (inp.sprint && !sprintExhausted && sprintCharge > .06) {
				const mix = .2 + .8 * sprintCharge;
				spd *= 1 + (SPRINT_MULT - 1) * mix;
				sprintCharge = Math.max(0, sprintCharge - .32 * dt);
				if (sprintCharge <= .04) sprintExhausted = true;
			} else {
				sprintCharge = Math.min(1, sprintCharge + (sprintExhausted ? .12 : .18) * dt);
				if (sprintExhausted && sprintCharge >= .42) sprintExhausted = false;
			}
			if (sprintExhausted) spd *= .86;
			let clearBoost = 1;
			breakaway = false;
			if (handoffDone && !activeMove && defenders.length) {
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
				if (nd > 6.5 && trail > 2.4) {
					clearBoost = 1.55;
					breakaway = true;
				}
			}
			spd *= clearBoost;
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
			if (tgt && rb) {
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
			if (!tgt) {
				let best = null, nd = 8.8;
				defenders.forEach((d) => {
					if (d.state === "whiff" || d.state === "recover" || claimedDefs.has(d)) return;
					if (d.y < rb.y - 1.6) return;
					const nearPath = Math.abs(d.x - rb.x) < 5.8 || Math.abs(d.x - b.x) < 3.4;
					if (!nearPath) return;
					const dd = dist(d, b) * .4 + dist(d, rb) * .6;
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
			if (b.blockMode === "pull" && b.pullVia) {
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
					targetX = tgt.x + (b.driveSide || 1) * .65;
					targetY = tgt.y + .4;
				} else {
					targetX = rb.x + playSideSign() * 3.2;
					targetY = Math.max(playStartYard + 3.5, rb.y + 2.2);
				}
			} else if (tgt) {
				const side = b.driveSide || Math.sign(tgt.x - rb.x) || 1;
				targetX = tgt.x + side * .75;
				targetY = tgt.y + (b.blockMode === "climb" ? .25 : .4);
				if (b.blockMode === "reach") {
					targetX = tgt.x + side * 1.15;
					targetY = tgt.y + .15;
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
					targetX = best.x + (b.driveSide || 1) * .6;
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
					const dd = dist(d, rb);
					if (dd < td) {
						td = dd;
						threat = d;
					}
				});
				if (threat) {
					claimedDefs.add(threat);
					b.blockTarget = threat;
					targetX = threat.x + (b.driveSide || 1) * .7;
					targetY = threat.y + .3;
				} else if (gained > 6.2) {
					const side = Math.sign(b.x - rb.x) || b.driveSide || (lane < 0 ? -1 : 1);
					targetX = rb.x + side * (3.3 + Math.min(3.6, (gained - 6) * .32));
					targetY = rb.y + .55;
				} else {
					targetX = rb.x + lane * 2.8 + (b.driveSide || 0) * .4;
					targetY = Math.max(playStartYard + (b.levelY || 3), rb.y + 3.1);
					if (idleCarrierT > .4) {
						targetX = rb.x + (lane === 0 ? (b.driveSide || 1) : lane) * 3.4;
						targetY = rb.y + 3.6;
					}
				}
			}
			if (playStartYard >= 95 || rb.y >= 96) {
				const lane = idx - (nB - 1) / 2;
				targetX = snapX() + lane * 3.05 + (b.driveSide || 1) * .35;
				targetY = Math.min(103.2, playStartYard + 3.4 + Math.abs(lane) * .8);
			}
			const ang = Math.atan2(targetY - b.y, targetX - b.x);
			let bspd = b.speed * offMult() * playSpeed;
			const fatigue = playAge < 4.5 ? 1 : Math.max(.55, 1 - (playAge - 4.5) * .1);
			bspd *= fatigue;
			if (style === "wallL" || style === "wallR") bspd *= 1.12;
			if (b.blockMode === "pull" && b.pullPhase < 2) bspd *= 1.18;
			if (!tgt) bspd *= 1.06;
			b.x += Math.cos(ang) * bspd * dt;
			b.y += Math.sin(ang) * bspd * dt;
			turnToward(b, ang, dt, 10);
			const backLimit = behindLos ? Math.min(playStartYard - 8, rb.y - 2) : playStartYard - 6;
			b.y = clamp(b.y, backLimit, Math.min(104.8, Math.max(rb.y + 10, playStartYard + 12)));
			b.x = clamp(b.x, fl + 1, fr - 1);
		});
		blockers.forEach((b) => {
			if (!b.active) return;
			defenders.forEach((d) => {
				const gap = b.radius + d.radius + .12;
				const dd = dist(b, d);
				if (dd < gap + .08) {
					if (d.state === "whiff" || d.state === "recover" || d.recoverT > 0) return;
					const holding = rb && dist(d, rb) + .25 < dist(b, rb);
					if (holding || rb && dist(d, rb) > 9.2) {
						d.engageT = 0;
						d.state = "recover";
						d.recoverT = .1;
						d.low = false;
						const ang = rb ? Math.atan2(rb.y - d.y, rb.x - d.x) : -Math.PI / 2;
						d.vx = Math.cos(ang) * 9;
						d.vy = Math.sin(ang) * 9;
						return;
					}
					if (d.engageT <= 0) {
						const holding = rb && dist(d, rb) + .25 < dist(b, rb);
						const farPlay = rb && dist(d, rb) > 8.5;
						const slipP = (d._pushYards || 0) > .65 || d.y > 95.5 || rb && d.y > rb.y + 2.4 || playAge > 1.35 || idleCarrierT > .28 ? .94 : .58;
						if (holding || farPlay || idleCarrierT > .4 || Math.random() < slipP) {
							d.engageT = 0;
							d.state = "recover";
							d.recoverT = holding ? .08 : .14 + Math.random() * .12;
							d.low = false;
							const ang = rb ? Math.atan2(rb.y - d.y, rb.x - d.x) : -Math.PI / 2;
							d.vx = Math.cos(ang) * (8 + Math.random() * 3);
							d.vy = Math.sin(ang) * (8 + Math.random() * 3);
							return;
						}
						const fatigue = playAge < 1.6 ? 1 : Math.max(.28, 1 - (playAge - 1.6) * .32);
						d.engageT = (.14 + Math.random() * .12) * fatigue;
						if (b.y <= d.y + .55 && Math.random() < (b.group === "FB" ? .16 : .11)) {
							d.state = "whiff";
							d.whiffT = 1.85 + Math.random() * .7;
							d.low = true;
							d.spinT = .7 + Math.random() * .35;
							d.vx = (Math.sign(d.x - b.x) || 1) * (2.4 + Math.random() * 1.6);
							d.vy = 4.2 + Math.random() * 2.2;
							d.engageT = 0;
							return;
						}
					}
					d.slowed = Math.max(d.slowed, .42);
					const hole = rb ? rb.x : snapX();
					const side = Math.sign(d.x - hole) || Math.sign(d.x - b.x) || 1;
					const overlap = Math.max(.04, gap - dd + .1);
					d.x += side * Math.min(.2, .07 + overlap * .42);
					let dyPush = Math.min(.28, .1 + overlap * .55);
					if (d.y > 94 && !inGoal()) dyPush *= .12;
					if (inGoal()) dyPush *= 1.15;
					if (rb && d.y > rb.y + 3.2) dyPush *= .18;
					d.y += dyPush;
					d.y = Math.min(d.y, 104.6);
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
					d._pushYards = (d._pushYards || 0) + overlap;
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
		separate(blockers, playStartYard >= 92 || rb && rb.y >= 95 ? 2.85 : 2.65);
		separate(defenders, 2.35);
		yieldToCarrier();
		defenders.forEach((d) => {
			if (!rb) return;
			if (d.engageT > 0) {
				d.engageT -= dt;
				d.y = Math.min(d.y, 104.6);
				if (rb && (d.y > rb.y + 4.2 || dist(d, rb) < 2.2)) {
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
				d.x += d.vx * dt;
				d.y += d.vy * dt;
				d.low = true;
				d.state = "whiff";
				if (d.whiffT <= 0) {
					d.state = "recover";
					d.recoverT = .55;
					d.vx *= .2;
					d.vy *= .2;
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
				}
				d.x = clamp(d.x, fieldLeft() + .8, fieldRight() - .8);
				return;
			}
			if (d.readT > 0) d.readT -= dt;
			if (d.reactT > 0) d.reactT -= dt;
			if (d.misfireT > 0) d.misfireT -= dt;
			if (d.lagT > 0) {
				d.lagT -= dt;
				if (d.lagT <= 0) d.lagT = -1;
			} else if (d.lagT < 0 && dist(d, rb) > 6) d.lagT = 0;
			d.sprintT += dt;
			const distToRb = dist(d, rb);
			const trail = rb.y - d.y;
			const zoneBehind = d.jobY != null && rb.y > d.jobY + 1.15;
			const dancing = playAge > 3.2 || Math.abs(rb.vx) > 6;
			const zoneJob = d.job === "deep" || d.job === "drop" || d.job === "flat" || d.job === "curl" || d.job === "hook" || d.job === "robber" || d.job === "contain";
			const pastZone = d.jobY != null && rb.y > d.jobY + 2.4;
			const atLevel = zoneJob && d.jobY != null && !pastZone && rb.y > playStartYard - 1 && rb.y > d.jobY - 8;
			const keepDeep = (d.job === "deep" || d.job === "robber") && !dancing && !pastZone && rb.y - playStartYard < 12 && distToRb > 6 && playAge < 4;
			d.sprintOn = distToRb < 8.6 && trail < 3.4 || distToRb < 4.2;
			if (d.slowed > 0) {
				d.speed = d.baseSpeed * .55 * defMult() * playSpeed;
				d.slowed -= dt;
			} else d.speed = d.baseSpeed * defMult() * playSpeed;
			if (d.sprintOn) d.speed *= SPRINT_MULT;
			if (d.engageT > 0) d.speed *= .32;
			if (d.lagT > 0) d.speed *= .45;
			if (trail > 2.2 && distToRb > 3.6) d.speed *= .94;
			if (distToRb < 3.4) d.state = "commit";
			else if (distToRb < 5.2) d.state = "breakdown";
			else d.state = "pursue";
			if (d.state === "commit" && d.lagT === 0 && distToRb < 4.4 && distToRb > 3.2) d.lagT = .04 + Math.random() * .05;
			let shownJob = d.job;
			if (d.fakeBlitz && d.reactT > 0) shownJob = d.job === "blitz" ? "drop" : "blitz";
			const runKnown = d.readT <= 0;
			const behindLos = rb.y < playStartYard - .35;
			let tx = d.x;
			let ty = d.y;
			const wrong = d.misfireT > 0 && distToRb > 7 ? blockers[d.misfireIdx] : null;
			const keepContain = d.job === "contain" && !pastZone && distToRb > 4 && Math.abs(rb.x - d.x) < 10;
			const holdZone = atLevel || (zoneJob && !pastZone && playAge < 3.4 && distToRb > 4.5);
			if (d.stutter && playAge < .5) {
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
			} else if (keepContain) {
				const side = d.x < (fieldLeft() + fieldRight()) / 2 ? -1 : 1;
				tx = rb.x * .55 + (side < 0 ? fieldLeft() + 2.4 : fieldRight() - 2.4) * .45;
				ty = Math.max(rb.y - .2, playStartYard);
			} else if (!runKnown && playAge < .7 && shownJob === "blitz") {
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
				const lead = distToRb < 3.2 ? 0 : Math.min(2.1, distToRb * .14);
				tx = rb.x + (rb.vx || 0) * lead * .1 + (d.laneOffset || 0) * .22;
				ty = rb.y + (behindLos ? 0 : (rb.vy || 0) * lead * .08);
			}
			if (rb.y >= 98.4 && (d.isSafety || d.job === "deep")) {
				tx = rb.x * .7 + d.x * .3;
				ty = Math.min(98.8, Math.max(rb.y + 1.4, 96.5));
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
			if (d.isSafety || d.job === "deep") d.y = Math.min(d.y, 102);
			else d.y = Math.min(d.y, 104.8);
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
					}
				} else {
					const settle = .55 * e;
					rb.x = tackleAnim.ox + tackleAnim.fx * settle;
					rb.y = tackleAnim.oy + tackleAnim.fy * settle * .6;
					if (tackleAnim.defender) {
						tackleAnim.defender.x = rb.x - tackleAnim.fx * .5;
						tackleAnim.defender.y = rb.y - tackleAnim.fy * .35;
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
				if (d.state === "whiff" || d.state === "recover") continue;
				if (d.engageT > 0) continue;
				let tackleRadius = rb.radius + d.radius + .14;
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
						if (inGoal()) {
							if (pile >= 3 && Math.random() < .32) {
								const yg = Math.round(rb.y - playStartYard);
								tackleAnim = {
									mode: "truckDrive",
									timer: .4,
									dur: .4,
									ox: rb.x,
									oy: rb.y,
									fx: (rb.truckDir || 0) * .35,
									fy: 1,
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
							d.x += (dir || Math.sign(d.x - rb.x) || 1) * (1.6 + Math.random());
							d.y += 2.4 + Math.random() * 1.4;
							d.vx = (dir || Math.sign(d.x - rb.x) || 1) * 6;
							d.vy = 7;
							rb.y += .85;
							rb.x += dir * .55;
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
								fx: 0,
								fy: 1,
								dist: 2.2,
								yards: yg + 2,
								defender: d
							};
							return;
						}
						const roll = Math.random();
						if (roll < .55) {
							const yg = Math.round(rb.y - playStartYard);
							const extra = 3 + Math.random() * 5;
							tackleAnim = {
								mode: "truckDrive",
								timer: .7,
								dur: .7,
								ox: rb.x,
								oy: rb.y,
								fx: 0,
								fy: 1,
								dist: extra,
								yards: yg + Math.round(extra),
								defender: d
							};
							return;
						} else if (roll < .85) {
							const knock = 5 + Math.random() * 5;
							d.y += knock;
							d.slowed = .7;
							d.recoverT = .45;
							d.state = "recover";
							d.low = false;
							rb.y += .6;
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
					let fx = rb.x - d.x, fy = rb.y - d.y;
					const flen = Math.hypot(fx, fy) || 1;
					fx /= flen;
					fy /= flen;
					tackleAnim = {
						mode: "tackle",
						timer: .48,
						dur: .48,
						ox: rb.x,
						oy: rb.y,
						fx,
						fy,
						dist: 1.4 + Math.random() * .8,
						yards: yg,
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
		ctx.beginPath();
		ctx.moveTo(sx - r * (.45 - pose.rot * .2), sy - r * .1);
		ctx.lineTo(sx - r * .9 + armSwing * r * .3 * armL, sy + r * .35);
		if (forceSpike) {
			if (st < .28) {
				ctx.moveTo(sx + r * .3, sy - r * .15);
				ctx.lineTo(sx + spikeDir * r * .85, sy - r * .35);
			} else if (!scoreSeq.ballOut) {
				const ang = -Math.PI * .15 + spikeDir * ((st - .28) / .34) * Math.PI * 2.15;
				ctx.moveTo(sx + spikeDir * r * .12, sy - r * .12);
				ctx.lineTo(sx + Math.cos(ang) * r * 1.2, sy + Math.sin(ang) * r * 1.2);
			} else {
				ctx.moveTo(sx + spikeDir * r * .18, sy - r * .12);
				ctx.lineTo(sx + spikeDir * r * 1.12, sy + r * 1.05);
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
		} else if (spiking && scoreSeq.spikeStyle === "punt") {
			ctx.moveTo(sx + r * .3, sy - r * .1);
			ctx.lineTo(sx + r * .55, sy + r * 1.05);
		} else if (spiking && scoreSeq.spikeStyle === "throw") {
			ctx.moveTo(sx + r * .25, sy - r * .25);
			ctx.lineTo(sx + r * .85, sy - r * 1.05);
		} else if (celebrating) {
			ctx.moveTo(sx + r * .35, sy - r * .2);
			ctx.lineTo(sx + r * 1.2, sy - r * .72);
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
		ctx.strokeStyle = "#c5c8cc";
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
		ctx.font = "bold " + Math.max(8, r * .8 * pose.ns) + "px IBM Plex Sans, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(String(p.number), 0, 0);
		ctx.restore();
		if (p.hasBall || isBallCarrier) {
			if (forceSpike && !scoreSeq.ballOut) {
				if (st < .28) drawFootball(sx + spikeDir * r * .9, sy - r * .4, r * 1.08, -.5);
				else {
					const ang = -Math.PI * .15 + spikeDir * ((st - .28) / .34) * Math.PI * 2.15;
					drawFootball(sx + Math.cos(ang) * r * 1.22, sy + Math.sin(ang) * r * 1.22, r * 1.08, ang);
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
		return stripe ? "#1a4a2c" : "#143d24";
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
			ctx.fillStyle = i % 2 === 0 ? uni.jersey : uni.helmet;
			ctx.globalAlpha = .62;
			ctx.fill();
			ctx.globalAlpha = .85;
			ctx.strokeStyle = "rgba(255,255,255,0.5)";
			ctx.lineWidth = 1.3;
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
	function fillEzBackground(yGoal, yBack) {
		const lo = Math.min(yGoal, yBack), hi = Math.max(yGoal, yBack);
		if (surface === "grass") {
			const a = project(fieldLeft(), yGoal), b = project(fieldRight(), yGoal), c = project(fieldRight(), yBack), d = project(fieldLeft(), yBack);
			ctx.fillStyle = "#4e7d3e";
			ctx.beginPath();
			ctx.moveTo(a.sx, a.sy);
			ctx.lineTo(b.sx, b.sy);
			ctx.lineTo(c.sx, c.sy);
			ctx.lineTo(d.sx, d.sy);
			ctx.closePath();
			ctx.fill();
			return;
		}
		for (let yd = Math.floor(lo / 5) * 5; yd < hi; yd += 5) {
			const y0 = Math.max(yd, lo), y1 = Math.min(yd + 5, hi);
			const a = project(fieldLeft(), y0), b = project(fieldRight(), y0), c = project(fieldRight(), y1), d = project(fieldLeft(), y1);
			ctx.fillStyle = stripeFill(yd);
			ctx.beginPath();
			ctx.moveTo(a.sx, a.sy);
			ctx.lineTo(b.sx, b.sy);
			ctx.lineTo(c.sx, c.sy);
			ctx.lineTo(d.sx, d.sy);
			ctx.closePath();
			ctx.fill();
		}
	}
	function drawMountainEndzoneWorld(yGoal, yBack, primary, secondary) {
		const uni = getUni(fieldArtSide);
		if (ezArtMode === "off") {
			fillEzBackground(yGoal, yBack);
			drawEzText(yGoal, yBack);
			return;
		}
		if (ezArtMode === "solid") {
			const a = project(fieldLeft(), yGoal), b = project(fieldRight(), yGoal), c = project(fieldRight(), yBack), d = project(fieldLeft(), yBack);
			ctx.fillStyle = uni.jersey || primary;
			ctx.beginPath();
			ctx.moveTo(a.sx, a.sy);
			ctx.lineTo(b.sx, b.sy);
			ctx.lineTo(c.sx, c.sy);
			ctx.lineTo(d.sx, d.sy);
			ctx.closePath();
			ctx.fill();
			drawEzText(yGoal, yBack);
			return;
		}
		if (ezArtMode === "diamonds") {
			fillEzBackground(yGoal, yBack);
			drawDiamondEndzone(yGoal, yBack, uni);
			drawEzText(yGoal, yBack);
			return;
		}
		const fl = fieldLeft(), fr = fieldRight();
		const a = project(fl, yGoal), b = project(fr, yGoal), c = project(fr, yBack), d = project(fl, yBack);
		ctx.fillStyle = primary;
		ctx.beginPath();
		ctx.moveTo(a.sx, a.sy);
		ctx.lineTo(b.sx, b.sy);
		ctx.lineTo(c.sx, c.sy);
		ctx.lineTo(d.sx, d.sy);
		ctx.closePath();
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
		drawEzText(yGoal, yBack);
	}
	function drawEzText(yGoal, yBack) {
		if (ezTextMode === "off") return;
		let label = ezTextMode === "custom" ? String(ezCustomText || "").trim() : "ELEVATION EDGE";
		if (!label) return;
		label = label.slice(0, 22).toUpperCase();
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
		const radX = Math.min(span * .16, FIELD_WIDTH * .22 * SCALE_X);
		const radY = radX * .72;
		ctx.save();
		ctx.translate(midP.sx, midP.sy);
		ctx.rotate(ang + (logoFlip < 0 ? Math.PI : 0));
		ctx.fillStyle = uni.helmet;
		ctx.globalAlpha = .4;
		ctx.beginPath();
		ctx.moveTo(-radX * 1.3, radY * .7);
		ctx.lineTo(-radX * .5, -radY * .55);
		ctx.lineTo(-radX * .05, radY * .15);
		ctx.lineTo(radX * .45, -radY * .75);
		ctx.lineTo(radX * 1.3, radY * .7);
		ctx.closePath();
		ctx.fill();
		ctx.globalAlpha = .75;
		ctx.beginPath();
		ctx.ellipse(0, 0, radX, radY * .85, 0, 0, Math.PI * 2);
		ctx.strokeStyle = uni.jersey;
		ctx.lineWidth = Math.max(2.5, radY * .08);
		ctx.stroke();
		ctx.globalAlpha = .92;
		ctx.fillStyle = uni.jersey;
		ctx.font = "bold " + Math.max(20, radY * .85) + "px Barlow Condensed, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("EE", 0, 0);
		ctx.restore();
		ctx.globalAlpha = 1;
	}
	function playArrowWorld(play, ax, ay) {
		const id = play.id;
		if (id === "counterL") return {
			type: "poly",
			pts: [
				[ax, ay],
				[ax + 2.05, ay],
				[ax - 1.6, ay + 8.2]
			]
		};
		if (id === "counterR") return {
			type: "poly",
			pts: [
				[ax, ay],
				[ax - 2.05, ay],
				[ax + 1.6, ay + 8.2]
			]
		};
		if (id === "blastL") return {
			type: "curve",
			pts: [
				[ax, ay],
				[ax - 3.6, ay + 3.4],
				[ax - 2.1, ay + 9]
			]
		};
		if (id === "blastR") return {
			type: "curve",
			pts: [
				[ax, ay],
				[ax + 3.6, ay + 3.4],
				[ax + 2.1, ay + 9]
			]
		};
		if (id === "sweepL") return {
			type: "curve",
			pts: [
				[ax, ay],
				[ax - 6.6, ay + 1.7],
				[ax - 8.4, ay + 7.3]
			]
		};
		if (id === "sweepR") return {
			type: "curve",
			pts: [
				[ax, ay],
				[ax + 6.6, ay + 1.7],
				[ax + 8.4, ay + 7.3]
			]
		};
		if (id === "diveL") return {
			type: "poly",
			pts: [[ax, ay], [ax - 1.2, ay + 7.2]]
		};
		if (id === "diveR") return {
			type: "poly",
			pts: [[ax, ay], [ax + 1.2, ay + 7.2]]
		};
		return {
			type: "poly",
			pts: [[ax, ay], [ax, ay + 7]]
		};
	}
	function drawWorldPoly(pts, color, width, alpha, arrow) {
		if (!pts || pts.length < 2) return;
		const scr = pts.map((p) => project(p[0], p[1]));
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.lineWidth = width;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.beginPath();
		ctx.moveTo(scr[0].sx, scr[0].sy);
		for (let i = 1; i < scr.length; i++) ctx.lineTo(scr[i].sx, scr[i].sy);
		ctx.stroke();
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
	function drawRouteArrow() {
		if (!currentPlay) return;
		if (playArtMode === "off" || playArtMode === "defense") return;
		const a0 = artAlpha(0), a1 = artAlpha(1);
		if (a0 <= .02 && a1 <= .02) return;
		const ax = playArtAnchor.x;
		const ay = playArtAnchor.y;
		const art = playArrowWorld(currentPlay, ax, ay);
		if (art.type === "curve") drawWorldCurve(art.pts, "#FBBF24", 3.2, a0, a1);
		else drawWorldPoly(art.pts, "#FBBF24", 3.2, Math.max(a0, a1) * .9, true);
	}
	function drawPlayingSurface(sx0, fTop, sx1, fBot) {
		const w = sx1 - sx0;
		const h = fBot - fTop;
		if (surface === "astroturf") {
			ctx.fillStyle = "#00A651";
			ctx.fillRect(sx0, fTop, w, h);
			return;
		}
		if (surface === "grass") {
			for (let yd = 0; yd < 100; yd += 5) {
				const y0 = toScreenY(yd + 5);
				const y1 = toScreenY(yd);
				const stripe = yd / 5 % 2 === 0;
				ctx.fillStyle = stripe ? "#5d8f4a" : "#4e7d3e";
				ctx.fillRect(sx0, Math.min(y0, y1), w, Math.abs(y1 - y0) + .5);
			}
			const pat = getTurfPattern();
			if (pat) {
				ctx.save();
				ctx.globalAlpha = .22;
				fillWorldPattern(pat, sx0, fTop, w, h);
				ctx.restore();
			}
			return;
		}
		for (let yd = 0; yd < 100; yd += 5) {
			const y0 = toScreenY(yd + 5);
			const y1 = toScreenY(yd);
			const stripe = yd / 5 % 2 === 0;
			ctx.fillStyle = stripe ? "#1a4a2c" : "#143d24";
			ctx.fillRect(sx0, Math.min(y0, y1), w, Math.abs(y1 - y0) + .5);
		}
		const pat = getTurfPattern();
		if (pat) {
			ctx.save();
			ctx.globalAlpha = .7;
			fillWorldPattern(pat, sx0, fTop, w, h);
			ctx.restore();
		}
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
		tile.width = 48;
		tile.height = 48;
		const t = tile.getContext("2d");
		if (!t) return null;
		if (surface === "grass") {
			t.fillStyle = "#4e7d3e";
			t.fillRect(0, 0, 48, 48);
			for (let i = 0; i < 70; i++) {
				const x = hash2(i, 3) * 48;
				const y = hash2(i, 9) * 48;
				t.fillStyle = hash2(i, 17) > .5 ? "#6fa85a" : "#3d6a32";
				t.fillRect(x, y, 1.8, 3.4);
			}
		} else {
			t.fillStyle = "#163d24";
			t.fillRect(0, 0, 48, 48);
			t.fillStyle = "#0a0a0a";
			for (let i = 0; i < 90; i++) {
				const x = hash2(i + 40, 5) * 48;
				const y = hash2(i + 40, 11) * 48;
				const r = .6 + hash2(i, 19) * 1.15;
				t.globalAlpha = .55 + hash2(i, 23) * .4;
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
		const hold = 2.05 + clamp(along, 0, 1) * .55;
		const fadeDur = 1.15;
		const t = playAge - hold;
		if (t <= 0) return .88;
		return Math.max(0, .88 * (1 - t / fadeDur));
	}
	function zoneAlpha() {
		if (peekHeld || peekToggle) return .9;
		if (preSnapTimer > 0) return Math.min(1, preSnapTimer / .25) * .95;
		const hold = 4.15;
		const fadeDur = 1.55;
		const t = playAge - hold;
		if (t <= 0) return .9;
		return Math.max(0, .9 * (1 - t / fadeDur));
	}
	function drawAssignmentArrow(x0, y0, x1, y1, color, a0, a1) {
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
		if (a1 > .05) {
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
	function drawPlayArt() {
		const holdPeek = peekHeld || peekToggle;
		const artOn = playArtMode !== "off";
		const wantOff = artOn && (playArtMode === "on" || playArtMode === "offense");
		const wantDef = artOn && (playArtMode === "on" || playArtMode === "defense") || holdPeek;
		const returning = !!(fumbleSeq && (fumbleSeq.phase === "return" || fumbleSeq.defender && fumbleSeq.phase !== "loose") || scoreSeq && scoreSeq.who === "def");
		const showOff = wantOff && !!currentPlay && (preSnapTimer > 0 || playAge < 6.2 || holdPeek);
		const showDef = !returning && wantDef && (holdPeek || revealDefThisPlay || preSnapTimer > .2 || playAge < 6.4);
		if (!showOff && !showDef) return;
		const aOrigin = artAlpha(0);
		const aDest = artAlpha(1);
		if (showOff && currentPlay && (aOrigin > .02 || aDest > .02 || holdPeek)) blockers.forEach((b) => {
			const segs = [];
			if (b.blockMode === "pull" && b.pullVia) {
				segs.push([b.pullVia.x, b.pullVia.y]);
				segs.push([b.pullVia.x2, b.pullVia.y2]);
				if (b.blockTarget) segs.push([b.blockTarget.x, b.blockTarget.y]);
				else segs.push([b.pullVia.x2 + playSideSign() * 2.2, playStartYard + 4.5]);
			} else if (b.blockTarget) {
				const t = b.blockTarget;
				const midY = (b.y + t.y) / 2;
				segs.push([b.x, midY]);
				segs.push([t.x + (b.driveSide || 1) * .4, t.y]);
			} else segs.push([b.x + (b.driveSide || 0) * 1.2, playStartYard + (b.levelY || 3.5)]);
			drawBlockT(b.x, b.y, segs, aOrigin, aDest);
		});
		if (showDef && (aOrigin > .02 || aDest > .02 || holdPeek)) {
			defenders.forEach((d) => {
				const col = d.job === "blitz" ? "#ef4444" : d.job === "contain" ? "#38bdf8" : d.job === "curl" ? "#67e8f9" : d.job === "hook" || d.job === "robber" ? "#c4b5fd" : d.job === "deep" || d.job === "drop" ? "#a78bfa" : d.job === "flat" ? "#7dd3fc" : "#f8fafc";
				const fl = fieldLeft(), fr = fieldRight();
				const tx = clamp(d.jobX != null ? d.jobX : d.x, fl + 2.6, fr - 2.6);
				const ty = d.jobY != null ? d.jobY : d.y + 3;
				if (d.job === "deep" || d.job === "drop" || d.job === "flat" || d.job === "curl" || d.job === "hook" || d.job === "robber") {
					drawZoneCloud(tx, ty, d.zoneRx || 4, d.zoneRy || 2.4, col, zoneAlpha() * .3);
					drawAssignmentArrow(d.x, d.y, tx, ty, col, aOrigin * .9, aDest * .55);
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
		(frame.defenders || []).forEach((d) => {
			const p = map(d.x, d.y);
			ctx.fillStyle = "#e8ece6";
			ctx.beginPath();
			ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
			ctx.fill();
		});
		(frame.blockers || []).forEach((b) => {
			const p = map(b.x, b.y);
			ctx.fillStyle = "#fbbf24";
			ctx.beginPath();
			ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
			ctx.fill();
		});
		if (frame.rb) {
			const p = map(frame.rb.x, frame.rb.y);
			ctx.fillStyle = "#fb4f14";
			ctx.beginPath();
			ctx.arc(p.sx, p.sy, 5.4, 0, Math.PI * 2);
			ctx.fill();
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
		ctx.fillStyle = "#0a0a0a";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
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
		function fillBand(y0, y1, color) {
			const a = project(fl, y0), b = project(fr, y0), c = project(fr, y1), d = project(fl, y1);
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(a.sx, a.sy);
			ctx.lineTo(b.sx, b.sy);
			ctx.lineTo(c.sx, c.sy);
			ctx.lineTo(d.sx, d.sy);
			ctx.closePath();
			ctx.fill();
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
		if (cameraMode === "top") {
			const sx0 = fl * SCALE_X, sx1 = fr * SCALE_X;
			const fieldTop = toScreenY(100);
			const fieldBot = toScreenY(0);
			drawPlayingSurface(sx0, Math.min(fieldTop, fieldBot), sx1, Math.max(fieldTop, fieldBot));
			drawMountainEndzoneWorld(0, -10, uni.endPrimary, uni.endSecondary);
			drawMountainEndzoneWorld(100, 110, uni.endPrimary, uni.endSecondary);
		} else {
			drawMountainEndzoneWorld(0, -10, uni.endPrimary, uni.endSecondary);
			drawMountainEndzoneWorld(100, 110, uni.endPrimary, uni.endSecondary);
			for (let yd = 0; yd < 100; yd += 5) {
				const stripe = yd / 5 % 2 === 0;
				const g = surface === "grass" ? stripe ? "#5d8f4a" : "#4e7d3e" : stripe ? "#1a4a2c" : "#143d24";
				fillBand(yd, yd + 5, g);
			}
		}
		strokeWorld(fl, -10, fr, -10, "rgba(255,255,255,0.45)", 2);
		strokeWorld(fl, 110, fr, 110, "rgba(255,255,255,0.55)", 2);
		for (let yd = 0; yd <= 100; yd += 5) {
			strokeWorld(fl, yd, fr, yd, "rgba(255,255,255,0.28)", 1.2);
			const label = yd === 0 || yd === 100 ? "G" : String(yd > 50 ? 100 - yd : yd);
			const isTen = yd % 10 === 0;
			const numY = yd === 0 || yd === 5 || yd === 95 || yd === 100 ? yd + (yd < 50 ? .4 : yd > 50 ? -.4 : 0) : yd;
			const lp = project(fl + 1.4, numY);
			const rp = project(fr - 1.4, numY);
			ctx.fillStyle = isTen ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.42)";
			ctx.font = (isTen ? "11px" : "9px") + " IBM Plex Sans, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.save();
			ctx.translate(lp.sx, lp.sy);
			ctx.rotate(-Math.PI / 2);
			ctx.fillText(label, 0, 0);
			ctx.restore();
			ctx.save();
			ctx.translate(rp.sx, rp.sy);
			ctx.rotate(Math.PI / 2);
			ctx.fillText(label, 0, 0);
			ctx.restore();
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
			for (const hx of hashXs) strokeWorld(hx, y, hx + (hx === fl ? .7 : hx === fr ? -.7 : .35), y, "rgba(255,255,255,0.4)", 1.2);
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
			const base = project((fl + fr) / 2, 110);
			const leftU = project((fl + fr) / 2 - FIELD_WIDTH * .11, 110);
			const rightU = project((fl + fr) / 2 + FIELD_WIDTH * .11, 110);
			const h = 74 * (base.sc || 1);
			ctx.strokeStyle = "#facc15";
			ctx.lineWidth = 3.2;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(base.sx, base.sy);
			ctx.lineTo(base.sx, base.sy - h * .5);
			ctx.moveTo(leftU.sx, base.sy - h * .5);
			ctx.lineTo(rightU.sx, base.sy - h * .5);
			ctx.moveTo(leftU.sx, base.sy - h * .5);
			ctx.lineTo(leftU.sx, base.sy - h * 1.38);
			ctx.moveTo(rightU.sx, base.sy - h * .5);
			ctx.lineTo(rightU.sx, base.sy - h * 1.38);
			ctx.stroke();
		}
		strokeWorld(fl, playStartYard, fr, playStartYard, "#3b82f6", 2.6);
		strokeWorld(fl, 0, fl, 100, "rgba(255,255,255,0.4)", 2.5);
		strokeWorld(fr, 0, fr, 100, "rgba(255,255,255,0.4)", 2.5);
		strokeWorld(fl, 20, fl, 80, "rgba(255,255,255,0.92)", Math.max(5, SCALE_X * .28));
		strokeWorld(fr, 20, fr, 80, "rgba(255,255,255,0.92)", Math.max(5, SCALE_X * .28));
		drawRouteArrow();
		drawPlayArt();
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
	window.addEventListener("gamepadconnected", onPadConnect);
	window.addEventListener("gamepaddisconnected", onPadDisconnect);
	window.addEventListener("pointerdown", wakePad);
	canvas.addEventListener("pointerdown", onPointerDown);
	canvas.addEventListener("pointermove", onPointerMove);
	canvas.addEventListener("pointerup", onPointerUp);
	canvas.addEventListener("pointercancel", onPointerUp);
	function bindCount(idMinus, idPlus, getter, setter, lo, hi, group) {
		const minus = $(idMinus), plus = $(idPlus);
		if (minus) minus.onclick = () => {
			setter(clamp(getter() - 1, lo, hi));
			if (group) adjustNumbersForGroup(group, group === "QB" ? Math.max(1, getter()) : getter());
			refreshPersonnelUI();
		};
		if (plus) plus.onclick = () => {
			setter(clamp(getter() + 1, lo, hi));
			if (group) adjustNumbersForGroup(group, group === "QB" ? Math.max(1, getter()) : getter());
			refreshPersonnelUI();
		};
	}
	bindCount("olMinus", "olPlus", () => numOL, (v) => { numOL = v; }, 0, 5, "OL");
	bindCount("teMinus", "tePlus", () => numTE, (v) => { numTE = v; }, 0, 3, "TE");
	bindCount("fbMinus", "fbPlus", () => numFB, (v) => { numFB = v; }, 0, 2, "FB");
	bindCount("qbMinus", "qbPlus", () => numQB, (v) => { numQB = v; }, 0, 1, "QB");
	bindCount("dtMinus", "dtPlus", () => numDT, (v) => { numDT = v; }, 0, 4, "DT");
	bindCount("lbMinus", "lbPlus", () => numLBs, (v) => { numLBs = v; }, 0, 5, "LB");
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
	$("minSelect").onchange = (e) => {
		gameSeconds = parseInt(e.target.value, 10) || 180;
	};
	$("offUniform").onchange = (e) => {
		offUni = parseInt(e.target.value, 10);
		if (defUni === offUni) defUni = randChoice(UNIFORMS.filter((u) => u.id !== offUni)).id;
		rebuildUniformSelects();
		syncAbbrFromOffense();
		paintRoster();
	};
	$("defUniform").onchange = (e) => {
		defUni = parseInt(e.target.value, 10);
		paintRoster();
	};
	$("advSlider").oninput = () => {
		pendingAdvantage = parseInt($("advSlider").value, 10);
		const lab = $("advLabel");
		if (lab) lab.textContent = (pendingAdvantage > 0 ? "+" : "") + pendingAdvantage;
		activeAdvantage = pendingAdvantage;
	};
	{
		const adv = $("advSlider");
		if (adv) {
			pendingAdvantage = parseInt(adv.value, 10);
			activeAdvantage = pendingAdvantage;
			const lab = $("advLabel");
			if (lab) lab.textContent = (pendingAdvantage > 0 ? "+" : "") + pendingAdvantage;
		}
	}
	const spdEl = $("speedSlider");
	if (spdEl) {
		playSpeed = parseFloat(spdEl.value) || 1.25;
		const lab = $("speedLabel");
		const syncSpd = () => {
			playSpeed = parseFloat(spdEl.value) || 1.25;
			if (lab) lab.textContent = playSpeed.toFixed(2) + "×";
		};
		syncSpd();
		spdEl.oninput = syncSpd;
	}
	const fumCheck = $("fumblesCheck");
	const fumLab = $("fumblesLabel");
	if (fumCheck) {
		fumblesOn = fumCheck.checked;
		fumCheck.onchange = () => {
			fumblesOn = fumCheck.checked;
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
		if (corner) corner.disabled = cameraMode === "top";
	}
	if (camSel) {
		if (!CAMERAS[camSel.value]) camSel.value = "high";
		cameraMode = CAMERAS[camSel.value] ? camSel.value : "high";
		camSel.onchange = () => {
			cameraMode = CAMERAS[camSel.value] ? camSel.value : "high";
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
		padProfile = profSel.value || "v3";
		profSel.onchange = () => {
			padProfile = profSel.value || "v3";
		};
	}
	const repSel = $("replayModeSelect");
	if (repSel) {
		replayMode = repSel.value || "pip";
		repSel.onchange = () => {
			replayMode = repSel.value || "pip";
		};
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
	$("teamAbbr").addEventListener("input", () => {
		const v = getTeamAbbr();
		const ni = $("nameInput");
		if (ni) ni.value = v;
	});
	rebuildWidthSelect();
	rebuildUniformSelects();
	refreshPersonnelUI();
	refreshAllNumbers();
	if (defUni === offUni) defUni = randChoice(UNIFORMS.filter((u) => u.id !== offUni)).id;
	logoFlip = Math.random() < .5 ? 1 : -1;
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
