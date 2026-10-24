# Laser Pointer demonstration and artwork

The 30-second walkthrough is a concise product demonstration on a minimal
workshop page with an interactive Moon-and-tides experiment. The page and
browser remain dark throughout, following the supplied slate-coloured browser
reference. Space pauses the ink so the cursor can grab the Moon and drag it
through a quarter orbit, from 25° to 115°. Both exaggerated ocean bulges rotate
with the Moon while a fixed coast's reading changes from high to low tide.
Before the drag, a tapered blue arrow traces the upcoming path outside the
orbit. An underline emphasizes the coast's reading. Drawing resumes with a
short curved arrow pointing to the bulge in its new position.
The Moon is a keyboard-accessible SVG handle with real pointer capture. The
replay dispatches pointer events to that same handle, rather than changing the
scene behind a pretend drag. Phone framing keeps the Moon, Earth, and reading together.
One large Space keycap stays centred below the browser frame from 12 to 23.9
seconds. It remains in place through both presses, with a two-second lead before
the first press and a 1.1-second pressed state for each. There are no changing
instruction sentences or running captions. The scene stays unobscured, and a
reserved cue row prevents layout shifts. The fades share the replay clock.
The Moon drag takes 1.8 seconds, with a pause at either end. The fixed night
palette has a restrained lunar glow, stars, and fine orbital lines. There is
no light-to-dark transition. Dragging, pausing, and seeking update the same
tidal geometry deterministically.
A short brand dissolve closes the loop and matches its opening frame.
The external replay cue replaces the duplicate native pause badge; hands-on mode
retains that native badge. Browser chrome has just window dots and the extension
icon, with a quiet address-field silhouette, no readable page title, and no
extra status button. The permission popup and real settings use a dark palette.
The ending shows only a click on the same toolbar icon at 27 seconds, disabling
the engine and clearing its ink. A longer click pulse makes the action visible.
The replay does not demonstrate Esc or include an extra reactivation sequence.

The simplified equilibrium-tide model follows [NOAA's explanation of the two
opposite tidal bulges](https://oceanservice.noaa.gov/education/tutorial_tides/tides03_gravity.html).
It illustrates their alignment with the Moon, rather than forecasting local
coastal tides. The figure notes that the tides are exaggerated. Sun effects,
Earth rotation, ocean basins, and phase-dependent spring/neap tides are outside
this short product demonstration.

`assets/js/laser-runtime.js` is an unchanged copy of
`extension/pointer.js` from the Laser Pointer extension checkout. Its SHA-256 is
`d2398cf554698e1c90263980bf6b9c08195b23acfd7cd27b5d257a2fd4daf51f`.
The real renderer supplies the tapered ink, pointer, settings, Space handoff,
and clearing behavior. The toolbar and first-use popup are presentation UI;
permission prompts vary by browser. This is a replay, not a screen recording.

`assets/js/laser-demo-bridge.mjs` provides an in-memory extension API inside the
isolated iframe. It operates real product controls and sends real keyboard
commands. Its clock is scoped to the renderer, so playback can pause and seek
without changing browser clocks. Demo settings never read or change an installed
extension's preferences. Live shadow roots are selected after each reactivation.

`assets/js/lib/laser-demo-motion.mjs` shares cue timing, keypress states, toolbar
states, and phone framing with the player. Hand-placed anchors and varied speed
keep gestures natural. `assets/js/laser-pointer.js` manages playback, chapters,
the external key cues, and a continuous cursor handoff into browser chrome.
Reduced motion starts still; hidden or offscreen playback stops. Navigation
unloads the entire iframe. Playback and cue regressions are covered by
`tests/laser-pointer.test.mjs`.

The timing follows Apple's 30-second app-preview limit. This local web showcase
is not a device-captured App Store submission video. Capture the installed
extension on the target device for the final store asset, following
[Apple's preview guidance](https://developer.apple.com/app-store/app-previews/).

To test an installed extension, open `/laser-pointer/demo/` without a query;
the embedded engine does not run there. Standalone stills use `?mode=replay`
or `?mode=replay&scene=settings`. The native Safari toolbar, settings, pointing,
and Space handoff were also checked. Ink is verified in-browser with the copied
renderer. The settings illustration is a crop of its actual browser UI.

The page follows a demo-led structure: the walkthrough, three supporting
features, a visible setup welcome, one browser/download area, and a short help
accordion. `#setup` is also the destination of the Mac app's Help command. It
lands on the welcome panel, with a native browser selector changing all three
steps and switching the shortcut guide for iPad. Instructions are visible rather
than hidden inside an FAQ. Pricing and compatibility stay in the download area.

The player uses one compact strip: pause/resume, restart, the current step,
five chapter segments, and a quiet “Try the ink” action. The chapter track
replaces the duplicate previous/next controls. On phones it wraps into two
ordered rows. The current step's longer instructions appear only in hands-on
mode. Playback timing and the animation itself are unchanged.

The supporting artwork consists of two native SVG plates, ink controls and
Esc before/after, plus a native ink underline in the Apple Pencil text hero.
Edit the saved SVG files in `_includes/applications/` directly. The completed
artwork generator and retired illustration studies remain in Git history.

## Apple Pencil text hero

The Apple Pencil feature is a text-only hero at `#laser-ipad-title`. Its live
HTML heading reads “Apple Pencil for the ink. Fingers for the page.”, with a
single tapered blue underline beneath “ink”. The description and quiet hover
note remain beneath the heading. The type scales from 56px on desktop to a
smaller responsive size on phones, with left-aligned copy and generous space.

`_includes/applications/laser-pencil-underline.svg` is a decorative native SVG.
Its filled outline follows the product-style speed-sensitive width and tapered
endpoints. The underline stays attached to the word as text
wraps and scales. It is hidden from assistive technology; the heading remains
selectable, accessible text.

The former hand/Pencil/iPad illustration, reference photographs, and generation
prompts remain recoverable from Git history.

Browser PNGs were exported at 128 × 128 from vendor icons in the installed
Safari, Chrome, Edge and Firefox apps with `sips`. Keep their colours and
proportions intact; they remain their owners' trademarks.
