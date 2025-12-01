import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { FoundryRepository } from 'src/repositories/FoundryRepository'

export default function AlloyMetalsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.AlloyMetals.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      itemId: null,
      name: '',
      sku: ''
    },
    validationSchema: yup.object({
      itemId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: FoundryRepository.AlloyMetals.set,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Added)
      formik.setFieldValue('recordId', obj.itemId)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FoundryRepository.AlloyMetals.get,
          parameters: `_itemId=${recordId}`
        })

        formik.setValues({ ...res.record, recordId: res.record.itemId })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.AlloyMetals}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels.sku}
                valueField='sku'
                displayField='name'
                required
                valueShow='sku'
                secondValueShow='name'
                form={formik}
                readOnly={editMode}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(_, newValue) => {
                  formik.setFieldValue('name', newValue?.name || '')
                  formik.setFieldValue('sku', newValue?.sku || '')
                  formik.setFieldValue('itemId', newValue?.recordId || null)
                }}
                displayFieldWidth={2}
                errorCheck={'itemId'}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
