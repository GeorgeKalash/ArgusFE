import React from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'
import AttachmentList from 'src/components/Shared/AttachmentList'

const CompFile = () => {
  return <AttachmentList resourceId={ResourceIds.Files} recordId={0} />
}

export default CompFile
