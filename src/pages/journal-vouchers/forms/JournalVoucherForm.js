// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'
import documentType from 'src/lib/docRefBehaivors'

import { formatDateToApi, formatDateFromApi } from 'src/lib/date-helper'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function JournalVoucherForm({ labels, maxAccess, recordId, general = {} }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)
  const [responseValue, setResponseValue] = useState(null)
  const { reference, dtId, dcTypeRequired } = general
  const [referenceBhv, setReferenceBhv] = useState(false)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    date: new Date(),
    notes: '',
    currencyId: '',
    dtId: dtId,
    status: 1,
    rateCalcMethod: 1,
    exRate: 1
  })
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.JournalVoucher.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: (reference?.mandatory || referenceBhv?.mandatory) && yup.string().required('This field is required'),
      date: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required'),
      dtId: dcTypeRequired && yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        date: formatDateToApi(obj.date),
        recordId: recordId,
        response: responseValue
      }
      try {
        const response = await postRequest({
          extension: GeneralLedgerRepository.JournalVoucher.set,
          record: JSON.stringify(data)
        })

        if (!recordId) {
          toast.success('Record Added Successfully')

          const res = await getRequest({
            extension: GeneralLedgerRepository.JournalVoucher.get,
            parameters: `_recordId=${response.recordId}`
          })

          formik.setValues(res.record)
        } else toast.success('Record Edited Successfully')
        setEditMode(true)

        invalidate()
      } catch (error) {}
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: GeneralLedgerRepository.JournalVoucher.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues({
            ...res.record,

            date: formatDateFromApi(res.record.date)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.JournalVoucher}
      form={formik}
      height={300}
      functionId={SystemFunction.JournalVoucher}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.DocumentType.qry}
            parameters={`_dgId=${SystemFunction.JournalVoucher}&_startAt=${0}&_pageSize=${50}`}
            filter={!editMode ? item => item.activeStatus === 1 : undefined}
            name='dtId'
            label={labels.documentType}
            valueField='recordId'
            displayField='name'
            readOnly={editMode}
            values={formik.values}
            onChange={async (event, newValue) => {
              formik.setFieldValue('dtId', newValue?.recordId)

              const ref = await documentType(getRequest, SystemFunction.JournalVoucher, newValue?.nraId)
              setReferenceBhv(ref.reference)
            }}
            error={formik.touched.dtId && Boolean(formik.errors.dtId)}
            helperText={formik.touched.dtId && formik.errors.dtId}
            maxAccess={maxAccess}
            required={dcTypeRequired}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            readOnly={reference?.readOnly || referenceBhv?.mandatory || editMode}
            required={reference?.mandatory}
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
            helperText={formik.touched.reference && formik.errors.reference}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomDatePicker
            name='date'
            label={labels.date}
            onChange={formik.setFieldValue}
            value={formik.values.date}
            maxAccess={maxAccess}
            required
            error={formik.touched.date && Boolean(formik.errors.date)}

            //  disabledDate={Today}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Currency.qry}
            name='currencyId'
            label={labels.currency}
            valueField='recordId'
            displayField='reference'
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('currencyId', newValue?.recordId)
            }}
            error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
            helperText={formik.touched.currencyId && formik.errors.currencyId}
            maxAccess={maxAccess}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextArea
            name='notes'
            label={labels.notes}
            value={formik.values.notes}
            maxLength='100'
            rows={2}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('notes', '')}
            error={formik.touched.notes && Boolean(formik.errors.notes)}

            // helperText={formik.touched.notes && formik.errors.notes}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
