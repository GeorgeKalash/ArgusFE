import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { useForm } from 'src/hooks/form'

export default function PurposeOfExchangeForm({ labels, maxAccess, recordId, setStore }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CurrencyTradingSettingsRepository.PurposeExchange.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      reference: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: CurrencyTradingSettingsRepository.PurposeExchange.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        setStore({
          recordId: response.recordId,
          name: obj.name
        })
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else {
        setStore(prev => ({ ...prev, name: obj.name }))
        toast.success('Record Edited Successfully')
      }
      setEditMode(true)
      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: CurrencyTradingSettingsRepository.PurposeExchange.get,
            parameters: `_recordId=${recordId}`
          })
          setStore({
            recordId: res.record.recordId,
            name: res.record.name
          })
          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PurposeOfExchange} form={formik} maxAccess={maxAccess} editMode={editMode}>
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
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
