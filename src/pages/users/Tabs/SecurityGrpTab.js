import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const SecurityGrpTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const initialGroups = [
    {
      id: 1,
      sgId: '',
      sgName: '',
      userId: storeRecordId
    }
  ]

  const [fullGroups, setFullGroups] = useState(initialGroups)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      search: '',
      groups: initialGroups
    },
    onSubmit: async values => {
      await postGroups(values)
    }
  })

  const postGroups = async () => {
    const groups = fullGroups
      .filter(item => item.sgId)
      .map(item => ({
        sgId: item.sgId,
        userId: storeRecordId
      }))

    const data = {
      userId: storeRecordId,
      sgId: 0,
      groups
    }

    await postRequest({
      extension: AccessControlRepository.SecurityGroupUser.set2,
      record: JSON.stringify(data)
    }).then(() => {
      toast.success(platformLabels.Updated)
    })
  }

  const isSearchActive = !!formik.values.search

  const filteredData = isSearchActive
    ? fullGroups.filter(item => item.sgName?.toLowerCase().includes(formik.values.search.toLowerCase()))
    : fullGroups

  async function fetchGridData() {
    const res = await getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: `_userId=${storeRecordId}&_filter=&_sgId=0`
    })

    const items = res.list.map((item, index) => ({
      ...item,
      id: index + 1
    }))

    setFullGroups(items)
  }

  useEffect(() => {
    ;(async function () {
      if (storeRecordId) {
        await fetchGridData()
      }
    })()
  }, [storeRecordId])

  function handleRowsChange(updatedFilteredRows) {
    const isSearchActive = !!formik.values.search

    if (!isSearchActive) {
      setFullGroups(updatedFilteredRows)

      return
    }

    const updatedMap = new Map(updatedFilteredRows.map(row => [row.id, row]))

    const merged = fullGroups
      .filter(row => {
        const isFiltered = row.sgName?.toLowerCase().includes(formik.values.search.toLowerCase())
        const stillExists = updatedMap.has(row.id)

        return !isFiltered || stillExists
      })
      .map(row => {
        return updatedMap.get(row.id) || row
      })

    setFullGroups(merged)
  }

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Users}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={!!storeRecordId}
    >
      <VertLayout>
        <Fixed>
          <Grid container>
            <Grid item xs={4}>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={labels.search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                  fetchGridData()
                }}
                onChange={handleSearchChange}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={handleRowsChange}
            value={filteredData}
            allowAddNewLine={!formik.values.search}
            columns={[
              {
                component: 'resourcecombobox',
                name: 'sgId',
                label: labels.group,
                props: {
                  endpointId: AccessControlRepository.SecurityGroup.qry,
                  parameters: '_startAt=0&_pageSize=1000',
                  valueField: 'recordId',
                  displayField: 'name',
                  mapping: [
                    { from: 'recordId', to: 'sgId' },
                    { from: 'name', to: 'sgName' }
                  ]
                }
              }
            ]}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SecurityGrpTab
