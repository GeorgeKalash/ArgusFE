import { useContext } from 'react'
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'

import { useEffect } from 'react'
import { FormControlLabel, Checkbox } from '@mui/material'

import * as yup from 'yup'

import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'

const PhysicalForm = ({ labels, editMode, maxAccess, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Physical.qry
  })

  const { platformLabels } = useContext(ControlContext)

  const { recordId } = store

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      itemId: recordId,
      shape: 1,
      diameter: 0,
      isMetal: store.isMetal || false,
      metalColorId: '',
      metalId: store._metalId || '',
      length: 0,
      width: 0,
      depth: 0,
      volume: 0,
      weight: 0,
      density: 0,
      metalPurity: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      metalId: yup
        .string()
        .nullable()
        .test(function (value) {
          const { isMetal } = this.parent

          return isMetal ? value != null && value.trim() !== '' : true
        }),
      metalColorId: yup
        .string()
        .nullable()
        .test(function (value) {
          const { isMetal } = this.parent

          return isMetal ? value != null && value.trim() !== '' : true
        })
    }),

    onSubmit: async values => {
      try {
        await postPhysical(values)
      } catch (error) {}
    }
  })

  const postPhysical = async obj => {
    const isNewRecord = !obj?.itemId

    try {
      const res = await postRequest({
        extension: InventoryRepository.Physical.set,
        record: JSON.stringify(obj)
      })

      if (isNewRecord) {
        toast.success(platformLabels.Added)
      } else {
        toast.success(platformLabels.Edited)
      }
      invalidate()
    } catch {}
  }

  const fetchAndSetValues = async (dirtyField, newValue) => {
    try {
      const parameters = {
        _dirtyField: dirtyField,
        _shape: formik.values.shape || 0,
        _length: formik.values.length || 0,
        _width: formik.values.width || 0,
        _depth: formik.values.depth || 0,
        _diameter: formik.values.diameter || 0,
        _volume: formik.values.volume || 0,
        _weight: formik.values.weight || 0,
        _density: formik.values.density || 0
      }

      if (dirtyField) {
        switch (dirtyField) {
          case 1:
            parameters._length = newValue
            break
          case 2:
            parameters._width = newValue
            break
          case 3:
            parameters._depth = newValue
            break
          case 4:
            parameters._diameter = newValue
            break
          case 5:
            parameters._volume = newValue
            break
          case 6:
            parameters._weight = newValue
            break
          case 7:
            parameters._density = newValue
            break
          default:
            break
        }
      }

      const calc = await getRequest({
        extension: InventoryRepository.Physical.calc,
        parameters: new URLSearchParams(parameters).toString()
      })

      formik.setValues(prevValues => ({
        ...prevValues,
        length: calc.record.length || prevValues.length,
        width: calc.record.width || prevValues.width,
        depth: calc.record.depth || prevValues.depth,
        diameter: calc.record.diameter || prevValues.diameter,
        volume: calc.record.volume || prevValues.volume,
        weight: calc.record.weight || prevValues.weight,
        density: calc.record.density || prevValues.density
      }))
    } catch (error) {}
  }

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: InventoryRepository.Physical.get,
            parameters: `_itemId=${recordId}`
          })

          if (res.record) {
            formik.setValues({ ...res.record, isMetal: !!res.record.isMetal })
          }
        }
      } catch (error) {}
    })()
  }, [recordId])

  const handleFieldChange = (fieldName, dirtyField, value) => {
    const newValue = value === '' ? 0 : value
    formik.setFieldValue(fieldName, newValue)
    fetchAndSetValues(dirtyField, newValue)
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.PhysicalProperty}
      maxAccess={maxAccess}
      editMode={editMode}
      infoVisible={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Items.pack}
                reducer={response => {
                  const formattedShape = response?.record?.shapes.map(shape => ({
                    key: parseInt(shape.key),
                    value: shape.value
                  }))

                  return formattedShape
                }}
                values={formik.values}
                name='shape'
                label={labels.shape}
                valueField='key'
                displayField='value'
                displayFieldWidth={1}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('shape', newValue?.key || '')
                  if (newValue?.key === 1) {
                    formik.setFieldValue('diameter', 0)
                  }
                  if (newValue?.key === 2) {
                    formik.setFieldValue('width', 0)
                    formik.setFieldValue('depth', 0)
                  }
                }}
                error={formik.touched.shape && formik.errors.shape}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomNumberField
                name='diameter'
                label={labels.diameter}
                value={formik.values.diameter}
                maxAccess={maxAccess}
                readOnly={formik.values?.shape === 1}
                onChange={e => handleFieldChange('diameter', 4, e.target.value)}
                onClear={() => handleFieldChange('diameter', 4, 0)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='length'
                label={labels.length}
                value={formik.values.length}
                maxAccess={maxAccess}
                onChange={e => handleFieldChange('length', 1, e.target.value)}
                onClear={() => handleFieldChange('length', 1, 0)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='width'
                label={labels.width}
                readOnly={formik.values?.shape === 2}
                value={formik.values.width}
                maxAccess={maxAccess}
                onChange={e => handleFieldChange('width', 2, e.target.value)}
                onClear={() => handleFieldChange('width', 2, 0)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='depth'
                label={labels.depth}
                value={formik.values.depth}
                readOnly={formik.values?.shape === 2}
                maxAccess={maxAccess}
                onChange={e => handleFieldChange('depth', 3, e.target.value)}
                onClear={() => handleFieldChange('depth', 3, 0)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='volume'
                label={labels.volume}
                value={formik.values.volume}
                maxAccess={maxAccess}
                onChange={e => handleFieldChange('volume', 5, e.target.value)}
                onClear={() => handleFieldChange('volume', 5, 0)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='weight'
                label={labels.weight}
                value={formik.values.weight}
                maxAccess={maxAccess}
                onChange={e => handleFieldChange('weight', 6, e.target.value)}
                onClear={() => handleFieldChange('weight', 6, 0)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='density'
                label={labels.density}
                value={formik.values.density}
                maxAccess={maxAccess}
                onChange={e => handleFieldChange('density', 7, e.target.value)}
                onClear={() => handleFieldChange('density', 7, 0)}
                decimalScale={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isMetal'
                    checked={formik.values.isMetal}
                    onChange={event => {
                      if (!event.target.checked) {
                        formik.setFieldValue('metalId', '')
                        formik.setFieldValue('metalColorId', '')
                        formik.setFieldValue('metalPurity', '')
                        formik.setFieldValue('weight', 0)
                        formik.setFieldValue('density', 0)
                      }
                      formik.setFieldValue('isMetal', event.target.checked)
                    }}
                    maxAccess={maxAccess}
                  />
                }
                label={labels.isMetal}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Items.pack}
                reducer={response => {
                  return response?.record?.metals
                }}
                values={formik.values}
                name='metalId'
                label={labels.metal}
                readOnly={formik.values?.isMetal === false}
                required={formik.values?.isMetal === true}
                valueField='recordId'
                displayField='reference'
                displayFieldWidth={1}
                columnsInDropDown={[{ key: 'reference', value: 'Reference' }]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('metalId', newValue?.recordId || '')
                  formik.setFieldValue('metalPurity', newValue?.purity || '')
                }}
                error={formik.touched.metalId && formik.errors.metalId}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Items.pack}
                reducer={response => {
                  return response?.record?.metalColors
                }}
                values={formik.values}
                name='metalColorId'
                label={labels.metalColor}
                readOnly={formik.values?.isMetal === false}
                valueField='recordId'
                displayField='reference'
                displayFieldWidth={1}
                columnsInDropDown={[{ key: 'reference', value: 'Reference' }]}
                required={formik.values?.isMetal === true}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('metalColorId', newValue?.recordId || '')
                }}
                error={formik.touched.metalColorId && formik.errors.metalColorId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='metalPurity'
                label={labels.metalPurity}
                readOnly
                decimalScale={3}
                value={formik.values.metalPurity}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('metalPurity', '')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default PhysicalForm
