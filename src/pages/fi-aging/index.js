import { useContext, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { RGFinancialRepository } from 'src/repositories/RGFinancialRepository'

const FiAging = () => {
  const { getRequest } = useContext(RequestsContext)
  const [columns, setColumns] = useState([])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    let defaultResponse = {
      count: 0,
      list: [],
      statusId: 1,
      message: ''
    }

    try {
      if (params) {
        const response = await getRequest({
          extension: RGFinancialRepository.FiAging.qry,
          parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}`
        })
  
        const legs = response?.record?.legs?.reduce((acc, leg) => {
          acc[leg.seqNo] = leg?.caption
  
          return acc
        }, {})
  
        const orderedLegCaptions = Object.keys(legs)
          .sort((a, b) => a - b)
          .map(seqNo => legs[seqNo])
  
        const list = response?.record?.agings?.map(item => {
          const agingEntry = {
            accountId: item.accountId,
            accountRef: item.accountRef,
            accountName: item.accountName,
            Total: 0
          }
  
          item.amounts.forEach(amount => {
            const legCaption = legs[amount.seqNo]
            agingEntry[legCaption] = amount.amount || 0
            agingEntry.Total += amount.amount || 0
          })
  
          orderedLegCaptions.forEach(caption => {
            if (!(caption in agingEntry)) {
              agingEntry[caption] = 0
            }
          })
  
          return agingEntry
        })
  
        const totalRow = {
          accountId: '',
          accountRef: '',
          accountName: '',
          Total: 0
        }
  
        orderedLegCaptions?.forEach(caption => {
          totalRow[caption] = 0
        })
  
        list.forEach(agingEntry => {
          orderedLegCaptions?.forEach(caption => {
            totalRow[caption] += agingEntry[caption]
          })
          totalRow.Total += agingEntry.Total
        })
  
        const emptyRow = {
          accountId: '',
          accountRef: '',
          accountName: '',
          Total: ''
        }

        orderedLegCaptions.forEach(caption => {
          emptyRow[caption] = ''
        })

        list.push(emptyRow)
        list.push(totalRow)
  
        defaultResponse.count = response?.record?.agings?.length
        defaultResponse.list = list
        defaultResponse.statusId = response?.statusId || 1
        defaultResponse.message = response?.message || ''
  
        if (defaultResponse?.list?.length > 0) {
          const dynamicColumns = [
            { field: 'accountRef', headerName: _labels.reference, flex: 1 },
            { field: 'accountName', headerName: _labels.name, flex: 1 },
            { field: 'Total', headerName: _labels.total, flex: 1, type: 'number' },
            ...orderedLegCaptions?.map(caption => ({
              field: caption,
              headerName: caption,
              flex: 1,
              type: 'number'
            }))
          ]
  
          setColumns(dynamicColumns)
        }
  
        return defaultResponse
      }
    } catch (error) {}
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    filterBy,
    refetch,
    clearFilter,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RGFinancialRepository.FiAging.qry,
    datasetId: ResourceIds.FIAging,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  const onClear = () => {
    clearFilter('qry')
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onClear={onClear}
          labels={_labels}
          maxAccess={access}
          onApply={onApply}
          reportName={'FI04'}
          hasSearch={false}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          disableSorting={true}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default FiAging
