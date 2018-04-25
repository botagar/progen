
class Node {
  constructor(position) {
    this.position = position

    this.nextStem = null
    this.previousStem = null
  }

  static CreateFromBud(bud) {
    let budPosition = bud.position
    let newNode = new Node(budPosition)
    bud.isApicalBud = false
    newNode.budCreatedFrom = bud
    return newNode
  }

  PrepareRender(scene, options) {
    if (this.isInScene) return
    if (this.budCreatedFrom) scene.remove(this.budCreatedFrom.mesh)
    if (!this.mesh) this.mesh = this._private.GenerateMesh()
    scene.add(this.mesh)
    this.isInScene = true
  }

  ProcessLogic(scene, options) {

  }

  _private = {
    GenerateMesh: () => {
      let geometry = new THREE.SphereGeometry(0.75, 16, 16)
      let material = new THREE.MeshBasicMaterial({
        color: 0x00FF00
      })
      let sphere = new THREE.Mesh(geometry, material)
      let { x, y, z } = this.position
      sphere.position.set(x, y, z)
      return sphere
    }
  }
}

export default Node
