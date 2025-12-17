import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ControlContext } from 'src/providers/ControlContext'
import { useInvalidate } from 'src/hooks/resource'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

const SmeltingScrapItemsForm = ({ labels, maxAccess, recordId, metalRef }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.MetalSettings.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: { recordId, metalRef, items: [] },
    onSubmit: async values => {
      const payload = {
        metalId: recordId,
        items: values.items
          .filter(item => item?.itemId)
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
