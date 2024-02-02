// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'


export default function SmsTemplatesForms({ labels, maxAccess, recordId }) {
    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(!!recordId)

    const [initialValues, setInitialData] = useState({
        recordId: null,
      })

    const { getRequest, postRequest } = useContext(RequestsContext)

    const invalidate = useInvalidate({
        endpointId: SystemRepository.SMSTemplate.page
      })

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
          siteId: yup.string().required('This field is required'),
        }),
        onSubmit: async obj => {
          const recordId = obj.recordId

          const response = await postRequest({
            extension: InventoryRepository.MaterialsAdjustment.set,
            record: JSON.stringify(obj)
          })

          if (!recordId) {
            toast.success('Record Added Successfully')
            setInitialData({
              ...obj, // Spread the existing properties
              recordId: response.recordId, // Update only the recordId field
            });
          }
          else toast.success('Record Edited Successfully')
          setEditMode(true)

          invalidate()
        }
      })

      useEffect(() => {
        ;(async function () {
          try {
            if (recordId) {
              setIsLoading(true)

              const res = await getRequest({
                extension: InventoryRepository.MaterialsAdjustment.get,
                parameters: `_recordId=${recordId}`
              })

              setInitialData(res.record)
            }
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

    return (
        <FormShell
            resourceId={ResourceIds.MaterialsAdjustment}
            form={formik}
            height={300}
            maxAccess={maxAccess}
            editMode={editMode}
        >
            <Grid container spacing={4}>
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
                    helperText={formik.touched.name && formik.errors.name}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextArea
                    name='smsBody'
                    label={labels.smsBody}
                    value={formik.values.smsBody}
                    required
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('smsBody', '')}
                    error={formik.touched.smsBody && Boolean(formik.errors.smsBody)}
                    helperText={formik.touched.smsBody && formik.errors.smsBody}
                    />
                </Grid>
            </Grid>
        </FormShell>
  )
}

