import { useState, useEffect, useContext } from 'react'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
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
import PropertiesForm from './forms/PropertiesForm'

const Properties = () => {
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const [dimNum, setDimNum] = useState(0)
  const { stack } = useWindow()

  const fetchData = async () => {
    const dimensionNumber = formik.values?.dimValue?.match(/\d+$/)?.[0]
    setDimNum(dimensionNumber)
    if (!dimensionNumber) {
      setData([])

      return
    }

    const response = await getRequest({
      extension: InventoryRepository.Dimension.qry,
      parameters: `_dimension=${dimensionNumber}`
    })
    setData(response || [])
  }

  const {
    labels: _labels,
    access,
    refetch
  } = useResourceQuery({
    endpointId: InventoryRepository.Dimension.qry,
    queryFn: fetchData,
    datasetId: ResourceIds.IVDimension
  })

  const { formik } = useForm({
    initialValues: {
      dimValue: ''
    },
    access,
    validateOnChange: true,
    validationSchema: yup.object({
      dimValue: yup.string().required()
    })
  })

  const rowColumns = [
    {
      field: 'id',
      headerName: _labels.id,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    }
  ]

  function openForm(id) {
    stack({
      Component: PropertiesForm,
      props: {
        labels: _labels,
        id: id,
        maxAccess: access,
        dimNum,
        fetchData: fetchData
      },
      width: 500,
      height: 270,
      title: _labels.properties
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
    fetchData()
    toast.success(platformLabels.Deleted)
  }

  useEffect(() => {
    fetchData()
  }, [formik.values.dimValue])

  useEffect(() => {
    ;(async function () {
      const myObject = {}
      const filteredList = defaultsData?.list?.filter(obj => obj.key.startsWith('ivtDimension'))
      filteredList?.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
      const firstValidKey = filteredList?.find(item => item.value !== '')?.key
      if (firstValidKey) {
        formik.setFieldValue('dimValue', firstValidKey)
      }
    })()
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          middleSection={
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <ResourceComboBox
                endpointId={SystemRepository.Defaults.qry}
                parameters={`_filter=ivtDimension`}
                sx={{ width: 450 }}
                name='dimValue'
                label={_labels.properties}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dimValue', newValue ? newValue.key : '')
                }}
                required
                maxAccess={access}
                filter={item => item.value !== ''}
                error={!formik.values.dimValue}
              />
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          columns={rowColumns}
          gridData={data}
          rowId={['id']}
          pageSize={50}
          onEdit={edit}
          paginationType='client'
          refetch={refetch}
          isLoading={false}
          onDelete={del}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Properties
