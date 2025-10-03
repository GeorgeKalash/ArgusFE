import { Grid } from '@mui/material'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useResourceQuery } from 'src/hooks/resource'

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
