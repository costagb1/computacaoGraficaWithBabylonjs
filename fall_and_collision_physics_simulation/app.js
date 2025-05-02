const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

// Câmera
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 40, new BABYLON.Vector3(0, 5, 0), scene);
camera.attachControl(canvas, true);

// Luz
const light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
light.position = new BABYLON.Vector3(10, 20, 10);
light.intensity = 1.2;

// Sombra
const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
shadowGenerator.useExponentialShadowMap = true;

// Chão reflexivo
const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
const groundMat = new BABYLON.PBRMetallicRoughnessMaterial("groundMat", scene);
groundMat.baseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
groundMat.metallic = 0.3;
groundMat.roughness = 0.7;
ground.material = groundMat;
ground.receiveShadows = true;

// Parâmetros
let gravidade = -9.8;
let amortecimento = 0.7;
const esferas = [];

// Esfera
class Esfera {
  constructor() {
    this.raio = 1;
    this.mesh = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: this.raio * 2 }, scene);
    this.mesh.position = new BABYLON.Vector3(
      (Math.random() - 0.5) * 20,
      15 + Math.random() * 5,
      (Math.random() - 0.5) * 20
    );
    const mat = new BABYLON.PBRMetallicRoughnessMaterial("mat", scene);
    mat.baseColor = BABYLON.Color3.Random();
    mat.metallic = 0.5;
    mat.roughness = 0.3;
    this.mesh.material = mat;
    this.vel = new BABYLON.Vector3(0, 0, 0);
    shadowGenerator.addShadowCaster(this.mesh);
  }

  atualizar(dt) {
    this.vel.y += gravidade * dt;
    this.mesh.position.addInPlace(this.vel.scale(dt));

    // Colisão com o chão
    if (this.mesh.position.y - this.raio < 0) {
      this.mesh.position.y = this.raio;
      this.vel.y *= -amortecimento;
      this.vel.x *= 0.98;
      this.vel.z *= 0.98;
    }
  }
}

// Colisão entre esferas
function verificarColisoes() {
  for (let i = 0; i < esferas.length; i++) {
    for (let j = i + 1; j < esferas.length; j++) {
      const e1 = esferas[i], e2 = esferas[j];
      const dir = e1.mesh.position.subtract(e2.mesh.position);
      const dist = dir.length();
      const minDist = e1.raio + e2.raio;

      if (dist < minDist) {
        const normal = dir.normalize();
        const overlap = minDist - dist;

        // Separar esferas
        e1.mesh.position.addInPlace(normal.scale(overlap / 2));
        e2.mesh.position.subtractInPlace(normal.scale(overlap / 2));

        // Velocidade relativa
        const relVel = e1.vel.subtract(e2.vel);
        const velAlongNormal = BABYLON.Vector3.Dot(relVel, normal);

        if (velAlongNormal < 0) {
          const impulso = (1 + amortecimento) * velAlongNormal / 2;
          const impulsoVec = normal.scale(impulso);

          e1.vel = e1.vel.subtract(impulsoVec);
          e2.vel = e2.vel.add(impulsoVec);
        }
      }
    }
  }
}

// Adicionar esfera
function adicionarEsfera() {
  const e = new Esfera();
  esferas.push(e);
}

// Gravidade
document.getElementById("gravidadeSlider").addEventListener("input", (e) => {
  const valor = parseFloat(e.target.value);
  gravidade = -valor;
  document.getElementById("gravidadeValor").innerText = valor.toFixed(1);
});

// Loop
engine.runRenderLoop(() => {
  const dt = engine.getDeltaTime() / 1000;
  esferas.forEach(e => e.atualizar(dt));
  verificarColisoes();
  scene.render();
});

// Resize
window.addEventListener("resize", () => engine.resize());
