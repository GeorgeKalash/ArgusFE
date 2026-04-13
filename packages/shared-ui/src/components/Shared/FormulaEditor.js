import { useRef, useEffect, useContext } from 'react';
import 'mathlive';
import { cleanFormula } from '@argus/shared-utils/src/utils/ValidateFormula';
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { validateFormula } from '@argus/shared-utils/src/utils/ValidateFormula'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext';

export default function FormulaEditor({
  name,
  value,
  onChange,
  onBlur,
  variables = [],
  constants = [],
  error,
  touched
}) {
  const mathRef = useRef(null);
  const { platformLabels } = useContext(ControlContext)
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (mathRef.current && value !== mathRef.current.getValue('ascii-math')) {
      mathRef.current.setValue(value || '');
    }
  }, [value]);

  const handleBlur = () => {
    if (onBlur) 
      onBlur(name, true);
  };

  const handleInput = () => {
    let val = mathRef.current.getValue();
    val = cleanFormula(val);

    onChange(name, val);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      validateFormula(val, variables, constants);
    }, 300);
  };

  const insert = (text) => {
    mathRef.current.insert(text);
    mathRef.current.focus();
    handleInput();
  };

  const isInvalid = touched && !!error;

  return (
    <>
      <style>
      {`
        math-field::part(menu-toggle) {
          display: none !important;
        }

        math-field::part(virtual-keyboard-toggle) {
          display: none !important;
        }
      `}
    </style>

    <div style={{ width: '100%' }}>
      <math-field
        ref={mathRef}
        onInput={handleInput}
        onBlur={handleBlur}
        smart-fence="false" 
        smart-mode="false"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: isInvalid ? '1px solid red' : '1px solid #000000',
          borderRadius: 8,
          padding: 12,
          minHeight: 60,
          display: 'block',
          fontFamily: 'monospace'
        }}
      />

      {isInvalid && (
        <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <strong>{platformLabels.Variables}:</strong>
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {variables.map(v => (
            <CustomButton
              key={v}
              label={v}
              onClick={() => insert(v)}
            >
              {v.label}
            </CustomButton>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>{platformLabels.Constants}:</strong>
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {constants.map(v => (
            <CustomButton
              key={v.value}
              label={v.reference}
              onClick={() => insert(v.reference)}
            >
              {v.label}
            </CustomButton>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>{platformLabels.Operators}:</strong>
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {['+', '-', '*', '/', '(', ')'].map(op => (
            <CustomButton
              key={op}
              label={op}
              onClick={() => insert(op)}
            >
              {op}
            </CustomButton>
          ))}
        </div>
      </div>

    </div>
     </>
  );
}