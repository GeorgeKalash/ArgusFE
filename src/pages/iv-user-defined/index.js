import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'

import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const PropertiesWindow = () => {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [{ label: 'first' }, { label: 'second' }]

  return (
    <VertLayout>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        {/* <BPMasterDataForm
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
          setEditMode={setEditMode}
        /> */}
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        {/* <IDNumberForm store={store} maxAccess={maxAccess} labels={labels} /> */}
      </CustomTabPanel>
    </VertLayout>
  )
}

export default PropertiesWindow
