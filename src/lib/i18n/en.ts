// English dictionary
const en = {
  // Navigation
  orderNow: 'Order Now',
  yourWallet: 'Your Wallet',
  shareLink: 'Share Link',
  home: 'Home',
  menu: 'Menu',
  rewards: 'Rewards',
  profile: 'Profile',

  // POS
  hotCoffee: 'Hot Coffee',
  coldCoffee: 'Cold Coffee',
  checkout: 'Checkout',
  orderPaid: 'Order Paid',
  ticketEmpty: 'Ticket Empty',
  grandTotal: 'Grand Total',
  cash: 'Cash',

  // Onboarding
  welcomeToAdda: 'Welcome to the Adda',
  whatDoWeCallYou: 'What do we call you?',
  pickHomeBase: 'Pick your Home Base',
  youreIn: "You're In",
  creditsAdded: 'Janu Credits added to your wallet',

  // General
  loading: 'Loading...',
  tryAgain: 'Try Again',
  backHome: 'Back Home',
  storeReady: 'Store Ready',
  workingOffline: 'Working Offline. Orders saving locally.',
} as const;

export type TranslationKey = keyof typeof en;
export default en;
