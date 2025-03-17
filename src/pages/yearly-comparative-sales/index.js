import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { ReportSAGeneratorRepository } from 'src/repositories/ReportSAGeneratorRepository'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

const YearlyComparativeSales = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [fiscalYears, setFiscalYears] = useState([])

  const {
    query: { data },
    filterBy,
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ReportSAGeneratorRepository.YearlyComparativeSale.SA503,
    datasetId: ResourceIds.YearlyComparativeSales
  })

  async function getMonths() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.MONTHS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }
  async function getFiscalYears() {
    const fiscalRes = await getRequest({
      extension: SystemRepository.FiscalYears.qry,
      parameters: '_filter='
    })
    setFiscalYears(fiscalRes?.list)
  }

  const columns = [
    {
      field: 'year',
      headerName: labels.year,
      flex: 1,
      type: 'number'
    },
    {
      field: 'total',
      headerName: labels.total,
      flex: 1,
      type: 'number'
    },
    {
      field: 'jan',
      headerName: labels.january,
      flex: 1
    },
    {
      field: 'feb',
      headerName: labels.february,
      flex: 1
    },
    {
      field: 'mar',
      headerName: labels.march,
      flex: 1
    },
    {
      field: 'april',
      headerName: labels.april,
      flex: 1
    },
    {
      field: 'may',
      headerName: labels.may,
      flex: 1
    },
    {
      field: 'jun',
      headerName: labels.june,
      flex: 1
    },
    {
      field: 'jul',
      headerName: labels.july,
      flex: 1
    },
    {
      field: 'aug',
      headerName: labels.augest,
      flex: 1
    },
    {
      field: 'sep',
      headerName: labels.september,
      flex: 1
    },
    {
      field: 'oct',
      headerName: labels.october,
      flex: 1
    },
    {
      field: 'nov',
      headerName: labels.november,
      flex: 1
    },
    {
      field: 'dec',
      headerName: labels.december,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { params = [] } = options
    const months = await getMonths()
    const years = await getFiscalYears()

    const response = await getRequest({
      extension: ReportSAGeneratorRepository.YearlyComparativeSale.SA503,
      parameters: `years=&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
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

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar maxAccess={access} onApply={onApply} reportName={'SA503'} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default YearlyComparativeSales
