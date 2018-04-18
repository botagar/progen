
import * as THREE from 'three'
import Stats from 'stats.js'
import SceneComposer from './SceneComposer'
import Leaf from './models/leaf'
let Plants = require('./plant')


let fps = new Stats()
let ms = new Stats()
let mem = new Stats()
fps.showPanel(0)
ms.showPanel(1)
mem.showPanel(2)
document.getElementById('fps').appendChild(fps.dom)
document.getElementById('ms').appendChild(ms.dom)
document.getElementById('mem').appendChild(mem.dom)

var animationLoopId
const renderLoop = () => {
  fps.begin()
  mem.begin()
  sceneComposer.render()
  fps.end()
  mem.end()
  animationLoopId = window.requestAnimationFrame(renderLoop)
}

let sceneComposer = new SceneComposer()
let testPlant = new Plants.Plant()
let testLeaf = new Leaf(new THREE.Vector3(5, 5, 5))

sceneComposer.setupScene().then(() => {
  testPlant.PrepareRender(sceneComposer.scene)
  animationLoopId = window.requestAnimationFrame(renderLoop)
  logicLoop()
})

let plantAlive = true
const logicLoop = () => {
  ms.begin()  
  console.log('Logic Loop Start')
  let { scene, renderer, angledSun } = sceneComposer
  // let lightInfo = testLeaf.ReadLightInformation(renderer, scene, new THREE.OrthographicCamera(), angledSun, true)

  if (plantAlive) {
    plantAlive = testPlant.ProcessLogic(scene)
  }
  // window.cancelAnimationFrame(animationLoopId)
  ms.end()  
  setTimeout(logicLoop, 1000)
}
