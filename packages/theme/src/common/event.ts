import { BasicEvent } from '@ide-framework/ide-core-common';
import { ITheme } from './theme.service';

export class ThemeChangedEvent extends BasicEvent<IThemeChangedEventPayload> { }

export interface IThemeChangedEventPayload {
  theme: ITheme;
}
