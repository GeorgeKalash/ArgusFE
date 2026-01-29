import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

export default function JobOrderWizardForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.JobOrderWizard,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.JobOrderWizard.page
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      header: {
        dtId: null,
        reference: '',
        recordId: null,
        jobId: null,
        bomId: null,
        workCenterId: null,
        operationId: null,
        laborId: null,
        avgWeight: 0,
        expectedPcs: 0,
        expectedQty: 0,
        pcs: 0,
        qty: 0,
        sfItemId: null,
        itemId: null,
        shiftId: null,
        date: new Date(),
        status: 1,
        notes: '',
        producedWeight: 0,
        activeHours: null,
        idleHours: null,
        totalHours: null
      },
      rows: [
        {
          id: 1,
          jozId: recordId,
          sku: '',
          itemName: '',
          issued: 0,
          returned: 0,
          consumed: 0,
          seqNo: 1
        }
      ]
    },
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        itemId: yup.number().required(),
        sfItemId: yup.number().required(),
        expectedQty: yup.number().required(),
        jobId: yup.number().required(),
        operationId: yup.number().required(),
        laborId: yup.number().required(),
        pcs: yup.number().min(0.01).nullable(),
        avgWeight: yup.number().min(0.01).nullable(),
        producedWeight: yup.number().min(0.01).required()
      }),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            issued: yup.number().required(),
            returned: yup.number().required(),
            consumed: yup.number().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const data = {
        header: {
          ...obj.header,
          pcs: parseInt(obj.header.pcs),
          date: formatDateToApi(obj.header.date)
        },
        items: formik.values.rows.map((details, index) => {
          return {
            ...details,
            jozId: obj.recordId ?? 0,
            seqNo: index + 1
          }
        })
      }

      const res = await postRequest({
        extension: ManufacturingRepository.JobOrderWizard.set2,
        record: JSON.stringify(data)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      refetchForm(res?.recordId)
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.header.status === 3

  async function onPost() {
    const res = await postRequest({
      extension: ManufacturingRepository.JobOrderWizard.post,
      record: JSON.stringify({
        ...formik.values.header,
        date: formatDateToApi(formik.values.header.date)
      })
    })

    if (res?.recordId) {
      toast.success(platformLabels.Posted)
      invalidate()
      refetchForm(res?.recordId)
    }
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.SFSKU.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'issued',
      label: labels.issued,
      props: { maxLength: 9, decimalScale: 3 },
      async onChange({ row: { update, newRow } }) {
        update({
          consumed: newRow.issued - newRow.returned
        })
      }
    },
    {
      component: 'numberfield',
      name: 'returned',
      label: labels.returned,
      async onChange({ row: { update, newRow } }) {
        update({
          consumed: newRow.issued - newRow.returned
        })
      },
      props: {
        maxLength: 9,
        decimalScale: 3
      }
    },
    {
      component: 'numberfield',
      name: 'consumed',
      label: labels.consumed,
      props: { readOnly: true, maxLength: 9, decimalScale: 3 }
    }
  ]

  const totalIssued = formik.values?.rows?.reduce((issued, row) => {
    const issuedValue = parseFloat(row.issued?.toString().replace(/,/g, '')) || 0

    return issued + issuedValue
  }, 0)

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: ManufacturingRepository.JobOrderWizard.get2,
      parameters: `_recordId=${recordId}`
    })

    if (res?.record?.header) {
      const modifiedList = res?.record?.items?.map((item, index) => ({
        ...item,
        id: index + 1
      }))

      formik.setValues({
        recordId: res.record.header.recordId,
        header: {
          ...res.record.header,
          date: formatDateFromApi(res?.record?.header?.date),
          producedWeight: res.record.header.pcs * res.record.header.avgWeight
        },
        rows: modifiedList
      })

      return res?.record
    }
  }
  async function getItemPhysical(itemId) {
    if (itemId) {
      const res = await getRequest({
        extension: InventoryRepository.Physical.get,
        parameters: `_itemId=${itemId}`
      })

      return res?.record
    }
  }
  async function getItemProduction(itemId) {
    if (itemId) {
      const res = await getRequest({
        extension: InventoryRepository.ItemProduction.get,
        parameters: `_recordId=${itemId}`
      })

      return res?.record
    }
  }

  const totalReturned = formik.values?.rows?.reduce((returned, row) => {
    const returnedValue = parseFloat(row.returned?.toString().replace(/,/g, '')) || 0

    return returned + returnedValue
  }, 0)

  const actions = [
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    }
  ]

  const totalConsumed = formik.values?.rows?.reduce((consumed, row) => {
    const consumedValue = parseFloat(row.consumed?.toString().replace(/,/g, '')) || 0

    return consumed + consumedValue
  }, 0)

  const totalUsedSemiFinished = formik.values.header.producedWeight - totalConsumed

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  useEffect(() => {
    formik.setFieldValue('header.totalSFQty', parseFloat(totalUsedSemiFinished).toFixed(2))
  }, [totalUsedSemiFinished])

  return (
    <FormShell
      resourceId={ResourceIds.JobOrderWizard}
      functionId={SystemFunction.JobOrderWizard}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.JobOrderWizard}`}
                name='header.dtId'
                readOnly={editMode}
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values.header}
                displayFieldWidth={2}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  await changeDT(newValue)
                  formik.setFieldValue('header.dtId', newValue?.recordId || null)
                }}
                error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
              />
            </Grid>
            <Grid item xs={4}>
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
            <Grid item xs={4}>
              <CustomDatePicker
                name='header.date'
                label={labels.date}
                readOnly={isPosted}
                value={formik?.values?.header.date}
                onChange={formik.setFieldValue}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.date', null)}
                error={formik?.touched?.header?.date && Boolean(formik?.errors?.header?.date)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.MFJobOrder.qry2}
                name='header.jobId'
                label={labels.jobOrder}
                values={formik.values.header}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference', width: 1 },
                  { key: 'date', value: 'Date', type: 'date', width: 1 },
                  { key: 'sku', value: 'sku', width: 1 },
                  { key: 'itemName', value: 'Item Name', width: 2 },
                  { key: 'productionLineName', value: 'Prod Line', width: 1 }
                ]}
                displayFieldWidth={2.5}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('header.jobId', newValue?.recordId || null)
                  formik.setFieldValue('header.sku', newValue?.sku || null)
                  formik.setFieldValue('header.itemName', newValue?.itemName || '')
                  formik.setFieldValue('header.itemId', newValue?.itemId || null)
                  formik.setFieldValue('header.expectedPcs', newValue?.expectedPcs || 0)
                  formik.setFieldValue('header.avgWeight', newValue?.avgWeight || 0)
                  formik.setFieldValue('header.workCenterName', newValue?.wcName || '')
                  formik.setFieldValue('header.workCenterId', newValue?.workCenterId || null)
                  formik.setFieldValue('header.operationId', null)
                  formik.setFieldValue('header.laborId', null)
                  const physical = await getItemPhysical(newValue?.itemId)
                  formik.setFieldValue('header.weight', physical?.weight || 0)
                  const production = await getItemProduction(newValue?.itemId)
                  formik.setFieldValue('header.bomId', production?.bomId || 0)
                  formik.setFieldValue('header.producedWeight', newValue?.avgWeight * formik.values.header.pcs)
                }}
                onClear={async (_, newValue) => {
                  formik.setFieldValue('header.workCenterName', '')
                  formik.setFieldValue('header.workCenterId', null)
                  formik.setFieldValue('header.operationId', null)
                  formik.setFieldValue('header.laborId', null)
                }}
                error={formik?.touched?.header?.jobId && Boolean(formik?.errors?.header?.jobId)}
              />
            </Grid>
            <Grid item xs={8}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='header.itemId'
                label={labels.sku}
                valueField='recordId'
                displayField='name'
                valueShow='sku'
                secondValueShow='itemName'
                formObject={formik.values.header}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='header.workCenterName'
                label={labels.workCenter}
                value={formik?.values?.header?.workCenterName}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={formik.values.header.workCenterId && ManufacturingRepository.Operation.qry}
                parameters={`_workCenterId=${formik.values.header.workCenterId}`}
                name='header.operationId'
                label={labels.operation}
                values={formik.values.header}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'reference', width: 1 },
                  { key: 'name', value: 'name', width: 2 }
                ]}
                displayFieldWidth={1.5}
                required
                readOnly={!formik?.values?.header?.workCenterId || editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.operationId', newValue?.recordId || null)
                }}
                error={formik?.touched?.header?.operationId && Boolean(formik?.errors?.header?.operationId)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={formik.values.header.workCenterId && ManufacturingRepository.Labor.qry2}
                parameters={`_workCenterId=${formik.values.header.workCenterId}`}
                name='header.laborId'
                label={labels.labor}
                values={formik.values.header}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'reference', width: 1 },
                  { key: 'name', value: 'name', width: 2 }
                ]}
                displayFieldWidth={1.5}
                required
                readOnly={!formik?.values?.header?.workCenterId || editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.laborId', newValue?.recordId || null)
                }}
                error={formik?.touched?.header?.laborId && Boolean(formik?.errors?.header?.laborId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.expectedPcs'
                label={labels.expectedPcs}
                value={formik?.values?.header?.expectedPcs}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.pcs'
                label={labels.producedPcs}
                value={formik.values.header.pcs}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.producedWeight', newValue * formik.values.header.avgWeight)
                  formik.setFieldValue('header.pcs', newValue || 0)
                }}
                onClear={() => {
                  formik.setFieldValue('header.pcs', 0)
                  formik.setFieldValue('header.producedWeight', 0)
                }}
                readOnly={isPosted}
                maxLength={9}
                required
                error={formik?.touched?.header?.pcs && Boolean(formik?.errors?.header?.pcs)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.avgWeight'
                allowNegative={false}
                label={labels.avgWeight}
                value={formik?.values?.header.avgWeight}
                maxAccess={maxAccess}
                readOnly
                error={formik?.touched?.header?.avgWeight && Boolean(formik?.errors?.header?.avgWeight)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={formik.values.header.bomId && ManufacturingRepository.Component.qry}
                parameters={`_bomId=${formik.values.header.bomId}`}
                name='header.sfItemId'
                label={labels.semiFinishedItem}
                values={formik.values.header}
                valueField='itemId'
                displayField={['sku', 'itemName']}
                columnsInDropDown={[
                  { key: 'sku', value: 'sku', width: 1 },
                  { key: 'itemName', value: 'Item Name', width: 2 }
                ]}
                displayFieldWidth={1.5}
                required
                readOnly={!formik?.values?.header?.bomId || editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.sfItemId', newValue?.itemId || null)
                }}
                error={formik?.touched?.header?.sfItemId && Boolean(formik?.errors?.header?.sfItemId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.producedWeight'
                label={labels.producedWeight}
                allowNegative={false}
                value={formik.values.header.producedWeight}
                maxAccess={maxAccess}
                readOnly
                error={formik?.touched?.header?.producedWeight && Boolean(formik?.errors?.header?.producedWeight)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.weight'
                label={labels.weight}
                value={formik?.values?.header?.weight}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.activeHours'
                label={labels.activeHours}
                value={formik.values?.header?.activeHours}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.activeHours', null)}
                maxAccess={maxAccess}
                maxLength={5}
                decimalScale={2}
                error={formik?.touched?.header?.activeHours && Boolean(formik?.errors?.header?.activeHours)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.idleHours'
                label={labels.idleHours}
                value={formik.values?.header?.idleHours}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.idleHours', null)}
                maxAccess={maxAccess}
                maxLength={5}
                decimalScale={2}
                error={formik?.touched?.header?.idleHours && Boolean(formik?.errors?.header?.idleHours)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.totalHours'
                label={labels.totalHours}
                value={formik.values?.header?.totalHours}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.totalHours', null)}
                maxAccess={maxAccess}
                maxLength={5}
                decimalScale={2}
                error={formik?.touched?.header?.totalHours && Boolean(formik?.errors?.header?.totalHours)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionShifts.qry}
                name='header.shiftId'
                label={labels.shift}
                maxAccess={access}
                readOnly={isPosted}
                valueField='recordId'
                displayField={'name'}
                values={formik.values?.header}
                onChange={(event, newValue) => {
                  formik.setFieldValue('header.shiftId', newValue?.recordId || null)
                }}
                error={formik.touched?.header?.shiftId && Boolean(formik.errors?.header?.shiftId)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            name='rows'
            maxAccess={maxAccess}
            columns={columns}
            allowAddNewLine={!isPosted}
            allowDelete={!isPosted}
            disabled={isPosted}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.notes'
                    label={labels.notes}
                    value={formik.values.header?.notes}
                    rows={2.5}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                    error={formik.touched.header?.notes && Boolean(formik.errors.header?.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.totalSFQty'
                    label={labels.totalUsedSemiFinished}
                    value={totalUsedSemiFinished}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.totalIssued'
                    label={labels.totalIssued}
                    value={totalIssued}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.totalReturned'
                    label={labels.totalReturned}
                    value={totalReturned}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.totalConsumed'
                    label={labels.totalConsumed}
                    value={totalConsumed}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
