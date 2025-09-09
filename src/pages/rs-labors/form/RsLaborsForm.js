import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { companyStructureRepository } from 'src/repositories/companyStructureRepository'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'

export default function RsLaborsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.RsLabors.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      firstName: '',
      lastName: '',
      userId: null,
      positionId: null,
      allowLogIn: false,
      activeStatus: null
    },
    maxAccess,
    validationSchema: yup.object({
      reference: yup.string().required(),
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      positionId: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.RsLabors.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) formik.setFieldValue('recordId', response.recordId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.RsLabors.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.RsLabors} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.ref}
                value={formik.values.reference}
                maxAccess={maxAccess}
                maxLength='10'
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='firstName'
                label={labels.firstName}
                value={formik.values.firstName}
                required
                maxLength='20'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('firstName', '')}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='lastName'
                label={labels.lastName}
                value={formik.values.lastName}
                required
                maxLength='20'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('lastName', '')}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.CompanyPositions.qry}
                parameters='_filter=&_size=1000&_startAt=0&_sortBy=recordId'
                name='positionId'
                label={labels.positionId}
                required
                valueField='recordId'
                displayField={['positionRef', 'name']}
                columnsInDropDown={[
                  { key: 'positionRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('positionId', newValue?.recordId || null)
                }}
                error={formik.touched.positionId && Boolean(formik.errors.positionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ACTIVE_STATUS}
                name='activeStatus'
                label={labels.activeStatus}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('activeStatus', newValue ? newValue.key : null)
                }}
                maxAccess={maxAccess}
                error={formik.touched.activeStatus && Boolean(formik.errors.activeStatus)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='allowLogIn'
                value={formik.values.allowLogIn}
                onChange={event => {
                  formik.setFieldValue('allowLogIn', event.target.checked)
                  if (!event.target.checked) formik.setFieldValue('userId', null)
                }}
                label={labels.allowLogin}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Users.qry}
                parameters={`_startAt=0&_pageSize=100&_size=50&_sortBy=fullName&_filter=`}
                name='userId'
                readOnly={!formik.values.allowLogIn}
                label={labels.userId}
                valueField='recordId'
                displayField='fullName'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('userId', newValue?.recordId || null)
                }}
                error={formik.touched.userId && Boolean(formik.errors.userId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
