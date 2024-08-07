// ** MUI Imports
import { Grid } from '@mui/material'
import { DataSets } from 'src/resources/DataSets'

import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'

import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { useForm } from 'src/hooks/form'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const FeesSceduleForm = ({ labels, editMode, maxAccess, setStore, store, onChange }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.FreeSchedule.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      name: '',
      reference: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      reference: yup.string().required(' ')
    }),
    onSubmit: values => {
      postGroups(values)
    }
  })

  useEffect(() => {
    onChange(formik.values)
  }, [formik.values])

  const postGroups = async obj => {
    const isNewRecord = !obj?.recordId
    try {
      const res = await postRequest({
        extension: RemittanceOutwardsRepository.FreeSchedule.set,
        record: JSON.stringify(obj)
      })

      const message = isNewRecord ? 'Record Added Successfully' : 'Record Edited Successfully'
      toast.success(message)

      if (isNewRecord) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
      }

      invalidate()
    } catch {}
  }

  useEffect(() => {
    if (recordId) {
      getStrategyId(recordId)
    }
  }, [])

  const getStrategyId = recordId => {
    const defaultParams = `_recordId=${recordId}`
    getRequest({
      extension: RemittanceOutwardsRepository.FreeSchedule.get,
      parameters: defaultParams
    })
      .then(res => {
        formik.setValues(res.record)
      })
      .catch(error => {})
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.FeeSchedule} maxAccess={maxAccess} editMode={editMode}>
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
            maxLength='50'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default FeesSceduleForm
