import { useContext } from 'react'
import { Grid } from '@mui/material'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import * as yup from 'yup'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { SCRepository } from '@argus/repositories/src/repositories/SCRepository'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import PrintConfirmationDialog from '../iv-items/forms/PrintConfirmationDialog'

const PrintLabels = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.PrintLabels
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      currencyId: null,
      labelTemplateId: null,
      format: null,
      plId: null,
      items: [
        {
          id: 1,
          itemId: null,
          sku: '',
          itemName: '',
          qty: 0
        }
      ]
    },
    validationSchema: yup.object({
      currencyId: yup.string().required(),
      labelTemplateId: yup.string().required(),
      format: yup.string().required(),
      plId: yup.string().required(),
      items: yup.array().of(
        yup.object().shape({
          sku: yup.string().required(),
          qty: yup.number().nullable()
        })
      )
    }),
    onSubmit: async () => {
      const barcode = await Print()
      stack({
        Component: PrintConfirmationDialog,
        props: {
          Print,
          barcode
        },
        width: 400,
        height: 200
      })
    }
  })

  const isEnabled =
    formik.values.currencyId && formik.values.labelTemplateId && formik.values.format && formik.values.plId

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
          { key: 'name', value: 'Name' },
          { key: 'flName', value: 'FlName' }
        ],
        readOnly: !isEnabled
      }
    },
    {
      component: 'textfield',
      label: labels.name,
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
        allowNegative: false,
        readOnly: !isEnabled
      }
    }
  ]

  const clearGrid = () => {
    if (isEnabled) formik.setFieldValue('items', formik.initialValues.items)
  }

  async function Print() {
    const obj = formik.values

    const res = await getRequest({
      extension: InventoryRepository.LabelString.md,
      parameters: (() => {
        const itemsParam = (obj.items || [])
          .filter(i => i && i.itemId)
          .map(i => `${i.itemId},${i.qty || 0}`)
          .join(',')

        return (
          `_templateId=${obj.labelTemplateId}` +
          `&_currencyId=${obj.currencyId}` +
          `&_printFormat=${encodeURIComponent(obj.format)}` +
          `&_plId=${obj.plId}` +
          `&_items=${itemsParam}`
        )
      })()
    })

    return res?.record?.data
  }

  return (
    <Form onPrint={formik.handleSubmit} isSaved={false} editMode={true} maxAccess={access}>
      <VertLayout>
        <Fixed>
          <GridToolbar
            leftSection={
              <Grid item xs={4}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={SCRepository.LabelTemplate.qry}
                      name='labelTemplateId'
                      label={labels.templateLabel}
                      valueField='recordId'
                      displayField='name'
                      values={formik.values}
                      required
                      maxAccess={access}
                      onChange={(_, newValue) => {
                        clearGrid(), formik.setFieldValue('labelTemplateId', newValue?.recordId || null)
                      }}
                      error={formik.touched.labelTemplateId && Boolean(formik.errors.labelTemplateId)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={SystemRepository.Currency.qry}
                      name='currencyId'
                      label={labels.currency}
                      valueField='recordId'
                      displayField='name'
                      required
                      values={formik.values}
                      maxAccess={access}
                      onChange={(_, newValue) => {
                        clearGrid(), formik.setFieldValue('currencyId', newValue?.recordId || null)
                      }}
                      error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      name='format'
                      datasetId={DataSets.SC_LABEL_PRINT_FORMAT}
                      label={labels.format}
                      valueField='key'
                      displayField='value'
                      required
                      values={formik.values}
                      onChange={(_, newValue) => {
                        clearGrid(), formik.setFieldValue('format', newValue?.key || null)
                      }}
                      error={formik.touched.format && Boolean(formik.errors.format)}
                      maxAccess={access}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={SaleRepository.PriceLevel.qry}
                      parameters='_filter='
                      name='plId'
                      label={labels.priceLevel}
                      valueField='recordId'
                      displayField='name'
                      maxAccess={access}
                      required
                      values={formik.values}
                      onChange={(_, newValue) => {
                        clearGrid(), formik.setFieldValue('plId', newValue?.recordId || null)
                      }}
                      error={formik.touched.plId && Boolean(formik.errors.plId)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
        </Fixed>
        <Grow>
          <DataGrid
            name='items'
            onChange={value => formik.setFieldValue('items', value)}
            initialValues={formik.initialValues.items[0]}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            maxAccess={access}
            allowDelete={isEnabled}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PrintLabels
