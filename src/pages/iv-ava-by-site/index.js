import { useContext } from 'react'
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
import serialIcon from '../../../public/images/TableIcons/imgSerials.png'
import lotIcon from '../../../public/images/TableIcons/lot.png'
import { Box, IconButton } from '@mui/material'
import Image from 'next/image'
import LotForm from './forms/LotForm'
import { ReportIvGenerator } from 'src/repositories/ReportIvGeneratorRepository'

const AvailabilitiesBySite = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ReportIvGenerator.Report403.endpoint,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&exId=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access,

    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ReportIvGenerator.Report403.endpoint,
    datasetId: ResourceIds.AvailabilitiesBySite,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: _labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: _labels.siteName,
      flex: 1
    },
    {
      field: 'unitCost',
      headerName: _labels.unitCost,
      type: 'decimal',
      flex: 1
    },
    {
      field: 'unitPrice',
      headerName: _labels.unitPrice,
      type: 'decimal',
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      type: 'decimal',
      flex: 1
    },
    {
      field: 'pieces',
      headerName: _labels.pieces,
      type: 'decimal',
      flex: 1
    },
    {
      field: 'committed',
      headerName: _labels.committed,
      type: 'decimal',
      flex: 1
    },
    {
      field: 'netWeight',
      headerName: _labels.netWeight,
      type: 'decimal',
      flex: 1
    },
    {
      field: 'netVolume',
      headerName: _labels.netVolume,
      flex: 1,
      type: 'decimal'
    },
    {
      field: 'netCost',
      headerName: _labels.netCost,
      type: 'decimal',
      flex: 1
    },
    {
      field: 'netPrice',
      headerName: _labels.netPrice,
      type: 'decimal',
      flex: 1
    },
    {
      flex: 1,
      headerName: 'S/L',
      cellRenderer: row => {
        const trackBy1 = row.data.trackBy === 1
        const trackBy2 = row.data.trackBy === 2

        if (trackBy1) {
          return (
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              <IconButton size='small' onClick={() => onSerial(row.data)}>
                <Image src={serialIcon} width={18} height={18} alt='Serial' />
              </IconButton>
            </Box>
          )
        }

        if (trackBy2) {
          return (
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              <IconButton size='small' onClick={() => onLot(row.data)}>
                <Image src={lotIcon} width={18} height={18} alt='Lot' />
              </IconButton>
            </Box>
          )
        }

        return null
      }
    }
  ]

  const onSerial = obj => {
    openSerialForm(obj.itemId, obj.siteId)
  }

  const onLot = obj => {
    openLotForm(obj.lotCategoryId, obj.itemId, obj.siteId)
  }

  function openSerialForm(itemId, siteId) {
    stack({
      Component: SerialForm,
      props: {
        labels: _labels,
        itemId,
        siteId,
        maxAccess: access
      },
      width: 600,
      height: 400,
      title: _labels.serialNo
    })
  }

  function openLotForm(lotId, itemId, siteId) {
    stack({
      Component: LotForm,
      props: {
        labels: _labels,
        lotId,
        itemId,
        siteId,
        maxAccess: access
      },
      width: 600,
      height: 400,
      title: _labels.lotAva
    })
  }

  const onApply = ({ rpbParams }) => {
    filterBy('params', rpbParams)
    refetch()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} maxAccess={access} onApply={onApply} reportName={'IV403'} />
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

export default AvailabilitiesBySite
