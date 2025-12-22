import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

export default function FoWaxesForm({ labels, access, recordId, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Wax,
    access: access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.Wax.page
  })

  const conditions = {
    jobId: row => row?.jobId,
    pieces: row => row?.jobId > 0 && row?.pieces <= row?.jobPcs
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
        mouldId: null,
        date: new Date(),
        plantId: null,
        lineId: null,
        metalId: null,
        metalColorId: null,
        workCenterId: null,
        factor: 0,
        grossWgt: 0,
        rmWgt: 0,
        mouldWgt: 0,
        netWgt: 0,
        suggestedWgt: 0,
        status: 1,
        wip: 1
      },
      items: [
        {
          id: 1,
          jobId: null,
          waxId: recordId || 0,
          pieces: 0,
          jobPcs: 0,
          classId: null,
          sku: '',
          itemName: '',
          rmWgt: null,
          metalColorId: null,
          metalId: null
        }
      ]
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        mouldId: yup.number().required(),
        lineId: yup.number().required(),
        metalId: yup.number().required(),
        metalColorId: yup.number().required(),
        grossWgt: yup.number().required(),
        rmWgt: yup.number().required(),
        mouldWgt: yup.number().required(),
        netWgt: yup.number().min(0).required(),
        suggestedWgt: yup.number().required()
      }),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const { items, header } = obj

      const response = await postRequest({
        extension: FoundryRepository.Wax.set2,
        record: JSON.stringify({
          header,
          items: items.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        })
      })
      const actionMessage = !obj.recordId ? platformLabels.Added : platformLabels.Edited
      toast.success(actionMessage)
      refetchForm(response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values?.recordId
  const isPosted = formik?.values?.header?.status === 3
  const isClosed = formik?.values?.header?.wip === 2

  const rmWgt = reCal
    ? formik.values.items.reduce((sum, item) => sum + (Number(item?.rmWgt) || 0), 0)
    : formik.values?.header.rmWgt || 0

  const netWgt = reCal
    ? Number(formik?.values?.header?.grossWgt || 0) - Number(rmWgt || 0) - Number(formik?.values?.header?.mouldWgt || 0)
    : 0

  const suggestedWgt = reCal
    ? Number((netWgt || 0) * (formik.values.header.factor || 0))
    : Number(formik.values.header.suggestedWgt)

  const getHeaderData = async recordId => {
    if (!recordId) return

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
    if (!recordId) return

    const response = await getRequest({
      extension: FoundryRepository.WaxJob.qry,
      parameters: `_waxId=${recordId}`
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

  const getDesign = async recordId => {
    if (!recordId) return

    const response = await getRequest({
      extension: ManufacturingRepository.Design.get,
      parameters: `_recordId=${recordId}`
    })

    return response?.record
  }

  const getJobRouting = async (recordId, seqNo) => {
    if (!recordId) return

    const response = await getRequest({
      extension: ManufacturingRepository.JobRouting.get,
      parameters: `_jobOrderId=${recordId}&_seqNo=${seqNo}`
    })

    return response?.record
  }

  const getJobWorkCenter = async recordId => {
    if (!recordId || !formik.values?.header?.workCenterId) return

    const response = await getRequest({
      extension: ManufacturingRepository.JobWorkCenter.get,
      parameters: `_jobId=${recordId}&_workCenterId=${formik.values?.header?.workCenterId}`
    })

    return response?.record
  }

  const getMetalSetting = async (metalId, metalColorId) => {
    if (!metalId || !metalColorId) return

    const response = await getRequest({
      extension: FoundryRepository.MetalSettings.get,
      parameters: `_metalId=${metalId}&_metalColorId=${metalColorId}`
    })

    return response?.record
  }

  async function setDefaults(dtId) {
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

    refetchForm(formik.values.recordId)
    invalidate()
  }

  const onClose = async () => {
    await postRequest({
      extension: FoundryRepository.Wax.close,
      record: JSON.stringify(formik.values.header)
    })

    refetchForm(formik.values.recordId)
    invalidate()
  }

  const onReopen = async () => {
    await postRequest({
      extension: FoundryRepository.Wax.reopen,
      record: JSON.stringify(formik.values.header)
    })

    refetchForm(formik.values.recordId)
    invalidate()
  }

  async function refetchForm(recordId) {
    const header = await getHeaderData(recordId)
    const items = await getItems(recordId)
    const factor = await getMetalSetting(header.metalId, header.metalColorId)
    formik.setValues({
      ...formik.values,
      recordId: header.recordId,
      header: {
        ...formik.values.header,
        ...header,
        factor: factor?.rate
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
        endpointId: ManufacturingRepository.MFJobOrder.snapshot2,
        parameters: {
          _workCenterId: formik.values?.header?.workCenterId
        },
        displayField: 'jobRef',
        valueField: 'jobRef',
        mapping: [
          { from: 'jobId', to: 'jobId' },
          { from: 'jobRef', to: 'jobRef' }
        ],
        displayFieldWidth: 4,
        readOnly: isClosed || !formik.values?.header?.workCenterId
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.jobId) return

        const res = await getRequest({
          extension: ManufacturingRepository.MFJobOrder.get,
          parameters: `_recordId=${newRow?.jobId}`
        })

        update({
          jobId: newRow?.jobId || null,
          jobRef: newRow?.jobRef || '',
          routingId: res.record?.routingId || null,
          designId: res.record?.designId || null,
          designRef: res.record?.designRef || '',
          itemName: res.record?.itemName || '',
          itemId: res.record?.itemId || null,
          category: res.record?.categoryName || '',
          sku: res.record?.sku || '',
          jobPcs: res.record?.pcs || 0,
          routingSeqNo: res.record?.routingSeqNo || 1
        })
        const design = res.record?.designId ? await getDesign(res.record?.designId) : null

        const jobRouting = res.record?.routingSeqNo
          ? await getJobRouting(newRow.jobId, res?.record?.routingSeqNo)
          : await getJobWorkCenter(newRow.jobId)
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
      label: labels.productionStandard,
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
      defaultValue: 0,
      props: {
        allowNegative: false,
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
      disabled: !isClosed
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !isClosed
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
      disabled: !isClosed || isPosted
    },
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    }
  ]

  useEffect(() => {
    if (recordId) refetchForm(recordId)
    setReCal(true)
  }, [recordId])

  useEffect(() => {
    formik.setFieldValue('header.rmWgt', parseFloat(rmWgt).toFixed(2))
    formik.setFieldValue('header.netWgt', parseFloat(netWgt).toFixed(2))
    formik.setFieldValue('header.suggestedWgt', parseFloat(suggestedWgt).toFixed(2))
  }, [rmWgt, netWgt, suggestedWgt])

  useEffect(() => {
    if (!editMode) setDefaults(formik?.values?.header?.dtId)
  }, [formik.values.header.dtId])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.FoWaxes}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} xs={12}>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Wax}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='header.dtId'
                    label={labels.docType}
                    readOnly={editMode || formik.values.items.some(item => item.jobId)}
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
                    endpointId={formik.values.header.lineId && FoundryRepository.Mould.qry2}
                    name='header.mouldId'
                    parameters={
                      formik.values.header.lineId &&
                      `_params=&_startAt=0&_pageSize=1000&_lineId=${formik.values.header.lineId}`
                    }
                    label={labels.mould}
                    required
                    valueField='recordId'
                    readOnly={isClosed || !formik.values.header.lineId}
                    displayField={['reference', 'lineName']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'lineName', value: 'Production Line' }
                    ]}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.mouldRef', newValue?.reference || null)
                      formik.setFieldValue('header.mouldId', newValue?.recordId || null)
                    }}
                    error={formik.touched?.header?.mouldId && Boolean(formik.errors?.header?.mouldId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    readOnly={isClosed}
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
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='header.plantId'
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
                    error={formik.touched.header?.plantId && Boolean(formik.errors.header?.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionLine.qry}
                    name='header.lineId'
                    readOnly={isClosed}
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
                    onChange={async (event, newValue) => {
                      if (!newValue?.recordId) {
                        await formik.setFieldValue('header.mouldId', null)
                      }
                      formik.setFieldValue('header.lineId', newValue?.recordId || null)
                    }}
                    error={formik.touched?.header?.lineId && Boolean(formik.errors?.header?.lineId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Metals.qry}
                    name='header.metalId'
                    readOnly={isClosed}
                    required
                    label={labels.metal}
                    valueField='recordId'
                    displayField={'reference'}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('header.metalId', newValue?.recordId || null)

                      const metalSetting = await getMetalSetting(
                        newValue?.recordId,
                        formik.values?.header?.metalColorId
                      )
                      formik.setFieldValue('header.factor', metalSetting?.rate || 0)
                    }}
                    error={formik.touched?.header?.metalId && Boolean(formik.errors?.header?.metalId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.MetalColor.qry}
                    name='header.metalColorId'
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
                    name='header.workCenterId'
                    label={labels.workCenter}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    readOnly
                    values={formik.values.header}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.grossWgt'
                    label={labels.grossWgt}
                    required
                    readOnly={isClosed}
                    value={formik.values.header.grossWgt}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.grossWgt', e.target.value)}
                    onClear={() => formik.setFieldValue('header.grossWgt', 0)}
                    error={formik.touched?.header?.grossWgt && Boolean(formik.errors?.header?.grossWgt)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.rmWgt'
                    label={labels.rmWgt}
                    required
                    value={rmWgt}
                    readOnly
                    error={formik.touched?.header?.rmWgt && Boolean(formik.errors?.header?.rmWgt)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.mouldWgt'
                    label={labels.mouldWgt}
                    required
                    value={formik.values.header.mouldWgt}
                    maxAccess={maxAccess}
                    readOnly={isClosed}
                    onClear={() => formik.setFieldValue('header.mouldWgt', 0)}
                    onChange={e => formik.setFieldValue('header.mouldWgt', e.target.value)}
                    error={formik.touched?.header?.mouldWgt && Boolean(formik.errors?.header?.mouldWgt)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.netWgt'
                    label={labels.netWgt}
                    required
                    value={netWgt}
                    readOnly
                    error={formik.touched?.header?.netWgt && Boolean(formik.errors?.header?.netWgt)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.suggestedWgt'
                    label={labels.suggestedWgt}
                    required
                    maxAccess={maxAccess}
                    value={suggestedWgt}
                    readOnly
                    error={formik.touched?.header?.suggestedWgt && Boolean(formik.errors?.header?.suggestedWgt)}
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
            allowDelete={!isClosed}
            disabled={isClosed}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
