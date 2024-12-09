import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { FixedAssetsRepository } from 'src/repositories/FixedAssetsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from '../../../repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

export default function LocationForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FixedAssetsRepository.Location.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: null,
      name: '',
      costCenterId: null,
      plantId: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      plantId: yup.string().required()
    }),
    onSubmit: handleSubmit
  })

  async function handleSubmit(values) {
    const response = await postRequest({
      extension: FixedAssetsRepository.Location.set,
      record: JSON.stringify(values)
    })

    if (!values.recordId) {
      toast.success(platformLabels.Added)
      formik.setFieldValue('recordId', response.recordId)
    } else {
      toast.success(platformLabels.Edited)
    }
    invalidate()
  }

  useEffect(() => {
    const fetchRecord = async () => {
      if (recordId) {
        const res = await getRequest({
          extension: FixedAssetsRepository.Location.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    }

    fetchRecord()
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.Location}
      form={formik}
      maxAccess={maxAccess}
      editMode={!!recordId || !!formik.values.recordId}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values?.reference}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                maxLength={10}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values?.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                maxLength={30}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={platformLabels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={GeneralLedgerRepository.CostCenter.qry}
                parameters={`_params=&_startAt=0&_pageSize=200`}
                name='costCenterId'
                label={labels.costCenter}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('costCenterId', newValue?.recordId)
                }}
                error={formik.touched.costCenterId && Boolean(formik.errors.costCenterId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
