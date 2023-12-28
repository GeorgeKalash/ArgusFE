import React, { useContext, useEffect } from 'react'
import { Box } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'

import { useState } from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { CommonContext } from 'src/providers/CommonContext'
import { DataSets } from 'src/resources/DataSets'
import { RequestsContext } from 'src/providers/RequestsContext'
import ProfessionWindow from './Windows/ProfessionWindow'
import { getFormattedNumberMax} from 'src/lib/numberField-helper'

import { useFormik } from 'formik'
import { getNewProfession, populateProfession } from 'src/Models/CurrencyTradingSettings/Profession'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

const Professions = () => {


  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [diplomatStore, setDiplomatStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Profession, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.Profession, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access])

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    flName: labels && labels.find(item => item.key === 3).value,
    monthlyIncome: labels && labels.find(item => item.key === 4).value,
    riskFactor: labels && labels.find(item => item.key === 5).value,
    profession: labels && labels.find(item => item.key === 6).value,
    diplomatStatus: labels && labels.find(item => item.key === 7).value,
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
      field: 'flName',
      headerName: _labels.flName,
      flex: 1,
      editable: false
    },
    {
      field: 'monthlyIncome',
      headerName: _labels.monthlyIncome,
      flex: 1,
      editable: false,
      align: 'right',
      valueGetter: ({ row }) => getFormattedNumberMax(row?.monthlyIncome, 8,2)
    },
    {
      field: 'riskFactor',
      headerName: _labels.riskFactor,
      flex: 1,
      editable: false
    }
  ]

  const addProfession = () => {
    ProfessionValidation.setValues(getNewProfession())
    fillDiplomatStore()
    setWindowOpen(true)
  }

  const delProfession = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.Profession.del,
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
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.Profession.get,
      parameters: parameters
    })
      .then(res => {
        ProfessionValidation.setValues(populateProfession(res.record))
        getFormattedNumberMax(obj?.monthlyIncome,8,2)
        obj.monthlyIncome = typeof obj.monthlyIncome !== undefined && getFormattedNumberMax(obj?.monthlyIncome,8,2)
        fillDiplomatStore()
        setWindowOpen(true)
      })
    .catch(error => {
      setErrorMessage(error)
    })
}

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: RemittanceSettingsRepository.Profession.page,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
      })
  }

  const fillDiplomatStore= () => {
    getAllKvsByDataset({
      _dataset: DataSets.DIPLOMAT_STATUS,
      callback: setDiplomatStore
    })
  }

  const ProfessionValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      flName: yup.string().required('This field is required'),
      monthlyIncome: yup.string().required('This field is required'),
      riskFactor: yup.string().required('This field is required'),
      diplomatStatus: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postProfession(values)
    }
  })

  const postProfession = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.Profession.set,
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
    ProfessionValidation.handleSubmit()
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
        <ProfessionWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          ProfessionValidation={ProfessionValidation}
          labels={_labels}
          maxAccess={access}
          diplomatStore={diplomatStore}
        />
      )}
    </>
  )
}

export default Professions
