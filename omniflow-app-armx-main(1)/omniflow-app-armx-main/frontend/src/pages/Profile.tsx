import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Lock,
  LogOut,
  ArrowLeft,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { AuthUser } from '@shared/types/api';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const token = localStorage.getItem('token');

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
        setName(data.data.user.name);
        setEmail(data.data.user.email);
      } else {
        logout();
        navigate('/login', { replace: true });
      }
    } catch {
      toast.error('获取用户信息失败');
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('姓名不能为空'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { toast.error('请输入有效的邮箱地址'); return; }
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data?.user || { ...user!, name, email });
        toast.success('资料已更新');
      } else {
        toast.error('更新失败', { description: data.message });
      }
    } catch {
      toast.error('网络错误，请重试');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) { toast.error('请输入当前密码'); return; }
    if (newPassword.length < 6) { toast.error('新密码至少6位'); return; }
    if (newPassword !== confirmNewPassword) { toast.error('两次新密码不一致'); return; }
    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('密码已更新');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast.error('密码更新失败', { description: data.message || '当前密码错误' });
      }
    } catch {
      toast.error('网络错误，请重试');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    navigate('/login', { replace: true });
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer"
            aria-label="返回主页"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">个人资料</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* User Avatar Card */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400/40 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 text-xs">账户已验证</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            编辑资料
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-slate-300 text-sm">姓名</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400 h-11"
                placeholder="请输入姓名"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-slate-300 text-sm">邮箱地址</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400 h-11"
                placeholder="请输入邮箱"
              />
            </div>
            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer h-10"
            >
              {savingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />保存中...</> : '保存修改'}
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            修改密码
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-password" className="text-slate-300 text-sm">当前密码</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400 h-11 pr-10"
                  placeholder="请输入当前密码"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-slate-300 text-sm">新密码</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400 h-11 pr-10"
                  placeholder="至少6位新密码"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password" className="text-slate-300 text-sm">确认新密码</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-400 h-11"
                  placeholder="再次输入新密码"
                  autoComplete="new-password"
                />
              </div>
              {confirmNewPassword && newPassword === confirmNewPassword && newPassword.length >= 6 && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 text-xs">密码一致</span>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={savingPassword}
              className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer h-10"
            >
              {savingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />更新中...</> : '更新密码'}
            </Button>
          </form>
        </div>

        {/* Logout */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <Separator className="bg-slate-700/50 mb-5" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">退出登录</p>
              <p className="text-slate-400 text-sm mt-0.5">安全退出您的账户</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
