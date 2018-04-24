import * as THREE from 'three'

class VectorHelper {
  static CalculateNormal(vector) {
    let { x, y, z } = vector
    if (x) return new THREE.Vector3(-(y + z) / x, 1, 1).normalize()
    if (y) return new THREE.Vector3(1, -(x + z) / y, 1).normalize()
    if (z) return new THREE.Vector3(1, 1, -(x + y) / z).normalize()
  }
}

export default VectorHelper
