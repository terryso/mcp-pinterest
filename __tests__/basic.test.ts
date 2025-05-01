import { describe, expect, test } from '@jest/globals';

describe('基本测试', () => {
  test('应该通过简单测试', () => {
    expect(1 + 1).toBe(2);
  });
}); 