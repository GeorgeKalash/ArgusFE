import { Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { useFormik } from 'formik'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const DRGroupForm = ({ labels, editMode, maxAccess, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.DRGroup.qry
  })

  const formik = useFormik({
    validateOnChange: true,
    initialValues: {
      recordId: null,
      name: null,
      reference: null
    },
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async values => {
      await postGroups(values)
    }
  })

  const postGroups = async obj => {
    const isNewRecord = !obj?.recordId

    const res = await postRequest({
      extension: DocumentReleaseRepository.DRGroup.set,
      record: JSON.stringify(obj)
    })

    const message = isNewRecord ? platformLabels.Added : platformLabels.Edited
    toast.success(message)

    if (isNewRecord) {
      formik.setFieldValue('recordId', res.recordId)
      setStore(prevStore => ({
        ...prevStore,
        recordId: res.recordId
      }))
    }

    invalidate()
  }
  useEffect(() => {
    recordId && getGroupId(recordId)
  }, [recordId])

  const getGroupId = recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.DRGroup.get,
      parameters: parameters
    }).then(res => {
      formik.setValues(res.record)
    })
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.DRGroups} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                onChange={formik.handleChange}
                maxLength='10'
                maxAccess={maxAccess}
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
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default DRGroupForm
