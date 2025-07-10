import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'

export default function TransactionLogPerformance({ recordId }) {
  const { getRequest } = useContext(RequestsContext)

  const { labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.TransactionLogPerformance
  })

  const { formik } = useForm({
    initialValues: {
      data: null,
      eventDt: null,
      masterRef: null,
      recordId: null,
      resourceId: null,
      resourceName: null,
      ttName: null,
      userName: null
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
              <CustomTextField name='data' value={formik?.values?.data} label={labels.data} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomDateTimePicker name='eventDt' label={labels.eventDt} value={formik?.values?.eventDt} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='masterRef' value={formik?.values?.masterRef} label={labels.masterRef} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='recordId' value={formik?.values?.recordId} label={labels.recordId} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceId'
                value={formik?.values?.resourceId}
                label={labels.resourceId}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceName'
                value={formik?.values?.resourceName}
                label={labels.resourceName}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='ttName' value={formik?.values?.ttName} label={labels.ttName} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField name='userName' value={formik?.values?.userName} label={labels.username} readOnly />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
