import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'

export default function MaterialsForm({ labels, access, recordId, wsId, values, isPosted }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const functionId = SystemFunction.IssueOfMaterial
  const resourceId = ResourceIds.IssueOfMaterials

  const getValueFromDefaultsData = key => {
    return defaultsData.list.find(item => item.key === key)?.value || 0
  }

  const getLabelFromDefaultsData = key => {
    return getValueFromDefaultsData(`ivtDimension${defaultsData.list.find(item => item.key === key)?.value}`)
  }

  const dimensionKeys = ['mfimd1', 'mfimd2']
  const dimensions = dimensionKeys.map(key => Number(getValueFromDefaultsData(key)))

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.WorksheetMaterials.qry
  })

  const { formik } = useForm({
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      header: {
        jobId: values.jobId,
        notes: '',
        siteId: values.siteId,
        status: 1,
        worksheetId: wsId,
        dtId: null,
        currencyId: null,
        operationId: null,
        type: null,
        reference: '',
        wsJobRef: values.reference,
        joJobRef: values.jobRef,
        date: values.date,
        pgItemName: values.pgItemName,
        laborName: values.laborName,
        wipQty: values.wipQty || 0,
        wipPcs: values.wipPcs || 0
      },
      items: [
        {
          id: 1,
          imaId: recordId || 0,
          worksheetId: wsId,
          seqNo: 1,
          itemId: null,
          sku: '',
          itemName: '',
          unitCost: 0.0,
          trackBy: 0,
          qty: 0.0,
          pcs: 0
        }
      ]
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        operationId: yup.number().required(),
        type: yup.number().required()
      }),
      items: yup.array().of(
        yup.object({
          sku: yup.string().required(),
          itemName: yup.string().required(),
          qty: yup.number().required()
        })
      )
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        jobId: values.jobId,
        siteId: values.siteId,
        date: values.date,
        items: obj?.items?.map((item, index) => {
          return {
            ...item,
            imaId: recordId || 0,
            unitCost: item.unitCost || 0,
            seqNo: index + 1
          }
        })
      }

      const res = await postRequest({
        extension: ManufacturingRepository.WorksheetMaterials.set2,
        record: JSON.stringify(data)
      })

      const dimensionRecords = []
      for (const item of data.items) {
        const { seqNo } = item

        dimensions.forEach((dimension, index) => {
          const dimIdKey = `dim${index + 1}Id`
          const dimNameKey = `dimensionName${index + 1}`
          if (item[dimIdKey]) {
            dimensionRecords.push({
              imaId: res.recordId,
              seqNo,
              dimension,
              dimensionName: item[dimNameKey],
              id: item[dimIdKey]
            })
          }
        })
      }

      for (const record of dimensionRecords) {
        await postRequest({
          extension: ManufacturingRepository.IssueOfMaterialDimension.set,
          record: JSON.stringify(record)
        })
      }

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      invalidate()
      await getData(res.recordId)
    }
  })

  useEffect(() => {
    ;(async function () {
      getData(recordId)
    })()
  }, [])

  const getData = async recordId => {
    if (!recordId) return

    const response = await getRequest({
      extension: ManufacturingRepository.WorksheetMaterials.pack,
      parameters: `_recordId=${recordId}`
    })
    const header = response?.record?.header || {}
    const itemList = response?.record?.items || []

    const items = await Promise.all(
      itemList.map(async (item, index) => {
        const dimRes = response?.record?.dimensions || []
        const filteredDimRes = dimRes.filter(dim => dim?.seqNo === item?.seqNo)
       
        const dims = (filteredDimRes || []).sort((a, b) => a.dimension - b.dimension)
        const dimData = {}

        dims.forEach(d => {
          const dimIndex = dimensions.findIndex(dim => dim === d.dimension)
          if (dimIndex !== -1) {
            const dimNumber = dimIndex + 1
            dimData[`dim${dimNumber}Id`] = d.id
            dimData[`dimensionName${dimNumber}`] = d.dimensionName
          }
        })

        return {
          id: index + 1,
          ...item,
          ...dimData
        }
      })
    )

    if (values) {
      formik.setValues({
        recordId,
        header: {
          ...formik.values.header,
          ...header,
          siteId: values.siteId,
          wsJobRef: values.reference,
          joJobRef: values.jobRef,
          date: values.date,
          pgItemName: values.pgItemName,
          laborName: values.laborName,
          wipQty: values.wipQty,
          wipPcs: values.wipPcs,
          jobId: values.jobId
        },
        items
      })
    }
  }

  async function fillGrid(type, operationId) {
    if (type == 1) {
      const items = await getRequest({
        extension: ManufacturingRepository.DesignRawMaterial.qry2,
        parameters: `_jobId=${values.jobId}&_operationId=${operationId}&_pcs=${values.wipPcs}`
      })

      formik.setFieldValue(
        'items',
        items?.list?.map(({ ...item }, index) => ({
          id: index + 1,
          ...item,
          pcs: item.pcs || 0,
          qty: item.qty || 0
        })) || formik.values.items
      )
    }
  }

  const editMode = !!formik?.values?.header?.recordId

  const totalQty = formik.values?.items?.reduce((qty, row) => qty + (parseFloat(row.qty) || 0), 0) ?? 0
  const totalPcs = formik.values?.items?.reduce((pcs, row) => pcs + (parseFloat(row.pcs) || 0), 0) ?? 0

  const totalExpQty = formik.values.items?.reduce((acc, { designQty = 0 }) => acc + (Number(designQty) || 0), 0) ?? 0
  const totalExpPcs = formik.values.items?.reduce((acc, { designPcs = 0 }) => acc + (Number(designPcs) || 0), 0) ?? 0

  const dimensionComponents = dimensions
    .map((dimension, index) => {
      if (!dimension) return null

      return {
        component: 'resourcecombobox',
        label: getLabelFromDefaultsData(dimensionKeys[index]),
        name: `dimensionName${index + 1}`,
        props: {
          endpointId: InventoryRepository.Dimension.qry,
          dynamicParams: `_dimension=${dimension}`,
          valueField: 'id',
          displayField: 'name',
          mapping: [
            { from: 'id', to: `dim${index + 1}Id` },
            { from: 'name', to: `dimensionName${index + 1}` }
          ],
          displayFieldWidth: 2
        }
      }
    })
    .filter(Boolean)

  return (
    <FormShell
      resourceId={resourceId}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
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
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.dtId', newValue?.recordId || '')
                  changeDT(newValue)
                }}
                readOnly={editMode}
                error={formik.touched.header?.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='wsJobRef'
                label={labels.wsJobRef}
                value={formik.values.header.wsJobRef}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='laborName'
                label={labels.labor}
                value={formik.values.header.laborName}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
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
            <Grid item xs={4}>
              <CustomTextField
                name='joJobRef'
                label={labels.joJobRef}
                value={formik.values.header.joJobRef}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='wipQty'
                label={labels.wsQty}
                value={formik.values.header.wipQty}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
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
                readOnly={isPosted}
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.operationId', newValue?.recordId || null)
                  if (newValue?.recordId && formik.values.header.type) {
                    fillGrid(formik.values.header.type, newValue?.recordId)
                  }
                }}
                error={formik.touched.header?.operationId && Boolean(formik.errors.header?.operationId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values.header.date}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='wipPcs'
                label={labels.wsPcs}
                value={formik.values.header.wipPcs}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
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
                onChange={(_, newValue) => {
                  formik.setFieldValue('header.type', newValue?.key || null)
                  if (newValue?.key && formik.values.header.operationId) {
                    fillGrid(newValue?.key, formik.values.header.operationId)
                  }
                }}
                error={formik.touched.header?.type && Boolean(formik.errors.header?.type)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='pgItemName'
                label={labels.pgItem}
                value={formik.values.header.pgItemName}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            name='items'
            value={formik.values.items}
            error={formik.errors.items}
            maxAccess={access}
            columns={[
              {
                component: 'resourcelookup',
                label: labels.sku,
                name: 'sku',
                props: {
                  endpointId: InventoryRepository.Materials.snapshot,
                  valueField: 'recordId',
                  displayField: 'sku',
                  mandatory: true,
                  displayFieldWidth: 3,
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
                      extension: InventoryRepository.CurrentCost.get,
                      parameters: `_itemId=${newRow?.itemId}`
                    })

                    const rawCategory = await getRequest({
                      extension: InventoryRepository.ItemProduction.get,
                      parameters: `_recordId=${newRow?.itemId}`
                    })

                    update({
                      unitCost: unitCost?.record?.unitCost || 0,
                      rmCategoryName: rawCategory?.record?.rmcName
                    })
                  }
                }
              },
              { component: 'textfield', label: labels.item, name: 'itemName', props: { readOnly: true } },
              {
                component: 'textfield',
                label: labels.rawCategory,
                name: 'rmCategoryName',
                props: { readOnly: true }
              },
              {
                component: 'numberfield',
                label: labels.lot,
                name: 'lotCategoryId',
                props: { readOnly: true }
              },
              {
                component: 'numberfield',
                label: labels.expectedQty,
                name: 'designQty',
                props: { readOnly: true }
              },
              {
                component: 'numberfield',
                label: labels.expectedPcs,
                name: 'designPcs',
                props: { readOnly: true }
              },
              ...dimensionComponents,
              {
                component: 'numberfield',
                label: labels.quantity,
                name: 'qty',
                props: { maxLength: 10 }
              },
              {
                component: 'numberfield',
                label: labels.pieces,
                name: 'pcs',
                props: { decimalScale: 0 }
              }
            ]}
            disabled={isPosted}
            allowDelete={!isPosted}
            allowAddNewLine={!isPosted}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.header.notes}
                rows={2}
                maxLength='100'
                editMode={editMode}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                onClear={() => formik.setFieldValue('header.notes', '')}
              />
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              <CustomNumberField name='totalExpQty' label={labels.totalExpQty} value={totalExpQty} readOnly />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField name='totalExpPcs' label={labels.totalExpPcs} value={totalExpPcs} readOnly />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField name='totalQty' label={labels.totalQty} value={totalQty} readOnly />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField name='totalPcs' label={labels.totalPcs} value={totalPcs} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
