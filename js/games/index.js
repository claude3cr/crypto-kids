// The game registry. Order here = order on the home screen.
// To add a game: create its module, import it, add it to the array.
// `locked:true` shows a greyed-out "coming soon" card (the growth path).
import bullOrBear from './bull-or-bear.js';

export const GAMES = [
  bullOrBear,
  // Coming as he grows — placeholders so the path is visible on screen:
  { id:'preposition', title:'Cohete',  icon:'🚀', locked:true },  // ~6-8: prepositioning / catch the launch
  { id:'risk',        title:'Cuidado', icon:'🚦', locked:true },  // ~6-8: risk & warning flags
];
