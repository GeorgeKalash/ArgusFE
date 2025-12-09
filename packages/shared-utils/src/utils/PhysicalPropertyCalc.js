export const DirtyField = {
  LENGTH: 1,
  WIDTH: 2,
  DEPTH: 3,
  DIAMETER: 4,
  VOLUME: 5,
  WEIGHT: 6,
  DENSITY: 7
}

export const GeometricShape = {
  CUBIC: 1,
  CYLINDER: 2
}

class PhysicalPropertyCalculator {
  constructor() {
    this.dirtyField = null
    this.shape = null
    this.length = 0
    this.width = 0
    this.depth = 0
    this.diameter = 0
    this.volume = 0
    this.weight = 0
    this.density = 0
  }
}

export class PhysicalPropertyCalculatorCtrl {
  recalWeight(rec) {
    if (rec.density > 0) {
      rec.weight = parseFloat((rec.volume * rec.density).toFixed(2))
    }
  }

  recalVolume(rec) {
    if (rec.density > 0) {
      rec.volume = parseFloat((rec.weight / rec.density).toFixed(2))
    }
  }

  recalDensity(rec) {
    if (rec.volume > 0) {
      rec.density = parseFloat((rec.weight / rec.volume).toFixed(2))
    }
  }

  recalc(rec) {
    switch (rec.dirtyField) {
      case DirtyField.VOLUME:
        if (rec.weight > 0) {
          this.recalDensity(rec)
        } else if (rec.density > 0) {
          this.recalWeight(rec)
        }
        break
      case DirtyField.WEIGHT:
        if (rec.volume > 0) {
          this.recalDensity(rec)
        } else if (rec.density > 0) {
          this.recalVolume(rec)
        }
        break
      case DirtyField.DENSITY:
        if (rec.volume > 0) {
          this.recalWeight(rec)
        } else if (rec.weight > 0) {
          this.recalVolume(rec)
        }
        break
    }
  }

  get(keys) {
    const rec = new PhysicalPropertyCalculator()
    rec.dirtyField = keys[0]
    rec.shape = keys[1]
    rec.length = keys[2]
    rec.width = keys[3]
    rec.depth = keys[4]
    rec.diameter = keys[5]
    rec.volume = keys[6]
    rec.weight = keys[7]
    rec.density = keys[8]

    this.getRec(rec)

    return rec
  }

  getRec(rec) {
    switch (rec.dirtyField) {
      case DirtyField.DIAMETER:
      case DirtyField.LENGTH:
      case DirtyField.WIDTH:
      case DirtyField.DEPTH:
        if (rec.length > 0) {
          rec.dirtyField = DirtyField.VOLUME

          if (rec.shape === GeometricShape.CUBIC) {
            if (rec.width > 0 && rec.depth > 0) {
              rec.volume = parseFloat((rec.length * rec.width * rec.depth).toFixed(2))
            }
          } else if (rec.diameter > 0) {
            rec.volume = parseFloat((rec.length * Math.PI * Math.pow(rec.diameter / 2, 2)).toFixed(2))
          }
          this.recalc(rec)
        }
        break

      case DirtyField.VOLUME:
      case DirtyField.WEIGHT:
      case DirtyField.DENSITY:
        this.recalc(rec)
        break
    }
  }

  log(object, trxType) {
    console.log(`Logging: ${trxType}`, object)
  }
}
