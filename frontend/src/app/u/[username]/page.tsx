'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { MapPin, Briefcase, Globe, UserPlus, UserCheck, ShieldAlert, Star, GitFork, ShieldCheck } from 'lucide-react';
import ContributionHeatmap from '@/components/github/ContributionHeatmap';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);

  const [githubStats, setGithubStats] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
    fetchGithubStats();
  }, [username]);

  const fetchGithubStats = async () => {
    try {
      const res = await api.get(`/github/stats/${username}`);
      setGithubStats(res.data);
    } catch (err) {
      // GitHub stats optional if not connected
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profiles/u/${username}`);
      setProfile(res.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('This profile is private.');
      } else {
        setError('Profile not found.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    try {
      if (following) {
        await api.post(`/profiles/${username}/unfollow`);
        setFollowing(false);
        setProfile((prev: any) => ({ ...prev, followers_count: prev.followers_count - 1 }));
      } else {
        await api.post(`/profiles/${username}/follow`);
        setFollowing(true);
        setProfile((prev: any) => ({ ...prev, followers_count: prev.followers_count + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading developer profile...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">{error}</h1>
        <p className="text-slate-400">Only authorized users can view this profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Cover Image Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900"></div>
        )}
      </div>

      {/* Main Profile Info Section */}
      <div className="max-w-5xl mx-auto px-6 relative -mt-20 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden shadow-2xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-indigo-400">
                  {profile.name?.charAt(0) || 'D'}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{profile.name}</h1>
              <p className="text-indigo-400 font-mono text-sm">@{profile.username}</p>
              {profile.bio && <p className="text-slate-300 mt-1 max-w-xl">{profile.bio}</p>}
            </div>
          </div>

          <button
            onClick={toggleFollow}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${following ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'}`}
          >
            {following ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-8 py-6 text-sm">
          <div>
            <span className="font-bold text-white text-lg">{profile.followers_count}</span> <span className="text-slate-400">Followers</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg">{profile.following_count}</span> <span className="text-slate-400">Following</span>
          </div>
          {profile.location && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-4 h-4 text-indigo-400" /> {profile.location}
            </div>
          )}
          {profile.company && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Briefcase className="w-4 h-4 text-indigo-400" /> {profile.current_position || 'Engineer'} at {profile.company}
            </div>
          )}
        </div>

        {/* Social Links Bar */}
        {profile.social_links && profile.social_links.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {profile.social_links.map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-xs font-semibold text-slate-300 hover:text-white transition uppercase tracking-wider flex items-center gap-2"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> {link.platform}
              </a>
            ))}
          </div>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4">Skills & Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string, idx: number) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* GitHub Stats & Contribution Heatmap */}
        {githubStats && (
          <div className="space-y-6 mb-8">
            <ContributionHeatmap 
              data={githubStats.contribution_calendar || {}} 
              title="GitHub Contribution History" 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {githubStats.repositories && githubStats.repositories.map((repo: any) => (
                <div key={repo.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-indigo-400 text-base">
                      {repo.name}
                    </a>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {repo.health_score}/100 Health
                    </span>
                  </div>
                  {repo.description && <p className="text-xs text-slate-400 line-clamp-2">{repo.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    {repo.language && <span className="font-medium text-slate-300">{repo.language}</span>}
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars_count}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-blue-400" /> {repo.forks_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        {profile.about && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-3">About</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{profile.about}</p>
          </div>
        )}
      </div>
    </div>
  );
}
