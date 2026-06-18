import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const ClassesForm = ({ labels, maxAccess, store, setStore }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.Class.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      name: '',
      characteristicOperator: null
    },
    maxAccess,
    validationSchema: yup.object({
      name: yup.string().required(),
      characteristicOperator: yup.string().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: DocumentReleaseRepository.Class.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) formik.setFieldValue('recordId', res?.recordId)
      setStore(prev => ({ ...prev, recordId: res?.recordId }))
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: DocumentReleaseRepository.Class.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
        setStore(prev => ({ ...prev, recordId: res.record.recordId }))
      }
    })()
  }, [])

  const editMode = !!recordId

  return (
    <FormShell resourceId={ResourceIds.Classes} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.CHAR_OPERATOR}
                name='characteristicOperator'
                label={labels.characteristicOperator}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('characteristicOperator', '')}
                onChange={(event, newValue) => {
                  formik.setFieldValue('characteristicOperator', newValue?.key ?? '')
                }}
                error={formik.touched.characteristicOperator && Boolean(formik.errors.characteristicOperator)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ClassesForm