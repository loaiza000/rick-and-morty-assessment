/**
 * Method decorator that logs the execution time of async methods to the console.
 * Usage: apply @LogExecutionTime above any class method.
 */
export function LogExecutionTime(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const start = performance.now();
    try {
      const result = await originalMethod.apply(this, args);
      const duration = (performance.now() - start).toFixed(2);
      console.log(`[Perf] ${target.constructor.name}.${propertyKey} executed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      console.log(`[Perf] ${target.constructor.name}.${propertyKey} failed after ${duration}ms`);
      throw error;
    }
  };

  return descriptor;
}
