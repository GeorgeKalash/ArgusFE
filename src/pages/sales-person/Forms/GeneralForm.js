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
import { SaleRepository } from 'src/repositories/SaleRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'

export default function ScheduleForm({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    spRef: '',
    name: '',
    cellPhone:'',
    commissionPct:'',
    segmentRef:'',
    plantId:'',
    sptId:''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)


  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesPerson.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      spRef: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SaleRepository.SalesPerson.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
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
          setIsLoading(true)

          const res = await getRequest({
            extension: SaleRepository.SalesPerson.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.SalesPerson}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
      <Grid item xs={12}>
          <CustomTextField
            name='spRef'
            label={labels[1]}
            value={formik.values.spRef}
            required
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('spRef', '')}
            error={formik.touched.spRef && Boolean(formik.errors.spRef)}
            helperText={formik.touched.spRef && formik.errors.spRef}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels[2]}
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
          <CustomTextField
            name='cellPhone'
            label={labels.cellPhone}
            value={formik.values.cellPhone}
            maxAccess={maxAccess}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (/^[0-9]*$/.test(inputValue)) {
                formik.handleChange(e);
              }
            }}
            onClear={() => formik.setFieldValue('cellPhone', '')}
            error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
            helperText={formik.touched.cellPhone && formik.errors.cellPhone}
          />
        </Grid>
        <Grid item xs={12}>
        <ResourceComboBox
              datasetId={DataSets.TYPE}
              name='type'
              label={labels[3]}
              valueField='key'
              displayField='value'
              values={formik.values}
              required
              readOnly={editMode}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('type', newValue?.key)
              }}
              error={formik.touched.type && Boolean(formik.errors.type)}
              helperText={formik.touched.type && formik.errors.type}
            />
        </Grid>
      </Grid>
    </FormShell>
  )
}