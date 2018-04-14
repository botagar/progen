import 'babel-polyfill'
import * as THREE from 'three'
import Skybox from './Skybox'
import Floor from './FloorPlane'

class SceneComposer {
  constructor (containerId, fov, viewWidth, viewHeight, aspectRatio, nearPlane, farPlane) {
    containerId = containerId || 'three-viewport'
    fov = fov || 75
    viewWidth = viewWidth || window.innerWidth
    viewHeight = viewHeight || window.innerHeight
    aspectRatio = aspectRatio || (viewWidth / viewHeight)
    nearPlane = nearPlane || 0.1
    farPlane = farPlane || 1000

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    this.renderer.setSize(viewWidth, viewHeight)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // default THREE.PCFShadowMap

    document.getElementById(containerId).appendChild(this.renderer.domElement)
  }

  async setupScene () {
    let sky = await Skybox()
    this.scene.add(sky)
    this.scene.add(Floor)

    let hemiLight = new THREE.HemisphereLight(0x0000ff, 0xffffff, 1)
    hemiLight.position.set(0, 50, 0)
    this.scene.add(hemiLight)

    // var sun = new THREE.PointLight(0xffef68, 10, 1000, 2)
    // sun.position.set(0, 100, 0)
    // sun.castShadow = true
    // this.scene.add(sun)

    var angledSun = new THREE.DirectionalLight(0xffff00, 2)
    angledSun.position.set(-150, 200, 0)
    angledSun.castShadow = true
    angledSun.shadow.mapSize.width = 512
    angledSun.shadow.mapSize.height = 512
    // angledSun.shadow.camera.near = 0.5
    // angledSun.shadow.camera.far = 500
    angledSun.shadow.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    this.scene.add(angledSun)

    var helper = new THREE.CameraHelper(angledSun.shadow.camera)
    this.scene.add(helper)

    // var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6); // soft white light
    // this.scene.add(ambientLight)

    // var geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
    // var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    // var cylinder = new THREE.Mesh(geometry, material);
    // this.scene.add(cylinder);

    this.camera.position.set(5, 50, 150)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
  }

  addToScene (object) {
    this.scene.add(object)
  }

  render () {
    this.renderer.render(this.scene, this.camera)
  }
}

module.exports = {
  SceneComposer
}
