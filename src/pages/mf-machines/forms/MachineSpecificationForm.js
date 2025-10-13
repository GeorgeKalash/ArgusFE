import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import Form from 'src/components/Shared/Form'

export default function MachineSpecificationForm({ labels, maxAccess, store }) {
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      machineId: recordId,
      serialNo: null,
      brand: null,
      activationDate: null,
      description: '',
      lifeTimeHours: 0,
      productionYear: null
    },
    validateOnChange: false,
    validationSchema: yup.object({
      serialNo: yup.string().required(),
      lifeTimeHours: yup.number().min(0).max(9999),
      productionYear: yup.number().max(9999).nullable()
    }),
    onSubmit: async values => {
      const response = await postRequest({
        extension: ManufacturingRepository.MachineSpecification.set,
        record: JSON.stringify({
          ...values,
          machineId: recordId,
          activationDate: values.activationDate ? formatDateToApi(values.activationDate) : null
        })
      })

      if (!values.recordId) {
        formik.setFieldValue('recordId', response.recordId)
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)
    }
  })

  const editMode = !!recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.MachineSpecification.get,
          parameters: `_recordId=${recordId}`
        })

        if (!res.record) return
        formik.setValues({
          ...res.record,
          lifeTimeHours: res.record.lifeTimeHours ?? 0,
          activationDate: formatDateFromApi(res.record.activationDate)
        })
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomTextField
            name='serialNo'
            label={labels.serialNo}
            value={formik?.values?.serialNo}
            required
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('serialNo', '')}
            error={formik.touched.serialNo && Boolean(formik.errors.serialNo)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='brand'
            label={labels.brand}
            value={formik?.values?.brand}
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('brand', '')}
            error={formik.touched.brand && Boolean(formik.errors.brand)}
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
          <CustomNumberField
            name='lifeTimeHours'
            label={labels.lifeTimeHours}
            value={formik.values.lifeTimeHours}
            maxAccess={maxAccess}
            maxLength='5'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('lifeTimeHours', '')}
            error={formik.touched.lifeTimeHours && Boolean(formik.errors.lifeTimeHours)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomNumberField
            name='productionYear'
            label={labels.productionYear}
            value={formik.values.productionYear}
            maxAccess={maxAccess}
            maxLength='4'
            decimalScale={0}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('productionYear', '')}
            error={formik.touched.productionYear && Boolean(formik.errors.productionYear)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextArea
            name='description'
            label={labels.description}
            value={formik.values.description}
            maxLength='100'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('description', '')}
            error={formik.touched.description && Boolean(formik.errors.description)}
          />
        </Grid>
      </Grid>
    </Form>
  )
}
