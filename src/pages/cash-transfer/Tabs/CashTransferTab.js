import { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useInvalidate } from 'src/hooks/resource'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import toast from 'react-hot-toast'
import { useError } from 'src/error'
import { SystemFunction } from 'src/resources/SystemFunction'
import { LOShipmentForm } from 'src/components/Shared/LOShipmentForm'
import { DataGrid } from 'src/components/Shared/DataGrid'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import FormGrid from 'src/components/form/layout/FormGrid'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { useForm } from 'src/hooks/form'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { RateDivision } from 'src/resources/RateDivision'
import { DIRTYFIELD_AMOUNT, getRate } from 'src/utils/RateCalculator'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'

export default function CashTransferTab({ labels, recordId, access, plantId, cashAccountId, dtId }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const [isClosed, setIsClosed] = useState(false)
  const [isPosted, setIsPosted] = useState(true)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CashTransfer.page
  })

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    dtId: parseInt(dtId),
    reference: '',
    date: new Date(),
    toPlantId: parseInt(plantId),
    fromPlantId: parseInt(plantId),
    fromCashAccountId: parseInt(cashAccountId),
    fromCARef: '',
    fromCAName: '',
    toCashAccountId: '',
    toCARef: '',
    toCAName: '',
    baseAmount: '',
    notes: '',
    wip: '',
    status: '',
    statusName: '',
    releaseStatus: '',
    rsName: '',
    wipName: '',
    transfers: [
      {
        id: 1,
        transferId: recordId || 0,
        seqNo: '',
        currencyId: '',
        currencyName: '',
        currencyRef: '',
        amount: '',
        baseAmount: '',
        exRate: '',
        rateCalcMethod: '',
        balance: 0
      }
    ]
  })

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.CashTransfer,
    access: access,
    enabled: !recordId
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fromCashAccountId: yup.string().required(),
      fromPlantId: yup.string().required(),
      date: yup.string().required(),
      toPlantId: yup.string().required(),
      toCashAccountId: yup
        .string()
        .nullable()
        .test('', function (value) {
          const { fromPlantId, toPlantId } = this.parent
          if (fromPlantId == toPlantId) {
            return !!value
          }

          return true
        }),
      transfers: yup
        .array()
        .of(
          yup.object().shape({
            currencyName: yup.string().required(),
            amount: yup.string().nullable().required()
          })
        )
        .required()
    }),
    onSubmit: async values => {
      const copy = { ...values }
      delete copy.transfers
      copy.date = formatDateToApi(copy.date)
      copy.status = copy.status === '' ? 1 : copy.status
      copy.wip = copy.wip === '' ? 1 : copy.wip
      copy.baseAmount = totalLoc

      const updatedRows = formik.values.transfers.map((transferDetail, index) => {
        const seqNo = index + 1

        return {
          ...transferDetail,
          seqNo: seqNo,
          transferId: formik.values.recordId || 0
        }
      })
      if (updatedRows.length === 1 && updatedRows[0].currencyId === '') {
        stackError({
          message: `Grid not filled. Please fill the grid before saving.`
        })

        return
      }

      const resultObject = {
        header: copy,
        items: updatedRows
      }

      const res = await postRequest({
        extension: CashBankRepository.CashTransfer.set,
        record: JSON.stringify(resultObject)
      })

      if (res.recordId) {
        toast.success('Record Updated Successfully')
        formik.setFieldValue('recordId', res.recordId)
        setEditMode(true)

        const res2 = await getRequest({
          extension: CashBankRepository.CashTransfer.get,
          parameters: `_recordId=${res.recordId}`
        })

        formik.setFieldValue('reference', res2.record.reference)
        invalidate()
      }
    }
  })

  const totalLoc = formik.values.transfers.reduce((locSum, row) => {
    const locValue = parseFloat(row.baseAmount?.toString().replace(/,/g, '')) || 0

    return locSum + locValue
  }, 0)

  const onClose = async () => {
    const { transfers, ...rest } = formik.values
    const copy = { ...rest }

    copy.date = formatDateToApi(copy.date)
    copy.wip = copy.wip === '' ? 1 : copy.wip
    copy.status = copy.status === '' ? 1 : copy.status
    copy.baseAmount = totalLoc

    const res = await postRequest({
      extension: CashBankRepository.CashTransfer.close,
      record: JSON.stringify(copy)
    })
    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(true)

      const res2 = await getRequest({
        extension: CashBankRepository.CashTransfer.get,
        parameters: `_recordId=${formik.values.recordId}`
      })
      if (res2?.record?.status == 4) {
        setIsPosted(false)
      }
    }
  }

  const onReopen = async () => {
    const { transfers, ...rest } = formik.values
    const copy = { ...rest }

    copy.date = formatDateToApi(copy.date)
    copy.wip = copy.wip === '' ? 1 : copy.wip
    copy.status = copy.status === '' ? 1 : copy.status
    copy.baseAmount = totalLoc

    const res = await postRequest({
      extension: CashBankRepository.CashTransfer.reopen,
      record: JSON.stringify(copy)
    })
    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(false)
      setIsPosted(true)
    }
  }

  const fillCurrencyTransfer = async (transferId, data) => {
    const res = await getRequest({
      extension: CashBankRepository.CurrencyTransfer.qry,
      parameters: `_transferId=${transferId}`
    })

    const modifiedList = res.list.map(item => ({
      ...item,
      id: item.seqNo,
      amount: parseFloat(item.amount).toFixed(2),
      balance: parseFloat(item?.balance).toFixed(2) ?? 0
    }))

    formik.setValues({
      ...data,
      transfers: modifiedList
    })
  }

  const getAccView = async () => {
    if (cashAccountId) {
      const res = await getRequest({
        extension: CashBankRepository.CashAccount.get,
        parameters: `_recordId=${cashAccountId}`
      })
      if (res.record) {
        formik.setFieldValue('fromCARef', res.record.accountNo)
        formik.setFieldValue('fromCAName', res.record.name)
      }
    }
  }

  const shipmentClicked = () => {
    stack({
      Component: LOShipmentForm,
      props: {
        recordId: formik.values.recordId,
        functionId: SystemFunction.CashTransfer,
        editMode: isClosed,
        totalBaseAmount: totalLoc
      },
      width: 1200,
      height: 670,
      title: 'Shipments'
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CashBankRepository.CashTransfer.get,
          parameters: `_recordId=${recordId}`
        })
        res.record.date = formatDateFromApi(res.record.date)
        setIsClosed(res.record.wip === 2 ? true : false)
        setIsPosted(res.record.status === 4 ? false : true)
        await fillCurrencyTransfer(recordId, res.record)
      } else {
        getAccView()
      }
    })()
  }, [])

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.CashTransfer,
        recordId: formik.values.recordId
      },
      width: 950,
      title: 'Workflow'
    })
  }

  const actions = [
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
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
      key: 'Shipment',
      condition: true,
      onClick: shipmentClicked,
      disabled: (editMode && formik.values.fromPlantId == formik.values.toPlantId) || !editMode
    },
    {
      key: 'Account Balance',
      condition: true,
      onClick: 'onClickAC',
      disabled: false
    },
    {
      key: 'Cash Transaction',
      condition: true,
      onClick: 'transactionClicked',
      disabled: !editMode
    }
  ]

  function getCurrencyApi(_currencyId) {
    return getRequest({
      extension: MultiCurrencyRepository.Currency.get,
      parameters: `_currencyId=${_currencyId}&_date=${formatDateForGetApI(formik.values.date)}&_rateDivision=${
        RateDivision.FINANCIALS
      }`
    })
  }

  return (
    <FormShell
      resourceId={ResourceIds.CashTransfer}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      functionId={SystemFunction.CashTransfer}
      actions={actions}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container>
            <Grid container rowGap={2} xs={6} sx={{ px: 2 }} spacing={2}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={labels.reference}
                  value={formik?.values?.reference}
                  maxAccess={maxAccess}
                  maxLength='15'
                  readOnly={editMode}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Plant.qry}
                  name='fromPlantId'
                  label={labels.fromPlant}
                  values={formik.values}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik && formik.setFieldValue('fromPlantId', newValue?.recordId)
                  }}
                  error={formik.touched.fromPlantId && Boolean(formik.errors.fromPlantId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={CashBankRepository.CashAccount.snapshot}
                  parameters={{
                    _type: 0
                  }}
                  firstFieldWidth='40%'
                  valueField='accountNo'
                  displayField='name'
                  name='fromCashAccountId'
                  displayFieldWidth={2}
                  required
                  label={labels.fromCashAcc}
                  form={formik}
                  readOnly
                  valueShow='fromCARef'
                  secondValueShow='fromCAName'
                  onChange={(event, newValue) => {
                    formik.setFieldValue('fromCashAccountId', newValue ? newValue.recordId : null)
                    formik.setFieldValue('fromCARef', newValue ? newValue.accountNo : null)
                    formik.setFieldValue('fromCAName', newValue ? newValue.name : null)
                  }}
                  error={formik.touched.fromCashAccountId && Boolean(formik.errors.fromCashAccountId)}
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
            <Grid container rowGap={2} xs={6} sx={{ px: 2 }} spacing={2}>
              <Grid item xs={12}>
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
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Plant.qry}
                  name='toPlantId'
                  label={labels.toPlant}
                  values={formik.values}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  required
                  readOnly={isClosed}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('toPlantId', newValue ? newValue.recordId : null)
                    formik.setFieldValue('toCashAccountId', null)
                    formik.setFieldValue('toCARef', null)
                    formik.setFieldValue('toCAName', null)
                  }}
                  error={formik.touched.toPlantId && Boolean(formik.errors.toPlantId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={CashBankRepository.CashAccount.snapshot}
                  parameters={{
                    _type: 0
                  }}
                  firstFieldWidth='40%'
                  valueField='accountNo'
                  displayField='name'
                  name='toCashAccountId'
                  displayFieldWidth={2}
                  required={formik.values.fromPlantId === formik.values.toPlantId}
                  readOnly={!formik.values.toPlantId || isClosed}
                  label={labels.toCashAcc}
                  form={formik}
                  filter={{ plantId: formik.values.toPlantId }}
                  valueShow='toCARef'
                  secondValueShow='toCAName'
                  viewHelperText={false}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('toCashAccountId', newValue ? newValue.recordId : null)
                    formik.setFieldValue('toCARef', newValue ? newValue.accountNo : null)
                    formik.setFieldValue('toCAName', newValue ? newValue.name : null)
                  }}
                  maxAccess={maxAccess}
                  error={formik.touched.toCashAccountId && Boolean(formik.errors.toCashAccountId)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('transfers', value)}
            value={formik.values.transfers}
            error={formik.errors.transfers}
            allowDelete={!isClosed}
            allowAddNewLine={!isClosed}
            maxAccess={maxAccess}
            name='currencies'
            columns={[
              {
                component: 'resourcecombobox',
                label: labels.currency,
                name: 'currencyName',
                props: {
                  disabled: isClosed,
                  endpointId: SystemRepository.Currency.qry,
                  displayField: 'reference',
                  valueField: 'recordId',
                  mapping: [
                    { from: 'recordId', to: 'currencyId' },
                    { from: 'name', to: 'currencyName' },
                    { from: 'reference', to: 'currencyRef' }
                  ],
                  columnsInDropDown: [
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]
                },
                widthDropDown: 200,
                displayFieldWidth: 2,
                async onChange({ row: { update, newRow } }) {
                  if (!newRow?.currencyId) {
                    return
                  }
                  if (newRow.currencyId) {
                    try {
                      const result = await getCurrencyApi(newRow?.currencyId)
                      update({
                        exRate: result.record.exRate,
                        rateCalcMethod: result.record.rateCalcMethod
                      })
                    } catch (error) {}
                  }
                }
              },
              {
                component: 'numberfield',
                label: labels.amount,
                name: 'amount',
                defaultValue: '',
                props: { readOnly: isClosed },
                async onChange({ row: { update, newRow } }) {
                  if (!newRow?.amount) {
                    return
                  }
                  if (newRow?.amount) {
                    const updatedRateRow = getRate({
                      amount: newRow?.amount,
                      exRate: newRow?.exRate,
                      baseAmount: newRow?.baseAmount,
                      rateCalcMethod: newRow?.rateCalcMethod,
                      dirtyField: DIRTYFIELD_AMOUNT
                    })
                    update({
                      baseAmount: updatedRateRow.baseAmount
                    })
                  }
                }
              },
              {
                component: 'numberfield',
                label: labels.baseAmount,
                name: 'baseAmount',
                defaultValue: '',
                props: { readOnly: true }
              },
              {
                component: 'numberfield',
                name: 'balance',
                label: labels.balance,
                defaultValue: '0',
                props: { readOnly: true }
              }
            ]}
          />
        </Grow>
        <Fixed>
          <FormGrid container rowGap={1} xs={7} style={{ marginTop: '10px' }}>
            <CustomTextArea
              name='notes'
              label={labels.note}
              value={formik.values.notes}
              rows={3}
              readOnly={isClosed}
              maxLength='100'
              editMode={editMode}
              maxAccess={maxAccess}
              onChange={e => formik.setFieldValue('notes', e.target.value)}
              onClear={() => formik.setFieldValue('notes', '')}
            />
          </FormGrid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
