export interface UseCaseProvider<Input, Output> {
  execute(input: Input): Promise<Output>;
}