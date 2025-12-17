import { useContext } from 'react'
import * as yup from 'yup'
import { Grid } from '@mui/material'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

export default function ImportTransfer({ maxAccess, labels, form, window }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const { formik } = useForm({
    initialValues: {
      materialsTfr: '',
      wcSiteId: parseInt(form?.values?.header?.wcSiteId) || null
    },
    maxAccess,
    validationSchema: yup.object({
      materialsTfr: yup.string().required()
    }),
    onSubmit: async obj => {
      if (!obj.materialsTfr) return
      const importedItems = await isValidTfr(obj?.materialsTfr)
      if (importedItems.some(item => item?.itemId)) {
        form.setFieldValue('items', importedItems)
        window.close()
      } else formik.setFieldValue('materialsTfr', '')
    }
  })

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => {
        formik.handleSubmit()
      }
    }
  ]

  async function getItemSerials(recordId) {
    if (!recordId) return

    const res = await getRequest({
      extension: InventoryRepository.MaterialTransferSerial.qry,
      parameters: `_transferId=${recordId}&_seqNo=${0}&_componentSeqNo=${0}`
    })

    return res?.list?.length ? res.list.map((serial, index) => ({ ...serial, id: index + 1 })) : []
  }

  async function isValidTfr(value) {
    if (!value) return

    const { record } = await getRequest({
      extension: InventoryRepository.MaterialsTransfer.get2,
      parameters: `_reference=${value}`
    })

    if (!record || !record?.header) return

    const errors = [
      { condition: record?.header?.status != 3, message: labels.postedError },
      { condition: !record?.header?.toSiteId, message: labels.mandatorySite },
      {
        condition: !formik?.values?.wcSiteId || record?.header?.toSiteId != formik?.values?.wcSiteId,
        message: labels.siteMismatch
      }
    ]

    for (const err of errors) {
      if (err.condition) {
        stackError({ message: err.message })

        return form?.values?.items || []
      }
    }

    const items = record?.items || []
    const serials = await getItemSerials(record?.header?.recordId)

    const serialsBySeq = serials.reduce((acc, serial) => {
      const key = serial.seqNo
      if (!acc[key]) acc[key] = []
      acc[key].push(serial)

      return acc
    }, {})

    const mappedItems = items?.length
      ? items?.map((item, index) => {
          const list = serialsBySeq[item.seqNo] || []

          return {
            ...item,
            id: index + 1,
            serials: list,
            serialCount: list.length
          }
        })
      : form?.values?.items || []

    return mappedItems
  }

  return (
    <Form form={formik} isSaved={false} actions={actions} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid item xs={12}>
              <CustomTextField
                name='materialsTfr'
                label={labels.materialsTfr}
                value={formik.values.materialsTfr}
                required
                onChange={formik.handleChange}
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
