import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FormShell from './FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import ResourceComboBox from './ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import * as yup from 'yup'
import { useResourceQuery } from 'src/hooks/resource'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DataSets } from 'src/resources/DataSets'
import toast from 'react-hot-toast'
import CustomNumberField from '../Inputs/CustomNumberField'

export const LOTransportationForm = ({ recordId, functionId, editMode }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      functionId: functionId,
      transporter: '',
      type: '',
      deliveryType: '',
      departurePort: '',
      arrivalPort: '',
      customsNo: '',
      doNo: '',
      grossWgt: '',
      netWgt: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      transporter: yup.string().required(),
      type: yup.string().required(),
      deliveryType: yup.string().required(),
      departurePort: yup.string().required(),
      arrivalPort: yup.string().required(),
      customsNo: yup.string().required(),
      doNo: yup.string().required(),
      grossWgt: yup.string().required(),
      netWgt: yup.string().required()
    }),
    onSubmit: async values => {
      await postRequest({
        extension: LogisticsRepository.Transportation.set,
        record: JSON.stringify(values)
      })

      toast.success('Record Updated Successfully')
    }
  })

  const { labels: labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.LOTransportation
  })

  useEffect(() => {
    ;(async function () {
      if (recordId && functionId) {
        const res = await getRequest({
          extension: LogisticsRepository.Transportation.get,
          parameters: `_recordId=${recordId}&_functionId=${functionId}`
        })
        if (res.record) formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.LOTransportation} form={formik} editMode={true} isCleared={false} isInfo={false}>
      <VertLayout>
        <Grow>
          <Grid container xs={12}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.DELIVERY_TYPE}
                name='deliveryType'
                label={labels.deliveryType}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('deliveryType', newValue ? newValue.key : '')
                }}
                error={formik.touched.deliveryType && Boolean(formik.errors.deliveryType)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TRANSPORTER}
                name='transporter'
                label={labels.transportationType}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('transporter', newValue ? newValue.key : '')
                }}
                error={formik.touched.transporter && Boolean(formik.errors.transporter)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LO_TYPE}
                name='type'
                label={labels.type}
                values={formik.values}
                valueField='key'
                displayField='value'
                readOnly={editMode}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('type', newValue ? newValue.key : '')
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.PORT}
                name='departurePort'
                label={labels.departurePort}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                readOnly={editMode}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('departurePort', newValue ? newValue.key : '')
                }}
                error={formik.touched.departurePort && Boolean(formik.errors.departurePort)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.PORT}
                name='arrivalPort'
                label={labels.arrivalPort}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('arrivalPort', newValue ? newValue.key : '')
                }}
                error={formik.touched.arrivalPort && Boolean(formik.errors.arrivalPort)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='customsNo'
                label={labels.customsNo}
                value={formik.values.customsNo}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('customsNo', '')}
                maxAccess={maxAccess}
                maxLength='20'
                required
                readOnly={editMode}
                error={formik.touched.customsNo && Boolean(formik.errors.customsNo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='doNo'
                label={labels.doNo}
                value={formik.values.doNo}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('doNo', '')}
                maxAccess={maxAccess}
                maxLength='20'
                required
                readOnly={editMode}
                error={formik.touched.doNo && Boolean(formik.errors.doNo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                required
                name='netWgt'
                onChange={formik.handleChange}
                readOnly={editMode}
                label={labels.netWgt}
                value={formik.values.netWgt}
                error={formik.touched.netWgt && Boolean(formik.errors.netWgt)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='grossWgt'
                required
                readOnly={editMode}
                onChange={formik.handleChange}
                label={labels.netGross}
                value={formik.values.grossWgt}
                error={formik.touched.grossWgt && Boolean(formik.errors.grossWgt)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
