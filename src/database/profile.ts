import { db } from "./db";

export type Profile = {
  id: number;
  name: string;
  birthday: string | null;
  avatar: string | null;
};

export function getProfile(): Profile | null {
  return db.getFirstSync(`SELECT * FROM profile WHERE id = 1`);
}

export function updateProfile(
  name: string,
  birthday: string | null,
  avatar?: string,
) {
  db.runSync(
    `UPDATE profile SET name = ?, birthday = ?, avatar = COALESCE(?, avatar) WHERE id = 1`,
    [name, birthday, avatar ?? null],
  );
}
