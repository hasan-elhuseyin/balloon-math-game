// Define balloons
export const Balloons = {
  red: { type: 'red', emoji: '🎈' },
  green: { type: 'green', emoji: '🟢' },
  blue: { type: 'blue', emoji: '🔵' },
} as const;

// Export BalloonType
export type BalloonType = keyof typeof Balloons;

// Export balloonEmojis
export const BalloonEmojis: { [key in BalloonType]: string } = Object.fromEntries(
  Object.entries(Balloons).map(([key, value]) => [key, value.emoji])
) as { [key in BalloonType]: string };

// Balloon interface
export interface Balloon {
  x: number
  y: number
  type: BalloonType
}

export interface AnimatedBalloon extends Balloon {
  velocity: number
}

export class BalloonManager {
  private static emojis: Record<BalloonType, string> = {
    red: '🎈',
    green: '🟢',
    blue: '🔵',
  };

  public static getEmoji(type: BalloonType): string {
    return this.emojis[type];
  }

  public static getTypes(): BalloonType[] {
    return Object.keys(this.emojis) as BalloonType[];
  }
} 