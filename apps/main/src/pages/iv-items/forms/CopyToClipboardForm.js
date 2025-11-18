import { Grid } from '@mui/material'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/hooks/form'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import WindowToolbar from '@argus/shared-ui/components/Shared/WindowToolbar'
import { Fixed } from '@argus/shared-ui/components/Layouts/Fixed'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'

export default function CopyToClipboardForm({ barcode, window }) {
  const { labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Items
  })

  const { formik } = useForm({
    initialValues: {
      barcode
    },
    maxAccess,
    onSubmit: obj => {
      navigator.clipboard.writeText(obj.barcode)

      window.close()
    }
  })

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: formik.handleSubmit,
      disabled: false
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4} sx={{ padding: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='barcode'
              label={labels.label}
              value={formik.values.barcode}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('barcode', '')}
              error={formik.touched.barcode && Boolean(formik.errors.barcode)}
            />
          </Grid>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar actions={actions} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}
