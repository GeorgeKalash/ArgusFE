import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const PlantForm = ({ _labels, maxAccess, store, setStore, editMode }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId, address } = store

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Plant.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId,
      addressId: null,
      address: null,
      reference: null,
      name: null,
      segmentRef: null,
      licenseNo: null,
      crNo: null,
      costCenterId: null,
      costCenterName: null,
      groupId: null,
      groupName: null,
      segmentName: null,
      flName: '',
      locationUrl: '',
      isInactive: false
    },
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async values => {
      await postPlant(values)
    }
  })

  const postPlant = async obj => {
    const addressId = address?.recordId || null
    if (addressId) {
      obj = { ...obj, addressId }
    }
    await postRequest({
      extension: SystemRepository.Plant.set,
      record: JSON.stringify(obj)
    }).then(res => {
      if (!editMode) {
        formik.setFieldValue('recordId', res.recordId)
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      setStore(prevStore => ({
        ...prevStore,
        plant: obj,
        recordId: res.recordId
      }))

      invalidate()
    })
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SystemRepository.Plant.get,
          parameters: `_recordId=${recordId}`
        })
        var result = res.record
        formik.setValues(result)
        setStore(prevStore => ({
          ...prevStore,
          plant: result
        }))
      }
    })()
  }, [])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Plants}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={_labels?.reference}
                value={formik.values?.reference}
                readOnly={editMode}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                maxLength='4'
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={_labels.name}
                value={formik.values.name}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                maxLength='40'
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='licenseNo'
                label={_labels.licenseNo}
                value={formik.values.licenseNo}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('licenseNo', '')}
                error={formik.touched.licenseNo && Boolean(formik.errors.licenseNo)}
                maxLength='20'
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='crNo'
                label={_labels.commReg}
                value={formik.values.crNo}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('crNo', '')}
                error={formik.touched.crNo && Boolean(formik.errors.crNo)}
                maxLength='20'
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='costCenterId'
                endpointId={GeneralLedgerRepository.CostCenter.qry}
                parameters={`_params=&_startAt=0&_pageSize=1000`}
                label={_labels.costCenter}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('costCenterId', newValue?.recordId)
                }}
                error={formik.touched.costCenterId && Boolean(formik.errors.costCenterId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='groupId'
                endpointId={SystemRepository.PlantGroup.qry}
                label={_labels.plantGrp}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('groupId', newValue?.recordId)
                }}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='flName'
                label={_labels.flName}
                value={formik.values.flName}
                maxLength='30'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('flName', '')}
                error={formik.touched.flName && Boolean(formik.errors.flName)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='locationUrl'
                label={_labels.locationUrl}
                value={formik.values.locationUrl}
                rows={3}
                maxLength='100'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('locationUrl', '')}
                error={formik.touched.locationUrl && Boolean(formik.errors.locationUrl)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isInactive'
                value={formik.values?.isInactive}
                onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                label={_labels.isInactive}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>   
        </Grow>
      </VertLayout>
     
    </FormShell>
  )
}

export default PlantForm
