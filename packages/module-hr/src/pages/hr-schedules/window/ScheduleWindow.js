import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import ScheduleForm from '../forms/ScheduleForm'
import WeekDaysTab from '../forms/WeekDaysTab'

export default function SalaryWindow({ labels, maxAccess, recordId}) {
  const [activeTab, setActiveTab] = useState(0)
  const [updatedRecordId, setUpdatedRecordId] = useState(recordId)

  const tabs = [
    { label: labels.schedule },
    { label: labels.days, disabled: !updatedRecordId },
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <ScheduleForm recordId={updatedRecordId} maxAccess={maxAccess} labels={labels}/>
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <WeekDaysTab recordId={updatedRecordId}  maxAccess={maxAccess} labels={labels}/>
      </CustomTabPanel>
    </>
  )
}
