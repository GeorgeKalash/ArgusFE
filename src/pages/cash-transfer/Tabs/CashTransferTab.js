import { useEffect, useState } from 'react'

// ** MUI Imports
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useWindow } from 'src/windows'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useInvalidate } from 'src/hooks/resource'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { useError } from 'src/error'
import toast from 'react-hot-toast'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import FormGrid from 'src/components/form/layout/FormGrid'

export default function CashTransferTab({ labels, recordId, maxAccess, plantId, cashAccountId }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [isClosed, setIsClosed] = useState(false)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const invalidate = useInvalidate({
    // endpointId: RemittanceOutwardsRepository.OutwardsTransfer.snapshot
  })

  const [initialValues, setInitialData] = useState({
    recordId: null,
    dtId: '',
    reference: '',
    date: new Date(),
    toPlantId: '',
    fromPlantId: plantId,
    fromCashAccountId: cashAccountId,
    toCashAccountId: '',
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
        transferId: '',
        seqNo: '',
        currencyId: '',
        amount: '',
        balance: ''
      }
    ]
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required('This field is required'),
      toPlantId: yup.string().required('This field is required'),
      toCashAccountId: yup.string().required('This field is required')
    }),
    onSubmit: async values => {
      /*   const copy = { ...values }
      copy.date = formatDateToApi(copy.date)

      // Default values for properties if they are empty
      copy.wip = copy.wip === '' ? 1 : copy.wip
      copy.status = copy.status === '' ? 1 : copy.status

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.set,
        record: JSON.stringify(copy)
      })

      if (res.recordId) {
        toast.success('Record Updated Successfully')
        formik.setFieldValue('recordId', res.recordId)
        setEditMode(true)

        const res2 = await getRequest({
          extension: RemittanceOutwardsRepository.OutwardsTransfer.get,
          parameters: `_recordId=${res.recordId}`
        })
        formik.setFieldValue('reference', res2.record.reference)
        invalidate()
      }*/
    }
  })

  const onClose = async () => {
    /* const obj = formik.values
    const copy = { ...obj }
    copy.date = formatDateToApi(copy.date)

    // Default values for properties if they are empty
    copy.wip = copy.wip === '' ? 1 : copy.wip
    copy.status = copy.status === '' ? 1 : copy.status

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.close,
      record: JSON.stringify(copy)
    })

    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(true)
    }*/
  }

  const onReopen = async () => {
    /*   const obj = formik.values
    const copy = { ...obj }
    copy.date = formatDateToApi(copy.date)

    // Default values for properties if they are empty
    copy.wip = copy.wip === '' ? 1 : copy.wip
    copy.status = copy.status === '' ? 1 : copy.status

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.reopen,
      record: JSON.stringify(copy)
    })

    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(false)
    }*/
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
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          /* const res = await getRequest({
            extension: RemittanceOutwardsRepository.OutwardsTransfer.get,
            parameters: `_recordId=${recordId}`
          })
          setIsClosed(res.record.wip === 2 ? true : false)
          res.record.date = formatDateFromApi(res.record.date)
          formik.setValues(res.record)*/
        }
      } catch (error) {}
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  console.log('fromplantId one', formik.values.fromPlantId)
  console.log('fromplantId two', formik.values.fromCashAccountId)

  return (
    <>
      <FormShell
        resourceId={ResourceIds.CashTransfer}
        form={formik}
        editMode={editMode}
        height={480}
        maxAccess={maxAccess}
        onClose={onClose}
        onReopen={onReopen}
        isClosed={isClosed}
        actions={actions}
        functionId={SystemFunction.Outwards}
      >
        <Grid container sx={{ pt: 2 }}>
          {/* First Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                maxLength='15'
                readOnly={isClosed}
                required
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='fromPlantId'
                label={labels.fromPlant}
                readOnly
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
                valueShow='fromCashAccountRef'
                secondValueShow='fromCashAccountName'
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('fromCashAccountId', newValue?.recordId)
                    formik.setFieldValue('fromCashAccountRef', newValue?.accountNo)
                    formik.setFieldValue('fromCashAccountName', newValue?.name)
                  } else {
                    formik.setFieldValue('fromCashAccountId', null)
                    formik.setFieldValue('fromCashAccountRef', null)
                    formik.setFieldValue('fromCashAccountName', null)
                  }
                }}
                errorCheck={'fromCashAccountId'}
              />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
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
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('toPlantId', newValue?.recordId)
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
                required
                label={labels.toCashAcc}
                form={formik}
                valueShow='toCashAccountRef'
                secondValueShow='toCashAccountName'
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('toCashAccountId', newValue?.recordId)
                    formik.setFieldValue('toCashAccountRef', newValue?.accountNo)
                    formik.setFieldValue('toCashAccountName', newValue?.name)
                  } else {
                    formik.setFieldValue('toCashAccountId', null)
                    formik.setFieldValue('toCashAccountRef', null)
                    formik.setFieldValue('toCashAccountName', null)
                  }
                }}
                errorCheck={'fromCashAccountId'}
              />
            </Grid>
          </Grid>
          <Grid width={'100%'}>
            <DataGrid
              onChange={value => formik.setFieldValue('transfers', value)}
              value={formik.values.transfers}
              error={formik.errors.transfers}
              height={220}
              disabled={isClosed}
              maxAccess={maxAccess}
              name='transfers'
              columns={[
                {
                  component: 'resourcecombobox',
                  label: labels.currency,
                  name: 'currency',
                  props: {
                    endpointId: SystemRepository.Currency.qry,
                    displayField: ['reference', 'name'],
                    valueField: 'recordId',
                    columnsInDropDown: [
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]
                  },

                  flex: 1.5
                },
                {
                  component: 'numberfield',
                  label: labels.amount,
                  name: 'amount',
                  defaultValue: ''
                },
                {
                  component: 'numberfield',
                  name: 'balance',
                  label: labels.balance,
                  defaultValue: ''
                }
              ]}
            />
          </Grid>
          <Grid
            container
            rowGap={1}
            xs={12}
            style={{ marginTop: '5px' }}
            sx={{ flexDirection: 'row', flexWrap: 'nowrap' }}
          >
            {/* First Column (moved to the left) */}
            <FormGrid container rowGap={1} xs={7} style={{ marginTop: '10px' }}>
              <CustomTextArea
                name='notes'
                label={labels.note}
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
          </Grid>
        </Grid>
      </FormShell>
    </>
  )
}
