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
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
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
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function ProductionOrderForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ProductionOrder,
    access,
    enabled: !recordId
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionOrder.page
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      plantId,
      notes: '',
      date: new Date(),
      status: 1,
      rows: [
        {
          id: 1,
          poId: recordId,
          sku: '',
          itemName: '',
          qty: null,
          pcs: null,
          designId: null,
          notes: '',
          seqNo: ''
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            qty: yup.number().required(),
            itemName: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const { rows, date, ...rest } = obj

      const header = {
        ...rest,
        date: formatDateToApi(date)
      }

      const updatedRows = formik.values.rows.map((prodDetails, index) => {
        return {
          ...prodDetails,
          poId: recordId ?? 0,
          seqNo: index + 1
        }
      })

      const resultObject = {
        header,
        items: updatedRows
      }

      const res = await postRequest({
        extension: ManufacturingRepository.ProductionOrder.set2,
        record: JSON.stringify(resultObject)
      })

      const actionMessage = !obj.recordId ? platformLabels.Added : platformLabels.Edited
      toast.success(actionMessage)
      invalidate()
      refetchForm(res?.recordId)
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  const totalQty = formik.values?.rows
    ?.reduce((qtySum, row) => {
      const qtyValue = parseFloat(row.qty) || 0

      return qtySum + qtyValue
    }, 0)
    .toFixed(2)

  async function onPost() {
    await postRequest({
      extension: ManufacturingRepository.ProductionOrder.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    })
    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: InventoryRepository.DocumentTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('plantId', res?.record?.plantId ? res?.record?.plantId : plantId)

      return res
    }
  }

  useEffect(() => {
    getDTD(formik?.values?.dtId)
  }, [formik.values.dtId])

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
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
      name: 'qty',
      label: labels.qty,
      props: {
        maxLength: 12,
        decimalScale: 2
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.design,
      name: 'designId',
      props: {
        readOnly: isPosted,
        endpointId: ManufacturingRepository.Design.qry,
        parameters: '_startAt=0&_pageSize=1000&_params=',
        valueField: 'recordId',
        displayField: 'reference',
        mapping: [
          { from: 'recordId', to: 'designId' },
          { from: 'reference', to: 'designRef' },
          { from: 'name', to: 'designName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    }
  ]
  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: ManufacturingRepository.ProductionOrder.get2,
      parameters: `_recordId=${recordId}`
    })

    const modifiedList = res?.record?.items?.map((item, index) => ({
      ...item,
      id: index + 1
    }))

    res.record.header.date = formatDateFromApi(res?.record?.header?.date)

    formik.setValues({
      ...res.record.header,
      rows: modifiedList
    })

    return res?.record
  }

  useEffect(() => {
    if (recordId) refetchForm(recordId)
  }, [])

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: isPosted || !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.ProductionOrder}
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
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.ProductionOrder}`}
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isPosted}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={!editMode && maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId)
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    maxAccess={!editMode && maxAccess}
                    maxLength='30'
                    readOnly={isPosted}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    readOnly={isPosted}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={isPosted}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.description}
                    value={formik?.values?.notes}
                    rows={2.5}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
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
          <Grid container xs={6}>
            <CustomNumberField
              name='totalQty'
              label={labels.totalQty}
              maxAccess={maxAccess}
              value={totalQty}
              maxLength='30'
              readOnly
              error={formik.touched.totalQty && Boolean(formik.errors.totalQty)}
            />
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
