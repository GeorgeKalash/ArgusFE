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
import ExchangeMapWindow from './Windows/ExchangeMapWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'

const Correspondent = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const [countryStore, setCountryStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])

  //states
  const [exchangeMapWindowOpen, setExchangeMapWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

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
      width: 1000,
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
      {/* {windowOpen && (
        <CorrespondentWindow
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setWindowOpen(false)}
          width={1000}
          height={350}
          onSave={handleSubmit}
          editMode={editMode}
          lookupBpMasterData={lookupBpMasterData}
          bpMasterDataStore={bpMasterDataStore}
          setBpMasterDataStore={setBpMasterDataStore}
          correspondentValidation={correspondentValidation}
          countriesGridValidation={countriesGridValidation}
          countriesInlineGridColumns={countriesInlineGridColumns}
          currenciesGridValidation={currenciesGridValidation}
          currenciesInlineGridColumns={currenciesInlineGridColumns}
          labels={_labels}
          maxAccess={access}
          corId={corId}
        />
      )} */}

      {exchangeMapWindowOpen && (
        <ExchangeMapWindow
          onClose={() => setExchangeMapWindowOpen(false)}
          onSave={handleExchangeMapSubmit}
          exchangeMapsGridValidation={exchangeMapsGridValidation}
          exchangeMapsInlineGridColumns={exchangeMapsInlineGridColumns}
          exchangeMapValidation={exchangeMapValidation}
          currencyStore={currencyStore.list}
          countryStore={countryStore.list}
          getCurrenciesExchangeMaps={getCurrenciesExchangeMaps}
          maxAccess={access}
          labels={_labels}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Correspondent
