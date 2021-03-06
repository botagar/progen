import 'babel-polyfill'
import * as THREE from 'three'

const Skybox = () => {
  let skyGeo = new THREE.SphereGeometry(5000, 25, 25)
  let loader = new THREE.TextureLoader()
  let skyboxPromise = new Promise((resolve, reject) => {
    loader.load(
      '../../images/skybox1.jpg',
      texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 4;
        texture.repeat.set( 1, 1 );
        let material = new THREE.MeshPhongMaterial({
          map: texture
        })
        let sky = new THREE.Mesh(skyGeo, material)
        sky.material.side = THREE.DoubleSide // THREE.BackSide
        resolve(sky)
      },
      progress => {
        console.info(`Texture Loading Progress: ${progress}`)
      },
      error => {
        console.error(error)
        reject(error)
      }
    )
  })
  return skyboxPromise
}

export default Skybox
