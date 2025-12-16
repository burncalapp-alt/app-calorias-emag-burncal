'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Types
export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle';

export interface UserProfile {
    name: string;
    gender: Gender;
    age: number;
    height: number; // cm
    weight: number; // kg
    targetWeight: number; // kg
    activityLevel: ActivityLevel;
    goal: Goal;
}

export interface CalculatedGoals {
    bmr: number;
    tdee: number;
    dailyCalories: number;
    water: number; // ml
    macros: {
        protein: number; // grams
        carbs: number; // grams
        fat: number; // grams
    }
}

interface UserContextType {
    user: Session['user'] | null;
    profile: UserProfile;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    goals: CalculatedGoals;
    loading: boolean;
    onboardingComplete: boolean;
    completeOnboarding: (data: any) => Promise<void>;
    signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Default Profile (placeholder until onboarding/fetch)
const DEFAULT_PROFILE: UserProfile = {
    name: 'Usuário',
    gender: 'male',
    age: 26,
    height: 170,
    weight: 70,
    targetWeight: 65,
    activityLevel: 'moderate',
    goal: 'lose_weight'
};

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Session['user'] | null>(null);
    const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
    const [goals, setGoals] = useState<CalculatedGoals>(calculateGoals(DEFAULT_PROFILE));
    const [loading, setLoading] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState(true); // Default true for existing users

    // 1. Listen for Auth Changes
    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(DEFAULT_PROFILE);
                setOnboardingComplete(true);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Fetch Profile from Supabase
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile({
                    name: data.name || 'Usuário',
                    gender: data.gender || 'male',
                    age: data.age || 25,
                    height: Number(data.height) || 170,
                    weight: Number(data.weight) || 70,
                    targetWeight: Number(data.target_weight) || 65,
                    activityLevel: data.activity_level || 'moderate',
                    goal: data.goal || 'lose_weight'
                });
                setOnboardingComplete(data.onboarding_complete ?? false);
            } else {
                // New user - no profile yet
                setOnboardingComplete(false);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setOnboardingComplete(false);
        } finally {
            setLoading(false);
        }
    };

    // 3. Update Goals whenever profile changes
    useEffect(() => {
        setGoals(calculateGoals(profile));
    }, [profile]);

    // 4. Update Profile Function
    const updateProfile = async (data: Partial<UserProfile>) => {
        // Optimistic update
        const newProfile = { ...profile, ...data };
        setProfile(newProfile);

        if (user) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        name: newProfile.name,
                        gender: newProfile.gender,
                        age: newProfile.age,
                        height: newProfile.height,
                        weight: newProfile.weight,
                        target_weight: newProfile.targetWeight,
                        activity_level: newProfile.activityLevel,
                        goal: newProfile.goal
                    })
                    .eq('id', user.id);

                if (error) throw error;

                // If weight changed, log to weight_history
                if (data.weight) {
                    await supabase.from('weight_history').insert({
                        user_id: user.id,
                        weight: data.weight,
                        date: new Date().toISOString().split('T')[0]
                    });
                }

            } catch (error) {
                console.error('Error saving profile:', error);
            }
        }
    };

    // 5. Complete Onboarding Function
    const completeOnboarding = async (quizData: any) => {
        if (!user) return;

        // Calculate age from birthDate
        const birthDate = new Date(quizData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Map workout frequency to activity level
        const activityMap: Record<string, ActivityLevel> = {
            '0-2': 'light',
            '3-5': 'moderate',
            '6+': 'active'
        };

        // Map goal
        const goalMap: Record<string, Goal> = {
            'lose_weight': 'lose_weight',
            'gain_definition': 'lose_weight',
            'maintain': 'maintain',
            'gain_muscle': 'gain_muscle'
        };

        const newProfile: UserProfile = {
            name: 'Usuário',
            gender: quizData.gender,
            age,
            height: quizData.height,
            weight: quizData.weight,
            targetWeight: quizData.targetWeight,
            activityLevel: activityMap[quizData.workoutFrequency] || 'moderate',
            goal: goalMap[quizData.goal] || 'lose_weight'
        };

        setProfile(newProfile);
        setOnboardingComplete(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    name: newProfile.name,
                    gender: newProfile.gender,
                    age: newProfile.age,
                    height: newProfile.height,
                    weight: newProfile.weight,
                    target_weight: newProfile.targetWeight,
                    activity_level: newProfile.activityLevel,
                    goal: newProfile.goal,
                    onboarding_complete: true,
                    workout_type: quizData.workoutType?.join(','),
                    workout_frequency: quizData.workoutFrequency,
                    birth_date: quizData.birthDate
                });

            if (error) throw error;

            // Log initial weight
            await supabase.from('weight_history').insert({
                user_id: user.id,
                weight: newProfile.weight,
                date: new Date().toISOString().split('T')[0]
            });

        } catch (error) {
            console.error('Error saving onboarding data:', error);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <UserContext.Provider value={{ user, profile, updateProfile, goals, loading, onboardingComplete, completeOnboarding, signOut }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
}

// --- Calculation Logic ---

function calculateGoals(profile: UserProfile): CalculatedGoals {
    const { gender, weight, height, age, activityLevel, goal } = profile;

    // 1. Calculate BMR (Mifflin-St Jeor)
    // Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
    // Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;

    // 2. Calculate TDEE (Activity Multiplier)
    const multipliers: Record<ActivityLevel, number> = {
        sedentary: 1.2,      // Little to no exercise
        light: 1.375,        // Light exercise 1-3 days/week
        moderate: 1.55,      // Moderate exercise 3-5 days/week
        active: 1.725,       // Hard exercise 6-7 days/week
        very_active: 1.9     // Very hard exercise/physical job
    };
    const tdee = bmr * multipliers[activityLevel];

    // 3. Target Calories based on Goal
    let dailyCalories = tdee;
    if (goal === 'lose_weight') dailyCalories -= 500; // Deficit
    else if (goal === 'gain_muscle') dailyCalories += 300; // Surplus
    // 'maintain' keeps TDEE

    dailyCalories = Math.round(dailyCalories);

    // 4. Water Goal (35ml per kg)
    const water = Math.round(weight * 35);

    // 5. Macro Split (Simplified)
    // Protein: 2g per kg of bodyweight
    // Fat: 1g per kg (approx 25-30% of energy)
    // Carbs: Remaining calories
    const proteinGrams = Math.round(weight * 2.0); // High protein for satiety/muscle
    const fatGrams = Math.round(weight * 1.0); // Healthy fats

    // 1g Protein = 4kcal, 1g Fat = 9kcal
    const proteinCals = proteinGrams * 4;
    const fatCals = fatGrams * 9;

    const remainingCals = dailyCalories - proteinCals - fatCals;
    const carbsGrams = Math.max(0, Math.round(remainingCals / 4));

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        dailyCalories,
        water,
        macros: {
            protein: proteinGrams,
            fat: fatGrams,
            carbs: carbsGrams
        }
    };
}
