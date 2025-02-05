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

export default function MaterialsForm({ labels, maxAccess, recordId, seqNo, caId, values }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const functionId = SystemFunction.Worksheet
  const resourceId = ResourceIds.Worksheet

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.WorksheetMaterials.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      dtId: null,
      caId: caId,
      currencyId: null,
      accountId: null,
      functionId: null,
      operationId: null,
      type: null,
      baseAmount: 0.0,
      reference: '',
      seqNo: seqNo || null,
      amount: 0.0,
      wsJobRef: '',
      joJobRef: '',
      date: null,
      pgItemName: '',
      laborName: '',
      wipQty: 0,
      wipPcs: 0,
      grid: [
        {
          id: 1,
          recordId: recordId,
          seqNo: '',
          itemId: '',
          sku: '',
          itemName: '',
          laborValuePerGram: '',
          purity: ''
        }
      ]
    },
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      operationId: yup.number().required(),
      type: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.WorksheetMaterials.set,
        record: JSON.stringify(obj)
      }).then(res => {
        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', res.recordId)
        } else {
          toast.success(platformLabels.Edited)
        }
        invalidate()
      })
    }
  })
  const editMode = !!formik.values.recordd

  useEffect(() => {
    ;(async function () {
      const res =
        recordId &&
        (await getRequest({
          extension: ManufacturingRepository.WorksheetMaterials.get,
          parameters: `_recordId=${recordId}`
        }))

      if (res) {
        fillGrid(res?.record?.type, res?.record?.operationId)
      }

      if (values) {
        formik.setValues({
          ...res?.record,
          wsJobRef: values.reference,
          joJobRef: values.jobRef,
          date: values.date,
          pgItemName: values.pgItemName,
          laborName: values.laborName,
          wipQty: values.wipQty,
          wipPcs: values.wipPcs,
          grid: formik?.values.grid
        })
      }
    })()
  }, [])

  const getValueFromDefaultsData = key => {
    const defaultValue = defaultsData.list.find(item => item.key === key)

    return defaultValue ? defaultValue.value : null
  }

  async function fillGrid(type, operationId) {
    if (type == 1) {
      const grid = await getRequest({
        extension: ManufacturingRepository.qryDMR2,
        parameters: `_jobId=${values.jobId}&_operationId=${operationId}&_pcs=${values.wipPcs}`
      })
      formik.setFieldValue(grid, grid.list)
    }
  }

  const totalQty = formik.values.grid ? formik.values.grid.reduce((acc, item) => acc + item.qty, 0) : 0
  const totalPcs = formik.values.grid ? formik.values.grid.reduce((acc, item) => acc + item.pcs, 0) : 0

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
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || '')
                    }}
                    readOnly={editMode}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    readOnly={editMode}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.Operation.qry}
                    parameters={`_workCenterId=0&_startAt=0&_pageSize=100&`}
                    name='operationId'
                    label={labels.operation}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('operationId', newValue?.recordId || null)
                    }}
                    error={formik.touched.operationId && Boolean(formik.errors.operationId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.MF_IOM_TYPE}
                    name='type'
                    label={labels[3]}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    required
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('type', newValue?.key || null)
                      formik.values.operationId && fillGrid(newValue?.key, formik.values.operationId)
                    }}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    helperText={formik.touched.type && formik.errors.type}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    rows={5}
                    maxLength='100'
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('notes', e.target.value)}
                    onClear={() => formik.setFieldValue('notes', '')}
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
                    value={formik.values.wsJobRef}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='joJobRef'
                    label={labels.joJobRef}
                    value={formik.values.joJobRef}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values.date}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='pgItemName'
                    label={labels.pgItemName}
                    value={formik.values.pgItemName}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='laborName'
                    label={labels.laborName}
                    value={formik.values.laborName}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='wipQty'
                    label={labels.wipQty}
                    value={formik.values.wipQty}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='wipPcs'
                    label={labels.wipPcs}
                    value={formik.values.wipPcs}
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
            onChange={value => formik.setFieldValue('grid', value)}
            value={formik.values.grid}
            error={formik.errors.grid}
            columns={[
              {
                component: 'resourcelookup',
                label: labels.sku,
                name: 'sku',
                props: {
                  endpointId: InventoryRepository.Item.snapshot,
                  valueField: 'recordId',
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
                  displayFieldWidth: 1
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
                label: labels.lotCategoryId,
                name: 'lotCategoryId',
                props: {
                  maxLength: 6,
                  decimalScale: 2
                }
              },
              {
                component: 'numberfield',
                label: labels.designQty,
                name: 'designQty',
                props: {
                  maxLength: 6,
                  decimalScale: 5
                }
              },
              {
                component: 'numberfield',
                label: labels.designPcs,
                name: 'designPcs',
                props: {
                  maxLength: 6,
                  decimalScale: 5
                }
              },
              {
                component: 'numberfield',
                label: labels.designQty,
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
                label: labels.qty,
                name: 'qty',
                props: {
                  maxLength: 6,
                  decimalScale: 5
                }
              },
              {
                component: 'numberfield',
                label: labels.pcs,
                name: 'pcs',
                props: {
                  maxLength: 6,
                  decimalScale: 5
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
