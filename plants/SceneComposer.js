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

    this.camera.position.set(50, 50, 5)
    this.camera.lookAt(new THREE.Vector3(5, 5, 5))
    // this.camera.lookAt(this.sphere.position)
  }

  addToScene(object) {
    this.scene.add(object)
  }

  render() {
    // this.dirLightShadowMapViewer.render( this.renderer );
    // this.uniforms.time.value += (1 / 60) * 5;
    this.renderer.render(this.scene, this.camera)
  }
}

export default SceneComposer
