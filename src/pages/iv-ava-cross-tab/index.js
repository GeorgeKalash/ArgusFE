import { useContext, useState, useEffect } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import SerialForm from './forms/SerialForm'
import serialIcon from 'public/images/TableIcons/imgSerials.png'
import lotIcon from 'public/images/TableIcons/lot.png'
import { Box, IconButton } from '@mui/material'
import Image from 'next/image'
import LotForm from './forms/LotForm'
import { ReportIvGenerator } from 'src/repositories/ReportIvGeneratorRepository'

const AvailabilityCrossTab = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [columns, setColumns] = useState([])

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ReportIvGenerator.Report415,
    datasetId: ResourceIds.AvailabilitiesCrossTab,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  console.log('labels', labels)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ReportIvGenerator.Report415,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_properties=`
    })

    let gridData

    if (response) {
      gridData = processGridData(response.record)
    }

    return {
      count: response?.record?.recordCount || 0,
      list: response?.record?.recordCount ? gridData : [],
      _startAt: _startAt
    }
  }

  const processGridData = responseData => {
    const { availabilities, usedSites } = responseData
    usedSites.sort()

    buildColumns(usedSites)

    let addedSKUs = new Set()
    let processedData = []

    availabilities.forEach(availability => {
      if (addedSKUs.has(availability.sku)) return
      addedSKUs.add(availability.sku)

      let row = {
        sku: availability.sku,
        itemName: availability.itemName,
        itemId: availability.itemId,
        categoryId: availability.lotCategoryId,
        trackBy: availability.trackBy
      }

      let sum = 0
      usedSites.forEach(site => {
        const currentAVA = availabilities.find(item => item.sku === availability.sku && item.siteName === site)
        row[site] = currentAVA ? currentAVA.qty : 0
        sum += row[site]
      })

      row['total'] = parseFloat(sum).toFixed(2)
      processedData.push(row)
    })

    return processedData
  }

  const buildColumns = usedSites => {
    let dynamicColumns = [
      {
        field: 'sku',
        headerName: labels.sku,
        width: 250
      },
      {
        field: 'itemName',
        headerName: labels.itemName,
        width: 350
      },
      {
        field: 'total',
        headerName: labels.total,
        type: 'number',
        width: 210
      }
    ]

    usedSites.forEach(site => {
      dynamicColumns.push({
        field: site,
        headerName: site,
        width: usedSites.length <= 8 ? null : 120,
        flex: usedSites.length <= 8 ? 1 : null,
        type: 'number'
      })
    })

    dynamicColumns.push({
      field: 'trackBy',
      headerName: 'S/L',
      width: 60,
      cellRenderer: row => {
        const { trackBy } = row.data

        if (trackBy === 1 || trackBy === 2) {
          return (
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              <IconButton size='small' onClick={() => (trackBy === 1 ? onSerial(row.data) : onLot(row.data))}>
                <Image
                  src={trackBy === 1 ? serialIcon : lotIcon}
                  width={trackBy === 1 ? 25 : 18}
                  height={18}
                  alt={trackBy === 1 ? 'Serial' : 'Lot'}
                />
              </IconButton>
            </Box>
          )
        }

        return null
      }
    })

    setColumns(dynamicColumns)
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: filters?.params ? 0 : pagination._startAt, params: filters?.params })
  }

  const onSerial = obj => {
    console.log('objlabels', labels)
    openSerialForm(obj.itemId)
  }

  const onLot = obj => {
    openLotForm(obj.categoryId, obj.itemId)
  }

  function openSerialForm(itemId) {
    stack({
      Component: SerialForm,
      props: {
        labels,
        itemId
      },
      width: 900,
      height: 600,
      title: labels.serialNo
    })
  }

  function openLotForm(categoryId, itemId) {
    stack({
      Component: LotForm,
      props: {
        labels,
        categoryId,
        itemId,
        maxAccess: access
      },
      width: 1150,
      height: 450,
      title: labels.lotAva
    })
  }

  /*  useEffect(() => {
    console.log('Updated labels:', labels)
    setLabels(labels)
  }, [labels]) */

  const onApply = ({ rpbParams }) => {
    filterBy('params', rpbParams)

    //refetch()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} maxAccess={access} onApply={onApply} reportName={'IV415'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['itemId']}
          maxAccess={access}
          refetch={refetch}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default AvailabilityCrossTab
