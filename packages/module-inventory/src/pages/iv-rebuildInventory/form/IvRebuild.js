import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ThreadProgress } from '@argus/shared-ui/src/components/Shared/ThreadProgress'

export default function RebuildForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: { itemId: 0, date: new Date(), recordId: 'N/A' },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required()
    }),
    onSubmit: async obj => {
      const { recordId, ...rest } = obj

      const res = await postRequest({
        extension: InventoryRepository.RebuildInventory.rebuild,
        record: JSON.stringify(rest)
      })

      toast.success(platformLabels.rebuild)

      stack({
        Component: ThreadProgress,
        props: {
          recordId: res.recordId
        },
        closable: false
      })
    }
  })

  const rebuild = () => {
    formik.handleSubmit()
  }

  const actions = [
    {
      key: 'Rebuild',
      condition: true,
      onClick: () => {
        rebuild()
      },
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.RebuildInventory}
      form={formik}
      actions={actions}
      maxAccess={access}
      isSaved={false}
      isCleared={false}
      editMode={true}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={_labels.item}
                valueField='sku'
                displayField='name'
                valueShow='itemRef'
                secondValueShow='itemName'
                displayFieldWidth={2}
                form={formik}
                onChange={(_, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId || 0)
                  formik.setFieldValue('itemName', newValue?.name || '')
                  formik.setFieldValue('itemRef', newValue?.sku || '')
                }}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={_labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                required
                maxAccess={access}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
