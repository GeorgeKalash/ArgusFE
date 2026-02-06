import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import SalesSettingsForm from './Form/SalesSettingsForm'

const SalesSettings = () => {
  return <ImmediateWindow datasetId={ResourceIds.SalesDefaults} labelKey={'salesSettings'} Component={SalesSettingsForm} height={600}/>
}

export default SalesSettings
