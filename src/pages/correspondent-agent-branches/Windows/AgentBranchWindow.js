import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AgentBranchForm from 'src/pages/correspondent-agent-branches/forms/AgentBranchForm'
import AddressForm from 'src/components/Shared/AddressForm'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import { useContext } from 'react'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import toast from 'react-hot-toast'

const AgentBranchWindow = ({ labels, maxAccess, recordId, height }) => {
  const [store, setStore] = useState({
    recordId: recordId || null,
    agentBranch: null,
    address: null,
    addressId: null
  })

  const editMode = !!store.recordId

  const [activeTab, setActiveTab] = useState(0)
  const tabs = [{ label: labels.agentBranch }, { label: labels.address, disabled: !editMode }]
  const { postRequest } = useContext(RequestsContext)

  async function onSubmit(address) {
    if (!store.agentBranch.addressId) {
      store.agentBranch.addressId = address.addressId
      const res = { ...store.agentBranch, addressId: address.addressId }
      const data = { ...res, recordId: store?.recordId, agentId: store.agentBranch?.agentId }
      await postRequest({
        extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
        record: JSON.stringify(data)
      })
    }
  }

  function setAddress(res) {
    setStore(prevStore => ({
      ...prevStore,
      address: res,
      addressId: res.addressId
    }))
  }

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <AgentBranchForm _labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} editMode={editMode} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <AddressForm
          _labels={labels}
          maxAccess={maxAccess}
          editMode={editMode}
          recordId={store?.agentBranch?.addressId}
          address={store.address}
          setAddress={setAddress}
          onSubmit={onSubmit}
        />
      </CustomTabPanel>
    </>
  )
}

export default AgentBranchWindow
