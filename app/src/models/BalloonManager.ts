export type BalloonType = 'red' | 'green' | 'blue';

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