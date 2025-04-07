const replyPlaceholders = [
  "Your witty response goes here...",
  "What's your take on this?",
  "Thoughts? We're all ears...",
  "Care to weigh in?",
  "The perfect comeback awaits...",
  "Your brilliant reply is loading...",
  "Don't hold back, tell us what you think...",
  "Add your voice to the conversation...",
  "Your turn to drop some wisdom...",
  "Agree? Disagree? Let's hear it...",
  "The floor is yours...",
  "Ready to share your perspective?",
  "Your response could change everything...",
  "Join the conversation...",
  "What would you add to this?",
  "This thread needs your special touch...",
  "Time for your plot twist...",
  "Spice up this thread with your thoughts...",
  "Type your epic response here...",
  "Continue the story...",
];

export const randomPlaceholder = () => {
  const randomIndex = Math.floor(Math.random() * replyPlaceholders.length);
  return replyPlaceholders[randomIndex];
};
