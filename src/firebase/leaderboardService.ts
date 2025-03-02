import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

export interface LeaderboardEntry {
  id?: string;
  userId: string;
  userName: string;
  difficulty: string;
  timeElapsed: number;
  movesCount: number;
  hintsUsed: number;
  date: Timestamp;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  gamesPlayed: number;
  gamesWon: number;
  totalPlayTime: number;
  bestTimes: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
    expert: number | null;
  };
}

// Add a new leaderboard entry
export const addLeaderboardEntry = async (entry: Omit<LeaderboardEntry, 'date'>): Promise<string> => {
  const fullEntry = {
    ...entry,
    date: Timestamp.now()
  };
  
  const docRef = await addDoc(collection(db, 'leaderboard'), fullEntry);
  return docRef.id;
};

// Get top leaderboard entries by difficulty
export const getLeaderboard = async (difficulty: string, limit_count = 10): Promise<LeaderboardEntry[]> => {
  const q = query(
    collection(db, 'leaderboard'),
    where('difficulty', '==', difficulty),
    orderBy('timeElapsed', 'asc'),
    orderBy('movesCount', 'asc'),
    orderBy('hintsUsed', 'asc'),
    limit(limit_count)
  );
  
  const querySnapshot = await getDocs(q);
  const leaderboard: LeaderboardEntry[] = [];
  
  querySnapshot.forEach((doc) => {
    leaderboard.push({
      id: doc.id,
      ...doc.data()
    } as LeaderboardEntry);
  });
  
  return leaderboard;
};

// Get a user's best entries by difficulty
export const getUserBestEntries = async (userId: string): Promise<Record<string, LeaderboardEntry | null>> => {
  const difficulties = ['easy', 'medium', 'hard', 'expert'];
  const bestEntries: Record<string, LeaderboardEntry | null> = {};
  
  for (const difficulty of difficulties) {
    const q = query(
      collection(db, 'leaderboard'),
      where('userId', '==', userId),
      where('difficulty', '==', difficulty),
      orderBy('timeElapsed', 'asc'),
      orderBy('movesCount', 'asc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      bestEntries[difficulty] = {
        id: doc.id,
        ...doc.data()
      } as LeaderboardEntry;
    } else {
      bestEntries[difficulty] = null;
    }
  }
  
  return bestEntries;
};

// Create or update user profile
export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
  if (!profile.userId) {
    throw new Error('User ID is required to update profile');
  }
  
  const userRef = doc(db, 'users', profile.userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    // Update existing user
    await updateDoc(userRef, profile as { [key: string]: any });
  } else {
    // Create new user
    const newProfile: UserProfile = {
      userId: profile.userId,
      displayName: profile.displayName || 'Anonymous',
      photoURL: profile.photoURL || undefined,
      gamesPlayed: profile.gamesPlayed || 0,
      gamesWon: profile.gamesWon || 0,
      totalPlayTime: profile.totalPlayTime || 0,
      bestTimes: {
        easy: null,
        medium: null,
        hard: null,
        expert: null,
        ...profile.bestTimes
      }
    };
    
    await setDoc(userRef, newProfile as { [key: string]: any });
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  
  return null;
};

// Update user stats after game completion
export const updateUserStats = async (
  userId: string, 
  displayName: string,
  gameStats: {
    difficulty: string;
    timeElapsed: number;
    movesCount: number;
    hintsUsed: number;
    won: boolean;
  }
): Promise<void> => {
  // First, get the current user profile
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  let profile: UserProfile;
  
  if (userDoc.exists()) {
    profile = userDoc.data() as UserProfile;
  } else {
    // Create a new profile if it doesn't exist
    profile = {
      userId,
      displayName,
      gamesPlayed: 0,
      gamesWon: 0,
      totalPlayTime: 0,
      bestTimes: {
        easy: null,
        medium: null,
        hard: null,
        expert: null
      }
    };
  }
  
  // Update stats
  profile.gamesPlayed += 1;
  if (gameStats.won) {
    profile.gamesWon += 1;
  }
  profile.totalPlayTime += gameStats.timeElapsed;
  
  // Update best time if this is a win and it's better than the previous best
  const difficulty = gameStats.difficulty as keyof typeof profile.bestTimes;
  if (gameStats.won && 
      (profile.bestTimes[difficulty] === null || 
       gameStats.timeElapsed < profile.bestTimes[difficulty]!)) {
    profile.bestTimes[difficulty] = gameStats.timeElapsed;
  }
  
  // Save the updated profile
  await updateDoc(userRef, profile as { [key: string]: any });
  
  // Add a leaderboard entry if the user won
  if (gameStats.won) {
    await addLeaderboardEntry({
      userId,
      userName: displayName,
      difficulty: gameStats.difficulty,
      timeElapsed: gameStats.timeElapsed,
      movesCount: gameStats.movesCount,
      hintsUsed: gameStats.hintsUsed
    });
  }
};