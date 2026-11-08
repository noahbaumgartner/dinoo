-- Printers now print through ePOS-Print over HTTPS (ADR-009). The column default moves to 443 in
-- the Drizzle schema only: rebuilding the table would need foreign keys off, which SQLite ignores
-- inside the migration transaction, and the app always sets the port explicitly.
UPDATE `printers` SET `port` = 443 WHERE `port` = 9100;
