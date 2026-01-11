'use client';

import React, { useState, useEffect } from 'react';
import { AuthPage } from '@/components/auth/AuthPage';
import { OnboardingQuiz } from '@/components/onboarding/OnboardingQuiz';
import { Loader2 } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { DateSelector } from '@/components/home/DateSelector';
import { CalorieRing } from '@/components/home/CalorieRing';
import { MacroBars } from '@/components/home/MacroBars';
import { WaterTracker } from '@/components/home/WaterTracker';
import { HistoryFeed } from '@/components/home/HistoryFeed';
import { ScanModal } from '@/components/scan/ScanModal';
import { ProfileTab } from '@/components/profile/ProfileTab';
import { BMICard } from '@/components/progress/BMICard';
import { NutritionChart } from '@/components/progress/NutritionChart';
import { CalorieChart } from '@/components/progress/CalorieChart';
import { WeightGoalChart } from '@/components/progress/WeightGoalChart';
import { BurnTab } from '@/components/burn/BurnTab';
import { NutritionTab } from '@/components/nutrition/NutritionTab';
import { Calendar, ChevronDown, Check, Flame, User, ScanLine } from 'lucide-react';
import { FullScreenCalendar } from '@/components/ui/FullScreenCalendar';
import { useUserContext } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { cn, formatDateForDB } from '@/lib/utils';

type Tab = 'diary' | 'progress' | 'scan' | 'burn' | 'nutrition' | 'profile';
type StatsRange = 'week' | 'month' | 'year';

export default function Home() {
  const { user, profile, goals, loading, onboardingComplete, completeOnboarding } = useUserContext();

  const [activeTab, setActiveTab] = useState<Tab>('diary');

  // App State
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // App State - Initialized with real calculated goals
  const [waterIntake, setWaterIntake] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [dailyMacros, setDailyMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0
  });

  const [statsRange, setStatsRange] = useState<StatsRange>('week');
  const [isRangeSelectorOpen, setIsRangeSelectorOpen] = useState(false);

  // Fetch logs when date changes, user loads, or tab changes (to sync data from other tabs)
  useEffect(() => {
    if (user && activeTab === 'diary') {
      fetchDailyLogs();
    }
  }, [user, selectedDate, activeTab]);

  const fetchDailyLogs = async () => {
    if (!user) return;

    try {
      // Robust Date String - Local Time
      const dateString = formatDateForDB(selectedDate);
      console.log("Fetching logs for date:", dateString); // Debug log

      // Fetch Meals (using explicit date column)
      let mealsData: any[] = [];
      const { data: fetchedMeals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateString)
        .order('created_at', { ascending: false });

      if (mealsError) {
        console.error("Error fetching meals:", mealsError);
      } else if (fetchedMeals) {
        mealsData = fetchedMeals;
      }

      // Fetch Water (using explicit date column)
      let waterData: any[] = [];
      const { data: fetchedWater, error: waterError } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateString)
        .order('created_at', { ascending: false });

      if (waterError) {
        console.error("Error fetching water:", waterError);
      } else if (fetchedWater) {
        waterData = fetchedWater;
      }

      // Process Data
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      const historyItems: any[] = [];

      mealsData.forEach(meal => {
        totalCalories += meal.calories;
        totalProtein += meal.protein || 0;
        totalCarbs += meal.carbs || 0;
        totalFat += meal.fat || 0;

        historyItems.push({
          id: meal.id,
          type: 'meal',
          title: meal.title,
          subtitle: `${meal.calories} kcal`,
          time: new Date(meal.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(meal.created_at).getTime(),
          // Filter out ephemeral blob URLs that might have been saved during errors
          imageUrl: meal.image_url && !meal.image_url.startsWith('blob:') ? meal.image_url : null,
          macros: {
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat
          }
        });
      });

      let totalWater = 0;
      waterData.forEach(log => {
        totalWater += log.amount;
        historyItems.push({
          id: log.id,
          type: 'water',
          title: 'Água',
          subtitle: `${log.amount} ml`,
          time: new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(log.created_at).getTime()
        });
      });

      // Sort history by real timestamp (descending)
      historyItems.sort((a, b) => b.timestamp - a.timestamp);

      setConsumedCalories(totalCalories);
      setDailyMacros({
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      });
      setWaterIntake(totalWater);
      setHistory(historyItems);
    } catch (error: any) {
      console.error("Critical error in fetchDailyLogs:", error);
    }
  };

  const handleWaterAdd = async (amount: number) => {
    if (!user) return;

    // Optimistic Update
    setWaterIntake(prev => prev + amount);

    try {
      const { error } = await supabase.from('water_logs').insert({
        user_id: user.id,
        amount: amount,
        date: formatDateForDB(selectedDate), // Use currently selected date
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      fetchDailyLogs(); // Refresh to ensure sync
    } catch (error: any) {
      console.error("Error adding water:", error);
      // Revert optimistic update on error
      setWaterIntake(prev => Math.max(0, prev - amount));
    }
  };

  const handleMealAdd = async (meal: any) => {
    if (!user) return;

    // Optimistic Update (partial)
    setConsumedCalories(prev => prev + meal.calories);

    try {
      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        title: meal.title,
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
        image_url: meal.image,
        date: formatDateForDB(selectedDate), // Use currently selected date
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      fetchDailyLogs();
    } catch (error: any) {
      console.error("Error adding meal:", error);
      // Revert optimistic update (approximate)
      setConsumedCalories(prev => Math.max(0, prev - meal.calories));
    }
  };

  // Mock data for charts (to be replaced with DB later)
  const chartData = [
    { day: 8, value: 1200 },
    { day: 9, value: 2100 },
    { day: 10, value: 1800 },
    { day: 11, value: 2200 },
    { day: 12, value: 1950 },
    { day: 13, value: consumedCalories }, // Today dynamic
    { day: 14, value: 0 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'diary':
        return (
          <div className="space-y-4">
            {/* Logo Header */}
            <div className="relative flex items-center justify-center gap-2 pt-2 pb-2">
              <Flame className="text-orange-500 fill-orange-500" size={28} />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                BurnCal
              </span>

              <button
                onClick={() => setActiveTab('profile')}
                className="absolute right-0 p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <User size={24} />
              </button>
            </div>

            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            <div
              className="rounded-3xl p-5 animate-fade-in bg-[var(--card)] shadow-lg border border-[var(--border)]"
            >
              <CalorieRing
                remaining={Math.max(0, goals.dailyCalories - consumedCalories)}
                consumed={consumedCalories}
                burned={caloriesBurned}
                goal={goals.dailyCalories}
                streak={1}
              />

              <MacroBars
                protein={{ current: dailyMacros.protein, goal: goals.macros.protein }}
                carbs={{ current: dailyMacros.carbs, goal: goals.macros.carbs }}
                fat={{ current: dailyMacros.fat, goal: goals.macros.fat }}
              />
            </div>

            <WaterTracker
              current={waterIntake}
              goal={goals.water}
              onAdd={handleWaterAdd}
            />

            <HistoryFeed entries={history} />

            {/* Floating Action Button for Scan */}
            {/* Floating Action Button for Scan */}
            <button
              onClick={() => setIsScanOpen(true)}
              className="fixed bottom-28 right-4 w-16 h-16 rounded-full bg-[var(--foreground)] dark:bg-[#1c1c1e] border-2 border-[var(--background)] dark:border-white/20 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 hover:border-orange-500/50 hover:shadow-orange-500/20 active:scale-95 z-50 group"
            >
              <ScanLine size={32} className="text-[var(--background)] dark:text-white group-hover:text-orange-500 transition-colors" />
            </button>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center animate-fade-in relative z-20">
              <div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">Estatísticas</h1>
                <p className="text-sm text-[var(--muted)] mt-1">dez. 8 - dez. 14</p>
              </div>

              <button
                onClick={() => setIsCalendarOpen(true)}
                className="p-3 rounded-xl bg-[var(--card)] text-orange-500 border border-[var(--border)] hover:border-orange-500/50 transition-all active:scale-95 shadow-sm"
              >
                <Calendar size={20} />
              </button>
            </div>

            <FullScreenCalendar
              isOpen={isCalendarOpen}
              onClose={() => setIsCalendarOpen(false)}
              onRangeSelect={(range) => console.log(range)}
            />

            <BMICard weight={profile.weight} height={profile.height} />

            <WeightGoalChart
              currentWeight={profile.weight}
              startWeight={98.5} // Static start for now
              goalWeight={85.0}  // Static goal for now
            />

            <NutritionChart
              carbs={dailyMacros.carbs}
              protein={dailyMacros.protein}
              fat={dailyMacros.fat}
            />
          </div>
        );

      case 'burn':
        return <BurnTab />;

      case 'nutrition':
        return <NutritionTab date={selectedDate} />;

      case 'profile':
        return <ProfileTab />;

      default:
        return null;
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f14]">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Show onboarding quiz for new users
  if (!onboardingComplete) {
    return <OnboardingQuiz onComplete={completeOnboarding} />;
  }

  // Main app
  return (
    <main
      className="min-h-screen pb-24 bg-[var(--background)] transition-colors duration-300"
    >
      <div className="max-w-md mx-auto px-4 py-4">
        {renderContent()}
      </div>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onWaterAdd={handleWaterAdd}
        onMealAdd={handleMealAdd}
      />
    </main>
  );
}
