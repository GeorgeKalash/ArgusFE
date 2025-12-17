import React from 'react'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import AttachmentList from '@argus/shared-ui/src/components/Shared/AttachmentList'

const CompFile = () => {
  return <AttachmentList resourceId={ResourceIds.Files} recordId={0} />
}

export default CompFile
