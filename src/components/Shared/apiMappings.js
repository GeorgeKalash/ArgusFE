import { CashBankRepository } from 'src/repositories/CashBankRepository'
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
  }
}
