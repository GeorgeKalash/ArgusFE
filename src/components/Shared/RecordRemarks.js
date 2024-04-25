import React, { useContext, useState, useEffect } from 'react'
import Window from './Window'
import CustomTabPanel from './CustomTabPanel'
import { CommonContext } from 'src/providers/CommonContext'
import { DataSets } from 'src/resources/DataSets'
import Grid from '@mui/system/Unstable_Grid/Grid'
import CustomComboBox from '../Inputs/CustomComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import Table from './Table'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { formatDateFromApi } from 'src/lib/date-helper'
import { Box } from '@mui/material'
import FormShell from './FormShell'
import CustomTextArea from '../Inputs/CustomTextArea'
import { useForm } from 'src/hooks/form'

const RecordRemarks = props => {
  const { recordId, resourceId, maxAccess } = props
  const { getRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      Remarks: null
    },
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {}
  })

  return (
    <Box>
      <CustomTextArea></CustomTextArea>
    </Box>
  )
}

export default RecordRemarks
