module.exports = {
    "plugins": [
        "es5"
    ],
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 12
    },
    "ignorePatterns": ["spec/**/*.*", ".*", ".vscode/**/*.*", ""],
    "rules": {
        "quotes": ["error", "single"],
        "complexity": ["error", { "max": 10 }]
    }
};
