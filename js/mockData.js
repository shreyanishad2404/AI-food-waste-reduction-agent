// Mock Database for AI Food Waste Reduction Agent - Indian Version

export const MOCK_RECIPES = [
  {
    id: "rec1",
    name: "Zero-Waste Dhaniya-Pudina Chutney",
    description: "Don't discard coriander or mint stems! Grind leaves and stems together into a classic Indian condiment.",
    ingredients: [
      { name: "coriander bunch", amount: 1, unit: "pcs", required: true },
      { name: "green chillies", amount: 3, unit: "pcs", required: true },
      { name: "ginger", amount: 1, unit: "inch", required: false },
      { name: "lemon", amount: 0.5, unit: "pcs", required: false },
      { name: "curd", amount: 2, unit: "tbsp", required: false }
    ],
    instructions: [
      "Wash coriander bunch thoroughly, retaining the flavorful, tender stems.",
      "In a mixer jar, add coriander, green chillies, ginger piece, and salt to taste.",
      "Add a splash of water and squeeze half a lemon (keeps the color green).",
      "Grind into a smooth paste. Optionally stir in 2 tbsp of curd/dahi for a creamy texture.",
      "Serve as a dip with snacks or spread on sandwiches."
    ],
    prepTime: 10,
    difficulty: "Easy",
    co2Saved: 0.8, // kg CO2 saved
    category: "Sauce"
  },
  {
    id: "rec2",
    name: "Leftover Roti Upma",
    description: "Transform stale, dry chapatis/rotis into a savory, spiced breakfast dish.",
    ingredients: [
      { name: "bread", amount: 4, unit: "slices", required: true }, // mapping chapatis to 'bread' keyword for parser compatibility
      { name: "onion", amount: 1, unit: "pcs", required: true },
      { name: "tomato", amount: 1, unit: "pcs", required: false },
      { name: "green chillies", amount: 2, unit: "pcs", required: true },
      { name: "mustard seeds", amount: 1, unit: "tsp", required: false }
    ],
    instructions: [
      "Tear stale rotis/chapatis (or bread slices) into small pieces, or pulse them in a mixer to make coarse crumbs.",
      "Heat a pan with oil, add mustard seeds and let them splutter.",
      "Sauté chopped onions and slit green chillies until onions turn translucent.",
      "Add chopped tomatoes, turmeric, and salt. Sauté until mushy.",
      "Add the roti crumbs, toss thoroughly on low heat for 3-4 minutes, sprinkle a few drops of water to moisten, garnish with coriander leaves and serve."
    ],
    prepTime: 15,
    difficulty: "Easy",
    co2Saved: 1.5,
    category: "Breakfast"
  },
  {
    id: "rec3",
    name: "Rescue Masala Khichdi",
    description: "The ultimate Indian comfort food to clear out wilted carrots, beans, peas, and tomatoes.",
    ingredients: [
      { name: "carrot", amount: 1, unit: "pcs", required: false },
      { name: "onion", amount: 1, unit: "pcs", required: true },
      { name: "tomato", amount: 1, unit: "pcs", required: true },
      { name: "rice", amount: 0.5, unit: "cup", required: true },
      { name: "dal", amount: 0.5, unit: "cup", required: true },
      { name: "ginger-garlic paste", amount: 1, unit: "tsp", required: false }
    ],
    instructions: [
      "Wash rice and moong dal together and soak for 15 minutes.",
      "Chop all your available wilted vegetables (carrots, tomatoes, beans, etc.).",
      "Heat ghee/oil in a pressure cooker. Sauté cumin seeds, onions, and ginger-garlic paste.",
      "Add chopped tomatoes and vegetables. Cook for 2 minutes with turmeric, red chilli, and garam masala.",
      "Stir in drained rice and dal, add 3.5 cups of water, season with salt, and pressure cook for 3-4 whistles. Serve hot with ghee."
    ],
    prepTime: 30,
    difficulty: "Easy",
    co2Saved: 2.2,
    category: "Dinner"
  },
  {
    id: "rec4",
    name: "Quick Paneer Bhurji",
    description: "Sauté crumbled paneer with spices, onions, and bell peppers that need using.",
    ingredients: [
      { name: "paneer", amount: 200, unit: "g", required: true },
      { name: "onion", amount: 1, unit: "pcs", required: true },
      { name: "tomato", amount: 1, unit: "pcs", required: true },
      { name: "bell pepper", amount: 1, unit: "pcs", required: false },
      { name: "green chillies", amount: 2, unit: "pcs", required: false }
    ],
    instructions: [
      "Finely chop the onions, green chillies, tomatoes, and bell pepper. Crumble the paneer by hand.",
      "Heat oil or butter in a pan. Sauté onions and green chillies until lightly golden.",
      "Add bell pepper and cook for 2 minutes, then stir in tomatoes and sauté until soft.",
      "Add turmeric, coriander powder, and pav bhaji masala or garam masala. Season with salt.",
      "Add crumbled paneer, mix gently, and cook on medium heat for 2-3 minutes. Garnish with coriander leaves."
    ],
    prepTime: 15,
    difficulty: "Easy",
    co2Saved: 2.0,
    category: "Lunch"
  },
  {
    id: "rec5",
    name: "Classic Aloo Jeera",
    description: "Rescue potatoes that are starting to sprout by making a dry, tempered potato dish.",
    ingredients: [
      { name: "potato", amount: 4, unit: "pcs", required: true },
      { name: "cumin seeds", amount: 2, unit: "tsp", required: true },
      { name: "green chillies", amount: 2, unit: "pcs", required: false },
      { name: "coriander bunch", amount: 0.25, unit: "pcs", required: false }
    ],
    instructions: [
      "Boil potatoes, peel, and cube them. (Alternatively, slice raw potatoes thin).",
      "Heat oil in a pan, add cumin seeds (jeera) and let them brown fully to release aroma.",
      "Add green chillies, ginger, and turmeric powder.",
      "Toss the cubed potatoes, salt, and red chilli powder in the pan on high heat until crispy.",
      "Garnish generously with chopped coriander and serve hot with rotis."
    ],
    prepTime: 20,
    difficulty: "Easy",
    co2Saved: 1.1,
    category: "Dinner"
  }
];

export const MOCK_STORAGE_GUIDE = [
  {
    item: "Coriander Bunch (Dhaniya)",
    category: "Vegetables",
    zone: "Fridge (Steel Tin)",
    lifespan: "7-12 Days",
    tips: "Treat it like a goldmine! Chop off the roots, clean soil, wrap in a dry newspaper or kitchen paper towel, and store in an airtight steel container in the fridge.",
    icon: "sprout"
  },
  {
    item: "Green Chillies",
    category: "Vegetables",
    zone: "Fridge (Airtight Box)",
    lifespan: "15-20 Days",
    tips: "Moisture settles near the stems. Pluck the stems/crowns off before storing. Line an airtight box with paper towel, place chillies inside, and seal.",
    icon: "cherry"
  },
  {
    item: "Paneer Block",
    category: "Dairy",
    zone: "Fridge (Water bowl)",
    lifespan: "3-5 Days once opened",
    tips: "If you have opened paneer, submerge it in a bowl of fresh water in the fridge. Change the water daily to keep it soft and prevent it from souring.",
    icon: "cookie"
  },
  {
    item: "Milk Packets",
    category: "Dairy",
    zone: "Coldest Shelf / Boil",
    lifespan: "2-3 Days",
    tips: "Store milk packets on the coldest shelf of the fridge immediately. If refrigeration is weak or unavailable, boil the milk twice a day to pasteurize.",
    icon: "cup-water"
  },
  {
    item: "Onions & Potatoes",
    category: "Grains/Pantry",
    zone: "Dry Open Baskets",
    lifespan: "4-8 Weeks",
    tips: "Never store potatoes and onions together! Onions release ethylene gas which causes potatoes to sprout eyes quickly. Keep both in ventilated baskets.",
    icon: "database"
  },
  {
    item: "Ginger & Garlic",
    category: "Vegetables",
    zone: "Fridge or Countertop",
    lifespan: "3-4 Weeks",
    tips: "Store whole, unpeeled roots in a mesh bag on the counter. If you have extra, blend them into a ginger-garlic paste with a pinch of salt and oil, then freeze in a jar.",
    icon: "orbit"
  },
  {
    item: "Curd (Dahi)",
    category: "Dairy",
    zone: "Fridge",
    lifespan: "5-7 Days",
    tips: "Keep in a cool fridge shelf. Use a clean, dry spoon to extract curd. If it starts getting slightly sour, convert it into Kadhi, Lassi, or Raita instead of throwing it.",
    icon: "glass"
  },
  {
    item: "Chapatis / Rotis",
    category: "Breadbox or Freezer",
    zone: "Hotcase then Freezer",
    lifespan: "1-2 Days (Counter) / 1 Month (Freezer)",
    tips: "Wrap leftover rotis in foil and store in a container. If you have too many, crush them to make Roti Upma/Ladoos or freeze them in zip-locks.",
    icon: "disc"
  }
];

export const MOCK_RECEIPT_SCANS = {
  receipt1: {
    store: "Blinkit Instant Delivery",
    date: "2026-07-04",
    total: "₹384.00",
    items: [
      { name: "Amul Fresh Paneer 200g", category: "Dairy", qty: 1, unit: "pack", price: "₹92.00", daysToExpiry: 4 },
      { name: "Fresh Coriander Bunch 100g", category: "Vegetables", qty: 1, unit: "pcs", price: "₹18.00", daysToExpiry: 5 },
      { name: "Nandini Toned Milk 500ml", category: "Dairy", qty: 2, unit: "pack", price: "₹54.00", daysToExpiry: 3 },
      { name: "Harvest Gold Brown Bread", category: "Grains/Pantry", qty: 1, unit: "loaf", price: "₹50.00", daysToExpiry: 5 },
      { name: "Fresh Roma Tomatoes 500g", category: "Fruits", qty: 1, unit: "pack", price: "₹65.00", daysToExpiry: 6 },
      { name: "Ooty Potatoes (Aloo) 1kg", category: "Grains/Pantry", qty: 1, unit: "pack", price: "₹45.00", daysToExpiry: 20 },
      { name: "Spiced Ginger Garlic Paste 100g", category: "Vegetables", qty: 1, unit: "pack", price: "₹60.00", daysToExpiry: 45 }
    ],
    ocrVisual: [
      { text: "BLINKIT ORDER #BK9912", x: 100, y: 30, w: 180, h: 18 },
      { text: "07/04/2026 18:45", x: 80, y: 55, w: 120, h: 12 },
      { text: "AMUL PANEER 200G   92.00", x: 50, y: 100, w: 220, h: 14 },
      { text: "FRESH CORIANDER 100G  18.00", x: 50, y: 120, w: 220, h: 14 },
      { text: "NANDINI MILK 500ML x2  54.00", x: 50, y: 140, w: 220, h: 14 },
      { text: "HARVEST BROWN BREAD   50.00", x: 50, y: 160, w: 220, h: 14 },
      { text: "ROMA TOMATOES 500G   65.00", x: 50, y: 180, w: 220, h: 14 },
      { text: "POTATOES ALOO 1KG   45.00", x: 50, y: 200, w: 220, h: 14 },
      { text: "GINGER GARLIC PASTE  60.00", x: 50, y: 220, w: 220, h: 14 },
      { text: "TOTAL   ₹384.00", x: 50, y: 250, w: 220, h: 16 }
    ]
  },
  receipt2: {
    store: "Zepto Delivery",
    date: "2026-07-05",
    total: "₹248.00",
    items: [
      { name: "Mother Dairy Dahi (Curd) 400g", category: "Dairy", qty: 1, unit: "pack", price: "₹65.00", daysToExpiry: 6 },
      { name: "Hybrid Green Chillies 100g", category: "Vegetables", qty: 1, unit: "pack", price: "₹23.00", daysToExpiry: 12 },
      { name: "Amul Salted Butter 100g", category: "Dairy", qty: 1, unit: "pack", price: "₹60.00", daysToExpiry: 30 },
      { name: "Ashirvaad Shudh Atta 1kg", category: "Grains/Pantry", qty: 1, unit: "pack", price: "₹75.00", daysToExpiry: 90 },
      { name: "Fresh Red Onions 1kg", category: "Vegetables", qty: 1, unit: "pack", price: "₹25.00", daysToExpiry: 30 }
    ],
    ocrVisual: [
      { text: "ZEPTO DELIVERY INC", x: 110, y: 30, w: 160, h: 18 },
      { text: "07/05/2026 12:10", x: 80, y: 55, w: 120, h: 12 },
      { text: "MOTHER DAIRY CURD 400G  65.00", x: 50, y: 100, w: 220, h: 14 },
      { text: "GREEN CHILLIES 100G  23.00", x: 50, y: 120, w: 220, h: 14 },
      { text: "AMUL BUTTER 100G  60.00", x: 50, y: 140, w: 220, h: 14 },
      { text: "ASHIRVAAD ATTA 1KG  75.00", x: 50, y: 160, w: 220, h: 14 },
      { text: "RED ONIONS 1KG   25.00", x: 50, y: 180, w: 220, h: 14 },
      { text: "TOTAL   ₹248.00", x: 50, y: 220, w: 220, h: 16 }
    ]
  }
};

export const MOCK_PHOTO_SCANS = {
  photo1: {
    imageUrl: "assets/pantry_basket.webp",
    detectedItems: [
      { name: "Ooty Potatoes (Aloo) 1kg", category: "Grains/Pantry", qty: 4, unit: "pcs", confidence: "94%", daysToExpiry: 12, box: { x: 30, y: 40, w: 120, h: 100 } },
      { name: "Fresh Coriander Bunch 100g", category: "Vegetables", qty: 1, unit: "pcs", confidence: "92%", daysToExpiry: 4, box: { x: 180, y: 20, w: 150, h: 220 } },
      { name: "Fresh Roma Tomatoes 500g", category: "Fruits", qty: 3, unit: "pcs", confidence: "97%", daysToExpiry: 5, box: { x: 50, y: 160, w: 140, h: 120 } }
    ]
  },
  photo2: {
    imageUrl: "assets/fridge_shelf.webp",
    detectedItems: [
      { name: "Amul Fresh Paneer 200g", category: "Dairy", qty: 1, unit: "pack", confidence: "96%", daysToExpiry: 4, box: { x: 40, y: 30, w: 100, h: 120 } },
      { name: "Nandini Toned Milk 500ml", category: "Dairy", qty: 1, unit: "pack", confidence: "89%", daysToExpiry: 3, box: { x: 160, y: 120, w: 140, h: 80 } },
      { name: "Mother Dairy Dahi (Curd) 400g", category: "Dairy", qty: 1, unit: "pack", confidence: "91%", daysToExpiry: 6, box: { x: 170, y: 40, w: 110, h: 70 } }
    ]
  }
};

export const MOCK_SHARE_ITEMS = [
  {
    id: "share1",
    donor: "Karan S.",
    item: "Half Packet Amul Paneer",
    category: "Dairy",
    distance: "0.2 km away",
    expiryDesc: "Expiring in 2 days",
    daysToExpiry: 2,
    notes: "Opened today to make a small paneer wrap, but half of the packet is untouched. Kept refrigerated.",
    avatar: "🥣",
    timestamp: "1 hour ago"
  },
  {
    id: "share2",
    donor: "Pooja M.",
    item: "5 Fresh Alphonso Mangoes",
    category: "Fruits",
    distance: "0.9 km away",
    expiryDesc: "Ripe! Consume in 3 days",
    daysToExpiry: 3,
    notes: "Gifted from my hometown in Ratnagiri. There are way too many for my family of two.",
    avatar: "🥭",
    timestamp: "3 hours ago"
  },
  {
    id: "share3",
    donor: "Rohan G.",
    item: "1 Pack Mother Dairy Milk",
    category: "Dairy",
    distance: "0.5 km away",
    expiryDesc: "Expires tomorrow",
    daysToExpiry: 1,
    notes: "Bought extra packets for kheer, but plan changed. Unopened milk packet.",
    avatar: "🥛",
    timestamp: "1 day ago"
  }
];

export const MOCK_CHALLENGES = [
  {
    id: "chal1",
    title: "Weekend Rasoi Warrior",
    description: "Mark 0 items as 'Wasted' from Friday to Sunday.",
    xp: 150,
    progress: 100,
    completed: true,
    badge: "badge_zero_waste_week",
    badgeName: "Rasoi Protector",
    type: "weekend"
  },
  {
    id: "chal2",
    title: "Chutney Legend",
    description: "Cook 3 recipes that utilize items expiring within 3 days.",
    xp: 200,
    progress: 66,
    completed: false,
    badge: "badge_recipe_rescuer",
    badgeName: "Chutney Rescuer",
    type: "cook"
  },
  {
    id: "chal3",
    title: "Clean Fridge Purge",
    description: "Reduce your total pantry items count to below 5 by consuming them.",
    xp: 100,
    progress: 40,
    completed: false,
    badge: "badge_pantry_master",
    badgeName: "Clean Plate Master",
    type: "pantry"
  }
];
