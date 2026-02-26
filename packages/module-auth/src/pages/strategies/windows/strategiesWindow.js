// ** Custom Imports
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import CodeList from '../forms/codeList.js'
import StrategiesForm from '../forms/strategiesForm.js'
import PreReqsList from '../forms/PrereqList.js'
import IndicatorForm from '../forms/indicatorForm.js'

const StrategiesWindow = ({ height, recordId, labels, maxAccess, expanded, onApply }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  function onStrategiesChange(values) {
    setStore({
      ...store,
      ...values
    })
  }

  const tabs = [
    { label: labels.strategy },
    { label: labels.code, disabled: !store.recordId },
    { label: labels.prere, disabled: !store.recordId },
    { label: labels.indicator, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} disabledApply={!editMode && true} maxAccess={maxAccess}>
        <StrategiesForm
          labels={labels}
          setStore={setStore}
          store={store}
          maxAccess={maxAccess}
          onChange={onStrategiesChange}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <CodeList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <PreReqsList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab} onApply={onApply} maxAccess={maxAccess}>
        <IndicatorForm labels={labels} height={height} expanded={expanded} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default StrategiesWindow
