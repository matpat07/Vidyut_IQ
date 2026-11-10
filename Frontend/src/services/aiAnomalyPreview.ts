import { WastageAlert, SimulatedTelemetry } from '../types/telemetry.types';
import { RoomMetadata } from '../types/room.types';

export interface RuleBasedDiagnostic {
  anomalyType: 'GHOST_LOAD_AFTER_CLASS' | 'LUNCH_BREAK_AIR_CONDITIONING' | 'UNAUTHORIZED_LAB_IDLE' | 'ABSENT_FACULTY_LEAK';
  summary: string;
  rootCauseAnalysis: string;
  recommendedAction: string;
}

/**
 * Presentation-only explanation of the existing wastage rules and simulator.
 * No model, statistical confidence, appliance inference or physical sensor query.
 */
export function generateRuleBasedDiagnostic(
  alert: WastageAlert,
  telemetry: SimulatedTelemetry,
  room: RoomMetadata
): RuleBasedDiagnostic {
  const evidence = `Simulated energy-meter reading: ${telemetry.simulatedPowerWatts.toLocaleString('en-IN')} W. Simulated occupancy signal: ${telemetry.simulatedPirPresence ? 'presence' : 'no presence'}. Rule evidence: ${alert.reason}`;
  if (alert.reason.includes('Break')) {
    return {
      anomalyType: 'LUNCH_BREAK_AIR_CONDITIONING',
      summary: 'Modeled demand exceeds standby during a scheduled break.',
      rootCauseAnalysis: evidence,
      recommendedAction: 'Review the configured appliance states and simulate Eco-Off to compare estimated impact. No restart is scheduled by this prototype.',
    };
  }

  if (alert.reason.includes('CANCELLED')) {
    return {
      anomalyType: 'ABSENT_FACULTY_LEAK',
      summary: 'The simulated cancellation leaves modeled appliances powered on.',
      rootCauseAnalysis: evidence,
      recommendedAction: 'Review the cancelled timetable entry and simulate Eco-Off if the modeled room is unused.',
    };
  }

  if (room.roomType === 'LABORATORY') {
    return {
      anomalyType: 'UNAUTHORIZED_LAB_IDLE',
      summary: 'A laboratory has modeled excess demand outside expected occupancy.',
      rootCauseAnalysis: evidence,
      recommendedAction: 'Inspect the configured laboratory appliance breakdown and simulate switching off unused loads. No device commands are sent.',
    };
  }

  return {
    anomalyType: 'GHOST_LOAD_AFTER_CLASS',
    summary: 'Modeled demand and expected room occupancy require review.',
    rootCauseAnalysis: evidence,
    recommendedAction: 'Check the timetable and simulated occupancy, then simulate Eco-Off if appropriate. Physical switching is future scope.',
  };
}
