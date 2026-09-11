# Volunteer Guide Source Pack — JLT Community Cats app

This is a factual source pack for another AI to write the volunteer-facing guide. It describes the app exactly as a volunteer will encounter it at initial deployment. It is not the guide itself.

App name (as installed on a phone): **JLT Community Cats** (short name **Cat Rounds**). It's a phone-installable web app (Add to Home Screen), portrait orientation, opens directly to the home screen.

---

## 1. Access and sign-in

A volunteer reaches the app via its web address, opened in a phone browser (or as an installed home-screen icon). Every screen requires being signed in except the sign-in screen itself.

**Sign-in screen**
- Heading: **"Cat Feeding Rounds"**
- Subtext: **"Sign in to start your round"**
- Field label: **"Email address"**, placeholder **"your@email.com"**
- Button: **"Send sign-in link"** (becomes **"Sending…"** while submitting, disabled until an email is entered)

**Behaviour:** Entering an email and tapping "Send sign-in link" sends a one-time sign-in link to that email address. No password is ever used.

**After requesting the link**, the screen changes to:
- **"Check your email"**
- **"We sent a sign-in link to `<email>`. Tap it to open the app."**

**Opening the magic link:** Tapping the link in the email opens the app and briefly shows **"Signing you in…"**, then automatically continues to the home screen (`/home`) once sign-in completes.

**If the link fails** (expired, already used, or sign-in doesn't complete within about 10 seconds), the volunteer instead sees:
- **"⚠️ Couldn't sign you in"**
- A short reason if one is available, otherwise **"This link may have expired or already been used."**
- A link: **"Back to sign in"**

**Signing out:** A **"Sign out"** link is available on the home screen (top right). Tapping it signs the volunteer out and returns them to the sign-in screen. Signing out does **not** discard an in-progress round — any unsynced round data stays on the phone.

**Session persistence:** Once signed in, the volunteer stays signed in on that device/browser until they explicitly sign out (no visible session-timeout behaviour in the app).

---

## 2. Home / main screen

After signing in, the volunteer lands on the home screen.

- Date, e.g. **"Friday 11 September"**
- Title: **"Feeding Rounds"**
- **"Sign out"** link, top right

**If a round is already in progress** (started but not finished), a green card appears above the round list:
- **"ROUND IN PROGRESS"**
- **"Tap to continue your current round →"** — tapping anywhere on this card resumes the round at the first station/cluster that isn't yet complete (or the complete/summary screen if every station/cluster is already done)
- **"Cancel round"** link — tapping it asks **"Cancel this round?"** with **"Yes, cancel"** (discards it) and **"Keep"** (dismisses)

**Below that, the two available rounds are always listed** (Dry Food Round always above Wet Food Round):
- **"Dry Food Round"** — description text (e.g. "Dry food + water — all 13 stations") and a station count
- **"Wet Food Round"** — description text (e.g. "Wet food + water — 5 clusters") and a cluster count

Tapping either round card opens that round's overview screen. If no routes are configured at all, the screen shows **"No active routes found."** / **"Ask your admin to set up a route."** — not expected in normal operation.

---

## 3. Starting a round

Tapping a round card (Dry Food Round or Wet Food Round) opens that round's **route overview** screen (see sections 4 and 8).

- **If no round is active:** the overview shows a **"Start round"** button.
- **If this same round is already in progress:** the overview instead shows a progress line and **"Continue round →"**, plus a **"Start over"** option.
- **If a different round is currently in progress** (e.g. the volunteer has an unfinished Dry Food round and opens the Wet Food Round instead), a warning appears: **"You have a round in progress on `<other round name>`."** Tapping "Start round" in this situation asks for confirmation before discarding the other round's progress (see below).

**Starting a fresh round when another is already in progress or being restarted ("Start over"):** the app asks explicitly before discarding anything:
- **"Discard your in-progress round on `<round name>`?"** or **"Discard your progress on this round?"**
- If stations/clusters were already checked off, it also states how many, and warns: **"…all sightings, food levels, and notes will be lost. This can't be undone."**
- Buttons: **"Keep it"** and **"Discard & start"**

Starting a round opens the first station/cluster in the route's order automatically.

---

## 4. Dry Food Round — route overview

- **"‹ Back"** link at top
- Round name **"Dry Food Round"**, its description, and a station count (e.g. "13 stations")
- **"Edit order"** link (top right) — see section 11
- **"Start round"**, or (if already started) a **"Progress"** line reading **"`X` / `Y` complete"**, a **"Continue round →"** button, and a **"Start over"** button

**Station list**, in the route's order (the volunteer's own saved order if they've set one, otherwise the default order):
- Each row shows a circular marker with either the station's position number, or a ✓ in a green circle once that station is complete
- Station name and its area/cluster label underneath
- For a **completed** station, small icons appear on the right showing what was recorded there: 🍽️ if dry food was topped up, 💧 if water was topped up, and 🥫 if wet food was topped up (🥫 only ever appears for the small number of stations that also track wet food — see section 6). Icons only appear for whichever of these were actually turned on; a completed station with nothing toggled shows no icons.
- Before a station is completed, its row looks the same as any other station's — there is nothing in the overview that marks a station as "also needs wet food" in advance; the volunteer only discovers this by opening it (see section 6).

Tapping **"Continue round →"** or **"Start round"** takes the volunteer straight into a station — the list itself is not tappable to jump to an individual station.

---

## 5. Dry Food Round — station workflow

Each Dry Food station is its own screen.

**Header**
- Small text: `<area/cluster>` **· Station `X` of `Y`**
- Station name (large)
- If the station has access notes recorded (e.g. a note about a gate code or where exactly to look), they appear directly underneath in italic small text.

**Food level on arrival**
| | |
|---|---|
| **Exact UI text** | "🍽️ Dry food on arrival" with a red **"· required"** label |
| **Choices** | **Empty**, **Medium**, **Full** (three buttons, pick one) |
| **Required?** | Yes — this is the one field that blocks completion. Tapping "Next station →" without selecting a level shows: **"Select the dry food level on arrival before continuing."** |
| **Behaviour** | Tapping a level highlights it; tapping the same one again deselects it |

**Topped up**
- **"Dry food"** (🍽️) and **"Water"** (💧) — two large toggle tiles. Tapping toggles a ✓ on the tile (e.g. "Dry food ✓"). Neither is required to complete the station.
- (Some stations show a third tile here, "Wet food" — see section 6.)

**Cats seen**
- Header: **"Cats seen"**, with a running count once at least one is selected (e.g. "3 seen")
- A grid of cat photo cards for every cat normally expected at this station. Tapping a card marks that cat as seen (green outline + checkmark). Tapping again un-marks it.
- Under each cat's name, any special instructions for that cat are shown automatically — see section 10.
- Once a cat is marked seen, a small ⚠️ button appears in the corner of its photo for flagging a welfare concern (section 10/17).
- A **"+ Add cat"** tile opens a search list of every other cat in the system, so the volunteer can add a cat that's normally based elsewhere but was seen here instead (a "guest" sighting). Selecting one there adds it to this station's list already marked as seen.

**New cats seen**
- Header: **"New cats seen"**
- A **"+ Add cat"** button opens a small form: a name/description field and a camera button to take a photo. **Both a name and a photo are required** — leaving either out shows a specific message ("Add a name or short description for this cat." / "Take a photo of this cat before adding it."). This is for a cat with no existing record in the system — it is recorded as seen at this station but is not one of the app's known cats.
- Newly-added cats appear as small chips with their photo and name, a ⚠️ welfare-flag button, and a ✕ to remove them.

**Notes**
- A free-text box, placeholder **"Add your notes here…"**, for anything else worth recording about this station on this visit.

**Completing the station / navigation** — see section 7 for the exact behaviour of the Previous / Next controls.

There is no minimum number of cats that must be marked seen — a station can be completed with zero cats seen if none were around.

---

## 6. Dry Food stations that also require wet food

A small number of Dry Food Round stations also need wet food, not just dry food and water.

**How a volunteer recognises this:** there is no separate label or badge saying so. The only visible difference is that the **"Topped up"** section on that station's screen shows **three** tiles instead of two:

- 🍽️ **Dry food**
- 🥫 **Wet food**
- 💧 **Water**

Everything else on the screen (food level on arrival, cats seen, notes, navigation) works exactly the same as an ordinary Dry Food station. Wet food is a toggle like the others — tapping it marks "Wet food ✓"; it is not required to complete the station (see section 12).

Once such a station has been completed with wet food (and/or dry food/water) toggled on, the route overview shows the matching icon(s) — 🥫 alongside 🍽️/💧 — next to that station in the list.

This applies to a fixed, small set of stations configured in the system; it is not tied to any particular cat's name, and is not something the volunteer sets themselves.

---

## 7. Previous / Next navigation

At the bottom of every station and cluster screen sits a two-button row:

- **"← Previous"** (left, smaller button) — shows the previous station/cluster's name underneath when there is one
- The main action button (right, large, primary) — its label depends on position:
  - **"Next station →"** (Dry Food, not the last station)
  - **"Next cluster →"** (Wet Food, not the last cluster)
  - **"Complete round →"** (on the very last station/cluster of the route)

**"← Previous" is pure navigation.** Tapping it simply takes the volunteer back to the previous station/cluster in the route, exactly as they left it — nothing is validated, nothing is marked complete, and nothing already entered is changed or lost. On the very first station/cluster of the round, this button is greyed out/disabled — there's nothing before it.

**The main button ("Next station →" / "Next cluster →" / "Complete round →") both validates and advances.** For a Dry Food station this means: the food-level check described in section 5 runs first; if it passes, the station is marked complete and the volunteer moves on to the next one (or to the round-complete screen, if this was the last one). For a Wet Food cluster there is nothing to validate — tapping it always marks the cluster complete and advances.

**Revisiting a station/cluster:** using "← Previous" (or reopening one another way) always shows exactly what was previously entered there — food level, toggles, cats seen, notes, welfare flags, areas covered. Nothing resets. If the volunteer then taps the main button again from an already-completed station/cluster, it simply re-confirms and moves forward again — any changes made during the revisit are kept.

**Returning to the route overview:** there is no "back to overview" button on a station/cluster screen itself. The volunteer returns via the app's bottom navigation (tapping "Rounds" again) or their phone's own back gesture/button.

---

## 8. Wet Food Round — route overview

Functionally identical in structure to the Dry Food overview (section 4), with cluster-specific wording:

- **"‹ Back"**, round name **"Wet Food Round"**, description, cluster count (e.g. "5 clusters")
- **"Edit order"** link
- **"Start round"** / **"Continue round →"** + **"Start over"**, with the same progress line and discard-confirmation behaviour as Dry Food
- **Cluster list**, in route order, each showing its position number or a ✓ once complete, and the cluster's name/area

Tapping a cluster row itself does not open it — the volunteer reaches a cluster via "Start round"/"Continue round →" and then the Previous/Next controls described in section 7.

---

## 9. Wet Food Round — cluster workflow

Each Wet Food cluster is its own screen, structurally similar to a Dry Food station but with two important differences: an **areas checklist** instead of a food-level field, and a clear statement of what selecting a cat means.

**Header**
- Small text: **"Cluster `X` of `Y`"**
- Cluster name
- If the cluster has notes recorded, they appear underneath in italic text.

**Areas to cover**
- Header: **"Areas to cover"**, with a running count once any are checked (e.g. "2/4 covered")
- A grid of named area buttons for that cluster (specific spots within the cluster to check). Tapping one toggles a checkmark on it.
- Beneath the grid: **"Just a reminder of where to check — walk them in any order."**

### Areas
Checking an area is **only a reminder/checklist** for the volunteer — it records which spots within the cluster they've physically checked. It has no other effect: it does not mark any cat as seen, and it is not required to complete the cluster.

**Cats**
- Header: **"Cats seen"**, with a running count once at least one is selected (e.g. "5/7 accounted for")
- Directly under that header: **"Selecting a cat confirms that wet food and water have been provided."**
- The same cat-card grid, welfare-flagging, "+ Add cat" (guest cat), and "New cats seen" behaviour as the Dry Food station (section 5) apply here too.

### Cats
Selecting a cat is **not just a sighting record** — per the on-screen text, marking a cat as seen at this cluster is how the volunteer confirms that wet food and water were actually put out there. Areas and cats are two separate things: checking an area does not select any cat, and selecting a cat does not check any area.

**Notes** — same free-text field as Dry Food, placeholder **"Add your notes here…"**.

**Navigation** — identical Previous/Next model to section 7 ("← Previous" plus "Next cluster →" / "Complete round →" on the last cluster).

---

## 10. Special cat instructions

When a cat has additional information on file, it appears automatically under that cat's photo/name wherever the cat is shown (station grids, guest-cat picker where relevant), as small coloured lines with an icon:

| Icon | Meaning | Colour |
|---|---|---|
| ⚠️ | Safety note (e.g. a behavioural warning) | red |
| ℹ️ | Feeding instructions (e.g. dietary requirement) | blue |
| 🩹 | Health note | amber |

A cat can have any combination of these, all shown at once, directly below its name.

**Feeding instructions can override the normal workflow.** For example, a cat's feeding-instructions line may explicitly say not to give it wet food even during the Wet Food Round — the app does not enforce this automatically (selecting the cat still marks wet food/water as provided per section 9); the volunteer must read and follow the instruction themselves.

**Welfare concerns** are a separate, volunteer-entered mechanism from these fixed instructions — see section 17.

---

## 11. Station / cluster order preferences

From a route's overview screen (Dry Food or Wet Food), tapping **"Edit order"** switches into reordering mode:

- Header changes to **"Drag to reorder stations"** (or "clusters")
- Each row shows a drag handle instead of its number/checkmark
- Buttons: **"Reset"** (only shown if a custom order is already saved), **"Cancel"**, and **"Save"**
- Dragging a row up or down reorders the list; tapping **"Save"** stores that order for this route

**Effect of a saved order:** once saved, that order is used everywhere for that route — the overview list, the sequence stations/clusters are visited in when starting or continuing a round, and what Previous/Next step to next. It stays in effect until reset or changed again.

**Reset:** tapping "Reset" (in edit mode) discards the custom order and returns to the app's default order.

**Scope:** the saved order is remembered on that phone/browser only — it is a personal preference for that device, not shared with other volunteers and not tied to the volunteer's account.

**If stations are later added to the route:** a volunteer's existing saved order still works — anything new is placed into their order automatically (next to where it naturally belongs in the route), so it isn't lost at the very end of the list. A volunteer does not need to redo their custom order just because the route gained a station; "Reset" is only needed if they want to fully return to the default order.

---

## 12. Completing a station / cluster

### Dry Food station
- **Only required field:** a dry food level (Empty/Medium/Full) must be selected.
- Missing it blocks completion with: **"Select the dry food level on arrival before continuing."**
- Nothing else is required — the "Dry food"/"Water" toggles, cats seen, and notes are all optional.
- On success: the station is marked complete and the volunteer moves to the next station (or the round-complete screen if it was the last one).

### Dry Food station requiring wet food
- Same single required field (dry food level) and the same completion behaviour.
- The extra "Wet food" toggle is optional, exactly like "Dry food" and "Water" — there is no requirement to turn it on before continuing.

### Wet Food cluster
- **No field is required at all.** There is no validation check of any kind — the volunteer can tap "Next cluster →" / "Complete round →" immediately, with nothing checked off and no cats selected, and it will succeed.
- Checking areas and selecting cats are both entirely optional as far as completion is concerned (though selecting a cat is how wet food/water gets confirmed for it — section 9).

In all cases, "completion" only marks that station/cluster done within the round and advances the volunteer — see section 13 for what happens at the very end of the round, and section 14 for when this data actually reaches the server.

---

## 13. Completing the round

After the last station/cluster, tapping **"Complete round →"** takes the volunteer to a summary screen:

- **"🎉 Round complete!"** / **"Here's your summary"**
- Four stat tiles:
  - number of **cats seen**
  - number of **stations visited** (or "clusters visited" for Wet Food)
  - 🍽️ **"All food topped up"** or **"Some food outstanding"** (highlighted green only when true)
  - 💧 **"All water topped up"** or **"Some water outstanding"** (highlighted green only when true)
- If any welfare concern was flagged during the round: **"⚠️ `N` welfare concern(s) flagged"** with **"These will be included in your report."**
- **"General notes (optional)"** — a free-text box for anything to add about the round as a whole
- Button: **"Generate report →"** (shows **"Saving…"** while syncing)

**Important:** the food/water tiles here are purely informational status, not a gate. There is no validation on this screen that blocks finishing the round — tapping "Generate report →" always proceeds, regardless of what the tiles say.

Tapping it triggers the sync described in section 14, then takes the volunteer to the report screen.

---

## 14. Reports and sync

Round data is sent to the server when the volunteer taps **"Generate report →"** at the end of the round (section 13). Nothing is sent while the round is in progress — everything is kept on the phone until that point.

**On the report screen:**
- **"Your report"** / **"Review and edit before sharing"**
- If sending succeeded, there is no banner at all — just the report text.
- If sending failed:
  - **"⚠️ This round hasn't saved to the server"**
  - **"Your report text below is safe to share now — but the underlying data (cat sightings, food levels) is only on this device until sync succeeds."**
  - A **"Retry sync"** button
- A text box containing the generated report, which the volunteer can edit freely before sharing
- If any new (not-yet-known) cats were added with photos during the round, a **"New cat photos"** section with a **"📷 Share `N` photos"** button
- **"📤 Share report"** — opens the phone's normal share sheet (or copies the text if sharing isn't available)
- **"Done — back to home"**

**Retry sync:** tapping it tries sending the round's data again. If it succeeds, the warning banner disappears. It is always safe to retry — retrying does not create duplicate records, whether it's the first successful attempt or a repeat after a failure; it simply makes sure the server has the same information currently shown on the phone.

**What the volunteer should do if sync fails:** they can still share the report text immediately (it doesn't depend on syncing). They should use "Retry sync" — ideally once they have a better connection — so the underlying sighting/food data reaches the server; this can be done any time before leaving the report screen.

---

## 15. Interrupted / resumed rounds

- **Leaving a station page** (e.g. switching to "Cats" and back, or backgrounding the app) and returning: the station reopens exactly as left — nothing is lost.
- **Closing and reopening the app/browser:** an in-progress round is still there. From the home screen, the green **"ROUND IN PROGRESS"** card appears and "Tap to continue your current round →" resumes at the first not-yet-completed station/cluster.
- **Navigating with the phone's own back button:** the app does not treat this specially — it behaves like normal browser back navigation between the pages already visited.
- **A round only disappears** when the volunteer explicitly cancels it (home screen "Cancel round"), explicitly starts a different round and confirms discarding it, or finishes it and taps "Done — back to home" on the report screen.

This is all based on data kept on that specific phone/browser — it is not synced anywhere until the round is finished (section 14).

---

## 16. Offline / connection behaviour

- **Answers already entered** (food levels, toggles, cats seen, notes, areas covered) are kept on the phone as the volunteer works, and are not lost by a poor or dropped connection mid-round.
- **Opening a station/cluster and loading its cat list, and loading the route overview, requires an internet connection** — these are fetched live; there is no offline copy of this information built into the app.
- **Nothing is sent to the server until the round is finished** (tapping "Generate report →"), which also requires a connection at that moment.
- **If that sync fails** (e.g. no signal at that moment), the volunteer is told clearly (section 14) and can use "Retry sync" once they're back online — their entered data is still safe on the phone in the meantime.

The app should not be described as working fully offline — only the "keep working while I have a bad moment of signal" resilience above is actually supported.

---

## 17. Cats / sightings / welfare functionality

All of the following are available to any signed-in volunteer, from within a station or cluster screen (sections 5 and 9):

**Marking a cat seen** — tap its photo card. This records a sighting for that cat at that station/cluster for this round.

**Adding an existing cat seen somewhere else ("guest" sighting)** — tap **"+ Add cat"** in the main grid, search by name, tap a cat to add/remove it. Added cats appear already marked as seen.

**Adding a brand-new cat with no record** — under **"New cats seen"**, tap **"+ Add cat"**, enter a name/short description and take a photo (both required). It's recorded against this station/cluster for this round only, with no other existing information attached (it won't show feeding/health/safety notes, since none exist yet for it).

**Flagging a welfare concern** — once a cat is marked seen, tap the small ⚠️ button on its photo. This opens:
- **"Welfare concern"** / cat's name
- A text box, placeholder **"Describe the concern — injury, illness, behaviour, weight loss…"**
- **"Clear flag"** (only shown if a concern is already saved) and **"Save concern"** (disabled until text is entered)

A flagged cat shows a small **"Concern"** label and a highlighted ⚠️ button. Flagged concerns are counted and called out on the round-complete screen and included in the generated report.

**Limitations:** there is no way for a volunteer to edit a cat's permanent record (name, fixed feeding instructions, photo, etc.) from within a round — only to record what happened during this visit (sighting, new welfare note, or add a brand-new cat). A full cat directory with fuller information (bios, adoption status) is reached separately via the **"Cats"** tab at the bottom of the app, which opens an external site in the phone's browser (**"Open cat directory ↗"**) rather than anything inside this app.

---

## 18. Important field-use behaviour

Practical points a volunteer should know while actually walking a round on their phone:

- **The only thing that can stop you moving forward on a Dry Food station is the food level.** Everything else (toggles, cats, notes) is optional — don't worry about completing every field.
- **Wet Food clusters have no required fields at all** — you can always move on.
- **Selecting a cat during the Wet Food Round is a confirmation, not just a checkbox** — it tells the app wet food and water were provided to that cat.
- **You can always go back with "← Previous"** to check or correct something at an earlier station/cluster — this never undoes anything or loses data, on either side.
- **Revisiting and re-confirming an already-completed station/cluster is fine** — nothing bad happens; your latest entries are what's kept.
- **A station that also needs wet food isn't flagged in advance** — you'll see it as a third "Wet food" tile once you open that particular station.
- **Read the small icon notes under a cat's name** (⚠️/ℹ️/🩹) before feeding — they can override the default routine (e.g. dry food only for a specific cat).
- **If sync fails at the very end, you haven't lost anything** — your report text is still shareable immediately, and "Retry sync" can be used once you have signal.
- **Your custom stop order (if you set one) is remembered only on your own phone.**

---

## 19. Error / recovery screens

**Auth link expired or invalid**
- **What the volunteer sees:** "⚠️ Couldn't sign you in" with a reason or "This link may have expired or already been used."
- **What action is available:** "Back to sign in" to request a new link.

**No active round found** (a station/cluster page opened with no round in progress, e.g. via a stale link)
- **What the volunteer sees:** "No active round found."
- **What action is available:** "Go home".

**Station/cluster no longer part of the route** (opened via a stale link referencing a stop that isn't in the current route)
- **What the volunteer sees:** "This station isn't part of the current route anymore."
- **What action is available:** "Back to route overview".

**Sync failed** — see section 14 ("Retry sync").

**Couldn't load cat names** (on the report screen, if fetching cat details for the report fails)
- **What the volunteer sees:** "Couldn't load cat names" / "The report below may be missing some cats seen this round. Check your connection and try again."
- **What action is available:** "Retry".

**Couldn't load routes** (home screen, if the route list fails to load)
- **What the volunteer sees:** "Could not load routes. Check your connection."
- **What action is available:** none shown beyond retrying by reloading.

---

## 20. Exact UI inventory

### Sign in
- "Cat Feeding Rounds"
- "Sign in to start your round"
- Email address
- "Send sign-in link" / "Sending…"
- "Check your email"

### Auth callback
- "Signing you in…"
- "Couldn't sign you in"
- "Back to sign in"

### Home
- "Feeding Rounds"
- "Sign out" / "Signing out…"
- "ROUND IN PROGRESS"
- "Tap to continue your current round →"
- "Cancel round" / "Cancel this round?" / "Yes, cancel" / "Keep"
- "Dry Food Round"
- "Wet Food Round"

### Route overview (Dry Food / Wet Food)
- "‹ Back"
- "Edit order"
- "Start round"
- "Continue round →"
- "Start over"
- "Progress"
- "Discard your in-progress round on …?" / "Keep it" / "Discard & start"
- Edit-order mode: "Drag to reorder stations/clusters" / "Reset" / "Cancel" / "Save"

### Dry Food station
- "Dry food on arrival" · required
- Empty / Medium / Full
- "Topped up"
- Dry food
- Water
- (Wet food — only on qualifying stations)
- "Cats seen"
- "+ Add cat"
- "New cats seen"
- "Notes"
- "← Previous"
- "Next station →" / "Complete round →"
- "Select the dry food level on arrival before continuing."

### Wet Food cluster
- "Areas to cover"
- "Just a reminder of where to check — walk them in any order."
- "Cats seen"
- "Selecting a cat confirms that wet food and water have been provided."
- "+ Add cat"
- "New cats seen"
- "Notes"
- "← Previous"
- "Next cluster →" / "Complete round →"

### Welfare concern
- "Welfare concern"
- "Describe the concern — injury, illness, behaviour, weight loss…"
- "Clear flag"
- "Save concern"

### Round complete
- "Round complete!"
- "Here's your summary"
- "cats seen"
- "stations visited" / "clusters visited"
- "All food topped up" / "Some food outstanding"
- "All water topped up" / "Some water outstanding"
- "welfare concern(s) flagged"
- "General notes (optional)"
- "Generate report →" / "Saving…"

### Report / sync
- "Your report"
- "Review and edit before sharing"
- "This round hasn't saved to the server"
- "Retry sync"
- "New cat photos"
- "Share N photos"
- "Share report"
- "Done — back to home"

### Bottom navigation (every screen)
- "Rounds" 🗺️
- "Cats" 🐱

### Cats tab
- "Cat Directory"
- "Open cat directory ↗"

---

## 21. Screenshots

Screenshots exist at `volunteer-guide-screenshots/`, captured live from the running app at a real mobile viewport (375×812):

- `01-sign-in.png`, `02-home.png`, `03-dry-route.png`, `04-dry-station.png`, `05-dry-wet-required.png`, `06-wet-route.png`, `07-wet-cluster.png`, `08-edit-order.png`, `09-complete-round.png`, `10-report-sync.png`, `11-welfare-concern.png`

Real app data and real interaction states — not mockups (e.g. `04-dry-station.png` shows an actual cat marked seen with a food level selected; `10-report-sync.png` shows the genuine sync-failed/Retry-sync banner alongside a real generated report, including its "Cats Not Seen" list).

**One known limitation:** the body text in these captures renders in a serif fallback font instead of the app's actual sans-serif typeface — a rendering-tool limitation of the capture method used, unrelated to the app itself. Layout, exact text, colors, icons, and button states are all accurate.

---

# Potential ambiguities for guide writer

1. **Wet-food-area access notes may not be practically visible on a phone.** For a Wet Food cluster's "areas to cover" buttons, any access note recorded for an area is only exposed as a native long-press/hover tooltip on the button. On a touchscreen this is not a reliably discoverable interaction (no hover; a long-press might just be interpreted as a tap). Station-level access notes (Dry Food stations and cluster-level notes), by contrast, are always shown as visible text on screen. **Clear:** station/cluster-level notes are always visible. **Unclear:** whether area-level notes should be described as "available" to volunteers at all, given how hard they are to actually reveal on a phone. **Question for guide writer/user:** should the guide even mention area-level access notes, or omit them since they're effectively inaccessible in practice?

2. **Which specific stations require wet food is not fixed in the app's code** — it's a per-station setting that could in principle apply to any station, not a named, unchanging list. **Clear:** the mechanism itself (a station either does or doesn't also need wet food, shown by the extra tile). **Unclear:** whether the finished guide should name specific stations at all, given they could change. **Question:** confirm with the user whether the current set of wet-food-requiring stations should be named as concrete examples, or the guide should stay fully generic ("some stations also need wet food").

3. **No in-app indication of which volunteer is signed in beyond the sign-out link**, and no visible list of "your rounds" history — a volunteer can't see past rounds they've completed from within the app. **Clear:** the current round/report flow. **Unclear:** whether this matters enough to mention as a limitation, or should simply be left out since it's a non-feature.

4. **The external "Cat Directory" link** opens a separate website not covered by this inspection (its content and behaviour are outside this app's codebase). **Clear:** the app itself just opens it in the browser. **Unclear:** anything about what that external site actually shows — the guide writer should not describe its contents beyond "bios, photos, and adoption status … full stories, TNR status, and adoption info," which is literally what this app's own screen says about it.

5. **No explicit maximum session length or forced re-authentication was observed.** This is described in section 1 as "stays signed in until sign-out," based on the absence of any visible expiry behaviour in the code — but this couldn't be fully confirmed by inspection alone (it depends on server-side session settings not visible from the app's UI). Treat as reasonably confident, not certain.
