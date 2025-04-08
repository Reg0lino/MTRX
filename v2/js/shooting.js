// =============================================================================
// js/shooting.js - Gun, Bullet Logic
// Version: 1.47f (Refactored - Stub)
// =============================================================================

// Relies on constants from constants.js
// Relies on globals from main.js: scene, camera, activeBullets, currentAmmo, canShoot, shootTimer, isReloading, reloadTimer
// Relies on functions: playSound (audio.js), updateHUD (ui.js)

function createGun_BJS(scene, camera) { // Accept scene and camera
    // Requires globals: gunGroup_BJS
    console.log("BJS [shooting.js]: Creating Gun...");
    if (gunGroup_BJS) { gunGroup_BJS.dispose(false, true); }
    gunGroup_BJS = new BABYLON.TransformNode("gunGroup", scene);
    gunGroup_BJS.parent = camera;
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
    // Requires globals: isPointerLocked, canShoot, isReloading, gameOver, gameWon, currentAmmo, shootTimer, bulletMaterial_BJS, scene, camera, activeBullets
    // Requires functions: startReload (this file), playSound (audio.js), updateHUD (ui.js)
    if (!isPointerLocked || !canShoot || isReloading || gameOver || gameWon) return;
    if (currentAmmo <= 0) { startReload(); return; }
    currentAmmo--; canShoot = false; shootTimer = GUN_FIRE_RATE;
    playSound('shoot');
    if (!bulletMaterial_BJS) { bulletMaterial_BJS = new BABYLON.StandardMaterial("bulletMat", scene); bulletMaterial_BJS.diffuseColor = new BABYLON.Color3(0.2, 1, 0.2); bulletMaterial_BJS.emissiveColor = new BABYLON.Color3(0.1, 0.6, 0.1); }
    const bullet = BABYLON.MeshBuilder.CreateSphere("bullet" + Date.now(), { diameter: BULLET_SIZE, segments: 8 }, scene);
    bullet.material = bulletMaterial_BJS; bullet.checkCollisions = false;
    const cameraForward = camera.getForwardRay().direction;
    const offset = cameraForward.scale(GUN_FORWARD_OFFSET);
    bullet.position = camera.globalPosition.add(offset);
    const velocity = cameraForward.scale(BULLET_SPEED);
    activeBullets.push({ mesh: bullet, velocity: velocity, life: BULLET_LIFESPAN, isAgentBullet: false, damage: 1 });
    updateHUD();
}

function startReload() {
    // Requires globals: isReloading, currentAmmo, gameOver, gameWon, isPointerLocked, reloadTimer, canShoot
    // Requires constants: GUN_CLIP_SIZE, GUN_RELOAD_TIME
    // Requires functions: playSound (audio.js), updateHUD (ui.js)
    if (isReloading || currentAmmo === GUN_CLIP_SIZE || gameOver || gameWon || !isPointerLocked) return;
    console.log("ACTION: Reloading..."); isReloading = true; reloadTimer = GUN_RELOAD_TIME; canShoot = false;
    playSound('reload'); updateHUD();
}

function handleShootingCooldown(delta) {
    // Requires globals: canShoot, shootTimer
    if (!canShoot) { shootTimer -= delta; if (shootTimer <= 0) { canShoot = true; } }
}

function handleReloading(delta, time) {
    // Requires globals: isReloading, reloadTimer, currentAmmo, canShoot
    // Requires constants: GUN_CLIP_SIZE
    // Requires functions: updateHUD (ui.js)
    if (isReloading) { reloadTimer -= delta; if (reloadTimer <= 0) { isReloading = false; currentAmmo = GUN_CLIP_SIZE; canShoot = true; console.log("ACTION: Reload Complete."); updateHUD(); } }
}

function updateBullets_BJS(delta) {
    // Requires globals: activeBullets
    for (let i = activeBullets.length - 1; i >= 0; i--) {
        const bulletData = activeBullets[i];
        const bulletMesh = bulletData.mesh;
        const velocity = bulletData.velocity;
        bulletMesh.position.addInPlace(velocity.scale(delta));
        bulletData.life -= delta;
        if (bulletData.life <= 0) {
            bulletMesh.dispose(); activeBullets.splice(i, 1); continue;
        }
        // TODO: Bullet Collision Logic
    }
}

/* Three.js Reference omitted */