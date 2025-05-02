precision highp float;

// Atributos
attribute vec3 position;
attribute vec3 normal;

// Uniforms
uniform mat4 worldViewProjection;
uniform mat4 world;
uniform float mode;

// Variáveis para passar para o fragment
varying vec3 vPositionW;
varying vec3 vNormalW;

void main() {
    vec4 worldPos = world * vec4(position, 1.0);
    vPositionW = worldPos.xyz;
    vNormalW = normalize(mat3(world) * normal);

    gl_Position = worldViewProjection * vec4(position, 1.0);
}
