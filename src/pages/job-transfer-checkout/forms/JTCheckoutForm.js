import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import Table from 'src/components/Shared/Table'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useInvalidate } from 'src/hooks/resource'

export default function JTCheckoutForm({ labels, recordId, access, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.JTCheckOut,
    access,
    enabled: !recordId,
    objectName: 'transfer'
  })

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
        fromSeqNo: yup.string().required(),
        toWCId: yup.string().required(),
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
          maxPcs: res?.record?.transfer.pcs
        },
        categorySummary: res?.record?.categorySummary || []
      })
    })
  }

  useEffect(() => {
    getData(recordId)
  }, [])
  console.log('check formik', formik.values.transfer)

  const totalQty =
    formik?.values?.categorySummary != [] ? formik?.values?.categorySummary.reduce((op, item) => op + item?.qty, 0) : 0

  const editMode = !!formik?.values?.transfer?.recordId
  const isPosted = formik.values.transfer.status === 3
  const isClosed = formik.values.transfer.wip === 2
  const isMismatch = Math.abs(totalQty - formik?.values?.transfer?.qty) > 0.05

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

  async function onJobSelection(jobId, routingSeq, routingId, transferUpdate) {
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
            fromSVName: record.supervisorName,
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
      disabledSubmit={isClosed || isMismatch}
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
                        endpointId={ManufacturingRepository.MFJobOrder.snapshot2}
                        parameters={{ _workCenterId: '0' }}
                        filter={{ status: 4 }}
                        name='transfer.jobId'
                        label={labels.jobRef}
                        valueField='reference'
                        displayField='reference'
                        valueShow='jobRef'
                        columnsInDropDown={[
                          { key: 'reference', value: 'Job Order' },
                          { key: 'description', value: 'Description' },
                          { key: 'itemName', value: 'Item Name' }
                        ]}
                        readOnly={editMode}
                        required
                        secondDisplayField={false}
                        formObject={formik.values.transfer}
                        form={formik}
                        onChange={(event, newValue) => {
                          let transferUpdate = {
                            ...formik?.values?.transfer,
                            jobRef: newValue?.reference || '',
                            jobName: newValue?.name || '',
                            itemId: newValue?.itemId || '',
                            sku: newValue?.sku || '',
                            itemName: newValue?.itemName || '',
                            designRef: newValue?.designRef || '',
                            designId: newValue?.designId || '',
                            designName: newValue?.designName || '',
                            jobDescription: newValue?.description || '',
                            routingSeq: newValue?.routingSeqNo || null,
                            jobId: newValue?.recordId || null,
                            routingId: newValue?.routingId || null
                          }

                          onJobSelection(
                            newValue?.recordId,
                            newValue?.routingSeqNo,
                            newValue?.routingId,
                            transferUpdate
                          )
                        }}
                        maxAccess
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
                            ? formik.values.transfer?.routingId
                              ? `_jobId=${formik.values.transfer.jobId}&_workCenterId=0&_status=0`
                              : `_jobId=${formik.values.transfer.jobId}`
                            : ''
                        }
                        name='transfer.fromSeqNo'
                        label={labels.workCenter}
                        readOnly={
                          !!formik?.values?.transfer?.routingId || !formik.values.transfer.jobId || isClosed || isPosted
                        }
                        valueField='seqNo'
                        values={formik.values.transfer}
                        columnsInDropDown={[
                          { key: 'workCenterRef', value: 'Reference' },
                          { key: 'workCenterName', value: 'Name' }
                        ]}
                        displayField={['workCenterRef', 'workCenterName']}
                        onChange={async (event, newValue) => {
                          formik.setFieldValue('transfer.qty', newValue?.qty || 0)
                          formik.setFieldValue('transfer.pcs', newValue?.pcs || 0)

                          formik.setFieldValue('transfer.maxQty', newValue?.qty || 0)
                          formik.setFieldValue('transfer.maxPcs', newValue?.pcs || 0)
                          formik.setFieldValue('transfer.fromSeqNo', newValue?.seqNo || null)
                          formik.setFieldValue('transfer.workCenterId', newValue?.workCenterId || null)
                        }}
                        required
                        maxAccess
                        error={formik.touched.transfer?.fromSeqNo && formik.errors.transfer?.fromSeqNo}
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
                              : ManufacturingRepository.JobWorkCenter.qry
                            : null
                        }
                        parameters={
                          formik.values.transfer.jobId
                            ? formik.values.transfer?.routingId
                              ? `_jobId=${formik.values.transfer.jobId}&_workCenterId=0&_status=0`
                              : `_jobId=${formik.values.transfer.jobId}`
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
                        valueField='workCenterId'
                        columnsInDropDown={[
                          { key: 'workCenterRef', value: 'Reference' },
                          { key: 'workCenterName', value: 'Name' }
                        ]}
                        displayField={['workCenterRef', 'workCenterName']}
                        onChange={async (event, newValue) => {
                          formik.setFieldValue('transfer.toWCId', newValue?.workCenterId || null)
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
                <Grid item xs={12} height={62}></Grid>
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
