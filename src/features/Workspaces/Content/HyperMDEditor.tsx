import { useEffect, useRef } from 'react';
import * as CodeMirror from 'codemirror';
import * as HyperMD from 'hypermd';

interface HyperMDEditorProps {
  value: string;
  onChange: (text: string) => void;
}

const HyperMDEditor: React.FC<HyperMDEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cmInstanceRef = useRef<CodeMirror.EditorFromTextArea | null>(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    const cm = HyperMD.fromTextArea(textareaRef.current, {
      lineNumbers: false,
      mode: 'hypermd',
      lineWrapping: true,
    }) as CodeMirror.EditorFromTextArea;

    cm.on('change', () => {
      onChange(cm.getValue());
    });

    cm.setValue(value);
    cmInstanceRef.current = cm;

    return () => {
      cm.toTextArea(); // ✅ now correctly typed
    };
  }, []);

  // 🔁 Update editor when `value` changes from outside (like new file)
  useEffect(() => {
    const cm = cmInstanceRef.current;
    if (!cm) return;

    if (cm.getValue() !== value) {
      const cursor = cm.getCursor();
      cm.setValue(value);
      cm.setCursor(cursor); // keep cursor position
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      defaultValue={value}
      style={{
        visibility: 'hidden', // hide textarea itself
        height: 0,
        padding: 0,
        margin: 0,
        border: 'none',
      }}
    />
  );
};

export default HyperMDEditor;
