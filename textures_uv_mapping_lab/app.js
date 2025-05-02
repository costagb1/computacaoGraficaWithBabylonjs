window.onload = function() {
    var canvas = document.getElementById("renderCanvas");

    // Criação do motor de renderização e da cena
    var engine = new BABYLON.Engine(canvas, true);
    var scene = createScene(engine);

    // Inicia o loop de renderização
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Ajusta o tamanho do canvas quando a janela é redimensionada
    window.addEventListener("resize", function () {
        engine.resize();
    });
};

function createScene(engine) {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    
    // Câmera (com zoom dinâmico)
    var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(engine.getRenderingCanvas(), true);

    // Luz hemisférica
    var light = new BABYLON.HemisphericLight("light", BABYLON.Vector3.Up(), scene);

    // Criação de uma esfera para demonstrar as texturas
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
    sphere.position.y = 1;

    // Textura tradicional
    var traditionalTexture = new BABYLON.Texture("textures/yourTexture.jpg", scene);
    var material = new BABYLON.StandardMaterial("sphereMat", scene);
    sphere.material = material;
    material.diffuseTexture = traditionalTexture;

    // Textura procedural
    var proceduralTexture = new BABYLON.NoiseProceduralTexture("procedural", 256, scene);
    var proceduralMaterial = new BABYLON.StandardMaterial("proceduralMat", scene);
    proceduralMaterial.diffuseTexture = proceduralTexture;

    // Normal Map
    var normalMapTexture = new BABYLON.Texture("textures/normalMap.jpg", scene);
    var normalMapMaterial = new BABYLON.StandardMaterial("normalMapMat", scene);
    normalMapMaterial.bumpTexture = normalMapTexture;

    // Bump Map
    var bumpMapTexture = new BABYLON.Texture("textures/bumpMap.jpg", scene);
    var bumpMapMaterial = new BABYLON.StandardMaterial("bumpMapMat", scene);
    bumpMapMaterial.bumpTexture = bumpMapTexture;

    // GUI para seleção de texturas
    var gui = new dat.GUI();
    var textures = { textureType: "traditional" };

    gui.add(textures, "textureType", ["traditional", "procedural", "normalMap", "bumpMap"]).onChange(function(value) {
        switch(value) {
            case "traditional":
                sphere.material = material;
                material.diffuseTexture = traditionalTexture;
                material.bumpTexture = null;
                break;
            case "procedural":
                sphere.material = proceduralMaterial;
                proceduralMaterial.diffuseTexture = proceduralTexture;
                proceduralMaterial.bumpTexture = null;
                break;
            case "normalMap":
                sphere.material = normalMapMaterial;
                normalMapMaterial.diffuseTexture = null;
                normalMapMaterial.bumpTexture = normalMapTexture;
                break;
            case "bumpMap":
                sphere.material = bumpMapMaterial;
                bumpMapMaterial.diffuseTexture = null;
                bumpMapMaterial.bumpTexture = bumpMapTexture;
                break;
        }
    });

    return scene;
}
