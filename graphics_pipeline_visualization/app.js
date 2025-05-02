const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.05);

  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 8, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  // Carregar shaders personalizados
  BABYLON.Effect.ShadersStore["customVertexShader"] = await (await fetch("shader.vertex.fx")).text();
  BABYLON.Effect.ShadersStore["customFragmentShader"] = await (await fetch("shader.fragment.fx")).text();

  const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
    vertex: "custom",
    fragment: "custom",
  }, {
    attributes: ["position", "normal"],
    uniforms: ["worldViewProjection", "world", "lightDirection", "mode"]
  });

  shaderMaterial.setVector3("lightDirection", new BABYLON.Vector3(-1, -2, -1).normalize());
  shaderMaterial.setFloat("mode", 1); // 1 = iluminação

  // Mesh
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
  sphere.material = shaderMaterial;

  // GUI
  const gui = new dat.GUI();
  const options = { visualizacao: "Iluminação" };
  const modes = { "Posição Transformada": 0, "Iluminação": 1, "Wireframe": 2 };

  gui.add(options, "visualizacao", Object.keys(modes)).name("Visualização").onChange((value) => {
    shaderMaterial.setFloat("mode", modes[value]);
    sphere.material.wireframe = (modes[value] === 2);
  });
  gui.open();

  return scene;
};

createScene().then(scene => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());
