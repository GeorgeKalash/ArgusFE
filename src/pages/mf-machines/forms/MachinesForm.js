import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function MachinesForms({ labels, maxAccess, store, setStore, editMode }) {
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Machine.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      name: '',
      reference: '',
      workCenterId: null,
      workCenterName: '',
      operationId: null,
      operationName: '',
      laborId: null,
      laborName: '',
      minLoadQty: null,
      maxLoadQty: null,
      defaultLoadQty: null,
      lineId: null
    },
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      workCenterId: yup.string().required(),
      minLoadQty: yup.number().min(0).max(999),
      maxLoadQty: yup.number().min(0).max(999),
      defaultLoadQty: yup.number().min(0).max(999)
    }),
    onSubmit: async values => {
      await postRequest({
        extension: ManufacturingRepository.Machine.set,
        record: JSON.stringify(values)
      }).then(res => {
        if (!editMode) {
          formik.setFieldValue('recordId', res.recordId)
          toast.success(platformLabels.Added)
        } else toast.success(platformLabels.Edited)

        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))

        invalidate()
      })
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.Machine.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Machines} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values?.reference}
            required
            maxAccess={maxAccess}
            maxLength='4'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='minLoadQty'
            label={labels.minLoadQty}
            value={formik.values.minLoadQty}
            onChange={formik.handleChange}
            maxLength='3'
            decimalScale={0}
            onClear={() => formik.setFieldValue('minLoadQty', 0)}
            error={formik.touched.minLoadQty && Boolean(formik.errors.minLoadQty)}
          />
        </Grid>
        <Grid item xs={6}>
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
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='maxLoadQty'
            label={labels.maxLoadQty}
            value={formik.values.maxLoadQty}
            onChange={formik.handleChange}
            maxLength='3'
            decimalScale={0}
            onClear={() => formik.setFieldValue('maxLoadQty', 0)}
            error={formik.touched.maxLoadQty && Boolean(formik.errors.maxLoadQty)}
          />
        </Grid>
        <Grid item xs={6}>
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
              formik.setFieldValue('workCenterId', newValue?.recordId || null)
            }}
            error={formik.touched.workCenterId && Boolean(formik.errors.workCenterId)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='defaultLoadQty'
            label={labels.defaultLoadQty}
            maxLength='3'
            decimalScale={0}
            value={formik.values.defaultLoadQty}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('defaultLoadQty', 0)}
            error={formik.touched.defaultLoadQty && Boolean(formik.errors.defaultLoadQty)}
          />
        </Grid>
        <Grid item xs={6}>
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
              formik.setFieldValue('operationId', newValue?.recordId || null)
            }}
            error={formik.touched.operationId && Boolean(formik.errors.operationId)}
          />
        </Grid>
        <Grid item xs={6}>
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
              formik.setFieldValue('lineId', newValue?.recordId || null)
            }}
            error={formik.touched.lineId && Boolean(formik.errors.lineId)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={ManufacturingRepository.Labor.qry}
            parameters={`_startAt=0&_pageSize=200&_params=`}
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
              formik.setFieldValue('laborId', newValue?.recordId || null)
            }}
            error={formik.touched.laborId && Boolean(formik.errors.laborId)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
