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
  const { currentRole, currentView, theme, isLanding, setIsLanding } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        case "exams":
          return <QuizViews />;
        case "past_papers":
        case "pastPapers":
          return <LibraryViews key="past_papers" initialTab="past_papers" />;
        case "results":
        case "progress":
          return <ExamViews />;
        case "library":
          return <LibraryViews key="library" initialTab="all" />;
        case "school_life":
        case "sports":
        case "sports_tournaments":
          return <SportsView key="tournaments" initialTab="tournaments" />;
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
          return <ConnectView />;
        case "submissions":
          return <TeacherViews initialTab="grading" />;
        case "assignments":
        case "quizzes":
          return <TeacherViews initialTab="assignments" />;
        case "courses":
        case "syllabus":
          return <SyllabusBuilderView />;
        case "past_papers":
        case "pastPapers":
          return <LibraryViews key="past_papers" initialTab="past_papers" />;
        case "library":
          return <LibraryViews key="library_manage" initialTab="manage" />;
        case "batches":
        case "announcements":
          return <AnnouncementsView />;
        case "connect_admin":
          return <AdminViews initialTab="connect" />;
        case "sports":
        case "sports_tournaments":
          return <SportsView key="tournaments" initialTab="tournaments" />;
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
          return <TeacherViews initialTab="grading" />;
      }
    } else if (currentRole === "parent") {
      switch (currentView) {
        case "connect":
          return <ConnectView />;
        case "school_life":
        case "sports":
        case "sports_tournaments":
          return <SportsView key="tournaments" initialTab="tournaments" />;
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
          return <AdminViews initialTab="overview" />;
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
        case "sports":
        case "sports_tournaments":
          return <SportsView key="tournaments" initialTab="tournaments" />;
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
