import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

export const COMBOBOX = 1

export const LOOKUP = 2

export const apiMappings = {
  0: {
    type: COMBOBOX
  },
  [ResourceIds.NumberRange]: {
    type: COMBOBOX,
    endpoint: SystemRepository.Currency.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.FiscalYears]: {
    type: COMBOBOX,
    endpoint: SystemRepository.FiscalYears.qry,
    parameters: '_filter=',
    valueField: 'fiscalYear',
    displayField: 'fiscalYear'
  },
  [ResourceIds.CashAccount]: {
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
  [ResourceIds.Category]: {
    //Item Category
    type: COMBOBOX,
    endpoint: InventoryRepository.Category.qry,
    parameters: '_startAt=0&_pageSize=50&_name=',
    valueField: 'caRef',
    displayField: 'name'
  },
  [ResourceIds.InventoryGroup]: {
    //Item Group
    type: COMBOBOX,
    endpoint: InventoryRepository.Group.qry,
    parameters: '_startAt=0&_pageSize=50',
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.Measurement]: {
    //"Measurement Schedule"
    type: COMBOBOX,
    endpoint: InventoryRepository.Measurement.qry,
    parameters: '_startAt=0&_pageSize=50&_name=',
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.ProductionLines]: {
    //Production Line
    type: COMBOBOX,
    endpoint: ManufacturingRepository.ProductionLine.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.Accounts]: {
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
  [ResourceIds.DocumentTypes]: {
    type: COMBOBOX,
    endpoint: SystemRepository.DocumentType.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: 'name',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Plants]: {
    type: COMBOBOX,
    endpoint: SystemRepository.Plant.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.States]: {
    type: COMBOBOX,
    endpoint: SystemRepository.State.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.Cities]: {
    type: LOOKUP,
    endpoint: SystemRepository.City.snapshot,
    parameters: {
      _type: 0
    },
    valueField: 'reference',
    valueOnSelection: 'recordId',
    displayField: 'name'
  },
  [ResourceIds.Groups]: {
    type: COMBOBOX,
    endpoint: BusinessPartnerRepository.Group.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.Users]: {
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
  [ResourceIds.GLAccountGroups]: {
    type: COMBOBOX,
    endpoint: GeneralLedgerRepository.GLAccountGroups.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.CostCenter]: {
    type: COMBOBOX,
    endpoint: GeneralLedgerRepository.CostCenter.qry,
    parameters: `_params=&_startAt=0&_pageSize=200`,
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ChartOfAccounts]: {
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
  [ResourceIds.FlAccountGroups]: {
    type: COMBOBOX,
    endpoint: FinancialRepository.Group.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.ExchangeTables]: {
    type: COMBOBOX,
    endpoint: MultiCurrencyRepository.ExchangeTable.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.PlantGroups]: {
    type: COMBOBOX,
    endpoint: SystemRepository.PlantGroup.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  },
  [ResourceIds.LoCarriers]: {
    type: COMBOBOX,
    endpoint: LogisticsRepository.LoCarrier.qry,
    parameters: '_filter=',
    valueField: 'recordId',
    displayField: ['reference', 'name'],
    columnsInDropDown: [
      { key: 'reference', value: 'Reference' },
      { key: 'name', value: 'Name' }
    ]
  }
}
