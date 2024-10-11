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
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useWindow } from 'src/windows'
import CreditInvoiceForm from 'src/pages/credit-invoice/Forms/CreditInvoiceForm'
import useResourceParams from 'src/hooks/useResourceParams'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import { useForm } from 'src/hooks/form'
import FormGrid from 'src/components/form/layout/FormGrid'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'

export default function CreditOrderForm({ labels, access, recordId, plantId, userData, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const [selectedFunctionId, setFunctionId] = useState(SystemFunction.CurrencyCreditOrderPurchase)
  const [baseCurrencyRef, setBaseCurrencyRef] = useState(null)
  const { stack } = useWindow()

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    currencyId: '',
    currencyRef: '',
    date: new Date(),
    functionId: SystemFunction.CurrencyCreditOrderPurchase,
    deliveryDate: new Date(),
    reference: '',
    dtId: '',
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
    rateCalcMethod: '',
    rateType: '',
    isTFRClicked: false,
    rows: [
      {
        id: 1,
        orderId: '',
        seqNo: '',
        currencyId: '',
        qty: '',
        rateCalcMethod: '',
        exRate: '',
        minRate: '',
        maxRate: '',
        defaultRate: '',
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

  const { labels: _labels, access: accessINV } = useResourceParams({
    datasetId: ResourceIds.CreditInvoice
  })

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CreditOrder.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      plantId: yup.string().required(),
      corId: yup.string().required(),
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
      copy.deliveryDate = formatDateToApi(copy.deliveryDate)
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
            orderId: formik.values.recordId || 0
          }
        })

      const resultObject = {
        header: copy,
        items: updatedRows
      }

      const res = await postRequest({
        extension: CTTRXrepository.CreditOrder.set,
        record: JSON.stringify(resultObject)
      })

      toast.success(platformLabels.Updated)
      await refetchForm(res?.recordId)
      invalidate()
    }
  })

  const isClosed = formik.values.wip == 2
  const isTFR = formik.values.releaseStatus === 3 && formik.values.status !== 3
  const editMode = !!formik.values.recordId

  const onClose = async () => {
    const res = await postRequest({
      extension: CTTRXrepository.CreditOrder.close,
      record: JSON.stringify(formik.values)
    })
    toast.success(platformLabels.Closed)
    invalidate()
    await refetchForm(res?.recordId)
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: CTTRXrepository.CreditOrder.reopen,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Closed)
    invalidate()
    await refetchForm(res?.recordId)
  }

  const onTFR = async () => {
    const res = await postRequest({
      extension: CTTRXrepository.CreditOrder.tfr,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Generated)
    invalidate()
    await refetchForm(formik.values.recordId)
    window.close()

    stack({
      Component: CreditInvoiceForm,
      props: {
        _labels,
        access: accessINV,
        recordId: res?.recordId,
        plantId,
        userData
      },
      width: 900,
      height: 600,
      title: _labels.creditInvoice
    })
  }

  const totalCUR = formik.values.rows.reduce((curSum, row) => {
    const curValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return curSum + curValue
  }, 0)

  const totalLoc = formik.values.rows.reduce((locSum, row) => {
    const locValue = parseFloat(row.baseAmount?.toString().replace(/,/g, '')) || 0

    return locSum + locValue
  }, 0)

  const getCorrespondentById = async (corId, baseCurrency, plant) => {
    if (corId) {
      const res = await getRequest({
        extension: RemittanceSettingsRepository.Correspondent.get,
        parameters: `_recordId=${corId}`
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
          message: labels.emptyPlant
        })
      }
      if (!currencyId) {
        formik.setFieldValue('corId', '')
        formik.setFieldValue('corRef', '')
        formik.setFieldValue('corName', '')
        stackError({
          message: labels.emptyToCurrency
        })
      }
      if (!rateType) {
        stackError({
          message: labels.emptyRate
        })
      }
      if (!baseCurrency) {
        stackError({
          message: labels.emptyFromCurrency
        })
      }

      return
    }

    const res = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
      parameters: `_plantId=${plantId}&_currencyId=${currencyId}&_raCurrencyId=${baseCurrency}&_rateTypeId=${rateType}`
    })

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
          message: `${key} ${labels.empty}`
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

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.currency,
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
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          isClosed
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
      label: labels.name,
      name: 'currencyName',
      props: {
        readOnly: true,
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          isClosed
      },
      width: 190
    },
    {
      component: 'numberfield',
      label: labels.quantity,
      name: 'qty',
      props: {
        mandatory: true,
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          isClosed
      },
      width: 130,
      async onChange({ row: { update, newRow } }) {
        const rate = newRow.exRate
        const rateCalcMethod = newRow.rateCalcMethod
        update({
          qty: getFormattedNumber(parseFloat(newRow?.qty?.toString().replace(/,/g, '')).toFixed(2))
        })

        const qtyToCur =
          rateCalcMethod === 1
            ? parseFloat(newRow?.qty?.toString().replace(/,/g, '')) * rate
            : rateCalcMethod === 2
            ? parseFloat(newRow?.qty?.toString().replace(/,/g, '')) / rate
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
      label: labels.defaultRate,
      name: 'defaultRate',
      props: {
        readOnly: true,
        mandatory: true,
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          isClosed
      },
      width: 130
    },
    {
      component: 'numberfield',
      label: labels.exRate,
      name: 'exRate',
      props: {
        mandatory: true,
        decimalScale: 7,
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          isClosed
      },
      width: 130,
      updateOn: 'blur',
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
              message: `${labels.rateRange} ${minRate}-${maxRate} ${labels.range}`
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
      label: `${labels.total} ${formik.values.currencyRef !== null ? formik.values.currencyRef : ''}`,
      name: 'amount',
      props: {
        readOnly: true,
        mandatory: true,
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          isClosed
      },
      width: 130
    }
  ]

  const fillItemsGrid = async orderId => {
    const res = await getRequest({
      extension: CTTRXrepository.CreditOrderItem.qry,
      parameters: `_orderId=${orderId}`
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
    if (type == SystemFunction.CurrencyCreditOrderPurchase || type == SystemFunction.CurrencyCreditOrderSale) {
      const res = await getRequest({
        extension: CurrencyTradingSettingsRepository.Defaults.get,
        parameters:
          type == SystemFunction.CurrencyCreditOrderPurchase
            ? '_key=ct_credit_purchase_ratetype_id'
            : type == SystemFunction.CurrencyCreditOrderSale
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
    getRequest({
      extension: SystemRepository.Currency.get,
      parameters: `_recordId=${currencyId}`
    }).then(res => {
      setBaseCurrencyRef(res?.record?.reference)
    })
  }

  async function getOrder(recordId) {
    return await await getRequest({
      extension: CTTRXrepository.CreditOrder.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function refetchForm(recordId) {
    const res = await getOrder(recordId)
    const res2 = await fillItemsGrid(recordId)

    formik.setValues(prevValues => ({
      ...prevValues,
      ...res.record,
      date: formatDateFromApi(res.record.date),
      deliveryDate: formatDateFromApi(res.record.deliveryDate),
      rows: res2
    }))

    await setOperationType(res.record.functionId)
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
      title: labels.workflow
    })
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || (formik.values.releaseStatus === 3 && formik.values.status === 3)
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Invoice',
      condition: onTFR,
      onClick: () => {
        stack({
          Component: ConfirmationDialog,
          props: {
            DialogText: labels.transferMessage,
            fullScreen: false,
            okButtonAction: onTFR
          },
          width: 400,
          height: 150,
          title: ''
        })
      },
      disabled: !isTFR
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    }
  ]

  useEffect(() => {
    const lastRow = formik.values.rows[formik.values.rows.length - 1]
    const isLastRowMandatoryOnly = !lastRow.currencyRef && !lastRow.qty && !lastRow.exRate && !lastRow.amount

    const emptyRows = formik.values.rows.filter(
      row => !row.currencyRef && (!row.qty || row.qty == 0) && !row.exRate && (!row.amount || row.amount == 0)
    )

    if (emptyRows.length > 1 && isLastRowMandatoryOnly) {
      const updatedRows = formik.values.rows.slice(0, formik.values.rows.length - 1)
      formik.setFieldValue('rows', updatedRows)
    }
  }, [formik.values.rows])

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
        await getBaseCurrency()
      } else {
        await setOperationType(SystemFunction.CurrencyCreditOrderPurchase)
        await getDefaultDT(SystemFunction.CurrencyCreditOrderPurchase)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.CreditOrder}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      onClose={onClose}
      onReopen={onReopen}
      isClosed={isClosed}
      actions={actions}
      previewReport={editMode}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container xs={12}>
            <FormGrid hideonempty item xs={4}>
              <CustomDatePicker
                name='date'
                required
                readOnly={isClosed}
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </FormGrid>
            <Grid item xs={4} sx={{ pl: 1 }}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
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
            <Grid item xs={4} sx={{ pl: 1 }}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                editMode={editMode}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
          </Grid>

          <Grid container xs={12} style={{ marginTop: '10px' }}>
            <Grid item xs={8}>
              <ResourceLookup
                endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                valueField='reference'
                displayField='name'
                name='corId'
                label={labels.correspondent}
                form={formik}
                required
                firstFieldWidth='30%'
                displayFieldWidth={1.5}
                valueShow='corRef'
                secondValueShow='corName'
                readOnly={isClosed || formik?.values?.rows[0]?.currencyId}
                maxAccess={maxAccess}
                editMode={editMode}
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
            <Grid item xs={4} sx={{ pl: 1 }}>
              <CustomDatePicker
                name='deliveryDate'
                readOnly={isClosed}
                label={labels.deliveryDate}
                value={formik?.values?.deliveryDate}
                onChange={formik.setFieldValue}
                editMode={editMode}
                maxAccess={maxAccess}
                disabledRangeDate={{ date: formik.values.date, day: 30 }}
                onClear={() => formik.setFieldValue('deliveryDate', '')}
                error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                helperText={formik.touched.deliveryDate && formik.errors.deliveryDate}
              />
            </Grid>
          </Grid>

          <Grid container xs={12}>
            <RadioGroup
              row
              value={formik.values.functionId}
              defaultValue={SystemFunction.CurrencyCreditOrderPurchase}
              onChange={async e => {
                await setOperationType(e.target.value)
                await getDefaultDT(e.target.value)
                setFunctionId(e.target.value)
                formik.setFieldValue('reference', '')
              }}
            >
              <FormControlLabel
                value={SystemFunction.CurrencyCreditOrderPurchase}
                control={<Radio />}
                label={labels.purchase}
                disabled={formik?.values?.rows[0]?.currencyId}
              />
              <FormControlLabel
                value={SystemFunction.CurrencyCreditOrderSale}
                control={<Radio />}
                label={labels.sale}
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
            columns={columns}
            allowAddNewLine={!isClosed}
            allowDelete={!isClosed}
            bg={
              formik.values.functionId &&
              (formik.values.functionId != SystemFunction.CurrencyCreditOrderPurchase
                ? '#C7F6C7'
                : 'rgb(245, 194, 193)')
            }
          />
        </Grow>

        <Fixed>
          <Grid container rowGap={1} xs={12}>
            <FormGrid container rowGap={1} xs={8} style={{ marginTop: '10px' }}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                rows={3}
                editMode={editMode}
                maxAccess={maxAccess}
                readOnly={isClosed}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </FormGrid>
            <Grid container rowGap={1} xs={4} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <CustomTextField
                  name='totalCUR'
                  label={`${labels.total} ${formik.values.currencyRef !== null ? formik.values.currencyRef : ''}`}
                  value={getFormattedNumber(totalCUR.toFixed(2))}
                  numberField={true}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='baseAmount'
                  maxAccess={maxAccess}
                  label={`${labels.total} ${baseCurrencyRef !== null ? baseCurrencyRef : ''}`}
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
