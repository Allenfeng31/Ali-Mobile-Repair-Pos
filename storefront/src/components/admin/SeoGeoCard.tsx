import React from 'react';
import Link from 'next/link';
import { Radar } from 'lucide-react'; // 使用雷达图标，完美契合"Scout侦察兵"概念

interface SeoGeoCardProps {
    // 严格限定传入的角色类型
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | string;
}

export const SeoGeoCard: React.FC<SeoGeoCardProps> = ({ role }) => {
    // 🛡️ 架构核心约束 1 & 2: 绝对权限隔离
    // 只有 SUPER_ADMIN 才能渲染出 DOM，其他人连一根头发丝都看不到
    if (role !== 'SUPER_ADMIN') {
        return null;
    }

    // 🛡️ 架构核心约束 3 & 4: 路由跳转与文案对齐
    return (
        <Link
            href="/admin/seo"
            className="block w-full max-w-sm group outline-none"
        >
            {/* 极简新拟态 (Neumorphism) 风格容器 */}
            <div className="flex flex-col p-6 rounded-[2rem] bg-[#f0f4f8] transition-all duration-300 
                      shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] 
                      hover:shadow-[12px_12px_20px_#d1d9e6,-12px_-12px_20px_#ffffff] 
                      active:shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]
                      border border-white/40">

                {/* 顶部图标区域 (内嵌凹陷效果) */}
                <div className="flex items-center justify-center w-14 h-14 mb-5 rounded-2xl bg-[#f0f4f8] 
                        shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] 
                        text-cyan-500 group-hover:text-cyan-400 transition-colors duration-300">
                    <Radar className="w-7 h-7" strokeWidth={2.5} />
                </div>

                {/* 核心文案区域 */}
                <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">
                    SEO & GEO Scout
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Automated Keyword Scraping & Content Generation
                </p>

                {/* 底部引导箭头 */}
                <div className="mt-6 flex items-center text-xs font-bold text-cyan-500 uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                    Open Module <span className="ml-2">→</span>
                </div>
            </div>
        </Link>
    );
};