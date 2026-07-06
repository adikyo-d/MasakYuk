import * as SQLite from "expo-sqlite";
console.log("SQLite version:");
export const db = SQLite.openDatabaseSync("masakyuk.db");
