export interface ICommand {
  validate(): string | null;
  execute(): void;
}