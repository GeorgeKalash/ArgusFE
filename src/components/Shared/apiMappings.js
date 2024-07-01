import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
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
    displayField: 'name'
  },
  20109: {
    type: COMBOBOX,
    endpoint: SystemRepository.FiscalYears.qry,
    parameters: '_filter=',
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
    valueField: 'recordId',
    displayField: 'name'
  },
  41102: {
    //"Measurement Schedule"
    type: COMBOBOX,
    endpoint: InventoryRepository.Measurement.qry,
    parameters: '_startAt=0&_pageSize=50&_name=',
    valueField: 'recordId',
    displayField: 'name'
  },
  42107: {
    //Production Line
    type: COMBOBOX,
    endpoint: ManufacturingRepository.ProductionLine.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: 'name'
  },
  31201: {
    type: LOOKUP,
    endpoint: FinancialRepository.Account.snapshot,
    parameters: {
      _type: 0
    },
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  20104: {
    type: COMBOBOX,
    endpoint: SystemRepository.DocumentType.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: 'name',

    // displayField: ['reference', 'name'],
    displayField: 'name',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  20110: {
    type: COMBOBOX,
    endpoint: SystemRepository.Plant.qry,
    parameters: '_filter=',
    valueField: 'recordId',

    // displayField: ['reference', 'name'],
    displayField: 'name',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  20107: {
    type: COMBOBOX,
    endpoint: SystemRepository.State.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: 'name'
  },
  20125: {
    type: LOOKUP,
    endpoint: SystemRepository.City.snapshot,
    parameters: {
      _type: 0
    },
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name'
  },
  21101: {
    type: COMBOBOX,
    endpoint: BusinessPartnerRepository.Group.qry,
    parameters: '_filter=',
    valueField: 'recordId',

    // displayField: ['reference', 'name'],
    displayField: 'name',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  23101: {
    type: COMBOBOX,
    endpoint: SystemRepository.Users.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['fullName', 'email'],
    columnsInDropDown: [
      { key: 'fullName', value: 'Full Name' },
      { key: 'email', value: 'Email' }
    ]
  },
  30103: {
    type: COMBOBOX,
    endpoint: GeneralLedgerRepository.GLAccountGroups.qry,
    parameters: '_filter=',
    valueField: 'recordId',

    // displayField: ['reference', 'name'],
    displayField: 'name',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  30107: {
    type: COMBOBOX,
    endpoint: GeneralLedgerRepository.CostCenter.qry,
    parameters: '_filter=',
    valueField: 'recordId',

    // displayField: ['reference', 'name'],
    displayField: 'name',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  30201: {
    type: LOOKUP,
    endpoint: SystemRepository.City.snapshot,
    parameters: {
      _type: 0
    },
    valueField: 'accountRef',
    valueOnSelection: 'recordId',
    displayField: 'name',
    displayFieldWidth: 2,
    firstFieldWidth: '40%'
  },
  31101: {
    type: COMBOBOX,
    endpoint: FinancialRepository.Group.qry,
    parameters: '_filter=',
    valueField: 'recordId',

    // displayField: ['reference', 'name'],
    displayField: 'name',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  32101: {
    type: COMBOBOX,
    endpoint: MultiCurrencyRepository.ExchangeTable.qry,
    parameters: '_filter=',
    valueField: 'recordId',

    // displayField: ['reference', 'name'],
    displayField: 'name',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  20123: {
    type: COMBOBOX,
    endpoint: SystemRepository.PlantGroup.qry,
    parameters: '_filter=',
    valueField: 'recordId',

    // displayField: ['reference', 'name'],
    displayField: 'name',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  40201: {
    type: COMBOBOX,
    endpoint: LogisticsRepository.LoCarrier.qry,
    parameters: '_filter=',
    valueField: 'recordId',

    // displayField: ['reference', 'name'],
    displayField: 'name',
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  }
}
