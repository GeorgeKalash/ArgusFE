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
import { useError } from 'src/error'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

export default function ItemDisposalForm({ recordId, access, labels }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ItemDisposal,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Disposal.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      dtId: null,
      date: new Date(),
      toSiteId: null,
      notes: '',
      status: 1,
      wip: 1,
      DisposalItem: [
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
      DisposalSerial: []
    },
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    validationSchema: yup.object({
      date: yup.date().required(),
      workCenterId: yup.number().required()
    }),
    onSubmit: async values => {}
  })

  const editMode = !!formik.values.recordId

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
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
      },
      async onChange({ row: { update, newRow } }) {}
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
      name: 'itemGroupName',
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
              labels,
              row,
              disabled: isPosted || isClosed,
              siteId: formik?.values?.siteId,
              maxAccess,
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
      name: 'serialCount',
      async onChange({ row: { update, newRow } }) {}
    }
  ]

  async function refetchForm() {}

  useEffect(() => {
    ;(async function () {
      if (recordId) {
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ItemDisposal} form={formik} maxAccess={maxAccess} editMode={editMode}>
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
            name='DisposalItem'
            onChange={value => formik?.setFieldValue('DisposalItem', value)}
            maxAccess={maxAccess}
            value={formik?.values?.DisposalItem}
            error={formik?.errors?.DisposalItem}
            columns={columns}
          />
        </Grow>
        <Fixed>
          <Grid container></Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
