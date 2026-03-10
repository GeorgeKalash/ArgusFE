import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

const ProductDispersalForm = ({ pId, labels, recordId, getGridData, maxAccess, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    initialValues: {
      recordId: null,
      productId: pId,
      reference: null,
      name: null,
      dispersalType: null,
      isDefault: false,
      isInactive: false
    },
    validationSchema: yup.object({
      productId: yup.string().required(),
      reference: yup.string().required(),
      name: yup.string().required(),
      dispersalType: yup.string().required(),
      isDefault: yup.string().required(),
      isInactive: yup.string().required()
    }),
    onSubmit: async values => {
      await post(values)
    }
  })

  const post = async obj => {
    await postRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.set,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success(!obj.recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited))
      window.close()
      getGridData(pId)
    })
  }

  const getDispersalById = id => {
    const _recordId = id
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.get,
      parameters: parameters
    }).then(res => {
      formik.setValues(res.record)
    })
  }
  useEffect(() => {
    recordId && getDispersalById(recordId)
  }, [recordId])

  return (
    <FormShell form={formik} resourceId={ResourceIds.Dispersal} editMode={recordId} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container gap={2}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={labels.reference}
                  value={formik.values.reference}
                  required
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('reference', '')}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                  helperText={formik.touched.reference && formik.errors.reference}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label={labels.name}
                  value={formik.values.name}
                  required
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('name', '')}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  name='dispersalType'
                  label={labels.dispersalType}
                  datasetId={DataSets.RT_Dispersal_Type}
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  required
                  onChange={(event, newValue) => {
                    formik.setFieldValue('dispersalType', newValue?.key)
                  }}
                  error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                  helperText={formik.touched.dispersalType && formik.errors.dispersalType}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomCheckBox
                  name='isDefault'
                  value={formik.values?.isDefault}
                  onChange={event => formik.setFieldValue('isDefault', event.target.checked)}
                  label={labels.isDefault}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomCheckBox
                  name='isInactive'
                  value={formik.values?.isInactive}
                  onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                  label={labels.isInactive}
                  required
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

export default ProductDispersalForm
