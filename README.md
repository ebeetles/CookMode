# Cook Mode

Cook Mode is a cooking instruction app that tracks your recipes and instructs you step by step during the cooking process, including inline timers for tasks that need it, as well as nudge your phone to go to the next step without having to touch your phone screen for if your hands are occupied or dirty during the cooking process. It also keeps your phone awake so you don't have to keep having it fall asleep and you having to unlock it over and over again. This app will be useful for people learning to cook.

## Screens

The recipe list screen lists all your recipes, and users can choose a recipe to start cooking with or add new recipes

The add recipe screen allows users to add recipes, including the title, the ingredients required (one ingredient for each line) as well as the steps required to cook this recipe.

The cook mode screen is the one that helps the user cook. One step at a time is displayed on the screen and also displays timers for steps that require a timer. The user can choose to nudge the phone if their hands are occupied or tap the screen to move on to the next step until the recipe is finished.

## Demo

- Video: (https://youtube.com/shorts/xjZLiOJM-aw?feature=share)

## Setup and running

**Expo SDK:** "~58.0.26"
**Device:** iPhone 17

### Requirements

- Node.js 22.13 or newer (`node --version` to check)
- A free Expo account at [expo.dev](https://expo.dev)
- The Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)), signed into the same Expo account you'll use on your computer

### Run it

```bash
git clone <!-- your repo URL -->
cd <!-- repo folder name -->
npm install
npx expo login        # same account as Expo Go on your phone
npx expo start
```

Then scan the QR code in the terminal: on iPhone with the built-in Camera app, on Android from inside Expo Go. Your phone and computer need to be on the same Wi-Fi network. If the QR code scans but nothing loads, restart with tunnel mode:

```bash
npx expo start --tunnel
```

If the app is already open and doesn't pick up a change, press `r` in the terminal to reload.

### Notes for testing

- **Use a real phone.** Nudge-to-advance reads the accelerometer, which simulators don't provide real data for. Everything else works in a simulator, but nudging won't.
- **Nudge sensitivity** is set in `src/constants/nudge.ts` (bump threshold, flat check, cooldown, touch suppression). Those values were tuned on <!-- your counter/phone; adjust after testing -->.
- **Keep-awake:** <!-- fill in after testing: does Expo Go keep the screen on for every screen in development? If yes, note that AC 17 was verified in code (useKeepAwake only in src/app/cook/[id].tsx) instead of on-device. -->
- **Read aloud:** <!-- fill in after testing: does speech play with the iPhone silent switch on? If not, say "turn off silent mode to hear steps read aloud." Delete this bullet if you're on Android and it works. -->
- **Resetting to first-launch state** (to see the seeded recipes again): on Android, Settings → Apps → Expo Go → Clear storage. On iPhone, delete and reinstall Expo Go, then sign back in.

## How this was built

- [`SPEC.md`](SPEC.md): the specification, written before any code existed.
- The app was built by an AI agent from that spec in one pass (commit: "Raw agentic build output"), then reviewed against the spec by a separate agent with no access to the build conversation.
- [`REVIEW.md`](REVIEW.md): that review, unedited.
- [`prompt_log.md`](prompt_log.md): the AI tools used and the key prompts, verbatim.

## What surprised me about mobile development

Something that I learned about mobile development is how much you can do with it beyond a webapp in the physical space just because of having your phone as the device. I was able to get nudging interactions where you can just nudge your phone and it can receive that signal and do something and I think that's just really cool.