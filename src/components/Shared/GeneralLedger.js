import React from 'react'
import { useState, useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import { DataSets } from 'src/resources/DataSets'
import toast from 'react-hot-toast'
import { Module } from 'src/resources/Module'
import { RateDivision } from 'src/resources/RateDivision'
import Table from 'src/components/Shared/Table'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { DataGrid } from './DataGrid'
import { formatDateForGetApI, formatDateToApi } from 'src/lib/date-helper'
import { getRate, DIRTYFIELD_AMOUNT, DIRTYFIELD_BASE_AMOUNT, DIRTYFIELD_RATE } from 'src/utils/RateCalculator'
import { Grow } from './Layouts/Grow'
import { Fixed } from './Layouts/Fixed'
import { VertLayout } from './Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'

const GeneralLedger = ({ functionId, values, valuesPath, datasetId, onReset, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [formik, setformik] = useState(null)
  const [baseGridData, setBaseGridData] = useState({ credit: 0, debit: 0, balance: 0 })
  const [exRateValue, setExRateValue] = useState(null)
  const [currencyGridData, setCurrencyGridData] = useState([])
  const formValues = valuesPath ? valuesPath : values

  useSetWindow({ title: platformLabels.GeneralLedger, window })

  async function fetchGridData() {
    return await getRequest({
      extension: GeneralLedgerRepository.GeneralLedger.qry,
      parameters: `_functionId=${functionId}&_recordId=${formValues.recordId}`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    filter: {
      filterFn: fetchGridData,
      default: { functionId, recordId: formValues?.recordId }
    },
    DatasetIdAccess: datasetId,
    datasetId: ResourceIds.GeneralLedger
  })

  const { formik: formik2 } = useForm({
    maxAccess: access,
    initialValues: {
      recordId: formValues.recordId,
      reference: formValues.reference,
      date: formValues.date,
      functionId: functionId,
      seqNo: '',
      glTransactions: [
        {
          id: 1,
          accountRef: '',
          accountId: '',
          accountName: '',
          tpAccountId: '',
          tpAccountRef: '',
          tpAccountName: '',
          costCenterId: '',
          costCenterRef: '',
          costCenterName: '',
          currencyRef: '',
          currencyId: '',
          sign: '',
          signName: '',
          sourceReference: '',
          notes: '',
          functionId: functionId,
          exRate: '',
          amount: '',
          baseAmount: ''
        }
      ]
    },
    enableReinitialize: false,
    validationSchema: yup.object({
      glTransactions: yup
        .array()
        .of(
          yup.object().shape({
            accountRef: yup.string().required('accountRef recordId is required'),
            accountName: yup.string().required('currencyId recordId is required'),
            accountRef: yup.string().required('currencyId recordId is required'),

            currencyRef: yup.string().required('currencyId recordId is required'),
            signName: yup.string().required('currencyId recordId is required'),
            amount: yup.number().required('currencyId recordId is required'),
            baseAmount: yup.number().required('currencyId recordId is required'),
            exRate: yup.number().required('currencyId recordId is required')
          })
        )
        .required('glTransactions array is required')
    }),
    validateOnChange: true,
    onSubmit: async values => {
      {
        const data = {
          transactions: values.glTransactions.map(({ id, tpAccount, functionId, ...rest }) => ({
            seqNo: id,
            ...rest
          })),
          editStatus: values?.editStatus,
          date: formatDateToApi(values.date),
          functionId: values.functionId,
          recordId: formValues.recordId,
          reference: values.reference
        }

        await postRequest({
          extension: GeneralLedgerRepository.GeneralLedger.set2,
          record: JSON.stringify(data)
        }).then(res => {
          toast.success('Record Added Successfully')
        })
      }
    }
  })

  useEffect(() => {
    if (formValues) {
      setformik(formValues)
    }
  }, [formValues])

  const isProcessed = formValues.status == 3

  useEffect(() => {
    if (formik2 && formik2.values && formik2.values.glTransactions && Array.isArray(formik2.values.glTransactions)) {
      const generalAccountData = formik2.values.glTransactions

      const parseNumber = value => {
        const number = parseFloat(value)

        return isNaN(number) ? 0 : number
      }

      const baseCreditAmount = generalAccountData.reduce((acc, curr) => {
        return curr.sign == '2' ? acc + parseNumber(curr.baseAmount) : acc
      }, 0)
      const baseCredit = parseFloat(baseCreditAmount).toFixed(2)

      const baseDebitAmount = generalAccountData.reduce((acc, curr) => {
        return curr.sign == '1' ? acc + parseNumber(curr.baseAmount) : acc
      }, 0)
      const baseDebit = parseFloat(baseDebitAmount).toFixed(2)

      const baseBalance = parseFloat((baseDebit - baseCredit).toFixed(2))
      setBaseGridData({
        base: 'Base',
        credit: baseCredit,
        debit: baseDebit,
        balance: baseBalance
      })

      const currencyTotals = generalAccountData.reduce((acc, curr) => {
        if (curr.currencyId) {
          const currency = curr.currencyRef

          if (currency) {
            if (!acc[currency]) {
              acc[currency] = { credit: 0, debit: 0 }
            }
            if (curr.sign) {
              if (curr.sign == '2') {
                acc[currency].credit += parseFloat(curr.amount || 0)
              } else if (curr.sign == '1') {
                acc[currency].debit += parseFloat(curr.amount || 0)
              }
            }
          }
        }

        return acc
      }, {})

      const filteredCurrencyTotals = Object.entries(currencyTotals).reduce((acc, [currency, data]) => {
        if (currency) {
          acc[currency] = data
        }

        return acc
      }, {})

      const currencyData = Object.entries(filteredCurrencyTotals).map(([currency, { credit, debit }]) => ({
        currency,
        credit: credit.toLocaleString(),
        debit: debit.toLocaleString(),
        balance: (debit - credit).toLocaleString()
      }))

      setCurrencyGridData(currencyData)
    }
  }, [formik2?.values])

  useEffect(() => {
    if (data && data?.list?.length > 0 && Array.isArray(data?.list)) {
      const glTransactions = data.list.map((row, idx) => ({
        id: idx,
        accountRef: row.accountRef,
        accountId: row.accountId,
        accountName: row.accountName,
        tpAccountRef: row.tpAccountRef,
        tpAccountName: row.tpAccountName,
        tpAccountId: row.tpAccountId,
        costCenterId: row.costCenterId,
        costCenterRef: row.costCenterRef,
        costCenterName: row.costCenterName,
        currencyRef: row.currencyRef,
        currencyId: row.currencyId,

        sign: row.sign,
        signName: row.signName,
        sourceReference: row.sourceReference,
        notes: row.notes,
        exRate: row.exRate,
        rateCalcMethod: row.rateCalcMethod,
        amount: row.amount,
        baseAmount: row.baseAmount
      }))

      formik2.setFieldValue('glTransactions', glTransactions)
    }
  }, [data])

  // useEffect(() => {
  //   async function fetchCurrencyExchangeRate() {
  //     if (formValues.currencyId) {
  //         const res = await getCurrencyApi(formValues.currencyId)
  //         if (res && res.record) {
  //           setExRateValue(res.record.exRate)
  //         }
  //         console.error('Failed to fetch currency exchange rate:', error)
  //       }
  //     }
  //   }

  //   fetchCurrencyExchangeRate()
  // }, [formValues])

  const getRateDivision = functionId => {
    const sysFct = getSystemFunctionModule(functionId)
    if (
      sysFct === Module.GeneralLedger ||
      sysFct === Module.Financials ||
      sysFct === Module.Cash ||
      sysFct === Module.Remittance ||
      sysFct === Module.CurrencyTrading
    ) {
      return RateDivision.FINANCIALS
    } else if (sysFct === Module.Sales) {
      return RateDivision.SALES
    } else if (sysFct === Module.Purchase) {
      return RateDivision.PURCHASE
    } else if (sysFct === Module.Manufacturing) {
      return RateDivision.MANUFACTURING
    } else {
      return 0
    }
  }

  const getSystemFunctionModule = functionId => {
    return Math.floor(functionId / 100)
  }

  async function getCurrencyApi(_currencyId) {
    const _rateDivision = getRateDivision(functionId)

    const response = await getRequest({
      extension: MultiCurrencyRepository.Currency.get,
      parameters: `_currencyId=${_currencyId}&_date=${formatDateForGetApI(
        formValues.date
      )}&_rateDivision=${_rateDivision}`
    })

    return response
  }

  const actions = [
    {
      key: 'Reset',
      condition: onReset,
      onClick: async () => {
        await onReset()
        window.close()
      },
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.JournalVoucher}
      form={formik2}
      maxAccess={access}
      disabledSubmit={baseGridData.balance !== 0 || isProcessed}
      infoVisible={false}
      previewReport={true}
      actions={actions}
    >
      <VertLayout>
        {formik && (
          <Fixed>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name='reference'
                  label={_labels.reference}
                  value={formik.reference}
                  readOnly={true}
                  maxAccess={access}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomDatePicker
                  name='date'
                  label={_labels.date}
                  value={formik.date}
                  readOnly={true}
                  maxAccess={access}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name='currency'
                  label={_labels.currency}
                  value={formik.currencyRef}
                  readOnly={true}
                  maxAccess={access}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  name='notes'
                  label={_labels.notes}
                  value={formik.notes}
                  readOnly={true}
                  maxAccess={access}
                />
              </Grid>
            </Grid>
          </Fixed>
        )}
        <Grow>
          <DataGrid
            onChange={value => {
              formik2.setFieldValue('glTransactions', value)
              formik2.setFieldValue('editStatus', 2)
            }}
            allowDelete={!isProcessed}
            allowAddNewLine={!isProcessed}
            value={formik2?.values.glTransactions}
            error={formik2?.errors.glTransactions}
            name='glTransactions'
            height={400}
            maxAccess={access}
            columns={[
              {
                component: 'resourcelookup',
                label: _labels.accountRef,
                name: 'accountRef',
                props: {
                  displayFieldWidth: 3,
                  endpointId: GeneralLedgerRepository.Account.snapshot,
                  parameters: '_type=',
                  valueField: 'recordId',
                  displayField: 'accountRef',
                  readOnly: isProcessed,

                  columnsInDropDown: [
                    { key: 'accountRef', value: 'reference' },
                    { key: 'name', value: 'name' }
                  ],
                  mapping: [
                    { from: 'recordId', to: 'accountId' },
                    { from: 'name', to: 'accountName' },
                    { from: 'accountRef', to: 'accountRef' }
                  ]
                },

                async onChange({ row: { update, oldRow, newRow } }) {
                  if (newRow.accountId) {
                    update({
                      currencyRef: formValues.currencyRef,
                      currencyId: formValues.currencyId,
                      exRate: exRateValue
                    })

                    if (formValues.currencyId) {
                      const result = await getCurrencyApi(formValues.currencyId)

                      const result2 = result?.record
                      const exRate = result2?.exRate
                      const rateCalcMethod = result2?.rateCalcMethod

                      const updatedRateRow = getRate({
                        amount: newRow?.amount,
                        exRate: exRate,
                        baseAmount: newRow?.baseAmount,
                        rateCalcMethod: rateCalcMethod,
                        dirtyField: DIRTYFIELD_RATE
                      })
                      update({
                        exRate: updatedRateRow.exRate,
                        amount: updatedRateRow.amount,
                        baseAmount: updatedRateRow.baseAmount
                      })
                    }
                  }
                }
              },
              {
                component: 'textfield',
                label: _labels.accountName,
                name: 'accountName',
                props: {
                  readOnly: true
                }
              },
              {
                component: 'resourcelookup',
                label: _labels.thirdPartyRef,
                name: 'tpAccountRef',
                props: {
                  endpointId: FinancialRepository.Account.snapshot,
                  valueField: 'recordId',
                  displayField: 'reference',
                  displayFieldWidth: 3,
                  readOnly: isProcessed,
                  columnsInDropDown: [
                    { key: 'reference', value: 'reference' },
                    { key: 'name', value: 'name' }
                  ],
                  mapping: [
                    { from: 'name', to: 'tpAccountName' },
                    { from: 'reference', to: 'tpAccountRef' },
                    { from: 'recordId', to: 'tpAccountId' }
                  ]
                }
              },
              {
                component: 'textfield',
                label: _labels.thirdPartyName,
                props: {
                  readOnly: true
                },
                name: 'tpAccountName'
              },
              {
                component: 'resourcelookup',
                label: _labels.costRef,
                name: 'costCenterRef',

                props: {
                  endpointId: GeneralLedgerRepository.CostCenter.snapshot,
                  valueField: 'recordId',
                  readOnly: isProcessed,
                  displayField: 'reference',
                  displayFieldWidth: 3,
                  columnsInDropDown: [
                    { key: 'reference', value: 'reference' },
                    { key: 'name', value: 'name' }
                  ],
                  mapping: [
                    { from: 'name', to: 'costCenterName' },
                    { from: 'reference', to: 'costCenterRef' },
                    { from: 'recordId', to: 'costCenterId' }
                  ]
                }
              },
              {
                component: 'textfield',
                label: _labels.costName,
                props: {
                  readOnly: true
                },
                name: 'costCenterName'
              },
              {
                component: 'resourcecombobox',
                label: _labels.currency,
                name: 'currencyRef',
                props: {
                  endpointId: SystemRepository.Currency.qry,
                  displayField: 'reference',
                  readOnly: isProcessed,
                  valueField: 'recordId',
                  mapping: [
                    { from: 'reference', to: 'currencyRef' },
                    { from: 'recordId', to: 'currencyId' }
                  ]
                },

                async onChange({ row: { update, oldRow, newRow } }) {
                  if (!newRow?.currencyId) {
                    return
                  }

                  const result = await getCurrencyApi(newRow?.currencyId)
                  const result2 = result?.record
                  const exRate = result2?.exRate
                  const rateCalcMethod = result2?.rateCalcMethod

                  if (newRow?.amount) {
                    const amount =
                      rateCalcMethod === 1
                        ? parseFloat(newRow.amount.toString().replace(/,/g, '')) * exRate
                        : rateCalcMethod === 2
                        ? parseFloat(newRow.amount.toString().replace(/,/g, '')) / exRate
                        : 0
                    update({
                      baseAmount: amount
                    })
                  }

                  update({
                    currencyId: newRow.currencyId,
                    exRate: exRate,
                    rateCalcMethod: rateCalcMethod
                  })
                }
              },
              {
                component: 'resourcecombobox',
                label: _labels.sign,
                name: 'signName',
                props: {
                  datasetId: DataSets.Sign,
                  readOnly: isProcessed,
                  displayField: 'value',
                  valueField: 'key',
                  mapping: [
                    { from: 'value', to: 'signName' },
                    { from: 'key', to: 'sign' }
                  ]
                }
              },
              {
                component: 'textfield',
                label: _labels.sourceReference,
                name: 'sourceReference',
                props: {
                  maxLength: 20,
                  readOnly: isProcessed
                }
              },
              {
                component: 'textfield',
                label: _labels.notes,
                name: 'notes',
                props: {
                  readOnly: isProcessed
                }
              },
              {
                component: 'numberfield',
                label: _labels.exRate,
                props: {
                  readOnly: isProcessed
                },
                name: 'exRate',
                async onChange({ row: { update, oldRow, newRow } }) {
                  const updatedRateRow = getRate({
                    amount: newRow?.amount,
                    exRate: newRow?.exRate,
                    baseAmount: newRow?.baseAmount,
                    rateCalcMethod: newRow?.rateCalcMethod,
                    dirtyField: DIRTYFIELD_RATE
                  })
                  update({
                    amount: updatedRateRow.amount,
                    baseAmount: updatedRateRow.baseAmount
                  })
                }
              },
              {
                component: 'numberfield',
                label: _labels.amount,
                props: {
                  readOnly: isProcessed
                },
                name: 'amount',
                async onChange({ row: { update, oldRow, newRow } }) {
                  const updatedRateRow = getRate({
                    amount: newRow?.amount,
                    exRate: newRow?.exRate,
                    baseAmount: newRow?.baseAmount,
                    rateCalcMethod: newRow?.rateCalcMethod,
                    dirtyField: DIRTYFIELD_AMOUNT
                  })
                  update({
                    exRate: updatedRateRow.exRate,
                    baseAmount: updatedRateRow.baseAmount
                  })
                }
              },
              {
                component: 'numberfield',
                label: _labels.baseAmount,
                props: {
                  readOnly: isProcessed
                },
                name: 'baseAmount',
                async onChange({ row: { update, oldRow, newRow } }) {
                  const updatedRateRow = getRate({
                    amount: newRow?.amount,
                    exRate: newRow?.exRate,
                    baseAmount: newRow?.baseAmount,
                    rateCalcMethod: newRow?.rateCalcMethod,
                    dirtyField: DIRTYFIELD_BASE_AMOUNT
                  })
                  update({
                    exRate: updatedRateRow.exRate,
                    amount: updatedRateRow.amount
                  })
                }
              }
            ]}
          />
        </Grow>
        <Fixed>
          <Grid container sx={{ flex: 1 }}>
            <Grid item xs={6} height={190} sx={{ display: 'flex', flex: 1 }}>
              <Table
                gridData={{ count: 1, list: [baseGridData] }}
                maxAccess={access}
                columns={[
                  { field: 'base', headerName: _labels.base, flex: 1 },
                  { field: 'credit', headerName: _labels.credit, type: 'number', flex: 1 },
                  { field: 'debit', headerName: _labels.debit, type: 'number', flex: 1 },
                  { field: 'balance', headerName: _labels.balance, type: 'number', flex: 1 }
                ]}
                rowId={['seqNo']}
                pagination={false}
              />
            </Grid>
            <Grid item xs={6} height={190} sx={{ display: 'flex', flex: 1 }}>
              <Table
                name='generalLedger'
                columns={[
                  { field: 'currency', headerName: 'Currency', flex: 1 },
                  { field: 'debit', headerName: 'Debit', type: 'number', flex: 1 },
                  { field: 'credit', headerName: 'Credit', type: 'number', flex: 1 },
                  { field: 'balance', headerName: 'Balance', type: 'number', flex: 1 }
                ]}
                gridData={{ count: currencyGridData.length, list: currencyGridData }}
                rowId={['recordId']}
                paginationType='client'
                maxAccess={access}
                pagination={false}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

GeneralLedger.width = 1000
GeneralLedger.height = 620

export default GeneralLedger
