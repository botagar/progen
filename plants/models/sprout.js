import { Vector3, Line3, Mesh, MeshBasicMaterial, MeshLambertMaterial } from 'three'
import { HightlightVerticies } from '../helpers/RenderUtils'

class Sprout {
  constructor(config) {
    let { startPosition, endPosition, startDiameter, endDiameter, maxLength, faceCount, growthFunction } = config || {}
    if (startDiameter) this.startDiameter = startDiameter || 1
    if (endDiameter) this.endDiameter = endDiameter || 1
    startPosition = startPosition || new Vector3()
    endPosition = endPosition || new Vector3(0, 1, 0)
    this.maxLength = maxLength || 5
    this.faceCount = faceCount || 8
    this.growthFunction = growthFunction || (x => { return 1 * x }) // y = mx + c where m=1 and c=0

    this.isAtMaxLength = false
    this.isLeader = true
    this.skeleton = new Line3(startPosition, endPosition)
    this.verticies = []

    // Want to be able to use this::GenerateVerticies() syntax. Keep an eye out on ES proposals
  }

  getModel() {
    let generatedModel = this._private.GenerateMesh()
    let ret = {}
    ret.add = generatedModel
    if (this.model) ret.remove = this.model
    this.model = generatedModel
    this._private.UpdateVerts()
    return ret
  }

  TryGrow = () => {
    this.growthFunction(1)
    return this.TryGrowBy(1)
  }

  TryGrowBy(mm) {
    if (this.isAtMaxLength) return false

    let currentLength = this.skeleton.distance()
    if (currentLength >= this.maxLength) {
      this.isAtMaxLength = true
      return false
    }

    let { start, end } = this.skeleton
    let diffVector = end.clone().sub(start)
    let { x, y, z } = diffVector

    let scale = (currentLength + mm) / currentLength
    let growth = new THREE.Vector3((x * scale) - x, (y * scale) - y, (z * scale) - z)
    this.skeleton.end.add(growth)
    this._private.UpdateVerts()
    this.model.geometry.verticesNeedUpdate = true
    return true
  }

  _private = {
    // Private functions hack
    GenerateMesh: () => {
      let sproutGeometry = new THREE.CylinderGeometry(this.startDiameter, this.endDiameter, this.skeleton.distance(), this.faceCount)
      let verts = sproutGeometry.vertices
      let bottomCenterVect = verts[verts.length - 1]
      sproutGeometry.translate(0, -bottomCenterVect.y, 0)

      let materialConfig = {
        color: 0xaf6c15,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0.8,
        // wireframe: true
      }

      let basicMaterial = new MeshBasicMaterial(materialConfig)
      let lambertMaterial = new MeshLambertMaterial(materialConfig)

      let mesh = new Mesh(sproutGeometry, lambertMaterial)
      let { x, y, z } = this.skeleton.start
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      return mesh
    },
    UpdateVerts: () => {
      let verts = this.model.geometry.vertices
      let centerTopVert = verts[verts.length - 2], centerBottomVert = verts[verts.length - 1]
      let cylinderCenterLine = centerTopVert.clone().sub(centerBottomVert)
      let currentLength = centerTopVert.distanceTo(centerBottomVert)

      let topCircleVerts = verts.slice(0, this.faceCount)
      topCircleVerts.push(centerTopVert)

      let desiredLength = this.skeleton.distance()
      let { start, end } = this.skeleton
      let skeleDiff = end.clone().sub(start.clone())
      let diff = centerTopVert.clone().sub(skeleDiff)
      topCircleVerts.forEach(vert => {
        vert.sub(diff)
      })
    }
  }
}

export default Sprout
