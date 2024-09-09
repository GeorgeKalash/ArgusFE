import { useFormik } from 'formik'
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

const CategorySiteForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    initialValues: {
      sites: [
        {
          id: 1,
          categoryId: recordId,
          name: '',
          reference: '',
          isLocked: false,
          siteId: ''
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
      label: labels.siteRef,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'name',
      label: labels.siteName,
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
  function getData() {
    getRequest({
      extension: InventoryRepository.Site.qry,
      parameters: `_filter=`
    })
      .then(res => {
        const modifiedList = res.list?.map((user, index) => ({
          ...user,
          siteId: user.recordId,
          id: index + 1
        }))
        console.log(modifiedList)
        formik.setValues({ sites: modifiedList })
      })
      .catch(error => {})
  }
  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.IvCategories}
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
            value={formik.values.sites || []}
            error={formik.errors.sites}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default CategorySiteForm