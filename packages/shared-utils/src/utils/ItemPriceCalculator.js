const PRICETYPE_UNIT = 1
const PRICETYPE_UNIT_VOLUME = 2
const PRICETYPE_UNIT_WEIGHT = 3
const DIRTYFIELD_BASE_PRICE = 1
const DIRTYFIELD_UNIT_PRICE = 2
const DIRTYFIELD_QTY = 3
const DIRTYFIELD_EXTENDED_PRICE = 4
const DIRTYFIELD_UPO = 5
const DIRTYFIELD_MDAMOUNT = 6
const DIRTYFIELD_MDTYPE = 7
const DIRTYFIELD_BASE_LABOR_PRICE = 8
const DIRTYFIELD_TWPG = 9
const DIRTYFIELD_TD = 10
const MDTYPE_PCT = 1
const MDTYPE_AMOUNT = 2

class ItemPriceRow {
  constructor(
    _priceType,
    _basePrice,
    _volume,
    _weight,
    _unitPrice,
    _upo,
    _qty,
    _extendedPrice,
    _mdAmount,
    _mdType,
    _baseLaborPrice,
    _totalWeightPerG,
    _mdValue,
    _tdPct,
    _dirtyField
  ) {
    this.priceType = _priceType
    this.basePrice = _basePrice
    this.volume = _volume
    this.weight = _weight
    this.unitPrice = _unitPrice
    this.upo = _upo
    this.qty = _qty
    this.extendedPrice = _extendedPrice
    this.mdAmount = _mdAmount
    this.mdType = _mdType
    this.baseLaborPrice = _baseLaborPrice
    this.totalWeightPerG = _totalWeightPerG
    this.mdValue = _mdValue
    this.tdPct = _tdPct
    this.dirtyField = _dirtyField
  }
}

const logIPR = itemPriceRow => {
  console.log('priceType ' + itemPriceRow.priceType)
  console.log('basePrice ' + itemPriceRow.basePrice)
  console.log('baseLaborPrice ' + itemPriceRow.baseLaborPrice)
  console.log('volume ' + itemPriceRow.volume)
  console.log('unitPrice ' + itemPriceRow.unitPrice)
  console.log('upo ' + itemPriceRow.upo)
  console.log('qty ' + itemPriceRow.qty)
  console.log('extendedPrice ' + itemPriceRow.extendedPrice)
  console.log('mdAmount ' + itemPriceRow.mdAmount)
  console.log('mdType ' + itemPriceRow.mdType)
  console.log('mdValue ' + itemPriceRow.mdValue)
  console.log('dirtyField ' + itemPriceRow.dirtyField)
}

const recalcBasePrice = row => {
  switch (row.priceType) {
    case PRICETYPE_UNIT:
      row.basePrice = row.unitPrice - row.baseLaborPrice
      break
    case PRICETYPE_UNIT_VOLUME:
      row.basePrice = row.unitPrice / row.volume
      break
    case PRICETYPE_UNIT_WEIGHT:
      row.basePrice = row.unitPrice / row.weight - row.baseLaborPrice
      break
  }
  row.totalWeightPerG = row.basePrice + row.baseLaborPrice

  return row
}

const recalcBaseLaborPrice = row => {
  row.baseLaborPrice =
    row.unitPrice /
      (row.priceType === PRICETYPE_UNIT_WEIGHT
        ? row.weight
        : row.priceType === PRICETYPE_UNIT_VOLUME
        ? row.volume
        : 1) -
    row.basePrice
  row.totalWeightPerG = row.basePrice + row.baseLaborPrice

  return row
}

const calcExtendedPrice = row => {
  if (row.mdAmount === 0 || row.mdType !== MDTYPE_PCT) {
    row.mdValue = row.mdAmount

    return (row.unitPrice - row.mdAmount + row.upo) * row.qty
  }

  row.mdValue = (row.unitPrice * row.mdAmount) / 100

  return (row.unitPrice - row.mdValue + row.upo) * row.qty
}

const recalcExtendedPrice = row => {
  row.extendedPrice = calcExtendedPrice(row)

  return row
}

const verifyItemPrice = row => {
  const suggestedExtendedPrice = calcExtendedPrice(row)
  const delta = Math.abs(suggestedExtendedPrice - row.extendedPrice)

  if (delta > 0.01) {
    alert(
      'INVOICE_LINE_PRICE_ERROR ExtendedPrice / ' +
        row.unitPrice +
        '/' +
        row.qty +
        '/' +
        row.extendedPrice +
        '/' +
        suggestedExtendedPrice
    )
  }

  if (row.priceType === PRICETYPE_UNIT_VOLUME) {
    if (row.volume === 0) alert('ITEM_VOLUME_NOT_SPECIFIED')
    if (row.baseLaborPrice !== 0 && row.basePrice !== 0) {
      let suggestedUnitPrice = (row.baseLaborPrice + row.basePrice) * row.volume
      const deltaUnit = Math.abs(suggestedUnitPrice - row.unitPrice)
      if (deltaUnit > 0.01) {
        alert('INVOICE_LINE_PRICE_ERROR UnitPrice-volume ' + row.basePrice + '/' + row.volume + '/' + row.unitPrice)
      }
    }
  } else if (row.priceType === PRICETYPE_UNIT_WEIGHT) {
    if (row.weight === 0) alert('ITEM_WEIGHT_NOT_SPECIFIED')
    if (row.baseLaborPrice !== 0 && row.basePrice !== 0) {
      let suggestedUnitPrice = (row.baseLaborPrice + row.basePrice) * row.weight
      const deltaUnit = Math.abs(suggestedUnitPrice - row.unitPrice)
      if (deltaUnit > 0.01) {
        alert(
          'INVOICE_LINE_PRICE_ERROR UnitPrice-weight ' +
            row.basePrice +
            '/' +
            row.weight +
            '/' +
            row.unitPrice +
            '/' +
            suggestedUnitPrice
        )
      }
    }
  } else {
    if (row.baseLaborPrice !== 0 && row.basePrice !== 0) {
      let suggestedUnitPrice = row.basePrice + row.baseLaborPrice
      const deltaUnit = Math.abs(suggestedUnitPrice - row.unitPrice)
      if (deltaUnit > 0.01) {
        alert(
          'INVOICE_LINE_PRICE_ERROR UnitPrice-quantity ' +
            row.basePrice +
            '/' +
            row.unitPrice +
            '/' +
            suggestedUnitPrice
        )
      }
    }
  }
}

const recalcItemPrice = row => {
  console.log(row)
  switch (row.dirtyField) {
    case DIRTYFIELD_TWPG:
      row.baseLaborPrice = row.totalWeightPerG - row.basePrice

    case DIRTYFIELD_BASE_LABOR_PRICE:
    case DIRTYFIELD_BASE_PRICE:
      row.unitPrice =
        (row.basePrice + row.baseLaborPrice) *
        (row.priceType === PRICETYPE_UNIT_WEIGHT
          ? row.weight
          : row.priceType === PRICETYPE_UNIT_VOLUME
          ? row.volume
          : 1)
      row.totalWeightPerG = row.basePrice + row.baseLaborPrice
      row = recalcExtendedPrice(row)
      break
    case DIRTYFIELD_QTY:
      row = recalcExtendedPrice(row)
      break
    case DIRTYFIELD_UNIT_PRICE:
      if (row.baseLaborPrice != 0) {
        row = recalcBaseLaborPrice(row)
      } else if (row.basePrice != 0) {
        row = recalcBasePrice(row)
      }
      row = recalcExtendedPrice(row)
      break
    case DIRTYFIELD_UPO:
    case DIRTYFIELD_MDAMOUNT:
    case DIRTYFIELD_MDTYPE:
      row = recalcExtendedPrice(row)
      break
    case DIRTYFIELD_EXTENDED_PRICE:
      if (row.qty !== 0) {
        if (row.mdAmount === 0) {
          row.unitPrice = row.extendedPrice / row.qty - row.upo
          if (row.baseLaborPrice !== 0) {
            row = recalcBaseLaborPrice(row)
          } else if (row.basePrice !== 0) {
            row = recalcBasePrice(row)
          }
          row.totalWeightPerG = row.basePrice + row.baseLaborPrice
        } else {
          row.mdValue = row.unitPrice + row.upo - row.extendedPrice / row.qty
          if (row.mdType !== MDTYPE_PCT) {
            row.mdAmount = row.mdValue
          } else {
            row.mdAmount = row.unitPrice === 0 ? 0 : (100 * row.mdValue) / row.unitPrice
          }
        }
      }
      break
    case DIRTYFIELD_TD:
      row = recalcExtendedPrice(row)
      break
    default:
      alert("I don't know such dirtyField " + row.dirtyField)
  }

  return row
}

const getIPR = row => {
  console.log('check row ', row)
  if (row.priceType === PRICETYPE_UNIT_VOLUME && row.volume === 0) {
    alert('item volume not defined')
  }
  row = recalcItemPrice(row)
  verifyItemPrice(row)

  return row
}

export {
  ItemPriceRow,
  getIPR,
  PRICETYPE_UNIT,
  PRICETYPE_UNIT_VOLUME,
  PRICETYPE_UNIT_WEIGHT,
  DIRTYFIELD_BASE_PRICE,
  DIRTYFIELD_UNIT_PRICE,
  DIRTYFIELD_QTY,
  DIRTYFIELD_EXTENDED_PRICE,
  DIRTYFIELD_UPO,
  DIRTYFIELD_MDAMOUNT,
  DIRTYFIELD_MDTYPE,
  DIRTYFIELD_BASE_LABOR_PRICE,
  DIRTYFIELD_TWPG,
  DIRTYFIELD_TD,
  MDTYPE_PCT,
  MDTYPE_AMOUNT
}
