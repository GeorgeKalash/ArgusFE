import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useWindow } from 'src/windows'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { SerialsForm } from 'src/components/Shared/SerialsForm'
import ImportTransfer from './ImportTransfer'
import { Refresh } from '@mui/icons-material'

export default function ItemDisposalForm({ recordId, access, labels }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

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
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      reference: '',
      dtId: null,
      date: new Date(),
      siteId: null,
      notes: '',
      status: 1,
      wip: 1,
      workCenterId: null,
      items: [
        {
          id: 1,
          trxId: null,
          seqNo: null,
          itemId: null,
          itemName: '',
          sku: '',
          qty: 0,
          trackby: null
        }
      ],
      serials: []
    },
    validationSchema: yup.object({
      date: yup.date().required(),
      workCenterId: yup.number().required(),
      siteId: yup.number().required()
    }),
    onSubmit: async values => {
      const copy = { ...values }
      delete copy.items
      delete copy.serials
      copy.date = copy.date ? formatDateToApi(copy.date) : null

      const serialsValues = []

      const updatedRows = formik.values.items.map((item, index) => {
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
          trxId: copy.recordId || 0
        }
      })

      const res = await postRequest({
        extension: ManufacturingRepository.Disposal.set2,
        record: JSON.stringify({
          header: copy,
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
  const calculateTotal = key => formik.values.items.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0)
  const totalQty = calculateTotal('qty')

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

    return res?.record?.reference || ''
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
        const itemGroupRef = await getGroupInfo(newRow?.groupId)
        update({ itemGroupRef })
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
      component: 'textfield',
      label: labels.itemGroup,
      name: 'itemGroupRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      async onChange({ row: { update, newRow } }) {}
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
              row,
              siteId: formik?.values?.siteId,
              checkForSiteId: true,
              updateRow
            }
          })
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.serialCount,
      name: 'serialCount'
    }
  ]

  const actions = [
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode
    },
    {
      key: 'Import From Transfer',
      condition: true,
      onClick: () => {
        stack({
          Component: ImportTransfer,
          props: { maxAccess, labels },
          width: 400,
          height: 150,
          refresh: false,
          title: labels.importFromTransfer
        })
      }
    }
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

  async function refetchForm(recordId) {
    const header = await getDisposal(recordId)
    const items = await getDisposalItem(recordId)

    formik.setValues({ ...header, items })
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
      actions={actions}
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
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={async (_, newValue) => {
                      await changeDT(newValue)
                      formik.setFieldValue('dtId', newValue?.recordId || null)
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
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', null)}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.date}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    displayFieldWidth={1.5}
                    required
                    onChange={(_, newValue) => formik.setFieldValue('siteId', newValue?.recordId || null)}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.WorkCenter.qry}
                name='workCenterId'
                label={labels.workCenter}
                required
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                displayFieldWidth={1.5}
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue('workCenterId', newValue?.recordId || null)}
                error={formik.touched.workCenterId && Boolean(formik.errors.workCenterId)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            name='disposalItem'
            onChange={value => formik?.setFieldValue('items', value)}
            maxAccess={maxAccess}
            value={formik?.values?.items}
            error={formik?.errors?.items}
            columns={columns}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} justifyContent='flex-end'>
            <Grid item xs={3}>
              <CustomNumberField
                name='totalQty'
                maxAccess={maxAccess}
                value={totalQty}
                label={labels.totalQty}
                readOnly
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='totalPcs' maxAccess={maxAccess} value='' label={labels.totalPcs} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
