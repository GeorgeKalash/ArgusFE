// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

export default function MachineSpecificationForm({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    machineId: recordId,
    serialNo: null,
    brand: null,
    activationDate: null,
    description: null,
    lifeTimeHours: null,
    productionYear: null
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      serialNo: yup.string().required(),
      lifeTimeHours: yup.number().min(0, 'min').max(9999, 'max'),
      productionYear: yup.number().min(0, 'min').max(9999, 'max')
    }),
    onSubmit: async obj => {
      if (obj.activationDate) {
        obj.activationDate = formatDateToApi(obj.activationDate)
      }
      const machineId = obj.recordId

      const response = await postRequest({
        extension: ManufacturingRepository.MachineSpecification.set,
        record: JSON.stringify(obj)
      })

      if (!machineId) {
        toast.success('Record Added Successfully')

        setInitialData({
          ...obj, // Spread the existing properties
          machineId: response.machineId, // Update only the recordId field
          activationDate: formatDateFromApi(obj.activationDate)
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: ManufacturingRepository.MachineSpecification.get,
            parameters: `_recordId=${recordId}`
          })
          if (res.record) {
            ;(res.record.activationDate = formatDateFromApi(res.record.activationDate)), setInitialData(res.record)
          }
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Machines}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      infoVisible={false}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='serialNo'
            label={labels.serialNo}
            value={formik.values.serialNo}
            required
            maxAccess={maxAccess}
            maxLength='30'
            type='varchar'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('serialNo', '')}
            error={formik.touched.serialNo && Boolean(formik.errors.serialNo)}

            // helperText={formik.touched.serialNo && formik.errors.serialNo}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='brand'
            label={labels.brand}
            value={formik.values.brand}
            maxAccess={maxAccess}
            maxLength='30'
            type='varchar'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('brand', '')}
            error={formik.touched.brand && Boolean(formik.errors.brand)}

            // helperText={formik.touched.brand && formik.errors.brand}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomDatePicker
            name='activationDate'
            label={labels.activationDate}
            value={formik.values?.activationDate}
            onChange={formik.setFieldValue}
            onClear={() => formik.setFieldValue('activationDate', '')}
            error={formik.touched.activationDate && Boolean(formik.errors.activationDate)}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='description'
            label={labels.description}
            value={formik.values.description}
            maxAccess={maxAccess}
            maxLength='200'
            type='varchar'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('description', '')}
            error={formik.touched.description && Boolean(formik.errors.description)}

            // helperText={formik.touched.description && formik.errors.description}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='lifeTimeHours'
            label={labels.lifeTimeHours}
            value={formik.values.lifeTimeHours}
            maxAccess={maxAccess}
            maxLength='5'
            type='numeric'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('lifeTimeHours', '')}
            error={formik.touched.lifeTimeHours && Boolean(formik.errors.lifeTimeHours)}

            // helperText={formik.touched.lifeTimeHours && formik.errors.lifeTimeHours}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='productionYear'
            label={labels.productionYear}
            value={formik.values.productionYear}
            maxAccess={maxAccess}
            type='numeric'
            maxLength='4'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('productionYear', '')}
            error={formik.touched.productionYear && Boolean(formik.errors.productionYear)}

            // helperText={formik.touched.productionYear && formik.errors.productionYear}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
