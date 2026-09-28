/**
 * Device Alert Utility for NIRMAAN AI
 * Triggers native OS notifications, Web Audio frequency chimes, and in-app alert modals.
 */

export interface DeviceAlertPayload {
  title: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  reasons: string[];
  project: {
    projectId: string;
    projectName: string;
    sector: string;
    implementingAgency?: string;
    state?: string;
    originalCostCrore: number;
    revisedCostCrore: number;
    costOverrunPercent: number;
    timeOverrunMonths: number;
    riskScore: number;
    riskCategory?: string;
    reasonForDelay?: string;
  };
  cufGenerated?: boolean;
  cufData?: any;
}

/**
 * Plays an institutional dual-tone audio chime using Web Audio API
 */
export function playAlertChime(severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" = "HIGH") {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (severity === "CRITICAL") {
      // Urgent high-pitch double beep
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
      osc.frequency.setValueAtTime(880, now + 0.3); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.55);
    } else {
      // Clear alert chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    console.warn("Could not play audio alert chime:", e);
  }
}

/**
 * Requests browser notification permission if not yet decided
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const res = await Notification.requestPermission();
    return res === "granted";
  }

  return false;
}

/**
 * Triggers native OS device notification and broadcasts in-app alert modal
 */
export async function triggerDeviceAlert(payload: DeviceAlertPayload) {
  if (typeof window === "undefined") return;

  // 1. Play audio chime
  playAlertChime(payload.severity);

  // 2. Fire Native OS Desktop Notification
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        const bodyText = `[${payload.severity}] Risk Score: ${payload.project.riskScore}/100\nCost Overrun: +${payload.project.costOverrunPercent}%\nDelay: ${payload.project.timeOverrunMonths} mo\nTrigger: ${payload.reasons[0] || "Elevated variance threshold"}`;

        new Notification(`🚨 ${payload.title}`, {
          body: bodyText,
          icon: "/icon.svg",
          tag: `nirmaan-alert-${payload.project.projectId}`,
          requireInteraction: payload.severity === "CRITICAL",
        });
      } catch (err) {
        console.warn("Native notification dispatch failed:", err);
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification(`🚨 ${payload.title}`, {
            body: `Cost: +${payload.project.costOverrunPercent}%, Delay: ${payload.project.timeOverrunMonths}m. Trigger: ${payload.reasons[0]}`,
            icon: "/icon.svg",
          });
        }
      });
    }
  }

  // 3. Dispatch in-app custom event for the visual modal
  window.dispatchEvent(
    new CustomEvent("nirmaan-device-alert", {
      detail: payload,
    })
  );
}
