import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import ImportTransfer from './ImportTransfer'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { SerialsForm } from '@argus/shared-ui/src/components/Shared/SerialsForm'

export default function ItemDisposalForm({ recordId, access, labels, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ItemDisposal,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Disposal.page
  })

  const { formik } = useForm({
    maxAccess,
    behavior: { key: 'dtId', value: documentType?.dtId, fieldBehavior: documentType?.reference },
    initialValues: {
      recordId: null,
      header: {
        recordId: null,
        reference: '',
        dtId: null,
        date: new Date(),
        siteId: null,
        notes: '',
        status: 1,
        wip: 1
      },
      items: [
        {
          id: 1,
          trxId: null,
          seqNo: null,
          itemId: null,
          itemName: '',
          sku: '',
          qty: 0,
          trackby: null,
          serialCount: 0
        }
      ],
      serials: []
    },
    validationSchema: yup.object({
      header: yup.object({
        date: yup.date().required(),
        siteId: yup.number().required()
      })
    }),
    onSubmit: async values => {
      const copy = values?.header || {}
      const serialsValues = []

      const updatedRows = (values?.items || [])
        .filter(item => item.itemId)
        .map((item, index) => {
          const { serials, ...rest } = item
          if (serials?.length) {
            serials.forEach((serial, sIndex) => {
              serialsValues.push({
                ...serial,
                seqNo: index + 1,
                srlSeqNo: sIndex + 1,
                trxId: copy.recordId || 0
              })
            })
          }

          return {
            ...rest,
            seqNo: index + 1,
            qty: rest?.qty || 0,
            trxId: copy.recordId || 0
          }
        })

      const res = await postRequest({
        extension: ManufacturingRepository.Disposal.set2,
        record: JSON.stringify({
          header: { ...copy, date: copy.date ? formatDateToApi(copy.date) : null },
          items: updatedRows,
          serials: serialsValues
        })
      })

      toast.success(!copy.recordId ? platformLabels.Added : platformLabels.Edited)
      refetchForm(res.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isPosted = formik?.values?.header?.status === 3

  const totals = reCal
    ? (formik?.values?.items || []).reduce(
        (acc, item) => {
          acc.totalCost += parseFloat(item.totalCost || 0)
          acc.totalQty += parseFloat(item.qty || 0)
          acc.totalPcs += parseFloat(item.serialCount || 0)
          return acc
        },
        { totalCost: 0, totalQty: 0, totalPcs: 0 }
      )
    : {
        totalCost: formik?.values?.header?.totalCost || 0,
        totalQty: formik?.values?.header?.totalQty || 0,
        totalPcs: formik?.values?.header?.totalPcs || 0
      }
    
  const { totalCost, totalQty, totalPcs } = totals

  const onCondition = row => {
    if (row.trackBy === 1) {
      return {
        imgSrc: '/images/TableIcons/imgSerials.png',
        hidden: false
      }
    } else {
      return {
        imgSrc: '',
        hidden: true
      }
    }
  }

  async function getGroupInfo(grpId) {
    if (!grpId) return

    const res = await getRequest({
      extension: InventoryRepository.Group.get,
      parameters: `_recordId=${grpId}`
    })

    return res?.record?.name || ''
  }

  const getPhysicalItem = async itemId => {
    if (!itemId) return

    const res = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record?.metalRef || ''
  }

  const getUnitCost = async itemId => {
    if (!itemId) return

    const res = await getRequest({
      extension: InventoryRepository.CurrentCost.get,
      parameters: '_itemId=' + itemId
    })

    return res?.record?.currentCost
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
        displayFieldWidth: 3,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' },
          { from: 'groupId', to: 'groupId' },
          { from: 'trackBy', to: 'trackBy' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow?.isInactive) {
          update({
            ...formik.initialValues.items[0],
            id: newRow.id
          })
          stackError({
            message: labels.inactiveItem
          })

          return
        }
      
        const metalRef = await getPhysicalItem(newRow.itemId)
        const itemGroupName = await getGroupInfo(newRow?.groupId || null)
        const unitCost = await getUnitCost(newRow.itemId)
        update({ 
          itemGroupName,
          metalRef, 
          unitCost, 
          totalCost: parseFloat(newRow.qty) * parseFloat(unitCost) 
        })
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
      label: labels.metal,
      name: 'metalRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemGroup,
      name: 'itemGroupName',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.serialCount,
      name: 'serialCount',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: { maxLength: 12, decimalScale: 2 },
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        update({ qty: parseFloat(newRow?.qty) || 0, totalCost: (newRow?.qty || 0) * (newRow?.unitCost || 0) })
      }
    },
    {
      component: 'button',
      name: 'serials',
      label: platformLabels.serials,
      props: {
        onCondition
      },
      onClick: (e, row, update, updateRow) => {
        if (row?.trackBy == 1) {
          stack({
            Component: SerialsForm,
            props: {
              row: { ...row, serialCount: row?.serialCount || 0 },
              siteId: formik?.values?.header?.siteId,
              checkForSiteId: true,
              updateRow
            }
          })
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitCost',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.totalCost,
      name: 'totalCost',
      props: { readOnly: true }
    }
  ]

  useEffect(() => {
    formik.setFieldValue('header.totalCost', totalCost)
    formik.setFieldValue('header.totalQty', totalQty)
    formik.setFieldValue('header.totalPcs', totalPcs)
  }, [totalCost, totalQty, totalPcs])

  const triggerReCal = () => setReCal(true)

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.Disposal.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      valuesPath: formik.values.header,
      datasetId: ResourceIds.GLItemDisposal,
      disabled: !editMode
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode
    },
    {
      key: 'ImportFromTransfer',
      condition: true,
      onClick: () => {
        stack({
          Component: ImportTransfer,
          props: { maxAccess, labels, form: formik, triggerReCal },
          width: 400,
          height: 150,
          refresh: false,
          title: labels.importFromTransfer
        })
      },
      disabled: isPosted
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

  async function getDisposal(recordId) {
    if (!recordId) return

    const res = await getRequest({
      extension: ManufacturingRepository.Disposal.get,
      parameters: `_recordId=${recordId}`
    })

    return { ...res?.record, date: formatDateFromApi(res?.record?.date) }
  }

  async function getDisposalItem(recordId) {
    if (!recordId) return

    const res = await getRequest({
      extension: ManufacturingRepository.DisposalItem.qry,
      parameters: `_trxId=${recordId}`
    })

    return res?.list?.length
      ? res.list.map((item, index) => ({ ...item, id: index + 1 }))
      : formik?.initialValues?.items
  }

  async function getDisposalSerials(recordId) {
    if (!recordId) return

    const res = await getRequest({
      extension: ManufacturingRepository.DisposalSerial.qry,
      parameters: `_trxId=${recordId}&_seqNo=0`
    })

    return res?.list?.length
      ? res.list.map((serial, index) => ({ ...serial, id: index + 1 }))
      : formik?.initialValues?.serials
  }

  async function refetchForm(recordId) {
    if (!recordId) return

    const header = await getDisposal(recordId)
    const items = await getDisposalItem(recordId)
    const serials = await getDisposalSerials(recordId)

    const serialsBySeq = serials.reduce((acc, serial) => {
      const key = serial.seqNo
      if (!acc[key]) acc[key] = []
      acc[key].push(serial)

      return acc
    }, {})

    const mappedItems = (items || []).map(item => {
      const list = serialsBySeq[item.seqNo] || []

      return {
        ...item,
        serials: list,
        serialCount: list?.length || 0
      }
    })

    formik.setValues({
      header,
      recordId: header.recordId || null,
      items: mappedItems
    })

    setReCal(false)
  }

  useEffect(() => {
    refetchForm(recordId)
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.ItemDisposal}
      functionId={SystemFunction.ItemDisposal}
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
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.ItemDisposal}`}
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
                    values={formik.values?.header}
                    maxAccess={maxAccess}
                    onChange={async (_, newValue) => {
                      await changeDT(newValue)
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                    }}
                    error={formik.touched?.header?.dtId && Boolean(formik.errors?.header?.dtId)}
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
                    onClear={() => formik.setFieldValue('header.reference', null)}
                    error={formik.touched?.header?.reference && Boolean(formik.errors?.header?.reference)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    label={labels.date}
                    value={formik?.values?.header?.date}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='header.siteId'
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values?.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    displayFieldWidth={1.5}
                    required
                    readOnly={isPosted}
                    onChange={(_, newValue) => formik.setFieldValue('header.siteId', newValue?.recordId || null)}
                    error={formik.touched?.header?.siteId && Boolean(formik.errors?.header?.siteId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='header.notes'
                    label={labels.notes}
                    value={formik.values?.header?.notes}
                    maxLength='100'
                    rows={2}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.notes', '')}
                    error={formik.touched?.header?.notes && Boolean(formik.errors?.header?.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            name='disposalItem'
            onChange={value => {
              formik?.setFieldValue('items', value)
              triggerReCal()
            }}
            maxAccess={maxAccess}
            value={formik?.values?.items}
            error={formik?.errors?.items}
            enableFilters
            showCounterColumn={true}
            columns={columns}
            allowAddNewLine={!isPosted}
            allowDelete={!isPosted}
            disabled={isPosted}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} justifyContent='flex-end'>
            <Grid item xs={3}>
              <CustomNumberField name='totalPcs' value={totalPcs} label={labels.totalPcs} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='totalQty' value={totalQty} label={labels.totalQty} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='totalCost' value={totalCost} label={labels.totalCost} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}