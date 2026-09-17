export interface BOMItem {
  component: string;
  specification: string;
  purpose: string;
  approxUnitCostInr: number;
  quantityForPilot: number;
  approxTotalCostInr: number;
  isSharedInfrastructure?: boolean;
}

export const HARDWARE_BOM: BOMItem[] = [
  {
    component: 'Microcontroller',
    specification: 'ESP32 DevKit V1 (Wi-Fi + BLE, dual-core)',
    purpose: 'Reads sensors, runs local logic, sends telemetry over MQTT',
    approxUnitCostInr: 450,
    quantityForPilot: 2,
    approxTotalCostInr: 900,
  },
  {
    component: 'Energy Meter',
    specification: 'PZEM-004T v3.0 (AC 100A with split-core CT clamp)',
    purpose: 'Calibrated V, I, active power (W), PF, and cumulative kWh over UART',
    approxUnitCostInr: 800,
    quantityForPilot: 2,
    approxTotalCostInr: 1600,
  },
  {
    component: 'Relay Module',
    specification: '4-Channel optocoupled 5V relay module',
    purpose: 'Operates externally installed contactor circuits',
    approxUnitCostInr: 250,
    quantityForPilot: 2,
    approxTotalCostInr: 500,
  },
  {
    component: 'Presence Veto Sensor',
    specification: 'LD2410C 24GHz mmWave radar module',
    purpose: 'Micro-motion human presence detection (safety veto)',
    approxUnitCostInr: 350,
    quantityForPilot: 2,
    approxTotalCostInr: 700,
  },
  {
    component: 'Environment Sensor',
    specification: 'BME280 temperature, humidity & pressure sensor',
    purpose: 'Feeds AC optimization and environmental monitoring',
    approxUnitCostInr: 250,
    quantityForPilot: 2,
    approxTotalCostInr: 500,
  },
  {
    component: 'Power Supply',
    specification: '5V 2A SMPS adapter',
    purpose: 'Powers low-voltage node electronics safely',
    approxUnitCostInr: 150,
    quantityForPilot: 2,
    approxTotalCostInr: 300,
  },
  {
    component: 'Enclosure & Accessories',
    specification: 'ABS DIN-rail junction box, fuse, terminals, wiring',
    purpose: "Houses and protects node at the room's electrical panel",
    approxUnitCostInr: 400,
    quantityForPilot: 2,
    approxTotalCostInr: 800,
  },
];

export const BOM_SUMMARY = {
  approxPerRoomNodeCostInr: 2650, // Retrofit cost per room node
  twoNodeBenchCostInr: 5300,
  softwarePlatformCostInr: 0, // Open-source web stack
  safetyNote:
    'The ESP32 controls a properly rated relay/driver circuit, which operates an externally installed contactor. Mains installation must be performed by a licensed electrician.',
  stagedShutdownNote:
    'Illustrative simulation sequence; actual timing and load order must be configured according to equipment specifications and electrical safety requirements.',
  paybackNote:
    'Illustrative simple payback may be below six months under these assumptions; actual payback requires measured consumption, tariff confirmation, installation cost, and verified savings.',
};
