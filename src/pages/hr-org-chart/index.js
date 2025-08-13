import { useContext } from 'react'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import { Grid } from '@mui/material'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import useResourceParams from 'src/hooks/useResourceParams'
import { companyStructureRepository } from 'src/repositories/companyStructureRepository'
import CustomButton from 'src/components/Inputs/CustomButton'
import OrgChart from 'src/components/Shared/OrgChart'

const HROrgChart = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.OrganizationChart
  })

  const { formik } = useForm({
    initialValues: {
      type: 0,
      orgData: []
    },
    validateOnChange: true,
    onSubmit: async obj => {
      const data = await getRequest({
        extension: companyStructureRepository.DepartmentFilters.qry,
        parameters: `_filter=&_size=1000&_startAt=0&_type=${obj?.type}&_activeStatus=1&_sortBy=recordId`
      })

      const transformed = transformToOrgChartData(data.list || [])

      formik.setFieldValue('orgData', transformed)
    }
  })

  function transformToOrgChartData(records) {
    const idToName = {}
    const idToRecord = {}

    records?.forEach(record => {
      idToName[record.recordId] = record.name
      idToRecord[record.recordId] = record
    })

    return records?.map(record => {
      const id = String(record?.recordId)
      const displayName = record?.name
  
      let parent = ''

      if (record?.parentId != null && idToName[record?.parentId]) {
        parent = String(record.parentId)
      } else if (record.parentName) {
        parent = record.parentName
      }

      return [{ v: id, f: displayName }, parent]
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          hasSearch={false}
          middleSection={
            <Grid container spacing={2} padding={6}>
              <Grid item xs={3}>
                <ResourceComboBox
                  datasetId={DataSets.ORG_CHART_TYPE}
                  name='type'
                  label={labels.type}
                  valueField='key'
                  displayField='value'
                  maxAccess={access}
                  values={formik.values}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('type', newValue?.key || 0)
                  }}
                />
              </Grid>
              <Grid item>
                <CustomButton
                  onClick={formik.handleSubmit}
                  label={platformLabels.GO}
                  color='#231f20'
                />
              </Grid>
            </Grid>
          }
        />
        {formik.values.orgData && <OrgChart data={formik.values.orgData} />}
      </Fixed>
    </VertLayout>
  )
}

export default HROrgChart
