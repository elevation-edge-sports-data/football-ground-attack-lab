# Football Ground Attack Lab

Customizable running-back drill on a single HTML5 canvas.

**[Play](https://elevation-edge-sports-data.github.io/football-ground-attack-lab/)** 

Under active development.

Not affiliated with, endorsed by, or licensed by any league or team.

## Features

1. Scripted play steps (dive, blast, sweep, counter) with pre-snap arrows
2. Defense keys run after a short read, chases behind the line, sends one or two aggressors while the rest take angles, slip long blocks, and sometimes misfire
3. OL drive defenders downfield, split and hold a lane, pancake (defender down ~2–3 seconds), then take the next assignment
4. Optional fumbles: ball comes out and bounces; dive to fall on it or truck to scoop and keep running; pick-six inside the own 20
5. Offense–Defense tilt (default +0)
6. Keyboard and Xbox controls; D-pad is eight extra moves (hurdle, dead-leg, shake, and diagonals)
7. Celebrate (toggle): the runner high-steps with the ball held out. Other moves still work except truck and hurdle. Fumbles only happen on contact while celebrating, and can turn into a defensive return. Celebrating through the goal line spikes the ball
8. Speed boost in the clear; camera zooms on a touchdown
9. Side-by-side gameplay, formation, team, and config panels
10. 10 teams; five-game set keeps the offense and changes the defense and surface
11. Adjustable number of OL, FB, LB, and DB
12. Adjustable session length
13. Variable field width; Natural Grass, Field Turf, or Astro Turf
14. Ball spotted on the hashes after each play
15. Post-touchdown LOS logic (incremental with customizable start and increment, or randomized with customizable range)
16. Field goal posts and corner pylons
17. Mountain endzone pattern, midfield Elevation Edge logo (colors randomly offense or defense each game)

## Controls

| Action | Key | Xbox |
|---|---|---|
| Move | WASD / Arrows | Left stick |
| Speed burst | Space | A |
| Spin | F | B |
| Dive | C | X |
| Truck | V / Y | Y |
| Juke | Q / E | LB / RB |
| Stiff | Z / X | LT / RT |
| Celebrate | G | View |
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

A confirms the next game and resumes pause. B restarts from pause.

Note: **Microsoft Edge** recommended for Xbox controller)

## Defaults

- Offense / Defense tilt: +0
- Fumbles on
- OL 5 · FB 2 · LB 3 · DB 4
- Field width: 50 yards
- Time: 1:40

## Tech

Single-file HTML + Canvas + JavaScript. No dependencies. Works offline.

Built by [Zach Sajevic](https://github.com/elevation-edge-sports-data)  
Elevation Edge Sports Data