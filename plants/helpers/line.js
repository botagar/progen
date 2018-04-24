
class Line {
  constructor(start, end) {
    var material = new THREE.LineBasicMaterial({ color: 0xff0000 })
    var geometry = new THREE.Geometry();
    geometry.vertices.push(start)
    geometry.vertices.push(end)
    this.line = new THREE.Line(geometry, material)
  }

  draw(scene) {
    scene.add(this.line)
  }
}

export default Line
