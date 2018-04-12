class DNA {
  constructor(dnaSequence) {
    this.dnaSequence = dnaSequence
    if (!dnaSequence) this.dnaSequence = ""
  }
}

module.exports = {
  DNA
}