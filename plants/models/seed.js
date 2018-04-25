import Node from './node'

class Seed {
  constructor(dna, energy) {
    super()
    this.dna = dna
    this.energy = energy

    this.stem = null
    this.root = null
  }
}

export default Seed
