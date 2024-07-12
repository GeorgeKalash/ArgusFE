import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import useResourceParams from 'src/hooks/useResourceParams'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { DataSets } from 'src/resources/DataSets'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { ControlContext } from 'src/providers/ControlContext'

const SitesTab = ({ labels, maxAccess, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.Users
  })

  const { formik } = useForm({
    access,
    enableReinitialize: true,
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
    onSubmit: async values => {
      try {
        const itemsListROU = values.rows
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

        const itemsListUSI = values.rows
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
        toast.success(platformLabels.Updated)
      } catch (error) {}
    }
  })

  async function fetchGridData() {
    try {
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
    } catch (error) {}
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
      label: _labels.siteRef,
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'siteName',
      label: _labels.name,
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      name: 'accessLevelCombo',
      label: _labels.accessLevel,
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

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await fetchGridData()
      }
    })()
  }, [recordId])

  return (
    <FormShell form={formik} infoVisible={false} isCleared={false}>
      <VertLayout>
        <Fixed>
          <Grid container>
            <Grid xs={4} item>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={_labels.search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                }}
                onChange={handleSearchChange}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={filteredData}
            error={formik.errors.rows}
            columns={columns}
            allowAddNewLine={false}
            allowDelete={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SitesTab
