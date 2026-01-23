Chapter 64. Write Ahead Logging for
Extensions
Certain extensions, principally extensions that implement custom access methods, may need to per-
form write-ahead logging in order to ensure crash-safety. PostgreSQL provides two ways for exten-
sions to achieve this goal.
First, extensions can choose to use generic WAL, a special type of WAL record which describes
changes to pages in a generic way. This method is simple to implement and does not require that
an extension library be loaded in order to apply the records. However, generic WAL records will be
ignored when performing logical decoding.
Second, extensions can choose to use a custom resource manager. This method is more flexible, sup-
ports logical decoding, and can sometimes generate much smaller write-ahead log records than would
be possible with generic WAL. However, it is more complex for an extension to implement.
64.1. Generic WAL Records
Although all built-in WAL-logged modules have their own types of WAL records, there is also a
generic WAL record type, which describes changes to pages in a generic way.
Note
Generic WAL records are ignored during Logical Decoding. If logical decoding is required
for your extension, consider a Custom WAL Resource Manager.
The API for constructing generic WAL records is defined in access/generic_xlog.h and im-
plemented in access/transam/generic_xlog.c.
To perform a WAL-logged data update using the generic WAL record facility, follow these steps:
1. state = GenericXLogStart(relation) — start construction of a generic WAL record
for the given relation.
2. page = GenericXLogRegisterBuffer(state, buffer, flags) — register a
buffer to be modified within the current generic WAL record. This function returns a pointer to
```
a temporary copy of the buffer's page, where modifications should be made. (Do not modify the
```
```
buffer's contents directly.) The third argument is a bit mask of flags applicable to the operation.
```
Currently the only such flag is GENERIC_XLOG_FULL_IMAGE, which indicates that a full-page
image rather than a delta update should be included in the WAL record. Typically this flag would
be set if the page is new or has been rewritten completely. GenericXLogRegisterBuffer
can be repeated if the WAL-logged action needs to modify multiple pages.
3. Apply modifications to the page images obtained in the previous step.
4. GenericXLogFinish(state) — apply the changes to the buffers and emit the generic WAL
record.
WAL record construction can be canceled between any of the above steps by calling GenericXLo-
```
gAbort(state). This will discard all changes to the page image copies.
```
Please note the following points when using the generic WAL record facility:
• No direct modifications of buffers are allowed! All modifications must be done in copies ac-
```
quired from GenericXLogRegisterBuffer(). In other words, code that makes generic
```
```
WAL records should never call BufferGetPage() for itself. However, it remains the caller's
```
2579
Write Ahead Logging for Extensions
responsibility to pin/unpin and lock/unlock the buffers at appropriate times. Exclusive lock must be
```
held on each target buffer from before GenericXLogRegisterBuffer() until after Gener-
```
```
icXLogFinish().
```
```
• Registrations of buffers (step 2) and modifications of page images (step 3) can be mixed freely, i.e.,
```
both steps may be repeated in any sequence. Keep in mind that buffers should be registered in the
same order in which locks are to be obtained on them during replay.
• The maximum number of buffers that can be registered for a generic WAL record is MAX_GEN-
ERIC_XLOG_PAGES. An error will be thrown if this limit is exceeded.
• Generic WAL assumes that the pages to be modified have standard layout, and in particular that
there is no useful data between pd_lower and pd_upper.
```
• Since you are modifying copies of buffer pages, GenericXLogStart() does not start a crit-
```
ical section. Thus, you can safely do memory allocation, error throwing, etc. between Gener-
```
icXLogStart() and GenericXLogFinish(). The only actual critical section is present
```
```
inside GenericXLogFinish(). There is no need to worry about calling GenericXLo-
```
```
gAbort() during an error exit, either.
```
```
• GenericXLogFinish() takes care of marking buffers dirty and setting their LSNs. You do not
```
need to do this explicitly.
• For unlogged relations, everything works the same except that no actual WAL record is emitted.
Thus, you typically do not need to do any explicit checks for unlogged relations.
• The generic WAL redo function will acquire exclusive locks to buffers in the same order as they
were registered. After redoing all changes, the locks will be released in the same order.
• If GENERIC_XLOG_FULL_IMAGE is not specified for a registered buffer, the generic WAL record
contains a delta between the old and the new page images. This delta is based on byte-by-byte
comparison. This is not very compact for the case of moving data within a page, and might be
improved in the future.
64.2. Custom WAL Resource Managers
This section explains the interface between the core PostgreSQL system and custom WAL resource
managers, which enable extensions to integrate directly with the WAL.
An extension, especially a Table Access Method or Index Access Method, may need to use WAL for
recovery, replication, and/or Logical Decoding.
To create a new custom WAL resource manager, first define an RmgrData structure with implemen-
tations for the resource manager methods. Refer to src/backend/access/transam/README
and src/include/access/xlog_internal.h in the PostgreSQL source.
/*
- Method table for resource managers.
*
- This struct must be kept in sync with the PG_RMGR definition in
- rmgr.c.
*
- rm_identify must return a name for the record based on xl_info
```
(without
```
- reference to the rmid). For example, XLOG_BTREE_VACUUM would be
named
- "VACUUM". rm_desc can then be called to obtain additional detail
for the
- record, if available (e.g. the last block).
2580
Write Ahead Logging for Extensions
*
- rm_mask takes as input a page modified by the resource manager
and masks
- out bits that shouldn't be flagged by wal_consistency_checking.
*
- RmgrTable[] is indexed by RmgrId values (see rmgrlist.h). If
rm_name is
- NULL, the corresponding RmgrTable entry is considered invalid.
*/
typedef struct RmgrData
```
{
```
```
const char *rm_name;
```
```
void (*rm_redo) (XLogReaderState *record);
```
```
void (*rm_desc) (StringInfo buf, XLogReaderState
```
```
*record);
```
```
const char *(*rm_identify) (uint8 info);
```
```
void (*rm_startup) (void);
```
```
void (*rm_cleanup) (void);
```
```
void (*rm_mask) (char *pagedata, BlockNumber blkno);
```
```
void (*rm_decode) (struct LogicalDecodingContext *ctx,
```
```
struct XLogRecordBuffer *buf);
```
```
} RmgrData;
```
The src/test/modules/test_custom_rmgrs module contains a working example, which
demonstrates usage of custom WAL resource managers.
Then, register your new resource manager.
/*
- Register a new custom WAL resource manager.
*
- Resource manager IDs must be globally unique across all
extensions. Refer
- to https://wiki.postgresql.org/wiki/CustomWALResourceManagers to
reserve a
- unique RmgrId for your extension, to avoid conflicts with other
extension
- developers. During development, use RM_EXPERIMENTAL_ID to avoid
needlessly
- reserving a new ID.
*/
```
extern void RegisterCustomRmgr(RmgrId rmid, const RmgrData *rmgr);
```
RegisterCustomRmgr must be called from the extension module's _PG_init function. While de-
veloping a new extension, use RM_EXPERIMENTAL_ID for rmid. When you are ready to release the
extension to users, reserve a new resource manager ID at the Custom WAL Resource Manager1 page.
Place the extension module implementing the custom resource manager in shared_preload_libraries
so that it will be loaded early during PostgreSQL startup.
Note
The extension must remain in shared_preload_libraries as long as any custom WAL
records may exist in the system. Otherwise PostgreSQL will not be able to apply or decode
the custom WAL records, which may prevent the server from starting.
1 https://wiki.postgresql.org/wiki/CustomWALResourceManagers
2581
