import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

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
