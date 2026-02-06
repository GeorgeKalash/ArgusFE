import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import DimValuesForm from './form/DimValuesForm'
import { Grid } from '@mui/material'
import CustomComboBox from '@argus/shared-ui/src/components/Inputs/CustomComboBox'

const DimensionsValues = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [tpaValues, setTpaValues] = useState([])

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    invalidate,
    filters,
    filterBy,
    clearFilter,
    access
  } = useResourceQuery({
    datasetId: ResourceIds.DimensionsValues,
    endpointId: FinancialRepository.DimensionValue.qry,
    filter: {
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters }) {
    const data = await getRequest({
      extension: FinancialRepository.DimensionValue.qry,
      parameters: `_filter=${filters.qry}&_dimension=${filters.qry.match(/\d+/)?.[0]}`
    })

    return data
  }

  const columns = [
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

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.DimensionValue.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const add = () => {
    if (filters.qry) {
      openForm()
    }
  }

  const edit = obj => {
    openForm(obj?.id)
  }

  function openForm(id) {
    stack({
      Component: DimValuesForm,
      props: {
        labels: _labels,
        recordId: id,
        maxAccess: access,
        invalidate,
        dimValue: filters?.qry
      },
      width: 600,
      height: 500,
      title: _labels.dimValues
    })
  }

  useEffect(() => {
    ;(async () => {
      const data = await getRequest({
        extension: SystemRepository.Defaults.qry,
        parameters: `_filter=tpaDimension`
      })

      if (data) {
        const result = data.list.filter(item => item.value)
        setTpaValues(result)

        filterBy('qry', result[0]?.key)
      }
    })()
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <Grid container alignItems='center' spacing={2}>
          <Grid item>
            <GridToolbar onAdd={add} maxAccess={access} labels={_labels} />
          </Grid>
          <Grid item xs={4}>
            <CustomComboBox
              label={_labels.dimensions}
              valueField='key'
              displayField={['value']}
              store={tpaValues}
              value={filters?.qry}
              maxAccess={access}
              onChange={(event, newValue) => {
                if (newValue?.key) {
                  filterBy('qry', newValue?.key)
                } else {
                  clearFilter('qry')
                }
              }}
              error={!filters.qry}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={filters.qry ? data : { list: [], count: 0 }}
          rowId={['id']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default DimensionsValues
