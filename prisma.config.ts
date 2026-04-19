// prisma.config.ts
import 'dotenv/config'; // ✨ 就是这行！它会立刻加载你的 .env 文件
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // 现在 process.env 就能拿到值了
    url: process.env.DIRECT_URL!,
  },
});