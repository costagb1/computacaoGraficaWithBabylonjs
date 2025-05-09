const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3.Black();

// Câmera
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 100, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Luz central
const light = new BABYLON.PointLight("sunLight", BABYLON.Vector3.Zero(), scene);
light.intensity = 2;

// Sol
const sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 8 }, scene);
const sunMat = new BABYLON.StandardMaterial("sunMat", scene);
sunMat.emissiveTexture = new BABYLON.Texture("img/2k_sun.jpg", scene);
sun.material = sunMat;

const planetas = [
  { nome: "Mercúrio", url: "img/2k_mercury.jpg", raio: 1, dist: 10, velOrbita: 4, velRotacao: 1.5 },
  { nome: "Vênus", url: "img/2k_venus_surface.jpg", raio: 1.2, dist: 15, velOrbita: 3, velRotacao: 0.5 },
  { nome: "Terra", url: "img/2k_earth_daymap.jpg", raio: 1.3, dist: 20, velOrbita: 2, velRotacao: 2 },
  { nome: "Marte", url: "img/2k_mars.jpg", raio: 1.1, dist: 25, velOrbita: 1.5, velRotacao: 2 },
  { nome: "Júpiter", url: "img/2k_jupiter.jpg", raio: 3, dist: 35, velOrbita: 1, velRotacao: 4 },
  { nome: "Saturno", url: "img/2k_saturn.jpg", raio: 2.5, dist: 45, velOrbita: 0.8, velRotacao: 3.5 },
  { nome: "Urano", url: "img/2k_uranus.jpg", raio: 2.2, dist: 55, velOrbita: 0.6, velRotacao: 3 },
  { nome: "Netuno", url: "img/2k_neptune.jpg", raio: 2.1, dist: 65, velOrbita: 0.5, velRotacao: 2.8 }
];

const orbitas = [];
let tempo = 0;
let animando = false;
let velocidade = 1;
let focoAtual = sun;

planetas.forEach(p => {
  const orbita = new BABYLON.TransformNode(p.nome + "_orbita", scene);
  const planeta = BABYLON.MeshBuilder.CreateSphere(p.nome, { diameter: p.raio * 2 }, scene);
  const mat = new BABYLON.StandardMaterial(p.nome + "_mat", scene);
  mat.diffuseTexture = new BABYLON.Texture(p.url, scene);
  planeta.material = mat;
  planeta.parent = orbita;
  planeta.position.x = p.dist;
  orbitas.push({ node: orbita, mesh: planeta, ...p });

  if (p.nome === "Terra") {
    const luaOrbita = new BABYLON.TransformNode("orbitaLua", scene);
    luaOrbita.parent = planeta;
    const lua = BABYLON.MeshBuilder.CreateSphere("Lua", { diameter: 0.4 }, scene);
    const matLua = new BABYLON.StandardMaterial("matLua", scene);
    matLua.diffuseTexture = new BABYLON.Texture("img/2k_moon.jpg", scene);
    lua.material = matLua;
    lua.parent = luaOrbita;
    lua.position.x = 2.5;
    orbitas.push({ node: luaOrbita, mesh: lua, nome: "Lua", velOrbita: 5, velRotacao: 1 });
  }

  if (p.nome === "Saturno") {
    const anel = BABYLON.MeshBuilder.CreateTorus("anelSaturno", {
      diameter: p.raio * 4.2,
      thickness: 0.1,
      tessellation: 100
    }, scene);
    const matAnel = new BABYLON.StandardMaterial("matAnel", scene);
    matAnel.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.6);
    matAnel.alpha = 0.5;
    anel.material = matAnel;
    anel.parent = planeta;
    anel.rotation.x = Math.PI / 2;
  }
});

document.getElementById("toggle").onclick = () => {
  animando = !animando;
  document.getElementById("toggle").innerText = animando ? "Pausar" : "Iniciar";
};

document.getElementById("speed").oninput = (e) => {
  velocidade = parseFloat(e.target.value);
  document.getElementById("speedValue").innerText = velocidade.toFixed(1) + "x";
};

document.getElementById("planetSelect").onchange = (e) => {
  const nome = e.target.value;
  const item = orbitas.find(p => p.nome === nome);
  focoAtual = item ? item.mesh : sun;
};

engine.runRenderLoop(() => {
  const dt = engine.getDeltaTime() / 1000;
  if (animando) tempo += dt * velocidade;

  orbitas.forEach(p => {
    p.node.rotation.y = tempo * p.velOrbita;
    p.mesh.rotation.y = tempo * p.velRotacao;
  });

  camera.setTarget(focoAtual.position);
  scene.render();
});

window.addEventListener("resize", () => engine.resize());