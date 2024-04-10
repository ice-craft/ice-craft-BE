import { db } from "../DB/db";

db.pragma("journal_mode = WAL");
