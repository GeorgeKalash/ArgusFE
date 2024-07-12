import Table from 'src/components/Shared/Table'
import { Grid } from '@mui/material'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect, useState } from 'react'
import { DataSets } from 'src/resources/DataSets'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import toast from 'react-hot-toast'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function RowAccessTab({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [checkedRows, handleCheckedRows] = useState([])

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
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      resourceId: '',
      rowRef: '',
      rowName: '',
      sgId: recordId,
      search: '',
      classId: ResourceIds.DocumentTypes,
      hasAccess: false,
      checked: false
    },
    onSubmit: async () => {
      for (const item of latestData?.list) {
        item.hasAccess = item.checked

        if (item.checked) {
          await postRequest({
            extension: AccessControlRepository.DataAccessItem.set,
            record: JSON.stringify(item)
          })
        } else {
          await postRequest({
            extension: AccessControlRepository.DataAccessItem.del,
            record: JSON.stringify(item)
          })
        }
      }
      toast.success(platformLabels.Updated)
    }
  })

  async function fetchGridData() {
    const moduleRes = await getRequest({
      extension: AccessControlRepository.DataAccessItem.qry,
      parameters: `_sgId=${recordId}&_filter=&_resourceId=${formik.values.classId}`
    })

    const modifiedData = moduleRes?.list?.map(item => ({
      ...item,
      checked: item.hasAccess
    }))

    moduleRes?.list?.forEach(item => {
      if (item.hasAccess) handleCheckedRows(prevRows => [...prevRows, { recordId: item.recordId }])
    })

    setData({ ...moduleRes, list: modifiedData })
  }

  const checkHandler = () => {
    const newData = data.list ? [...data.list] : []

    const rowIndex =
      Object.keys(checkedRows).length === 0
        ? -1
        : newData.findIndex(row => Object.keys(checkedRows).every(key => row[key] === checkedRows[key]))

    if (rowIndex !== -1) newData[rowIndex] = { ...newData[rowIndex], checked: true }

    return { list: newData }
  }

  const latestData = checkHandler()

  const filteredData = latestData && {
    ...latestData,
    list: latestData?.list?.filter(
      item =>
        (item.rowRef && item.rowRef.toString().includes(formik.values.search)) ||
        (item.rowName && item.rowName.toLowerCase().includes(formik.values.search.toLowerCase()))
    )
  }

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  useEffect(() => {
    handleCheckedRows([])
    if (recordId) fetchGridData()
  }, [formik.values.classId, recordId])

  return (
    <FormShell
      resourceId={ResourceIds.Users}
      form={formik}
      maxAccess={maxAccess}
      isCleared={false}
      isInfo={false}
      editMode={!!recordId}
    >
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
                onChange={(event, newValue) => {
                  formik.setFieldValue('classId', newValue ? newValue.key : ResourceIds.DocumentTypes)
                  fetchGridData(newValue ? newValue.key : ResourceIds.DocumentTypes)
                }}
                error={formik.touched.classId && Boolean(formik.errors.classId)}
              />
            </Grid>
            <Grid xs={6} item>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={labels.search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                }}
                onChange={handleSearchChange}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={rowColumns}
            gridData={filteredData}
            rowId={['recordId']}
            isLoading={false}
            maxAccess={maxAccess}
            pagination={false}
            checkTitle={labels.active}
            showCheckboxColumn={true}
            viewCheckButtons={true}
            ChangeCheckedRow={setData}
            handleCheckedRows={handleCheckedRows}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
