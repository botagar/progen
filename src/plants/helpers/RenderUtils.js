import * as THREE from 'three'

export const HightlightVerticies = modelGeometry => {
  let geometry = new THREE.Geometry()

  for (let i = 0; i < modelGeometry.vertices.length; i++) {
    geometry.vertices.push(modelGeometry.vertices[i])
  }

  let material = new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, color: 0x48f442, transparent: false })
  material.color.setHSL(1.0, 0.3, 0.7)

  let particles = new THREE.Points(geometry, material)
  particles.sortParticles = true
  return particles
}

export default {}
