/** @format */

import { Grid } from "@mui/material";
import { useContext, useEffect } from "react";
import * as yup from "yup";
import FormShell from "@argus/shared-ui/src/components/Shared/FormShell";
import toast from "react-hot-toast";
import { RequestsContext } from "@argus/shared-providers/src/providers/RequestsContext";
import { useInvalidate } from "@argus/shared-hooks/src/hooks/resource";
import { ResourceIds } from "@argus/shared-domain/src/resources/ResourceIds";
import CustomTextField from "@argus/shared-ui/src/components/Inputs/CustomTextField";
import { useForm } from "@argus/shared-hooks/src/hooks/form";
import { ControlContext } from "@argus/shared-providers/src/providers/ControlContext";
import { VertLayout } from "@argus/shared-ui/src/components/Layouts/VertLayout";
import { Grow } from "@argus/shared-ui/src/components/Layouts/Grow";
import { ProductModelingRepository } from "@argus/repositories/src/repositories/ProductModelingRepository";
import ResourceComboBox from "@argus/shared-ui/src/components/Shared/ResourceComboBox";
import { DataSets } from "@argus/shared-domain/src/resources/DataSets";
import useResourceParams from "@argus/shared-hooks/src/hooks/useResourceParams";
import useSetWindow from "@argus/shared-hooks/src/hooks/useSetWindow";

export default function DesignerForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext);
  const { platformLabels } = useContext(ControlContext);

  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.Designer.page,
  });

  const { labels, maxAccess } = useResourceParams({
    datasetId: ResourceIds.Designer,
    editMode: !!recordId,
  });

  useSetWindow({ title: labels.designer, window });

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: "",
      name: "",
      type: "",
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      type: yup.string().required(),
    }),
    onSubmit: async (obj) => {
      const response = await postRequest({
        extension: ProductModelingRepository.Designer.set,
        record: JSON.stringify(obj),
      });

      if (!obj.recordId) {
        toast.success(platformLabels.Added);
        formik.setFieldValue("recordId", response.recordId);
      } else toast.success(platformLabels.Edited);

      invalidate();
    },
  });

  const editMode = !!formik.values.recordId;

  useEffect(() => {
    (async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ProductModelingRepository.Designer.get,
          parameters: `_recordId=${recordId}`,
        });

        formik.setValues(res.record);
      }
    })();
  }, []);

  return (
    <FormShell
      resourceId={ResourceIds.Designer}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name="reference"
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                maxLength="10"
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue("reference", "")}
                error={
                  formik.touched.reference && Boolean(formik.errors.reference)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name="name"
                label={labels.name}
                value={formik.values.name}
                required
                maxLength="60"
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue("name", "")}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.DESIGNER_TYPE}
                name="type"
                label={labels.type}
                values={formik.values}
                required
                valueField="key"
                displayField="value"
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue("type", newValue?.key || null);
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  );
}

DesignerForm.width = 600;
DesignerForm.height = 300;
