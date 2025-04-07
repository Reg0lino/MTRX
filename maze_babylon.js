// maze_babylon.js - MINIMAL TEST
console.log("Minimal Babylon JS Test Script Loaded.");

// Get the canvas element
const canvas = document.getElementById("mazeCanvas");
if (!canvas) {
    console.error("CRITICAL: Canvas element 'mazeCanvas' not found!");
} else {
    console.log("Canvas element found.");

    // Create the Babylon.js engine
    let engine = null;
    try {
        engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        console.log("Babylon engine created.");
    } catch (e) {
        console.error("Error creating Babylon engine:", e);
    }

    if (!engine) {
        console.error("Engine creation failed.");
    } else {
        // Create a basic scene
        const createScene = function () {
            const scene = new BABYLON.Scene(engine);
            scene.clearColor = new BABYLON.Color3(0.1, 0.0, 0.1); // Dark purple background

            // Create a basic camera
            const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);

            // Create a basic light
            const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 0.7;

            // Create a ground plane
            const ground = BABYLON.MeshBuilder.CreateGround("ground1", {width: 6, height: 6, subdivisions: 2}, scene);

             // Create a simple box
             const box = BABYLON.MeshBuilder.CreateBox("box1", { size: 1 }, scene);
             box.position.y = 0.5;

            console.log("Basic scene created.");
            return scene;
        };

        // Create the scene
        const scene = createScene();

        // Register a render loop to repeatedly render the scene
        if (scene) {
            try {
                engine.runRenderLoop(function () {
                    if (scene.activeCamera) { // Ensure camera exists before rendering
                        scene.render();
                    } else {
                        // console.warn("Render loop: No active camera found.");
                    }
                });
                console.log("Render loop started.");
            } catch (e) {
                console.error("Error starting render loop:", e);
            }


            // Watch for browser/canvas resize events
            window.addEventListener("resize", function () {
                if (engine) {
                    engine.resize();
                    console.log("Engine resized on window resize.");
                }
            });
        } else {
            console.error("Scene creation failed, cannot start render loop.");
        }
    }
}

console.log("End of Minimal Babylon JS Test Script.");