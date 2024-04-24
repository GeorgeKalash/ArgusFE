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
import CustomLookup from 'src/components/Inputs/CustomLookup'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useWindow } from 'src/windows'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { DataGrid } from 'src/components/Shared/DataGrid'

export default function CreditInvoiceForm({ _labels, maxAccess, recordId, expanded, plantId, userData }) {
  const { height } = useWindowDimensions()
  const [isLoading, setIsLoading] = useState(false)
  const [isPosted, setIsPosted] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [currencyStore, setCurrencyStore] = useState([])
  const [rateType, setRateType] = useState(148)
  const [editMode, setEditMode] = useState(!!recordId)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const [toCurrency, setToCurrency] = useState(null)
  const [toCurrencyRef, setToCurrencyRef] = useState(null)
  const [baseCurrencyRef, setBaseCurrencyRef] = useState(null)

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    currencyId: '',
    date: new Date(),
    dtId: '',
    functionId: SystemFunction.CreditInvoicePurchase,
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
    endpointId: CTTRXrepository.CreditInvoice.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required('This field is required'),
      plantId: yup.string().required('This field is required'),
      corId: yup.string().required('This field is required'),
      cashAccountId: yup.string().required('This field is required')
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
          setEditMode(true)

          const res2 = await getRequest({
            extension: CTTRXrepository.CreditInvoice.get,
            parameters: `_recordId=${res.recordId}`
          })
          formik.setFieldValue('reference', res2.record.reference)
          invalidate()
        }
      } catch (error) {}
    }
  })

  const detailsFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          id: 1,
          invoiceId: '',
          seqNo: '',
          currencyId: '',
          qty: '',
          rateCalcMethod: '',
          exRate: '',
          defaultRate: '',
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

  const totalCUR = detailsFormik.values.rows.reduce((curSum, row) => {
    // Parse amount as a number
    const curValue = parseFloat(row?.amount?.toString().replace(/,/g, '')) || 0

    return curSum + curValue
  }, 0)

  const totalLoc = detailsFormik.values.rows.reduce((locSum, row) => {
    // Parse amount as a number
    const locValue = parseFloat(row?.baseAmount?.toString().replace(/,/g, '')) || 0

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
    } catch (error) {}
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

  const getDefaultDT = async functionId => {
    const parameters = `_userId=${userData && userData.userId}&_functionId=${functionId}`

    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: parameters
      })
      if (res.record) {
        formik.setFieldValue('dtId', res.record.dtId)
      } else {
        formik.setFieldValue('dtId', '')
      }
    } catch (error) {
      formik.setFieldValue('dtId', '')
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
      component: 'resourcecombobox',
      label: _labels.currency,
      name: 'currencyRef',
      props: {
        endpointId: SystemRepository.Currency.qry,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'currencyId' },
          { from: 'reference', to: 'currencyRef' },
          { from: 'name', to: 'currencyName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3,
        disabled: formik?.values?.corId === '' || formik?.values?.corId === null || formik?.values?.corId === undefined
      },
      updateOn: 'blur',
      widthDropDown: '400',
      width: 150,
      async onChange({ row: { update, oldRow, newRow } }) {
        if (!newRow?.currencyId) {
          return
        }

        const exchange = await getEXMCur({
          plantId: plantId ?? formik.values.plantId,
          toCurrency: toCurrency ?? '',
          fromCurrency: newRow?.currencyId ?? '',
          rateType: rateType ?? ''
        })
        if (!exchange?.rate) {
          update({
            exRate: 0,
            defaultRate: 0,
            amount: 0,
            baseAmount: 0
          })
          stackError({
            message: `Rate not defined for ${newRow?.currencyRef}.`
          })

          return
        }

        const rate = exchange?.rate
        const rateCalcMethod = exchange?.rateCalcMethod
        if (newRow.qty) {
          const qtyToCur =
            rateCalcMethod === 1
              ? parseFloat(newRow.qty.toString().replace(/,/g, '')) * rate
              : rateCalcMethod === 2
              ? parseFloat(newRow.qty.toString().replace(/,/g, '')) / rate
              : 0
          update({ amount: qtyToCur.toFixed(2) })

          const curToBase =
            formik.values.rateCalcMethod === 1
              ? parseFloat(qtyToCur) * formik.values.exRate
              : rateCalcMethod === 2
              ? parseFloat(qtyToCur) / formik.values.exRate
              : 0
          update({ baseAmount: getFormattedNumber(curToBase.toFixed(2)) })
        }

        update({
          currencyId: exchange?.currencyId,
          currencyName: exchange?.currencyName,
          exRate: parseFloat(exchange?.rate.toString().replace(/,/g, '')).toFixed(5),
          defaultRate: parseFloat(exchange?.rate.toString().replace(/,/g, '')).toFixed(5),
          rateCalcMethod: exchange?.rateCalcMethod,
          minRate: exchange?.minRate,
          maxRate: exchange?.maxRate
        })
      }
    },
    {
      component: 'textfield',
      label: _labels.name,
      name: 'currencyName',
      props: {
        readOnly: true,
        disabled: formik?.values?.corId === '' || formik?.values?.corId === null || formik?.values?.corId === undefined
      },
      width: 190
    },
    {
      component: 'numberfield',
      label: _labels.quantity,
      name: 'qty',
      props: {
        mandatory: true,
        disabled: formik?.values?.corId === '' || formik?.values?.corId === null || formik?.values?.corId === undefined
      },
      width: 130,
      async onChange({ row: { update, newRow } }) {
        const rate = newRow.exRate
        const rateCalcMethod = newRow.rateCalcMethod
        update({
          qty: getFormattedNumber(parseFloat(newRow.qty.toString().replace(/,/g, '')).toFixed(2))
        })

        const qtyToCur =
          rateCalcMethod === 1
            ? parseFloat(newRow.qty.toString().replace(/,/g, '')) * rate
            : rateCalcMethod === 2
            ? parseFloat(newRow.qty.toString().replace(/,/g, '')) / rate
            : 0

        const curToBase =
          formik.values.rateCalcMethod === 1
            ? parseFloat(qtyToCur) * formik.values.exRate
            : rateCalcMethod === 2
            ? parseFloat(qtyToCur) / formik.values.exRate
            : 0
        update({
          amount: getFormattedNumber(qtyToCur.toFixed(2)),
          baseAmount: getFormattedNumber(curToBase.toFixed(2))
        })
      }
    },
    {
      component: 'numberfield',
      label: _labels.defaultRate,
      name: 'defaultRate',
      props: {
        readOnly: true,
        mandatory: true,
        disabled: formik?.values?.corId === '' || formik?.values?.corId === null || formik?.values?.corId === undefined
      },
      width: 130
    },
    {
      component: 'numberfield',
      label: _labels.exRate,
      name: 'exRate',
      props: {
        mandatory: true,
        disabled: formik?.values?.corId === '' || formik?.values?.corId === null || formik?.values?.corId === undefined
      },
      updateOn: 'blur',
      width: 130,
      async onChange({ row: { update, newRow } }) {
        if (!newRow.exRate) {
          update({
            exRate: '',
            defaultRate: '',
            amount: 0,
            baseAmount: 0
          })

          return
        }
        const nv = parseFloat(newRow.exRate.toString().replace(/,/g, ''))
        if (parseFloat(newRow.exRate.toString().replace(/,/g, '')) > 0) {
          const minRate = parseFloat(newRow.minRate.toString().replace(/,/g, ''))
          const maxRate = parseFloat(newRow.maxRate.toString().replace(/,/g, ''))
          if (nv >= minRate && nv <= maxRate) {
            const rate = nv
            const rateCalcMethod = newRow.rateCalcMethod

            const qtyToCur =
              rateCalcMethod === 1
                ? parseFloat(newRow.qty.toString().replace(/,/g, '')) * rate
                : rateCalcMethod === 2
                ? parseFloat(newRow.qty.toString().replace(/,/g, '')) / rate
                : 0

            const curToBase =
              formik.values.rateCalcMethod === 1
                ? parseFloat(qtyToCur) * formik.values.exRate
                : rateCalcMethod === 2
                ? parseFloat(qtyToCur) / formik.values.exRate
                : 0
            update({
              exRate: parseFloat(newRow.exRate.toString().replace(/,/g, '')).toFixed(5),
              defaultRate: parseFloat(newRow.exRate.toString().replace(/,/g, '')).toFixed(5),
              amount: getFormattedNumber(qtyToCur.toFixed(2)),
              baseAmount: getFormattedNumber(curToBase.toFixed(2))
            })
          } else {
            stackError({
              message: `Rate not in the [${minRate}-${maxRate}] range.`
            })
            if (nv) {
              update({
                exRate: '',
                defaultRate: '',
                amount: 0,
                baseAmount: 0
              })
            }
          }
        }
      }
    },
    {
      component: 'numberfield',
      label: `Total ${toCurrencyRef !== null ? toCurrencyRef : ''}`,
      name: 'amount',
      props: {
        readOnly: true,
        mandatory: true,
        disabled: formik?.values?.corId === '' || formik?.values?.corId === null || formik?.values?.corId === undefined
      },
      width: 130
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
        const modifiedList = res.list.map((item, index) => ({
          ...item,
          id: index + 1,
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
    } catch (error) {}
  }

  async function setOperationType(type) {
    if (type == SystemFunction.CreditInvoicePurchase || type == SystemFunction.CreditInvoiceSales) {
      const res = await getRequest({
        extension: 'SY.asmx/getDE',
        parameters:
          type == SystemFunction.CreditInvoicePurchase
            ? '_key=ct_credit_purchase_ratetype_id'
            : type == SystemFunction.CreditInvoiceSales
            ? '_key=ct_credit_sales_ratetype_id'
            : ''
      })
      setRateType(res.record.value)
      formik.setFieldValue('functionId', type)
      getDefaultDT(type)
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
    } catch (error) {}
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
          res.record.date = formatDateFromApi(res.record.date)
          setOperationType(res.record.functionId)
          setInitialData(res.record)
          const baseCurrency = await getBaseCurrency()
          getCorrespondentById(res.record.corId ?? '', baseCurrency, res.record.plantId)
          setIsPosted(res.record.status === 3 ? true : false)
          setIsCancelled(res.record.status === -1 ? true : false)
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height])

  const onPost = async () => {
    const obj = formik.values
    obj.date = formatDateToApi(obj.date)

    const res = await postRequest({
      extension: CTTRXrepository.CreditInvoice.post,
      record: JSON.stringify(obj)
    })

    if (res?.recordId) {
      toast.success('Record Posted Successfully')
      invalidate()

      const res = await getRequest({
        extension: CTTRXrepository.CreditInvoice.get,
        parameters: `_recordId=${recordId}`
      })
      res.record.date = formatDateFromApi(res.record.date)
      setInitialData(res.record)

      setIsPosted(res.record.status === 3 ? true : false)
      setIsCancelled(res.record.status === -1 ? true : false)
    }
  }

  const onCancel = async () => {
    const obj = formik.values
    obj.date = formatDateToApi(obj.date)

    const res = await postRequest({
      extension: CTTRXrepository.CreditInvoice.cancel,
      record: JSON.stringify(obj)
    })

    if (res?.recordId) {
      toast.success('Record Cancelled Successfully')
      invalidate()

      const res = await getRequest({
        extension: CTTRXrepository.CreditInvoice.get,
        parameters: `_recordId=${recordId}`
      })
      res.record.date = formatDateFromApi(res.record.date)
      setInitialData(res.record)

      setIsPosted(res.record.status === 3 ? true : false)
      setIsCancelled(res.record.status === -1 ? true : false)
    }
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: formik.values.functionId,
        recordId: formik.values.recordId
      },
      width: 950,
      height: 600,
      title: 'Workflow'
    })
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted || isCancelled
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || isPosted || isCancelled
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.CreditInvoice}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      previewReport={editMode}
      functionId={formik.values.functionId}
      disabledSubmit={isPosted || isCancelled}
    >
      <Grid container>
        <Grid container xs={12} style={{ display: 'flex', marginTop: '10px' }}>
          {/* First Column */}
          <Grid item xs={3} style={{ marginRight: '10px' }}>
            <CustomDatePicker
              name='date'
              required
              label={_labels.date}
              readOnly={isPosted || isCancelled}
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
              label={_labels.plant}
              readOnly={true}
              values={formik.values}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
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
              label={_labels.reference}
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
                endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                valueField='reference'
                displayField='name'
                name='corId'
                label={_labels.correspondent}
                form={formik}
                firstFieldWidth='30%'
                required
                valueShow='corRef'
                secondValueShow='corName'
                readOnly={isPosted || isCancelled || detailsFormik?.values?.rows[0]?.currencyId}
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
            firstFieldWidth='30%'
            valueField='accountNo'
            displayField='name'
            name='cashAccountId'
            required
            label={_labels.cashAccount}
            form={formik}
            readOnly={isPosted || isCancelled}
            valueShow='cashAccountRef'
            secondValueShow='cashAccountName'
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
            defaultValue={SystemFunction.CreditInvoicePurchase}
            onChange={e => setOperationType(e.target.value)}
          >
            <FormControlLabel
              value={SystemFunction.CreditInvoicePurchase}
              control={<Radio />}
              label={_labels.purchase}
              disabled={detailsFormik?.values?.rows[0]?.currencyId}
            />
            <FormControlLabel
              value={SystemFunction.CreditInvoiceSales}
              control={<Radio />}
              label={_labels.sale}
              disabled={detailsFormik?.values?.rows[0]?.currencyId}
            />
          </RadioGroup>
        </Grid>
        <Grid container sx={{ pt: 2 }} xs={12}>
          <Box sx={{ width: '100%' }}>
            <DataGrid
              onChange={value => detailsFormik.setFieldValue('rows', value)}
              value={detailsFormik.values.rows}
              error={detailsFormik.errors.rows}
              columns={columns}
              bg={
                formik.values.functionId &&
                (formik.values.functionId != SystemFunction.CreditInvoicePurchase ? '#C7F6C7' : 'rgb(245, 194, 193)')
              }
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
              label={_labels.notes}
              value={formik.values.notes}
              rows={3}
              readOnly={isPosted || isCancelled}
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
    </FormShell>
  )
}
