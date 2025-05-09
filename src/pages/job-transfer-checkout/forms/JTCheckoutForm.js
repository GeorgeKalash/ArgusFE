import { Grid } from '@mui/material'
import { useContext, useEffect, useRef } from 'react'
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
import { useWindow } from 'src/windows'

export default function JTCheckoutForm({ labels, recordId, access, invalidate }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const imageUploadRef = useRef(null)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.JTCheckOut,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: recordId,
      dtId: null,
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
      data: { list: [] }
    },
    maxAccess: access,
    validationSchema: yup.object({
      jobId: yup.number().required(),
      fromWCId: yup.number().required(),
      toWCId: yup.number().required()
    }),
    onSubmit: async obj => {
      const { data, date, ...rest } = obj

      const transferPack = {
        transfer: {
          ...rest,
          date: formatDateToApi(obj?.date)
        },
        categorySummary: data.list
      }

      await postRequest({
        extension: ManufacturingRepository.JobTransfer.set2,
        record: JSON.stringify(transferPack)
      }).then(async res => {
        if (imageUploadRef.current) {
          imageUploadRef.current.value = parseInt(res.recordId)

          await imageUploadRef.current.submit()
        }

        getData(res?.recordId)
        toast.success(obj?.recordId ? platformLabels.Edited : platformLabels.Added)
        invalidate()
      })
    }
  })

  const editMode = !!formik?.values?.recordId

  const getData = async recordId => {
    await getRequest({
      extension: ManufacturingRepository.JobTransfer.get2,
      parameters: `_recordId=${recordId}`
    }).then(async res => {
      const res2 = await getRequest({
        extension: ManufacturingRepository.MFJobOrder.get,
        parameters: `_recordId=${res?.record?.transfer?.jobId}`
      })
      formik.setValues({
        ...res?.record?.transfer,
        date: formatDateFromApi(res?.record?.transfer?.date),
        data: { list: res?.record?.categorySummary },
        description: res2?.record?.description,
        itemId: res2?.record?.itemId,
        sku: res2?.record?.sku,
        itemName: res2?.record?.itemName,
        designRef: res2?.record?.designRef,
        designName: res2?.record?.designName
      })

      //additional request
      //calculate total
    })
  }

  useEffect(() => {
    ;(async function () {
      recordId && (await getData(recordId))
    })()
  }, [])

  const isPosted = formik.values.status === 3
  const isClosed = formik.values.wip === 2
  const totalQty = formik?.values?.data?.list ? formik?.values?.data?.list?.reduce((op, item) => op + item?.qty, 0) : 0

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.JobTransfer.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik?.values?.date) || null
      })
    }).then(async () => {
      await getData(formik?.values?.recordId)
      invalidate()
      toast.success(platformLabels.Posted)
    })
  }

  async function onClose() {
    await postRequest({
      extension: ManufacturingRepository.JobTransfer.close,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    }).then(async () => {
      await getData(formik?.values?.recordId)
      toast.success(platformLabels.Closed)
      invalidate()
    })
  }

  async function onReopen() {
    await postRequest({
      extension: ManufacturingRepository.JobTransfer.reopen,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    }).then(async () => {
      await getData(formik?.values?.recordId)
      toast.success(platformLabels.Reopened)
      invalidate()
    })
  }

  async function fillItems(jobId) {
    const itemsRes = await getRequest({
      extension: ManufacturingRepository.IssueOfMaterialsItems.qry2,
      parameters: `_jobId=${jobId}`
    })

    formik.setFieldValue('data', { list: itemsRes?.list })
  }

  async function onJobSelection(jobId, routingSeq) {
    if (jobId) {
      fillItems(jobId)

      const routingRes = await getRequest({
        extension: ManufacturingRepository.JobRouting.qry,
        parameters: `_jobId=${jobId}&_workCenterId=0&_status=0`
      })

      if (routingSeq) {
        const record = routingRes?.list?.find(x => x.seqNo === routingSeq)
        if (record) {
          formik.setFieldValue('fromSeqNo', record.seqNo)
          formik.setFieldValue('fromWCId', record.workCenterId)
          formik.setFieldValue('fromSVName', record.supervisorName)
          formik.setFieldValue('qty', record.qty)
          formik.setFieldValue('pcs', record.pcs)

          const toWCRecord = routingRes?.list?.find(x => x.seqNo === Number(routingSeq) + 1)
          formik.setFieldValue('toWCId', toWCRecord.workCenterId)
          formik.setFieldValue('toSVName', toWCRecord?.supervisorName)
          formik.setFieldValue('toSeqNo', toWCRecord?.seqNo)
        }
      }
    } else {
      formik.setFieldValue('fromSeqNo', null)
      formik.setFieldValue('fromWCId', null)
      formik.setFieldValue('fromSVName', '')
      formik.setFieldValue('qty', 0)
      formik.setFieldValue('pcs', 0)

      formik.setFieldValue('toWCId', null)
      formik.setFieldValue('toSVName', '')
      formik.setFieldValue('toSeqNo', null)
    }
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
      disabled: !isClosed || formik.values.status == 3 || !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.JTCheckOut}
      functionId={SystemFunction.JTCheckOut}
      form={formik}
      maxAccess={access}
      editMode={editMode}
      actions={actions}
      previewReport={true}
      disabledSubmit={isPosted}
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
                        name='dtId'
                        label={labels.documentType}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        valueField='recordId'
                        displayField={['reference', 'name']}
                        values={formik.values}
                        maxAccess={access}
                        onChange={async (event, newValue) => {
                          formik.setFieldValue('dtId', newValue?.recordId || null)
                          changeDT(newValue)
                        }}
                        readOnly={editMode}
                        error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceLookup
                        endpointId={ManufacturingRepository.MFJobOrder.snapshot2}
                        parameters={{ _workCenterId: '0' }}
                        filter={{ status: 4 }}
                        name='jobRef'
                        label={labels.jobRef}
                        valueField='reference'
                        displayField='name'
                        valueShow='jobRef'
                        columnsInDropDown={[
                          { key: 'reference', value: 'Job Order' },
                          { key: 'description', value: 'Description' },
                          { key: 'itemName', value: 'Item Name' }
                        ]}
                        readOnly={isPosted || editMode}
                        required
                        secondDisplayField={false}
                        form={formik}
                        onChange={(event, newValue) => {
                          formik.setValues({
                            //check mapping
                            ...formik.values,
                            jobId: newValue?.recordId || null,
                            jobRef: newValue?.reference || '',
                            jobName: newValue?.name || '',
                            itemId: newValue?.itemId || '',
                            sku: newValue?.sku || '',
                            itemName: newValue?.itemName || '',
                            designRef: newValue?.designRef || '',
                            designId: newValue?.designId || '',
                            designName: newValue?.designName || '',
                            description: newValue?.description || '',
                            routingSeq: newValue?.routingSeqNo || null
                          })
                          onJobSelection(newValue?.recordId, newValue?.routingSeqNo)
                        }}
                        errorCheck={'jobId'}
                        maxAccess={access}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomDatePicker
                        name='date'
                        readOnly
                        label={labels.date}
                        value={formik.values.date}
                        maxAccess={access}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomTextField
                        name='reference'
                        label={labels.reference}
                        value={formik.values.reference}
                        readOnly={editMode}
                        maxLength='15'
                        maxAccess={!editMode && access}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('reference', '')}
                        error={formik.touched.reference && Boolean(formik.errors.reference)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='description'
                    label={labels.jobDesc}
                    value={formik.values.description}
                    rows={2}
                    editMode={editMode}
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('description', e.target.value)}
                    onClear={() => formik.setFieldValue('description', '')}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='sku'
                        label={labels.item}
                        value={formik.values.sku}
                        readOnly
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='designRef'
                        label={labels.design}
                        value={formik.values.designRef}
                        readOnly
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={formik?.values?.jobId && ManufacturingRepository.JobRouting.qry}
                        parameters={`_jobId=${formik.values.jobId}&_workCenterId=0&_status=0`}
                        name='fromSeqNo'
                        label={labels.workCenter}
                        readOnly
                        valueField='seqNo'
                        displayField={['workCenterRef', 'workCenterName']}
                        values={formik.values}
                        required
                        maxAccess={access}
                        error={formik.touched.fromSeqNo && formik.errors.fromSeqNo}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='qty'
                        readOnly
                        label={labels.qty}
                        value={formik?.values?.qty}
                        maxAccess={access}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('qty', 0)}
                        error={formik.touched.qty && Boolean(formik.errors.qty)}
                        decimalScale={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={formik?.values?.jobId && ManufacturingRepository.JobRouting.qry}
                        parameters={`_jobId=${formik.values.jobId}&_workCenterId=0&_status=0`}
                        name='toWCId'
                        filter={
                          formik?.values?.routingSeq
                            ? item => item.seqNo === Number(formik?.values?.routingSeq) + 1
                            : undefined
                        }
                        label={labels.toWorkCenter}
                        readOnly
                        valueField='workCenterId'
                        displayField={['workCenterRef', 'workCenterName']}
                        values={formik.values}
                        required
                        maxAccess={access}
                        error={formik.touched.toWCId && formik.errors.toWCId}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextField name='itemName' value={formik.values.itemName} readOnly maxAccess={access} />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomTextField name='designName' value={formik.values.designName} readOnly maxAccess={access} />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='fromSVName'
                        label={labels.superVisor}
                        value={formik.values.fromSVName}
                        readOnly
                        maxAccess={access}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomNumberField
                        name='pcs'
                        readOnly
                        label={labels.pcs}
                        value={formik?.values?.pcs}
                        maxAccess={access}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('pcs', 0)}
                        error={formik.touched.pcs && Boolean(formik.errors.pcs)}
                        decimalScale={3}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomTextField
                        name='toSVName'
                        label={labels.superVisor}
                        value={formik.values.toSVName}
                        readOnly
                        maxAccess={access}
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
                    ref={imageUploadRef}
                    resourceId={ResourceIds.JTCheckOut}
                    seqNo={0}
                    recordId={recordId}
                    customWidth={320}
                    customHeight={180}
                  />
                </Grid>
                <Grid item xs={12} height={122}></Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalQty'
                    value={totalQty}
                    readOnly
                    label={labels.totalQty}
                    maxAccess={access}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='itemTable'
            gridData={formik.values.data}
            maxAccess={access}
            columns={[
              { field: 'categoryRef', headerName: labels.categoryRef, flex: 1 },
              { field: 'categoryName', headerName: labels.categoryName, flex: 1 },
              { field: 'qty', headerName: labels.qty, type: 'number', flex: 1 },
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
