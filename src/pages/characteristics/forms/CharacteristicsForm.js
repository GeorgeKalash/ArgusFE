import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate } from 'src/hooks/resource'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const CharacteristicsForm = ({ labels, editMode, maxAccess, setEditMode, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.CharacteristicsGeneral.qry
  })

  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: null,
    dataType: null,
    propertyName: null,
    isRange: false,
    isMultiple: false,
    allowNegative: false,
    caseSensitive: false,
    textSize: '',
    validFrom: null
  })

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      dataType: yup.string().required(' '),
      propertyName: yup.string().required(' '),
      validFrom: yup.string().required(' ')
    }),
    onSubmit: async values => {
      await postCharacteristics(values)
    }
  })

  const postCharacteristics = async obj => {
    console.log(obj.validFrom)
    const recordId = obj?.recordId || ''
    const date = obj?.validFrom && formatDateToApi(obj?.validFrom)
    const data = { ...obj, validFrom: date }
    console.log(obj.validFrom)
    await postRequest({
      extension: DocumentReleaseRepository.CharacteristicsGeneral.set,
      record: JSON.stringify(data)
    }).then(res => {
      if (!recordId) {
        setEditMode(true)
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
        toast.success('Record Added Successfully')

        formik.setFieldValue('recordId', res.recordId)
        formik.setFieldValue('validFrom', formatDateFromApi(res.validFrom))
        invalidate()
      } else {
        invalidate()
        toast.success('Record Editted Successfully')
      }
    })
  }

  useEffect(() => {
    recordId && getCharacteristicsById(recordId)
  }, [recordId])

  const getCharacteristicsById = recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.CharacteristicsGeneral.get,
      parameters: parameters
    }).then(res => {
      res.record.validFrom = formatDateFromApi(res.record.validFrom)
      formik.setValues(res.record)
      setEditMode(true)
    })
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.Characteristics} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
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
              <ResourceComboBox
                datasetId={DataSets.DR_CHA_DATA_TYPE}
                name='dataType'
                label={labels.dataType}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                onClear={() => formik.setFieldValue('dataType', '')}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dataType', newValue?.key || '')
                }}
                error={formik.touched.dataType && Boolean(formik.errors.dataType)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='propertyName'
                label={labels.propertyName}
                value={formik.values.propertyName}
                required
                onChange={formik.handleChange}
                maxLength='20'
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('propertyName', '')}
                error={formik.touched.propertyName && Boolean(formik.errors.propertyName)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isRange'
                    checked={formik.values?.isRange}
                    onChange={formik.handleChange}
                    maxAccess={maxAccess}
                  />
                }
                label={labels.isRange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isMultiple'
                    checked={formik.values?.isMultiple}
                    onChange={formik.handleChange}
                    maxAccess={maxAccess}
                  />
                }
                label={labels.isMultiple}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='allowNegative'
                    checked={formik.values?.allowNegative}
                    onChange={formik.handleChange}
                    maxAccess={maxAccess}
                  />
                }
                label={labels.allowNegative}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='caseSensitive'
                    checked={formik.values?.caseSensitive}
                    onChange={formik.handleChange}
                    maxAccess={maxAccess}
                  />
                }
                label={labels.caseSensitive}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='textSize'
                label={labels.textSize}
                value={formik.values.textSize}
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                type='number'
                onClear={() => formik.setFieldValue('textSize', '')}
                error={formik.touched.textSize && Boolean(formik.errors.textSize)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='validFrom'
                label={labels.validFrom}
                value={formik.values.validFrom}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('validFrom', '')}
                error={formik.touched.validFrom && Boolean(formik.errors.validFrom)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default CharacteristicsForm
