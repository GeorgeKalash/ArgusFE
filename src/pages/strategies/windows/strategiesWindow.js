// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
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
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab} disabledApply={!editMode && true}>
        <StrategiesForm
          labels={labels}
          setStore={setStore}
          store={store}
          maxAccess={maxAccess}
          onChange={onStrategiesChange}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <CodeList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <PreReqsList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab} onApply={onApply}>
        <IndicatorForm labels={labels} height={height} expanded={expanded} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default StrategiesWindow
