const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0, 0, 0);

  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

  const axes = new BABYLON.AxesViewer(scene, 2);

  // Objetos
  const cube = BABYLON.MeshBuilder.CreateBox("CuboPai", { size: 1.5 }, scene);
  cube.material = new BABYLON.StandardMaterial("mat", scene);
  cube.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
  cube.position = new BABYLON.Vector3(0, 0, 0);

  const sphere = BABYLON.MeshBuilder.CreateSphere("EsferaFilha", { diameter: 1 }, scene);
  sphere.material = new BABYLON.StandardMaterial("mat2", scene);
  sphere.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
  sphere.position = new BABYLON.Vector3(2, 0, 0);
  sphere.parent = cube;

  const cylinder = BABYLON.MeshBuilder.CreateCylinder("CilindroFilho", { height: 1, diameter: 0.5 }, scene);
  cylinder.material = new BABYLON.StandardMaterial("mat3", scene);
  cylinder.material.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
  cylinder.position = new BABYLON.Vector3(-2, 0, 0);
  cylinder.parent = cube;

  // GUI com dat.GUI
  const gui = new dat.GUI();
  const transform = {
    objetoSelecionado: "CuboPai",
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
  };

  let selectedMesh = cube;

  function updateControls() {
    transform.positionX = selectedMesh.position.x;
    transform.positionY = selectedMesh.position.y;
    transform.positionZ = selectedMesh.position.z;
    transform.rotationX = selectedMesh.rotation.x;
    transform.rotationY = selectedMesh.rotation.y;
    transform.rotationZ = selectedMesh.rotation.z;
    transform.scaleX = selectedMesh.scaling.x;
    transform.scaleY = selectedMesh.scaling.y;
    transform.scaleZ = selectedMesh.scaling.z;
    gui.updateDisplay();
  }

  function applyTransformations() {
    selectedMesh.position.set(transform.positionX, transform.positionY, transform.positionZ);
    selectedMesh.rotation.set(transform.rotationX, transform.rotationY, transform.rotationZ);
    selectedMesh.scaling.set(transform.scaleX, transform.scaleY, transform.scaleZ);
  }

  gui.add(transform, 'objetoSelecionado', ['CuboPai', 'EsferaFilha', 'CilindroFilho']).onChange(name => {
    selectedMesh = scene.getMeshByName(name);
    updateControls();
  });

  gui.add(transform, 'positionX', -10, 10).onChange(applyTransformations);
  gui.add(transform, 'positionY', -10, 10).onChange(applyTransformations);
  gui.add(transform, 'positionZ', -10, 10).onChange(applyTransformations);
  gui.add(transform, 'rotationX', 0, Math.PI * 2).onChange(applyTransformations);
  gui.add(transform, 'rotationY', 0, Math.PI * 2).onChange(applyTransformations);
  gui.add(transform, 'rotationZ', 0, Math.PI * 2).onChange(applyTransformations);
  gui.add(transform, 'scaleX', 0.1, 3).onChange(applyTransformations);
  gui.add(transform, 'scaleY', 0.1, 3).onChange(applyTransformations);
  gui.add(transform, 'scaleZ', 0.1, 3).onChange(applyTransformations);

  return scene;
};

const scene = createScene();
engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
