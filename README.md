```ascii
███╗   ███╗████████╗██████╗ ██╗  ██╗
████╗ ████║╚══██╔══╝██╔══██╗╚██╗██╔╝
██╔████╔██║   ██║   ██████╔╝ ╚███╔╝
██║╚██╔╝██║   ██║   ██╔══██╗ ██╔██╗
██║ ╚═╝ ██║   ██║   ██║  ██║██╔╝ ██╗
╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ [ENTER]

---

## BACKDOORS ::_BREACH :: FOLLOW_THE_RABBIT (Babylon.js Port)

RUN ./init_babylon.js
Waking up...
Establishing connection to the Construct...
Rendering environment... v1.43b (BJS)

---

## Overview

Welcome to the grid, operator. This project is a first-person maze shooter inspired by the "back rooms" and "source code" aesthetic of The Matrix. You navigate a procedurally generated maze, eliminate rogue Agent programs, and follow the white rabbit to find the exit.

This version represents a **migration from Three.js to Babylon.js**, aiming for enhanced stability, performance, and built-in features more suited for game development.

The objective remains: Survive the maze, neutralize all Agents using your sidearm, collect mysterious Rabbit pickups for temporary map reveals, and locate the exit that manifests upon clearing the hostile programs.

SYSTEM_MSG: Reality is fragile here. Expect glitches.

---

## Core Features (Ported / In Progress)

*   **Procedural Maze Generation:** Creates a unique maze layout every time using DFS and cross-connections. Features adjustable path width.
*   **Babylon.js Engine:** Utilizing the Babylon.js framework for rendering, collisions, and controls.
*   **First-Person Controls:** Standard FPS controls (WASD/Mouse) powered by Babylon.js `UniversalCamera`. Includes running (Shift).
*   **Visual Style:** Matrix-inspired aesthetic with green/grey tones, bright white floors/ceilings, and digital glitch effects.
*   **Combat System:**
    *   **Player:** 9mm pistol, ammo clip, reloading mechanic.
    *   **Agents:** Basic AI (Patrolling, Attacking via LoS, Melee), HP system, hit feedback.
    *   **Projectiles:** Visual bullets for player and agents.
*   **Pickups:** Collectible "White Rabbit" objects grant temporary map reveals.
*   **HUD:** Displays vital information (HP, Ammo, Agents Remaining) with a Matrix-themed interface.
*   **Game States:** Handles playing, paused, game over, and win conditions.
*   **Sound Design:** Basic sound effects using the Web Audio API.
*   **Debug Features:** Toggleable overlays for map view and potentially collision info.

---

## Access the Construct

> **Follow the White Rabbit:** [**PLAY THE LIVE DEMO HERE**](https://your-deployment-link-will-go-here.netlify.app/maze.html) <br>
> _**(Link to be updated once deployed)**_

---

## Running Locally (Development)

While the goal is the live deployment above, if you wish to run this locally for development:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```
2.  **Serve Locally:** You **cannot** simply open the `maze.html` file directly due to browser security restrictions (`file:///` protocol limitations). You **must** use a local web server.
    *   **Using VS Code & Live Server:** Right-click `maze.html` and choose "Open with Live Server".
    *   **Using Python 3:** Navigate to the project directory in your terminal and run `python -m http.server`. Open `http://localhost:8000/maze.html` in your browser.
    *   **Using Node.js:** Navigate to the project directory and run `npx http-server`. Open the provided `http://localhost:8080` (or similar) address in your browser.
3.  **Access:** Open the localhost address provided by your server in your web browser.

ALERT: Direct file access denied. Initiate local server protocol.

---

## Development Status

*   **Current Stage:** Babylon.js migration in progress.
*   **Focus:** Implementing core Babylon.js scene setup, maze geometry rendering, player controls, and basic collision.
*   **Next Steps:** Porting agent logic, combat systems, pickups, and visual effects to the Babylon.js framework.

---

Connection Terminated. Good luck, operator.
