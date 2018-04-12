
class AngleGenerator {
  newRandomAngleInRadians() {
    this.angle = Math.random() * (2 * Math.PI)
    this.angleType = 'radians'
    return this
  }

  scaledBetween(lowerBound, upperBound) {
    if (this.angleType === 'radians') {
      let maxAllowedRange = upperBound - lowerBound
      let scale = maxAllowedRange / (2 * Math.PI)
      this.angle = (this.angle * scale) - lowerBound
    }
    return this
  }

  withRotationOffset(rotation) {
    if (this.angleType === 'radians') {
      this.angle = this.angle + rotation
    }
    return this
  }

  mirrorAcrossYWithProbability(chance) {
    let doFlip = Math.random() < chance ? true : false
    if (doFlip) {
      this.angle = Math.PI - this.angle
    }
    return this
  }

  generate() {
    return this.angle
  }
}

module.exports = {
  AngleGenerator
}