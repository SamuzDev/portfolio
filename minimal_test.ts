export async function test(): Promise<void> {
  await new Promise<void>((resolve) => {
    resolve();
  });
  
  return {
    a: 1,
  };
}
