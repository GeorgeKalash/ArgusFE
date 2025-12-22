import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SCRepository } from '@argus/repositories/src/repositories/SCRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

export default function StockCountDocumentTypeDefaultForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SCRepository.DocumentTypeDefaults.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      dtId: '',
      disableSKULookup: false
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      dtId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: SCRepository.DocumentTypeDefaults.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', formik.values.dtId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SCRepository.DocumentTypeDefaults.get,
          parameters: `_dtId=${recordId}`
        })

        formik.setValues({ ...res.record, recordId: recordId })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.StockCountDTD}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      functionId={SystemFunction.StockCount}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.StockCount}&_startAt=${0}&_pageSize=${50}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || '')
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='disableSKULookup'
                value={formik.values?.disableSKULookup}
                onChange={event => formik.setFieldValue('disableSKULookup', event.target.checked)}
                label={labels.disableSKULookup}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
