import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
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
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

export default function JournalVoucherForm({ labels, access, recordId }) {
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.JournalVoucher,
    access: access,
    enabled: !recordId
  })

  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.JournalVoucher.page
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    maxAccess,
    initialValues: {
      recordId: null,
      reference: '',
      date: new Date(),
      notes: '',
      dtId: null,
      status: 1
    },
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        date: formatDateToApi(obj.date),
        recordId: recordId
      }

      const response = await postRequest({
        extension: GeneralLedgerRepository.JournalVoucher.set,
        record: JSON.stringify(data)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
        getData(response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const isRaw = formik.values.status == 1
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      await getData(recordId)
    })()
  }, [])

  const getData = async recordId => {
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
  }

  const onPost = async () => {
    const { ...rest } = formik.values
    const copy = { ...rest }
    copy.date = formatDateToApi(copy.date)

    const res = await postRequest({
      extension: GeneralLedgerRepository.JournalVoucher.post,
      record: JSON.stringify(copy)
    })

    getData(formik.values.recordId)
    toast.success(platformLabels.Added)

    invalidate()
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLJournalVoucher,
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: true,
      onClick: onPost,
      disabled: !isRaw || !editMode
    }
  ]

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.JournalVoucher}
      form={formik}
      functionId={SystemFunction.JournalVoucher}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={!isRaw}
      disabledSavedClear={!isRaw}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.JournalVoucher}&_startAt=${0}&_pageSize=${50}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={editMode || !isRaw}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || '')
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={!editMode && maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode || !isRaw}
                maxAccess={!editMode && maxAccess}
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
                readOnly={!isRaw}
                onChange={formik.setFieldValue}
                value={formik.values.date}
                maxAccess={maxAccess}
                required
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                readOnly={!isRaw}
                maxLength='100'
                rows={3}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
