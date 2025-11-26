import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useContext, useEffect, useState } from 'react'
import IntegrationLogicForm from '../Forms/IntegrationLogicForm'
import IntegrationLogicDetails from '../Forms/IntegrationLogicDetails'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'

const IntegrationLogicWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)
  const { getRequest } = useContext(RequestsContext)

  const [store, setStore] = useState({
    recordId: recordId || null,
    header: null,
    items: []
  })

  const tabs = [
    { label: labels.integrationLogic },
    { label: labels.integrationLogicDetails, disabled: !store.recordId }
  ]

  const getData = async () => {
    if (!recordId) return

    const res = await getRequest({
      extension: GeneralLedgerRepository.IntegrationLogic.get2,
      parameters: `_recordId=${recordId}`
    })

    setStore(prev => ({
      ...prev,
      header: res?.record?.header,
      items: res?.record?.items
    }))

    return res?.record
  }

  useEffect(() => {
    getData()
  }, [recordId])

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />

      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <IntegrationLogicForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <IntegrationLogicDetails labels={labels} maxAccess={maxAccess} store={store} getData={getData} />
      </CustomTabPanel>
    </>
  )
}

export default IntegrationLogicWindow
