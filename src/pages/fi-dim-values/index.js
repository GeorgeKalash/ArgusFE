import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import DimValuesForm from './form/DimValuesForm'
import { Grid } from '@mui/material'

const DimensionsValues = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [tpaValues, setTpaValues] = useState([])
  const [selectedTpaValue, setSelectedTpaValue] = useState({ key: null, value: '' })
  const formatedRecordId = typeof selectedTpaValue?.key == 'string' ? selectedTpaValue.key.match(/\d+/)?.[0] : null

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    invalidate,
    filterBy,
    clearFilter,
    access
  } = useResourceQuery({
    datasetId: ResourceIds.DimensionsValues,
    filter: {
      endpointId: FinancialRepository.DimensionValue.qry,
      filterFn: fetchWithSearch
    }
  })

  useEffect(() => {
    if (formatedRecordId !== null) {
      filterBy('qry', formatedRecordId)
    } else {
      clearFilter('qry')
    }
  }, [formatedRecordId])

  async function fetchWithSearch({ filters }) {
    if (formatedRecordId) {
      const data = await getRequest({
        extension: FinancialRepository.DimensionValue.qry,
        parameters: `_filter=${filters.qry}&_dimension=${formatedRecordId}`
      })

      return data
    }
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
    try {
      await postRequest({
        extension: FinancialRepository.DimensionValue.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {
      toast.error(platformLabels.Error)
    }
  }

  const add = () => {
    if (formatedRecordId) {
      openForm()
    } else {
      toast.error('Select A Dimension', {
        position: 'top-right'
      })
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
        id: id,
        maxAccess: access,
        invalidate,
        dimensionId: formatedRecordId
      },
      width: 600,
      height: 500,
      title: _labels.dimValues
    })
  }
  const emptyValues = item => item.value !== null && item.value !== ''

  useEffect(() => {
    ;(async () => {
      const data = await getRequest({
        extension: SystemRepository.Defaults.qry,
        parameters: `_filter=tpaDimension`
      })

      if (data) {
        const result = data.list.filter(emptyValues)
        setTpaValues(result)
        setSelectedTpaValue(result[0])
      }
    })()
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={_labels} />
        <Grid container>
          <Grid item sx={{ marginLeft: '1rem' }} xs={6}>
            <ResourceComboBox
              label={_labels.group}
              filter={emptyValues}
              valueField='key'
              displayField={['value']}
              store={tpaValues}
              value={selectedTpaValue}
              maxAccess={access}
              onChange={(event, newValue) => {
                setSelectedTpaValue(newValue)
              }}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={formatedRecordId ? data : { list: [], count: 0 }}
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
