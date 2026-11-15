'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import { 
  User, 
  Code, 
  Globe, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink, 
  RefreshCw,
  Eye,
  Camera,
  Image,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function ProfileEditContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'socials'>('general');

  useEffect(() => {
    if (tabParam === 'integrations' || tabParam === 'socials' || tabParam === 'general') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // General Form State
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [about, setAbout] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [skillsInput, setSkillsInput] = useState('');

  // Preview States
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Social Links State (Optional URLs)
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);

  // Coding Platforms (Optional handles)
  const [codingProfiles, setCodingProfiles] = useState<any[]>([]);
  const [platformInput, setPlatformInput] = useState('leetcode');
  const [handleInput, setHandleInput] = useState('');
  const [connectingPlatform, setConnectingPlatform] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);

  // GitHub Account State
  const [githubAccount, setGithubAccount] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await api.get('/profiles/me');
      const data = res.data;
      setProfile(data);
      setName(data.name || '');
      setBio(data.bio || '');
      setAbout(data.about || '');
      setCurrentPosition(data.current_position || '');
      setCompany(data.company || '');
      setLocation(data.location || '');
      setWebsite(data.website || '');
      setVisibility(data.visibility || 'public');
      setSkillsInput(data.skills ? data.skills.join(', ') : '');
      setAvatarPreview(data.avatar_url || null);
      setCoverPreview(data.cover_url || null);
      setSocialLinks(data.social_links ? data.social_links.map((l: any) => ({ platform: l.platform, url: l.url })) : []);

      // Fetch connected platforms
      const [platRes, ghRes] = await Promise.allSettled([
        api.get('/platforms/profiles'),
        api.get('/github/stats/' + data.username)
      ]);

      if (platRes.status === 'fulfilled') {
        setCodingProfiles(platRes.value.data || []);
      }
      if (ghRes.status === 'fulfilled') {
        setGithubAccount(ghRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching profile data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/profiles/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProfile(res.data);
        toast.success('Avatar updated successfully!');
      } catch (err: any) {
        toast.error('Failed to upload avatar');
      }
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverPreview(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/profiles/me/cover', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProfile(res.data);
        toast.success('Cover image updated successfully!');
      } catch (err: any) {
        toast.error('Failed to upload cover banner');
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const skills = skillsInput
      ? skillsInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      await api.put('/profiles/me', {
        name: name.trim() || profile?.username,
        bio: bio.trim() || null,
        about: about.trim() || null,
        current_position: currentPosition.trim() || null,
        company: company.trim() || null,
        location: location.trim() || null,
        website: website.trim() || null,
        visibility,
        skills
      });

      // Filter out empty URLs before saving
      const validSocials = socialLinks.filter(l => l.url.trim().length > 0);
      await api.put('/profiles/me/social-links', validSocials);

      toast.success('Profile saved successfully!');
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      toast.error('Failed to save profile changes');
      setMessage(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;

    setConnectingPlatform(true);
    try {
      await api.post('/platforms/connect', {
        platform: platformInput,
        external_username: handleInput.trim()
      });
      toast.success(`Connected ${platformInput} account: @${handleInput.trim()}`);
      setHandleInput('');
      const platRes = await api.get('/platforms/profiles');
      setCodingProfiles(platRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to connect ${platformInput}`);
    } finally {
      setConnectingPlatform(false);
    }
  };

  const handleSyncPlatform = async (platformName: string) => {
    setSyncingPlatform(platformName);
    try {
      await api.post(`/platforms/${platformName}/sync`);
      toast.success(`Synced ${platformName} stats successfully!`);
      const platRes = await api.get('/platforms/profiles');
      setCodingProfiles(platRes.data || []);
    } catch (err: any) {
      toast.error(`Failed to sync ${platformName}`);
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      const res = await api.get('/github/auth/url');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error('GitHub integration requires client configuration');
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'github', url: '' }]);
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
          Loading profile configuration...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Profile & Integrations Setup</h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure what you want to share. All fields and integrations are completely optional.
            </p>
          </div>
          {profile?.username && (
            <a
              href={`/u/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-sm w-fit"
            >
              <Eye size={14} className="text-indigo-400" />
              <span>View Public Profile</span>
              <ExternalLink size={12} className="text-slate-500" />
            </a>
          )}
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200 text-sm flex items-center justify-between">
            <span>{message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'general', label: 'Basic Info & Visuals', icon: User },
            { id: 'integrations', label: 'Coding Platforms (LeetCode, CF)', icon: Code },
            { id: 'socials', label: 'Social & Portfolio Links', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Basic Info & Visuals */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Visual Assets */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-sm">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-400" /> Cover & Avatar (Optional)
              </h2>

              {/* Cover Banner */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Cover Banner</label>
                <div className="relative h-36 w-full rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center group">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 text-xs">No cover image uploaded (Default gradient will be used)</span>
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white text-xs gap-2 font-medium">
                    <Camera size={16} /> Change Cover
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-6 pt-2">
                <div className="relative w-20 h-20 rounded-full bg-slate-800 border-2 border-indigo-500/60 overflow-hidden flex items-center justify-center group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl font-bold text-indigo-400">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white">
                    <Camera size={18} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Profile Photo</p>
                  <p className="text-xs text-slate-400 mt-0.5">Click on the circle to upload a custom avatar. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* General Bio & Info */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" /> Personal Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Kumar"
                    className="w-full px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Headline / Current Role</label>
                  <input
                    type="text"
                    value={currentPosition}
                    onChange={(e) => setCurrentPosition(e.target.value)}
                    placeholder="e.g. Fullstack Developer"
                    className="w-full px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Tech or Student"
                    className="w-full px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Short Bio</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Building distributed systems and loving graph algorithms."
                  className="w-full px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">About Me (Markdown & paragraphs)</label>
                <textarea
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Share your journey, interests, or project highlights..."
                  className="w-full px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Skills & Technologies (comma separated)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, Next.js, Python, FastAPI, Docker, PostgreSQL"
                  className="w-full px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-sm">
              <h2 className="text-base font-bold text-white">Profile Privacy</h2>
              <div className="flex gap-6 items-center pt-1">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Public (Accessible by anyone at /u/{profile?.username})</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Private (Only visible to you)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition disabled:opacity-50"
              >
                <Save size={16} />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Coding Platforms Integration */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Add/Connect Form */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" /> Connect Competitive Coding Handles
              </h2>
              <p className="text-xs text-slate-400">
                Link any coding platform handle. We will automatically fetch your total problems solved, ratings, and submission heatmaps. Add only the ones you use.
              </p>

              <form onSubmit={handleConnectPlatform} className="flex flex-col sm:flex-row gap-3 pt-2">
                <select
                  value={platformInput}
                  onChange={(e) => setPlatformInput(e.target.value)}
                  className="px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="leetcode">LeetCode</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="codechef">CodeChef</option>
                  <option value="geeksforgeeks">GeeksforGeeks</option>
                </select>

                <input
                  type="text"
                  required
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="Enter username / handle (e.g. tourist)"
                  className="flex-1 px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={connectingPlatform}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{connectingPlatform ? 'Connecting...' : 'Connect Platform'}</span>
                </button>
              </form>
            </div>

            {/* Connected Platforms List */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-white">Connected Platforms ({codingProfiles.length})</h3>

              {codingProfiles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No competitive coding handles connected yet. Add one above whenever you wish.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {codingProfiles.map((cp) => (
                    <div
                      key={cp.id}
                      className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-bold text-white text-sm">{cp.platform}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                          {cp.stats?.total_solved !== undefined && (
                            <span className="text-[11px] font-bold text-indigo-300">
                              • {cp.stats.total_solved} Solved
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-400 font-mono mt-0.5">@{cp.external_username}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSyncPlatform(cp.platform)}
                        disabled={syncingPlatform === cp.platform}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5"
                        title="Sync latest statistics"
                      >
                        <RefreshCw size={14} className={syncingPlatform === cp.platform ? 'animate-spin' : ''} />
                        <span className="text-[11px]">Sync</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GitHub OAuth Connection */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400" /> GitHub Repository Sync
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect your GitHub account to sync commit contribution heatmaps and calculate repository health scores.
                  </p>
                </div>
                {githubAccount ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Connected as @{githubAccount.github_username}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectGitHub}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
                  >
                    Connect GitHub
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Social & Portfolio Links */}
        {activeTab === 'socials' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400" /> Social & Web Profiles
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add direct links to your developer socials. Only non-empty links will appear on your public profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} /> Add Link
                </button>
              </div>

              {socialLinks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No social links added yet. Click &quot;Add Link&quot; to include LinkedIn, Twitter, GitHub, or your personal website.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {socialLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                        className="px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="github">GitHub</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter / X</option>
                        <option value="leetcode">LeetCode</option>
                        <option value="codechef">CodeChef</option>
                        <option value="codeforces">Codeforces</option>
                        <option value="geeksforgeeks">GeeksforGeeks</option>
                        <option value="portfolio">Personal Portfolio</option>
                      </select>

                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3.5 py-2.5 border border-slate-700 text-white rounded-xl bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                      />

                      <button
                        type="button"
                        onClick={() => removeSocialLink(idx)}
                        className="p-2 text-slate-400 hover:text-red-400 transition"
                        title="Remove link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 text-sm transition disabled:opacity-50"
              >
                <Save size={16} />
                <span>{saving ? 'Saving Changes...' : 'Save Social Links'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}

export default function ProfileEditPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell>
          <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
            Loading profile configuration...
          </div>
        </DashboardShell>
      }
    >
      <ProfileEditContent />
    </Suspense>
  );
}
