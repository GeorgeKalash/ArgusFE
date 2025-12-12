import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SitesTab = ({ labels, maxAccess, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    validateOnChange: true,
    initialValues: {
      search: '',
      rows: [
        {
          id: 1,
          siteId: '',
          siteName: '',
          siteReference: '',
          userId: '',
          accessLevel: '',
          accessLevelName: '',
          isChecked: false
        }
      ]
    },
    onSubmit: async () => {
      const itemsListROU = formik.values.rows
        .filter(obj => obj.isChecked)
        .map(row => ({
          resourceId: ResourceIds.Sites,
          userId: recordId,
          recordId: row.siteId
        }))

      const dataROU = {
        userId: recordId,
        resourceId: ResourceIds.Sites,
        items: itemsListROU
      }

      await postRequest({
        extension: AccessControlRepository.RowAccessUserView.set2,
        record: JSON.stringify(dataROU)
      })

      const itemsListUSI = formik.values.rows
        .filter(obj => obj.isChecked)
        .map(row => ({
          userId: recordId,
          siteId: row.siteId,
          accessLevel: row.accessLevel
        }))

      const dataUSI = {
        userId: recordId,
        items: itemsListUSI
      }

      await postRequest({
        extension: AccessControlRepository.UserSiteView.set2,
        record: JSON.stringify(dataUSI)
      })
      await fetchGridData()
      toast.success(platformLabels.Updated)
    }
  })

  async function fetchGridData() {
    const siteResponse = await getRequest({
      extension: InventoryRepository.Site.qry,
      parameters: `_filter=`
    })

    const siteViews = siteResponse.list.map(site => ({
      siteId: site.recordId,
      siteReference: site.reference,
      siteName: site.name,
      isChecked: false
    }))

    const rowAccessUserResponse = await getRequest({
      extension: AccessControlRepository.RowAccessUserView.qry,
      parameters: `_resourceId=${ResourceIds.Sites}&_userId=${recordId}`
    })
    rowAccessUserResponse.list.forEach(rau => {
      const site = siteViews.find(site => site.siteId === rau.recordId)
      if (site) site.isChecked = true
    })

    const userAccessResponse = await getRequest({
      extension: AccessControlRepository.UserSiteView.qry,
      parameters: `_userId=${recordId}`
    })
    userAccessResponse.list.forEach(userAccess => {
      const site = siteViews.find(site => site.siteId === userAccess.siteId)
      if (site) {
        site.accessLevel = userAccess.accessLevel
        site.accessLevelName = userAccess.accessLevelName
      }
    })

    const data = siteViews.map((item, index) => ({
      ...item,
      id: index + 1
    }))
    formik.setValues({ rows: data })
  }

  const columns = [
    {
      component: 'checkbox',
      label: ' ',
      name: 'isChecked',
      flex: 1
    },
    {
      component: 'textfield',
      name: 'siteReference',
      label: labels.siteRef,
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'siteName',
      label: labels.name,
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      name: 'accessLevelCombo',
      label: labels.accessLevel,
      flex: 3,
      props: {
        datasetId: DataSets.IV_SITE_ACCESS,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'accessLevel' },
          { from: 'value', to: 'accessLevelName' }
        ]
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: !row.isChecked }
      }
    }
  ]

  const filteredData = formik.values.search
    ? formik.values.rows.filter(
        item =>
          (item.siteReference && item.siteReference.toString().includes(formik.values.search.toLowerCase())) ||
          (item.siteName && item.siteName.toLowerCase().includes(formik.values.search.toLowerCase()))
      )
    : formik.values.rows

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  function handleRowsChange(newValues) {
    const updatedRows = formik.values.rows.map(row => {
      const newValue = newValues.find(newRow => newRow.id === row.id)

      return newValue ? newValue : row
    })

    formik.setFieldValue('rows', updatedRows)
  }
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await fetchGridData()
      }
    })()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Fixed>
          <CustomTextField
            name='search'
            value={formik.values.search}
            label={labels.search}
            onClear={() => {
              formik.setFieldValue('search', '')
              fetchGridData()
            }}
            sx={{ width: '30%' }}
            onChange={handleSearchChange}
          />
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => handleRowsChange(value)}
            value={filteredData}
            error={formik.errors.rows}
            columns={columns}
            allowAddNewLine={false}
            allowDelete={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SitesTab
