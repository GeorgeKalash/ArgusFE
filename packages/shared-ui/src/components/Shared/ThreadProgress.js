import styled from 'styled-components'
import React, { useContext, useEffect, useState } from 'react'
import FormShell from './FormShell'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grid } from '@mui/material'
import CustomTextArea from '../Inputs/CustomTextArea'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomTextField from '../Inputs/CustomTextField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const ProgressContainer = styled.div`
  container-type: inline-size;
  font-size: clamp(12px, 3.2cqw, 16px);
`

const ProgressBarLabel = styled.span`
  font-size: clamp(10px, 2.2cqw, 12px);
  font-weight: 600;
  color: #888888;
  position: absolute;
  width: 100%;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
`

const Label = styled.span`
  font-size: clamp(11px, 2.4cqw, 13px);
  font-weight: 600;
  margin-bottom: 3px;
  margin-top: 5px;
  color: #000;
`

const ProgressBarBackground = styled.div`
  width: 100%;
  height: clamp(28px, 7cqw, 35px);
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
  position: relative;
`

const ProgressBarsWrapper = styled.div`
  container-type: inline-size;
`

const ProgressBar = styled.div`
  height: 100%;
  background-color: #cce6ff;
  transition: width 1.5s ease-in-out;
`

function ProgressBarComponent({ label, topLabel, width }) {
  return (
    <div>
      <Label>{topLabel}: </Label>
      <ProgressBarBackground>
        <ProgressBar style={{ width }} />
        <ProgressBarLabel>{label}</ProgressBarLabel>
      </ProgressBarBackground>
    </div>
  )
}

export const ThreadProgress = ({ recordId, onComplete, access, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.Progress, window })

  const [data, setData] = useState({
    recordId,
    iterations: 0,
    completed: 0,
    phases: 0,
    currentPhase: 0,
    currentPhaseName: '',
    logInfo: '',
    status: 0
  })

  const fetchData = async () => {
    const res = await getRequest({
      extension: SystemRepository.THD.get,
      parameters: `_recordId=${recordId}`
    })

    return res.record
  }

  const tasksCompleted = data.currentPhase === data.phases && data.completed === data.iterations

  const hasLogError = !!data.status && data.status < 0

  useEffect(() => {
    if(onComplete){
      if(tasksCompleted || hasLogError) onComplete()
    }
  }, [hasLogError, tasksCompleted])

  useEffect(() => {
    const fetchDataAndSet = async () => {
      const data = await fetchData()
      setData(data)
    }

    fetchDataAndSet()

    const interval = setInterval(async () => {
      const data = await fetchData()
      setData(data)
      const tasksCompleted = data.currentPhase === data.phases && data.completed === data.iterations

      const hasLogError = !!data.status && data.status < 0
      if ((!!data.status && data.status < 0) || tasksCompleted || hasLogError) {
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const currentPhaseProgress = data.phases ? (data.currentPhase / data.phases) * 100 : 0
  const completedProgress = data.iterations ? (data.completed / data.iterations) * 100 : 0

  const actions = [
    {
      key: 'Cancel',
      condition: true,
      onClick: () => window.close(),
      disabled: !tasksCompleted && !hasLogError
    }
  ]

  return (
    <FormShell
      form={data}
      maxAccess={access}
      isInfo={false}
      editMode={true}
      isCleared={false}
      actions={actions}
      isSaved={false}
    >
    <VertLayout>
      <Grow>
        <ProgressContainer>
          <Grid item xs={12}>
            <CustomTextField
              name='phase'
              label={platformLabels.Phase}
              value={data.currentPhaseName}
              readOnly={true}
              maxAccess={access}
            />
          </Grid>
          <ProgressBarsWrapper>
            <ProgressBarComponent
              label={`${platformLabels.Step} ${data.currentPhase} of ${data.phases}...`}
              topLabel={platformLabels.currentPhase}
              width={`${currentPhaseProgress}%`}
            />
            <ProgressBarComponent
              label={`${platformLabels.Step} ${data.completed} of ${data.iterations}...`}
              topLabel={platformLabels.Completed}
              width={`${completedProgress}%`}
            />
          </ProgressBarsWrapper>
          <CustomTextArea
            name='log'
            label={platformLabels.Log}
            value={data.logInfo}
            rows={4}
            maxAccess={access}
            readOnly={true}
          />
        </ProgressContainer>
      </Grow>
    </VertLayout>
  </FormShell>
)
}

ThreadProgress.width = 500
ThreadProgress.height = 450
