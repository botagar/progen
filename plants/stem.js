const THREE = require('three')

class Stem {
  constructor (startPoint, endPoint, thickness, color) {
    this.startPoint = startPoint
    this.endPoint = endPoint
    this.thickness = thickness || 10
    this.color = color || 0xff0000
    this.model = undefined
    this.isEnd = true
  }

  limitSize (limit) {
    this.sizeLimit = limit
    return this
  }

  growBy (mm) {
    let currentLength = this.getLength()
    let { x, y, z } = this.endPoint
    let dx = x - this.startPoint.x
    let dy = y - this.startPoint.y
    let dz = z - this.startPoint.z

    let scale = (currentLength + mm) / currentLength
    let growth = new THREE.Vector3((dx * scale) - dx, (dy * scale) - dy, (dz * scale) - dz)
    this.endPoint.add(growth)
    this.geometry.verticesNeedUpdate = true
  }

  getLength () {
    let { startPoint, endPoint } = this
    return startPoint.distanceTo(endPoint)
  }

  getAngle () {
    let { startPoint, endPoint } = this
    return startPoint.angleTo(endPoint)
  }

  isFullyGrown () {
    return this.getLength() >= this.sizeLimit
  }

  _generateModel () {
    // let line = new THREE.Line3(this.startPoint, this.endPoint)
    // return line
    var material = new THREE.LineBasicMaterial({ color: this.color, linewidth: this.thickness })
    var geometry = new THREE.Geometry()
    geometry.vertices.push(this.startPoint)
    geometry.vertices.push(this.endPoint)
    this.geometry = geometry
    return new THREE.Line(geometry, material)
  }

  _generateModelCylinder () {
    var geometry = new THREE.CylinderGeometry(5, 5, this.endPoint.y, 32)
    var material = new THREE.MeshBasicMaterial({color: this.color})
    var cylinder = new THREE.Mesh(geometry, material)
    return cylinder
  }

  getModel () {
    if (this.model) return this.model
    this.model = this._generateModel()
    return this.model
  }
}

module.exports = {
  Stem
}
