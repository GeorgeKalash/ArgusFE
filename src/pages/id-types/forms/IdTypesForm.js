import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate } from 'src/hooks/resource'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

const IdTypesForm = ({ labels, editMode, maxAccess, setEditMode, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: CurrencyTradingSettingsRepository.IdTypes.qry
  })

  const { formik } = useForm({
    maxAccess: maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      recordId: null,
      name: null,
      flName: null,
      format: null,
      length: null,
      category: null,
      clientFileExpiryType: null,
      clientFileLifeTime: null,
      type: null,
      isDiplomat: false,
      isResident: false
    },
    validate: values => {
      const errors = {}
      if (values?.type === '1' && !values.clientFileLifeTime) {
        errors.clientFileLifeTime = ' '
      }

      return errors
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      format: yup.string().required(),
      length: yup.string().required(),
      category: yup.string().required(),
      clientFileExpiryType: yup.string().required(),
      isDiplomat: yup.string().required()
    }),
    onSubmit: async values => {
      await postIdTypes(values)
    }
  })

  const postIdTypes = async obj => {
    const recordId = obj?.recordId || ''

    await postRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.set,
      record: JSON.stringify(obj)
    }).then(res => {
      if (!recordId) {
        setEditMode(true)
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId,
          name: obj.name
        }))

        toast.success(platformLabels.Added)
      } else {
        toast.success(platformLabels.Edited)
        setStore(prevStore => ({
          ...prevStore,
          name: obj.name
        }))
      }
      invalidate()
    })
  }

  useEffect(() => {
    recordId && getIdTypesById(recordId)
  }, [recordId])

  const getIdTypesById = recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.get,
      parameters: parameters
    }).then(res => {
      const result = res.record
      formik.setValues({ ...result, isResident: result.isResident || false })
      setStore(prevStore => ({
        ...prevStore,
        recordId: result.recordId,
        name: result.name
      }))
      setEditMode(true)
    })
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.IdTypes} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
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
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('flName', '')}
            error={formik.touched.flName && Boolean(formik.errors.flName)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='format'
            label={labels.format}
            value={formik.values.format}
            required
            maxLength='20'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('format', '')}
            error={formik.touched.format && Boolean(formik.errors.format)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='length'
            label={labels.length}
            value={formik.values.length}
            required
            type='number'
            minLength='1'
            maxLength='10'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('length', '')}
            error={formik.touched.length && Boolean(formik.errors.length)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.ID_CATEGORY}
            name='category'
            label={labels.category}
            required
            valueField='key'
            displayField='value'
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('type', '')
              formik && formik.setFieldValue('category', parseInt(newValue?.key))
            }}
            error={formik.touched.category && Boolean(formik.errors.category)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.FILE_EMPIRY_TYPE}
            name='clientFileExpiryType'
            label={labels.clientFileExpiryType}
            required
            valueField='key'
            displayField='value'
            values={formik.values}
            onChange={(event, newValue) => {
              formik && formik.setFieldValue('type', newValue?.key)
              formik && formik.setFieldValue('clientFileExpiryType', newValue?.key)
            }}
            error={formik.touched.clientFileExpiryType && Boolean(formik.errors.clientFileExpiryType)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='clientFileLifeTime'
            label={labels.clientFileLifeTime}
            value={formik.values.clientFileLifeTime}
            required={formik.values.clientFileExpiryType === '1' ? true : false}
            readOnly={formik.values.clientFileExpiryType === '1' ? false : true}
            onChange={formik.handleChange}
            maxLength='10'
            maxAccess={maxAccess}
            onClear={() => formik.setFieldValue('clientFileLifeTime', '')}
            error={formik.touched.clientFileLifeTime && Boolean(formik.errors.clientFileLifeTime)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.ID_TYPE}
            name='type'
            label={labels.type}
            required={formik.values.category === 1 && true}
            readOnly={formik.values.category !== 1 && true}
            valueField='key'
            displayField='value'
            values={formik.values}
            onChange={(event, newValue) => {
              formik && formik.setFieldValue('type', newValue?.key)
            }}
            error={formik.touched.type && Boolean(formik.errors.type)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomCheckBox
            name='isDiplomat'
            value={formik.values?.isDiplomat}
            onChange={event => formik.setFieldValue('isDiplomat', event.target.checked)}
            label={labels.isDiplomat}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomCheckBox
            name='isResident'
            value={formik.values?.isResident}
            onChange={event => formik.setFieldValue('isResident', event.target.checked)}
            label={labels.isResident}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default IdTypesForm
