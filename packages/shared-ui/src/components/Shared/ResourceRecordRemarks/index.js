import React, { useContext, useState } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Box, IconButton, TableBody, Table, TableCell, TableContainer, TableRow } from '@mui/material'
import Icon from '@argus/shared-core/src/@core/components/icon'
import moment from 'moment'
import toast from 'react-hot-toast'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import RecordRemarksForm from './RecordRemarksForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import DeleteDialog from '../DeleteDialog'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import styles from './ResourceRecordRemarks.module.css'

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
      refresh: false
    })
  }

  return (
    <>
      <RecordRemarksForm
        userId={userId}
        resourceId={resourceId}
        labels={labels}
        masterRef={recordId}
        maxAccess={access}
        seqNo={data?.list?.length + 1}
      />
      <Grid  className={styles.container}>
        <TableContainer   className={`${styles.TableContainer} ${expanded ? styles.expanded : styles.collapsed}`}  >
          <Table>
            <TableBody>
              {data?.list?.map((row, index) => (
                <TableRow
                  key={index}
                  className={styles.tableRow}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    background: ((index + 1) % 2 !== 0 || !(index + 1)) && '#EEEEEE'
                  }}
                >
                  <TableCell component='th' scope='row' width={'900'}>
                    <Box className={styles.row}>
                      <Box fontWeight='bold'>{row.userName}</Box> - <Box>{date(row.eventDate)}</Box>
                    </Box>
                    <Box className={styles.text}>{row.notes}</Box>
                  </TableCell>
                  <TableCell align='right'>
                    <Box  className={styles.flexStart} >
                      <IconButton size='small'>
                        <Icon icon='mdi:application-edit-outline' className={styles.icon}  onClick={() => onEdit(row)} />
                      </IconButton>

                      {row.userId === userId && (
                        <IconButton
                          size='small'
                          onClick={() => {
                            openDelete(row)
                          }}
                          color='error'
                        >
                          <Icon icon='mdi:delete-forever'  className={styles.icon}  />
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
    </>
  )
}

export default RecordRemarks
