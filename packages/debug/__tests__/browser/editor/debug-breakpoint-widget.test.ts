import { IWorkspaceService } from '@ide-framework/ide-workspace';
import type { Position } from '@ide-framework/monaco-editor-core/esm/vs/editor/editor.api';
import { Disposable, IFileServiceClient } from '@ide-framework/ide-core-browser';
import { createBrowserInjector } from '@ide-framework/ide-dev-tool/src/injector-helper';
import { DebugBreakpointWidget } from '@ide-framework/ide-debug/lib/browser/editor';
import { DebugEditor, IDebugSessionManager } from '@ide-framework/ide-debug';
import { IContextKeyService } from '@ide-framework/ide-core-browser';
import { IEditorDocumentModelService } from '@ide-framework/ide-editor/lib/browser';

describe('Debug Breakpoint Widget', () => {
  const mockInjector = createBrowserInjector([]);
  let debugBreakpointWidget: DebugBreakpointWidget;

  const mockDebugEditor = {
    onDidLayoutChange: jest.fn(() => Disposable.create(() => {})),
    getLayoutInfo: jest.fn(() => ({width: 100, height: 100})),
    changeViewZones: jest.fn(() => Disposable.create(() => {})),
  };

  beforeAll(() => {
    mockInjector.overrideProviders({
      token: DebugEditor,
      useValue: mockDebugEditor,
    });
    mockInjector.overrideProviders({
      token: IWorkspaceService,
      useValue: {},
    });
    mockInjector.overrideProviders({
      token: IDebugSessionManager,
      useValue: {},
    });
    mockInjector.overrideProviders({
      token: IContextKeyService,
      useValue: {
        createKey: jest.fn(),
      },
    });
    mockInjector.overrideProviders({
      token: IEditorDocumentModelService,
      useValue: {},
    });
    mockInjector.overrideProviders({
      token: IFileServiceClient,
      useValue: {},
    });
    debugBreakpointWidget = mockInjector.get(DebugBreakpointWidget);
  });

  it('should have enough API', () => {
    expect(debugBreakpointWidget.position).toBeUndefined();
    expect(debugBreakpointWidget.values).toBeUndefined();
    expect(typeof debugBreakpointWidget.show).toBe('function');
    expect(typeof debugBreakpointWidget.hide).toBe('function');
  });

  it('show method should be work', () => {
    const position = {lineNumber: 1, column: 2} as Position;
    debugBreakpointWidget.show(position);
    expect(mockDebugEditor.onDidLayoutChange).toBeCalledTimes(1);
    expect(mockDebugEditor.getLayoutInfo).toBeCalledTimes(1);
    expect(mockDebugEditor.changeViewZones).toBeCalledTimes(1);

    expect(debugBreakpointWidget.position).toBe(position);
  });

  it('hide method should be work', (done) => {
    debugBreakpointWidget.hide();
    done();
  });
});
