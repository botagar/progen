import { Vector3, Line3, FrontSide, Mesh, CylinderGeometry, MeshBasicMaterial, MeshLambertMaterial } from 'three'
import * as RNG from 'random-seed'
import Bud from './bud'
import { HightlightVerticies } from '../helpers/RenderUtils'

class Sprout {
  constructor(config) {
    let { startPosition, endPosition, startDiameter, endDiameter, maxLength, faceCount, growthFunction, rng, isBase } = config || {}
    this.rng = rng || RNG.create()
    if (startDiameter) this.startDiameter = startDiameter || 1
    if (endDiameter) this.endDiameter = endDiameter || 1
    startPosition = startPosition || new Vector3()
    endPosition = endPosition || new Vector3(0, 1, 0)
    this.maxLength = maxLength || 5
    this.faceCount = faceCount || 8
    this.growthFunction = growthFunction || (x => { return 1 * x }) // y = mx + c where m=1 and c=0

    this.id = this.rng.string(16)
    this.isBase = isBase || false
    this.nextStemId = null
    this.previousStemId = null
    this.isAtMaxLength = false
    this.isInScene = false
    this.isLeader = true
    this.guide = new Line3(startPosition, endPosition)

    // research -> https://en.wikipedia.org/wiki/Leaf#Arrangement_on_the_stem
    this.buds = []
    if (this.nextStemId == null) {
      let apicalBud = new Bud({
        sproutId: this.id,
        position: endPosition,
        radius: 1
      })
      this.buds.push(apicalBud)
    }
    // Want to be able to use this::GenerateVerticies() syntax. Keep an eye out on ES proposals
  }

  PrepareRender(scene, options) {    
    this.buds.forEach(bud => {
      bud.PrepareRender(scene, options)
    })
    if (this.isInScene) return null
    if (!this.model) { this.model = this._private.GenerateMesh() }
    // if (!this.lightModel) { this.lightModel = this._private.GenerateLightMesh() }
    scene.add(this.model)
    // scene.add(this.lightModel)
    this.isInScene = true
  }

  ProcessLogic(scene, options) {
    if (!this.model) this.PrepareRender(scene)
    this.Grow()
    this.buds.forEach(bud => {
      bud.ProcessLogic(scene, {
        position: this.guide.end
      })
    })
  }

  // getModel() {
  //   let generatedModel = this._private.GenerateMesh()
  //   let ret = {}
  //   ret.add = generatedModel
  //   if (this.model) ret.remove = this.model
  //   this.model = generatedModel
  //   this._private.UpdateVerts()
  //   return ret
  // }

  Grow = () => {
    this.growthFunction(1)
    return this.TryGrowBy(0.25)
  }

  TryGrow = () => {
    this.growthFunction(1)
    return this.TryGrowBy(1)
  }

  TryGrowBy(mm) {
    if (this.isAtMaxLength) return false

    let currentLength = this.guide.distance()
    if (currentLength >= this.maxLength) {
      this.isAtMaxLength = true
      return false
    }

    let { start, end } = this.guide
    let diffVector = end.clone().sub(start)
    let { x, y, z } = diffVector

    let scale = (currentLength + mm) / currentLength
    let growth = new Vector3((x * scale) - x, (y * scale) - y, (z * scale) - z)
    this.guide.end.add(growth)
    this._private.UpdateVerts()
    this.model.geometry.verticesNeedUpdate = true
    return true
  }

  _private = {
    // Private functions hack
    GenerateMesh: () => {
      let sproutGeometry = new CylinderGeometry(this.startDiameter, this.endDiameter, this.guide.distance(), this.faceCount)
      let verts = sproutGeometry.vertices
      let bottomCenterVect = verts[verts.length - 1]
      sproutGeometry.translate(0, -bottomCenterVect.y, 0)

      let materialConfig = {
        color: 0xaf6c15,
        side: FrontSide,
        transparent: true,
        opacity: 0.8,
        // wireframe: true
      }

      let lambertMaterial = new MeshLambertMaterial(materialConfig)

      let mesh = new Mesh(sproutGeometry, lambertMaterial)
      let { x, y, z } = this.guide.start
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

      let desiredLength = this.guide.distance()
      let { start, end } = this.guide
      let skeleDiff = end.clone().sub(start.clone())
      let diff = centerTopVert.clone().sub(skeleDiff)
      topCircleVerts.forEach(vert => {
        vert.sub(diff)
      })
    },
    GenerateLightMesh: () => {
      return {}
    }
  }
}

export default Sprout
