# Import Error Fix Summary

## Problem

When trying to import data from `families.csv`, the following error occurred:

```
Import failed: Invalid "tx.gift.createMany()" invocation
Unknown argument "firstName". Available options are marked with ?.
```

## Root Cause

The issue was a **migration drift** between the schema, database, and migration history:

1. **Schema had the fields**: [`prisma/schema.prisma`](prisma/schema.prisma:60-61) included `firstName` and `lastName` in the Gift model
2. **Database had the columns**: Added via `prisma db push`
3. **Migration history was missing**: The initial migration ([`prisma/migrations/20260104142907_init/migration.sql`](prisma/migrations/20260104142907_init/migration.sql:29-40)) didn't include these columns
4. **Prisma Client was out of sync**: The client library wasn't regenerated after the database changes

This mismatch caused the import function in [`lib/actions/import.ts`](lib/actions/import.ts:44-45) to fail because Prisma couldn't properly validate the schema.

## Solution Steps

### 1. Regenerated Prisma Client

```bash
npx prisma generate
```

This regenerated the Prisma client to match the current schema.

### 2. Synced Database Schema

```bash
npx prisma db push
```

This pushed the schema changes to the database, adding the `firstName` and `lastName` columns.

### 3. Created Migration File

Created [`prisma/migrations/20260104214259_add_first_name_last_name_to_gift/migration.sql`](prisma/migrations/20260104214259_add_first_name_last_name_to_gift/migration.sql:1-3) to properly track the schema change:

```sql
-- AlterTable
ALTER TABLE "Gift" ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;
```

### 4. Marked Migration as Applied

```bash
npx prisma migrate resolve --applied "20260104214259_add_first_name_last_name_to_gift"
```

This resolved the migration drift by marking the manually-applied changes as part of the migration history.

### 5. Cleared Next.js Cache

```bash
rm -rf .next
```

Cleared the Next.js build cache to ensure the regenerated Prisma client is picked up.

## Result

✅ Database schema is up to date with migration history
✅ Prisma client is properly generated with `firstName` and `lastName` fields
✅ Migration history is consistent with database state
✅ The import function will now work correctly

## How the Import Works

The import process in [`lib/actions/import.ts`](lib/actions/import.ts:18-65):

1. Parses the CSV file using the format in [`components/admin/import-csv-dialog.tsx`](components/admin/import-csv-dialog.tsx:43-118)
2. Creates families with aliases from the "Family" column
3. Creates gifts for each family member from the "Wishlist / Items" column
4. Includes `firstName` and `lastName` from the "First name" and "Last name" columns
5. Includes sizes in the gift description

## CSV Format

The `families.csv` file uses the "Adopt format" with columns:

- First name
- Last name
- Family (required - used to group family members)
- Role / Age (e.g., "Dad", "Mom", "Boy 12")
- Sizes (added to gift description)
- Wishlist / Items (comma-separated list of gift items)

Each wishlist item becomes a separate gift record with the person's name attached.

## Important Notes

- **Always run `npx prisma generate`** after schema changes
- **Use `npx prisma migrate dev`** for development instead of `prisma db push` when possible
- **Clear Next.js cache** (`rm -rf .next`) after Prisma client regeneration
- **Restart dev server** after clearing cache to pick up changes
