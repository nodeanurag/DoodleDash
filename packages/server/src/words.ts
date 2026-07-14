/**
 * Word bank for the drawing game. Kept server-side only so the dictionary
 * never leaks to clients. `pickWords` returns N distinct random words.
 */

export const WORDS: readonly string[] = [
  'apple', 'banana', 'guitar', 'rainbow', 'rocket', 'castle', 'dragon', 'pizza',
  'umbrella', 'elephant', 'lighthouse', 'snowman', 'butterfly', 'cactus', 'anchor',
  'mountain', 'volcano', 'penguin', 'octopus', 'spider', 'helicopter', 'sandwich',
  'telescope', 'dinosaur', 'campfire', 'jellyfish', 'kangaroo', 'pineapple',
  'skeleton', 'treasure', 'windmill', 'submarine', 'scarecrow', 'fireworks',
  'hamburger', 'ladder', 'mushroom', 'parachute', 'robot', 'tornado', 'igloo',
  'compass', 'crocodile', 'cupcake', 'dolphin', 'feather', 'glacier', 'hammock',
  'island', 'jacket', 'koala', 'lantern', 'magnet', 'needle', 'orbit', 'palette',
  'quilt', 'raccoon', 'starfish', 'trophy', 'unicorn', 'violin', 'waterfall',
  'xylophone', 'yacht', 'zebra', 'astronaut', 'bicycle', 'cathedral', 'diamond',
  'engine', 'forest', 'galaxy', 'harbor', 'iceberg', 'jungle', 'keyboard',
  'meteor', 'notebook', 'octagon', 'pyramid', 'quicksand', 'rollercoaster',
  'snowflake', 'tractor', 'wizard',
  // 55 new, distinct, highly visual drawing words:
  'airplane', 'balloon', 'bridge', 'candle', 'camera', 'desert', 'mirror', 'drum',
  'easel', 'garden', 'glasses', 'glove', 'hammer', 'helmet', 'map', 'key',
  'kite', 'lemon', 'lion', 'monkey', 'moon', 'sun', 'star', 'ocean', 'owl',
  'pillow', 'ring', 'river', 'shield', 'shoe', 'snail', 'socks', 'sword',
  'table', 'chair', 'spoon', 'fork', 'plate', 'cup', 'watch', 'window',
  'door', 'house', 'train', 'truck', 'bus', 'crown', 'bucket', 'brush',
  'pencil', 'book', 'clock', 'flower', 'tree', 'cloud',
];
