import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const FunctionForm = ({ labels, maxAccess, classId, record, window, invalidate }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)


  const { formik } = useForm({
    initialValues: {
      classId,
      functionId: record?.functionId || null,
      strategyId: null
    },
    maxAccess,
    validationSchema: yup.object({
      functionId: yup.string().required(),
      strategyId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: DocumentReleaseRepository.ClassFunction.set,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (record.functionId && classId) {
        const res = await getRequest({
          extension: DocumentReleaseRepository.ClassFunction.get,
          parameters: `_classId=${classId}&_functionId=${record.functionId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SYSTEM_FUNCTION}
                name='functionId'
                label={labels.function}
                required
                valueField='key'
                displayField='value'
                readOnly
                values={formik.values}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('functionId', '')}
                onChange={(_, newValue) => {
                  formik.setFieldValue('functionId', newValue?.key || null)
                }}
                error={formik.touched.functionId && Boolean(formik.errors.functionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={DocumentReleaseRepository.Strategy.qry}
                parameters={`_startAt=0&_pageSize=50`}
                name='strategyId'
                label={labels.strategy}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('strategyId', '')}
                onChange={(_, newValue) => {
                  formik.setFieldValue('strategyId', newValue?.recordId || null)
                }}
                error={formik.touched.strategyId && Boolean(formik.errors.strategyId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default FunctionForm