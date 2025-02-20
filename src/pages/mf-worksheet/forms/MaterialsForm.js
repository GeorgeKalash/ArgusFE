import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { DataSets } from 'src/resources/DataSets'
import { useInvalidate } from 'src/hooks/resource'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'

export default function MaterialsForm({ labels, access, recordId, wsId, values }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const functionId = SystemFunction.Worksheet
  const resourceId = ResourceIds.Worksheet

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.WorksheetMaterials.qry
  })

  const { formik } = useForm({
    initialValues: {
      header: {
        recordId: '',
        jobId: null,
        notes: '',
        siteId: null,
        status: 1,
        worksheetId: wsId,
        dtId: documentType?.dtId,
        currencyId: null,
        operationId: null,
        type: null,
        reference: '',
        wsJobRef: '',
        joJobRef: '',
        date: null,
        pgItemName: '',
        laborName: '',
        wipQty: 0,
        wipPcs: 0
      },
      items: [
        {
          id: 1,
          imaId: recordId || 0,
          worksheetId: wsId,
          seqNo: 1,
          itemId: '',
          sku: '',
          itemName: '',
          unitCost: 0.0,
          trackBy: 0,
          qty: 0.0,
          pcs: 0
        }
      ]
    },
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      header: yup.object({
        operationId: yup.number().required(),
        type: yup.number().required()
      })
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.WorksheetMaterials.set2,
        record: JSON.stringify(obj)
      }).then(res => {
        if (!obj.recordId) {
          formik.setFieldValue('recordId', res.recordId)
        }
        const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
        invalidate()
      })
    }
  })

  useEffect(() => {
    ;(async function () {
      const res =
        recordId &&
        (await getRequest({
          extension: ManufacturingRepository.WorksheetMaterials.get,
          parameters: `_recordId=${recordId}`
        }))

      const items =
        recordId &&
        (await getRequest({
          extension: ManufacturingRepository.IssueOfMaterialsItems.qry,
          parameters: `_imaId=${recordId}`
        }))

      if (values) {
        formik.setValues({
          header: {
            ...formik.values.header,
            ...res?.record,
            wsJobRef: values.reference,
            joJobRef: values.jobRef,
            date: values.date,
            pgItemName: values.pgItemName,
            laborName: values.laborName,
            wipQty: values.wipQty,
            wipPcs: values.wipPcs,
            jobId: values.jobId
          },
          items:
            items?.list?.map(({ ...item }, index) => ({
              id: index + 1,
              ...item
            })) || formik.values.items
        })
      }
    })()
  }, [])

  const getValueFromDefaultsData = key => {
    const defaultValue = defaultsData.list.find(item => item.key === key)

    return defaultValue?.value
  }

  async function fillGrid(type, operationId) {
    if (type == 1) {
      const items = await getRequest({
        extension: ManufacturingRepository.DesignRawMaterial.qry2,
        parameters: `_jobId=${values.jobId}&_operationId=${operationId}&_pcs=${values.wipPcs}`
      })

      formik.setFieldValue('items', items.list || formik.values.list)
    }
  }

  const editMode = !!formik?.values?.header?.recordId
  const totalQty = formik.values.items ? formik.values.items.reduce((acc, item) => acc + item.qty, 0) : 0
  const totalPcs = formik.values.items ? formik.values.items.reduce((acc, item) => acc + item.pcs, 0) : 0

  return (
    <FormShell resourceId={resourceId} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || ''), changeDT(newValue)
                    }}
                    readOnly={editMode}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.header.reference}
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    readOnly={editMode}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched.header?.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.Operation.qry}
                    parameters={`_workCenterId=${values.workCenterId}&_startAt=0&_pageSize=100&`}
                    name='operationId'
                    label={labels.operation}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.operationId', newValue?.recordId || null)
                      formik.values.header.type && fillGrid(formik.values.header.type, newValue?.recordId)
                    }}
                    error={formik.touched.header?.operationId && Boolean(formik.errors.header?.operationId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.MF_IOM_TYPE}
                    name='type'
                    label={labels.type}
                    valueField='key'
                    displayField='value'
                    values={formik.values.header}
                    required
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.type', newValue?.key || null)
                      formik.values.header.operationId && fillGrid(newValue?.key, formik.values.header.operationId)
                    }}
                    error={formik.touched.header?.type && Boolean(formik.errors.header?.type)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.header.notes}
                    rows={5}
                    maxLength='100'
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='wsJobRef'
                    label={labels.wsJobRef}
                    value={formik.values.header.wsJobRef}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='joJobRef'
                    label={labels.joJobRef}
                    value={formik.values.header.joJobRef}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values.header.date}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='pgItemName'
                    label={labels.pgItem}
                    value={formik.values.header.pgItemName}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='laborName'
                    label={labels.labor}
                    value={formik.values.header.laborName}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='wipQty'
                    label={labels.wsQty}
                    value={formik.values.header.wipQty}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='wipPcs'
                    label={labels.wsPcs}
                    value={formik.values.header.wipPcs}
                    readOnly
                    maxAccess={maxAccess}
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
            columns={[
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
                },
                async onChange({ row: { update, newRow } }) {
                  if (newRow?.itemId) {
                    const unitCost = await getRequest({
                      extension: InventoryRepository.Cost.get,
                      parameters: `_itemId=${newRow?.itemId}`
                    })
                    update({
                      unitCost: unitCost?.record?.unitCost || 0
                    })
                  }
                }
              },
              {
                component: 'textfield',
                label: labels.item,
                name: 'itemName',
                props: {
                  readOnly: true
                }
              },
              {
                component: 'numberfield',
                label: labels.lot,
                name: 'lotCategoryId',
                props: {
                  maxLength: 6,
                  decimalScale: 2
                }
              },
              {
                component: 'numberfield',
                label: labels.expectedPcs,
                name: 'designPcs',
                props: {
                  maxLength: 6,
                  decimalScale: 5
                }
              },
              {
                component: 'numberfield',
                label: '1',
                name: 'designQty',
                props: {
                  maxLength: 6,
                  decimalScale: 5
                }
              },
              ...(getValueFromDefaultsData('mfimd1')
                ? [
                    {
                      component: 'resourcecombobox',
                      label: getValueFromDefaultsData('mfimd1') && labels.ivDimension1,
                      name: 'mfimd1',
                      props: {
                        endpointId: InventoryRepository.Dimension.qry,
                        valueField: 'recordId',
                        displayField: 'reference',
                        mapping: [
                          { from: 'recordId', to: 'currencyId' },
                          { from: 'reference', to: 'currencyRef' },
                          { from: 'name', to: 'currencyName' }
                        ],
                        columnsInDropDown: [
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ],
                        displayFieldWidth: 2
                      }
                    }
                  ]
                : []),
              ...(getValueFromDefaultsData('mfimd2')
                ? [
                    {
                      component: 'resourcecombobox',
                      label: getValueFromDefaultsData('mfimd2') && labels.ivDimension2,
                      name: 'mfimd2',
                      props: {
                        endpointId: InventoryRepository.Dimension.qry,
                        valueField: 'recordId',
                        displayField: 'reference',
                        mapping: [
                          { from: 'recordId', to: 'currencyId' },
                          { from: 'reference', to: 'currencyRef' },
                          { from: 'name', to: 'currencyName' }
                        ],
                        columnsInDropDown: [
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ],
                        displayFieldWidth: 2
                      }
                    }
                  ]
                : []),
              {
                component: 'numberfield',
                label: labels.quantity,
                name: 'qty',
                props: {
                  maxLength: 6,
                  decimalScale: 5
                }
              },
              {
                component: 'numberfield',
                label: labels.pieces,
                name: 'pcs',
                props: {
                  maxLength: 6
                }
              }
            ]}
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2} sx={{ p: 2 }}>
            <Grid item xs={3}>
              <CustomNumberField name='totalQty' label={labels.totalQty} value={totalQty} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='totalPcs' label={labels.totalPcs} value={totalPcs} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
