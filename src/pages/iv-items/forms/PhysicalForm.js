import { useContext, useEffect, useCallback } from 'react'
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

const PhysicalForm = ({ labels, editMode, maxAccess, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Items.snapshot
  })

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
      await submitPhysical(values)
    }
  })

  const submitPhysical = async values => {
    const isNewRecord = !values?.itemId
    await postRequest({
      extension: InventoryRepository.Physical.set,
      record: JSON.stringify(values)
    })

    toast.success(isNewRecord ? platformLabels.Added : platformLabels.Edited)
    invalidate()
  }

  const fetchAndUpdateValues = useCallback(async (dirtyField, newValue) => {
    const parseOrZero = val => parseFloat(val) || 0

    const parameters = {
      _dirtyField: dirtyField,
      _shape: parseOrZero(formik.values.shape),
      _length: parseOrZero(formik.values.length),
      _width: parseOrZero(formik.values.width),
      _depth: parseOrZero(formik.values.depth),
      _diameter: parseOrZero(formik.values.diameter),
      _volume: parseOrZero(formik.values.volume),
      _weight: parseOrZero(formik.values.weight),
      _density: parseOrZero(formik.values.density)
    }

    switch (dirtyField) {
      case 1:
        parameters._length = parseFloat(newValue) || 0
        break
      case 2:
        parameters._width = parseFloat(newValue) || 0
        break
      case 3:
        parameters._depth = parseFloat(newValue) || 0
        break
      case 4:
        parameters._diameter = parseFloat(newValue) || 0
        break
      case 5:
        parameters._volume = parseFloat(newValue) || 0
        break
      case 6:
        parameters._weight = parseFloat(newValue) || 0
        break
      case 7:
        parameters._density = parseFloat(newValue) || 0
        break
      default:
        break
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
  }, [])

  useEffect(() => {
    const fetchRecord = async () => {
      if (recordId) {
        const res = await getRequest({
          extension: InventoryRepository.Physical.get,
          parameters: `_itemId=${recordId}`
        })
        if (res.record) {
          formik.setValues({ ...res.record, isMetal: !!res.record.isMetal })
        }
      }
    }
    fetchRecord()
  }, [recordId])

  const handleFieldChange = (fieldName, dirtyField, event) => {
    const newValue = event?.target?.value
    if (Number(newValue) > 0) {
      formik.setFieldValue(fieldName, newValue)

      if (formik.values[fieldName]?.toString() !== newValue?.toString()) {
        fetchAndUpdateValues(dirtyField, newValue)
      }
    }
  }

  const handleFieldClear = (fieldName, dirtyField) => {
    formik.setFieldValue(fieldName, 0)
    fetchAndUpdateValues(dirtyField, 0)
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Items.pack}
              reducer={response => {
                return response?.record?.shapes?.map(shape => ({
                  key: parseInt(shape.key),
                  value: shape.value
                }))
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
              readOnly={formik.values.shape === 1}
              onMouseLeave={e => handleFieldChange('diameter', 4, e)}
              onClear={() => handleFieldClear('diameter', 4)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='length'
              label={labels.length}
              value={formik.values.length}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('length', 1, e)}
              onClear={() => handleFieldClear('length', 1)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='width'
              label={labels.width}
              readOnly={formik.values.shape === 2}
              value={formik.values.width}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('width', 2, e)}
              onClear={() => handleFieldClear('width', 2)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='depth'
              label={labels.depth}
              value={formik.values.depth}
              readOnly={formik.values.shape === 2}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('depth', 3, e)}
              onClear={() => handleFieldClear('depth', 3)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='volume'
              label={labels.volume}
              value={formik.values.volume}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('volume', 5, e)}
              onClear={() => handleFieldClear('volume', 5)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='weight'
              label={labels.weight}
              value={formik.values.weight}
              maxAccess={maxAccess}
              allowNegative={false}
              onMouseLeave={e => handleFieldChange('weight', 6, e)}
              onClear={() => handleFieldClear('weight', 6)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='density'
              label={labels.density}
              value={formik.values.density}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('density', 7, e)}
              onClear={() => handleFieldClear('density', 7)}
              decimalScale={3}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='isMetal'
              value={formik.values.isMetal}
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
              label={labels.isMetal}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={InventoryRepository.Items.pack}
              reducer={response => response?.record?.metals}
              values={formik.values}
              name='metalId'
              label={labels.metal}
              readOnly={!formik.values.isMetal}
              required={formik.values.isMetal}
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
              reducer={response => response?.record?.metalColors}
              values={formik.values}
              name='metalColorId'
              label={labels.metalColor}
              readOnly={!formik.values.isMetal}
              valueField='recordId'
              displayField='reference'
              displayFieldWidth={1}
              columnsInDropDown={[{ key: 'reference', value: 'Reference' }]}
              required={formik.values.isMetal}
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
      </VertLayout>
    </FormShell>
  )
}

export default PhysicalForm
