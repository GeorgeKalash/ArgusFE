import React from 'react'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import AttachmentList from '@argus/shared-ui/components/Shared/AttachmentList'

const CompFile = () => {
  return <AttachmentList resourceId={ResourceIds.Files} recordId={0} />
}

export default CompFile
