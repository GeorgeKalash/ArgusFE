// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'
import { formatDateToApi, formatDateFromApi } from 'src/lib/date-helper'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useForm } from 'src/hooks/form'
import useDocumentType from 'src/hooks/dcocumentReferenceBehaviors'

export default function JournalVoucherForm({ labels, access, recordId, general = {} }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const [responseValue, setResponseValue] = useState(null)
  const [nraId, setNraId] = useState()

  const {
    query: { documentType },
    maxAccess: maxAccess
  } = useDocumentType({
    functionId: SystemFunction.JournalVoucher,
    access: access,
    nraId
  })

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    date: new Date(),
    notes: '',
    currencyId: '',
    dtId: documentType?.dtId,
    status: 1,
    rateCalcMethod: 1,
    exRate: 1
  })
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.JournalVoucher.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required'),
      dtId: yup.string().required('This field is required')
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

  useEffect(() => {
    documentType?.dtId && formik.setFieldValue('dtId', documentType?.dtId)
  }, [documentType?.dtId])

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.JournalVoucher}
      form={formik}
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
            values={formik.values}
            onChange={async (event, newValue) => {
              formik.setFieldValue('dtId', newValue?.recordId)

              setNraId(newValue?.nraId ?? 'naraId')
            }}
            error={formik.touched.dtId && Boolean(formik.errors.dtId)}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            readOnly={editMode}
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
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
            rows={3}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('notes', '')}
            error={formik.touched.notes && Boolean(formik.errors.notes)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
