import 'babel-polyfill'
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

    // var sun = new THREE.PointLight(0xffef68, 10, 1000, 2)
    // sun.position.set(0, 100, 0)
    // sun.castShadow = true
    // this.scene.add(sun)

    this.angledSun = new THREE.DirectionalLight(0xffff00, 2)
    this.angledSun.position.set(-25, 200, 150)
    this.angledSun.castShadow = true
    this.angledSun.shadow.mapSize.width = 512
    this.angledSun.shadow.mapSize.height = 512
    this.angledSun.shadow.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    this.scene.add(this.angledSun)

    // this.dirLightShadowMapViewer = new ShadowMapViewer(this.angledSun, this.camera);
    // this.dirLightShadowMapViewer.position.x = 10;
    // this.dirLightShadowMapViewer.position.y = 10;
    // this.dirLightShadowMapViewer.size.width = 256;
    // this.dirLightShadowMapViewer.size.height = 256;
    // this.dirLightShadowMapViewer.update(); //Required when setting position or size directly


    var helper = new THREE.CameraHelper(this.angledSun.shadow.camera)
    this.scene.add(helper)

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
          vertexShader: document.getElementById('cubeVertexShader').textContent,
          fragmentShader: document.getElementById('cubeFragmentShader').textContent,
          lights: true
        })
        let sphereMat = new THREE.MeshLambertMaterial({
          color: 0x00ff00
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
    sphere.receiveShadow = true // default
    this.scene.add(sphere)

    let squareGeom = new THREE.CubeGeometry(5,5,5)
    let squareMat = new THREE.MeshLambertMaterial({
      color: 0xff0000
    })
    let square = new THREE.Mesh(squareGeom, squareMat)
    square.position.set(-20, 30, -11)
    square.castShadow = true
    square.receiveShadow = true
    this.scene.add(square)

    // var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6); // soft white light
    // this.scene.add(ambientLight)

    this.camera.position.set(5, 30, 30)
    // this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.camera.lookAt(square.position)
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

module.exports = {
  SceneComposer
}
