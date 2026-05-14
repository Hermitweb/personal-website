const db = require('./models');

async function migrate() {
  try {
    console.log('开始迁移...');
    
    // 使用原始 SQL 修改字段类型
    await db.sequelize.query(`
      ALTER TABLE contents 
      MODIFY COLUMN type VARCHAR(50) NOT NULL DEFAULT 'custom'
    `);
    
    console.log('✅ 类型字段修改成功');
    
    // 验证
    const contents = await db.Content.findAll({ limit: 5 });
    console.log('当前内容:', contents.map(c => ({ id: c.id, type: c.type, title: c.title })));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  }
}

migrate();
