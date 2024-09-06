import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { DataSets } from 'src/resources/DataSets'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SCRepository } from 'src/repositories/SCRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { replace } from 'stylis'

const ItemForm = ({ tlId, labels, seqNo, getGridData, maxAccess, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    initialValues: {
      seqNo,
      labelTemplateId: tlId,
      itemKey: '',
      displayType: '',
      direction: '',
      x: '',
      y: '',
      scale: '',
      displayAreaWidth: '',
      displayAreaHeight: '',
      fontSize: 0,
      font: ''
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      itemKey: yup.string().required(),
      displayType: yup.string().required(),
      x: yup.string().required(),
      y: yup.string().required(),
      scale: yup.string().required(),
      displayAreaWidth: yup.string().required(),
      displayAreaHeight: yup.string().required()
    }),
    onSubmit: async values => {
      await post(values)
    }
  })

  const post = async obj => {
    await postRequest({
      extension: SCRepository.Item.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!obj.seqNo) {
          toast.success(platformLabels.Added)
        } else toast.success(platformLabels.Edited)

        getGridData(tlId)
        window.close()
      })
      .catch(error => {})
  }

  const getDispersalById = seqNo => {
    const defaultParams = `_seqNo=${seqNo}&_labelTemplateId=${tlId}`
    var parameters = defaultParams
    getRequest({
      extension: SCRepository.Item.get,
      parameters: parameters
    })
      .then(res => {
        if (res?.record?.seqNo) formik.setValues(res.record)
      })
      .catch(error => {})
  }
  useEffect(() => {
    if (seqNo) getDispersalById(seqNo)
  }, [seqNo])

  return (
    <FormShell form={formik} maxAccess={maxAccess} infoVisible={false} isSavedClear={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container gap={2}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={12}>
                <CustomTextField
                  name='itemKey'
                  label={labels.itemKey}
                  value={formik.values?.itemKey}
                  required
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('itemKey', '')}
                  error={formik.touched.itemKey && Boolean(formik.errors.itemKey)}
                  maxAccess={maxAccess}
                />
              </Grid>

              <Grid item xs={12}>
                <ResourceComboBox
                  name='displayType'
                  label={labels.displayType}
                  datasetId={DataSets.SC_LABEL_ITEM_DISPLAY_TYPE}
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  required
                  onChange={(event, newValue) => {
                    formik.setFieldValue('displayType', newValue?.key || '')
                  }}
                  error={formik.touched.displayType && Boolean(formik.errors.displayType)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='font'
                  label={labels.font}
                  value={formik.values.font}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('font', '')}
                  error={formik.touched.font && Boolean(formik.errors.font)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  name='printDirection'
                  label={labels.direction}
                  datasetId={DataSets.PRINT_DIRECTION}
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('printDirection', newValue?.key)
                  }}
                  error={formik.touched.printDirection && Boolean(formik.errors.printDirection)}
                />
              </Grid>

              <Grid item xs={5}>
                <CustomTextField
                  name='x'
                  label={'X'}
                  type='number'
                  value={formik.values.x}
                  required
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('x', '')}
                  error={formik.touched.x && Boolean(formik.errors.x)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={5}>
                <CustomTextField
                  name='displayAreaWidth'
                  type='number'
                  label={labels.displayAreaWidth}
                  value={formik.values.displayAreaWidth}
                  required
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('displayAreaWidth', '')}
                  error={formik.touched.displayAreaWidth && Boolean(formik.errors.displayAreaWidth)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={5}>
                <CustomTextField
                  name='y'
                  label={'Y'}
                  type='number'
                  value={formik.values.y}
                  required
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('y', '')}
                  error={formik.touched.y && Boolean(formik.errors.y)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={5}>
                <CustomTextField
                  name='displayAreaHeight'
                  label={labels.displayAreaHeight}
                  type='number'
                  value={formik.values.displayAreaHeight}
                  required
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('displayAreaHeight', '')}
                  error={formik.touched.displayAreaHeight && Boolean(formik.errors.displayAreaHeight)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={5}>
                <CustomTextField
                  name='scale'
                  label={labels.scale}
                  type='number'
                  value={formik.values.scale}
                  required
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('scale', '')}
                  error={formik.touched.scale && Boolean(formik.errors.scale)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={5}>
                <CustomNumberField
                  name='fontSize'
                  label={labels.fontSize}
                  type='number'
                  value={formik.values.fontSize}
                  required
                  decimalScale={0}
                  readOnly={false}
                  onChange={e => {
                    const inputValue = e.target.value
                    if (inputValue < 0 || inputValue === '') {
                      e.target.value = 0
                    }

                    formik.handleChange(e)
                  }}
                  onClear={() => formik.setFieldValue('fontSize', '')}
                  error={formik.touched.fontSize && Boolean(formik.errors.fontSize)}
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ItemForm
