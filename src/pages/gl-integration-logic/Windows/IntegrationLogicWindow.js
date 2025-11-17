import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useContext, useEffect, useState } from 'react'
import IntegrationLogicForm from '../Forms/IntegrationLogicForm'
import IntegrationLogicDetails from '../Forms/IntegrationLogicDetails'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { RequestsContext } from 'src/providers/RequestsContext'

const IntegrationLogicWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)
  const { getRequest } = useContext(RequestsContext)

  const [store, setStore] = useState({
    recordId: recordId || null,
    header: null,
    items: []
  })
  const editMode = !!store.recordId

  const tabs = [{ label: labels.integrationLogic }, { label: labels.integrationLogicDetails, disabled: !editMode }]

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

  const handleImportData = data => {
    setStore(prev => ({
      ...prev,
      header: data?.header,
      recordId: data?.header?.recordId,
      items: data?.items
    }))
  }

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />

      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <IntegrationLogicForm
          labels={labels}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
          onImportData={handleImportData}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <IntegrationLogicDetails labels={labels} maxAccess={maxAccess} store={store} getData={getData} />
      </CustomTabPanel>
    </>
  )
}

export default IntegrationLogicWindow
