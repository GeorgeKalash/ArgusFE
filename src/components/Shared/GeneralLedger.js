import React from 'react'
import { createContext, useState, useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'

import { Module } from 'src/resources/Module'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Windows

// ** Helpers
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { DataGrid } from './DataGrid'
import { column } from 'stylis'
import { useFormik } from 'formik'
import { AuthContext } from 'src/providers/AuthContext'

import { formatDateDefault, formatDateFromApi, formatDateToApi, formatDateToApiFunction } from 'src/lib/date-helper'

const GeneralLedger = ({ labels, recordId, functionId, formValues, maxAccess, height, expanded }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [formik, setformik] = useState(null)
  const { user, setUser } = useContext(AuthContext)
  const [baseGridData, setBaseGridData] = useState({ credit: 0, debit: 0, balance: 0 })
  const [exRateValue, setExRateValue] = useState(null)
  const [currencyGridData, setCurrencyGridData] = useState([])

  //states

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: GeneralLedgerRepository.GeneralLedger.qry,
      parameters: `_functionId=${functionId}&_recordId=${formValues.recordId}`
    })
  }

  const [initialValues, setInitialData] = useState({
    recordId: formValues.recordId,
    reference: formValues.reference,
    date: formValues.date,
    functionId: functionId,
    seqNo: '',

    generalAccount: [
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
        notes: '',
        functionId: functionId,
        exRate: '',
        amount: '',
        baseAmount: ''
      }
    ]
  })

  // const generalAccountItemSchema = yup.object().shape({
  //   account: yup
  //     .object()
  //     .shape({
  //       recordId: yup.string().required('Account ID is required')
  //     })
  //     .required('Account is required'),
  //   accountName: yup.string().required('Account name is required'),
  //   accountRef: yup.string().required('Account name is required'),
  //   currency: yup
  //     .object()
  //     .shape({
  //       recordId: yup.string().required('Currency ID is required')
  //     })
  //     .required('Currency is required'),
  //   sign: yup
  //     .object()
  //     .shape({
  //       key: yup.string().required('Sign key is required')
  //     })
  //     .required('Sign is required'),
  //   exRate: yup.number().positive('Exchange rate must be positive').required('Exchange rate is required'),
  //   amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  //   baseAmount: yup.number().positive('Base amount must be positive').required('Base amount is required')
  // })

  // const formikValidationSchema = yup.object().shape({
  //   generalAccount: yup.array().of(generalAccountItemSchema).required('General account entries are required')
  // })

  const formik2 = useFormik({
    initialValues,
    enableReinitialize: true,

    validationSchema: yup.object({
      generalAccount: yup
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
        .required('generalAccount array is required')
    }),
    validateOnChange: true,
    onSubmit: async values => {
      {
        console.log('recordId', formik2.values.recordId)
        console.log('general', values.generalAccount)

        const data = {
          transactions: values.generalAccount.map(({ id, exRate, tpAccount, functionId, ...rest }) => ({
            seqNo: id,

            exRate,

            functionId,
            rateCalcMethod: 1,

            ...rest
          })),
          date: formatDateToApi(values.date),
          functionId: values.functionId,
          recordId: formValues.recordId,
          reference: values.reference
        }

        console.log('Submitting data:', data)

        const response = await postRequest({
          extension: GeneralLedgerRepository.GeneralLedger.set2,
          record: JSON.stringify(data)
        })

        console.log('Submission response:', response)

        toast.success('Record Added Successfully')
      }
    }
  })

  useEffect(() => {
    if (formValues) {
      setformik(formValues)
    }
  }, [formValues])

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,

    datasetId: ResourceIds.GeneralLedger
  })

  useEffect(() => {
    if (formik2 && formik2.values && formik2.values.generalAccount && Array.isArray(formik2.values.generalAccount)) {
      const generalAccountData = formik2.values.generalAccount

      console.log(generalAccountData)

      const parseNumber = value => {
        const number = parseFloat(value)

        return isNaN(number) ? 0 : number
      }

      const baseCredit = generalAccountData.reduce((acc, curr) => {
        return curr.signName === 'C' ? acc + parseNumber(curr.baseAmount) : acc
      }, 0)

      const baseDebit = generalAccountData.reduce((acc, curr) => {
        return curr.signName === 'D' ? acc + parseNumber(curr.baseAmount) : acc
      }, 0)

      const baseBalance = baseDebit - baseCredit

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
            // Check if currency is selected
            if (!acc[currency]) {
              acc[currency] = { credit: 0, debit: 0 }
            }
            if (curr.sign) {
              if (curr.signName == 'C') {
                acc[currency].credit += parseFloat(curr.amount || 0)
              } else if (curr.signName == 'D') {
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
        credit: credit.toLocaleString(), // Format the number with commas
        debit: debit.toLocaleString(), // Format the number with commas
        balance: (debit - credit).toLocaleString() // Format the number with commas
      }))

      setCurrencyGridData(currencyData)
    }
  }, [formik2.values])

  console.log('formik2', formik2)

  useEffect(() => {
    if (data && data.list.length > 0 && Array.isArray(data.list)) {
      const generalAccount = data.list.map((row, idx) => ({
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
        notes: row.notes,
        exRate: row.exRate,
        amount: row.amount,
        baseAmount: row.baseAmount
      }))

      formik2.setFieldValue('generalAccount', generalAccount)
    }
  }, [data])

  useEffect(() => {
    async function fetchCurrencyExchangeRate() {
      if (formValues.currencyId) {
        console.log('formm', formValues.currencyId)
        try {
          const res = await getCurrencyApi(formValues.currencyId)
          if (res && res.record) {
            console.log('XXXXXXXXXXXXXXXXXXXXX', res.record.exRate)
            setExRateValue(res.record.exRate)
            console.log('exrateVVVVVVVVV', exRateValue)
          }
        } catch (error) {
          console.error('Failed to fetch currency exchange rate:', error)
        }
      }
    }

    fetchCurrencyExchangeRate()
  }, [formValues])

  const RateDivision = {
    FINANCIALS: 1,
    SALES: 2,
    PURCHASE: 3,
    MANUFACTURING: 4
  }

  // Function to get rate division
  // console.log('idddddddddd',functionId)

  const getRateDivision = functionId => {
    const sysFct = getSystemFunctionModule(functionId)
    if (
      sysFct === Module.GeneralLedger ||
      sysFct === Module.Financials ||
      sysFct === Module.Manufacturing ||
      sysFct === Module.Cash
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

  // Function to get system function module

  const getSystemFunctionModule = functionId => {
    return Math.floor(functionId / 100)
  }

  function getCurrencyApi(_currencyId) {
    const _rateDivision = getRateDivision(functionId)

    console.log('ratde', _rateDivision)

    return getRequest({
      extension: MultiCurrencyRepository.Currency.get,
      parameters: `_currencyId=${_currencyId}&_date=${formatDateToApiFunction(
        formValues.date
      )}&_rateDivision=${_rateDivision}`
    })
  }

  return (
    <FormShell
      resourceId={ResourceIds.GeneralLedger}
      form={formik2}
      maxAccess={maxAccess}
      disabledSubmit={baseGridData.balance !== 0}
    >
      <Box>
        {formik && (
          <Grid container spacing={2} padding={1}>
            <Grid item xs={12} sm={6}>
              <CustomTextField name='reference' label={_labels.reference} value={formik.reference} readOnly={true} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomDatePicker name='date' label={_labels.date} value={formik.date} readOnly={true} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField name='currency' label={_labels.currency} value={formik.currencyRef} readOnly={true} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField name='notes' label={_labels.notes} value={formik.notes} readOnly={true} />
            </Grid>
          </Grid>
        )}
        {/* <Table
            columns={columns}
            gridData={data}
            rowId={['seqNo']}
            isLoading={false}
            pageSize={50}
            paginationType='client'
            maxAccess={access}
            height={"280"}
            pagination={false}
          /> */}

        <DataGrid
          onChange={value => formik2.setFieldValue('generalAccount', value)}
          value={formik2.values.generalAccount}
          error={formik2.errors.generalAccount}
          height={`${expanded ? `calc(100vh - 400px)` : `${height - 250}px`}`}
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

                  if (newRow.currencyId) {
                    const result = await getCurrencyApi(newRow?.currencyId)

                    const result2 = result.record
                    const exRate = exRateValue
                    const rateCalcMethod = result2.rateCalcMethod

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
                      exRate: exRate,
                      rateCalcMethod: rateCalcMethod
                    })
                  }
                }
              }
            },
            {
              component: 'textfield',
              label: _labels.accountName,
              name: 'accountName'
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
              name: 'tpAccountName'
            },
            {
              component: 'resourcelookup',
              label: 'costcenter',
              name: 'costCenterRef',
              props: {
                endpointId: GeneralLedgerRepository.CostCenter.snapshot,
                valueField: 'recordId',
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
              label: 'costCenterName',
              name: 'costCenterName'
            },
            {
              component: 'resourcecombobox',
              label: _labels.currency,
              name: 'currencyRef',
              props: {
                endpointId: SystemRepository.Currency.qry,
                displayField: 'reference',
                valueField: 'recordId',
                mapping: [
                  { from: 'reference', to: 'currencyRef' },
                  { from: 'recordId', to: 'currencyId' }
                ]
              },

              async onChange({ row: { update, oldRow, newRow } }) {
                console.log('newRow', newRow)

                if (!newRow?.currencyId) {
                  return
                }
                if (newRow.currencyId) {
                  const result = await getCurrencyApi(newRow?.currencyId)
                  const result2 = result.record
                  const exRate = result2.exRate
                  const rateCalcMethod = result2.rateCalcMethod

                  // account amount base amount sign curency

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
              }
            },
            {
              component: 'resourcecombobox',
              label: _labels.sign,
              name: 'signName',
              props: {
                endpointId: SystemRepository.KeyValueStore,
                _language: user.languageId,
                parameters: `_dataset=${157}&_language=${1}`,
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
              label: _labels.notes,
              name: 'notes'
            },
            {
              component: 'numberfield',
              label: _labels.exRate,
              name: 'exRate'
            },
            {
              component: 'numberfield',
              label: _labels.amount,
              name: 'amount',

              async onChange({ row: { update, oldRow, newRow } }) {
                console.log('newRow222', newRow)
                if (!newRow?.amount) {
                  return
                }

                if (newRow?.amount && newRow?.exRate) {
                  const amount =
                    newRow.rateCalcMethod === 1
                      ? parseFloat(newRow.amount.toString().replace(/,/g, '')) * newRow?.exRate
                      : newRow.rateCalcMethod === 2
                      ? parseFloat(newRow.amount.toString().replace(/,/g, '')) / newRow?.exRate
                      : 0
                  update({
                    baseAmount: amount
                  })
                }
              }
            },
            {
              component: 'numberfield',
              label: _labels.baseAmount,
              name: 'baseAmount'
            }
          ]}
        />

        <Grid container marginTop={3.7}>
          <Grid xs={6}>
            <Box
              paddingInlineEnd={2}
              sx={{
                width: '25.9rem',
                overflow: 'hidden',
                marginLeft: '3rem'
              }}
            >
              <Table
                gridData={{ count: 1, list: [baseGridData] }}
                maxAccess={access}
                height={'150'}
                columns={[
                  { field: 'base', headerName: _labels.base },
                  { field: 'credit', headerName: _labels.credit, align: 'right' },
                  { field: 'debit', headerName: _labels.debit, align: 'right' },
                  { field: 'balance', headerName: _labels.balance, align: 'right' }
                ]}
                rowId={['seqNo']}
                pagination={false}
              />
            </Box>
          </Grid>
          <Grid xs={6}>
            <Box
              paddingInlineStart={2}
              sx={{
                width: '26rem',
                overflow: 'hidden',
                position: 'relative',
                marginLeft: '1rem'
              }}
            >
              <Table
                pagination={false}
                gridData={{ count: currencyGridData.length, list: currencyGridData }}
                columns={[
                  { field: 'currency', headerName: 'Currency' },
                  { field: 'debit', headerName: 'Debit', align: 'right' },
                  { field: 'credit', headerName: 'Credit', align: 'right' },
                  { field: 'balance', headerName: 'Balance', align: 'right' }
                ]}
                height={'150'}
                rowId={['currency']}
                maxAccess={access}
              />
            </Box>
          </Grid>
        </Grid>
        <GridToolbar maxAccess={access} />
      </Box>
    </FormShell>
  )
}

export default GeneralLedger
