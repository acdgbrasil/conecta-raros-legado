Chapter 30. Just-in-Time Compilation
```
(JIT)
```
This chapter explains what just-in-time compilation is, and how it can be configured in PostgreSQL.
30.1. What Is JIT compilation?
```
Just-in-Time (JIT) compilation is the process of turning some form of interpreted program evaluation
```
into a native program, and doing so at run time. For example, instead of using general-purpose code
that can evaluate arbitrary SQL expressions to evaluate a particular SQL predicate like WHERE a.col
= 3, it is possible to generate a function that is specific to that expression and can be natively executed
by the CPU, yielding a speedup.
PostgreSQL has builtin support to perform JIT compilation using LLVM1 when PostgreSQL is built
with --with-llvm.
See src/backend/jit/README for further details.
30.1.1. JIT Accelerated Operations
Currently PostgreSQL's JIT implementation has support for accelerating expression evaluation and
tuple deforming. Several other operations could be accelerated in the future.
Expression evaluation is used to evaluate WHERE clauses, target lists, aggregates and projections. It
can be accelerated by generating code specific to each case.
```
Tuple deforming is the process of transforming an on-disk tuple (see Section 66.6.1) into its in-memory
```
representation. It can be accelerated by creating a function specific to the table layout and the number
of columns to be extracted.
30.1.2. Inlining
PostgreSQL is very extensible and allows new data types, functions, operators and other database
```
objects to be defined; see Chapter 36. In fact the built-in objects are implemented using nearly the
```
```
same mechanisms. This extensibility implies some overhead, for example due to function calls (see
```
```
Section 36.3). To reduce that overhead, JIT compilation can inline the bodies of small functions into
```
the expressions using them. That allows a significant percentage of the overhead to be optimized away.
30.1.3. Optimization
LLVM has support for optimizing generated code. Some of the optimizations are cheap enough to
be performed whenever JIT is used, while others are only beneficial for longer-running queries. See
```
https://llvm.org/docs/Passes.html#transform-passes for more details about optimizations.
```
30.2. When to JIT?
JIT compilation is beneficial primarily for long-running CPU-bound queries. Frequently these will be
analytical queries. For short queries the added overhead of performing JIT compilation will often be
higher than the time it can save.
```
To determine whether JIT compilation should be used, the total estimated cost of a query (see Chap-
```
```
ter 69 and Section 19.7.2) is used. The estimated cost of the query will be compared with the setting of
```
1 https://llvm.org/
941
```
Just-in-Time Compilation (JIT)
```
jit_above_cost. If the cost is higher, JIT compilation will be performed. Two further decisions are then
needed. Firstly, if the estimated cost is more than the setting of jit_inline_above_cost, short functions
and operators used in the query will be inlined. Secondly, if the estimated cost is more than the set-
ting of jit_optimize_above_cost, expensive optimizations are applied to improve the generated code.
Each of these options increases the JIT compilation overhead, but can reduce query execution time
considerably.
These cost-based decisions will be made at plan time, not execution time. This means that when pre-
```
pared statements are in use, and a generic plan is used (see PREPARE), the values of the configuration
```
parameters in effect at prepare time control the decisions, not the settings at execution time.
Note
```
If jit is set to off, or if no JIT implementation is available (for example because the server was
```
```
compiled without --with-llvm), JIT will not be performed, even if it would be beneficial
```
based on the above criteria. Setting jit to off has effects at both plan and execution time.
EXPLAIN can be used to see whether JIT is used or not. As an example, here is a query that is not
using JIT:
```
=# EXPLAIN ANALYZE SELECT SUM(relpages) FROM pg_class;
```
QUERY PLAN
-------------------------------------------------------------------
------------------------------------------
```
Aggregate (cost=16.27..16.29 rows=1 width=8) (actual
```
```
time=0.303..0.303 rows=1.00 loops=1)
```
```
Buffers: shared hit=14
```
```
-> Seq Scan on pg_class (cost=0.00..15.42 rows=342 width=4)
```
```
(actual time=0.017..0.111 rows=356.00 loops=1)
```
```
Buffers: shared hit=14
```
Planning Time: 0.116 ms
Execution Time: 0.365 ms
```
Given the cost of the plan, it is entirely reasonable that no JIT was used; the cost of JIT would have
```
been bigger than the potential savings. Adjusting the cost limits will lead to JIT use:
```
=# SET jit_above_cost = 10;
```
SET
```
=# EXPLAIN ANALYZE SELECT SUM(relpages) FROM pg_class;
```
QUERY PLAN
-------------------------------------------------------------------
------------------------------------------
```
Aggregate (cost=16.27..16.29 rows=1 width=8) (actual
```
```
time=6.049..6.049 rows=1.00 loops=1)
```
```
Buffers: shared hit=14
```
```
-> Seq Scan on pg_class (cost=0.00..15.42 rows=342 width=4)
```
```
(actual time=0.019..0.052 rows=356.00 loops=1)
```
```
Buffers: shared hit=14
```
Planning Time: 0.133 ms
```
JIT:
```
```
Functions: 3
```
```
Options: Inlining false, Optimization false, Expressions true,
```
Deforming true
```
Timing: Generation 1.259 ms (Deform 0.000 ms), Inlining 0.000
```
ms, Optimization 0.797 ms, Emission 5.048 ms, Total 7.104 ms
942
```
Just-in-Time Compilation (JIT)
```
Execution Time: 7.416 ms
As visible here, JIT was used, but inlining and expensive optimization were not. If jit_in-
line_above_cost or jit_optimize_above_cost were also lowered, that would change.
30.3. Configuration
The configuration variable jit determines whether JIT compilation is enabled or disabled. If it is en-
abled, the configuration variables jit_above_cost, jit_inline_above_cost, and jit_optimize_above_cost
determine whether JIT compilation is performed for a query, and how much effort is spent doing so.
jit_provider determines which JIT implementation is used. It is rarely required to be changed. See
Section 30.4.2.
For development and debugging purposes a few additional configuration parameters exist, as described
in Section 19.17.
30.4. Extensibility
30.4.1. Inlining Support for Extensions
PostgreSQL's JIT implementation can inline the bodies of functions of types C and internal, as
well as operators based on such functions. To do so for functions in extensions, the definitions of those
functions need to be made available. When using PGXS to build an extension against a server that has
been compiled with LLVM JIT support, the relevant files will be built and installed automatically.
The relevant files have to be installed into $pkglibdir/bitcode/$extension/ and a sum-
mary of them into $pkglibdir/bitcode/$extension.index.bc, where $pkglibdir is
the directory returned by pg_config --pkglibdir and $extension is the base name of the
extension's shared library.
Note
For functions built into PostgreSQL itself, the bitcode is installed into $pkglibdir/bit-
code/postgres.
30.4.2. Pluggable JIT Providers
PostgreSQL provides a JIT implementation based on LLVM. The interface to the JIT provider is plug-
```
gable and the provider can be changed without recompiling (although currently, the build process only
```
```
provides inlining support data for LLVM). The active provider is chosen via the setting jit_provider.
```
30.4.2.1. JIT Provider Interface
A JIT provider is loaded by dynamically loading the named shared library. The normal library
search path is used to locate the library. To provide the required JIT provider callbacks and
to indicate that the library is actually a JIT provider, it needs to provide a C function named
_PG_jit_provider_init. This function is passed a struct that needs to be filled with the call-
back function pointers for individual actions:
struct JitProviderCallbacks
```
{
```
```
JitProviderResetAfterErrorCB reset_after_error;
```
943
```
Just-in-Time Compilation (JIT)
```
```
JitProviderReleaseContextCB release_context;
```
```
JitProviderCompileExprCB compile_expr;
```
```
};
```
```
extern void _PG_jit_provider_init(JitProviderCallbacks *cb);
```
944
