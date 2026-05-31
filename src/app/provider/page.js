"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Navbar from "../../components/layout/Navbar";
import { useState } from "react";
import {
  Building, Sparkles, Plus, Calendar, DollarSign, Clock, Check, X,
  AlertCircle, Shield, Phone, Mail, Award, Settings, UserCheck, Star,
  Eye, Laptop, Palette, Pin, ShieldAlert, ListFilter
} from "lucide-react";
import { formatDate } from "../../lib/utils/formatDate";

function ProviderOnboarding({ userId, onComplete }) {
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const createProviderMutation = useMutation(api.venues.createProvider);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgName || !email || !phone) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await createProviderMutation({
        userId,
        organizationName: orgName,
        contactEmail: email,
        contactPhone: phone,
        description,
      });
      alert("Venue Provider Profile created successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      alert("Error onboarding provider: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="glass-card" 
      style={{ 
        maxWidth: 600, 
        margin: "4rem auto", 
        padding: "2.5rem", 
        background: "var(--bg-card)", 
        border: "3px solid var(--border)", 
        borderRadius: "0px",
        boxShadow: "8px 8px 0px 0px var(--shadow-color)"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyCenter: "center", margin: "0 auto 1rem", border: "2px solid var(--border)", boxShadow: "2px 2px 0px 0px var(--shadow-color)" }}>
          <Building size={32} color="#FFFFFF" style={{ margin: "auto" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.75rem", textTransform: "uppercase" }}>
          Venue Provider Registry
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Register your organization to list auditoriums, classrooms, and event halls.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Organization Name *
          </label>
          <input 
            type="text" 
            placeholder="e.g. Campus Facilities & Scheduling Dept" 
            value={orgName} 
            onChange={(e) => setOrgName(e.target.value)}
            className="input-field"
            required
            style={{ borderRadius: "0px" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Contact Email *
            </label>
            <input 
              type="email" 
              placeholder="facilities@university.edu" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              style={{ borderRadius: "0px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Contact Phone *
            </label>
            <input 
              type="text" 
              placeholder="+1 (555) 019-2834" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              required
              style={{ borderRadius: "0px" }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Organization Description
          </label>
          <textarea 
            placeholder="Tell organizers about the types of venues and support services you offer..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            rows={4}
            style={{ borderRadius: "0px", resize: "none" }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary" 
          style={{ width: "100%", marginTop: "1rem", borderRadius: "0px" }}
        >
          {loading ? "Registering Organization..." : "Complete Provider Onboarding"}
        </button>
      </form>
    </div>
  );
}

export default function ProviderConsoleDashboard() {
  const { user, isLoaded } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("available"); // active, available, all, reviews, profile
  const [viewRequestsVenue, setViewRequestsVenue] = useState(null); // Show matching event requests for this venue

  // Form states for creating venue
  const [showAddForm, setShowAddForm] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [venueDesc, setVenueDesc] = useState("");
  const [venueType, setVenueType] = useState("auditorium");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [seatCap, setSeatCap] = useState(100);
  const [standCap, setStandCap] = useState(50);
  const [hourlyRate, setHourlyRate] = useState(150);
  const [minHours, setMinHours] = useState(2);
  const [refundDep, setRefundDep] = useState(200);
  const [loading, setLoading] = useState(false);

  // Facilities checklists
  const [wifi, setWifi] = useState(true);
  const [ac, setAc] = useState(true);
  const [projector, setProjector] = useState(true);
  const [soundSystem, setSoundSystem] = useState(true);
  const [stage, setStage] = useState(true);
  const [parking, setParking] = useState(true);
  const [washroom, setWashroom] = useState(true);
  const [wheelchair, setWheelchair] = useState(true);

  // Convex data
  const provider = useQuery(api.venues.getProviderByUserId, user ? { userId: user._id } : "skip");
  const venuesList = useQuery(api.venues.getVenuesByProvider, provider ? { providerId: provider._id } : "skip");
  const activeBookings = useQuery(api.venues.getProviderActiveBookings, provider ? { providerId: provider._id } : "skip");
  
  // Selected Venue Inbound Requests
  const inboundRequests = useQuery(
    api.venues.getRequestsByVenue,
    viewRequestsVenue ? { venueId: viewRequestsVenue._id } : "skip"
  );

  const createVenueMutation = useMutation(api.venues.createVenue);
  const updateRequestStatusMutation = useMutation(api.venues.updateRequestStatus);
  const blockCalendarDatesMutation = useMutation(api.venues.blockVenueCalendar);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }} className="skeleton" />
      </div>
    );
  }

  // If not onboarded as provider, show onboarding registry
  if (user && provider === null) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="dot-grid">
        <Navbar />
        <ProviderOnboarding userId={user._id} />
      </div>
    );
  }

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    if (!venueName || !city || !address) {
      alert("Fill in name, city, and address.");
      return;
    }
    setLoading(true);
    try {
      await createVenueMutation({
        providerId: provider._id,
        name: venueName,
        description: venueDesc,
        venueType,
        city,
        state,
        address,
        seatingCapacity: Number(seatCap),
        standingCapacity: Number(standCap),
        facilities: {
          wifi, ac, projector, soundSystem, stage, parking, washroom,
          wheelchairAccessible: wheelchair,
          smartBoard: false, microphone: true, generatorBackup: true,
          drinkingWater: true, cafeteria: true, securityStaff: true,
          greenRoom: true, computerLab: false, powerSockets: true,
          internetSpeedMbps: 100, hostelNearby: true, accommodationAvailable: false,
          foodAvailable: true, recordingEquipment: false, livestreamSupport: false
        },
        rooms: [],
        pricing: {
          hourlyRate: Number(hourlyRate),
          minimumBookingHours: Number(minHours),
          refundableDeposit: Number(refundDep)
        },
        imageUrls: ["https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600"],
        isActive: true
      });
      alert("Venue successfully added to your inventory!");
      setShowAddForm(false);
      // Reset form
      setVenueName("");
      setVenueDesc("");
    } catch (err) {
      alert("Error adding venue: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await updateRequestStatusMutation({ requestId, status: "accepted" });
      alert("Venue request accepted successfully! Organizer has been notified to complete payment booking.");
      // Refresh matching requests list
    } catch (e) {
      alert("Error accepting request: " + e.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      await updateRequestStatusMutation({ requestId, status: "rejected" });
      alert("Request declined successfully.");
    } catch (e) {
      alert("Error rejecting request: " + e.message);
    }
  };

  const handleMaintenanceBlock = async (venueId) => {
    const days = prompt("How many days from today do you want to block for maintenance? (e.g. 3)");
    if (!days || isNaN(days)) return;
    try {
      const start = Date.now();
      const end = start + Number(days) * 86400000;
      await blockCalendarDatesMutation({
        venueId,
        startDate: start,
        endDate: end,
        status: "maintenance"
      });
      alert("Venue calendar slot successfully blocked for maintenance.");
    } catch (e) {
      alert("Error blocking calendar: " + e.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="dot-grid">
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-primary)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              <Building size={12} /> PROVIDER CONSOLE ACTIVE
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2rem", textTransform: "uppercase", color: "var(--text-primary)" }}>
              {provider?.organizationName ?? "Venue Dashboard"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Define availability, evaluate event compatibility, and accept organizer bookings.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
            style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", borderRadius: "0px" }}
          >
            <Plus size={16} /> Add New Venue
          </button>
        </div>

        {/* Tab Buttons Navigation */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "3px solid var(--border)", paddingBottom: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {[
            { id: "available", label: "Available Venues" },
            { id: "active", label: "Active Bookings" },
            { id: "reviews", label: "Reviews & Feed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setViewRequestsVenue(null);
              }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "0.78rem",
                padding: "0.5rem 1.25rem",
                background: activeTab === tab.id ? "var(--color-primary)" : "var(--bg-card)",
                color: activeTab === tab.id ? "#FFFFFF" : "var(--text-primary)",
                border: "2px solid var(--border)",
                borderRadius: "0px",
                boxShadow: activeTab === tab.id ? "2px 2px 0px 0px var(--shadow-color)" : "none",
                cursor: "pointer",
                textTransform: "uppercase"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Forms Panel */}
        {showAddForm && (
          <div 
            className="glass-card" 
            style={{ 
              marginBottom: "2rem", 
              padding: "2rem", 
              background: "var(--bg-card)", 
              border: "3px solid var(--border)", 
              borderRadius: "0px" 
            }}
          >
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.2rem", marginBottom: "1.25rem", textTransform: "uppercase" }}>
              Define Event Venue Asset
            </h3>

            <form onSubmit={handleCreateVenue} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>Venue Name *</label>
                  <input type="text" placeholder="e.g. Grand Cyber Conference Hall" value={venueName} onChange={(e) => setVenueName(e.target.value)} className="input-field" style={{ borderRadius: "0px" }} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>Description *</label>
                  <textarea placeholder="Outline aesthetics, acoustics, and standard layout options..." value={venueDesc} onChange={(e) => setVenueDesc(e.target.value)} className="input-field" rows={3} style={{ borderRadius: "0px", resize: "none" }} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>Venue Type</label>
                    <select value={venueType} onChange={(e) => setVenueType(e.target.value)} className="input-field" style={{ borderRadius: "0px" }}>
                      <option value="auditorium">Auditorium</option>
                      <option value="hall">Seminar Hall</option>
                      <option value="classroom">Smart Classroom</option>
                      <option value="stadium">Sports Field</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>City *</label>
                    <input type="text" placeholder="e.g. San Francisco" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" style={{ borderRadius: "0px" }} required />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>State *</label>
                    <input type="text" placeholder="e.g. CA" value={state} onChange={(e) => setState(e.target.value)} className="input-field" style={{ borderRadius: "0px" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>Address *</label>
                    <input type="text" placeholder="e.g. 500 University Ave" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" style={{ borderRadius: "0px" }} required />
                  </div>
                </div>
              </div>

              {/* Capacities & Pricing */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>Seating Capacity *</label>
                    <input type="number" value={seatCap} onChange={(e) => setSeatCap(e.target.value)} className="input-field" style={{ borderRadius: "0px" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>Standing Capacity *</label>
                    <input type="number" value={standCap} onChange={(e) => setStandCap(e.target.value)} className="input-field" style={{ borderRadius: "0px" }} required />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>Hourly Rate ($) *</label>
                    <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="input-field" style={{ borderRadius: "0px" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>Min Hours *</label>
                    <input type="number" value={minHours} onChange={(e) => setMinHours(e.target.value)} className="input-field" style={{ borderRadius: "0px" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>Deposit ($) *</label>
                    <input type="number" value={refundDep} onChange={(e) => setRefundDep(e.target.value)} className="input-field" style={{ borderRadius: "0px" }} required />
                  </div>
                </div>

                {/* Facilities Checklist */}
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>Facilities Checklist</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                    {[
                      { label: "WiFi", val: wifi, set: setWifi },
                      { label: "Air Conditioning", val: ac, set: setAc },
                      { label: "Projector", val: projector, set: setProjector },
                      { label: "Sound System", val: soundSystem, set: setSoundSystem },
                      { label: "Stage", val: stage, set: setStage },
                      { label: "Parking", val: parking, set: setParking },
                      { label: "Washrooms", val: washroom, set: setWashroom },
                      { label: "Wheelchair Acc", val: wheelchair, set: setWheelchair }
                    ].map((facility) => (
                      <label key={facility.label} style={{ fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 600 }}>
                        <input type="checkbox" checked={facility.val} onChange={(e) => facility.set(e.target.checked)} />
                        {facility.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, borderRadius: "0px" }}>
                    {loading ? "Saving Asset..." : "Confirm & Save Venue"}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn-ghost" style={{ flex: 0.5, borderRadius: "0px" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Requests Management Sidebar Panel Overlay */}
        {viewRequestsVenue && (
          <div 
            className="glass-card" 
            style={{ 
              marginBottom: "2rem", 
              padding: "1.75rem", 
              background: "var(--bg-card)", 
              border: "3px dashed var(--color-primary)", 
              borderRadius: "0px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.1rem", textTransform: "uppercase" }}>
                Inbound Proposals for: "{viewRequestsVenue.name}"
              </h3>
              <button 
                onClick={() => setViewRequestsVenue(null)} 
                style={{ background: "none", border: "2px solid var(--border)", cursor: "pointer", color: "var(--text-primary)", display: "flex", padding: "0.2rem" }}
              >
                <X size={16} />
              </button>
            </div>

            {inboundRequests === undefined ? (
              <div>Loading requests ledger...</div>
            ) : inboundRequests.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No active event matching requests for this venue asset.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {inboundRequests.map(({ request, event, organizer }) => {
                  const isAccepted = request.status === "accepted";
                  const isConfirmed = request.status === "confirmed";
                  const isRejected = request.status === "rejected";

                  return (
                    <div 
                      key={request._id} 
                      className="glass-card" 
                      style={{ 
                        padding: "1rem 1.25rem", 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        flexWrap: "wrap",
                        gap: "1rem",
                        background: "var(--bg-elevated)",
                        border: isConfirmed ? "2px solid var(--color-success)" : "2px solid var(--border)",
                        borderRadius: "0px"
                      }}
                    >
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: "0.95rem" }}>{event.title}</h4>
                        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                          <span><strong>Score:</strong> {Math.round(request.matchScore * 100)}%</span>
                          <span><strong>Budget:</strong> ${event.budget ?? 5000} Limit</span>
                          <span><strong>Organizer:</strong> {organizer?.name}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {isConfirmed ? (
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--color-success)", textTransform: "uppercase" }}>
                            ✓ Booked Confirmed
                          </span>
                        ) : isRejected ? (
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--color-danger)", textTransform: "uppercase" }}>
                            Declined
                          </span>
                        ) : isAccepted ? (
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--color-accent)", textTransform: "uppercase" }}>
                            Pending Organizer Payment
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAcceptRequest(request._id)}
                              className="btn-primary"
                              style={{ fontSize: "0.72rem", padding: "0.35rem 0.75rem", background: "var(--color-success)", color: "var(--text-primary)", borderRadius: "0px" }}
                            >
                              Accept Proposal
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="btn-ghost"
                              style={{ fontSize: "0.72rem", padding: "0.35rem 0.75rem", color: "var(--color-danger)", border: "2px solid var(--border)", borderRadius: "0px" }}
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === "available" && (
          <div>
            {venuesList === undefined ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                {Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}
              </div>
            ) : venuesList.length === 0 ? (
              <div className="glass-card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                <Building size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>You have not listed any campus venue assets yet.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
                {venuesList.map((venue) => (
                  <div 
                    key={venue._id} 
                    className="glass-card" 
                    style={{ 
                      padding: "1.25rem", 
                      background: "var(--bg-card)", 
                      border: "2px solid var(--border)", 
                      borderRadius: "0px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "220px",
                      boxShadow: "4px 4px 0px 0px var(--shadow-color)"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span className="badge badge-primary" style={{ fontSize: "0.6rem" }}>{venue.venueType.toUpperCase()}</span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 800 }}>${venue.pricing.hourlyRate}/hr</span>
                      </div>
                      <h3 style={{ fontWeight: 900, fontFamily: "var(--font-display)", fontSize: "1.15rem", marginBottom: "0.3rem" }}>{venue.name}</h3>
                      <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                        <span>Capacity: {venue.seatingCapacity} seats</span>
                        <span>•</span>
                        <span>{venue.city}</span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "1rem" }}>
                      <button
                        onClick={() => setViewRequestsVenue(venue)}
                        className="btn-primary"
                        style={{ fontSize: "0.72rem", padding: "0.45rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", borderRadius: "0px" }}
                      >
                        <ListFilter size={12} /> View Requests
                      </button>
                      <button
                        onClick={() => handleMaintenanceBlock(venue._id)}
                        className="btn-ghost"
                        style={{ fontSize: "0.72rem", padding: "0.45rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", borderRadius: "0px" }}
                      >
                        <Calendar size={12} /> Block Maintenance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "active" && (
          <div>
            {activeBookings === undefined ? (
              <div className="skeleton" style={{ height: 200 }} />
            ) : activeBookings.length === 0 ? (
              <div className="glass-card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                <Calendar size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>No active bookings currently registered on your assets.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {activeBookings.map(({ booking, venue, event }) => (
                  <div 
                    key={booking._id} 
                    className="glass-card" 
                    style={{ 
                      padding: "1.25rem 1.5rem", 
                      display: "grid", 
                      gridTemplateColumns: "1fr auto", 
                      alignItems: "center", 
                      gap: "1.5rem", 
                      background: "var(--bg-card)",
                      border: "2px solid var(--border)",
                      borderRadius: "0px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                        <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>{venue.name}</h3>
                        <span className="badge badge-success">✓ Booked</span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        <strong>Event Name:</strong> {event.title}
                      </div>
                      <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                        <span><strong>Dates:</strong> {formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                        <span><strong>Billable Hours:</strong> {booking.billableHours} hrs</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.3rem", fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                        ${booking.totalPayable}
                      </div>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)" }}>
                        TOTAL BOOKING VALUE
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", borderRadius: "0px" }}>
            <Star size={44} style={{ margin: "0 auto 1rem", opacity: 0.3, color: "var(--color-accent)" }} />
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--text-primary)" }}>5.0 Average Score</h3>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>All reviewed bookings are currently rated 5-stars. Keeps up the amazing facilities support!</p>
          </div>
        )}
      </main>
    </div>
  );
}
