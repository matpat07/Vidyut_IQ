# VidyutIQ: a 3–5 minute judge demonstration

This is a working software simulation and conceptual architectural digital twin. It has no deployed meters, physical switching, hosted LLM or validated ML anomaly model. Keep this distinction explicit throughout the presentation.

## Before presenting

From the repository root, with Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Root installation also installs `Frontend/` through its postinstall hook. Open the local address Vite prints. In PowerShell use `npm.cmd` if `npm.ps1` is blocked. No application environment variables or meter service are needed.

Use a current desktop browser. Reload the page once before the demonstration to start a fresh simulation session. Leave the clock paused at MON, 01:15 PM. The opening 1.24 kWh total and the preloaded 0.53 kWh audit example are demonstration seeds, not actions by the current visitor. Presets can reset appliance states but do not clear accumulated savings; a full page reload reinitializes the in-memory session.

## 1. Explain the problem — 20 seconds

- **Starting state/navigation:** public landing page `/`, hero visible.
- **Action:** introduce the headline and the building; optionally scroll to “Why VidyutIQ.”
- **Expected outcome:** the actual Building No. 6 model and contextual challenge cards.
- **Say:** “A timetable and an electricity bill do not tell an administrator which vacant room still has powered appliances. We connect expected occupancy with modeled demand.”
- **Fallback:** use the static hero image or a checked-in [exterior capture](verification/01-exterior.png).

## 2. Introduce the product — 20 seconds

- **Starting state/navigation:** landing page `/`.
- **Action:** click **Launch Dashboard**. Briefly point to the simulation bar and **Demo Scenario: Lunch Break**; expand its explanation if useful.
- **Expected outcome:** `/app/dashboard`, paused Monday 1:15 PM, simulated power, room summaries and rule alerts. The hourly graph is an illustrative profile, not recorded meter history.
- **Say:** “These are deterministic simulated readings. The starting lunch-break state deliberately leaves configured appliances on while expected occupancy is low.”
- **Fallback:** open `/app/dashboard` directly. Use **Simulate scenario → Lunch Break Waste** if the state has changed.

## 3. Explore Campus Radar — 35 seconds

- **Starting state/navigation:** select **Campus Radar** in the sidebar, or open `/app/radar`; use **Back to Building** if a floor is already focused.
- **Action:** scroll inside the building viewport to separate the five floors; reverse briefly to show reassembly. Select **F2 — Second Floor**.
- **Expected outcome:** a five-layer stack, fixed surrounding controls and a camera transition into the second-floor plan. Floor switching retreats through the stack. **Reset View** returns to the exploded stack; **Back to Building** returns to the exterior.
- **Say:** “The geometry comes from supplied architectural references. Each floor has its own layout. This is a conceptual reconstruction, not surveyed CAD.”
- **Fallback:** use the separation slider/touch controls or select F2 directly. If WebGL fails, choose **Open room list** or the **Room list** tab.

## 4. Inspect supported room analytics — 35 seconds

- **Starting state/navigation:** F2 focused, **Source: Demo Mode**.
- **Action:** select **6206** with the floor room selector or room search. Show current demand, period energy, the historical graph and appliance demand. Try **Energy View** and **Anomaly View**.
- **Expected outcome:** the architectural Room 6206 maps to `6206LA` (IoT & Embedded Lab 1). Its selected-period history is modeled from timetable and current appliance settings. Anomaly highlights require existing rule evidence.
- **Say:** “kW is instantaneous demand; kWh is energy over the selected period. The appliance breakdown uses configured counts and nameplate wattages, not submeter readings.”
- **Fallback:** in Room list search **6206**, select its row and inspect the same supported record. Room **6207** intentionally reports no telemetry; do not use it for a populated energy demo. Floors 3/4 and many facilities are also unmapped.

## 5. Explain the waste rule — 25 seconds

- **Starting state/navigation:** stay in Demo Mode; use **Simulate scenario → Lunch Break Waste** if needed.
- **Action:** open **Waste Alerts** and point to a room's simulated demand, occupancy/timetable reason and suggested software action. **Details → Sensors & Simulation** shows the rule-based diagnostic.
- **Expected outcome:** rules flag modeled demand above standby during a break. The diagnostic states the available evidence and has no confidence percentage or trained-model probability.
- **Say:** “High usage by itself is not waste. Here the rule combines the timetable, modeled occupancy and excess demand.”
- **Fallback:** choose **Cancelled Lecture**. This sets Monday 11:15 AM and cancels the existing `lec-m-4` entry for Room `6102CR`. It changes expected occupancy; cancellation does not physically switch appliances off. Return to Lunch Break Waste for the common flow below.

## 6. Run an Eco-Off simulation — 30 seconds

- **Starting state/navigation:** lunch-break preset, clock paused. In Radar, select F2 → 6206 → **Open simulation controls**, or use Dashboard **Inspect a room → 6206LA**.
- **Action:** open the **Actions** tab and click **Simulate Eco-Off & Close** once.
- **Expected outcome:** the software appliance flags switch off; modeled standby remains. The default laboratory inventory totals 10,100 W. The existing 30-minute formula estimates **5.05 kWh**, **₹45.45** at ₹9/kWh and **4.14 kg CO₂** at 0.82 kg/kWh. These are calculation examples, not measured reductions.
- **Say:** “This button changes local simulation state. It sends no relay, contactor, device-sleep or restart command.”
- **Fallback:** use Waste Alerts **Details → Actions** for another supported room, or **Simulate Shutdown** for that room. Its estimated result depends on that room's currently powered inventory; do not reuse the laboratory numbers for a classroom.

## 7. Show accountability and impact — 25 seconds

- **Starting state/navigation:** immediately after the single Room 6206 action above.
- **Action:** open **Audit Trail**, then **Analytics** and **Assumptions**.
- **Expected outcome:** a new `6206LA` audit record with 5.05 kWh estimated savings. On a fresh session with just this action, Analytics totals become **6.29 kWh**, **₹56.61** and **5.16 kg CO₂**, including the 1.24 kWh seed. The preloaded audit row is separately marked **Demo seed · preloaded**.
- **Say:** “The initial savings are a demonstration baseline; this new record is the action we just performed. Cost and emissions follow explicit configurable assumptions.”
- **Fallback:** show the current values without claiming the above totals if other actions have occurred. The 0.53 kWh seeded audit row is illustrative and does not reconcile the entire 1.24 kWh opening baseline. Do not present either as a meter ledger or visitor activity.

## 8. Close with future scope — 20 seconds

- **Starting state/navigation:** click the sidebar wordmark to return to `/`, then **Future Scope**.
- **Action:** open **View full campus image**. Point to the roadmap cards, then close the viewer.
- **Expected outcome:** the complete user-supplied PCCOE campus aerial, preserved unchanged, with conceptual capability callouts.
- **Say:** “Building No. 6 is interactive today. The multi-building image illustrates future scope: a metered campus digital twin, secure telemetry and validated predictive optimization.”
- **Fallback:** use the locally served [original campus reference](../public/landing/pccoe-campus.jpeg). Do not label unverified building locations or claim the full campus is already a WebGL model.

## Troubleshooting

| Symptom | Reliable response |
| --- | --- |
| Blank or unavailable WebGL scene | Use **Open room list** / **Room list**. Search 6206 for supported simulation analytics; the searchable list works independently of WebGL. The landing hero has a static fallback and optional Enable 3D. |
| Room says “No telemetry” | Use F2 → 6206. Do not assign another room's readings. 6207 is deliberately unavailable. |
| Live / Connected is empty | Select **Demo Mode**. No connected provider is configured; this is the expected state. |
| Camera is mid-transition | Allow it to settle; use **Back to Floor Stack** or **Reset View**. No page reload is needed to change floors. |
| Scenario wording changes | The indicator follows current timetable, time and appliance state. Reload or select Lunch Break Waste for the starting flow. A short timetable break is labeled Scheduled Break. |
| Savings differ from this guide | Other actions have accumulated in the session. Explain current values or reload once to restore demonstration seeds. |
| `/app/radar` refresh returns 404 on a hosted site | Check Netlify base `Frontend`, publish `dist`, and the copied `_redirects` file. See [DEPLOYMENT.md](DEPLOYMENT.md). |
| Root commands open the old app | Confirm the current branch includes delegated root scripts; use `cd Frontend && npm ci && npm run dev` as a direct fallback. |
| PowerShell blocks npm | Use `npm.cmd`; no execution-policy change is necessary. |

The checked-in screenshots and browser reports demonstrate tested software behavior, not physical-device coverage, measured savings, a real-GPU FPS benchmark or electrical safety certification.
