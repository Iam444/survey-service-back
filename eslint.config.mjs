import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import unicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default defineConfig([
    globalIgnores(['node_modules', 'dist', 'lib', 'test', '**/coverage', '**/migrations']),

    eslint.configs.recommended,
    tseslint.configs.recommended,

    {
        name: 'oty/base',
        files: ['**/*.{js,ts}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: { prettier: prettierPlugin },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
            'comma-dangle': ['error', 'always-multiline'],
            'no-process-exit': 'error',
            'object-shorthand': 'off',
            'no-magic-numbers': [
                'warn',
                {
                    ignore: [-1, 0, 1],
                    ignoreArrayIndexes: true,
                    detectObjects: true,
                },
            ],

            'prettier/prettier': 'error',
        },
    },

    {
        name: 'oty/importX',
        files: ['**/*.{js,ts}'],
        settings: {
            'import-x/resolver-next': [
                createTypeScriptImportResolver({
                    project: './tsconfig.json',
                }),
            ],
        },
        plugins: { 'import-x': importX },
        rules: {
            ...importX.configs.recommended.rules,

            'import-x/no-unresolved': 'off',
        },
    },

    {
        name: 'oty/unicorn',
        files: ['**/*.{js,ts}'],
        plugins: { unicorn },
        rules: {
            ...unicorn.configs.recommended.rules,

            'unicorn/prevent-abbreviations': 'off',
            'unicorn/no-null': 'off',
            'unicorn/no-array-for-each': 'off',
            'unicorn/no-array-reduce': 'off',
            'unicorn/no-thenable': 'off',
            'unicorn/no-array-callback-reference': 'off',
            'unicorn/prefer-ternary': 'off',
            'unicorn/consistent-compound-words': 'warn',
            'unicorn/name-replacements': 'warn',
            'unicorn/consistent-class-member-order': [
                'error',
                {
                    order: [
                        'static-field',
                        'static-block',
                        'static-method',
                        'private-field',
                        'public-field',
                        'constructor',
                        'public-method',
                        'private-method',
                    ],
                },
            ],
        },
    },
    {
        files: ['**/*.orm-entity.{js,ts}'],
        rules: {
            'unicorn/no-top-level-side-effects': 'off',
        },
    },

    {
        name: 'oty/sonarjs',
        files: ['**/*.{js,ts}'],
        ignores: ['**/*.test.{js,ts}', '**/__tests__/**/*'],
        plugins: { sonarjs },
        rules: {
            ...sonarjs.configs.recommended.rules,

            'sonarjs/function-return-type': 'off',
            'sonarjs/argument-type': 'off',
            'sonarjs/cognitive-complexity': 'warn',
        },
    },

    {
        name: 'oty/prettier',
        ...prettierConfig,
    },
]);
