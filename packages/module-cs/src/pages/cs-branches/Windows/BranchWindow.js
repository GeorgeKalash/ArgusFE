import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useContext, useEffect, useState } from 'react'
import BranchInfoTab from '../Forms/BranchInfoTab'
import LegalReferenceTab from '../Forms/LegalReferenceTab'
import { AddressFormShell } from '@argus/shared-ui/src/components/Shared/AddressFormShell'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'

const BranchWindow = ({ labels, maxAccess, recordId, height }) => {
  const [activeTab, setActiveTab] = useState(0)
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [store, setStore] = useState({
    recordId: recordId || null,
    branch: null,
    address: null
  })

  const tabs = [
    { label: labels?.branchInfo },
    { label: labels?.Address, disabled: !store.recordId },
    { label: labels?.legalReference, disabled: !store.recordId }
  ]

  useEffect(() => {
    const addressId = store.branch?.addressId
    if (!addressId) return

    getRequest({
      extension: SystemRepository.Address.get,
      parameters: `_filter=&_recordId=${addressId}`
    }).then(res => {
      setStore(prev => ({ ...prev, address: res.record }))
    })
  }, [store.branch?.addressId])

  async function onAddressSubmit(values) {
    const data = { ...values, recordId: store.branch?.addressId }

    const res = await postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(data)
    })

    const addressId = res.recordId
    const updatedAddress = { ...values, addressId }

    setStore(prev => ({
      ...prev,
      address: updatedAddress,
      branch: { ...prev.branch, addressId }
    }))

    if (!store.branch?.addressId) {
      const updatedBranch = {
        ...store.branch,
        addressId,
        recordId: store.recordId,
        activeStatus: store.isInactive ? 1 : -1
      }

      await postRequest({
        extension: companyStructureRepository.Branches.set,
        record: JSON.stringify(updatedBranch)
      })

      toast.success(platformLabels.Added)
    } else {
      toast.success(platformLabels.Edited)
    }
  }

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={height} index={0} value={activeTab} maxAccess={maxAccess}>
        <BranchInfoTab labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab} maxAccess={maxAccess}>
        <AddressFormShell
          _labels={labels}
          maxAccess={maxAccess}
          editMode={!!store.branch?.addressId}
          address={store.address}
          setAddress={addr => setStore(prev => ({ ...prev, address: addr }))}
          allowPost={true}
          datasetId={ResourceIds.ADDBranches}
          onSubmit={onAddressSubmit}
          isCleared={false}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab} maxAccess={maxAccess}>
        <LegalReferenceTab labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default BranchWindow