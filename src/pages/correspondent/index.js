// ** React Importsport
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { getNewCorrespondent, populateCorrespondent } from 'src/Models/RemittanceSettings/Correspondent'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import CorrespondentWindow from './Windows/CorrespondentWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import ExchangeMapWindow from './Windows/ExchangeMapWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'

const Correspondent = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  //stores
  // const [gridData, setGridData] = useState(null)
  const [corId, setCorId] = useState(null)

  const [bpMasterDataStore, setBpMasterDataStore] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])
  const [exchangeTableStore, setExchangeTableStore] = useState([])
  const [exchangeTableStoreAll, setExchangeTableStoreAll] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [exchangeMapWindowOpen, setExchangeMapWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  //control

  const {
    query: { data },
    labels : _labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
     queryFn: fetchGridData,
     endpointId: RemittanceSettingsRepository.Correspondent.qry,
     datasetId: ResourceIds.Correspondent,

   })

  async function fetchGridData(options={}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

     const response =  await getRequest({
      extension: RemittanceSettingsRepository.Correspondent.qry,
      parameters: parameters
    })

    return {...response,  _startAt: _startAt}
  }

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
      field: 'bpRef',
      headerName: _labels.BusinessPartner,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: _labels.IsInactive,
      flex: 1
    }
  ]


  const delCorrespondent = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.Correspondent.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addCorrespondent = () => {

    openForm('')
  }

  function openForm (recordId){
    stack({
      Component: CorrespondentWindow,
      props: {
        labels: _labels,
        recordId: recordId? recordId : null,
      },
      width: 1200,
      height: 600,
      title: "Correspondent"
    })
  }

  const popup = obj => {
   openForm(obj?.recordId)
  }




  return (
    <>
      <Box>
        <GridToolbar onAdd={addCorrespondent} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={popup}
          onDelete={delCorrespondent}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Correspondent
