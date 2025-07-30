import React, { useContext, useState, useEffect } from 'react'
import { DataSets } from 'src/resources/DataSets'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import Table from './Table'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { formatDateDefault, formatDateFromApi } from 'src/lib/date-helper'
import ResourceComboBox from './ResourceComboBox'
import { useError } from 'src/error'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import useSetWindow from 'src/hooks/useSetWindow'

const TransactionLog = props => {
  const { recordId, resourceId, window } = props
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { getLabels, getAccess, platformLabels } = useContext(ControlContext)
  const [transactionType, setTransactionType] = useState(0)
  const [gridData, setGridData] = useState({})
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)
  const [info, setInfo] = useState({})
  useEffect(() => {
    if (!access) getAccess(ResourceIds.TransactionLog, setAccess)
    else {
      if (access?.record.maxAccess > 0) {
        getGridData()
        getLabels(ResourceIds.TransactionLog, setLabels)
      } else {
        stackError({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access, transactionType])

  useSetWindow({ title: platformLabels.TransactionLog, window })

  const _labels = {
    trxType: labels && labels.find(item => item.key === '1').value,
    recordId: labels && labels.find(item => item.key === '2').value,
    resourceId: labels && labels.find(item => item.key === '3').value,
    eventDate: labels && labels.find(item => item.key === '4').value,
    username: labels && labels.find(item => item.key === '5').value,
    trxName: labels && labels.find(item => item.key === '6').value,
    title: labels && labels.find(item => item.key === '7').value
  }

  const getGridData = () => {
    var parameters = `_resourceId=${resourceId}&_masterRef=${recordId}&_trxType=${transactionType}`
    getRequest({
      extension: SystemRepository.TransactionLog.qry,
      parameters: parameters
    }).then(res => {
      setGridData(res)
    })
  }

  const showInfo = obj => {
    var parameters = `_recordId=${obj.recordId}`
    setInfo([])
    getRequest({
      extension: SystemRepository.TransactionLog.get,
      parameters: parameters
    }).then(res => {
      setInfo(JSON.parse(res.record.data) || {})
    })
  }

  const formatTime = dateString => {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }

    return new Date(formatDateFromApi(dateString)).toLocaleString('en-GB', options)
  }

  const columns = [
    {
      field: 'eventDt',
      headerName: _labels.eventDate,
      flex: 2,
      type: 'dateTime',
      dateFormat: 'HH:mm:ss'
    },
    {
      field: 'userId',
      headerName: _labels.userId,
      flex: 1,
      type: 'number'
    },
    {
      field: 'userName',
      headerName: _labels.username,
      flex: 2
    },
    {
      field: 'ttName',
      headerName: _labels.trxName,
      flex: 1
    }
  ]

  const renderObject = (obj, level = 0) => {
    if (obj === null || obj === undefined) return null

    const paddingLeft = `${level * 16}px`

    return Object.entries(obj).map(([key, value]) => {
      const isObject = typeof value === 'object' && value !== null

      if (Array.isArray(value)) {
        
        return (
          <Grid key={key} style={{ paddingLeft }}>
            <strong>{key}:</strong> [
            {value.length === 0 ? (
              ' ]'
            ) : (
              <>
                {value.map((item, index) => (
                  <Grid key={index} style={{ paddingLeft: `${(level + 1) * 16}px` }}>
                    {'{'}
                    {Object.entries(item).map(([k, v]) => (
                      <Grid key={k} style={{ paddingLeft: `${(level + 2) * 16}px` }}>
                        <strong>{k}:</strong> {String(v)}
                      </Grid>
                    ))}
                    {'},'}
                  </Grid>
                ))}
                <Grid style={{ paddingLeft }}>]</Grid>
              </>
            )}
          </Grid>
        )
      }

      if (isObject) {
        return (
          <Grid key={key} style={{ paddingLeft }}>
            <strong>{key}:</strong>
            {renderObject(value, level + 1)}
          </Grid>
        )
      }

      return (
        <Grid key={key} style={{ paddingLeft }}>
          <strong>{key}:</strong> {key === 'date' ? formatDateDefault(value) : String(value)}
        </Grid>
      )
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container xs={12} sx={{ paddingBottom: '25px', m: 2 }}>
          <Grid item xs={5}>
            <ResourceComboBox
              datasetId={DataSets.TRX_TYPE}
              name='idtId'
              label={_labels.trxType}
              valueField='key'
              displayField='value'
              value={transactionType}
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
          <Grid container xs={0.7}></Grid>
          <Grid container xs={4} spacing={4}>
            <Grid container xs={12}>
              <Grid item xs={6}>
                {_labels.recordId}
              </Grid>
              <Grid item xs={6}>
                {recordId}
              </Grid>
            </Grid>
            <Grid container xs={12}>
              <Grid item xs={6}>
                {_labels.resourceId}
              </Grid>
              <Grid tem xs={6}>
                {resourceId}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData ?? { list: [] }}
          rowId={['recordId']}
          onEdit={showInfo}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
      <Fixed>
        <Fixed>
          <Grid data-unique-id item xs={4} sx={{ paddingBottom: '15px', height: '18vh', overflow: 'auto', m: 2 }}>
            {renderObject(info)}
          </Grid>
        </Fixed>
      </Fixed>
    </VertLayout>
  )
}

TransactionLog.width = 900
TransactionLog.height = 600

export default TransactionLog
