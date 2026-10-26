import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface Props {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const MemoEditor: React.FC<Props> = ({ value, disabled, onChange }) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      disabled={disabled}
      onChange={(_, editor) => onChange(editor.getData())}
      onReady={(editor) => {
        const editableElement = editor.ui.view.editable?.element;
        if (editableElement) {
          editableElement.style.height = '300px';
        }
      }}
    />
  );
};

// ⚡ Penting! Agar CKEditor tidak re-render saat parent re-render
export default React.memo(MemoEditor);
