import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useContext, useState } from 'react'
import * as yup from 'yup'
import AvailabilitiesTab from './Windows/AvailabilitiesTab'
import ActivitiesTab from './Windows/ActivitiesTab'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Button, Grid, Tooltip } from '@mui/material'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useForm } from 'src/hooks/form'

const SiteDashboard = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [siteId, setSiteId] = useState()
  const { getRequest } = useContext(RequestsContext)

  const { platformLabels } = useContext(ControlContext)

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.SiteDashboard
  })

  async function fetchGridAvailabilities(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    if (!!siteId) {
      const response = await getRequest({
        extension: InventoryRepository.Availability.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_siteId=${siteId}&_itemId=${0}&_functionId=0&_filter=&_size=30`
      })

      return { ...response, _startAt: _startAt }
    }
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

  async function fetchGridActivities(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    if (!!siteId) {
      const response = await getRequest({
        extension: InventoryRepository.Transaction.qry3,
        parameters: `_filter=&_size=30&_startAt=${_startAt}&_siteId=${siteId}&_functionId=0&_itemId=0&_pageSize=${_pageSize}&_sortBy=itemId`
      })

      return { ...response, _startAt: _startAt }
    }
  }

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
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      siteId: yup.string().required()
    }),
    onSubmit: () => {
      refetchAvailabilities()
      refetchActivities()
    }
  })

  return (
    <>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          inputSearch={false}
          leftSection={
            <Grid item sx={{ display: 'flex', mr: 2, width: 400 }}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                required
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={access}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('siteId', newValue?.recordId || null)
                    setSiteId(newValue?.recordId)
                  }
                }}
              />
              <Button
                sx={{ minWidth: '50px !important', ml: 2, height: 35 }}
                variant='contained'
                size='small'
                onClick={() => formik.handleSubmit()}
              >
                <Tooltip title={platformLabels.Preview}>
                  <img src='/images/buttonsIcons/preview.png' alt={platformLabels.Preview} />
                </Tooltip>
              </Button>
            </Grid>
          }
        />
      </Fixed>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <AvailabilitiesTab
          labels={labels}
          maxAccess={access}
          data={Availabilities}
          pagination={paginationAvailabilities}
          refetch={refetchAvailabilities}
          access={accessAvailabilities}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <ActivitiesTab
          maxAccess={access}
          labels={labels}
          data={activities}
          pagination={paginationActivities}
          refetch={refetchActivities}
          access={accessActivities}
        />
      </CustomTabPanel>
    </>
  )
}

export default SiteDashboard
