import Table from '@argus/shared-ui/src/components/Shared/Table'
import { Grid } from '@mui/material'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useContext, useEffect, useState } from 'react'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import toast from 'react-hot-toast'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function RowAccessTab({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState({ list: [] })

  const rowColumns = [
    {
      field: 'rowName',
      headerName: labels.record,
      flex: 2
    },
    {
      field: 'rowRef',
      headerName: labels.reference,
      flex: 2
    }
  ]

  const { formik } = useForm({
    maxAccess,
    validateOnChange: true,
    initialValues: {
      classId: ResourceIds.DocumentTypes
    },
    onSubmit: async () => {
      const updatedRows = data.list
        .filter(obj => obj.checked)
        .map(row => ({
          recordId: row.recordId,
          sgId: recordId,
          resourceId: parseInt(formik.values.classId)
        }))

      const resultObject = {
        sgId: recordId,
        resourceId: parseInt(formik.values.classId),
        items: updatedRows
      }

      await postRequest({
        extension: AccessControlRepository.DataAccessItem.set2,
        record: JSON.stringify(resultObject)
      })

      toast.success(platformLabels.Updated)
    }
  })

  async function fetchGridData(resourceId) {
    const classId = resourceId ?? ResourceIds.DocumentTypes

    const moduleRes = await getRequest({
      extension: AccessControlRepository.DataAccessItem.qry,
      parameters: `_sgId=${recordId}&_filter=&_resourceId=${classId}`
    })
    moduleRes.list = moduleRes.list.map(item => {
      if (item.hasAccess) {
        item.checked = true
      }

      return item
    })

    setData(moduleRes)
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await fetchGridData()
    })()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={!!recordId}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                label={labels.module}
                valueField='key'
                displayField='value'
                name='classId'
                datasetId={DataSets.AU_RESOURCE_ROW_ACCESS}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('classId', newValue?.key ?? ResourceIds.DocumentTypes)
                  await fetchGridData(newValue?.key)
                }}
                error={formik.touched.classId && Boolean(formik.errors.classId)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='rowAccess'
            columns={rowColumns}
            gridData={data}
            rowId={['recordId']}
            maxAccess={maxAccess}
            pagination={false}
            showCheckboxColumn={true}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}
