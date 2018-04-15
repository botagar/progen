import 'babel-polyfill'
import * as THREE from 'three'
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

    // var sun = new THREE.PointLight(0xffef68, 10, 1000, 2)
    // sun.position.set(0, 100, 0)
    // sun.castShadow = true
    // this.scene.add(sun)

    var angledSun = new THREE.DirectionalLight(0xffff00, 2)
    angledSun.position.set(-25, 200, 150)
    angledSun.castShadow = true
    angledSun.shadow.mapSize.width = 512
    angledSun.shadow.mapSize.height = 512
    angledSun.shadow.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    this.scene.add(angledSun)

    var helper = new THREE.CameraHelper(angledSun.shadow.camera)
    this.scene.add(helper)

    this.uniforms = {
      time: { type: "f", value: 0 }
    }
    let sphereMaterial =
      new THREE.ShaderMaterial(
        {
          uniforms: this.uniforms,
          vertexShader: document.getElementById('cubeVertexShader').textContent,
          fragmentShader: document.getElementById('cubeFragmentShader').textContent
        })
    let sphereGeometry = new THREE.SphereBufferGeometry(5, 8, 8)
    let sphereVertexDisplacements = new Float32Array(sphereGeometry.attributes.position.count)
    sphereVertexDisplacements.forEach((vert, index, array) => {
      array[index] = Math.random() * 2
    })
    sphereGeometry.addAttribute('displacement', new THREE.BufferAttribute(sphereVertexDisplacements, 1))
    
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.position.set(-20, 20, -20)
    sphere.castShadow = true
    sphere.receiveShadow = false // default
    this.scene.add(sphere)

    // var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6); // soft white light
    // this.scene.add(ambientLight)

    this.camera.position.set(5, 50, 150)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
  }

  addToScene(object) {
    this.scene.add(object)
  }

  render() {
    this.uniforms.time.value += (1/60)*5;
    this.renderer.render(this.scene, this.camera)
  }
}

module.exports = {
  SceneComposer
}
