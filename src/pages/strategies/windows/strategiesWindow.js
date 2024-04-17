// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import CodeList from '../forms/codeList.js'
import StrategiesForm from '../forms/strategiesForm.js'
import PereList from '../forms/PereList.js'
import IndicatorForm from '../forms/indicatorForm.js'

const StrategiesWindow = ({ height, recordId, labels, maxAccess, approver, expanded, onApply }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [strategiesFormik, setStrategiesFormik] = useState(null)

  const handleUpdateFormik = formik => {
    setStrategiesFormik(formik)
  }

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [
    { label: labels.strategy },
    { label: labels.code, disabled: !store.recordId },
    { label: labels.prere, disabled: !store.recordId },
    { label: labels.indicator, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab} disabledApply={!editMode && true}>
        <StrategiesForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
          onUpdateFormik={handleUpdateFormik}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <CodeList
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          maxAccess={maxAccess}
          store={store}
          strategiesFormik={strategiesFormik}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab}>
        <PereList labels={labels} setEditMode={setEditMode} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={3} value={activeTab}>
        <IndicatorForm
          onApply={onApply}
          labels={labels}
          height={height}
          expanded={expanded}
          setEditMode={setEditMode}
          setStore={setStore}
          maxAccess={maxAccess}
          strategiesFormik={strategiesFormik}
          store={store}
        />
      </CustomTabPanel>
    </>
  )
}

export default StrategiesWindow
