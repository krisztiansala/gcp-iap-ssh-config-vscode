import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [{
    files: ["**/*.ts"],
}, {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        "@typescript-eslint/naming-convention": ["warn", 
            {
                "selector": "variable",
                "format": ["camelCase", "PascalCase", "UPPER_CASE"]
            },
            {
                "selector": "function",
                "format": ["camelCase", "PascalCase"]
            },
            {
                "selector": "typeLike",
                "format": ["PascalCase"]
            }
        ],
        curly: "warn",
        eqeqeq: "warn",
        "no-throw-literal": "warn",
        semi: "warn",
    },
}];