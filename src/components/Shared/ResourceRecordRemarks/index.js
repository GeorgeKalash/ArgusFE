import React, { useContext, useState } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Box, IconButton, TableBody, Table, TableCell, TableContainer, TableRow } from '@mui/material'
import Icon from 'src/@core/components/icon'
import moment from 'moment'
import toast from 'react-hot-toast'
import { useResourceQuery } from 'src/hooks/resource'
import RecordRemarksForm from './RecordRemarksForm'
import { useWindow } from 'src/windows'
import DeleteDialog from '../DeleteDialog'
import { ControlContext } from 'src/providers/ControlContext'

const RecordRemarks = ({ recordId, resourceId, expanded }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const userId = JSON.parse(window.sessionStorage.getItem('userData'))?.userId

  const fetchGridData = () => {
    var parameters = `_resourceId=${resourceId}&_masterRef=${recordId}`

    return getRequest({
      extension: SystemRepository.RecordRemarks.qry,
      parameters: parameters
    })
  }

  const date = date => {
    const eventDate = moment(date)
    const formattedDate = eventDate.calendar()

    return formattedDate
  }

  const {
    query: { data },
    labels: labels,
    access,
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.RecordRemarks,
    queryFn: fetchGridData,
    endpointId: SystemRepository.RecordRemarks.qry
  })

  const onEdit = obj => {
    stack({
      Component: RecordRemarksForm,
      props: {
        data: obj,
        labels,
        userId
      },
      width: 800,
      height: 300,
      title: labels.resourceRecordRemarks
    })
  }

  const onDelete = async obj => {
    console.log(obj)
    await postRequest({
      extension: SystemRepository.RecordRemarks.del,
      record: JSON.stringify(obj)
    })
    toast.success('Record Deleted Successfully')
    invalidate()
  }

  function openDelete(obj) {
    stack({
      Component: DeleteDialog,
      props: {
        open: [true, {}],
        fullScreen: false,
        onConfirm: () => onDelete(obj)
      },
      width: 450,
      height: 170,
      title: platformLabels.Delete
    })
  }

  return (
    <Box>
      <RecordRemarksForm
        userId={userId}
        resourceId={resourceId}
        labels={labels}
        masterRef={recordId}
        maxAccess={access}
        seqNo={data?.list?.length + 1}
      />
      <Grid sx={{ p: 5 }}>
        <TableContainer sx={{ height: `${expanded ? `calc(100vh - 300px)` : '250px'}`, pt: 2, px: 5 }}>
          <Table>
            <TableBody>
              {data?.list?.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    background: ((index + 1) % 2 !== 0 || !(index + 1)) && '#EEEEEE'
                  }}
                >
                  <TableCell component='th' scope='row' width={'900'}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }} fontSize={14}>
                      <Box fontWeight='bold'>{row.userName}</Box> - <Box sx={{ mx: 1 }}>{date(row.eventDate)}</Box>
                    </Box>
                    {row.notes}
                  </TableCell>
                  <TableCell align='right'>
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-start' }}>
                      <IconButton size='small'>
                        <Icon icon='mdi:application-edit-outline' fontSize={18} onClick={() => onEdit(row)} />
                      </IconButton>

                      {row.userId === userId && (
                        <IconButton
                          size='small'
                          onClick={() => {
                            openDelete(row)
                          }}
                          color='error'
                        >
                          <Icon icon='mdi:delete-forever' fontSize={18} />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
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
