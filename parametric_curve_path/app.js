const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 40, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // Pontos de controle
    const controlPoints = [
        new BABYLON.Vector3(-10, 0, -10),
        new BABYLON.Vector3(-5, 5, 5),
        new BABYLON.Vector3(5, -5, 5),
        new BABYLON.Vector3(10, 0, -10),
        new BABYLON.Vector3(0, 5, -15)
    ];

    const controlSpheres = controlPoints.map((p, idx) => {
        const sphere = BABYLON.MeshBuilder.CreateSphere("controlSphere" + idx, { diameter: 0.6 }, scene);
        sphere.position.copyFrom(p);
        sphere.material = new BABYLON.StandardMaterial("mat" + idx, scene);
        sphere.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
        sphere.isPickable = true;
        return sphere;
    });

    let curveMesh;
    let frameTangents = [];
    let frameNormals = [];

    let curvePoints = [];

    // Criar ou atualizar a curva
    const createCurve = (type = "CatmullRom") => {
        if (curveMesh) curveMesh.dispose();
        frameTangents.forEach(l => l.dispose());
        frameNormals.forEach(l => l.dispose());
        frameTangents = [];
        frameNormals = [];

        const points = controlSpheres.map(s => s.position.clone());

        if (type === "Bezier") {
            curvePoints = BABYLON.Curve3.CreateBezier(points, 100).getPoints();
        } else {
            curvePoints = BABYLON.Curve3.CreateCatmullRomSpline(points, 100, false).getPoints();
        }

        curveMesh = BABYLON.MeshBuilder.CreateLines("curve", { points: curvePoints }, scene);
        curveMesh.color = new BABYLON.Color3(0, 1, 1);
    };

    let curveType = "CatmullRom";
    createCurve(curveType);

    // Objeto que anda na trilha
    let movingMesh;
    const createMovingMesh = (type = "Sphere") => {
        if (movingMesh) movingMesh.dispose();

        if (type === "Sphere") {
            movingMesh = BABYLON.MeshBuilder.CreateSphere("movingSphere", { diameter: 1 }, scene);
        } else if (type === "Box") {
            movingMesh = BABYLON.MeshBuilder.CreateBox("movingBox", { size: 1.2 }, scene);
        }

        movingMesh.material = new BABYLON.StandardMaterial("moveMat", scene);
        movingMesh.material.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
    };

    createMovingMesh("Sphere");

    let t = 0;
    let speed = 0.002;
    let isMoving = true;

    // Atualiza posição do objeto
    const updateMotion = () => {
        if (curvePoints.length === 0) return;

        const idx = Math.floor(t * (curvePoints.length - 1));
        const nextIdx = (idx + 1) % curvePoints.length;

        const currentPos = curvePoints[idx];
        const nextPos = curvePoints[nextIdx];

        movingMesh.position.copyFrom(currentPos);

        const tangent = nextPos.subtract(currentPos).normalize();
        movingMesh.forward = tangent;

        // Tangente (vermelho)
        frameTangents.forEach(l => l.dispose());
        frameTangents = [];
        const tangentLine = BABYLON.MeshBuilder.CreateLines("tangentLine", {
            points: [currentPos, currentPos.add(tangent.scale(3))]
        }, scene);
        tangentLine.color = new BABYLON.Color3(1, 0, 0);
        frameTangents.push(tangentLine);

        // Normal (azul)
        frameNormals.forEach(l => l.dispose());
        frameNormals = [];
        const normal = BABYLON.Vector3.Cross(tangent, BABYLON.Vector3.Up()).normalize();
        const normalLine = BABYLON.MeshBuilder.CreateLines("normalLine", {
            points: [currentPos, currentPos.add(normal.scale(3))]
        }, scene);
        normalLine.color = new BABYLON.Color3(0, 0, 1);
        frameNormals.push(normalLine);
    };

    scene.registerBeforeRender(() => {
        if (isMoving) {
            t += speed;
            if (t >= 1) t = 0;
        }
        updateMotion();
    });

    // GUI
    const gui = new dat.GUI();
    const controls = {
        "Iniciar/Parar": () => { isMoving = !isMoving; },
        "Velocidade": 1,
        "Objeto": "Sphere",
        "Curva": "CatmullRom",
        "Atualizar Curva": () => {
            curveType = controls.Curva;
            createCurve(curveType);
            createMovingMesh(controls.Objeto);
        }
    };

    gui.add(controls, "Iniciar/Parar").name("▶️ Iniciar/Parar");
    gui.add(controls, "Velocidade", 0.1, 5).step(0.1).onChange(v => { speed = 0.002 * v; });
    gui.add(controls, "Objeto", ["Sphere", "Box"]).name("Forma do Objeto");
    gui.add(controls, "Curva", ["CatmullRom", "Bezier"]).name("Tipo de Curva");
    gui.add(controls, "Atualizar Curva").name("🔄 Atualizar Curva");
    gui.open();

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
