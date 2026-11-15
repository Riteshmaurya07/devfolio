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
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function ProfileNavbar({ currentUser, isOwner }: { currentUser: any; isOwner: boolean }) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-[var(--bg-surface)] backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-8 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#d9541e] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Devfolio <span className="text-[#d9541e]">OS</span>
          </span>
        </Link>
        {currentUser && (
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Theme Toggle (Cream Light <-> Black Dark) */}
        <ThemeToggle />

        {currentUser ? (
          <>
            {isOwner && (
              <Link href="/profile/edit">
                <Button variant="primary" size="sm" leftIcon={<Settings className="w-3.5 h-3.5" />}>
                  <span className="hidden sm:inline">Edit Profile & Services</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5 text-[#d9541e]" />}>
                <span>Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.username}
                  className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#d9541e]/15 border border-[#d9541e]/30 flex items-center justify-center text-xs font-bold text-[#d9541e]">
                  {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-xs font-semibold text-[var(--text-primary)] hidden md:inline">
                @{currentUser.username}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
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
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans pb-20 transition-colors duration-200">
      {/* Top Navbar */}
      <ProfileNavbar currentUser={currentUser} isOwner={isOwner} />

      {/* Cover Image Banner */}
      <div className="relative h-56 sm:h-72 w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] overflow-hidden group">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#d9541e]/20 via-[var(--bg-surface)] to-[#d9541e]/10 opacity-90" />
        )}
        {isOwner && (
          <Link
            href="/profile/edit?tab=general"
            className="absolute top-4 right-4 px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)]/90 hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs transition shadow-md"
          >
            <PenLine size={13} />
            <span>Change Cover</span>
          </Link>
        )}
      </div>

      {/* Main Profile Info Section */}
      <div className="max-w-5xl mx-auto px-6 relative -mt-20 z-10 space-y-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl border-4 border-[var(--bg-canvas)] bg-[var(--bg-surface)] overflow-hidden shadow-lg flex-shrink-0 group">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-[#d9541e] bg-[var(--bg-canvas-subtle)]">
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
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  {profile.name || profile.username}
                </h1>
                {isOwner && (
                  <Badge variant="burnt" size="sm">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-[#d9541e] font-mono text-xs sm:text-sm mt-0.5">@{profile.username}</p>
              {profile.bio && (
                <p className="text-[var(--text-secondary)] mt-2 text-sm max-w-xl leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Action buttons on the right of profile header */}
          {isOwner ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/profile/edit">
                <Button variant="primary" size="md" leftIcon={<Settings className="w-4 h-4" />}>
                  <span>Edit Profile & Services</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="md" leftIcon={<LayoutDashboard className="w-4 h-4 text-[#d9541e]" />}>
                  <span>Dashboard</span>
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              variant={following ? 'secondary' : 'primary'}
              size="md"
              onClick={toggleFollow}
              leftIcon={following ? <UserCheck className="w-4 h-4 text-emerald-500" /> : <UserPlus className="w-4 h-4" />}
            >
              {following ? 'Following' : 'Follow Developer'}
            </Button>
          )}
        </div>

        {/* Quick Meta Row (Followers + Location + Company) */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm text-[var(--text-secondary)]">
          <div>
            <span className="font-bold text-[var(--text-primary)] text-base font-mono">{profile.followers_count || 0}</span>{' '}
            <span className="text-[var(--text-muted)]">Followers</span>
          </div>
          <div>
            <span className="font-bold text-[var(--text-primary)] text-base font-mono">{profile.following_count || 0}</span>{' '}
            <span className="text-[var(--text-muted)]">Following</span>
          </div>
          {profile.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#d9541e]" /> {profile.location}
            </div>
          )}
          {profile.company && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#d9541e]" />{' '}
              {profile.current_position ? `${profile.current_position} at ` : ''}
              {profile.company}
            </div>
          )}
        </div>

        {/* Owner Services & Integrations Management Hub */}
        {isOwner && (
          <div className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d9541e]" /> Manage Your Services & Integrations
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Add or update what you want to showcase. All services are 100% optional — only what you configure is shown publicly.
                </p>
              </div>
              <Link href="/profile/edit">
                <Button variant="primary" size="sm" leftIcon={<Settings className="w-3.5 h-3.5" />}>
                  Setup Hub
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                href="/profile/edit?tab=integrations"
                className="p-4 rounded-lg bg-[var(--bg-canvas-subtle)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[#d9541e]/40 transition flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-lg bg-[#d9541e]/10 border border-[#d9541e]/20 text-[#d9541e] group-hover:scale-105 transition flex-shrink-0">
                  <Code2 size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>Coding Platforms</span>
                    <ExternalLink size={11} className="text-[var(--text-muted)] group-hover:text-[#d9541e] transition" />
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                    LeetCode, Codeforces, HackerRank, GeeksforGeeks, CodeChef
                  </div>
                  <div className="text-[11px] font-semibold text-[#d9541e] mt-2">
                    {activeCodingProfiles.length > 0 ? `${activeCodingProfiles.length} connected` : '+ Connect Handles'}
                  </div>
                </div>
              </Link>

              <Link
                href="/profile/edit?tab=socials"
                className="p-4 rounded-lg bg-[var(--bg-canvas-subtle)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[#d9541e]/40 transition flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-lg bg-[#d9541e]/10 border border-[#d9541e]/20 text-[#d9541e] group-hover:scale-105 transition flex-shrink-0">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>Social & Links</span>
                    <ExternalLink size={11} className="text-[var(--text-muted)] group-hover:text-[#d9541e] transition" />
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                    GitHub, LinkedIn, Twitter/X, Personal Website
                  </div>
                  <div className="text-[11px] font-semibold text-[#d9541e] mt-2">
                    {validSocialLinks.length > 0 ? `${validSocialLinks.length} links added` : '+ Add Links'}
                  </div>
                </div>
              </Link>

              <Link
                href="/profile/edit?tab=general"
                className="p-4 rounded-lg bg-[var(--bg-canvas-subtle)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[#d9541e]/40 transition flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-lg bg-[#d9541e]/10 border border-[#d9541e]/20 text-[#d9541e] group-hover:scale-105 transition flex-shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>Bio, Avatar & Skills</span>
                    <ExternalLink size={11} className="text-[var(--text-muted)] group-hover:text-[#d9541e] transition" />
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                    Headline, about section, tech stack, avatar and banner
                  </div>
                  <div className="text-[11px] font-semibold text-[#d9541e] mt-2">
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
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Social & Links</span>
              {isOwner && (
                <Link
                  href="/profile/edit?tab=socials"
                  className="text-xs text-[#d9541e] hover:underline flex items-center gap-1 font-medium"
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
                  className="px-3.5 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#d9541e]/50 text-xs font-semibold text-[var(--text-primary)] transition uppercase tracking-wider flex items-center gap-2 shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5 text-[#d9541e]" /> {link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section (Shown ONLY if user added skills) */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Skills & Tech Stack
              </h2>
              {isOwner && (
                <Link
                  href="/profile/edit?tab=general"
                  className="text-xs text-[#d9541e] hover:underline flex items-center gap-1 font-medium"
                >
                  <Settings size={12} /> Edit Skills
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string, idx: number) => (
                <Badge key={idx} variant="burnt" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Competitive Coding Statistics (Shown ONLY if user connected platforms) */}
        {activeCodingProfiles.length > 0 && (
          <div className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#d9541e]" /> Competitive Coding Statistics
              </h2>
              <div className="flex items-center gap-3">
                {codingSummary?.total_solved > 0 && (
                  <Badge variant="burnt" size="md">
                    <Trophy size={13} className="mr-1" />
                    <span>{codingSummary.total_solved} Problems Solved</span>
                  </Badge>
                )}
                {isOwner && (
                  <Link
                    href="/profile/edit?tab=integrations"
                    className="text-xs text-[#d9541e] hover:underline flex items-center gap-1 font-medium"
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
                    className="p-5 rounded-lg bg-[var(--bg-canvas-subtle)] border border-[var(--border-subtle)] flex flex-col justify-between space-y-3 hover:border-[var(--border-strong)] transition shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-bold text-[var(--text-primary)] text-sm">{cp.platform}</span>
                        {stats?.ranking > 0 && (
                          <Badge variant="neutral" size="sm">
                            #{stats.ranking.toLocaleString()}
                          </Badge>
                        )}
                        {stats?.stars && (
                          <Badge variant="burnt" size="sm">
                            {stats.stars}
                          </Badge>
                        )}
                        {stats?.rank && stats.rank !== 'unrated' && (
                          <Badge variant="neutral" size="sm">
                            {stats.rank}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="success" size="sm">
                        Synced
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs text-[#d9541e] font-mono">@{cp.external_username}</p>
                      {stats?.total_solved !== undefined && (
                        <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-2">
                          {stats.total_solved} <span className="text-xs font-normal text-[var(--text-muted)] font-sans">Solved</span>
                        </div>
                      )}
                    </div>

                    {/* Breakdown for LeetCode */}
                    {stats && cp.platform === 'leetcode' && (
                      <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Easy</div>
                            <div className="text-xs font-bold text-[var(--text-primary)] font-mono">{stats.easy_solved || 0}</div>
                          </div>
                          <div className="p-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Med</div>
                            <div className="text-xs font-bold text-[var(--text-primary)] font-mono">{stats.medium_solved || 0}</div>
                          </div>
                          <div className="p-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Hard</div>
                            <div className="text-xs font-bold text-[var(--text-primary)] font-mono">{stats.hard_solved || 0}</div>
                          </div>
                        </div>
                        {stats.acceptance_rate > 0 && (
                          <div className="text-[11px] text-[var(--text-secondary)] text-right">
                            Acceptance: <span className="text-[var(--text-primary)] font-medium font-mono">{stats.acceptance_rate}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Breakdown for Codeforces */}
                    {stats && cp.platform === 'codeforces' && (
                      <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)] text-xs">
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>Rating:</span>
                          <span className="text-[var(--text-primary)] font-bold font-mono">{stats.rating || 0}</span>
                        </div>
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>Max Rating:</span>
                          <span className="text-[#d9541e] font-medium font-mono">{stats.max_rating || 0}</span>
                        </div>
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>Rank:</span>
                          <span className="text-[var(--text-primary)] capitalize">{stats.rank || 'Unrated'}</span>
                        </div>
                      </div>
                    )}

                    {/* Breakdown for CodeChef */}
                    {stats && cp.platform === 'codechef' && (
                      <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)] text-xs">
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>Current Rating:</span>
                          <span className="text-[var(--text-primary)] font-bold font-mono">{stats.current_rating || 0}</span>
                        </div>
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>Highest Rating:</span>
                          <span className="text-[#d9541e] font-medium font-mono">{stats.highest_rating || 0}</span>
                        </div>
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>Division / Stars:</span>
                          <span className="text-[#d9541e] font-semibold">{stats.stars || '1★'}</span>
                        </div>
                      </div>
                    )}

                    {/* Breakdown for GeeksforGeeks */}
                    {stats && cp.platform === 'geeksforgeeks' && (
                      <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)] text-xs">
                        {stats.coding_score !== undefined && (
                          <div className="flex justify-between text-[var(--text-secondary)]">
                            <span>Coding Score:</span>
                            <span className="text-[var(--text-primary)] font-bold font-mono">{stats.coding_score}</span>
                          </div>
                        )}
                        {stats.institute_rank && (
                          <div className="flex justify-between text-[var(--text-secondary)]">
                            <span>Institute Rank:</span>
                            <span className="text-[#d9541e] font-medium">{stats.institute_rank}</span>
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Featured Repositories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {githubStats.repositories.map((repo: any) => (
                    <div
                      key={repo.id}
                      className="p-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 hover:border-[var(--border-strong)] transition shadow-2xs"
                    >
                      <div className="flex justify-between items-start">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[var(--text-primary)] hover:text-[#d9541e] text-sm transition"
                        >
                          {repo.name}
                        </a>
                        {repo.health_score !== undefined && (
                          <Badge variant="burnt" size="sm">
                            <ShieldCheck className="w-3 h-3 mr-1" /> {repo.health_score}/100 Health
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
                        {repo.language && (
                          <span className="font-medium text-[var(--text-primary)]">{repo.language}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500" /> {repo.stars_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5 text-[#d9541e]" /> {repo.forks_count || 0}
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
          <div className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                About
              </h2>
              {isOwner && (
                <Link
                  href="/profile/edit?tab=general"
                  className="text-xs text-[#d9541e] hover:underline flex items-center gap-1 font-medium"
                >
                  <Settings size={12} /> Edit
                </Link>
              )}
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line">
              {profile.about}
            </p>
          </div>
        )}

        {/* Empty state for non-owner visitors */}
        {!isOwner && !hasAnyContent && (
          <div className="p-12 rounded-lg bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] text-center space-y-3">
            <p className="text-[var(--text-secondary)] text-sm">
              @{profile.username} hasn&apos;t added any public services, coding profiles, or social links yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}