import { Box } from '@mui/material'
import { useContext, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { formatDateDefault, formatDateFromApi } from 'src/lib/date-helper'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { SystemRepository } from 'src/repositories/SystemRepository'
import TransactionForm from '../currency-trading/forms/TransactionForm'
import useResourceParams from 'src/hooks/useResourceParams'

export default function CurrencyTrading() {
  const { getRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

 //error
 const [errorMessage, setErrorMessage] = useState(null)

 const getPlantId = async () => {
  const userData = window.sessionStorage.getItem('userData')
    ? JSON.parse(window.sessionStorage.getItem('userData'))
    : null;

    console.log(userData)
  const parameters = `_userId=${userData && userData.userId}&_key=plantId`;

  try {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: parameters,
    });

    if (res.record.value) {
      return res.record.value;
    }

    return '';
  } catch (error) {
    setErrorMessage(error);

     return '';
  }
};
 async function openFormWindow(recordId) {
    if(!recordId){
    try {
      const plantId = await getPlantId();
      if (plantId !== '') {
        openForm('' , plantId)
      } else {
        setErrorMessage({ error: 'The user does not have a default plant' });
      }
    } catch (error) {
      console.error(error);
    }}else{
      openForm(recordId)
    }

  }
function openForm(recordId,plantId ){
  stack({
    Component: TransactionForm,
    props: {
      labels,
      maxAccess: access,
      plantId: plantId,
      recordId
    },
    width: 1200,
    height:600,
    title: 'Cash Invoice'
  })
}



  const { labels: _labelsADJ, access: accessADJ } = useResourceParams({
    datasetId: 35208
  })

  return (
    <Box sx={{background: 'white'}}>
    <TransactionForm labels={_labelsADJ} access={accessADJ} />
    </Box>
  )
}
