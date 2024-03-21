import { useEffect, useState, useContext } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Grid } from '@mui/material';
import FormShell from 'src/components/Shared/FormShell';
import ResourceComboBox from 'src/components/Shared/ResourceComboBox';
import { RequestsContext } from 'src/providers/RequestsContext';
import toast from 'react-hot-toast';
import { useInvalidate } from 'src/hooks/resource';
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository';
import { ResourceIds } from 'src/resources/ResourceIds';

const validationSchema = yup.object({
  codeId: yup.string().required('This field is required'),
});

const ApproverForm = ({ labels, maxAccess, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext);
  const invalidate = useInvalidate({ endpointId: DocumentReleaseRepository.GroupCode.qry });

  const formik = useFormik({
    initialValues: {
      codeId: '',
      groupId: '',
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => handleSubmit(values, setSubmitting),
  });

  const fetchInitialData = async () => {
    if (!recordId) return;
    try {
      const response = await getRequest({
        extension: DocumentReleaseRepository.GroupCode.get,
        parameters: `_recordId=${recordId}&_groupId=${1}`,
      });
      formik.setValues(response.record);
    } catch (error) {
      toast.error('Failed to fetch approver data');
    }
  };

  const handleSubmit = async (values, setSubmitting) => {
    try {
      await postRequest({
        extension: DocumentReleaseRepository.GroupCode.set,
        record: JSON.stringify(values),
      });
      toast.success('Record saved successfully');
      invalidate();
    } catch (error) {
      toast.error('Failed to save approver data');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [recordId]);

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.DRGroups}
      maxAccess={maxAccess}
      editMode={!!recordId}
    >
      <Grid container spacing={4}>
        <ResourceComboBox
        endpointId={DocumentReleaseRepository.GroupCode.qry}
        parameters={`_groupId=${3}`}
          name="codeId"
          label={'abels.fromDocument'}
          valueField="recordId"
          displayField="reference"
          values={formik.values}
          maxAccess={maxAccess}
          onChange={formik.handleChange}
          error={formik.touched.codeId && Boolean(formik.errors.codeId)}
          helperText={formik.touched.codeId && formik.errors.codeId}
        />
      </Grid>
    </FormShell>
  );
};

export default ApproverForm;