import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ResourceLookup } from 'src/components/Shared//ResourceLookup'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useForm } from 'src/hooks/form'

export default function GroupsForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.Groups.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      nraDescription: '',
      nraRef: '',
      nraId: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      name: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: BusinessPartnerRepository.Groups.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
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
            extension: BusinessPartnerRepository.Groups.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Groups} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            rows={2}
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
          <ResourceLookup
            endpointId={SystemRepository.NumberRange.snapshot}
            form={formik}
            valueField='reference'
            displayField='description'
            name='nraRef'
            label={labels.numberRange}
            secondDisplayField={true}
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
            error={formik.touched.nraId && Boolean(formik.errors.nraId)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
