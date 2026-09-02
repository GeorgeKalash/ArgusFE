import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Typography } from '@mui/material'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import RightToWorkForm from './RightToWorkForm'
import BackgroundCheckForm from './BackgroundCheckForm'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'

const LegalsTab = ({ labels, maxAccess, store, isActive }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { recordId } = store

  const [searchRTW, setSearchRTW] = useState('')
  const [searchBC, setSearchBC] = useState('')

  function getDaysLeft(expiryDateStr) {
    const expiryMs = formatDateFromApi(expiryDateStr)
    if (expiryMs === null) return null

    const msPerDay = 1000 * 60 * 60 * 24
    const diffMs = expiryMs - Date.now()

    return Math.trunc(diffMs / msPerDay)
  }

  async function fetchRTWGridData() {
    const res = await getRequest({
      extension: EmployeeRepository.EmployeeRightToWork.qry,
      parameters: `_employeeId=${recordId}`
    })

    const modifiedList = (res?.list || []).map(item => ({
      ...item,
      daysLeft: getDaysLeft(item.expiryDate)
    }))

    return { ...res, list: modifiedList }
  }

  async function fetchBackgroundGridData() {
    const res = await getRequest({
      extension: EmployeeRepository.EmployeeBackgroundCheck.qry,
      parameters: `_employeeId=${recordId}`
    })

    const modifiedList = (res?.list || []).map(item => ({
      ...item,
     daysLeft: getDaysLeft(item.expiryDate)
    }))

    return { ...res, list: modifiedList }
  }

  const {
    query: { data: rtwData },
    invalidate: RTWInvalidate,
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchRTWGridData,
    endpointId: EmployeeRepository.EmployeeRightToWork.qry,
    datasetId: ResourceIds.EmployeeFilter,
    params: { disabledReqParams: true, maxAccess }
  })

  const {
    query: { data: bcData },
    invalidate: BCInvalidate,
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchBackgroundGridData,
    endpointId: EmployeeRepository.EmployeeBackgroundCheck.qry,
    datasetId: ResourceIds.EmployeeFilter,
    params: { disabledReqParams: true, maxAccess }
  })


const filteredRTWData = searchRTW
  ? {
      list: rtwData?.list?.filter(item =>
        [item.dtName, item.documentRef, item.issueDate, item.expiryDate, item.daysLeft]
          .filter(field => field !== null && field !== undefined) 
          .some(field => String(field).toLowerCase().includes(searchRTW.toLowerCase()))
      )
    }
  : rtwData

  const filteredBCData = searchBC
    ? {
        list: bcData?.list?.filter(item =>
          [item.ctName, item.date, item.expiryDate, item.DaysLeft]
            .filter(field => field !== null && field !== undefined) 
            .some(field => String(field).toLowerCase().includes(searchBC.toLowerCase()))
        )
      }
    : bcData

  const rightToWorkColumns = [
    { field: 'dtName', headerName: labels.dtName, flex: 1 },
    { field: 'documentRef', headerName: labels.dtRef, flex: 1 },
    { field: 'issueDate', headerName: labels.issueDate, flex: 1, type: 'date' },
    { field: 'expiryDate', headerName: labels.expiryDate, flex: 1, type: 'date' },
    { field: 'daysLeft', headerName: labels.daysLeft, flex: 1 },
  ]

  const backgroundCheckColumns = [
    { field: 'ctName', headerName: labels.checkType, flex: 1 },
    { field: 'date', headerName: labels.issueDate, flex: 1, type: 'date' },
    { field: 'expiryDate', headerName: labels.expiryDate, flex: 1, type: 'date' },
    { field: 'daysLeft', headerName: labels.daysLeft, flex: 1 },
  ]

  const del = async (obj, type) => {
    await postRequest({
      extension: type == 'RTW' ? EmployeeRepository.EmployeeRightToWork.del : EmployeeRepository.EmployeeBackgroundCheck.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    type == 'RTW' ? RTWInvalidate() : BCInvalidate()
  }

  const openForm = (obj, type) => {
    stack({
      Component: type == 'RTW' ? RightToWorkForm : BackgroundCheckForm,
      props: {
        labels,
        maxAccess,
        employeeId: recordId,
        recordId: obj?.recordId,
        isActive
      },
      width: 500,
      height: 480,
      title: type == 'RTW' ? labels.rightToWork : labels.backgroundCheck
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <Typography variant='h6' padding={2}>
          {labels.rightToWork}
        </Typography>
        <GridToolbar onAdd={() => openForm(null, 'RTW')} disableAdd={!isActive} maxAccess={maxAccess} 
          rightSection={
            <CustomTextField
            name='searchRTW'
            value={searchRTW}
            label={platformLabels.Search}
            onClear={() => setSearchRTW('')}
            onChange={e => setSearchRTW(e.target.value)}
            onSearch={val => setSearchRTW(val)}
            search
            />
          }
        />
      </Fixed>
      <Grow>
        <Table
          name='RTWTable'
          columns={rightToWorkColumns}
          gridData={filteredRTWData}
          rowId={['recordId']}
          onEdit={obj => openForm(obj, 'RTW')}
          onDelete={obj => del(obj, 'RTW')}
          pagination={false}
          maxAccess={maxAccess}
          actionCondition={(_, actionType) => (actionType === 'delete') ? isActive : true }
        />
      </Grow>

      <Fixed>
        <Typography variant='h6' padding={2}>
          {labels.backgroundCheck}
        </Typography>
        <GridToolbar onAdd={() => openForm(null, 'BC')} disableAdd={!isActive} maxAccess={maxAccess} 
          rightSection={
            <CustomTextField
              name='searchBC'
              value={searchBC}
              label={platformLabels.Search}
              onClear={() => setSearchBC('')}
              onChange={e => setSearchBC(e.target.value)}
              onSearch={val => setSearchBC(val)}
              search
            />
          }
          />
      </Fixed>
      <Grow>
        <Table
          name='BCTable'
          columns={backgroundCheckColumns}
          gridData={filteredBCData}
          rowId={['recordId']}
          onEdit={obj => openForm(obj, 'BC')}
          onDelete={obj => del(obj, 'BC')}
          pagination={false}
          maxAccess={maxAccess}
          actionCondition={(_, actionType) => (actionType === 'delete') ? isActive : true }
        />
      </Grow>
    </VertLayout>
  )
}

export default LegalsTab
