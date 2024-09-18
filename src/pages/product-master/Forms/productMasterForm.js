import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { DataSets } from 'src/resources/DataSets'
import { useContext, useEffect, useState } from 'react'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useForm } from 'src/hooks/form'

const ProductMasterForm = ({ store, setStore, labels, editMode, setEditMode, maxAccess: access }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId: pId } = store
  const { platformLabels } = useContext(ControlContext)

  const { maxAccess, changeDT } = useDocumentType({
    access: access,
    enabled: !pId
  })

  const [initialValues, setData] = useState({
    recordId: null,
    name: null,
    reference: null,
    corId: null,
    corName: null,
    corRef: null,
    languages: null,
    valueDays: null,
    commissionBase: null,
    accessLevel: null,
    interfaceId: null,
    posMsg: null,
    posMsgIsActive: false,
    isInactive: false
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.ProductMaster.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      commissionBase: yup.string().required(),
      isInactive: yup.string().required(),
      accessLevel: yup.string().required()
    }),
    onSubmit: async values => {
      await postProductMaster(values)
    }
  })

  const postProductMaster = async obj => {
    const recordId = obj.recordId
    await postRequest({
      extension: RemittanceSettingsRepository.ProductMaster.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          formik.setFieldValue('recordId', res.recordId)

          toast.success(platformLabels.Added)
          setEditMode(true)
          setStore(prevStore => ({
            ...prevStore,
            recordId: res.recordId
          }))
        } else {
          toast.success(platformLabels.Edited)
        }

        invalidate()
      })
      .catch(error => {})
  }

  useEffect(() => {
    pId && getProductMasterById(pId)
    getDefaultNra()
  }, [pId])

  const getDefaultNra = () => {
    const defaultParams = `_key=rt-nra-product`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Default.get,
      parameters: parameters
    })
      .then(res => {
        res?.record?.value && changeDT({ nraId: res.record.value })
      })
      .catch(error => {})
  }

  const getProductMasterById = pId => {
    const defaultParams = `_recordId=${pId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductMaster.get,
      parameters: parameters
    })
      .then(res => {
        formik.setValues(res.record)
        setEditMode(true)
      })
      .catch(error => {})
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.ProductMaster} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container>
            {/* First Column */}
            <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={labels.reference}
                  value={formik.values.reference}
                  readOnly={editMode}
                  maxAccess={!editMode && maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('reference', '')}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label={labels.name}
                  value={formik.values.name}
                  required
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('name', '')}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='valueDays'
                  label={labels.valueDays}
                  value={formik.values.valueDays}
                  maxLength={1}
                  decimalScale={0}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('valueDays', '')}
                  error={formik.touched.valueDays && Boolean(formik.errors.valueDays)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  name='corId'
                  endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                  label={labels.correspondent}
                  form={formik}
                  valueField='reference'
                  displayField='name'
                  firstValue={formik.values.corRef}
                  secondValue={formik.values.corName}
                  displayFieldWidth={2}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue('corId', newValue?.recordId)
                      formik.setFieldValue('corRef', newValue?.reference)
                      formik.setFieldValue('corName', newValue?.name)
                    } else {
                      formik.setFieldValue('corId', null)
                      formik.setFieldValue('corRef', null)
                      formik.setFieldValue('corName', null)
                    }
                  }}
                  error={formik.touched.corId && Boolean(formik.errors.corId)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  datasetId={DataSets.RT_Language}
                  name='languages'
                  label={labels.languages}
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('languages', newValue?.key)
                  }}
                  error={formik.touched.languages && Boolean(formik.errors.languages)}
                />
              </Grid>
            </Grid>
            {/* Second Column */}
            <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={RemittanceSettingsRepository.Interface.qry}
                  name='interfaceId'
                  label={labels.interface}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('interfaceId', newValue?.recordId)
                  }}
                  error={formik.touched.interfaceId && Boolean(formik.errors.interfaceId)}
                />
              </Grid>

              <Grid item xs={12}>
                <ResourceComboBox
                  datasetId={DataSets.RT_Commission_Base}
                  name='commissionBase'
                  label={labels.commissionBase}
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  required
                  onChange={(event, newValue) => {
                    formik.setFieldValue('commissionBase', newValue?.key)
                  }}
                  error={formik.touched.commissionBase && Boolean(formik.errors.commissionBase)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='posMsg'
                  label={labels.messageToOperator}
                  value={formik.values.posMsg}
                  readOnly={false}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('posMsg', '')}
                  error={formik.errors && Boolean(formik.errors.posMsg)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  datasetId={DataSets.RT_PROD_ACCESS_LEVEL}
                  name='accessLevel'
                  label={labels.accessLevel}
                  required
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('accessLevel', newValue?.key)
                  }}
                  error={formik.touched.accessLevel && Boolean(formik.errors.accessLevel)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='posMsgIsActive'
                      checked={formik.values?.posMsgIsActive}
                      onChange={formik.handleChange}
                    />
                  }
                  label={labels.activateCounterMessage}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox name='isInactive' checked={formik.values?.isInactive} onChange={formik.handleChange} />
                  }
                  label={labels.isInactive}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ProductMasterForm
