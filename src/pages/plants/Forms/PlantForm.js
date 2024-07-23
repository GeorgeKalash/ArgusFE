// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import FormShell from 'src/components/Shared/FormShell'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useInvalidate } from 'src/hooks/resource'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'

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
      recordId: recordId || null,
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
      flName: ''
    },
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      name: yup.string().required(' ')
    }),
    onSubmit: values => {
      postPlant(values)
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
    })
      .then(res => {
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
      .catch(error => {})
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
      try {
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
      } catch (error) {}
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
      <Grid container spacing={4}>
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
            maxLength='40'
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
            maxLength='40'
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
            onChange={(event, newValue) => {
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
            onChange={(event, newValue) => {
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
      </Grid>
    </FormShell>
  )
}

export default PlantForm
