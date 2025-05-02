precision highp float;

uniform vec3 lightDirection;
uniform float mode;

varying vec3 vPositionW;
varying vec3 vNormalW;

void main() {
    if (mode == 0.0) {
        // Mostrar posição transformada como cor
        gl_FragColor = vec4(abs(normalize(vPositionW)), 1.0);
    }
    else if (mode == 1.0) {
        // Iluminação simples: Lambert (dot product)
        float lightIntensity = max(dot(normalize(vNormalW), normalize(-lightDirection)), 0.0);
        vec3 color = vec3(0.2, 0.6, 1.0) * lightIntensity;
        gl_FragColor = vec4(color, 1.0);
    }
    else {
        // Wireframe (render em branco)
        gl_FragColor = vec4(1.0);
    }
}
