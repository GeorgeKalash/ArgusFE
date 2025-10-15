import { Grid, Box, Typography } from '@mui/material'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useContext, useEffect, useRef, useState } from 'react'
import ProfileForm from '../Forms/ProfileForm'
import JobTab from '../Forms/JobTab'
import HiringTab from '../Forms/HiringTab'
import LeavesTab from '../Forms/LeavesTab'
import SkillsTab from '../Forms/SkillsTab'
import UserDefinedTab from '../Forms/UserDefinedTab'
import AttachmentList from 'src/components/Shared/AttachmentList'
import { ResourceIds } from 'src/resources/ResourceIds'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { formatDateMDY } from 'src/lib/date-helper'

const EmployeeListWindow = ({ height, recordId, labels, maxAccess }) => {
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

    if (res?.record) {
      setQuickView(res.record)

      setStore(prev => ({
        ...prev,
        hireDate: res.record.hireDate
      }))
    }
  }

  useEffect(() => {
    if (recordId) getData(recordId)
  }, [recordId])

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
        </Box>
      </Grid>
      <Grid item xs={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        <CustomTabPanel height={height} index={0} value={activeTab}>
          <ProfileForm
            store={store}
            setStore={setStore}
            labels={labels}
            maxAccess={maxAccess}
            imageUploadRef={imageUploadRef}
          />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={1} value={activeTab}>
          <JobTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={2} value={activeTab}>
          <LeavesTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={3} value={activeTab}>
          <HiringTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={4} value={activeTab}>
          <AttachmentList resourceId={ResourceIds.EmployeeFilter} recordId={recordId} isNotTab={recordId} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={5} value={activeTab}>
          <SkillsTab store={store} labels={labels} maxAccess={maxAccess} />
        </CustomTabPanel>

        <CustomTabPanel height={height} index={6} value={activeTab}>
          <UserDefinedTab store={store} maxAccess={maxAccess} />
        </CustomTabPanel>
      </Grid>
    </Grid>
  )
}

export default EmployeeListWindow
