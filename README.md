# Queuelay

An open-play pickleball queue and rotation manager for **Team Kulay**.

Check players in, auto-fill open courts with fair, level-balanced matchups, and track match history and player stats — all from one screen, no backend required.

## Features

**Queue & Courts**

- Tap a name under **Available** to check a player in
- Configurable number of courts (2–10)
- **Send next up** fills an open court with a fresh group of 4
- **Shuffle** button randomizes waiting-order tie-breaks before assignment
- Reorder or pull anyone out of the waiting line manually
- **Finish game** clears a court and (optionally) sends players back to the end of the queue

**Fair, balanced matchmaking**

- Players with the fewest matches played are always prioritized first — nobody sits out repeatedly while others play again and again
- Among equally-due players, the app looks for the most balanced 2v2 split by skill level (`A` = Advanced, `B` = Intermediate, `C` = Beginner), preferring mixed pairings (e.g. A+C vs B+B) over stacking same-level players together
- Court cards show the actual team split in a bird's-eye pickleball court layout, net and kitchen lines included

**Roster management**

- Pre-loaded Team Kulay roster, editable any time
- Add new members with a name and starting level
- Tap a player's level badge to cycle **A → B → C → A**
- Remove anyone from the roster (cleans them out of the queue/courts too)

**Match History tab**

- Every game ever assigned, newest first, with duration once finished
- **Player Stats** table: total matches played and the round number of each player's last game — handy for spotting who's gone longest without playing

**Data persistence**

- Everything (roster, queue, courts, stats, match history, court count) is saved to `localStorage` automatically
- Refreshing or restarting the dev server won't lose your session
- **Reset** button in the header clears all saved data back to the seed roster (with a confirmation prompt)

## Tech stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Tailwind CSS](https://tailwindcss.com/) v3
- [lucide-react](https://lucide.dev/) for icons

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Building for production

```bash
npm run build
```

Type-checks with `tsc -b` and outputs a static build to `dist/`.

## Deployment

This project is set up for [Netlify](https://www.netlify.com/) via `netlify.toml`
(build command `npm run build`, publish directory `dist`).

- **Quickest:** run `npm run build`, then drag the `dist/` folder onto
  [app.netlify.com/drop](https://app.netlify.com/drop)
- **Continuous deploy:** push this repo to GitHub, then
  **Add new site → Import an existing project** in the Netlify dashboard —
  it will pick up the build settings automatically

## Project structure

src/
types.ts # shared types, constants, seed roster
utils.ts # shuffle, combinations, team-balancing, storage helpers
components/
Logo.tsx # app mark (paddle + color-hole grid)
Header.tsx # logo, title, court-count stepper, reset button
TabBar.tsx # Queue / Match History tab switcher
LevelBadge.tsx # A/B/C skill badge, click to cycle
AvailablePanel.tsx # roster check-in + add-member form
WaitingPanel.tsx # waiting queue, reorder/remove, shuffle
CourtsPanel.tsx # court cards, bird's-eye 2v2 layout, finish game
MatchHistoryPanel.tsx # full match log
PlayerStatsPanel.tsx # matches played / last game per player
containers/
Queue.tsx # owns all state + handlers; composes the panels above
App.tsx # renders <Queue />

## Team

Built for **Team Kulay** open-play sessions. "Kulay" (Filipino for _color_) is the
theme behind the court-color rotation and the app's paddle logo.
