import { Command } from './Command';

export class CompositeCommand implements Command {
  public readonly description: string;
  private commands: Command[];

  constructor(description: string, commands: Command[]) {
    this.description = description;
    this.commands = commands;
  }

  public execute(): void {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }

  public undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}
