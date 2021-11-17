import { IRPCProtocol } from '@ide-framework/ide-connection';
import { MainThreadAPIIdentifier, IMainThreadWebview, IExtensionDescription } from '../../../common/vscode';
import { Disposable, Emitter } from '@ide-framework/ide-core-common';
import { IPlainWebviewHandle, IExtHostPlainWebview } from '../../../common/kaitian/webview';
import { join } from '@ide-framework/ide-core-common/lib/path';

export class KaitianExtHostWebview {

  _proxy: IMainThreadWebview;

  private handles: Map<string, PlainWebviewHandle> = new Map();

  private _extHostPlainWebviewId: number = 1;

  constructor(private rpcProtocol: IRPCProtocol, private webviewIdPrefix: string = 'node') {
    this.rpcProtocol = rpcProtocol;
    this._proxy = this.rpcProtocol.getProxy(MainThreadAPIIdentifier.MainThreadWebview);
  }

  getWebviewHandle(id: string): PlainWebviewHandle {
    if (!this.handles.has(id)) {
      this.handles.set(id, new PlainWebviewHandle(id, this._proxy));
      this._proxy.$connectPlainWebview(id);
    }
    return this.handles.get(id)!;
  }

  createPlainWebview(title: string, iconPath?: string): ExtHostPlainWebview {
    const id = this.webviewIdPrefix + '_webview_' + this._extHostPlainWebviewId ++;
    const webview = new ExtHostPlainWebview(id, this._proxy, title, iconPath);
    this.handles.set(id, webview);
    webview.addDispose({
      dispose: () => {
        this.handles.delete(id);
      },
    });
    return webview;
  }

  $acceptMessage(id: string, message: any) {
    if (this.handles.has(id)) {
      this.handles.get(id)!.onMessageEmitter.fire(message);
    }
  }

}

export class PlainWebviewHandle extends Disposable implements IPlainWebviewHandle {

  public readonly onMessageEmitter = new Emitter<any>();

  public readonly onMessage = this.onMessageEmitter.event;

  constructor(protected id: string, protected proxy: IMainThreadWebview) {
    super();
  }

  postMessage(message: any) {
    return this.proxy.$postMessageToPlainWebview(this.id, message);
  }

  async loadUrl(url: string) {
    this.proxy.$plainWebviewLoadUrl(this.id, url);
  }

}

export class ExtHostPlainWebview extends PlainWebviewHandle implements IExtHostPlainWebview {

  private _ready: Promise<void>;

  constructor(id: string, proxy: IMainThreadWebview, title: string, iconPath?: string) {
    super(id, proxy);
    this._ready = this.proxy.$createPlainWebview(id, title, iconPath);
    this.addDispose({
      dispose: () => {
        this.proxy.$disposePlainWebview(id);
      },
    });
  }

  async reveal(groupIndex: number) {
    await this._ready;
    this.proxy.$revealPlainWebview(this.id, groupIndex);
  }

  async loadUrl(url: string) {
    await this._ready;
    this.proxy.$plainWebviewLoadUrl(this.id, url);
  }

}

export function createKaitianWebviewApi(extension: IExtensionDescription, kaitianExtHostWebview: KaitianExtHostWebview) {
  return {
    getPlainWebviewHandle: (id: string) => {
      return kaitianExtHostWebview.getWebviewHandle(id);
    },
    createPlainWebview: (title: string, iconPath?: string) => {
      if (iconPath) {
        iconPath = join(extension.realPath, iconPath);
      }
      return kaitianExtHostWebview.createPlainWebview(title, iconPath);
    },
  };
}
