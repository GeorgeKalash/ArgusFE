import styled from 'styled-components'
import React, { useContext, useEffect, useState } from 'react'
import FormShell from './FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useForm } from 'src/hooks/form.js'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import { Grid } from '@mui/material'
import CustomTextArea from '../Inputs/CustomTextArea'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomTextField from '../Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'


const ProgressBarLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #888888;
  position: absolute;
  width: 100%;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
`

const Label = styled.span`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 3px;
  margin-top: 5px;
  color: #000;
`

const ProgressBarBackground = styled.div`
  width: 100%;
  height: 35px;
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
  position: relative;
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

export const ProgressForm = ({ recordId, access, window }) => {
  const { getRequest } = useContext(RequestsContext);
  const [intervalId, setIntervalId] = useState();
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      recordId,
      iterations: 0,
      completed: 0,
      phases: 0,
      currentPhase: 0,
      currentPhaseName: '',
      logInfo: '',
      status: 0,
    },
    enableReinitialize: true,
  });

  const fetchData = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.THD.get,
        parameters: `_recordId=${recordId}`
      });

      formik.setValues(res.record);
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 2000);
    setIntervalId(interval);

    return () => clearInterval(interval);
  }, [recordId, getRequest]);

  useEffect(() => {
    fetchData();
  }, [])

  useEffect(() => {
    if (formik.values.status < 0 || formik.values.status === null) {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [formik.values.status, intervalId]);

  const currentPhaseProgress = formik.values.phases ? (formik.values.currentPhase / formik.values.phases) * 100 : 0;
  const completedProgress = formik.values.iterations ? (formik.values.completed / formik.values.iterations) * 100 : 0;

  const tasksCompleted = currentPhaseProgress === 100 && completedProgress === 100;
  
  const hasLogError = !!formik.values.logInfo;

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
      form={formik} 
      maxAccess={access} 
      isInfo={false}
      editMode={true}
      isCleared={false}
      actions={actions}
      isSaved={false}
    >
      <VertLayout>
        <Grow>
          <Grid item xs={12}>
            <CustomTextField
                name='phase'
                label={platformLabels.Phase}
                value={formik.values.currentPhaseName}
                readOnly={true}
                maxAccess={access}
            />
          </Grid>
          <ProgressBarComponent 
            label={`${platformLabels.Step} ${formik.values.currentPhase} of ${formik.values.phases}...`} 
            topLabel={platformLabels.currentPhase}
            width={`${currentPhaseProgress}%`} 
          />
          <ProgressBarComponent 
            label={`${platformLabels.Step} ${formik.values.completed} of ${formik.values.iterations}...`} 
            topLabel={platformLabels.Completed} 
            width={`${completedProgress}%`} 
          />
          <CustomTextArea
            name='log'
            label={platformLabels.Log}
            value={formik.values.logInfo}
            rows={4}
            maxAccess={access}
            readOnly={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  );
}
