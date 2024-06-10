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
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useFormik } from 'formik'
import { useInvalidate } from 'src/hooks/resource'

const PlantForm = ({ _labels, maxAccess, store, setStore, editMode }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Plant.page
  })

  const [initialValues, setInitialData] = useState({
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
    segmentName: null
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: false,
    initialValues,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postPlant(values)
    }
  })

  const postPlant = async obj => {
    await postRequest({
      extension: SystemRepository.Plant.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
          if (!editMode) {
            toast.success('Record Added Successfully')
          } else toast.success('Record Edited Successfully')

          setStore(prevStore => ({
            ...prevStore,
            plant: obj,
            recordId: res.recordId
          }))

          invalidate()
      })
      .catch(error => {})
  }

  useEffect(() => {
    var parameters = `_filter=` + '&_recordId=' + recordId
    if (recordId) {
      getRequest({
        extension: SystemRepository.Plant.get,
        parameters: parameters
      })
        .then(res => {
          var result = res.record
          setInitialData(result)
          setStore(prevStore => ({
            ...prevStore,
            plant: result
          }))
        })
        .catch(error => {})
    }
  }, [recordId])

  return (
    <FormShell form={formik} resourceId={ResourceIds.Plants} maxAccess={maxAccess} editMode={editMode}>
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
            helperText={formik.touched.reference && formik.errors.reference}
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
            helperText={formik.touched.name && formik.errors.name}
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
            helperText={formik.touched.licenseNo && formik.errors.licenseNo}
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
            helperText={formik.touched.crNo && formik.errors.crNo}
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
            helperText={formik.touched.costCenterId && formik.errors.costCenterId}
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
            helperText={formik.touched.groupId && formik.errors.groupId}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default PlantForm
