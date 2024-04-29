import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import TransactionForm from '../currency-trading/forms/TransactionForm'
import useResourceParams from 'src/hooks/useResourceParams'
import { Layout2 } from 'src/components/Shared/Layouts/Layou2'
import { VerticalLayout } from 'src/components/Shared/Layouts/VerticalLayout'

export default function CurrencyTrading() {
  const { getRequest } = useContext(RequestsContext)


 //error
 const [errorMessage, setErrorMessage] = useState(null)
 const [plantId, setPlantId] = useState(null)

 const { labels: _labelsADJ, access: accessADJ } = useResourceParams({
  datasetId: 35208
})

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
 async function openForm() {
    try {
      const plantId = await getPlantId();
      if (plantId !== '') {
        setPlantId(plantId)
      } else {
        setErrorMessage({ error: 'The user does not have a default plant' });
      }
    } catch (error) {
      console.error(error);
    }

  }


  useEffect(()=>{
    openForm()
   },[accessADJ])

  return (
    <VerticalLayout>
      {plantId && accessADJ &&  <TransactionForm labels={_labelsADJ} maxAccess={accessADJ}  plantId={plantId} />}
    </VerticalLayout>
  )
}
