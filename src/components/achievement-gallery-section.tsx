"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import GlitchText from "./GlitchText";

// 动态导入避免 SSR 问题
const LaserFlow = dynamic(() => import("./LaserFlow"), { ssr: false });
const CircularGallery = dynamic(() => import("./CircularGallery"), { ssr: false });

// 与其他弹窗一致的 spring 配置
const uiSpring = { type: "spring" as const, stiffness: 350, damping: 25 };

interface GalleryImage {
  id: string;
  image: string;
  text: string;
}

interface AchievementGallerySectionProps {
  className?: string;
  isCaptain?: boolean;
  isAdmin?: boolean;
}

export function AchievementGallerySection({ 
  className = "", 
  isCaptain = false, 
  isAdmin = false 
}: AchievementGallerySectionProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newImageText, setNewImageText] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalView, setModalView] = useState<'add' | 'manage'>('add'); // 弹窗视图切换

  const canManage = isCaptain || isAdmin;

  useEffect(() => { setIsMounted(true) }, []);

  // TODO: 从数据库加载图片
  // useEffect(() => {
  //   fetchGalleryImages().then(setImages);
  // }, []);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    
    // 检查文件大小（限制10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      return;
    }
    
    setSelectedFile(file);
    
    // 生成预览
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = async () => {
    if (!previewImage) return;
    setIsUploading(true);
    try {
      // TODO: 上传到 Vercel Blob 或其他存储服务
      // const blob = await upload(selectedFile.name, selectedFile, { access: 'public' });
      // const imageUrl = blob.url;
      
      // 目前使用 base64 预览（实际部署时应替换为上传后的URL）
      const newImage: GalleryImage = {
        id: Date.now().toString(),
        image: previewImage,
        text: newImageText || "成果展示"
      };
      setImages(prev => [...prev, newImage]);
      setNewImageText("");
      setPreviewImage(null);
      setSelectedFile(null);
      // 重置文件输入
      const fileInput = document.getElementById('gallery-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      // TODO: 保存到数据库
      // await saveGalleryImage(newImage);
    } catch (error) {
      console.error("添加图片失败:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearPreview = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    const fileInput = document.getElementById('gallery-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteImage = async (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    // TODO: 从数据库删除
    // await deleteGalleryImage(id);
  };

  // 空状态 UI
  const EmptyStateUI = () => (
    <div className="w-full h-full min-h-[350px] sm:min-h-[420px] flex flex-col items-center justify-center gap-6 text-center p-6">
      <div className="relative">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        {/* 装饰光晕 */}
        <div className="absolute inset-0 rounded-3xl bg-purple-500/20 blur-2xl -z-10 animate-pulse" />
      </div>
      <div className="space-y-2">
        <p className="text-zinc-300 text-lg sm:text-xl font-medium">
          成果档案馆
        </p>
        <p className="text-zinc-500 text-sm sm:text-base max-w-md">
          这里将展示小组的精彩成果与里程碑时刻
        </p>
      </div>
      {canManage && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 font-medium text-sm hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-500/50 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          添加第一张成果图片
        </button>
      )}
    </div>
  );

  // 图片管理弹窗
  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* 背景高斯模糊 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px]"
            onClick={() => setIsModalOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
            transition={uiSpring}
            className="relative w-full max-w-3xl z-10 my-auto max-h-[90vh] flex flex-col"
          >
            {/* 动态呼吸灯核心：紫色光晕 */}
            <div 
              className="gallery-modal-breathe w-full rounded-[2rem] sm:rounded-[3rem] bg-[#060813]/95 p-5 sm:p-8 md:p-12 flex flex-col relative overflow-hidden min-h-0 flex-1"
              style={{ '--modal-glow': 'rgba(168, 85, 247, 0.2)', '--modal-shadow': 'rgba(168, 85, 247, 0.4)', '--modal-border': 'rgba(168, 85, 247, 0.5)' } as React.CSSProperties}
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              {/* 标题栏 */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 sm:pb-6 mb-5 sm:mb-8 relative z-10">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)] shrink-0"></div>
                  <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-purple-400">Gallery Manager</span>
                </div>
              </div>

              {/* 视图切换标签 */}
              <div className="flex gap-2 mb-6 relative z-10">
                <button
                  onClick={() => setModalView('add')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    modalView === 'add' 
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' 
                      : 'bg-black/30 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  添加图片
                </button>
                <button
                  onClick={() => setModalView('manage')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    modalView === 'manage' 
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' 
                      : 'bg-black/30 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  管理图片
                  {images.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-500/30 text-purple-300 text-xs">
                      {images.length}
                    </span>
                  )}
                </button>
              </div>

              {/* 内容区域 - 带翻转动画 */}
              <div className="relative z-10 flex-1 min-h-0">
                <AnimatePresence mode="wait">
                  {modalView === 'add' ? (
                    <motion.div
                      key="add-view"
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="bg-black/40 border border-white/5 rounded-2xl p-4 sm:p-6"
                    >
                      <h3 className="text-sm font-bold text-zinc-300 mb-4 tracking-wider uppercase">添加新图片</h3>
                      <div className="space-y-4">
                        {/* 文件选择区域 */}
                        <div>
                          <label className="text-xs text-zinc-500 mb-1.5 block">选择图片</label>
                          {!previewImage ? (
                            <label 
                              htmlFor="gallery-file-input"
                              className="flex flex-col items-center justify-center w-full h-32 rounded-xl bg-black/50 border-2 border-dashed border-white/10 hover:border-purple-500/50 cursor-pointer transition-colors group"
                            >
                              <svg className="w-8 h-8 text-zinc-500 group-hover:text-purple-400 transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                              </svg>
                              <span className="text-sm text-zinc-500 group-hover:text-purple-400 transition-colors">点击选择图片</span>
                              <span className="text-xs text-zinc-600 mt-1">支持 JPG、PNG、GIF，最大 10MB</span>
                              <input
                                id="gallery-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-purple-500/30">
                              <img src={previewImage} alt="预览" className="w-full h-full object-cover" />
                              <button
                                onClick={handleClearPreview}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 border border-white/10 text-white hover:bg-red-500/50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-white">
                                {selectedFile?.name}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 mb-1.5 block">图片描述（可选）</label>
                          <input
                            type="text"
                            value={newImageText}
                            onChange={(e) => setNewImageText(e.target.value)}
                            placeholder="例如：第一期流片成果"
                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                          />
                        </div>
                        <button
                          onClick={handleAddImage}
                          disabled={isUploading || !previewImage}
                          className="w-full px-4 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-sm hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                              添加中...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              添加图片
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="manage-view"
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: -90 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="bg-black/40 border border-white/5 rounded-2xl p-4 sm:p-6 h-full"
                    >
                      <h3 className="text-sm font-bold text-zinc-300 mb-4 tracking-wider uppercase">
                        已添加图片 ({images.length})
                      </h3>
                      <div className="max-h-[45vh] overflow-y-auto ios-scrollbar pr-2 space-y-3">
                        {images.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                            </div>
                            <p className="text-zinc-400 text-sm mb-2">暂无图片</p>
                            <p className="text-zinc-500 text-xs">切换到"添加图片"标签页添加第一张</p>
                          </div>
                        ) : (
                          images.map((img, index) => (
                            <motion.div 
                              key={img.id} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] hover:border-purple-500/20 transition-all"
                            >
                              <img 
                                src={img.image} 
                                alt={img.text} 
                                className="w-20 h-14 rounded-lg object-cover border border-white/10 group-hover:border-purple-500/30 transition-colors"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium truncate">{img.text}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">已添加到档案馆</p>
                              </div>
                              <button
                                onClick={() => handleDeleteImage(img.id)}
                                className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:scale-105 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 底部按钮 */}
              <div className="flex justify-end items-center mt-6 sm:mt-8 relative z-10">
                <button 
                  onClick={() => { setIsModalOpen(false); setModalView('add'); }} 
                  className="px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[10px] hover:bg-white/10 transition-all active:scale-95"
                >
                  关闭档案管理
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gallery-modal-breathe { 
          0%, 100% { box-shadow: 0 0 60px var(--modal-glow), inset 0 0 20px var(--modal-glow); border-color: rgba(255,255,255,0.1); } 
          50% { box-shadow: 0 0 100px var(--modal-shadow), inset 0 0 40px var(--modal-glow); border-color: var(--modal-border); } 
        }
        .gallery-modal-breathe { border: 1px solid rgba(255,255,255,0.1); animation: gallery-modal-breathe 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .ios-scrollbar::-webkit-scrollbar { width: 6px; }
        .ios-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .ios-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .ios-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.5); }
      `}} />

      <section className={`relative w-full ${className}`}>
        {/* 顶部区域：激光流 + 文字内容并排 */}
        <div className="relative w-full flex flex-col lg:flex-row items-stretch">
          {/* 左侧：激光流区域 */}
          <div className="relative w-full lg:w-1/2 h-[600px] sm:h-[750px] lg:h-[850px]">
            <LaserFlow
              color="#cf9eff"
              horizontalBeamOffset={0}
              verticalBeamOffset={-0.135}
              horizontalSizing={1.5}
              verticalSizing={1.5}
              wispDensity={6.0}
              wispSpeed={15.5}
              wispIntensity={8}
              flowSpeed={0.35}
              flowStrength={0.45}
              fogIntensity={0.55}
              fogScale={0.4}
              fogFallSpeed={1.55}
              decay={1.0}
              falloffStart={1.5}
            />
          </div>

          {/* 右侧：文字内容区域 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full lg:w-1/2 flex flex-col justify-start px-6 sm:px-10 lg:px-16 pt-8 sm:pt-12 lg:pt-20 pb-[350px] sm:pb-[450px]"
          >
            {/* GlitchText 标题 */}
            <div className="mb-6 sm:mb-8">
              <GlitchText
                speed={1.8}
                enableShadows={true}
                enableOnHover={false}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.15em]"
              >
                SWUST YSYX TEAM
              </GlitchText>
            </div>

            {/* 主标题 */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-2 leading-[1.1] tracking-tight">
              西南科技大学
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                一生一芯小组
              </span>
            </h2>

            {/* 副标题 */}
            <div className="space-y-3 mb-8 sm:mb-10 max-w-lg">
              <p className="text-zinc-300 text-base sm:text-lg lg:text-xl leading-relaxed font-medium">
                从零开始，亲手设计属于自己的处理器。
              </p>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                在星海中探索 CPU 的精妙设计，记录每一次突破与成长。
                我们是一群热爱计算机体系结构的探索者，致力于将理论转化为实践。
              </p>
            </div>

            {/* 特色标签 */}
            <div className="flex flex-wrap gap-2">
              {['RISC-V', 'CPU设计', '数字电路', '开源硬件', '流片验证'].map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-xs sm:text-sm font-medium hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300 transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 下方卡片 - 图片展示 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full -mt-[325px] sm:-mt-[425px] z-10"
        >
          {/* 图片展示卡片 */}
          <div
            className="relative w-full min-h-[400px] sm:min-h-[500px] rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-[#0a0a12]/90 backdrop-blur-xl overflow-hidden"
            style={{
              boxShadow: '0 0 80px rgba(207, 158, 255, 0.08), inset 0 0 60px rgba(0,0,0,0.5)'
            }}
          >
            {/* 编辑按钮 - 只有舰长和管理员可见 */}
            {canManage && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-3 rounded-xl bg-black/60 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}

            {/* 图片展示区域 */}
            {images.length > 0 ? (
              <div className="w-full h-[400px] sm:h-[500px]">
                <CircularGallery
                  items={images.map(img => ({ image: img.image, text: img.text }))}
                  bend={0}
                  textColor="#ffffff"
                  borderRadius={0.11}
                  scrollSpeed={1.7}
                  scrollEase={0.04}
                />
              </div>
            ) : (
              <EmptyStateUI />
            )}
          </div>
        </motion.div>
      </section>

      {isMounted && createPortal(modalContent, document.body)}
    </>
  );
}

export default AchievementGallerySection;
