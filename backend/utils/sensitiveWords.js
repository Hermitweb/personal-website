/**
 * 敏感词过滤工具
 */

// 默认敏感词列表（可根据需要扩展）
const defaultSensitiveWords = [
  // 政治相关
  '习近平', '江泽民', '胡锦涛', '温家宝', '李克强',
  '法轮功', '六四', '天安门', '台独', '藏独', '疆独',
  '反共', '反党', '推翻政府',
  
  // 色情相关
  '色情', '淫秽', '裸体', '做爱', '性交', '强奸', '乱伦',
  'fuck', 'sex', 'porn', 'nude', 'naked',
  
  // 暴力相关
  '杀人', '自杀', '爆炸', '恐怖', '炸弹', '袭击',
  'kill', 'murder', 'terrorist', 'bomb',
  
  // 赌博相关
  '赌博', '赌钱', '博彩', '六合彩', '私彩',
  'gamble', 'betting', 'casino',
  
  // 毒品相关
  '毒品', '大麻', '海洛因', '冰毒', '摇头丸',
  'drug', 'heroin', 'cocaine', 'marijuana',
  
  // 广告/垃圾信息
  '代开发票', '办证', '刷单', '兼职赚钱', '日赚',
  '免费领取', '点击领取', '加微信', '加QQ',
  
  // 侮辱性词汇
  '傻逼', '操你', '妈的', '王八蛋', '狗日的',
  'sb', 'shit', 'damn', 'bitch'
];

class SensitiveWordFilter {
  constructor(customWords = []) {
    this.words = new Set([...defaultSensitiveWords, ...customWords]);
    this.wordTree = this.buildWordTree();
  }

  /**
   * 构建敏感词树（Trie树）用于高效匹配
   */
  buildWordTree() {
    const tree = {};
    for (const word of this.words) {
      let node = tree;
      for (const char of word.toLowerCase()) {
        if (!node[char]) {
          node[char] = {};
        }
        node = node[char];
      }
      node.isEnd = true;
    }
    return tree;
  }

  /**
   * 添加敏感词
   */
  addWord(word) {
    this.words.add(word.toLowerCase());
    this.wordTree = this.buildWordTree();
  }

  /**
   * 移除敏感词
   */
  removeWord(word) {
    this.words.delete(word.toLowerCase());
    this.wordTree = this.buildWordTree();
  }

  /**
   * 检测文本中是否包含敏感词
   * @param {string} text - 待检测文本
   * @returns {boolean} - 是否包含敏感词
   */
  contains(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    
    for (let i = 0; i < lowerText.length; i++) {
      let node = this.wordTree;
      let j = i;
      
      while (j < lowerText.length && node[lowerText[j]]) {
        node = node[lowerText[j]];
        j++;
        if (node.isEnd) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * 获取文本中的所有敏感词
   * @param {string} text - 待检测文本
   * @returns {string[]} - 敏感词列表
   */
  getWords(text) {
    if (!text) return [];
    const lowerText = text.toLowerCase();
    const found = new Set();
    
    for (let i = 0; i < lowerText.length; i++) {
      let node = this.wordTree;
      let j = i;
      let word = '';
      
      while (j < lowerText.length && node[lowerText[j]]) {
        word += text[j];
        node = node[lowerText[j]];
        j++;
        if (node.isEnd) {
          found.add(word);
        }
      }
    }
    
    return Array.from(found);
  }

  /**
   * 过滤敏感词（替换为指定字符）
   * @param {string} text - 待过滤文本
   * @param {string} replacement - 替换字符，默认 '*'
   * @returns {string} - 过滤后的文本
   */
  filter(text, replacement = '*') {
    if (!text) return text;
    
    let result = text;
    const words = this.getWords(text);
    
    for (const word of words) {
      const regex = new RegExp(word, 'gi');
      const replaced = replacement.repeat(word.length);
      result = result.replace(regex, replaced);
    }
    
    return result;
  }

  /**
   * 验证文本（用于表单验证）
   * @param {string} text - 待验证文本
   * @returns {Object} - { valid: boolean, words: string[], message: string }
   */
  validate(text) {
    if (!text) {
      return { valid: true, words: [], message: null };
    }
    
    const words = this.getWords(text);
    
    if (words.length > 0) {
      return {
        valid: false,
        words,
        message: `内容包含敏感词：${words.join(', ')}`
      };
    }
    
    return { valid: true, words: [], message: null };
  }
}

// 导出单例实例
const sensitiveWordFilter = new SensitiveWordFilter();

module.exports = {
  SensitiveWordFilter,
  sensitiveWordFilter,
  defaultSensitiveWords
};
