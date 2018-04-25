// Paremters:
// Tropism
// Branch Density
// Growth Direction
// Max Shoot Length
// Apical Dominance
// Bud Light Sensitivity
// Gravimorphism
// Branching Angles
// Bud Perception
// Other stuff about flowers, fruiting and seeds

import DNA from '../dna'
import Flora from '../flora'
import Stem from './stem'
import RNG from 'random-seed'
import * as THREE from 'three'
let { Vector2, Vector3 } = THREE
import Node from './node'

class Tree extends Flora {
  constructor(dna) {
    super()
    this.debug = {}
    this.debug.growCallCount = 0

    this.RNG = RNG.create('Seed')
    // this.DNA = new DNA()

    this.age = 1
    this.energy = 1000
    this.sproutGrowthSpeed = 0.25
    this.sproutGrowthEfficiency = 0.85
    this.energyUsedPerSproutGrowth = (1 + this.sproutGrowthSpeed) * ((1 - this.sproutGrowthEfficiency) + 1)
    this.energyUsedPerSproutOnMaintainance = (0.1 * this.age) // + 1

    this.tropism = new Vector3(0, -1, 0)
    this.branchDensity = 0.5
    this.growthDirection = new Vector3(0, 1, 0)
    this.maxShootLength = 5
    this.apicalDominance = 1.0
    this.auxinDecayRate = -1.0
    this.decayAuxin = (currentAuxin, distFromTopNode) => {
      // console.log('dist: ', distFromTopNode, 'curren aux', currentAuxin)
      let newAux = (this.auxinDecayRate * distFromTopNode) + currentAuxin
      return newAux <= 0 ? 0 : newAux
    }
    this.lightSensitivity = 1.0
    this.branchGravitropism = 1.0
    this.rootGravitropism = -1.0
    this.branchingAngles = 90
    this.budPerceptionArcAngle = 60 * Math.PI / 180

    this.stems = []
    this.nodes = []
    this.roots = []
    this.stemNum = 0

    this.createNewSprout()

    this.isInScene = false
    this.model = null
  }

  PrepareRender(scene, options) {
    if (!scene) return console.error('Must include scene to render too.')
    this.stems.forEach(sprout => {
      sprout.PrepareRender(scene)
    })
    this.nodes.forEach(node => {
      node.PrepareRender(scene)
    })
    this.roots.forEach(root => {
      root.PrepareRender(scene)
    })
  }

  ProcessLogic(scene, options) {
    if (this.energy <= 0) {
      console.warn('plant has died')
      return false
    }
    this.stems.forEach((stem, index, collection) => {
      stem.ProcessLogic(scene)
      // let eqn = (auxin, length) => { return auxin - (this.auxinDecayRate * length) }
      // if (index > 0) {
      //   sprout.auxinBottom = eqn(sprout.auxinTop, sprout.guide.distance())
      //   collection[index - 1].auxinTop = sprout.auxinBottom
      // } else {
      //   sprout.auxinBottom = eqn(sprout.auxinTop, sprout.guide.distance())
      // }
    })
    this.roots.forEach(root => {
      root.ProcessLogic(scene)
    })
    this.distributeAuxin()
    this.PrepareRender(scene)
    return true
  }

  Render(dt) {

  }

  EventHandlers = {
    DidGrow: () => { this.energy -= this.energyUsedPerSproutGrowth },
    DidNotGrow: () => { this.energy -= this.energyUsedPerSproutGrowth },
    CreateNewStem: existingStem => { this.createNewSprout(existingStem) }
  }

  createNewSprout(oldStem) {
    console.log('Create New Sprout')
    let halfSenseAngle = this.budPerceptionArcAngle / 2
    let growthDir = this.RNG.floatBetween(-halfSenseAngle, halfSenseAngle) + (Math.PI / 2)
    let growthHead = new Vector3(Math.cos(growthDir), Math.sin(growthDir), Math.cos(growthDir))
      .multiplyScalar(this.sproutGrowthSpeed)
    let newNode, startPosition, auxinLevel
    if (oldStem) {
      auxinLevel = oldStem.auxinTop
      growthHead.add(oldStem.guide.end)
      let currentApicalBud = oldStem.GetApicalBud()
      newNode = Node.CreateFromBud(currentApicalBud)
      startPosition = oldStem.guide.end
      oldStem.nextNode = newNode
    } else {
      startPosition = new Vector3()
      newNode = new Node(startPosition)
    }
    let newStem = new Stem({
      id: this.stemNum,
      previousNode: newNode,
      startPosition: startPosition,
      endPosition: growthHead,
      startAuxin: auxinLevel,
      faceCount: 6
    })
    newStem.on('DidGrow', this.EventHandlers.DidGrow)
    newStem.on('DidNotGrow', this.EventHandlers.DidNotGrow)
    newStem.on('MaxLengthReached', this.EventHandlers.CreateNewStem)
    newNode.previousStem = oldStem
    newNode.nextStem = newStem
    this.stemNum += 1
    this.stems.push(newStem)
    this.nodes.push(newNode)
  }

  distributeAuxin() {
    let apexStem = this.stems.find(stem => stem.nextNode == null)
    if (!apexStem) return
    let distFromApicalBud = 0

    let currentStem = apexStem
    let nextStem = currentStem.previousNode.previousStem

    if (!nextStem) {
      currentStem.auxinBottom = this.decayAuxin(currentStem.auxinTop, currentStem.GetLength())
      currentStem.distFromApicalBud = distFromApicalBud
    }

    while (nextStem) {
      currentStem.auxinBottom = this.decayAuxin(currentStem.auxinTop, currentStem.GetLength())
      currentStem.distFromApicalBud = distFromApicalBud
      distFromApicalBud += currentStem.maxLength
      nextStem.auxinTop = currentStem.auxinBottom
      currentStem = nextStem
      nextStem = currentStem.previousNode.previousStem
    }

    currentStem.auxinBottom = this.decayAuxin(currentStem.auxinTop, currentStem.GetLength())
    currentStem.distFromApicalBud = distFromApicalBud
  }
}

export default Tree
