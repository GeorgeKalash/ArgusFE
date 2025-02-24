import { useContext, useEffect } from 'react'
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
import { DirtyField, GeometricShape, PhysicalPropertyCalculatorCtrl } from 'src/utils/PhysicalPropertyCalc'

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
    console.log(newValue, 'newValue')
    if (Number(newValue) > 0) {
      formik.setFieldValue(fieldName, newValue)

      const updatedValues = {
        length: fieldName === 'length' ? Number(newValue) : Number(formik.values.length),
        width: fieldName === 'width' ? Number(newValue) : Number(formik.values.width),
        depth: fieldName === 'depth' ? Number(newValue) : Number(formik.values.depth),
        diameter: fieldName === 'diameter' ? Number(newValue) : Number(formik.values.diameter),
        volume: Number(formik.values.volume),
        weight: Number(formik.values.weight),
        density: Number(formik.values.density)
      }
      console.log(updatedValues)

      const keys = [
        dirtyField,
        formik.values.shape,
        updatedValues.length,
        updatedValues.width,
        updatedValues.depth,
        updatedValues.diameter,
        updatedValues.volume,
        updatedValues.weight,
        updatedValues.density
      ]

      const ctrl = new PhysicalPropertyCalculatorCtrl()
      const result = ctrl.get(keys)
      console.log(result, 'result')

      formik.setValues(prevValues => ({
        ...prevValues,
        length: result.length,
        width: result.width,
        depth: result.depth,
        diameter: result.diameter,
        volume: result.volume,
        weight: result.weight,
        density: result.density
      }))
    }
  }

  const handleFieldClear = fieldName => {
    formik.setFieldValue(fieldName, 0)
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
                if (newValue?.key === GeometricShape.CUBIC) {
                  formik.setFieldValue('diameter', 0)
                }
                if (newValue?.key === GeometricShape.CYLINDER) {
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
              readOnly={formik.values.shape === GeometricShape.CUBIC}
              onMouseLeave={e => handleFieldChange('diameter', DirtyField.DIAMETER, e)}
              onClear={() => handleFieldClear('diameter')}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='length'
              label={labels.length}
              value={formik.values.length}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('length', DirtyField.LENGTH, e)}
              onClear={() => handleFieldClear('length')}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='width'
              label={labels.width}
              value={formik.values.width}
              maxAccess={maxAccess}
              readOnly={formik.values.shape === GeometricShape.CYLINDER}
              onMouseLeave={e => handleFieldChange('width', DirtyField.WIDTH, e)}
              onClear={() => handleFieldClear('width')}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='depth'
              label={labels.depth}
              value={formik.values.depth}
              maxAccess={maxAccess}
              readOnly={formik.values.shape === GeometricShape.CYLINDER}
              onMouseLeave={e => handleFieldChange('depth', DirtyField.DEPTH, e)}
              onClear={() => handleFieldClear('depth')}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='volume'
              label={labels.volume}
              value={formik.values.volume}
              maxAccess={maxAccess}
              onMouseLeave={e => handleFieldChange('volume', DirtyField.VOLUME, e)}
              onClear={() => handleFieldClear('volume')}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='weight'
              label={labels.weight}
              value={formik.values.weight}
              maxAccess={maxAccess}
              allowNegative={false}
              onMouseLeave={e => handleFieldChange('weight', DirtyField.WEIGHT, e)}
              onClear={() => handleFieldClear('weight')}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='density'
              label={labels.density}
              value={formik.values.density}
              maxAccess={maxAccess}
              decimalScale={3}
              onMouseLeave={e => handleFieldChange('density', DirtyField.DENSITY, e)}
              onClear={() => handleFieldClear('density')}
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
