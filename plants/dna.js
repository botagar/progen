let RNG = require('random-seed')

class DNA {
  constructor (dnaSequence) {
    this.RNG = RNG.create('Seed')
    this.dnaSequence = dnaSequence
    if (!dnaSequence) this.dnaSequence = this.RNG.string(1024) //Returns a pseudo-random string of 'count' printable characters ranging from chr(33) to chr(126) inclusive.
    console.info(`DNA: ${this.dnaSequence}`)
  }
}

export default DNA
