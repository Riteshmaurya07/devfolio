'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goalsList = [
    { id: 'track_progress', label: 'Track coding progress' },
    { id: 'smart_resume', label: 'Build a smart resume' },
    { id: 'mock_interviews', label: 'Practice with AI mock interviews' }
  ];

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // POST to /users/me/onboard
      const response = await api.post('/users/me/onboard', {
        goals: selectedGoals,
        preferences: {}
      });

      const { user: updatedUser, access_token } = response.data;
      
      // Update token cookie
      document.cookie = `token=${access_token}; path=/; max-age=2592000`;
      
      // Update store
      login(updatedUser, access_token);
      
      toast.success('Onboarding complete!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Devfolio OS! 🚀
          </h2>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Let's personalize your experience. What are your main goals?
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {goalsList.map(goal => (
            <div 
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between ${
                selectedGoals.includes(goal.id) 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'
              }`}
            >
              <span className={`text-base font-medium ${selectedGoals.includes(goal.id) ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {goal.label}
              </span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedGoals.includes(goal.id) ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}>
                {selectedGoals.includes(goal.id) && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6">
          <button
            onClick={handleComplete}
            disabled={loading || selectedGoals.length === 0}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 transition-all ${
              (loading || selectedGoals.length === 0) ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Setting things up...' : 'Get Started →'}
          </button>
        </div>
      </div>
    </div>
  );
}
