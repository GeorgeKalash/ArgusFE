import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import React from 'react'
import HRGeneratePayrollForm from './Forms/HRGeneratePayroll'

const GeneratePayroll = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.GeneratePayroll}
      labelKey={'generatePayroll'}
      Component={HRGeneratePayrollForm}
    />
  )
}

export default GeneratePayroll
