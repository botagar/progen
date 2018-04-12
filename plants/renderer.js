
let Math2 = require('./MathGen')
let threeCanvas = require('./SceneComposer')
let Plants = require('./plant')
let THREE = require('three')


var delay = 0
var counter = 60 * delay
var animationLoopId
let plantAlive = true;
const tick = () => {
  if (counter > (60 * delay)) {
    counter = 0
    plantAlive = testPlant.grow()
    sceneComposer.render()
  }
  if (!plantAlive) {
    console.info('cancel animation')
    window.cancelAnimationFrame(animationLoopId);
  } else {
    animationLoopId = window.requestAnimationFrame(tick)
  }
  counter += 1
}


let sceneComposer = new threeCanvas.SceneComposer()
let testPlant = new Plants.Plant()

testPlant.addSelfToScene(sceneComposer.scene)

animationLoopId = window.requestAnimationFrame(tick)
// cancelAnimationFrame(animationLoopId);





// let sceneComposer = new threeCanvas.SceneComposer()
// let stem1 = new Stem.Stem(new Vector3(), new Vector3(0, 10, 0), 50, 0xff0000)
// sceneComposer.addToScene(stem1.getModel())
// sceneComposer.render()

// let ag = new Math2.AngleGenerator()

// const branchChance = 0.25

// stems = [stem1]
// for (i = 0; i < 5; i++) {
//   let prevStem = stems[i]
//   let angle = ag.newRandomAngleInRadians().scaledBetween( 0, 0.5).withRotationOffset(0.5 * Math.PI).mirrorAcrossYWithProbability(0.5).generate()
//   let newEndPoint = new Vector3(Math.cos(angle), Math.sin(angle), 0).setLength(10).add(prevStem.endPoint)
//   let thisStem = new Stem.Stem(prevStem.endPoint, newEndPoint, 50, 0x00ff00)
//   sceneComposer.addToScene(thisStem.getModel())
//   stems.push(thisStem)

//   let doBranch = Math.random() < branchChance ? true : false
//   if (doBranch) {
//     console.log('Branch!')
//     let branchAngle = ag.newRandomAngleInRadians().scaledBetween( 0, 2).withRotationOffset(0.5 * Math.PI).mirrorAcrossYWithProbability(0.5).generate()
//     let newBranchEndPoint = new Vector3(Math.cos(branchAngle), Math.sin(branchAngle), 0).setLength(10).add(prevStem.endPoint)
//     let branch = new Stem.Stem(prevStem.endPoint, newBranchEndPoint, 50, 0xffffff)
//     sceneComposer.addToScene(branch.getModel())
//   }
// }

// sceneComposer.render()