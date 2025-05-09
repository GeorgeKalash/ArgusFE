import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FormShell from './FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grid } from '@mui/material'
import ResourceComboBox from './ResourceComboBox'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { useResourceQuery } from 'src/hooks/resource'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import CustomNumberField from '../Inputs/CustomNumberField'
import { ResourceLookup } from './ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataGrid } from './DataGrid'
import { Fixed } from './Layouts/Fixed'
import { useError } from 'src/error'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemChecks } from 'src/resources/SystemChecks'

export const AvailabilityForm = ({ row, window, updateRow, disabled }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)

  const { labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Serial
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      sku: row?.sku,
      description: row?.itemName,
      siteId: row?.siteId,
      qty: row?.qty,
      lots: []
    },
    onSubmit: async values => {
      window.close()
    }
  })

  const columns = []

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.ItemLots}
      form={formik}
      isCleared={false}
      isInfo={false}
      isSaved={false}
      actions={actions}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}></Grid>
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
