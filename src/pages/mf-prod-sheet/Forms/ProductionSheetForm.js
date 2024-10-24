import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

export default function ProductionSheetForm({ labels, maxAccess: access, recordId, plantId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionSheet.qry
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ProductionSheet,
    access: access,
    enabled: !recordId
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const site = defaultsData?.list?.find(obj => {
      return obj.key === 'de_siteId'
    })

    formik.setFieldValue('siteId', parseInt(site?.value))
  }

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      functionId: SystemFunction.ProductionSheet,
      reference: '',
      dtId: documentType?.dtId,
      notes: '',
      status: 1,
      date: new Date(),
      plantId: parseInt(plantId),
      notes: '',
      items: [
        {
          id: 1,
          psId: recordId || 0,
          seqNo: 1,
          sku: '',
          itemName: null,
          itemId: null,
          qty: null,
          orderedQty: 0,
          notes: ''
        }
      ]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      siteId: yup.number().required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            qty: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      delete copy.items
      copy.date = !!copy.date ? formatDateToApi(copy.date) : null

      const updatedRows = formik?.values?.items.map((itemDetail, index) => {
        return {
          ...itemDetail,
          seqNo: index + 1,
          psId: formik.values.recordId || 0,
          orderedQty: itemDetail.orderedQty || 0
        }
      })

      const resultObject = {
        header: copy,
        items: updatedRows
      }

      const res = await postRequest({
        extension: ManufacturingRepository.ProductionSheet.set2,
        record: JSON.stringify(resultObject)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', res.recordId)

        const res2 = await getRequest({
          extension: ManufacturingRepository.ProductionSheet.get,
          parameters: `_recordId=${res.recordId}`
        })

        formik.setFieldValue('reference', res2.record.reference)
      } else toast.success(platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    if (documentType?.dtId) formik.setFieldValue('dtId', documentType.dtId)
  }, [documentType?.dtId])

  const onPost = async () => {
    const copy = { ...formik.values }
    delete copy.items

    const res = await postRequest({
      extension: ManufacturingRepository.ProductionSheet.post,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    await getData(res?.recordId)
  }

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    }
  ]

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'recordId',
        displayField: 'sku',
        mandatory: true,
        displayFieldWidth: 2,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
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
      label: labels.qty,
      name: 'qty'
    },
    {
      component: 'numberfield',
      label: labels.orderedQty,
      name: 'orderedQty',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    }
  ]

  async function getData(recordId) {
    return await getRequest({
      extension: ManufacturingRepository.ProductionSheet.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function getDataGrid() {
    return await getRequest({
      extension: ManufacturingRepository.ProductionSheetItem.qry,
      parameters: `_psId=${recordId}&_functionId=${SystemFunction.ProductionSheet}`
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getData(recordId)

        const res2 = await getDataGrid()

        formik.setValues({
          ...res.record,
          items: res2.list.map(item => ({
            ...item,
            id: item.seqNo,
            orderedQty: item.orderedQty ?? 0
          })),
          date: !!res?.record?.date ? formatDateFromApi(res?.record?.date) : null
        })
      }
    })()
  }, [])

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.ProductionSheet}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={isPosted}
      functionId={SystemFunction.ProductionSheet}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.ProductionSheet}&_startAt=${0}&_pageSize=${1000}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || '')
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode}
                maxAccess={!editMode && maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik?.values?.date}
                required
                readOnly={editMode}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                required
                readOnly
                refresh={editMode}
                label={labels.site}
                values={formik.values}
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId || null)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.recordId)}
              />
            </Grid>
          </Grid>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            maxAccess={maxAccess}
            name='items'
            disabled={isPosted}
            value={formik?.values?.items || []}
            error={formik?.errors?.items}
            columns={columns}
            allowDelete={!isPosted}
            allowAddNewLine={!isPosted}
          />
          <Fixed>
            <Grid container spacing={4} sx={{ mb: 3, display: 'flex', justifyContent: 'left' }}>
              <Grid item xs={4}>
                <CustomTextArea
                  name='notes'
                  label={labels.notes}
                  value={formik.values.notes}
                  maxLength='100'
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('notes', '')}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                />
              </Grid>
            </Grid>
          </Fixed>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
