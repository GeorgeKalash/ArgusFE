import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AgentBranchForm from 'src/pages/correspondent-agent-branches/forms/AgentBranchForm'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState, useEffect, useContext } from 'react'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { ResourceIds } from 'src/resources/ResourceIds'

const AgentBranchWindow = ({ labels, maxAccess, recordId, height }) => {
  const [store, setStore] = useState({
    recordId: recordId || null,
    agentBranch: null,
    address: null,
    addressId: null
  })

  const editMode = !!store.recordId
  const [activeTab, setActiveTab] = useState(0)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const tabs = [{ label: labels.agentBranch }, { label: labels.address, disabled: !editMode }]

  useEffect(() => {
    const addressId = store.agentBranch?.addressId
    if (!addressId) return

    getRequest({
      extension: SystemRepository.Address.get,
      parameters: `_filter=&_recordId=${addressId}`
    }).then(res => {
      setStore(prev => ({ ...prev, address: res.record }))
    })
  }, [store.agentBranch?.addressId])

  function handleAddressSubmit(values) {
    const data = { ...values, recordId: store.agentBranch?.addressId }

    postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(data)
    }).then(res => {
      const addressId = res.recordId

      setStore(prev => ({
        ...prev,
        address: { ...values, addressId },
        addressId
      }))

      if (!store.agentBranch?.addressId) {
        const updated = {
          ...store.agentBranch,
          addressId,
          recordId: store.recordId,
          agentId: store.agentBranch?.agentId
        }

        postRequest({
          extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
          record: JSON.stringify(updated)
        }).then(() => {
          toast.success(platformLabels.Edited)
        })
      } else {
        toast.success(platformLabels.Edited)
      }
    })
  }

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={height} index={0} value={activeTab} maxAccess={maxAccess}>
        <AgentBranchForm _labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} editMode={editMode} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab} maxAccess={maxAccess}>
        <AddressFormShell
          editMode={editMode}
          datasetId={ResourceIds.ADDCorrespondentAgentBranch}
          address={store.address}
          setAddress={addr =>
            setStore(prev => ({
              ...prev,
              address: addr,
              addressId: addr?.addressId
            }))
          }
          allowPost={true}
          onSubmit={handleAddressSubmit}
          isCleared={false}
        />
      </CustomTabPanel>
    </>
  )
}

export default AgentBranchWindow
