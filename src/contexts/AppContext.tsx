'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Challenge, FilterState } from '@/lib/types';
// Import removed due to module issues - implementing locally

// Apply filters to challenge dataset
function applyFilters(challenges: Challenge[], filters: FilterState): Challenge[] {
  return challenges.filter(challenge => {
    // Sector filter
    if (filters.sectors && filters.sectors.length > 0) {
      if (!filters.sectors.includes(challenge.sector.primary)) {
        return false;
      }
    }
    
    // Problem type filter
    if (filters.problemTypes && filters.problemTypes.length > 0) {
      if (!filters.problemTypes.includes(challenge.problem_type.primary)) {
        return false;
      }
    }
    
    // Budget range filter
    if (filters.budgetRange && challenge.funding.amount_max) {
      const [min, max] = filters.budgetRange;
      if (challenge.funding.amount_max < min || challenge.funding.amount_max > max) {
        return false;
      }
    }
    
    // Urgency filter
    if (filters.urgentOnly) {
      if (challenge.timeline.urgency !== 'critical') {
        return false;
      }
    }
    
    // Keywords filter
    if (filters.keywords && filters.keywords.trim()) {
      const searchTerm = filters.keywords.toLowerCase();
      const matchesKeywords = challenge.keywords.some(k => k.toLowerCase().includes(searchTerm));
      const matchesTitle = challenge.title.toLowerCase().includes(searchTerm);
      const matchesDescription = challenge.description.toLowerCase().includes(searchTerm);
      
      if (!matchesKeywords && !matchesTitle && !matchesDescription) {
        return false;
      }
    }
    
    return true;
  });
}

interface AppContextType {
  challenges: Challenge[];
  filteredChallenges: Challenge[];
  filters: FilterState;
  selectedChallenge: Challenge | null;
  setFilters: (filters: FilterState) => void;
  setSelectedChallenge: (challenge: Challenge | null) => void;
  setChallenges: (challenges: Challenge[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialFilters: FilterState = {
  sectors: [],
  problemTypes: [],
  budgetRange: [0, 50000000],
  urgentOnly: false,
  keywords: ''
};

interface AppProviderProps {
  children: ReactNode;
  initialChallenges?: Challenge[];
}

export function AppProvider({ children, initialChallenges = [] }: AppProviderProps) {
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Apply filters to get filtered challenges
  const filteredChallenges = applyFilters(challenges, filters);

  const value: AppContextType = {
    challenges,
    filteredChallenges,
    filters,
    selectedChallenge,
    setFilters,
    setSelectedChallenge,
    setChallenges
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;