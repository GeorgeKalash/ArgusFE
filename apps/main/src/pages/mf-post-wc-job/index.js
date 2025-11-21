import { useContext } from 'react'
import * as yup from 'yup'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Grid } from '@mui/material'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'

const PostWorkCenterJob = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.PostWorkCenterJob
  })

  const { formik } = useForm({
    initialValues: {
      jobId: null,
      toWorkCenterId: null,
      workCenterId: null,
      seqNo: 1,
      data: { list: [] }
    },
    maxAccess,
    validationSchema: yup.object({
      workCenterId: yup.number().required(),
      toWorkCenterId: yup
        .number()
        .nullable()
        .when('routingId', {
          is: val => !!val,
          then: () => yup.number().required(),
          otherwise: () => yup.number().nullable()
        })
    }),
    onSubmit: async () => {
      if (!isLocked) {
        await postRequest({
          extension: ManufacturingRepository.JobWorkCenter.close,
          record: JSON.stringify({
            jobId: formik.values.jobId,
            seqNo: formik.values.seqNo,
            workCenterId: formik.values.workCenterId,
            qty: formik.values.qty,
            pcs: formik.values.pcs,
          })
        })
        toast.success(platformLabels.Posted)
        formik.resetForm()
      } else {
        await postRequest({
          extension: ManufacturingRepository.JobWorkCenter.reopen,
          record: JSON.stringify({
            jobId: formik.values.jobId,
            seqNo: formik.values.seqNo,
            workCenterId: formik.values.workCenterId
          })
        })
        toast.success(platformLabels.Unposted)
        formik.resetForm()
      }
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.documentRef,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: labels.documentTypeName,
      flex: 1
    },
    {
      field: 'wipQty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'loss',
      headerName: labels.loss,
      flex: 1,
      type: 'number'
    },
    {
      field: 'wipPcs',
      headerName: labels.pcs,
      flex: 1,
      type: 'number'
    }
  ]

  const isLocked = formik.values.status === 1
  const hasDraftItems = formik?.values?.data?.list?.length > 0

  const actions = [
    {
      key: 'Unlocked',
      condition: !isLocked,
      onClick: formik.handleSubmit,
      disabled: hasDraftItems || !formik.values.jobId
    },
    {
      key: 'Locked',
      condition: isLocked,
      onClick: 'onUnpostConfirmation',
      onSuccess: formik.handleSubmit,
      disabled: false
    }
  ]

  const getJobRouting = async (recordId, seqNo) => {
    if (!recordId) return

    const response = await getRequest({
      extension: ManufacturingRepository.JobRouting.get,
      parameters: `_jobOrderId=${recordId}&_seqNo=${seqNo}`
    })

    return response?.record
  }

  const getData = async (newValue, routingSeqNo) => {
    const response = await getRequest({
      extension: ManufacturingRepository.Worksheet.draft,
      parameters: `_jobId=${newValue.recordId}&_seqNo=${routingSeqNo}`
    })

    return response?.list
  }

  const fillForm = async newValue => {
    if (newValue) {
      await getRequest({
        extension: ManufacturingRepository.MFJobOrder.get,
        parameters: `_recordId=${newValue?.recordId}`
      }).then(async jobRes => {
        if (jobRes?.record?.routingSeqNo) {
          formik.setValues({
            ...formik.values,
            ...jobRes?.record,
            workCenterId: jobRes?.record?.workCenterId || '',
            workCenterName: jobRes?.record?.wcName || '',
            workCenterRef: jobRes?.record?.wcRef || '',
            pcs: jobRes?.record?.pcs || 0,
            pcsIn: jobRes?.record?.expectedPcs || 0,
            qty: jobRes?.record?.qty || 0,
            qtyIn: jobRes?.record?.expectedQty || 0,
            jobId: jobRes?.record?.recordId || null,
            jobRef: jobRes?.record?.reference || '',
            documentTypeID: jobRes?.record?.dtName || null
          })
          getJobRouting(jobRes?.record?.recordId, jobRes?.record?.routingSeqNo).then(routingRes => {
            formik.setFieldValue('status', routingRes?.status || null)
            formik.setFieldValue('statusName', routingRes?.statusName)
            formik.setFieldValue('seqNo', jobRes?.record?.routingSeqNo)
          })

          getData(newValue, jobRes?.record?.routingSeqNo).then(res => {
            formik.setFieldValue('data', { list: res })
          })

          const res = await getRequest({
            extension: ManufacturingRepository.JobRouting.get,
            parameters: `_jobOrderId=${newValue?.recordId}&_seqNo=${parseInt(jobRes?.record?.routingSeqNo) + 1}`
          })
          formik.setFieldValue('toWorkCenterId', res?.record?.workCenterId || null)
          formik.setFieldValue('toWorkCenterName', res?.record?.workCenterName || '')
          formik.setFieldValue('toWorkCenterRef', res?.record?.workCenterRef || '')
        } else {
          formik.setValues({
            ...formik.values,
            ...jobRes?.record,
            workCenterId: null,
            workCenterName: '',
            workCenterRef: '',
            toWorkCenterId: null,
            pcs: jobRes?.record?.pcs || 0,
            pcsIn: jobRes?.record?.expectedPcs || 0,
            qty: jobRes?.record?.qty || 0,
            qtyIn: jobRes?.record?.expectedQty || 0,
            jobId: jobRes?.record?.recordId || null,
            jobRef: jobRes?.record?.reference || '',
            documentTypeID: jobRes?.record?.dtName || null,
            seqNo: 1
          })
        }
      })
    } else {
      formik.resetForm()
    }
  }

  return (
    <FormShell
      resourceId={ResourceIds.PostWorkCenterJob}
      actions={actions}
      form={formik}
      maxAccess={maxAccess}
      isParentWindow={false}
      isInfo={false}
      isSaved={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} padding={2}>
            <Grid item xs={3}>
              <ResourceLookup
                endpointId={ManufacturingRepository.MFJobOrder.snapshot}
                valueField='reference'
                displayField='reference'
                secondDisplayField={false}
                name='jobId'
                label={labels.jobReference}
                form={formik}
                valueShow='jobRef'
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'itemName', value: 'Item Name' }
                ]}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('jobRef', newValue?.reference || '')
                  formik.setFieldValue('routingId', newValue?.routingId || null)
                  formik.setFieldValue('jobId', newValue?.recordId || null)
                  fillForm(newValue)
                }}
                errorCheck={'jobId'}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='documentTypeID'
                label={labels.documentTypeID}
                value={formik.values.documentTypeID}
                readOnly
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <CustomTextField name='sku' label={labels.sku} value={formik.values.sku} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField name='itemName' label={labels.itemName} value={formik.values.itemName} readOnly />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <CustomTextField name='routingRef' label={labels.routing} value={formik.values.routingRef} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField name='routingName' label={labels.name} value={formik.values.routingName} readOnly />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={
                  formik?.values?.jobId
                    ? formik?.values?.routingId
                      ? ManufacturingRepository.JobRouting.qry
                      : ManufacturingRepository.JobWorkCenter.qry
                    : null
                }
                parameters={
                  formik.values.jobId
                    ? `_jobId=${formik.values.jobId}${
                        formik.values.routingId ? '&_workCenterId=0&_status=0&_params=' : ''
                      }`
                    : ''
                }
                name='workCenterId'
                label={labels.fromWorkCenter}
                readOnly={!!formik?.values?.routingId || !formik.values.jobId}
                valueField='workCenterId'
                displayField={['workCenterRef', 'workCenterName']}
                values={formik.values}
                columnsInDropDown={[
                  { key: 'workCenterRef', value: 'Reference' },
                  { key: 'workCenterName', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('workCenterId', newValue?.workCenterId || null)
                }}
                required
                maxAccess={maxAccess}
                error={formik.touched.workCenterId && formik.errors.workCenterId}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={
                  formik?.values?.jobId
                    ? formik?.values?.routingId
                      ? ManufacturingRepository.JobRouting.qry
                      : ManufacturingRepository.JobWorkCenter.qry
                    : null
                }
                parameters={
                  formik.values.jobId
                    ? `_jobId=${formik.values.jobId}${
                        formik.values.routingId ? '&_workCenterId=0&_status=0&_params=' : ''
                      }`
                    : ''
                }
                name='toWorkCenterId'
                label={labels.toWorkCenter}
                readOnly
                valueField='workCenterId'
                displayField={['workCenterRef', 'workCenterName']}
                values={formik.values}
                columnsInDropDown={[
                  { key: 'workCenterRef', value: 'Reference' },
                  { key: 'workCenterName', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('toWorkCenterId', newValue?.workCenterId || null)
                }}
                required={formik.values.routingId}
                maxAccess={maxAccess}
                error={formik.touched.toWorkCenterId && formik.errors.toWorkCenterId}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <CustomNumberField name='qtyIn' label={labels.qtyIn} value={formik.values.qtyIn} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='qty' label={labels.qtyOut} value={formik.values.qty} readOnly />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <CustomNumberField name='pcsIn' label={labels.pcsIn} value={formik.values.pcsIn} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='pcs' label={labels.pcsOut} value={formik.values.pcs} readOnly />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <CustomTextField name='statusName' label={labels.status} value={formik.values.statusName} readOnly />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={formik?.values?.data}
            rowId={['recordId']}
            isLoading={false}
            pagination={false}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default PostWorkCenterJob
