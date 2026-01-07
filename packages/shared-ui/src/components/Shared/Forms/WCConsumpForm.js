import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
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
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ImportForm from '@argus/shared-ui/src/components/Shared/ImportForm'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

export default function WCConsumpForm({ recordId, window }) {
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const filteredMeasurements = useRef([])
  const { stack: stackError } = useError()
  const [measurements, setMeasurements] = useState([])
  const [reCal, setReCal] = useState(false)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.WorkCenterConsumptions,
    editMode: !!recordId
  })
  useSetWindow({ title: labels.workCenterConsumption, window })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.WorkCenterConsumption,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.WorkCenterConsumption.page
  })

  function createRowValidation(field) {
    let schema = field === 'qty' ? yup.number().nullable().max(999999999.999, ' ') : yup.mixed()

    return schema.test(function (value) {
      const { sku, qty, itemName } = this.parent
      const isAnyFieldFilled = !!(sku || qty || itemName)

      if (isAnyFieldFilled) {
        return !!value
      }

      return true
    })
  }

  const rowValidationSchema = yup.object({
    itemName: createRowValidation('itemName'),
    sku: createRowValidation('sku'),
    qty: createRowValidation('qty')
  })

  const { formik } = useForm({
    documentType: { key: 'header.dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId,
      header: {
        recordId: null,
        reference: '',
        dtId: null,
        date: new Date(),
        plantId: null,
        siteId: null,
        workCenterId: null,
        WcRef: '',
        WcName: '',
        weight: 0,
        totalQty: 0,
        description: '',
        status: 1,
        wip: 1
      },
      items: [
        {
          id: 1,
          seqNo: 1,
          itemId: null,
          consumptionId: recordId,
          qty: 0,
          unitCost: 0,
          muId: null,
          msId: null,
          itemName: '',
          totalCost: 0,
          baseQty: null
        }
      ]
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        workCenterId: yup.number().required()
      }),
      items: yup.array().of(rowValidationSchema)
    }),
    onSubmit: async obj => {
      const { items: originalItems, header } = obj

      const items = originalItems
        ?.filter(item => item.sku)
        ?.map((item, index) => ({
          ...item,
          seqNo: index + 1,
          consumptionId: obj.recordId || 0
        }))

      const response = await postRequest({
        extension: ManufacturingRepository.WorkCenterConsumption.set2,
        record: JSON.stringify({
          header,
          items
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

  const totalCostField = formik.values.items.reduce((sum, item) => sum + (Number(item?.totalCost) || 0), 0)

  const totalQty = reCal
    ? formik.values.items.reduce((sum, item) => sum + (Number(item?.qty) || 0), 0)
    : formik.values?.header.totalQty || 0

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
  }

  async function getFilteredMU(itemId, msId) {
    if (!itemId) return

    const arrayMU = measurements?.filter(item => item.msId == msId) || []
    filteredMeasurements.current = arrayMU
  }

  const getHeaderData = async recordId => {
    if (!recordId) return

    const response = await getRequest({
      extension: ManufacturingRepository.WorkCenterConsumption.get,
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
      extension: ManufacturingRepository.ConsumptionItemView.qry,
      parameters: `_consumptionId=${recordId}`
    })

    return response?.list?.length > 0
      ? response.list.map((item, index) => {
          return {
            ...item,
            id: index + 1,
            seqNo: index + 1
          }
        })
      : formik.values.items
  }

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.WorkCenterConsumption.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    await postRequest({
      extension: ManufacturingRepository.WorkCenterConsumption.unpost,
      record: JSON.stringify(formik.values.header)
    })

    refetchForm(formik.values.recordId)
    toast.success(platformLabels.Unposted)
    invalidate()
  }

  const onClose = async () => {
    await postRequest({
      extension: ManufacturingRepository.WorkCenterConsumption.close,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Closed)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  const onReopen = async () => {
    await postRequest({
      extension: ManufacturingRepository.WorkCenterConsumption.reopen,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Reopened)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  async function refetchForm(recordId) {
    const header = await getHeaderData(recordId)
    const items = await getItems(recordId)

    formik.setValues({
      ...formik.values,
      recordId: header.recordId,
      header: {
        ...formik.values.header,
        ...header
      },
      items
    })
  }

  const getCost = async itemId => {
    const response = await getRequest({
      extension: InventoryRepository.CurrentCost.get,
      parameters: `_itemId=${itemId}`
    })

    return response?.record?.currentCost
  }

  async function getItem(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.Item.get,
      parameters: `_recordId=${itemId}`
    })

    return res?.record
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        mandatory: true,
        readOnly: isClosed,
        displayFieldWidth: 3,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'msId', to: 'msId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.itemId) {
          filteredMeasurements.current = []
          update({
            muRef: null,
            muId: null,
            baseQty: 0,
            muQty: 0,
            qty: 0,
            totalCost: 0
          })

          return
        }

        if (newRow.isInactive) {
          update({
            ...formik.initialValues.items[0],
            id: newRow.id
          })
          stackError({
            message: labels.inactiveItem
          })

          return
        }
        if (newRow?.itemId) {
          getFilteredMU(newRow?.itemId, newRow.msId)
          const currentCost = newRow?.itemId ? await getCost(newRow?.itemId) : 0
          update({
            unitCost: currentCost || 0,
            muRef: filteredMeasurements?.current?.[0]?.reference || null,
            muId: filteredMeasurements?.current?.[0]?.recordId || null,
            muQty: filteredMeasurements?.current?.[0]?.qty || 0,
            baseQty: filteredMeasurements?.current?.[0]?.qty || newRow?.qty,
            qty: newRow?.qty || 0
          })
        }
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
      component: 'resourcecombobox',
      label: labels.MU,
      name: 'muRef',
      props: {
        store: filteredMeasurements?.current,
        displayField: 'reference',
        valueField: 'recordId',
        readOnly: isClosed,
        mapping: [
          { from: 'reference', to: 'muRef' },
          { from: 'name', to: 'muName' },
          { from: 'qty', to: 'muQty' },
          { from: 'recordId', to: 'muId' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        setReCal(true)
        if (newRow) {
          !newRow.muId
            ? update({
                baseQty: 0
              })
            : update({
                baseQty: newRow?.qty ? newRow?.qty * newRow?.muQty : newRow?.muQty
              })
        }
      },
      propsReducer({ row, props }) {
        return { ...props, store: filteredMeasurements?.current }
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      async onChange({ row: { update, newRow } }) {
        setReCal(true)
        update({
          totalCost: parseFloat(newRow?.unitCost * newRow?.qty).toFixed(2),
          baseQty: newRow?.muQty ? newRow?.muQty * newRow?.qty : newRow?.qty
        })
      },
      props: {
        decimalScale: 2,
        readOnly: isClosed
      }
    },
    {
      component: 'numberfield',
      name: 'unitCost',
      label: labels.unitCost,
      props: {
        decimalScale: 2,
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'totalCost',
      label: labels.totalCost,
      props: {
        decimalScale: 2,
        readOnly: true
      }
    }
  ]

  async function onImportClick() {
    stack({
      Component: ImportForm,
      props: {
        resourceId: ResourceIds.WCConsumptionImport,
        access: maxAccess,
        onSuccess: async res => {
          if (formik?.values?.recordId) {
            const header = await getHeaderData(formik?.values.recordId)
            const items = await getItems(formik?.values.recordId)

            formik.setValues({
              ...formik.values,
              recordId: header.recordId,
              header: {
                ...formik.values.header,
                ...header
              },
              items
            })
            invalidate()
          }
        }
      }
    })
  }

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
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      valuesPath: { ...formik.values.header, notes: formik.values.header.description },
      datasetId: ResourceIds.WorkCenterConsumptions,
      disabled: !editMode
    },
    {
      key: 'Import',
      condition: true,
      onClick: onImportClick,
      disabled: !editMode || formik.values.items.some(item => item.itemId) || isClosed
    }
  ]

  useEffect(() => {
    formik.setFieldValue('header.totalQty', parseFloat(totalQty).toFixed(2))
    formik.setFieldValue('header.totalCostField', parseFloat(totalCostField).toFixed(2))
  }, [totalQty, totalCostField])

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)

      if (recordId) refetchForm(recordId)
    })()
  }, [])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.WorkCenterConsumptions}
      functionId={SystemFunction.WorkCenterConsumption}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      previewReport={editMode}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} xs={12}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.WorkCenterConsumption}`}
                    name='header.dtId'
                    label={labels.docType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched.header?.dtId && Boolean(formik.errors.header?.dtId)}
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
                    error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
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
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ManufacturingRepository.WorkCenter.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='header.workCenterId'
                    secondFieldLabel={labels.name}
                    label={labels.workCenter}
                    valueShow='WcRef'
                    secondValueShow='WcName'
                    maxAccess={maxAccess}
                    formObject={formik.values.header}
                    form={formik}
                    displayFieldWidth={2}
                    required
                    readOnly={isClosed}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'siteName', value: 'Site Name' }
                    ]}
                    onSecondValueChange={(name, value) => {
                      formik.setFieldValue('header.WcName', value)
                    }}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.WcRef', newValue?.isInactive ? '' : newValue?.reference)
                      formik.setFieldValue('header.WcName', newValue?.isInactive ? '' : newValue?.name)
                      formik.setFieldValue('header.siteId', newValue?.isInactive ? null : newValue?.siteId)
                      formik.setFieldValue('header.siteRef', newValue?.isInactive ? '' : newValue?.siteRef)
                      formik.setFieldValue('header.siteName', newValue?.isInactive ? '' : newValue?.siteName)
                      formik.setFieldValue('header.workCenterId', newValue?.isInactive ? null : newValue?.recordId)
                      if (newValue?.isInactive) stackError({ message: labels.inactiveWorkCenter })
                    }}
                    error={formik.touched.header?.workCenterId && Boolean(formik.errors.header?.workCenterId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.siteRef'
                    label={labels.siteRef}
                    value={formik.values.header?.siteRef}
                    readOnly
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.siteName}
                    value={formik.values.header?.siteName}
                    readOnly
                    maxAccess={maxAccess}
                    error={formik.touched.header?.siteName && Boolean(formik.errors.header?.siteName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.description'
                    label={labels.description}
                    value={formik.values.header.description}
                    rows={2.5}
                    readOnly={isClosed}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('header.description', e.target.value)}
                    onClear={() => formik.setFieldValue('header.description', '')}
                    error={formik.touched.header?.description && Boolean(formik.errors.header?.description)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('items', value)
              if (action === 'delete') {
                setReCal(true)
              }
            }}
            onSelectionChange={(row, update, field) => {
              if (field == 'muRef') getFilteredMU(row?.itemId, row?.msId)
            }}
            value={formik.values.items}
            error={formik.errors.items}
            allowDelete={!isClosed}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} xs={12}>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalQty'
                    maxAccess={maxAccess}
                    label={labels.totalQty}
                    value={totalQty}
                    decimalScale={2}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalCost'
                    maxAccess={maxAccess}
                    label={labels.totalCost}
                    value={totalCostField}
                    decimalScale={2}
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

WCConsumpForm.width = 1200
WCConsumpForm.height = 700
