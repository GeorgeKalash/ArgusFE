// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import ProductMasterTab from '../Tabs/productMasterTab'

const ProductMasterWindow = ({
  labels,
  maxAccess,
  height
}) => {
  const [editMode , setEditMode] = useState(false)
  const [activeTab , setActiveTab] = useState(0)

  const tabs = [
    { label: labels.main },
    { label: labels.countries, disabled: !editMode },
    { label: labels.monetary , disabled: !editMode },
    { label: labels.dispersal, disabled: !editMode },
    { label: labels.schedules, disabled: !editMode },
    { label: labels.amountRange, disabled: !editMode },
    { label: labels.field, disabled: !editMode },
    { label: labels.agent, disabled: !editMode }
  ]

  return (
    <>
        <CustomTabs  tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel height={height} index={0} value={activeTab}>
        <ProductMasterTab
          maxAccess={maxAccess}
          labels={labels}
          setEditMode={setEditMode}

          // correspondentStore={correspondentStore}
          // setCorrespondentStore={setCorrespondentStore}
          // lookupCorrespondent={lookupCorrespondent}
        />
      </CustomTabPanel>
     <CustomTabPanel index={1} value={activeTab}>
        <ProductCountriesTab
          productMasterValidation={productMasterValidation}
          countriesGridValidation={countriesGridValidation}
          countriesInlineGridColumns={countriesInlineGridColumns}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      {/*  <CustomTabPanel index={2} value={activeTab}>
        <ProductCurrenciesTab
          productMasterValidation={productMasterValidation}
          monetariesGridValidation={monetariesGridValidation}
          monetariesInlineGridColumns={monetariesInlineGridColumns}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
       <ProductDispersalTab
          dispersalsGridData={dispersalsGridData}
          getDispersalsGridData={getDispersalsGridData}
          addProductDispersal={addProductDispersal}
          delProductDispersal={delProductDispersal}
          popupDispersal={popupDispersal}
          maxAccess={maxAccess}
          dispersalStore={dispersalStore}

        />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab}>
        <ProductSchedulesTab
          productMasterValidation={productMasterValidation}
          schedulesGridValidation={schedulesGridValidation}
          schedulesInlineGridColumns={schedulesInlineGridColumns}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel index={5} value={activeTab}>
        <ProductLegTab
          productLegValidation={productLegValidation}
          scheduleRangeGridValidation={scheduleRangeGridValidation}
          scheduleRangeInlineGridColumns={scheduleRangeInlineGridColumns}
          currencyStore={currencyStore.list}
          plantStore={plantStore.list}
          countryStore={countryStore.list}
          dispersalStore={dispersalStore}
          maxAccess={maxAccess}
        />
      </CustomTabPanel> */}
      {/* <CustomTabPanel index={6} value={activeTab}> */}
        {/* <ProductFieldTab
          productFieldGridData={productFieldGridData}
          dispersalStore={dispersalStore}
          maxAccess={maxAccess}
        /> */}
      {/* </CustomTabPanel> */}
      {/* <CustomTabPanel index={7} value={activeTab}>
        <ProductAgentTab
          onDispersalSelection={onDispersalSelection}
          dispersalsGridData={dispersalsGridData}
          agentsHeaderValidation={agentsHeaderValidation}
          agentsGridValidation={agentsGridValidation}
          agentsInlineGridColumns={agentsInlineGridColumns}
          dispersalStore={dispersalStore}
          maxAccess={maxAccess}
        />
      </CustomTabPanel> */}
    </>
  )
}

export default ProductMasterWindow
