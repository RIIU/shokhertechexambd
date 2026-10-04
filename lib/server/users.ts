import "server-only";
import { store } from "./store";
import { newId } from "./ids";
import { hashPassword, verifyPassword } from "./password";
import type { Level, PublicUser, StreamId, User } from "@/lib/types";

export function toPublicUser({ passwordHash: _hash, ...user }: User): PublicUser {
  return user;
}

export async function findUserByPhone(phone: string): Promise<User | undefined> {
  return (await store()).findUserByPhone(phone);
}

export async function getUser(id: string): Promise<User | undefined> {
  return (await store()).getUser(id);
}

export async function createStudent(input: {
  name: string;
  phone: string;
  password: string;
  level: Level;
  stream: StreamId;
  institution?: string;
}): Promise<User | "phone-taken"> {
  const user: User = {
    id: newId("usr"),
    name: input.name,
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
    role: "student",
    level: input.level,
    stream: input.stream,
    institution: input.institution || undefined,
    createdAt: Date.now(),
  };
  const res = await (await store()).insertUser(user);
  return res === "ok" ? user : res;
}

export async function listUsers(): Promise<PublicUser[]> {
  return (await (await store()).listUsers()).map(toPublicUser);
}

export async function updateUser(id: string, patch: Partial<User>): Promise<User | undefined> {
  const s = await store();
  await s.updateUser(id, patch);
  return s.getUser(id);
}

export async function changePassword(id: string, oldPass: string, newPass: string): Promise<"ok" | "wrong-password" | "not-found"> {
  const s = await store();
  const user = await s.getUser(id);
  if (!user) return "not-found";
  const ok = await verifyPassword(oldPass, user.passwordHash);
  if (!ok) return "wrong-password";
  const newHash = await hashPassword(newPass);
  await s.updateUser(id, { passwordHash: newHash });
  return "ok";
}

export async function setUserBlocked(id: string, blocked: boolean): Promise<void> {
  const s = await store();
  const user = await s.getUser(id);
  if (user && user.role !== "admin") await s.setUserBlocked(id, blocked);
}
