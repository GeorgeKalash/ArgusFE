import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import ExchangeTableWindow from './Windows/ExchangeTableWindow'
import { getFormattedNumberMax} from 'src/lib/numberField-helper'
import { useFormik } from 'formik'
import { getNewProfession, populateProfession } from 'src/Models/CurrencyTradingSettings/Profession'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const ExchangeTables = () => {


  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)


  const [currencyStore, setCurrencyStore] = useState([])
  const [fCurrencyStore, setFCurrencyStore] = useState([])
  const [rateAgainstStore, setRateAainstStore] = useState([])

  useEffect(() => {
    if (!access) getAccess(ResourceIds.ExchangeTables, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })
        getLabels(ResourceIds.ExchangeTables, setLabels)
        fillCurrencyStore()
        fillCRMStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    currency: labels && labels.find(item => item.key === 3).value,
    rcm: labels && labels.find(item => item.key === 4).value,
    rateAgainst: labels && labels.find(item => item.key === 5).value,
    fCurrency: labels && labels.find(item => item.key === 6).value,
    ExchangeTable: labels && labels.find(item => item.key === 7).value
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
      field: 'currency',
      headerName: _labels.currency,
      flex: 1,
      editable: false
    },
  ]

  const addProfession = () => {
    exchangeTableValidation.setValues(getNewProfession())

    // setEditMode(false)
    setWindowOpen(true)
  }

  const delProfession = obj => {
    postRequest({
      extension: CurrencyTradingSettingsRepository.Profession.del,
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

  const editProfession = obj => {
    console.log(obj.monthlyIncome)
    getFormattedNumberMax(obj?.monthlyIncome,8,2)
    obj.monthlyIncome = typeof obj.monthlyIncome !== undefined && getFormattedNumberMax(obj?.monthlyIncome,8,2)
    console.log('test', obj)
    exchangeTableValidation.setValues(populateProfession(obj))
    console.log(obj)

    // setEditMode(true)
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

  const fillCRMStore = () => {
    var parameters = '_database=19'
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setCrmSore(res.list)
      })
      .catch(error => {})
  }


  const fillFCurrency = () => {
    var parameters = '_database=70'
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setFCurrencyStore(res.list)
      })
      .catch(error => {})
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
        // setErrorMessage(error)
      })
  }

  const exchangeTableValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      flName: yup.string().required('This field is required'),
      monthlyIncome: yup.string().required('This field is required'),
      riskFactor: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log({ values })
      postProfession(values)
    }
  })

  const postProfession = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: CurrencyTradingSettingsRepository.Profession.set,
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
        <GridToolbar onAdd={addProfession} maxAccess={access} />

        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          isLoading={false}
          maxAccess={access}
          onEdit={editProfession}
          onDelete={delProfession}
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
          rateAgainstStore={rateAgainstStore}
          labels={_labels}
          maxAccess={access}
        />
      )}
    </>
  )
}

export default ExchangeTables
