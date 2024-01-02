import React , {useContext , useState, useEffect} from 'react'
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

const TransactionLog = (props) =>{

  const {recordId , resourceId , onInfoClose}= props
  const { getRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  const[transactionTypeStore, setTransactionTypeStore] = useState([])
  const[transactionType, setTransactionType] = useState(0)
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

console.log(access)

  const _labels = {
    trxType: labels && labels.find(item => item.key === 1).value,
    recordId: labels && labels.find(item => item.key === 2).value,
    resourceId: labels && labels.find(item => item.key === 3).value,
    eventDate: labels && labels.find(item => item.key === 4).value,
    username: labels && labels.find(item => item.key === 5).value,
    trxName: labels && labels.find(item => item.key === 6).value,
    title: labels && labels.find(item => item.key === 7).value,


  }

  const fillTransactionTypeStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.TRX_TYPE,
      callback: setTransactionTypeStore
    })
  };


const  getGridData = () =>{

  var parameters = `_resourceId=${resourceId}&_masterRef=${recordId}&_trxType=${transactionType}`
  getRequest({
    extension: SystemRepository.TransactionLog.qry,
    parameters: parameters
  })
    .then(res => {
     console.log(res)

     setGridData(res)


    })
    .catch(error => {
      setErrorMessage(error)
    })

}



const  showInfo = (obj) =>{

  var parameters = `_recordId=${obj.recordId}`
  getRequest({
    extension: SystemRepository.TransactionLog.get,
    parameters: parameters
  })
    .then(res => {
     console.log(res)

     setInfo(JSON.parse(res.record.data))


    })
    .catch(error => {
      setErrorMessage(error)
    })

}

const columns = [
  {
    field: 'eventDt',
    headerName: _labels.eventDate,
    flex: 1,
    valueGetter: ({ row }) => formatDateFromApi(row?.eventDt)

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

  <Window onClose={onInfoClose} Title={_labels.title} >
  <CustomTabPanel>





  <Grid container xs={12} sx={{paddingBottom:'25px'}} >
      <Grid item xs={6} >
                      <CustomComboBox
                        name="idtId"

                        label={_labels.trxType}
                        valueField="key"
                        displayField="value"

                        store={transactionTypeStore}
                        value={
                          transactionTypeStore?.filter(
                            (item) =>
                              item.recordId ===
                              transactionType,
                          )[0]
                        }
                        required
                        onChange={(event, newValue) => {
                          if(newValue){


                        setTransactionType(newValue.key)
                      }else{
                        setTransactionType(0)


                        }}}

                      />
        </Grid>
        <Grid container xs={6} spacing={4} sx={{paddingLeft:'40px'}} >

          <Grid item xs={4}>{_labels.recordId}</Grid> <Grid item xs={6}>{recordId}</Grid>
          <Grid  item xs={4}>{_labels.resourceId}</Grid> <Grid  tem xs={6}>{resourceId}</Grid>
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
        />




<Grid item xs={4} sx={{paddingBottom: '15px'}}>
{Object.entries(info).map(([key, value]) => (
        <Grid key={key} style={{ display: 'flex', alignItems: 'center' }}>
          <Grid style={{ minWidth: '100px', fontWeight: 'bold' }}>{key}:</Grid>
          <Grid>{value}</Grid>
        </Grid>
      ))}
</Grid>



  </CustomTabPanel>

  </Window>
  )
}

export default TransactionLog
