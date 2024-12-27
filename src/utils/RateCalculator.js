const DIRTYFIELD_AMOUNT = 1
const DIRTYFIELD_RATE = 2
const DIRTYFIELD_BASE_AMOUNT = 3
const DIRTYFIELD_BASE_AMOUNT_MCR = 4

const MULTIPLY = 1
const DIVIDE = 2

class RateCalculator {
  constructor(_amount, _exRate, _baseAmount, _rateCalcMethod, _dirtyField) {
    this.amount = _amount
    this.exRate = _exRate
    this.baseAmount = _baseAmount
    this.rateCalcMethod = _rateCalcMethod
    this.dirtyField = _dirtyField
  }
}

function log(rateRow) {
  console.log(rateRow)

  //   console.log('amount ' + rateRow.amount)
  //   console.log('exRate ' + rateRow.exRate)
  //   console.log('baseAmount ' + rateRow.baseAmount)
  //   console.log('rateCalcMethod ' + rateRow.rateCalcMethod)
  //   console.log('dirtyField ' + rateRow.dirtyField)
}

function recalcAmount(rateRow) {
  if (rateRow.exRate == 0) return rateRow

  if (rateRow.rateCalcMethod == MULTIPLY) rateRow.amount = rateRow.baseAmount / rateRow.exRate
  else rateRow.amount = rateRow.baseAmount * rateRow.exRate

  return rateRow
}

function recalcBaseAmount(rateRow) {
  if (rateRow.exRate == 0) return rateRow

  if (rateRow.rateCalcMethod == MULTIPLY) rateRow.baseAmount = rateRow.amount * rateRow.exRate
  else rateRow.baseAmount = rateRow.amount / rateRow.exRate

  return rateRow
}

function recalcExRate(rateRow) {
  console.log(rateRow)
  if (rateRow.amount == 0) return rateRow

  if (rateRow.rateCalcMethod == MULTIPLY) rateRow.exRate = rateRow.baseAmount / rateRow.amount
  else rateRow.exRate = rateRow.baseAmount * rateRow.amount

  return rateRow
}

function verifyRateCalc(rateRow) {
  var suggested = recalcBaseAmount(rateRow)
  var delta = Math.abs(suggested.baseAmount - rateRow.baseAmount)
  if (delta > 0.01) console.error('LINE_RATE_ERROR ' + suggested.baseAmount + ' vs ' + rateRow.baseAmount)
}

function recalcRateCalc(rateRow) {
  switch (rateRow.dirtyField) {
    case DIRTYFIELD_AMOUNT:
      if (rateRow.exRate == 0) rateRow = recalcExRate(rateRow)
      else rateRow = recalcBaseAmount(rateRow)
      break
    case DIRTYFIELD_RATE:
      if (rateRow.amount == 0) rateRow = recalcAmount(rateRow)
      else rateRow = recalcBaseAmount(rateRow)
      break
    case DIRTYFIELD_BASE_AMOUNT:
      if (rateRow.exRate == 0) rateRow = recalcExRate(rateRow)
      else rateRow = recalcAmount(rateRow)
      break
    case DIRTYFIELD_BASE_AMOUNT_MCR:
      if (rateRow.baseAmount !== 0) rateRow = recalcExRate(rateRow)
      break;
    default:
      console.error("I don't know such dirty Field " + rateRow.dirtyField)
  }

  return rateRow
}

function getRate(_rateRow) {
  _rateRow = recalcRateCalc(_rateRow)
  verifyRateCalc(_rateRow)
  log(_rateRow)

  return _rateRow
}

export { RateCalculator, getRate, DIRTYFIELD_AMOUNT, DIRTYFIELD_RATE, DIRTYFIELD_BASE_AMOUNT, DIRTYFIELD_BASE_AMOUNT_MCR, MULTIPLY, DIVIDE }
