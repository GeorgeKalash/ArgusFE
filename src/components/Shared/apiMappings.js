import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'

export const COMBOBOX = 1

export const LOOKUP = 2

export const apiMappings = {
  0: {
    type: COMBOBOX,
    endpoint: SystemRepository.KeyValueStore,
    parameters: field => `_dataset=${field.data}&_language=1`,
    valueField: 'key',
    displayField: 'value'
  },
  20103: {
    type: COMBOBOX,
    endpoint: SystemRepository.Currency.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: 'reference',

    //displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  20109: {
    type: COMBOBOX,
    endpoint: SystemRepository.FiscalYears.qry,
    parameters: '',
    valueField: 'fiscalYear',
    displayField: 'fiscalYear'
  },
  31202: {
    type: LOOKUP,
    endpoint: CashBankRepository.CashAccount.snapshot,
    parameters: {
      _type: 0
    },
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  41103: {
    //Item Category
    type: COMBOBOX,
    endpoint: InventoryRepository.Category.qry,
    parameters: '_startAt=0&_pageSize=50&_name=',
    valueField: 'caRef',
    displayField: 'name'
  },
  41105: {
    //Item Group
    type: COMBOBOX,
    endpoint: InventoryRepository.Group.qry,
    parameters: '_startAt=0&_pageSize=50',
    valueField: 'reference',
    displayField: 'name'
  },
  41102: {
    //"Measurement Schedule"
    type: COMBOBOX,
    endpoint: InventoryRepository.Measurement.qry,
    parameters: '_startAt=0&_pageSize=50&_name=',
    valueField: 'reference',
    displayField: 'name'
  },
  42107: {
    //Production Line
    type: COMBOBOX,
    endpoint: ManufacturingRepository.ProductionLine.qry,
    parameters: '_filter=',
    valueField: 'reference',
    displayField: 'name'
  }
}
