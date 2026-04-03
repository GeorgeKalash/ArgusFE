import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function DimensionGroupForm({ recordId, labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.DimensionGroup.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      header: {
        name: '',
      },
      items: [{ id: 1, recordId, seqNo: 1, dimensionId: null }]
    },
    maxAccess,
    validationSchema: yup.object({
      header: yup.object({
        name: yup.string().required(),
      }),
      items: yup
        .array()
        .of(
          yup.object().shape({
            dimensionId: yup.number().required(),
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const payload = {
        header: obj.header,
        items: obj.items.map((item) => ({
          ...item,
          groupId: obj.header.id,
        }))
      }

      const response = await postRequest({
        extension: InventoryRepository.DimensionGroup.set2,
        record: JSON.stringify(payload)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: InventoryRepository.DimensionGroup.get2,
          parameters: `_id=${recordId}`
        })

        formik.setValues({
          recordId: res.record.header.id,
          ...res?.record,
          items: res.record.items.map((item, index) => ({
            ...item,
            id: index
          })) || []
        })
      }
    })()
  }, [])

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.dimension,
      name: 'dimensionId',
      props: {
        endpointId: InventoryRepository.Dimensions.qry,
        valueField: 'id',
        displayField: 'name',
        mapping: [
          { from: 'id', to: 'dimensionId' },
          { from: 'name', to: 'dimensionName' }
        ],
        displayFieldWidth: 1
      }
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.DimensionGroup}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomNumberField
                name='header.id'
                label={labels.id}
                value={formik.values.header.id}
                onChange={formik.handleChange}
                maxLength='3'
                required
                decimalScale={0}
                readOnly={editMode}
                onClear={() => formik.setFieldValue('header.id', null)}
                error={formik.touched.header?.id && Boolean(formik.errors.header?.id)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='header.name'
                label={labels.name}
                value={formik.values.header.name}
                required
                maxAccess={maxAccess}
                maxLength='50'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.name', '')}
                error={formik.touched.header?.name && Boolean(formik.errors.header?.name)}
              />
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            name='items'
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
