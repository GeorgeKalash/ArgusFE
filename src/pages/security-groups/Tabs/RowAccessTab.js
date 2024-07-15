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
  const [data, setData] = useState({ list: [] })
  const [checkedRows, setCheckedRows] = useState([])

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

  async function fetchGridData(resourceId) {
    try {
      const classId = resourceId ?? ResourceIds.DocumentTypes

      const moduleRes = await getRequest({
        extension: AccessControlRepository.DataAccessItem.qry,
        parameters: `_sgId=${recordId}&_filter=&_resourceId=${classId}`
      })

      const modifiedData = moduleRes?.list?.map(item => ({
        ...item,
        checked: item.hasAccess
      }))

      setCheckedRows(
        (moduleRes.list || [])
          .filter(obj => obj.hasAccess)
          .map(obj => Object.fromEntries(Object.entries(obj).filter(([key]) => ['recordId'].includes(key))))
      )

      setData({ ...moduleRes, list: modifiedData })
    } catch (error) {}
  }

  const checkHandler = () => {
    return {
      list: data.list.map(obj => ({
        ...obj,
        checked: checkedRows.some(checkedRow => Object.keys(checkedRow).every(key => obj[key] === checkedRow[key]))
      }))
    }
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
    ;(async function () {
      try {
        setCheckedRows([])
        if (recordId) await fetchGridData()
      } catch (error) {}
    })()
  }, [recordId])

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
                onChange={async (event, newValue) => {
                  formik.setFieldValue('classId', newValue?.key ?? ResourceIds.DocumentTypes)
                  await fetchGridData(newValue?.key)
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
            handleCheckedRows={setCheckedRows}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
