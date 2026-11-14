// Keep identifiers unchanged: comments explain the contract.
interface Person { readonly name: string; age: number }
export class User implements Person {
  readonly name = "Ada";
  age = 42;
  /** Format a visible label. */
  greet(value: string): string {
    const label = this.name;
    if (value.length > 0) {
      return label + value;
    }
    return "empty";
  }
}
const user = new User();
user.greet("hello");
