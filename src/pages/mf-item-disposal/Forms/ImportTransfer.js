import { useContext } from 'react'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Form from 'src/components/Shared/Form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useWindow } from 'src/windows'

export default function ImportTransfer({ maxAccess, labels, wcSiteId }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      materialTfr: ''
    },
    maxAccess,
    validationSchema: yup.object({
      groupId: yup.string().required()
    }),
    onSubmit: async obj => {}
  })

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => {}
    }
  ]
  async function isValidTfr(value) {
    if (!value) return

    const { list } = await getRequest({
      extension: InventoryRepository.MaterialsTransfer.qry3,
      parameters: `_reference=${value}`
    })

    const record = list?.[0]
    if (!record) return

    const errors = [
      { condition: record.status != 3, message: labels.postedError },
      { condition: !record.siteId, message: labels.mandatorySite },
      { condition: record.siteId != wcSiteId, message: labels.siteMismatch }
    ]

    for (const err of errors) {
      if (err.condition) {
        stackError({ message: err.message })

        return
      }
    }
  }

  return (
    <Form form={formik} isSaved={false} actions={actions} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid item xs={12}>
              <CustomTextField
                name='materialTfr'
                label={labels.materialsTfr}
                value={formik.values.materialsTfr}
                onBlur={e => isValidTfr(e?.target?.value)}
                onClear={() => formik.setFieldValue('materialsTfr', '')}
                error={formik.touched.materialsTfr && Boolean(formik.errors.materialsTfr)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
