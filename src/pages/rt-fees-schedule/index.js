import { useState, useContext } from 'react'

import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'

import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

import { RequestsContext } from 'src/providers/RequestsContext'

import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import FeesSceduleWindow from './window/FeesSceduleWindow'
import { ControlContext } from 'src/providers/ControlContext'

const FeeSchedule = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData() {
    return await getRequest({
      extension: RemittanceOutwardsRepository.FeeSchedule.qry
    })
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,

    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.FeeSchedule.qry,
    datasetId: ResourceIds.FeeSchedule
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'originCurrencyName',
      headerName: _labels.originCurrency,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: FeesSceduleWindow,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 1000,
      height: 500,
      title: _labels.feesScedule
    })
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: RemittanceOutwardsRepository.FeeSchedule.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (exception) {}
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default FeeSchedule
