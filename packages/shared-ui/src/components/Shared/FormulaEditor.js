import { useRef, useEffect } from 'react';
import 'mathlive';
import { cleanFormula } from '@argus/shared-utils/src/utils/ValidateFormula';
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

export default function FormulaEditor({
  name,
  value,
  onChange,
  onBlur,
  variables = [],
  error,
  touched
}) {
  const mathRef = useRef(null);

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
    let val = mathRef.current.value;

    val = cleanFormula(val);

    onChange(name, val);

    if (onBlur) onBlur(name, true);
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

    <div>
      <math-field
        ref={mathRef}
        onInput={handleInput}
        onBlur={handleBlur}
        smart-fence="false" 
        smart-mode="false"
        style={{
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
        <strong>Variables:</strong>
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {variables.map(v => (
            <CustomButton
              key={v.key}
              label={v.key}
              onClick={() => insert(v.key)}
            >
              {v.label}
            </CustomButton>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Operators:</strong>
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