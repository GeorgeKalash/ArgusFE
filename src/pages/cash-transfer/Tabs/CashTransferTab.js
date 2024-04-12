import { useEffect, useState } from 'react'

// ** MUI Imports
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'

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
import toast from 'react-hot-toast'
import { useError } from 'src/error'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataGrid } from 'src/components/Shared/DataGrid'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import FormGrid from 'src/components/form/layout/FormGrid'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

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
    fromCARef: '',
    fromCAName: '',
    toCashAccountId: '',
    toCARef: '',
    toCAName: '',
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
        balance: ''
      }
    ]
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fromCashAccountId: yup.string().required(),
      fromPlantId: yup.string().required(),
      date: yup.string().required(),
      toPlantId: yup.string().required(),
      toCashAccountId: yup.string().required()
    }),
    onSubmit: async values => {
      const copy = { ...values }
      delete copy.transfers
      copy.date = formatDateToApi(copy.date)

      // Default values for properties if they are empty
      copy.status = copy.status === '' ? 1 : copy.status
      copy.wip = copy.wip === '' ? 1 : copy.wip

      const updatedRows = formik.values.transfers.map((transferDetail, index) => {
        const seqNo = index + 1 // Adding 1 to make it 1-based index

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

  const fillCurrencyTransfer = async (transferId, data) => {
    try {
      var parameters = `_transferId=${transferId}`
      getRequest({
        extension: CashBankRepository.CurrencyTransfer.qry,
        parameters: parameters
      }).then(res => {
        // Create a new list by modifying each object in res.list
        const modifiedList = res.list.map((item, index) => ({
          ...item,
          id: item.seqNo,
          amount: parseFloat(item.amount).toFixed(2)
        }))

        formik.setValues({
          ...data,
          transfers: modifiedList // Update the transfers array directly
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
        formik.setFieldValue('fromCARef', res.record.accountNo)
        formik.setFieldValue('fromCAName', res.record.name)
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

          // Add an empty transfer object to res.record , it's returning error in length object without it when setting values to formik
          res.record.transfers = [
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
          await fillCurrencyTransfer(recordId, res.record)
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
                  if (newValue) {
                    formik.setFieldValue('fromCashAccountId', newValue?.recordId)
                    formik.setFieldValue('fromCARef', newValue?.accountNo)
                    formik.setFieldValue('fromCAName', newValue?.name)
                  } else {
                    formik.setFieldValue('fromCashAccountId', null)
                    formik.setFieldValue('fromCARef', null)
                    formik.setFieldValue('fromCAName', null)
                  }
                }}
                error={formik.touched.fromCashAccountId && Boolean(formik.errors.fromCashAccountId)}
                maxAccess={maxAccess}
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
                  if (newValue) formik.setFieldValue('toPlantId', newValue?.recordId)
                  else formik.setFieldValue('toPlantId', null)
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
                required
                readOnly={!formik.values.toPlantId}
                label={labels.toCashAcc}
                form={formik}
                filter={{ plantId: formik.values.toPlantId }}
                valueShow='toCARef'
                secondValueShow='toCAName'
                viewHelperText={false}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('toCashAccountId', newValue?.recordId)
                    formik.setFieldValue('toCARef', newValue?.accountNo)
                    formik.setFieldValue('toCAName', newValue?.name)
                  } else {
                    formik.setFieldValue('toCashAccountId', null)
                    formik.setFieldValue('toCARef', null)
                    formik.setFieldValue('toCAName', null)
                  }
                }}
                maxAccess={maxAccess}
                error={formik.touched.toCashAccountId && Boolean(formik.errors.toCashAccountId)}
              />
            </Grid>
          </Grid>
          <Grid width={'100%'} sx={{ pt: 5 }}>
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
                  name: 'currencyName',
                  props: {
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
                  displayFieldWidth: 2
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
              />
            </FormGrid>
          </Grid>
        </Grid>
      </FormShell>
    </>
  )
}
