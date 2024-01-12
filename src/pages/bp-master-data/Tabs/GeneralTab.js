// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'

const GeneralTab = ({
  labels,
  bpMasterDataValidation,
  maxAccess,
  idCategoryStore,
  editMode,
  fillIdCategoryStore,
  defaultValue
}) => {
  return (
    <>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.BP_CATEGORY}
              name='category'
              label={labels.category}
              valueField='key'
              displayField='value'
              values={bpMasterDataValidation.values}
              required
              readOnly={editMode}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                bpMasterDataValidation.setFieldValue('category', newValue?.key)
                const selectedCategory = newValue?.key || ''
                fillIdCategoryStore(selectedCategory) // Fetch and update state data based on the selected category
              }}
              error={bpMasterDataValidation.touched.category && Boolean(bpMasterDataValidation.errors.category)}
              helperText={bpMasterDataValidation.touched.category && bpMasterDataValidation.errors.category}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={BusinessPartnerRepository.Group.qry}
              name='groupId'
              label={labels.group}
              valueField='recordId'
              displayField='name'
              values={bpMasterDataValidation.values}
              required
              readOnly={editMode}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                bpMasterDataValidation && bpMasterDataValidation.setFieldValue('groupId', newValue?.recordId)
              }}
              error={bpMasterDataValidation.touched.groupId && Boolean(bpMasterDataValidation.errors.groupId)}
              helperText={bpMasterDataValidation.touched.groupId && bpMasterDataValidation.errors.groupId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={bpMasterDataValidation.values.reference}
              required
              readOnly={editMode}
              maxLength='15'
              maxAccess={maxAccess}
              onChange={bpMasterDataValidation.handleChange}
              onClear={() => bpMasterDataValidation.setFieldValue('reference', '')}
              error={bpMasterDataValidation.touched.reference && Boolean(bpMasterDataValidation.errors.reference)}
              helperText={bpMasterDataValidation.touched.reference && bpMasterDataValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={bpMasterDataValidation.values.name}
              required
              maxLength='70'
              maxAccess={maxAccess}
              onChange={bpMasterDataValidation.handleChange}
              onClear={() => bpMasterDataValidation.setFieldValue('name', '')}
              error={bpMasterDataValidation.touched.name && Boolean(bpMasterDataValidation.errors.name)}
              helperText={bpMasterDataValidation.touched.name && bpMasterDataValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='birthDate'
              label={labels.birthDate}
              value={bpMasterDataValidation.values.birthDate}
              onChange={bpMasterDataValidation.handleChange}
              maxAccess={maxAccess}
              onClear={() => bpMasterDataValidation.setFieldValue('birthDate', '')}
              error={bpMasterDataValidation.touched.birthDate && Boolean(bpMasterDataValidation.errors.birthDate)}
              helperText={bpMasterDataValidation.touched.birthDate && bpMasterDataValidation.errors.birthDate}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='birthPlace'
              label={labels.birthPlace}
              value={bpMasterDataValidation.values.birthPlace}
              maxLength='30'
              maxAccess={maxAccess}
              onChange={bpMasterDataValidation.handleChange}
              onClear={() => bpMasterDataValidation.setFieldValue('birthPlace', '')}
              error={bpMasterDataValidation.touched.birthPlace && Boolean(bpMasterDataValidation.errors.birthPlace)}
              helperText={bpMasterDataValidation.touched.birthPlace && bpMasterDataValidation.errors.birthPlace}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='flName'
              label={labels.foreignLanguage}
              value={bpMasterDataValidation.values.flName}
              maxLength='70'
              maxAccess={maxAccess}
              onChange={bpMasterDataValidation.handleChange}
              onClear={() => bpMasterDataValidation.setFieldValue('flName', '')}
              error={bpMasterDataValidation.touched.flName && Boolean(bpMasterDataValidation.errors.flName)}
              helperText={bpMasterDataValidation.touched.flName && bpMasterDataValidation.errors.flName}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='keywords'
              label={labels.keywords}
              value={bpMasterDataValidation.values.keywords}
              maxLength='30'
              maxAccess={maxAccess}
              onChange={bpMasterDataValidation.handleChange}
              onClear={() => bpMasterDataValidation.setFieldValue('keywords', '')}
              error={bpMasterDataValidation.touched.keywords && Boolean(bpMasterDataValidation.errors.keywords)}
              helperText={bpMasterDataValidation.touched.keywords && bpMasterDataValidation.errors.keywords}
            />
          </Grid>
          <Grid item xs={12}>
            {idCategoryStore && (
              <CustomComboBox
                name='defaultInc'
                label={labels.idCategory}
                valueField='recordId'
                displayField='name'
                store={idCategoryStore}
                value={idCategoryStore.filter(item => item.recordId === bpMasterDataValidation.values.defaultInc)[0]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  bpMasterDataValidation && bpMasterDataValidation.setFieldValue('defaultInc', newValue?.recordId)
                }}
                error={bpMasterDataValidation.touched.defaultInc && Boolean(bpMasterDataValidation.errors.defaultInc)}
                helperText={bpMasterDataValidation.touched.defaultInc && bpMasterDataValidation.errors.defaultInc}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label={labels.defaultId}
              value={defaultValue}
              maxAccess={maxAccess}
              readOnly={!bpMasterDataValidation.values?.defaultInc}
              onClear={() => bpMasterDataValidation.setFieldValue('defaultId', '')}
              error={bpMasterDataValidation.touched.defaultId && Boolean(bpMasterDataValidation.errors.defaultId)}
              helperText={bpMasterDataValidation.touched.defaultId && bpMasterDataValidation.errors.defaultId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='nationalityId'
              label={labels.nationalityId}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={bpMasterDataValidation.values}
              valueField='recordId'
              displayField='name'
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                bpMasterDataValidation && bpMasterDataValidation.setFieldValue('nationalityId', newValue?.recordId)
              }}
              error={
                bpMasterDataValidation.touched.nationalityId && Boolean(bpMasterDataValidation.errors.nationalityId)
              }
              helperText={bpMasterDataValidation.touched.nationalityId && bpMasterDataValidation.errors.nationalityId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={BusinessPartnerRepository.LegalStatus.qry}
              parameters={`_startAt=0&_pageSize=100`}
              name='legalStatusId'
              label={labels.legalStatus}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField='name'
              values={bpMasterDataValidation.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                bpMasterDataValidation && bpMasterDataValidation.setFieldValue('legalStatusId', newValue?.recordId)
              }}
              error={
                bpMasterDataValidation.touched.legalStatusId && Boolean(bpMasterDataValidation.errors.legalStatusId)
              }
              helperText={bpMasterDataValidation.touched.legalStatusId && bpMasterDataValidation.errors.legalStatusId}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='isInactive'
                  maxAccess={maxAccess}
                  checked={bpMasterDataValidation.values?.isInactive}
                  onChange={bpMasterDataValidation.handleChange}
                />
              }
              label={labels.inactive}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='isBlackListed'
                  maxAccess={maxAccess}
                  checked={bpMasterDataValidation.values?.isBlackListed}
                  onChange={bpMasterDataValidation.handleChange}
                />
              }
              label={labels.isBlackListed}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default GeneralTab
