const THREE = require('three')

class Stem {
  constructor(startPoint, endPoint, thickness, color) {
    this.startPoint = startPoint
    this.endPoint = endPoint
    this.thickness = thickness || 10
    this.color = color || 0xff0000
    this.model = undefined
    this.isEnd = true
  }

  limitSize(limit) {
    this.sizeLimit = limit
    return this
  }

  growBy(mm) {
    let currentLength = this.getLength()
    let { x, y, z } = this.endPoint
    let dx = x - this.startPoint.x
    let dy = y - this.startPoint.y
    let dz = z - this.startPoint.z

    let scale = (currentLength + mm) / currentLength
    let growth = new THREE.Vector3((dx*scale)-dx,(dy*scale)-dy,(dz*scale)-dz)
    this.endPoint.add(growth)

    // if (!dx & !dy & !dz) return

    // let theta, phi, newX = 0, newY = 0, newZ = 0
    // if (!dx) {
    //   theta = Math.PI / 2
    //   newY = (currentLength + mm) * Math.sin(Math.PI / 2)
    // }

    // if (dx) {
    //   theta = Math.atan2(dz, dx)
    //   console.log(`Theta: ${theta}`)
    //   let ProjectedLengthOnXZPlane = dz / Math.sin(theta)
    //   console.log(`Projected: ${ProjectedLengthOnXZPlane}`)
    //   phi = Math.acos(ProjectedLengthOnXZPlane / currentLength)
    //   let grownLProjectedLengthOnXZPlane = Math.cos(phi * (currentLength + mm))
    //   newX = grownLProjectedLengthOnXZPlane * Math.cos(theta)
    //   newZ = grownLProjectedLengthOnXZPlane * Math.sin(theta)
    // }
    // newY = (currentLength + mm) * Math.sin(phi || (Math.PI / 2))
    // this.endPoint.set(newX, newY, newZ)
    // let angle = this.getAngle()
    // console.log(angle)
    this.geometry.verticesNeedUpdate = true
  }

  getLength() {
    let { startPoint, endPoint } = this
    return startPoint.distanceTo(endPoint)
  }

  getAngle() {
    let { startPoint, endPoint } = this
    return startPoint.angleTo(endPoint)
  }

  isFullyGrown() {
    return this.getLength() >= this.sizeLimit
  }

  _generateModel() {
    var material = new THREE.LineBasicMaterial({ color: this.color, linewidth: this.thickness })
    var geometry = new THREE.Geometry()
    geometry.vertices.push(this.startPoint)
    geometry.vertices.push(this.endPoint)
    this.geometry = geometry
    return new THREE.Line(geometry, material)
  }

  getModel() {
    if (this.model) return this.model
    this.model = this._generateModel()
    return this.model
  }
}

module.exports = {
  Stem
}
