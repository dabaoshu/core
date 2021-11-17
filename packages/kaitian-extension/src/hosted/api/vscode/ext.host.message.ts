import type vscode from 'vscode';
import { IRPCProtocol } from '@ide-framework/ide-connection';
import { MAX_MESSAGE_LENGTH } from '@ide-framework/ide-overlay/lib/common';
import { IMainThreadMessage, MainThreadAPIIdentifier, IExtHostMessage } from '../../../common/vscode';
import { MessageType } from '@ide-framework/ide-core-common';

export class ExtHostMessage implements IExtHostMessage {
  private proxy: IMainThreadMessage;

  constructor(rpc: IRPCProtocol) {
    this.proxy = rpc.getProxy(MainThreadAPIIdentifier.MainThreadMessages);
  }

  async showMessage(type: MessageType, rawMessage: string, optionsOrFirstItem?: string | vscode.MessageItem | vscode.MessageOptions | undefined, from?: string, ...rest: (string | vscode.MessageItem)[]): Promise<string | vscode.MessageItem | undefined> {
    let message = rawMessage;
    if (message.length > MAX_MESSAGE_LENGTH) {
      message = `${rawMessage.substr(0, MAX_MESSAGE_LENGTH)}...`;
    }

    const options: vscode.MessageOptions = {};
    const actions: string[] = [];
    const items: (string | vscode.MessageItem)[] = [];
    const pushItem = (item: string | vscode.MessageItem) => {
      items.push(item);
      if (typeof item === 'string') {
        actions.push(item);
      } else {
        actions.push(item.title);
      }
    };

    if (optionsOrFirstItem) {
      if (typeof optionsOrFirstItem === 'string' || 'title' in optionsOrFirstItem) {
        pushItem(optionsOrFirstItem);
      } else {
        if ('modal' in optionsOrFirstItem) {
          options.modal = optionsOrFirstItem.modal;
        }
      }
    }
    for (const item of rest) {
      pushItem(item);
    }
    const actionHandle = await this.proxy.$showMessage(type, message, options, actions, from);
    return actionHandle !== undefined ? items[actionHandle] : undefined;
  }

}
