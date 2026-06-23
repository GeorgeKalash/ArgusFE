import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'

export default function ProductionRequestForm({ recordId, labels, access, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ProductionRequest,
    access,
    enabled: !recordId,
    objectName: 'header'
  })



  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionRequest.page
  })

  const { formik } = useForm({
    maxAccess,
    behavior: { key: 'header.dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues: {
      recordId,
      header: {
        recordId,
        dtId: null,
        reference: '',
        date: new Date(),
        plantId: null,
        notes: '',
        status: 1
      },
      items: [{
        id: 1,
        requestId: recordId || null,
        seqNo: 1,
        itemId: null,
        sku: '',
        itemName: '',
        qty: 0,
        pcs: null,
        itemWeight: null
      }]
    },
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        plantId: yup.number().required()
      }),
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: ManufacturingRepository.ProductionRequest.set2,
        record: JSON.stringify({
          header: { ...obj.header, date: formatDateToApi(obj.header.date) },
          items: obj.items?.filter(item => item.itemId).map((item, index) => ({
            ...item,
            requestId: recordId,
            seqNo: index + 1
          }))
        })
      })
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)

      refetchForm(res.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.header.status === 3

  async function refetchForm(requestId) {
    const { record } = await getRequest({
      extension: ManufacturingRepository.ProductionRequest.get2,
      parameters: `_recordId=${requestId}`
    })
      
    formik.resetForm({
      values: {
        recordId: record.header.recordId,
        header: {
          ...record.header,
          date: formatDateFromApi(record.header?.date)
        },
        items: record?.items?.length > 0 ?
          record?.items?.map((item, index) => {
            return {
              ...item,
              id: index + 1
            }
          })
          : formik.initialValues.items
      }
    })
  }

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.ProductionRequest.post,
      record: JSON.stringify({ recordId: formik.values.recordId })
    })

    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
  ]

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    }
  }, [])

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'itemId',
      flex: 1,
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        displayFieldWidth: 2,
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        let itemWeight = null

        if (newRow?.itemId) {
          const res = await getRequest({
            extension: InventoryRepository.Physical.get,
            parameters: `_itemId=${newRow.itemId}`
          })

          itemWeight = res?.record?.weight
        }

        update({
          itemWeight
        })
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'itemWeight',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      defaultValue: 0,
      flex: 1,
      props: {
        decimalScale: 2,
        maxLength: 10,
        allowNegative: false
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      flex: 1,
      props: {
        decimalScale: 0,
        maxLength: 9,
        allowNegative: false
      }
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.ProductionRequest}
      functionId={SystemFunction.ProductionRequest}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      previewReport={editMode}
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
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.ProductionRequest}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='header.dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik?.values?.header}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik?.touched?.header?.dtId && Boolean(formik?.errors?.header?.dtId)}
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
                    error={formik?.touched?.header?.reference && Boolean(formik?.errors?.header?.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    label={labels.date}
                    value={formik?.values?.header?.date}
                    readOnly={isPosted}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik?.touched?.header?.date && Boolean(formik?.errors?.header?.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.ProductionLine.qry}
                    name='header.plantId'
                    label={labels.plant}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik?.values?.header}
                    readOnly={isPosted}
                    required
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.plantId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.plantId && Boolean(formik?.errors?.header?.plantId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <CustomTextArea
                name='header.notes'
                label={labels.notes}
                value={formik?.values?.header?.notes}
                rows={3}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                onClear={() => formik.setFieldValue('header.notes', '')}
                error={formik?.touched?.header?.notes && Boolean(formik?.errors?.header?.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('items', value)
            }}
            value={formik?.values?.items}
            error={formik?.errors?.items}
            columns={columns}
            maxAccess={maxAccess}
            name='items'
            allowDelete={!isPosted}
            allowAddNewLine={!isPosted}
            disabled={isPosted}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}