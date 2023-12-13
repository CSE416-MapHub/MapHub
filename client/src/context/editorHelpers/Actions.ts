import { Delta } from 'types/delta';

export class ActionStack {
  public stack: Array<Action> = [];
  public counterStack: Array<Action> = [];

  // public push(a: Action) {
  //   // wipe out the counterstack
  //   this.counterStack = [];
  //   a.do();
  //   this.stack.push(a);
  // }

  public canRedo(): boolean {
    return this.counterStack.length > 0;
  }

  // public redo() {
  //   if (this.canRedo()) {
  //     let a = this.counterStack.pop()!;
  //     a.do();
  //     this.stack.push(a);
  //   }
  // }

  public canUndo(): boolean {
    return this.stack.length > 0;
  }

  // public undo() {
  //   if (this.canUndo()) {
  //     let a = this.stack.pop()!;
  //     a.undo();
  //     this.counterStack.push(a);
  //   }
  // }

  public clone(): ActionStack {
    let nStack = new ActionStack();
    nStack.counterStack = structuredClone(this.counterStack);
    nStack.stack = structuredClone(this.stack);
    return nStack;
  }

  public peekStack(): Action | null {
    if (this.stack.length === 0) {
      return null;
    }
    return this.stack[this.stack.length - 1];
  }

  public peekCounterstack(): Action | null {
    if (this.counterStack.length === 0) {
      return null;
    }
    return this.counterStack[this.counterStack.length - 1];
  }
}

export interface Action {
  do: Delta;
  undo: Delta;
}
