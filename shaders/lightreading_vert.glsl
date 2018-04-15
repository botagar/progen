attribute float displacement;
uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHTS ];
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];

void main() 
{
    vUv = uv;
    vNormal = normal;
    vec3 transformed = vec3( position );
    vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );
    for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
        vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * worldPosition;
    }
    // vec3 newPosition = position + normal * vec3(2.0 * sin(displacement + time));
    // vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}