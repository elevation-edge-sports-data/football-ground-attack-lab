# Football Ground Attack Lab

Customizable running-back lab on a single HTML5 canvas. Version 5.

**[Play](https://elevation-edge-sports-data.github.io/football-ground-attack-lab/)**

Under active development.

Not affiliated with, endorsed by, or licensed by any league or team.

## Features

1. Authored **offense playbook** (8): Blast, Pitch, Sweep, Swing, River, Zig Zag, Wedge, Counter
2. Authored **defense playbook** (8): Chaos Contain, Overload Blitz, Safety Strike, Cloud Zone, Grizzly, House Blitz, Squirrel Storm, Spin Cycle
3. Side playbook panel: numbered lists, controller labels, miniature assignment diagrams
4. Pre-snap field diagrams; offense and defense assigned independently
5. **Game** and **Practice** modes (Game is default). Same play-calling tools in both
6. Snap on **A** by default; optional automatic next play
7. After the snap, a short handoff or pitch from QB to runner when a QB is on the field
8. Optional runner path trail; trail in instant replay
9. Save last play (up to 10 clips)
10. Cameras (angled 2D, overhead, high, zoom, wide), PiP or split replay
11. Optional fumbles; celebrate; speed burst in the clear; TD camera zoom
12. Personnel counts for OL, TE, FB, QB, DT, LB, DB
13. Speed, offense, defense, break-block, and break-tackle sliders
14. Variable field width; Natural Grass, Field Turf, or Astro Turf
15. Uniform banner (10 kits). Matching kits are not allowed
16. Game Config: own/opponent start on a 50-yard scale; after a score = Random, Fixed, Increasing, or Decreasing
17. Diamond or mountain endzones, custom endzone text, midfield Elevation Edge logo
18. Goal posts, pylons, ball spotted on the hashes
19. Keyboard and Xbox controls; v1–v4 control profiles (Advanced / v4 default)
20. D-pad is eight extra moves (hurdle, dead-leg, shake, and diagonals)

## Play calling (pre-snap)

Click a playbook preview to focus it, or use the menu keys below.

| Action | Key | Xbox |
|---|---|---|
| Snap | Enter | A |
| Offense menu | C | X |
| Defense menu | F | B |
| Cancel audible | V / Y | Y |
| Flip offense | X | RT |
| Flip defense | Z | LT |
| Browse list | W / S or ↑ ↓ | Left stick |
| Focus offense / defense | ← / → | — |
| Pick play 1–8 | **1–8** | — |
| Audible pick (menu open) | Q E · I J K L · G · P | LB RB · D-pad · Select · Start |

During the play, Z/X or LT/RT steer a latched teammate (v4 profile).

## Runner controls

| Action | Key | Xbox |
|---|---|---|
| Move | WASD / Arrows | Left stick |
| Speed burst | Space | A |
| Spin | F | B |
| Dive | C | X |
| Truck | V / Y | Y (v4 profile) |
| Juke | Q / E | LB / RB |
| Steer teammate | Z / X | LT / RT (live play) |
| Celebrate | G | Select |
| Peek defense | H | Select / peek |
| Replay | R | — |
| Pause | P | Click right stick |

The D-pad is eight extra moves. The same eight are on the keyboard: I J K L are up, left, down, right; hold two keys for a diagonal.

| Move | D-pad | Keys |
|---|---|---|
| Hurdle | Up | I |
| Hurdle left | Up-left | I + J |
| Hurdle right | Up-right | I + L |
| Dead-leg | Down | K |
| Dead-leg left | Down-left | K + J |
| Dead-leg right | Down-right | K + L |
| Shake left | Left | J |
| Shake right | Right | L |

A resumes pause. B restarts from pause.

Microsoft Edge is recommended for an Xbox controller.

## Modes

**Game** — session clock, score, yards, TDs. After a score, the next line of scrimmage follows Game Config (Random / Fixed / Increasing / Decreasing). Playbook and audibles are available.

**Practice** — same playbook tools. Practice Config sets the yard. Every new play starts from that yard (gains and scores do not move the ball).

## Defaults

- Mode: Game
- Next play: on snap (A)
- Start: midfield
- After a score: Random (own 20–opponent 20, 5-yard lines)
- Speed 1.20× · Offense 1.00× · Defense 1.00×
- Break block 1.00× · Break tackle 1.00×
- Fumbles on
- Runner path trail on
- Camera: high angle (facing re-rolls on mode switch)
- Replay: PiP
- Offense and defense start on different kits
- Clock: 2:00
- Field width: 50 yards
- Control profile: Advanced (v4)

## Tech

`index.html` + `game.js` + `styles.css`. Canvas and JavaScript. No dependencies. Works offline.

Built by [Zach Sajevic](https://github.com/elevation-edge-sports-data)  
Elevation Edge Sports Data
