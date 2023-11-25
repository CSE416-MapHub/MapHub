export class ActionStack {
  private stack: Array<Action> = [];
  private counterStack: Array<Action> = [];

  public push(a: Action) {
    // wipe out the counterstack
    this.counterStack = [];
    a.do();
    this.stack.push(a);
  }

  public canRedo(): boolean {
    return this.counterStack.length > 0;
  }

  public redo() {
    if (this.canRedo()) {
      let a = this.counterStack.pop()!;
      a.do();
      this.stack.push(a);
    }
  }

  public canUndo(): boolean {
    return this.stack.length > 0;
  }

  public undo() {
    if (this.canUndo()) {
      let a = this.stack.pop()!;
      a.undo();
      this.counterStack.push(a);
    }
  }
}

export interface Action {
  do: () => void;
  undo: () => void;
}
