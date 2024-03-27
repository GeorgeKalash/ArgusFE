import React, { useContext, useState, useEffect } from 'react'
import Window from './Window'
import CustomTabPanel from './CustomTabPanel'
import { CommonContext } from 'src/providers/CommonContext'
import { DataSets } from 'src/resources/DataSets'
import Grid from '@mui/system/Unstable_Grid/Grid'
import CustomComboBox from '../Inputs/CustomComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import Table from './Table'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { formatDateFromApi } from 'src/lib/date-helper'

const TransactionLog = props => {
  const { recordId, resourceId, onInfoClose } = props
  const { getRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  const [transactionTypeStore, setTransactionTypeStore] = useState([])
  const [transactionType, setTransactionType] = useState(0)
  const [gridData, setGridData] = useState({})
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [info, setInfo] = useState({})

  useEffect(() => {
    if (!access) getAccess(ResourceIds.TransactionLog, setAccess)
    else {
      if (access?.record.maxAccess > 0) {
        getGridData()
        getLabels(ResourceIds.TransactionLog, setLabels)
        fillTransactionTypeStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access, transactionType])

  const _labels = {
    trxType: labels && labels.find(item => item.key === '1').value,
    recordId: labels && labels.find(item => item.key === '2').value,
    resourceId: labels && labels.find(item => item.key === '3').value,
    eventDate: labels && labels.find(item => item.key === '4').value,
    username: labels && labels.find(item => item.key === '5').value,
    trxName: labels && labels.find(item => item.key === '6').value,
    title: labels && labels.find(item => item.key === '7').value
  }

  const fillTransactionTypeStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.TRX_TYPE,
      callback: setTransactionTypeStore
    })
  }

  const getGridData = () => {
    var parameters = `_resourceId=${resourceId}&_masterRef=${recordId}&_trxType=${transactionType}`
    getRequest({
      extension: SystemRepository.TransactionLog.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const showInfo = obj => {
    var parameters = `_recordId=${obj.recordId}`
    getRequest({
      extension: SystemRepository.TransactionLog.get,
      parameters: parameters
    })
      .then(res => {
        setInfo(JSON.parse(res.record.data))
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const formatDate = dateString => {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }

    return new Date(dateString).toLocaleString('en-GB', options)
  }

  const columns = [
    {
      field: 'eventDt',
      headerName: _labels.eventDate,
      flex: 1,
      valueGetter: ({ row }) => formatDate(formatDateFromApi(row?.eventDt))
    },
    {
      field: 'userName',
      headerName: _labels.username,
      flex: 1
    },
    ,
    {
      field: 'ttName',
      headerName: _labels.trxName,
      flex: 1
    }
  ]

  return (
    <div onClose={onInfoClose} Title={_labels.title}>
      <CustomTabPanel>
        <Grid container xs={12} sx={{ paddingBottom: '25px' }}>
          <Grid item xs={5}>
            <CustomComboBox
              name='idtId'
              label={_labels.trxType}
              valueField='key'
              displayField='value'
              store={transactionTypeStore}
              value={transactionTypeStore?.filter(item => item.recordId === transactionType)[0]}
              required
              onChange={(event, newValue) => {
                if (newValue) {
                  setTransactionType(newValue.key)
                } else {
                  setTransactionType(0)
                }
              }}
            />
          </Grid>
          <Grid container xs={2}></Grid>
          <Grid container xs={4} spacing={4}>
            <Grid container xs={12}>
              <Grid item xs={6}>
                {_labels.recordId}
              </Grid>{' '}
              <Grid item xs={6}>
                {recordId}
              </Grid>
            </Grid>
            <Grid container xs={12}>
              <Grid item xs={6}>
                {_labels.resourceId}
              </Grid>{' '}
              <Grid tem xs={6}>
                {resourceId}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Table
          height={200}
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          onEdit={showInfo}
          pagination={false}
        />
        <Grid data-unique-id item xs={4} sx={{ paddingBottom: '15px', height: '18vh', overflow: 'auto' }}>
          {Object.entries(info).map(([key, value]) => (
            <Grid key={key} style={{ display: 'flex', alignItems: 'center' }}>
              <Grid style={{ minWidth: '100px', fontWeight: 'bold' }}>{key}:</Grid>
              <Grid>{value}</Grid>
            </Grid>
          ))}
        </Grid>
      </CustomTabPanel>
    </div>
  )
}

export default TransactionLog
