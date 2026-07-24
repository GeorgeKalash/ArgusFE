import { useContext, useEffect, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ReportRepository } from '@argus/repositories/src/repositories/ReportRepository'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import EmployeeMissingList from './Form/EmployeeMissingList'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

export default function EmployeeMissingDetails () {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [data, setData] = useState([])

  async function getMissingValues() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.EMPLOYEE_MESSING_DETAILS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  async function fetchGridData() {
    const [missingValues, response] = await Promise.all([
      getMissingValues(),
      getRequest({
       extension: ReportRepository.EmployeeMissingDetails.RT107,
       parameters: `_activeStatus=1`
      })
    ])

    const modifiedList = missingValues.map(missing => {
        const matched = (response?.list || []).find(item => Number(item.fieldId) === Number(missing.key))

        return {
          fieldId: Number(missing.key),
          fieldName: missing.value,
          count: matched?.count || 0
        }
    })
   setData(modifiedList)
  }

  const {
    labels,
    access
  } = useResourceParams({
    datasetId: ResourceIds.EmployeeMissingDetails
  })

  const columns = [
    {
      field: 'fieldName',
      headerName: labels.missing,
      flex: 3
    },
    {
      field: 'count',
      headerName: labels.count,
      flex: 1,
      type: 'number'
    }
  ]

  const edit = obj => {
    openForm(obj?.fieldId)
  }

  function openForm(fieldId) {
    stack({
      Component: EmployeeMissingList,
      props: {
        fieldId,
        maxAccess: access,
        labels,
        onSuccess: fetchGridData
      },
      height: 680,
      width: 1200,
      title: labels.employeeList
    })
  }

  useEffect(() => {
    fetchGridData()
  },[])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={{ list: data }}
          rowId={['fieldId']}
          onEdit={edit}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
          refetch={fetchGridData}
          actionCondition={(row, type) => { return type === 'edit' ? row.count > 0 : true }}
        />
      </Grow>
    </VertLayout>
  )
}
