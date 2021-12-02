export default function assert(
  condition: any,
  // Can provide a string, or a function that returns a string for cases where
  // the message takes a fair amount of effort to compute
  message?: any,
): asserts condition {
  if (condition) {
    return;
  } else {
      throw message ?? new Error('Invariant failed')
  }
}

type NumericEnum = Record<number, string>

export function isEnum<T>(value: unknown, testEnum: NumericEnum): value is T {
  return (
    typeof value === "number" && (value in testEnum)
  );
}
