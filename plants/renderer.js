
import * as THREE from 'three'
import SceneComposer from './SceneComposer'
import Leaf from './models/leaf'
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

let testLeaf = new Leaf(new THREE.Vector3(5,5,5))

let sceneComposer = new SceneComposer()
sceneComposer.setupScene()
let testPlant = new Plants.Plant()

testPlant.addSelfToScene(sceneComposer.scene)
sceneComposer.scene.add(testLeaf.GetModel())
window.setTimeout(() => {
  console.log('Starting Light Scan')
  let {scene, renderer, angledSun} = sceneComposer 
  let lightInfo = testLeaf.ReadLightInformation(renderer, scene, new THREE.OrthographicCamera(), angledSun, true)
  console.log(lightInfo)
  sceneComposer.render()
}, 2000);
animationLoopId = window.requestAnimationFrame(tick)
// cancelAnimationFrame(animationLoopId);
