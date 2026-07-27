import { useEffect } from 'react'
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
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const CashTransferTab = ({ recordId, dtId, refetch, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const { userDefaults } = useContext(DefaultsContext)
  const plantId = parseInt(userDefaults?.list?.find(({ key }) => key === 'plantId')?.value)
  const cashAccountId = parseInt(userDefaults?.list?.find(obj => obj.key === 'cashAccountId')?.value)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CashTransfer.page
  })

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.CashTransfer,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.cashTransfer, window })

  const initialValues = {
    recordId: recordId || null,
    header: {
      dtId: parseInt(dtId),
      reference: '',
      date: new Date(),
      toPlantId: plantId,
      fromPlantId: plantId,
      fromCashAccountId: parseInt(cashAccountId),
      toCashAccountId: null,
      baseAmount: null,
      notes: '',
      wip: 1,
      status: 1,
      releaseStatus: null,
    },
    transfers: [
      {
        id: 1,
        transferId: recordId || 0,
        seqNo: 1,
        currencyId: null,
        amount: null,
        baseAmount: null,
        exRate: null,
        rateCalcMethod: null,
        balance: 0
      }
    ]
  }

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.CashTransfer,
    access,
    enabled: !recordId,
    hasDT: false
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    validationSchema: yup.object({
      header: yup.object({
        fromCashAccountId: yup.number().required(),
        fromPlantId: yup.number().required(),
        date: yup.date().required(),
        toPlantId: yup.number().required(),
        toCashAccountId: yup
          .number()
          .nullable()
          .test('', function (value) {
            const { fromPlantId, toPlantId } = this.parent
            if (fromPlantId == toPlantId) {
              return !!value
            }

            return true
          })
      }),
      transfers: yup
        .array()
        .of(
          yup.object().shape({
            currencyName: yup.string().required(),
            amount: yup.number().nullable().required()
          })
        )
        .required()
    }),
    onSubmit: async values => {
      const updatedRows = formik.values.transfers.map((transferDetail, index) => ({
        ...transferDetail,
        seqNo: index + 1,
        transferId: formik.values.recordId || 0
      }))

      const resultObject = {
        header: {
          ...values.header,
          recordId: values.recordId,
          date: formatDateToApi(values.header.date),
          baseAmount: totalLoc
        },
        items: updatedRows
      }

      const res = await postRequest({
        extension: CashBankRepository.CashTransfer.set,
        record: JSON.stringify(resultObject)
      })

      toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)
      await refetchForm(res.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.header.wip === 2

  const totalLoc = formik.values.transfers.reduce((locSum, row) => {
    const locValue = row.baseAmount || 0

    return locSum + locValue
  }, 0)

  const onClose = async () => {
    const res = await postRequest({
      extension: CashBankRepository.CashTransfer.close,
      record: JSON.stringify({ recordId: formik.values.header.recordId })
    })

    toast.success(platformLabels.Closed)
    invalidate()
    await refetchForm(res?.recordId)
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: CashBankRepository.CashTransfer.reopen,
      record: JSON.stringify({ recordId: formik.values.header.recordId })
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    if (refetch) {
      refetch()
      window.close()
    }
    await refetchForm(res.recordId)
  }

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: CashBankRepository.CashTransfer.get2,
      parameters: `_recordId=${recordId}`
    })

    const header = {
      ...res?.record?.header,
      date: formatDateFromApi(res?.record?.header?.date)
    }

    const transfers = (res?.record?.items || []).map(item => ({
      ...item,
      id: item.seqNo,
      amount: item.amount ? parseFloat(item.amount).toFixed(2) : null,
      balance: item.balance ? parseFloat(item.balance).toFixed(2) : 0
    }))

    formik.resetForm({
      values: {
        recordId,
        header,
        transfers
      }
    })
  }

  const getAccView = async () => {
    if (cashAccountId) {
      const res = await getRequest({
        extension: CashBankRepository.CashAccount.get,
        parameters: `_recordId=${cashAccountId}`
      })
      if (res.record) {
        formik.setFieldValue('header.fromCARef', res.record.accountNo)
        formik.setFieldValue('header.fromCAName', res.record.name)
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
        await refetchForm(recordId)
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
      disabled: !isClosed || !editMode || (formik.values.header.releaseStatus === 3 && formik.values.header.status === 3)
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
      disabled: (editMode && formik.values.header.fromPlantId == formik.values.header.toPlantId) || !editMode
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
      parameters: `_currencyId=${_currencyId}&_date=${formatDateForGetApI(formik.values.header.date)}&_rateDivision=${
        RateDivision.FINANCIALS
      }`
    })
  }

  const columns = [
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
  ]

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
            <Grid container xs={6} spacing={2}>
              <Grid item xs={12}>
                <CustomTextField
                  name='header.reference'
                  label={labels.reference}
                  value={formik?.values?.header?.reference}
                  maxAccess={maxAccess}
                  maxLength='15'
                  readOnly={editMode}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('header.reference', '')}
                  error={formik.touched?.header?.reference && Boolean(formik.errors?.header?.reference)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Plant.qry}
                  name='header.fromPlantId'
                  label={labels.fromPlant}
                  values={formik.values.header}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly
                  required
                  maxAccess={maxAccess}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('header.fromPlantId', newValue?.recordId || null)
                  }}
                  error={formik.touched?.header?.fromPlantId && Boolean(formik.errors?.header?.fromPlantId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={CashBankRepository.CashAccount.qry}
                  parameters={`_type=0`}
                  name='header.fromCashAccountId'
                  label={labels.fromCashAcc}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values.header}
                  readOnly
                  required
                  maxAccess={maxAccess}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('header.fromCashAccountId', newValue?.recordId || null)
                  }}
                  error={formik.touched?.header?.fromCashAccountId && Boolean(formik.errors?.header?.fromCashAccountId)}
                />
              </Grid>
            </Grid>
            <Grid container xs={6} sx={{ px: 2 }} spacing={2}>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='header.date'
                  required
                  readOnly={isClosed}
                  label={labels.date}
                  value={formik?.values?.header?.date}
                  onChange={formik.setFieldValue}
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('header.date', null)}
                  error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Plant.qry}
                  name='header.toPlantId'
                  label={labels.toPlant}
                  values={formik.values.header}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  required
                  readOnly={isClosed}
                  maxAccess={maxAccess}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('header.toPlantId', newValue.recordId || null)
                    formik.setFieldValue('header.toCashAccountId', null)
                    formik.setFieldValue('header.toCARef', null)
                    formik.setFieldValue('header.toCAName', null)
                  }}
                  error={formik.touched?.header?.toPlantId && Boolean(formik.errors?.header?.toPlantId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={CashBankRepository.CashAccount.qry}
                  parameters={`_type=0`}
                  name='header.toCashAccountId'
                  label={labels.toCashAcc}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values.header}
                  required={formik.values.header.fromPlantId === formik.values.header.toPlantId}
                  filter={item => item.plantId === formik.values.header.toPlantId}
                  readOnly={!formik.values.header.toPlantId || isClosed}
                  maxAccess={maxAccess}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('header.toCashAccountId', newValue?.recordId || null)
                  }}
                  error={formik.touched?.header?.toCashAccountId && Boolean(formik.errors?.header?.toCashAccountId)}
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
            initialValues={initialValues?.transfers?.[0]}
            name='currencies'
            columns={columns}
          />
        </Grow>
        <Fixed>
          <FormGrid container xs={7}>
            <CustomTextArea
              name='header.notes'
              label={labels.note}
              value={formik.values.header.notes}
              rows={3}
              readOnly={isClosed}
              maxLength='100'
              editMode={editMode}
              maxAccess={maxAccess}
              onChange={e => formik.setFieldValue('header.notes', e.target.value)}
              onClear={() => formik.setFieldValue('header.notes', '')}
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