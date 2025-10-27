import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import BPMasterDataForm from '../forms/BPMasterDataForm'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import IDNumberForm from '../forms/IDNumberForm'
import AddressMasterDataForm from '../forms/AddressMasterDataForm'
import RelationList from 'src/pages/bp-master-data/forms/RelationList'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import RolesTab from '../forms/RolesTab'

const BPMasterDataWindow = ({ labels, maxAccess, recordId, height }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    category: null
  })
  const [editMode, setEditMode] = useState(!!recordId)

  const tabs = [
    { label: labels.general },
    { label: labels.idNumber, disabled: !editMode },
    { label: labels.relation, disabled: !editMode },
    { label: labels.address, disabled: !editMode },
    { label: labels.role, disabled: !editMode }
  ]

  return (
    <VertLayout>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} height={height} value={activeTab} maxAccess={maxAccess}>
        <BPMasterDataForm
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
          setEditMode={setEditMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab} maxAccess={maxAccess}>
        <IDNumberForm store={store} maxAccess={maxAccess} labels={labels} />
      </CustomTabPanel>
      <CustomTabPanel index={2} height={height} value={activeTab} maxAccess={maxAccess}>
        <RelationList store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={3} height={height} value={activeTab} maxAccess={maxAccess}>
        <AddressMasterDataForm store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={4} height={height} value={activeTab} maxAccess={maxAccess}>
        <RolesTab store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
    </VertLayout>
  )
}

export default BPMasterDataWindow
