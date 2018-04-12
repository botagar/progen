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

let THREE = require('three')
let Math2 = require('./MathGen')
let RNG = require('random-seed')
let Stems = require('./stem')
let { Vector2, Vector3 } = THREE

class Plant {
  constructor(dna) {
    this.RNG = RNG.create('Seed')

    this.age = 1
    this.energy = 1000
    this.sproutGrowthSpeed = 0.25
    this.sproutGrowthEfficiency = 0.85
    this.energyUsedPerSproutGrowth = (1 + this.sproutGrowthSpeed) * ((1 - this.sproutGrowthEfficiency) + 1)
    this.energyUsedPerSproutOnMaintainance = (0.1 * this.age) + 1

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

    let trunk = new Stems.Stem(new Vector3(), new Vector3(0, 1, 0).multiplyScalar(this.sproutGrowthSpeed), 50, 0xff0000)
      .limitSize(this.maxShootLength)
    this.stems = [trunk]
    this.roots = []
  }

  addSelfToScene(scene) {
    this.scene = scene
    for (let stem of this.stems) {
      scene.add(stem.getModel())
    }
  }

  serialise() { }
  deserialise() { }

  grow() {
    if (this.energy <= 0) {
      console.warn('plant has died')
      return false
    }
    for (let stem of this.stems) {
      if (stem.isFullyGrown() && stem.isEnd) {
        let newSprout = this._growNewSprout(stem)
        this.scene.add(newSprout.getModel())
        this.stems.push(newSprout)
        stem.isEnd = false
        console.log(`Energy is at: ${this.energy}`)
      }

      if (stem.isEnd) {
        stem.growBy(this.sproutGrowthSpeed)
        this.energy -= this.energyUsedPerSproutGrowth
      } else {
        this.energy -= this.energyUsedPerSproutOnMaintainance
      }
    }
    return true
  }

  _growNewSprout(oldSprout) {
    let halfSenseAngle = this.budPerceptionArcAngle / 2
    let growthDir = this.RNG.floatBetween(-halfSenseAngle, halfSenseAngle) + (Math.PI / 2)
    let growthHead = new Vector3(Math.cos(growthDir), Math.sin(growthDir), 0)
      .multiplyScalar(this.sproutGrowthSpeed)
      .add(oldSprout.endPoint)
    return new Stems.Stem(oldSprout.endPoint, growthHead, 50, 0x00ff00).limitSize(this.maxShootLength)
  }
}

module.exports = {
  Plant
}