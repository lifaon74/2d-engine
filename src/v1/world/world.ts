/*
  Similar to the DOM
*/

let WORLD_ELEMENT_CREATION_ALLOWED: boolean = false;

function createWorldElement<GElement extends WorldElement>(create: () => GElement): GElement {
  const allowed: boolean = WORLD_ELEMENT_CREATION_ALLOWED;
  try {
    WORLD_ELEMENT_CREATION_ALLOWED = true;
    return create();
  } finally {
    WORLD_ELEMENT_CREATION_ALLOWED = allowed;
  }
}

export class WorldElement {
  readonly #world: World;

  constructor(world: World) {
    if (!WORLD_ELEMENT_CREATION_ALLOWED) {
      throw new Error('Cannot directly create a WorldElement.');
    }
    this.#world = world;
  }

  get world(): World {
    return this.#world;
  }
}

/*--*/

export class PositionedWorldElement extends WorldElement {
  readonly #x: number;
  readonly #y: number;
  readonly #z: number;

  constructor(world: World) {
    super(world);
  }
}

/*--*/

export class WorldRadialSound extends WorldElement {}

/*------------*/

export class World {
  #viewportWidth: number;
  #viewportHeight: number;
  #viewportX: number;
  #viewportY: number;

  readonly #elements: Set<WorldElement>;

  constructor() {
    this.#viewportWidth = window.innerWidth;
    this.#viewportHeight = window.innerHeight;
    this.#viewportX = 0;
    this.#viewportY = 0;
    this.#elements = new Set<WorldElement>();
  }

  get viewportWidth(): number {
    return this.#viewportWidth;
  }

  get viewportHeight(): number {
    return this.#viewportHeight;
  }

  setViewportSize(width: number, height: number): this {
    this.#viewportWidth = width;
    this.#viewportHeight = height;
    return this;
  }

  get viewportX(): number {
    return this.#viewportX;
  }

  get viewportY(): number {
    return this.#viewportY;
  }

  setViewportPosition(x: number, y: number): this {
    this.#viewportX = x;
    this.#viewportY = y;
    return this;
  }

  /* ELEMENTS */

  createRadialSound(): WorldRadialSound {
    return createWorldElement(() => new WorldRadialSound(this));
  }

  insertElement<GWorldElement extends WorldElement>(element: GWorldElement): GWorldElement {
    this.#elements.add(element);
    return element;
  }

  removeElement<GWorldElement extends WorldElement>(element: GWorldElement): GWorldElement {
    this.#elements.delete(element);
    return element;
  }
}
