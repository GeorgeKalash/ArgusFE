import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'

export default function CopyForm({ labels, maxAccess, values, window, setStore, refetchForm }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.BillOfMaterials.page
  })

  const invalidateComponents = useInvalidate({
    endpointId: ManufacturingRepository.Component.qry
  })

  const { formik } = useForm({
    initialValues: {
      name: '',
      reference: '',
      version: ''
    },
    maxAccess,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      version: yup.string().required()
    }),
    onSubmit: async obj => {
      const components = await getRequest({
        extension: ManufacturingRepository.Component.qry,
        parameters: `_bomId=${values.recordId}`
      })

      const response = await postRequest({
        extension: ManufacturingRepository.BillOfMaterials.set,
        record: JSON.stringify({
          ...values,
          ...obj,
          recordId: null
        })
      })
      formik.setFieldValue('recordId', response.recordId)
      setStore(prevStore => ({
        ...prevStore,
        recordId: response.recordId
      }))

      await postRequest({
        extension: ManufacturingRepository.Component.set2,
        record: JSON.stringify({
          components: components.list.map(component => ({
            ...component,
            bomId: response.recordId
          })),
          bomId: response.recordId
        })
      })

      toast.success(platformLabels.Added)

      refetchForm(response.recordId)
      invalidateComponents()

      invalidate()
      window.close()
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.BillOfMaterials}
      form={formik}
      maxAccess={maxAccess}
      editMode={false}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxLength='15'
                maxAccess={maxAccess}
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
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='version'
                label={labels.version}
                value={formik.values.version}
                maxAccess={maxAccess}
                required
                maxLength='10'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('version', '')}
                error={formik.touched.version && Boolean(formik.errors.version)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
