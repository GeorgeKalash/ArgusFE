import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SCRepository } from 'src/repositories/SCRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'

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
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      dtId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        await postRequest({
          extension: SCRepository.DocumentTypeDefaults.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', formik.values.dtId)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })
  
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SCRepository.DocumentTypeDefaults.get,
            parameters: `_dtId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (error) {}
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
          <Grid container spacing={4}>
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
              <FormControlLabel
                control={
                  <Checkbox
                    maxAccess={maxAccess}
                    name='disableSKULookup'
                    checked={formik.values?.disableSKULookup}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.disableSKULookup}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
