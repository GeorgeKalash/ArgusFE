import { useContext } from 'react'
import { Grid } from '@mui/material'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import Form from 'src/components/Shared/Form'
import * as yup from 'yup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import useResourceParams from 'src/hooks/useResourceParams'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { SCRepository } from 'src/repositories/SCRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
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
      items: []
    },
    validationSchema: yup.object({
      currencyId: yup.string().required(),
      labelTemplateId: yup.string().required(),
      format: yup.string().required(),
      plId: yup.string().required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            qty: yup.number().required().typeError().min(1),
            sku: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async () => {
      const barcode = await Print()
      if (barcode)
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
        readOnly:
          !formik.values.currencyId && !formik.values.labelTemplateId && !formik.values.format && !formik.values.plId
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
        readOnly:
          !formik.values.currencyId && !formik.values.labelTemplateId && !formik.values.format && !formik.values.plId
      }
    }
  ]

  const clearGrid = () => {
    if (formik.values.currencyId && formik.values.labelTemplateId && formik.values.format && formik.values.plId)
      formik.setFieldValue('items', [
        {
          id: 1,
          itemId: null,
          sku: '',
          itemName: '',
          qty: null
        }
      ])
  }

  async function Print() {
    const obj = formik.values

    const res = await getRequest({
      extension: InventoryRepository.LabelString.md,
      parameters: (() => {
        const itemsParam = (obj.items || [])
          .filter(i => i && i.itemId)
          .map(i => `${i.itemId},${i.qty}`)
          .join(',')

        return `_templateId=${obj.labelTemplateId}&_currencyId=${obj.currencyId}&_printFormat=${encodeURIComponent(
          obj.format
        )}&_plId=${obj.plId}&_items=${itemsParam}`
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
              <Grid item xs={5}>
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
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            maxAccess={access}
            allowDelete={
              formik.values.currencyId && formik.values.labelTemplateId && formik.values.format && formik.values.plId
            }
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PrintLabels
