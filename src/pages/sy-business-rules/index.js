import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useWindow } from 'src/windows'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import BusinessRulesForm from './form/BusinessRulesForm'

const BusinessRules = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SystemRepository.BusinessRules.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_countryId=0&_stateId=0`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.BusinessRules.qry,
    datasetId: ResourceIds.BusinessRules
  })

  const invalidate = useInvalidate({
    endpointId: SystemRepository.City.page
  })

  const columns = [
    {
      field: 'resourceName',
      headerName: _labels.resourceName,
      flex: 1
    },
    {
      field: 'trxTypeName',
      headerName: _labels.trxTypeName,
      flex: 1
    },
    {
      field: 'ruleEndPointName',
      headerName: _labels.ruleEndPointName,
      flex: 1
    },
    {
      field: 'ruleName',
      headerName: _labels.ruleName,
      flex: 1
    },
    {
      field: 'isActive',
      headerName: _labels.isActive,
      type: 'checkbox',
      flex: 1
    }
  ]

  const del = async obj => {
    try {
      await postRequest({
        extension: SystemRepository.BusinessRules.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  function openForm(obj) {
    stack({
      Component: BusinessRulesForm,
      props: {
        labels: _labels,
        maxAccess: access,
        obj
      },
      width: 500,
      height: 460,
      title: _labels.cities
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={_labels} refetch={refetch} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={access}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default BusinessRules
