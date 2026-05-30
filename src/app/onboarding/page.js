"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Zap, ChevronRight, ChevronLeft, Check } from "lucide-react";

const INTERESTS = [
  "Artificial Intelligence", "Machine Learning", "Web Development", "Mobile Apps",
  "Cybersecurity", "Data Science", "Cloud Computing", "Blockchain",
  "Music", "Art & Design", "Photography", "Film & Media",
  "Sports", "Fitness", "Yoga", "Dance",
  "Business", "Entrepreneurship", "Finance", "Marketing",
  "Research", "Academia", "Writing", "Public Speaking",
  "Gaming", "Robotics", "IoT", "Open Source",
];

const SKILLS = [
  "Python", "JavaScript", "React", "Node.js", "Java", "C++",
  "Machine Learning", "Data Analysis", "UI/UX Design", "Project Management",
  "Public Speaking", "Leadership", "Graphic Design", "Video Editing",
  "3D Modeling", "Photography", "Writing", "Research", "Teaching",
];

const DEPARTMENTS = [
  "Computer Science", "Information Technology", "Electronics", "Mechanical",
  "Civil", "Chemical", "Biotechnology", "Physics", "Mathematics",
  "Business Administration", "Economics", "Psychology", "Arts", "Other",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate", "PhD"];

const ROLES = [
  { value: "student", label: "Student", desc: "Discover events and connect with campus" },
  { value: "organizer", label: "Organizer", desc: "Create and manage campus events" },
  { value: "volunteer", label: "Volunteer", desc: "Help run events and manage check-ins" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    department: "",
    year: "",
    role: "student",
    interests: [],
    skills: [],
  });

  const steps = [
    { title: "Your Role", subtitle: "How will you use CampusPulseAI?" },
    { title: "Academic Info", subtitle: "Tell us about your studies" },
    { title: "Interests", subtitle: "What excites you?" },
    { title: "Skills", subtitle: "What are you good at?" },
  ];

  const toggleItem = (key, item) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(item)
        ? f[key].filter((i) => i !== item)
        : [...f[key], item],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await completeOnboarding({
        userId: user._id,
        department: form.department,
        year: form.year,
        interests: form.interests,
        skills: form.skills,
        role: form.role,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!form.role;
    if (step === 1) return !!form.department && !!form.year;
    if (step === 2) return form.interests.length >= 1;
    return true;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
      className="hero-mesh"
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={20} color="white" />
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          CampusPulseAI
        </span>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: i < step ? "var(--color-success)" : i === step ? "var(--color-primary)" : "var(--bg-elevated)",
              border: i === step ? "2px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)",
              fontSize: "0.8rem", fontWeight: 600,
              transition: "all 0.3s",
            }}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 2, background: i < step ? "var(--color-success)" : "var(--bg-elevated)", transition: "background 0.3s" }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="glass-card" style={{ width: "100%", maxWidth: 560, padding: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", marginBottom: "0.35rem" }}>
          {steps[step].title}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
          {steps[step].subtitle}
        </p>

        {/* Step 0 — Role */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${form.role === r.value ? "var(--color-primary)" : "rgba(255,255,255,0.1)"}`,
                  background: form.role === r.value ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontWeight: 600, color: form.role === r.value ? "#a5b4fc" : "white", marginBottom: "0.2rem" }}>
                  {r.label}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{r.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 1 — Academic Info */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Department
              </label>
              <select
                id="department-select"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className="input-field"
                style={{ appearance: "none" }}
              >
                <option value="">Select your department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Year of Study
              </label>
              <select
                id="year-select"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className="input-field"
                style={{ appearance: "none" }}
              >
                <option value="">Select your year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 2 — Interests */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Select at least 1 interest to personalize your recommendations
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleItem("interests", interest)}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: "9999px",
                    border: `1px solid ${form.interests.includes(interest) ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                    background: form.interests.includes(interest) ? "rgba(99,102,241,0.2)" : "transparent",
                    color: form.interests.includes(interest) ? "#a5b4fc" : "var(--text-secondary)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Skills */}
        {step === 3 && (
          <div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Select your skills (optional but improves recommendations)
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleItem("skills", skill)}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: "9999px",
                    border: `1px solid ${form.skills.includes(skill) ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.1)"}`,
                    background: form.skills.includes(skill) ? "rgba(6,182,212,0.15)" : "transparent",
                    color: form.skills.includes(skill) ? "#67e8f9" : "var(--text-secondary)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", gap: "0.75rem" }}>
          {step > 0 ? (
            <button className="btn-ghost" onClick={() => setStep((s) => s - 1)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <ChevronLeft size={16} />Back
            </button>
          ) : <div />}

          {step < steps.length - 1 ? (
            <button
              id="next-step-btn"
              className="btn-primary"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", opacity: canNext() ? 1 : 0.5 }}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              id="finish-onboarding-btn"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {loading ? "Saving..." : "Complete Setup"}
              <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
