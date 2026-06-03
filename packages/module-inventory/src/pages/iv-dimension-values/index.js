import { useContext } from 'react'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import DimensionValuesForm from './forms/DimensionValuesForm'

const DimensionValues = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    access,
    refetch,
    invalidate
  } = useResourceQuery({
    queryFn: fetchData,
    endpointId: InventoryRepository.Dimension.qry,
    datasetId: ResourceIds.IVDimension
  })

  const { formik } = useForm({
    initialValues: {
      dimValue: null
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      dimValue: yup.string().required()
    })
  })

  async function fetchData() {
    const id = formik.values.dimValue

    if (id) {
      const response = await getRequest({
        extension: InventoryRepository.Dimension.qry,
        parameters: `_dimension=${id}`
      })
      return response
    }

    return []
  }

  const columns = [
    {
      field: 'id',
      headerName: labels.id,
      flex: 1
    },
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    }
  ]

  function openForm(id) {
    stack({
      Component: DimensionValuesForm,
      props: {
        labels,
        id: id,
        maxAccess: access,
        dimNum: formik.values?.dimValue
      },
      width: 500,
      height: 270,
      title: labels.properties
    })
  }

  const add = () => {
    if (formik.values.dimValue) {
      openForm()
    }
  }

  const edit = obj => {
    openForm(obj?.id)
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Dimension.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          middleSection={
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={InventoryRepository.Dimensions.qry}
                name='dimValue'
                label={labels.dimensions}
                valueField='id'
                displayField='name'
                values={formik.values}
                onChange={async (_, newValue) => {
                  await formik.setFieldValue('dimValue', newValue?.id || null)
                  refetch()
                }}
                required
                maxAccess={access}
                error={!formik.values.dimValue}
              />
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['id']}
          pageSize={50}
          onEdit={edit}
          paginationType='client'
          refetch={refetch}
          onDelete={del}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default DimensionValues