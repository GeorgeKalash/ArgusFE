import { Grid, Box, Typography } from '@mui/material'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useRef, useState } from 'react'
import ProfileForm from '../Forms/ProfileForm'
import JobTab from '../Forms/JobTab'
import HiringTab from '../Forms/HiringTab'
import LeavesTab from '../Forms/LeavesTab'
import SkillsTab from '../Forms/SkillsTab'
import UserDefinedTab from '../Forms/UserDefinedTab'
import AttachmentList from 'src/components/Shared/AttachmentList'
import { ResourceIds } from 'src/resources/ResourceIds'
import ImageUpload from 'src/components/Inputs/ImageUpload'

const EmployeeListWindow = ({ height, recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState({ recordId: recordId || null, hireDate: null })

  const imageUploadRef = useRef(null)

  console.log(recordId)

  const tabs = [
    { label: labels.Profile },
    { label: labels.Job, disabled: !store.recordId },
    { label: labels.Leaves, disabled: !store.recordId },
    { label: labels.Hiring, disabled: !store.recordId },
    { label: labels.Files, disabled: !store.recordId },
    { label: labels.Skills, disabled: !store.recordId },
    { label: labels.UserDefined, disabled: !store.recordId }
  ]

  return (
    <Grid container spacing={2} sx={{ height: '100%' }}>
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
          <ImageUpload ref={imageUploadRef} resourceId={ResourceIds.EmployeeFilter} seqNo={0} recordId={recordId} />

          <Typography variant='subtitle1'>ID: {store.recordId || '-'}</Typography>
          <Typography variant='body2' color='text.secondary'>
            Manager: John Doe
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Service: 3y 1m 2d
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        <CustomTabPanel height={height} index={0} value={activeTab}>
          <ProfileForm store={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={1} value={activeTab}>
          <JobTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={2} value={activeTab}>
          <LeavesTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={3} value={activeTab}>
          <HiringTab store={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={4} value={activeTab}>
          <AttachmentList resourceId={ResourceIds.EmployeeFilter} recordId={recordId} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={5} value={activeTab}>
          <SkillsTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>
        {/* 
        <CustomTabPanel height={height} index={6} value={activeTab}>
          <UserDefinedTab store={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel> */}
      </Grid>
    </Grid>
  )
}

export default EmployeeListWindow
