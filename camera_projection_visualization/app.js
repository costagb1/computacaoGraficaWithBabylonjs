const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  // Criação das câmeras
  const cameraPerspective = new BABYLON.ArcRotateCamera("cameraPerspective", Math.PI / 2, Math.PI / 3, 20, BABYLON.Vector3.Zero(), scene);
  const cameraOrtho = new BABYLON.FreeCamera("cameraOrtho", new BABYLON.Vector3(0, 5, 15), scene);
  cameraOrtho.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

  cameraPerspective.attachControl(canvas, true);
  cameraOrtho.attachControl(canvas, true);

  // Defina a câmera ativa inicialmente
  scene.activeCamera = cameraPerspective;

  // Criação de materiais para os objetos
  const materialBox = new BABYLON.StandardMaterial("materialBox", scene);
  materialBox.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.2); // Cor verde

  const materialSphere = new BABYLON.StandardMaterial("materialSphere", scene);
  materialSphere.diffuseColor = new BABYLON.Color3(0.7, 0.2, 0.2); // Cor vermelha

  const materialGround = new BABYLON.StandardMaterial("materialGround", scene);
  materialGround.diffuseColor = new BABYLON.Color3(0, 0, 0); // Cor azul para o chão

  // Criação de objetos para visualização
  const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
  box.position.y = 1;
  box.material = materialBox; // Aplica o material

  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
  sphere.position.x = 5;
  sphere.material = materialSphere; // Aplica o material

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
  ground.material = materialGround; // Aplica o material

  // Iluminação
  const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  light1.intensity = 0.7;

  const light2 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(-1, -1, -1), scene);
  light2.position = new BABYLON.Vector3(5, 10, 5);
  light2.intensity = 0.7;

  // Representação semitransparente do frustum
  const frustumMaterial = new BABYLON.StandardMaterial("frustumMaterial", scene);
  frustumMaterial.alpha = 0.3;
  const frustumMesh = BABYLON.MeshBuilder.CreateBox("frustumMesh", { size: 2 }, scene);
  frustumMesh.material = frustumMaterial;
  frustumMesh.isVisible = false;

  // Adiciona controles para câmera
  const gui = new dat.GUI();
  const cameraFolder = gui.addFolder("Câmera");
  
  cameraFolder.add(scene.activeCamera, "alpha", 0, Math.PI * 2).name("Rotação");
  cameraFolder.add(scene.activeCamera, "beta", 0, Math.PI / 2).name("Inclinação");
  cameraFolder.add(scene.activeCamera, "radius", 5, 50).name("Distância");
  
  const fovControl = cameraFolder.add(scene.activeCamera, "fov", 0.1, 1.6).name("Campo de Visão (FOV)");

  // Alterna entre os tipos de câmeras
  cameraFolder.add({
    switchToPerspective: function () {
      scene.activeCamera.detachControl(canvas);
      scene.activeCamera = cameraPerspective;
      cameraPerspective.attachControl(canvas, true);
    },
    switchToOrthographic: function () {
      scene.activeCamera.detachControl(canvas);
      scene.activeCamera = cameraOrtho;
      cameraOrtho.attachControl(canvas, true);
    }
  }, 'switchToPerspective').name('Perspectiva');
  
  cameraFolder.add({
    switchToOrthographic: function () {
      scene.activeCamera.detachControl(canvas);
      scene.activeCamera = cameraOrtho;
      cameraOrtho.attachControl(canvas, true);
    }
  }, 'switchToOrthographic').name('Ortográfica');

  // Atualiza frustum conforme a câmera
  scene.registerBeforeRender(() => {
    if (scene.activeCamera.mode === BABYLON.Camera.PERSPECTIVE_CAMERA) {
      frustumMesh.isVisible = true;
      frustumMesh.scaling.set(scene.activeCamera.fov * 5, scene.activeCamera.fov * 5, 1);
      frustumMesh.position = scene.activeCamera.position.clone().add(scene.activeCamera.getDirection(BABYLON.Axis.Z));
    } else {
      frustumMesh.isVisible = true;
      frustumMesh.scaling.set(scene.activeCamera.orthoLeft - scene.activeCamera.orthoRight, scene.activeCamera.orthoTop - scene.activeCamera.orthoBottom, 1);
      frustumMesh.position = scene.activeCamera.position.clone().add(scene.activeCamera.getDirection(BABYLON.Axis.Z));
    }
  });

  cameraFolder.open();

  return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
