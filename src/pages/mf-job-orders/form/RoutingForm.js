import { Grid } from '@mui/material'
import { useForm } from 'src/hooks/form'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

export default function RoutingForm({ labels, maxAccess, obj, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [operationStore, setOperationStore] = useState([])

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      jobId: obj?.recordId,
      seqNo: '',
      seqName: '',
      workCenterId: '',
      operationId: '',
      qty: '',
      qtyIn: '',
      pcs: '',
      pcsIn: ''
    },
    validationSchema: yup.object({
      seqNo: yup.string().required(),
      seqName: yup.string().required(),
      operationId: yup.string().required(),
      workCenterId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        await postRequest({
          extension: AccessControlRepository.UserReleaseCode.set,
          record: JSON.stringify(obj)
        })
        toast.success(platformLabels.Updated)
        window.close()
        invalidate()
      } catch (error) {}
    }
  })

  async function fillOperation(wcId) {
    if (!wcId) {
      setOperationStore([])

      return
    }

    const res = await getRequest({
      extension: ManufacturingRepository.Operation.qry,
      parameters: `_workCenterId=${wcId}&_startAt=0&_pageSize=100&`
    })
    setOperationStore(res?.list || [])
  }
  useEffect(() => {
    ;(async function () {
      if (obj) {
        const res = await getRequest({
          extension: ManufacturingRepository.JobRouting.get,
          parameters: `_jobOrderId=${obj.jobId}&_seqNo=${obj.seqNo}`
        })
        formik.setValues(res?.record)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Users}
      form={formik}
      maxAccess={maxAccess}
      editMode={!!obj.jobId}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomNumberField
                name='seqNo'
                label={labels.seqNo}
                required
                value={formik.values.seqNo}
                maxLength={3}
                onChange={e => formik.setFieldValue('seqNo', e.target.value)}
                onClear={() => formik.setFieldValue('seqNo', '')}
                error={formik.touched.seqNo && Boolean(formik.errors.seqNo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.seqName}
                value={formik?.values?.name}
                maxAccess={maxAccess}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('seqName', '')}
                error={formik.touched.seqName && Boolean(formik.errors.seqName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={ManufacturingRepository.WorkCenter.snapshot}
                valueField='reference'
                displayField='name'
                name='workCenterId'
                label={labels.workCenter}
                form={formik}
                required
                firstValue={formik.values.wcRef}
                secondValue={formik.values.wcName}
                errorCheck={'workCenterId'}
                maxAccess={maxAccess}
                displayFieldWidth={2}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('workCenterId', newValue?.recordId)
                  formik.setFieldValue('wcRef', newValue?.reference)
                  formik.setFieldValue('wcName', newValue?.name)
                  await fillOperation(newValue?.recordId)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                store={operationStore}
                name='operationId'
                label={labels.operation}
                valueField='recordId'
                displayField='name'
                value={formik.values.operationId}
                onChange={(event, newValue) => {
                  formik.setFieldValue('operationId', newValue?.recordId)
                }}
                error={formik.touched.operationId && Boolean(formik.errors.operationId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='qty'
                label={labels.qtyOut}
                value={formik.values.qty}
                readOnly
                onChange={e => formik.setFieldValue('qty', e.target.value)}
                onClear={() => formik.setFieldValue('qty', '')}
                error={formik.touched.qty && Boolean(formik.errors.qty)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='pcs'
                label={labels.pcsOut}
                value={formik.values.pcs}
                readOnly
                onChange={e => formik.setFieldValue('pcs', e.target.value)}
                onClear={() => formik.setFieldValue('pcs', '')}
                error={formik.touched.pcs && Boolean(formik.errors.pcs)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='qtyIn'
                label={labels.qtyIn}
                value={formik.values.qtyIn}
                readOnly
                onChange={e => formik.setFieldValue('qtyIn', e.target.value)}
                onClear={() => formik.setFieldValue('qtyIn', '')}
                error={formik.touched.qtyIn && Boolean(formik.errors.qtyIn)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='pcsIn'
                label={labels.pcsIn}
                value={formik.values.pcsIn}
                readOnly
                onChange={e => formik.setFieldValue('pcsIn', e.target.value)}
                onClear={() => formik.setFieldValue('pcsIn', '')}
                error={formik.touched.pcsIn && Boolean(formik.errors.pcsIn)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
