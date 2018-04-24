import '../../node_modules/three/examples/js/controls/PointerLockControls'

class FPCamera {
  constructor(camera) {
    this.fpCam = new THREE.PointerLockControls(camera).getObject()

    this.moveForward = false
    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false
    this.canJump = false
    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()
    this.prevTime = performance.now()

    document.addEventListener('keydown', this.onKeyDown, false)
    document.addEventListener('keyup', this.onKeyUp, false)
  }

  onKeyDown = (event) => {
    switch (event.keyCode) {

      case 38: // up
      case 87: // w
        this.moveForward = true
        break;

      case 37: // left
      case 65: // a
        this.moveLeft = true
        break

      case 40: // down
      case 83: // s
        this.moveBackward = true
        break

      case 39: // right
      case 68: // d
        this.moveRight = true
        break
    }
  }

  onKeyUp = (event) => {
    switch (event.keyCode) {

      case 38: // up
      case 87: // w
        this.moveForward = false
        break

      case 37: // left
      case 65: // a
        this.moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        this.moveBackward = false
        break

      case 39: // right
      case 68: // d
        this.moveRight = false
        break
    }
  }

  getCamera = () => {
    return this.fpCam
  }

  update = () => {
    var time = performance.now()
    var delta = (time - this.prevTime) / 1000

    this.velocity.x -= this.velocity.x * 10.0 * delta
    this.velocity.z -= this.velocity.z * 10.0 * delta

    this.velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward)
    this.direction.x = Number(this.moveLeft) - Number(this.moveRight)
    this.direction.normalize(); // this ensures consistent movements in all directions

    if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta
    if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta

    this.fpCam.translateX(this.velocity.x * delta)
    this.fpCam.translateY(this.velocity.y * delta)
    this.fpCam.translateZ(this.velocity.z * delta)

    if (this.fpCam.position.y < 1) {

      this.velocity.y = 0
      this.fpCam.position.y = 1
    }

    this.prevTime = time
  }
}

export default FPCamera
