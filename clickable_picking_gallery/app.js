// Inicialização
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.05);

  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2.5, Math.PI / 3, 30, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  // Materiais padrão
  const defaultMaterial = new BABYLON.StandardMaterial("defaultMat", scene);
  defaultMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);

  const hoverMaterial = new BABYLON.StandardMaterial("hoverMat", scene);
  hoverMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0);

  const selectedMaterial = new BABYLON.StandardMaterial("selectedMat", scene);
  selectedMaterial.diffuseColor = new BABYLON.Color3(0.2, 1, 0.4);

  // Objetos da galeria
  const objects = [];

  for (let i = -2; i <= 2; i++) {
    const frame = BABYLON.MeshBuilder.CreateBox("frame" + i, { width: 2, height: 2.5, depth: 0.2 }, scene);
    frame.position = new BABYLON.Vector3(i * 5, 1.5, 0);
    frame.material = defaultMaterial.clone();
    objects.push(frame);

    const sculpture = BABYLON.MeshBuilder.CreateSphere("sculpture" + i, { diameter: 1.8 }, scene);
    sculpture.position = new BABYLON.Vector3(i * 5, 1.5, 6);
    sculpture.material = defaultMaterial.clone();
    objects.push(sculpture);
  }

  // Painel de informações
  const infoPlane = BABYLON.MeshBuilder.CreatePlane("infoPlane", { width: 6, height: 2 }, scene);
  infoPlane.position = new BABYLON.Vector3(0, 9, 0);
  infoPlane.isVisible = false;

  const infoTexture = new BABYLON.DynamicTexture("infoTexture", { width: 512, height: 256 }, scene);
  infoTexture.hasAlpha = true;

  const infoMaterial = new BABYLON.StandardMaterial("infoMaterial", scene);
  infoMaterial.diffuseTexture = infoTexture;
  infoMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
  infoMaterial.backFaceCulling = false;
  infoPlane.material = infoMaterial;

  const updateInfo = (text) => {
    infoTexture.clear();
    infoTexture.drawText(text, 50, 150, "bold 38px Arial", "white", "transparent");
    infoPlane.isVisible = true;
  };

  // Ícone de informação
  const infoIcon = BABYLON.MeshBuilder.CreatePlane("infoIcon", { width: 1, height: 1 }, scene);
  infoIcon.isVisible = false;
  const iconMaterial = new BABYLON.StandardMaterial("iconMaterial", scene);
  iconMaterial.diffuseTexture = new BABYLON.Texture("https://img.icons8.com/fluency/48/info.png", scene);
  iconMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
  iconMaterial.backFaceCulling = false;
  infoIcon.material = iconMaterial;

  // Picking
  let lastPicked = null;
  let selectedRotationSpeed = 0;

  scene.onPointerObservable.add(pointerInfo => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
      const pickResult = pointerInfo.pickInfo;

      if (pickResult.hit && objects.includes(pickResult.pickedMesh)) {
        if (lastPicked && lastPicked !== pickResult.pickedMesh) {
          lastPicked.material = defaultMaterial.clone();
        }

        lastPicked = pickResult.pickedMesh;
        lastPicked.material = selectedMaterial.clone();
        updateInfo(`Objeto: ${lastPicked.name}`);

        // Mostra o ícone de informação
        infoIcon.position = lastPicked.position.add(new BABYLON.Vector3(0, 2.5, 0));
        infoIcon.isVisible = true;

        selectedRotationSpeed = 0.01; // Começa a girar lentamente
      }
    }
  });

  // Efeito hover
  scene.onPointerMove = function () {
    const result = scene.pick(scene.pointerX, scene.pointerY);
    objects.forEach(obj => {
      if (result.hit && obj === result.pickedMesh) {
        if (obj !== lastPicked) obj.material = hoverMaterial;
      } else {
        if (obj !== lastPicked) obj.material = defaultMaterial.clone();
      }
    });
  };

  // Animação contínua
  scene.registerBeforeRender(() => {
    if (lastPicked) {
      lastPicked.rotation.y += selectedRotationSpeed;
    }

    if (infoIcon.isVisible && lastPicked) {
      infoIcon.lookAt(camera.position); // Ícone sempre de frente pra câmera
    }
  });

  return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
