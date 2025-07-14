import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function SyncJobOrderRoutingForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      jobId: null,
      seqNo: null
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      jobId: yup.number().required(),
      seqNo: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.JobRouting.sync,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Updated)
      formik.setValues(obj)
    }
  })

  const actions = [
    {
      key: 'Rebuild',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <FormShell form={formik} actions={actions} isSaved={false} editMode={true} isInfo={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={ManufacturingRepository.MFJobOrder.snapshot}
                filter={{ status: 1 }}
                valueField='reference'
                displayField='reference'
                secondDisplayField={false}
                name='jobId'
                label={_labels.jobOrder}
                form={formik}
                required
                valueShow='jobRef'
                maxAccess={access}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'itemName', value: 'Item Name' },
                  { key: 'description', value: 'Description' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('jobId', newValue?.recordId || null)
                  formik.setFieldValue('jobRef', newValue?.reference || '')
                }}
                errorCheck={'jobId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='seqNo'
                label={_labels.seqNo}
                value={formik.values.seqNo}
                required
                allowNegative={false}
                decimalScale={0}
                maxLength={4}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('seqNo', '')}
                error={formik.touched.seqNo && Boolean(formik.errors.seqNo)}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
