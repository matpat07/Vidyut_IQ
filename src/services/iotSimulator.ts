import { RoomState } from '../types/room.types';
import { ExpectedOccupancyStatus } from '../types/timetable.types';
import { SimulatedTelemetry } from '../types/telemetry.types';

export function calculateSimulatedTelemetry(
  roomState: RoomState,
  expectedStatus: ExpectedOccupancyStatus,
  currentMinutes: number,
  manualPIRPresence?: boolean
): SimulatedTelemetry {
  const { metadata, appliances, isEcoOff } = roomState;

  // Base standby power (network node, IoT gateway, emergency LEDs)
  const baselineStandbyWatts = 18;

  let activeWatts = baselineStandbyWatts;

  if (!isEcoOff) {
    for (const app of appliances) {
      if (app.isOn) {
        activeWatts += app.count * app.wattageEach;
      }
    }
  }

  // Realistic electrical fluctuation (±1.2% noise)
  const noiseFactor = 1 + (Math.sin(currentMinutes * 0.5 + parseInt(metadata.id, 10) || 1) * 0.012);
  const simulatedPowerWatts = Math.max(baselineStandbyWatts, Math.round(activeWatts * noiseFactor));

  // AC electrical parameters
  const simulatedVoltage = parseFloat((230 + Math.sin(currentMinutes) * 1.8).toFixed(1));
  const simulatedPowerFactor = isEcoOff ? 0.75 : 0.95;
  const simulatedCurrent = parseFloat((simulatedPowerWatts / (simulatedVoltage * simulatedPowerFactor)).toFixed(2));

  // Cumulative kWh approximation
  const cumulativeKWh = parseFloat(((simulatedPowerWatts * (currentMinutes / 60)) / 1000 + 42.5).toFixed(2));

  // PIR Motion & Occupancy simulation
  let simulatedPirPresence = false;
  let simulatedOccupantCount = 0;

  if (manualPIRPresence !== undefined) {
    simulatedPirPresence = manualPIRPresence;
    simulatedOccupantCount = manualPIRPresence ? Math.round(metadata.capacity * 0.8) : 0;
  } else {
    // Normal timetable behavior:
    if (expectedStatus === 'SCHEDULED') {
      simulatedPirPresence = true;
      simulatedOccupantCount = Math.round(metadata.capacity * 0.85); // 85% attendance
    } else {
      // Break, Cancelled, or Vacant -> 0 occupants
      simulatedPirPresence = false;
      simulatedOccupantCount = 0;
    }
  }

  // Ambient temperature (higher if AC is off or PCs are running)
  const hasAcRunning = appliances.some(a => a.type === 'AC' && a.isOn && !isEcoOff);
  const simulatedTempCelsius = hasAcRunning ? 22.5 : 28.0;

  return {
    roomId: metadata.id,
    timestamp: Date.now(),
    simulatedVoltage,
    simulatedCurrent,
    simulatedPowerWatts,
    simulatedPowerFactor,
    cumulativeKWh,
    simulatedPirPresence,
    simulatedOccupantCount,
    simulatedTempCelsius,
    baselineStandbyWatts,
    severity: 'STANDBY', // computed by wastageEngine
    isWastingPower: false, // computed by wastageEngine
  };
}
