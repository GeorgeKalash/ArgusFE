import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import { useResourceQuery } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { DataGrid } from 'src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function PhysicalCountItemDe() {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GenerateTransfers
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      stockCountId: null,
      fromSiteId: null,
      controllerId: null,
      status: 1,
      SCStatus: null,
      SCWIP: null,
      EndofSiteStatus: null,
      items: [
        {
          id: 1,
          sku: '',
          itemId: null,
          itemName: '',
          countedQty: 0,
          weight: 0,
          metalPurity: 0
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      stockCountId: yup.string().required(),
      fromSiteId: yup.string().required(),
      controllerId: yup.string().required(),
      items: yup.array().of(yup.object().shape({})).required()
    }),
    onSubmit: async obj => {}
  })

  async function fetchGridData() {}
  const isCheckedAll = formik.values.items?.length > 0 && formik.values.items?.every(item => item?.isChecked)

  const columns = [
    {
      component: 'checkbox',
      name: 'isChecked',
      flex: 0.3,
      checkAll: {
        value: isCheckedAll,
        visible: true,
        onChange({ checked }) {
          const items = formik.values.items.map(({ isChecked, ...item }) => ({
            ...item,
            isChecked: checked,
            transferNow: checked ? item.qty : 0
          }))

          formik.setFieldValue('items', items)
        }
      },
      async onChange({ row: { update, newRow } }) {
        update({ transferNow: newRow?.isChecked ? newRow?.qty : 0 })
      }
    },
    {
      component: 'textfield',
      label: labels.requestRef,
      name: 'requestRef',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.siteRef,
      name: 'siteRef',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.site,
      name: 'siteName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'date',
      name: 'date',
      flex: 1,
      label: labels?.date,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      flex: 1,
      props: {
        readOnly: true
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
      name: 'onHandGlobal',
      label: labels.onHandGlobal,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'onHandSite',
      label: labels.onHandSite,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'delivered',
      label: labels.delivered,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'balance',
      label: labels.balance,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'transferNow',
      label: labels.transferNow,
      flex: 1
    }
  ]

  const actions = []

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isCleared={false}
      isSaved={false}
      actions={actions}
      maxAccess={access}
      resourceId={ResourceIds.GenerateTransfers}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MaterialTransfer}`}
                name='dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={access}
                onChange={async (event, newValue) => {
                  await changeDT(newValue)
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                readOnly
                maxAccess={access}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='fromSiteId'
                readOnly
                label={labels.fromSite}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('fromSiteId', newValue?.recordId || null)
                }}
                error={formik.touched.fromSiteId && Boolean(formik.errors.fromSiteId)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='toSiteId'
                label={labels.toSite}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={access}
                displayFieldWidth={2}
                onChange={(event, newValue) => {
                  formik.setFieldValue('toSiteId', newValue?.recordId || null)
                }}
                error={formik.touched.toSiteId && Boolean(formik.errors.toSiteId)}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={access}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values?.items}
            error={formik.errors?.items}
            initialValues={formik?.initialValues?.items?.[0]}
            columns={columns}
            disabled={false}
            allowDelete={false}
            allowAddNewLine={false}
            maxAccess={access}
            name='items'
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
