let THREE = require('three')

class SceneComposer {
  constructor(containerId, fov, viewWidth, viewHeight, aspectRatio, nearPlane, farPlane) {
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
    this.renderer.setClearColor( 0x000000, 0.4 );
    document.getElementById(containerId).appendChild(this.renderer.domElement)

    let hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    hemiLight.color.setHSL(0.095, 0.5, 0.5)
    hemiLight.groundColor.setHSL(0.095, 0.5, 0.5);
    hemiLight.position.set(0, 500, 0);
    this.scene.add(hemiLight)

    this.camera.position.set(0, 0, 100)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
  }

  addToScene(object) {
    this.scene.add(object)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}

module.exports = {
  SceneComposer
}