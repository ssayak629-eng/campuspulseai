"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import Navbar from "../../../components/layout/Navbar";
import Link from "next/link";
import { useState, Suspense } from "react";
import {
  ArrowLeft, Sparkles, MapPin, Users, Calendar, Clock,
  DollarSign, Check, X, Building, AlertCircle, Bookmark,
  Award, Heart, Wifi, CheckCircle, ListPlus, Send
} from "lucide-react";
import { formatDate } from "../../../lib/utils/formatDate";

function VenueCard({ item, event, existingRequests, onRequest, onConfirm, isRequesting, isConfirming }) {
  const { venue, calculatedCost, totalPayable, matchScore, matchDetails } = item;
  
  // Find if there is an existing request for this venue
  const request = existingRequests?.find((r) => r.venueId === venue._id)?.request;
  const isPending = request?.status === "pending";
  const isAccepted = request?.status === "accepted";
  const isRejected = request?.status === "rejected";
  const isConfirmed = request?.status === "confirmed";
  const isDeclined = request?.status === "declined";

  // Score color
  const scorePercent = Math.round(matchScore * 100);
  const scoreColor = scorePercent >= 80 ? "var(--color-success)" : scorePercent >= 50 ? "var(--color-accent)" : "var(--color-danger)";

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: "1.5rem", 
        display: "grid", 
        gridTemplateColumns: "1fr 280px", 
        gap: "1.5rem", 
        borderRadius: "0px",
        background: "var(--bg-card)",
        border: isConfirmed ? "3px solid var(--color-success)" : "2px solid var(--border)",
        boxShadow: isConfirmed ? "6px 6px 0px 0px var(--color-success)" : "4px 4px 0px 0px var(--shadow-color)"
      }}
    >
      {/* Left side details */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge" style={{ background: "rgba(139, 92, 246, 0.15)", border: "1.5px solid var(--border)", color: "var(--color-primary)" }}>
            {venue.venueType.toUpperCase()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700 }}>
            <MapPin size={12} /> {venue.city}, {venue.state}
          </span>
        </div>

        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          {venue.name}
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.4, marginBottom: "1rem" }}>
          {venue.description}
        </p>

        {/* Facilities Checklist mini tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
          {Object.entries(venue.facilities).map(([facility, val]) => {
            if (val === true) {
              return (
                <span key={facility} style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>
                  ✓ {facility}
                </span>
              );
            }
            return null;
          })}
        </div>

        {/* Match Breakdown details */}
        <div style={{ padding: "0.75rem", background: "var(--bg-elevated)", border: "2px dashed var(--border)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Required</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--text-primary)" }}>{Math.round(matchDetails.requirementMatch * 100)}%</div>
          </div>
          <div>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Capacity</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--text-primary)" }}>{Math.round(matchDetails.capacityMatch * 100)}%</div>
          </div>
          <div>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Location</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--text-primary)" }}>{Math.round(matchDetails.locationMatch * 100)}%</div>
          </div>
          <div>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Budget</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--text-primary)" }}>{Math.round(matchDetails.budgetMatch * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Right side cost and compatibility badge */}
      <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.35rem" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 900, fontFamily: "var(--font-display)", color: scoreColor }}>
              {scorePercent}%
            </span>
            <Sparkles size={16} color={scoreColor} />
          </div>
          <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            MATCH STRENGTH
          </div>
        </div>

        {/* Pricing Metrics */}
        <div style={{ margin: "1rem 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.2rem" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Estimated Rent:</span>
            <span style={{ fontWeight: 800 }}>${calculatedCost}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.2rem" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Refundable Deposit:</span>
            <span style={{ fontWeight: 800 }}>${venue.pricing.refundableDeposit}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 900, borderTop: "2px solid var(--border)", paddingTop: "0.4rem" }}>
            <span>Total Payable:</span>
            <span style={{ color: "var(--color-primary)" }}>${totalPayable}</span>
          </div>
        </div>

        {/* Action Button Area */}
        <div>
          {isConfirmed ? (
            <div style={{ width: "100%", padding: "0.5rem", border: "2px solid var(--color-success)", background: "rgba(16,185,129,0.1)", color: "var(--color-success)", textAlign: "center", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase" }}>
              ✓ Venue Booked
            </div>
          ) : isDeclined ? (
            <div style={{ width: "100%", padding: "0.5rem", border: "2px solid var(--border)", color: "var(--text-muted)", textAlign: "center", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase" }}>
              Declined
            </div>
          ) : isAccepted ? (
            <button
              onClick={() => onConfirm(request._id)}
              disabled={isConfirming}
              className="btn-primary animate-wiggle"
              style={{ width: "100%", fontSize: "0.75rem", padding: "0.55rem", background: "var(--color-success)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", boxShadow: "3px 3px 0px 0px var(--shadow-color)", borderRadius: "0px" }}
            >
              <CheckCircle size={13} /> Request Accepted (Confirm)
            </button>
          ) : isPending ? (
            <div style={{ width: "100%", padding: "0.5rem", border: "2px solid var(--color-accent)", background: "rgba(251,191,36,0.1)", color: "var(--color-accent)", textAlign: "center", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
              <Send size={11} /> Requested Venue
            </div>
          ) : isRejected ? (
            <div style={{ width: "100%", padding: "0.5rem", border: "2px solid var(--color-danger)", background: "rgba(248,113,113,0.1)", color: "var(--color-danger)", textAlign: "center", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase" }}>
              ✗ Request Rejected
            </div>
          ) : (
            <button
              onClick={() => onRequest(venue._id, matchScore)}
              disabled={isRequesting}
              className="btn-primary"
              style={{ width: "100%", fontSize: "0.75rem", padding: "0.55rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", borderRadius: "0px" }}
            >
              Request Venue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VenueDiscoveryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");
  const { user } = useCurrentUser();

  const [requestingId, setRequestingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const event = useQuery(api.events.getEventById, eventId ? { eventId } : "skip");
  const availableVenues = useQuery(api.venues.listAvailableVenues, eventId ? { eventId } : "skip");
  const existingRequests = useQuery(api.venues.getRequestsByEvent, eventId ? { eventId } : "skip");

  const requestVenueMutation = useMutation(api.venues.requestVenue);
  const confirmBookingMutation = useMutation(api.venues.confirmVenueBooking);

  if (!eventId) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
        <AlertCircle size={48} style={{ margin: "0 auto 1rem", color: "var(--color-danger)" }} />
        <h3>Invalid Event Parameter</h3>
        <Link href="/organizer" style={{ color: "var(--color-primary)", textDecoration: "underline", fontSize: "0.85rem" }}>
          Back to Organizer Console
        </Link>
      </div>
    );
  }

  if (event === undefined || availableVenues === undefined) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="skeleton" style={{ height: 160 }} />
        <div className="skeleton" style={{ height: 200 }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
        <AlertCircle size={48} style={{ margin: "0 auto 1rem", color: "var(--color-danger)" }} />
        <h3>Event Not Found</h3>
      </div>
    );
  }

  // Exclude venues that have already been requested for this specific event
  const requestedVenueIds = new Set((existingRequests ?? []).map((r) => r.request.venueId));
  const filteredVenues = (availableVenues ?? []).filter((item) => !requestedVenueIds.has(item.venue._id));

  const handleRequest = async (venueId, matchScore) => {
    setRequestingId(venueId);
    try {
      const venue = availableVenues.find((av) => av.venue._id === venueId)?.venue;
      await requestVenueMutation({
        eventId,
        venueId,
        organizerId: user._id,
        providerId: venue.providerId,
        matchScore,
      });
      alert("Venue booking request dispatched successfully!");
    } catch (e) {
      alert("Error requesting venue: " + e.message);
    } finally {
      setRequestingId(null);
    }
  };

  const handleConfirm = async (requestId) => {
    if (!confirm("Confirm this booking? This will cancel competitor requests and lock the venue availability calendar.")) return;
    setConfirmingId(requestId);
    try {
      await confirmBookingMutation({ requestId });
      alert("Booking officially confirmed! Your event page venue status has been updated.");
      router.push("/organizer");
    } catch (e) {
      alert("Error confirming booking: " + e.message);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div>
      {/* Event Overview Card */}
      <div 
        className="glass-card" 
        style={{ 
          marginBottom: "2rem", 
          padding: "1.5rem", 
          background: "var(--bg-card)", 
          border: "2px solid var(--border)", 
          borderRadius: "0px",
          position: "relative"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-primary)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          <Sparkles size={11} /> MATCH ASSISTANT ACTIVE
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.6rem", textTransform: "uppercase", color: "var(--text-primary)" }}>
          {event.title}
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
          <div>
            <strong>Dates:</strong> {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </div>
          <div>
            <strong>Target Capacity:</strong> {event.maxParticipants ?? 100} participants
          </div>
          <div>
            <strong>Event Budget:</strong> ${event.budget ?? 5000} Max Limit
          </div>
        </div>
      </div>

      {/* Available Venues List */}
      <div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.05rem", marginBottom: "1rem", textTransform: "uppercase", color: "var(--text-primary)" }}>
          Available Campus Venues ({filteredVenues.length})
        </h3>

        {filteredVenues.length === 0 ? (
          <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Building size={48} style={{ margin: "0 auto 1.25rem", opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>No active venues match your event schedule and capacity constraints.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {filteredVenues.map((item) => (
              <VenueCard 
                key={item.venue._id} 
                item={item} 
                event={event} 
                existingRequests={existingRequests}
                onRequest={handleRequest}
                onConfirm={handleConfirm}
                isRequesting={requestingId === item.venue._id}
                isConfirming={confirmingId === item.venue._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrganizerVenueDiscoveryPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="dot-grid">
      <Navbar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Back Link */}
        <Link href="/organizer" style={{ textDecoration: "none", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "1.5rem" }}>
          <ArrowLeft size={14} strokeWidth={2.5} /> Back to Organizer
        </Link>

        <Suspense fallback={<div>Loading venue discovery console...</div>}>
          <VenueDiscoveryContent />
        </Suspense>
      </main>
    </div>
  );
}
