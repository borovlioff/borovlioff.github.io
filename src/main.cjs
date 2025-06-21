import { applyThemeStyles, getSavedTheme, saveThemeToLocalStorage } from './theme.cjs';

getSavedTheme();

applyThemeStyles(getSavedTheme());
