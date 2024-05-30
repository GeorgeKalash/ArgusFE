// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

import FiscalYearForm from '../forms/FiscalYearForm'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import IDNumberForm from '../forms/IDNumberForm'
import AddressMasterDataForm from '../forms/AddressMasterDataForm'
import RelationList from 'src/pages/bp-master-data/forms/RelationList'

const FiscalYearWindow = ({ labels, maxAccess, defaultValue, recordId, height }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    category: null
  })
  const [editMode, setEditMode] = useState(!!recordId)

  const tabs = [
    { label: labels.fiscalYears },
    { label: labels.periods, disabled: !editMode }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} height={height} value={activeTab}>
        <FiscalYearForm
          labels={labels}
          maxAccess={maxAccess}

          //defaultValue={defaultValue}
          store={store}
          setStore={setStore}
          setEditMode={setEditMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <IDNumberForm store={store} maxAccess={maxAccess} labels={labels} />
      </CustomTabPanel>
    </>
  )
}

export default FiscalYearWindow
