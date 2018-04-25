import EventEmitter from 'events'
import { Vector3, Line3, FrontSide, Mesh, CylinderGeometry, MeshBasicMaterial, MeshLambertMaterial } from 'three'
import * as RNG from 'random-seed'
import Bud from './bud'
import Line from '../helpers/line'
import VectorHelper from '../helpers/VectorHelper'
import MathHelper from '../helpers/MathUtil'

class Stem extends EventEmitter {
  constructor(config) {
    super()
    let { startPosition, endPosition, startDiameter, endDiameter, maxLength, faceCount, growthFunction,
      rng, isBase, previousNode, nextNode, startAuxin, id } = config || {}
    this.rng = rng || RNG.create()
    if (startDiameter) this.startDiameter = startDiameter || 1
    if (endDiameter) this.endDiameter = endDiameter || 1
    startPosition = startPosition || new Vector3()
    endPosition = endPosition || new Vector3(0, 1, 0)
    this.maxLength = maxLength || 10
    this.faceCount = faceCount || 8
    this.growthFunction = growthFunction || (x => { return 1 * x }) // y = mx + c where m=1 and c=0
    this.projectedEnd = endPosition.clone().sub(startPosition).normalize().multiplyScalar(this.maxLength).add(startPosition)
    this.budDensity = 15
    this.budAngles = Math.PI / 2
    this.distBetweenBuds = this.maxLength / this.budDensity
    this.distFromApicalBud = 0

    this.id = id == null ? this.rng.string(16) : id
    this.isBase = isBase || false
    this.nextNode = nextNode || null
    this.previousNode = previousNode || null
    this.isAtMaxLength = false
    this.isInScene = false
    this.isLeader = true
    this.guide = new Line3(startPosition, endPosition)

    this.auxinTop = startAuxin || 0
    this.auxinBottom = startAuxin || 0
    this.calculateAuxin = bud => {
      let normalisedBudPosition = 1 - ((this.maxLength - bud.distanceFromBaseOfStem) / this.maxLength)
      let auxVal = MathHelper.lerp(this.auxinBottom, this.auxinTop, normalisedBudPosition)
      return auxVal
    }

    // research -> https://en.wikipedia.org/wiki/Leaf#Arrangement_on_the_stem
    this.buds = []
    if (this.nextStem == null) {
      let apicalBud = new Bud({
        stem: this,
        position: endPosition,
        isApicalBud: true,
        radius: 1
      })
      this.buds.push(apicalBud)
    }
    // Want to be able to use this::GenerateVerticies() syntax. Keep an eye out on ES proposals
    this.PrepareEventListeners()
  }

  GetLength() {
    if (this.isAtMaxLength) return this.maxLength
    return this.guide.distance()
  }

  GetApicalBud() {
    return this.buds.find(bud => bud.isApicalBud == true)
  }

  PrepareEventListeners() {
    let apicalBud = this.GetApicalBud()
    apicalBud.on('AuxinProduced', dAuxin => { 
      if (this.auxinTop < 20) this.auxinTop += dAuxin
    })
  }

  PrepareRender(scene, options) {
    this.buds.forEach(bud => {
      bud.PrepareRender(scene, options)
    })
    if (this.isInScene) return null
    new Line(this.guide.start, this.projectedEnd).draw(scene)
    if (!this.model) { this.model = this._private.GenerateMesh() }
    // if (!this.lightModel) { this.lightModel = this._private.GenerateLightMesh() }
    scene.add(this.model)
    // scene.add(this.lightModel)
    this.isInScene = true
  }

  ProcessLogic(scene, options) {
    let { processGrowth = true, processBuds = true, processAuxin = true } = options || {}
    if (!this.model) this.PrepareRender(scene)
    if (processBuds) {
      this._private.TryGenerateNewBud(scene)
      this.buds.forEach((bud, index) => {
        bud.ProcessLogic(scene, {
          position: this.guide.end,
          auxinLevel: this.calculateAuxin(bud)
        })
      })
    }
    if (processGrowth) this.Grow()
  }

  Grow() {
    if (this.isAtMaxLength) {
      this.emit('DidNotGrow')
      if (this.nextNode === null) {
        this.emit('MaxLengthReached', this)
      }
      return
    }
    let currentLength = this.guide.distance()
    if (currentLength >= this.maxLength) {
      this.isAtMaxLength = true
      this.emit('DidNotGrow')
      return
    }

    let { start, end } = this.guide
    let diffVector = end.clone().sub(start)
    let { x, y, z } = diffVector

    let scale = (currentLength + 0.25) / currentLength
    let growth = new Vector3((x * scale) - x, (y * scale) - y, (z * scale) - z)
    this.guide.end.add(growth)
    this._private.UpdateVerts()
    this.model.geometry.verticesNeedUpdate = true
    this.emit('DidGrow', this)
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
        opacity: 0.5,
        wireframe: true
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
    },
    TryGenerateNewBud: (scene) => {
      let budNum = this.buds.length
      let stemLength = this.guide.distance()
      let placeBud = stemLength >= (budNum * this.distBetweenBuds)
      if (!placeBud) return false

      this.normalVectToGrowth = VectorHelper.CalculateNormal(this.projectedEnd.clone()).add(this.guide.end)
      let budLine = this.normalVectToGrowth.clone()
        .applyAxisAngle(this.guide.end.clone().normalize(), this.budAngles * budNum)

      new Line(this.guide.end.clone(), budLine).draw(scene)
      let distVect = new THREE.Vector3()
      this.guide.closestPointToPoint(budLine, true, distVect)
      let distFromBase = this.guide.start.distanceTo(distVect)

      let bud = new Bud({
        stem: this,
        position: budLine,
        isApicalBud: false,
        distanceFromBaseOfStem: distFromBase,
        radius: 0.2
      })
      this.buds.push(bud)
      return true
    }
  }
}

export default Stem
