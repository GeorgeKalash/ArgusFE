import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CommonContext } from 'src/providers/CommonContext'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import ExchangeTableWindow from './Windows/ExchangeTableWindow'
import { useFormik } from 'formik'
import { getNewExchangeTable, populateExchangeTable } from 'src/Models/FinancialsSettings/ExchangeTable'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

const ExchangeTables = () => {


  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [rateAgainst, setRateAgainst] = useState(null)


  const [currencyStore, setCurrencyStore] = useState([])
  const [fCurrencyStore, setFCurrencyStore] = useState([])
  const [RCMStore, setRCMStore] = useState([])

  const [rateAgainstStore, setRateAgainstStore] = useState([])

  useEffect(() => {
    if (!access) getAccess(ResourceIds.ExchangeTables, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })
        getLabels(ResourceIds.ExchangeTables, setLabels)
        fillCurrencyStore()
        fillRCMStore()
        fillRateAgainst()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const _labels = {
    reference: labels && labels.find(item => item.key === "1").value,
    name: labels && labels.find(item => item.key === "2").value,
    currency: labels && labels.find(item => item.key === "3").value,
    rcm: labels && labels.find(item => item.key === "4").value,
    rateAgainst: labels && labels.find(item => item.key === "5").value,
    fCurrency: labels && labels.find(item => item.key === "6").value,
    ExchangeTable: labels && labels.find(item => item.key === "7").value
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1,
      editable: false
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1,
      editable: false
    },
  ]

  const addExchangeTable = () => {
    exchangeTableValidation.setValues(getNewExchangeTable())

    // setEditMode(false)
    setWindowOpen(true)
  }

  const delExchangeTable = obj => {
    postRequest({
      extension: MultiCurrencyRepository.ExchangeTable.del,
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

  const editExchangeTable = obj => {

    exchangeTableValidation.setValues(populateExchangeTable(obj))

      setRateAgainst(obj.rateAgainst)


    setWindowOpen(true)
  }

  const fillCurrencyStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillRCMStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.MC_RATE_CALC_METHOD,
      callback: setRCMStore
    })
  }


  const fillRateAgainst = () => {
    getAllKvsByDataset({
      _dataset: DataSets.MC_RATE_AGAINST,
      callback: setRateAgainstStore
    })
  }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: MultiCurrencyRepository.ExchangeTable.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const exchangeTableValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,

    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),

      name: yup.string().required('This field is required'),

      currencyId: yup.string().required('This field is required'),
      rateCalcMethod: yup.string().required('This field is required'),

       rateAgainst: yup.string().required('This field is required'),
       rateAgainstCurrencyId: rateAgainst==2 && yup.string().required('This field is required')

       // No validation when Rate Against is not 2

    }),
    onSubmit: values => {
      console.log({ values })
      postExchangeTable(values)
    }
  })

  const postExchangeTable = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: MultiCurrencyRepository.ExchangeTable.set,
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

  const handleSubmit = () => {
    exchangeTableValidation.handleSubmit()
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addExchangeTable} maxAccess={access} />

        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          isLoading={false}
          maxAccess={access}
          onEdit={editExchangeTable}
          onDelete={delExchangeTable}
        />
      </Box>

      {windowOpen && (
        <ExchangeTableWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          exchangeTableValidation={exchangeTableValidation}
          currencyStore={currencyStore}
          fCurrencyStore={fCurrencyStore}
          RCMStore={RCMStore}
          rateAgainstStore={rateAgainstStore}
          labels={_labels}
          maxAccess={access}
          rateAgainst={rateAgainst}
          setRateAgainst={setRateAgainst}

        />
      )}
    </>
  )
}

export default ExchangeTables
