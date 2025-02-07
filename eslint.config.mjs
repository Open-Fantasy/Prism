// @ts-check

import eslint from '@eslint/js';
import tselint from 'typescript-eslint';

export default tselint.config(
    {
        ignores: ["**/tests/**", "**/build/**", "eslint.config.mjs"], // Directly ignoring in ESLint
    },    
    eslint.configs.recommended,
    tselint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            }
        },
    }
)