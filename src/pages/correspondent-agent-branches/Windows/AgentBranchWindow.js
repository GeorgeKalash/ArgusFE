import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AgentBranchForm from 'src/pages/correspondent-agent-branches/Tabs/AgentBranchForm'
import AddressForm from 'src/components/Shared/AddressForm'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import { useContext } from 'react'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

const AgentBranchWindow = ({ labels, editMode, maxAccess, recordId, height }) => {
  const [store, setStore] = useState({
    recordId: recordId || null,
    agentBranch: null,
    address: null
  })

  const [activeTab, setActiveTab] = useState(0)
  const tabs = [{ label: labels.agentBranch }, { label: labels.address, disabled: !store.recordId }]
  const { postRequest } = useContext(RequestsContext)

  async function onSubmit(address) {
    const addressId = address.addressId
    if (!store.agentBranch.addressId) {
      const res = { ...store.agentBranch, addressId: addressId }
      if (res) {
        const data = { ...res, recordId: store?.recordId }
        await postRequest({
          extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
          record: JSON.stringify(data)
        })
        if (!addressId) {
          toast.success('Record Added Successfully')
        }
      }
    } else {
      toast.success('Record Added Successfully')
    }
  }

  function setAddress(res) {
    setStore(prevStore => ({
      ...prevStore,
      address: res
    }))
  }

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <AgentBranchForm
          _labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
          editMode={store.recordId}
        />
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
