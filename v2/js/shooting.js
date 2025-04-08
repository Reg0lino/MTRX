// =============================================================================
// js/shooting.js - Gun, Bullet Logic
// Version: 1.47w (Add FireGun Debug Log)
// =============================================================================

// Relies on constants from constants.js (v1.47w)
// Relies on globals from main.js: scene, camera, activeBullets, currentAmmo, canShoot, shootTimer, isReloading, reloadTimer, isPointerLocked, gameOver, gameWon, gunGroup_BJS, bulletMaterial_BJS
// Relies on functions: playSound (audio.js), updateHUD (ui.js), startReload (this file)

console.log("Loading shooting.js (v1.47w)..."); // Version Updated

function createGun_BJS(scene, camera) {
    console.log("BJS [shooting.js]: Creating Gun...");
    if (!scene || !camera) { console.error("Scene or Camera missing for createGun_BJS"); return; }
    if (gunGroup_BJS) { gunGroup_BJS.dispose(false, true); }

    gunGroup_BJS = new BABYLON.TransformNode("gunGroup", scene);
    gunGroup_BJS.parent = camera;
    // Use new scaled constants for position/geometry
    gunGroup_BJS.position = new BABYLON.Vector3(GUN_RIGHT_OFFSET, GUN_DOWN_OFFSET, GUN_FORWARD_OFFSET);

    const gunMaterial = new BABYLON.StandardMaterial("gunMat", scene);
    gunMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#222222");
    gunMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    const barrel = BABYLON.MeshBuilder.CreateCylinder("gunBarrel", { height: GUN_BARREL_LENGTH, diameter: GUN_BARREL_RADIUS * 2, tessellation: 12 }, scene);
    barrel.material = gunMaterial; barrel.rotation.x = Math.PI / 2; barrel.position.z = GUN_BARREL_LENGTH / 2; barrel.parent = gunGroup_BJS;

    const handle = BABYLON.MeshBuilder.CreateBox("gunHandle", { width: GUN_HANDLE_WIDTH, height: GUN_HANDLE_HEIGHT, depth: GUN_HANDLE_DEPTH }, scene);
    handle.material = gunMaterial; handle.position.y = -GUN_HANDLE_HEIGHT / 2 - GUN_BARREL_RADIUS * 0.5; handle.position.z = -GUN_BARREL_LENGTH * 0.2; handle.parent = gunGroup_BJS;
    console.log("BJS [shooting.js]: Gun created.");
}

function fireGun() {
    // *** ADD DEBUG LOG ***
    console.log(`fireGun called: isPointerLocked=${isPointerLocked}, canShoot=${canShoot}, isReloading=${isReloading}, gameOver=${gameOver}, gameWon=${gameWon}, currentAmmo=${currentAmmo}`);

    if (!isPointerLocked || !canShoot || isReloading || gameOver || gameWon) {
        console.log("fireGun: Condition not met, returning.");
        return;
    }
    if (currentAmmo <= 0) {
        console.log("fireGun: Ammo empty, starting reload.");
        startReload(); // Will call updateHUD
        return;
    }

    console.log("fireGun: Firing!"); // Confirm execution
    currentAmmo--; canShoot = false; shootTimer = GUN_FIRE_RATE;
    playSound('shoot');

    // Create bullet material if it doesn't exist
    if (!bulletMaterial_BJS) {
        bulletMaterial_BJS = new BABYLON.StandardMaterial("bulletMat", scene);
        bulletMaterial_BJS.diffuseColor = new BABYLON.Color3(0.2, 1, 0.2); // Bright green bullet
        bulletMaterial_BJS.emissiveColor = new BABYLON.Color3(0.1, 0.6, 0.1); // Glowing green
    }

    // Create bullet mesh
    const bullet = BABYLON.MeshBuilder.CreateSphere("bullet" + Date.now(), { diameter: BULLET_SIZE, segments: 8 }, scene); // Use new small BULLET_SIZE
    bullet.material = bulletMaterial_BJS;
    bullet.checkCollisions = false; // Bullets use raycasting, not ellipsoid collision

    // Calculate start position and velocity
    const cameraForward = camera.getForwardRay().direction;
    // Offset slightly in front of camera to avoid immediate self-collision
    const offset = cameraForward.scale(PLAYER_RADIUS * 1.5); // Offset based on player radius
    bullet.position = camera.globalPosition.add(offset);
    const velocity = cameraForward.scale(BULLET_SPEED); // Use new scaled BULLET_SPEED

    // Store bullet data
    activeBullets.push({ mesh: bullet, velocity: velocity, life: BULLET_LIFESPAN, isAgentBullet: false, damage: 1 }); // Use new BULLET_LIFESPAN

    updateHUD(); // Update ammo display
}

function startReload() {
    if (isReloading || currentAmmo === GUN_CLIP_SIZE || gameOver || gameWon || !isPointerLocked) return;
    console.log("ACTION: Reloading..."); isReloading = true; reloadTimer = GUN_RELOAD_TIME; canShoot = false;
    playSound('reload'); updateHUD();
}

function handleShootingCooldown(delta) {
    if (!canShoot) { shootTimer -= delta; if (shootTimer <= 0) { canShoot = true; } }
}

function handleReloading(delta, time) {
    if (isReloading) { reloadTimer -= delta; if (reloadTimer <= 0) { isReloading = false; currentAmmo = GUN_CLIP_SIZE; canShoot = true; console.log("ACTION: Reload Complete."); updateHUD(); } }
}

function updateBullets_BJS(delta) {
    for (let i = activeBullets.length - 1; i >= 0; i--) {
        const bulletData = activeBullets[i];
        if (!bulletData || !bulletData.mesh) { activeBullets.splice(i, 1); continue; } // Safety check

        const bulletMesh = bulletData.mesh;
        const velocity = bulletData.velocity;
        bulletMesh.position.addInPlace(velocity.scale(delta)); // Move bullet
        bulletData.life -= delta; // Decrease lifespan

        if (bulletData.life <= 0) { // Remove if lifespan ends
            bulletMesh.dispose(); activeBullets.splice(i, 1); continue;
        }

        // --- TODO: Implement Bullet Collision Logic ---
        // Use scene.pickWithRay or Ray class to check for hits against:
        // - Walls (wallTpl thin instances - might need specific handling or use source mesh bounds)
        // - Agents (agent meshes - body, head) -> If hit agent, reduce HP, check death, play sound
        // - Player (if agent bullet) -> Call damagePlayer
        // On hit, remove bullet: bulletMesh.dispose(); activeBullets.splice(i, 1);
    }
}

// end of file