import React from 'react'
import { ImmediateWindow } from 'src/windows'
import PUSettingsForm from './Form/PUSettingsForm'
import { ResourceIds } from 'src/resources/ResourceIds'

const BatchPost = () => {
  return <ImmediateWindow datasetId={ResourceIds.PUSettings} labelKey={'puSettings'} Component={PUSettingsForm} />
}

export default BatchPost
