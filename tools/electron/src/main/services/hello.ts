import { Autowired, Injectable, Injector, INJECTOR_TOKEN } from '@ide-framework/common-di';
import { Domain } from '@ide-framework/ide-core-common';
import { ElectronMainApiProvider, ElectronMainApiRegistry, ElectronMainContribution } from '@ide-framework/ide-core-electron-main/lib/bootstrap/types';
import { IHelloService } from 'common/types';

@Injectable()
export class HelloService extends ElectronMainApiProvider implements IHelloService {

  async hello() {
    console.log('-------------------------- hello service. ---------------------');

    this.eventEmitter.fire('hello-event', {
      content: 'from main process.',
    });
  }

}

@Domain(ElectronMainContribution)
export class HelloContribution implements ElectronMainContribution {

  @Autowired(INJECTOR_TOKEN)
  injector: Injector;

  registerMainApi(registry: ElectronMainApiRegistry) {
    registry.registerMainApi(IHelloService, this.injector.get(IHelloService));
  }

}
