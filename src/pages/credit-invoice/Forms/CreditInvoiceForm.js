import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useError } from 'src/error'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useWindow } from 'src/windows'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { LOShipmentForm } from 'src/components/Shared/LOShipmentForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { LOTransportationForm } from 'src/components/Shared/LOTransportationForm'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'

export default function CreditInvoiceForm({ _labels, access, recordId, plantId, userData, cashAccountId }) {
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)
  const [baseCurrencyRef, setBaseCurrencyRef] = useState(null)
  const [selectedFunctionId, setFunctionId] = useState(SystemFunction.CreditInvoicePurchase)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CreditInvoice.page
  })

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    currencyId: '',
    currencyRef: '',
    date: new Date(),
    dtId: '',
    functionId: SystemFunction.CreditInvoicePurchase,
    reference: '',
    plantId: parseInt(plantId),
    corId: '',
    corRef: '',
    corName: '',
    wip: 1,
    status: 1,
    releaseStatus: '',
    notes: '',
    amount: '',
    baseAmount: '',
    exRate: '',
    minRate: '',
    maxRate: '',
    rateCalcMethod: '',
    cashAccountId: parseInt(cashAccountId),
    cashAccountName: '',
    cashAccountRef: '',
    rateType: '',
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
  })

  const { maxAccess } = useDocumentType({
    functionId: selectedFunctionId,
    access: access,
    enabled: !recordId
  })

  const { formik } = useForm({
    initialValues,
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      plantId: yup.string().required(),
      corId: yup.string().required(),
      cashAccountId: yup.string().required(),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            currencyRef: yup.string().test({
              name: 'currencyRef-last-row-check',
              message: 'currencyRef is required',
              test(value, context) {
                const { parent } = context
                if (parent.id == 1 && value) return true
                if (parent.id == 1 && !value) return false
                if (
                  parent.id > 1 &&
                  (!parent.amount || parent.amount == 0) &&
                  (!parent.exRate || parent.exRate == 0) &&
                  (!parent.qty || parent.qty == 0)
                )
                  return true

                return value
              }
            }),
            qty: yup.string().test({
              name: 'qty-last-row-check',
              message: 'Quantity is required',
              test(value, context) {
                const { parent } = context
                if (parent.id == 1 && value) return true
                if (parent.id == 1 && !value) return false
                if (
                  parent.id > 1 &&
                  (!parent.amount || parent.amount == 0) &&
                  (!parent.exRate || parent.exRate == 0) &&
                  !parent.currencyRef
                )
                  return true

                return value
              }
            }),
            exRate: yup.string().test({
              name: 'exRate-last-row-check',
              message: 'Exchange rate is required',
              test(value, context) {
                const { parent } = context
                if (parent.id == 1 && value) return true
                if (parent.id == 1 && !value) return false
                if (
                  parent.id > 1 &&
                  (!parent.amount || parent.amount == 0) &&
                  !parent.currencyRef &&
                  (!parent.qty || parent.qty == 0)
                )
                  return true

                return value
              }
            }),
            amount: yup.string().test({
              name: 'amount-last-row-check',
              message: 'Amount is required',
              test(value, context) {
                const { parent } = context
                if (parent.id == 1 && value) return true
                if (parent.id == 1 && !value) return false
                if (
                  parent.id > 1 &&
                  !parent.currencyRef &&
                  (!parent.exRate || parent.exRate == 0) &&
                  (!parent.qty || parent.qty == 0)
                )
                  return true

                return value
              }
            })
          })
        )
        .required()
    }),

    onSubmit: async obj => {
      const copy = { ...obj }
      delete copy.rows
      copy.date = formatDateToApi(copy.date)
      copy.amount = totalCUR
      copy.baseAmount = totalLoc
      const lastRow = formik.values.rows[formik.values.rows.length - 1]
      const isLastRowMandatoryOnly = !lastRow.currencyRef && !lastRow.qty && !lastRow.exRate && !lastRow.amount

      const updatedRows = formik.values.rows
        .filter((_, index) => !(index === formik.values.rows.length - 1 && isLastRowMandatoryOnly))
        .map((orderDetail, index) => {
          return {
            ...orderDetail,
            seqNo: index + 1,
            invoiceId: formik.values.recordId || 0
          }
        })

      const resultObject = {
        header: copy,
        items: updatedRows
      }

      const res = await postRequest({
        extension: CTTRXrepository.CreditInvoice.set,
        record: JSON.stringify(resultObject)
      })

      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      await refetchForm(res.recordId)
      invalidate()
    }
  })

  const isPosted = formik.values.status === 3
  const isCancelled = formik.values.status == -1
  const visible = formik.values.status != 1
  const editMode = !!formik.values.recordId

  const totalCUR = formik.values.rows.reduce((curSum, row) => {
    const curValue = parseFloat(row?.amount?.toString().replace(/,/g, '')) || 0

    return curSum + curValue
  }, 0)

  const totalLoc = formik.values.rows.reduce((locSum, row) => {
    const locValue = parseFloat(row?.baseAmount?.toString().replace(/,/g, '')) || 0

    return locSum + locValue
  }, 0)

  async function getInvoice(recordId) {
    return await getRequest({
      extension: CTTRXrepository.CreditInvoice.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function refetchForm(recordId) {
    const res = await getInvoice(recordId)
    const res2 = await fillItemsGrid(recordId)

    formik.setValues(prevValues => ({
      ...prevValues,
      ...res.record,
      date: formatDateFromApi(res.record.date),
      rows: res2
    }))

    await setOperationType(res.record.functionId)
  }

  const getCorrespondentById = async (recordId, baseCurrency, plant) => {
    if (recordId) {
      const res = await getRequest({
        extension: RemittanceSettingsRepository.Correspondent.get,
        parameters: `_recordId=${recordId}`
      })
      formik.setFieldValue('currencyId', res?.record?.currencyId)
      formik.setFieldValue('currencyRef', res?.record?.currencyRef)

      const evalRate = await getRequest({
        extension: CurrencyTradingSettingsRepository.Defaults.get,
        parameters: '_key=ct_credit_eval_ratetype_id'
      })
      await getEXMBase(plant, res?.record?.currencyId, baseCurrency, evalRate?.record?.value)
    }
  }

  const getDefaultDT = async functionId => {
    const res = await getRequest({
      extension: SystemRepository.UserFunction.get,
      parameters: `_userId=${userData}&_functionId=${functionId}`
    })
    formik.setFieldValue('dtId', res?.record?.dtId)
  }

  async function getEXMBase(plantId, currencyId, baseCurrency, rateType) {
    if (!plantId || !currencyId || !rateType || !baseCurrency) {
      if (!plantId) {
        stackError({
          message: _labels.emptyPlant
        })
      }
      if (!currencyId) {
        formik.setFieldValue('corId', '')
        formik.setFieldValue('corRef', '')
        formik.setFieldValue('corName', '')
        stackError({
          message: _labels.emptyToCurrency
        })
      }
      if (!rateType) {
        stackError({
          message: _labels.emptyRate
        })
      }
      if (!baseCurrency) {
        stackError({
          message: _labels.emptyFromCurrency
        })
      }

      return
    }

    const res = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
      parameters: `_plantId=${plantId}&_currencyId=${currencyId}&_raCurrencyId=${baseCurrency}&_rateTypeId=${rateType}`
    })

    if (res?.record?.rate) {
      stackError({
        message: _labels.undefinedCorRate
      })

      return
    }

    formik.setFieldValue('currencyId', currencyId)
    formik.setFieldValue('exRate', res?.record?.rate)
    formik.setFieldValue('rateCalcMethod', res?.record?.rateCalcMethod)
    formik.setFieldValue('minRate', res?.record?.minRate)
    formik.setFieldValue('maxRate', res?.record?.maxRate)
  }

  async function getEXMCur(obj) {
    for (const key in obj) {
      if (!obj[key]) {
        stackError({
          message: `${key} ${_labels.empty}`
        })

        return
      }
    }

    const res = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
      parameters: `_plantId=${obj.plantId}&_currencyId=${obj.fromCurrency}&_raCurrencyId=${obj.toCurrency}&_rateTypeId=${obj.rateType}`
    })

    return res?.record
  }

  const fillItemsGrid = async invoiceId => {
    const res = await getRequest({
      extension: CTTRXrepository.CreditInvoiceItem.qry,
      parameters: `_invoiceId=${invoiceId}`
    })

    const modifiedList = res.list.map((item, index) => ({
      ...item,
      id: index + 1,
      qty: parseFloat(item?.qty).toFixed(2),
      amount: parseFloat(item?.amount).toFixed(2),
      baseAmount: parseFloat(item?.baseAmount).toFixed(2),
      exRate: parseFloat(item?.exRate).toFixed(7),
      defaultRate: parseFloat(item?.defaultRate).toFixed(7)
    }))

    return modifiedList
  }

  async function setOperationType(type) {
    if (type == SystemFunction.CreditInvoicePurchase || type == SystemFunction.CreditInvoiceSales) {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters:
          type == SystemFunction.CreditInvoicePurchase
            ? '_key=ct_credit_purchase_ratetype_id'
            : type == SystemFunction.CreditInvoiceSales
            ? '_key=ct_credit_sales_ratetype_id'
            : ''
      })
      formik.setFieldValue('rateType', res?.record?.value)
      formik.setFieldValue('functionId', type)
    }
  }

  async function getBaseCurrency() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: '_key=baseCurrencyId'
    })
    await getBaseCurrencyRef(res?.record?.value)

    return res?.record?.value
  }

  const getBaseCurrencyRef = async currencyId => {
    const res = await getRequest({
      extension: SystemRepository.Currency.get,
      parameters: `_recordId=${currencyId}`
    })
    setBaseCurrencyRef(res?.record?.reference)
  }

  async function getCashAcc() {
    const res = await getRequest({
      extension: CashBankRepository.CbBankAccounts.get,
      parameters: `_recordId=${cashAccountId}`
    })
    formik.setFieldValue('cashAccountRef', res?.record?.reference)
    formik.setFieldValue('cashAccountName', res?.record?.name)
  }

  const onPost = async () => {
    const res = await postRequest({
      extension: CTTRXrepository.CreditInvoice.post,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    await refetchForm(res?.recordId)
  }

  const onCancel = async () => {
    const res = await postRequest({
      extension: CTTRXrepository.CreditInvoice.cancel,
      record: JSON.stringify(formik.values)
    })
    toast.success(platformLabels.Cancelled)
    invalidate()
    await refetchForm(res?.recordId)
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: formik.values.functionId,
        recordId: formik.values.recordId
      },
      width: 950,
      title: _labels.workflow
    })
  }

  const shipmentClicked = () => {
    stack({
      Component: LOShipmentForm,
      props: {
        recordId: formik.values.recordId,
        functionId: formik.values.functionId,
        editMode: formik.values.status != 1,
        totalBaseAmount: totalLoc
      },
      width: 1200,
      height: 670,
      title: _labels.shipments
    })
  }

  const transportationClicked = () => {
    stack({
      Component: LOTransportationForm,
      props: {
        recordId: formik.values.recordId,
        functionId: formik.values.functionId,
        editMode: formik.values.status != 1
      },
      width: 700,
      height: 430,
      title: _labels.transportation
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
      disabled: !editMode || formik.values.status === 3 || formik.values.status === 4 || isCancelled
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
    },
    {
      key: 'Shipment',
      condition: true,
      onClick: shipmentClicked,
      disabled: !editMode
    },
    {
      key: 'Transportation',
      condition: true,
      onClick: transportationClicked,
      disabled: !editMode
    }
  ]

  const columns = [
    {
      component: 'resourcecombobox',
      label: _labels.currency,
      name: 'currencyRef',
      props: {
        readOnly: visible,
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
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          visible
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
          toCurrency: formik?.values?.currencyId,
          fromCurrency: newRow?.currencyId,
          rateType: formik?.values?.rateType
        })
        if (!exchange?.rate) {
          update({
            exRate: 0,
            defaultRate: 0,
            amount: 0,
            baseAmount: 0
          })
          stackError({
            message: `${_labels.undefinedRate} ${newRow?.currencyRef}`
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
          exRate: parseFloat(exchange?.rate.toString().replace(/,/g, '')).toFixed(7),
          defaultRate: parseFloat(exchange?.rate.toString().replace(/,/g, '')).toFixed(7),
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
      readOnly: true,
      props: {
        readOnly: true,
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          visible
      },
      width: 190
    },
    {
      component: 'numberfield',
      label: _labels.quantity,
      name: 'qty',
      props: {
        readOnly: visible,
        mandatory: true,
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          visible
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
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          visible
      },
      width: 130
    },
    {
      component: 'numberfield',
      label: _labels.exRate,
      name: 'exRate',
      props: {
        readOnly: visible,
        mandatory: true,
        decimalScale: 7,
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          visible
      },
      updateOn: 'blur',
      width: 130,
      async onChange({ row: { update, newRow } }) {
        if (!newRow.currencyId) {
          update({
            exRate: '',
            defaultRate: ''
          })

          return
        }

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
              exRate: parseFloat(newRow.exRate.toString().replace(/,/g, '')).toFixed(7),
              amount: getFormattedNumber(qtyToCur.toFixed(2)),
              baseAmount: getFormattedNumber(curToBase.toFixed(2))
            })
          } else {
            stackError({
              message: `${_labels.rateRange} ${minRate}-${maxRate} ${_labels.range}`
            })
            if (nv) {
              update({
                exRate: '',
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
      label: `${_labels.total} ${formik.values.currencyRef !== null ? formik.values.currencyRef : ''}`,
      name: 'amount',
      props: {
        readOnly: true,
        mandatory: true,
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          visible
      },
      width: 130
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
        await getBaseCurrency()
      } else {
        await setOperationType(SystemFunction.CreditInvoicePurchase)
        await getDefaultDT(SystemFunction.CreditInvoicePurchase)
        if (cashAccountId) await getCashAcc()
      }
    })()
  }, [])

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.CreditInvoice}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      previewReport={editMode}
      functionId={formik.values.functionId}
      disabledSubmit={visible}
    >
      <VertLayout>
        <Fixed>
          <Grid container xs={12} style={{ marginTop: '10px' }}>
            <Grid item xs={4}>
              <CustomDatePicker
                name='date'
                required
                label={_labels.date}
                readOnly={visible}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={4} sx={{ pl: 1 }}>
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
            <Grid item xs={4} sx={{ pl: 1 }}>
              <CustomTextField
                name='reference'
                label={_labels.reference}
                value={formik?.values?.reference}
                editMode={editMode}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                readOnly={editMode}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
          </Grid>
          <Grid container xs={8} style={{ marginTop: '10px' }}>
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
                readOnly={formik?.values?.rows[0]?.currencyId}
                onChange={async (event, newValue) => {
                  if (newValue) {
                    const baseCurrency = await getBaseCurrency()
                    getCorrespondentById(newValue?.recordId, baseCurrency, formik.values.plantId)
                  }
                  formik.setFieldValue('corId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('corName', newValue ? newValue.name : '')
                  formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                }}
                errorCheck={'corId'}
              />
            </Grid>
            <Grid item xs={12} sx={{ pt: 2 }}>
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
                readOnly={visible}
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                onChange={(event, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('cashAccountRef', newValue ? newValue.accountNo : '')
                  formik.setFieldValue('cashAccountName', newValue ? newValue.name : '')
                }}
                errorCheck={'cashAccountId'}
              />
            </Grid>
          </Grid>
          <Grid container xs={12}>
            <RadioGroup
              row
              value={formik.values.functionId}
              defaultValue={SystemFunction.CreditInvoicePurchase}
              onChange={async e => {
                await setOperationType(e.target.value)
                await getDefaultDT(e.target.value)
                setFunctionId(e.target.value)
                formik.setFieldValue('reference', '')
              }}
            >
              <FormControlLabel
                value={SystemFunction.CreditInvoicePurchase}
                control={<Radio />}
                label={_labels.purchase}
                disabled={formik?.values?.rows[0]?.currencyId}
              />
              <FormControlLabel
                value={SystemFunction.CreditInvoiceSales}
                control={<Radio />}
                label={_labels.sale}
                disabled={formik?.values?.rows[0]?.currencyId}
              />
            </RadioGroup>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            allowAddNewLine={!visible}
            allowDelete={!visible}
            columns={columns}
            bg={
              formik.values.functionId &&
              (formik.values.functionId != SystemFunction.CreditInvoicePurchase ? '#C7F6C7' : 'rgb(245, 194, 193)')
            }
          />
        </Grow>

        <Fixed>
          <Grid container rowGap={1} xs={12}>
            <Grid container rowGap={1} xs={8} style={{ marginTop: '10px' }}>
              <CustomTextArea
                name='notes'
                label={_labels.notes}
                value={formik.values.notes}
                rows={3}
                readOnly={visible}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
            <Grid container rowGap={1} xs={4} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <CustomTextField
                  name='totalCUR'
                  label={`${_labels.total} ${formik.values.currencyRef !== null ? formik.values.currencyRef : ''}`}
                  value={getFormattedNumber(totalCUR.toFixed(2))}
                  numberField={true}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='baseAmount'
                  label={`${_labels.total} ${baseCurrencyRef !== null ? baseCurrencyRef : ''}`}
                  style={{ textAlign: 'right' }}
                  value={getFormattedNumber(totalLoc.toFixed(2))}
                  numberField={true}
                  readOnly={true}
                />
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
