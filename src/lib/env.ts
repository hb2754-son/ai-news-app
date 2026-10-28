// 필수 환경변수를 읽고, 없으면 어떤 값이 빠졌는지 알려주며 실패한다.
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
  }
  return value;
}
