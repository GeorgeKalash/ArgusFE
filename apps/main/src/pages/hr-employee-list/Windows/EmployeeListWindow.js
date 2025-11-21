import { Grid, Box, Typography } from '@mui/material'
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useContext, useEffect, useRef, useState } from 'react'
import ProfileForm from '../Forms/ProfileForm'
import JobTab from '../Forms/JobTab'
import HiringTab from '../Forms/HiringTab'
import LeavesTab from '../Forms/LeavesTab'
import SkillsTab from '../Forms/SkillsTab'
import UserDefinedTab from '../Forms/UserDefinedTab'
import AttachmentList from '@argus/shared-ui/src/components/Shared/AttachmentList'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ImageUpload from '@argus/shared-ui/src/components/Inputs/ImageUpload'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { formatDateMDY } from '@argus/shared-domain/src/lib/date-helper'

const EmployeeListWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState({ recordId: recordId || null, hireDate: null })
  const { getRequest } = useContext(RequestsContext)
  const [quickView, setQuickView] = useState(null)

  const imageUploadRef = useRef(null)

  const tabs = [
    { label: labels.Profile },
    { label: labels.Job, disabled: !store.recordId },
    { label: labels.Leaves, disabled: !store.recordId },
    { label: labels.Hiring, disabled: !store.recordId },
    { label: labels.Files, disabled: !store.recordId },
    { label: labels.Skills, disabled: !store.recordId },
    { label: labels.UserDefined, disabled: !store.recordId }
  ]

  const getData = async recordId => {
    const res = await getRequest({
      extension: EmployeeRepository.QuickView.get,
      parameters: `_recordId=${recordId}&_asOfDate=${formatDateMDY(new Date())}`
    })

    setQuickView(res?.record || {})

    setStore(prev => ({
      ...prev,
      hireDate: res?.record?.hireDate || null
    }))
  }

  useEffect(() => {
    if (recordId) getData(recordId)
  }, [])

  return (
    <Grid container sx={{ height: '100%' }}>
      <Grid item xs={3} sx={{ height: '100%' }}>
        <Box
          sx={{
            height: '100%',
            borderRight: '1px solid #ddd',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left'
          }}
        >
          <ImageUpload
            ref={imageUploadRef}
            resourceId={ResourceIds.EmployeeFilter}
            seqNo={0}
            recordId={recordId}
            disabled={!!recordId}
          />

          {recordId && (
            <>
              <Typography variant='subtitle1'>{quickView?.fullName || ''}</Typography>
              <Typography variant='subtitle1'>{quickView?.departmentName || ''}</Typography>
              <Typography variant='subtitle1'>{quickView?.branchName || ''}</Typography>
              <Typography variant='subtitle1'>{quickView?.positionName || ''}</Typography>

              <Typography variant='body2' color='text.secondary'>
                {labels.Manager}: {quickView?.reportToName || ''}
              </Typography>

              <Typography variant='body2' color='text.secondary'>
                {quickView?.serviceDuration || ''}
              </Typography>
            </>
          )}
        </Box>
      </Grid>
      <Grid item xs={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />

        <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
          <ProfileForm
            store={store}
            setStore={setStore}
            labels={labels}
            getData={getData}
            maxAccess={maxAccess}
            imageUploadRef={imageUploadRef}
          />
        </CustomTabPanel>

        <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
          <JobTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
          <LeavesTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel index={3} value={activeTab} maxAccess={maxAccess}>
          <HiringTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel index={4} value={activeTab} maxAccess={maxAccess}>
          <AttachmentList resourceId={ResourceIds.Files} recordId={recordId} isNotTab={recordId} />
        </CustomTabPanel>

        <CustomTabPanel index={5} value={activeTab} maxAccess={maxAccess}>
          <SkillsTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel index={6} value={activeTab} maxAccess={maxAccess}>
          <UserDefinedTab store={store} maxAccess={maxAccess} />
        </CustomTabPanel>
      </Grid>
    </Grid>
  )
}

export default EmployeeListWindow
