import { useContext } from 'react'
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

const SitesTab = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels: _labels, access } = useResourceQuery({
    queryFn: fetchGridData,

    //endpointId: ManufacturingRepository.LeanProductionPlanning.preview,
    datasetId: ResourceIds.Users
  })

  const {
    labels: _labelsADJ,
    access: accessADJ,
    invalidate
  } = useResourceParams({
    datasetId: ResourceIds.MaterialsAdjustment
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
      /*   const copy = { ...values }
      let checkedObjects = copy.rows.filter(obj => obj.checked)

      if (checkedObjects.length > 0) {
        checkedObjects = checkedObjects.map(({ date, ...rest }) => ({
          date: formatDateToApi(date),
          ...rest
        }))

        const resultObject = {
          leanProductions: checkedObjects
        }

        const res = await postRequest({
          extension: ManufacturingRepository.MaterialsAdjustment.generate,
          record: JSON.stringify(resultObject)
        })
      }*/
    }
  })
  async function fetchGridData() {
    /* const response = await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview,
      parameters: `_status=2`
    })

    const data = response.list.map((item, index) => ({
      ...item,
      id: index + 1,
      balance: item.qty - (item.qtyProduced ?? 0),
      date: formatDateFromApi(item?.date),
      checked: false
    }))
    formik.setValues({ rows: data })*/
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
      }
    }
  ]

  const filteredData = formik.values.rows.filter(
    item =>
      (item.siteReference && item.siteReference.toString().includes(formik.values.search)) ||
      (item.siteName && item.siteName.toLowerCase().includes(formik.values.search.toLowerCase()))
  )

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

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
