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
import {
  PhysicalPropertyCalculator,
  getPhysicalProperties,
  DIRTYFIELD_LENGTH,
  DIRTYFIELD_WIDTH,
  DIRTYFIELD_DEPTH,
  DIRTYFIELD_DIAMETER,
  DIRTYFIELD_VOLUME,
  DIRTYFIELD_WEIGHT,
  DIRTYFIELD_DENSITY,
  SHAPE_CUBIC,
  SHAPE_CYLINDER
} from 'src/utils/PhysicalPropertyCalc'

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

  const fetchAndUpdateValues = useCallback(
    (dirtyField, newValue) => {
      const parseOrZero = val => parseFloat(val) || 0

      const calculator = new PhysicalPropertyCalculator(
        dirtyField,
        parseOrZero(formik.values.shape),
        parseOrZero(formik.values.length),
        parseOrZero(formik.values.width), // _width
        parseOrZero(formik.values.depth), // _depth
        parseOrZero(formik.values.diameter), // _diameter
        parseOrZero(formik.values.volume), // _volume
        parseOrZero(formik.values.weight), // _weight
        parseOrZero(formik.values.density) // _density
      )

      switch (dirtyField) {
        case DIRTYFIELD_LENGTH:
          calculator.length = parseOrZero(newValue)
          break
        case DIRTYFIELD_WIDTH:
          calculator.width = parseOrZero(newValue)
          break
        case DIRTYFIELD_DEPTH:
          calculator.depth = parseOrZero(newValue)
          break
        case DIRTYFIELD_DIAMETER:
          calculator.diameter = parseOrZero(newValue)
          break
        case DIRTYFIELD_VOLUME:
          calculator.volume = parseOrZero(newValue)
          break
        case DIRTYFIELD_WEIGHT:
          calculator.weight = parseOrZero(newValue)
          break
        case DIRTYFIELD_DENSITY:
          calculator.density = parseOrZero(newValue)
          break
        default:
          break
      }

      const updatedCalc = getPhysicalProperties(calculator)

      formik.setValues(prevValues => ({
        ...prevValues,
        length: updatedCalc.length,
        width: updatedCalc.width,
        depth: updatedCalc.depth,
        diameter: updatedCalc.diameter,
        volume: updatedCalc.volume,
        weight: updatedCalc.weight,
        density: updatedCalc.density
      }))
    },
    [formik]
  )

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
                if (newValue?.key === SHAPE_CUBIC) {
                  formik.setFieldValue('diameter', 0)
                }
                if (newValue?.key === SHAPE_CYLINDER) {
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
              readOnly={formik.values.shape === SHAPE_CUBIC}
              onMouseLeave={e => handleFieldChange('diameter', DIRTYFIELD_DIAMETER, e)}
              onClear={() => handleFieldClear('diameter', DIRTYFIELD_DIAMETER)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='length'
              label={labels.length}
              value={formik.values.length}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('length', DIRTYFIELD_LENGTH, e)}
              onClear={() => handleFieldClear('length', DIRTYFIELD_LENGTH)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='width'
              label={labels.width}
              readOnly={formik.values.shape === SHAPE_CYLINDER}
              value={formik.values.width}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('width', DIRTYFIELD_WIDTH, e)}
              onClear={() => handleFieldClear('width', DIRTYFIELD_WIDTH)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='depth'
              label={labels.depth}
              value={formik.values.depth}
              readOnly={formik.values.shape === SHAPE_CYLINDER}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('depth', DIRTYFIELD_DEPTH, e)}
              onClear={() => handleFieldClear('depth', DIRTYFIELD_DEPTH)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='volume'
              label={labels.volume}
              value={formik.values.volume}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('volume', DIRTYFIELD_VOLUME, e)}
              onClear={() => handleFieldClear('volume', DIRTYFIELD_VOLUME)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='weight'
              label={labels.weight}
              value={formik.values.weight}
              maxAccess={maxAccess}
              allowNegative={false}
              onMouseLeave={e => handleFieldChange('weight', DIRTYFIELD_WEIGHT, e)}
              onClear={() => handleFieldClear('weight', DIRTYFIELD_WEIGHT)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='density'
              label={labels.density}
              value={formik.values.density}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('density', DIRTYFIELD_DENSITY, e)}
              onClear={() => handleFieldClear('density', DIRTYFIELD_DENSITY)}
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
