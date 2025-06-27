import OpenAI from 'openai';
import { Chronicle, Quest, Fellow } from '../types';
import { format } from 'date-fns';

interface GenerateChronicleInput {
  journalEntry: string;
  completedQuests: Quest[];
  recentInteractions: Fellow[];
  date?: Date;
}

// Only initialize OpenAI if API key is available
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export async function generateChronicle({
  journalEntry,
  completedQuests,
  recentInteractions,
  date = new Date()
}: GenerateChronicleInput): Promise<Chronicle> {
  // Check if OpenAI is available
  try {
    const openai = getOpenAIClient();
    
    // Prepare the context for the AI
    const questDescriptions = completedQuests
      .map(q => `- ${q.title} (${q.type})`)
      .join('\n');
      
    const interactionDescriptions = recentInteractions
      .map(f => `- ${f.name} (${f.specialty})`)
      .join('\n');

    const prompt = `Create a fantasy-style journal entry (100-150 words) for a mythical quest journal. Write in second person perspective.

Context:
User's Journal: "${journalEntry}"

Completed Quests:
${questDescriptions}

Fellow Adventurers:
${interactionDescriptions}

Requirements:
- Reframe real-world activities as epic fantasy trials
- Reference interactions with other adventurers as meaningful encounters
- Maintain a mystical, heroic tone
- Reflect the mood and goals from the journal entry
- Create a thematic title for the entry
- Keep the narrative personal and meaningful`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a master chronicler in a fantasy realm, transforming everyday experiences into epic tales."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 250
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No response from OpenAI');

    // Extract title and content
    const lines = response.split('\n');
    const title = lines[0].replace(/^Title:\s*/, '');
    const content = lines.slice(2).join('\n').trim();

    // Generate chronicle object
    const chronicle: Chronicle = {
      id: crypto.randomUUID(),
      date: date,
      title,
      content,
      questsCompleted: completedQuests.map(q => q.id),
      fellowInteractions: recentInteractions.map(f => f.id),
      mood: detectMood(journalEntry),
      imageUrl: selectThematicImage(title, content)
    };

    return chronicle;
  } catch (error) {
    console.warn('OpenAI not available, generating fallback chronicle:', error);
    
    // Fallback chronicle generation without AI
    const fallbackChronicle: Chronicle = {
      id: crypto.randomUUID(),
      date: date,
      title: generateFallbackTitle(completedQuests),
      content: generateFallbackContent(journalEntry, completedQuests, recentInteractions),
      questsCompleted: completedQuests.map(q => q.id),
      fellowInteractions: recentInteractions.map(f => f.id),
      mood: detectMood(journalEntry),
      imageUrl: selectThematicImage('', '')
    };

    return fallbackChronicle;
  }
}

function generateFallbackTitle(completedQuests: Quest[]): string {
  const titles = [
    'A Day of Trials',
    'The Path Forward',
    'Challenges Overcome',
    'Steps on the Journey',
    'The Adventure Continues'
  ];
  
  if (completedQuests.length > 0) {
    const questType = completedQuests[0].type;
    const typeMap: Record<string, string> = {
      walking: 'The Wanderer\'s Path',
      exercise: 'Trials of Strength',
      journaling: 'Chronicles of Reflection',
      meditation: 'The Inner Journey',
      reading: 'Wisdom Gathered',
      social: 'Bonds Forged'
    };
    return typeMap[questType] || titles[0];
  }
  
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateFallbackContent(
  journalEntry: string,
  completedQuests: Quest[],
  recentInteractions: Fellow[]
): string {
  const questDescriptions = completedQuests.map(q => {
    const typeMap: Record<string, string> = {
      walking: 'traversed the mystical paths',
      exercise: 'strengthened your resolve through physical trials',
      journaling: 'recorded your thoughts in the ancient chronicles',
      meditation: 'found peace in the sacred groves',
      reading: 'gained wisdom from the old texts',
      social: 'connected with fellow adventurers'
    };
    return typeMap[q.type] || 'completed a mysterious trial';
  });

  let content = `Today in the realm of Eldoria, you ${questDescriptions.join(' and ')}.`;
  
  if (recentInteractions.length > 0) {
    content += ` Your path crossed with ${recentInteractions.map(f => f.name).join(' and ')}, fellow seekers on this grand adventure.`;
  }
  
  content += ` Each step forward strengthens your connection to this mystical realm, where your real-world actions shape your legendary tale.`;
  
  return content;
}

function detectMood(journalEntry: string): string {
  // Simple mood detection based on keywords
  const moodKeywords = {
    joyful: ['happy', 'excited', 'wonderful', 'great', 'amazing'],
    determined: ['focused', 'committed', 'resolved', 'dedicated'],
    reflective: ['thoughtful', 'contemplating', 'wondering', 'thinking'],
    challenged: ['difficult', 'struggling', 'hard', 'challenging']
  };

  const entry = journalEntry.toLowerCase();
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => entry.includes(keyword))) {
      return mood;
    }
  }

  return 'neutral';
}

function selectThematicImage(title: string, content: string): string {
  // For now, return a default fantasy landscape
  // In a full implementation, this would use image generation or a curated image library
  return 'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg?auto=compress&cs=tinysrgb&w=1280';
}