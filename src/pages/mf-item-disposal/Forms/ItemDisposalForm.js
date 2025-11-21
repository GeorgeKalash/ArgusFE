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
          id: 1
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
        //  onCondition
      },
      onClick: (e, row, update, updateRow) => {}
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
        <Grow>
          <Grid container spacing={2}></Grid>
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
