import { Autowired } from '@ide-framework/common-di';
import { Domain, ComponentContribution, ComponentRegistry, getIcon, CommandContribution, CommandRegistry, ClientAppContribution, Command, URI, CommandService } from '@ide-framework/ide-core-browser';
import { IMetaService } from '../services/meta-service/base';
import { toSCMUri } from '../utils/scm-uri';
import { SampleView, SampleTopView, SampleBottomView, SampleMainView } from './view/sample.view';
import { IStatusBarService } from '@ide-framework/ide-status-bar';
import { StatusBarAlignment, StatusBarEntryAccessor } from '@ide-framework/ide-core-browser/lib/services';
import { IWorkspaceService } from '@ide-framework/ide-workspace';
import { ensureDir } from '@ide-framework/ide-core-common/lib/browser-fs/ensure-dir';
import { IFileServiceClient } from '@ide-framework/ide-file-service';

const TOGGLE_REF: Command = {
  id: 'ide-s.toggleRef',
  label: '切换ref',
};

@Domain(ClientAppContribution, ComponentContribution, CommandContribution)
export class SampleContribution implements ClientAppContribution, ComponentContribution, CommandContribution {

  @Autowired(CommandService)
  private readonly commands: CommandService;

  @Autowired(IMetaService)
  private readonly metaService: IMetaService;

  @Autowired(IStatusBarService)
  statusBarService: IStatusBarService;

  @Autowired(IWorkspaceService)
  workspaceService: IWorkspaceService;

  @Autowired(IFileServiceClient)
  fileServiceClient: IFileServiceClient;

  private accessor: StatusBarEntryAccessor;

  onDidStart() {
    const gitUri = toSCMUri({
      platform: 'git',
      repo: this.metaService.repo!,
      path: '/README.md',
      ref: 'a9b8074f',
    });
    this.commands.executeCommand(
      'vscode.open',
      gitUri.codeUri,
      { preview: false },
    );
    this.accessor = this.statusBarService.addElement('ide-s.toggleRef', {
      text: this.metaService.ref,
      alignment: StatusBarAlignment.LEFT,
      command: TOGGLE_REF.id,
    });
  }

  // 注册视图和token的绑定关系
  registerComponent(registry: ComponentRegistry) {
    registry.register('@ide-framework/ide-dw', [
      {
        id: 'dw-view1',
        component: SampleView,
        name: 'dw手风琴视图1',
      },
      {
        id: 'dw-view2',
        component: SampleView,
        name: 'dw手风琴视图2',
      },
    ], {
      containerId: 'ide-dw',
      title: 'Hello DW',
      priority: 10,
      iconClass: getIcon('explorer'),
    });

    registry.register('@ide-framework/ide-dw-right', [
      {
        id: 'dw-view3',
        component: SampleView,
        name: 'dw手风琴视图3',
      },
      {
        id: 'dw-view4',
        component: SampleView,
        name: 'dw手风琴视图4',
      },
    ], {
      containerId: 'ide-dw-right',
      title: 'HelloDW2',
      priority: 10,
      iconClass: getIcon('debug'),
    });

    registry.register('@ide-framework/ide-mock-top', {
      id: 'fake-top',
      component: SampleTopView,
    });

    registry.register('@ide-framework/ide-mock-bottom', {
      id: 'fake-bottom',
      component: SampleBottomView,
    });

    registry.register('@ide-framework/ide-mock-main', {
      id: 'fake-main',
      component: SampleMainView,
    });
  }

  registerCommands(registry: CommandRegistry) {
    registry.registerCommand({
      id: 'core.get.projectId',
      label: '获取项目ID',
    }, {
      execute: () => this.metaService.projectId,
    });

    registry.registerCommand(TOGGLE_REF, {
      execute: async () => {
        const newRef = 'master';
        const newWorkspaceDir = `/${newRef}/${this.metaService.repo}`;
        await ensureDir(newWorkspaceDir);
        const newStat = await this.fileServiceClient.getFileStat(URI.file(newWorkspaceDir).toString());
        await this.workspaceService.setWorkspace(newStat);
        this.accessor.update({
          text: newRef,
          alignment: StatusBarAlignment.LEFT,
        });
      },
    });
  }
}
