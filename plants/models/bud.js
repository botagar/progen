import * as THREE from 'three'
import * as RNG from 'random-seed'

// https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Plant_Buds_clasification.svg/2000px-Plant_Buds_clasification.svg.png
// http://images.slideplayer.com/16/5125130/slides/slide_2.jpg
// http://classconnection.s3.amazonaws.com/650/flashcards/4531650/gif/woody_twig1332558780300-1436473E1F7666D1B92.gif
// https://en.wikipedia.org/wiki/Axillary_bud
const BUD_TYPES = ['APICAL', 'AXILLARY', 'PETIOLE']



class Bud {
  constructor(config) {
    let { sproutId, position, radius, apicalDominance, rng } = config
    this.rng = rng || RNG.create()
    this.budId = this.rng.string(16)
    this.sproutId = sproutId || console.error('Cannot have a bud not associated with a sprout!')
    this.position = position || console.error('Sprout must give bud its position')
    this.radius = radius || 1
    this.startingApicalDominance = apicalDominance
    this.leadershipBias = 1
    this.auxinGeneration = 1
    this.auxinTolerance = 0.5

    this.isInScene = false
    this.currentAuxinLevel = 0
  }

  PrepareRender(scene, options) {
    if (this.isInScene) return null
    if (!this.model) { this.model = this._private.GenerateMesh() }
    // if (!this.lightModel) { this.lightModel = this._private.GenerateLightMesh() }
    scene.add(this.model)
    // scene.add(this.lightModel)
    this.isInScene = true
  }

  ProcessLogic(scene, options) {
    if (!this.model) this.PrepareRender(scene)
    let { position } = options
    let { x, y, z } = position
    this.model.position.set(x, y, z)
  }

  GetModel() {
    this.model = this._private.GenerateMesh()
    this.lightModel = this._private.GenerateLightMesh()
    return this.model
  }

  _private = {
    GenerateMesh: () => {
      let geometry = new THREE.SphereGeometry(this.radius, 32, 32)
      let material = new THREE.MeshBasicMaterial({ color: 0xff00ff })
      let sphere = new THREE.Mesh(geometry, material)
      let { x, y, z } = this.position
      sphere.position.set(x, y, z)
      return sphere
    },
    GenerateLightMesh: () => {

    }
  }
}

export default Bud
