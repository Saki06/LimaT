"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastContainer } from "@/components/ui/toast";
import { LandingView } from "@/components/auth/LandingView";
import {
  StudentDashboard,
  CourseViews,
  AssignmentViews,
  QuizViews,
  ExamViews,
  ResultsView,
  TimetableView,
  StudentProgressView
} from "@/components/student";
import {
  TeacherViews,
  TeacherConnectView,
  SyllabusBuilderView,
  LiveScheduleView
} from "@/components/teacher";
import { ParentDashboardView } from "@/components/parent";
import { AdminViews } from "@/components/admin";
import { SuperAdminPortalView } from "@/components/super-admin";
import { SportsView } from "@/components/sports";
import {
  AnnouncementsView,
  LibraryViews,
  EventsView,
  ConnectView,
  ProfileView
} from "@/components/shared";

export default function HomePage() {
  const { currentRole, currentView, theme, isLanding, setIsLanding, isSessionLoaded } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // While restoring session from localStorage/URL, show seamless loader to avoid flash
  if (!isSessionLoaded) {
    return (
      <div className={`flex h-screen w-screen items-center justify-center ${theme === "dark" ? "dark bg-slate-950" : "bg-slate-50"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0d5c4d] border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If user requests landing page
  if (isLanding) {
    return (
      <div className={theme === "dark" ? "dark bg-slate-950" : "bg-slate-50"}>
        <LandingView onEnterApp={() => setIsLanding(false)} />
        <ToastContainer />
      </div>
    );
  }

  // Render view by role & route
  const renderCurrentView = () => {
    // Shared / Role Specific View Routing
    if (currentRole === "student") {
      switch (currentView) {
        case "dashboard":
          return <StudentDashboard />;
        case "profile":
          return <ProfileView />;
        case "connect":
          return <ConnectView />;
        case "my_learning":
        case "courses":
          return <CourseViews />;
        case "assignments":
          return <AssignmentViews />;
        case "quizzes":
          return <QuizViews />;
        case "exams":
          return <ExamViews />;
        case "past_papers":
        case "pastPapers":
          return <LibraryViews key="past_papers" initialTab="past_papers" />;
        case "results":
          return <ResultsView />;
        case "progress":
          return <StudentProgressView />;
        case "library":
          return <LibraryViews key="library" initialTab="all" />;
        case "school_life":
        case "sports":
        case "sports_tournaments":
          return <SportsView key="tournaments" initialTab="tournaments" />;
        case "sports_teams":
          return <SportsView key="teams" initialTab="teams" />;
        case "sports_registration":
          return <SportsView key="registration" initialTab="registration" />;
        case "sports_check":
          return <SportsView key="check_registration" initialTab="check_registration" />;
        case "sports_fixtures":
          return <SportsView key="fixtures" initialTab="fixtures" />;
        case "sports_standings":
          return <SportsView key="standings" initialTab="standings" />;
        case "events":
          return <EventsView />;
        case "timetable":
        case "student_timetable":
          return <TimetableView />;
        case "live_schedule":
        case "liveSchedule":
          return <LiveScheduleView />;
        case "announcements":
          return <AnnouncementsView />;
        default:
          return <StudentDashboard />;
      }
    } else if (currentRole === "teacher") {
      switch (currentView) {
        case "dashboard":
          return <TeacherViews initialTab="home" />;
        case "live_schedule":
        case "liveSchedule":
          return <LiveScheduleView />;
        case "profile":
          return <ProfileView />;
        case "connect":
          return <TeacherConnectView />;
        case "submissions":
          return <TeacherViews initialTab="grading" />;
        case "assignments":
          return <TeacherViews initialTab="assignments" initialSubTab="assignments" />;
        case "quizzes":
          return <TeacherViews initialTab="assignments" initialSubTab="quizzes" />;
        case "courses":
        case "syllabus":
        case "course-detail":
        case "course_detail":
        case "syllabus_builder":
          return <SyllabusBuilderView />;
        case "past_papers":
        case "pastPapers":
        case "library":
        case "resources":
        case "materials":
        case "tutes":
          return <TeacherViews initialTab="assignments" initialSubTab="resources" />;
        case "batches":
        case "announcements":
          return <AnnouncementsView />;
        case "connect_admin":
          return <AdminViews initialTab="connect" />;
        case "analytics":
          return <TeacherViews initialTab="analytics" />;
        case "sports":
        case "sports_tournaments":
          return <SportsView key="tournaments" initialTab="tournaments" />;
        case "sports_teams":
          return <SportsView key="teams" initialTab="teams" />;
        case "sports_registration":
          return <SportsView key="registration" initialTab="registration" />;
        case "sports_check":
          return <SportsView key="check_registration" initialTab="check_registration" />;
        case "sports_fixtures":
          return <SportsView key="fixtures" initialTab="fixtures" />;
        case "sports_standings":
          return <SportsView key="standings" initialTab="standings" />;
        case "sports_admin":
        case "sports_registrations":
          return <SportsView key="admin_reg" initialTab="admin_registrations" />;
        default:
          return <TeacherViews initialTab="home" />;
      }
    } else if (currentRole === "parent") {
      switch (currentView) {
        case "profile":
          return <ProfileView />;
        case "connect":
          return <ConnectView />;
        case "school_life":
        case "sports":
        case "sports_tournaments":
          return <SportsView key="tournaments" initialTab="tournaments" />;
        case "sports_teams":
          return <SportsView key="teams" initialTab="teams" />;
        case "sports_registration":
          return <SportsView key="registration" initialTab="registration" />;
        case "sports_check":
          return <SportsView key="check_registration" initialTab="check_registration" />;
        case "sports_fixtures":
          return <SportsView key="fixtures" initialTab="fixtures" />;
        case "sports_standings":
          return <SportsView key="standings" initialTab="standings" />;
        default:
          return <ParentDashboardView />;
      }
    } else if (currentRole === "super_admin") {
      // Platform Owner Super Admin Master Portal
      switch (currentView) {
        case "profile":
          return <ProfileView />;
        case "super_admin_matrix":
        case "feature_matrix":
          return <SuperAdminPortalView initialTab="feature_matrix" />;
        case "super_admin_pricing":
        case "pricing_plans":
          return <SuperAdminPortalView initialTab="pricing_plans" />;
        case "super_admin_tenants":
        case "super_admin_portal":
        case "dashboard":
        default:
          return <SuperAdminPortalView initialTab="tenants" />;
      }
    } else {
      // Administrator
      switch (currentView) {
        case "dashboard":
          return <AdminViews initialTab="overview" />;
        case "live_schedule":
        case "liveSchedule":
          return <LiveScheduleView />;
        case "profile":
          return <ProfileView />;
        case "connect":
          return <ConnectView />;
        case "schools":
          return <AdminViews initialTab="schools" />;
        case "classes":
          return <AdminViews initialTab="classes" />;
        case "manage_staff":
        case "staff_teachers":
        case "staff_coaches":
          return <AdminViews initialTab="staff" />;
        case "curriculum":
        case "subjects":
          return <AdminViews initialTab="subjects" />;
        case "users":
          return <AdminViews initialTab="users" />;
        case "library":
          return <LibraryViews initialTab="manage" />;
        case "connect_admin":
          return <AdminViews initialTab="connect" />;
        case "settings":
        case "admin_settings":
          return <AdminViews initialTab="settings" />;
        case "announcements":
          return <AnnouncementsView />;
        case "timetable":
          return <TimetableView />;
        case "sports":
        case "sports_tournaments":
          return <SportsView key="tournaments" initialTab="tournaments" />;
        case "sports_teams":
          return <SportsView key="teams" initialTab="teams" />;
        case "sports_registration":
          return <SportsView key="registration" initialTab="registration" />;
        case "sports_check":
          return <SportsView key="check_registration" initialTab="check_registration" />;
        case "sports_fixtures":
          return <SportsView key="fixtures" initialTab="fixtures" />;
        case "sports_standings":
          return <SportsView key="standings" initialTab="standings" />;
        case "sports_admin":
        case "sports_registrations":
          return <SportsView key="admin_reg" initialTab="admin_registrations" />;
        default:
          return <AdminViews initialTab="overview" />;
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#fbfcfb] text-[#0d2b26]">
      {/* Navbar - Permanently Anchored & Fixed at top */}
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      {/* Main Content Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden bg-[#f4f7f5]">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-[#f4f7f5]">
          <div className="max-w-7xl mx-auto">{renderCurrentView()}</div>
        </main>
      </div>

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
}
