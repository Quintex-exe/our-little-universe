export type AdventureCategory = 'cozy' | 'outdoors' | 'creative' | 'food' | 'playful' | 'calm';

export interface Adventure {
  id: string;
  title: string;
  detail: string;
  category: AdventureCategory;
  /** Rough time needed, shown to the couple. */
  time: string;
  cost: 'Free' | 'Low' | 'Splurge';
}

export const CATEGORY_LABEL: Record<AdventureCategory, string> = {
  cozy: 'Cosy',
  outdoors: 'Outdoors',
  creative: 'Creative',
  food: 'Food',
  playful: 'Playful',
  calm: 'Calm',
};

export const ADVENTURES: readonly Adventure[] = [
  { id: 'sunset-walk', title: 'Chase the sunset', detail: 'Find the best open spot nearby and watch the sky change. Phones stay in pockets until the last colour fades.', category: 'outdoors', time: '1 hour', cost: 'Free' },
  { id: 'blanket-fort', title: 'Build a blanket fort', detail: 'Cushions, fairy lights, snacks. Put a film on, or just talk until someone falls asleep.', category: 'cozy', time: '2 hours', cost: 'Free' },
  { id: 'breakfast-dinner', title: 'Breakfast for dinner', detail: 'Pancakes, eggs, whatever you both love at 8 pm. Wear pyjamas.', category: 'food', time: '1 hour', cost: 'Low' },
  { id: 'postcards', title: 'Write each other postcards', detail: 'Three lines each about this month. Post them or tuck them somewhere to find later.', category: 'creative', time: '30 min', cost: 'Low' },
  { id: 'stargaze', title: 'Go stargazing', detail: 'Take a mat and a flask. See how many constellations you can name, then invent the rest.', category: 'outdoors', time: '1 hour', cost: 'Free' },
  { id: 'cook-new', title: 'Cook something neither of you has made', detail: 'Pick a recipe at random, split the steps, and score the result out of ten.', category: 'food', time: '2 hours', cost: 'Low' },
  { id: 'swap-playlists', title: 'Swap playlists', detail: 'Each of you picks five songs the other has never heard. Listen together, no skipping.', category: 'playful', time: '45 min', cost: 'Free' },
  { id: 'photo-walk', title: 'Take a photo walk', detail: 'Choose a colour and photograph only things in that colour. Compare your favourites over tea.', category: 'creative', time: '1 hour', cost: 'Free' },
  { id: 'picnic-home', title: 'Picnic on the living-room floor', detail: 'Lay out a cloth, bring the good snacks, and pretend there is a view.', category: 'cozy', time: '1 hour', cost: 'Low' },
  { id: 'new-cafe', title: 'Try a café neither of you knows', detail: 'Walk until one of you says “this one”. Order something you cannot pronounce.', category: 'food', time: '1.5 hours', cost: 'Low' },
  { id: 'letters-future', title: 'Write letters to future you', detail: 'Seal them and set a date to open them together, a year from now.', category: 'creative', time: '30 min', cost: 'Free' },
  { id: 'board-game', title: 'Play an old board game', detail: 'Winner picks dessert. Loser picks the next film.', category: 'playful', time: '1 hour', cost: 'Free' },
  { id: 'slow-morning', title: 'Have a slow morning', detail: 'No alarms, no plans. Coffee in bed and a long, aimless chat.', category: 'calm', time: 'Morning', cost: 'Free' },
  { id: 'market', title: 'Wander a local market', detail: 'Buy one thing each for the other under a small budget. Reveal at the end.', category: 'outdoors', time: '2 hours', cost: 'Low' },
  { id: 'draw-each-other', title: 'Draw each other', detail: 'Five minutes per portrait, no erasing. Frame the funniest one.', category: 'creative', time: '30 min', cost: 'Free' },
  { id: 'bake-together', title: 'Bake something together', detail: 'Cookies, bread, a lopsided cake. The mess is part of it.', category: 'food', time: '2 hours', cost: 'Low' },
  { id: 'rainy-walk', title: 'Take a walk in the rain', detail: 'Umbrella optional. Come home to something warm to drink.', category: 'outdoors', time: '45 min', cost: 'Free' },
  { id: 'memory-lane', title: 'Retell how you met', detail: 'Each tell it from your own side. Note what the other remembers differently.', category: 'calm', time: '30 min', cost: 'Free' },
  { id: 'dance-kitchen', title: 'Dance in the kitchen', detail: 'One song each, full volume, zero skill required.', category: 'playful', time: '20 min', cost: 'Free' },
  { id: 'stay-in-spa', title: 'Home spa evening', detail: 'Face masks, foot soaks, a gentle playlist. Take turns being looked after.', category: 'calm', time: '1.5 hours', cost: 'Low' },
  { id: 'bookshop', title: 'Choose books for each other', detail: 'Visit a bookshop, pick one book for the other, and swap at the door.', category: 'cozy', time: '1.5 hours', cost: 'Low' },
  { id: 'quiz-night', title: 'Host a two-person quiz', detail: 'Each write ten questions about the other. Loser does the dishes.', category: 'playful', time: '45 min', cost: 'Free' },
  { id: 'sunrise', title: 'Watch a sunrise', detail: 'Set the alarm, bring a thermos, and earn a very good breakfast.', category: 'outdoors', time: 'Early start', cost: 'Free' },
  { id: 'plant-something', title: 'Plant something small', detail: 'A herb, a succulent, a bulb. Name it and decide who waters it.', category: 'creative', time: '45 min', cost: 'Low' },
  { id: 'movie-double', title: 'Double feature at home', detail: 'One film each chose. Rate both, argue gently about the result.', category: 'cozy', time: '4 hours', cost: 'Free' },
  { id: 'street-food', title: 'Street-food crawl', detail: 'Three stalls, one dish each, share everything.', category: 'food', time: '2 hours', cost: 'Low' },
  { id: 'gratitude', title: 'Three good things', detail: 'Name three things you each appreciate about the other this week. Be specific.', category: 'calm', time: '15 min', cost: 'Free' },
  { id: 'scavenger', title: 'Make a mini scavenger hunt', detail: 'Hide five small clues around the home for the other to follow, ending in a treat.', category: 'playful', time: '1 hour', cost: 'Free' },
  { id: 'pottery', title: 'Try a pottery or craft class', detail: 'Make something imperfect and keep it on the shelf.', category: 'creative', time: '2 hours', cost: 'Splurge' },
  { id: 'new-trail', title: 'Walk a trail you have never taken', detail: 'Pick one at random from a map. Bring water and snacks.', category: 'outdoors', time: '3 hours', cost: 'Free' },
];
