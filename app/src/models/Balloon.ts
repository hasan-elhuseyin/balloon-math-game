import { BalloonType, BalloonManager } from './BalloonManager';

export class Balloon {
  private _x: number;
  private _y: number;
  private _type: BalloonType;
  private _velocity?: { x: number; y: number };

  constructor(x: number, y: number, type: BalloonType, velocity?: { x: number; y: number }) {
    this._x = x;
    this._y = y;
    this._type = type;
    this._velocity = velocity;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(BalloonManager.getEmoji(this._type), this._x, this._y);
  }

  // ... existing methods ...
} 