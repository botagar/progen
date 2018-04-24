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
    this.lightSensitivity = 1.0
    this.branchGravitropism = 1.0
    this.rootGravitropism = -1.0
    this.branchingAngles = 90
    this.budPerceptionArcAngle = 60 * Math.PI / 180

    let halfSenseAngle = this.budPerceptionArcAngle / 2
    let growthDir = this.RNG.floatBetween(-halfSenseAngle, halfSenseAngle) + (Math.PI / 2)
    let growthHead = new Vector3(Math.cos(growthDir), Math.sin(growthDir), Math.cos(growthDir))
      .multiplyScalar(this.sproutGrowthSpeed)
    let seed = new Stem({ startPosition: new Vector3(), endPosition: growthHead, faceCount: 6 })
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
    let returnedActions = []
    this.sprouts.forEach(sprout => {
      let ra = sprout.ProcessLogic(scene)
      returnedActions = returnedActions.concat(ra)
    })
    this.roots.forEach(root => {
      root.ProcessLogic(scene)
    })
    returnedActions.forEach(action => {
      this.doAction(action)
    })
    this.PrepareRender(scene)
    return true
  }

  Render(dt) {

  }

  doAction(action) {
    switch (action.action) {
      case 'DidGrow':
        this.energy -= this.energyUsedPerSproutGrowth
        break
      case 'DidNotGrow':
        this.energy -= this.energyUsedPerSproutOnMaintainance
        break
      case 'CreateNewSprout':
        this.createNewSprout(action.sprout)
        break
      default:
        console.warn(`Unhandled Action: ${action.action}`)
    }
  }

  createNewSprout(oldSprout) {
    console.log('Create New Sprout')
    let halfSenseAngle = this.budPerceptionArcAngle / 2
    let growthDir = this.RNG.floatBetween(-halfSenseAngle, halfSenseAngle) + (Math.PI / 2)
    let growthHead = new Vector3(Math.cos(growthDir), Math.sin(growthDir), Math.cos(growthDir))
      .multiplyScalar(this.sproutGrowthSpeed)
      .add(oldSprout.guide.end)
    let newSprout = new Stem({
      previousStemId: oldSprout.id,
      startPosition: oldSprout.guide.end,
      endPosition: growthHead,
      faceCount: 6
    })
    this.sprouts.push(newSprout)
  }

  serialise() { }
  deserialise() { }
}

export default Tree
