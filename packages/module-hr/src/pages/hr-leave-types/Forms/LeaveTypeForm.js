import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { LeaveManagementRepository } from '@argus/repositories/src/repositories/LeaveManagementRepository'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

export default function LeaveTypeForm({ labels, maxAccess, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: LeaveManagementRepository.LeaveTypes.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      edId: null,
      isPaid: true,
      leaveTrackTime: null,
      dashboardIcon: 1,
      dayType: null,
    },
    maxAccess,
    validationSchema: yup.object({
      name: yup.string().required(),
      leaveTrackTime: yup.string().required(),
      dayType: yup.string().required(),
      edId: yup
      .number()
      .nullable()
      .when('isPaid', {
        is: false,
        then: () => yup.number().required(),
        otherwise: () => yup.number().nullable()
      })
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: LeaveManagementRepository.LeaveTypes.set,
        record: JSON.stringify(obj)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      window.close()
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: LeaveManagementRepository.LeaveTypes.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.LeaveTypes} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                maxAccess={maxAccess}
                maxLength='10'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='30'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LEAVE_TRACK_TIME}
                name='leaveTrackTime'
                label={labels.leaveTrackTime}
                valueField='key'
                displayField='value'
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('leaveTrackTime', newValue?.key || null)
                }}
                error={formik.touched.leaveTrackTime && Boolean(formik.errors.leaveTrackTime)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={EmployeeRepository.EmployeeDeduction.qry}
                name='edId'
                label={labels.deduction}
                valueField='recordId'
                filter={item => item.type == 2}
                maxAccess={maxAccess}
                displayField='name'
                required={!formik.values.isPaid}
                readOnly={formik.values.isPaid}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('edId', newValue?.recordId || null)
                }}
                error={!formik.values.isPaid && formik.touched.edId && Boolean(formik.errors.edId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.WORKING_DAYS}
                name='dayType'
                label={labels.dayType}
                valueField='key'
                displayField='value'
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('dayType', newValue?.key || null)
                }}
                error={formik.touched.dayType && Boolean(formik.errors.dayType)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isPaid'
                value={formik.values.isPaid}
                onChange={event => {
                  formik.setFieldValue('isPaid', event.target.checked)
                  formik.setFieldValue('edId', null)
                }}
                label={labels.isPaid}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
