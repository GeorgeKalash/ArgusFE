import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useError } from '@argus/shared-providers/src/providers/error'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { CTTRXrepository } from '@argus/repositories/src/repositories/CTTRXRepository'
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import CreditInvoiceForm from '@argus/shared-ui/src/components/Shared/Forms/CreditInvoiceForm'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import FormGrid from '@argus/shared-ui/src/components/form'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { LOTransportationForm } from '@argus/shared-ui/src/components/Shared/LOTransportationForm'
import { LOShipmentForm } from '@argus/shared-ui/src/components/Shared/LOShipmentForm'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'

const CreditOrderForm = ({ recordId, window }) => {
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const [selectedFunctionId, setFunctionId] = useState(SystemFunction.CurrencyCreditOrderPurchase)
  const [baseCurrencyRef, setBaseCurrencyRef] = useState(null)
  const { stack } = useWindow()
  const userData = getStorageData('userData').userId
  const plantId = parseInt(userDefaultsData?.list?.find(({ key }) => key === 'plantId')?.value)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.CreditOrder,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.creditOrder, window })

  const { maxAccess } = useDocumentType({
    functionId: selectedFunctionId,
    access,
    enabled: !recordId,
    hasDT: false
  })

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CreditOrder.page
  })

  const conditions = {
    currencyRef: row => row?.currencyRef,
    currencyName: row => row?.currencyName,
    qty: row => row?.qty,
    exRate: row => row?.exRate,
    amount: row => row?.amount
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'rows')

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      currencyId: null,
      currencyRef: '',
      date: new Date(),
      functionId: SystemFunction.CurrencyCreditOrderPurchase,
      deliveryDate: new Date(),
      reference: '',
      dtId: null,
      plantId: parseInt(plantId),
      corId: null,
      corRef: '',
      corName: '',
      wip: 1,
      status: 1,
      releaseStatus: '',
      notes: '',
      amount: 0,
      baseAmount: 0,
      exRate: 1,
      rateCalcMethod: '',
      rateType: '',
      isTFRClicked: false,
      rows: [
        {
          id: 1,
          orderId: recordId || null,
          seqNo: '',
          currencyId: null,
          qty: '',
          rateCalcMethod: '',
          exRate: '',
          minRate: '',
          maxRate: '',
          defaultRate: '',
          amount: '',
          baseAmount: '',
          notes: '',
          goc: false
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      plantId: yup.string().required(),
      corId: yup.string().required(),
      rows: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const copy = {
        ...obj,
        date: formatDateToApi(obj.date),
        deliveryDate: formatDateToApi(obj.deliveryDate),
        amount: totalCUR,
        baseAmount: totalLoc
      }
      delete copy.rows

      const updatedRows = formik.values.rows
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        ?.map((orderDetail, index) => {
          return {
            ...orderDetail,
            seqNo: index + 1,
            orderId: formik.values.recordId || 0
          }
        })

      const res = await postRequest({
        extension: CTTRXrepository.CreditOrder.set,
        record: JSON.stringify({
          header: copy,
          items: updatedRows
        })
      })
      const actionMessage = obj.recordId ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
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
    refetchForm(res?.recordId)
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: CTTRXrepository.CreditOrder.reopen,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(res?.recordId)
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
        recordId: res?.recordId
      }

      // width: 900,
      // height: 600,
      // title: labels.creditInvoice
    })
  }

  const totalCUR = formik?.values?.rows?.length
    ? formik.values.rows.reduce((curSum, row) => {
        const curValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || 0

        return curSum + curValue
      }, 0)
    : 0

  const totalLoc = formik?.values?.rows?.length
    ? formik.values.rows.reduce((locSum, row) => {
        const locValue = parseFloat(row.baseAmount?.toString().replace(/,/g, '')) || 0

        return locSum + locValue
      }, 0)
    : 0

  const getCorrespondentById = async (corId, baseCurrency, plant) => {
    if (!corId) return

    const res = await getRequest({
      extension: RemittanceSettingsRepository.Correspondent.get,
      parameters: `_recordId=${corId}`
    })
    formik.setFieldValue('currencyId', res?.record?.currencyId || null)
    formik.setFieldValue('currencyRef', res?.record?.currencyRef || '')

    const evalRate = await getRequest({
      extension: CurrencyTradingSettingsRepository.Defaults.get,
      parameters: '_key=ct_credit_eval_ratetype_id'
    })
    getEXMBase(plant, res?.record?.currencyId, baseCurrency, evalRate?.record?.value)
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
        formik.setFieldValue('corId', null)
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

    if (!res?.record?.rate) {
      stackError({
        message: labels.undefinedCorRate
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
      flex: 2,
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
        displayFieldWidth: 3
      },
      async onChange({ row: { update, oldRow, newRow } }) {
        if (!newRow?.currencyId) {
          return
        }

        const exchange = await getEXMCur({
          plantId: plantId || formik.values.plantId,
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
            message: `${labels.undefinedRate} ${newRow?.currencyRef}.`
          })

          return
        }

        let amount = 0,
          baseAmount = 0
        if (newRow?.qty) {
          const qty = parseFloat(newRow?.qty?.toString().replace(/,/g, '')) || 0

          const qtyToCur =
            exchange.rateCalcMethod === 1
              ? qty * exchange.rate
              : exchange.rateCalcMethod === 2
              ? qty / exchange.rate
              : 0

          amount = parseFloat(qtyToCur).toFixed(2)

          const curToBase =
            formik.values.rateCalcMethod === 1
              ? qtyToCur * formik.values.exRate
              : formik.values.rateCalcMethod === 2
              ? qtyToCur / formik.values.exRate
              : 0

          baseAmount = parseFloat(curToBase).toFixed(2)
        }
        const gocPresent = await getCorCurrencyInfo(newRow?.currencyId)
        update({
          currencyId: exchange.currencyId,
          currencyName: exchange.currencyName,
          exRate: exchange.rate.toFixed(7),
          defaultRate: exchange.rate.toFixed(7),
          rateCalcMethod: exchange.rateCalcMethod,
          minRate: exchange.minRate,
          maxRate: exchange.maxRate,
          goc: gocPresent?.goc || false,
          amount,
          baseAmount
        })
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'currencyName',
      props: {
        readOnly: true
      },
      flex: 3
    },
    {
      component: 'numberfield',
      label: labels.quantity,
      name: 'qty',
      flex: 2,
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        const rateCalcMethod = newRow.rateCalcMethod

        const qtyToCur =
          rateCalcMethod === 1
            ? parseFloat(newRow?.qty?.toString().replace(/,/g, '')) * newRow?.exRate
            : rateCalcMethod === 2
            ? parseFloat(newRow?.qty?.toString().replace(/,/g, '')) / newRow?.exRate
            : 0

        const curToBase =
          formik.values.rateCalcMethod === 1
            ? parseFloat(qtyToCur) * formik.values.exRate
            : rateCalcMethod === 2
            ? parseFloat(qtyToCur) / formik.values.exRate
            : 0
        update({
          amount: parseFloat(qtyToCur).toFixed(2),
          baseAmount: parseFloat(curToBase).toFixed(2),
          qty: parseFloat(newRow?.qty).toFixed(2)
        })
      }
    },
    {
      component: 'numberfield',
      label: labels.defaultRate,
      name: 'defaultRate',
      props: {
        readOnly: true
      },
      flex: 2
    },
    {
      component: 'numberfield',
      label: labels.exRate,
      name: 'exRate',
      props: {
        decimalScale: 7
      },
      flex: 2,
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        if (!newRow.currencyId || !newRow.exRate) {
          update({
            exRate: '',
            defaultRate: '',
            amount: 0,
            baseAmount: 0
          })

          return
        }
        const parseNum = val => parseFloat(val?.toString().replace(/,/g, '')) || 0

        const nv = parseNum(newRow.exRate)
        if (nv > 0) {
          const minRate = parseNum(newRow.minRate)
          const maxRate = parseNum(newRow.maxRate)
          if (nv >= minRate && nv <= maxRate) {
            const qty = parseNum(newRow.qty)
            const rateCalcMethod = newRow.rateCalcMethod

            const qtyToCur = rateCalcMethod === 1 ? qty * nv : rateCalcMethod === 2 ? qty / nv : 0

            const curToBase =
              formik.values.rateCalcMethod === 1
                ? qtyToCur * formik.values.exRate
                : formik.values.rateCalcMethod === 2
                ? qtyToCur / formik.values.exRate
                : 0

            update({
              exRate: nv.toFixed(7),
              amount: qtyToCur.toFixed(2),
              baseAmount: curToBase.toFixed(2)
            })
          } else {
            stackError({ message: `${nv} ${labels.invalidRange} [${minRate}-${maxRate}]` })
            update({ exRate: '', amount: 0, baseAmount: 0 })
          }
        }
      }
    },
    {
      component: 'numberfield',
      label: `${labels.total} ${formik.values.currencyRef || ''}`,
      name: 'amount',
      props: {
        readOnly: true
      },
      flex: 2
    }
  ]

  async function getCorCurrencyInfo(currencyId) {
    if (!currencyId) return

    const res = await getRequest({
      extension: RemittanceSettingsRepository.CorrespondentCurrency.get,
      parameters: `_corId=${formik.values.corId}&_currencyId=${currencyId}`
    })

    return res?.record
  }

  const fillCurrencyGrid = async orderId => {
    const res = await getRequest({
      extension: CTTRXrepository.CreditOrderItem.qry,
      parameters: `_orderId=${orderId}`
    })

    const modifiedList =
      res?.list?.length > 0
        ? res.list.map((item, index) => ({
            ...item,
            id: index + 1,
            qty: parseFloat(item?.qty).toFixed(2),
            amount: parseFloat(item?.amount).toFixed(2),
            baseAmount: parseFloat(item?.baseAmount).toFixed(2),
            exRate: parseFloat(item?.exRate).toFixed(7),
            defaultRate: parseFloat(item?.defaultRate).toFixed(7)
          }))
        : formik.initialValues.rows

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
    const res2 = await fillCurrencyGrid(recordId)

    formik.setValues(prevValues => ({
      ...prevValues,
      ...res.record,
      date: formatDateFromApi(res.record.date),
      deliveryDate: res?.record?.deliveryDate ? formatDateFromApi(res.record.deliveryDate) : null,
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
      }
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
      }
    })
  }

  const transportationClicked = () => {
    stack({
      Component: LOTransportationForm,
      props: {
        recordId: formik.values.recordId,
        functionId: formik.values.functionId,
        editMode: formik.values.status != 1
      }
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
      actions={actions}
      previewReport={editMode}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container xs={12} spacing={2}>
            <FormGrid hideonempty item xs={4}>
              <CustomDatePicker
                name='date'
                required
                readOnly={isClosed}
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </FormGrid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                readOnly
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={8}>
              <ResourceLookup
                endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                valueField='reference'
                displayField='name'
                name='corId'
                label={labels.correspondent}
                form={formik}
                required
                firstFieldWidth={4}
                displayFieldWidth={3}
                valueShow='corRef'
                secondValueShow='corName'
                readOnly={isClosed || formik?.values?.rows?.some(row => !!row.currencyId)}
                maxAccess={maxAccess}
                onChange={async (event, newValue) => {
                  if (newValue) {
                    const baseCurrency = await getBaseCurrency()
                    getCorrespondentById(newValue?.recordId, baseCurrency, formik.values.plantId)
                  }
                  formik.setFieldValue('corName', newValue ? newValue.name : '')
                  formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                  formik.setFieldValue('corId', newValue ? newValue.recordId : null)
                }}
                errorCheck={'corId'}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='deliveryDate'
                readOnly={isClosed}
                label={labels.deliveryDate}
                value={formik?.values?.deliveryDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                disabledRangeDate={{ date: formik.values.date, day: 30 }}
                onClear={() => formik.setFieldValue('deliveryDate', null)}
                error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
              />
            </Grid>
            <Grid item xs={6}>
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
                  disabled={formik?.values?.rows?.some(row => !!row.currencyId)}
                />
                <FormControlLabel
                  value={SystemFunction.CurrencyCreditOrderSale}
                  control={<Radio />}
                  label={labels.sale}
                  disabled={formik?.values?.rows?.some(row => !!row.currencyId)}
                />
              </RadioGroup>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            disabled={!formik.values.corId || isClosed}
            value={formik.values.rows}
            name='rows'
            error={formik.errors.rows}
            columns={columns}
            allowAddNewLine={!isClosed}
            maxAccess={maxAccess}
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
          <Grid container spacing={2} xs={12}>
            <FormGrid item xs={8}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                rows={3}
                maxAccess={maxAccess}
                readOnly={isClosed}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </FormGrid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalCUR'
                    label={`${labels.total} ${formik.values.currencyRef || ''}`}
                    value={totalCUR}
                    readOnly
                    align='right'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='baseAmount'
                    label={`${labels.total} ${baseCurrencyRef || ''}`}
                    value={totalLoc}
                    readOnly
                    align='right'
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

CreditOrderForm.width = 1000
CreditOrderForm.height = 650

export default CreditOrderForm
