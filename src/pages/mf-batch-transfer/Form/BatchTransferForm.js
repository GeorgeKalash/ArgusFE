import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from 'src/lib/date-helper'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { createConditionalSchema } from 'src/lib/validation'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

export default function BatchTransferForm({ labels, access, recordId, window }) {
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const workCenterId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'workCenterId')?.value) || null

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.BatchTransfer,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.BatchTransfer.page
  })

  const conditions = {
    jobId: row => row?.jobId,
    pcs: row => row?.pcs > 0,
    qty: row => row?.qty > 0,
    sku: row => row?.sku,
    itemName: row => row?.itemName
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    documentType: { key: 'header.dtId', value: documentType?.dtId, reference: documentType?.reference },
    conditionSchema: ['items'],
    initialValues: {
      recordId: null,
      header: {
        dtId: null,
        reference: '',
        date: new Date(),
        fromWCId: workCenterId,
        toWCId: null,
        notes: '',
        status: 1,
        wip: 1
      },
      items: [
        {
          id: 1,
          jobId: null,
          btId: recordId || 0,
          pcs: 0,
          qty: 0,
          transferRef: null,
          sku: '',
          itemName: '',
          itemGroupId: null
        }
      ]
    },
    maxAccess,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        fromWCId: yup.number().required(),
        toWCId: yup.number().required()
      }),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const { items, header } = obj

      const response = await postRequest({
        extension: ManufacturingRepository.BatchTransfer.set2,
        record: JSON.stringify({
          batchTransfer: header,
          batchTransferJobs: items.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        })
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      refetchForm(response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values?.recordId
  const isPosted = formik?.values?.header?.status === 3

  const getHeaderData = async recordId => {
    if (!recordId) return

    const response = await getRequest({
      extension: ManufacturingRepository.BatchTransfer.get,
      parameters: `_recordId=${recordId}`
    })

    return {
      ...response?.record,
      date: formatDateFromApi(response?.record.date)
    }
  }

  const getItems = async recordId => {
    if (!recordId) return

    const response = await getRequest({
      extension: ManufacturingRepository.BatchTransferJob.qry,
      parameters: `_btId=${recordId}`
    })

    return response?.list?.length > 0
      ? response.list.map((item, index) => {
          return {
            ...item,
            id: index + 1
          }
        })
      : formik.values.items
  }

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.BatchTransfer.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  async function refetchForm(recordId) {
    const header = await getHeaderData(recordId)
    const items = await getItems(recordId)
    formik.setValues({
      ...formik.values,
      recordId: header.recordId,
      header: {
        ...formik.values.header,
        ...header
      },
      items
    })
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.jobOrder,
      name: 'jobId',
      flex: 1,
      props: {
        endpointId: ManufacturingRepository.JobWorkCenter.snapshot,
        parameters: {
          _workCenterId: formik.values?.header?.fromWCId
        },
        displayField: 'jobRef',
        valueField: 'jobRef',
        mapping: [
          { from: 'jobId', to: 'jobId' },
          { from: 'jobRef', to: 'jobRef' }
        ],
        displayFieldWidth: 4,
        readOnly: !formik.values?.header?.fromWCId
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.jobId) return

        const res = await getRequest({
          extension: ManufacturingRepository.MFJobOrder.get,
          parameters: `_recordId=${newRow?.jobId}`
        })

        const res2 = await getRequest({
          extension: ManufacturingRepository.JobWorkCenter.verify,
          parameters: `_jobOrderId=${newRow?.jobId}&_toWcId=${formik.values?.header?.toWCId}`
        })

        update({
          jobId: newRow?.jobId || null,
          jobRef: newRow?.jobRef || '',
          itemName: res.record?.itemName || '',
          itemId: res2.record?.itemId || null,
          sku: res2.record?.sku || '',
          itemGroupName: res2.record?.itemGroupName || '',
          pcs: res.record?.pcs || 0,
          qty: res.record?.qty || 0
        })
      }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemGroup,
      name: 'itemGroupName',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'pcs',
      label: labels.pcs,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.transferRef,
      name: 'transferRef',
      flex: 1,
      props: {
        readOnly: true
      }
    }
  ]

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      disabled: true
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isPosted
    }
  ]

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [recordId])


  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.BatchTransfer}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.BatchTransfer}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='header.dtId'
                    label={labels.docType}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    displayFieldWidth={1.5}
                    values={formik.values.header}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched?.header?.dtId && Boolean(formik.errors?.header?.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik.values.header.reference}
                    readOnly={editMode || !formik.values.header.dtId}
                    maxAccess={!editMode && maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.WorkCenter.qry}
                    name='header.fromWCId'
                    label={labels.fromWC}
                    required
                    valueField='recordId'
                    readOnly={isPosted}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.fromWCId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.fromWCId && formik.errors.header?.fromWCId}
                    maxAccess={maxAccess}
                    displayFieldWidth={1.5}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.WorkCenter.qry}
                    name='header.toWCId'
                    label={labels.toWC}
                    required
                    valueField='recordId'
                    readOnly={isPosted}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.toWCId', newValue?.recordId || null)
                    }}
                    error={formik.touched.header?.toWCId && formik.errors.header?.toWCId}
                    maxAccess={maxAccess}
                    displayFieldWidth={1.5}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    readOnly={isPosted}
                    label={labels.date}
                    value={formik?.values?.header?.date}
                    maxAccess={maxAccess}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            allowDelete={!isPosted}
            disabled={isPosted || formik.values.header?.toWCId === null || formik.values.header?.fromWCId === null}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                maxLength='100'
                rows={2}
                maxAccess={maxAccess}
                readOnly={isPosted}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
