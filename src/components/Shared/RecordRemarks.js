import React, { useContext, useState } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { formatDateDefault } from 'src/lib/date-helper'
import { Box, IconButton, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import Icon from 'src/@core/components/icon'

import { useResourceQuery } from 'src/hooks/resource'
import RecordRemarksForm from './RecordRemarksForm'
import { useWindow } from 'src/windows'
import DeleteDialog from './DeleteDialog'

const RecordRemarks = ({ recordId, resourceId, expanded }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState([false, {}])
  const userId = JSON.parse(window.sessionStorage.getItem('userData'))?.userId

  const fetchGridData = () => {
    var parameters = `_resourceId=${resourceId}&_masterRef=${recordId}`

    return getRequest({
      extension: SystemRepository.RecordRemarks.qry,
      parameters: parameters
    })
  }

  const {
    query: { data },
    labels: labels,
    access
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
    await postRequest({
      extension: SystemRepository.RecordRemarks.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
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
      <Grid container sx={{ px: 5 }}>
        <TableContainer sx={{ height: `${expanded ? `calc(100vh - 300px)` : '250px'}`, pt: 2, px: 5 }}>
          <Table>
            <TableBody>
              {data?.list?.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    background: (row.seqNo % 2 !== 0 || !row.seqNo) && '#DDDDDD'
                  }}
                >
                  <TableCell component='th' scope='row' width={'900'}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }} fontSize={14}>
                      <Box fontWeight='bold'>{row.userName}</Box> -{' '}
                      <Box sx={{ mx: 1 }}>{formatDateDefault(row.eventDate)}</Box>
                    </Box>
                    {row.notes}
                  </TableCell>
                  <TableCell align='right'>
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                      <IconButton size='small'>
                        <Icon icon='mdi:application-edit-outline' fontSize={18} onClick={() => onEdit(row)} />
                      </IconButton>

                      <IconButton size='small' onClick={() => setDeleteDialogOpen([true, row])} color='error'>
                        <Icon icon='mdi:delete-forever' fontSize={18} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen([false, {}])}
        onConfirm={obj => {
          setDeleteDialogOpen([false, {}])
          onDelete(obj)
        }}
      />
    </Box>
  )
}

export default RecordRemarks
