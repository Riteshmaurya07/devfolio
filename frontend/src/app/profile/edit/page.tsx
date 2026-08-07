'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';

export default function ProfileEditPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form State
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

  // Social Links State
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
    } catch (err) {
      console.error(err);
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
        setMessage('Avatar updated successfully!');
      } catch (err) {
        console.error(err);
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
        setMessage('Cover image updated successfully!');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      await api.put('/profiles/me', {
        name,
        bio,
        about,
        current_position: currentPosition,
        company,
        location,
        website,
        visibility,
        skills
      });

      await api.put('/profiles/me/social-links', socialLinks);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
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
    return <DashboardShell><div className="text-white">Loading profile editor...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <h1 className="text-3xl font-bold text-white">Edit Developer Profile</h1>

        {message && (
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Images Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold text-white">Profile Images</h2>
            
            {/* Cover Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Cover Banner</label>
              <div className="relative h-40 w-full rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 text-sm">No cover image uploaded</span>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full bg-slate-800 border-2 border-indigo-500 overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 text-xs text-center">Upload Avatar</span>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
              <div>
                <p className="text-sm text-slate-300 font-medium">Avatar Thumbnail</p>
                <p className="text-xs text-slate-500">Click circle to upload a new avatar. Automatic thumbnail generated.</p>
              </div>
            </div>
          </div>

          {/* General Profile Information */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-white">General Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Current Position</label>
                <input 
                  type="text" 
                  value={currentPosition} 
                  onChange={e => setCurrentPosition(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Senior Software Engineer" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Company</label>
                <input 
                  type="text" 
                  value={company} 
                  onChange={e => setCompany(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Bio (Short Tagline)</label>
              <input 
                type="text" 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">About Me</label>
              <textarea 
                rows={4} 
                value={about} 
                onChange={e => setAbout(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Skills (comma separated)</label>
              <input 
                type="text" 
                value={skillsInput} 
                onChange={e => setSkillsInput(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Python, FastAPI, TypeScript, React, Docker" 
              />
            </div>
          </div>

          {/* Social Links Manager */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Social Links</h2>
              <button 
                type="button" 
                onClick={addSocialLink} 
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
              >
                + Add Social Link
              </button>
            </div>

            {socialLinks.map((link, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <select 
                  value={link.platform} 
                  onChange={e => updateSocialLink(idx, 'platform', e.target.value)}
                  className="px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800"
                >
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="leetcode">LeetCode</option>
                  <option value="codechef">CodeChef</option>
                  <option value="codeforces">CodeForces</option>
                  <option value="geeksforgeeks">GeeksForGeeks</option>
                  <option value="portfolio">Portfolio</option>
                </select>

                <input 
                  type="text" 
                  value={link.url} 
                  onChange={e => updateSocialLink(idx, 'url', e.target.value)} 
                  className="flex-1 px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800" 
                  placeholder="https://..." 
                />

                <button 
                  type="button" 
                  onClick={() => removeSocialLink(idx)} 
                  className="text-red-400 hover:text-red-300 text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Visibility Controls */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-white">Profile Visibility</h2>
            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2 text-slate-300">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="public" 
                  checked={visibility === 'public'} 
                  onChange={e => setVisibility(e.target.value)} 
                />
                Public (Visible to everyone at /u/{profile?.username})
              </label>

              <label className="flex items-center gap-2 text-slate-300">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="private" 
                  checked={visibility === 'private'} 
                  onChange={e => setVisibility(e.target.value)} 
                />
                Private (Only visible to you)
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={saving} 
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
            >
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
