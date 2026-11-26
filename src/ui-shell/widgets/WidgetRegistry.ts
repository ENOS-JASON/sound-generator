export const widgetIds = ['rpm', 'waveform'] as const;
export type WidgetId = (typeof widgetIds)[number];

export interface WidgetPlacement {
  readonly x: number;
  readonly y: number;
  readonly shown: boolean;
}

export class WidgetRegistry {
  #width = 1024;
  #height = 768;
  #hidden = false;
  #placements: Record<WidgetId, WidgetPlacement> = {
    rpm: { x: 16, y: 240, shown: false },
    waveform: { x: 280, y: 240, shown: false },
  };

  snapshot() {
    return Object.freeze({
      schemaVersion: 1 as const,
      hidden: this.#hidden,
      placements: Object.freeze({
        rpm: Object.freeze({ ...this.#placements.rpm }),
        waveform: Object.freeze({ ...this.#placements.waveform }),
      }),
    });
  }

  visible(id: WidgetId): boolean {
    return !this.#hidden && this.#placements[id].shown;
  }

  show(id: WidgetId, shown: boolean): void {
    this.#placements[id] = { ...this.#placements[id], shown };
  }

  hideAll(hidden: boolean): void {
    this.#hidden = hidden;
  }

  resize(width: number, height: number): void {
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      throw new RangeError('invalid viewport');
    }
    this.#width = width;
    this.#height = height;
    for (const id of widgetIds) {
      const { x, y } = this.#placements[id];
      this.move(id, x, y);
    }
  }

  move(id: WidgetId, x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new RangeError('invalid widget position');
    }
    this.#placements[id] = {
      ...this.#placements[id],
      x: Math.max(0, Math.min(Math.round(x), this.#width - 260)),
      y: Math.max(0, Math.min(Math.round(y), this.#height - 180)),
    };
  }

  reset(): void {
    this.move('rpm', 16, 240);
    this.move('waveform', 280, 240);
  }
}
