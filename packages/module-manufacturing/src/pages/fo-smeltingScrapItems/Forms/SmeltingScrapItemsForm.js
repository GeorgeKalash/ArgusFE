import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { VertLayout } from "@argus/shared-ui/src/components/Layouts/VertLayout"
import { Grow } from "@argus/shared-ui/src/components/Layouts/Grow"
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import * as yup from 'yup'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

const SmeltingScrapItemsForm = ({ labels, maxAccess, recordId, metalRef }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.MetalSettings.page
  })

  const conditions = {
    sku: row => row?.sku,
    itemName: row => row?.itemName,
    puritySource: row => row?.puritySource
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    initialValues: { recordId, metalRef, items: [] },
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    conditionSchema: ['items'],
    onSubmit: async values => {
      const payload = {
        metalId: recordId,
        items: values.items
          .filter(row => Object.values(requiredFields).every(fn => fn(row)))
          .map((row, index) => ({
            ...row,
            metalId: recordId,
            seqNo: index + 1
          }))
      }

      await postRequest({
        extension: FoundryRepository.SmeltingScrapItem.set2,
        record: JSON.stringify(payload)
      })

      toast.success(platformLabels.Updated)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FoundryRepository.SmeltingScrapItem.qry,
          parameters: `_metalId=${recordId}`
        })
        if (res.list?.length) {
          formik.setValues({
            recordId,
            metalRef,
            items: res.list.map((obj, index) => ({
              id: index + 1,
              ...obj
            }))
          })
        }
      }
    })()
  }, [])

  const editMode = !!formik.values.recordId

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'recordId',
        displayField: 'sku',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
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
      component: 'resourcecombobox',
      label: labels.puritySource,
      name: 'puritySource',
      props: {
        datasetId: DataSets.PURITY_SOURCE,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'puritySource' },
          { from: 'value', to: 'puritySourceName' }
        ]
      }
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.SmeltingScrapItems}
      form={formik}
      maxAccess={maxAccess}
      isCleared={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grid item xs={12}>
          <CustomTextField name='metalRef' label={labels.metal} value={formik.values.metalRef} readOnly />
        </Grid>
        <Grow>
          <DataGrid
            name='items'
            maxAccess={maxAccess}
            value={formik.values.items}
            error={formik.errors?.items}
            columns={columns}
            onChange={value => formik.setFieldValue('items', value)}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SmeltingScrapItemsForm
