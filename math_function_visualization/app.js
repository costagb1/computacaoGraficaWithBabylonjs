const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.05);

const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 25, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
light.intensity = 1.2;

const meshResolution = 100;
let planeMesh;

const params = {
  func: "sin(x) * cos(y)",
  amplitude: 2,
  frequency: 1,
  material: "Standard",
  useHeightColor: true,
  solidColor: [255, 255, 255]
};

function mathFunc(x, y) {
  const a = params.amplitude;
  const f = params.frequency;
  switch (params.func) {
    case "sin(x) * cos(y)": return a * Math.sin(f * x) * Math.cos(f * y);
    case "sin(x^2 + y^2)":  return a * Math.sin(f * (x * x + y * y));
    case "x * y":           return a * x * y;
    case "cos(x) + cos(y)": return a * (Math.cos(f * x) + Math.cos(f * y));
    case "exp(-x^2 - y^2)": return a * Math.exp(-f * (x * x + y * y));
    default: return 0;
  }
}

function createMaterial() {
  const [r, g, b] = params.solidColor.map(v => v / 255);
  let mat;

  switch (params.material) {
    case "Phong":
      mat = new BABYLON.StandardMaterial("phong", scene);
      mat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
      mat.diffuseColor = new BABYLON.Color3(r, g, b);
      break;
    case "PBR":
      mat = new BABYLON.PBRMaterial("pbr", scene);
      mat.albedoColor = new BABYLON.Color3(r, g, b);
      mat.metallic = 0.3;
      mat.roughness = 0.7;
      break;
    default: // Standard
      mat = new BABYLON.StandardMaterial("standard", scene);
      mat.diffuseColor = new BABYLON.Color3(r, g, b);
      break;
  }

  mat.backFaceCulling = false;
  mat.useVertexColor = params.useHeightColor;
  return mat;
}

function createSurface() {
  if (planeMesh) planeMesh.dispose();

  const positions = [];
  const indices = [];
  const colors = [];

  const size = 10;
  const step = size / meshResolution;
  const heights = [];

  // Geração dos vértices e cores
  for (let i = 0; i <= meshResolution; i++) {
    for (let j = 0; j <= meshResolution; j++) {
      const x = -size / 2 + j * step;
      const y = -size / 2 + i * step;
      const z = mathFunc(x, y);
      positions.push(x, z, y);
      heights.push(z);
    }
  }

  const maxZ = Math.max(...heights);
  const minZ = Math.min(...heights);

  for (let i = 0; i < heights.length; i++) {
    const normZ = (heights[i] - minZ) / (maxZ - minZ || 1);
    const r = 1 - normZ;
    const g = normZ;
    const b = 0.6;
    colors.push(r, g, b, 1);
  }

  for (let i = 0; i < meshResolution; i++) {
    for (let j = 0; j < meshResolution; j++) {
      const i0 = i * (meshResolution + 1) + j;
      const i1 = i0 + 1;
      const i2 = i0 + meshResolution + 1;
      const i3 = i2 + 1;
      indices.push(i0, i1, i2, i1, i3, i2);
    }
  }

  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.colors = colors;

  const customMesh = new BABYLON.Mesh("surface", scene);
  vertexData.applyToMesh(customMesh);

  const mat = createMaterial();
  customMesh.material = mat;

  planeMesh = customMesh;
}

createSurface();

// GUI
const gui = new dat.GUI();
const folderFunc = gui.addFolder("Função");
folderFunc.open();
folderFunc.add(params, "func", [
  "sin(x) * cos(y)",
  "sin(x^2 + y^2)",
  "x * y",
  "cos(x) + cos(y)",
  "exp(-x^2 - y^2)"
]).name("Tipo").onChange(createSurface);

folderFunc.add(params, "amplitude", 0.1, 5, 0.1).name("Amplitude").onChange(createSurface);
folderFunc.add(params, "frequency", 0.1, 5, 0.1).name("Frequência").onChange(createSurface);

const folderVis = gui.addFolder("Visual");
folderVis.open();
folderVis.add(params, "material", ["Standard", "Phong", "PBR"]).name("Material").onChange(createSurface);
folderVis.add(params, "useHeightColor").name("Cor por Altura").onChange(createSurface);
folderVis.addColor(params, "solidColor").name("Cor Sólida").onChange(createSurface);

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());


// EXPORTAR .GLB
function exportGLB() {
    if (!planeMesh) return;
    BABYLON.GLTF2Export.GLBAsync(scene, "surface").then((glb) => {
      glb.downloadFiles();
    });
  }
  
  // SCREENSHOT
  function takeScreenshot() {
    BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, { width: 1920, height: 1080 }, (data) => {
      const blob = dataURItoBlob(data);
      saveAs(blob, "screenshot.png");
    });
  }
  
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const buffer = new ArrayBuffer(byteString.length);
    const dataArray = new Uint8Array(buffer);
    for (let i = 0; i < byteString.length; i++) {
      dataArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([buffer], { type: mimeString });
  }
  
  // Botões extras na GUI
  const folderExport = gui.addFolder("Exportar / Captura");
  folderExport.open();
  folderExport.add({ exportGLB }, "exportGLB").name("Exportar .GLB");
  folderExport.add({ takeScreenshot }, "takeScreenshot").name("Salvar Imagem");
  
  // ROTAÇÃO AUTOMÁTICA DA CÂMERA
  scene.registerBeforeRender(() => {
    camera.alpha += 0.002;
  });
  
