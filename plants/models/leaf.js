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
    return this.model
  }

  GenerateMesh() {
    var leafGeometry = new THREE.PlaneBufferGeometry(this.width, this.length, this.resolution, this.resolution)
    let leafMaterial = new THREE.MeshLambertMaterial({
      color: 0x00FF00,
      side: THREE.DoubleSide
    })
    var leafMesh = new THREE.Mesh(leafGeometry, leafMaterial)
    leafMesh.rotateX(-Math.PI / 2)
    let { x, y, z } = this.position
    leafMesh.position.set(x, y, z)
    leafMesh.castShadow = true
    leafMesh.receiveShadow = true
    leafMesh.name = this.name
    return leafMesh
  }

  ReadLightInformation(renderer, scene, camera, lightSource, debug) {
    this.ConfigureCamera(camera)
    if (debug) {
      let cameraHelper = new THREE.CameraHelper(camera)
      scene.add(cameraHelper)
    }
    console.log(lightSource)
    let vectorToLight = (lightSource.position.clone().sub(this.model.position)).normalize()
    // camera.position.add(vectorToLight.multiplyScalar(1))
    // let lightReadingCamPos = vectorToLight.add(this.model.position)

    let renderTargetParams = {
      minFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: false
    }
    let renderTarget = new THREE.WebGLRenderTarget(this.width, this.length, renderTargetParams)
    renderer.render(scene, camera, renderTarget, true)

    var bufferData = new Uint8Array(this.width * this.length * 4)
    renderer.readRenderTargetPixels(renderTarget, 0, 0, this.width, this.length, bufferData)

    return bufferData
  }

  ConfigureCamera(camera) {
    camera.left = this.width / -2
    camera.right = this.width / 2
    camera.top = this.length / 2
    camera.bottom = this.length / -2
    camera.near = 0
    camera.far = 0.02
    let { x, y, z } = this.model.position
    camera.position.set(x, y, z)
    let normalVector = new THREE.Vector3(0, 0, 1).applyQuaternion(this.model.quaternion)
    camera.position.add(normalVector.multiplyScalar(0.01))
    camera.lookAt(this.model.position)
  }
}

export default Leaf
