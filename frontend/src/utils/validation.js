/**
 * 表单验证工具函数
 */

// 验证规则
export const validators = {
  // 必填
  required: (value, message = '此字段不能为空') => {
    if (value === undefined || value === null || value === '') {
      return { valid: false, message };
    }
    if (typeof value === 'string' && value.trim() === '') {
      return { valid: false, message };
    }
    return { valid: true, message: null };
  },

  // 邮箱
  email: (value, message = '请输入有效的邮箱地址') => {
    if (!value) return { valid: true, message: null };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, message };
    }
    return { valid: true, message: null };
  },

  // 手机号（中国）
  phone: (value, message = '请输入有效的手机号码') => {
    if (!value) return { valid: true, message: null };
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      return { valid: false, message };
    }
    return { valid: true, message: null };
  },

  // 最小长度
  minLength: (value, min, message) => {
    if (!value) return { valid: true, message: null };
    const msg = message || `长度不能少于 ${min} 个字符`;
    if (value.length < min) {
      return { valid: false, message: msg };
    }
    return { valid: true, message: null };
  },

  // 最大长度
  maxLength: (value, max, message) => {
    if (!value) return { valid: true, message: null };
    const msg = message || `长度不能超过 ${max} 个字符`;
    if (value.length > max) {
      return { valid: false, message: msg };
    }
    return { valid: true, message: null };
  },

  // 密码强度
  password: (value, options = {}) => {
    if (!value) return { valid: true, message: null };
    const {
      minLength = 6,
      requireUppercase = false,
      requireLowercase = false,
      requireNumber = false,
      requireSpecial = false
    } = options;

    if (value.length < minLength) {
      return { valid: false, message: `密码长度不能少于 ${minLength} 个字符` };
    }
    if (requireUppercase && !/[A-Z]/.test(value)) {
      return { valid: false, message: '密码必须包含大写字母' };
    }
    if (requireLowercase && !/[a-z]/.test(value)) {
      return { valid: false, message: '密码必须包含小写字母' };
    }
    if (requireNumber && !/\d/.test(value)) {
      return { valid: false, message: '密码必须包含数字' };
    }
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return { valid: false, message: '密码必须包含特殊字符' };
    }
    return { valid: true, message: null };
  },

  // URL
  url: (value, message = '请输入有效的URL') => {
    if (!value) return { valid: true, message: null };
    try {
      new URL(value);
      return { valid: true, message: null };
    } catch {
      return { valid: false, message };
    }
  },

  // 数字范围
  range: (value, min, max, message) => {
    if (!value && value !== 0) return { valid: true, message: null };
    const num = Number(value);
    const msg = message || `数值必须在 ${min} 到 ${max} 之间`;
    if (isNaN(num) || num < min || num > max) {
      return { valid: false, message: msg };
    }
    return { valid: true, message: null };
  },

  // 正则匹配
  pattern: (value, regex, message = '格式不正确') => {
    if (!value) return { valid: true, message: null };
    if (!regex.test(value)) {
      return { valid: false, message };
    }
    return { valid: true, message: null };
  },

  // 确认密码
  confirmPassword: (value, confirmValue, message = '两次输入的密码不一致') => {
    if (value !== confirmValue) {
      return { valid: false, message };
    }
    return { valid: true, message: null };
  }
};

/**
 * 验证表单
 * @param {Object} values - 表单值
 * @param {Object} rules - 验证规则
 * @returns {Object} - { valid: boolean, errors: Object }
 * 
 * @example
 * const result = validateForm(
 *   { email: 'test@example.com', password: '123456' },
 *   {
 *     email: [validators.required, validators.email],
 *     password: [validators.required, (v) => validators.password(v, { minLength: 8 })]
 *   }
 * );
 */
export const validateForm = (values, rules) => {
  const errors = {};
  let valid = true;

  for (const field in rules) {
    const fieldRules = rules[field];
    const value = values[field];

    for (const rule of fieldRules) {
      let result;
      if (Array.isArray(rule)) {
        // 如果规则是数组，第一个是验证函数，后面是参数
        const [validatorFn, ...args] = rule;
        result = validatorFn(value, ...args);
      } else {
        result = rule(value);
      }

      if (!result.valid) {
        errors[field] = result.message;
        valid = false;
        break; // 一个字段只显示一个错误
      }
    }
  }

  return { valid, errors };
};

/**
 * 获取密码强度等级
 * @param {string} password - 密码
 * @returns {number} - 0-4 强度等级
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  return Math.min(strength, 4);
};

/**
 * 获取密码强度文本
 * @param {number} strength - 强度等级
 * @returns {string}
 */
export const getPasswordStrengthText = (strength) => {
  const texts = ['', '弱', '较弱', '中等', '强', '非常强'];
  return texts[strength] || '';
};

/**
 * 获取密码强度颜色
 * @param {number} strength - 强度等级
 * @returns {string}
 */
export const getPasswordStrengthColor = (strength) => {
  const colors = ['', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'];
  return colors[strength] || '';
};
