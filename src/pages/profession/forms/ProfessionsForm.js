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
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function ProfessionsForm({ labels, maxAccess, recordId, setStore }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    name: '',
    flName: '',
    monthlyIncome: '',
    riskFactor: '',
    diplomatStatus: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.Profession.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object().shape({
      name: yup.string().required(' '),
      reference: yup.string().required(' '),
      flName: yup.string().required(' '),
      monthlyIncome: yup
        .string()
        .required(' ')
        .test({
          name: 'greaterThanZero',
          exclusive: true,
          message: ' ',
          test: value => parseFloat(value) > 0
        }),
      riskFactor: yup.string().required(' '),
      diplomatStatus: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId
      const data = { ...obj, monthlyIncome: obj.monthlyIncome }

      const response = await postRequest({
        extension: RemittanceSettingsRepository.Profession.set,
        record: JSON.stringify(data)
      })

      if (!recordId) {
        setStore({
          recordId: response.recordId,
          name: obj.name
        })
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj,
          recordId: response.recordId
        })
      } else {
        toast.success('Record Edited Successfully')
        setEditMode(true)
      }
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        setIsLoading(true)

        const res = await getRequest({
          extension: RemittanceSettingsRepository.Profession.get,
          parameters: `_recordId=${recordId}`
        })
        setStore({
          recordId: res.record.recordId,
          name: res.record.name
        })
        setInitialData(res.record)
      }

      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Profession} form={formik} height={300} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            onChange={formik.handleChange}
            maxLength='10'
            maxAccess={maxAccess}
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
        <Grid item xs={12}>
          <CustomTextField
            name='flName'
            label={labels.flName}
            value={formik.values.flName}
            required
            maxLength='50'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('flName', '')}
            error={formik.touched.flName && Boolean(formik.errors.flName)}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomNumberField
            name='monthlyIncome'
            type='text'
            label={labels.monthlyIncome}
            value={formik.values.monthlyIncome}
            required
            maxAccess={maxAccess}
            onChange={e => formik.setFieldValue('monthlyIncome', e.target.value)}
            onClear={() => formik.setFieldValue('monthlyIncome', '')}
            error={formik.touched.monthlyIncome && Boolean(formik.errors.monthlyIncome)}
            maxLength={10}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='riskFactor'
            label={labels.riskFactor}
            value={formik.values.riskFactor}
            required
            type='number'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('riskFactor', '')}
            error={formik.touched.riskFactor && Boolean(formik.errors.riskFactor)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.DIPLOMAT_STATUS}
            name='diplomatStatus'
            label={labels.diplomatStatus}
            valueField='key'
            displayField='value'
            values={formik.values}
            required
            readOnly={editMode}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('diplomatStatus', newValue?.key)
            }}
            error={formik.touched.diplomatStatus && Boolean(formik.errors.diplomatStatus)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
