import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import GenerateAMCForm from '@argus/module-manufacturing/src/pages/mf-generate-amc/Form/GenerateAMCForm'

const GenerateAMC = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.GenerateAMC}
      labelKey={'generateAMC'}
      Component={GenerateAMCForm}
      height={200}
    />
  )
}

export default GenerateAMC
