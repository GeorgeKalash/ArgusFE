import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
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
