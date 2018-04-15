import 'babel-polyfill'
import fs from 'fs'
import * as THREE from 'three'
import ShadowMapViewer from './helpers/ShadowMapViewer'
import Skybox from './Skybox'
import Floor from './FloorPlane'

class SceneComposer {
  constructor(containerId, fov, viewWidth, viewHeight, aspectRatio, nearPlane, farPlane) {
    containerId = containerId || 'three-viewport'
    fov = fov || 75
    viewWidth = viewWidth || window.innerWidth
    viewHeight = viewHeight || window.innerHeight
    aspectRatio = aspectRatio || (viewWidth / viewHeight)
    nearPlane = nearPlane || 0.1
    farPlane = farPlane || 10000

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    this.renderer.setSize(viewWidth, viewHeight)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // default THREE.PCFShadowMap

    document.getElementById(containerId).appendChild(this.renderer.domElement)
  }

  async setupScene() {
    let sky = await Skybox()
    console.log('Sky incoming!')
    console.log(sky)
    this.scene.add(sky)
    this.scene.add(Floor)

    let hemiLight = new THREE.HemisphereLight(0x0000ff, 0xffffff, 1)
    hemiLight.position.set(0, 50, 0)
    this.scene.add(hemiLight)

    this.angledSun = new THREE.DirectionalLight(0xffff00, 2)
    this.angledSun.position.set(-25, 200, 150)
    this.angledSun.castShadow = true
    this.angledSun.shadow.mapSize.width = 512
    this.angledSun.shadow.mapSize.height = 512
    this.angledSun.shadow.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    this.scene.add(this.angledSun)

    // var helper = new THREE.CameraHelper(this.angledSun.shadow.camera)
    // this.scene.add(helper)

    this.lightingSpike()

    this.camera.position.set(50, 50, 5)
    // this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.camera.lookAt(this.sphere.position)
  }

  lightingSpike() {
    let vertShader = fs.readFileSync(__dirname + '/../shaders/lightreading_vert.glsl', { encoding: 'utf8' })
    let fragShader = fs.readFileSync(__dirname + '/../shaders/lightreading_frag.glsl', { encoding: 'utf8' })

    this.uniforms = THREE.UniformsUtils.merge(
      [THREE.UniformsLib['lights'],
      {
        time: { type: "f", value: 0 }
      }
      ]
    )
    let sphereMaterial =
      new THREE.ShaderMaterial(
        {
          defines: { 'MAX_DIR_LIGHTS': 1 },
          uniforms: this.uniforms,
          vertexShader: vertShader,
          fragmentShader: fragShader,
          lights: true
        })
    let sphereMat = new THREE.MeshLambertMaterial({
      color: 0x00ff00
    })
    let sphereGeometry = new THREE.SphereBufferGeometry(6, 8, 8)
    let sphereVertexDisplacements = new Float32Array(sphereGeometry.attributes.position.count)
    sphereVertexDisplacements.forEach((vert, index, array) => {
      array[index] = Math.random() * 2
    })
    sphereGeometry.addAttribute('displacement', new THREE.BufferAttribute(sphereVertexDisplacements, 1))

    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    this.sphere.position.set(-20, 20, -20)
    this.sphere.castShadow = true
    this.sphere.receiveShadow = true // default
    this.scene.add(this.sphere)

    let squareGeom = new THREE.CubeGeometry(5, 5, 5)
    let squareMat = new THREE.MeshLambertMaterial({
      color: 0xff0000
    })
    this.square = new THREE.Mesh(squareGeom, squareMat)
    this.square.position.set(-20, 30, -11)
    this.square.castShadow = true
    this.square.receiveShadow = true
    this.scene.add(this.square)

    // this.angledSun.position.set(-25, 200, 150)
    let imageWidth = 12, imageHeight = 12
    let vectorToSun = (this.angledSun.position.clone().sub(this.sphere.position)).normalize()
    let positionOnBoundaryTowardsSun = vectorToSun.clone().multiplyScalar(6).add(this.sphere.position) // 6 is radius of sphere

    let renderTargetParams = {
      minFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: false
    };
    let renderTarget = new THREE.WebGLRenderTarget(imageWidth, imageHeight, renderTargetParams);
    let orthoCam = new THREE.OrthographicCamera(imageWidth / - 2,
      imageWidth / 2,
      imageHeight / 2,
      imageHeight / - 2, 0, 6)
    let { x, y, z } = positionOnBoundaryTowardsSun
    orthoCam.position.set(x, y, z) //set(-20, 26, -20)
    orthoCam.lookAt(this.sphere.position)

    var helper = new THREE.CameraHelper(orthoCam)
    this.scene.add(helper)

    this.renderer.render(this.scene, orthoCam, renderTarget, true);

    var pixels = new self.Uint8Array(imageWidth * imageHeight * 4)
    this.renderer.readRenderTargetPixels(renderTarget, 0, 0, imageWidth, imageHeight, pixels)
    console.log(pixels)

    let textureDisplayGeo = new THREE.PlaneGeometry(imageWidth, imageHeight)
    let dbgMat = new THREE.MeshLambertMaterial({
      // wireframe: true,
      color: 0xff0000
    })
    let outTexture = renderTarget.texture;
    let outMaterial = new THREE.MeshLambertMaterial({
      map: outTexture
    })
    console.log(outMaterial.__webglFramebuffer)
    let renderOut = new THREE.Mesh(textureDisplayGeo, outMaterial)
    renderOut.rotateX(-Math.PI / 2)
    renderOut.position.set(0, 1, 15)
    this.scene.add(renderOut)
    this.render()
  }

  addToScene(object) {
    this.scene.add(object)
  }

  render() {
    // this.dirLightShadowMapViewer.render( this.renderer );
    this.uniforms.time.value += (1 / 60) * 5;
    this.renderer.render(this.scene, this.camera)
  }
}

export default SceneComposer
