import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { delimiter, join } from "node:path";

const env = { ...process.env };
const programFiles = env.ProgramW6432 || env.ProgramFiles || "C:\\Program Files";
const microsoftRoot = join(programFiles, "Microsoft");
const installedJdks = existsSync(microsoftRoot)
  ? readdirSync(microsoftRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^jdk-21.*-hotspot$/i.test(entry.name))
    .map(entry => join(microsoftRoot, entry.name))
  : [];
const javaCandidates = [
  ...installedJdks,
  env.JAVA_HOME,
  join(programFiles, "Android", "Android Studio", "jbr")
];

if (!env.JAVA_HOME) {
  const javaHome = javaCandidates.find(candidate =>
    candidate && existsSync(join(candidate, "bin", process.platform === "win32" ? "java.exe" : "java"))
  );
  if (javaHome) env.JAVA_HOME = javaHome;
}

const sdkRoot = env.ANDROID_SDK_ROOT || env.ANDROID_HOME ||
  (env.LOCALAPPDATA ? join(env.LOCALAPPDATA, "Android", "Sdk") : undefined);
if (sdkRoot) {
  env.ANDROID_HOME = sdkRoot;
  env.ANDROID_SDK_ROOT = sdkRoot;
}
if (env.JAVA_HOME) env.PATH = `${join(env.JAVA_HOME, "bin")}${delimiter}${env.PATH || ""}`;

const isWindows = process.platform === "win32";
const result = spawnSync(
  isWindows ? "cmd.exe" : "./gradlew",
  isWindows ? ["/d", "/s", "/c", "gradlew.bat assembleDebug"] : ["assembleDebug"],
  {
  cwd: "android",
  env,
  stdio: "inherit"
  }
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
