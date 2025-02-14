import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
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
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useWindow } from 'src/windows'
import WorkFlow from 'src/components/Shared/WorkFlow'

export default function FoWaxesForm({ labels, access, recordId, window }) {
  const { stack } = useWindow()
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess } = useDocumentType({
    functionId: SystemFunction.Wax,
    access: access,
    enabled: !recordId
  })

  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.Wax.page
  })

  const getHeaderData = async recordId => {
    if (!recordId) return null

    const response = await getRequest({
      extension: FoundryRepository.Wax.get,
      parameters: `_recordId=${recordId}`
    })

    return {
      ...response?.record,
      date: formatDateFromApi(response?.record.date)
    }
  }

  const getItems = async recordId => {
    if (!recordId) return null

    const response = await getRequest({
      extension: FoundryRepository.WaxJob.qry,
      parameters: `_waxId=${recordId}`
    })

    return await Promise.all(
      response?.list?.map(async (item, index) => {
        return {
          ...item,
          id: index + 1
        }
      })
    )
  }

  async function refetchForm(recordId) {
    const getHeader = await getHeaderData(recordId)
    const getGridItems = await getItems(recordId)
    formik.setValues({
      recordId: recordId,
      header: getHeader,
      items: getGridItems
    })
  }

  const getDesign = async recordId => {
    if (!recordId) return null

    const response = await getRequest({
      extension: ManufacturingRepository.Design.get,
      parameters: `_recordId=${recordId}`
    })

    return response?.record
  }

  const getJobRouting = async (recordId, seqNo) => {
    if (!recordId) return null

    const response = await getRequest({
      extension: ManufacturingRepository.JobRouting.get,
      parameters: `_jobOrderId=${recordId}&_seqNo=${seqNo}`
    })

    return response?.record
  }

  const getMetalSetting = async (metalId, metalColorId) => {
    if (!metalId || !metalColorId) return

    const response = await getRequest({
      extension: FoundryRepository.MetalSetting.get,
      parameters: `_metalId=${metalId}&_metalColorId=${metalColorId}`
    })

    return response?.record
  }

  async function changeDT(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: ManufacturingRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${dtId}`
      })
      formik.setFieldValue('header.workCenterId', res.record?.workCenterId)
      formik.setFieldValue('header.lineId', res.record?.lineId)
    } else {
      formik.setFieldValue('header.workCenterId', null)
      formik.setFieldValue('header.lineId', null)
    }
  }

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      header: {
        dtId: documentType?.dtId,
        reference: '',
        mouldId: '',
        mouldRef: '',
        date: new Date(),
        plantId: null,
        lineId: null,
        metalId: null,
        metalColorId: null,
        workCenterId: null,
        factor: 0,
        grossWgt: null,
        rmWgt: null,
        mouldWgt: null,
        netWgt: null,
        suggestedWgt: null,
        status: 1,
        wip: 1
      },
      items: [
        {
          id: 1,
          jobId: null,
          waxId: recordId || null,
          pieces: 0,
          jobPcs: 0,
          classId: null,
          classRef: '',
          className: '',
          designRef: '',
          standardRef: '',
          standardId: null,
          sku: '',
          itemName: '',
          rmWgt: 0,
          metalColor: '',
          metalColorId: null,
          metalId: null,
          metalRef: ''
        }
      ]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        mouldId: yup.string().required(),
        lineId: yup.string().required(),
        metalId: yup.string().required(),
        metalColorId: yup.string().required(),
        factor: yup.string().required(),
        grossWgt: yup.string().required(),
        rmWgt: yup.string().required(),
        mouldWgt: yup.string().required(),
        netWgt: yup.string().required(),
        suggestedWgt: yup.string().required()
      }),
      items: yup
        .array()
        .of(
          yup.object().shape({
            jobId: yup.string().required(),
            pieces: yup
              .number()
              .required()
              .test(function (value) {
                const { jobPcs } = this.parent

                return value <= jobPcs && value >= 0
              })
          })
        )
        .required()
    }),

    onSubmit: async obj => {
      const { items: originalItems, header: header } = obj

      const items = originalItems?.map((item, index) => ({
        ...item,
        waxId: obj.recordId || 0
      }))

      const payload = {
        header,
        items
      }

      const response = await postRequest({
        extension: FoundryRepository.Wax.set2,
        record: JSON.stringify(payload)
      })
      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else {
        toast.success(platformLabels.Edited)
      }

      refetchForm(response.recordId)
      invalidate()
    }
  })

  const rmWgt = reCal
    ? formik.values.items.reduce((sum, item) => sum + (Number(item?.rmWgt) || 0), 0)
    : formik.values?.header.rmWgt || 0
  console.log(Number(formik?.values?.header?.grossWgt || 0))
  console.log(Number(rmWgt || 0))
  console.log(Number(formik?.values?.header?.mouldWgt || 0))
  console.log(Number(formik?.values?.header?.grossWgt || 0) - Number(rmWgt || 0))
  console.log(
    Number(formik?.values?.header?.grossWgt || 0) - Number(rmWgt || 0) - Number(formik?.values?.header?.mouldWgt || 0)
  )

  const netWgt = reCal
    ? Number(formik?.values?.header?.grossWgt || 0) - Number(rmWgt || 0) - Number(formik?.values?.header?.mouldWgt || 0)
    : 0
  console.log(netWgt)
  const suggestedWgt = reCal ? netWgt * formik?.values?.header?.factor : formik.values?.header.suggestedWgt || 0

  const editMode = !!formik.values?.recordId || !!recordId
  const isPosted = formik.values.header.status === 3
  const isClosed = formik.values.header.wip === 2

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        refetchForm(recordId)
      }
      setReCal(false)
    })()
  }, [recordId])

  useEffect(() => {
    formik.setFieldValue('header.rmWgt', parseFloat(rmWgt).toFixed(2))
    formik.setFieldValue('header.netWgt', parseFloat(netWgt).toFixed(2))
    formik.setFieldValue('header.suggestedWgt', parseFloat(suggestedWgt).toFixed(2))
  }, [rmWgt, netWgt, suggestedWgt])

  useEffect(() => {
    if (documentType?.dtId) {
      formik.setFieldValue('header.dtId', documentType.dtId)
      changeDT(documentType.dtId)
    }
  }, [documentType?.dtId])

  async function onClose() {
    await postRequest({
      extension: FoundryRepository.Wax.close,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(formik.values.recordId)
  }

  async function onReopen() {
    await postRequest({
      extension: FoundryRepository.Wax.reopen,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(formik.values.recordId)
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.Wax,
        recordId: formik.values.recordId
      },
      width: 950,
      title: labels.workflow
    })
  }

  const onPost = async () => {
    await postRequest({
      extension: FoundryRepository.Wax.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    await postRequest({
      extension: FoundryRepository.Wax.unpost,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Unposted)
    invalidate()
    refetchForm(formik.values.recordId)
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.jobOrder,
      name: 'jobRef',
      flex: 1,
      props: {
        endpointId: ManufacturingRepository.MFJobOrder.snapshot2,
        parameters: {
          _workCenterId: formik.values?.header?.workCenterId
        },
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'jobId' },
          { from: 'reference', to: 'jobRef' },
          { from: 'designRef', to: 'designRef' },
          { from: 'designId', to: 'designId' },
          { from: 'itemName', to: 'itemName' },
          { from: 'itemId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'pcs', to: 'jobPcs' },
          { from: 'routingSeqNo', to: 'routingSeqNo' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'designRef', value: 'Design' },
          { key: 'itemName', value: 'Item Name' }
        ],
        displayFieldWidth: 4,
        filter: { lineId: formik.values?.header?.lineId }
      },
      async onChange({ row: { update, newRow } }) {
        let design = null
        let jobRouting = null
        if (newRow.designId) {
          design = await getDesign(newRow.designId)
        }
        if (!newRow?.routingSeqNo) {
          return
        } else jobRouting = await getJobRouting(newRow.jobId, newRow?.routingSeqNo)
        update({
          classId: design?.classId,
          className: design?.className,
          classRef: design?.classRef,
          standardId: design?.standardId,
          standardRef: design?.standardRef,
          pieces: parseFloat(jobRouting?.pcs || 0),
          rmWgt: parseFloat(jobRouting?.qty || 0)
        })
        setReCal(true)
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
      label: labels.designRef,
      name: 'designRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.productionclass,
      name: 'classRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.productionStandatd,
      name: 'standardRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'rmWgt',
      label: labels.rmWgt,
      defaultValue: 0,
      onChange: () => {
        setReCal(true)
      },
      props: {
        readOnly: isClosed
      }
    },
    {
      component: 'numberfield',
      name: 'pieces',
      label: labels.pieces,
      props: { allowNegative: false },
      defaultValue: 0,
      props: {
        readOnly: isClosed
      }
    }
  ]

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: () => onClose(formik.values.recordId),
      disabled: isClosed || !editMode || isPosted
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || isPosted
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.FoWaxes}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      disabledSubmit={isPosted || isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container>
            {/* First Column */}
            <Grid container rowGap={2} xs={4} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.DocumentType.qry}
                  parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Wax}`}
                  filter={!editMode ? item => item.activeStatus === 1 : undefined}
                  name='dtId'
                  label={labels.docType}
                  readOnly={editMode}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values.header}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('header.dtId', newValue?.recordId)
                    await changeDT(newValue?.recordId)
                  }}
                  error={formik.touched?.header?.dtId && Boolean(formik.errors?.header?.dtId)}
                  maxAccess={!editMode && maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={labels.reference}
                  value={formik.values.header.reference}
                  readOnly={editMode || !formik.values.header.dtId}
                  maxAccess={!editMode && maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('header.reference', '')}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={FoundryRepository.Mould.qry}
                  name='mouldId'
                  parameters='_params=&_startAt=0&_pageSize=1000'
                  label={labels.mould}
                  required
                  readOnly={isClosed}
                  valueField='recordId'
                  displayField={'reference'}
                  values={formik.values.header}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('header.mouldId', newValue?.recordId || null)
                    formik.setFieldValue('header.mouldRef', newValue?.reference || null)
                  }}
                  error={formik.touched?.header?.mouldId && Boolean(formik.errors?.header?.mouldId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='date'
                  required
                  readOnly={isClosed}
                  label={labels.date}
                  value={formik?.values?.header?.date}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('header.date', '')}
                  error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                />
              </Grid>
            </Grid>
            {/* Second Column */}
            <Grid container rowGap={2} xs={4} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Plant.qry}
                  name='plantId'
                  readOnly={isClosed}
                  label={labels.plant}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values.header}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('header.plantId', newValue?.recordId || null)
                  }}
                  error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={ManufacturingRepository.ProductionLine.qry}
                  name='lineId'
                  readOnly={isClosed || (formik.values.items.length > 0 && formik.values.items[0].jobId)}
                  required
                  label={labels.prodLine}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values.header}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('header.lineId', newValue?.recordId || null)
                  }}
                  error={formik.touched?.header?.lineId && Boolean(formik.errors?.header?.lineId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={InventoryRepository.Metals.qry}
                  name='metalId'
                  readOnly={isClosed}
                  required
                  label={labels.metal}
                  valueField='recordId'
                  displayField={'reference'}
                  values={formik.values.header}
                  maxAccess={maxAccess}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('header.metalId', newValue?.recordId || null)
                    const metalSetting = await getMetalSetting(newValue?.recordId, formik.values?.header?.metalColorId)
                    formik.setFieldValue('header.factor', metalSetting?.rate || 0)
                  }}
                  error={formik.touched?.header?.metalId && Boolean(formik.errors?.header?.metalId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={InventoryRepository.MetalColor.qry}
                  name='metalColorId'
                  readOnly={isClosed}
                  required
                  label={labels.metalColor}
                  valueField='recordId'
                  displayField={'reference'}
                  values={formik.values.header}
                  maxAccess={maxAccess}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('header.metalColorId', newValue?.recordId || null)
                    const metalSetting = await getMetalSetting(formik.values?.header?.metalId, newValue?.recordId)
                    formik.setFieldValue('header.factor', metalSetting?.rate || 0)
                  }}
                  error={formik.touched?.header?.metalColorId && Boolean(formik.errors?.header?.metalColorId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={ManufacturingRepository.WorkCenter.qry}
                  name='workCenterId'
                  label={labels.workCenter}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  readOnly
                  values={formik.values.header}
                  maxAccess={maxAccess}
                  error={formik.touched?.header?.workCenterId && Boolean(formik.errors?.header?.workCenterId)}
                />
              </Grid>
            </Grid>
            <Grid container rowGap={2} xs={4} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <CustomNumberField
                  name='grossWgt'
                  label={labels.grossWgt}
                  required
                  readOnly={isClosed}
                  value={formik.values.header.grossWgt}
                  onChange={e => formik.setFieldValue('header.grossWgt', e.target.value)}
                  error={formik.touched?.header?.grossWgt && Boolean(formik.errors?.header?.grossWgt)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='rmWgt'
                  label={labels.rmWgt}
                  required
                  value={rmWgt}
                  readOnly
                  error={formik.touched?.header?.rmWgt && Boolean(formik.errors?.header?.rmWgt)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='mouldWgt'
                  label={labels.mouldWgt}
                  required
                  readOnly={isClosed}
                  value={formik.values.header.mouldWgt}
                  onChange={e => formik.setFieldValue('header.mouldWgt', e.target.value)}
                  error={formik.touched?.header?.mouldWgt && Boolean(formik.errors?.header?.mouldWgt)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='netWgt'
                  label={labels.netWgt}
                  required
                  value={netWgt}
                  readOnly
                  allowNegative={false}
                  error={formik.touched?.header?.netWgt && Boolean(formik.errors?.header?.netWgt)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='suggestedWgt'
                  label={labels.suggestedWgt}
                  required
                  value={suggestedWgt}
                  readOnly
                  error={formik.touched?.header?.suggestedWgt && Boolean(formik.errors?.header?.suggestedWgt)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            allowDelete={!isClosed}
            disabled={!formik.values.header.lineId}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
