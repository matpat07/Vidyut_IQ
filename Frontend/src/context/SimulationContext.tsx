import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CAMPUS_ROOMS, getDefaultAppliances } from '../data/campusRooms';
import { RoomState, RoomMetadata } from '../types/room.types';
import { DayOfWeek, TimeSlot } from '../types/timetable.types';
import { STANDARD_TIME_SLOTS, getRoomOccupancyProfile } from '../services/timetableParser';
import { calculateSimulatedTelemetry } from '../services/iotSimulator';
import { evaluateWastage } from '../services/wastageEngine';
import { SimulatedTelemetry, WastageAlert, AuditRecord } from '../types/telemetry.types';
import { ConfigurableAssumptions, EstimatedImpactSummary } from '../types/impact.types';
import { DEFAULT_ASSUMPTIONS, MACRO_CAMPUS_PROJECTIONS } from '../config/assumptions';
import {DEMO_SEED_SAVINGS_KWH,DEMO_SEED_AUDIT_ID} from '../config/demoSeed';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface RoomViewData {
  metadata: RoomMetadata;
  roomState: RoomState;
  telemetry: SimulatedTelemetry;
  occupancyProfile: ReturnType<typeof getRoomOccupancyProfile>;
  activeAlert?: WastageAlert;
}

interface SimulationContextType {
  simulationMinutes: number;
  timeString: string;
  activeSlot?: TimeSlot;
  day: DayOfWeek;
  currentRole: UserRole;
  isClockTicking: boolean;
  clockSpeedMultiplier: number;
  assumptions: ConfigurableAssumptions;
  roomDataList: RoomViewData[];
  activeAlerts: WastageAlert[];
  auditTrail: AuditRecord[];
  impactSummary: EstimatedImpactSummary;
  selectedRoomId: string | null;

  // Actions
  setSimulationMinutes: (mins: number) => void;
  setDay: (day: DayOfWeek) => void;
  setCurrentRole: (role: UserRole) => void;
  toggleClockTicking: () => void;
  setClockSpeedMultiplier: (speed: number) => void;
  setSelectedRoomId: (id: string | null) => void;
  toggleAppliance: (roomId: string, applianceIndex: number) => void;
  simulateEcoOff: (roomId: string) => void;
  simulateCampusEcoRemediation: () => void;
  cancelLecture: (lectureId: string) => void;
  restoreLecture: (lectureId: string) => void;
  loadPresetScenario: (scenario: 'LUNCH_BREAK' | 'TEACHER_CANCEL' | 'IDLE_LAB' | 'NORMAL_CLASS' | 'AFTER_HOURS') => void;
  updateAssumptions: (updated: Partial<ConfigurableAssumptions>) => void;
  clearAuditTrail: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start simulation at 1:15 PM (795 mins) for an immediate high-impact demo
  const [simulationMinutes, setSimulationMinutes] = useState<number>(795);
  const [day, setDay] = useState<DayOfWeek>('MON');
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [isClockTicking, setIsClockTicking] = useState<boolean>(false);
  const [clockSpeedMultiplier, setClockSpeedMultiplier] = useState<number>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Assumptions
  const [assumptions, setAssumptions] = useState<ConfigurableAssumptions>(DEFAULT_ASSUMPTIONS);

  // Cancelled lectures set (by teacher)
  const [cancelledLectureIds, setCancelledLectureIds] = useState<Set<string>>(new Set());

  // Room states
  const [roomStates, setRoomStates] = useState<Record<string, RoomState>>(() => {
    const initial: Record<string, RoomState> = {};
    CAMPUS_ROOMS.forEach(r => {
      initial[r.id] = {
        metadata: r,
        appliances: getDefaultAppliances(r.roomType),
        isEcoOff: false,
      };
    });
    return initial;
  });

  // Audit trail
  const [auditTrail, setAuditTrail] = useState<AuditRecord[]>([
    {
      id: DEMO_SEED_AUDIT_ID,
      timestamp: '11:12 AM',
      roomId: '6103CR',
      roomName: 'Classroom 6103',
      action: 'SIMULATE_ECO_OFF',
      wattsRemediated: 3200,
      estimatedKwhSaved: 0.53,
      estimatedCostSavedInr: 4.77,
      estimatedCo2AvoidedKg: 0.43,
      initiatedBy: 'Demonstration seed (preloaded)',
    }
  ]);

  // Accumulated savings counters
  const [accumulatedKwhSaved, setAccumulatedKwhSaved] = useState<number>(DEMO_SEED_SAVINGS_KWH);

  // Time-clock ticker
  useEffect(() => {
    if (!isClockTicking) return;
    const interval = setInterval(() => {
      setSimulationMinutes(prev => {
        const next = prev + 1 * clockSpeedMultiplier;
        if (next > 1080) return 540; // loop back to 9:00 AM
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockTicking, clockSpeedMultiplier]);

  // Format time string (e.g. "01:15 PM")
  const timeString = useMemo(() => {
    const hours24 = Math.floor(simulationMinutes / 60);
    const mins = Math.floor(simulationMinutes % 60);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${hours12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
  }, [simulationMinutes]);

  // Active standard time slot
  const activeSlot = useMemo(() => {
    return STANDARD_TIME_SLOTS.find(
      s => simulationMinutes >= s.startMinutes && simulationMinutes < s.endMinutes
    );
  }, [simulationMinutes]);

  // Evaluate telemetry and wastage for all rooms
  const { roomDataList, activeAlerts, currentTotalDrawWatts, currentWastedDrawWatts } = useMemo(() => {
    const list: RoomViewData[] = [];
    const alerts: WastageAlert[] = [];
    let totalDraw = 0;
    let wastedDraw = 0;

    CAMPUS_ROOMS.forEach(meta => {
      const state = roomStates[meta.id] || {
        metadata: meta,
        appliances: getDefaultAppliances(meta.roomType),
        isEcoOff: false,
      };

      const occupancyProfile = getRoomOccupancyProfile(meta.id, day, simulationMinutes, cancelledLectureIds);
      const rawTelemetry = calculateSimulatedTelemetry(state, occupancyProfile.expectedStatus, simulationMinutes);
      const { telemetry, alert } = evaluateWastage(meta, rawTelemetry, occupancyProfile.expectedStatus, simulationMinutes, assumptions);

      totalDraw += telemetry.simulatedPowerWatts;
      if (telemetry.isWastingPower) {
        wastedDraw += (telemetry.simulatedPowerWatts - telemetry.baselineStandbyWatts);
      }

      if (alert) {
        alerts.push(alert);
      }

      list.push({
        metadata: meta,
        roomState: state,
        telemetry,
        occupancyProfile,
        activeAlert: alert,
      });
    });

    return {
      roomDataList: list,
      activeAlerts: alerts,
      currentTotalDrawWatts: totalDraw,
      currentWastedDrawWatts: wastedDraw,
    };
  }, [roomStates, day, simulationMinutes, cancelledLectureIds, assumptions]);

  // Impact summary calculation
  const impactSummary: EstimatedImpactSummary = useMemo(() => {
    const accumulatedCost = parseFloat((accumulatedKwhSaved * assumptions.tariffInrPerKwh).toFixed(2));
    const accumulatedCo2 = parseFloat((accumulatedKwhSaved * assumptions.carbonEmissionFactorKgPerKwh).toFixed(2));

    return {
      currentTotalDrawWatts,
      currentWastedDrawWatts,
      accumulatedKwhSaved: parseFloat(accumulatedKwhSaved.toFixed(2)),
      accumulatedCostSavedInr: accumulatedCost,
      accumulatedCo2AvoidedKg: accumulatedCo2,
      projectedAnnualKwh: MACRO_CAMPUS_PROJECTIONS.annualAvoidableEnergyKwh,
      projectedAnnualSavingsInr: MACRO_CAMPUS_PROJECTIONS.annualCostSavingsInr,
      projectedAnnualCo2Tonnes: MACRO_CAMPUS_PROJECTIONS.annualCo2AvoidedTonnes,
      projectedHardwareOutlayInr: MACRO_CAMPUS_PROJECTIONS.approxHardwareOutlayInr,
    };
  }, [currentTotalDrawWatts, currentWastedDrawWatts, accumulatedKwhSaved, assumptions]);

  // Toggle individual appliance switch
  const toggleAppliance = useCallback((roomId: string, applianceIndex: number) => {
    setRoomStates(prev => {
      const current = prev[roomId];
      if (!current) return prev;
      const updatedApps = current.appliances.map((app, idx) => {
        if (idx === applianceIndex) {
          return { ...app, isOn: !app.isOn };
        }
        return app;
      });
      return {
        ...prev,
        [roomId]: {
          ...current,
          appliances: updatedApps,
          isEcoOff: false, // manual interaction re-engages relay
        },
      };
    });
  }, []);

  // Action: Simulate Eco-Off for a single room
  const simulateEcoOff = useCallback((roomId: string) => {
    const room = roomStates[roomId];
    if (!room) return;

    // Calculate how many watts we remediate
    let remediatedWatts = 0;
    room.appliances.forEach(a => {
      if (a.isOn) remediatedWatts += a.count * a.wattageEach;
    });

    const kwhSaved = parseFloat(((remediatedWatts * 0.5) / 1000).toFixed(2)); // estimated for 30 mins
    const costSaved = parseFloat((kwhSaved * assumptions.tariffInrPerKwh).toFixed(2));
    const co2Avoided = parseFloat((kwhSaved * assumptions.carbonEmissionFactorKgPerKwh).toFixed(2));

    setRoomStates(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        isEcoOff: true,
        appliances: prev[roomId].appliances.map(a => ({ ...a, isOn: false })),
      },
    }));

    setAccumulatedKwhSaved(prev => prev + kwhSaved);

    setAuditTrail(prev => [
      {
        id: `audit-${Date.now()}-${roomId}`,
        timestamp: timeString,
        roomId,
        roomName: room.metadata.name,
        action: 'SIMULATE_ECO_OFF',
        wattsRemediated: remediatedWatts,
        estimatedKwhSaved: kwhSaved,
        estimatedCostSavedInr: costSaved,
        estimatedCo2AvoidedKg: co2Avoided,
        initiatedBy: `${currentRole} Console`,
      },
      ...prev,
    ]);
  }, [roomStates, assumptions, timeString, currentRole]);

  // Action: Simulate Campus-Wide Eco-Remediation (1-click fixes all active waste)
  const simulateCampusEcoRemediation = useCallback(() => {
    let totalRemediatedWatts = 0;

    setRoomStates(prev => {
      const next = { ...prev };
      activeAlerts.forEach(alert => {
        const room = next[alert.roomId];
        if (room) {
          room.appliances.forEach(a => {
            if (a.isOn) totalRemediatedWatts += a.count * a.wattageEach;
          });
          next[alert.roomId] = {
            ...room,
            isEcoOff: true,
            appliances: room.appliances.map(a => ({ ...a, isOn: false })),
          };
        }
      });
      return next;
    });

    const kwhSaved = parseFloat(((totalRemediatedWatts * 0.5) / 1000).toFixed(2));
    const costSaved = parseFloat((kwhSaved * assumptions.tariffInrPerKwh).toFixed(2));
    const co2Avoided = parseFloat((kwhSaved * assumptions.carbonEmissionFactorKgPerKwh).toFixed(2));

    setAccumulatedKwhSaved(prev => prev + kwhSaved);

    setAuditTrail(prev => [
      {
        id: `audit-bulk-${Date.now()}`,
        timestamp: timeString,
        roomId: 'CAMPUS-WIDE',
        roomName: `Campus Bulk Remediation (${activeAlerts.length} Rooms)`,
        action: 'SIMULATE_ECO_OFF',
        wattsRemediated: totalRemediatedWatts,
        estimatedKwhSaved: kwhSaved,
        estimatedCostSavedInr: costSaved,
        estimatedCo2AvoidedKg: co2Avoided,
        initiatedBy: `${currentRole} 1-Click Remediation`,
      },
      ...prev,
    ]);
  }, [activeAlerts, assumptions, timeString, currentRole]);

  // Teacher Lecture Cancellation
  const cancelLecture = useCallback((lectureId: string) => {
    setCancelledLectureIds(prev => new Set(prev).add(lectureId));
  }, []);

  const restoreLecture = useCallback((lectureId: string) => {
    setCancelledLectureIds(prev => {
      const next = new Set(prev);
      next.delete(lectureId);
      return next;
    });
  }, []);

  // Preset Hackathon Scenarios
  const loadPresetScenario = useCallback((scenario: 'LUNCH_BREAK' | 'TEACHER_CANCEL' | 'IDLE_LAB' | 'NORMAL_CLASS' | 'AFTER_HOURS') => {
    if (scenario === 'LUNCH_BREAK') {
      // 1:15 PM Monday: Scheduled lunch break, but classrooms left with ACs running
      setSimulationMinutes(795);
      setDay('MON');
      setRoomStates(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = {
            ...next[id],
            isEcoOff: false,
            appliances: getDefaultAppliances(next[id].metadata.roomType),
          };
        });
        return next;
      });
    } else if (scenario === 'TEACHER_CANCEL') {
      // 11:15 AM Monday: Cancel the lecture in 6102CR
      setSimulationMinutes(675);
      setDay('MON');
      setCancelledLectureIds(new Set(['lec-m-4'])); // MA in 6102CR
      setRoomStates(prev => ({
        ...prev,
        '6102CR': {
          ...prev['6102CR'],
          isEcoOff: false,
          appliances: getDefaultAppliances('CLASSROOM'),
        },
      }));
    } else if (scenario === 'IDLE_LAB') {
      // 3:30 PM Monday: Computer graphics lab 6210LA has no class scheduled, but 30 PCs and 2 ACs are left ON
      setSimulationMinutes(930);
      setDay('MON');
      setRoomStates(prev => ({
        ...prev,
        '6210LA': {
          ...prev['6210LA'],
          isEcoOff: false,
          appliances: getDefaultAppliances('LABORATORY'),
        },
      }));
    } else if (scenario === 'NORMAL_CLASS') {
      // 9:30 AM Monday: Regular lectures in session (optimal usage)
      setSimulationMinutes(570);
      setDay('MON');
      setCancelledLectureIds(new Set());
    } else if (scenario === 'AFTER_HOURS') {
      // 6:00 PM: After hours ghost loads
      setSimulationMinutes(1080);
      setDay('MON');
    }
  }, []);

  const updateAssumptions = useCallback((updated: Partial<ConfigurableAssumptions>) => {
    setAssumptions(prev => ({ ...prev, ...updated }));
  }, []);

  const clearAuditTrail = useCallback(() => {
    setAuditTrail([]);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        simulationMinutes,
        timeString,
        activeSlot,
        day,
        currentRole,
        isClockTicking,
        clockSpeedMultiplier,
        assumptions,
        roomDataList,
        activeAlerts,
        auditTrail,
        impactSummary,
        selectedRoomId,
        setSimulationMinutes,
        setDay,
        setCurrentRole,
        toggleClockTicking: () => setIsClockTicking(p => !p),
        setClockSpeedMultiplier,
        setSelectedRoomId,
        toggleAppliance,
        simulateEcoOff,
        simulateCampusEcoRemediation,
        cancelLecture,
        restoreLecture,
        loadPresetScenario,
        updateAssumptions,
        clearAuditTrail,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export function useSimulation(): SimulationContextType {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
