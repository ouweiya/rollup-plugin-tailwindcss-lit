describe('environment variable tests', () => {
    let originalEnv;

    beforeEach(() => {
        // 保存当前的环境变量，以便在测试之后可以恢复
        originalEnv = process.env.MY_VARIABLE;
    });

    afterEach(() => {
        // 测试之后恢复原始的环境变量
        // process.env.MY_VARIABLE = originalEnv;
    });

    test('should work with MY_VARIABLE set to "testValue"', () => {
        // 设置环境变量为我们想要的值
        process.env.MY_VARIABLE = 'testValue';
    });
});

test('89887', () => {
    // 设置环境变量为我们想要的值
    process.env.MY_VARIABLE;
    console.log('process.env', process.env.MY_VARIABLE);
});
