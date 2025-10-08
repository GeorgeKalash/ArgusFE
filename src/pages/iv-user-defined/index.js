import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import UserTextForm from './forms/UserTextForm'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import UserDefinedForm from './forms/UserDefinedForm'

const PropertiesWindow = () => {
  const [activeTab, setActiveTab] = useState(0)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.UserDefined
  })

  const tabs = [{ label: labels.userProperties }, { label: labels.userText }]
  if (labels && Object.keys(labels).length > 0) {
    return (
      <VertLayout>
        <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <CustomTabPanel index={0} value={activeTab}>
          <UserDefinedForm maxAccess={access} labels={labels} />
        </CustomTabPanel>
        <CustomTabPanel index={1} value={activeTab}>
          <UserTextForm maxAccess={access} labels={labels} />
        </CustomTabPanel>
      </VertLayout>
    )
  }
}

export default PropertiesWindow
