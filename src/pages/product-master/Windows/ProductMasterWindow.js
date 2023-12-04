// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ProductMasterTab from 'src/pages/product-master/Tabs/productMasterTab'
import ProductDispersalTab from 'src/pages/product-master/Tabs/productDispersalTab'
import ProductLegTab from 'src/pages/product-master/Tabs/productLegTab'
import ProductFieldTab from 'src/pages/product-master/Tabs/productFieldTab'
import ProductAgentTab from 'src/pages/product-master/Tabs/productAgentTab'
import ProductCurrenciesTab from '../Tabs/productCurrenciesTab'
import ProductCountriesTab from '../Tabs/productCountriesTab'
import ProductSchedulesTab from '../Tabs/productSchedulesTab'

const ProductMasterWindow = ({
  onClose,
  tabs,
  activeTab,
  setActiveTab,
  width,
  height,
  onSave,
  productMasterValidation,
  typeStore,
  functionStore,
  commissionBaseStore,
  interfaceStore,
  languageStore,
  correspondentStore,
  setCorrespondentStore,
  lookupCorrespondent,

  //countries inline edit grid
  countriesGridValidation,
  countriesInlineGridColumns,

  //monetary inline edit grid
  monetariesGridValidation,
  monetariesInlineGridColumns,

  //dispersals tab
  dispersalsGridData,
  getDispersalsGridData,
  addProductDispersal,
  delProductDispersal,
  popupDispersal,

  //schedules tab
  schedulesGridValidation,
  schedulesInlineGridColumns,

  //amount ranges tab
  productLegValidation,

  //productLegsGridValidation,

  //productLegsInlineGridColumns,
  currencyStore,
  plantStore,
  countryStore,
  dispersalStore,
  scheduleRangeGridValidation,
  scheduleRangeInlineGridColumns,

  //product dispersal agents tab
  agentsHeaderValidation,
  agentsGridValidation,
  agentsInlineGridColumns,
  onDispersalSelection,

  productDispersalGridData,
  productLegWindowOpen,
  productLegGridData,
  productLegCommissionGridData,
  setProductLegWindowOpen,
  productFieldGridData,
  productAgentGridData,
  maxAccess
}) => {
  return (
    <Window
      id='ProductMasterWindow'
      Title='Product Master'
      onClose={onClose}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      width={width}
      height={height}
      onSave={onSave}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <ProductMasterTab
          productMasterValidation={productMasterValidation}
          typeStore={typeStore}
          functionStore={functionStore}
          commissionBaseStore={commissionBaseStore}
          interfaceStore={interfaceStore}
          languageStore={languageStore}
          maxAccess={maxAccess}
          correspondentStore={correspondentStore}
          setCorrespondentStore={setCorrespondentStore}
          lookupCorrespondent={lookupCorrespondent}
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
      <CustomTabPanel index={2} value={activeTab}>
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
      </CustomTabPanel>
      <CustomTabPanel index={6} value={activeTab}>
        {/* <ProductFieldTab
          productFieldGridData={productFieldGridData}
          dispersalStore={dispersalStore}
          maxAccess={maxAccess}
        /> */}
      </CustomTabPanel>
      <CustomTabPanel index={7} value={activeTab}>
        <ProductAgentTab
          onDispersalSelection={onDispersalSelection}
          dispersalsGridData={dispersalsGridData.list}
          agentsHeaderValidation={agentsHeaderValidation}
          agentsGridValidation={agentsGridValidation}
          agentsInlineGridColumns={agentsInlineGridColumns}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default ProductMasterWindow
