import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function LotCategoryForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.LotCategory.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      reference: '',
      name: '',
      udt1: '',
      udt2: '',
      udd1: '',
      udd2: '',
      udn1: '',
      udn2: ''
    },
    enableReinitialize: true,
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: InventoryRepository.LotCategory.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else {
        toast.success(platformLabels.Edited)
      }
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: InventoryRepository.LotCategory.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.LotCategories}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.Reference}
                value={formik.values.reference}
                required
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
              <ResourceLookup
                endpointId={SystemRepository.NumberRange.snapshot}
                form={formik}
                valueField='reference'
                displayField='description'
                name='nraRef'
                displayFieldWidth='2'
                label={labels.numberRange}
                secondDisplayField={true}
                display
                secondValue={formik.values.nraDescription}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('nraId', newValue?.recordId)
                    formik.setFieldValue('nraRef', newValue?.reference)
                    formik.setFieldValue('nraDescription', newValue?.description)
                  } else {
                    formik.setFieldValue('nraId', null)
                    formik.setFieldValue('nraRef', '')
                    formik.setFieldValue('nraDescription', '')
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udd1'
                label={labels.userDefinedDate1}
                value={formik.values.udd1}
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('udd1', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udd2'
                label={labels.userDefinedDate2}
                value={formik.values.udd2}
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('udd2', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udt1'
                label={labels.userDefinedText1}
                value={formik.values.udt1}
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('udt1', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udt2'
                label={labels.userDefinedText2}
                value={formik.values.udt2}
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('udt2', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udn1'
                label={labels.userDefinedNumeric1}
                value={formik.values.udn1}
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('udn1', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='udn2'
                label={labels.userDefinedNumeric2}
                value={formik.values.udn2}
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('udn2', '')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
