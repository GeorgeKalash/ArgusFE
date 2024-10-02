const DIRTYFIELD_TDPLAIN = 1
const DIRTYFIELD_TDPCT = 2
const TYPECHANGE = 1

class DiscountCalculator {
  constructor(
    _tdAmount,
    _tdPlain,
    _tdPct,
    _tdType,
    _subtotal,
    _currentDiscount,
    _hiddenTdPct,
    _hiddenTdAmount,
    _typeChange
  ) {
    this.tdAmount = _tdAmount
    this.tdPlain = _tdPlain
    this.tdPct = _tdPct
    this.tdType = _tdType
    this.subtotal = _subtotal
    this.currentDiscount = _currentDiscount
    this.hiddenTdPct = _hiddenTdPct
    this.hiddenTdAmount = _hiddenTdAmount
    this.typeChange = _typeChange
  }
}

class FooterSummary {
  constructor(_totalQty, _totalWeight, _totalVolume, _totalUpo, _sumVat, _sumExtended, _tdAmount, _net, _miscAmount) {
    this.totalQty = _totalQty
    this.totalWeight = _totalWeight
    this.totalVolume = _totalVolume
    this.totalUpo = _totalUpo
    this.sumVat = _sumVat
    this.sumExtended = _sumExtended
    this.tdAmount = _tdAmount
    this.net = _net
    this.miscAmount = _miscAmount
  }
}

class FooterCalculator {
  constructor(_array, _footerSummary) {
    this.array = _array
    this.footerSummary = _footerSummary
  }
}

const returnFooterResults = _discountObj => {
  if (_discountObj.tdPct === true) {
    // If it's %
    if (_discountObj.tdAmount > 100) {
      // and > 100
      if (_discountObj.typeChange === TYPECHANGE) {
        // Changing from 123 to % it should become 0
        _discountObj.tdAmount = 0
      } else {
        // Staying in % it should not exceed 100 and be replaced by its old value
        _discountObj.tdAmount = _discountObj.currentDiscount
      }
    } else {
      // Current discount value will change
      _discountObj.currentDiscount = _discountObj.tdAmount
    }

    // Set tdPct = value field
    _discountObj.hiddenTdPct = _discountObj.tdAmount

    // Set tdAmount = subtotal * tdPct / 100
    const tdAmount = (_discountObj.subtotal * _discountObj.tdAmount) / 100
    _discountObj.hiddenTdAmount = tdAmount

    // Set tdType
    _discountObj.tdType = DIRTYFIELD_TDPCT
  } else {
    // If it's 123
    if (_discountObj.tdAmount > _discountObj.subtotal) {
      // and exceeds subtotal
      if (_discountObj.typeChange === TYPECHANGE) {
        // Changing from % to 123 it should become 0
        _discountObj.tdAmount = 0
      } else {
        // Staying in 123 it should not exceed subtotal and be replaced by its old value
        _discountObj.tdAmount = _discountObj.currentDiscount
      }
    } else {
      // Current discount value will change
      _discountObj.currentDiscount = _discountObj.tdAmount
      const tdpct = _discountObj.subtotal === 0 ? 0 : (_discountObj.tdAmount * 100) / _discountObj.subtotal
      _discountObj.hiddenTdPct = tdpct
      _discountObj.hiddenTdAmount = _discountObj.tdAmount
      _discountObj.tdType = DIRTYFIELD_TDPLAIN
    }
  }

  return _discountObj
}

const getDiscValues = _discountObj => {
  _discountObj = returnFooterResults(_discountObj)

  return _discountObj
}

const recalcFooter = (_array, _footerSummary) => {
  _array.forEach(item => {
    _footerSummary.totalQty += item.qty
    _footerSummary.totalWeight += item.qty * item.weight
    _footerSummary.totalVolume += item.qty * item.volume
    _footerSummary.totalUpo += item.upo
    _footerSummary.sumVat += item.vatAmount
  })
  console.log(
    'check values ',
    _footerSummary.sumExtended,
    _footerSummary.sumVat,
    _footerSummary.miscAmount,
    _footerSummary.tdAmount
  )
  _footerSummary.net =
    _footerSummary.sumExtended + _footerSummary.sumVat + _footerSummary.miscAmount - _footerSummary.tdAmount

  return _footerSummary
}

const getSubtotal = _array => {
  return _array.reduce((sum, item) => sum + item.extendedPrice, 0)
}

const getFooterTotals = (_array, _footerSummary) => {
  _footerSummary = recalcFooter(_array, _footerSummary)

  return _footerSummary
}

export { DiscountCalculator, FooterSummary, FooterCalculator, getDiscValues, getSubtotal, getFooterTotals }
