// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ProductMasterTab from 'src/pages/product-master/Tabs/productMasterTab'
import ProductDispersalTab from 'src/pages/product-master/Tabs/productDispersalTab'
import ProductLegTab from 'src/pages/product-master/Tabs/productLegTab'
import ProductFieldTab from 'src/pages/product-master/Tabs/productFieldTab'
import ProductAgentTab from 'src/pages/product-master/Tabs/productAgentTab'

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
    commissionBaseStore,
    languageStore,
    productDispersalGridData,
    productLegWindowOpen,
    productLegGridData,
    productLegCommissionGridData,
    editProductCommission,
    setProductLegWindowOpen,
    productFieldGridData,
    productAgentGridData,
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
                    commissionBaseStore={commissionBaseStore}
                    languageStore={languageStore}
                />
            </CustomTabPanel>
            <CustomTabPanel index={1} value={activeTab}>
                <ProductDispersalTab productDispersalGridData={productDispersalGridData} />
            </CustomTabPanel>
            <CustomTabPanel index={2} value={activeTab}>
                <ProductLegTab
                    productLegWindowOpen={productLegWindowOpen}
                    productLegGridData={productLegGridData}
                    productLegCommissionGridData={productLegCommissionGridData}
                    editProductCommission={editProductCommission}
                    setProductLegWindowOpen={setProductLegWindowOpen}
                />
            </CustomTabPanel>
            <CustomTabPanel index={3} value={activeTab}>
                <ProductFieldTab productFieldGridData={productFieldGridData} />
            </CustomTabPanel>
            <CustomTabPanel index={4} value={activeTab}>
                <ProductAgentTab productAgentGridData={productAgentGridData} />
            </CustomTabPanel>
        </Window>
    )
}

export default ProductMasterWindow