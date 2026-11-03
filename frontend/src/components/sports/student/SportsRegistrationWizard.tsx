"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  Trophy,
  ShieldCheck,
  CreditCard,
  Printer,
  Sparkles,
  Check,
  Edit2,
  X,
  FileText,
  Download,
  Users,
  Plus,
  Trash2,
  Key,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChampionshipSportItem,
  StoredAthleteRegistration,
  SquadPlayer,
  TeamSquadDetails
} from "@/components/sports/sportsRegistrationData";

interface SportsRegistrationWizardProps {
  championshipSports: ChampionshipSportItem[];
  onRegistrationComplete: (registration: StoredAthleteRegistration) => Promise<{ success: boolean; message?: string }>;
  onCancel: () => void;
  currentUser?: { name?: string; role?: string; email?: string } | null;
}

export function SportsRegistrationWizard({
  championshipSports,
  onRegistrationComplete,
  onCancel,
  currentUser
}: SportsRegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Contact
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState(currentUser?.email || "");

  // STEP 2: Athlete Personal Details
  const nameParts = (currentUser?.name || "").trim().split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" "));
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"Boys" | "Girls" | "Mixed">("Boys");
  const [nicOrStudentId, setNicOrStudentId] = useState("");

  // Calculate age automatically from DOB
  const calculatedAge = useMemo(() => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  }, [dob]);

  // STEP 3: School Information (Province -> District -> School hierarchy)
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolGrade, setSchoolGrade] = useState("");
  const [schoolType, setSchoolType] = useState("National School (1AB)");

  // STEP 4: Sport Selection (Multi-select)
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([]);

  // STEP 5: Event Selection
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  // STEP 7: Team Sport Squad Roster States
  const [isTeamInterest, setIsTeamInterest] = useState(false);
  const [teamRegistrationMode, setTeamRegistrationMode] = useState<"captain" | "join_code" | "individual">("captain");
  const [teamName, setTeamName] = useState("");
  const [teamCoachName, setTeamCoachName] = useState("");
  const [teamCoachPhone, setTeamCoachPhone] = useState("");
  const [enteredTeamCode, setEnteredTeamCode] = useState("");
  const [squadPlayers, setSquadPlayers] = useState<SquadPlayer[]>([]);

  // Sync Captain (Player 1) with athlete registrant's name & ID
  React.useEffect(() => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      setSquadPlayers((prev) => {
        if (prev.length === 0) {
          return [          { id: "1", name: fullName, jerseyNumber: "1", role: "Captain", nicOrStudentId }];
        }
        return prev.map((pl, idx) => (idx === 0 ? { ...pl, name: fullName, nicOrStudentId } : pl));
      });
    }
  }, [firstName, lastName, nicOrStudentId]);

  // Set default team name from selected school
  React.useEffect(() => {
    if (selectedSchool && !teamName) {
      setTeamName(`${selectedSchool} Championship Squad`);
    }
  }, [selectedSchool]);

  const hasTeamSportSelected = useMemo(() => {
    return selectedSportIds.some((id) => {
      const sp = championshipSports.find((s) => s.id === id);
      return sp?.isTeamSport;
    });
  }, [championshipSports, selectedSportIds]);

  const handleAddSquadPlayer = () => {
    const nextNum = squadPlayers.length + 1;
    setSquadPlayers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        jerseyNumber: nextNum < 10 ? `0${nextNum}` : `${nextNum}`,
        role: "Squad Player",
        nicOrStudentId: ""
      }
    ]);
  };

  const handleUpdateSquadPlayer = (id: string, field: keyof SquadPlayer, value: string) => {
    setSquadPlayers((prev) =>
      prev.map((pl) => (pl.id === id ? { ...pl, [field]: value } : pl))
    );
  };

  const handleRemoveSquadPlayer = (id: string) => {
    if (squadPlayers.length <= 1) return;
    setSquadPlayers((prev) => prev.filter((pl) => pl.id !== id));
  };

  const handleFillStandard11Squad = () => {
    setSquadPlayers(Array.from({ length: 11 }, (_, index) => ({
      id: `player-${index + 1}`,
      name: index === 0 ? `${firstName} ${lastName}`.trim() : "",
      jerseyNumber: String(index + 1),
      role: index === 0 ? "Captain" : "Squad Player",
      nicOrStudentId: index === 0 ? nicOrStudentId : "",
    })));
  };

  // STEP 8: Parent / Guardian Details (Mandatory for minors < 18)
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [guardianMobile, setGuardianMobile] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);

  // STEP 10: Payment Simulation & Confirmed Registration ID
  const [confirmedRecord, setConfirmedRecord] = useState<StoredAthleteRegistration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  // Find all chosen events objects
  const allChosenEvents = useMemo(() => {
    const events: {
      id: string;
      sportName: string;
      eventName: string;
      ageCategory: string;
      gender: string;
      fee: number;
    }[] = [];

    championshipSports.forEach((sport) => {
      sport.events.forEach((ev) => {
        if (selectedEventIds.includes(ev.id)) {
          events.push({
            id: ev.id,
            sportName: sport.name,
            eventName: ev.name,
            ageCategory: ev.ageCategory,
            gender: ev.gender,
            fee: ev.fee
          });
        }
      });
    });
    return events;
  }, [championshipSports, selectedEventIds]);

  // Total entry fee
  const totalAmount = useMemo(() => {
    return allChosenEvents.reduce((acc, curr) => acc + curr.fee, 0);
  }, [allChosenEvents]);

  // Eligibility check logic (STEP 6)
  const eligibilityErrors = useMemo(() => {
    const errors: string[] = [];
    allChosenEvents.forEach((ev) => {
      // Age check
      if (ev.ageCategory === "U12" && calculatedAge > 12) {
        errors.push(`${ev.sportName} - ${ev.eventName}: Age ${calculatedAge} exceeds Under-12 limit.`);
      } else if (ev.ageCategory === "U14" && calculatedAge > 14) {
        errors.push(`${ev.sportName} - ${ev.eventName}: Age ${calculatedAge} exceeds Under-14 limit.`);
      } else if (ev.ageCategory === "U16" && calculatedAge > 16) {
        errors.push(`${ev.sportName} - ${ev.eventName}: Age ${calculatedAge} exceeds Under-16 limit.`);
      } else if (ev.ageCategory === "U18" && calculatedAge > 18) {
        errors.push(`${ev.sportName} - ${ev.eventName}: Age ${calculatedAge} exceeds Under-18 limit.`);
      }

      // Gender check
      if (ev.gender === "Boys" && gender === "Girls") {
        errors.push(`${ev.sportName} - ${ev.eventName}: Restricted to Boys category.`);
      } else if (ev.gender === "Girls" && gender === "Boys") {
        errors.push(`${ev.sportName} - ${ev.eventName}: Restricted to Girls category.`);
      }
    });
    return errors;
  }, [allChosenEvents, calculatedAge, gender]);

  // Toggle sport selection
  const handleToggleSport = (sportId: string) => {
    setSelectedSportIds((prev) => {
      if (prev.includes(sportId)) {
        // remove sport and remove its events
        const sport = championshipSports.find((s) => s.id === sportId);
        if (sport) {
          const sportEventIds = sport.events.map((e) => e.id);
          setSelectedEventIds((evIds) => evIds.filter((id) => !sportEventIds.includes(id)));
        }
        return prev.filter((id) => id !== sportId);
      } else {
        return [...prev, sportId];
      }
    });
  };

  // Toggle event selection
  const handleToggleEvent = (eventId: string) => {
    setSelectedEventIds((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  // Step Validation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return mobileNumber.trim().length >= 9;
      case 2:
        return firstName.trim() !== "" && lastName.trim() !== "" && dob !== "";
      case 3:
        return selectedSchool !== "" && selectedDistrict !== "";
      case 4:
        return selectedSportIds.length > 0;
      case 5:
        return selectedEventIds.length > 0;
      case 6:
        return eligibilityErrors.length === 0;
      case 7:
        if (teamRegistrationMode === "captain") {
          return squadPlayers.length >= 1 && squadPlayers.every((p) => p.name.trim() !== "");
        }
        if (teamRegistrationMode === "join_code") {
          return enteredTeamCode.trim().length >= 3;
        }
        return true;
      case 8:
        if (calculatedAge < 18) {
          return guardianName.trim() !== "" && guardianMobile.trim() !== "" && guardianConsent;
        }
        return true;
      case 9:
        return true;
      default:
        return true;
    }
  };

  // Final Submission Handler
  const handleConfirmRegistration = async () => {
    setIsSubmitting(true);
    setSubmissionError("");
    const regId = `SPORT-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const generatedTeamCode =
      teamRegistrationMode === "captain"
        ? `TEAM-${(selectedSchool || "SCH").slice(0, 3).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
        : enteredTeamCode;

    const teamSquadData: TeamSquadDetails | undefined =
      hasTeamSportSelected || teamRegistrationMode !== "individual"
        ? {
            teamName: teamName.trim() || `${selectedSchool} Squad`,
            teamCode: generatedTeamCode,
            coachName: teamCoachName.trim() || undefined,
            coachPhone: teamCoachPhone.trim() || undefined,
            isCaptainRegistration: teamRegistrationMode === "captain",
            players: teamRegistrationMode === "captain" ? squadPlayers : []
          }
        : undefined;

    const newRecord: StoredAthleteRegistration = {
      id: regId,
      registrationNumber: regId,
      athleteName: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      dob,
      age: calculatedAge,
      gender,
      nicOrStudentId,
      mobile: mobileNumber,
      email: emailAddress,
      province: selectedProvince,
      district: selectedDistrict,
      schoolName: selectedSchool,
      grade: schoolGrade,
      sports: selectedSportIds.map((id) => championshipSports.find((sport) => sport.id === id)?.name || id),
      selectedEvents: allChosenEvents,
      isTeamInterest: teamRegistrationMode !== "individual",
      teamSquad: teamSquadData,
      guardianName: calculatedAge < 18 ? guardianName : undefined,
      guardianRelationship: calculatedAge < 18 ? guardianRelationship : undefined,
      guardianMobile: calculatedAge < 18 ? guardianMobile : undefined,
      consentTimestamp: new Date().toISOString(),
      paymentStatus: "PENDING",
      totalAmount,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0]
    };

    try {
      const result = await onRegistrationComplete(newRecord);
      if (!result.success) {
        setSubmissionError(result.message || "Unable to submit your registration.");
        return;
      }
      setConfirmedRecord(newRecord);
      setCurrentStep(10);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    "Contact",
    "Athlete Info",
    "School",
    "Sports",
    "Events",
    "Eligibility",
    "Team Entry",
    "Consent",
    "Review",
    "Receipt"
  ];

  return (
    <div className="space-y-6">
      {/* Top Wizard Steps Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e6ece8] shadow-xs">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0d5c4d] bg-[#ecf8f5] px-2.5 py-0.5 rounded-full">
              Championship Registration Portal
            </span>
            <h2 className="text-lg font-black text-[#0d2b26] mt-0.5">
              Step {currentStep} of 10: {stepsList[currentStep - 1]}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#0d5c4d] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          />
        </div>

        {/* Micro Step Numbers */}
        <div className="hidden sm:flex justify-between items-center mt-2.5 text-[10px] text-slate-400 font-bold px-1">
          {stepsList.map((st, i) => (
            <span
              key={st}
              className={`cursor-pointer transition-colors ${
                currentStep === i + 1
                  ? "text-[#0d5c4d] font-black underline"
                  : currentStep > i + 1
                  ? "text-emerald-700"
                  : ""
              }`}
              onClick={() => {
                if (i + 1 < currentStep) setCurrentStep(i + 1);
              }}
            >
              {i + 1}. {st}
            </span>
          ))}
        </div>
      </div>

      {/* STEP BODY CONTAINER */}
      <Card className="border-[#e6ece8] bg-white shadow-xs overflow-hidden">
        <CardContent className="p-5 sm:p-7">
          {/* ========================================================================= */}
          {/* STEP 1: CONTACT DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Contact Information</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your mobile number to receive instant SMS updates and tournament verification codes.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Number (Sri Lankan) *
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 077 123 4567"
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format: 10 digits starting with 07X (e.g. 077, 071, 076, 078)
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address (Optional for e-Receipt)
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="e.g. athlete@gmail.com"
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#ecf8f5] rounded-xl border border-[#c4e9e0] text-xs text-[#0d5c4d] flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Your phone number is kept confidential and only used for schedule SMS dispatches and registration validation.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: ATHLETE INFORMATION */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Athlete Personal Details</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Provide full name and Date of Birth. The system automatically computes age for age-group validation.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Sathurjan"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Kavinathan"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Date of Birth (DOB) *
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>

                  {/* Auto Age Calculation Pill */}
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-700 block">
                        Auto Calculated Age
                      </span>
                      <span className="text-base font-black text-amber-900">
                        {calculatedAge} Years Old
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-white border-amber-300 font-bold text-amber-800">
                      {calculatedAge <= 12
                        ? "U12 Bracket"
                        : calculatedAge <= 14
                        ? "U14 Bracket"
                        : calculatedAge <= 16
                        ? "U16 Bracket"
                        : calculatedAge <= 18
                        ? "U18 Bracket"
                        : "Open Bracket"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    >
                      <option value="Boys">Boys (Male)</option>
                      <option value="Girls">Girls (Female)</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      NIC No / Student ID / Birth Cert No
                    </label>
                    <input
                      type="text"
                      value={nicOrStudentId}
                      onChange={(e) => setNicOrStudentId(e.target.value)}
                      placeholder="e.g. 200813504921 or STU-88"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SCHOOL INFORMATION (PROVINCE -> DISTRICT -> SCHOOL) */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#0d5c4d]" />
                  <span>School &amp; District Verification</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select your school from the official provincial database to avoid spelling duplicates.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Province *</label>
                    <input
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      placeholder="Enter province"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">District *</label>
                    <input
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      placeholder="Enter district"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    School / Institution *
                  </label>
                  <input
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    placeholder="Enter school or institution"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Current Grade *</label>
                    <input
                      value={schoolGrade}
                      onChange={(e) => setSchoolGrade(e.target.value)}
                      placeholder="Enter grade"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">School Type</label>
                    <select
                      value={schoolType}
                      onChange={(e) => setSchoolType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    >
                      <option value="National School (1AB)">National School (1AB)</option>
                      <option value="Provincial School (1C)">Provincial School (1C)</option>
                      <option value="Private / International School">Private / International School</option>
                      <option value="Independent Academy">Independent Academy</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: SPORT SELECTION (MULTI-SPORT) */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4 max-w-2xl mx-auto py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Select Sports Disciplines</span>
                </h3>
                <p className="text-xs text-slate-500">
                  You can register for multiple sports simultaneously (e.g. Athletics and Badminton).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {championshipSports.length === 0 ? (
                  <p className="sm:col-span-2 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    No sports are currently available for registration.
                  </p>
                ) : championshipSports.map((sport) => {
                  const isSelected = selectedSportIds.includes(sport.id);
                  return (
                    <div
                      key={sport.id}
                      onClick={() => handleToggleSport(sport.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isSelected
                          ? "border-[#0d5c4d] bg-[#ecf8f5] shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected
                            ? "bg-[#0d5c4d] border-[#0d5c4d] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-extrabold text-sm text-[#0d2b26]">{sport.name}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {sport.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {sport.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-600 font-bold">
                          <span>{sport.events.length} Events Available</span>
                          <span>•</span>
                          <span className="text-[#0d5c4d]">
                            {sport.isTeamSport ? "Team Sport" : "Individual"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: EVENT SELECTION */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-4 max-w-2xl mx-auto py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Choose Specific Events &amp; Categories</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select the events you wish to compete in for your chosen sports disciplines.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {selectedSportIds.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    Select a sport before choosing its events.
                  </p>
                ) : selectedSportIds.map((sportId) => {
                  const sport = championshipSports.find((s) => s.id === sportId);
                  if (!sport) return null;

                  return (
                    <div key={sport.id} className="border border-slate-200 rounded-xl p-4 bg-[#fbfcfb]">
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="font-black text-sm text-[#0d2b26] flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-[#0d5c4d]" />
                          <span>{sport.name} Events</span>
                        </h4>
                        <span className="text-xs font-bold text-slate-400">
                          {sport.events.filter((e) => selectedEventIds.includes(e.id)).length} selected
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sport.events.map((ev) => {
                          const isChecked = selectedEventIds.includes(ev.id);
                          return (
                            <label
                              key={ev.id}
                              className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between select-none transition-all ${
                                isChecked
                                  ? "border-[#0d5c4d] bg-[#ecf8f5] font-bold text-[#0d2b26]"
                                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleEvent(ev.id)}
                                  className="rounded text-[#0d5c4d] focus:ring-0"
                                />
                                <div>
                                  <p className="text-xs font-extrabold">{ev.name}</p>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {ev.ageCategory} • {ev.gender}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[11px] font-mono font-bold text-emerald-800">
                                LKR {ev.fee}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: ELIGIBILITY CHECK */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Age &amp; Gender Eligibility Check</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Automated verification comparing athlete DOB ({calculatedAge} yrs old, {gender}) against official category regulations.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {eligibilityErrors.length > 0 ? (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                    <p className="font-extrabold flex items-center gap-1.5 text-rose-700">
                      <AlertCircle className="h-4 w-4" />
                      <span>Ineligible Events Detected:</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                      {eligibilityErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-rose-700 font-medium pt-1">
                      Please return to Step 5 (Events) to deselect ineligible events before proceeding.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-black">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span>All {allChosenEvents.length} selected events are 100% Eligible!</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Athlete age ({calculatedAge} years) and gender category ({gender}) satisfy official federation requirements for every chosen event.
                    </p>
                  </div>
                )}

                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <p className="font-bold text-slate-700">Verified Event Entries:</p>
                  <div className="space-y-1.5">
                    {allChosenEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[11px]"
                      >
                        <span className="font-bold text-slate-800">
                          {ev.sportName}: {ev.eventName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {ev.ageCategory} • {ev.gender}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* STEP 7: TEAM SPORTS & SQUAD ROSTER REGISTRATION */}
          {/* ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-5 max-w-2xl mx-auto py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Team Sports &amp; Squad Roster Registration</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select your registration mode for team competitions (Football, Cricket, Basketball, Volleyball).
                </p>
              </div>

              {/* Mode Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => {
                    setTeamRegistrationMode("captain");
                    setIsTeamInterest(false);
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer select-none transition-all ${
                    teamRegistrationMode === "captain"
                      ? "border-[#0d5c4d] bg-[#ecf8f5] shadow-xs"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">🏆</span>
                    <Badge variant={teamRegistrationMode === "captain" ? "default" : "outline"} className="text-[9px]">
                      Recommended
                    </Badge>
                  </div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Team Captain / Full Squad</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Register as captain &amp; add your complete 11–15 player squad roster.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setTeamRegistrationMode("join_code");
                    setIsTeamInterest(false);
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer select-none transition-all ${
                    teamRegistrationMode === "join_code"
                      ? "border-[#0d5c4d] bg-[#ecf8f5] shadow-xs"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">🔑</span>
                    <Badge variant={teamRegistrationMode === "join_code" ? "default" : "outline"} className="text-[9px]">
                      Join Team
                    </Badge>
                  </div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Join via Team Code</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your captain already registered? Enter team code to join that squad roster.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setTeamRegistrationMode("individual");
                    setIsTeamInterest(true);
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer select-none transition-all ${
                    teamRegistrationMode === "individual"
                      ? "border-[#0d5c4d] bg-[#ecf8f5] shadow-xs"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">👤</span>
                    <Badge variant={teamRegistrationMode === "individual" ? "default" : "outline"} className="text-[9px]">
                      Open Pool
                    </Badge>
                  </div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Individual Open Pool</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    No school team? Enter open player pool for district trial selections.
                  </p>
                </div>
              </div>

              {/* MODE A: CAPTAIN SQUAD BUILDER */}
              {teamRegistrationMode === "captain" && (
                <div className="p-4 sm:p-5 rounded-2xl border border-[#b2e5d9] bg-[#f8fbf9] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="font-black text-sm text-[#0d2b26] flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-[#0d5c4d]" />
                        <span>Squad Details &amp; Players Roster</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Player 1 is the Team Captain ({firstName} {lastName}). Add team members below.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-white text-[#0d5c4d] font-bold text-xs border border-[#b2e5d9]">
                        Squad Count: <strong>{squadPlayers.length} Players</strong>
                      </span>
                      <Button
                        type="button"
                        onClick={handleFillStandard11Squad}
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-7 font-bold border-slate-300"
                      >
                        Auto-fill 11
                      </Button>
                    </div>
                  </div>

                  {/* Team Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Official Team Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. Jaffna Central College 1st XI"
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Coach / Teacher-in-Charge Name
                      </label>
                      <input
                        type="text"
                        value={teamCoachName}
                        onChange={(e) => setTeamCoachName(e.target.value)}
                        placeholder="e.g. Mr. K. Sivakumar (Sports Master)"
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                      />
                    </div>
                  </div>

                  {/* Dynamic Players Table */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Squad Players Roster List
                      </span>
                      <Button
                        type="button"
                        onClick={handleAddSquadPlayer}
                        size="sm"
                        className="h-7 text-xs bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold rounded-lg cursor-pointer"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Player
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {squadPlayers.map((player, idx) => (
                        <div
                          key={player.id}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs shadow-2xs"
                        >
                          <div className="col-span-1 text-center font-bold text-slate-400">
                            #{idx + 1}
                          </div>

                          <div className="col-span-4">
                            <input
                              type="text"
                              value={player.name}
                              onChange={(e) => handleUpdateSquadPlayer(player.id, "name", e.target.value)}
                              placeholder={`Player ${idx + 1} Full Name *`}
                              className={`w-full h-8 px-2.5 rounded-lg border text-xs font-bold text-slate-800 ${
                                player.name.trim() === "" ? "border-amber-400 bg-amber-50/30" : "border-slate-200"
                              }`}
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="text"
                              value={player.jerseyNumber || ""}
                              onChange={(e) => handleUpdateSquadPlayer(player.id, "jerseyNumber", e.target.value)}
                              placeholder="Jersey #"
                              className="w-full h-8 px-2 rounded-lg border border-slate-200 text-center font-mono font-bold text-xs text-slate-700"
                            />
                          </div>

                          <div className="col-span-3">
                            <input
                              type="text"
                              value={player.role || ""}
                              onChange={(e) => handleUpdateSquadPlayer(player.id, "role", e.target.value)}
                              placeholder="Role / Position"
                              className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-700"
                            />
                          </div>

                          <div className="col-span-2 flex items-center justify-end gap-1">
                            {idx === 0 ? (
                              <Badge className="bg-[#ecf8f5] text-[#0d5c4d] border border-[#b2e5d9] text-[9px] font-black">
                                Captain ★
                              </Badge>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSquadPlayer(player.id)}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE B: JOIN VIA TEAM CODE */}
              {teamRegistrationMode === "join_code" && (
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#0d5c4d]" />
                    <h4 className="font-black text-sm text-[#0d2b26]">Enter Official Team Code</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Ask your team captain or sports coach for the 8-character Team Code.
                  </p>
                  <div>
                    <input
                      type="text"
                      value={enteredTeamCode}
                      onChange={(e) => setEnteredTeamCode(e.target.value.toUpperCase())}
                      placeholder="e.g. #TEAM-JCC-2601"
                      className="w-full h-11 px-3.5 rounded-xl border-2 border-slate-200 font-mono font-extrabold text-sm text-[#0d5c4d] tracking-wider focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                  {enteredTeamCode.trim().length >= 4 && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Valid Team Code. You will be automatically added to this team roster upon confirmation.</span>
                    </div>
                  )}
                </div>
              )}

              {/* MODE C: INDIVIDUAL OPEN POOL */}
              {teamRegistrationMode === "individual" && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-[#fbfcfb] space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Individual Open Trial Pool Entry</span>
                  </div>
                  <p>
                    You are registering as an individual athlete. The championship technical committee will evaluate your entry and assign you to district trial squads during open trials.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 8: PARENT / GUARDIAN INFORMATION & CONSENT */}
          {/* ========================================================================= */}
          {currentStep === 8 && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Parent / Guardian Consent (&lt; 18 Minor)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Required under championship regulations for athletes under 18 years of age.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Guardian Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Mrs. K. Priyadarshani"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Relationship to Athlete *
                    </label>
                    <select
                      value={guardianRelationship}
                      onChange={(e) => setGuardianRelationship(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="School Coach">School Coach / Teacher-in-Charge</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Guardian Mobile Number (For SMS &amp; Emergency) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guardianMobile}
                    onChange={(e) => setGuardianMobile(e.target.value)}
                    placeholder="e.g. 077 987 6543"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={guardianConsent}
                      onChange={(e) => setGuardianConsent(e.target.checked)}
                      className="rounded text-[#0d5c4d] mt-0.5 focus:ring-0"
                    />
                    <span className="leading-relaxed">
                      I confirm that I am the parent/guardian or authorized school representative of{" "}
                      <strong>
                        {firstName} {lastName}
                      </strong>{" "}
                      and agree to the championship event rules, medical safety guidelines, and data processing terms.
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Consent timestamp will be encrypted and permanently recorded with registration dossier.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 9: REVIEW SUMMARY */}
          {/* ========================================================================= */}
          {currentStep === 9 && (
            <div className="space-y-5 max-w-2xl mx-auto py-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Review Complete Registration Summary</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Verify all information before confirming and proceeding to receipt generation.
                </p>
              </div>

              {/* Review Card */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-[#fafcfb] space-y-4 text-xs">
                {/* Athlete Section */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Athlete</span>
                    <p className="font-extrabold text-sm text-[#0d2b26]">
                      {firstName} {lastName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      DOB: {dob} ({calculatedAge} yrs old) • {gender} • ID: {nicOrStudentId || "N/A"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="h-8 text-[11px] font-bold"
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>

                {/* School Section */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Institution</span>
                    <p className="font-extrabold text-[#0d2b26]">{selectedSchool}</p>
                    <p className="text-[11px] text-slate-500">
                      {selectedDistrict}, {selectedProvince} • {schoolGrade}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="h-8 text-[11px] font-bold"
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>

                {/* Events Section */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Registered Events ({allChosenEvents.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {allChosenEvents.map((ev) => (
                        <span
                          key={ev.id}
                          className="px-2 py-0.5 rounded-md bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-[10px] font-bold"
                        >
                          {ev.sportName}: {ev.eventName} ({ev.ageCategory})
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(5)}
                    className="h-8 text-[11px] font-bold"
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>

                {/* Team & Squad Section */}
                {(hasTeamSportSelected || teamRegistrationMode !== "individual") && (
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Team / Squad Roster</span>
                      <p className="font-extrabold text-[#0d2b26]">
                        {teamName || `${selectedSchool} Squad`}
                      </p>
                      <p className="text-[11px] text-[#0d5c4d] font-bold mt-0.5">
                        {teamRegistrationMode === "captain"
                          ? `Captain Entry • ${squadPlayers.length} Players on Roster`
                          : teamRegistrationMode === "join_code"
                          ? `Joining Squad with Code: ${enteredTeamCode}`
                          : "Individual Open Player Pool"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(7)}
                      className="h-8 text-[11px] font-bold"
                    >
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                )}

                {/* Guardian Section */}
                {calculatedAge < 18 && (
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Guardian</span>
                      <p className="font-extrabold text-[#0d2b26]">
                        {guardianName} ({guardianRelationship})
                      </p>
                      <p className="text-[11px] text-slate-500">Mobile: {guardianMobile}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(8)}
                      className="h-8 text-[11px] font-bold"
                    >
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                )}

                {/* Fee Section */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Total Registration Fee
                    </span>
                    <p className="text-lg font-black text-emerald-800">LKR {totalAmount.toLocaleString()}</p>
                  </div>

                </div>
                <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  Payment is not available here. Your registration will be saved as pending for sports-office review.
                </p>
              </div>

              <Button
                onClick={handleConfirmRegistration}
                className="w-full bg-[#0d5c4d] hover:bg-[#083e34] text-white font-black text-sm h-12 rounded-xl shadow-md cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Registration
              </Button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 10: REGISTRATION RECEIPT */}
          {/* ========================================================================= */}
          {currentStep === 10 && confirmedRecord && (
            <div className="space-y-6 max-w-xl mx-auto py-2 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0d2b26]">
                  Registration Submitted
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your registration has been saved. The sports office will review it and update its status.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div
                id="digital-entry-pass"
                className="bg-white border-2 border-[#0d5c4d] rounded-2xl p-6 text-left shadow-lg space-y-4 relative overflow-hidden"
              >
                {/* Header ribbon */}
                <div className="bg-[#0d5c4d] -mx-6 -mt-6 p-4 text-white flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#f3b738]">
                      SPORTS REGISTRATION RECEIPT
                    </p>
                    <p className="text-base font-extrabold">Registration Details</p>
                  </div>
                  <Badge variant="outline" className="bg-white/20 text-white font-mono text-xs border-white/30">
                    {confirmedRecord.paymentStatus}
                  </Badge>
                </div>

                {/* Pass Body */}
                <div className="grid grid-cols-1 gap-4 pt-2">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Registration Number
                      </span>
                      <span className="font-mono text-sm font-black text-[#0d5c4d]">
                        {confirmedRecord.registrationNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Athlete Name
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {confirmedRecord.athleteName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        School &amp; District
                      </span>
                      <span className="font-semibold text-slate-700">
                        {confirmedRecord.schoolName} ({confirmedRecord.district})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Events ({confirmedRecord.selectedEvents.length})
                      </span>
                      <span className="font-bold text-slate-800">
                        {confirmedRecord.selectedEvents.map((e) => e.eventName).join(", ")}
                      </span>
                    </div>

                    {confirmedRecord.teamSquad && (
                      <div className="p-2.5 rounded-xl bg-[#ecf8f5] border border-[#b2e5d9] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[11px] text-[#0d5c4d]">
                            Team: {confirmedRecord.teamSquad.teamName}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0d5c4d] border border-[#b2e5d9]">
                            {confirmedRecord.teamSquad.teamCode}
                          </span>
                        </div>
                        {confirmedRecord.teamSquad.players && confirmedRecord.teamSquad.players.length > 0 && (
                          <p className="text-[10px] text-slate-600">
                            <strong>Squad ({confirmedRecord.teamSquad.players.length}):</strong>{" "}
                            {confirmedRecord.teamSquad.players.map((p) => `#${p.jerseyNumber} ${p.name.split(" ")[0]}`).slice(0, 4).join(", ")}
                            {confirmedRecord.teamSquad.players.length > 4 ? ` +${confirmedRecord.teamSquad.players.length - 4} more` : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Issued: {confirmedRecord.createdAt}</span>
                  <span className="text-[#0d5c4d] font-bold">Status: {confirmedRecord.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="w-full sm:w-auto text-xs font-bold border-slate-300"
                >
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print Registration Receipt
                </Button>

                <Button
                  onClick={onCancel}
                  className="w-full sm:w-auto bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-black"
                >
                  Return to Sports Hub
                </Button>
              </div>
            </div>
          )}

          {/* BOTTOM STEP CONTROLS (Steps 1 to 8) */}
          {currentStep < 9 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                  Step {currentStep} of 10
                </span>
                <Button
                  disabled={!canProceed()}
                  onClick={() => setCurrentStep((prev) => Math.min(9, prev + 1))}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs h-9 px-4 rounded-xl"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
