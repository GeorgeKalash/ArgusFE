import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { Grid } from '@mui/material'
import { useForm } from 'src/hooks/form'

const CategorySiteForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,

    initialValues: {
      sites: [
        {
          id: 1,
          categoryId: recordId,
          siteId: '',
          name: '',
          reference: '',
          isLocked: false
        }
      ]
    },
    onSubmit: values => {
      postdata(values)
    }
  })

  const postdata = obj => {
    const sites = obj?.sites?.map(({ categoryId, ...rest }) => ({
      categoryId: recordId,

      ...rest
    }))

    const list = {
      categoryId: recordId,
      sites: sites
    }
    postRequest({
      extension: InventoryRepository.CategorySites.set2,
      record: JSON.stringify(list)
    })
      .then(res => {
        toast.success(platformLabels.Edited)
        getData()
      })
      .catch(error => {})
  }

  const columns = [
    {
      component: 'textfield',
      name: 'reference',
      label: labels.reference,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'name',
      label: labels.name,
      props: {
        readOnly: true
      }
    },
    {
      component: 'checkbox',
      label: labels.isLocked,
      name: 'isLocked'
    }
  ]
  async function getData() {
    try {
      const res = await getRequest({
        extension: InventoryRepository.Site.qry,
        parameters: `_filter=`
      })

      const modifiedList = res.list?.map((category, index) => ({
        ...category,
        siteId: category.recordId,
        id: index + 1
      }))

      try {
        const lockRes = await getRequest({
          extension: InventoryRepository.CategorySites.qry,
          parameters: `_categoryId=${recordId}`
        })

        const mergedList = modifiedList.map(site => {
          const lockInfo = lockRes.list.find(lockItem => lockItem.siteId === site.siteId)

          return {
            ...site,
            isLocked: lockInfo ? lockInfo.isLocked : false
          }
        })

        formik.setValues({ sites: mergedList })
      } catch (error) {}
    } catch (error) {}
  }
  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Category}
      isCleared={false}
      infoVisible={false}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={6.01}>
              <CustomTextField name='reference' label={labels.reference} value={store.ref} readOnly={true} />
            </Grid>
            <Grid item xs={6.01}>
              <CustomTextField name='name' label={labels.name} value={store.name} readOnly={true} />
            </Grid>
          </Grid>
          <DataGrid
            onChange={value => formik.setFieldValue('sites', value)}
            value={formik.values.sites}
            error={formik.errors.sites}
            columns={columns}
            allowAddNewLine={false}
            allowDelete={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default CategorySiteForm
