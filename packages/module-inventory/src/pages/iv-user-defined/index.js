import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import UserTextForm from './forms/UserTextForm'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
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
        <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />
        <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
          <UserDefinedForm maxAccess={access} labels={labels} />
        </CustomTabPanel>
        <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
          <UserTextForm maxAccess={access} labels={labels} />
        </CustomTabPanel>
      </VertLayout>
    )
  }
}

export default PropertiesWindow
