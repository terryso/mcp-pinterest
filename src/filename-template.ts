/**
 * 文件名模板处理模块
 * 负责解析和应用自定义文件名模板
 */
import path from 'node:path';

// 支持的模板变量列表
const SUPPORTED_VARIABLES = ['imageId', 'fileExtension', 'timestamp', 'index'];

// 默认文件名模板
export const DEFAULT_FILENAME_TEMPLATE = 'pinterest_{imageId}.{fileExtension}';

/**
 * 验证文件名模板的有效性
 * @param template 文件名模板字符串
 * @returns 验证结果对象 {isValid: boolean, error?: string}
 */
export function validateTemplate(template: string): { isValid: boolean; error?: string } {
  if (!template || typeof template !== 'string') {
    return { isValid: false, error: '模板不能为空' };
  }

  // 检查括号是否匹配
  const openBrackets = (template.match(/\{/g) || []).length;
  const closeBrackets = (template.match(/\}/g) || []).length;
  if (openBrackets !== closeBrackets) {
    return { isValid: false, error: '模板中的括号不匹配' };
  }

  // 提取模板中的变量
  const variables = extractVariables(template);
  
  // 验证变量是否被支持
  for (const variable of variables) {
    if (!SUPPORTED_VARIABLES.includes(variable.toLowerCase())) {
      return { 
        isValid: false, 
        error: `不支持的变量: ${variable}。支持的变量有: ${SUPPORTED_VARIABLES.join(', ')}` 
      };
    }
  }

  return { isValid: true };
}

/**
 * 从模板中提取变量名
 * @param template 文件名模板字符串
 * @returns 变量名数组
 */
function extractVariables(template: string): string[] {
  const regex = /\{([^{}]+)\}/g;
  const variables: string[] = [];
  let match: RegExpExecArray | null = null;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1]);
  }

  return variables;
}

/**
 * 清理文件名，移除或替换非法字符
 * @param fileName 原始文件名
 * @returns 清理后的文件名
 */
export function sanitizeFileName(fileName: string): string {
  // 替换Windows和Unix系统中非法的文件名字符
  return fileName
    .replace(/[/\\:*?"<>|]/g, '_') // 替换常见非法字符为下划线
    .replace(/\s+/g, '_')          // 替换空格为下划线
    .replace(/_{2,}/g, '_')        // 将多个连续下划线替换为单个下划线
    .trim();
}

/**
 * 生成基于模板的文件名
 * @param template 文件名模板字符串
 * @param variables 变量值对象
 * @returns 生成的文件名
 */
export function generateFileName(
  template: string, 
  variables: { 
    imageId: string, 
    fileExtension: string, 
    timestamp?: string, 
    index?: number 
  }
): string {
  // 使用当前时间生成时间戳（如果需要）
  if (template.includes('{timestamp}') && !variables.timestamp) {
    const now = new Date();
    variables.timestamp = [
      now.getUTCFullYear(),
      String(now.getUTCMonth() + 1).padStart(2, '0'),
      String(now.getUTCDate()).padStart(2, '0'),
      String(now.getUTCHours()).padStart(2, '0'),
      String(now.getUTCMinutes()).padStart(2, '0'),
      String(now.getUTCSeconds()).padStart(2, '0')
    ].join('');
  }

  // 替换模板中的变量
  let fileName = template;
  for (const [key, value] of Object.entries(variables)) {
    // 使用不区分大小写的替换
    const regex = new RegExp(`\\{${key}\\}`, 'i');
    fileName = fileName.replace(regex, String(value));
  }

  // 清理文件名
  return sanitizeFileName(fileName);
} 