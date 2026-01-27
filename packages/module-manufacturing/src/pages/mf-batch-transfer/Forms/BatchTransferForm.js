import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useError } from '@argus/shared-providers/src/providers/error'
import JTCheckoutForm from '@argus/shared-ui/src/components/Shared/Forms/JTCheckoutForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

export default function BatchTransferForm({ labels, maxAccess: access, recordId }) {
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()

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
    pcs: row => row?.jobId > 0 && row?.pcs <= row?.jobPcs,
    qty: row => row?.jobId > 0 && row?.qty <= row?.jobQty,
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

      if (header.fromWCId === header.toWCId) {
        stackError({
          message: labels.errorMessage
        })

        return
      }

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

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.BatchTransfer.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    refetchForm(formik.values.recordId)
  }

  async function refetchForm(recordId) {
    if (!recordId) return

    const headerResponse = await getRequest({
      extension: ManufacturingRepository.BatchTransfer.get,
      parameters: `_recordId=${recordId}`
    })

    const header = {
      ...headerResponse?.record,
      date: formatDateFromApi(headerResponse?.record.date)
    }

    const itemsResponse = await getRequest({
      extension: ManufacturingRepository.BatchTransferJob.qry,
      parameters: `_btId=${recordId}`
    })

    formik.setValues({
      ...formik.values,
      recordId: header.recordId,
      header: {
        ...formik.values.header,
        ...header
      },
      items:
        itemsResponse?.list?.length > 0
          ? itemsResponse.list.map((item, index) => ({
              ...item,
              id: index + 1
            }))
          : formik.values.items
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

        const res3 = await getRequest({
          extension: ManufacturingRepository.JobWorkCenter.get,
          parameters: `_jobId=${newRow?.jobId}&_workCenterId=${formik.values?.header?.fromWCId}`
        })

        update({
          jobId: newRow?.jobId || null,
          jobRef: newRow?.jobRef || '',
          itemName: res.record?.itemName || '',
          itemId: res2.record?.itemId || null,
          sku: res2.record?.sku || '',
          itemGroupName: res2.record?.itemGroupName || '',
          pcs: res3.record?.pcs || 0,
          qty: res3.record?.qty || 0,
          jobPcs: res3.record?.pcs || 0,
          jobQty: res3.record?.qty || 0
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
      flex: 1
    },
    {
      component: 'numberfield',
      name: 'pcs',
      label: labels.pcs,
      flex: 1
    },
    {
      component: 'numberfield',
      name: 'jobQty',
      label: labels.jobQty,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'jobPcs',
      label: labels.jobPcs,
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
    },
    {
      component: 'button',
      name: 'jobTransfer',
      label: labels.jobTransfer,
      props: {
        onCondition: row => {
          if (row.transferRef) {
            return {
              imgSrc:  require('@argus/shared-ui/src/components/images/buttonsIcons/popup-black.png').default.src,
              hidden: false,
            }
          } else {
            return {
              imgSrc: '',
              hidden: true
            }
          }
        }
      },
      onClick: (e, row) => {
        stack({
          Component: JTCheckoutForm,
          props: {
            recordId: row?.transferId
          }
        })
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

  const totalQty = formik.values?.items?.reduce((qty, row) => qty + (parseFloat(row.qty) || 0), 0) ?? 0
  const totalPcs = formik.values?.items?.reduce((pcs, row) => pcs + (parseFloat(row.pcs) || 0), 0) ?? 0

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
                    name='header.dtId'
                    label={labels.docType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
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
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.notes'
                    label={labels.notes}
                    value={formik.values.header.notes}
                    maxLength='100'
                    rows={2}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                    error={formik.touched?.header?.notes && Boolean(formik.errors?.header?.notes)}
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
          <Grid container spacing={2} direction='row' wrap='nowrap' sx={{ justifyContent: 'flex-end' }}>
            <Grid item xs={3}>
              <CustomNumberField name='totalQty' label={labels.totalQty} value={totalQty} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='totalPcs' label={labels.totalPcs} value={totalPcs} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}