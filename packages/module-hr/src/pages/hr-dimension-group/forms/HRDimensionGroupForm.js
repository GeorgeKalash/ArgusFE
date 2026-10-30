import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'

export default function HRDimensionGroupForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.EmployeeDimensionGroup.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      header: {
        name: '',
        reference: ''
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
      const response = await postRequest({
        extension: EmployeeRepository.EmployeeDimensionGroup.set2,
        record: JSON.stringify(obj)
      })

      toast.success(!formik.values.recordId ? platformLabels.Added : platformLabels.Edited)
      formik.setFieldValue('header.recordId', response.recordId)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: EmployeeRepository.EmployeeDimensionGroup.get2,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          recordId: res?.record?.header?.recordId || null,
          header: res?.record?.header || {},
          items: (res?.record?.items || []).map((item, index) => ({
            ...item,
            id: index + 1
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
        endpointId: EmployeeRepository.EmployeeDimensions.qry,
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
    <FormShell resourceId={ResourceIds.HRDimensionGroup} form={formik} maxAccess={maxAccess} editMode={editMode} isCleared={false}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='header.reference'
                label={labels.reference}
                value={formik.values.header.reference}
                maxAccess={maxAccess}
                maxLength='10'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.reference', '')}
                error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
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
