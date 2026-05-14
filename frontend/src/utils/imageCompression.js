import imageCompression from 'browser-image-compression';

/**
 * 压缩图片
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<File>} - 压缩后的图片文件
 */
export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1,           // 最大文件大小 1MB
    maxWidthOrHeight: 1920, // 最大宽高 1920px
    useWebWorker: true,     // 使用 Web Worker 提高性能
    fileType: file.type,    // 保持原文件类型
    ...options
  };

  // 只压缩图片类型
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // 如果文件已经小于目标大小，不压缩
  if (file.size / 1024 / 1024 < defaultOptions.maxSizeMB) {
    return file;
  }

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    console.log(`图片压缩: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    return compressedFile;
  } catch (error) {
    console.error('图片压缩失败:', error);
    return file; // 压缩失败返回原文件
  }
};

/**
 * 获取图片预览URL
 * @param {File} file - 图片文件
 * @returns {Promise<string>} - base64 预览URL
 */
export const getImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 验证图片文件
 * @param {File} file - 图片文件
 * @param {Object} options - 验证选项
 * @returns {Object} - 验证结果 { valid: boolean, error: string }
 */
export const validateImage = (file, options = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `不支持的图片格式，仅支持: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}` };
  }

  if (file.size / 1024 / 1024 > maxSizeMB) {
    return { valid: false, error: `图片大小不能超过 ${maxSizeMB}MB` };
  }

  return { valid: true, error: null };
};
