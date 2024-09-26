import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, FormControlLabel, RadioGroup, Radio } from '@mui/material'
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
  const [isClosed, setIsClosed] = useState(false)
  const [isTFR, setIsTFR] = useState(false)
  const [rateType, setRateType] = useState(148)
  const [editMode, setEditMode] = useState(!!recordId)
  const { stack: stackError } = useError()
  const [toCurrency, setToCurrency] = useState(null)
  const [selectedFunctionId, setFunctionId] = useState(SystemFunction.CurrencyCreditOrderPurchase)
  const [toCurrencyRef, setToCurrencyRef] = useState(null)
  const [baseCurrencyRef, setBaseCurrencyRef] = useState(null)
  const { stack } = useWindow()
  const [confirmationWindowOpen, setConfirmationWindowOpen] = useState(false)

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    currencyId: '',
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
    currencyId: '',
    amount: '',
    baseAmount: '',
    exRate: '',
    rateCalcMethod: '',
    isTFRClicked: false
  })

  const { maxAccess } = useDocumentType({
    functionId: selectedFunctionId,
    access: access,
    enabled: !recordId
  })

  const { labels: _labelsINV, access: accessINV } = useResourceParams({
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
      corId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const copy = { ...obj }
        delete copy.rows
        copy.date = formatDateToApi(copy.date)
        copy.deliveryDate = formatDateToApi(copy.deliveryDate)
        copy.amount = totalCUR
        copy.baseAmount = totalLoc
        if (!formik.values.isTFRClicked) {
          const updatedRows = detailsFormik.values.rows.map((orderDetail, index) => {
            const seqNo = index + 1

            return {
              ...orderDetail,
              seqNo: seqNo,
              orderId: formik.values.recordId || 0
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
            extension: CTTRXrepository.CreditOrder.set,
            record: JSON.stringify(resultObject)
          })

          if (res.recordId) {
            toast.success(platformLabels.Updated)
            formik.setFieldValue('recordId', res.recordId)
            setEditMode(true)

            const res2 = await getRequest({
              extension: CTTRXrepository.CreditOrder.get,
              parameters: `_recordId=${res.recordId}`
            })
            formik.setFieldValue('reference', res2.record.reference)
            invalidate()
          }
        } else {
          setConfirmationWindowOpen(true)
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
    },
    validationSchema: yup.object({
      rows: yup.array().of(
        yup.object({
          currencyId: yup.string().required(),
          qty: yup.string().required(),
          exRate: yup.string().required(),
          amount: yup.string().required()
        })
      )
    })
  })

  const onClose = async () => {
    try {
      const obj = formik.values
      const copy = { ...obj }

      copy.date = formatDateToApi(copy.date)
      copy.deliveryDate = formatDateToApi(copy.deliveryDate)
      copy.amount = totalCUR
      copy.baseAmount = totalLoc

      const res = await postRequest({
        extension: CTTRXrepository.CreditOrder.close,
        record: JSON.stringify(copy)
      })
      if (res.recordId) {
        toast.success(platformLabels.Closed)
        invalidate()
        setIsClosed(true)
      }
    } catch (error) {}
  }

  const onReopen = async () => {
    try {
      const obj = formik.values
      const copy = { ...obj }

      copy.date = formatDateToApi(copy.date)
      copy.deliveryDate = formatDateToApi(copy.deliveryDate)
      copy.amount = totalCUR
      copy.baseAmount = totalLoc

      const res = await postRequest({
        extension: CTTRXrepository.CreditOrder.reopen,
        record: JSON.stringify(copy)
      })
      if (res.recordId) {
        toast.success(platformLabels.Closed)
        invalidate()
        setIsClosed(false)
      }
    } catch (error) {}
  }

  const onTFR = async () => {
    try {
      const obj = formik.values
      const copy = { ...obj }

      copy.date = formatDateToApi(copy.date)
      copy.deliveryDate = formatDateToApi(copy.deliveryDate)
      copy.amount = totalCUR
      copy.baseAmount = totalLoc

      const res = await postRequest({
        extension: CTTRXrepository.CreditOrder.tfr,
        record: JSON.stringify(copy)
      })
      if (res.recordId) {
        toast.success(platformLabels.Closed)
        setIsTFR(true)
        invalidate()
        setConfirmationWindowOpen(false)
        window.close()
        stack({
          Component: CreditInvoiceForm,
          props: {
            _labels: _labelsINV,
            maxAccess: accessINV,
            recordId: res.recordId
          },
          width: 900,
          height: 600,
          title: _labelsINV[1]
        })
      }
    } catch (error) {}
  }

  const totalCUR = detailsFormik.values.rows.reduce((curSum, row) => {
    const curValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

    return curSum + curValue
  }, 0)

  const totalLoc = detailsFormik.values.rows.reduce((locSum, row) => {
    const locValue = parseFloat(row.baseAmount?.toString().replace(/,/g, '')) || 0

    return locSum + locValue
  }, 0)

  const getCorrespondentById = async (corId, baseCurrency, plant) => {
    if (corId) {
      getRequest({
        extension: RemittanceSettingsRepository.Correspondent.get,
        parameters: `_recordId=${corId}`
      }).then(async res => {
        setToCurrency(res.record.currencyId)
        setToCurrencyRef(res.record.currencyRef)

        const evalRate = await getRequest({
          extension: CurrencyTradingSettingsRepository.Defaults.get,
          parameters: '_key=ct_credit_eval_ratetype_id'
        })
        if (evalRate.record) getEXMBase(plant, res.record.currencyId, baseCurrency, evalRate.record.value)
      })
    } else {
      setToCurrency(null)
      setToCurrencyRef(null)
    }
  }

  const getDefaultDT = async functionId => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: `_userId=${userData && userData.userId}&_functionId=${functionId}`
      })
      formik.setFieldValue('dtId', res?.record?.dtId)
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

    const res = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
      parameters: `_plantId=${plantId}&_currencyId=${currencyId}&_raCurrencyId=${baseCurrency}&_rateTypeId=${rateType}`
    })

    if (res) {
      formik.setFieldValue('currencyId', currencyId)
      formik.setFieldValue('exRate', res.record?.rate)
      formik.setFieldValue('rateCalcMethod', res.record?.rateCalcMethod)
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
        disabled:
          formik?.values?.corId === '' ||
          formik?.values?.corId === null ||
          formik?.values?.corId === undefined ||
          isClosed
      },
      width: 130,
      updateOn: 'blur',
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
    try {
      getRequest({
        extension: CTTRXrepository.CreditOrderItem.qry,
        parameters: `_orderId=${orderId}`
      }).then(res => {
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
      setRateType(res.record.value)
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
    try {
      getRequest({
        extension: SystemRepository.Currency.get,
        parameters: `_recordId=${currencyId}`
      }).then(res => {
        setBaseCurrencyRef(res?.record?.reference)
      })
    } catch (error) {}
  }

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: CTTRXrepository.CreditOrder.get,
            parameters: `_recordId=${recordId}`
          })
          setIsClosed(res.record.wip === 2 ? true : false)
          setIsTFR(res.record.releaseStatus === 3 && res.record.status !== 3 ? true : false)
          setToCurrency(res.record.currencyId)
          setToCurrencyRef(res.record.currencyRef)
          await setOperationType(res.record.functionId)
          await getBaseCurrency()
          formik.setValues({
            ...res.record,
            date: formatDateFromApi(res.record.date),
            deliveryDate: formatDateFromApi(res.record.deliveryDate)
          })
          await fillItemsGrid(recordId)
        } else {
          await setOperationType(SystemFunction.CurrencyCreditOrderPurchase)
          await getDefaultDT(SystemFunction.CurrencyCreditOrderPurchase)
        }
      } catch (error) {}
    })()
  }, [])

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
      onClick: onTFR,
      disabled: !isTFR
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    }
  ]

  return (
    <VertLayout>
      <ConfirmationDialog
        DialogText={`Are you sure you want to transfer this order`}
        cancelButtonAction={() => setConfirmationWindowOpen(false)}
        openCondition={confirmationWindowOpen}
        okButtonAction={async () => {
          await onTFR()
        }}
      />
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
      >
        <Fixed>
          <Grid container xs={12} style={{ display: 'flex', marginTop: '10px' }}>
            <FormGrid hideonempty item style={{ marginRight: '10px', width: '205px' }}>
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

            <Grid item style={{ marginRight: '10px', width: '465px' }}>
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

            <Grid item style={{ marginRight: '10px', width: '210px' }}>
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

          <Grid container xs={12}>
            <Grid container rowGap={1} xs={9} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
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
                  readOnly={isClosed || detailsFormik?.values?.rows[0]?.currencyId}
                  maxAccess={maxAccess}
                  editMode={editMode}
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
                      setToCurrency(null)
                      setToCurrencyRef('')
                    }
                  }}
                  errorCheck={'corId'}
                />
              </Grid>
            </Grid>
            <Grid container rowGap={1} xs={3} sx={{ px: 2 }} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
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
                disabled={detailsFormik?.values?.rows[0]?.currencyId}
              />
              <FormControlLabel
                value={SystemFunction.CurrencyCreditOrderSale}
                control={<Radio />}
                label={labels.sale}
                disabled={detailsFormik?.values?.rows[0]?.currencyId}
              />
            </RadioGroup>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => detailsFormik.setFieldValue('rows', value)}
            value={detailsFormik.values.rows}
            error={detailsFormik.errors.rows}
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
                  label={`Total ${toCurrencyRef !== null ? toCurrencyRef : ''}`}
                  value={getFormattedNumber(totalCUR.toFixed(2))}
                  numberField={true}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='baseAmount'
                  maxAccess={maxAccess}
                  label={`Total ${baseCurrencyRef !== null ? baseCurrencyRef : ''}`}
                  style={{ textAlign: 'right' }}
                  value={getFormattedNumber(totalLoc.toFixed(2))}
                  numberField={true}
                  readOnly={true}
                />
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </FormShell>
    </VertLayout>
  )
}
