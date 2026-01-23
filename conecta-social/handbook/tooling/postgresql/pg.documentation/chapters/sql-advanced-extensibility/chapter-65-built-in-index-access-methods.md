Chapter 65. Built-in Index Access
Methods
65.1. B-Tree Indexes
65.1.1. Introduction
```
PostgreSQL includes an implementation of the standard btree (multi-way balanced tree) index data
```
structure. Any data type that can be sorted into a well-defined linear order can be indexed by a btree
```
index. The only limitation is that an index entry cannot exceed approximately one-third of a page (after
```
```
TOAST compression, if applicable).
```
```
Because each btree operator class imposes a sort order on its data type, btree operator classes (or, really,
```
```
operator families) have come to be used as PostgreSQL's general representation and understanding of
```
sorting semantics. Therefore, they've acquired some features that go beyond what would be needed
just to support btree indexes, and parts of the system that are quite distant from the btree AM make
use of them.
65.1.2. Behavior of B-Tree Operator Classes
As shown in Table 36.3, a btree operator class must provide five comparison operators, <, <=, =, >=
and >. One might expect that <> should also be part of the operator class, but it is not, because it
```
would almost never be useful to use a <> WHERE clause in an index search. (For some purposes, the
```
```
planner treats <> as associated with a btree operator class; but it finds that operator via the = operator's
```
```
negator link, rather than from pg_amop.)
```
When several data types share near-identical sorting semantics, their operator classes can be grouped
into an operator family. Doing so is advantageous because it allows the planner to make deductions
about cross-type comparisons. Each operator class within the family should contain the single-type
```
operators (and associated support functions) for its input data type, while cross-type comparison oper-
```
ators and support functions are “loose” in the family. It is recommendable that a complete set of cross-
type operators be included in the family, thus ensuring that the planner can represent any comparison
conditions that it deduces from transitivity.
There are some basic assumptions that a btree operator family must satisfy:
```
• An = operator must be an equivalence relation; that is, for all non-null values A, B, C of the data type:
```
```
• A = A is true (reflexive law)
```
```
• if A = B, then B = A (symmetric law)
```
```
• if A = B and B = C, then A = C (transitive law)
```
```
• A < operator must be a strong ordering relation; that is, for all non-null values A, B, C:
```
```
• A < A is false (irreflexive law)
```
```
• if A < B and B < C, then A < C (transitive law)
```
```
• Furthermore, the ordering is total; that is, for all non-null values A, B:
```
```
• exactly one of A < B, A = B, and B < A is true (trichotomy law)
```
```
(The trichotomy law justifies the definition of the comparison support function, of course.)
```
The other three operators are defined in terms of = and < in the obvious way, and must act consistently
with them.
2582
Built-in Index Access Methods
For an operator family supporting multiple data types, the above laws must hold when A, B, C are
taken from any data types in the family. The transitive laws are the trickiest to ensure, as in cross-type
situations they represent statements that the behaviors of two or three different operators are consistent.
As an example, it would not work to put float8 and numeric into the same operator family, at
least not with the current semantics that numeric values are converted to float8 for comparison
to a float8. Because of the limited accuracy of float8, this means there are distinct numeric
values that will compare equal to the same float8 value, and thus the transitive law would fail.
Another requirement for a multiple-data-type family is that any implicit or binary-coercion casts that
are defined between data types included in the operator family must not change the associated sort
ordering.
It should be fairly clear why a btree index requires these laws to hold within a single data type: without
them there is no ordering to arrange the keys with. Also, index searches using a comparison key of
a different data type require comparisons to behave sanely across two data types. The extensions to
three or more data types within a family are not strictly required by the btree index mechanism itself,
but the planner relies on them for optimization purposes.
65.1.3. B-Tree Support Functions
As shown in Table 36.9, btree defines one required and five optional support functions. The six user-
defined methods are:
order
For each combination of data types that a btree operator family provides comparison operators for,
it must provide a comparison support function, registered in pg_amproc with support function
number 1 and amproclefttype/amprocrighttype equal to the left and right data types
```
for the comparison (i.e., the same data types that the matching operators are registered with in
```
```
pg_amop). The comparison function must take two non-null values A and B and return an int32
```
value that is < 0, 0, or > 0 when A < B, A = B, or A > B, respectively. A null result is disallowed:
all values of the data type must be comparable. See src/backend/access/nbtree/nbt-
compare.c for examples.
If the compared values are of a collatable data type, the appropriate collation OID will be passed
```
to the comparison support function, using the standard PG_GET_COLLATION() mechanism.
```
sortsupport
```
Optionally, a btree operator family may provide sort support function(s), registered under support
```
```
function number 2. These functions allow implementing comparisons for sorting purposes in a
```
more efficient way than naively calling the comparison support function. The APIs involved in
this are defined in src/include/utils/sortsupport.h.
in_range
```
Optionally, a btree operator family may provide in_range support function(s), registered under
```
```
support function number 3. These are not used during btree index operations; rather, they extend
```
the semantics of the operator family so that it can support window clauses containing the RANGE
```
offset PRECEDING and RANGE offset FOLLOWING frame bound types (see Section 4.2.8).
```
Fundamentally, the extra information provided is how to add or subtract an offset value in a
way that is compatible with the family's data ordering.
An in_range function must have the signature
```
in_range(val type1, base type1, offset type2, sub bool, less
```
```
bool)
```
returns bool
val and base must be of the same type, which is one of the types supported by the operator
```
family (i.e., a type for which it provides an ordering). However, offset could be of a different
```
2583
Built-in Index Access Methods
type, which might be one otherwise unsupported by the family. An example is that the built-in
time_ops family provides an in_range function that has offset of type interval. A
family can provide in_range functions for any of its supported types and one or more offset
types. Each in_range function should be entered in pg_amproc with amproclefttype
equal to type1 and amprocrighttype equal to type2.
The essential semantics of an in_range function depend on the two Boolean flag parameters.
It should add or subtract base and offset, then compare val to the result, as follows:
```
• if !sub and !less, return val >= (base + offset)
```
```
• if !sub and less, return val <= (base + offset)
```
```
• if sub and !less, return val >= (base - offset)
```
```
• if sub and less, return val <= (base - offset)
```
Before doing so, the function should check the sign of offset: if it is less than zero, raise er-
```
ror ERRCODE_INVALID_PRECEDING_OR_FOLLOWING_SIZE (22013) with error text like
```
```
“invalid preceding or following size in window function”. (This is required by the SQL standard,
```
although nonstandard operator families might perhaps choose to ignore this restriction, since there
```
seems to be little semantic necessity for it.) This requirement is delegated to the in_range func-
```
tion so that the core code needn't understand what “less than zero” means for a particular data type.
An additional expectation is that in_range functions should, if practical, avoid throwing an
error if base + offset or base - offset would overflow. The correct comparison result
can be determined even if that value would be out of the data type's range. Note that if the data
type includes concepts such as “infinity” or “NaN”, extra care may be needed to ensure that
in_range's results agree with the normal sort order of the operator family.
The results of the in_range function must be consistent with the sort ordering imposed by the
operator family. To be precise, given any fixed values of offset and sub, then:
• If in_range with less = true is true for some val1 and base, it must be true for every
val2 <= val1 with the same base.
• If in_range with less = true is false for some val1 and base, it must be false for every
val2 >= val1 with the same base.
• If in_range with less = true is true for some val and base1, it must be true for every
base2 >= base1 with the same val.
• If in_range with less = true is false for some val and base1, it must be false for every
base2 <= base1 with the same val.
Analogous statements with inverted conditions hold when less = false.
```
If the type being ordered (type1) is collatable, the appropriate collation OID will be passed to
```
```
the in_range function, using the standard PG_GET_COLLATION() mechanism.
```
in_range functions need not handle NULL inputs, and typically will be marked strict.
equalimage
```
Optionally, a btree operator family may provide equalimage (“equality implies image equal-
```
```
ity”) support functions, registered under support function number 4. These functions allow the
```
core code to determine when it is safe to apply the btree deduplication optimization. Currently,
equalimage functions are only called when building or rebuilding an index.
An equalimage function must have the signature
```
equalimage(opcintype oid) returns bool
```
The return value is static information about an operator class and collation. Returning true in-
```
dicates that the order function for the operator class is guaranteed to only return 0 (“arguments
```
2584
Built-in Index Access Methods
```
are equal”) when its A and B arguments are also interchangeable without any loss of semantic
```
information. Not registering an equalimage function or returning false indicates that this
condition cannot be assumed to hold.
The opcintype argument is the pg_type.oid of the data type that the operator class indexes.
This is a convenience that allows reuse of the same underlying equalimage function across
operator classes. If opcintype is a collatable data type, the appropriate collation OID will be
```
passed to the equalimage function, using the standard PG_GET_COLLATION() mechanism.
```
```
As far as the operator class is concerned, returning true indicates that deduplication is safe (or
```
```
safe for the collation whose OID was passed to its equalimage function). However, the core
```
code will only deem deduplication safe for an index when every indexed column uses an operator
class that registers an equalimage function, and each function actually returns true when
called.
Image equality is almost the same condition as simple bitwise equality. There is one subtle differ-
```
ence: When indexing a varlena data type, the on-disk representation of two image equal datums
```
may not be bitwise equal due to inconsistent application of TOAST compression on input. For-
mally, when an operator class's equalimage function returns true, it is safe to assume that the
```
datum_image_eq() C function will always agree with the operator class's order function
```
```
(provided that the same collation OID is passed to both the equalimage and order functions).
```
The core code is fundamentally unable to deduce anything about the “equality implies image
equality” status of an operator class within a multiple-data-type family based on details from other
operator classes in the same family. Also, it is not sensible for an operator family to register a
cross-type equalimage function, and attempting to do so will result in an error. This is because
“equality implies image equality” status does not just depend on sorting/equality semantics, which
are more or less defined at the operator family level. In general, the semantics that one particular
data type implements must be considered separately.
The convention followed by the operator classes included with the core PostgreSQL distribution
is to register a stock, generic equalimage function. Most operator classes register btequal-
```
image(), which indicates that deduplication is safe unconditionally. Operator classes for collat-
```
```
able data types such as text register btvarstrequalimage(), which indicates that dedu-
```
plication is safe with deterministic collations. Best practice for third-party extensions is to register
their own custom function to retain control.
options
```
Optionally, a B-tree operator family may provide options (“operator class specific options”)
```
support functions, registered under support function number 5. These functions define a set of
user-visible parameters that control operator class behavior.
An options support function must have the signature
```
options(relopts local_relopts *) returns void
```
The function is passed a pointer to a local_relopts struct, which needs to be filled with a
set of operator class specific options. The options can be accessed from other support functions
```
using the PG_HAS_OPCLASS_OPTIONS() and PG_GET_OPCLASS_OPTIONS() macros.
```
Currently, no B-Tree operator class has an options support function. B-tree doesn't allow flexi-
ble representation of keys like GiST, SP-GiST, GIN and BRIN do. So, options probably doesn't
have much application in the current B-tree index access method. Nevertheless, this support func-
tion was added to B-tree for uniformity, and will probably find uses during further evolution of
B-tree in PostgreSQL.
skipsupport
Optionally, a btree operator family may provide a skip support function, registered under support
```
function number 6. These functions give the B-tree code a way to iterate through every possible
```
2585
Built-in Index Access Methods
value that can be represented by an operator class's underlying input type, in key space order. This
is used by the core code when it applies the skip scan optimization. The APIs involved in this are
defined in src/include/utils/skipsupport.h.
Operator classes that do not provide a skip support function are still eligible to use skip scan. The
core code can still use its fallback strategy, though that might be suboptimal for some discrete
```
types. It usually doesn't make sense (and may not even be feasible) for operator classes on con-
```
tinuous types to provide a skip support function.
It is not sensible for an operator family to register a cross-type skipsupport function, and
attempting to do so will result in an error. This is because determining the next indexable value
must happen by incrementing a value copied from an index tuple. The values generated must all
```
be of the same underlying data type (the “skipped” index column's opclass input type).
```
65.1.4. Implementation
This section covers B-Tree index implementation details that may be of use to advanced users. See
src/backend/access/nbtree/README in the source distribution for a much more detailed,
internals-focused description of the B-Tree implementation.
65.1.4.1. B-Tree Structure
PostgreSQL B-Tree indexes are multi-level tree structures, where each level of the tree can be used
as a doubly-linked list of pages. A single metapage is stored in a fixed position at the start of the first
segment file of the index. All other pages are either leaf pages or internal pages. Leaf pages are the
pages on the lowest level of the tree. All other levels consist of internal pages. Each leaf page contains
tuples that point to table rows. Each internal page contains tuples that point to the next level down in
the tree. Typically, over 99% of all pages are leaf pages. Both internal pages and leaf pages use the
standard page format described in Section 66.6.
New leaf pages are added to a B-Tree index when an existing leaf page cannot fit an incoming tuple.
A page split operation makes room for items that originally belonged on the overflowing page by
moving a portion of the items to a new page. Page splits must also insert a new downlink to the new
page in the parent page, which may cause the parent to split in turn. Page splits “cascade upwards” in
a recursive fashion. When the root page finally cannot fit a new downlink, a root page split operation
takes place. This adds a new level to the tree structure by creating a new root page that is one level
above the original root page.
65.1.4.2. Bottom-up Index Deletion
B-Tree indexes are not directly aware that under MVCC, there might be multiple extant versions of the
```
same logical table row; to an index, each tuple is an independent object that needs its own index entry.
```
“Version churn” tuples may sometimes accumulate and adversely affect query latency and throughput.
This typically occurs with UPDATE-heavy workloads where most individual updates cannot apply the
HOT optimization. Changing the value of only one column covered by one index during an UPDATE
always necessitates a new set of index tuples — one for each and every index on the table. Note in
particular that this includes indexes that were not “logically modified” by the UPDATE. All indexes
will need a successor physical index tuple that points to the latest version in the table. Each new tuple
within each index will generally need to coexist with the original “updated” tuple for a short period
```
of time (typically until shortly after the UPDATE transaction commits).
```
B-Tree indexes incrementally delete version churn index tuples by performing bottom-up index dele-
tion passes. Each deletion pass is triggered in reaction to an anticipated “version churn page split”. This
only happens with indexes that are not logically modified by UPDATE statements, where concentrated
build up of obsolete versions in particular pages would occur otherwise. A page split will usually be
avoided, though it's possible that certain implementation-level heuristics will fail to identify and delete
```
even one garbage index tuple (in which case a page split or deduplication pass resolves the issue of an
```
```
incoming new tuple not fitting on a leaf page). The worst-case number of versions that any index scan
```
2586
Built-in Index Access Methods
```
must traverse (for any single logical row) is an important contributor to overall system responsiveness
```
and throughput. A bottom-up index deletion pass targets suspected garbage tuples in a single leaf page
based on qualitative distinctions involving logical rows and versions. This contrasts with the “top-
down” index cleanup performed by autovacuum workers, which is triggered when certain quantitative
```
table-level thresholds are exceeded (see Section 24.1.6).
```
Note
Not all deletion operations that are performed within B-Tree indexes are bottom-up deletion
operations. There is a distinct category of index tuple deletion: simple index tuple deletion.
This is a deferred maintenance operation that deletes index tuples that are known to be safe
```
to delete (those whose item identifier's LP_DEAD bit is already set). Like bottom-up index
```
deletion, simple index deletion takes place at the point that a page split is anticipated as a way
of avoiding the split.
Simple deletion is opportunistic in the sense that it can only take place when recent index scans
set the LP_DEAD bits of affected items in passing. Prior to PostgreSQL 14, the only category of
B-Tree deletion was simple deletion. The main differences between it and bottom-up deletion
are that only the former is opportunistically driven by the activity of passing index scans, while
only the latter specifically targets version churn from UPDATEs that do not logically modify
indexed columns.
Bottom-up index deletion performs the vast majority of all garbage index tuple cleanup for particular
indexes with certain workloads. This is expected with any B-Tree index that is subject to significant
version churn from UPDATEs that rarely or never logically modify the columns that the index covers.
The average and worst-case number of versions per logical row can be kept low purely through tar-
geted incremental deletion passes. It's quite possible that the on-disk size of certain indexes will never
increase by even one single page/block despite constant version churn from UPDATEs. Even then, an
```
exhaustive “clean sweep” by a VACUUM operation (typically run in an autovacuum worker process)
```
will eventually be required as a part of collective cleanup of the table and each of its indexes.
Unlike VACUUM, bottom-up index deletion does not provide any strong guarantees about how old
the oldest garbage index tuple may be. No index can be permitted to retain “floating garbage” index
tuples that became dead prior to a conservative cutoff point shared by the table and all of its indexes
collectively. This fundamental table-level invariant makes it safe to recycle table TIDs. This is how
```
it is possible for distinct logical rows to reuse the same table TID over time (though this can never
```
```
happen with two logical rows whose lifetimes span the same VACUUM cycle).
```
65.1.4.3. Deduplication
```
A duplicate is a leaf page tuple (a tuple that points to a table row) where all indexed key columns
```
have values that match corresponding column values from at least one other leaf page tuple in the
same index. Duplicate tuples are quite common in practice. B-Tree indexes can use a special, space-
efficient representation for duplicates when an optional technique is enabled: deduplication.
Deduplication works by periodically merging groups of duplicate tuples together, forming a single
```
posting list tuple for each group. The column key value(s) only appear once in this representation. This
```
is followed by a sorted array of TIDs that point to rows in the table. This significantly reduces the stor-
```
age size of indexes where each value (or each distinct combination of column values) appears several
```
times on average. The latency of queries can be reduced significantly. Overall query throughput may
increase significantly. The overhead of routine index vacuuming may also be reduced significantly.
Note
B-Tree deduplication is just as effective with “duplicates” that contain a NULL value, even
though NULL values are never equal to each other according to the = member of any B-Tree
2587
Built-in Index Access Methods
operator class. As far as any part of the implementation that understands the on-disk B-Tree
structure is concerned, NULL is just another value from the domain of indexed values.
The deduplication process occurs lazily, when a new item is inserted that cannot fit on an existing
leaf page, though only when index tuple deletion could not free sufficient space for the new item
```
(typically deletion is briefly considered and then skipped over). Unlike GIN posting list tuples, B-
```
```
Tree posting list tuples do not need to expand every time a new duplicate is inserted; they are merely
```
an alternative physical representation of the original logical contents of the leaf page. This design
prioritizes consistent performance with mixed read-write workloads. Most client applications will
at least see a moderate performance benefit from using deduplication. Deduplication is enabled by
default.
CREATE INDEX and REINDEX apply deduplication to create posting list tuples, though the strategy
they use is slightly different. Each group of duplicate ordinary tuples encountered in the sorted input
taken from the table is merged into a posting list tuple before being added to the current pending leaf
page. Individual posting list tuples are packed with as many TIDs as possible. Leaf pages are written
out in the usual way, without any separate deduplication pass. This strategy is well-suited to CREATE
INDEX and REINDEX because they are once-off batch operations.
Write-heavy workloads that don't benefit from deduplication due to having few or no duplicate values
```
in indexes will incur a small, fixed performance penalty (unless deduplication is explicitly disabled).
```
The deduplicate_items storage parameter can be used to disable deduplication within individual
indexes. There is never any performance penalty with read-only workloads, since reading posting list
tuples is at least as efficient as reading the standard tuple representation. Disabling deduplication isn't
usually helpful.
```
It is sometimes possible for unique indexes (as well as unique constraints) to use deduplication. This
```
allows leaf pages to temporarily “absorb” extra version churn duplicates. Deduplication in unique in-
dexes augments bottom-up index deletion, especially in cases where a long-running transaction holds
a snapshot that blocks garbage collection. The goal is to buy time for the bottom-up index deletion
strategy to become effective again. Delaying page splits until a single long-running transaction natu-
rally goes away can allow a bottom-up deletion pass to succeed where an earlier deletion pass failed.
Tip
A special heuristic is applied to determine whether a deduplication pass in a unique index
should take place. It can often skip straight to splitting a leaf page, avoiding a performance
penalty from wasting cycles on unhelpful deduplication passes. If you're concerned about the
overhead of deduplication, consider setting deduplicate_items = off selectively.
Leaving deduplication enabled in unique indexes has little downside.
Deduplication cannot be used in all cases due to implementation-level restrictions. Deduplication safe-
ty is determined when CREATE INDEX or REINDEX is run.
Note that deduplication is deemed unsafe and cannot be used in the following cases involving seman-
tically significant differences among equal datums:
• text, varchar, and char cannot use deduplication when a nondeterministic collation is used.
Case and accent differences must be preserved among equal datums.
• numeric cannot use deduplication. Numeric display scale must be preserved among equal datums.
• jsonb cannot use deduplication, since the jsonb B-Tree operator class uses numeric internally.
• float4 and float8 cannot use deduplication. These types have distinct representations for -0
and 0, which are nevertheless considered equal. This difference must be preserved.
There is one further implementation-level restriction that may be lifted in a future version of Post-
```
greSQL:
```
2588
Built-in Index Access Methods
```
• Container types (such as composite types, arrays, or range types) cannot use deduplication.
```
There is one further implementation-level restriction that applies regardless of the operator class or
collation used:
• INCLUDE indexes can never use deduplication.
65.2. GiST Indexes
65.2.1. Introduction
GiST stands for Generalized Search Tree. It is a balanced, tree-structured access method, that acts as
a base template in which to implement arbitrary indexing schemes. B-trees, R-trees and many other
indexing schemes can be implemented in GiST.
One advantage of GiST is that it allows the development of custom data types with the appropriate
access methods, by an expert in the domain of the data type, rather than a database expert.
Some of the information here is derived from the University of California at Berkeley's GiST Index-
ing Project web site1 and Marcel Kornacker's thesis, Access Methods for Next-Generation Database
Systems2. The GiST implementation in PostgreSQL is primarily maintained by Teodor Sigaev and
Oleg Bartunov, and there is more information on their web site3.
65.2.2. Built-in Operator Classes
```
The core PostgreSQL distribution includes the GiST operator classes shown in Table 65.1. (Some of
```
```
the optional modules described in Appendix F provide additional GiST operator classes.)
```
Table 65.1. Built-in GiST Operator Classes
Name Indexable Operators Ordering Operators
```
<< (box, box)
```
```
&< (box, box)
```
```
&& (box, box)
```
```
&> (box, box)
```
```
>> (box, box)
```
```
~= (box, box)
```
```
@> (box, box)
```
```
<@ (box, box)
```
```
&<| (box, box)
```
```
<<| (box, box)
```
```
|>> (box, box)
```
box_ops
```
|&> (box, box)
```
```
<-> (box, point)
```
```
<< (circle, circle)
```
```
&< (circle, circle)
```
```
&> (circle, circle)
```
```
>> (circle, circle)
```
circle_ops
```
<@ (circle, circle)
```
```
<-> (circle,
```
```
point)
```
1 http://gist.cs.berkeley.edu/
2 http://www.sai.msu.su/~megera/postgres/gist/papers/concurrency/access-methods-for-next-generation.pdf.gz
3 http://www.sai.msu.su/~megera/postgres/gist/
2589
Built-in Index Access Methods
Name Indexable Operators Ordering Operators
```
@> (circle, circle)
```
```
~= (circle, circle)
```
```
&& (circle, circle)
```
```
|>> (circle, circle)
```
```
<<| (circle, circle)
```
```
&<| (circle, circle)
```
```
|&> (circle, circle)
```
```
<< (inet, inet)
```
```
<<= (inet, inet)
```
```
>> (inet, inet)
```
```
>>= (inet, inet)
```
```
= (inet, inet)
```
```
<> (inet, inet)
```
```
< (inet, inet)
```
```
<= (inet, inet)
```
```
> (inet, inet)
```
```
>= (inet, inet)
```
inet_ops
```
&& (inet, inet)
```
```
= (anymultirange, anymulti-
```
```
range)
```
```
&& (anymultirange, anymulti-
```
```
range)
```
```
&& (anymultirange, anyrange)
```
```
@> (anymultirange, anyele-
```
```
ment)
```
```
@> (anymultirange, anymulti-
```
```
range)
```
```
@> (anymultirange, anyrange)
```
```
<@ (anymultirange, anymulti-
```
```
range)
```
```
<@ (anymultirange, anyrange)
```
```
<< (anymultirange, anymulti-
```
```
range)
```
```
<< (anymultirange, anyrange)
```
```
>> (anymultirange, anymulti-
```
```
range)
```
```
>> (anymultirange, anyrange)
```
```
&< (anymultirange, anymulti-
```
```
range)
```
```
&< (anymultirange, anyrange)
```
```
&> (anymultirange, anymulti-
```
```
range)
```
multirange_ops
```
&> (anymultirange, anyrange)
```
2590
Built-in Index Access Methods
Name Indexable Operators Ordering Operators
```
-|- (anymultirange, anymul-
```
```
tirange)
```
```
-|- (anymultirange,
```
```
anyrange)
```
```
|>> (point, point)
```
```
<< (point, point)
```
```
>> (point, point)
```
```
<<| (point, point)
```
```
~= (point, point)
```
```
<@ (point, box)
```
```
<@ (point, polygon)
```
point_ops
```
<@ (point, circle)
```
```
<-> (point, point)
```
```
<< (polygon, polygon)
```
```
&< (polygon, polygon)
```
```
&> (polygon, polygon)
```
```
>> (polygon, polygon)
```
```
<@ (polygon, polygon)
```
```
@> (polygon, polygon)
```
```
~= (polygon, polygon)
```
```
&& (polygon, polygon)
```
```
<<| (polygon, polygon)
```
```
&<| (polygon, polygon)
```
```
|&> (polygon, polygon)
```
poly_ops
```
|>> (polygon, polygon)
```
```
<-> (polygon,
```
```
point)
```
```
= (anyrange, anyrange)
```
```
&& (anyrange, anyrange)
```
```
&& (anyrange, anymultirange)
```
```
@> (anyrange, anyelement)
```
```
@> (anyrange, anyrange)
```
```
@> (anyrange, anymultirange)
```
```
<@ (anyrange, anyrange)
```
```
<@ (anyrange, anymultirange)
```
```
<< (anyrange, anyrange)
```
```
<< (anyrange, anymultirange)
```
```
>> (anyrange, anyrange)
```
```
>> (anyrange, anymultirange)
```
```
&< (anyrange, anyrange)
```
```
&< (anyrange, anymultirange)
```
```
&> (anyrange, anyrange)
```
```
&> (anyrange, anymultirange)
```
range_ops
```
-|- (anyrange, anyrange)
```
2591
Built-in Index Access Methods
Name Indexable Operators Ordering Operators
```
-|- (anyrange, anymulti-
```
```
range)
```
```
<@ (tsquery, tsquery)
```
tsquery_ops
```
@> (tsquery, tsquery)
```
```
tsvector_ops @@ (tsvector, tsquery)
```
For historical reasons, the inet_ops operator class is not the default class for types inet and cidr.
To use it, mention the class name in CREATE INDEX, for example
```
CREATE INDEX ON my_table USING GIST (my_inet_column inet_ops);
```
65.2.3. Extensibility
Traditionally, implementing a new index access method meant a lot of difficult work. It was necessary
to understand the inner workings of the database, such as the lock manager and Write-Ahead Log.
The GiST interface has a high level of abstraction, requiring the access method implementer only to
implement the semantics of the data type being accessed. The GiST layer itself takes care of concur-
rency, logging and searching the tree structure.
This extensibility should not be confused with the extensibility of the other standard search trees in
terms of the data they can handle. For example, PostgreSQL supports extensible B-trees and hash
indexes. That means that you can use PostgreSQL to build a B-tree or hash over any data type you want.
```
But B-trees only support range predicates (<, =, >), and hash indexes only support equality queries.
```
So if you index, say, an image collection with a PostgreSQL B-tree, you can only issue queries such
as “is imagex equal to imagey”, “is imagex less than imagey” and “is imagex greater than imagey”.
Depending on how you define “equals”, “less than” and “greater than” in this context, this could
be useful. However, by using a GiST based index, you could create ways to ask domain-specific
questions, perhaps “find all images of horses” or “find all over-exposed images”.
All it takes to get a GiST access method up and running is to implement several user-defined methods,
which define the behavior of keys in the tree. Of course these methods have to be pretty fancy to support
```
fancy queries, but for all the standard queries (B-trees, R-trees, etc.) they're relatively straightforward.
```
In short, GiST combines extensibility along with generality, code reuse, and a clean interface.
There are five methods that an index operator class for GiST must provide, and seven that are optional.
Correctness of the index is ensured by proper implementation of the same, consistent and union
```
methods, while efficiency (size and speed) of the index will depend on the penalty and picksplit
```
methods. Two optional methods are compress and decompress, which allow an index to have
internal tree data of a different type than the data it indexes. The leaves are to be of the indexed data
```
type, while the other tree nodes can be of any C struct (but you still have to follow PostgreSQL data
```
```
type rules here, see about varlena for variable sized data). If the tree's internal data type exists at
```
the SQL level, the STORAGE option of the CREATE OPERATOR CLASS command can be used. The
optional eighth method is distance, which is needed if the operator class wishes to support ordered
```
scans (nearest-neighbor searches). The optional ninth method fetch is needed if the operator class
```
wishes to support index-only scans, except when the compress method is omitted. The optional tenth
method options is needed if the operator class has user-specified parameters. The optional eleventh
method sortsupport is used to speed up building a GiST index. The optional twelfth method
```
stratnum is used to translate compare types (from src/include/nodes/primnodes.h) into
```
strategy numbers used by the operator class. This lets the core code look up operators for temporal
constraint indexes.
consistent
Given an index entry p and a query value q, this function determines whether the index entry is
```
“consistent” with the query; that is, could the predicate “indexed_column indexable_op-
```
2592
Built-in Index Access Methods
erator q” be true for any row represented by the index entry? For a leaf index entry this is equiv-
alent to testing the indexable condition, while for an internal tree node this determines whether
it is necessary to scan the subtree of the index represented by the tree node. When the result is
true, a recheck flag must also be returned. This indicates whether the predicate is certainly
true or only possibly true. If recheck = false then the index has tested the predicate condition
exactly, whereas if recheck = true the row is only a candidate match. In that case the system
will automatically evaluate the indexable_operator against the actual row value to see if it
is really a match. This convention allows GiST to support both lossless and lossy index structures.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_consistent(internal, data_type,
```
```
smallint, oid, internal)
```
RETURNS bool
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
And the matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_consistent);
```
Datum
```
my_consistent(PG_FUNCTION_ARGS)
```
```
{
```
```
GISTENTRY *entry = (GISTENTRY *) PG_GETARG_POINTER(0);
```
```
data_type *query = PG_GETARG_DATA_TYPE_P(1);
```
```
StrategyNumber strategy = (StrategyNumber)
```
```
PG_GETARG_UINT16(2);
```
```
/* Oid subtype = PG_GETARG_OID(3); */
```
```
bool *recheck = (bool *) PG_GETARG_POINTER(4);
```
```
data_type *key = DatumGetDataType(entry->key);
```
```
bool retval;
```
/*
- determine return value as a function of strategy, key and
query.
*
- Use GIST_LEAF(entry) to know where you're called in the
index tree,
- which comes handy when supporting the = operator for
```
example (you could
```
- check for non empty union() in non-leaf nodes and
equality in leaf
- nodes).
*/
```
*recheck = true; /* or false if check is exact */
```
```
PG_RETURN_BOOL(retval);
```
```
}
```
Here, key is an element in the index and query the value being looked up in the index. The
StrategyNumber parameter indicates which operator of your operator class is being applied
— it matches one of the operator numbers in the CREATE OPERATOR CLASS command.
Depending on which operators you have included in the class, the data type of query could vary
with the operator, since it will be whatever type is on the right-hand side of the operator, which
2593
Built-in Index Access Methods
```
might be different from the indexed data type appearing on the left-hand side. (The above code
```
```
skeleton assumes that only one type is possible; if not, fetching the query argument value would
```
```
have to depend on the operator.) It is recommended that the SQL declaration of the consistent
```
```
function use the opclass's indexed data type for the query argument, even though the actual type
```
might be something else depending on the operator.
union
This method consolidates information in the tree. Given a set of entries, this function generates
a new index entry that represents all the given entries.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_union(internal, internal)
```
RETURNS storage_type
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
And the matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_union);
```
Datum
```
my_union(PG_FUNCTION_ARGS)
```
```
{
```
```
GistEntryVector *entryvec = (GistEntryVector *)
```
```
PG_GETARG_POINTER(0);
```
```
GISTENTRY *ent = entryvec->vector;
```
data_type *out,
*tmp,
```
*old;
```
int numranges,
```
i = 0;
```
```
numranges = entryvec->n;
```
```
tmp = DatumGetDataType(ent[0].key);
```
```
out = tmp;
```
```
if (numranges == 1)
```
```
{
```
```
out = data_type_deep_copy(tmp);
```
```
PG_RETURN_DATA_TYPE_P(out);
```
```
}
```
```
for (i = 1; i < numranges; i++)
```
```
{
```
```
old = out;
```
```
tmp = DatumGetDataType(ent[i].key);
```
```
out = my_union_implementation(out, tmp);
```
```
}
```
```
PG_RETURN_DATA_TYPE_P(out);
```
```
}
```
```
As you can see, in this skeleton we're dealing with a data type where union(X, Y, Z) =
```
```
union(union(X, Y), Z). It's easy enough to support data types where this is not the case,
```
by implementing the proper union algorithm in this GiST support method.
2594
Built-in Index Access Methods
The result of the union function must be a value of the index's storage type, whatever that is
```
(it might or might not be different from the indexed column's type). The union function should
```
```
return a pointer to newly palloc()ed memory. You can't just return the input value as-is, even
```
if there is no type change.
As shown above, the union function's first internal argument is actually a GistEn-
tryVector pointer. The second argument is a pointer to an integer variable, which can be ig-
```
nored. (It used to be required that the union function store the size of its result value into that
```
```
variable, but this is no longer necessary.)
```
compress
Converts a data item into a format suitable for physical storage in an index page. If the compress
method is omitted, data items are stored in the index without modification.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_compress(internal)
```
RETURNS internal
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
And the matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_compress);
```
Datum
```
my_compress(PG_FUNCTION_ARGS)
```
```
{
```
```
GISTENTRY *entry = (GISTENTRY *) PG_GETARG_POINTER(0);
```
```
GISTENTRY *retval;
```
```
if (entry->leafkey)
```
```
{
```
/* replace entry->key with a compressed version */
compressed_data_type *compressed_data =
```
palloc(sizeof(compressed_data_type));
```
/* fill *compressed_data from entry->key ... */
```
retval = palloc(sizeof(GISTENTRY));
```
```
gistentryinit(*retval, PointerGetDatum(compressed_data),
```
entry->rel, entry->page, entry->offset,
```
FALSE);
```
```
}
```
else
```
{
```
/* typically we needn't do anything with non-leaf
entries */
```
retval = entry;
```
```
}
```
```
PG_RETURN_POINTER(retval);
```
```
}
```
You have to adapt compressed_data_type to the specific type you're converting to in order
to compress your leaf nodes, of course.
2595
Built-in Index Access Methods
decompress
Converts the stored representation of a data item into a format that can be manipulated by the
other GiST methods in the operator class. If the decompress method is omitted, it is assumed
```
that the other GiST methods can work directly on the stored data format. (decompress is not
```
```
necessarily the reverse of the compress method; in particular, if compress is lossy then it's
```
impossible for decompress to exactly reconstruct the original data. decompress is not nec-
essarily equivalent to fetch, either, since the other GiST methods might not require full recon-
```
struction of the data.)
```
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_decompress(internal)
```
RETURNS internal
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
And the matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_decompress);
```
Datum
```
my_decompress(PG_FUNCTION_ARGS)
```
```
{
```
```
PG_RETURN_POINTER(PG_GETARG_POINTER(0));
```
```
}
```
```
The above skeleton is suitable for the case where no decompression is needed. (But, of course,
```
```
omitting the method altogether is even easier, and is recommended in such cases.)
```
penalty
Returns a value indicating the “cost” of inserting the new entry into a particular branch of the tree.
Items will be inserted down the path of least penalty in the tree. Values returned by penalty
should be non-negative. If a negative value is returned, it will be treated as zero.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_penalty(internal, internal,
```
```
internal)
```
RETURNS internal
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT; -- in some cases penalty functions need not
```
be strict
And the matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_penalty);
```
Datum
```
my_penalty(PG_FUNCTION_ARGS)
```
```
{
```
```
GISTENTRY *origentry = (GISTENTRY *) PG_GETARG_POINTER(0);
```
```
GISTENTRY *newentry = (GISTENTRY *) PG_GETARG_POINTER(1);
```
```
float *penalty = (float *) PG_GETARG_POINTER(2);
```
```
data_type *orig = DatumGetDataType(origentry->key);
```
```
data_type *new = DatumGetDataType(newentry->key);
```
2596
Built-in Index Access Methods
```
*penalty = my_penalty_implementation(orig, new);
```
```
PG_RETURN_POINTER(penalty);
```
```
}
```
```
For historical reasons, the penalty function doesn't just return a float result; instead it has to
```
store the value at the location indicated by the third argument. The return value per se is ignored,
though it's conventional to pass back the address of that argument.
The penalty function is crucial to good performance of the index. It'll get used at insertion time
to determine which branch to follow when choosing where to add the new entry in the tree. At
query time, the more balanced the index, the quicker the lookup.
picksplit
When an index page split is necessary, this function decides which entries on the page are to stay
on the old page, and which are to move to the new page.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_picksplit(internal, internal)
```
RETURNS internal
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
And the matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_picksplit);
```
Datum
```
my_picksplit(PG_FUNCTION_ARGS)
```
```
{
```
```
GistEntryVector *entryvec = (GistEntryVector *)
```
```
PG_GETARG_POINTER(0);
```
```
GIST_SPLITVEC *v = (GIST_SPLITVEC *) PG_GETARG_POINTER(1);
```
```
OffsetNumber maxoff = entryvec->n - 1;
```
```
GISTENTRY *ent = entryvec->vector;
```
int i,
```
nbytes;
```
OffsetNumber *left,
```
*right;
```
```
data_type *tmp_union;
```
```
data_type *unionL;
```
```
data_type *unionR;
```
```
GISTENTRY **raw_entryvec;
```
```
maxoff = entryvec->n - 1;
```
```
nbytes = (maxoff + 1) * sizeof(OffsetNumber);
```
```
v->spl_left = (OffsetNumber *) palloc(nbytes);
```
```
left = v->spl_left;
```
```
v->spl_nleft = 0;
```
```
v->spl_right = (OffsetNumber *) palloc(nbytes);
```
```
right = v->spl_right;
```
```
v->spl_nright = 0;
```
```
unionL = NULL;
```
2597
Built-in Index Access Methods
```
unionR = NULL;
```
/* Initialize the raw entry vector. */
```
raw_entryvec = (GISTENTRY **) malloc(entryvec->n *
```
```
sizeof(void *));
```
```
for (i = FirstOffsetNumber; i <= maxoff; i =
```
```
OffsetNumberNext(i))
```
```
raw_entryvec[i] = &(entryvec->vector[i]);
```
```
for (i = FirstOffsetNumber; i <= maxoff; i =
```
```
OffsetNumberNext(i))
```
```
{
```
int real_index = raw_entryvec[i] - entryvec-
```
>vector;
```
```
tmp_union = DatumGetDataType(entryvec-
```
```
>vector[real_index].key);
```
```
Assert(tmp_union != NULL);
```
/*
- Choose where to put the index entries and update
unionL and unionR
- accordingly. Append the entries to either v->spl_left
or
- v->spl_right, and care about the counters.
*/
```
if (my_choice_is_left(unionL, curl, unionR, curr))
```
```
{
```
```
if (unionL == NULL)
```
```
unionL = tmp_union;
```
else
```
unionL = my_union_implementation(unionL,
```
```
tmp_union);
```
```
*left = real_index;
```
```
++left;
```
```
++(v->spl_nleft);
```
```
}
```
else
```
{
```
/*
- Same on the right
*/
```
}
```
```
}
```
```
v->spl_ldatum = DataTypeGetDatum(unionL);
```
```
v->spl_rdatum = DataTypeGetDatum(unionR);
```
```
PG_RETURN_POINTER(v);
```
```
}
```
Notice that the picksplit function's result is delivered by modifying the passed-in v structure.
The return value per se is ignored, though it's conventional to pass back the address of v.
Like penalty, the picksplit function is crucial to good performance of the index. Designing
suitable penalty and picksplit implementations is where the challenge of implementing
well-performing GiST indexes lies.
2598
Built-in Index Access Methods
same
```
Returns true if two index entries are identical, false otherwise. (An “index entry” is a value of the
```
```
index's storage type, not necessarily the original indexed column's type.)
```
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_same(storage_type, storage_type,
```
```
internal)
```
RETURNS internal
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
And the matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_same);
```
Datum
```
my_same(PG_FUNCTION_ARGS)
```
```
{
```
```
prefix_range *v1 = PG_GETARG_PREFIX_RANGE_P(0);
```
```
prefix_range *v2 = PG_GETARG_PREFIX_RANGE_P(1);
```
```
bool *result = (bool *) PG_GETARG_POINTER(2);
```
```
*result = my_eq(v1, v2);
```
```
PG_RETURN_POINTER(result);
```
```
}
```
```
For historical reasons, the same function doesn't just return a Boolean result; instead it has to
```
store the flag at the location indicated by the third argument. The return value per se is ignored,
though it's conventional to pass back the address of that argument.
distance
Given an index entry p and a query value q, this function determines the index entry's “distance”
from the query value. This function must be supplied if the operator class contains any ordering
operators. A query using the ordering operator will be implemented by returning index entries
with the smallest “distance” values first, so the results must be consistent with the operator's
```
semantics. For a leaf index entry the result just represents the distance to the index entry; for an
```
internal tree node, the result must be the smallest distance that any child entry could have.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_distance(internal, data_type,
```
```
smallint, oid, internal)
```
RETURNS float8
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
And the matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_distance);
```
Datum
```
my_distance(PG_FUNCTION_ARGS)
```
```
{
```
```
GISTENTRY *entry = (GISTENTRY *) PG_GETARG_POINTER(0);
```
```
data_type *query = PG_GETARG_DATA_TYPE_P(1);
```
2599
Built-in Index Access Methods
```
StrategyNumber strategy = (StrategyNumber)
```
```
PG_GETARG_UINT16(2);
```
```
/* Oid subtype = PG_GETARG_OID(3); */
```
```
/* bool *recheck = (bool *) PG_GETARG_POINTER(4); */
```
```
data_type *key = DatumGetDataType(entry->key);
```
```
double retval;
```
/*
- determine return value as a function of strategy, key and
query.
*/
```
PG_RETURN_FLOAT8(retval);
```
```
}
```
The arguments to the distance function are identical to the arguments of the consistent
function.
Some approximation is allowed when determining the distance, so long as the result is never
greater than the entry's actual distance. Thus, for example, distance to a bounding box is usually
sufficient in geometric applications. For an internal tree node, the distance returned must not
be greater than the distance to any of the child nodes. If the returned distance is not exact, the
```
function must set *recheck to true. (This is not necessary for internal tree nodes; for them, the
```
```
calculation is always assumed to be inexact.) In this case the executor will calculate the accurate
```
distance after fetching the tuple from the heap, and reorder the tuples if necessary.
If the distance function returns *recheck = true for any leaf node, the original ordering
operator's return type must be float8 or float4, and the distance function's result values
must be comparable to those of the original ordering operator, since the executor will sort using
both distance function results and recalculated ordering-operator results. Otherwise, the distance
function's result values can be any finite float8 values, so long as the relative order of the
```
result values matches the order returned by the ordering operator. (Infinity and minus infinity are
```
used internally to handle cases such as nulls, so it is not recommended that distance functions
```
return these values.)
```
fetch
Converts the compressed index representation of a data item into the original data type, for in-
dex-only scans. The returned data must be an exact, non-lossy copy of the originally indexed
value.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_fetch(internal)
```
RETURNS internal
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
The argument is a pointer to a GISTENTRY struct. On entry, its key field contains a non-NULL
leaf datum in compressed form. The return value is another GISTENTRY struct, whose key field
contains the same datum in its original, uncompressed form. If the opclass's compress function
does nothing for leaf entries, the fetch method can return the argument as-is. Or, if the opclass
does not have a compress function, the fetch method can be omitted as well, since it would
necessarily be a no-op.
The matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_fetch);
```
2600
Built-in Index Access Methods
Datum
```
my_fetch(PG_FUNCTION_ARGS)
```
```
{
```
```
GISTENTRY *entry = (GISTENTRY *) PG_GETARG_POINTER(0);
```
```
input_data_type *in = DatumGetPointer(entry->key);
```
```
fetched_data_type *fetched_data;
```
```
GISTENTRY *retval;
```
```
retval = palloc(sizeof(GISTENTRY));
```
```
fetched_data = palloc(sizeof(fetched_data_type));
```
/*
- Convert 'fetched_data' into the a Datum of the original
datatype.
*/
/* fill *retval from fetched_data. */
```
gistentryinit(*retval, PointerGetDatum(converted_datum),
```
entry->rel, entry->page, entry->offset,
```
FALSE);
```
```
PG_RETURN_POINTER(retval);
```
```
}
```
If the compress method is lossy for leaf entries, the operator class cannot support index-only scans,
and must not define a fetch function.
options
Allows definition of user-visible parameters that control operator class behavior.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_options(internal)
```
RETURNS void
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
The function is passed a pointer to a local_relopts struct, which needs to be filled with a
set of operator class specific options. The options can be accessed from other support functions
```
using the PG_HAS_OPCLASS_OPTIONS() and PG_GET_OPCLASS_OPTIONS() macros.
```
```
An example implementation of my_options() and parameters use from other support functions
```
are given below:
typedef enum MyEnumType
```
{
```
MY_ENUM_ON,
MY_ENUM_OFF,
MY_ENUM_AUTO
```
} MyEnumType;
```
typedef struct
```
{
```
```
int32 vl_len_; /* varlena header (do not touch
```
```
directly!) */
```
```
int int_param; /* integer parameter */
```
```
double real_param; /* real parameter */
```
2601
Built-in Index Access Methods
```
MyEnumType enum_param; /* enum parameter */
```
```
int str_param; /* string parameter */
```
```
} MyOptionsStruct;
```
/* String representation of enum values */
static relopt_enum_elt_def myEnumValues[] =
```
{
```
```
{"on", MY_ENUM_ON},
```
```
{"off", MY_ENUM_OFF},
```
```
{"auto", MY_ENUM_AUTO},
```
```
{(const char *) NULL} /* list terminator */
```
```
};
```
```
static char *str_param_default = "default";
```
/*
- Sample validator: checks that string is not longer than 8
bytes.
*/
static void
```
validate_my_string_relopt(const char *value)
```
```
{
```
```
if (strlen(value) > 8)
```
```
ereport(ERROR,
```
```
(errcode(ERRCODE_INVALID_PARAMETER_VALUE),
```
```
errmsg("str_param must be at most 8 bytes")));
```
```
}
```
/*
- Sample filler: switches characters to lower case.
*/
static Size
```
fill_my_string_relopt(const char *value, void *ptr)
```
```
{
```
```
char *tmp = str_tolower(value, strlen(value),
```
```
DEFAULT_COLLATION_OID);
```
```
int len = strlen(tmp);
```
```
if (ptr)
```
```
strcpy(ptr, tmp);
```
```
pfree(tmp);
```
```
return len + 1;
```
```
}
```
```
PG_FUNCTION_INFO_V1(my_options);
```
Datum
```
my_options(PG_FUNCTION_ARGS)
```
```
{
```
```
local_relopts *relopts = (local_relopts *)
```
```
PG_GETARG_POINTER(0);
```
```
init_local_reloptions(relopts, sizeof(MyOptionsStruct));
```
```
add_local_int_reloption(relopts, "int_param", "integer
```
parameter",
100, 0, 1000000,
2602
Built-in Index Access Methods
```
offsetof(MyOptionsStruct,
```
```
int_param));
```
```
add_local_real_reloption(relopts, "real_param", "real
```
parameter",
1.0, 0.0, 1000000.0,
```
offsetof(MyOptionsStruct,
```
```
real_param));
```
```
add_local_enum_reloption(relopts, "enum_param", "enum
```
parameter",
myEnumValues, MY_ENUM_ON,
"Valid values are: \"on\", \"off\"
and \"auto\".",
```
offsetof(MyOptionsStruct,
```
```
enum_param));
```
```
add_local_string_reloption(relopts, "str_param", "string
```
parameter",
str_param_default,
&validate_my_string_relopt,
&fill_my_string_relopt,
```
offsetof(MyOptionsStruct,
```
```
str_param));
```
```
PG_RETURN_VOID();
```
```
}
```
```
PG_FUNCTION_INFO_V1(my_compress);
```
Datum
```
my_compress(PG_FUNCTION_ARGS)
```
```
{
```
```
int int_param = 100;
```
```
double real_param = 1.0;
```
```
MyEnumType enum_param = MY_ENUM_ON;
```
```
char *str_param = str_param_default;
```
/*
- Normally, when opclass contains 'options' method, then
options are always
- passed to support functions. However, if you add
'options' method to
- existing opclass, previously defined indexes have no
options, so the
- check is required.
*/
```
if (PG_HAS_OPCLASS_OPTIONS())
```
```
{
```
```
MyOptionsStruct *options = (MyOptionsStruct *)
```
```
PG_GET_OPCLASS_OPTIONS();
```
```
int_param = options->int_param;
```
```
real_param = options->real_param;
```
```
enum_param = options->enum_param;
```
```
str_param = GET_STRING_RELOPTION(options, str_param);
```
```
}
```
/* the rest implementation of support function */
```
}
```
2603
Built-in Index Access Methods
Since the representation of the key in GiST is flexible, it may depend on user-specified parameters.
```
For instance, the length of key signature may be specified. See gtsvector_options() for
```
example.
sortsupport
Returns a comparator function to sort data in a way that preserves locality. It is used by CREATE
INDEX and REINDEX commands. The quality of the created index depends on how well the sort
order determined by the comparator function preserves locality of the inputs.
The sortsupport method is optional. If it is not provided, CREATE INDEX builds the index
by inserting each tuple to the tree using the penalty and picksplit functions, which is much
slower.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_sortsupport(internal)
```
RETURNS void
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
The argument is a pointer to a SortSupport struct. At a minimum, the function must fill in its
comparator field. The comparator takes three arguments: two Datums to compare, and a pointer
to the SortSupport struct. The Datums are the two indexed values in the format that they are
```
stored in the index; that is, in the format returned by the compress method. The full API is
```
defined in src/include/utils/sortsupport.h.
The matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_sortsupport);
```
static int
```
my_fastcmp(Datum x, Datum y, SortSupport ssup)
```
```
{
```
/* establish order between x and y by computing some sorting
value z */
```
int z1 = ComputeSpatialCode(x);
```
```
int z2 = ComputeSpatialCode(y);
```
```
return z1 == z2 ? 0 : z1 > z2 ? 1 : -1;
```
```
}
```
Datum
```
my_sortsupport(PG_FUNCTION_ARGS)
```
```
{
```
```
SortSupport ssup = (SortSupport) PG_GETARG_POINTER(0);
```
```
ssup->comparator = my_fastcmp;
```
```
PG_RETURN_VOID();
```
```
}
```
translate_cmptype
Given a CompareType value from src/include/nodes/primnodes.h, returns a strat-
egy number used by this operator class for matching functionality. The function should return
InvalidStrategy if the operator class has no matching strategy.
2604
Built-in Index Access Methods
```
This is used for temporal index constraints (i.e., PRIMARY KEY and UNIQUE). If the operator
```
class provides this function and it returns results for COMPARE_EQ, it can be used in the non-
```
WITHOUT OVERLAPS part(s) of an index constraint.
```
This support function corresponds to the index access method callback function amtranslate-
```
cmptype (see Section 63.2). The amtranslatecmptype callback function for GiST indexes
```
merely calls down to the translate_cmptype support function of the respective operator
family, since the GiST index access method has no fixed strategy numbers itself.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_translate_cmptype(integer)
```
RETURNS smallint
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
And the operator family registration must look like this:
ALTER OPERATOR FAMILY my_opfamily USING gist ADD
```
FUNCTION 12 ("any", "any") my_translate_cmptype(int);
```
The matching code in the C module could then follow this skeleton:
```
PG_FUNCTION_INFO_V1(my_translate_cmptype);
```
Datum
```
my_translate_cmptype(PG_FUNCTION_ARGS)
```
```
{
```
```
CompareType cmptype = PG_GETARG_INT32(0);
```
```
StrategyNumber ret = InvalidStrategy;
```
```
switch (cmptype)
```
```
{
```
case COMPARE_EQ:
```
ret = BTEqualStrategyNumber;
```
```
}
```
```
PG_RETURN_UINT16(ret);
```
```
}
```
One translation function is provided by PostgreSQL: gist_translate_cmptype_common
is for operator classes that use the RT*StrategyNumber constants. The btree_gist exten-
sion defines a second translation function, gist_translate_cmptype_btree, for opera-
tor classes that use the BT*StrategyNumber constants.
```
All the GiST support methods are normally called in short-lived memory contexts; that is, Current-
```
MemoryContext will get reset after each tuple is processed. It is therefore not very important to
worry about pfree'ing everything you palloc. However, in some cases it's useful for a support method
to cache data across repeated calls. To do that, allocate the longer-lived data in fcinfo->flinfo-
>fn_mcxt, and keep a pointer to it in fcinfo->flinfo->fn_extra. Such data will survive for
```
the life of the index operation (e.g., a single GiST index scan, index build, or index tuple insertion).
```
Be careful to pfree the previous value when replacing a fn_extra value, or the leak will accumulate
for the duration of the operation.
2605
Built-in Index Access Methods
65.2.4. Implementation
65.2.4.1. GiST Index Build Methods
The simplest way to build a GiST index is just to insert all the entries, one by one. This tends to be
slow for large indexes, because if the index tuples are scattered across the index and the index is large
enough to not fit in cache, a lot of random I/O will be needed. PostgreSQL supports two alternative
methods for initial build of a GiST index: sorted and buffered modes.
The sorted method is only available if each of the opclasses used by the index provides a sortsup-
port function, as described in Section 65.2.3. If they do, this method is usually the best, so it is used
by default.
The buffered method works by not inserting tuples directly into the index right away. It can dramati-
cally reduce the amount of random I/O needed for non-ordered data sets. For well-ordered data sets
the benefit is smaller or non-existent, because only a small number of pages receive new tuples at a
time, and those pages fit in cache even if the index as a whole does not.
The buffered method needs to call the penalty function more often than the simple method does,
which consumes some extra CPU resources. Also, the buffers need temporary disk space, up to the size
of the resulting index. Buffering can also influence the quality of the resulting index, in both positive
and negative directions. That influence depends on various factors, like the distribution of the input
data and the operator class implementation.
If sorting is not possible, then by default a GiST index build switches to the buffering method when
the index size reaches effective_cache_size. Buffering can be manually forced or prevented by the
buffering parameter to the CREATE INDEX command. The default behavior is good for most
cases, but turning buffering off might speed up the build somewhat if the input data is ordered.
65.2.5. Examples
The PostgreSQL source distribution includes several examples of index methods implemented us-
```
ing GiST. The core system currently provides text search support (indexing for tsvector and ts-
```
```
query) as well as R-Tree equivalent functionality for some of the built-in geometric data types (see
```
```
src/backend/access/gist/gistproc.c). The following contrib modules also contain
```
GiST operator classes:
btree_gist
B-tree equivalent functionality for several data types
cube
Indexing for multidimensional cubes
hstore
```
Module for storing (key, value) pairs
```
intarray
RD-Tree for one-dimensional array of int4 values
ltree
Indexing for tree-like structures
pg_trgm
Text similarity using trigram matching
2606
Built-in Index Access Methods
seg
Indexing for “float ranges”
65.3. SP-GiST Indexes
65.3.1. Introduction
SP-GiST is an abbreviation for space-partitioned GiST. SP-GiST supports partitioned search trees,
which facilitate development of a wide range of different non-balanced data structures, such as quad-
```
trees, k-d trees, and radix trees (tries). The common feature of these structures is that they repeatedly
```
divide the search space into partitions that need not be of equal size. Searches that are well matched
to the partitioning rule can be very fast.
These popular data structures were originally developed for in-memory usage. In main memory, they
are usually designed as a set of dynamically allocated nodes linked by pointers. This is not suitable
for direct storing on disk, since these chains of pointers can be rather long which would require too
many disk accesses. In contrast, disk-based data structures should have a high fanout to minimize I/
O. The challenge addressed by SP-GiST is to map search tree nodes to disk pages in such a way that
a search need access only a few disk pages, even if it traverses many nodes.
Like GiST, SP-GiST is meant to allow the development of custom data types with the appropriate
access methods, by an expert in the domain of the data type, rather than a database expert.
Some of the information here is derived from Purdue University's SP-GiST Indexing Project web
site4. The SP-GiST implementation in PostgreSQL is primarily maintained by Teodor Sigaev and Oleg
Bartunov, and there is more information on their web site5.
65.3.2. Built-in Operator Classes
The core PostgreSQL distribution includes the SP-GiST operator classes shown in Table 65.2.
Table 65.2. Built-in SP-GiST Operator Classes
Name Indexable Operators Ordering Operators
```
<< (box,box)
```
```
&< (box,box)
```
```
&> (box,box)
```
```
>> (box,box)
```
```
<@ (box,box)
```
```
@> (box,box)
```
```
~= (box,box)
```
```
&& (box,box)
```
```
<<| (box,box)
```
```
&<| (box,box)
```
```
|&> (box,box)
```
box_ops
```
|>> (box,box)
```
```
<-> (box,point)
```
```
<< (inet,inet)
```
```
<<= (inet,inet)inet_ops
```
```
>> (inet,inet)
```
4 https://www.cs.purdue.edu/spgist/
5 http://www.sai.msu.su/~megera/wiki/spgist_dev
2607
Built-in Index Access Methods
Name Indexable Operators Ordering Operators
```
>>= (inet,inet)
```
```
= (inet,inet)
```
```
<> (inet,inet)
```
```
< (inet,inet)
```
```
<= (inet,inet)
```
```
> (inet,inet)
```
```
>= (inet,inet)
```
```
&& (inet,inet)
```
```
|>> (point,point)
```
```
<< (point,point)
```
```
>> (point,point)
```
```
<<| (point,point)
```
```
~= (point,point)
```
kd_point_ops
```
<@ (point,box)
```
```
<-> (point,point)
```
```
<< (polygon,polygon)
```
```
&< (polygon,polygon)
```
```
&> (polygon,polygon)
```
```
>> (polygon,polygon)
```
```
<@ (polygon,polygon)
```
```
@> (polygon,polygon)
```
```
~= (polygon,polygon)
```
```
&& (polygon,polygon)
```
```
<<| (polygon,polygon)
```
```
&<| (polygon,polygon)
```
```
|>> (polygon,polygon)
```
poly_ops
```
|&> (polygon,polygon)
```
```
<-> (polygon,point)
```
```
|>> (point,point)
```
```
<< (point,point)
```
```
>> (point,point)
```
```
<<| (point,point)
```
```
~= (point,point)
```
quad_point_ops
```
<@ (point,box)
```
```
<-> (point,point)
```
```
= (anyrange,anyrange)
```
&&
```
(anyrange,anyrange)
```
```
@> (anyrange,anyele-
```
```
ment)
```
@>
```
(anyrange,anyrange)
```
range_ops
<@
```
(anyrange,anyrange)
```
2608
Built-in Index Access Methods
Name Indexable Operators Ordering Operators
<<
```
(anyrange,anyrange)
```
>>
```
(anyrange,anyrange)
```
&<
```
(anyrange,anyrange)
```
&>
```
(anyrange,anyrange)
```
-|-
```
(anyrange,anyrange)
```
```
= (text,text)
```
```
< (text,text)
```
```
<= (text,text)
```
```
> (text,text)
```
```
>= (text,text)
```
```
~<~ (text,text)
```
```
~<=~ (text,text)
```
```
~>=~ (text,text)
```
```
~>~ (text,text)
```
text_ops
```
^@ (text,text)
```
Of the two operator classes for type point, quad_point_ops is the default. kd_point_ops
supports the same operators but uses a different index data structure that may offer better performance
in some applications.
The quad_point_ops, kd_point_ops and poly_ops operator classes support the <-> order-
```
ing operator, which enables the k-nearest neighbor (k-NN) search over indexed point or polygon data
```
sets.
65.3.3. Extensibility
SP-GiST offers an interface with a high level of abstraction, requiring the access method developer to
implement only methods specific to a given data type. The SP-GiST core is responsible for efficient
disk mapping and searching the tree structure. It also takes care of concurrency and logging consid-
erations.
Leaf tuples of an SP-GiST tree usually contain values of the same data type as the indexed column,
although it is also possible for them to contain lossy representations of the indexed column. Leaf
tuples stored at the root level will directly represent the original indexed data value, but leaf tuples at
lower levels might contain only a partial value, such as a suffix. In that case the operator class support
functions must be able to reconstruct the original value using information accumulated from the inner
tuples that are passed through to reach the leaf level.
When an SP-GiST index is created with INCLUDE columns, the values of those columns are also
stored in leaf tuples. The INCLUDE columns are of no concern to the SP-GiST operator class, so they
are not discussed further here.
Inner tuples are more complex, since they are branching points in the search tree. Each inner tuple
contains a set of one or more nodes, which represent groups of similar leaf values. A node contains
a downlink that leads either to another, lower-level inner tuple, or to a short list of leaf tuples that all
```
lie on the same index page. Each node normally has a label that describes it; for example, in a radix
```
```
tree the node label could be the next character of the string value. (Alternatively, an operator class can
```
2609
Built-in Index Access Methods
```
omit the node labels, if it works with a fixed set of nodes for all inner tuples; see Section 65.3.4.2.)
```
Optionally, an inner tuple can have a prefix value that describes all its members. In a radix tree this
could be the common prefix of the represented strings. The prefix value is not necessarily really a
```
prefix, but can be any data needed by the operator class; for example, in a quad-tree it can store the
```
central point that the four quadrants are measured with respect to. A quad-tree inner tuple would then
also contain four nodes corresponding to the quadrants around this central point.
```
Some tree algorithms require knowledge of level (or depth) of the current tuple, so the SP-GiST core
```
provides the possibility for operator classes to manage level counting while descending the tree. There
is also support for incrementally reconstructing the represented value when that is needed, and for
```
passing down additional data (called traverse values) during a tree descent.
```
Note
The SP-GiST core code takes care of null entries. Although SP-GiST indexes do store entries
for nulls in indexed columns, this is hidden from the index operator class code: no null index
```
entries or search conditions will ever be passed to the operator class methods. (It is assumed
```
```
that SP-GiST operators are strict and so cannot succeed for null values.) Null values are there-
```
fore not discussed further here.
There are five user-defined methods that an index operator class for SP-GiST must provide, and two are
optional. All five mandatory methods follow the convention of accepting two internal arguments,
the first of which is a pointer to a C struct containing input values for the support method, while the
second argument is a pointer to a C struct where output values must be placed. Four of the mandatory
```
methods just return void, since all their results appear in the output struct; but leaf_consistent
```
returns a boolean result. The methods must not modify any fields of their input structs. In all cases,
the output struct is initialized to zeroes before calling the user-defined method. The optional sixth
method compress accepts a datum to be indexed as the only argument and returns a value suitable
for physical storage in a leaf tuple. The optional seventh method options accepts an internal
pointer to a C struct, where opclass-specific parameters should be placed, and returns void.
The five mandatory user-defined methods are:
config
Returns static information about the index implementation, including the data type OIDs of the
prefix and node label data types.
The SQL declaration of the function must look like this:
```
CREATE FUNCTION my_config(internal, internal) RETURNS void ...
```
The first argument is a pointer to a spgConfigIn C struct, containing input data for the function.
The second argument is a pointer to a spgConfigOut C struct, which the function must fill
with result data.
typedef struct spgConfigIn
```
{
```
```
Oid attType; /* Data type to be indexed */
```
```
} spgConfigIn;
```
typedef struct spgConfigOut
```
{
```
```
Oid prefixType; /* Data type of inner-tuple
```
prefixes */
```
Oid labelType; /* Data type of inner-tuple node
```
labels */
2610
Built-in Index Access Methods
```
Oid leafType; /* Data type of leaf-tuple
```
values */
```
bool canReturnData; /* Opclass can reconstruct
```
original data */
```
bool longValuesOK; /* Opclass can cope with values
```
> 1 page */
```
} spgConfigOut;
```
```
attType is passed in order to support polymorphic index operator classes; for ordinary fixed-
```
data-type operator classes, it will always have the same value and so can be ignored.
For operator classes that do not use prefixes, prefixType can be set to VOIDOID. Likewise,
for operator classes that do not use node labels, labelType can be set to VOIDOID. canRe-
turnData should be set true if the operator class is capable of reconstructing the originally-sup-
plied index value. longValuesOK should be set true only when the attType is of variable
```
length and the operator class is capable of segmenting long values by repeated suffixing (see
```
```
Section 65.3.4.1).
```
leafType should match the index storage type defined by the operator class's opckeytype
```
catalog entry. (Note that opckeytype can be zero, implying the storage type is the same as
```
```
the operator class's input type, which is the most common situation.) For reasons of backward
```
compatibility, the config method can set leafType to some other value, and that value will be
```
used; but this is deprecated since the index contents are then incorrectly identified in the catalogs.
```
```
Also, it's permissible to leave leafType uninitialized (zero); that is interpreted as meaning the
```
index storage type derived from opckeytype.
When attType and leafType are different, the optional method compress must be provid-
ed. Method compress is responsible for transformation of datums to be indexed from attType
to leafType.
choose
Chooses a method for inserting a new value into an inner tuple.
The SQL declaration of the function must look like this:
```
CREATE FUNCTION my_choose(internal, internal) RETURNS void ...
```
The first argument is a pointer to a spgChooseIn C struct, containing input data for the function.
The second argument is a pointer to a spgChooseOut C struct, which the function must fill
with result data.
typedef struct spgChooseIn
```
{
```
```
Datum datum; /* original datum to be indexed
```
*/
```
Datum leafDatum; /* current datum to be stored at
```
leaf */
```
int level; /* current level (counting from
```
```
zero) */
```
/* Data from current inner tuple */
```
bool allTheSame; /* tuple is marked all-the-same?
```
*/
```
bool hasPrefix; /* tuple has a prefix? */
```
```
Datum prefixDatum; /* if so, the prefix value */
```
```
int nNodes; /* number of nodes in the inner
```
tuple */
2611
Built-in Index Access Methods
```
Datum *nodeLabels; /* node label values (NULL if
```
```
none) */
```
```
} spgChooseIn;
```
typedef enum spgChooseResultType
```
{
```
```
spgMatchNode = 1, /* descend into existing node */
```
spgAddNode, /* add a node to the inner tuple
*/
```
spgSplitTuple /* split inner tuple (change its
```
```
prefix) */
```
```
} spgChooseResultType;
```
typedef struct spgChooseOut
```
{
```
```
spgChooseResultType resultType; /* action code, see
```
above */
union
```
{
```
struct /* results for spgMatchNode */
```
{
```
```
int nodeN; /* descend to this node
```
```
(index from 0) */
```
```
int levelAdd; /* increment level by this
```
much */
```
Datum restDatum; /* new leaf datum */
```
```
} matchNode;
```
struct /* results for spgAddNode */
```
{
```
```
Datum nodeLabel; /* new node's label */
```
```
int nodeN; /* where to insert it (index
```
```
from 0) */
```
```
} addNode;
```
struct /* results for spgSplitTuple */
```
{
```
/* Info to form new upper-level inner tuple with one
child tuple */
```
bool prefixHasPrefix; /* tuple should have
```
a prefix? */
```
Datum prefixPrefixDatum; /* if so, its value
```
*/
```
int prefixNNodes; /* number of nodes
```
*/
```
Datum *prefixNodeLabels; /* their labels (or
```
NULL for
- no labels) */
```
int childNodeN; /* which node gets
```
child tuple */
/* Info to form new lower-level inner tuple with all
old nodes */
```
bool postfixHasPrefix; /* tuple should have
```
a prefix? */
```
Datum postfixPrefixDatum; /* if so, its value
```
*/
```
} splitTuple;
```
```
} result;
```
```
} spgChooseOut;
```
2612
Built-in Index Access Methods
datum is the original datum of spgConfigIn.attType type that was to be inserted into the
index. leafDatum is a value of spgConfigOut.leafType type, which is initially a result
of method compress applied to datum when method compress is provided, or the same
value as datum otherwise. leafDatum can change at lower levels of the tree if the choose or
picksplit methods change it. When the insertion search reaches a leaf page, the current value
of leafDatum is what will be stored in the newly created leaf tuple. level is the current inner
tuple's level, starting at zero for the root level. allTheSame is true if the current inner tuple is
```
marked as containing multiple equivalent nodes (see Section 65.3.4.3). hasPrefix is true if the
```
```
current inner tuple contains a prefix; if so, prefixDatum is its value. nNodes is the number
```
of child nodes contained in the inner tuple, and nodeLabels is an array of their label values,
or NULL if there are no labels.
The choose function can determine either that the new value matches one of the existing child
nodes, or that a new child node must be added, or that the new value is inconsistent with the tuple
prefix and so the inner tuple must be split to create a less restrictive prefix.
If the new value matches one of the existing child nodes, set resultType to spgMatchNode.
```
Set nodeN to the index (from zero) of that node in the node array. Set levelAdd to the increment
```
in level caused by descending through that node, or leave it as zero if the operator class does not
use levels. Set restDatum to equal leafDatum if the operator class does not modify datums
from one level to the next, or otherwise set it to the modified value to be used as leafDatum
at the next level.
If a new child node must be added, set resultType to spgAddNode. Set nodeLabel to the
```
label to be used for the new node, and set nodeN to the index (from zero) at which to insert the
```
node in the node array. After the node has been added, the choose function will be called again
```
with the modified inner tuple; that call should result in an spgMatchNode result.
```
If the new value is inconsistent with the tuple prefix, set resultType to spgSplitTuple.
This action moves all the existing nodes into a new lower-level inner tuple, and replaces the exist-
ing inner tuple with a tuple having a single downlink pointing to the new lower-level inner tuple.
Set prefixHasPrefix to indicate whether the new upper tuple should have a prefix, and if
so set prefixPrefixDatum to the prefix value. This new prefix value must be sufficiently
less restrictive than the original to accept the new value to be indexed. Set prefixNNodes to
the number of nodes needed in the new tuple, and set prefixNodeLabels to a palloc'd array
holding their labels, or to NULL if node labels are not required. Note that the total size of the
```
new upper tuple must be no more than the total size of the tuple it is replacing; this constrains
```
```
the lengths of the new prefix and new labels. Set childNodeN to the index (from zero) of the
```
node that will downlink to the new lower-level inner tuple. Set postfixHasPrefix to indi-
cate whether the new lower-level inner tuple should have a prefix, and if so set postfixPre-
fixDatum to the prefix value. The combination of these two prefixes and the downlink node's
```
label (if any) must have the same meaning as the original prefix, because there is no opportuni-
```
ty to alter the node labels that are moved to the new lower-level tuple, nor to change any child
index entries. After the node has been split, the choose function will be called again with the
replacement inner tuple. That call may return an spgAddNode result, if no suitable node was
created by the spgSplitTuple action. Eventually choose must return spgMatchNode to
allow the insertion to descend to the next level.
picksplit
Decides how to create a new inner tuple over a set of leaf tuples.
The SQL declaration of the function must look like this:
```
CREATE FUNCTION my_picksplit(internal, internal) RETURNS
```
void ...
The first argument is a pointer to a spgPickSplitIn C struct, containing input data for the
function. The second argument is a pointer to a spgPickSplitOut C struct, which the function
must fill with result data.
2613
Built-in Index Access Methods
typedef struct spgPickSplitIn
```
{
```
```
int nTuples; /* number of leaf tuples */
```
```
Datum *datums; /* their datums (array of length
```
```
nTuples) */
```
```
int level; /* current level (counting from
```
```
zero) */
```
```
} spgPickSplitIn;
```
typedef struct spgPickSplitOut
```
{
```
```
bool hasPrefix; /* new inner tuple should have a
```
prefix? */
```
Datum prefixDatum; /* if so, its value */
```
```
int nNodes; /* number of nodes for new inner
```
tuple */
```
Datum *nodeLabels; /* their labels (or NULL for no
```
```
labels) */
```
```
int *mapTuplesToNodes; /* node index for each leaf
```
tuple */
```
Datum *leafTupleDatums; /* datum to store in each
```
new leaf tuple */
```
} spgPickSplitOut;
```
nTuples is the number of leaf tuples provided. datums is an array of their datum values of
spgConfigOut.leafType type. level is the current level that all the leaf tuples share, which
will become the level of the new inner tuple.
Set hasPrefix to indicate whether the new inner tuple should have a prefix, and if so set pre-
fixDatum to the prefix value. Set nNodes to indicate the number of nodes that the new inner
tuple will contain, and set nodeLabels to an array of their label values, or to NULL if node
```
labels are not required. Set mapTuplesToNodes to an array that gives the index (from zero)
```
of the node that each leaf tuple should be assigned to. Set leafTupleDatums to an array of
```
the values to be stored in the new leaf tuples (these will be the same as the input datums if the
```
```
operator class does not modify datums from one level to the next). Note that the picksplit
```
```
function is responsible for palloc'ing the nodeLabels, mapTuplesToNodes and leafTu-
```
pleDatums arrays.
If more than one leaf tuple is supplied, it is expected that the picksplit function will classify
```
them into more than one node; otherwise it is not possible to split the leaf tuples across multiple
```
pages, which is the ultimate purpose of this operation. Therefore, if the picksplit function
ends up placing all the leaf tuples in the same node, the core SP-GiST code will override that
decision and generate an inner tuple in which the leaf tuples are assigned at random to several
identically-labeled nodes. Such a tuple is marked allTheSame to signify that this has happened.
The choose and inner_consistent functions must take suitable care with such inner tu-
ples. See Section 65.3.4.3 for more information.
picksplit can be applied to a single leaf tuple only in the case that the config function set
longValuesOK to true and a larger-than-a-page input value has been supplied. In this case the
point of the operation is to strip off a prefix and produce a new, shorter leaf datum value. The
call will be repeated until a leaf datum short enough to fit on a page has been produced. See
Section 65.3.4.1 for more information.
inner_consistent
```
Returns set of nodes (branches) to follow during tree search.
```
2614
Built-in Index Access Methods
The SQL declaration of the function must look like this:
```
CREATE FUNCTION my_inner_consistent(internal, internal) RETURNS
```
void ...
The first argument is a pointer to a spgInnerConsistentIn C struct, containing input data
for the function. The second argument is a pointer to a spgInnerConsistentOut C struct,
which the function must fill with result data.
typedef struct spgInnerConsistentIn
```
{
```
```
ScanKey scankeys; /* array of operators and
```
comparison values */
```
ScanKey orderbys; /* array of ordering operators
```
and comparison
- values */
```
int nkeys; /* length of scankeys array */
```
```
int norderbys; /* length of orderbys array */
```
```
Datum reconstructedValue; /* value reconstructed
```
at parent */
```
void *traversalValue; /* opclass-specific traverse
```
value */
```
MemoryContext traversalMemoryContext; /* put new traverse
```
values here */
```
int level; /* current level (counting from
```
```
zero) */
```
```
bool returnData; /* original data must be
```
returned? */
/* Data from current inner tuple */
```
bool allTheSame; /* tuple is marked all-the-same?
```
*/
```
bool hasPrefix; /* tuple has a prefix? */
```
```
Datum prefixDatum; /* if so, the prefix value */
```
```
int nNodes; /* number of nodes in the inner
```
tuple */
```
Datum *nodeLabels; /* node label values (NULL if
```
```
none) */
```
```
} spgInnerConsistentIn;
```
typedef struct spgInnerConsistentOut
```
{
```
```
int nNodes; /* number of child nodes to be
```
visited */
```
int *nodeNumbers; /* their indexes in the node
```
array */
```
int *levelAdds; /* increment level by this much
```
for each */
```
Datum *reconstructedValues; /* associated
```
reconstructed values */
```
void **traversalValues; /* opclass-specific
```
traverse values */
```
double **distances; /* associated distances
```
*/
```
} spgInnerConsistentOut;
```
2615
Built-in Index Access Methods
```
The array scankeys, of length nkeys, describes the index search condition(s). These condi-
```
```
tions are combined with AND — only index entries that satisfy all of them are interesting. (Note
```
```
that nkeys = 0 implies that all index entries satisfy the query.) Usually the consistent function
```
only cares about the sk_strategy and sk_argument fields of each array entry, which re-
spectively give the indexable operator and comparison value. In particular it is not necessary to
check sk_flags to see if the comparison value is NULL, because the SP-GiST core code will
filter out such conditions. The array orderbys, of length norderbys, describes ordering op-
```
erators (if any) in the same manner. reconstructedValue is the value reconstructed for the
```
```
parent tuple; it is (Datum) 0 at the root level or if the inner_consistent function did not
```
provide a value at the parent level. traversalValue is a pointer to any traverse data passed
down from the previous call of inner_consistent on the parent index tuple, or NULL at
the root level. traversalMemoryContext is the memory context in which to store output
```
traverse values (see below). level is the current inner tuple's level, starting at zero for the root
```
```
level. returnData is true if reconstructed data is required for this query; this will only be so
```
if the config function asserted canReturnData. allTheSame is true if the current inner
```
tuple is marked “all-the-same”; in this case all the nodes have the same label (if any) and so either
```
```
all or none of them match the query (see Section 65.3.4.3). hasPrefix is true if the current
```
```
inner tuple contains a prefix; if so, prefixDatum is its value. nNodes is the number of child
```
nodes contained in the inner tuple, and nodeLabels is an array of their label values, or NULL
if the nodes do not have labels.
nNodes must be set to the number of child nodes that need to be visited by the search, and
nodeNumbers must be set to an array of their indexes. If the operator class keeps track of lev-
els, set levelAdds to an array of the level increments required when descending to each node
```
to be visited. (Often these increments will be the same for all the nodes, but that's not necessari-
```
```
ly so, so an array is used.) If value reconstruction is needed, set reconstructedValues to
```
```
an array of the values reconstructed for each child node to be visited; otherwise, leave recon-
```
structedValues as NULL. The reconstructed values are assumed to be of type spgCon-
```
figOut.leafType. (However, since the core system will do nothing with them except possi-
```
bly copy them, it is sufficient for them to have the same typlen and typbyval properties as
```
leafType.) If ordered search is performed, set distances to an array of distance values ac-
```
```
cording to orderbys array (nodes with lowest distances will be processed first). Leave it NULL
```
```
otherwise. If it is desired to pass down additional out-of-band information (“traverse values”) to
```
lower levels of the tree search, set traversalValues to an array of the appropriate traverse
```
values, one for each child node to be visited; otherwise, leave traversalValues as NULL.
```
Note that the inner_consistent function is responsible for palloc'ing the nodeNumbers,
levelAdds, distances, reconstructedValues, and traversalValues arrays in
the current memory context. However, any output traverse values pointed to by the traver-
salValues array should be allocated in traversalMemoryContext. Each traverse value
must be a single palloc'd chunk.
leaf_consistent
Returns true if a leaf tuple satisfies a query.
The SQL declaration of the function must look like this:
```
CREATE FUNCTION my_leaf_consistent(internal, internal) RETURNS
```
bool ...
The first argument is a pointer to a spgLeafConsistentIn C struct, containing input data
for the function. The second argument is a pointer to a spgLeafConsistentOut C struct,
which the function must fill with result data.
typedef struct spgLeafConsistentIn
```
{
```
```
ScanKey scankeys; /* array of operators and
```
comparison values */
2616
Built-in Index Access Methods
```
ScanKey orderbys; /* array of ordering operators
```
and comparison
- values */
```
int nkeys; /* length of scankeys array */
```
```
int norderbys; /* length of orderbys array */
```
```
Datum reconstructedValue; /* value reconstructed
```
at parent */
```
void *traversalValue; /* opclass-specific traverse
```
value */
```
int level; /* current level (counting from
```
```
zero) */
```
```
bool returnData; /* original data must be
```
returned? */
```
Datum leafDatum; /* datum in leaf tuple */
```
```
} spgLeafConsistentIn;
```
typedef struct spgLeafConsistentOut
```
{
```
```
Datum leafValue; /* reconstructed original
```
data, if any */
```
bool recheck; /* set true if operator must
```
be rechecked */
```
bool recheckDistances; /* set true if distances must
```
be rechecked */
```
double *distances; /* associated distances */
```
```
} spgLeafConsistentOut;
```
```
The array scankeys, of length nkeys, describes the index search condition(s). These condi-
```
```
tions are combined with AND — only index entries that satisfy all of them satisfy the query. (Note
```
```
that nkeys = 0 implies that all index entries satisfy the query.) Usually the consistent function
```
only cares about the sk_strategy and sk_argument fields of each array entry, which re-
spectively give the indexable operator and comparison value. In particular it is not necessary to
check sk_flags to see if the comparison value is NULL, because the SP-GiST core code will
filter out such conditions. The array orderbys, of length norderbys, describes the ordering
operators in the same manner. reconstructedValue is the value reconstructed for the parent
```
tuple; it is (Datum) 0 at the root level or if the inner_consistent function did not provide
```
a value at the parent level. traversalValue is a pointer to any traverse data passed down from
the previous call of inner_consistent on the parent index tuple, or NULL at the root level.
level is the current leaf tuple's level, starting at zero for the root level. returnData is true if
```
reconstructed data is required for this query; this will only be so if the config function asserted
```
canReturnData. leafDatum is the key value of spgConfigOut.leafType stored in the
current leaf tuple.
The function must return true if the leaf tuple matches the query, or false if not. In the true
```
case, if returnData is true then leafValue must be set to the value (of type spgCon-
```
```
figIn.attType) originally supplied to be indexed for this leaf tuple. Also, recheck may be
```
```
set to true if the match is uncertain and so the operator(s) must be re-applied to the actual heap
```
tuple to verify the match. If ordered search is performed, set distances to an array of distance
values according to orderbys array. Leave it NULL otherwise. If at least one of returned dis-
tances is not exact, set recheckDistances to true. In this case, the executor will calculate the
exact distances after fetching the tuple from the heap, and will reorder the tuples if needed.
The optional user-defined methods are:
2617
Built-in Index Access Methods
```
Datum compress(Datum in)
```
Converts a data item into a format suitable for physical storage in a leaf tuple of the index.
It accepts a value of type spgConfigIn.attType and returns a value of type spgCon-
figOut.leafType. The output value must not contain an out-of-line TOAST pointer.
```
Note: the compress method is only applied to values to be stored. The consistent methods
```
receive query scankeys unchanged, without transformation using compress.
options
Defines a set of user-visible parameters that control operator class behavior.
The SQL declaration of the function must look like this:
```
CREATE OR REPLACE FUNCTION my_options(internal)
```
RETURNS void
AS 'MODULE_PATHNAME'
```
LANGUAGE C STRICT;
```
The function is passed a pointer to a local_relopts struct, which needs to be filled with a
set of operator class specific options. The options can be accessed from other support functions
```
using the PG_HAS_OPCLASS_OPTIONS() and PG_GET_OPCLASS_OPTIONS() macros.
```
Since the representation of the key in SP-GiST is flexible, it may depend on user-specified pa-
rameters.
```
All the SP-GiST support methods are normally called in a short-lived memory context; that is, Cur-
```
rentMemoryContext will be reset after processing of each tuple. It is therefore not very important
```
to worry about pfree'ing everything you palloc. (The config method is an exception: it should try
```
to avoid leaking memory. But usually the config method need do nothing but assign constants into
```
the passed parameter struct.)
```
If the indexed column is of a collatable data type, the index collation will be passed to all the support
```
methods, using the standard PG_GET_COLLATION() mechanism.
```
65.3.4. Implementation
This section covers implementation details and other tricks that are useful for implementers of SP-
GiST operator classes to know.
65.3.4.1. SP-GiST Limits
```
Individual leaf tuples and inner tuples must fit on a single index page (8kB by default). Therefore,
```
when indexing values of variable-length data types, long values can only be supported by methods
such as radix trees, in which each level of the tree includes a prefix that is short enough to fit on a
page, and the final leaf level includes a suffix also short enough to fit on a page. The operator class
should set longValuesOK to true only if it is prepared to arrange for this to happen. Otherwise, the
SP-GiST core will reject any request to index a value that is too large to fit on an index page.
Likewise, it is the operator class's responsibility that inner tuples do not grow too large to fit on an
```
index page; this limits the number of child nodes that can be used in one inner tuple, as well as the
```
maximum size of a prefix value.
Another limitation is that when an inner tuple's node points to a set of leaf tuples, those tuples must all
```
be in the same index page. (This is a design decision to reduce seeking and save space in the links that
```
```
chain such tuples together.) If the set of leaf tuples grows too large for a page, a split is performed and
```
an intermediate inner tuple is inserted. For this to fix the problem, the new inner tuple must divide the
2618
Built-in Index Access Methods
set of leaf values into more than one node group. If the operator class's picksplit function fails to
do that, the SP-GiST core resorts to extraordinary measures described in Section 65.3.4.3.
When longValuesOK is true, it is expected that successive levels of the SP-GiST tree will absorb
more and more information into the prefixes and node labels of the inner tuples, making the required
leaf datum smaller and smaller, so that eventually it will fit on a page. To prevent bugs in operator
classes from causing infinite insertion loops, the SP-GiST core will raise an error if the leaf datum
does not become any smaller within ten cycles of choose method calls.
65.3.4.2. SP-GiST Without Node Labels
```
Some tree algorithms use a fixed set of nodes for each inner tuple; for example, in a quad-tree there are
```
always exactly four nodes corresponding to the four quadrants around the inner tuple's centroid point.
In such a case the code typically works with the nodes by number, and there is no need for explicit
```
node labels. To suppress node labels (and thereby save some space), the picksplit function can
```
return NULL for the nodeLabels array, and likewise the choose function can return NULL for the
prefixNodeLabels array during a spgSplitTuple action. This will in turn result in node-
Labels being NULL during subsequent calls to choose and inner_consistent. In principle,
node labels could be used for some inner tuples and omitted for others in the same index.
When working with an inner tuple having unlabeled nodes, it is an error for choose to return sp-
gAddNode, since the set of nodes is supposed to be fixed in such cases.
65.3.4.3. “All-the-Same” Inner Tuples
The SP-GiST core can override the results of the operator class's picksplit function when pick-
split fails to divide the supplied leaf values into at least two node categories. When this happens, the
```
new inner tuple is created with multiple nodes that each have the same label (if any) that picksplit
```
gave to the one node it did use, and the leaf values are divided at random among these equivalent
nodes. The allTheSame flag is set on the inner tuple to warn the choose and inner_consis-
tent functions that the tuple does not have the node set that they might otherwise expect.
When dealing with an allTheSame tuple, a choose result of spgMatchNode is interpreted to
```
mean that the new value can be assigned to any of the equivalent nodes; the core code will ignore the
```
```
supplied nodeN value and descend into one of the nodes at random (so as to keep the tree balanced).
```
```
It is an error for choose to return spgAddNode, since that would make the nodes not all equivalent;
```
the spgSplitTuple action must be used if the value to be inserted doesn't match the existing nodes.
When dealing with an allTheSame tuple, the inner_consistent function should return either
all or none of the nodes as targets for continuing the index search, since they are all equivalent. This
may or may not require any special-case code, depending on how much the inner_consistent
```
function normally assumes about the meaning of the nodes.
```
65.3.5. Examples
The PostgreSQL source distribution includes several examples of index operator classes for SP-
GiST, as described in Table 65.2. Look into src/backend/access/spgist/ and src/back-
end/utils/adt/ to see the code.
65.4. GIN Indexes
65.4.1. Introduction
GIN stands for Generalized Inverted Index. GIN is designed for handling cases where the items to be
indexed are composite values, and the queries to be handled by the index need to search for element
values that appear within the composite items. For example, the items could be documents, and the
queries could be searches for documents containing specific words.
2619
Built-in Index Access Methods
We use the word item to refer to a composite value that is to be indexed, and the word key to refer to
an element value. GIN always stores and searches for keys, not item values per se.
```
A GIN index stores a set of (key, posting list) pairs, where a posting list is a set of row IDs in which
```
the key occurs. The same row ID can appear in multiple posting lists, since an item can contain more
than one key. Each key value is stored only once, so a GIN index is very compact for cases where
the same key appears many times.
GIN is generalized in the sense that the GIN access method code does not need to know the specific
operations that it accelerates. Instead, it uses custom strategies defined for particular data types. The
strategy defines how keys are extracted from indexed items and query conditions, and how to deter-
mine whether a row that contains some of the key values in a query actually satisfies the query.
One advantage of GIN is that it allows the development of custom data types with the appropriate
access methods, by an expert in the domain of the data type, rather than a database expert. This is
much the same advantage as using GiST.
The GIN implementation in PostgreSQL is primarily maintained by Teodor Sigaev and Oleg Bartunov.
There is more information about GIN on their website6.
65.4.2. Built-in Operator Classes
```
The core PostgreSQL distribution includes the GIN operator classes shown in Table 65.3. (Some of
```
```
the optional modules described in Appendix F provide additional GIN operator classes.)
```
Table 65.3. Built-in GIN Operator Classes
Name Indexable Operators
```
&& (anyarray,anyarray)
```
```
@> (anyarray,anyarray)
```
```
<@ (anyarray,anyarray)
```
array_ops
```
= (anyarray,anyarray)
```
```
@> (jsonb,jsonb)
```
```
@? (jsonb,jsonpath)
```
```
@@ (jsonb,jsonpath)
```
```
? (jsonb,text)
```
```
?| (jsonb,text[])
```
jsonb_ops
```
?& (jsonb,text[])
```
```
@> (jsonb,jsonb)
```
```
@? (jsonb,jsonpath)jsonb_path_ops
```
```
@@ (jsonb,jsonpath)
```
```
tsvector_ops @@ (tsvector,tsquery)
```
Of the two operator classes for type jsonb, jsonb_ops is the default. jsonb_path_ops supports
fewer operators but offers better performance for those operators. See Section 8.14.4 for details.
65.4.3. Extensibility
The GIN interface has a high level of abstraction, requiring the access method implementer only to
implement the semantics of the data type being accessed. The GIN layer itself takes care of concur-
rency, logging and searching the tree structure.
6 http://www.sai.msu.su/~megera/wiki/Gin
2620
Built-in Index Access Methods
All it takes to get a GIN access method working is to implement a few user-defined methods, which
define the behavior of keys in the tree and the relationships between keys, indexed items, and indexable
queries. In short, GIN combines extensibility with generality, code reuse, and a clean interface.
There are two methods that an operator class for GIN must provide:
```
Datum *extractValue(Datum itemValue, int32 *nkeys, bool **nullFlags)
```
Returns a palloc'd array of keys given an item to be indexed. The number of returned keys must
be stored into *nkeys. If any of the keys can be null, also palloc an array of *nkeys bool
fields, store its address at *nullFlags, and set these null flags as needed. *nullFlags can
```
be left NULL (its initial value) if all keys are non-null. The return value can be NULL if the item
```
contains no keys.
```
Datum *extractQuery(Datum query, int32 *nkeys, StrategyNumber n, bool
```
```
**pmatch, Pointer **extra_data, bool **nullFlags, int32 *searchMode)
```
```
Returns a palloc'd array of keys given a value to be queried; that is, query is the value on the right-
```
hand side of an indexable operator whose left-hand side is the indexed column. n is the strategy
```
number of the operator within the operator class (see Section 36.16.2). Often, extractQuery
```
will need to consult n to determine the data type of query and the method it should use to extract
key values. The number of returned keys must be stored into *nkeys. If any of the keys can
be null, also palloc an array of *nkeys bool fields, store its address at *nullFlags, and set
```
these null flags as needed. *nullFlags can be left NULL (its initial value) if all keys are non-
```
null. The return value can be NULL if the query contains no keys.
searchMode is an output argument that allows extractQuery to specify details about how
```
the search will be done. If *searchMode is set to GIN_SEARCH_MODE_DEFAULT (which
```
```
is the value it is initialized to before call), only items that match at least one of the returned
```
keys are considered candidate matches. If *searchMode is set to GIN_SEARCH_MODE_IN-
CLUDE_EMPTY, then in addition to items containing at least one matching key, items that con-
```
tain no keys at all are considered candidate matches. (This mode is useful for implementing is-
```
```
subset-of operators, for example.) If *searchMode is set to GIN_SEARCH_MODE_ALL, then
```
all non-null items in the index are considered candidate matches, whether they match any of the
```
returned keys or not. (This mode is much slower than the other two choices, since it requires
```
scanning essentially the entire index, but it may be necessary to implement corner cases correct-
ly. An operator that needs this mode in most cases is probably not a good candidate for a GIN
```
operator class.) The symbols to use for setting this mode are defined in access/gin.h.
```
pmatch is an output argument for use when partial match is supported. To use it, extract-
Query must allocate an array of *nkeys bools and store its address at *pmatch. Each ele-
ment of the array should be set to true if the corresponding key requires partial match, false if
not. If *pmatch is set to NULL then GIN assumes partial match is not required. The variable is
initialized to NULL before call, so this argument can simply be ignored by operator classes that
do not support partial match.
extra_data is an output argument that allows extractQuery to pass additional data to the
consistent and comparePartial methods. To use it, extractQuery must allocate an
array of *nkeys pointers and store its address at *extra_data, then store whatever it wants
to into the individual pointers. The variable is initialized to NULL before call, so this argument
can simply be ignored by operator classes that do not require extra data. If *extra_data is
set, the whole array is passed to the consistent method, and the appropriate element to the
comparePartial method.
An operator class must also provide a function to check if an indexed item matches the query. It comes
in two flavors, a Boolean consistent function, and a ternary triConsistent function. tri-
Consistent covers the functionality of both, so providing triConsistent alone is sufficient.
However, if the Boolean variant is significantly cheaper to calculate, it can be advantageous to provide
both. If only the Boolean variant is provided, some optimizations that depend on refuting index items
before fetching all the keys are disabled.
2621
Built-in Index Access Methods
```
bool consistent(bool check[], StrategyNumber n, Datum query, int32
```
nkeys, Pointer extra_data[], bool *recheck, Datum queryKeys[], bool
```
nullFlags[])
```
```
Returns true if an indexed item satisfies the query operator with strategy number n (or might satis-
```
```
fy it, if the recheck indication is returned). This function does not have direct access to the indexed
```
item's value, since GIN does not store items explicitly. Rather, what is available is knowledge
about which key values extracted from the query appear in a given indexed item. The check
array has length nkeys, which is the same as the number of keys previously returned by ex-
tractQuery for this query datum. Each element of the check array is true if the indexed item
```
contains the corresponding query key, i.e., if (check[i] == true) the i-th key of the extract-
```
Query result array is present in the indexed item. The original query datum is passed in case the
consistent method needs to consult it, and so are the queryKeys[] and nullFlags[]
arrays previously returned by extractQuery. extra_data is the extra-data array returned
by extractQuery, or NULL if none.
When extractQuery returns a null key in queryKeys[], the corresponding check[] ele-
```
ment is true if the indexed item contains a null key; that is, the semantics of check[] are like IS
```
NOT DISTINCT FROM. The consistent function can examine the corresponding null-
Flags[] element if it needs to tell the difference between a regular value match and a null match.
On success, *recheck should be set to true if the heap tuple needs to be rechecked against the
query operator, or false if the index test is exact. That is, a false return value guarantees that the
```
heap tuple does not match the query; a true return value with *recheck set to false guarantees
```
```
that the heap tuple does match the query; and a true return value with *recheck set to true means
```
that the heap tuple might match the query, so it needs to be fetched and rechecked by evaluating
the query operator directly against the originally indexed item.
```
GinTernaryValue triConsistent(GinTernaryValue check[], StrategyNum-
```
ber n, Datum query, int32 nkeys, Pointer extra_data[], Datum
```
queryKeys[], bool nullFlags[])
```
triConsistent is similar to consistent, but instead of Booleans in the check vec-
tor, there are three possible values for each key: GIN_TRUE, GIN_FALSE and GIN_MAYBE.
GIN_FALSE and GIN_TRUE have the same meaning as regular Boolean values, while
GIN_MAYBE means that the presence of that key is not known. When GIN_MAYBE values are
present, the function should only return GIN_TRUE if the item certainly matches whether or
not the index item contains the corresponding query keys. Likewise, the function must return
GIN_FALSE only if the item certainly does not match, whether or not it contains the GIN_MAYBE
keys. If the result depends on the GIN_MAYBE entries, i.e., the match cannot be confirmed or
refuted based on the known query keys, the function must return GIN_MAYBE.
When there are no GIN_MAYBE values in the check vector, a GIN_MAYBE return value is the
equivalent of setting the recheck flag in the Boolean consistent function.
In addition, GIN must have a way to sort the key values stored in the index. The operator class can
define the sort ordering by specifying a comparison method:
```
int compare(Datum a, Datum b)
```
```
Compares two keys (not indexed items!) and returns an integer less than zero, zero, or greater
```
than zero, indicating whether the first key is less than, equal to, or greater than the second. Null
keys are never passed to this function.
Alternatively, if the operator class does not provide a compare method, GIN will look up the default
btree operator class for the index key data type, and use its comparison function. It is recommended to
specify the comparison function in a GIN operator class that is meant for just one data type, as looking
```
up the btree operator class costs a few cycles. However, polymorphic GIN operator classes (such as
```
```
array_ops) typically cannot specify a single comparison function.
```
2622
Built-in Index Access Methods
An operator class for GIN can optionally supply the following methods:
```
int comparePartial(Datum partial_key, Datum key, StrategyNumber n,
```
```
Pointer extra_data)
```
Compare a partial-match query key to an index key. Returns an integer whose sign indicates the
```
result: less than zero means the index key does not match the query, but the index scan should
```
```
continue; zero means that the index key does match the query; greater than zero indicates that
```
the index scan should stop because no more matches are possible. The strategy number n of
the operator that generated the partial match query is provided, in case its semantics are needed
to determine when to end the scan. Also, extra_data is the corresponding element of the
extra-data array made by extractQuery, or NULL if none. Null keys are never passed to this
function.
```
void options(local_relopts *relopts)
```
Defines a set of user-visible parameters that control operator class behavior.
The options function is passed a pointer to a local_relopts struct, which needs to be
filled with a set of operator class specific options. The options can be accessed from other support
```
functions using the PG_HAS_OPCLASS_OPTIONS() and PG_GET_OPCLASS_OPTIONS()
```
macros.
Since both key extraction of indexed values and representation of the key in GIN are flexible,
they may depend on user-specified parameters.
To support “partial match” queries, an operator class must provide the comparePartial method,
and its extractQuery method must set the pmatch parameter when a partial-match query is en-
countered. See Section 65.4.4.2 for details.
The actual data types of the various Datum values mentioned above vary depending on the operator
class. The item values passed to extractValue are always of the operator class's input type, and
all key values must be of the class's STORAGE type. The type of the query argument passed to
extractQuery, consistent and triConsistent is whatever is the right-hand input type of
the class member operator identified by the strategy number. This need not be the same as the indexed
type, so long as key values of the correct type can be extracted from it. However, it is recommended
that the SQL declarations of these three support functions use the opclass's indexed data type for the
query argument, even though the actual type might be something else depending on the operator.
65.4.4. Implementation
Internally, a GIN index contains a B-tree index constructed over keys, where each key is an element
```
of one or more indexed items (a member of an array, for example) and where each tuple in a leaf page
```
```
contains either a pointer to a B-tree of heap pointers (a “posting tree”), or a simple list of heap pointers
```
```
(a “posting list”) when the list is small enough to fit into a single index tuple along with the key value.
```
Figure 65.1 illustrates these components of a GIN index.
As of PostgreSQL 9.1, null key values can be included in the index. Also, placeholder nulls are in-
cluded in the index for indexed items that are null or contain no keys according to extractValue.
This allows searches that should find empty items to do so.
```
Multicolumn GIN indexes are implemented by building a single B-tree over composite values (column
```
```
number, key value). The key values for different columns can be of different types.
```
2623
Built-in Index Access Methods
Figure 65.1. GIN Internals
entry tree
posting tree posting tree posting tree
pending list
meta page
posting list posting list posting list
heap ptr
heap ptr heap ptr heap ptr heap ptr
65.4.4.1. GIN Fast Update Technique
Updating a GIN index tends to be slow because of the intrinsic nature of inverted indexes: insert-
```
ing or updating one heap row can cause many inserts into the index (one for each key extracted
```
```
from the indexed item). GIN is capable of postponing much of this work by inserting new tuples
```
into a temporary, unsorted list of pending entries. When the table is vacuumed or autoanalyzed, or
when gin_clean_pending_list function is called, or if the pending list becomes larger than
gin_pending_list_limit, the entries are moved to the main GIN data structure using the same bulk in-
sert techniques used during initial index creation. This greatly improves GIN index update speed, even
counting the additional vacuum overhead. Moreover the overhead work can be done by a background
process instead of in foreground query processing.
The main disadvantage of this approach is that searches must scan the list of pending entries in addition
to searching the regular index, and so a large list of pending entries will slow searches significantly.
Another disadvantage is that, while most updates are fast, an update that causes the pending list to
become “too large” will incur an immediate cleanup cycle and thus be much slower than other updates.
Proper use of autovacuum can minimize both of these problems.
If consistent response time is more important than update speed, use of pending entries can be disabled
by turning off the fastupdate storage parameter for a GIN index. See CREATE INDEX for details.
65.4.4.2. Partial Match Algorithm
GIN can support “partial match” queries, in which the query does not determine an exact match for
```
one or more keys, but the possible matches fall within a reasonably narrow range of key values (within
```
```
the key sorting order determined by the compare support method). The extractQuery method,
```
instead of returning a key value to be matched exactly, returns a key value that is the lower bound
of the range to be searched, and sets the pmatch flag true. The key range is then scanned using the
comparePartial method. comparePartial must return zero for a matching index key, less
than zero for a non-match that is still within the range to be searched, or greater than zero if the index
key is past the range that could match.
65.4.5. GIN Tips and Tricks
Create vs. insert
Insertion into a GIN index can be slow due to the likelihood of many keys being inserted for each
item. So, for bulk insertions into a table it is advisable to drop the GIN index and recreate it after
finishing bulk insertion.
2624
Built-in Index Access Methods
```
When fastupdate is enabled for GIN (see Section 65.4.4.1 for details), the penalty is less than
```
when it is not. But for very large updates it may still be best to drop and recreate the index.
maintenance_work_mem
```
Build time for a GIN index is very sensitive to the maintenance_work_mem setting; it doesn't
```
pay to skimp on work memory during index creation.
gin_pending_list_limit
During a series of insertions into an existing GIN index that has fastupdate enabled, the
system will clean up the pending-entry list whenever the list grows larger than gin_pend-
ing_list_limit. To avoid fluctuations in observed response time, it's desirable to have pend-
```
ing-list cleanup occur in the background (i.e., via autovacuum). Foreground cleanup operations
```
can be avoided by increasing gin_pending_list_limit or making autovacuum more ag-
gressive. However, enlarging the threshold of the cleanup operation means that if a foreground
cleanup does occur, it will take even longer.
gin_pending_list_limit can be overridden for individual GIN indexes by changing stor-
age parameters, which allows each GIN index to have its own cleanup threshold. For example,
it's possible to increase the threshold only for the GIN index which can be updated heavily, and
decrease it otherwise.
gin_fuzzy_search_limit
The primary goal of developing GIN indexes was to create support for highly scalable full-text
search in PostgreSQL, and there are often situations when a full-text search returns a very large
set of results. Moreover, this often happens when the query contains very frequent words, so that
the large result set is not even useful. Since reading many tuples from the disk and sorting them
```
could take a lot of time, this is unacceptable for production. (Note that the index search itself is
```
```
very fast.)
```
To facilitate controlled execution of such queries, GIN has a configurable soft upper limit on the
number of rows returned: the gin_fuzzy_search_limit configuration parameter. It is set
```
to 0 (meaning no limit) by default. If a non-zero limit is set, then the returned set is a subset of
```
the whole result set, chosen at random.
“Soft” means that the actual number of returned results could differ somewhat from the specified
limit, depending on the query and the quality of the system's random number generator.
```
From experience, values in the thousands (e.g., 5000 — 20000) work well.
```
65.4.6. Limitations
GIN assumes that indexable operators are strict. This means that extractValue will not be called
```
at all on a null item value (instead, a placeholder index entry is created automatically), and extrac-
```
```
tQuery will not be called on a null query value either (instead, the query is presumed to be unsatis-
```
```
fiable). Note however that null key values contained within a non-null composite item or query value
```
are supported.
65.4.7. Examples
The core PostgreSQL distribution includes the GIN operator classes previously shown in Table 65.3.
The following contrib modules also contain GIN operator classes:
btree_gin
B-tree equivalent functionality for several data types
hstore
```
Module for storing (key, value) pairs
```
2625
Built-in Index Access Methods
intarray
Enhanced support for int[]
pg_trgm
Text similarity using trigram matching
65.5. BRIN Indexes
65.5.1. Introduction
BRIN stands for Block Range Index. BRIN is designed for handling very large tables in which certain
columns have some natural correlation with their physical location within the table.
```
BRIN works in terms of block ranges (or “page ranges”). A block range is a group of pages that are
```
```
physically adjacent in the table; for each block range, some summary info is stored by the index. For
```
example, a table storing a store's sale orders might have a date column on which each order was placed,
```
and most of the time the entries for earlier orders will appear earlier in the table as well; a table storing
```
a ZIP code column might have all codes for a city grouped together naturally.
BRIN indexes can satisfy queries via regular bitmap index scans, and will return all tuples in all pages
within each range if the summary info stored by the index is consistent with the query conditions. The
query executor is in charge of rechecking these tuples and discarding those that do not match the query
conditions — in other words, these indexes are lossy. Because a BRIN index is very small, scanning
the index adds little overhead compared to a sequential scan, but may avoid scanning large parts of
the table that are known not to contain matching tuples.
The specific data that a BRIN index will store, as well as the specific queries that the index will be
able to satisfy, depend on the operator class selected for each column of the index. Data types having
a linear sort order can have operator classes that store the minimum and maximum value within each
```
block range, for instance; geometrical types might store the bounding box for all the objects in the
```
block range.
The size of the block range is determined at index creation time by the pages_per_range storage
parameter. The number of index entries will be equal to the size of the relation in pages divided by
the selected value for pages_per_range. Therefore, the smaller the number, the larger the index
```
becomes (because of the need to store more index entries), but at the same time the summary data
```
stored can be more precise and more data blocks can be skipped during an index scan.
65.5.1.1. Index Maintenance
At the time of creation, all existing heap pages are scanned and a summary index tuple is created for
each range, including the possibly-incomplete range at the end. As new pages are filled with data,
page ranges that are already summarized will cause the summary information to be updated with data
from the new tuples. When a new page is created that does not fall within the last summarized range,
```
the range that the new page belongs to does not automatically acquire a summary tuple; those tuples
```
remain unsummarized until a summarization run is invoked later, creating the initial summary for that
range.
There are several ways to trigger the initial summarization of a page range. If the table is vacuumed,
either manually or by autovacuum, all existing unsummarized page ranges are summarized. Also, if
the index's autosummarize parameter is enabled, which it isn't by default, whenever autovacuum runs
in that database, summarization will occur for all unsummarized page ranges that have been filled,
```
regardless of whether the table itself is processed by autovacuum; see below.
```
```
Lastly, the following functions can be used (while these functions run, search_path is temporarily
```
```
changed to pg_catalog, pg_temp):
```
```
brin_summarize_new_values(regclass) which summarizes all unsummarized ranges;
```
2626
Built-in Index Access Methods
```
brin_summarize_range(regclass, bigint) which summarizes only the range containing
```
the given page, if it is unsummarized.
When autosummarization is enabled, a request is sent to autovacuum to execute a targeted summa-
rization for a block range when an insertion is detected for the first item of the first page of the next
block range, to be fulfilled the next time an autovacuum worker finishes running in the same database.
If the request queue is full, the request is not recorded and a message is sent to the server log:
```
LOG: request for BRIN range summarization for index "brin_wi_idx"
```
page 128 was not recorded
When this happens, the range will remain unsummarized until the next regular vacuum run on the
table, or one of the functions mentioned above are invoked.
```
Conversely, a range can be de-summarized using the brin_desummarize_range(regclass,
```
```
bigint) function, which is useful when the index tuple is no longer a very good representation
```
because the existing values have changed. See Section 9.28.8 for details.
65.5.2. Built-in Operator Classes
The core PostgreSQL distribution includes the BRIN operator classes shown in Table 65.4.
The minmax operator classes store the minimum and the maximum values appearing in the indexed
column within the range. The inclusion operator classes store a value which includes the values in the
indexed column within the range. The bloom operator classes build a Bloom filter for all values in the
range. The minmax-multi operator classes store multiple minimum and maximum values, representing
values appearing in the indexed column within the range.
Table 65.4. Built-in BRIN Operator Classes
Name Indexable Operators
```
= (bit,bit)
```
```
< (bit,bit)
```
```
> (bit,bit)
```
```
<= (bit,bit)
```
bit_minmax_ops
```
>= (bit,bit)
```
```
@> (box,point)
```
```
<< (box,box)
```
```
&< (box,box)
```
```
&> (box,box)
```
```
>> (box,box)
```
```
<@ (box,box)
```
```
@> (box,box)
```
```
~= (box,box)
```
```
&& (box,box)
```
```
<<| (box,box)
```
```
&<| (box,box)
```
```
|&> (box,box)
```
box_inclusion_ops
```
|>> (box,box)
```
```
bpchar_bloom_ops = (character,character)
```
```
bpchar_minmax_ops = (character,character)
```
2627
Built-in Index Access Methods
Name Indexable Operators
```
< (character,character)
```
```
<= (character,character)
```
```
> (character,character)
```
```
>= (character,character)
```
```
bytea_bloom_ops = (bytea,bytea)
```
```
= (bytea,bytea)
```
```
< (bytea,bytea)
```
```
<= (bytea,bytea)
```
```
> (bytea,bytea)
```
bytea_minmax_ops
```
>= (bytea,bytea)
```
```
char_bloom_ops = ("char","char")
```
```
= ("char","char")
```
```
< ("char","char")
```
```
<= ("char","char")
```
```
> ("char","char")
```
char_minmax_ops
```
>= ("char","char")
```
```
date_bloom_ops = (date,date)
```
```
= (date,date)
```
```
< (date,date)
```
```
<= (date,date)
```
```
> (date,date)
```
date_minmax_ops
```
>= (date,date)
```
```
= (date,date)
```
```
< (date,date)
```
```
<= (date,date)
```
```
> (date,date)
```
date_minmax_multi_ops
```
>= (date,date)
```
```
float4_bloom_ops = (float4,float4)
```
```
= (float4,float4)
```
```
< (float4,float4)
```
```
> (float4,float4)
```
```
<= (float4,float4)
```
float4_minmax_ops
```
>= (float4,float4)
```
```
= (float4,float4)
```
```
< (float4,float4)
```
```
> (float4,float4)
```
```
<= (float4,float4)
```
float4_minmax_multi_ops
```
>= (float4,float4)
```
```
float8_bloom_ops = (float8,float8)
```
```
= (float8,float8)
```
```
float8_minmax_ops < (float8,float8)
```
2628
Built-in Index Access Methods
Name Indexable Operators
```
<= (float8,float8)
```
```
> (float8,float8)
```
```
>= (float8,float8)
```
```
= (float8,float8)
```
```
< (float8,float8)
```
```
<= (float8,float8)
```
```
> (float8,float8)
```
float8_minmax_multi_ops
```
>= (float8,float8)
```
```
<< (inet,inet)
```
```
<<= (inet,inet)
```
```
>> (inet,inet)
```
```
>>= (inet,inet)
```
```
= (inet,inet)
```
inet_inclusion_ops
```
&& (inet,inet)
```
```
inet_bloom_ops = (inet,inet)
```
```
= (inet,inet)
```
```
< (inet,inet)
```
```
<= (inet,inet)
```
```
> (inet,inet)
```
inet_minmax_ops
```
>= (inet,inet)
```
```
= (inet,inet)
```
```
< (inet,inet)
```
```
<= (inet,inet)
```
```
> (inet,inet)
```
inet_minmax_multi_ops
```
>= (inet,inet)
```
```
int2_bloom_ops = (int2,int2)
```
```
= (int2,int2)
```
```
< (int2,int2)
```
```
> (int2,int2)
```
```
<= (int2,int2)
```
int2_minmax_ops
```
>= (int2,int2)
```
```
= (int2,int2)
```
```
< (int2,int2)
```
```
> (int2,int2)
```
```
<= (int2,int2)
```
int2_minmax_multi_ops
```
>= (int2,int2)
```
```
int4_bloom_ops = (int4,int4)
```
```
= (int4,int4)
```
```
< (int4,int4)
```
```
> (int4,int4)int4_minmax_ops
```
```
<= (int4,int4)
```
2629
Built-in Index Access Methods
Name Indexable Operators
```
>= (int4,int4)
```
```
= (int4,int4)
```
```
< (int4,int4)
```
```
> (int4,int4)
```
```
<= (int4,int4)
```
int4_minmax_multi_ops
```
>= (int4,int4)
```
```
int8_bloom_ops = (bigint,bigint)
```
```
= (bigint,bigint)
```
```
< (bigint,bigint)
```
```
> (bigint,bigint)
```
```
<= (bigint,bigint)
```
int8_minmax_ops
```
>= (bigint,bigint)
```
```
= (bigint,bigint)
```
```
< (bigint,bigint)
```
```
> (bigint,bigint)
```
```
<= (bigint,bigint)
```
int8_minmax_multi_ops
```
>= (bigint,bigint)
```
```
interval_bloom_ops = (interval,interval)
```
```
= (interval,interval)
```
```
< (interval,interval)
```
```
<= (interval,interval)
```
```
> (interval,interval)
```
interval_minmax_ops
```
>= (interval,interval)
```
```
= (interval,interval)
```
```
< (interval,interval)
```
```
<= (interval,interval)
```
```
> (interval,interval)
```
interval_minmax_multi_ops
```
>= (interval,interval)
```
```
macaddr_bloom_ops = (macaddr,macaddr)
```
```
= (macaddr,macaddr)
```
```
< (macaddr,macaddr)
```
```
<= (macaddr,macaddr)
```
```
> (macaddr,macaddr)
```
macaddr_minmax_ops
```
>= (macaddr,macaddr)
```
```
= (macaddr,macaddr)
```
```
< (macaddr,macaddr)
```
```
<= (macaddr,macaddr)
```
```
> (macaddr,macaddr)
```
macaddr_minmax_multi_ops
```
>= (macaddr,macaddr)
```
```
macaddr8_bloom_ops = (macaddr8,macaddr8)
```
```
macaddr8_minmax_ops = (macaddr8,macaddr8)
```
2630
Built-in Index Access Methods
Name Indexable Operators
```
< (macaddr8,macaddr8)
```
```
<= (macaddr8,macaddr8)
```
```
> (macaddr8,macaddr8)
```
```
>= (macaddr8,macaddr8)
```
```
= (macaddr8,macaddr8)
```
```
< (macaddr8,macaddr8)
```
```
<= (macaddr8,macaddr8)
```
```
> (macaddr8,macaddr8)
```
macaddr8_minmax_multi_ops
```
>= (macaddr8,macaddr8)
```
```
name_bloom_ops = (name,name)
```
```
= (name,name)
```
```
< (name,name)
```
```
<= (name,name)
```
```
> (name,name)
```
name_minmax_ops
```
>= (name,name)
```
```
numeric_bloom_ops = (numeric,numeric)
```
```
= (numeric,numeric)
```
```
< (numeric,numeric)
```
```
<= (numeric,numeric)
```
```
> (numeric,numeric)
```
numeric_minmax_ops
```
>= (numeric,numeric)
```
```
= (numeric,numeric)
```
```
< (numeric,numeric)
```
```
<= (numeric,numeric)
```
```
> (numeric,numeric)
```
numeric_minmax_multi_ops
```
>= (numeric,numeric)
```
```
oid_bloom_ops = (oid,oid)
```
```
= (oid,oid)
```
```
< (oid,oid)
```
```
> (oid,oid)
```
```
<= (oid,oid)
```
oid_minmax_ops
```
>= (oid,oid)
```
```
= (oid,oid)
```
```
< (oid,oid)
```
```
> (oid,oid)
```
```
<= (oid,oid)
```
oid_minmax_multi_ops
```
>= (oid,oid)
```
```
pg_lsn_bloom_ops = (pg_lsn,pg_lsn)
```
```
= (pg_lsn,pg_lsn)
```
```
< (pg_lsn,pg_lsn)pg_lsn_minmax_ops
```
```
> (pg_lsn,pg_lsn)
```
2631
Built-in Index Access Methods
Name Indexable Operators
```
<= (pg_lsn,pg_lsn)
```
```
>= (pg_lsn,pg_lsn)
```
```
= (pg_lsn,pg_lsn)
```
```
< (pg_lsn,pg_lsn)
```
```
> (pg_lsn,pg_lsn)
```
```
<= (pg_lsn,pg_lsn)
```
pg_lsn_minmax_multi_ops
```
>= (pg_lsn,pg_lsn)
```
```
= (anyrange,anyrange)
```
```
< (anyrange,anyrange)
```
```
<= (anyrange,anyrange)
```
```
>= (anyrange,anyrange)
```
```
> (anyrange,anyrange)
```
```
&& (anyrange,anyrange)
```
```
@> (anyrange,anyelement)
```
```
@> (anyrange,anyrange)
```
```
<@ (anyrange,anyrange)
```
```
<< (anyrange,anyrange)
```
```
>> (anyrange,anyrange)
```
```
&< (anyrange,anyrange)
```
```
&> (anyrange,anyrange)
```
range_inclusion_ops
```
-|- (anyrange,anyrange)
```
```
text_bloom_ops = (text,text)
```
```
= (text,text)
```
```
< (text,text)
```
```
<= (text,text)
```
```
> (text,text)
```
text_minmax_ops
```
>= (text,text)
```
```
tid_bloom_ops = (tid,tid)
```
```
= (tid,tid)
```
```
< (tid,tid)
```
```
> (tid,tid)
```
```
<= (tid,tid)
```
tid_minmax_ops
```
>= (tid,tid)
```
```
= (tid,tid)
```
```
< (tid,tid)
```
```
> (tid,tid)
```
```
<= (tid,tid)
```
tid_minmax_multi_ops
```
>= (tid,tid)
```
```
timestamp_bloom_ops = (timestamp,timestamp)
```
```
= (timestamp,timestamp)
```
```
timestamp_minmax_ops < (timestamp,timestamp)
```
2632
Built-in Index Access Methods
Name Indexable Operators
```
<= (timestamp,timestamp)
```
```
> (timestamp,timestamp)
```
```
>= (timestamp,timestamp)
```
```
= (timestamp,timestamp)
```
```
< (timestamp,timestamp)
```
```
<= (timestamp,timestamp)
```
```
> (timestamp,timestamp)
```
timestamp_minmax_multi_ops
```
>= (timestamp,timestamp)
```
```
timestamptz_bloom_ops = (timestamptz,timestamptz)
```
```
= (timestamptz,timestamptz)
```
```
< (timestamptz,timestamptz)
```
```
<= (timestamptz,timestamptz)
```
```
> (timestamptz,timestamptz)
```
timestamptz_minmax_ops
```
>= (timestamptz,timestamptz)
```
```
= (timestamptz,timestamptz)
```
```
< (timestamptz,timestamptz)
```
```
<= (timestamptz,timestamptz)
```
```
> (timestamptz,timestamptz)
```
timestamptz_minmax_multi_ops
```
>= (timestamptz,timestamptz)
```
```
time_bloom_ops = (time,time)
```
```
= (time,time)
```
```
< (time,time)
```
```
<= (time,time)
```
```
> (time,time)
```
time_minmax_ops
```
>= (time,time)
```
```
= (time,time)
```
```
< (time,time)
```
```
<= (time,time)
```
```
> (time,time)
```
time_minmax_multi_ops
```
>= (time,time)
```
```
timetz_bloom_ops = (timetz,timetz)
```
```
= (timetz,timetz)
```
```
< (timetz,timetz)
```
```
<= (timetz,timetz)
```
```
> (timetz,timetz)
```
timetz_minmax_ops
```
>= (timetz,timetz)
```
```
= (timetz,timetz)
```
```
< (timetz,timetz)
```
```
<= (timetz,timetz)
```
```
> (timetz,timetz)
```
timetz_minmax_multi_ops
```
>= (timetz,timetz)
```
2633
Built-in Index Access Methods
Name Indexable Operators
```
uuid_bloom_ops = (uuid,uuid)
```
```
= (uuid,uuid)
```
```
< (uuid,uuid)
```
```
> (uuid,uuid)
```
```
<= (uuid,uuid)
```
uuid_minmax_ops
```
>= (uuid,uuid)
```
```
= (uuid,uuid)
```
```
< (uuid,uuid)
```
```
> (uuid,uuid)
```
```
<= (uuid,uuid)
```
uuid_minmax_multi_ops
```
>= (uuid,uuid)
```
```
= (varbit,varbit)
```
```
< (varbit,varbit)
```
```
> (varbit,varbit)
```
```
<= (varbit,varbit)
```
varbit_minmax_ops
```
>= (varbit,varbit)
```
65.5.2.1. Operator Class Parameters
Some of the built-in operator classes allow specifying parameters affecting behavior of the operator
class. Each operator class has its own set of allowed parameters. Only the bloom and minmax-mul-
ti operator classes allow specifying parameters:
bloom operator classes accept these parameters:
n_distinct_per_range
Defines the estimated number of distinct non-null values in the block range, used by BRIN bloom
indexes for sizing of the Bloom filter. It behaves similarly to n_distinct option for ALTER
TABLE. When set to a positive value, each block range is assumed to contain this number of
distinct non-null values. When set to a negative value, which must be greater than or equal to -1,
the number of distinct non-null values is assumed to grow linearly with the maximum possible
```
number of tuples in the block range (about 290 rows per block). The default value is -0.1, and
```
the minimum number of distinct non-null values is 16.
false_positive_rate
Defines the desired false positive rate used by BRIN bloom indexes for sizing of the Bloom filter.
The values must be between 0.0001 and 0.25. The default value is 0.01, which is 1% false positive
rate.
minmax-multi operator classes accept these parameters:
values_per_range
Defines the maximum number of values stored by BRIN minmax indexes to summarize a block
range. Each value may represent either a point, or a boundary of an interval. Values must be
between 8 and 256, and the default value is 32.
2634
Built-in Index Access Methods
65.5.3. Extensibility
The BRIN interface has a high level of abstraction, requiring the access method implementer only to
implement the semantics of the data type being accessed. The BRIN layer itself takes care of concur-
rency, logging and searching the index structure.
All it takes to get a BRIN access method working is to implement a few user-defined methods, which
define the behavior of summary values stored in the index and the way they interact with scan keys.
In short, BRIN combines extensibility with generality, code reuse, and a clean interface.
There are four methods that an operator class for BRIN must provide:
```
BrinOpcInfo *opcInfo(Oid type_oid)
```
Returns internal information about the indexed columns' summary data. The return value must
point to a palloc'd BrinOpcInfo, which has this definition:
typedef struct BrinOpcInfo
```
{
```
/* Number of columns stored in an index column of this
opclass */
```
uint16 oi_nstored;
```
/* Opaque pointer for the opclass' private use */
```
void *oi_opaque;
```
/* Type cache entries of the stored columns */
```
TypeCacheEntry *oi_typcache[FLEXIBLE_ARRAY_MEMBER];
```
```
} BrinOpcInfo;
```
BrinOpcInfo.oi_opaque can be used by the operator class routines to pass information be-
tween support functions during an index scan.
```
bool consistent(BrinDesc *bdesc, BrinValues *column, ScanKey *keys,
```
```
int nkeys)
```
Returns whether all the ScanKey entries are consistent with the given indexed values for a range.
The attribute number to use is passed as part of the scan key. Multiple scan keys for the same
```
attribute may be passed at once; the number of entries is determined by the nkeys parameter.
```
```
bool consistent(BrinDesc *bdesc, BrinValues *column, ScanKey key)
```
Returns whether the ScanKey is consistent with the given indexed values for a range. The attribute
number to use is passed as part of the scan key. This is an older backward-compatible variant of
the consistent function.
```
bool addValue(BrinDesc *bdesc, BrinValues *column, Datum newval, bool
```
```
isnull)
```
Given an index tuple and an indexed value, modifies the indicated attribute of the tuple so that it
additionally represents the new value. If any modification was done to the tuple, true is returned.
```
bool unionTuples(BrinDesc *bdesc, BrinValues *a, BrinValues *b)
```
Consolidates two index tuples. Given two index tuples, modifies the indicated attribute of the first
of them so that it represents both tuples. The second tuple is not modified.
An operator class for BRIN can optionally specify the following method:
```
void options(local_relopts *relopts)
```
Defines a set of user-visible parameters that control operator class behavior.
2635
Built-in Index Access Methods
The options function is passed a pointer to a local_relopts struct, which needs to be
filled with a set of operator class specific options. The options can be accessed from other support
```
functions using the PG_HAS_OPCLASS_OPTIONS() and PG_GET_OPCLASS_OPTIONS()
```
macros.
Since both key extraction of indexed values and representation of the key in BRIN are flexible,
they may depend on user-specified parameters.
The core distribution includes support for four types of operator classes: minmax, minmax-multi, in-
clusion and bloom. Operator class definitions using them are shipped for in-core data types as appro-
priate. Additional operator classes can be defined by the user for other data types using equivalent
```
definitions, without having to write any source code; appropriate catalog entries being declared is
```
enough. Note that assumptions about the semantics of operator strategies are embedded in the support
functions' source code.
Operator classes that implement completely different semantics are also possible, provided implemen-
tations of the four main support functions described above are written. Note that backwards compat-
ibility across major releases is not guaranteed: for example, additional support functions might be
required in later releases.
To write an operator class for a data type that implements a totally ordered set, it is possible to use the
minmax support functions alongside the corresponding operators, as shown in Table 65.5. All operator
```
class members (functions and operators) are mandatory.
```
Table 65.5. Function and Support Numbers for Minmax Operator Classes
Operator class member Object
```
Support Function 1 internal function brin_minmax_opcinfo()
```
```
Support Function 2 internal function brin_minmax_add_value()
```
```
Support Function 3 internal function brin_minmax_consistent()
```
```
Support Function 4 internal function brin_minmax_union()
```
Operator Strategy 1 operator less-than
Operator Strategy 2 operator less-than-or-equal-to
Operator Strategy 3 operator equal-to
Operator Strategy 4 operator greater-than-or-equal-to
Operator Strategy 5 operator greater-than
To write an operator class for a complex data type which has values included within another type,
it's possible to use the inclusion support functions alongside the corresponding operators, as shown
in Table 65.6. It requires only a single additional function, which can be written in any language.
More functions can be defined for additional functionality. All operators are optional. Some operators
require other operators, as shown as dependencies on the table.
Table 65.6. Function and Support Numbers for Inclusion Operator Classes
Operator class mem-
ber
Object Dependency
Support Function 1 internal function brin_inclusion_opcin-
```
fo()
```
Support Function 2 internal function brin_inclusion_ad-
```
d_value()
```
Support Function 3 internal function brin_inclusion_con-
```
sistent()
```
Support Function 4 internal function brin_inclusion_u-
```
nion()
```
2636
Built-in Index Access Methods
Operator class mem-
ber
Object Dependency
Support Function 11 function to merge two elements
Support Function 12 optional function to check whether two elements
are mergeable
Support Function 13 optional function to check if an element is con-
tained within another
Support Function 14 optional function to check whether an element is
empty
Operator Strategy 1 operator left-of Operator Strategy 4
Operator Strategy 2 operator does-not-extend-to-the-right-of Operator Strategy 5
Operator Strategy 3 operator overlaps
Operator Strategy 4 operator does-not-extend-to-the-left-of Operator Strategy 1
Operator Strategy 5 operator right-of Operator Strategy 2
Operator Strategy 6, 18 operator same-as-or-equal-to Operator Strategy 7
Operator Strategy 7,
16, 24, 25
operator contains-or-equal-to
Operator Strategy 8,
26, 27
operator is-contained-by-or-equal-to Operator Strategy 3
Operator Strategy 9 operator does-not-extend-above Operator Strategy 11
Operator Strategy 10 operator is-below Operator Strategy 12
Operator Strategy 11 operator is-above Operator Strategy 9
Operator Strategy 12 operator does-not-extend-below Operator Strategy 10
Operator Strategy 20 operator less-than Operator Strategy 5
Operator Strategy 21 operator less-than-or-equal-to Operator Strategy 5
Operator Strategy 22 operator greater-than Operator Strategy 1
Operator Strategy 23 operator greater-than-or-equal-to Operator Strategy 1
Support function numbers 1 through 10 are reserved for the BRIN internal functions, so the SQL level
functions start with number 11. Support function number 11 is the main function required to build
the index. It should accept two arguments with the same data type as the operator class, and return
the union of them. The inclusion operator class can store union values with different data types if it
is defined with the STORAGE parameter. The return value of the union function should match the
STORAGE data type.
Support function numbers 12 and 14 are provided to support irregularities of built-in data types. Func-
tion number 12 is used to support network addresses from different families which are not mergeable.
Function number 14 is used to support empty ranges. Function number 13 is an optional but recom-
mended one, which allows the new value to be checked before it is passed to the union function. As
the BRIN framework can shortcut some operations when the union is not changed, using this function
can improve index performance.
To write an operator class for a data type that implements only an equality operator and supports
hashing, it is possible to use the bloom support procedures alongside the corresponding operators, as
```
shown in Table 65.7. All operator class members (procedures and operators) are mandatory.
```
Table 65.7. Procedure and Support Numbers for Bloom Operator Classes
Operator class member Object
```
Support Procedure 1 internal function brin_bloom_opcinfo()
```
2637
Built-in Index Access Methods
Operator class member Object
Support Procedure 2 internal function brin_bloom_add_val-
```
ue()
```
Support Procedure 3 internal function brin_bloom_consisten-
```
t()
```
```
Support Procedure 4 internal function brin_bloom_union()
```
```
Support Procedure 5 internal function brin_bloom_options()
```
Support Procedure 11 function to compute hash of an element
Operator Strategy 1 operator equal-to
Support procedure numbers 1-10 are reserved for the BRIN internal functions, so the SQL level func-
tions start with number 11. Support function number 11 is the main function required to build the
index. It should accept one argument with the same data type as the operator class, and return a hash
of the value.
The minmax-multi operator class is also intended for data types implementing a totally ordered set,
and may be seen as a simple extension of the minmax operator class. While minmax operator class
summarizes values from each block range into a single contiguous interval, minmax-multi allows
summarization into multiple smaller intervals to improve handling of outlier values. It is possible to use
the minmax-multi support procedures alongside the corresponding operators, as shown in Table 65.8.
```
All operator class members (procedures and operators) are mandatory.
```
Table 65.8. Procedure and Support Numbers for minmax-multi Operator
Classes
Operator class member Object
Support Procedure 1 internal function brin_minmax_mul-
```
ti_opcinfo()
```
Support Procedure 2 internal function brin_minmax_multi_ad-
```
d_value()
```
Support Procedure 3 internal function brin_minmax_mul-
```
ti_consistent()
```
Support Procedure 4 internal function brin_minmax_multi_u-
```
nion()
```
Support Procedure 5 internal function brin_minmax_multi_op-
```
tions()
```
Support Procedure 11 function to compute distance between two val-
```
ues (length of a range)
```
Operator Strategy 1 operator less-than
Operator Strategy 2 operator less-than-or-equal-to
Operator Strategy 3 operator equal-to
Operator Strategy 4 operator greater-than-or-equal-to
Operator Strategy 5 operator greater-than
Both minmax and inclusion operator classes support cross-data-type operators, though with these the
dependencies become more complicated. The minmax operator class requires a full set of operators
to be defined with both arguments having the same data type. It allows additional data types to be
supported by defining extra sets of operators. Inclusion operator class operator strategies are dependent
on another operator strategy as shown in Table 65.6, or the same operator strategy as themselves.
They require the dependency operator to be defined with the STORAGE data type as the left-hand-
side argument and the other supported data type to be the right-hand-side argument of the supported
2638
Built-in Index Access Methods
operator. See float4_minmax_ops as an example of minmax, and box_inclusion_ops as
an example of inclusion.
65.6. Hash Indexes
65.6.1. Overview
PostgreSQL includes an implementation of persistent on-disk hash indexes, which are fully crash
recoverable. Any data type can be indexed by a hash index, including data types that do not have a
well-defined linear ordering. Hash indexes store only the hash value of the data being indexed, thus
there are no restrictions on the size of the data column being indexed.
Hash indexes support only single-column indexes and do not allow uniqueness checking.
Hash indexes support only the = operator, so WHERE clauses that specify range operations will not
be able to take advantage of hash indexes.
Each hash index tuple stores just the 4-byte hash value, not the actual column value. As a result, hash
indexes may be much smaller than B-trees when indexing longer data items such as UUIDs, URLs,
etc. The absence of the column value also makes all hash index scans lossy. Hash indexes may take
part in bitmap index scans and backward scans.
Hash indexes are best optimized for SELECT and UPDATE-heavy workloads that use equality scans
on larger tables. In a B-tree index, searches must descend through the tree until the leaf page is found.
In tables with millions of rows, this descent can increase access time to data. The equivalent of a leaf
page in a hash index is referred to as a bucket page. In contrast, a hash index allows accessing the
bucket pages directly, thereby potentially reducing index access time in larger tables. This reduction
in "logical I/O" becomes even more pronounced on indexes/data larger than shared_buffers/RAM.
Hash indexes have been designed to cope with uneven distributions of hash values. Direct access to
the bucket pages works well if the hash values are evenly distributed. When inserts mean that the
bucket page becomes full, additional overflow pages are chained to that specific bucket page, locally
expanding the storage for index tuples that match that hash value. When scanning a hash bucket during
queries, we need to scan through all of the overflow pages. Thus an unbalanced hash index might
actually be worse than a B-tree in terms of number of block accesses required, for some data.
As a result of the overflow cases, we can say that hash indexes are most suitable for unique, nearly
unique data or data with a low number of rows per hash bucket. One possible way to avoid problems
is to exclude highly non-unique values from the index using a partial index condition, but this may
not be suitable in many cases.
Like B-Trees, hash indexes perform simple index tuple deletion. This is a deferred maintenance op-
```
eration that deletes index tuples that are known to be safe to delete (those whose item identifier's
```
```
LP_DEAD bit is already set). If an insert finds no space is available on a page we try to avoid creating
```
a new overflow page by attempting to remove dead index tuples. Removal cannot occur if the page is
pinned at that time. Deletion of dead index pointers also occurs during VACUUM.
If it can, VACUUM will also try to squeeze the index tuples onto as few overflow pages as possible,
minimizing the overflow chain. If an overflow page becomes empty, overflow pages can be recycled
for reuse in other buckets, though we never return them to the operating system. There is currently no
provision to shrink a hash index, other than by rebuilding it with REINDEX. There is no provision
for reducing the number of buckets, either.
Hash indexes may expand the number of bucket pages as the number of rows indexed grows. The hash
key-to-bucket-number mapping is chosen so that the index can be incrementally expanded. When a
new bucket is to be added to the index, exactly one existing bucket will need to be "split", with some of
its tuples being transferred to the new bucket according to the updated key-to-bucket-number mapping.
2639
Built-in Index Access Methods
The expansion occurs in the foreground, which could increase execution time for user inserts. Thus,
hash indexes may not be suitable for tables with rapidly increasing number of rows.
65.6.2. Implementation
```
There are four kinds of pages in a hash index: the meta page (page zero), which contains statically
```
```
allocated control information; primary bucket pages; overflow pages; and bitmap pages, which keep
```
track of overflow pages that have been freed and are available for re-use. For addressing purposes,
bitmap pages are regarded as a subset of the overflow pages.
Both scanning the index and inserting tuples require locating the bucket where a given tuple ought
```
to be located. To do this, we need the bucket count, highmask, and lowmask from the metapage;
```
however, it's undesirable for performance reasons to have to have to lock and pin the metapage for
every such operation. Instead, we retain a cached copy of the metapage in each backend's relcache
entry. This will produce the correct bucket mapping as long as the target bucket hasn't been split since
the last cache refresh.
Primary bucket pages and overflow pages are allocated independently since any given index might
need more or fewer overflow pages relative to its number of buckets. The hash code uses an interesting
set of addressing rules to support a variable number of overflow pages while not having to move
primary bucket pages around after they are created.
Each row in the table indexed is represented by a single index tuple in the hash index. Hash index
tuples are stored in bucket pages, and if they exist, overflow pages. We speed up searches by keeping
the index entries in any one index page sorted by hash code, thus allowing binary search to be used
within an index page. Note however that there is *no* assumption about the relative ordering of hash
codes across different index pages of a bucket.
The bucket splitting algorithms to expand the hash index are too complex to be worthy of mention
here, though are described in more detail in src/backend/access/hash/README. The split
algorithm is crash safe and can be restarted if not completed successfully.
2640
