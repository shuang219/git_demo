import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NotFound = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1E293B] border border-[#334155] rounded-2xl p-8 flex flex-col items-center text-center gap-4">
        <Compass className="w-12 h-12 text-[#60A5FA]" />
        <h1 className="text-2xl font-black leading-tight">找不到该页面</h1>
        <p className="text-[#94A3B8] text-sm leading-relaxed break-all">
          路径 {pathname} 不存在，请返回主页继续使用。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to={isAuthenticated ? '/' : '/login'}
            className="flex-1 min-h-[48px] inline-flex items-center justify-center rounded-xl bg-[#2563EB] hover:bg-blue-700 font-bold cursor-pointer"
          >
            {isAuthenticated ? '返回主页' : '去登录'}
          </Link>
          <Link
            to="/d919503a-2314-4eee-80ee-dd1a29c7a34b"
            className="flex-1 min-h-[48px] inline-flex items-center justify-center rounded-xl border border-[#334155] hover:border-[#2563EB] font-bold cursor-pointer"
          >
            查看产品预览
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
