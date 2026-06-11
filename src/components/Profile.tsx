import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Loader2, User as UserIcon, KeyRound, Mail } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, userData, updateName, updatePhoto, changePassword, resetPassword } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(userData?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const r = storageRef(storage, `profile-pics/${user.uid}`);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      await updatePhoto(url);
      toast.success('Profile picture updated');
    } catch {
      toast.error('Upload failed. Check Storage rules in Firebase.');
    } finally {
      setUploading(false);
    }
  };

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSavingName(true);
    try {
      await updateName(name.trim());
      toast.success('Name updated');
    } catch {
      toast.error('Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 6) return toast.error('New password must be at least 6 characters');
    setSavingPwd(true);
    try {
      await changePassword(curPwd, newPwd);
      toast.success('Password changed');
      setCurPwd(''); setNewPwd('');
    } catch {
      toast.error('Failed. Check your current password.');
    } finally {
      setSavingPwd(false);
    }
  };

  const sendReset = async () => {
    if (!userData?.email) return;
    try {
      await resetPassword(userData.email);
      toast.success('Password reset email sent');
    } catch {
      toast.error('Could not send reset email');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h2 className="text-3xl font-bold text-white">Profile Settings</h2>

      <Card>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border border-white/10 flex items-center justify-center">
              {userData?.photoURL ? (
                <img src={userData.photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-slate-500" />
              )}
            </div>
            <button onClick={() => fileInput.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{userData?.name}</p>
            <p className="text-slate-400 text-sm flex items-center gap-1.5"><Mail className="w-4 h-4" /> {userData?.email}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><UserIcon className="w-4 h-4 text-indigo-400" /> Display Name</h3>
        <form onSubmit={saveName} className="flex gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button disabled={savingName} className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 font-semibold text-white flex items-center gap-2 disabled:opacity-60">
            {savingName && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><KeyRound className="w-4 h-4 text-indigo-400" /> Change Password</h3>
        <form onSubmit={savePassword} className="space-y-3">
          <input type="password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} placeholder="Current password" required
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="New password" required
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex items-center justify-between">
            <button type="button" onClick={sendReset} className="text-sm text-indigo-400 hover:text-indigo-300">Send reset email instead</button>
            <button disabled={savingPwd} className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 font-semibold text-white flex items-center gap-2 disabled:opacity-60">
              {savingPwd && <Loader2 className="w-4 h-4 animate-spin" />} Update
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6">{children}</div>
);

export default Profile;
