import React, { useContext, useState, useEffect } from 'react'
import Window from './Window'
import CustomTabPanel from './CustomTabPanel'
import { CommonContext } from 'src/providers/CommonContext'
import { DataSets } from 'src/resources/DataSets'
import Grid from '@mui/system/Unstable_Grid/Grid'
import CustomComboBox from '../Inputs/CustomComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { formatDateFromApi } from 'src/lib/date-helper'
import { Box, Button, Icon, IconButton, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import FormShell from './FormShell'
import CustomTextArea from '../Inputs/CustomTextArea'
import { useForm } from 'src/hooks/form'
import { useResourceQuery } from 'src/hooks/resource'

const RecordRemarks = props => {
  const { recordId, resourceId } = props
  const { getRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  // const { formik } = useForm({
  //   maxAccess,
  //   initialValues: {
  //     Remarks: null
  //   },
  //   enableReinitialize: true,
  //   validateOnChange: true,
  //   onSubmit: async obj => {}
  // })
  const fetchGridData = () => {
    var parameters = `_resourceId=${resourceId}&_masterRef=${recordId}`

    return getRequest({
      extension: SystemRepository.RecordRemarks.qry,
      parameters: parameters
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.RecordRemarks,
    queryFn: fetchGridData,
    endpointId: SystemRepository.RecordRemarks.qry
  })
  console.log('data', data)

  return (
    <Box sx={{ p: 5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <CustomTextArea />
        <Button variant='contained' sx={{ mt: -11 }}>
          Add
        </Button>
      </Box>
      <Grid container>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableBody>
              {data?.list?.map(row => (
                <TableRow key={1} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component='th' scope='row'>
                    {row.userName}
                    {row.remark}
                  </TableCell>
                  <TableCell align='right'>{}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Box>
  )
}

export default RecordRemarks
