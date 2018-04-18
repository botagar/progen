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

import DNA from './dna'
import { HightlightVerticies } from './helpers/RenderUtils'
import Sprout from './models/sprout'

let THREE = require('three')
let RNG = require('random-seed')
let Stems = require('./stem')
let { Vector2, Vector3 } = THREE

class Plant {
  constructor (dna) {
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
    this.lightSensitivity = 1.0
    this.branchGravitropism = 1.0
    this.rootGravitropism = -1.0
    this.branchingAngles = 90
    this.budPerceptionArcAngle = 45 * Math.PI / 180

    let halfSenseAngle = this.budPerceptionArcAngle / 2
    let growthDir = this.RNG.floatBetween(-halfSenseAngle, halfSenseAngle) + (Math.PI / 2)
    let growthHead = new Vector3(Math.cos(growthDir), Math.sin(growthDir), 0)
      .multiplyScalar(this.sproutGrowthSpeed)
    let seed = new Sprout({ startPosition: new Vector3(), endPosition: growthHead, faceCount: 6 })
    this.sprouts = [seed]
    this.roots = []

    this.isInScene = false
    this.model = null
  }

  PrepareRender(scene, options) {
    if (!scene) return console.error('Must include scene to render too.')
    this.sprouts.forEach(sprout => {      
      sprout.PrepareRender(scene)
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
    this.grow(scene)
    this.sprouts.forEach(sprout => {
      sprout.ProcessLogic(scene)
    })
    this.roots.forEach(root => {
      root.ProcessLogic(scene)
    })
    this.PrepareRender(scene)
    return true
  }

  serialise () { }
  deserialise () { }

  grow (scene) {
    this.debug.growCallCount += 1
    let nursury = []
    for (let sprout of this.sprouts) {
      let didSproutGrow = sprout.TryGrow()
      if (!didSproutGrow && sprout.isLeader) {
        this.energy -= this.energyUsedPerSproutOnMaintainance
        let newSprout = this._growNewSprout(sprout)
        nursury.push(newSprout)
        sprout.isLeader = false
      } else {
        this.energy -= this.energyUsedPerSproutGrowth
      }
    }
    this.sprouts = this.sprouts.concat(nursury)
    return true
  }

  _growNewSprout (oldSprout) {
    let halfSenseAngle = this.budPerceptionArcAngle / 2
    let growthDir = this.RNG.floatBetween(-halfSenseAngle, halfSenseAngle) + (Math.PI / 2)
    let growthHead = new Vector3(Math.cos(growthDir), Math.sin(growthDir), 0)
      .multiplyScalar(this.sproutGrowthSpeed)
      .add(oldSprout.guide.end)
    return new Sprout({ startPosition: oldSprout.guide.end, endPosition: growthHead, faceCount: 6 })
  }
}

module.exports = {
  Plant
}
