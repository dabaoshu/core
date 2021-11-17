import { createMonacoEditorApi } from './editor';
import { createMonacoLanguageApi } from './languages';

export const monaco = Object.freeze({
  editor: createMonacoEditorApi(),
  languages: createMonacoLanguageApi(),
});

export { URI } from '@ide-framework/monaco-editor-core/esm/vs/base/common/uri';
export { ResourceEdit } from '@ide-framework/monaco-editor-core/esm/vs/editor/browser/services/bulkEditService';
