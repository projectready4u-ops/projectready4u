# 🔴 CRITICAL FIX: RLS Policy Issue Preventing Approvals

## Problem Identified
The approval system is **completely broken** due to missing RLS (Row Level Security) policies. When you click "Approve" in the admin panel:
- ✅ The API returns "success"
- ✅ An email gets sent
- ❌ **But the database is NOT updated** - status stays "pending" and students can't download

## Root Cause
The `project_requests` table RLS configuration only has:
- ✅ INSERT policy (allows creating new requests)
- ❌ Missing SELECT policy
- ❌ Missing UPDATE policy

When the approval code tries to UPDATE the request status, **Supabase silently blocks it** due to RLS restrictions.

## Solution - Run This SQL Now

**Go to:**
1. Supabase Dashboard → Your Project → SQL Editor
2. Create a NEW query (don't modify existing)
3. Copy and paste this SQL:

```sql
-- Fix RLS policies for project_requests table
-- Add SELECT policy
CREATE POLICY "requests_select" ON project_requests FOR SELECT USING (true);

-- Add UPDATE policy  
CREATE POLICY "requests_update" ON project_requests FOR UPDATE USING (true) WITH CHECK (true);
```

4. Click "Run" (⏵ button)
5. You should see ✅ "Success. No rows returned"

## Verify the Fix Works

After running the SQL above:

1. Go to Admin → Requests page
2. Click Approve on any pending request
3. You should see: "✅ Request approved! Email sent with repository access."
4. Wait 2-3 seconds for the list to refresh
5. The request status should now show as "✅" (approved) with "Download ready"
6. An email will be sent to the student with the download link

## What Changed
- Updated `database_schema.sql` to include SELECT and UPDATE policies
- This prevents the issue from happening again on fresh deployments

## Current Database Status
**All 7 requests are still "pending"** because they were never successfully approved. Once you run the SQL fix above, you can approve them again and they will actually work.

---

## After Fix - How the Flow Works:

1. **Admin approves request** → API updates database to status='approved'
2. **Download link set** → Stored with 30-day expiry
3. **Email sent to student** → Contains download button with `/api/download?requestId=xxx`
4. **Student clicks download** → Browser redirects to GitHub ZIP file
5. **Download logged** → Tracked in downloads table for analytics

---

## Need Help?
If you have issues after running this SQL, check:
- Did the SQL run without errors?
- Are there 2 new policies in Supabase dashboard?
- Try approving a request again
- Check browser console for errors

This is the **final blocking issue** for the download system to work! 🎯
