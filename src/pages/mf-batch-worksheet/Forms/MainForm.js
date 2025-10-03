import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { DataGrid } from 'src/components/Shared/DataGrid'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { createConditionalSchema } from 'src/lib/validation'

export default function MainForm({ labels, access, store, setStore }) {
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.BatchWorksheet.page
  })

  const { maxAccess, documentType, changeDT } = useDocumentType({
    functionId: SystemFunction.BatchWorksheet,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const conditions = {
    jobId: row => row?.jobId,
    qtyOut: row => row?.qtyOut != null
  }

  const materialsConditions = {
    rawMaterialId: row => row?.sku,
    returned: row => row?.returned != null,
    issued: row => row?.issued != null
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'batchWorksheetJobs')

  const { schema: materialsSchema, requiredFields: requiredFields1 } = createConditionalSchema(
    materialsConditions,
    true,
    maxAccess,
    'batchWorksheetRawMaterials'
  )

  console.log(documentType?.dtId)

  const formik = useFormik({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    conditionSchema: ['batchWorksheetJobs', 'batchWorksheetRawMaterials'],
    initialValues: {
      recordId: null,
      header: {
        recordId: null,
        reference: '',
        workCenterId: null,
        date: null,
        dtId: null,
        status: 1,
        wip: 1
      },
      batchWorksheetJobs: [{ id: 1 }],
      batchWorksheetRawMaterials: [{ id: 1 }]
    },

    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        workCenterId: yup.number().required()
      }),
      batchWorksheetJobs: yup.array().of(schema),
      batchWorksheetRawMaterials: yup.array().of(materialsSchema)
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: ManufacturingRepository.BatchWorksheet.set2,
        record: JSON.stringify({
          header: {
            ...obj.header,
            date: formatDateToApi(obj.header.date)
          },
          batchWorksheetJobs: obj.batchWorksheetJobs
            .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
            .map(({ id, ...item }, index) => ({
              ...item,
              seqNo: index + 1
            })),
          batchWorksheetRawMaterials: obj.batchWorksheetRawMaterials
            .filter(row => Object.values(requiredFields1)?.every(fn => fn(row)))
            .map(({ id, ...item }, index) => ({
              ...item,
              seqNo: index + 1
            }))
        })
      })
      refetchForm(response.recordId)
      toast.success(!!obj.recordId ? platformLabels.Edited : platformLabels.Added)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  async function refetchForm(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: ManufacturingRepository.BatchWorksheet.get2,
        parameters: `_recordId=${recordId}`
      })
      formik.setValues({
        recordId: res.record.header.recordId,
        header: {
          ...res.record.header,
          date: formatDateFromApi(res.record.header.date)
        },
        batchWorksheetJobs:
          res.record?.batchWorksheetJobs?.length > 0
            ? res.record?.batchWorksheetJobs?.map((item, index) => ({
                ...item,
                id: index + 1
              }))
            : formik.initialValues?.batchWorksheetJobs,
        batchWorksheetRawMaterials: res.record?.batchWorksheetRawMaterials.length
          ? res.record?.batchWorksheetRawMaterials?.map((item, index) => ({
              ...item,
              id: index + 1
            }))
          : formik.initialValues?.batchWorksheetRawMaterials
      })
      setStore(prevStore => ({
        ...prevStore,
        recordId: res.record.header.recordId,
        batchWorksheetDistributions: res.record?.batchWorksheetDistributions
      }))
    }
  }
  useEffect(() => {
    refetchForm(recordId)
  }, [])

  const isClosed = formik.values.header.wip == 2
  const isPosted = formik?.values?.header?.status === 3

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.material,
      name: 'rawMaterialId',
      props: {
        endpointId: InventoryRepository.RMSKU.snapshot,
        displayField: 'sku',
        valueField: 'sku',
        columnsInDropDown: [
          { key: 'sku', value: 'Sku' },
          { key: 'name', value: 'Name' }
        ],
        mapping: [
          { from: 'recordId', to: 'rawMaterialId' },
          { from: 'name', to: 'itemName' },
          { from: 'sku', to: 'sku' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        update({ rate: newRow.rate || 0 })
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'itemName',
      props: { readOnly: false }
    },
    {
      component: 'numberfield',
      label: labels.issued,
      name: 'issued',
      props: {
        decimalScale: 3
      },
      async onChange({ row: { update, newRow } }) {
        update({ netVariation: (newRow.issued || 0) - (newRow.returned || 0) })
      }
    },
    {
      component: 'numberfield',
      label: labels.returned,
      name: 'returned',
      props: {
        decimalScale: 3
      },
      async onChange({ row: { update, newRow } }) {
        update({ netVariation: (newRow.issued || 0) - (newRow.returned || 0) })
      }
    },
    {
      component: 'numberfield',
      label: labels.netVariation,
      name: 'netVariation',
      props: {
        decimalScale: 3,
        readOnly: true
      }
    }
  ]

  const batchWorksheetJobsColumns = [
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
          { from: 'jobRef', to: 'jobRef' },
          { from: 'pcs', to: 'pcs' },
          { from: 'qty', to: 'qty' }
        ],
        displayFieldWidth: 4
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.pieces,
      name: 'pcs',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.pctQty,
      name: 'pctOfBatch',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.qtyOut,
      name: 'qtyOut',
      props: { allowNegative: false, decimalScale: 3 },
      async onChange({ row: { update, newRow } }) {
        update({ variation: newRow.qtyOut - newRow?.qty })
      }
    },
    {
      component: 'numberfield',
      label: labels.variation,
      name: 'variation',
      props: { readOnly: true }
    }
  ]

  const onClose = async () => {
    await postRequest({
      extension: ManufacturingRepository.BatchWorksheet.close,
      record: JSON.stringify({ ...formik.values.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Closed)
    refetchForm(recordId)
    invalidate()
  }

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.BatchWorksheet.post,
      record: JSON.stringify({ ...formik.values.header, date: formatDateToApi(formik.values.header.date) })
    })

    toast.success(platformLabels.Posted)
    refetchForm(recordId)
    invalidate()
    window.close()
  }

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
      disabled: !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    }
  ]

  const totalPctOfBatch = formik?.values?.batchWorksheetJobs?.reduce((sum, row) => {
    const value = parseFloat(row?.pctOfBatch?.toString().replace(/,/g, '')) || 0

    return sum + value
  }, 0)

  const totalQtyOut = formik?.values?.batchWorksheetJobs?.reduce((sum, row) => {
    const value = parseFloat(row?.qtyOut?.toString().replace(/,/g, '')) || 0

    return sum + value
  }, 0)

  const totalVariation = formik?.values?.batchWorksheetJobs?.reduce((sum, row) => {
    const value = parseFloat(row?.variation?.toString().replace(/,/g, '')) || 0

    return sum + value
  }, 0)

  return (
    <FormShell
      resourceId={ResourceIds.BatchWorksheet}
      actions={actions}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.DocumentType.qry}
                  parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.BatchWorksheet}`}
                  filter={!editMode ? item => item.activeStatus === 1 : undefined}
                  name='header.dtId'
                  label={labels.docType}
                  readOnly={editMode}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values.header}
                  onChange={(_, newValue) => {
                    changeDT(newValue)
                    formik.setFieldValue('header.dtId', newValue?.recordId || null)
                  }}
                  error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
                  maxAccess={!editMode && maxAccess}
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
                <CustomDatePicker
                  name='header.date'
                  label={labels.date}
                  readOnly={isClosed}
                  required
                  value={formik.values?.header.date}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('header.date', null)}
                  error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={ManufacturingRepository.WorkCenter.qry}
                  name='header.workCenterId'
                  label={labels.workCenter}
                  required
                  valueField='recordId'
                  readOnly={isClosed}
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values.header}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('header.workCenterId', newValue?.recordId || null)
                  }}
                  error={formik.touched.header?.workCenterId && formik.errors.header?.workCenterId}
                  maxAccess={maxAccess}
                  displayFieldWidth={1.5}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={8} sx={{ display: 'flex', flex: 1, mt: -5 }}>
            <Grow>
              <DataGrid
                name='batchWorksheetRawMaterials'
                maxAccess={maxAccess}
                value={formik.values.batchWorksheetRawMaterials}
                error={formik.errors?.batchWorksheetRawMaterials}
                columns={columns}
                readOnly={isClosed}
                onChange={value => formik.setFieldValue('batchWorksheetRawMaterials', value)}
                disabled={isClosed}
                allowDelete={!isClosed}
              />
            </Grow>
          </Grid>
        </Grid>
        <Grow>
          <DataGrid
            name='batchWorksheetJobs'
            maxAccess={maxAccess}
            value={formik.values.batchWorksheetJobs}
            error={formik.errors?.batchWorksheetJobs}
            columns={batchWorksheetJobsColumns}
            onChange={value => formik.setFieldValue('batchWorksheetJobs', value)}
            disabled={isClosed || !formik.values.header?.workCenterId}
            allowDelete={!isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={4}>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='totalPctOfBatch'
                label={labels.totalPctQty}
                value={totalPctOfBatch}
                maxAccess={access}
                readOnly
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='owMTD'
                label={labels.totalQtyOut}
                value={totalQtyOut}
                maxAccess={access}
                readOnly
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='iwYTD'
                label={labels.totalVariation}
                value={totalVariation}
                maxAccess={access}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
