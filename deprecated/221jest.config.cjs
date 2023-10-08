/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    testRegex: 'tests/.*\\.ts$',
    // preset: 'ts-jest',
    // testEnvironment: 'node',

    // transform: {
    //     '^.+\\.ts?$': [
    //         'ts-jest',
    //         {
    //             useESM: true,
    //         },
    //     ],
    // },
    // extensionsToTreatAsEsm: ['.ts'],

    preset: 'ts-jest/presets/default-esm',
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.ts?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
};
