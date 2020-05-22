import { StorageProvider, IStorage,  Event, Emitter, Disposable, URI } from '@ali/ide-core-common';
import { isNullOrUndefined } from 'util';

let mockedStorage: MockedStorage | null = null;

export const MockedStorageProvider: StorageProvider = async (storageId: URI) => {
  if (!mockedStorage) {
    mockedStorage = new MockedStorage();
  }
  return mockedStorage;
};

export class MockedStorage extends Disposable implements IStorage {

  items: Map<string, string> = new Map();

  get size(): number {
    return this.items.size;
  }

  _onDidChangeStorage: Emitter<string> = new Emitter<string>();
  onDidChangeStorage: Event<string> = this._onDidChangeStorage.event;
  whenReady: Promise<any>;

  async init(storageId: string): Promise<void | IStorage> {
    return this;
  }

  get(key: any, fallbackValue?: any) {
    const value = this.items.get(key);
    if (isNullOrUndefined(value)) {
      return fallbackValue;
    }
    return value;
  }

  getBoolean(key: any, fallbackValue?: any) {
    const value = this.items.get(key);
    if (isNullOrUndefined(value)) {
      return fallbackValue;
    }
    return value === 'true';
  }

  getNumber(key: string, fallbackValue: number): number;
  getNumber(key: string, fallbackValue?: number | undefined): number | undefined;
  getNumber(key: any, fallbackValue?: any) {
    const value = this.items.get(key);
    if (isNullOrUndefined(value)) {
      return fallbackValue;
    }
    return parseInt(value, 10);
  }

  async set(key: string, value: string | number | boolean | null | undefined): Promise<void> {
   this.items.set(key, String(value));
   this._onDidChangeStorage.fire(key);
  }

  async delete(key: string): Promise<void> {
    this.items.delete(key);
  }

  async close(): Promise<void> {
    return;
  }

  async reConnectInit(): Promise<void> {
    return;
  }
}
