import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ImageUpload from '@argus/shared-ui/src/components/Inputs/ImageUpload'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { useError } from '@argus/shared-providers/src/providers/error'

export default function JTCheckoutForm({ recordId, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  
  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.JTCheckOut,
    editMode: !!recordId
  })
  const { stack: stackError } = useError()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.JTCheckOut,
    access,
    enabled: !recordId,
    objectName: 'transfer'
  })
  
  useSetWindow({ title: labels.jobTransfer, window })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.JobTransfer.page
  })

  const { formik } = useForm({
    documentType: { key: 'transfer.dtId', value: documentType?.dtId },
    initialValues: {
      recordId: recordId,
      transfer: {
        dtId: null,
        recordId: null,
        reference: '',
        status: 1,
        date: new Date(),
        jobId: null,
        itemId: null,
        fromWCId: null,
        toWCId: null,
        designId: null,
        jobQty: 0.0,
        qty: 0.0,
        pcs: 0.0,
        fromSeqNo: null,
        toSeqNo: null,
        wip: 1,
        routingSeq: null,
        jobDescription: '',
        sku: '',
        designRef: '',
        itemNmae: '',
        designName: ''
      },
      categorySummary: []
    },
    maxAccess,
    validationSchema: yup.object({
      transfer: yup.object({
        date: yup.string().required(),
        jobId: yup.number().required(),
        fromWCId: yup.string().required(),
        toWCId: yup.number().required(),
        qty: yup.number().test('max-qty', 'Quantity exceeds maximum allowed', function (value) {
          const { maxQty } = this.parent

          return maxQty === undefined || parseFloat(value) <= maxQty
        }),
        pcs: yup.number().test('max-pcs', 'Pieces exceed maximum allowed', function (value) {
          const { maxPcs } = this.parent

          return maxPcs === undefined || parseFloat(value) <= maxPcs
        })
      })
    }),
    onSubmit: async obj => {
      const round = (n, decimals = 3) => Number(n.toFixed(decimals))

      const hasTotalQty = totalQty !== null && totalQty !== undefined
      const hasJobQty = obj?.transfer?.jobQty !== null && obj?.transfer?.jobQty !== undefined

      if (hasTotalQty && hasJobQty) {
        const delta = Math.abs(round(Number(totalQty)) - round(Number(obj.transfer.jobQty)))

        if (delta > 0.01) {
          stackError({
            message: labels.QtyNotMatching
          })

          return
        }
      }

      const transferPack = {
        transfer: {
          ...obj.transfer,
          date: formatDateToApi(obj.transfer.date)
        },
        categorySummary: obj.categorySummary
      }

      await postRequest({
        extension: ManufacturingRepository.JobTransfer.set2,
        record: JSON.stringify(transferPack)
      }).then(async res => {
        getData(res?.recordId)
        toast.success(obj?.recordId ? platformLabels.Edited : platformLabels.Added)
        invalidate()
      })
    }
  })

  const getData = async recordId => {
    if (!recordId) return

    await getRequest({
      extension: ManufacturingRepository.JobTransfer.get2,
      parameters: `_recordId=${recordId}`
    }).then(async res => {
      formik.setValues({
        ...formik.values,
        recordId: res?.record?.transfer?.recordId || null,
        transfer: {
          ...res?.record?.transfer,
          date: formatDateFromApi(res?.record?.transfer?.date),
          maxQty: res?.record?.transfer.qty,
          maxPcs: res?.record?.transfer.pcs,
          workCenterId: res?.record?.transfer?.fromWCId
        },
        categorySummary: res?.record?.categorySummary || []
      })
    })
  }

  useEffect(() => {
    getData(recordId)
  }, [])

  const totalQty =
    formik?.values?.categorySummary != [] ? formik?.values?.categorySummary?.reduce((op, item) => op + item?.qty, 0) : 0

  const editMode = !!formik?.values?.transfer?.recordId
  const isPosted = formik.values.transfer.status === 3
  const isClosed = formik.values.transfer.wip === 2

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.JobTransfer.post,
      record: JSON.stringify({
        ...formik.values.transfer,
        date: formatDateToApi(formik?.values?.transfer?.date) || null
      })
    }).then(async () => {
      await getData(formik?.values?.transfer?.recordId)
      invalidate()
      toast.success(platformLabels.Posted)
      window.close()
    })
  }

  async function onClose() {
    await postRequest({
      extension: ManufacturingRepository.JobTransfer.close,
      record: JSON.stringify({
        ...formik.values.transfer,
        date: formatDateToApi(formik.values.transfer.date)
      })
    }).then(async () => {
      await getData(formik?.values?.transfer?.recordId)
      toast.success(platformLabels.Closed)
      invalidate()
    })
  }

  async function onReopen() {
    await postRequest({
      extension: ManufacturingRepository.JobTransfer.reopen,
      record: JSON.stringify({
        ...formik.values.transfer,
        date: formatDateToApi(formik.values.transfer.date)
      })
    }).then(async () => {
      await getData(formik?.values?.recordId)
      toast.success(platformLabels.Reopened)
      invalidate()
    })
  }

  async function onJobSelection(transferUpdate) {
    const { jobId, routingSeq, routingId } = transferUpdate

    if (jobId) {
      if (routingSeq && routingId) {
        const routingRes = await getRequest({
          extension: ManufacturingRepository.JobRouting.qry,
          parameters: `_jobId=${jobId}&_workCenterId=0&_status=0`
        })
        const record = routingRes?.list?.find(x => x.seqNo === routingSeq)
        if (record) {
          const toWCRecord = routingRes?.list?.find(x => x.seqNo === Number(routingSeq) + 1)

          transferUpdate = {
            ...transferUpdate,
            fromSeqNo: record.seqNo,
            fromWCId: record.workCenterId,
            workCenterId: record.workCenterId,
            fromSVName: record.supervisorName,
            jobQty: record.qty,
            qty: record.qty,
            pcs: record.pcs,
            toWCId: toWCRecord?.workCenterId,
            toSVName: toWCRecord?.supervisorName,
            toSeqNo: toWCRecord?.seqNo
          }

          formik.setValues({
            ...formik.values,
            transfer: transferUpdate
          })
        } else clearSelection(transferUpdate)
      } else clearSelection(transferUpdate)

      await fillItems(jobId)
    } else {
      clearSelection(transferUpdate)

      formik.setFieldValue('categorySummary', [])
    }
  }

  async function fillItems(jobId) {
    const itemsRes = await getRequest({
      extension: ManufacturingRepository.IssueOfMaterialsItems.qry2,
      parameters: `_jobId=${jobId}`
    })

    formik.setFieldValue('categorySummary', itemsRes.list || [])
  }

  async function clearSelection(transferUpdate) {
    transferUpdate = {
      ...transferUpdate,
      fromSeqNo: null,
      fromWCId: null,
      fromSVName: '',
      qty: 0,
      pcs: 0,
      toWCId: null,
      toSVName: ''
    }
    formik.setValues({
      ...formik?.values,
      transfer: transferUpdate
    })
  }

  const actions = [
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Locked',
      condition: isPosted,
      disabled: true
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || isPosted || !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.JTCheckOut}
      functionId={SystemFunction.JTCheckOut}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      previewReport={editMode}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={SystemRepository.DocumentType.qry}
                        parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.JTCheckOut}`}
                        name='transfer.dtId'
                        label={labels.documentType}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        valueField='recordId'
                        displayField={['reference', 'name']}
                        values={formik.values.transfer}
                        maxAccess
                        onChange={async (event, newValue) => {
                          formik.setFieldValue('transfer.dtId', newValue?.recordId || null)
                          changeDT(newValue)
                        }}
                        readOnly={editMode}
                        required
                        error={formik.touched.transfer?.dtId && Boolean(formik.errors.transfer?.dtId)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceLookup
                        endpointId={ManufacturingRepository.MFJobOrder.snapshot3}
                        parameters={{ _status: 4 }}
                        valueField='reference'
                        displayField='reference'
                        secondDisplayField={false}
                        name='transfer.jobId'
                        label={labels.jobOrder}
                        formObject={formik.values.transfer}
                        form={formik}
                        required
                        readOnly={editMode}
                        valueShow='jobRef'
                        maxAccess={access}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'itemName', value: 'Item Name' },
                          { key: 'description', value: 'Description' }
                        ]}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('transfer.jobRef', newValue?.reference || '')
                          formik.setFieldValue('transfer.jobId', newValue?.recordId || null)

                          let transferUpdate = {
                            ...formik.values.transfer,
                            jobId: newValue?.recordId || null,
                            jobRef: newValue?.reference || '',
                            itemId: newValue?.itemId || '',
                            sku: newValue?.sku || '',
                            itemName: newValue?.itemName || '',
                            designRef: newValue?.designRef || '',
                            designId: newValue?.designId || '',
                            designName: newValue?.designName || '',
                            jobDescription: newValue?.description || '',
                            routingSeq: newValue?.routingSeqNo || null,
                            routingId: newValue?.routingId || null,
                            workCenterId: newValue?.workCenterId
                          }

                          onJobSelection(transferUpdate)
                        }}
                        errorCheck={'transfer.jobId'}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomDatePicker
                        name='transfer.date'
                        required
                        readOnly={isClosed || isPosted}
                        label={labels.date}
                        value={formik.values.transfer?.date}
                        onChange={formik.setFieldValue}
                        maxAccess
                        onClear={() => formik.setFieldValue('date', null)}
                        error={formik.touched.transfer?.date && Boolean(formik.errors.transfer?.date)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomTextField
                        name='transfer.reference'
                        label={labels.reference}
                        value={formik.values.transfer.reference}
                        readOnly={editMode}
                        maxLength='15'
                        maxAccess={!editMode && maxAccess}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('transfer.reference', '')}
                        error={formik.touched.transfer?.reference && Boolean(formik.errors.transfer?.reference)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='transfer.jobDescription'
                    label={labels.jobDesc}
                    value={formik.values.transfer.jobDescription}
                    rows={2}
                    readOnly
                    maxAccess
                    onChange={e => formik.setFieldValue('transfer.jobDescription', e.target.value)}
                    onClear={() => formik.setFieldValue('transfer.jobDescription', '')}
                    error={formik.touched.transfer?.jobDescription && Boolean(formik.errors.transfer?.jobDescription)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='transfer.sku'
                        label={labels.itemRef}
                        value={formik.values.transfer.sku}
                        readOnly
                        maxAccess
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='transfer.designRef'
                        label={labels.designRef}
                        value={formik.values.transfer.designRef}
                        readOnly
                        maxAccess
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={
                          formik?.values?.transfer.jobId
                            ? formik?.values?.transfer?.routingId
                              ? ManufacturingRepository.JobRouting.qry
                              : ManufacturingRepository.JobWorkCenter.qry
                            : null
                        }
                        parameters={
                          formik.values.transfer.jobId
                            ? `_jobId=${formik.values.transfer.jobId}${
                                formik.values.transfer.routingId ? '&_workCenterId=0&_status=0' : ''
                              }`
                            : ''
                        }
                        name='transfer.fromWCId'
                        label={labels.workCenter}
                        readOnly={
                          !!formik?.values?.transfer?.routingId || !formik.values.transfer.jobId || isClosed || isPosted
                        }
                        valueField={'workCenterId'}
                        displayField={['workCenterRef', 'workCenterName']}
                        values={formik.values.transfer}
                        columnsInDropDown={[
                          { key: 'workCenterRef', value: 'Reference' },
                          { key: 'workCenterName', value: 'Name' }
                        ]}
                        onChange={async (event, newValue) => {
                          formik.setFieldValue('transfer.qty', newValue?.qty || 0)
                          formik.setFieldValue('transfer.jobQty', newValue?.qty || 0)
                          formik.setFieldValue('transfer.maxQty', newValue?.qty || 0)
                          formik.setFieldValue('transfer.pcs', newValue?.pcs || 0)
                          formik.setFieldValue('transfer.maxPcs', newValue?.pcs || 0)
                          formik.setFieldValue('transfer.fromSeqNo', newValue?.seqNo || null)
                          formik.setFieldValue('transfer.workCenterId', newValue?.workCenterId || null)
                          formik.setFieldValue('transfer.fromWCId', newValue?.workCenterId || null)
                        }}
                        required
                        maxAccess
                        error={formik.touched.transfer?.fromWCId && formik.errors.transfer?.fromWCId}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='transfer.qty'
                        readOnly={
                          isClosed || isPosted || !!formik?.values?.transfer?.routingId || !formik.values.transfer.jobId
                        }
                        label={labels.qty}
                        value={formik?.values?.transfer.qty}
                        maxAccess
                        decimalScale={2}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('transfer.qty', null)}
                        error={formik.touched.transfer?.qty && Boolean(formik.errors.transfer?.qty)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={
                          formik?.values?.transfer.jobId
                            ? formik?.values?.transfer?.routingId
                              ? ManufacturingRepository.JobRouting.qry
                              : formik.values.transfer?.workCenterId
                              ? ManufacturingRepository.WorkCenter.qry3
                              : null
                            : null
                        }
                        parameters={
                          formik.values.transfer.jobId
                            ? `_jobId=${formik.values.transfer.jobId}${
                                formik.values.transfer.routingId
                                  ? '&_workCenterId=0&_status=0'
                                  : formik.values.transfer.workCenterId
                                  ? `&_fromWorkCenterId=${formik.values.transfer.workCenterId}`
                                  : ''
                              }`
                            : ''
                        }
                        name='transfer.toWCId'
                        filter={
                          formik?.values?.transfer?.routingSeq
                            ? item => item.seqNo === Number(formik?.values?.transfer?.routingSeq) + 1
                            : undefined
                        }
                        label={labels.toWorkCenter}
                        readOnly={
                          !!formik?.values?.transfer?.routingId || !formik.values.transfer.jobId || isClosed || isPosted
                        }
                        valueField={
                          formik.values.transfer.jobId && formik.values.transfer?.routingId
                            ? 'workCenterId'
                            : 'recordId'
                        }
                        columnsInDropDown={
                          formik.values.transfer.jobId && formik.values.transfer?.routingId
                            ? [
                                { key: 'workCenterRef', value: 'Reference' },
                                { key: 'workCenterName', value: 'Name' }
                              ]
                            : [
                                { key: 'reference', value: 'Reference' },
                                { key: 'name', value: 'Name' }
                              ]
                        }
                        displayField={
                          formik.values.transfer.jobId && formik.values.transfer?.routingId
                            ? ['workCenterRef', 'workCenterName']
                            : ['reference', 'name']
                        }
                        onChange={async (event, newValue) => {
                          formik.setFieldValue('transfer.toWCId', newValue?.recordId || null)
                        }}
                        values={formik.values.transfer}
                        required
                        maxAccess
                        error={formik.touched.transfer?.toWCId && formik.errors.transfer?.toWCId}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='transfer.itemName'
                        label={labels.itemName}
                        value={formik.values.transfer.itemName}
                        readOnly
                        maxAccess
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomTextField
                        name='transfer.designName'
                        label={labels.designName}
                        value={formik.values.transfer.designName}
                        readOnly
                        maxAccess
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='transfer.fromSVName'
                        label={labels.superVisor}
                        value={formik.values.transfer.fromSVName}
                        readOnly
                        maxAccess
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomNumberField
                        name='transfer.pcs'
                        readOnly={
                          !!formik?.values?.transfer?.routingId || !formik.values.transfer.jobId || isClosed || isPosted
                        }
                        label={labels.pieces}
                        value={formik?.values?.transfer?.pcs}
                        maxAccess
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('transfer.pcs', null)}
                        error={formik.touched.transfer?.pcs && Boolean(formik.errors.transfer?.pcs)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomTextField
                        name='transfer.toSVName'
                        label={labels.superVisor}
                        value={formik.values.transfer.toSVName}
                        readOnly
                        maxAccess
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ImageUpload
                    resourceId={ResourceIds.MFJobOrders}
                    seqNo={0}
                    recordId={formik.values.transfer.jobId}
                    customWidth={330}
                    customHeight={240}
                    isAbsolutePath={true}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='transfer.totalQty'
                    value={totalQty}
                    readOnly
                    label={labels.totalQty}
                    maxAccess
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='itemTable'
            gridData={{ list: formik.values.categorySummary }}
            maxAccess={maxAccess}
            columns={[
              { field: 'categoryRef', headerName: labels.itemCategory, flex: 1 },
              { field: 'categoryName', headerName: labels.title, flex: 1 },
              {
                field: 'qty',
                headerName: labels.qty,
                type: {
                  field: 'number',
                  decimal: 2
                },
                flex: 1
              },
              { field: 'pcs', headerName: labels.pcs, type: 'number', flex: 1 }
            ]}
            rowId={['itemId']}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

JTCheckoutForm.width = 1200
JTCheckoutForm.height = 700
