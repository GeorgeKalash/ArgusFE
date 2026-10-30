import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import HRDimensionValueForm from './forms/HRDimensionValueForm'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import * as yup from 'yup'
import { Grid } from '@mui/material'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

export default function HrDimensionValue () {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.EmployeeDimensionValue.qry,
    datasetId: ResourceIds.HRDimensionValue
  })

   const { formik } = useForm({
    initialValues: { dimValue: null},
    maxAccess: access,
    validationSchema: yup.object({
      dimValue: yup.string().required()
    })
  })

  async function fetchGridData() {
    const id = formik.values.dimValue
    if (!id) return []

    const response = await getRequest({
      extension: EmployeeRepository.EmployeeDimensionValue.qry,
      parameters: `_dimension=${id}`
    })

    return response
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

  const add = () => {
    if (formik.values.dimValue) openForm()
  }
  const edit = obj => {openForm(obj?.id)}

  function openForm(id) {
    stack({
      Component: HRDimensionValueForm,
      props: {
        labels,
        id,
        maxAccess: access,
        dimNum: formik.values?.dimValue
      },
      width: 500,
      height: 250,
      title: labels.dimensionValues
    })
  }

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.EmployeeDimensionValue.del,
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
                label={labels.dimension}
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
          name='table'
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

