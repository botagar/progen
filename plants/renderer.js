
import * as THREE from 'three'
import SceneComposer from './SceneComposer'
let Plants = require('./plant')

var delay = 0
var counter = 60 * delay
var animationLoopId
let plantAlive = true
const tick = () => {
  if (counter > (60 * delay)) {
    counter = 0
    plantAlive = testPlant.grow()
    sceneComposer.render()
  }
  if (!plantAlive) {
    console.info('cancel animation')
    window.cancelAnimationFrame(animationLoopId)
  } else {
    animationLoopId = window.requestAnimationFrame(tick)
  }
  counter += 1
}

let sceneComposer = new SceneComposer()
sceneComposer.setupScene()
let testPlant = new Plants.Plant()

testPlant.addSelfToScene(sceneComposer.scene)
animationLoopId = window.requestAnimationFrame(tick)
// cancelAnimationFrame(animationLoopId);
