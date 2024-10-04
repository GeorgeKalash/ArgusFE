import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import SalesSettingsForm from './Form/SalesSettingsForm'

const SalesSettings = () => {
  return <ImmediateWindow datasetId={ResourceIds.SalesDefaults} labelKey={'salesSettings'} Component={SalesSettingsForm} height={600}/>
}

export default SalesSettings
