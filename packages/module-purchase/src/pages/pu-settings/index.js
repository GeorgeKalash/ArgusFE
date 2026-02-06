import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import PUSettingsForm from './Form/PUSettingsForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const BatchPost = () => {
  return <ImmediateWindow datasetId={ResourceIds.PUSettings} labelKey={'puSettings'} Component={PUSettingsForm} />
}

export default BatchPost
