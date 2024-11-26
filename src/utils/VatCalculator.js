const TAXBASE_POU = 1 // percentage of unit price
const TAXBASE_FAPQU = 2 // fixed amount per quantity of unit
const TAXBASE_FAPIUW = 3 // percentage of base price
const TAXBASE_PLP = 4 // percentage of labor price

class VatCalcRow {
  constructor(_basePrice, _qty, _extendedPrice, _baseLaborPrice, _tdPct, _taxDetails) {
    this.basePrice = _basePrice
    this.qty = _qty
    this.extendedPrice = _extendedPrice
    this.baseLaborPrice = _baseLaborPrice
    this.vatAmount = 0
    this.tdPct = _tdPct
    this.taxDetails = _taxDetails
  }
}

const calcVatAmountPerTaxDetail = (vatCalcRow, taxDetail) => {
  let vatAmount = 0

  switch (taxDetail.taxBase) {
    case TAXBASE_POU:
      if (vatCalcRow.tdPct == 0) {
        vatAmount = (vatCalcRow.extendedPrice * taxDetail.amount) / 100
      } else {
        const tdExtendedPrice = vatCalcRow.extendedPrice * (1 - vatCalcRow.tdPct / 100)
        vatAmount = (tdExtendedPrice * taxDetail.amount) / 100
      }
      break
    case TAXBASE_FAPQU:
      vatAmount = taxDetail.amount * vatCalcRow.qty
      break
    case TAXBASE_FAPIUW: // base price
      vatAmount = (vatCalcRow.basePrice * vatCalcRow.qty * taxDetail.amount) / 100
      break
    case TAXBASE_PLP:
      vatAmount = (vatCalcRow.baseLaborPrice * vatCalcRow.qty * taxDetail.amount) / 100
      break
    default:
      vatAmount = 0
      break
  }

  return vatAmount
}

const calcVatAmount = vatCalcRow => {
  let vatAmount = 0

  console.log('check values1 ', vatCalcRow)
  if (vatCalcRow.taxDetails != null) {
    for (let i = 0; i < vatCalcRow.taxDetails.length; i++) {
      vatAmount += calcVatAmountPerTaxDetail(vatCalcRow, vatCalcRow.taxDetails[i])
    }
  }

  return vatAmount
}

const getVatCalc = _vatCalcRow => {
  _vatCalcRow.vatAmount = calcVatAmount(_vatCalcRow)

  return _vatCalcRow
}

export { VatCalcRow, getVatCalc, TAXBASE_POU, TAXBASE_FAPQU, TAXBASE_FAPIUW, TAXBASE_PLP }
