import { RoomMetadata } from '../types/room.types';
import { ExpectedOccupancyStatus } from '../types/timetable.types';
import { SimulatedTelemetry, WastageAlert, AnomalySeverity } from '../types/telemetry.types';
import { ConfigurableAssumptions } from '../types/impact.types';

export interface WastageEvaluationResult {
  telemetry: SimulatedTelemetry;
  alert?: WastageAlert;
}

export function evaluateWastage(
  meta: RoomMetadata,
  rawTelemetry: SimulatedTelemetry,
  expectedStatus: ExpectedOccupancyStatus,
  currentMinutes: number,
  assumptions: ConfigurableAssumptions
): WastageEvaluationResult {
  const excessWatts = Math.max(0, rawTelemetry.simulatedPowerWatts - rawTelemetry.baselineStandbyWatts);
  const isPowerDrawAboveStandby = excessWatts > 80;

  let isWastingPower = false;
  let severity: AnomalySeverity = 'STANDBY';
  let reason = '';
  let recommendedAction = '';

  // Condition 1: Scheduled Break (e.g. Lunch Break 1:10 PM - 2:10 PM) with active loads
  if (expectedStatus === 'BREAK' && isPowerDrawAboveStandby) {
    isWastingPower = true;
    severity = excessWatts > 2000 ? 'CRITICAL' : excessWatts > 800 ? 'HIGH' : 'MEDIUM';
    reason = `Campus-wide Break active, but ${excessWatts}W active load detected with zero PIR presence.`;
    recommendedAction = 'Execute Eco-Off contactor cutoff to prevent break-hour air conditioning waste.';
  }
  // Condition 2: Cancelled Lecture with lights/AC left ON
  else if (expectedStatus === 'CANCELLED' && isPowerDrawAboveStandby) {
    isWastingPower = true;
    severity = excessWatts > 1500 ? 'CRITICAL' : 'HIGH';
    reason = `Lecture reported CANCELLED by faculty, but room circuits remain active (${excessWatts}W draw).`;
    recommendedAction = '1-Click Relay Eco-Off: Cut power and release room to student study pool.';
  }
  // Condition 3: Unscheduled Vacant Room with Ghost Load (e.g. empty lab with PCs/AC on)
  else if (expectedStatus === 'VACANT' && isPowerDrawAboveStandby) {
    if (!rawTelemetry.simulatedPirPresence) {
      isWastingPower = true;
      severity = excessWatts > 2500 ? 'CRITICAL' : excessWatts > 1000 ? 'HIGH' : 'MEDIUM';
      reason = `No class scheduled in timetable and zero mmWave presence verified. Ghost load: ${excessWatts}W.`;
      recommendedAction = 'Stage contactor shutdown: cut secondary lighting and air conditioning.';
    } else {
      // Unscheduled but student presence detected (e.g. self-study)
      severity = 'OPTIMAL';
      isWastingPower = false;
    }
  }
  // Condition 4: Scheduled Lecture, but 0 occupants detected after grace period
  else if (expectedStatus === 'SCHEDULED' && !rawTelemetry.simulatedPirPresence && isPowerDrawAboveStandby) {
    isWastingPower = true;
    severity = 'HIGH';
    reason = `Timetable indicates scheduled lecture, but PIR & mmWave radar detect zero occupants.`;
    recommendedAction = 'Send push notification to faculty or trigger safety-vetoed staged shutdown.';
  }
  // Condition 5: Normal Scheduled Usage with Occupants
  else if (expectedStatus === 'SCHEDULED') {
    severity = 'OPTIMAL';
    isWastingPower = false;
  }
  // Condition 6: Powered off / Standby
  else {
    severity = 'STANDBY';
    isWastingPower = false;
  }

  const updatedTelemetry: SimulatedTelemetry = {
    ...rawTelemetry,
    severity,
    isWastingPower,
  };

  let alert: WastageAlert | undefined = undefined;

  if (isWastingPower) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = Math.floor(currentMinutes % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    const timeStr = `${h12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;

    const hourlyCost = parseFloat(((excessWatts / 1000) * assumptions.tariffInrPerKwh).toFixed(2));

    alert = {
      id: `alert-${meta.id}-${currentMinutes}`,
      roomId: meta.id,
      roomName: meta.name,
      timestamp: timeStr,
      severity,
      reason,
      excessWatts,
      estimatedHourlyCostWastedInr: hourlyCost,
      recommendedAction,
    };
  }

  return {
    telemetry: updatedTelemetry,
    alert,
  };
}
