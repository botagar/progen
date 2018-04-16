import fs from 'fs'
import * as THREE from 'three'
import RNG from 'random-seed'

class Leaf {
  constructor(position) {
    this.name = RNG.create('seed').string(12)
    this.position = position || new THREE.Vector3()
    this.width = 2
    this.length = 4
    this.resolution = 2
  }

  GetModel() {
    this.model = this.GenerateMesh()
    this.lightModel = this.GenerateLightMesh()
    return this.model
  }

  GenerateMesh() {
    let leafGeometry = new THREE.PlaneBufferGeometry(this.width, this.length, this.resolution, this.resolution)
    let leafVisibleMaterial = new THREE.MeshLambertMaterial({
      color: 0x00FF00,
      side: THREE.DoubleSide
    })
    let visibleLeafMesh = new THREE.Mesh(leafGeometry, leafVisibleMaterial)
    visibleLeafMesh.rotateX(-Math.PI / 2)
    let { x, y, z } = this.position
    visibleLeafMesh.position.set(x, y, z)
    visibleLeafMesh.castShadow = true
    visibleLeafMesh.receiveShadow = true
    visibleLeafMesh.name = this.name
    return visibleLeafMesh
  }

  GenerateLightMesh() {
    let vertShader = fs.readFileSync(__dirname + '/../../shaders/leaf_vert.glsl', { encoding: 'utf8' })
    let fragShader = fs.readFileSync(__dirname + '/../../shaders/leaf_frag.glsl', { encoding: 'utf8' })
    let uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib['lights'],
      {
        time: { type: "f", value: 0 }
      }
    ])
    let lightMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      lights: true
    })
    let lightMesh = new THREE.Mesh(this.model.geometry, lightMaterial)
    let { x, y, z } = this.position
    lightMesh.position.set(x, y, z)
    lightMesh.rotateX(-Math.PI / 2)
    lightMesh.receiveShadow = true
    lightMesh.visible = false
    return lightMesh
  }

  ReadLightInformation(renderer, scene, camera, lightSource, debug) {
    this.ConfigureCamera(camera)
    if (debug) {
      let cameraHelper = new THREE.CameraHelper(camera)
      scene.add(cameraHelper)
    }
    let vectorToLight = (lightSource.position.clone().sub(this.model.position)).normalize()
    // camera.position.add(vectorToLight.multiplyScalar(1))
    // let lightReadingCamPos = vectorToLight.add(this.model.position)

    let renderTargetParams = {
      minFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: false
    }
    let renderTarget = new THREE.WebGLRenderTarget(this.width, this.length, renderTargetParams)
    this.model.visible = false
    this.lightModel.visible = true
    renderer.render(scene, camera, renderTarget, true)

    var bufferData = new Uint8Array(this.width * this.length * 4)
    renderer.readRenderTargetPixels(renderTarget, 0, 0, this.width, this.length, bufferData)
    this.model.visible = true
    this.lightModel.visible = false

    return bufferData
  }

  ConfigureCamera(camera) {
    camera.left = this.width / -2
    camera.right = this.width / 2
    camera.top = this.length / 2
    camera.bottom = this.length / -2
    camera.near = 0
    camera.far = 3
    let { x, y, z } = this.model.position
    camera.position.set(x, y, z)
    let normalVector = new THREE.Vector3(0, 0, 1).applyQuaternion(this.model.quaternion)
    camera.position.add(normalVector.multiplyScalar(1))
    camera.lookAt(this.model.position)
  }
}

export default Leaf
