import { useContext, useEffect, useState } from 'react'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository';
import { RequestsContext } from 'src/providers/RequestsContext';

export default function useIdType() {
  const [store, setStore] = useState();
  const { getRequest} = useContext(RequestsContext)

  const fillIdTypeStore = () => {
    var parameters = ``;
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.qry,
      parameters: parameters,
    })
      .then((res) => {
        setStore(res.list);
      })
      .catch((error) => {
        // setErrorMessage(error);
      });
  };

  useEffect(() => {
    !store && fillIdTypeStore()
  }, [store])

  const getTypeValue = (value) => {
    const formatted = store?.find(item => item.format?.replace('*','') === value);

    return  formatted?.recordId
  };

  return [getTypeValue];
}
