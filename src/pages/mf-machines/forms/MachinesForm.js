// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function MachinesForms({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    name: '',
    workCenterId: '',
    workCenterName: '',
    operationId: '',
    operationName: '',
    laborId: '',
    laborName: '',
    minLoadQty: '',
    maxLoadQty: '',
    defaultLoadQty: '',
    lineId: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Machine.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      workCenterId: yup.string().required(),
      minLoadQty: yup.number().min(0, 'min').max(999, 'max'),
      maxLoadQty: yup.number().min(0, 'min').max(999, 'max'),
      defaultLoadQty: yup.number().min(0, 'min').max(999, 'max')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: ManufacturingRepository.Machine.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: ManufacturingRepository.Machine.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Machines} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container>
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={formik.values.reference}
              required
              maxAccess={maxAccess}
              maxLength='4'
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('reference', '')}
              error={formik.touched.reference && Boolean(formik.errors.reference)}

              // helperText={formik.touched.reference && formik.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={formik.values.name}
              required
              maxAccess={maxAccess}
              maxLength='30'
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('name', '')}
              error={formik.touched.name && Boolean(formik.errors.name)}

              // helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.WorkCenter.qry}
              name='workCenterId'
              label={labels.workCenterId}
              required
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('workCenterId', newValue?.recordId)
                } else {
                  formik.setFieldValue('workCenterId', '')
                }
              }}
              error={formik.touched.workCenterId && Boolean(formik.errors.workCenterId)}

              // helperText={formik.touched.workCenterId && formik.errors.workCenterId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.Operation.qry}
              name='operationId'
              label={labels.operationId}
              parameters={`_startAt=0&_pageSize=200&_workCenterId=0`}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('operationId', newValue?.recordId)
                } else {
                  formik.setFieldValue('operationId', '')
                }
              }}
              error={formik.touched.operationId && Boolean(formik.errors.operationId)}

              // helperText={formik.touched.OperationId && formik.errors.OperationId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.Labor.qry}
              parameters={`_startAt=0&_pageSize=200`}
              name='laborId'
              label={labels.laborId}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('laborId', newValue?.recordId)
                } else {
                  formik.setFieldValue('laborId', '')
                }
              }}
              error={formik.touched.laborId && Boolean(formik.errors.laborId)}

              // helperText={formik.touched.laborId && formik.errors.OperationId}
            />
          </Grid>
        </Grid>
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='minLoadQty'
              label={labels.minLoadQty}
              value={formik.values.minLoadQty}
              type='numeric'
              numberField={true}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('minLoadQty', '')}
              error={formik.touched.minLoadQty && Boolean(formik.errors.minLoadQty)}

              // helperText={formik.touched.minLoadQty && formik.errors.minLoadQty}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='maxLoadQty'
              label={labels.maxLoadQty}
              value={formik.values.maxLoadQty}
              type='numeric'
              numberField={true}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('maxLoadQty', '')}
              error={formik.touched.maxLoadQty && Boolean(formik.errors.maxLoadQty)}

              // helperText={formik.touched.maxLoadQty && formik.errors.maxLoadQty}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='defaultLoadQty'
              label={labels.defaultLoadQty}
              value={formik.values.defaultLoadQty}
              type='numeric'
              numberField={true}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('defaultLoadQty', '')}
              error={formik.touched.defaultLoadQty && Boolean(formik.errors.defaultLoadQty)}

              // helperText={formik.touched.defaultLoadQty && formik.errors.defaultLoadQty}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.ProductionLine.qry}
              name='lineId'
              label={labels.lineId}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('lineId', newValue?.recordId)
                } else {
                  formik.setFieldValue('lineId', '')
                }
              }}
              error={formik.touched.lineId && Boolean(formik.errors.lineId)}

              // helperText={formik.touched.lineId && formik.errors.lineId}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
