import { Injectable, Autowired } from '@ide-framework/common-di';
import { ILogger } from '@ide-framework/ide-core-browser/lib/logger';
import { ISemanticTokenRegistry } from '@ide-framework/ide-theme/lib/common/semantic-tokens-registry';
import { VSCodeContributePoint, Contributes, SemanticTokenTypeSchema, validateTypeOrModifier } from '../../../common';

@Injectable()
@Contributes('semanticTokenTypes')
export class SemanticTokenTypesContributionPoint extends VSCodeContributePoint<SemanticTokenTypeSchema> {

  @Autowired(ILogger)
  protected readonly logger: ILogger;

  @Autowired(ISemanticTokenRegistry)
  protected readonly semanticTokenRegistry: ISemanticTokenRegistry;

  contribute() {
    if (!Array.isArray(this.json)) {
      this.logger.warn("'configuration.semanticTokenTypes' must be an array");
      return;
    }

    for (const contrib of this.json) {
      if (validateTypeOrModifier(contrib, 'semanticTokenType', this.logger)) {
        this.semanticTokenRegistry.registerTokenType(contrib.id, contrib.description, contrib.superType);
      }
    }
  }

}
