# Gadgets roadmap

**Status:** The Gadgets hub, exam clock, Pomodoro, ambient sound, and persistent site navigation are implemented. Keivan selected the Quiet exam-clock design and authorized publication on 7 October 2026. Future recommendations below are proposals unless identified as implemented.

## Purpose and agreed direction

Create a growing Gadgets section with useful tools for reading, studying, teaching, and working. The first ideas are an exam clock with optional formatted rules, and a Pomodoro timer with optional ambient sound.

Keivan wants active gadgets to remain available in the site's top bar while people read and move around the website. Show necessary information, such as time remaining, and provide immediate actions, such as pausing or resuming sound. Keep the design minimal, elegant, consistent, useful, and easy to use.

This document establishes the product direction, shared foundation, development order, and review criteria before implementation. Keep it current as decisions are made and gadgets are added.

## Recorded decisions

| Decision | Direction | Status |
| --- | --- | --- |
| Where users start gadgets | Start and configure gadgets in the Gadgets section. The top bar controls sessions after they are started; it has no quick-start launcher. | Agreed, 7 October 2026: 1B. |
| Continuity between pages | Timer and sound continue seamlessly when following links between website pages. Establish this foundation before the gadget release. | Agreed, 7 October 2026: 2A. |
| Simultaneous use | One active timer plus an independent ambient sound player. Design the shared system so this limit can change later. | Agreed, 7 October 2026: 3A. |
| Returning after closing the site | A running timer counts elapsed time from its saved deadline. Restore sound ready to play, requiring a deliberate Play action. Manually paused timers stay paused. | Agreed, 7 October 2026: 4A. |
| Phone presentation | Keep the header short: show remaining time and a compact button that opens the controls. Do not add a second row of always-visible actions. | Agreed, 7 October 2026: 5B. |
| First gadget | Exam clock, followed by Pomodoro and ambient sound. | Recommended order; editable. |
| Standalone puzzles | Use the shared active-gadget header while retaining the focused game layout. | Implemented locally, 7 October 2026. |

Keep agreed choices here. Ask about meaningful product choices at the relevant phase, including exam-rule formatting, Pomodoro transitions, and the first sound selection. Resolve ordinary spacing, component reuse, and implementation choices through the existing standards.

## How users find and use gadgets

- Give Gadgets a sidebar entry and a dedicated index at `/gadgets/`. Each gadget has a stable address, concise description, and full workspace.
- Start and configure tools from their gadget pages. The top bar provides active-session controls rather than a second setup or launch interface.
- Keep the index simple with the first few tools. Add categories or search when the collection makes them useful; avoid empty categories and speculative navigation.
- Starting a gadget makes its active state available in the top bar. Following an internal reading link or opening another setup page must not restart it.
- The workspace and compact controls use the same state. Changing either updates the other; visiting the workspace does not create a second timer or player.
- The header shows active tools rather than the entire catalogue. Future tools without an ongoing session can remain ordinary gadget pages.
- Keep settings and full instructions in the workspace or a supporting panel. The compact display contains only the current state and frequent actions.
- A completed or paused timer remains discoverable until deliberately cleared or replaced. Hiding a setup panel never stops a session. Distinguish Pause, Stop, and Reset; label replacement clearly if another timer is already active.

## Top-bar design

### Wide screens

Use the open area between the current location and Search in the supplied header reference. Keep navigation, the location, and search usable when titles are long or the sidebar is expanded.

A possible active arrangement is: **Focus 18:42 · Pause** and **Rain · Pause**. This is a content sketch, not an approved visual design.

- Give changing time a stable width and aligned numerals so the header does not shift every second.
- Make time and session identity easy to read. Selecting the identity opens the workspace or its details; the separate Pause action operates immediately.
- Timer controls and sound controls have distinct accessible labels. Pausing sound does not pause the timer. Pausing a timer does not silently change an independent sound session.
- Follow the site's warm paper surface, green accent, typography, icon source, border treatment, and shared control sizes. Use colour to support meaning, with text or icons conveying the state as well.
- Avoid decorative badges, persistent progress rings, and extra numbers unless they serve a particular gadget. The exam workspace now uses a restrained transition on changing digits, as requested during review; reduced-motion preferences turn this off.
- When nothing is active, return the space to the header's quiet resting appearance.

### Narrow screens and keyboard use

- Keep remaining time visible with a compact button that reveals timer and sound controls. Use one compact trigger for the active-session panel if that makes the layout clearer. When only sound is active, give the trigger a clear sound identity.
- Keep the phone header short, with no second row of always-visible gadget actions. Put Pause/Resume in the revealed panel and keep all active-session controls easy to reach.
- Do not introduce horizontal scrolling or cover the article. Account for the active header height when following anchors or focusing content.
- Use generous touch targets, visible keyboard focus, descriptive labels, and a predictable tab order. Do not announce every countdown second to screen readers; announce meaningful transitions.
- Keep gadget controls outside interaction when the mobile navigation drawer is open, consistently with the existing focus rules.
- Supporting panels follow the [widget requirements](widget-requirements.md#2-supporting-panels): start closed, close through their own trigger or Escape, preserve activity state, and remain open while users read or interact outside them. The [element standards](element-standards.md) govern reused dropdowns and future shared controls.

## Continuity between pages

Before this implementation, the ordinary site header stayed visible during scrolling, but internal links loaded a new document. A saved deadline can restore a timer after that load; storage alone cannot preserve an uninterrupted audio player.

**Agreed behaviour, now implemented:** Keep the site frame and gadget service alive while eligible internal navigation updates the reading content. Continue generating real, directly accessible Jekyll pages. Use browser history so Back and Forward retain their expected behaviour. The browser supports this content-update pattern through the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API).

Prove this foundation before relying on it for sound continuity. The prototype must:

- Preserve working ordinary links, direct visits, reloads, open-in-new-tab actions, external links, downloads, and navigation without JavaScript. Fall back to an ordinary page load if an enhancement fails.
- Handle Back/Forward, scroll restoration, article anchors, search queries, title and description updates, canonical addresses, breadcrumbs, active sidebar links, and focus after navigation.
- Initialize incoming page features and clean up outgoing page features. Revisit search, mathematical typesetting, problem disclosures, widget loading, observers, animations, workers, and page-specific styles. Existing modules initialize when first loaded; reusing a document requires explicit mounting and cleanup.
- Keep the persistent audio player and gadget state outside replaced content. Fetch and prepare new content before committing a transition; failed or competing requests must not leave a broken page.
- Cover articles, learning pages, research, search, the gadget workspace, and transitions to and from focused puzzle layouts. Puzzle pages currently use `_layouts/puzzle.html` rather than the ordinary top bar. Do not claim uninterrupted operation on an unsupported transition.
- Preserve current puzzle-saving behaviour. Continuity for gadgets does not imply that every outgoing article widget stays running or that an unsaved puzzle survives navigation.
- Keep asset loading bounded and compatible with production asset versioning and a non-empty Jekyll `baseurl`.

Review whether a small established navigation helper or a narrowly scoped native implementation best meets these requirements during the prototype. Avoid choosing a new application framework just to begin the roadmap. The navigation change is the largest shared dependency and needs its own review before gadget release.

### Implementation effort

The initial code review identifies seamless navigation as a substantial, one-time foundation task rather than a small header change. The cost is primarily development and verification; the proposed design can use the existing static hosting without a new server, account system, or paid service.

The difficult work is restarting incoming interactive content and releasing outgoing listeners, observers, animations, and workers while preserving the gadget service. Several existing game controllers already expose initialization and cleanup functions, so reuse those and their existing tests. Other activities still initialize automatically when their scripts load and will need explicit lifecycle handling. Search, mathematical typesetting, browser history, and the separate puzzle layout also need integration checks.

Use Phase 2 to establish a firmer effort estimate from a working navigation prototype and an inventory of page controllers. Verify ordinary pages, a mathematics-heavy article, and a focused puzzle early. Reuse the current mathematical models, renderers, content, and hosting; concentrate changes in navigation, page lifecycle, and the shared gadget service. Ongoing maintenance includes registering new page features with that lifecycle.

## Shared gadget foundation

Separate ongoing gadget sessions from page-bound educational widgets, while reusing the site's controls, icons, styles, and suitable storage helpers.

| Shared piece | Responsibility |
| --- | --- |
| Gadget registry | Stable ID, name, description, route, icon, category when useful, required assets, and supported capabilities. |
| Session service | Own active state and meaningful transitions independently of the current page. Notify the compact display and workspace from the same state. |
| Compact display | Render only the active gadgets' useful information and frequent actions. |
| Workspace | Full setup, supporting content, and occasional controls. |
| Timer service | Deadline calculation, pausing/resuming, completion, and phase transitions where relevant. |
| Audio service | Explicit playback, source selection, volume, looping, and interruption feedback. Usable independently of a timer. |
| Screen-awake service | Combine active requests and release the screen lock when none remain. Report actual availability and state. |
| Storage | Versioned, validated session data and per-gadget preferences, scoped to this device. Graceful operation if storage is unavailable. |

Use one small shared controller with explicit start, pause, resume, stop, restore, and cleanup behaviour where applicable. A future gadget declares only the capabilities it needs; it does not inherit irrelevant timer or sound controls. Keep one source for each gadget's model, workspace, and compact rendering.

Proposed locations are `_data/gadgets.yml`, `gadgets/`, `_includes/gadgets/`, and `assets/js/gadgets/`, with shared services in `assets/js/lib/` and styles under `assets/css/`. Final names can follow the implementation. Keep heavy scripts and audio unloaded until requested; an inactive header must not start a timer loop or audio processing.

### Lightweight operation

Keeping the site lightweight is an explicit requirement. Compare the navigation prototype with the current site before integrating it. Inspect first-load transfers, responsiveness while reading, and memory after repeated navigation. Keep audio assets unloaded until selected, bound page caching, and clean up outgoing activity listeners, renderers, timers, and workers. Inactive gadgets must not run an update loop or audio processing. Review ongoing playback separately from an ordinary visit without gadgets.

## Time, sound, and keeping awake

### Timers

- Calculate remaining time from a deadline, not the number of callbacks received. Store explicit states such as ready, running, paused, and complete.
- Pausing freezes the remaining duration; resuming establishes a new deadline. Validate durations and end times, and make changes to a running session deliberate.
- Reconcile state on return from a hidden tab, refresh, or device sleep according to the selected restoration policy. Handle an expired deadline once without duplicate completion alerts.
- For Pomodoro, define what happens when several phases elapse while the page is unavailable. A manual next-phase default is a proposal until that gadget's behaviour is reviewed.
- Show correct elapsed or remaining time after returning; do not promise that a suspended browser will deliver an alarm at an exact moment.
- Define behaviour with two open site tabs. Proposed: one tab owns playback and completion sounds; another can show saved state and offer deliberate takeover. Do not start duplicate audio automatically.

### Sound

- Begin playback only through a deliberate action. Restore a selected source and volume after a later visit, with playback paused. Handle blocked playback with a clear Play action, consistent with [browser autoplay rules](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
- Keep sound independent so it can accompany reading, Pomodoro, or no timer. Exam presentation begins silent.
- Start with a small, useful selection. Decide on the first sources during the sound phase; procedural noise and appropriately licensed, self-hosted recordings are candidates.
- Load a recording only when selected. Verify smooth loops, restrained volume, useful fade behaviour, and response to a missing asset or device interruption.
- Provide an optional completion chime separately from ambient playback. Sound choices and automatic behaviour should not surprise users.

### Screen awake

Offer a clearly labelled **Keep screen awake** option where useful, with feedback that reflects whether the request is actually active. Browser screen wake locks require a secure context and a visible document; they can be denied or released because of system settings, low power, or lost visibility. Reacquire when the page becomes visible if the user still wants it, and release when the relevant session ends. [Screen Wake Lock documentation](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)

Keep the timer usable if the feature is unavailable. Do not call it a guarantee that the whole computer stays awake or that background alarms run. Multiple gadgets requesting screen awake must not release each other's active request.

## Development sequence

| Phase | Deliverable | Exit criteria |
| --- | --- | --- |
| 0. Establish the roadmap | This document, linked from the maintenance documentation, with user decisions recorded as they arrive. | Scope, proposals, and unresolved choices are distinguishable. Five initial choices recorded on 7 October 2026. |
| 1. Design the shared experience | Concrete desktop and phone layouts for the catalogue, active controls, and full workspace; settle focused puzzle presentation. | Desktop controls fit the real header; phones show remaining time and a compact button to reveal controls, without obscuring reading or navigation. |
| 2. Prove continuity | Persistent gadget service and internal-navigation prototype, using temporary timer/audio fixtures for verification. Establish page mounting and cleanup. | Sound survives supported page changes; history, search, maths, widgets, puzzles, focus, and fallback navigation remain correct. |
| 3. Establish the section and exam clock | Gadget registry, catalogue, shared timer, compact controls, and exam workspace with optional formatted rules and fullscreen presentation. | One configured session behaves consistently in full and compact views; rules remain readable at projection size; restoration and screen-awake status are honest. |
| 4. Add Pomodoro and ambient sound | Focus/break setup, phase behaviour, independent audio controls, selected sound assets, and optional chime. | Timer and sound can operate together and separately; navigation, pause/resume, looping, and deliberate playback work. |
| 5. Grow deliberately | Add gadgets from actual needs; document each one's purpose, state, compact controls if useful, and assets. Expand catalogue organization when needed. | A new gadget can reuse the foundation without adding gadget-specific conditions throughout the site header. |

For the exam clock, review duration versus finish-time entry, which clocks are visible, the exact formatting controls for rules, and saved presets before finalizing its workspace. Use a small safe formatting set such as headings, bold, and lists; arbitrary pasted HTML is not an initial feature.

For Pomodoro, review focus and break defaults, long-break cadence, automatic versus manual transitions, sound behaviour during breaks, and the initial sound selection. Keep ordinary settings away from the active header.

Possible later candidates include a stopwatch, interval timer, or a small reading aid. These are backlog examples, not commitments. Accounts, cross-device synchronization, a large sound library, and offline installation are outside the initial release.

## First design prototype, 7 October 2026

The conversation preview demonstrates the shared visual design and interactions. It uses the site's existing logo, warm paper palette, green accent, serif page headings, sidebar structure, and minimal header treatment. Desktop layouts show immediate timer and sound controls; narrow layouts show the time and one control-panel button. Gadgets start from their full pages.

Included interactions are a deadline-based timer, deliberate Pomodoro focus/break transitions, an exam countdown with safely formatted headings/bold/bullets, an in-preview presentation view, independent generated brown/soft noise with volume and pause/resume, and screen-awake availability feedback. The same session remains alive across sample reading, learning, research, search, and focused-puzzle views. These are local sample views; they do not yet migrate the site's actual page loading. Generated noise is a prototype sound choice, not the final ambient library.

Checks exercise the actual prototype script in an offline DOM harness: deadline accuracy, pause/resume, expiry, phase changes, continuity across sample views, independent timer/audio actions, paused-sound resume, one audio context with no duplicate active source, safe rules, supporting-panel defaults, input validation, elapsed-time restoration, host state-update echoes, and the small sample puzzle. Script syntax and fragment/resource checks also pass. Browser-based visual inspection could not be completed in this environment; this preview is ready for user review, and the responsive layout still needs inspection in the actual site during integration.

This completes an initial Phase 1 design preview. Phase 2's real navigation, mathematical typesetting, lifecycle migration, Back/Forward, and production performance checks remain open. The prototype is conversation content and is not included in the site's published assets.

## Initial website implementation, 7 October 2026

Phases 1–4 now have an initial local implementation. `/gadgets/` lists three workspaces: `/gadgets/exam/`, `/gadgets/pomodoro/`, and `/gadgets/sound/`. The sidebar includes Gadgets. Each workspace and the persistent header use one session service. Phone headers show time plus a controls trigger; the supporting panel remains reachable beneath the sticky header while reading a long page.

Exam setup accepts a duration in minutes and optional headings, bold text, and lists. Pasted HTML is displayed as text. The large display includes the current clock, countdown, rules, and presentation controls. Native fullscreen is used when available, with a browser presentation fallback. Keyboard focus remains in the presentation and returns on exit. Pomodoro defaults to 25 minutes of focus and a 5-minute break, with deliberate next-phase starts and an explicit confirmation before replacing a running or paused timer. Long breaks and automatic transitions remain future choices.

Brown noise and soft noise are the initial procedural sounds. Volume, source selection, pause/resume, and stopping are independent of the timer. Audio uses one context and looping source, begins through a user action, continues through internal navigation, and restores paused after reload. Another tab can take over deliberately; a live-owner signal prevents duplicate automatic playback. A completion chime is optional and defaults off. The tab that starts or resumes the timer owns its completion chime.

Screen-awake requests apply to running timers with the option enabled. The interface reports the real browser result and releases requests on pause, finish, stop, or loss of visibility. Unsupported and denied requests leave the timer usable. Timers restore by deadline, with paused state preserved, and expired Pomodoro sessions wait at their completed phase.

The site remains static Jekyll with plain JavaScript. The shared navigation replaces page content and manages page assets, history, focus, search, maths, and activity cleanup. All registered activity controllers now expose mounting and disposal; optional graphs also release a renderer that finishes loading after navigation. Focused puzzle pages use the same persistent shell. Direct page visits and ordinary links remain usable without the enhancement.

Validation includes the strict Jekyll build, asset versioning, links/search/feed/sitemap checks, a build under `/gadget-review`, the existing authoring and activity suites, and targeted timer/audio/wake-lock/navigation/lifecycle tests. Browser checks cover desktop and narrow-phone layouts, running timer continuity, sound through search and puzzle navigation, pause/resume and replacement, expiry and manual phase advance, reload restoration, multiple-tab playback takeover, mathematical lesson typesetting, repeated widget mounting on Back/Forward, and the exam presentation. Performance inspection found about 5 KiB of extra compressed shell assets on ordinary pages; the gadget runtime is lazy and about 10 KiB compressed. These are file-size estimates, not a measured production transfer benchmark.

Later work can add licensed recordings, long-break preferences, more timer input styles, and further gadgets using the shared registry and service. Cross-device accounts, automatic background alarm guarantees, and a large media library remain outside this initial release.

## Review and maintenance

The local design review now uses a general collection icon for Gadgets and a responsive catalogue of simple icon cards. Each workspace keeps its frequent actions visible and uses the same shared Settings/Info panels and switches as puzzles. Panels start closed, only one opens at a time, and Escape restores focus to its trigger. Timer validation exposes the field that needs correcting.

The exam review moves duration into the main view, with a minutes field and bounded five-minute adjustments. Stop the active exam to edit its duration. Bold tabular numerals use brief transitions only when a digit changes; hours disappear below one hour. A configurable reminder defaults to the final five minutes, with a warm amber background and a short text cue. Completion uses a soft red background. The reminder can be disabled and respects reduced motion. Presentation has only Exit; timer actions stay on the ordinary workspace. Exam timers are omitted from the top bar by default, with a saved Settings switch to enable them without interrupting the timer. Paused and completed states remain purposeful; routine coaching text is removed from the exam view. Keivan selected Quiet on 7 October 2026: a spacious, softly framed display with centered bold numerals. The card now uses the shared, simple clock-face icon.

The next review replaces the catalogue's generic outline icons with a coordinated set of small dial, tomato-timer, and headphone illustrations. The section description is now general productivity copy, and the top-bar coaching footer is removed. Reminder minutes use the same accessible −/+ input as duration, with one-minute adjustments. Rules contain brief instructions in the empty field and support inline and multiline displayed LaTeX equations. The site's shared MathJax loader remains lazy, serializes rendering and edits, clears outgoing equations, and applies the safe extension to user-entered math. Plain rules do not load it. Three original completion sounds—Soft chime, Clear two-tone, and Low bell—can be selected and previewed in Settings without changing the timer or ambient playback. Soft chime is the sound default; the chime switch remains off by default.

Keivan asked for more pronounced sounds after listening to the first samples. The tones now have greater presence and a short sustained attack; Clear two-tone uses a brighter tone and plays its two-note signal twice, then stops. The same definitions drive Preview and the completion signal.

The Pomodoro review moves focus and break lengths above the timer, using the shared bounded −/+ controls. The introductory sentence and idle/running coaching are removed. A saved Show in top bar switch defaults to on, including for older sessions; switching it off leaves the timer and independent sound running and applies to later phases. Length edits apply to a new session, with a short hint only when they differ from the active session. The selected Dial design places the countdown inside a remaining-time arc, with phase and round labels. The break uses a warm accent. The shared timer supplies updates; no additional frame loop runs, normal progress moves smoothly, and pause, reset, suspension, and phase changes settle immediately. Reduced motion disables the arc transition.

Five-minute duration buttons now follow the same stops in either direction: 1, 5, 10, 15, and so on. Exact typed values remain available; buttons move to the next five-minute mark from an off-grid value. The one-minute break and reminder controls retain one-minute adjustments. Accessible button labels no longer promise an exact five-minute change at the boundary.

- Inspect the header with no active gadget, a running or paused timer, active sound, and both together. Include a long page title, expanded/collapsed sidebar, mobile navigation, narrow phones, and enlarged text. Verify that the phone panel offers all necessary controls without an always-visible second row.
- Test a real reading path through an article, learning page, research, search result, gadget workspace, and puzzle. Include Back/Forward, anchors, reload, and a failed navigation request.
- Verify deadline restoration, pause/resume, expired sessions, denied storage, hidden-page return, screen-awake release, and more than one tab. Add targeted timer/state tests during implementation because these transitions determine correctness.
- Check keyboard and touch operation, accessible names, meaningful announcements, absence of horizontal overflow, and unobstructed reading. Inspect the fullscreen exam display separately.
- Verify that unused gadget/audio assets remain unloaded and outgoing page activity is cleaned up. Repeated navigation must not multiply handlers, timers, or workers.
- Run the existing site build and checks for shared-template or navigation changes, along with focused behaviour tests. A conversation-only design prototype does not require rebuilding unrelated published content.
- Add a short design sheet for each implemented gadget. Record changed decisions and completed phases here, and keep registry entries, URLs, asset locations, and extension guidance in the maintenance guide.

Publish reviewed changes through the existing GitHub Pages workflow. Review later gadgets and significant design changes before their next release.
