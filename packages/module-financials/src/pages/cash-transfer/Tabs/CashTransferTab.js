import { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import toast from 'react-hot-toast'
import { useError } from '@argus/shared-providers/src/providers/error'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { LOShipmentForm } from '@argus/shared-ui/src/components/Shared/LOShipmentForm'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import FormGrid from '@argus/shared-ui/src/components/form'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { RateDivision } from '@argus/shared-domain/src/resources/RateDivision'
import { DIRTYFIELD_AMOUNT, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const CashTransferTab = ({ recordId, plantId, cashAccountId, dtId, refetch, window }) => {
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const [isClosed, setIsClosed] = useState(false)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CashTransfer.page
  })

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.CashTransfer,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.cashTransfer, window })

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.CashTransfer,
    access: access,
    enabled: !recordId,
    hasDT: false
  })

  const { formik } = useForm({
    maxAccess,
    initialValues:{
    recordId: recordId || null,
    dtId: parseInt(dtId),
    reference: '',
    date: new Date(),
    toPlantId: parseInt(plantId),
    fromPlantId: parseInt(plantId),
    fromCashAccountId: parseInt(cashAccountId),
    toCashAccountId: '',
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
  },
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
      if (refetch) {
        refetch()
        window.close()
      }
      setIsClosed(false)
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
      }
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
      }
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
                <ResourceComboBox
                  endpointId={CashBankRepository.CashAccount.qry}
                  parameters={`_type=0`}
                  name='fromCashAccountId'
                  label={labels.fromCashAcc}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  readOnly
                  required
                  maxAccess={maxAccess}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('fromCashAccountId', newValue?.recordId || null)
                  }}
                  error={formik.touched.fromCashAccountId && Boolean(formik.errors.fromCashAccountId)}
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
                <ResourceComboBox
                  endpointId={CashBankRepository.CashAccount.qry}
                  parameters={`_type=0`}
                  name='toCashAccountId'
                  label={labels.toCashAcc}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  required={formik.values.fromPlantId === formik.values.toPlantId}
                  filter={item => item.plantId === formik.values.toPlantId}
                  readOnly={!formik.values.toPlantId || isClosed}
                  maxAccess={maxAccess}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('toCashAccountId', newValue?.recordId || null)
                  }}
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
            initialValues={formik?.initialValues?.transfers?.[0]}
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
                    const result = await getCurrencyApi(newRow?.currencyId)
                    update({
                      exRate: result.record?.exRate,
                      rateCalcMethod: result.record?.rateCalcMethod
                    })
                  }
                }
              },
              {
                component: 'numberfield',
                label: labels.amount,
                name: 'amount',
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
                props: { readOnly: true }
              },
              {
                component: 'numberfield',
                name: 'balance',
                label: labels.balance,
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

CashTransferTab.width = 1100
CashTransferTab.height = 650

export default CashTransferTab
