// ** React Importsport
import { useEffect, useState, useContext } from 'react'

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
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import CorrespondentWindow from './Windows/CorrespondentWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

const Correspondent = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)
  const [bpMasterDataStore, setBpMasterDataStore] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  //stated for countries inline edit grid
  const [inlineCountriesGridDataRows, setInlineCountriesGridDataRows] = useState([])
  const [inlineCountriesDataErrorState, setInlineCountriesDataErrorState] = useState([])
  const [newCountriesLineOnTab, setNewCountriesLineOnTab] = useState(true)
  const [editCountriesRowsModel, setEditCountriesRowsModel] = useState({})

  //stated for currencies inline edit grid
  const [inlineCurrenciesGridDataRows, setInlineCurrenciesGridDataRows] = useState([])
  const [inlineCurrenciesDataErrorState, setInlineCurrenciesDataErrorState] = useState([])
  const [newCurrenciesLineOnTab, setNewCurrenciesLineOnTab] = useState(true)
  const [editCurrenciesRowsModel, setEditCurrenciesRowsModel] = useState({})

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    bpRef: labels && labels.find(item => item.key === 3).value,
    outward: labels && labels.find(item => item.key === 4).value,
    inward: labels && labels.find(item => item.key === 5).value,
    isInactive: labels && labels.find(item => item.key === 6).value,
    correspondent: labels && labels.find(item => item.key === 7).value,
    country: labels && labels.find(item => item.key === 8).value,
    currency: labels && labels.find(item => item.key === 9).value
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
      headerName: _labels.bpRef,
      flex: 1
    },
    {
      field: 'outward',
      headerName: _labels.outward,
      flex: 1
    },
    {
      field: 'inward',
      headerName: _labels.inward,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: _labels.isInactive,
      flex: 1
    }
  ]

  const tabs = [{ label: 'Main' }, { label: 'Countries' }, { label: 'Currencies' }]

  const correspondentValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      bpId: yup.string().required('This field is required'),
      bpRef: yup.string().required('This field is required'),
      bpName: yup.string().required('This field is required'),
      outward: yup.string().required('This field is required'),
      inward: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postCorrespondent(values)
    }
  })

  const lookupBpMasterData = searchQry => {
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: BusinessPartnerRepository.MasterData.snapshot,
      parameters: parameters
    })
      .then(res => {
        setBpMasterDataStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = () => {
    if (activeTab === 0) correspondentValidation.handleSubmit()
    else if (activeTab === 1) {
      console.log('inlineCountriesGridDataRows2', inlineCountriesGridDataRows)
    } else if (activeTab === 2) {
      console.log('currencies', inlineCurrenciesGridDataRows)
    }
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.Correspondent.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postCorrespondent = obj => {
    console.log(obj)
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.Correspondent.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
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

  const fillCountryStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillCurrencyStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addCorrespondent = () => {
    correspondentValidation.setValues(getNewCorrespondent())
    fillCountryStore()
    fillCurrencyStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const getCorrespondentById = obj => {
    const _recordId = obj.recordId
    console.log(_recordId)
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.Correspondent.get,
      parameters: parameters
    })
      .then(res => {
        console.log(res.record)
        correspondentValidation.setValues(populateCorrespondent(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Correspondent, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.Correspondent, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addCorrespondent} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={getCorrespondentById}
          onDelete={delCorrespondent}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <CorrespondentWindow
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          editMode={editMode}
          lookupBpMasterData={lookupBpMasterData}
          bpMasterDataStore={bpMasterDataStore}
          setBpMasterDataStore={setBpMasterDataStore}
          correspondentValidation={correspondentValidation}
          countryStore={countryStore}
          inlineCountriesGridDataRows={inlineCountriesGridDataRows}
          setInlineCountriesGridDataRows={setInlineCountriesGridDataRows}
          inlineCountriesDataErrorState={inlineCountriesDataErrorState}
          setInlineCountriesDataErrorState={setInlineCountriesDataErrorState}
          newCountriesLineOnTab={newCountriesLineOnTab}
          setNewCountriesLineOnTab={setNewCountriesLineOnTab}
          editCountriesRowsModel={editCountriesRowsModel}
          setEditCountriesRowsModel={setEditCountriesRowsModel}
          currencyStore={currencyStore}
          inlineCurrenciesGridDataRows={inlineCurrenciesGridDataRows}
          setInlineCurrenciesGridDataRows={setInlineCurrenciesGridDataRows}
          inlineCurrenciesDataErrorState={inlineCurrenciesDataErrorState}
          setInlineCurrenciesDataErrorState={setInlineCurrenciesDataErrorState}
          newCurrenciesLineOnTab={newCurrenciesLineOnTab}
          setNewCurrenciesLineOnTab={setNewCurrenciesLineOnTab}
          editCurrenciesRowsModel={editCurrenciesRowsModel}
          setEditCurrenciesRowsModel={setEditCurrenciesRowsModel}
          labels={_labels}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Correspondent
