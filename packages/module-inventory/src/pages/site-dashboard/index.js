import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useContext, useState } from 'react'
import AvailabilitiesTab from './Tabs/AvailabilitiesTab'
import ActivitiesTab from './Tabs/ActivitiesTab'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

const SiteDashboard = () => {
  const [activeTab, setActiveTab] = useState(0)
  const { getRequest } = useContext(RequestsContext)

  const { platformLabels } = useContext(ControlContext)

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.SiteDashboard
  })

  async function fetchGridAvailabilities(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    if (!formik.values.siteId) {
      return { count: 0, list: [], statusId: 1, message: '' }
    }

    const response = await getRequest({
      extension: InventoryRepository.Availability.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_siteId=${
        formik.values.siteId
      }&_itemId=${0}&_functionId=0&_filter=&_size=30`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchGridActivities(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    if (!formik.values.siteId) {
      return { count: 0, list: [], statusId: 1, message: '' }
    }

    const response = await getRequest({
      extension: InventoryRepository.Transaction.qry3,
      parameters: `_filter=&_size=30&_startAt=${_startAt}&_siteId=${formik.values.siteId}&_functionId=0&_itemId=0&_pageSize=${_pageSize}&_sortBy=itemId`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data: Availabilities },
    paginationParameters: paginationAvailabilities,
    refetch: refetchAvailabilities,
    access: accessAvailabilities
  } = useResourceQuery({
    queryFn: fetchGridAvailabilities,
    endpointId: InventoryRepository.Availability.qry,
    datasetId: ResourceIds.SiteDashboard
  })

  const {
    query: { data: activities },
    paginationParameters: paginationActivities,
    refetch: refetchActivities,
    access: accessActivities
  } = useResourceQuery({
    queryFn: fetchGridActivities,
    endpointId: InventoryRepository.Transaction.qry3,
    datasetId: ResourceIds.SiteDashboard
  })

  const tabs = [{ label: labels?.availability }, { label: labels?.activities }]

  const { formik } = useForm({
    initialValues: {
      siteId: null
    },
    validateOnChange: true,
    onSubmit: () => {
      paginationActivities({ _startAt: 0, _pageSize: 50 })
      paginationAvailabilities({ _startAt: 0, _pageSize: 50 })

      refetchAvailabilities()
      refetchActivities()
    }
  })

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          inputSearch={false}
          leftSection={
            <Grid item sx={{ display: 'flex' }} xs={4}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={access}
                onChange={(_, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId || null)
                }}
              />
              <CustomButton
                image='preview.png'
                tooltipText={platformLabels.Preview}
                onClick={() => formik.handleSubmit()}
                style={{
                  marginLeft: 2,
                  padding: 0
                }}
              />
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />
        <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
          <AvailabilitiesTab
            labels={labels}
            maxAccess={access}
            data={Availabilities}
            pagination={paginationAvailabilities}
            refetch={refetchAvailabilities}
            access={accessAvailabilities}
          />
        </CustomTabPanel>
        <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
          <ActivitiesTab
            maxAccess={access}
            labels={labels}
            data={activities}
            pagination={paginationActivities}
            refetch={refetchActivities}
            access={accessActivities}
          />
        </CustomTabPanel>
      </Grow>
    </VertLayout>
  )
}

export default SiteDashboard
