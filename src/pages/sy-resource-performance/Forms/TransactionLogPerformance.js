import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { formatDateFromApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

export default function TransactionLogPerformance({ recordId }) {
  const { getRequest } = useContext(RequestsContext)

  const { labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.TransactionLogPerformance
  })

  const { formik } = useForm({
    initialValues: {
      data: '',
      eventDt: null,
      masterRef: null,
      recordId: null,
      resourceId: null,
      resourceName: '',
      ttName: '',
      userName: ''
    },
    maxAccess,
    validateOnChange: true
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SystemRepository.TransactionLog.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues({
          ...res.record,
          recordId: recordId,
          eventDt: formatDateFromApi(res.record?.eventDt)
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.TransactionLogPerformance}
      form={formik}
      maxAccess={maxAccess}
      editMode={false}
      isSaved={false}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='userName'
                value={formik?.values?.userName}
                label={labels.username}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='ttName'
                value={formik?.values?.ttName}
                label={labels.ttName}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceId'
                value={formik?.values?.resourceId}
                label={labels.resourceId}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceName'
                value={formik?.values?.resourceName}
                label={labels.resourceName}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='recordId'
                value={formik?.values?.recordId}
                label={labels.recordId}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='masterRef'
                value={formik?.values?.masterRef}
                label={labels.masterRef}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDateTimePicker
                name='eventDt'
                label={labels.eventDt}
                value={formik?.values?.eventDt}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='data'
                label={labels.data}
                value={formik?.values?.data}
                rows={6}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
