// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import IDNumberTab from 'src/pages/bp-master-data/Tabs/IDNumberTab'
import RelationTab from 'src/pages/bp-master-data/forms/RelationForm'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import FormShell from 'src/components/Shared/FormShell'
import BPMasterDataForm from '../forms/BPMasterDataForm'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import IDNumberForm from '../forms/IDNumberForm'
import RelationForm from 'src/pages/bp-master-data/forms/RelationForm'
import AddressForm from 'src/pages/plants/Forms/AddressForm'
import AddressMasterDataForm from '../forms/AddressMasterDataForm'

const BPMasterDataWindow = ({
  labels,
  maxAccess,
  relationGridData,
  getRelationGridData,
  addRelation,
  delRelation,
  defaultValue,
  popupRelation,
  recordId,
  height
}) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const tabs=[
    { label: labels.general },
    { label: labels.idNumber, disabled: !editMode },
    { label: labels.relation, disabled: !editMode },
    { label: labels.address, disabled: !editMode }
  ]

  const [store , setStore] = useState({
    recordId : recordId || null,
    category: null
  })

return (
    <>
    <CustomTabs  tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        <CustomTabPanel index={0}   height={height} value={activeTab}>
          <BPMasterDataForm labels={labels} maxAccess={maxAccess} defaultValue={defaultValue}
           store={store} setStore={setStore} recordId={recordId} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={1} value={activeTab}>
            <IDNumberForm
              store={store}
              maxAccess={maxAccess}

            />
        </CustomTabPanel>
        <CustomTabPanel index={2} height={height}  value={activeTab}>
          <RelationForm
            store={store}
            labels={labels}
            maxAccess={maxAccess}
          />
        </CustomTabPanel>
        <CustomTabPanel index={3} height={height}  value={activeTab}>
          <AddressMasterDataForm
            store={store}
            setStore={setStore}
            labels={labels}
            maxAccess={maxAccess}
          />
        </CustomTabPanel>
    </>
  )
}

export default BPMasterDataWindow
