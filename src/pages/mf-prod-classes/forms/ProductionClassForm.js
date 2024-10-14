import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function ProductionClassForm({
  labels,
  maxAccess,
  recordId,
  setSelectedRecordId,
  editMode,
  setEditMode
}) {
  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    name: '',
    standardId: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionClass.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      console.log(obj)
      const recordId = obj.recordId

      const response = await postRequest({
        extension: ManufacturingRepository.ProductionClass.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj,
          recordId: response.recordId
        })
        setSelectedRecordId(response.recordId)
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: ManufacturingRepository.ProductionClass.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ProductionClass} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                rows={2}
                maxLength='4'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionStandard.qry}
                name='standardId'
                label={labels.prodStandard}
                valueField='recordId'
                displayField={'reference'}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('standardId', newValue?.recordId)
                }}
                error={formik.touched.standardId && Boolean(formik.errors.standardId)}
                helperText={formik.touched.standardId && formik.errors.standardId}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
