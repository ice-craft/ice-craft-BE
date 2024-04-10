import Database from "better-sqlite3";

export const db = new Database("./DB/mafia.db", { verbose: console.log });
