import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FormShell from './FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grid } from '@mui/material'
import ResourceComboBox from './ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { useResourceQuery } from 'src/hooks/resource'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import CustomNumberField from '../Inputs/CustomNumberField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataGrid } from './DataGrid'
import { Fixed } from './Layouts/Fixed'
import CustomTextField from '../Inputs/CustomTextField'
import CustomTextArea from '../Inputs/CustomTextArea'

export const LotAvailability = ({ row, window, updateRow, disabled }) => {
  const { getRequest } = useContext(RequestsContext)

  const { labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.LotAvailability
  })

  const [columns, setColumns] = useState([
    {
      component: 'textfield',
      label: labels.lotNumber,
      name: 'lotRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qtyOnHand,
      name: 'onHand',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      async onChange({ row: { update, newRow } }) {}
    }
  ])

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      LOAsku: row?.LOAsku,
      LOAnotes: row?.LOAnotes,
      LOAsiteId: row?.LOAsiteId,
      LOAqty: row?.LOAqty,
      LOACategoryId: row?.LOACategoryId,
      LOASeqNo: row?.LOASeqNo,
      LOAComponentSeqNo: row?.LOAComponentSeqNo,
      LOATrxId: row?.LOATrxId,
      lots: []
    },
    onSubmit: async values => {
      window.close()
    }
  })

  async function getDynamicColumns() {
    if (!row?.LOACategoryId) return

    const response = await getRequest({
      extension: InventoryRepository.LotCategory.get,
      parameters: `_recordId=${row.LOACategoryId}`
    })

    const dynamicColumns = [...columns]

    const columnDefinitions = [
      { key: 'udd1', component: 'date', label: response.record.udd1 },
      { key: 'udd2', component: 'date', label: response.record.udd2 },
      { key: 'udn1', component: 'numberfield', label: labels.udn1, props: { readOnly: true } },
      { key: 'udn2', component: 'numberfield', label: response.record.udn2, props: { readOnly: true } },
      { key: 'udt1', component: 'textfield', label: response.record.udt1, props: { readOnly: true } },
      { key: 'udt2', component: 'textfield', label: response.record.udt2, props: { readOnly: true } }
    ]

    columnDefinitions.forEach(({ key, component, label, props }) => {
      if (response.record[key] !== undefined && response.record[key] !== null && response.record[key] !== '') {
        dynamicColumns.push({
          component,
          label,
          name: key,
          props
        })
      }
    })

    setColumns(dynamicColumns)
  }

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled
    }
  ]
  useEffect(() => {
    getDynamicColumns()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.LotAvailability}
      form={formik}
      isCleared={false}
      isInfo={false}
      isSaved={false}
      actions={actions}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Fixed>
          <Grid container>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField name='LOAsku' label={labels.itemRef} value={row?.LOAsku} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea name='LOAnotes' label={labels.description} value={row?.LOAnotes} rows={3} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='LOAsiteId'
                    readOnly
                    label={labels.site}
                    values={row?.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField name='LOAqty' label={labels.qty} value={row?.LOAqty} readOnly />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('lots', value)}
            value={formik.values?.lots}
            error={formik.errors?.lots}
            name='lots'
            columns={columns}
            maxAccess={maxAccess}
            disabled={disabled}
            allowDelete={!disabled}
            allowAddNewLine={!disabled}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
