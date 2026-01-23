Chapter 29. Logical Replication
Logical replication is a method of replicating data objects and their changes, based upon their replica-
```
tion identity (usually a primary key). We use the term logical in contrast to physical replication, which
```
uses exact block addresses and byte-by-byte replication. PostgreSQL supports both mechanisms con-
currently, see Chapter 26. Logical replication allows fine-grained control over both data replication
and security.
Logical replication uses a publish and subscribe model with one or more subscribers subscribing to one
or more publications on a publisher node. Subscribers pull data from the publications they subscribe to
and may subsequently re-publish data to allow cascading replication or more complex configurations.
When logical replication of a table typically starts, PostgreSQL takes a snapshot of the table's data
on the publisher database and copies it to the subscriber. Once complete, changes on the publisher
since the initial copy are sent continually to the subscriber. The subscriber applies the data in the same
order as the publisher so that transactional consistency is guaranteed for publications within a single
subscription. This method of data replication is sometimes referred to as transactional replication.
The typical use-cases for logical replication are:
• Sending incremental changes in a single database or a subset of a database to subscribers as they
occur.
• Firing triggers for individual changes as they arrive on the subscriber.
```
• Consolidating multiple databases into a single one (for example for analytical purposes).
```
• Replicating between different major versions of PostgreSQL.
```
• Replicating between PostgreSQL instances on different platforms (for example Linux to Windows)
```
• Giving access to replicated data to different groups of users.
• Sharing a subset of the database between multiple databases.
The subscriber database behaves in the same way as any other PostgreSQL instance and can be used
as a publisher for other databases by defining its own publications. When the subscriber is treated as
read-only by application, there will be no conflicts from a single subscription. On the other hand, if
there are other writes done either by an application or by other subscribers to the same set of tables,
conflicts can arise.
29.1. Publication
A publication can be defined on any physical replication primary. The node where a publication is
defined is referred to as publisher. A publication is a set of changes generated from a table or a group
of tables, and might also be described as a change set or replication set. Each publication exists in
only one database.
Publications are different from schemas and do not affect how the table is accessed. Each table can be
added to multiple publications if needed. Publications may currently only contain tables and all tables
in schema. Objects must be added explicitly, except when a publication is created for ALL TABLES.
Publications can choose to limit the changes they produce to any combination of INSERT, UPDATE,
DELETE, and TRUNCATE, similar to how triggers are fired by particular event types. By default, all
```
operation types are replicated. These publication specifications apply only for DML operations; they
```
```
do not affect the initial data synchronization copy. (Row filters have no effect for TRUNCATE. See
```
```
Section 29.4).
```
Every publication can have multiple subscribers.
906
Logical Replication
A publication is created using the CREATE PUBLICATION command and may later be altered or
dropped using corresponding commands.
The individual tables can be added and removed dynamically using ALTER PUBLICATION. Both the
ADD TABLE and DROP TABLE operations are transactional, so the table will start or stop replicating
at the correct snapshot once the transaction has committed.
29.1.1. Replica Identity
A published table must have a replica identity configured in order to be able to replicate UPDATE and
DELETE operations, so that appropriate rows to update or delete can be identified on the subscriber
side.
```
By default, this is the primary key, if there is one. Another unique index (with certain additional
```
```
requirements) can also be set to be the replica identity. If the table does not have any suitable key,
```
then it can be set to replica identity FULL, which means the entire row becomes the key. When replica
identity FULL is specified, indexes can be used on the subscriber side for searching the rows. Candidate
```
indexes must be btree or hash, non-partial, and the leftmost index field must be a column (not an
```
```
expression) that references the published table column. These restrictions on the non-unique index
```
properties adhere to some of the restrictions that are enforced for primary keys. If there are no such
suitable indexes, the search on the subscriber side can be very inefficient, therefore replica identity
FULL should only be used as a fallback if no other solution is possible.
If a replica identity other than FULL is set on the publisher side, a replica identity comprising the same
or fewer columns must also be set on the subscriber side.
Tables with a replica identity defined as NOTHING, DEFAULT without a primary key, or USING IN-
DEX with a dropped index, cannot support UPDATE or DELETE operations when included in a pub-
lication replicating these actions. Attempting such operations will result in an error on the publisher.
INSERT operations can proceed regardless of any replica identity.
See ALTER TABLE...REPLICA IDENTITY for details on how to set the replica identity.
29.2. Subscription
A subscription is the downstream side of logical replication. The node where a subscription is defined
is referred to as the subscriber. A subscription defines the connection to another database and set of
```
publications (one or more) to which it wants to subscribe.
```
The subscriber database behaves in the same way as any other PostgreSQL instance and can be used
as a publisher for other databases by defining its own publications.
A subscriber node may have multiple subscriptions if desired. It is possible to define multiple sub-
scriptions between a single publisher-subscriber pair, in which case care must be taken to ensure that
the subscribed publication objects don't overlap.
```
Each subscription will receive changes via one replication slot (see Section 26.2.6). Additional repli-
```
cation slots may be required for the initial data synchronization of pre-existing table data and those
will be dropped at the end of data synchronization.
```
A logical replication subscription can be a standby for synchronous replication (see Section 26.2.8).
```
The standby name is by default the subscription name. An alternative name can be specified as ap-
plication_name in the connection information of the subscription.
Subscriptions are dumped by pg_dump if the current user is a superuser. Otherwise a warning is
written and subscriptions are skipped, because non-superusers cannot read all subscription information
from the pg_subscription catalog.
The subscription is added using CREATE SUBSCRIPTION and can be stopped/resumed at any time
using the ALTER SUBSCRIPTION command and removed using DROP SUBSCRIPTION.
907
Logical Replication
When a subscription is dropped and recreated, the synchronization information is lost. This means
that the data has to be resynchronized afterwards.
The schema definitions are not replicated, and the published tables must exist on the subscriber. Only
regular tables may be the target of replication. For example, you can't replicate to a view.
The tables are matched between the publisher and the subscriber using the fully qualified table name.
Replication to differently-named tables on the subscriber is not supported.
Columns of a table are also matched by name. The order of columns in the subscriber table does not
need to match that of the publisher. The data types of the columns do not need to match, as long as the
text representation of the data can be converted to the target type. For example, you can replicate from
a column of type integer to a column of type bigint. The target table can also have additional
columns not provided by the published table. Any such columns will be filled with the default value
as specified in the definition of the target table. However, logical replication in binary format is more
restrictive. See the binary option of CREATE SUBSCRIPTION for details.
29.2.1. Replication Slot Management
```
As mentioned earlier, each (active) subscription receives changes from a replication slot on the remote
```
```
(publishing) side.
```
Additional table synchronization slots are normally transient, created internally to perform initial table
synchronization and dropped automatically when they are no longer needed. These table synchroniza-
```
tion slots have generated names: “pg_%u_sync_%u_%llu” (parameters: Subscription oid, Table
```
```
relid, system identifier sysid)
```
Normally, the remote replication slot is created automatically when the subscription is created using
CREATE SUBSCRIPTION and it is dropped automatically when the subscription is dropped using
DROP SUBSCRIPTION. In some situations, however, it can be useful or necessary to manipulate the
subscription and the underlying replication slot separately. Here are some scenarios:
• When creating a subscription, the replication slot already exists. In that case, the subscription can
be created using the create_slot = false option to associate with the existing slot.
• When creating a subscription, the remote host is not reachable or in an unclear state. In that case,
the subscription can be created using the connect = false option. The remote host will then
not be contacted at all. This is what pg_dump uses. The remote replication slot will then have to be
created manually before the subscription can be activated.
• When dropping a subscription, the replication slot should be kept. This could be useful when the
subscriber database is being moved to a different host and will be activated from there. In that case,
disassociate the slot from the subscription using ALTER SUBSCRIPTION before attempting to
drop the subscription.
• When dropping a subscription, the remote host is not reachable. In that case, disassociate the slot
from the subscription using ALTER SUBSCRIPTION before attempting to drop the subscription.
If the remote database instance no longer exists, no further action is then necessary. If, however,
```
the remote database instance is just unreachable, the replication slot (and any still remaining table
```
```
synchronization slots) should then be dropped manually; otherwise it/they would continue to reserve
```
WAL and might eventually cause the disk to fill up. Such cases should be carefully investigated.
29.2.2. Examples: Set Up Logical Replication
Create some test tables on the publisher.
```
/* pub # */ CREATE TABLE t1(a int, b text, PRIMARY KEY(a));
```
```
/* pub # */ CREATE TABLE t2(c int, d text, PRIMARY KEY(c));
```
```
/* pub # */ CREATE TABLE t3(e int, f text, PRIMARY KEY(e));
```
908
Logical Replication
Create the same tables on the subscriber.
```
/* sub # */ CREATE TABLE t1(a int, b text, PRIMARY KEY(a));
```
```
/* sub # */ CREATE TABLE t2(c int, d text, PRIMARY KEY(c));
```
```
/* sub # */ CREATE TABLE t3(e int, f text, PRIMARY KEY(e));
```
Insert data to the tables at the publisher side.
```
/* pub # */ INSERT INTO t1 VALUES (1, 'one'), (2, 'two'), (3,
```
```
'three');
```
```
/* pub # */ INSERT INTO t2 VALUES (1, 'A'), (2, 'B'), (3, 'C');
```
```
/* pub # */ INSERT INTO t3 VALUES (1, 'i'), (2, 'ii'), (3, 'iii');
```
Create publications for the tables. The publications pub2 and pub3a disallow some publish op-
```
erations. The publication pub3b has a row filter (see Section 29.4).
```
```
/* pub # */ CREATE PUBLICATION pub1 FOR TABLE t1;
```
```
/* pub # */ CREATE PUBLICATION pub2 FOR TABLE t2 WITH (publish =
```
```
'truncate');
```
```
/* pub # */ CREATE PUBLICATION pub3a FOR TABLE t3 WITH (publish =
```
```
'truncate');
```
```
/* pub # */ CREATE PUBLICATION pub3b FOR TABLE t3 WHERE (e > 5);
```
Create subscriptions for the publications. The subscription sub3 subscribes to both pub3a and
pub3b. All subscriptions will copy initial data by default.
/* sub # */ CREATE SUBSCRIPTION sub1
/* sub - */ CONNECTION 'host=localhost dbname=test_pub
```
application_name=sub1'
```
```
/* sub - */ PUBLICATION pub1;
```
/* sub # */ CREATE SUBSCRIPTION sub2
/* sub - */ CONNECTION 'host=localhost dbname=test_pub
```
application_name=sub2'
```
```
/* sub - */ PUBLICATION pub2;
```
/* sub # */ CREATE SUBSCRIPTION sub3
/* sub - */ CONNECTION 'host=localhost dbname=test_pub
```
application_name=sub3'
```
```
/* sub - */ PUBLICATION pub3a, pub3b;
```
Observe that initial table data is copied, regardless of the publish operation of the publication.
```
/* sub # */ SELECT * FROM t1;
```
a | b
---+-------
1 | one
2 | two
3 | three
```
(3 rows)
```
```
/* sub # */ SELECT * FROM t2;
```
c | d
---+---
1 | A
2 | B
909
Logical Replication
3 | C
```
(3 rows)
```
Furthermore, because the initial data copy ignores the publish operation, and because publication
pub3a has no row filter, it means the copied table t3 contains all rows even when they do not match
the row filter of publication pub3b.
```
/* sub # */ SELECT * FROM t3;
```
e | f
---+-----
1 | i
2 | ii
3 | iii
```
(3 rows)
```
Insert more data to the tables at the publisher side.
```
/* pub # */ INSERT INTO t1 VALUES (4, 'four'), (5, 'five'), (6,
```
```
'six');
```
```
/* pub # */ INSERT INTO t2 VALUES (4, 'D'), (5, 'E'), (6, 'F');
```
```
/* pub # */ INSERT INTO t3 VALUES (4, 'iv'), (5, 'v'), (6, 'vi');
```
Now the publisher side data looks like:
```
/* pub # */ SELECT * FROM t1;
```
a | b
---+-------
1 | one
2 | two
3 | three
4 | four
5 | five
6 | six
```
(6 rows)
```
```
/* pub # */ SELECT * FROM t2;
```
c | d
---+---
1 | A
2 | B
3 | C
4 | D
5 | E
6 | F
```
(6 rows)
```
```
/* pub # */ SELECT * FROM t3;
```
e | f
---+-----
1 | i
2 | ii
3 | iii
4 | iv
5 | v
6 | vi
```
(6 rows)
```
910
Logical Replication
Observe that during normal replication the appropriate publish operations are used. This means
publications pub2 and pub3a will not replicate the INSERT. Also, publication pub3b will only
replicate data that matches the row filter of pub3b. Now the subscriber side data looks like:
```
/* sub # */ SELECT * FROM t1;
```
a | b
---+-------
1 | one
2 | two
3 | three
4 | four
5 | five
6 | six
```
(6 rows)
```
```
/* sub # */ SELECT * FROM t2;
```
c | d
---+---
1 | A
2 | B
3 | C
```
(3 rows)
```
```
/* sub # */ SELECT * FROM t3;
```
e | f
---+-----
1 | i
2 | ii
3 | iii
6 | vi
```
(4 rows)
```
29.2.3. Examples: Deferred Replication Slot Creation
```
There are some cases (e.g. Section 29.2.1) where, if the remote replication slot was not created au-
```
tomatically, the user must create it manually before the subscription can be activated. The steps to
create the slot and activate the subscription are shown in the following examples. These examples
```
specify the standard logical decoding output plugin (pgoutput), which is what the built-in logical
```
replication uses.
First, create a publication for the examples to use.
```
/* pub # */ CREATE PUBLICATION pub1 FOR ALL TABLES;
```
Example 1: Where the subscription says connect = false
• Create the subscription.
/* sub # */ CREATE SUBSCRIPTION sub1
/* sub - */ CONNECTION 'host=localhost dbname=test_pub'
/* sub - */ PUBLICATION pub1
```
/* sub - */ WITH (connect=false);
```
```
WARNING: subscription was created, but is not connected
```
```
HINT: To initiate replication, you must manually create the
```
replication slot, enable the subscription, and refresh the
subscription.
911
Logical Replication
• On the publisher, manually create a slot. Because the name was not specified during CREATE
SUBSCRIPTION, the name of the slot to create is same as the subscription name, e.g. "sub1".
/* pub # */ SELECT * FROM
```
pg_create_logical_replication_slot('sub1', 'pgoutput');
```
slot_name | lsn
-----------+-----------
sub1 | 0/19404D0
```
(1 row)
```
• On the subscriber, complete the activation of the subscription. After this the tables of pub1 will
start replicating.
```
/* sub # */ ALTER SUBSCRIPTION sub1 ENABLE;
```
```
/* sub # */ ALTER SUBSCRIPTION sub1 REFRESH PUBLICATION;
```
Example 2: Where the subscription says connect = false, but also specifies the slot_name
option.
• Create the subscription.
/* sub # */ CREATE SUBSCRIPTION sub1
/* sub - */ CONNECTION 'host=localhost dbname=test_pub'
/* sub - */ PUBLICATION pub1
```
/* sub - */ WITH (connect=false, slot_name='myslot');
```
```
WARNING: subscription was created, but is not connected
```
```
HINT: To initiate replication, you must manually create the
```
replication slot, enable the subscription, and refresh the
subscription.
• On the publisher, manually create a slot using the same name that was specified during CREATE
SUBSCRIPTION, e.g. "myslot".
/* pub # */ SELECT * FROM
```
pg_create_logical_replication_slot('myslot', 'pgoutput');
```
slot_name | lsn
-----------+-----------
myslot | 0/19059A0
```
(1 row)
```
• On the subscriber, the remaining subscription activation steps are the same as before.
```
/* sub # */ ALTER SUBSCRIPTION sub1 ENABLE;
```
```
/* sub # */ ALTER SUBSCRIPTION sub1 REFRESH PUBLICATION;
```
Example 3: Where the subscription specifies slot_name = NONE
• Create the subscription. When slot_name = NONE then enabled = false, and cre-
```
ate_slot = false are also needed.
```
/* sub # */ CREATE SUBSCRIPTION sub1
/* sub - */ CONNECTION 'host=localhost dbname=test_pub'
/* sub - */ PUBLICATION pub1
```
/* sub - */ WITH (slot_name=NONE, enabled=false,
```
```
create_slot=false);
```
912
Logical Replication
• On the publisher, manually create a slot using any name, e.g. "myslot".
/* pub # */ SELECT * FROM
```
pg_create_logical_replication_slot('myslot', 'pgoutput');
```
slot_name | lsn
-----------+-----------
myslot | 0/1905930
```
(1 row)
```
• On the subscriber, associate the subscription with the slot name just created.
```
/* sub # */ ALTER SUBSCRIPTION sub1 SET (slot_name='myslot');
```
• The remaining subscription activation steps are same as before.
```
/* sub # */ ALTER SUBSCRIPTION sub1 ENABLE;
```
```
/* sub # */ ALTER SUBSCRIPTION sub1 REFRESH PUBLICATION;
```
29.3. Logical Replication Failover
To allow subscriber nodes to continue replicating data from the publisher node even when the pub-
lisher node goes down, there must be a physical standby corresponding to the publisher node. The log-
ical slots on the primary server corresponding to the subscriptions can be synchronized to the stand-
by server by specifying failover = true when creating subscriptions. See Section 47.2.3 for
details. Enabling the failover parameter ensures a seamless transition of those subscriptions after
the standby is promoted. They can continue subscribing to publications on the new primary server.
Because the slot synchronization logic copies asynchronously, it is necessary to confirm that replica-
tion slots have been synced to the standby server before the failover happens. To ensure a successful
failover, the standby server must be ahead of the subscriber. This can be achieved by configuring
synchronized_standby_slots.
To confirm that the standby server is indeed ready for failover for a given subscriber, follow these
steps to verify that all the logical replication slots required by that subscriber have been synchronized
to the standby server:
1. On the subscriber node, use the following SQL to identify which replication slots should be
synced to the standby that we plan to promote. This query will return the relevant replication
slots associated with the failover-enabled subscriptions.
/* sub # */ SELECT
```
array_agg(quote_literal(s.subslotname)) AS slots
```
FROM pg_subscription s
WHERE s.subfailover AND
```
s.subslotname IS NOT NULL;
```
slots
-------
```
{'sub1','sub2','sub3'}
```
```
(1 row)
```
2. On the subscriber node, use the following SQL to identify which table synchronization slots
should be synced to the standby that we plan to promote. This query needs to be run on each
```
database that includes the failover-enabled subscription(s). Note that the table sync slot should be
```
```
synced to the standby server only if the table copy is finished (See Section 52.55). We don't need
```
to ensure that the table sync slots are synced in other scenarios as they will either be dropped or
re-created on the new primary server in those cases.
913
Logical Replication
/* sub # */ SELECT
```
array_agg(quote_literal(slot_name)) AS slots
```
FROM
```
(
```
```
SELECT CONCAT('pg_', srsubid, '_sync_', srrelid,
```
```
'_', ctl.system_identifier) AS slot_name
```
```
FROM pg_control_system() ctl,
```
pg_subscription_rel r, pg_subscription s
WHERE r.srsubstate = 'f' AND s.oid = r.srsubid
AND s.subfailover
```
);
```
slots
-------
```
{'pg_16394_sync_16385_7394666715149055164'}
```
```
(1 row)
```
3. Check that the logical replication slots identified above exist on the standby server and are ready
for failover.
```
/* standby # */ SELECT slot_name, (synced AND NOT temporary AND
```
```
invalidation_reason IS NULL) AS failover_ready
```
FROM pg_replication_slots
WHERE slot_name IN
```
('sub1','sub2','sub3',
```
```
'pg_16394_sync_16385_7394666715149055164');
```
slot_name | failover_ready
--------------------------------------------+----------------
sub1 | t
sub2 | t
sub3 | t
pg_16394_sync_16385_7394666715149055164 | t
```
(4 rows)
```
```
If all the slots are present on the standby server and the result (failover_ready) of the above
```
SQL query is true, then existing subscriptions can continue subscribing to publications on the new
primary server.
The first two steps in the above procedure are meant for a PostgreSQL subscriber. It is recommended
to run these steps on each subscriber node, that will be served by the designated standby after failover,
to obtain the complete list of replication slots. This list can then be verified in Step 3 to ensure failover
readiness. Non-PostgreSQL subscribers, on the other hand, may use their own methods to identify the
replication slots used by their respective subscriptions.
In some cases, such as during a planned failover, it is necessary to confirm that all subscribers, whether
PostgreSQL or non-PostgreSQL, will be able to continue replication after failover to a given standby
server. In such cases, use the following SQL, instead of performing the first two steps above, to identify
which replication slots on the primary need to be synced to the standby that is intended for promotion.
This query returns the relevant replication slots associated with all the failover-enabled subscriptions.
```
/* primary # */ SELECT array_agg(quote_literal(r.slot_name)) AS
```
slots
FROM pg_replication_slots r
```
WHERE r.failover AND NOT r.temporary;
```
slots
-------
914
Logical Replication
```
{'sub1','sub2','sub3', 'pg_16394_sync_16385_7394666715149055164'}
```
```
(1 row)
```
29.4. Row Filters
By default, all data from all published tables will be replicated to the appropriate subscribers. The
replicated data can be reduced by using a row filter. A user might choose to use row filters for behav-
ioral, security or performance reasons. If a published table sets a row filter, a row is replicated only
if its data satisfies the row filter expression. This allows a set of tables to be partially replicated. The
row filter is defined per table. Use a WHERE clause after the table name for each published table that
requires data to be filtered out. The WHERE clause must be enclosed by parentheses. See CREATE
PUBLICATION for details.
29.4.1. Row Filter Rules
Row filters are applied before publishing the changes. If the row filter evaluates to false or NULL
then the row is not replicated. The WHERE clause expression is evaluated with the same role used
```
for the replication connection (i.e. the role specified in the CONNECTION clause of the CREATE
```
```
SUBSCRIPTION). Row filters have no effect for TRUNCATE command.
```
29.4.2. Expression Restrictions
The WHERE clause allows only simple expressions. It cannot contain user-defined functions, operators,
types, and collations, system column references or non-immutable built-in functions.
If a publication publishes UPDATE or DELETE operations, the row filter WHERE clause must contain
```
only columns that are covered by the replica identity (see REPLICA IDENTITY). If a publication
```
publishes only INSERT operations, the row filter WHERE clause can use any column.
29.4.3. UPDATE Transformations
Whenever an UPDATE is processed, the row filter expression is evaluated for both the old and new
```
row (i.e. using the data before and after the update). If both evaluations are true, it replicates the
```
UPDATE change. If both evaluations are false, it doesn't replicate the change. If only one of the
old/new rows matches the row filter expression, the UPDATE is transformed to INSERT or DELETE,
to avoid any data inconsistency. The row on the subscriber should reflect what is defined by the row
filter expression on the publisher.
```
If the old row satisfies the row filter expression (it was sent to the subscriber) but the new row doesn't,
```
then, from a data consistency perspective the old row should be removed from the subscriber. So the
UPDATE is transformed into a DELETE.
```
If the old row doesn't satisfy the row filter expression (it wasn't sent to the subscriber) but the new
```
row does, then, from a data consistency perspective the new row should be added to the subscriber.
So the UPDATE is transformed into an INSERT.
Table 29.1 summarizes the applied transformations.
Table 29.1. UPDATE Transformation Summary
Old row New row Transformation
no match no match don't replicate
no match match INSERT
match no match DELETE
match match UPDATE
915
Logical Replication
29.4.4. Partitioned Tables
If the publication contains a partitioned table, the publication parameter publish_via_parti-
tion_root determines which row filter is used. If publish_via_partition_root is true,
the root partitioned table's row filter is used. Otherwise, if publish_via_partition_root is
```
false (default), each partition's row filter is used.
```
29.4.5. Initial Data Synchronization
If the subscription requires copying pre-existing table data and a publication contains WHERE clauses,
only data that satisfies the row filter expressions is copied to the subscriber.
If the subscription has several publications in which a table has been published with different WHERE
clauses, rows that satisfy any of the expressions will be copied. See Section 29.4.6 for details.
Warning
Because initial data synchronization does not take into account the publish parameter when
copying existing table data, some rows may be copied that would not be replicated using DML.
Refer to Section 29.9.1, and see Section 29.2.2 for examples.
Note
If the subscriber is in a release prior to 15, copy pre-existing data doesn't use row filters even
if they are defined in the publication. This is because old releases can only copy the entire
table data.
29.4.6. Combining Multiple Row Filters
If the subscription has several publications in which the same table has been published with different
```
row filters (for the same publish operation), those expressions get ORed together, so that rows
```
satisfying any of the expressions will be replicated. This means all the other row filters for the same
table become redundant if:
• One of the publications has no row filter.
• One of the publications was created using FOR ALL TABLES. This clause does not allow row
filters.
• One of the publications was created using FOR TABLES IN SCHEMA and the table belongs to
the referred schema. This clause does not allow row filters.
29.4.7. Examples
Create some tables to be used in the following examples.
```
/* pub # */ CREATE TABLE t1(a int, b int, c text, PRIMARY
```
```
KEY(a,c));
```
```
/* pub # */ CREATE TABLE t2(d int, e int, f int, PRIMARY KEY(d));
```
```
/* pub # */ CREATE TABLE t3(g int, h int, i int, PRIMARY KEY(g));
```
```
Create some publications. Publication p1 has one table (t1) and that table has a row filter. Publication
```
p2 has two tables. Table t1 has no row filter, and table t2 has a row filter. Publication p3 has two
tables, and both of them have a row filter.
916
Logical Replication
```
/* pub # */ CREATE PUBLICATION p1 FOR TABLE t1 WHERE (a > 5 AND c =
```
```
'NSW');
```
```
/* pub # */ CREATE PUBLICATION p2 FOR TABLE t1, t2 WHERE (e = 99);
```
```
/* pub # */ CREATE PUBLICATION p3 FOR TABLE t2 WHERE (d = 10), t3
```
```
WHERE (g = 10);
```
```
psql can be used to show the row filter expressions (if defined) for each publication.
```
/* pub # */ \dRp+
Publication p1
Owner | All tables | Inserts | Updates | Deletes | Truncates |
Generated columns | Via root
----------+------------+---------+---------+---------+-----------
+-------------------+----------
postgres | f | t | t | t | t |
none | f
```
Tables:
```
```
"public.t1" WHERE ((a > 5) AND (c = 'NSW'::text))
```
Publication p2
Owner | All tables | Inserts | Updates | Deletes | Truncates |
Generated columns | Via root
----------+------------+---------+---------+---------+-----------
+-------------------+----------
postgres | f | t | t | t | t |
none | f
```
Tables:
```
"public.t1"
```
"public.t2" WHERE (e = 99)
```
Publication p3
Owner | All tables | Inserts | Updates | Deletes | Truncates |
Generated columns | Via root
----------+------------+---------+---------+---------+-----------
+-------------------+----------
postgres | f | t | t | t | t |
none | f
```
Tables:
```
```
"public.t2" WHERE (d = 10)
```
```
"public.t3" WHERE (g = 10)
```
```
psql can be used to show the row filter expressions (if defined) for each table. See that table t1 is
```
a member of two publications, but has a row filter only in p1. See that table t2 is a member of two
publications, and has a different row filter in each of them.
/* pub # */ \d t1
Table "public.t1"
Column | Type | Collation | Nullable | Default
--------+---------+-----------+----------+---------
a | integer | | not null |
b | integer | | |
c | text | | not null |
```
Indexes:
```
```
"t1_pkey" PRIMARY KEY, btree (a, c)
```
```
Publications:
```
```
"p1" WHERE ((a > 5) AND (c = 'NSW'::text))
```
917
Logical Replication
"p2"
/* pub # */ \d t2
Table "public.t2"
Column | Type | Collation | Nullable | Default
--------+---------+-----------+----------+---------
d | integer | | not null |
e | integer | | |
f | integer | | |
```
Indexes:
```
```
"t2_pkey" PRIMARY KEY, btree (d)
```
```
Publications:
```
```
"p2" WHERE (e = 99)
```
```
"p3" WHERE (d = 10)
```
/* pub # */ \d t3
Table "public.t3"
Column | Type | Collation | Nullable | Default
--------+---------+-----------+----------+---------
g | integer | | not null |
h | integer | | |
i | integer | | |
```
Indexes:
```
```
"t3_pkey" PRIMARY KEY, btree (g)
```
```
Publications:
```
```
"p3" WHERE (g = 10)
```
On the subscriber node, create a table t1 with the same definition as the one on the publisher, and
also create the subscription s1 that subscribes to the publication p1.
```
/* sub # */ CREATE TABLE t1(a int, b int, c text, PRIMARY
```
```
KEY(a,c));
```
/* sub # */ CREATE SUBSCRIPTION s1
/* sub - */ CONNECTION 'host=localhost dbname=test_pub
```
application_name=s1'
```
```
/* sub - */ PUBLICATION p1;
```
Insert some rows. Only the rows satisfying the t1 WHERE clause of publication p1 are replicated.
```
/* pub # */ INSERT INTO t1 VALUES (2, 102, 'NSW');
```
```
/* pub # */ INSERT INTO t1 VALUES (3, 103, 'QLD');
```
```
/* pub # */ INSERT INTO t1 VALUES (4, 104, 'VIC');
```
```
/* pub # */ INSERT INTO t1 VALUES (5, 105, 'ACT');
```
```
/* pub # */ INSERT INTO t1 VALUES (6, 106, 'NSW');
```
```
/* pub # */ INSERT INTO t1 VALUES (7, 107, 'NT');
```
```
/* pub # */ INSERT INTO t1 VALUES (8, 108, 'QLD');
```
```
/* pub # */ INSERT INTO t1 VALUES (9, 109, 'NSW');
```
```
/* pub # */ SELECT * FROM t1;
```
a | b | c
---+-----+-----
2 | 102 | NSW
3 | 103 | QLD
4 | 104 | VIC
5 | 105 | ACT
6 | 106 | NSW
7 | 107 | NT
918
Logical Replication
8 | 108 | QLD
9 | 109 | NSW
```
(8 rows)
```
```
/* sub # */ SELECT * FROM t1;
```
a | b | c
---+-----+-----
6 | 106 | NSW
9 | 109 | NSW
```
(2 rows)
```
Update some data, where the old and new row values both satisfy the t1 WHERE clause of publication
p1. The UPDATE replicates the change as normal.
```
/* pub # */ UPDATE t1 SET b = 999 WHERE a = 6;
```
```
/* pub # */ SELECT * FROM t1;
```
a | b | c
---+-----+-----
2 | 102 | NSW
3 | 103 | QLD
4 | 104 | VIC
5 | 105 | ACT
7 | 107 | NT
8 | 108 | QLD
9 | 109 | NSW
6 | 999 | NSW
```
(8 rows)
```
```
/* sub # */ SELECT * FROM t1;
```
a | b | c
---+-----+-----
9 | 109 | NSW
6 | 999 | NSW
```
(2 rows)
```
Update some data, where the old row values did not satisfy the t1 WHERE clause of publication p1,
but the new row values do satisfy it. The UPDATE is transformed into an INSERT and the change is
replicated. See the new row on the subscriber.
```
/* pub # */ UPDATE t1 SET a = 555 WHERE a = 2;
```
```
/* pub # */ SELECT * FROM t1;
```
a | b | c
-----+-----+-----
3 | 103 | QLD
4 | 104 | VIC
5 | 105 | ACT
7 | 107 | NT
8 | 108 | QLD
9 | 109 | NSW
6 | 999 | NSW
555 | 102 | NSW
```
(8 rows)
```
919
Logical Replication
```
/* sub # */ SELECT * FROM t1;
```
a | b | c
-----+-----+-----
9 | 109 | NSW
6 | 999 | NSW
555 | 102 | NSW
```
(3 rows)
```
Update some data, where the old row values satisfied the t1 WHERE clause of publication p1, but
the new row values do not satisfy it. The UPDATE is transformed into a DELETE and the change is
replicated. See that the row is removed from the subscriber.
```
/* pub # */ UPDATE t1 SET c = 'VIC' WHERE a = 9;
```
```
/* pub # */ SELECT * FROM t1;
```
a | b | c
-----+-----+-----
3 | 103 | QLD
4 | 104 | VIC
5 | 105 | ACT
7 | 107 | NT
8 | 108 | QLD
6 | 999 | NSW
555 | 102 | NSW
9 | 109 | VIC
```
(8 rows)
```
```
/* sub # */ SELECT * FROM t1;
```
a | b | c
-----+-----+-----
6 | 999 | NSW
555 | 102 | NSW
```
(2 rows)
```
The following examples show how the publication parameter publish_via_partition_root
determines whether the row filter of the parent or child table will be used in the case of partitioned
tables.
Create a partitioned table on the publisher.
```
/* pub # */ CREATE TABLE parent(a int PRIMARY KEY) PARTITION BY
```
```
RANGE(a);
```
```
/* pub # */ CREATE TABLE child PARTITION OF parent DEFAULT;
```
Create the same tables on the subscriber.
```
/* sub # */ CREATE TABLE parent(a int PRIMARY KEY) PARTITION BY
```
```
RANGE(a);
```
```
/* sub # */ CREATE TABLE child PARTITION OF parent DEFAULT;
```
Create a publication p4, and then subscribe to it. The publication parameter publish_via_par-
```
tition_root is set as true. There are row filters defined on both the partitioned table (parent),
```
```
and on the partition (child).
```
920
Logical Replication
```
/* pub # */ CREATE PUBLICATION p4 FOR TABLE parent WHERE (a < 5),
```
```
child WHERE (a >= 5)
```
```
/* pub - */ WITH (publish_via_partition_root=true);
```
/* sub # */ CREATE SUBSCRIPTION s4
/* sub - */ CONNECTION 'host=localhost dbname=test_pub
```
application_name=s4'
```
```
/* sub - */ PUBLICATION p4;
```
Insert some values directly into the parent and child tables. They replicate using the row filter of
```
parent (because publish_via_partition_root is true).
```
```
/* pub # */ INSERT INTO parent VALUES (2), (4), (6);
```
```
/* pub # */ INSERT INTO child VALUES (3), (5), (7);
```
```
/* pub # */ SELECT * FROM parent ORDER BY a;
```
a
---
2
3
4
5
6
7
```
(6 rows)
```
```
/* sub # */ SELECT * FROM parent ORDER BY a;
```
a
---
2
3
4
```
(3 rows)
```
Repeat the same test, but with a different value for publish_via_partition_root. The pub-
lication parameter publish_via_partition_root is set as false. A row filter is defined on the
```
partition (child).
```
```
/* pub # */ DROP PUBLICATION p4;
```
```
/* pub # */ CREATE PUBLICATION p4 FOR TABLE parent, child WHERE (a
```
```
>= 5)
```
```
/* pub - */ WITH (publish_via_partition_root=false);
```
```
/* sub # */ ALTER SUBSCRIPTION s4 REFRESH PUBLICATION;
```
```
Do the inserts on the publisher same as before. They replicate using the row filter of child (because
```
```
publish_via_partition_root is false).
```
```
/* pub # */ TRUNCATE parent;
```
```
/* pub # */ INSERT INTO parent VALUES (2), (4), (6);
```
```
/* pub # */ INSERT INTO child VALUES (3), (5), (7);
```
```
/* pub # */ SELECT * FROM parent ORDER BY a;
```
921
Logical Replication
a
---
2
3
4
5
6
7
```
(6 rows)
```
```
/* sub # */ SELECT * FROM child ORDER BY a;
```
a
---
5
6
7
```
(3 rows)
```
29.5. Column Lists
Each publication can optionally specify which columns of each table are replicated to subscribers.
The table on the subscriber side must have at least all the columns that are published. If no column
list is specified, then all columns on the publisher are replicated. See CREATE PUBLICATION for
details on the syntax.
The choice of columns can be based on behavioral or performance reasons. However, do not rely
on this feature for security: a malicious subscriber is able to obtain data from columns that are not
specifically published. If security is a consideration, protections can be applied at the publisher side.
If no column list is specified, any columns added to the table later are automatically replicated. This
means that having a column list which names all columns is not the same as having no column list at all.
A column list can contain only simple column references. The order of columns in the list is not
preserved.
Generated columns can also be specified in a column list. This allows generated columns to be
published, regardless of the publication parameter publish_generated_columns. See Sec-
tion 29.6 for details.
Specifying a column list when the publication also publishes FOR TABLES IN SCHEMA is not
supported.
For partitioned tables, the publication parameter publish_via_partition_root determines
which column list is used. If publish_via_partition_root is true, the root partitioned ta-
```
ble's column list is used. Otherwise, if publish_via_partition_root is false (the default),
```
each partition's column list is used.
If a publication publishes UPDATE or DELETE operations, any column list must include the table's
```
replica identity columns (see REPLICA IDENTITY). If a publication publishes only INSERT oper-
```
ations, then the column list may omit replica identity columns.
Column lists have no effect for the TRUNCATE command.
During initial data synchronization, only the published columns are copied. However, if the subscriber
is from a release prior to 15, then all the columns in the table are copied during initial data synchro-
nization, ignoring any column lists. If the subscriber is from a release prior to 18, then initial table
synchronization won't copy generated columns even if they are defined in the publisher.
922
Logical Replication
```
Warning: Combining Column
```
Lists from Multiple Publications
There's currently no support for subscriptions comprising several publications where the same
table has been published with different column lists. CREATE SUBSCRIPTION disallows
creating such subscriptions, but it is still possible to get into that situation by adding or altering
column lists on the publication side after a subscription has been created.
This means changing the column lists of tables on publications that are already subscribed
could lead to errors being thrown on the subscriber side.
If a subscription is affected by this problem, the only way to resume replication is to adjust
```
one of the column lists on the publication side so that they all match; and then either recreate
```
the subscription, or use ALTER SUBSCRIPTION ... DROP PUBLICATION to remove
one of the offending publications and add it again.
29.5.1. Examples
Create a table t1 to be used in the following example.
```
/* pub # */ CREATE TABLE t1(id int, a text, b text, c text, d text,
```
```
e text, PRIMARY KEY(id));
```
Create a publication p1. A column list is defined for table t1 to reduce the number of columns that
will be replicated. Notice that the order of column names in the column list does not matter.
```
/* pub # */ CREATE PUBLICATION p1 FOR TABLE t1 (id, b, a, d);
```
```
psql can be used to show the column lists (if defined) for each publication.
```
/* pub # */ \dRp+
Publication p1
Owner | All tables | Inserts | Updates | Deletes | Truncates |
Generated columns | Via root
----------+------------+---------+---------+---------+-----------
+-------------------+----------
postgres | f | t | t | t | t |
none | f
```
Tables:
```
```
"public.t1" (id, a, b, d)
```
```
psql can be used to show the column lists (if defined) for each table.
```
/* pub # */ \d t1
Table "public.t1"
Column | Type | Collation | Nullable | Default
--------+---------+-----------+----------+---------
id | integer | | not null |
a | text | | |
b | text | | |
c | text | | |
d | text | | |
e | text | | |
923
Logical Replication
```
Indexes:
```
```
"t1_pkey" PRIMARY KEY, btree (id)
```
```
Publications:
```
```
"p1" (id, a, b, d)
```
On the subscriber node, create a table t1 which now only needs a subset of the columns that were on
the publisher table t1, and also create the subscription s1 that subscribes to the publication p1.
```
/* sub # */ CREATE TABLE t1(id int, b text, a text, d text, PRIMARY
```
```
KEY(id));
```
/* sub # */ CREATE SUBSCRIPTION s1
/* sub - */ CONNECTION 'host=localhost dbname=test_pub
```
application_name=s1'
```
```
/* sub - */ PUBLICATION p1;
```
On the publisher node, insert some rows to table t1.
```
/* pub # */ INSERT INTO t1 VALUES(1, 'a-1', 'b-1', 'c-1', 'd-1',
```
```
'e-1');
```
```
/* pub # */ INSERT INTO t1 VALUES(2, 'a-2', 'b-2', 'c-2', 'd-2',
```
```
'e-2');
```
```
/* pub # */ INSERT INTO t1 VALUES(3, 'a-3', 'b-3', 'c-3', 'd-3',
```
```
'e-3');
```
```
/* pub # */ SELECT * FROM t1 ORDER BY id;
```
id | a | b | c | d | e
----+-----+-----+-----+-----+-----
1 | a-1 | b-1 | c-1 | d-1 | e-1
2 | a-2 | b-2 | c-2 | d-2 | e-2
3 | a-3 | b-3 | c-3 | d-3 | e-3
```
(3 rows)
```
Only data from the column list of publication p1 is replicated.
```
/* sub # */ SELECT * FROM t1 ORDER BY id;
```
id | b | a | d
----+-----+-----+-----
1 | b-1 | a-1 | d-1
2 | b-2 | a-2 | d-2
3 | b-3 | a-3 | d-3
```
(3 rows)
```
29.6. Generated Column Replication
Typically, a table at the subscriber will be defined the same as the publisher table, so if the publisher
table has a GENERATED column then the subscriber table will have a matching generated column.
In this case, it is always the subscriber table generated column value that is used.
For example, note below that subscriber table generated column value comes from the subscriber
column's calculation.
```
/* pub # */ CREATE TABLE tab_gen_to_gen (a int, b int GENERATED
```
```
ALWAYS AS (a + 1) STORED);
```
```
/* pub # */ INSERT INTO tab_gen_to_gen VALUES (1),(2),(3);
```
```
/* pub # */ CREATE PUBLICATION pub1 FOR TABLE tab_gen_to_gen;
```
```
/* pub # */ SELECT * FROM tab_gen_to_gen;
```
924
Logical Replication
a | b
---+---
1 | 2
2 | 3
3 | 4
```
(3 rows)
```
```
/* sub # */ CREATE TABLE tab_gen_to_gen (a int, b int GENERATED
```
```
ALWAYS AS (a * 100) STORED);
```
/* sub # */ CREATE SUBSCRIPTION sub1 CONNECTION 'dbname=test_pub'
```
PUBLICATION pub1;
```
```
/* sub # */ SELECT * from tab_gen_to_gen;
```
a | b
---+----
1 | 100
2 | 200
3 | 300
```
(3 rows)
```
In fact, prior to version 18.0, logical replication does not publish GENERATED columns at all.
But, replicating a generated column to a regular column can sometimes be desirable.
Tip
This feature may be useful when replicating data to a non-PostgreSQL database via output
plugin, especially if the target database does not support generated columns.
Generated columns are not published by default, but users can opt to publish stored generated columns
just like regular ones.
There are two ways to do this:
• Set the PUBLICATION parameter publish_generated_columns to stored. This in-
structs PostgreSQL logical replication to publish current and future stored generated columns of
the publication's tables.
• Specify a table column list to explicitly nominate which stored generated columns will be published.
Note
When determining which table columns will be published, a column list takes precedence,
overriding the effect of the publish_generated_columns parameter.
The following table summarizes behavior when there are generated columns involved in the logical
replication. Results are shown for when publishing generated columns is not enabled, and for when
it is enabled.
Table 29.2. Replication Result Summary
Publish generated
columns?
Publisher table col-
umn
Subscriber table col-
umn
Result
No GENERATED GENERATED Publisher table column
is not replicated. Use
the subscriber table
925
Logical Replication
Publish generated
columns?
Publisher table col-
umn
Subscriber table col-
umn
Result
generated column val-
ue.
No GENERATED regular Publisher table column
is not replicated. Use
the subscriber table
regular column default
value.
No GENERATED --missing-- Publisher table column
is not replicated. Noth-
ing happens.
Yes GENERATED GENERATED ERROR. Not support-
ed.
Yes GENERATED regular Publisher table column
value is replicated to
the subscriber table col-
umn.
Yes GENERATED --missing-- ERROR. The column
is reported as missing
from the subscriber ta-
ble.
Warning
There's currently no support for subscriptions comprising several publications where the same
table has been published with different column lists. See Section 29.5.
This same situation can occur if one publication is publishing generated columns, while anoth-
er publication in the same subscription is not publishing generated columns for the same table.
Note
If the subscriber is from a release prior to 18, then initial table synchronization won't copy
generated columns even if they are defined in the publisher.
29.7. Conflicts
Logical replication behaves similarly to normal DML operations in that the data will be updated even if
it was changed locally on the subscriber node. If incoming data violates any constraints the replication
will stop. This is referred to as a conflict. When replicating UPDATE or DELETE operations, missing
data is also considered as a conflict, but does not result in an error and such operations will simply
be skipped.
```
Additional logging is triggered, and the conflict statistics are collected (displayed in the pg_s-
```
```
tat_subscription_stats view) in the following conflict cases:
```
insert_exists
Inserting a row that violates a NOT DEFERRABLE unique constraint. Note that to log the origin
and commit timestamp details of the conflicting key, track_commit_timestamp should
926
Logical Replication
be enabled on the subscriber. In this case, an error will be raised until the conflict is resolved
manually.
update_origin_differs
Updating a row that was previously modified by another origin. Note that this conflict can only
be detected when track_commit_timestamp is enabled on the subscriber. Currently, the
update is always applied regardless of the origin of the local row.
update_exists
The updated value of a row violates a NOT DEFERRABLE unique constraint. Note that to log
the origin and commit timestamp details of the conflicting key, track_commit_timestamp
should be enabled on the subscriber. In this case, an error will be raised until the conflict is resolved
manually. Note that when updating a partitioned table, if the updated row value satisfies another
partition constraint resulting in the row being inserted into a new partition, the insert_exists
conflict may arise if the new row violates a NOT DEFERRABLE unique constraint.
update_missing
The row to be updated was not found. The update will simply be skipped in this scenario.
delete_origin_differs
Deleting a row that was previously modified by another origin. Note that this conflict can only
be detected when track_commit_timestamp is enabled on the subscriber. Currently, the
delete is always applied regardless of the origin of the local row.
delete_missing
The row to be deleted was not found. The delete will simply be skipped in this scenario.
multiple_unique_conflicts
Inserting or updating a row violates multiple NOT DEFERRABLE unique constraints. Note that
to log the origin and commit timestamp details of conflicting keys, ensure that track_com-
mit_timestamp is enabled on the subscriber. In this case, an error will be raised until the
conflict is resolved manually.
Note that there are other conflict scenarios, such as exclusion constraint violations. Currently, we do
not provide additional details for them in the log.
The log format for logical replication conflicts is as follows:
```
LOG: conflict detected on relation "schemaname.tablename":
```
```
conflict=conflict_type
```
```
DETAIL: detailed_explanation.
```
```
{detail_values [; ... ]}.
```
where detail_values is one of:
```
Key (column_name [, ...])=(column_value [, ...])
```
```
existing local row [(column_name [, ...])=](column_value
```
```
[, ...])
```
```
remote row [(column_name [, ...])=](column_value [, ...])
```
```
replica identity {(column_name [, ...])=(column_value [, ...])
```
```
| full [(column_name [, ...])=](column_value [, ...])}
```
The log provides the following information:
927
Logical Replication
LOG
• schemaname.tablename identifies the local relation involved in the conflict.
```
• conflict_type is the type of conflict that occurred (e.g., insert_exists, up-
```
```
date_exists).
```
DETAIL
• detailed_explanation includes the origin, transaction ID, and commit timestamp of the
transaction that modified the existing local row, if available.
• The Key section includes the key values of the local row that violated a unique constraint for
insert_exists, update_exists or multiple_unique_conflicts conflicts.
• The existing local row section includes the local row if its origin differs from the
remote row for update_origin_differs or delete_origin_differs conflicts, or
if the key value conflicts with the remote row for insert_exists, update_exists or
multiple_unique_conflicts conflicts.
• The remote row section includes the new row from the remote insert or update operation
that caused the conflict. Note that for an update operation, the column value of the new row
will be null if the value is unchanged and toasted.
• The replica identity section includes the replica identity key values that were used to
search for the existing local row to be updated or deleted. This may include the full row value
if the local relation is marked with REPLICA IDENTITY FULL.
• column_name is the column name. For existing local row, remote row, and
replica identity full cases, column names are logged only if the user lacks the
privilege to access all columns of the table. If column names are present, they appear in the
same order as the corresponding column values.
• column_value is the column value. The large column values are truncated to 64 bytes.
• Note that in case of multiple_unique_conflicts conflict, multiple detailed_ex-
planation and detail_values lines will be generated, each detailing the conflict infor-
mation associated with distinct unique constraints.
Logical replication operations are performed with the privileges of the role which owns the subscrip-
tion. Permissions failures on target tables will cause replication conflicts, as will enabled row-level
security on target tables that the subscription owner is subject to, without regard to whether any policy
would ordinarily reject the INSERT, UPDATE, DELETE or TRUNCATE which is being replicated.
This restriction on row-level security may be lifted in a future version of PostgreSQL.
```
A conflict that produces an error will stop the replication; it must be resolved manually by the user.
```
Details about the conflict can be found in the subscriber's server log.
The resolution can be done either by changing data or permissions on the subscriber so that it does not
conflict with the incoming change or by skipping the transaction that conflicts with the existing data.
When a conflict produces an error, the replication won't proceed, and the logical replication worker
will emit the following kind of message to the subscriber's server log:
```
ERROR: conflict detected on relation "public.test":
```
```
conflict=insert_exists
```
```
DETAIL: Key already exists in unique index "t_pkey", which
```
was modified locally in transaction 740 at 2024-06-26
10:47:04.727375+08.
```
Key (c)=(1); existing local row (1, 'local'); remote row (1,
```
```
'remote').
```
928
Logical Replication
```
CONTEXT: processing remote data for replication origin "pg_16395"
```
during "INSERT" for replication target relation "public.test" in
transaction 725 finished at 0/14C0378
The LSN of the transaction that contains the change violating the constraint and the replication origin
```
name can be found from the server log (LSN 0/14C0378 and replication origin pg_16395 in the
```
```
above case). The transaction that produced the conflict can be skipped by using ALTER SUBSCRIP-
```
```
TION ... SKIP with the finish LSN (i.e., LSN 0/14C0378). The finish LSN could be an LSN at
```
which the transaction is committed or prepared on the publisher. Alternatively, the transaction can also
```
be skipped by calling the pg_replication_origin_advance() function. Before using this
```
function, the subscription needs to be disabled temporarily either by ALTER SUBSCRIPTION ...
DISABLE or, the subscription can be used with the disable_on_error option. Then, you can use
```
pg_replication_origin_advance() function with the node_name (i.e., pg_16395) and
```
```
the next LSN of the finish LSN (i.e., 0/14C0379). The current position of origins can be seen in the
```
pg_replication_origin_status system view. Please note that skipping the whole transac-
tion includes skipping changes that might not violate any constraint. This can easily make the sub-
scriber inconsistent. The additional details regarding conflicting rows, such as their origin and commit
timestamp can be seen in the DETAIL line of the log. But note that this information is only available
when track_commit_timestamp is enabled on the subscriber. Users can use this information to
decide whether to retain the local change or adopt the remote alteration. For instance, the DETAIL
line in the above log indicates that the existing row was modified locally. Users can manually perform
a remote-change-win.
When the streaming mode is parallel, the finish LSN of failed transactions may not be logged.
In that case, it may be necessary to change the streaming mode to on or off and cause the same
conflicts again so the finish LSN of the failed transaction will be written to the server log. For the
usage of finish LSN, please refer to ALTER SUBSCRIPTION ... SKIP.
29.8. Restrictions
Logical replication currently has the following restrictions or missing functionality. These might be
addressed in future releases.
• The database schema and DDL commands are not replicated. The initial schema can be copied by
hand using pg_dump --schema-only. Subsequent schema changes would need to be kept in
```
sync manually. (Note, however, that there is no need for the schemas to be absolutely the same
```
```
on both sides.) Logical replication is robust when schema definitions change in a live database:
```
When the schema is changed on the publisher and replicated data starts arriving at the subscriber but
does not fit into the table schema, replication will error until the schema is updated. In many cases,
intermittent errors can be avoided by applying additive schema changes to the subscriber first.
• Sequence data is not replicated. The data in serial or identity columns backed by sequences will of
course be replicated as part of the table, but the sequence itself would still show the start value on
the subscriber. If the subscriber is used as a read-only database, then this should typically not be a
problem. If, however, some kind of switchover or failover to the subscriber database is intended,
then the sequences would need to be updated to the latest values, either by copying the current data
```
from the publisher (perhaps using pg_dump) or by determining a sufficiently high value from the
```
tables themselves.
• Replication of TRUNCATE commands is supported, but some care must be taken when truncating
groups of tables connected by foreign keys. When replicating a truncate action, the subscriber will
truncate the same group of tables that was truncated on the publisher, either explicitly specified or
implicitly collected via CASCADE, minus tables that are not part of the subscription. This will work
correctly if all affected tables are part of the same subscription. But if some tables to be truncated
```
on the subscriber have foreign-key links to tables that are not part of the same (or any) subscription,
```
then the application of the truncate action on the subscriber will fail.
```
• Large objects (see Chapter 33) are not replicated. There is no workaround for that, other than storing
```
data in normal tables.
929
Logical Replication
• Replication is only supported by tables, including partitioned tables. Attempts to replicate other
types of relations, such as views, materialized views, or foreign tables, will result in an error.
• When replicating between partitioned tables, the actual replication originates, by default, from the
leaf partitions on the publisher, so partitions on the publisher must also exist on the subscriber as
```
valid target tables. (They could either be leaf partitions themselves, or they could be further sub-
```
```
partitioned, or they could even be independent tables.) Publications can also specify that changes
```
are to be replicated using the identity and schema of the partitioned root table instead of that of
```
the individual leaf partitions in which the changes actually originate (see publish_via_par-
```
```
tition_root parameter of CREATE PUBLICATION).
```
• When using REPLICA IDENTITY FULL on published tables, it is important to note that the
UPDATE and DELETE operations cannot be applied to subscribers if the tables include attributes
```
with datatypes (such as point or box) that do not have a default operator class for B-tree or Hash.
```
However, this limitation can be overcome by ensuring that the table has a primary key or replica
identity defined for it.
29.9. Architecture
```
Logical replication is built with an architecture similar to physical streaming replication (see Sec-
```
```
tion 26.2.5). It is implemented by walsender and apply processes. The walsender process starts
```
```
logical decoding (described in Chapter 47) of the WAL and loads the standard logical decoding output
```
```
plugin (pgoutput). The plugin transforms the changes read from WAL to the logical replication
```
```
protocol (see Section 54.5) and filters the data according to the publication specification. The data
```
is then continuously transferred using the streaming replication protocol to the apply worker, which
maps the data to local tables and applies the individual changes as they are received, in correct trans-
actional order.
The apply process on the subscriber database always runs with session_replication_role
set to replica. This means that, by default, triggers and rules will not fire on a subscriber. Users
can optionally choose to enable triggers and rules on a table using the ALTER TABLE command and
the ENABLE TRIGGER and ENABLE RULE clauses.
The logical replication apply process currently only fires row triggers, not statement triggers. The
initial table synchronization, however, is implemented like a COPY command and thus fires both row
and statement triggers for INSERT.
29.9.1. Initial Snapshot
The initial data in existing subscribed tables are snapshotted and copied in parallel instances of a special
kind of apply process. These special apply processes are dedicated table synchronization workers,
spawned for each table to be synchronized. Each table synchronization process will create its own
replication slot and copy the existing data. As soon as the copy is finished the table contents will
become visible to other backends. Once existing data is copied, the worker enters synchronization
mode, which ensures that the table is brought up to a synchronized state with the main apply process
by streaming any changes that happened during the initial data copy using standard logical replication.
During this synchronization phase, the changes are applied and committed in the same order as they
happened on the publisher. Once synchronization is done, control of the replication of the table is
given back to the main apply process where replication continues as normal.
Note
The publication publish parameter only affects what DML operations will be replicated.
The initial data synchronization does not take this parameter into account when copying the
existing table data.
930
Logical Replication
Note
If a table synchronization worker fails during copy, the apply worker detects the failure and
respawns the table synchronization worker to continue the synchronization process. This be-
haviour ensures that transient errors do not permanently disrupt the replication setup. See also
wal_retrieve_retry_interval.
29.10. Monitoring
Because logical replication is based on a similar architecture as physical streaming replication, the
```
monitoring on a publication node is similar to monitoring of a physical replication primary (see Sec-
```
```
tion 26.2.5.2).
```
The monitoring information about subscription is visible in pg_stat_subscription. This view
contains one row for every subscription worker. A subscription can have zero or more active subscrip-
tion workers depending on its state.
Normally, there is a single apply process running for an enabled subscription. A disabled subscription
or a crashed subscription will have zero rows in this view. If the initial data synchronization of any
table is in progress, there will be additional workers for the tables being synchronized. Moreover, if
the streaming transaction is applied in parallel, there may be additional parallel apply workers.
29.11. Security
```
The role used for the replication connection must have the REPLICATION attribute (or be a supe-
```
```
ruser). If the role lacks SUPERUSER and BYPASSRLS, publisher row security policies can execute.
```
If the role does not trust all table owners, include options=-crow_security=off in the con-
```
nection string; if a table owner then adds a row security policy, that setting will cause replication to
```
halt rather than execute the policy. Access for the role must be configured in pg_hba.conf and it
must have the LOGIN attribute.
In order to be able to copy the initial table data, the role used for the replication connection must have
```
the SELECT privilege on a published table (or be a superuser).
```
To create a publication, the user must have the CREATE privilege in the database.
To add tables to a publication, the user must have ownership rights on the table. To add all tables in
schema to a publication, the user must be a superuser. To create a publication that publishes all tables
or all tables in schema automatically, the user must be a superuser.
```
There are currently no privileges on publications. Any subscription (that is able to connect) can access
```
any publication. Thus, if you intend to hide some information from particular subscribers, such as by
using row filters or column lists, or by not adding the whole table to the publication, be aware that
other publications in the same database could expose the same information. Publication privileges
might be added to PostgreSQL in the future to allow for finer-grained access control.
To create a subscription, the user must have the privileges of the pg_create_subscription
role, as well as CREATE privileges on the database.
The subscription apply process will, at a session level, run with the privileges of the subscription
owner. However, when performing an insert, update, delete, or truncate operation on a particular table,
it will switch roles to the table owner and perform the operation with the table owner's privileges. This
means that the subscription owner needs to be able to SET ROLE to each role that owns a replicated
table.
931
Logical Replication
If the subscription has been configured with run_as_owner = true, then no user switching will
occur. Instead, all operations will be performed with the permissions of the subscription owner. In
this case, the subscription owner only needs privileges to SELECT, INSERT, UPDATE, and DELETE
from the target table, and does not need privileges to SET ROLE to the table owner. However, this
also means that any user who owns a table into which replication is happening can execute arbitrary
code with the privileges of the subscription owner. For example, they could do this by simply attaching
a trigger to one of the tables which they own. Because it is usually undesirable to allow one role to
freely assume the privileges of another, this option should be avoided unless user security within the
database is of no concern.
On the publisher, privileges are only checked once at the start of a replication connection and are not
re-checked as each change record is read.
On the subscriber, the subscription owner's privileges are re-checked for each transaction when ap-
plied. If a worker is in the process of applying a transaction when the ownership of the subscription
is changed by a concurrent transaction, the application of the current transaction will continue under
the old owner's privileges.
29.12. Configuration Settings
Logical replication requires several configuration options to be set. These options are relevant only
on one side of the replication.
29.12.1. Publishers
wal_level must be set to logical.
max_replication_slots must be set to at least the number of subscriptions expected to connect,
plus some reserve for table synchronization.
Logical replication slots are also affected by idle_replication_slot_timeout.
max_wal_senders should be set to at least the same as max_replication_slots, plus the
number of physical replicas that are connected at the same time.
Logical replication walsender is also affected by wal_sender_timeout.
29.12.2. Subscribers
max_active_replication_origins must be set to at least the number of subscriptions that
will be added to the subscriber, plus some reserve for table synchronization.
```
max_logical_replication_workers must be set to at least the number of subscriptions (for
```
```
leader apply workers), plus some reserve for the table synchronization workers and parallel apply
```
workers.
max_worker_processes may need to be adjusted to accommodate for replication workers, at
```
least (max_logical_replication_workers + 1). Note, some extensions and parallel queries
```
also take worker slots from max_worker_processes.
max_sync_workers_per_subscription controls the amount of parallelism of the initial data
copy during the subscription initialization or when new tables are added.
max_parallel_apply_workers_per_subscription controls the amount of parallelism
for streaming of in-progress transactions with subscription parameter streaming = parallel.
Logical replication workers are also affected by wal_receiver_timeout, wal_receiver_s-
tatus_interval and wal_retrieve_retry_interval.
932
Logical Replication
29.13. Upgrade
Migration of logical replication clusters is possible only when all the members of the old logical
replication clusters are version 17.0 or later.
29.13.1. Prepare for Publisher Upgrades
pg_upgrade attempts to migrate logical slots. This helps avoid the need for manually defining the same
logical slots on the new publisher. Migration of logical slots is only supported when the old cluster is
version 17.0 or later. Logical slots on clusters before version 17.0 will silently be ignored.
Before you start upgrading the publisher cluster, ensure that the subscription is temporarily disabled,
by executing ALTER SUBSCRIPTION ... DISABLE. Re-enable the subscription after the up-
grade.
There are some prerequisites for pg_upgrade to be able to upgrade the logical slots. If these are not
met an error will be reported.
• The new cluster must have wal_level as logical.
• The new cluster must have max_replication_slots configured to a value greater than or
equal to the number of slots present in the old cluster.
• The output plugins referenced by the slots on the old cluster must be installed in the new PostgreSQL
executable directory.
• The old cluster has replicated all the transactions and logical decoding messages to subscribers.
• All slots on the old cluster must be usable, i.e., there are no slots whose pg_replication_slots.con-
flicting is not true.
• The new cluster must not have permanent logical slots, i.e., there must be no slots where pg_repli-
cation_slots.temporary is false.
29.13.2. Prepare for Subscriber Upgrades
Setup the subscriber configurations in the new subscriber. pg_upgrade attempts to migrate subscrip-
tion dependencies which includes the subscription's table information present in pg_subscription_rel
system catalog and also the subscription's replication origin. This allows logical replication on the
new subscriber to continue from where the old subscriber was up to. Migration of subscription depen-
dencies is only supported when the old cluster is version 17.0 or later. Subscription dependencies on
clusters before version 17.0 will silently be ignored.
There are some prerequisites for pg_upgrade to be able to upgrade the subscriptions. If these are not
met an error will be reported.
```
• All the subscription tables in the old subscriber should be in state i (initialize) or r (ready). This
```
can be verified by checking pg_subscription_rel.srsubstate.
• The replication origin entry corresponding to each of the subscriptions should exist in the old cluster.
This can be found by checking pg_subscription and pg_replication_origin system tables.
• The new cluster must have max_active_replication_origins configured to a value
greater than or equal to the number of subscriptions present in the old cluster.
29.13.3. Upgrading Logical Replication Clusters
While upgrading a subscriber, write operations can be performed in the publisher. These changes will
be replicated to the subscriber once the subscriber upgrade is completed.
933
Logical Replication
Note
The logical replication restrictions apply to logical replication cluster upgrades also. See Sec-
tion 29.8 for details.
The prerequisites of publisher upgrade apply to logical replication cluster upgrades also. See
Section 29.13.1 for details.
The prerequisites of subscriber upgrade apply to logical replication cluster upgrades also. See
Section 29.13.2 for details.
Warning
Upgrading logical replication cluster requires multiple steps to be performed on various nodes.
Because not all operations are transactional, the user is advised to take backups as described
in Section 25.3.2.
The steps to upgrade the following logical replication clusters are detailed below:
• Follow the steps specified in Section 29.13.3.1 to upgrade a two-node logical replication cluster.
• Follow the steps specified in Section 29.13.3.2 to upgrade a cascaded logical replication cluster.
• Follow the steps specified in Section 29.13.3.3 to upgrade a two-node circular logical replication
cluster.
29.13.3.1. Steps to Upgrade a Two-node Logical Replication Clus-
ter
Let's say publisher is in node1 and subscriber is in node2. The subscriber node2 has a subscription
sub1_node1_node2 which is subscribing the changes from node1.
1. Disable all the subscriptions on node2 that are subscribing the changes from node1 by using
ALTER SUBSCRIPTION ... DISABLE, e.g.:
```
/* node2 # */ ALTER SUBSCRIPTION sub1_node1_node2 DISABLE;
```
2. Stop the publisher server in node1, e.g.:
pg_ctl -D /opt/PostgreSQL/data1 stop
3. Initialize data1_upgraded instance by using the required newer version.
4. Upgrade the publisher node1's server to the required newer version, e.g.:
pg_upgrade
--old-datadir "/opt/PostgreSQL/postgres/17/data1"
--new-datadir "/opt/PostgreSQL/postgres/18/
data1_upgraded"
--old-bindir "/opt/PostgreSQL/postgres/17/bin"
--new-bindir "/opt/PostgreSQL/postgres/18/bin"
5. Start the upgraded publisher server in node1, e.g.:
934
Logical Replication
pg_ctl -D /opt/PostgreSQL/data1_upgraded start -l logfile
6. Stop the subscriber server in node2, e.g.:
pg_ctl -D /opt/PostgreSQL/data2 stop
7. Initialize data2_upgraded instance by using the required newer version.
8. Upgrade the subscriber node2's server to the required new version, e.g.:
pg_upgrade
--old-datadir "/opt/PostgreSQL/postgres/17/data2"
--new-datadir "/opt/PostgreSQL/postgres/18/
data2_upgraded"
--old-bindir "/opt/PostgreSQL/postgres/17/bin"
--new-bindir "/opt/PostgreSQL/postgres/18/bin"
9. Start the upgraded subscriber server in node2, e.g.:
pg_ctl -D /opt/PostgreSQL/data2_upgraded start -l logfile
10. On node2, create any tables that were created in the upgraded publisher node1 server between
Step 1 and now, e.g.:
```
/* node2 # */ CREATE TABLE distributors (did integer PRIMARY
```
```
KEY, name varchar(40));
```
11. Enable all the subscriptions on node2 that are subscribing the changes from node1 by using
ALTER SUBSCRIPTION ... ENABLE, e.g.:
```
/* node2 # */ ALTER SUBSCRIPTION sub1_node1_node2 ENABLE;
```
12. Refresh the node2 subscription's publications using ALTER SUBSCRIPTION ... REFRESH
PUBLICATION, e.g.:
/* node2 # */ ALTER SUBSCRIPTION sub1_node1_node2 REFRESH
```
PUBLICATION;
```
Note
In the steps described above, the publisher is upgraded first, followed by the subscriber. Al-
ternatively, the user can use similar steps to upgrade the subscriber first, followed by the pub-
lisher.
29.13.3.2. Steps to Upgrade a Cascaded Logical Replication Clus-
ter
Let's say we have a cascaded logical replication setup node1->node2->node3. Here node2 is
subscribing the changes from node1 and node3 is subscribing the changes from node2. The node2
has a subscription sub1_node1_node2 which is subscribing the changes from node1. The node3
has a subscription sub1_node2_node3 which is subscribing the changes from node2.
935
Logical Replication
1. Disable all the subscriptions on node2 that are subscribing the changes from node1 by using
ALTER SUBSCRIPTION ... DISABLE, e.g.:
```
/* node2 # */ ALTER SUBSCRIPTION sub1_node1_node2 DISABLE;
```
2. Stop the server in node1, e.g.:
pg_ctl -D /opt/PostgreSQL/data1 stop
3. Initialize data1_upgraded instance by using the required newer version.
4. Upgrade the node1's server to the required newer version, e.g.:
pg_upgrade
--old-datadir "/opt/PostgreSQL/postgres/17/data1"
--new-datadir "/opt/PostgreSQL/postgres/18/
data1_upgraded"
--old-bindir "/opt/PostgreSQL/postgres/17/bin"
--new-bindir "/opt/PostgreSQL/postgres/18/bin"
5. Start the upgraded server in node1, e.g.:
pg_ctl -D /opt/PostgreSQL/data1_upgraded start -l logfile
6. Disable all the subscriptions on node3 that are subscribing the changes from node2 by using
ALTER SUBSCRIPTION ... DISABLE, e.g.:
```
/* node3 # */ ALTER SUBSCRIPTION sub1_node2_node3 DISABLE;
```
7. Stop the server in node2, e.g.:
pg_ctl -D /opt/PostgreSQL/data2 stop
8. Initialize data2_upgraded instance by using the required newer version.
9. Upgrade the node2's server to the required new version, e.g.:
pg_upgrade
--old-datadir "/opt/PostgreSQL/postgres/17/data2"
--new-datadir "/opt/PostgreSQL/postgres/18/
data2_upgraded"
--old-bindir "/opt/PostgreSQL/postgres/17/bin"
--new-bindir "/opt/PostgreSQL/postgres/18/bin"
10. Start the upgraded server in node2, e.g.:
pg_ctl -D /opt/PostgreSQL/data2_upgraded start -l logfile
11. On node2, create any tables that were created in the upgraded publisher node1 server between
Step 1 and now, e.g.:
```
/* node2 # */ CREATE TABLE distributors (did integer PRIMARY
```
```
KEY, name varchar(40));
```
936
Logical Replication
12. Enable all the subscriptions on node2 that are subscribing the changes from node1 by using
ALTER SUBSCRIPTION ... ENABLE, e.g.:
```
/* node2 # */ ALTER SUBSCRIPTION sub1_node1_node2 ENABLE;
```
13. Refresh the node2 subscription's publications using ALTER SUBSCRIPTION ... REFRESH
PUBLICATION, e.g.:
/* node2 # */ ALTER SUBSCRIPTION sub1_node1_node2 REFRESH
```
PUBLICATION;
```
14. Stop the server in node3, e.g.:
pg_ctl -D /opt/PostgreSQL/data3 stop
15. Initialize data3_upgraded instance by using the required newer version.
16. Upgrade the node3's server to the required new version, e.g.:
pg_upgrade
--old-datadir "/opt/PostgreSQL/postgres/17/data3"
--new-datadir "/opt/PostgreSQL/postgres/18/
data3_upgraded"
--old-bindir "/opt/PostgreSQL/postgres/17/bin"
--new-bindir "/opt/PostgreSQL/postgres/18/bin"
17. Start the upgraded server in node3, e.g.:
pg_ctl -D /opt/PostgreSQL/data3_upgraded start -l logfile
18. On node3, create any tables that were created in the upgraded node2 between Step 6 and now,
e.g.:
```
/* node3 # */ CREATE TABLE distributors (did integer PRIMARY
```
```
KEY, name varchar(40));
```
19. Enable all the subscriptions on node3 that are subscribing the changes from node2 by using
ALTER SUBSCRIPTION ... ENABLE, e.g.:
```
/* node3 # */ ALTER SUBSCRIPTION sub1_node2_node3 ENABLE;
```
20. Refresh the node3 subscription's publications using ALTER SUBSCRIPTION ... REFRESH
PUBLICATION, e.g.:
/* node3 # */ ALTER SUBSCRIPTION sub1_node2_node3 REFRESH
```
PUBLICATION;
```
29.13.3.3. Steps to Upgrade a Two-node Circular Logical Replica-
tion Cluster
Let's say we have a circular logical replication setup node1->node2 and node2->node1. Here
node2 is subscribing the changes from node1 and node1 is subscribing the changes from node2.
937
Logical Replication
The node1 has a subscription sub1_node2_node1 which is subscribing the changes from node2.
The node2 has a subscription sub1_node1_node2 which is subscribing the changes from node1.
1. Disable all the subscriptions on node2 that are subscribing the changes from node1 by using
ALTER SUBSCRIPTION ... DISABLE, e.g.:
```
/* node2 # */ ALTER SUBSCRIPTION sub1_node1_node2 DISABLE;
```
2. Stop the server in node1, e.g.:
pg_ctl -D /opt/PostgreSQL/data1 stop
3. Initialize data1_upgraded instance by using the required newer version.
4. Upgrade the node1's server to the required newer version, e.g.:
pg_upgrade
--old-datadir "/opt/PostgreSQL/postgres/17/data1"
--new-datadir "/opt/PostgreSQL/postgres/18/
data1_upgraded"
--old-bindir "/opt/PostgreSQL/postgres/17/bin"
--new-bindir "/opt/PostgreSQL/postgres/18/bin"
5. Start the upgraded server in node1, e.g.:
pg_ctl -D /opt/PostgreSQL/data1_upgraded start -l logfile
6. Enable all the subscriptions on node2 that are subscribing the changes from node1 by using
ALTER SUBSCRIPTION ... ENABLE, e.g.:
```
/* node2 # */ ALTER SUBSCRIPTION sub1_node1_node2 ENABLE;
```
7. On node1, create any tables that were created in node2 between Step 1 and now, e.g.:
```
/* node1 # */ CREATE TABLE distributors (did integer PRIMARY
```
```
KEY, name varchar(40));
```
8. Refresh the node1 subscription's publications to copy initial table data from node2 using AL-
TER SUBSCRIPTION ... REFRESH PUBLICATION, e.g.:
/* node1 # */ ALTER SUBSCRIPTION sub1_node2_node1 REFRESH
```
PUBLICATION;
```
9. Disable all the subscriptions on node1 that are subscribing the changes from node2 by using
ALTER SUBSCRIPTION ... DISABLE, e.g.:
```
/* node1 # */ ALTER SUBSCRIPTION sub1_node2_node1 DISABLE;
```
10. Stop the server in node2, e.g.:
pg_ctl -D /opt/PostgreSQL/data2 stop
11. Initialize data2_upgraded instance by using the required newer version.
938
Logical Replication
12. Upgrade the node2's server to the required new version, e.g.:
pg_upgrade
--old-datadir "/opt/PostgreSQL/postgres/17/data2"
--new-datadir "/opt/PostgreSQL/postgres/18/
data2_upgraded"
--old-bindir "/opt/PostgreSQL/postgres/17/bin"
--new-bindir "/opt/PostgreSQL/postgres/18/bin"
13. Start the upgraded server in node2, e.g.:
pg_ctl -D /opt/PostgreSQL/data2_upgraded start -l logfile
14. Enable all the subscriptions on node1 that are subscribing the changes from node2 by using
ALTER SUBSCRIPTION ... ENABLE, e.g.:
```
/* node1 # */ ALTER SUBSCRIPTION sub1_node2_node1 ENABLE;
```
15. On node2, create any tables that were created in the upgraded node1 between Step 9 and now,
e.g.:
```
/* node2 # */ CREATE TABLE distributors (did integer PRIMARY
```
```
KEY, name varchar(40));
```
16. Refresh the node2 subscription's publications to copy initial table data from node1 using AL-
TER SUBSCRIPTION ... REFRESH PUBLICATION, e.g.:
/* node2 # */ ALTER SUBSCRIPTION sub1_node1_node2 REFRESH
```
PUBLICATION;
```
29.14. Quick Setup
First set the configuration options in postgresql.conf:
```
wal_level = logical
```
The other required settings have default values that are sufficient for a basic setup.
```
pg_hba.conf needs to be adjusted to allow replication (the values here depend on your actual
```
```
network configuration and user you want to use for connecting):
```
host all repuser 0.0.0.0/0 md5
Then on the publisher database:
```
CREATE PUBLICATION mypub FOR TABLE users, departments;
```
And on the subscriber database:
CREATE SUBSCRIPTION mysub CONNECTION 'dbname=foo host=bar
```
user=repuser' PUBLICATION mypub;
```
939
Logical Replication
The above will start the replication process, which synchronizes the initial table contents of the tables
users and departments and then starts replicating incremental changes to those tables.
940
