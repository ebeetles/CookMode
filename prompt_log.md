# Prompt log

Original design prompts:
https://claude.ai/share/7280dee8-5d21-4975-ab50-cd25cb9ae3fd

The prompts used to build Cook Mode with Claude Code (Opus 5.5), in order, with what came out of each.

1. > Read spec.md and implement. This should be an expo project, please set up the environment and implement according to the spec doc

   Scaffolded an Expo SDK 58 project and built the Recipe List, Add Recipe and Cook Mode screens to [SPEC.md](SPEC.md). Checked the acceptance criteria in the iOS simulator.

2. > can you make commits for what you did, as well as a commit for the review.md file that i just made with another agent, and push

   Split the work into commits, committed [REVIEW.md](REVIEW.md) separately, then asked where to push. Answer: *Use an existing repo*.

3. > https://github.com/ebeetles/CookMode.git

   Pushed to `main`.

4. > okay how do i actually test it on my actual phone

   Explained running `npx expo start` and opening it in Expo Go on the phone.

5. > can you close the simulator i think its messing with my macbook speakers

   Shut down the simulator and the Expo server.

6. > i think its not sensitive enough

   Made nudge-to-advance more sensitive: lowered the bump threshold from 0.3 g to 0.15 g and sampled every 20 ms instead of 50 ms.

7. > alright everything looks great now, commit and push changes

   Committed and pushed the nudge change.

8. > add a prompt_log.md

   This file.
