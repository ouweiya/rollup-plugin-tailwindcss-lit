import { add, subtract } from '../src/math';

test('add returns the sum of two numbers', () => {
    expect(add(1, 2)).toBe(3);
});

test('subtract returns the difference of two numbers', () => {
    expect(subtract(3, 1)).toBe(2);
});
