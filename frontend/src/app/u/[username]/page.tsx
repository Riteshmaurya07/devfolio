'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { 
  MapPin, 
  Briefcase, 
  Globe, 
  UserPlus, 
  UserCheck, 
  ShieldAlert, 
  Star, 
  GitFork, 
  ShieldCheck,
  Code2,
  Trophy,
  CheckCircle2,
  Calendar,
  Settings,
  LayoutDashboard,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  User,
  PenLine,
  Plus
} from 'lucide-react';
import ContributionHeatmap from '@/components/github/ContributionHeatmap';

function ProfileNavbar({ currentUser, isOwner }: { currentUser: any; isOwner: boolean }) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Devfolio OS
          </span>
        </Link>
        {currentUser && (
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {currentUser ? (
          <>
            {isOwner && (
              <Link
                href="/profile/edit"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-indigo-600/30"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Profile & Services</span>
                <span className="sm:hidden">Edit</span>
              </Link>
            )}
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.username}
                  className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-300 hidden md:inline">
                @{currentUser.username}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm shadow-indigo-600/30"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [codingSummary, setCodingSummary] = useState<any>(null);
  const [githubStats, setGithubStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);

  const isOwner = Boolean(
    currentUser && (
      (currentUser.username && currentUser.username.toLowerCase() === username?.toLowerCase()) ||
      (currentUser.id && profile?.user_id && currentUser.id === profile.user_id)
    )
  );

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    try {
      // 1. Fetch public profile
      const res = await api.get(`/profiles/u/${username}`);
      setProfile(res.data);

      // 2. Fetch public coding platform stats and GitHub stats (graceful failures)
      const [codingRes, ghRes] = await Promise.allSettled([
        api.get(`/platforms/u/${username}`),
        api.get(`/github/stats/${username}`)
      ]);

      if (codingRes.status === 'fulfilled') {
        setCodingSummary(codingRes.value.data);
      }
      if (ghRes.status === 'fulfilled') {
        setGithubStats(ghRes.value.data);
      }
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
        setProfile((prev: any) => ({ ...prev, followers_count: Math.max(0, (prev.followers_count || 1) - 1) }));
      } else {
        await api.post(`/profiles/${username}/follow`);
        setFollowing(true);
        setProfile((prev: any) => ({ ...prev, followers_count: (prev.followers_count || 0) + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <ProfileNavbar currentUser={currentUser} isOwner={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-400">Loading developer profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <ProfileNavbar currentUser={currentUser} isOwner={false} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert className="w-14 h-14 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">{error || 'Profile not found'}</h1>
          <p className="text-slate-400 text-sm max-w-sm mb-6">
            {error === 'This profile is private.'
              ? 'The owner has set their profile visibility to private.'
              : 'No developer profile registered under this username.'}
          </p>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Filter valid social links
  const validSocialLinks = (profile.social_links || []).filter(
    (l: any) => l.url && l.url.trim().length > 0
  );

  // Filter active coding profiles
  const activeCodingProfiles = codingSummary?.profiles || [];

  const hasAnyContent = (
    validSocialLinks.length > 0 ||
    activeCodingProfiles.length > 0 ||
    Boolean(githubStats) ||
    Boolean(profile.bio) ||
    Boolean(profile.about) ||
    Boolean(profile.skills && profile.skills.length > 0)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <ProfileNavbar currentUser={currentUser} isOwner={isOwner} />

      {/* Cover Image Banner */}
      <div className="relative h-56 sm:h-72 w-full bg-slate-900 overflow-hidden group">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 opacity-90"></div>
        )}
        {isOwner && (
          <Link
            href="/profile/edit?tab=general"
            className="absolute top-4 right-4 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm transition shadow-lg"
          >
            <PenLine size={13} />
            <span>Change Cover</span>
          </Link>
        )}
      </div>

      {/* Main Profile Info Section */}
      <div className="max-w-5xl mx-auto px-6 relative -mt-20 z-10 space-y-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-4 border-slate-950 bg-slate-900 overflow-hidden shadow-2xl flex-shrink-0 group">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-indigo-400 bg-slate-900">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'D'}
                </div>
              )}
              {isOwner && (
                <Link
                  href="/profile/edit?tab=general"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-xs gap-1 font-medium"
                >
                  <PenLine size={16} />
                  <span>Edit Avatar</span>
                </Link>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {profile.name || profile.username}
                </h1>
                {isOwner && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    You
                  </span>
                )}
              </div>
              <p className="text-indigo-400 font-mono text-xs sm:text-sm mt-0.5">@{profile.username}</p>
              {profile.bio && (
                <p className="text-slate-300 mt-2 text-sm max-w-xl leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Action buttons on the right of profile header */}
          {isOwner ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/profile/edit"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile & Services</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Link>
            </div>
          ) : (
            <button
              onClick={toggleFollow}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-sm ${
                following
                  ? 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {following ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Follow Developer
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick Meta Row (Followers + Location + Company) */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm text-slate-400">
          <div>
            <span className="font-bold text-white text-base">{profile.followers_count || 0}</span>{' '}
            <span className="text-slate-500">Followers</span>
          </div>
          <div>
            <span className="font-bold text-white text-base">{profile.following_count || 0}</span>{' '}
            <span className="text-slate-500">Following</span>
          </div>
          {profile.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-400" /> {profile.location}
            </div>
          )}
          {profile.company && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-400" />{' '}
              {profile.current_position ? `${profile.current_position} at ` : ''}
              {profile.company}
            </div>
          )}
        </div>

        {/* Owner Services & Integrations Management Hub */}
        {isOwner && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/20 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" /> Manage Your Services & Integrations
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Add or update what you want to showcase. All services are 100% optional — only what you configure is shown publicly.
                </p>
              </div>
              <Link
                href="/profile/edit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition flex-shrink-0 shadow-md shadow-indigo-600/20"
              >
                <Settings className="w-4 h-4" /> Open Setup Hub
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                href="/profile/edit?tab=integrations"
                className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition flex-shrink-0">
                  <Code2 size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Coding Platforms</span>
                    <ExternalLink size={11} className="text-slate-500 group-hover:text-indigo-400 transition" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    LeetCode, Codeforces, HackerRank, GeeksforGeeks, CodeChef
                  </div>
                  <div className="text-[11px] font-semibold text-indigo-400 mt-2">
                    {activeCodingProfiles.length > 0 ? `${activeCodingProfiles.length} connected` : '+ Connect Handles'}
                  </div>
                </div>
              </Link>

              <Link
                href="/profile/edit?tab=socials"
                className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 transition flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition flex-shrink-0">
                  <Globe size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Social & Portfolio Links</span>
                    <ExternalLink size={11} className="text-slate-500 group-hover:text-purple-400 transition" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    GitHub, LinkedIn, Twitter/X, Personal Website, YouTube
                  </div>
                  <div className="text-[11px] font-semibold text-purple-400 mt-2">
                    {validSocialLinks.length > 0 ? `${validSocialLinks.length} links added` : '+ Add Links'}
                  </div>
                </div>
              </Link>

              <Link
                href="/profile/edit?tab=general"
                className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition flex-shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Bio, Avatar & Skills</span>
                    <ExternalLink size={11} className="text-slate-500 group-hover:text-emerald-400 transition" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Headline, about section, tech stack, avatar and banner
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-400 mt-2">
                    + Edit Details
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Social Links Bar (Shown if user added links) */}
        {validSocialLinks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Social Links</span>
              {isOwner && (
                <Link
                  href="/profile/edit?tab=socials"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Settings size={12} /> Manage Links
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {validSocialLinks.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-xs font-semibold text-slate-300 hover:text-white transition uppercase tracking-wider flex items-center gap-2 shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> {link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section (Shown ONLY if user added skills) */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                Skills & Stack
              </h2>
              {isOwner && (
                <Link
                  href="/profile/edit?tab=general"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Settings size={12} /> Edit Skills
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Competitive Coding Statistics (Shown ONLY if user connected platforms) */}
        {activeCodingProfiles.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" /> Competitive Coding Profiles
              </h2>
              <div className="flex items-center gap-3">
                {codingSummary?.total_solved > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Trophy size={14} />
                    <span>{codingSummary.total_solved} Problems Solved</span>
                  </div>
                )}
                {isOwner && (
                  <Link
                    href="/profile/edit?tab=integrations"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Settings size={12} /> Manage
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeCodingProfiles.map((cp: any) => {
                const stats = cp.stats;
                return (
                  <div
                    key={cp.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-extrabold text-white text-base">{cp.platform}</span>
                        {stats?.ranking > 0 && (
                          <span className="text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            #{stats.ranking.toLocaleString()}
                          </span>
                        )}
                        {stats?.stars && (
                          <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            {stats.stars}
                          </span>
                        )}
                        {stats?.rank && stats.rank !== 'unrated' && (
                          <span className="text-[10px] capitalize font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {stats.rank}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        Synced
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-indigo-400 font-mono">@{cp.external_username}</p>
                      {stats?.total_solved !== undefined && (
                        <div className="text-2xl font-black text-white mt-2">
                          {stats.total_solved} <span className="text-xs font-normal text-slate-400">Solved</span>
                        </div>
                      )}
                    </div>

                    {/* Breakdown for LeetCode */}
                    {stats && cp.platform === 'leetcode' && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="text-[10px] text-emerald-400 font-medium">Easy</div>
                            <div className="text-xs font-bold text-white">{stats.easy_solved || 0}</div>
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="text-[10px] text-amber-400 font-medium">Med</div>
                            <div className="text-xs font-bold text-white">{stats.medium_solved || 0}</div>
                          </div>
                          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <div className="text-[10px] text-rose-400 font-medium">Hard</div>
                            <div className="text-xs font-bold text-white">{stats.hard_solved || 0}</div>
                          </div>
                        </div>
                        {stats.acceptance_rate > 0 && (
                          <div className="text-[11px] text-slate-400 text-right">
                            Acceptance: <span className="text-slate-200 font-medium">{stats.acceptance_rate}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Breakdown for Codeforces */}
                    {stats && cp.platform === 'codeforces' && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Rating:</span>
                          <span className="text-white font-bold">{stats.rating || 0}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Max Rating:</span>
                          <span className="text-indigo-300 font-medium">{stats.max_rating || 0}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Rank:</span>
                          <span className="text-amber-400 capitalize">{stats.rank || 'Unrated'}</span>
                        </div>
                      </div>
                    )}

                    {/* Breakdown for CodeChef */}
                    {stats && cp.platform === 'codechef' && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Current Rating:</span>
                          <span className="text-white font-bold">{stats.current_rating || 0}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Highest Rating:</span>
                          <span className="text-indigo-300 font-medium">{stats.highest_rating || 0}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Division / Stars:</span>
                          <span className="text-amber-400 font-semibold">{stats.stars || '1★'}</span>
                        </div>
                      </div>
                    )}

                    {/* Breakdown for GeeksforGeeks */}
                    {stats && cp.platform === 'geeksforgeeks' && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                        {stats.coding_score !== undefined && (
                          <div className="flex justify-between text-slate-400">
                            <span>Coding Score:</span>
                            <span className="text-white font-bold">{stats.coding_score}</span>
                          </div>
                        )}
                        {stats.institute_rank && (
                          <div className="flex justify-between text-slate-400">
                            <span>Institute Rank:</span>
                            <span className="text-indigo-300 font-medium">{stats.institute_rank}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submission Calendar Heatmap if available */}
            {codingSummary?.submission_calendar && Object.keys(codingSummary.submission_calendar).length > 0 && (
              <div className="pt-2">
                <ContributionHeatmap
                  data={codingSummary.submission_calendar}
                  title="Competitive Coding Activity Calendar"
                />
              </div>
            )}
          </div>
        )}

        {/* GitHub Stats & Repositories (Shown ONLY if GitHub account is connected) */}
        {githubStats && (
          <div className="space-y-6">
            <ContributionHeatmap
              data={githubStats.contribution_calendar || {}}
              title="GitHub Contribution History"
            />

            {githubStats.repositories && githubStats.repositories.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Featured Repositories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {githubStats.repositories.map((repo: any) => (
                    <div
                      key={repo.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex justify-between items-start">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-white hover:text-indigo-400 text-sm transition"
                        >
                          {repo.name}
                        </a>
                        {repo.health_score !== undefined && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> {repo.health_score}/100 Health
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                        {repo.language && (
                          <span className="font-medium text-slate-300">{repo.language}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5 text-blue-400" /> {repo.forks_count || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* About Section (Shown ONLY if user entered about text) */}
        {profile.about && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                About
              </h2>
              {isOwner && (
                <Link
                  href="/profile/edit?tab=general"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Settings size={12} /> Edit
                </Link>
              )}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {profile.about}
            </p>
          </div>
        )}

        {/* Empty state for non-owner visitors */}
        {!isOwner && !hasAnyContent && (
          <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
            <p className="text-slate-400 text-sm">
              @{profile.username} hasn&apos;t added any public services, coding profiles, or social links yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}