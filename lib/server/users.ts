import "server-only";
import { mutateDb, newId, readDb } from "./db";
import { hashPassword } from "./password";
import type { Level, PublicUser, StreamId, User } from "@/lib/types";

export function toPublicUser({ passwordHash: _hash, ...user }: User): PublicUser {
  return user;
}

export async function findUserByPhone(phone: string): Promise<User | undefined> {
  return (await readDb()).users.find((u) => u.phone === phone);
}

export async function getUser(id: string): Promise<User | undefined> {
  return (await readDb()).users.find((u) => u.id === id);
}

export async function createStudent(input: {
  name: string;
  phone: string;
  password: string;
  level: Level;
  stream: StreamId;
  institution?: string;
}): Promise<User | "phone-taken"> {
  const passwordHash = await hashPassword(input.password);
  return mutateDb((db) => {
    if (db.users.some((u) => u.phone === input.phone)) return "phone-taken" as const;
    const user: User = {
      id: newId("usr"),
      name: input.name,
      phone: input.phone,
      passwordHash,
      role: "student",
      level: input.level,
      stream: input.stream,
      institution: input.institution || undefined,
      createdAt: Date.now(),
    };
    db.users.push(user);
    return user;
  });
}

export async function listUsers(): Promise<PublicUser[]> {
  return (await readDb()).users.map(toPublicUser).sort((a, b) => b.createdAt - a.createdAt);
}

export async function setUserBlocked(id: string, blocked: boolean): Promise<void> {
  await mutateDb((db) => {
    const user = db.users.find((u) => u.id === id);
    if (user && user.role !== "admin") user.blocked = blocked;
  });
}
