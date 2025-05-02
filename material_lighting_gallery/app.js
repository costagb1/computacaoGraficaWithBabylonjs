const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0, 0, 0);
  scene.createDefaultEnvironment({ createSkybox: false });

  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 20, new BABYLON.Vector3(0, 1, 0), scene);
  camera.attachControl(canvas, true);

  // Luz ambiente
  const ambientLight = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene);
  ambientLight.intensity = 0.2;

  // Direcional com sombra
  const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
  dirLight.position = new BABYLON.Vector3(5, 10, 5);
  dirLight.intensity = 0.7;
  dirLight.shadowEnabled = true;

  const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  // Luzes pontuais
  const pointLight1 = new BABYLON.PointLight("point1", new BABYLON.Vector3(-5, 3, -5), scene);
  const pointLight2 = new BABYLON.PointLight("point2", new BABYLON.Vector3(5, 3, 5), scene);
  pointLight1.intensity = 0.5;
  pointLight2.intensity = 0.5;

  // Materiais com propriedades PBR
  const materials = [];

  for (let i = 0; i < 6; i++) {
    const mat = new BABYLON.PBRMaterial("pbr" + i, scene);
    mat.metallic = i / 5;
    mat.roughness = 1 - i / 5;
    materials.push(mat);
  }

  // Criação das esferas com materiais diferentes
  const spheres = [];
  for (let i = 0; i < materials.length; i++) {
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere" + i, { diameter: 2 }, scene);
    sphere.material = materials[i];
    sphere.position.x = (i - 2.5) * 3;
    sphere.position.y = 1;
    sphere.receiveShadows = true;
    shadowGenerator.addShadowCaster(sphere);
    spheres.push(sphere);
  }

  // Plano chão
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 10 }, scene);
  ground.receiveShadows = true;

  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  ground.material = groundMat;

  // GUI para luzes
  const gui = new dat.GUI();
  const lightFolder = gui.addFolder("Luzes");
  lightFolder.add(ambientLight, "intensity", 0, 2).name("Luz Ambiente");
  lightFolder.add(dirLight, "intensity", 0, 2).name("Luz Direcional");
  lightFolder.add(pointLight1, "intensity", 0, 2).name("Ponto 1");
  lightFolder.add(pointLight2, "intensity", 0, 2).name("Ponto 2");

  const pointColor = { color: "#ffffff" };
  lightFolder.addColor(pointColor, "color").name("Cor Pontos").onChange((value) => {
    const col = BABYLON.Color3.FromHexString(value);
    pointLight1.diffuse = col;
    pointLight2.diffuse = col;
  });

  // Abrir automaticamente a pasta "Luzes"
  lightFolder.open();

  return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
