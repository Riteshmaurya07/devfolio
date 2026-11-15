'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  Textarea,
  Select,
  Tabs,
} from '@/components/ui';
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
    const githubParam = searchParams.get('github');
    const errorParam = searchParams.get('error');
    if (githubParam === 'connected') {
      toast.success('GitHub account connected and synced successfully!');
    } else if (errorParam) {
      toast.error(`GitHub connection notice: ${errorParam}`);
    }
  }, [tabParam, searchParams]);
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
      toast.error(err.response?.data?.detail || `Failed to sync ${platformName}`);
    } finally {
      setSyncingPlatform(null);
    }
  };

  const [syncingGithub, setSyncingGithub] = useState(false);

  const handleConnectGitHub = async () => {
    try {
      const res = await api.get('/github/auth/url');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'GitHub integration requires client configuration');
    }
  };

  const handleSyncGitHub = async () => {
    try {
      setSyncingGithub(true);
      await api.post('/github/sync');
      toast.success('GitHub data synchronized successfully!');
      if (profile?.username) {
        const ghRes = await api.get('/github/stats/' + profile.username);
        setGithubAccount(ghRes.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to sync GitHub account');
    } finally {
      setSyncingGithub(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Profile & Integrations Setup
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Configure your developer identity. All fields, coding handles, and links are completely optional.
            </p>
          </div>
          {profile?.username && (
            <a
              href={`/u/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm" leftIcon={<Eye size={13} className="text-[#d9541e]" />} rightIcon={<ExternalLink size={12} className="text-[var(--text-muted)]" />}>
                View Public Profile
              </Button>
            </a>
          )}
        </div>

        {message && (
          <div className="p-3.5 rounded-lg bg-[#d9541e]/10 border border-[#d9541e]/25 text-xs text-[#d9541e] font-medium flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="underline text-xs">Dismiss</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="pt-1">
          <Tabs
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            tabs={[
              { id: 'general', label: 'Basic Info & Visuals', icon: <User size={14} /> },
              { id: 'integrations', label: 'Coding Platforms & GitHub', icon: <Code size={14} /> },
              { id: 'socials', label: 'Social & Web Links', icon: <Globe size={14} /> },
            ]}
          />
        </div>

        {/* Tab 1: Basic Info & Visuals */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Visual Assets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-[#d9541e]" /> Cover & Avatar (Optional)
                </CardTitle>
                <CardDescription>Upload a banner or avatar to personalize your public profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cover Banner */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Cover Banner
                  </label>
                  <div className="relative h-36 w-full rounded-lg bg-[var(--bg-canvas-subtle)] border border-[var(--border-subtle)] overflow-hidden flex items-center justify-center group">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[var(--text-muted)] text-xs">
                        No cover uploaded (Default calm gradient will be displayed)
                      </span>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white text-xs gap-2 font-medium">
                      <Camera size={16} /> Change Cover
                      <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-6 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="relative w-20 h-20 rounded-lg bg-[var(--bg-canvas-subtle)] border-2 border-[#d9541e]/50 overflow-hidden flex items-center justify-center group shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-2xl font-bold text-[#d9541e]">
                        {name ? name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white">
                      <Camera size={18} />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                      Profile Photo
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Hover and click to upload a custom square avatar (Max 5MB).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Bio & Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#d9541e]" /> Personal Details
                </CardTitle>
                <CardDescription>Basic biographical details shown on your developer profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Display Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Kumar"
                  />
                  <Input
                    label="Headline / Current Role"
                    value={currentPosition}
                    onChange={(e) => setCurrentPosition(e.target.value)}
                    placeholder="e.g. Fullstack Engineer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company / College"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Tech or Student"
                  />
                  <Input
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                  />
                </div>

                <Input
                  label="Short Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Passionate about distributed systems, backend architectures, and clean code."
                />

                <Textarea
                  label="About Me (Markdown & Paragraphs)"
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Share your engineering journey, key interests, or project highlights..."
                />

                <Input
                  label="Skills & Technologies (Comma Separated)"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, Next.js, Python, FastAPI, Docker, PostgreSQL"
                />
              </CardContent>
            </Card>

            {/* Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Privacy</CardTitle>
                <CardDescription>Control whether your profile is publicly accessible or private</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 items-center">
                  <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === 'public'}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="accent-[#d9541e]"
                    />
                    <span>Public (Accessible at /u/{profile?.username})</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === 'private'}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="accent-[#d9541e]"
                    />
                    <span>Private (Only visible to you)</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={saving}
                leftIcon={<Save size={15} />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Coding Platforms Integration */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Add/Connect Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#d9541e]" /> Connect Competitive Coding Handles
                </CardTitle>
                <CardDescription>
                  Link your coding accounts. We will automatically fetch total solved problems, rankings, ratings, and heatmaps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConnectPlatform} className="flex flex-col sm:flex-row gap-3">
                  <div className="sm:w-48">
                    <Select
                      value={platformInput}
                      onChange={(e) => setPlatformInput(e.target.value)}
                      options={[
                        { value: 'leetcode', label: 'LeetCode' },
                        { value: 'codeforces', label: 'Codeforces' },
                        { value: 'codechef', label: 'CodeChef' },
                        { value: 'geeksforgeeks', label: 'GeeksforGeeks' },
                      ]}
                    />
                  </div>

                  <div className="flex-1">
                    <Input
                      required
                      value={handleInput}
                      onChange={(e) => setHandleInput(e.target.value)}
                      placeholder="Enter username / handle (e.g. tourist)"
                    />
                  </div>

                  <div className="sm:pt-0 pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={connectingPlatform}
                      leftIcon={<Plus size={14} />}
                      className="w-full sm:w-auto h-[42px]"
                    >
                      Connect
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Connected Platforms List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Connected Platforms ({codingProfiles.length})</CardTitle>
                  <CardDescription>Live synchronized problem solving accounts</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {codingProfiles.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                    No competitive coding handles connected yet. Add one above whenever you wish.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {codingProfiles.map((cp) => (
                      <div
                        key={cp.id}
                        className="p-3.5 rounded-lg bg-[var(--bg-canvas-subtle)] border border-[var(--border-subtle)] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="capitalize font-bold text-xs text-[var(--text-primary)]">
                              {cp.platform}
                            </span>
                            <Badge variant="success" size="sm">
                              Active
                            </Badge>
                            {cp.stats?.total_solved !== undefined && (
                              <span className="text-xs font-mono font-bold text-[#d9541e]">
                                • {cp.stats.total_solved} Solved
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                            @{cp.external_username}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSyncPlatform(cp.platform)}
                          isLoading={syncingPlatform === cp.platform}
                          leftIcon={<RefreshCw size={12} />}
                        >
                          Sync
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GitHub OAuth Connection */}
            <Card className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#d9541e]" /> GitHub Repository Sync
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed">
                    Connect your GitHub account to sync commit contribution heatmaps, star metrics, and calculate repository health scores for your public developer profile.
                  </p>
                </div>
                {githubAccount ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://github.com/${githubAccount.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#d9541e]/10 text-[#d9541e] border border-[#d9541e]/25 hover:bg-[#d9541e]/20 transition flex items-center gap-1.5"
                    >
                      @{githubAccount.github_username}
                      <ExternalLink size={12} />
                    </a>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSyncGitHub}
                      isLoading={syncingGithub}
                      leftIcon={<RefreshCw size={12} />}
                    >
                      Sync Now
                    </Button>
                    <button
                      type="button"
                      onClick={handleConnectGitHub}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition underline ml-1"
                    >
                      Reconnect
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleConnectGitHub}
                  >
                    Connect GitHub
                  </Button>
                )}
              </div>

              {githubAccount && (
                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <span>★ <strong className="text-[var(--text-primary)] font-mono">{githubAccount.total_stars ?? 0}</strong> stars</span>
                  <span>📁 <strong className="text-[var(--text-primary)] font-mono">{githubAccount.repositories?.length ?? 0}</strong> synced repos</span>
                  <span>👥 <strong className="text-[var(--text-primary)] font-mono">{githubAccount.total_followers ?? 0}</strong> followers</span>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Tab 3: Social & Portfolio Links */}
        {activeTab === 'socials' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#d9541e]" /> Social & Web Profiles
                  </CardTitle>
                  <CardDescription>
                    Add direct links to your developer socials. Only non-empty links will appear on your public profile.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={addSocialLink}
                  leftIcon={<Plus size={13} />}
                >
                  Add Link
                </Button>
              </CardHeader>
              <CardContent>
                {socialLinks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                    No social links added yet. Click &quot;Add Link&quot; to include LinkedIn, Twitter, GitHub, or your personal website.
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {socialLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2.5 items-center">
                        <div className="w-40 shrink-0">
                          <Select
                            value={link.platform}
                            onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                            options={[
                              { value: 'github', label: 'GitHub' },
                              { value: 'linkedin', label: 'LinkedIn' },
                              { value: 'twitter', label: 'Twitter / X' },
                              { value: 'leetcode', label: 'LeetCode' },
                              { value: 'codechef', label: 'CodeChef' },
                              { value: 'codeforces', label: 'Codeforces' },
                              { value: 'geeksforgeeks', label: 'GeeksforGeeks' },
                              { value: 'portfolio', label: 'Personal Portfolio' },
                            ]}
                          />
                        </div>

                        <div className="flex-1">
                          <Input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSocialLink(idx)}
                          className="p-2 text-[var(--text-muted)] hover:text-red-500 transition cursor-pointer"
                          title="Remove link"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={saving}
                leftIcon={<Save size={15} />}
              >
                Save Social Links
              </Button>
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
