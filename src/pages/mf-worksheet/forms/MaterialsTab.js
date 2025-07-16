import React, { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import MaterialsForm from './MaterialsForm'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const MaterialsTab = ({ store }) => {
  const { platformLabels } = useContext(ControlContext)
  const { recordId, isPosted, values } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()


  const {
    query: { data },
    invalidate,
    labels, 
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.WorksheetMaterials.qry,
    datasetId: ResourceIds.Worksheet,
    disableMaxAccess: true,
    enabled: Boolean(recordId)
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'typeName',
      headerName: labels.type,
      flex: 1
    },
    {
      field: 'operationName',
      headerName: labels.operation,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: ManufacturingRepository.WorksheetMaterials.qry,
      parameters: `_worksheetId=${recordId}`
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.WorksheetMaterials.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.IssueOfMaterial,
    action: openForm
  })

  function openForm(obj) {
    stack({
      Component: MaterialsForm,
      props: {
        labels,
        recordId: obj?.recordId,
        wsId: recordId,
        access,
        values
      },
      width: 1200,
      height: 700,
      title: labels.issueOfMaterials
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = async () => {
    await proxyAction()
  }

  const totQty = data?.list?.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row?.qty?.toString().replace(/,/g, '')) || 0

    return qtySum + qtyValue
  }, 0)

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} labels={labels} onAdd={add} disableAdd={isPosted} />
      </Fixed>
      <Grow>
        <Table
          name='MaterialsTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          onDelete={isPosted ? null : del}
          onEdit={isPosted ? null : edit}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
      <Fixed>
        <Grid container padding={4}>
          <Grid item xs={2}>
            <CustomNumberField name='totalQty' label={labels.totalQty} value={totQty} readOnly />
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}

export default MaterialsTab
