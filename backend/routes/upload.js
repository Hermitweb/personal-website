const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Favicon 目录
const faviconDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

// Favicon 存储配置
const faviconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, faviconDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // 统一保存为 favicon.ico 或 favicon.png
    if (ext === '.ico') {
      cb(null, 'favicon.ico');
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
      cb(null, 'favicon' + ext);
    } else {
      cb(new Error('不支持的文件格式'), false);
    }
  }
});

// 文件过滤器 - 禁止 SVG（XSS 风险）
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('只支持 jpg、png、gif、webp 格式的图片'), false);
  }
};

// Favicon 过滤器
const faviconFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|ico|svg|webp|x-icon/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('只支持 ico、png、jpg、gif、webp 格式的图标'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB 限制
});

const uploadFavicon = multer({
  storage: faviconStorage,
  fileFilter: faviconFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB 限制
});

// 上传图片
router.post('/', [authMiddleware, adminMiddleware, upload.single('image')], (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '请选择要上传的图片' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: '上传成功',
    url: imageUrl,
    filename: req.file.filename
  });
});

// 上传 favicon
router.post('/favicon', [authMiddleware, adminMiddleware, uploadFavicon.single('favicon')], (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '请选择要上传的图标文件' });
  }

  const faviconUrl = `/favicon${path.extname(req.file.originalname).toLowerCase()}`;
  res.json({
    message: 'Favicon 上传成功',
    url: faviconUrl
  });
});

// 删除图片 - 修复路径遍历漏洞
router.delete('/', [authMiddleware, adminMiddleware], (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ message: '请提供文件名' });
  }

  // 使用 path.basename() 清理文件名，防止路径遍历攻击
  const safeFilename = path.basename(filename);
  
  // 验证文件名格式（必须是 image-数字-数字.扩展名 格式）
  const validPattern = /^image-\d+-\d+\.(jpg|jpeg|png|gif|webp)$/i;
  if (!validPattern.test(safeFilename)) {
    return res.status(400).json({ message: '无效的文件名' });
  }

  const filePath = path.join(uploadDir, safeFilename);
  
  // 再次验证文件路径在上传目录内（双重保险）
  const resolvedPath = path.resolve(filePath);
  const resolvedUploadDir = path.resolve(uploadDir);
  if (!resolvedPath.startsWith(resolvedUploadDir)) {
    return res.status(403).json({ message: '禁止访问' });
  }

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: '删除成功' });
  } else {
    res.status(404).json({ message: '文件不存在' });
  }
});

module.exports = router;
