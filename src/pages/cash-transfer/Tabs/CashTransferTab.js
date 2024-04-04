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
import { CashBankRepository } from 'src/repositories/CashBankRepository'
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
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import FormGrid from 'src/components/form/layout/FormGrid'

export default function CashTransferTab({ labels, recordId, maxAccess, plantId, cashAccountId, dtId }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CashTransfer.snapshot
  })

  const [initialValues, setInitialData] = useState({
    recordId: null,
    dtId: parseInt(dtId),
    reference: '',
    date: new Date(),
    toPlantId: parseInt(plantId),
    fromPlantId: parseInt(plantId),
    fromCashAccountId: parseInt(cashAccountId),
    fromCashAccountRef: '',
    fromCashAccountName: '',
    toCashAccountId: '',
    toCashAccountRef: '',
    toCashAccountName: '',
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
        transferId: recordId,
        seqNo: '',
        currencyId: '',
        currencyName: '',
        currencyRef: '',
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
      const copy = { ...values }
      copy.date = formatDateToApi(copy.date)

      // Default values for properties if they are empty
      copy.status = copy.status === '' ? 1 : copy.status

      const updatedRows = formik.transfers.values.rows.map((transferDetail, index) => {
        const seqNo = index + 1 // Adding 1 to make it 1-based index

        return {
          ...transferDetail,
          seqNo: seqNo,
          transferId: formik.values.recordId || 0
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

  const fillCurrencyTransfer = transferId => {
    try {
      var parameters = `_transferId=${transferId}`
      getRequest({
        extension: CashBankRepository.CurrencyTransfer.qry,
        parameters: parameters
      }).then(res => {
        // Create a new list by modifying each object in res.list
        const modifiedList = res.list.map(item => ({
          ...item,
          amount: parseFloat(item.amount).toFixed(2)
        }))

        formik.transfers.setValues({
          ...formik.transfers.values,
          rows: modifiedList
        })
      })
    } catch (error) {}
  }

  const getAccView = async () => {
    console.log('cashAccountId ', cashAccountId)
    if (cashAccountId) {
      const defaultParams = `_recordId=${cashAccountId}`

      const res = await getRequest({
        extension: CashBankRepository.CashAccount.get,
        parameters: defaultParams
      })
      if (res.record) {
        formik.setFieldValue('fromCashAccountRef', res.record.accountNo)
        formik.setFieldValue('fromCashAccountName', res.record.name)
      }
    }
  }
  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: CashBankRepository.CashTransfer.get,
            parameters: `_recordId=${recordId}`
          })
          res.record.date = formatDateFromApi(res.record.date)
          formik.setValues(res.record)
          fillCurrencyTransfer(recordId)
        }
        getAccView()
      } catch (error) {}
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <FormShell
        resourceId={ResourceIds.CashTransfer}
        form={formik}
        editMode={editMode}
        height={480}
        maxAccess={maxAccess}
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
                readOnly
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
                readOnly={!formik.values.toPlantId}
                label={labels.toCashAcc}
                form={formik}
                filter={{ plantId: formik.values.toPlantId }}
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
              maxAccess={maxAccess}
              columns={[
                {
                  component: 'resourcecombobox',
                  label: labels.currency,
                  name: 'currencyId',
                  props: {
                    endpointId: SystemRepository.Currency.qry,
                    displayField: ['reference', 'name'],
                    valueField: 'recordId',
                    fieldsToUpdate: [
                      { from: 'name', to: 'currencyName' },
                      { from: 'reference', to: 'currencyRef' }
                    ],
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
                maxLength='100'
                editMode={editMode}
                maxAccess={maxAccess}
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
