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

const DimensionsValues = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [filteredRecordId, setFilterRecordId] = useState(null)

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
    if (filteredRecordId !== null) {
      filterBy('qry', filteredRecordId)
    } else {
      clearFilter('qry')
    }
  }, [filteredRecordId])

  async function fetchWithSearch({ filters }) {
    if (filteredRecordId) {
      const data = await getRequest({
        extension: FinancialRepository.DimensionValue.qry,
        parameters: `_filter=${filters.qry}&_dimension=${filteredRecordId}`
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
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: DimValuesForm,
      props: {
        labels: _labels,
        record: record,
        recordId: record ? record.Id : undefined,
        maxAccess: access,
        invalidate,
        filteredRecordId
      },
      width: 600,
      height: 500,
      title: _labels.dimValues
    })
  }
  const emptyValues = item => item.value !== null && item.value !== ''

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={_labels} />
        <ResourceComboBox
          endpointId={SystemRepository.Defaults.qry}
          parameters={`_filter=tpaDimension`}
          label={_labels.group}
          filter={emptyValues}
          valueField='key'
          displayField={['value']}
          maxAccess={access}
          onChange={(event, newValue) => {
            const number = newValue?.key.match(/\d+/)?.[0]
            setFilterRecordId(number)
          }}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={filteredRecordId ? data : { list: [], count: 0 }}
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
