// ** MUI Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox, RadioGroup, Radio } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useError } from 'src/error'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { FormatLineSpacing } from '@mui/icons-material'
import ApprovalFormShell from 'src/components/Shared/ApprovalFormShell'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function CreditInvoiceForm({ _labels, maxAccess, recordId, setErrorMessage, expanded, plantId }) {
  const { height } = useWindowDimensions()
  const [isLoading, setIsLoading] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [currencyStore, setCurrencyStore] = useState([])
  const [rateType, setRateType] = useState(148)
  const [editMode, setEditMode] = useState(!!recordId)
  const { stack: stackError } = useError()
  const [toCurrency, setToCurrency] = useState(null)
  const [toCurrencyRef, setToCurrencyRef] = useState(null)
  const [baseCurrencyRef, setBaseCurrencyRef] = useState(null)

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    currencyId: '',
    date: new Date(),
    functionId: SystemFunction.CurrencyCreditOrderPurchase,
    reference: '',
    plantId: parseInt(plantId),
    corId: '',
    corRef: '',
    corName: '',
    wip: '',
    status: '',
    releaseStatus: '',
    notes: '',
    currencyId: '',
    amount: '',
    baseAmount: '',
    exRate: '',
    minRate: '',
    maxRate: '',
    rateCalcMethod: '',
    cashAccountId: '',
    cashAccountName: '',
    cashAccountRef: ''
  })
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CreditInvoice.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required('This field is required'),
      plantId: yup.string().required('This field is required'),
      corId: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      try {
        const copy = { ...obj }
        delete copy.rows
        copy.date = formatDateToApi(copy.date)

        // Default values for properties if they are empty
        copy.wip = copy.wip === '' ? 1 : copy.wip
        copy.status = copy.status === '' ? 1 : copy.status
        copy.amount = totalCUR
        copy.baseAmount = totalLoc

        const updatedRows = detailsFormik.values.rows.map((orderDetail, index) => {
          const seqNo = index + 1 // Adding 1 to make it 1-based index

          return {
            ...orderDetail,
            seqNo: seqNo,
            invoiceId: formik.values.recordId || 0
          }
        })

        if (updatedRows.length == 1 && updatedRows[0].currencyId == '') {
          throw new Error('Grid not filled. Please fill the grid before saving.')
        }

        const resultObject = {
          header: copy,
          items: updatedRows
        }

        const res = await postRequest({
          extension: CTTRXrepository.CreditInvoice.set,
          record: JSON.stringify(resultObject)
        })

        if (res.recordId) {
          toast.success('Record Updated Successfully')
          formik.setFieldValue('recordId', res.recordId)
          invalidate()
          setEditMode(true)

          const res2 = await getRequest({
            extension: CTTRXrepository.CreditInvoice.get,
            parameters: `_recordId=${res.recordId}`
          })
          formik.setFieldValue('reference', res2.record.reference)
        }
      } catch (error) {
        setErrorMessage(error)
      }
    }
  })

  const detailsFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          invoiceId: '',
          seqNo: '',
          currencyId: '',
          qty: '',
          rateCalcMethod: '',
          exRate: '',
          minRate: '',
          maxRate: '',
          amount: '',
          baseAmount: '',
          notes: ''
        }
      ]
    },
    validationSchema: yup.object({
      rows: yup.array().of(
        yup.object({
          currencyId: yup.string().required('This field is required'),
          qty: yup.string().required('This field is required'),
          exRate: yup.string().required('This field is required'),
          amount: yup.string().required('This field is required')
        })
      )
    })
  })

  const onClose = async () => {
    try {
      const obj = formik.values
      const copy = { ...obj }

      copy.date = formatDateToApi(copy.date)
      copy.wip = copy.wip === '' ? 1 : copy.wip
      copy.status = copy.status === '' ? 1 : copy.status
      copy.amount = totalCUR
      copy.baseAmount = totalLoc

      const res = await postRequest({
        extension: CTTRXrepository.CreditInvoice.close,
        record: JSON.stringify(copy)
      })
      if (res.recordId) {
        toast.success('Record Closed Successfully')
        setIsClosed(true)
      }
    } catch (error) {
      setErrorMessage(error)
    }
  }

  const totalCUR = detailsFormik.values.rows.reduce((curSum, row) => {
    // Parse amount as a number
    const curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

    return curSum + curValue
  }, 0)

  const totalLoc = detailsFormik.values.rows.reduce((locSum, row) => {
    // Parse amount as a number
    const locValue = parseFloat(row.baseAmount.toString().replace(/,/g, '')) || 0

    return locSum + locValue
  }, 0)

  const fillCurrencyStore = () => {
    try {
      var parameters = `_filter=`
      getRequest({
        extension: SystemRepository.Currency.qry,
        parameters: parameters
      }).then(res => {
        setCurrencyStore(res)
      })
    } catch (error) {
      setErrorMessage(error)
    }
  }

  const getCorrespondentById = async (recordId, baseCurrency, plant) => {
    if (recordId) {
      const _recordId = recordId
      const defaultParams = `_recordId=${_recordId}`
      var parameters = defaultParams

      getRequest({
        extension: RemittanceSettingsRepository.Correspondent.get,
        parameters: parameters
      }).then(res => {
        setToCurrency(res.record.currencyId)
        setToCurrencyRef(res.record.currencyRef)
        getEXMBase(plant, res.record.currencyId, baseCurrency, 150)
      })
    } else {
      setToCurrency(null)
      setToCurrencyRef(null)
    }
  }

  async function getEXMBase(plantId, currencyId, baseCurrency, rateType) {
    if (!plantId || !currencyId || !rateType || !baseCurrency) {
      if (!plantId) {
        stackError({
          message: `Plant Cannot Be Empty.`
        })
      }
      if (!currencyId) {
        stackError({
          message: `To Currency Cannot Be Empty.`
        })
      }
      if (!rateType) {
        stackError({
          message: `Rate type Cannot Be Empty.`
        })
      }
      if (!baseCurrency) {
        stackError({
          message: `From Currency Cannot Be Empty.`
        })
      }

      return
    }
    var parameters = `_plantId=${plantId}&_currencyId=${currencyId}&_raCurrencyId=${baseCurrency}&_rateTypeId=${rateType}`

    const res = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
      parameters: parameters
    })
    if (res) {
      formik.setFieldValue('currencyId', currencyId)
      formik.setFieldValue('exRate', res.record?.rate)
      formik.setFieldValue('rateCalcMethod', res.record?.rateCalcMethod)
      formik.setFieldValue('minRate', res.record?.minRate)
      formik.setFieldValue('maxRate', res.record?.maxRate)
    }
  }

  async function getEXMCur(obj) {
    for (const key in obj) {
      if (!obj[key]) {
        stackError({
          message: `${key} Cannot Be Empty.`
        })

        return
      }
    }
    var parameters = `_plantId=${obj.plantId}&_currencyId=${obj.fromCurrency}&_raCurrencyId=${obj.toCurrency}&_rateTypeId=${obj.rateType}`

    const res = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
      parameters: parameters
    })

    return res.record
  }

  const columns = [
    {
      field: 'combobox',
      header: _labels[8],
      name: 'currencyId',
      mandatory: true,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      disabled: formik?.values?.corId === '' || formik?.values?.corId === undefined || isClosed,
      widthDropDown: '200',
      fieldsToUpdate: [{ from: 'name', to: 'currencyName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' }
      ],
      width: 230,
      async onChange(row) {
        if (row?.newValue > 0) {
          const exchange = await getEXMCur({
            plantId: plantId ?? formik.values.plantId,
            toCurrency: toCurrency ?? '',
            fromCurrency: row.newValue ?? '',
            rateType: rateType ?? ''
          })

          const rate = exchange?.rate
          const rateCalcMethod = exchange?.rateCalcMethod

          if (row.rowData.qty != 0) {
            const qtyToCur =
              rateCalcMethod === 1
                ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) * rate
                : rateCalcMethod === 2
                ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) / rate
                : 0
            detailsFormik.setFieldValue(`rows[${row.rowIndex}].amount`, qtyToCur.toFixed(2))

            const curToBase =
              formik.values.rateCalcMethod === 1
                ? parseFloat(qtyToCur) * formik.values.exRate
                : rateCalcMethod === 2
                ? parseFloat(qtyToCur) / formik.values.exRate
                : 0
            detailsFormik.setFieldValue(`rows[${row.rowIndex}].baseAmount`, getFormattedNumber(curToBase.toFixed(2)))
          }
          detailsFormik.setFieldValue(
            `rows[${row.rowIndex}].exRate`,
            parseFloat(exchange?.rate.toString().replace(/,/g, '')).toFixed(5)
          )
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].currencyId`, row.newValue)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].minRate`, exchange?.minRate)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].maxRate`, exchange?.maxRate)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod`, exchange?.rateCalcMethod)
        } else {
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].currencyId`, '')
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].amount`, 0)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].qty`, 0)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].minRate`, 0)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].maxRate`, 0)
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].exRate`, '')
          detailsFormik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod`, 0)

          return
        }
      }
    },
    {
      field: 'textfield',
      header: _labels[9],
      name: 'currencyName',
      readOnly: true,
      width: 300,
      disabled: formik?.values?.corId === '' || formik?.values?.corId === undefined || isClosed
    },
    {
      field: 'numberfield',
      header: _labels[14],
      name: 'qty',
      mandatory: true,
      width: 200,
      disabled: formik?.values?.corId === '' || formik?.values?.corId === undefined || isClosed,
      async onChange(row) {
        const rate = row.rowData?.exRate
        const rateCalcMethod = row.rowData?.rateCalcMethod

        //     detailsFormik.setFieldValue(`rows[${row.rowIndex}].qty`, getFormattedNumber(row.value))

        detailsFormik.setFieldValue(
          `rows[${row.rowIndex}].qty`,
          getFormattedNumber(parseFloat(row.value.toString().replace(/,/g, '')).toFixed(2))
        )

        const qtyToCur =
          rateCalcMethod === 1
            ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) * rate
            : rateCalcMethod === 2
            ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) / rate
            : 0

        const curToBase =
          formik.values.rateCalcMethod === 1
            ? parseFloat(qtyToCur) * formik.values.exRate
            : rateCalcMethod === 2
            ? parseFloat(qtyToCur) / formik.values.exRate
            : 0
        detailsFormik.setFieldValue(`rows[${row.rowIndex}].amount`, getFormattedNumber(qtyToCur.toFixed(2)))
        detailsFormik.setFieldValue(`rows[${row.rowIndex}].baseAmount`, getFormattedNumber(curToBase.toFixed(2)))
      }
    },
    {
      field: 'numberfield',
      header: _labels[15],
      name: 'exRate',
      mandatory: true,
      width: 200,
      disabled: formik?.values?.corId === '' || formik?.values?.corId === undefined || isClosed,
      async onChange(row) {
        const nv = parseFloat(row.rowData.exRate.toString().replace(/,/g, ''))
        if (parseFloat(row.rowData.exRate.toString().replace(/,/g, '')) > 0) {
          const exchange = await getEXMCur({
            plantId: plantId ?? formik.values.plantId,
            toCurrency: toCurrency ?? '',
            fromCurrency: row.rowData.currencyId ?? '',
            rateType: rateType ?? ''
          })

          const minRate = parseFloat(exchange?.minRate.toString().replace(/,/g, ''))
          const maxRate = parseFloat(exchange?.maxRate.toString().replace(/,/g, ''))

          if (nv >= minRate && nv <= maxRate) {
            const rate = nv
            const rateCalcMethod = exchange?.rateCalcMethod

            const qtyToCur =
              rateCalcMethod === 1
                ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) * rate
                : rateCalcMethod === 2
                ? parseFloat(row.rowData.qty.toString().replace(/,/g, '')) / rate
                : 0

            const curToBase =
              formik.values.rateCalcMethod === 1
                ? parseFloat(qtyToCur) * formik.values.exRate
                : rateCalcMethod === 2
                ? parseFloat(qtyToCur) / formik.values.exRate
                : 0
            detailsFormik.setFieldValue(
              `rows[${row.rowIndex}].exRate`,
              parseFloat(row.value.toString().replace(/,/g, '')).toFixed(5)
            )
            detailsFormik.setFieldValue(`rows[${row.rowIndex}].amount`, getFormattedNumber(qtyToCur.toFixed(2)))
            detailsFormik.setFieldValue(`rows[${row.rowIndex}].baseAmount`, getFormattedNumber(curToBase.toFixed(2)))
          } else {
            stackError({
              message: `Rate not in the [${minRate}-${maxRate}] range.`
            })
            if (nv) {
              detailsFormik.setFieldValue(`rows[${row.rowIndex}].exRate`, '')
              detailsFormik.setFieldValue(`rows[${row.rowIndex}].amount`, 0)
              detailsFormik.setFieldValue(`rows[${row.rowIndex}].baseAmount`, 0)
            }
          }
        }
      }
    },
    {
      field: 'numberfield',
      header: `Total ${toCurrencyRef !== null ? toCurrencyRef : ''}`,
      name: 'amount',
      readOnly: true,
      mandatory: true,
      width: 200,
      disabled: formik?.values?.corId === '' || formik?.values?.corId === undefined || isClosed
    }
  ]

  const fillItemsGrid = invoiceId => {
    try {
      var parameters = `_invoiceId=${invoiceId}`
      getRequest({
        extension: CTTRXrepository.CreditInvoiceItem.qry,
        parameters: parameters
      }).then(res => {
        // Create a new list by modifying each object in res.list
        const modifiedList = res.list.map(item => ({
          ...item,
          qty: parseFloat(item.qty).toFixed(2),
          amount: parseFloat(item.amount).toFixed(2),
          baseAmount: parseFloat(item.baseAmount).toFixed(2),
          exRate: parseFloat(item.exRate).toFixed(5)
        }))

        detailsFormik.setValues({
          ...detailsFormik.values,
          rows: modifiedList
        })
      })
    } catch (error) {
      setErrorMessage(error)
    }
  }

  async function setOperationType(type) {
    if (type == SystemFunction.CurrencyCreditOrderPurchase || type == SystemFunction.CurrencyCreditOrderSale) {
      const res = await getRequest({
        extension: 'SY.asmx/getDE',
        parameters:
          type == SystemFunction.CurrencyCreditOrderPurchase
            ? '_key=ct_credit_purchase_ratetype_id'
            : type == SystemFunction.CurrencyCreditOrderSale
            ? '_key=ct_credit_sales_ratetype_id'
            : ''
      })
      setRateType(res.record.value)
      formik.setFieldValue('functionId', type)
    }
  }
  async function getBaseCurrency() {
    const res = await getRequest({
      extension: 'SY.asmx/getDE',
      parameters: '_key=baseCurrencyId'
    })
    if (res.record.value) {
      getBaseCurrencyRef(res.record.value)
    }

    return res.record.value ?? ''
  }

  const getBaseCurrencyRef = currencyId => {
    try {
      var parameters = `_recordId=${currencyId}`
      getRequest({
        extension: SystemRepository.Currency.get,
        parameters: parameters
      }).then(res => {
        setBaseCurrencyRef(res.record.reference)
      })
    } catch (error) {
      setErrorMessage(error)
    }
  }

  useEffect(() => {
    ;(async function () {
      try {
        fillCurrencyStore()
        if (recordId) {
          setIsLoading(true)
          fillItemsGrid(recordId)

          const res = await getRequest({
            extension: CTTRXrepository.CreditInvoice.get,
            parameters: `_recordId=${recordId}`
          })
          setIsClosed(res.record.wip === 2 ? true : false)
          res.record.date = formatDateFromApi(res.record.date)
          setOperationType(res.record.functionId)
          setInitialData(res.record)
          const baseCurrency = await getBaseCurrency()
          getCorrespondentById(res.record.corId ?? '', baseCurrency, res.record.plantId)
        }
      } catch (error) {
        //  setErrorMessage(error)
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height])
  console.log('editMode ', editMode)

  return (
    <ApprovalFormShell
      resourceId={ResourceIds.CreditInvoice}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      onClose={onClose}
      isClosed={isClosed}
      hiddenPost={true}
    >
      <Grid container>
        <Grid container xs={12} style={{ display: 'flex', marginTop: '10px' }}>
          {/* First Column */}
          <Grid item xs={3} style={{ marginRight: '10px' }}>
            <CustomDatePicker
              name='date'
              required
              readOnly={isClosed}
              label={_labels[2]}
              value={formik?.values?.date}
              onChange={formik.setFieldValue}
              maxAccess={maxAccess}
              onClear={() => formik.setFieldValue('date', '')}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
            />
          </Grid>

          {/* Second Column */}
          <Grid item style={{ marginRight: '10px', width: '420px' }}>
            <ResourceComboBox
              endpointId={SystemRepository.Plant.qry}
              name='plantId'
              label={_labels[3]}
              readOnly={true}
              values={formik.values}
              valueField='recordId'
              displayField={['reference', 'name']}
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('plantId', newValue?.recordId)
              }}
              error={formik.touched.plantId && Boolean(formik.errors.plantId)}
            />
          </Grid>

          {/* Third Column */}
          <Grid item style={{ marginRight: '10px', width: '190px' }}>
            <CustomTextField
              name='reference'
              label={_labels[4]}
              value={formik?.values?.reference}
              maxAccess={maxAccess}
              maxLength='30'
              readOnly={true}
              required
              error={formik.touched.reference && Boolean(formik.errors.reference)}
              helperText={formik.touched.reference && formik.errors.reference}
            />
          </Grid>
        </Grid>

        <Grid container xs={12}>
          {/* First Column */}
          <Grid container rowGap={1} xs={9} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={RemittanceSettingsRepository.Correspondent.qry}
                valueField='reference'
                displayField='name'
                name='corId'
                label={_labels[16]}
                form={formik}
                valueShow='corRef'
                secondValueShow='corName'
                readOnly={detailsFormik?.values?.rows[0]?.currencyId != '' ? true : false}
                onChange={async (event, newValue) => {
                  if (newValue) {
                    const baseCurrency = await getBaseCurrency()
                    getCorrespondentById(newValue?.recordId, baseCurrency, formik.values.plantId)
                    formik.setFieldValue('corId', newValue?.recordId)
                    formik.setFieldValue('corName', newValue?.name || '')
                    formik.setFieldValue('corRef', newValue?.reference || '')
                  } else {
                    formik.setFieldValue('corId', null)
                    formik.setFieldValue('corName', null)
                    formik.setFieldValue('corRef', null)
                  }
                }}
                errorCheck={'corId'}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={9} style={{ marginTop: '8px' }}>
          <ResourceLookup
            endpointId={CashBankRepository.CashAccount.snapshot}
            parameters={{
              _type: 0
            }}
            valueField='accountNo'
            displayField='name'
            name='cashAccountId'
            label={_labels[22]}
            form={formik}
            valueShow='cashAccountRef'
            secondValueShow='cashAccountName'
            readOnly={detailsFormik?.values?.rows[0]?.currencyId != '' ? true : false}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('cashAccountId', newValue?.recordId)
                formik.setFieldValue('cashAccountRef', newValue?.accountNo)
                formik.setFieldValue('cashAccountName', newValue?.name)
              } else {
                formik.setFieldValue('cashAccountId', null)
                formik.setFieldValue('cashAccountRef', null)
                formik.setFieldValue('cashAccountName', null)
              }
            }}
            errorCheck={'cashAccountId'}
          />
        </Grid>
        <Grid container xs={12}>
          <RadioGroup
            row
            value={formik.values.functionId}
            defaultValue={SystemFunction.CurrencyCreditOrderPurchase}
            onChange={e => setOperationType(e.target.value)}
          >
            <FormControlLabel
              value={SystemFunction.CurrencyCreditOrderPurchase}
              control={<Radio />}
              label={_labels[6]}
              disabled={detailsFormik?.values?.rows[0]?.currencyId != '' ? true : false}
            />
            <FormControlLabel
              value={SystemFunction.CurrencyCreditOrderSale}
              control={<Radio />}
              label={_labels[7]}
              disabled={detailsFormik?.values?.rows[0]?.currencyId != '' ? true : false}
            />
          </RadioGroup>
        </Grid>
        <Grid container sx={{ pt: 2 }} xs={12}>
          <Box sx={{ width: '100%' }}>
            <InlineEditGrid
              gridValidation={detailsFormik}
              columns={columns}
              background={
                formik.values.functionId &&
                (formik.values.functionId != SystemFunction.CurrencyCreditOrderPurchase
                  ? '#C7F6C7'
                  : 'rgb(245, 194, 193)')
              }
              defaultRow={{
                invoiceId: '',
                seqNo: '',
                currencyId: '',
                qty: '',
                rateCalcMethod: '',
                exRate: '',
                minRate: '',
                maxRate: '',
                amount: '',
                baseAmount: '',
                notes: ''
              }}
              allowDelete={true}
              allowAddNewLine={true}
              scrollable={true}
              scrollHeight={`${expanded ? height - 430 : 200}px`}
            />
          </Box>
        </Grid>
        <Grid
          container
          rowGap={1}
          xs={12}
          style={{ marginTop: '5px' }}
          sx={{ flexDirection: 'row', flexWrap: 'nowrap' }}
        >
          {/* First Column (moved to the left) */}
          <Grid container rowGap={1} xs={8} style={{ marginTop: '10px' }}>
            <CustomTextArea
              name='notes'
              label={_labels[11]}
              value={formik.values.notes}
              rows={3}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('notes', '')}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />
          </Grid>
          {/* Second Column  */}
          <Grid container rowGap={1} xs={4} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
            <Grid item xs={12}>
              <CustomTextField
                name='totalCUR'
                label={`Total ${toCurrencyRef !== null ? toCurrencyRef : ''}`}
                value={getFormattedNumber(totalCUR.toFixed(2))}
                numberField={true}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='baseAmount'
                label={`Total ${baseCurrencyRef !== null ? baseCurrencyRef : ''}`}
                style={{ textAlign: 'right' }}
                value={getFormattedNumber(totalLoc.toFixed(2))}
                numberField={true}
                readOnly={true}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ApprovalFormShell>
  )
}
