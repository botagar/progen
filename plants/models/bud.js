import Eventable from 'events'
import * as THREE from 'three'
import * as RNG from 'random-seed'
import ColorUtil from '../helpers/ColorUtil'

// https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Plant_Buds_clasification.svg/2000px-Plant_Buds_clasification.svg.png
// http://images.slideplayer.com/16/5125130/slides/slide_2.jpg
// http://classconnection.s3.amazonaws.com/650/flashcards/4531650/gif/woody_twig1332558780300-1436473E1F7666D1B92.gif
// https://en.wikipedia.org/wiki/Axillary_bud
const BUD_TYPES = ['APICAL', 'AXILLARY', 'PETIOLE']



class Bud extends Eventable {
  constructor(config) {
    super()
    let { stem, position, radius, apicalDominance, rng, isApicalBud, distanceFromBaseOfStem } = config
    this.rng = rng || RNG.create()
    this.budId = this.rng.string(16)
    this.stem = stem || console.error('Cannot have a bud not associated with a stem!')
    this.position = position || console.error('Stem must give bud its position')
    this.distanceFromBaseOfStem = distanceFromBaseOfStem || 0
    this.radius = radius || 1
    this.isApicalBud = isApicalBud || false
    this.startingApicalDominance = apicalDominance
    this.leadershipBias = 1
    this.auxinGeneration = 1
    this.auxinTolerance = 5
    this.auxinLevel = 0

    this.isInScene = false
    this.currentAuxinLevel = 0
  }

  PrepareRender(scene, options) {
    if (this.isInScene) return null
    if (!this.mesh) { this.mesh = this._private.GenerateMesh() }
    // if (!this.lightModel) { this.lightModel = this._private.GenerateLightMesh() }
    scene.add(this.mesh)
    // scene.add(this.lightModel)
    this.isInScene = true
  }

  ProcessLogic(scene, options) {
    if (!this.mesh) this.PrepareRender(scene)
    let pendingActions = []
    let { position, auxinLevel } = options
    if (this.isApicalBud) {
      this.emit('AuxinProduced', this.auxinGeneration)
    } else {
      this.auxinLevel = auxinLevel || 0
      // HACK just for now
      if (this.auxinLevel < 0) this.auxinLevel = 0
      // END HACK
      let newColor = ColorUtil.GetColorBetween('#0000FF', '#FF0000', this.auxinLevel / this.auxinTolerance, 16).replace('#', '0x')
      this.mesh.material.color.setHex(newColor)
    }
    let { x, y, z } = this.position || position
    this.mesh.position.set(x, y, z)
    return pendingActions
  }

  GetModel() {
    this.mesh = this._private.GenerateMesh()
    this.lightModel = this._private.GenerateLightMesh()
    return this.mesh
  }

  _private = {
    GenerateMesh: () => {
      let geometry = new THREE.SphereGeometry(this.radius, 32, 32)
      let material = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: false,
        opacity: 0.5,
      })
      let sphere = new THREE.Mesh(geometry, material)
      let { x, y, z } = this.position
      sphere.position.set(x, y, z)
      sphere.name = this.budId
      return sphere
    },
    GenerateLightMesh: () => {

    }
  }
}

export default Bud
