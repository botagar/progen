import * as THREE from 'three'




export default function (light, injcamera) {
  let UnpackDepthRGBAShader = {
    uniforms: {
      "tDiffuse": { value: null },
      "opacity": { value: 1.0 }
    },
    vertexShader: [
      "varying vec2 vUv;",
      "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform float opacity;",
      "uniform sampler2D tDiffuse;",
      "varying vec2 vUv;",
      `vec3 packNormalToRGB( const in vec3 normal ) {
        return normalize( normal ) * 0.5 + 0.5;
      }
      
      vec3 unpackRGBToNormal( const in vec3 rgb ) {
        return 2.0 * rgb.xyz - 1.0;
      }
      
      const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)
      const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)
      
      const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );
      const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
      
      const float ShiftRight8 = 1. / 256.;
      
      vec4 packDepthToRGBA( const in float v ) {
        vec4 r = vec4( fract( v * PackFactors ), v );
        r.yzw -= r.xyz * ShiftRight8; // tidy overflow
        return r * PackUpscale;
      }
      
      float unpackRGBAToDepth( const in vec4 v ) {
        return dot( v, UnpackFactors );
      }
      
      // NOTE: viewZ/eyeZ is < 0 when in front of the camera per OpenGL conventions
      
      float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
        return ( viewZ + near ) / ( near - far );
      }
      float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
        return linearClipZ * ( near - far ) - near;
      }
      
      float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
        return (( near + viewZ ) * far ) / (( far - near ) * viewZ );
      }
      float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
        return ( near * far ) / ( ( far - near ) * invClipZ - far );
      }
      `,
      "void main() {",
      "float depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );",
      "gl_FragColor = vec4( vec3( depth ), opacity );",
      "}"
    ].join("\n")
  };
  //- Internals
  var scope = this;
  var doRenderLabel = (light.name !== undefined && light.name !== '');
  var userAutoClearSetting;

  //Holds the initial position and dimension of the HUD
  var frame = {
    x: 10,
    y: 10,
    width: 256,
    height: 256
  };

  var camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 10);
  camera.position.set(0, 0, 2);
  camera = injcamera || camera
  var scene = new THREE.Scene();

  //HUD for shadow map
  var shader = UnpackDepthRGBAShader;

  var uniforms = new THREE.UniformsUtils.clone(shader.uniforms);
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    wireframe: true
  });
  var plane = new THREE.PlaneBufferGeometry(frame.width, frame.height);
  var mesh = new THREE.Mesh(plane, material);

  scene.add(mesh);


  //Label for light's name
  var labelCanvas, labelMesh;

  if (doRenderLabel) {

    labelCanvas = document.createElement('canvas');

    var context = labelCanvas.getContext('2d');
    context.font = 'Bold 20px Arial';

    var labelWidth = context.measureText(light.name).width;
    labelCanvas.width = labelWidth;
    labelCanvas.height = 25;	//25 to account for g, p, etc.

    context.font = 'Bold 20px Arial';
    context.fillStyle = 'rgba( 255, 0, 0, 1 )';
    context.fillText(light.name, 0, 20);

    var labelTexture = new THREE.Texture(labelCanvas);
    labelTexture.magFilter = THREE.LinearFilter;
    labelTexture.minFilter = THREE.LinearFilter;
    labelTexture.needsUpdate = true;

    var labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, side: THREE.DoubleSide });
    labelMaterial.transparent = true;

    var labelPlane = new THREE.PlaneBufferGeometry(labelCanvas.width, labelCanvas.height);
    labelMesh = new THREE.Mesh(labelPlane, labelMaterial);

    scene.add(labelMesh);

  }


  function resetPosition() {

    scope.position.set(scope.position.x, scope.position.y);

  }

  //- API
  // Set to false to disable displaying this shadow map
  this.enabled = true;

  // Set the size of the displayed shadow map on the HUD
  this.size = {
    width: frame.width,
    height: frame.height,
    set: function (width, height) {

      this.width = width;
      this.height = height;

      mesh.scale.set(this.width / frame.width, this.height / frame.height, 1);

      //Reset the position as it is off when we scale stuff
      resetPosition();

    }
  };

  // Set the position of the displayed shadow map on the HUD
  this.position = {
    x: frame.x,
    y: frame.y,
    set: function (x, y) {

      this.x = x;
      this.y = y;

      var width = scope.size.width;
      var height = scope.size.height;

      mesh.position.set(- window.innerWidth / 2 + width / 2 + this.x, window.innerHeight / 2 - height / 2 - this.y, 0);

      if (doRenderLabel) labelMesh.position.set(mesh.position.x, mesh.position.y - scope.size.height / 2 + labelCanvas.height / 2, 0);

    }
  };

  this.render = function (renderer) {

    if (this.enabled) {

      //Because a light's .shadowMap is only initialised after the first render pass
      //we have to make sure the correct map is sent into the shader, otherwise we
      //always end up with the scene's first added shadow casting light's shadowMap
      //in the shader
      //See: https://github.com/mrdoob/three.js/issues/5932
      // uniforms.tDiffuse.value = light.shadow.map.texture;

      userAutoClearSetting = renderer.autoClear;
      renderer.autoClear = false; // To allow render overlay
      renderer.clearDepth();
      renderer.render(scene, camera);
      renderer.autoClear = userAutoClearSetting;	//Restore user's setting

    }

  };

  this.updateForWindowResize = function () {

    if (this.enabled) {

      camera.left = window.innerWidth / - 2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / - 2;
      camera.updateProjectionMatrix();

      this.update();
    }

  };

  this.update = function () {

    this.position.set(this.position.x, this.position.y);
    this.size.set(this.size.width, this.size.height);

  };

  //Force an update to set position/size
  this.update();

};
