// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import StrategyTab from 'src/pages/strategies/Tabs/StrategyTab'
import CodeTab from 'src/pages/strategies/Tabs/CodeTab'
import PrerequisiteTab from 'src/pages/strategies/Tabs/PrerequisiteTab'
import IndicatorTab from 'src/pages/strategies/Tabs/IndicatorTab'

const StrategyWindow = ({
  onClose,
  onSave,
  onApply,
  strategyValidation,
  width,
  height,
  _labels,
  editMode,
  maxAccess,
  tabs,
  activeTab,
  setActiveTab,
  typeComboStore,
  strategyGroupComboStore,

  //code tab
  codeGridData,
  getCodeGridData,
  addCode,
  delCode,

  //Prerequisite tab (grid)
  prerequisiteGridData,
  getPrerequisiteGridData,
  addPrerequisite,
  delPrerequisite,

  //Indicator tab (grid)
  indicatorGridValidation,
  indicatorInlineGridColumns
}) => {
  return (
    <Window id='StrategyWindow' Title={_labels.strategy} onClose={onClose} width={width} height={height} onSave={onSave} tabs={tabs}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    onApply={onApply} disabledApply={!editMode && true}>
      <CustomTabPanel index={0} value={activeTab}>
        <StrategyTab strategyValidation={strategyValidation} _labels={_labels} maxAccess={maxAccess} editMode={editMode}
        typeComboStore={typeComboStore} strategyGroupComboStore={strategyGroupComboStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
       <CodeTab
          codeGridData={codeGridData}
          getCodeGridData={getCodeGridData}
          addCode={addCode}
          delCode={delCode}
          maxAccess={maxAccess}
          _labels={_labels}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
       <PrerequisiteTab
          prerequisiteGridData={prerequisiteGridData}
          getPrerequisiteGridData={getPrerequisiteGridData}
          addPrerequisite={addPrerequisite}
          delPrerequisite={delPrerequisite}
          maxAccess={maxAccess}
          _labels={_labels}
        />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
       <IndicatorTab
          indicatorGridValidation={indicatorGridValidation}
          indicatorInlineGridColumns={indicatorInlineGridColumns}
          strategyValidation={strategyValidation}
          maxAccess={maxAccess}
          _labels={_labels}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default StrategyWindow
