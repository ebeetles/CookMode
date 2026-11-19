# Cook Mode code review

Reviewed against `SPEC.md` on 2026-11-19. Static review only: I read every file under `src/`, plus
`package.json`, `app.json`, and `tsconfig.json`. I ran `npx tsc --noEmit` and `npx expo lint`, and both
pass with no errors. I also ran the timer-parsing regex against edge cases (`(0 min)`, `(181 min)`,
`(5 min)`, a trailing period, uppercase units, and a parenthetical in the middle of the line), and every
case behaves as §5.2 describes. Nothing was run on a phone, so the acceptance criteria below are checked
by reading the code. Device-only behavior (nudge sensitivity, slide smoothness, keep-awake) still needs
a pass in Expo Go.

Legend: **[PASS]** meets the spec / no issue · **[FAIL]** does not meet the spec · **[WARN]** works but
is risky, fragile, or worth improving.

No [FAIL] findings. All 18 acceptance criteria are implemented. The warnings are mostly edge cases,
small departures from the spec's layout details, and cleanup.

---

## A. Acceptance criteria (SPEC §9)

1. **[PASS] AC1 First launch.** On first launch, `storage.ts:60-65` writes the seeds and then sets
   `seeded`. `seed.ts:61` sets `createdAt: now - index`, which puts "Egg fried rice" above "Jammy soy eggs"
   in the newest-first sort (`recipes-store.tsx:111`). The steps go through the same `parseStep` used by
   Add Recipe, so the meta lines (`recipes.ts:55-59`) come out as "9 steps · 6 min of timers" and
   "7 steps · 12 min of timers". Each title sits on a tape strip sized to the text (`recipe-card.tsx:30-34`,
   `85-91`, `alignSelf: 'flex-start'`).

2. **[PASS] AC2 Expand.** A single `expandedId` (`index.tsx:25`, `66`) guarantees only one card is
   expanded at a time. The expanded card shows ingredients and "Start cooking" (`recipe-card.tsx:43-60`).

3. **[PASS] AC3 Delete.** Delete shows a native `Alert` titled `Delete "<title>"?` with a destructive
   "Delete" button (`index.tsx:30-35`). `deleteRecipe` removes the recipe and its progress and saves both
   (`recipes-store.tsx:76-85`). After a force-quit the recipe does not come back, because
   `storage.ts:53-56` returns the stored list and only seeds when both keys are missing (`:60`).

4. **[PASS] AC4 Empty state.** With zero recipes, the screen shows "Add your first recipe" and an
   "Add recipe" button. The pinned button is only rendered in the non-empty branch (`index.tsx:43-83`).

5. **[PASS] AC5 Validation, both fields.** `add.tsx:30-37` sets both errors and returns without saving.
   The errors render at `add.tsx:73` and `:109` in `colors.alarm` (`:159-162`).

6. **[PASS] AC6 Validation, whitespace.** The title is trimmed (`add.tsx:31`), and `splitLines` drops
   blank lines (`recipes.ts:19-24`). Typing in Title clears its error right away (`add.tsx:62-65`).

7. **[PASS] AC7 Successful save.** `Simmer (1 min)` parses to `{ text: 'Simmer', timerMinutes: 1 }`.
   `addRecipe` stamps `createdAt: Date.now()` (`recipes-store.tsx:71`), which sorts the new recipe to the
   top, and `goToRecipes()` returns to the list. The meta line reads "2 steps · 1 min of timers".

8. **[PASS] AC8 Persistence.** `commitRecipes` writes to `cookmode:v1:recipes` on every change
   (`recipes-store.tsx:57-61`).

9. **[PASS] AC9 Start and first step.** Cook Mode shows "1 of 2" (`cook/[id].tsx:150`) and fills the
   first segment (`:176`). Step text is at `:198`, and on step 1 an empty placeholder takes the place of
   Back (`:209-213`).

10. **[PASS] AC10 Forward and back.** `move()` sets `direction`, and the layout effect slides from
    `±width` to 0 over 200 ms (`cook/[id].tsx:85-108`). See finding 31 for a possible one-frame flash to
    check on the device.

11. **[PASS] AC11 Finish.** Advancing from the last step sets `finished` (`cook/[id].tsx:103`). The
    progress effect then clears saved progress (`:68-71`), and the finish view shows the text and
    "Back to recipes" (`:179-183`).

12. **[PASS] AC12 Read aloud.** The effect at `cook/[id].tsx:74-80` speaks each step as it appears and
    calls `Speech.stop()` when read aloud is turned off. The setting is saved through `updateSettings` →
    `saveSettings`. A long press (`delayLongPress={500}`, `:189-190`) re-speaks the step even when read
    aloud is off (`:127-130`).

13. **[PASS] AC13 Timer start and finish.** The chip starts on mount in Flame (`timer-chip.tsx:20`,
    `:75`). At 0:00 it plays a heavy haptic and speaks "Timer done." no matter what the read-aloud
    setting is (`:31-35`). It then pulses 1 → 0.5 → 1 over 1000 ms (`:48-62`), and a tap moves it to
    `dismissed` (`:70-73`).

14. **[PASS] AC14 Tabular digits.** Each character renders in a fixed-width box (`timer-chip.tsx:83-100`),
    so the colon cannot move. The box widths are guessed constants, though: see finding 47.

15. **[PASS] AC15 Skipping a running timer.** The chip is keyed by `${stepIndex}-${visit}`
    (`cook/[id].tsx:202`). Leaving the step unmounts it, which clears the interval (`timer-chip.tsx:42-45`),
    so no alarm fires. Coming back mounts a new chip that starts at full duration.

16. **[PASS] AC16 Resume.** "Resume step N" passes the clamped saved index as the `step` param
    (`recipe-card.tsx:63`, `index.tsx:13-15`). "Start over" sets progress to 0 and then opens step 0
    (`index.tsx:68-71`). Cook Mode reads the param at `cook/[id].tsx:42-43`.

17. **[PASS] AC17 Keep-awake (code check).** `useKeepAwake()` is called only in `src/app/cook/[id].tsx:33`
    (confirmed with grep). It runs before the early returns, so it holds on every render path.

18. **[PASS] AC18 Nudge (code check).** The flat check uses a 500 ms average plus 1000 ms of continuous
    flatness, the bump threshold is 0.3 g, and the cooldown is 1500 ms (`use-nudge.ts:42-64`). Touch
    suppression comes from root-view `onTouchStart`/`onTouchEnd`/`onTouchCancel` (`cook/[id].tsx:143-147`).
    The listener only subscribes while nudge is on and the finish view is not shown (`:132`). The hint
    switches to "Tap for next" when nudge is off (`:214`). The thresholds need tuning on the actual phone.

## B. Other spec requirements

19. **[PASS] Routes and navigation (§3).** There are exactly three routes plus `_layout.tsx`, and
    `headerShown: false` is set (`_layout.tsx:39-42`). Template screens are gone. Cancel, the X button,
    and "Back to recipes" all go through `goToRecipes()` (`navigation.ts:4-7`).

20. **[PASS] Font loading and fallback (§4, §6).** The app renders once the font loads, fails, or 3 s
    pass (`_layout.tsx:15-32`). Until Barlow is available, text falls back to the system font in bold
    (`display-font.tsx:15-18`).

21. **[PASS] Storage keys and bad-data handling (§6).** All keys use the `cookmode:v1:` prefix
    (`storage.ts:6-11`). Missing and unreadable values, a wrong shape, the never-reseed rule, filtering
    progress for deleted recipes, default settings, and `console.warn` on errors all match §6
    (`storage.ts:24-99`). Out-of-range step indexes are clamped where they are used (`recipes.ts:82-84`).

22. **[PASS] Nudge constants in one file (§5.3).** All eight thresholds live in `src/constants/nudge.ts`.

23. **[PASS] Timer accuracy (§5.3).** Remaining time comes from a stored `endAt` (`timer-chip.tsx:20`)
    and updates every 250 ms (`theme.ts:58`). An `AppState` listener catches up when the app returns to
    the foreground, so a timer that hit 0:00 in the background fires its alert on return (`:39-41`).

24. **[PASS] Color palette (§4).** Every hex value is in `constants/theme.ts`. A grep found no hex
    literals anywhere else in `src/`.

25. **[WARN] Steps error placement (§5.2).** The spec puts errors "4 below the field". The Title error
    follows that, but the Steps error renders below the helper text instead (`add.tsx:108-109`), about
    20 pt lower than specified. Either move it above the helper or confirm this order is intended.

26. **[WARN] Cook Mode top-bar edge padding (§4).** `topBar` uses `paddingHorizontal: space.s` (8)
    (`cook/[id].tsx:246`), but §4 says screen edge padding is 16. The glyphs sit visually further in
    because they are centered in 64 pt boxes, so this may be intentional. Worth checking against the
    design.

27. **[WARN] Dead tap zone on collapsed cards (§5.1).** Only the header `Pressable` handles taps
    (`recipe-card.tsx:25-29`). The card's 16 pt padding (`:77-81`) sits outside it, so taps near the card
    edge do nothing, even though the spec says "Tapping a card expands it".

28. **[WARN] Template leftovers (§3).** The `reset-project` script points to `./scripts/reset-project.js`,
    which no longer exists (`package.json:45`). Several template dependencies are never imported in `src/`:
    `@expo/ui` (`:7`), `expo-device` (`:12`), `expo-glass-effect` (`:14`), `expo-image` (`:16`),
    `expo-symbols` (`:24`), `expo-web-browser` (`:26`), `react-native-gesture-handler` (`:30`),
    `react-native-reanimated` (`:31`), and `react-native-worklets` (`:35`). Reanimated is an animation
    library, which §3 excludes even though nothing here uses it. Run `npx expo-doctor` before removing
    any of them. Keep `expo-linking`, `expo-constants`, `react-native-screens`, and
    `react-native-safe-area-context`, which Expo Router needs. Also, `BarlowCondensed_500Medium` is loaded
    (`_layout.tsx:15`, `theme.ts:48`) but no screen uses it.

## C. Bugs and logic errors

29. **[WARN] Double taps can duplicate a recipe or push a screen twice.** Two fast taps on "Save recipe"
    (`add.tsx:30-40`) can both pass validation and call `addRecipe` before the screen pops, which saves
    the recipe twice. `openCookMode` and `openAddRecipe` (`index.tsx:13-19`) have the same problem and
    can push two copies of a screen. A simple `submitting` ref, or ignoring presses while navigation is
    in progress, would prevent this.

30. **[WARN] Step-change guard is set late.** `move()` checks `animating.current`
    (`cook/[id].tsx:101`), but that flag only turns on in the layout effect after React commits
    (`:87`). If two inputs arrive before the commit (for example, a tap and a nudge in the same frame),
    both get through. `setStepIndex(stepIndex + dir)` uses the stale `stepIndex`, so the step still only
    moves once. But `visit` increments twice and the haptic plays twice. Setting `animating.current = true`
    inside `move()` would close the gap.

31. **[WARN] Possible one-frame flash at slide start.** `slide.setValue(direction * width)` runs in
    `useLayoutEffect` on a value driven natively (`cook/[id].tsx:88-93`). With the native driver,
    `setValue` reaches the UI thread asynchronously, so the new step may paint for one frame at
    `translateX: 0` before jumping off-screen. Check this on the device with a slow-motion recording.

32. **[WARN] A nudge during the slide still uses up the cooldown.** `use-nudge.ts:51-53` records
    `lastNudgeAt` before calling `onNudge`, but `nudge()` throws the event away while animating
    (`cook/[id].tsx:119`). That bump does nothing, yet it blocks real nudges for the next 1.5 s. Rare,
    but it can feel like a missed nudge.

33. **[WARN] `seeded` is set even if writing the seeds fails.** `write()` catches its own errors
    (`storage.ts:41-47`), so `readRecipes` sets `seeded` (`:63`) even when the recipes write at `:62`
    failed. On the next launch that device starts with an empty list and never reseeds.

34. **[WARN] One bad recipe empties the whole list.** `recipes.value.every(isRecipe)` (`storage.ts:53`)
    treats the whole array as unreadable if any single entry is malformed, and the next save then
    overwrites everything. This matches §6 ("wrong shape → empty list"), but dropping only the bad
    entries would keep the user's data. Separately, `isStep` (`recipes.ts:86-93`) accepts `NaN`,
    negative, or `Infinity` values for `timerMinutes` from corrupted storage, and `TimerChip` would then
    show a nonsense time.

## D. Error handling

35. **[PASS] Storage and feedback errors.** Every AsyncStorage read and write is wrapped and logged with
    `console.warn` (`storage.ts:24-47`). Haptics and `Speech.stop()` promise rejections are caught
    (`feedback.ts:4-24`). Loading failures still set `loaded` (`recipes-store.tsx:48-51`), so the app
    never hangs on a blank screen.

36. **[WARN] No accelerometer availability check.** `useNudge` subscribes without calling
    `Accelerometer.isAvailableAsync()` and has no error path (`use-nudge.ts:41-42`). On a device without
    a working sensor, nudge appears on and the hint still says "Nudge or tap for next", but nothing ever
    fires.

## E. Code quality

37. **[WARN] Duplicated progress-removal logic.** The `{ [id]: _removed, ...rest }` pattern appears in
    both `deleteRecipe` (`recipes-store.tsx:79-82`) and `clearProgress` (`:95-102`). `deleteRecipe` could
    just call `clearProgress(id)`.

38. **[WARN] Repeated input boilerplate.** All three `TextInput`s in `add.tsx:57-110` repeat the same
    label, `cursorColor`/`selectionColor`, style, and helper/error structure. A small `TextField`
    component would remove the repetition and keep error placement consistent (see finding 25).

39. **[WARN] Magic numbers outside the theme.** Digit and colon widths are hardcoded in
    `timer-chip.tsx:86-87`. Other loose values: `lineHeight: 24` (`recipe-card.tsx:94`),
    `INPUT_LINE_HEIGHT = 22` (`add.tsx:12`), and icon sizes 36 and 32 (`cook/[id].tsx:157`,
    `icon-toggle.tsx:26`). Moving them into `theme.ts` would make tuning easier.

40. **[WARN] `extraData` gets a new object on every render.** `extraData={{ expandedId, progress }}`
    (`index.tsx:53`) is a fresh object each time, so FlatList always re-renders every row and the prop
    does nothing useful. `renderItem` is also an inline closure. This is harmless with a handful of
    recipes. Either pass a stable value, or use a `ScrollView` with `map`, which is simpler at this size.

41. **[WARN] One context for all store data.** `RecipesContext` (`recipes-store.tsx:113-126`) holds
    recipes, progress, and settings together. Every step change writes progress, which re-renders every
    consumer, including the Recipe List that stays mounted under Cook Mode in the stack. Fine for now,
    but splitting settings and progress into their own contexts would scale better.

42. **[WARN] Misleading "next" return key.** The Title field sets `returnKeyType="next"` (`add.tsx:67`)
    but has no `onSubmitEditing` to move focus to Ingredients, so the "Next" key just closes the
    keyboard. Either wire up focus with a ref or use the default return key.

## F. React Native and Expo best practices

43. **[PASS] Hook order and React Compiler compatibility.** Every hook runs before any early return
    (`index.tsx:22-28`, `cook/[id].tsx:33-37`), and refs are only changed in handlers and effects.
    `tsc` and `expo lint` are clean.

44. **[PASS] Cleanup on unmount.** Speech stops (`cook/[id].tsx:82`), the accelerometer subscription is
    removed (`use-nudge.ts:66`), the timer interval and `AppState` listener are cleared
    (`timer-chip.tsx:42-45`), the pulse loop stops (`:61`), and keep-awake is released automatically.

45. **[PASS] Safe areas and the keyboard.** Every screen applies its insets. Add Recipe uses
    `automaticallyAdjustKeyboardInsets` on iOS and `KeyboardAvoidingView` with `height` on Android
    (`add.tsx:43-54`), with `keyboardShouldPersistTaps="handled"` so "Save recipe" works while the
    keyboard is open.

46. **[WARN] Toggles announce their state twice.** `IconToggle` puts "on"/"off" in the label (required
    by §5.3) and also sets `accessibilityRole="switch"` with `accessibilityState.checked`
    (`icon-toggle.tsx:21-23`). VoiceOver reads something like "Read aloud, on, switch, on". To keep the
    spec's label, consider `accessibilityRole="button"` without `checked`.

47. **[WARN] Large text sizes break the timer chip.** No `Text` sets `maxFontSizeMultiplier` (a grep
    found none). With iOS Dynamic Type at accessibility sizes, the 36 pt timer digits outgrow their
    fixed 20/23 pt boxes (`timer-chip.tsx:86-96`) and will clip or overlap. The centered "4 of 7"
    counter can also run into the top-bar buttons. Capping the multiplier on the timer characters, or
    measuring the widest digit at runtime, would fix the chip.
