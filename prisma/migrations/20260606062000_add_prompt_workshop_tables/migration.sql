-- AI 生图提示词工坊：分类表
CREATE TABLE "PromptCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PromptCategory_pkey" PRIMARY KEY ("id")
);

-- AI 生图提示词工坊：提示词卡片表
CREATE TABLE "PromptCard" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "modelTarget" TEXT NOT NULL DEFAULT 'AI 通用',
  "previewImage" TEXT,
  "previewImagePath" TEXT,
  "previewGradient" TEXT,
  "prompt" TEXT NOT NULL,
  "promptSummary" TEXT NOT NULL,
  "useCase" TEXT NOT NULL,
  "tips" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PromptCard_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromptCategory_name_key" ON "PromptCategory"("name");
CREATE UNIQUE INDEX "PromptCategory_slug_key" ON "PromptCategory"("slug");
CREATE INDEX "PromptCard_categoryId_idx" ON "PromptCard"("categoryId");
CREATE INDEX "PromptCard_isActive_sortOrder_idx" ON "PromptCard"("isActive", "sortOrder");
CREATE INDEX "PromptCard_createdAt_idx" ON "PromptCard"("createdAt");

ALTER TABLE "PromptCard"
  ADD CONSTRAINT "PromptCard_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "PromptCategory"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "PromptCategory" ("id", "name", "slug", "sortOrder", "updatedAt") VALUES
  ('prompt-category-product-poster', '产品海报', 'product-poster', 0, CURRENT_TIMESTAMP),
  ('prompt-category-real-photo', '真实摄影', 'real-photo', 1, CURRENT_TIMESTAMP),
  ('prompt-category-cinematic-scene', '电影场景', 'cinematic-scene', 2, CURRENT_TIMESTAMP),
  ('prompt-category-ui-icon', 'UI 图标', 'ui-icon', 3, CURRENT_TIMESTAMP),
  ('prompt-category-website-visual', '网站视觉', 'website-visual', 4, CURRENT_TIMESTAMP),
  ('prompt-category-oriental-aesthetic', '东方美学', 'oriental-aesthetic', 5, CURRENT_TIMESTAMP);

INSERT INTO "PromptCard" (
  "id",
  "title",
  "description",
  "categoryId",
  "tags",
  "modelTarget",
  "previewGradient",
  "prompt",
  "promptSummary",
  "useCase",
  "tips",
  "sortOrder",
  "updatedAt"
) VALUES
  (
    'apple-product-poster',
    'Apple 风格产品海报',
    '适合表现一件硬件产品的精密、冷静和高级材质。',
    'prompt-category-product-poster',
    ARRAY['product', 'studio light', 'minimal']::TEXT[],
    'AI 通用',
    'radial-gradient(circle at 28% 18%, rgba(190,238,255,0.40), transparent 28%), radial-gradient(circle at 74% 70%, rgba(78,161,255,0.22), transparent 30%), linear-gradient(145deg, #111827 0%, #05070d 50%, #0f172a 100%)',
    'A premium Apple-style product poster featuring a single futuristic device floating in a dark studio, brushed aluminum and soft glass materials, precise rim lighting, subtle reflection on a black acrylic surface, minimal composition, generous negative space, clean product photography, high-end commercial lighting, ultra detailed, realistic materials, no text, no logo.',
    '深色产品棚拍，单一主体，冷调金属质感，克制高光。',
    '适合产品概念图、硬件海报、设备发布视觉和展示页首屏素材。',
    ARRAY['主体保持单一，材质词越具体越稳。', '如果要加入文字，建议后期排版，不要让模型直接生成。']::TEXT[],
    0,
    CURRENT_TIMESTAMP
  ),
  (
    'real-portrait',
    '真实摄影人像',
    '以自然光和真实肤色为核心，避免过度修饰的人像模板。',
    'prompt-category-real-photo',
    ARRAY['portrait', 'natural light', 'editorial']::TEXT[],
    'AI 通用',
    'radial-gradient(circle at 45% 22%, rgba(255,229,205,0.34), transparent 24%), radial-gradient(circle at 62% 76%, rgba(120,168,255,0.18), transparent 28%), linear-gradient(145deg, #171717 0%, #0b0f16 54%, #18202b 100%)',
    'A realistic editorial portrait of a young creative professional near a large window, soft natural morning light, honest skin texture, calm expression, shallow depth of field, 85mm lens look, muted wardrobe, clean architectural background, cinematic but natural color grading, high-resolution photography, no artificial plastic skin, no beauty filter, no text.',
    '真实人像摄影，自然光，浅景深，干净背景。',
    '适合个人品牌头像、采访配图、人物专题封面和真实感内容视觉。',
    ARRAY['保留 honest skin texture 能减少蜡像感。', '指定镜头和光线比堆叠风格词更有效。']::TEXT[],
    1,
    CURRENT_TIMESTAMP
  ),
  (
    'cinematic-city-street',
    '电影感城市街景',
    '用于生成有叙事感的街头环境，强调湿润路面和城市灯光。',
    'prompt-category-cinematic-scene',
    ARRAY['cinematic', 'city', 'night']::TEXT[],
    'AI 通用',
    'radial-gradient(circle at 24% 34%, rgba(34,211,238,0.26), transparent 26%), radial-gradient(circle at 78% 30%, rgba(250,204,21,0.18), transparent 21%), linear-gradient(150deg, #03111c 0%, #09090b 42%, #1f2937 100%)',
    'A cinematic rainy city street at night, wet asphalt reflecting soft neon signs, a lone figure walking under a transparent umbrella, steam rising from a subway grate, deep shadows, teal and warm sodium light balance, anamorphic lens feeling, grounded realistic detail, atmospheric but readable composition, film still quality, no text, no signage gibberish.',
    '雨后城市夜景，电影镜头，霓虹倒影，人物剪影。',
    '适合故事封面、短片概念图、城市氛围图和剧情视觉参考。',
    ARRAY['加入 no signage gibberish 可减少乱码招牌。', '冷暖光同时出现时要明确主次，不要让画面变脏。']::TEXT[],
    2,
    CURRENT_TIMESTAMP
  ),
  (
    'liquid-glass-icon',
    'Liquid Glass UI 图标',
    '生成适合 App 图标、功能入口和工具封面的玻璃感图标。',
    'prompt-category-ui-icon',
    ARRAY['icon', 'glass', 'interface']::TEXT[],
    'AI 通用',
    'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.42), transparent 18%), radial-gradient(circle at 68% 72%, rgba(56,189,248,0.26), transparent 26%), linear-gradient(145deg, #07111f 0%, #020617 58%, #111827 100%)',
    'A single premium Liquid Glass inspired app icon on a deep charcoal background, translucent rounded-square glass body, subtle refraction, thin inner highlight, soft cyan edge light, one clear symbolic shape in the center, Apple-like material depth, crisp edges, minimal noise, no text, no logo, no extra objects, high-resolution icon render.',
    '玻璃拟态图标，清晰轮廓，深色背景，微折射。',
    '适合工具模块入口、App 图标概念、功能卡片封面和 UI 资产灵感。',
    ARRAY['只描述一个符号，避免图标里塞太多物体。', '保持 no text，图标文字交给界面排版。']::TEXT[],
    3,
    CURRENT_TIMESTAMP
  ),
  (
    'tech-website-hero',
    '科技感网站 Hero 图',
    '适合做深色网站首屏背景，强调空间、光层和高级留白。',
    'prompt-category-website-visual',
    ARRAY['hero', 'website', 'spatial']::TEXT[],
    'AI 通用',
    'radial-gradient(circle at 18% 24%, rgba(125,211,252,0.26), transparent 24%), radial-gradient(circle at 72% 34%, rgba(148,163,184,0.18), transparent 20%), linear-gradient(135deg, #020617 0%, #0b1120 48%, #111827 100%)',
    'A refined dark technology website hero background, abstract spatial interface layers made of glass planes and thin luminous lines, subtle depth, controlled cyan highlights, large empty area on the left for headline placement, premium product launch mood, soft volumetric light, clean composition, no text, no dashboard UI, no fake charts.',
    '抽象科技空间，深色首屏，柔光层，预留排版区域。',
    '适合 AI 工具、开发者产品、技术博客、项目首页和首屏背景。',
    ARRAY['明确留白方向，方便后续放标题。', '用 no dashboard UI 避免模型生成假后台截图。']::TEXT[],
    4,
    CURRENT_TIMESTAMP
  ),
  (
    'oriental-aesthetic-scene',
    '国风东方美学场景',
    '保留东方气韵，但避免廉价古风和过饱和红金配色。',
    'prompt-category-oriental-aesthetic',
    ARRAY['oriental', 'mist', 'poetic']::TEXT[],
    'AI 通用',
    'radial-gradient(circle at 66% 20%, rgba(226,232,240,0.30), transparent 24%), radial-gradient(circle at 28% 70%, rgba(74,222,128,0.14), transparent 26%), linear-gradient(145deg, #0c1210 0%, #111827 48%, #1f2933 100%)',
    'A refined modern oriental landscape scene, mist drifting through dark pine silhouettes, a quiet stone path beside still water, restrained ink-wash atmosphere, soft moonlight, deep green and graphite color palette, cinematic photography composition, elegant negative space, subtle texture, no red lanterns, no gold decorations, no text.',
    '水墨式空间，雾气，克制色彩，现代摄影构图。',
    '适合东方美学海报、文化专题、视觉背景和氛围概念图。',
    ARRAY['明确 no red lanterns 和 no gold decorations 可以避开俗套。', '使用 graphite、deep green 能更现代。']::TEXT[],
    5,
    CURRENT_TIMESTAMP
  ),
  (
    'minimal-premium-poster',
    '极简高级海报',
    '用克制构图和单一形体建立海报气质，适合留给后期排版。',
    'prompt-category-product-poster',
    ARRAY['poster', 'minimal', 'gallery']::TEXT[],
    'AI 通用',
    'radial-gradient(circle at 50% 36%, rgba(226,232,240,0.26), transparent 22%), linear-gradient(160deg, #111111 0%, #050505 56%, #18181b 100%)',
    'A minimal premium poster image with one abstract sculptural object centered slightly above the middle, matte black and frosted silver materials, gallery lighting, quiet shadow, large negative space, refined monochrome palette, precise composition, museum-grade still life photography, no text, no frame, no extra props.',
    '单一抽象物体，画廊感布光，大面积留白。',
    '适合品牌视觉、封面底图、活动海报和后期文字排版背景。',
    ARRAY['不要让模型生成文字，海报文字后期添加更可靠。', '单一物体比复杂场景更高级。']::TEXT[],
    6,
    CURRENT_TIMESTAMP
  ),
  (
    'future-device-concept',
    '未来感设备概念图',
    '用于表现一个尚未存在的设备概念，重点是可信结构和材质。',
    'prompt-category-product-poster',
    ARRAY['concept', 'device', 'industrial']::TEXT[],
    'AI 通用',
    'radial-gradient(circle at 22% 26%, rgba(14,165,233,0.22), transparent 24%), radial-gradient(circle at 75% 72%, rgba(203,213,225,0.20), transparent 22%), linear-gradient(145deg, #05070d 0%, #111827 50%, #020617 100%)',
    'A futuristic wearable device concept render, believable industrial design, layered glass and titanium body, visible precision seams, soft internal glow, photographed on a dark matte surface, controlled studio lighting, clean engineering aesthetics, realistic scale, premium hardware concept art, no text, no logo, no impossible shapes.',
    '工业设计概念图，可信结构，玻璃与金属，冷静棚拍。',
    '适合产品脑暴、硬件概念、设计提案和技术演示封面。',
    ARRAY['believable industrial design 能提升真实可信度。', 'no impossible shapes 可以减少结构不合理。']::TEXT[],
    7,
    CURRENT_TIMESTAMP
  );
