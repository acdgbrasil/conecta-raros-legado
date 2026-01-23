Chapter 31. Regression Tests
The regression tests are a comprehensive set of tests for the SQL implementation in PostgreSQL. They
test standard SQL operations as well as the extended capabilities of PostgreSQL.
31.1. Running the Tests
The regression tests can be run against an already installed and running server, or using a temporary
installation within the build tree. Furthermore, there is a “parallel” and a “sequential” mode for run-
ning the tests. The sequential method runs each test script alone, while the parallel method starts up
multiple server processes to run groups of tests in parallel. Parallel testing adds confidence that inter-
process communication and locking are working correctly. Some tests may run sequentially even in
the “parallel” mode in case this is required by the test.
31.1.1. Running the Tests Against a Temporary Instal-
lation
To run the parallel regression tests after building but before installation, type:
make check
```
in the top-level directory. (Or you can change to src/test/regress and run the command there.)
```
Tests which are run in parallel are prefixed with “+”, and tests which run sequentially are prefixed
with “-”. At the end you should see something like:
# All 213 tests passed.
or otherwise a note about which tests failed. See Section 31.2 below before assuming that a “failure”
represents a serious problem.
Because this test method runs a temporary server, it will not work if you did the build as the root user,
since the server will not start as root. Recommended procedure is not to do the build as root, or else
to perform testing after completing the installation.
If you have configured PostgreSQL to install into a location where an older PostgreSQL installation
already exists, and you perform make check before installing the new version, you might find
```
that the tests fail because the new programs try to use the already-installed shared libraries. (Typical
```
```
symptoms are complaints about undefined symbols.) If you wish to run the tests before overwriting the
```
old installation, you'll need to build with configure --disable-rpath. It is not recommended
that you use this option for the final installation, however.
The parallel regression test starts quite a few processes under your user ID. Presently, the maximum
concurrency is twenty parallel test scripts, which means forty processes: there's a server process and a
psql process for each test script. So if your system enforces a per-user limit on the number of processes,
make sure this limit is at least fifty or so, else you might get random-seeming failures in the parallel
test. If you are not in a position to raise the limit, you can cut down the degree of parallelism by setting
the MAX_CONNECTIONS parameter. For example:
make MAX_CONNECTIONS=10 check
runs no more than ten tests concurrently.
945
Regression Tests
31.1.2. Running the Tests Against an Existing Installa-
tion
```
To run the tests after installation (see Chapter 17), initialize a data directory and start the server as
```
explained in Chapter 18, then type:
make installcheck
or for a parallel test:
make installcheck-parallel
The tests will expect to contact the server at the local host and the default port number, unless directed
otherwise by PGHOST and PGPORT environment variables. The tests will be run in a database named
```
regression; any existing database by this name will be dropped.
```
The tests will also transiently create some cluster-wide objects, such as roles, tablespaces, and
subscriptions. These objects will have names beginning with regress_. Beware of using in-
stallcheck mode with an installation that has any actual global objects named that way.
31.1.3. Additional Test Suites
The make check and make installcheck commands run only the “core” regression tests,
which test built-in functionality of the PostgreSQL server. The source distribution contains many
additional test suites, most of them having to do with add-on functionality such as optional procedural
languages.
To run all test suites applicable to the modules that have been selected to be built, including the core
tests, type one of these commands at the top of the build tree:
make check-world
make installcheck-world
These commands run the tests using temporary servers or an already-installed server, respectively, just
as previously explained for make check and make installcheck. Other considerations are
the same as previously explained for each method. Note that make check-world builds a separate
```
instance (temporary data directory) for each tested module, so it requires more time and disk space
```
than make installcheck-world.
On a modern machine with multiple CPU cores and no tight operating-system limits, you can make
things go substantially faster with parallelism. The recipe that most PostgreSQL developers actually
use for running all tests is something like
make check-world -j8 >/dev/null
with a -j limit near to or a bit more than the number of available cores. Discarding stdout eliminates
```
chatter that's not interesting when you just want to verify success. (In case of failure, the stderr mes-
```
```
sages are usually enough to determine where to look closer.)
```
Alternatively, you can run individual test suites by typing make check or make installcheck
in the appropriate subdirectory of the build tree. Keep in mind that make installcheck assumes
```
you've installed the relevant module(s), not only the core server.
```
The additional tests that can be invoked this way include:
946
Regression Tests
• Regression tests for optional procedural languages. These are located under src/pl.
• Regression tests for contrib modules, located under contrib. Not all contrib modules have
tests.
• Regression tests for the interface libraries, located in src/interfaces/libpq/test and
src/interfaces/ecpg/test.
• Tests for core-supported authentication methods, located in src/test/authentication.
```
(See below for additional authentication-related tests.)
```
• Tests stressing behavior of concurrent sessions, located in src/test/isolation.
• Tests for crash recovery and physical replication, located in src/test/recovery.
• Tests for logical replication, located in src/test/subscription.
• Tests of client programs, located under src/bin.
When using installcheck mode, these tests will create and destroy test databases whose names
include regression, for example pl_regression or contrib_regression. Beware of us-
ing installcheck mode with an installation that has any non-test databases named that way.
Some of these auxiliary test suites use the TAP infrastructure explained in Section 31.4. The TAP-
based tests are run only when PostgreSQL was configured with the option --enable-tap-tests.
This is recommended for development, but can be omitted if there is no suitable Perl installation.
Some test suites are not run by default, either because they are not secure to run on a multiuser system,
because they require special software or because they are resource intensive. You can decide which
test suites to run additionally by setting the make or environment variable PG_TEST_EXTRA to a
whitespace-separated list, for example:
make check-world PG_TEST_EXTRA='kerberos ldap ssl load_balance
libpq_encryption'
The following values are currently supported:
kerberos
Runs the test suite under src/test/kerberos. This requires an MIT Kerberos installation
and opens TCP/IP listen sockets.
ldap
Runs the test suite under src/test/ldap. This requires an OpenLDAP installation and opens
TCP/IP listen sockets.
libpq_encryption
Runs the test src/interfaces/libpq/t/005_negotiate_encryption.pl. This
opens TCP/IP listen sockets. If PG_TEST_EXTRA also includes kerberos, additional tests that
require an MIT Kerberos installation are enabled.
load_balance
Runs the test src/interfaces/libpq/t/004_load_balance_dns.pl. This requires
editing the system hosts file and opens TCP/IP listen sockets.
oauth
Runs the test suite under src/test/modules/oauth_validator. This opens TCP/IP lis-
ten sockets for a test server running HTTPS.
947
Regression Tests
regress_dump_restore
Runs an additional test suite in src/bin/pg_upgrade/t/002_pg_upgrade.pl which
cycles the regression database through pg_dump/ pg_restore. Not enabled by default because
it is resource intensive.
sepgsql
Runs the test suite under contrib/sepgsql. This requires an SELinux environment that is
```
set up in a specific way; see Section F.40.3.
```
ssl
Runs the test suite under src/test/ssl. This opens TCP/IP listen sockets.
wal_consistency_checking
Uses wal_consistency_checking=all while running certain tests under src/test/
recovery. Not enabled by default because it is resource intensive.
xid_wraparound
Runs the test suite under src/test/modules/xid_wraparound. Not enabled by default
because it is resource intensive.
Tests for features that are not supported by the current build configuration are not run even if they are
mentioned in PG_TEST_EXTRA.
In addition, there are tests in src/test/modules which will be run by make check-world
but not by make installcheck-world. This is because they install non-production extensions
or have other side-effects that are considered undesirable for a production installation. You can use
make install and make installcheck in one of those subdirectories if you wish, but it's not
recommended to do so with a non-test server.
31.1.4. Locale and Encoding
By default, tests using a temporary installation use the locale defined in the current environment and
the corresponding database encoding as determined by initdb. It can be useful to test different
locales by setting the appropriate environment variables, for example:
make check LANG=C
make check LC_COLLATE=en_US.utf8 LC_CTYPE=fr_CA.utf8
```
For implementation reasons, setting LC_ALL does not work for this purpose; all the other locale-re-
```
lated environment variables do work.
When testing against an existing installation, the locale is determined by the existing database cluster
and cannot be set separately for the test run.
You can also choose the database encoding explicitly by setting the variable ENCODING, for example:
make check LANG=C ENCODING=EUC_JP
```
Setting the database encoding this way typically only makes sense if the locale is C; otherwise the
```
encoding is chosen automatically from the locale, and specifying an encoding that does not match the
locale will result in an error.
The database encoding can be set for tests against either a temporary or an existing installation, though
in the latter case it must be compatible with the installation's locale.
948
Regression Tests
31.1.5. Custom Server Settings
There are several ways to use custom server settings when running a test suite. This can be useful to
enable additional logging, adjust resource limits, or enable extra run-time checks such as debug_dis-
card_caches. But note that not all tests can be expected to pass cleanly with arbitrary settings.
Extra options can be passed to the various initdb commands that are run internally during test setup
using the environment variable PG_TEST_INITDB_EXTRA_OPTS. For example, to run a test with
checksums enabled and a custom WAL segment size and work_mem setting, use:
make check PG_TEST_INITDB_EXTRA_OPTS='-k --wal-segsize=4 -c
```
work_mem=50MB'
```
For the core regression test suite and other tests driven by pg_regress, custom run-time server
```
settings can also be set in the PGOPTIONS environment variable (for settings that allow this), for
```
```
example:
```
make check PGOPTIONS="-c debug_parallel_query=regress -c
```
work_mem=50MB"
```
```
(This makes use of functionality provided by libpq; see options for details.)
```
When running against a temporary installation, custom settings can also be set by supplying a pre-
written postgresql.conf:
echo 'log_checkpoints = on' > test_postgresql.conf
echo 'work_mem = 50MB' >> test_postgresql.conf
make check EXTRA_REGRESS_OPTS="--temp-config=test_postgresql.conf"
31.1.6. Extra Tests
The core regression test suite contains a few test files that are not run by default, because they might
be platform-dependent or take a very long time to run. You can run these or other extra test files by
setting the variable EXTRA_TESTS. For example, to run the numeric_big test:
make check EXTRA_TESTS=numeric_big
31.2. Test Evaluation
Some properly installed and fully functional PostgreSQL installations can “fail” some of these regres-
sion tests due to platform-specific artifacts such as varying floating-point representation and message
wording. The tests are currently evaluated using a simple diff comparison against the outputs gen-
erated on a reference system, so the results are sensitive to small system differences. When a test is
```
reported as “failed”, always examine the differences between expected and actual results; you might
```
find that the differences are not significant. Nonetheless, we still strive to maintain accurate reference
files across all supported platforms, so it can be expected that all tests pass.
The actual outputs of the regression tests are in files in the src/test/regress/results direc-
tory. The test script uses diff to compare each output file against the reference outputs stored in
the src/test/regress/expected directory. Any differences are saved for your inspection in
```
src/test/regress/regression.diffs. (When running a test suite other than the core tests,
```
```
these files of course appear in the relevant subdirectory, not src/test/regress.)
```
If you don't like the diff options that are used by default, set the environment variable PG_RE-
```
GRESS_DIFF_OPTS, for instance PG_REGRESS_DIFF_OPTS='-c'. (Or you can run diff
```
```
yourself, if you prefer.)
```
949
Regression Tests
If for some reason a particular platform generates a “failure” for a given test, but inspection of the
output convinces you that the result is valid, you can add a new comparison file to silence the failure
report in future test runs. See Section 31.3 for details.
31.2.1. Error Message Differences
Some of the regression tests involve intentional invalid input values. Error messages can come from
either the PostgreSQL code or from the host platform system routines. In the latter case, the messages
can vary between platforms, but should reflect similar information. These differences in messages will
result in a “failed” regression test that can be validated by inspection.
31.2.2. Locale Differences
If you run the tests against a server that was initialized with a collation-order locale other than C, then
there might be differences due to sort order and subsequent failures. The regression test suite is set
up to handle this problem by providing alternate result files that together are known to handle a large
number of locales.
To run the tests in a different locale when using the temporary-installation method, pass the appropriate
locale-related environment variables on the make command line, for example:
make check LANG=de_DE.utf8
```
(The regression test driver unsets LC_ALL, so it does not work to choose the locale using that variable.)
```
```
To use no locale, either unset all locale-related environment variables (or set them to C) or use the
```
following special invocation:
make check NO_LOCALE=1
When running the tests against an existing installation, the locale setup is determined by the existing
installation. To change it, initialize the database cluster with a different locale by passing the appro-
priate options to initdb.
In general, it is advisable to try to run the regression tests in the locale setup that is wanted for pro-
duction use, as this will exercise the locale- and encoding-related code portions that will actually be
used in production. Depending on the operating system environment, you might get failures, but then
you will at least know what locale-specific behaviors to expect when running real applications.
31.2.3. Date and Time Differences
Most of the date and time results are dependent on the time zone environment. The reference files are
generated for time zone America/Los_Angeles, and there will be apparent failures if the tests
are not run with that time zone setting. The regression test driver sets environment variable PGTZ to
America/Los_Angeles, which normally ensures proper results.
31.2.4. Floating-Point Differences
```
Some of the tests involve computing 64-bit floating-point numbers (double precision) from
```
table columns. Differences in results involving mathematical functions of double precision
columns have been observed. The float8 and geometry tests are particularly prone to small dif-
ferences across platforms, or even with different compiler optimization settings. Human eyeball com-
parison is needed to determine the real significance of these differences which are usually 10 places
to the right of the decimal point.
Some systems display minus zero as -0, while others just show 0.
950
Regression Tests
```
Some systems signal errors from pow() and exp() differently from the mechanism expected by the
```
current PostgreSQL code.
31.2.5. Row Ordering Differences
You might see differences in which the same rows are output in a different order than what appears in
the expected file. In most cases this is not, strictly speaking, a bug. Most of the regression test scripts
are not so pedantic as to use an ORDER BY for every single SELECT, and so their result row orderings
are not well-defined according to the SQL specification. In practice, since we are looking at the same
queries being executed on the same data by the same software, we usually get the same result ordering
on all platforms, so the lack of ORDER BY is not a problem. Some queries do exhibit cross-platform
ordering differences, however. When testing against an already-installed server, ordering differences
can also be caused by non-C locale settings or non-default parameter settings, such as custom values
of work_mem or the planner cost parameters.
Therefore, if you see an ordering difference, it's not something to worry about, unless the query does
have an ORDER BY that your result is violating. However, please report it anyway, so that we can add
an ORDER BY to that particular query to eliminate the bogus “failure” in future releases.
You might wonder why we don't order all the regression test queries explicitly to get rid of this issue
once and for all. The reason is that that would make the regression tests less useful, not more, since
they'd tend to exercise query plan types that produce ordered results to the exclusion of those that don't.
31.2.6. Insufficient Stack Depth
```
If the errors test results in a server crash at the select infinite_recurse() command, it
```
means that the platform's limit on process stack size is smaller than the max_stack_depth parameter
```
indicates. This can be fixed by running the server under a higher stack size limit (4MB is recommended
```
```
with the default value of max_stack_depth). If you are unable to do that, an alternative is to reduce
```
the value of max_stack_depth.
```
On platforms supporting getrlimit(), the server should automatically choose a safe value of
```
```
max_stack_depth; so unless you've manually overridden this setting, a failure of this kind is a
```
reportable bug.
31.2.7. The “random” Test
The random test script is intended to produce random results. In very rare cases, this causes that
regression test to fail. Typing:
diff results/random.out expected/random.out
should produce only one or a few lines of differences. You need not worry unless the random test
fails repeatedly.
31.2.8. Configuration Parameters
When running the tests against an existing installation, some non-default parameter settings could
cause the tests to fail. For example, changing parameters such as enable_seqscan or en-
able_indexscan could cause plan changes that would affect the results of tests that use EXPLAIN.
31.3. Variant Comparison Files
Since some of the tests inherently produce environment-dependent results, we have provided ways to
specify alternate “expected” result files. Each regression test can have several comparison files show-
951
Regression Tests
ing possible results on different platforms. There are two independent mechanisms for determining
which comparison file is used for each test.
The first mechanism allows comparison files to be selected for specific platforms. There is a mapping
file, src/test/regress/resultmap, that defines which comparison file to use for each plat-
form. To eliminate bogus test “failures” for a particular platform, you first choose or make a variant
result file, and then add a line to the resultmap file.
Each line in the mapping file is of the form
```
testname:output:platformpattern=comparisonfilename
```
The test name is just the name of the particular regression test module. The output value indicates
which output file to check. For the standard regression tests, this is always out. The value corresponds
to the file extension of the output file. The platform pattern is a pattern in the style of the Unix tool
```
expr (that is, a regular expression with an implicit ^ anchor at the start). It is matched against the
```
platform name as printed by config.guess. The comparison file name is the base name of the
substitute result comparison file.
For example: some systems lack a working strtof function, for which our workaround causes
rounding errors in the float4 regression test. Therefore, we provide a variant comparison file,
float4-misrounded-input.out, which includes the results to be expected on these systems.
To silence the bogus “failure” message on Cygwin platforms, resultmap includes:
```
float4:out:.*-.*-cygwin.*=float4-misrounded-input.out
```
which will trigger on any machine where the output of config.guess matches .*-.*-cyg-
win.*. Other lines in resultmap select the variant comparison file for other platforms where it's
appropriate.
The second selection mechanism for variant comparison files is much more automatic: it simply uses
the “best match” among several supplied comparison files. The regression test driver script consid-
ers both the standard comparison file for a test, testname.out, and variant files named test-
```
name_digit.out (where the digit is any single digit 0-9). If any such file is an exact match,
```
```
the test is considered to pass; otherwise, the one that generates the shortest diff is used to create the
```
```
failure report. (If resultmap includes an entry for the particular test, then the base testname is
```
```
the substitute name given in resultmap.)
```
For example, for the char test, the comparison file char.out contains results that are expected
in the C and POSIX locales, while the file char_1.out contains results sorted as they appear in
many other locales.
The best-match mechanism was devised to cope with locale-dependent results, but it can be used in any
situation where the test results cannot be predicted easily from the platform name alone. A limitation
of this mechanism is that the test driver cannot tell which variant is actually “correct” for the current
```
environment; it will just pick the variant that seems to work best. Therefore it is safest to use this
```
mechanism only for variant results that you are willing to consider equally valid in all contexts.
31.4. TAP Tests
Various tests, particularly the client program tests under src/bin, use the Perl TAP tools and are
run using the Perl testing program prove. You can pass command-line options to prove by setting
the make variable PROVE_FLAGS, for example:
make -C src/bin check PROVE_FLAGS='--timer'
See the manual page of prove for more information.
952
Regression Tests
The make variable PROVE_TESTS can be used to define a whitespace-separated list of paths relative
to the Makefile invoking prove to run the specified subset of tests instead of the default t/*.pl.
For example:
make check PROVE_TESTS='t/001_test1.pl t/003_test3.pl'
The TAP tests require the Perl module IPC::Run. This module is available from CPAN1 or an
operating system package. They also require PostgreSQL to be configured with the option --en-
able-tap-tests.
Generically speaking, the TAP tests will test the executables in a previously-installed installation tree
if you say make installcheck, or will build a new local installation tree from current sources
```
if you say make check. In either case they will initialize a local instance (data directory) and tran-
```
siently run a server in it. Some of these tests run more than one server. Thus, these tests can be fairly
resource-intensive.
```
It's important to realize that the TAP tests will start test server(s) even when you say make in-
```
```
stallcheck; this is unlike the traditional non-TAP testing infrastructure, which expects to use an
```
already-running test server in that case. Some PostgreSQL subdirectories contain both traditional-style
and TAP-style tests, meaning that make installcheck will produce a mix of results from tem-
porary servers and the already-running test server.
31.4.1. Environment Variables
Data directories are named according to the test filename, and will be retained if a test fails. If the
environment variable PG_TEST_NOCLEAN is set, data directories will be retained regardless of test
status. For example, retaining the data directory regardless of test results when running the pg_dump
```
tests:
```
```
PG_TEST_NOCLEAN=1 make -C src/bin/pg_dump check
```
This environment variable also prevents the test's temporary directories from being removed.
Many operations in the test suites use a 180-second timeout, which on slow hosts may lead to load-in-
duced timeouts. Setting the environment variable PG_TEST_TIMEOUT_DEFAULT to a higher num-
ber will change the default to avoid this.
31.5. Test Coverage Examination
The PostgreSQL source code can be compiled with coverage testing instrumentation, so that it be-
comes possible to examine which parts of the code are covered by the regression tests or any other test
suite that is run with the code. This is currently supported when compiling with GCC, and it requires
the gcov and lcov packages.
31.5.1. Coverage with Autoconf and Make
A typical workflow looks like this:
./configure --enable-coverage ... OTHER OPTIONS ...
make
make check # or other test suite
make coverage-html
Then point your HTML browser to coverage/index.html.
1 https://metacpan.org/dist/IPC-Run
953
Regression Tests
If you don't have lcov or prefer text output over an HTML report, you can run
make coverage
instead of make coverage-html, which will produce .gcov output files for each source file
```
relevant to the test. (make coverage and make coverage-html will overwrite each other's
```
```
files, so mixing them might be confusing.)
```
```
You can run several different tests before making the coverage report; the execution counts will ac-
```
cumulate. If you want to reset the execution counts between test runs, run:
make coverage-clean
You can run the make coverage-html or make coverage command in a subdirectory if you
want a coverage report for only a portion of the code tree.
Use make distclean to clean up when done.
31.5.2. Coverage with Meson
A typical workflow looks like this:
meson setup -Db_coverage=true ... OTHER OPTIONS ... builddir/
meson compile -C builddir/
meson test -C builddir/
cd builddir/
ninja coverage-html
Then point your HTML browser to ./meson-logs/coveragereport/index.html.
```
You can run several different tests before making the coverage report; the execution counts will ac-
```
cumulate.
954
Part IV. Client Interfaces
This part describes the client programming interfaces distributed with PostgreSQL. Each of these chapters can
be read independently. There are many external programming interfaces for client programs that are distributed
```
separately. They contain their own documentation (Appendix H lists some of the more popular ones). Readers of
```
```
this part should be familiar with using SQL to manipulate and query the database (see Part II) and of course with
```
the programming language of their choice.
Table of Contents
32. libpq — C Library ................................................................................................ 960
32.1. Database Connection Control Functions ......................................................... 960
32.1.1. Connection Strings ........................................................................... 968
32.1.2. Parameter Key Words ...................................................................... 970
32.2. Connection Status Functions ........................................................................ 981
32.3. Command Execution Functions .................................................................... 988
32.3.1. Main Functions ............................................................................... 988
32.3.2. Retrieving Query Result Information ................................................... 997
32.3.3. Retrieving Other Result Information .................................................. 1001
32.3.4. Escaping Strings for Inclusion in SQL Commands ............................... 1002
32.4. Asynchronous Command Processing ............................................................ 1005
32.5. Pipeline Mode .......................................................................................... 1009
32.5.1. Using Pipeline Mode ...................................................................... 1009
32.5.2. Functions Associated with Pipeline Mode ........................................... 1012
32.5.3. When to Use Pipeline Mode ............................................................ 1013
32.6. Retrieving Query Results in Chunks ............................................................ 1014
32.7. Canceling Queries in Progress .................................................................... 1015
32.7.1. Functions for Sending Cancel Requests .............................................. 1015
32.7.2. Obsolete Functions for Sending Cancel Requests ................................. 1018
32.8. The Fast-Path Interface .............................................................................. 1020
32.9. Asynchronous Notification ......................................................................... 1021
32.10. Functions Associated with the COPY Command ........................................... 1021
32.10.1. Functions for Sending COPY Data ................................................... 1022
32.10.2. Functions for Receiving COPY Data ................................................ 1023
32.10.3. Obsolete Functions for COPY ......................................................... 1024
32.11. Control Functions ................................................................................... 1026
32.12. Miscellaneous Functions .......................................................................... 1028
32.13. Notice Processing ................................................................................... 1032
32.14. Event System ......................................................................................... 1033
32.14.1. Event Types ................................................................................ 1033
32.14.2. Event Callback Procedure .............................................................. 1035
32.14.3. Event Support Functions ................................................................ 1036
32.14.4. Event Example ............................................................................. 1037
32.15. Environment Variables ............................................................................. 1039
32.16. The Password File .................................................................................. 1041
32.17. The Connection Service File ..................................................................... 1042
32.18. LDAP Lookup of Connection Parameters .................................................... 1042
32.19. SSL Support .......................................................................................... 1043
32.19.1. Client Verification of Server Certificates .......................................... 1044
32.19.2. Client Certificates ......................................................................... 1045
32.19.3. Protection Provided in Different Modes ............................................ 1045
32.19.4. SSL Client File Usage ................................................................... 1047
32.19.5. SSL Library Initialization .............................................................. 1047
32.20. OAuth Support ....................................................................................... 1048
32.20.1. Authdata Hooks ........................................................................... 1048
32.20.2. Debugging and Developer Settings .................................................. 1051
32.21. Behavior in Threaded Programs ................................................................ 1051
32.22. Building libpq Programs .......................................................................... 1052
32.23. Example Programs .................................................................................. 1053
33. Large Objects ..................................................................................................... 1064
33.1. Introduction ............................................................................................. 1064
33.2. Implementation Features ............................................................................ 1064
33.3. Client Interfaces ....................................................................................... 1064
33.3.1. Creating a Large Object .................................................................. 1065
33.3.2. Importing a Large Object ................................................................ 1065
956
Client Interfaces
33.3.3. Exporting a Large Object ................................................................ 1066
33.3.4. Opening an Existing Large Object ..................................................... 1066
33.3.5. Writing Data to a Large Object ........................................................ 1066
33.3.6. Reading Data from a Large Object .................................................... 1067
33.3.7. Seeking in a Large Object ............................................................... 1067
33.3.8. Obtaining the Seek Position of a Large Object ..................................... 1067
33.3.9. Truncating a Large Object ............................................................... 1068
33.3.10. Closing a Large Object Descriptor ................................................... 1068
33.3.11. Removing a Large Object .............................................................. 1068
33.4. Server-Side Functions ............................................................................... 1069
33.5. Example Program ..................................................................................... 1070
34. ECPG — Embedded SQL in C ............................................................................. 1076
34.1. The Concept ............................................................................................ 1076
34.2. Managing Database Connections ................................................................. 1076
34.2.1. Connecting to the Database Server .................................................... 1076
34.2.2. Choosing a Connection ................................................................... 1078
34.2.3. Closing a Connection ...................................................................... 1080
34.3. Running SQL Commands .......................................................................... 1080
34.3.1. Executing SQL Statements .............................................................. 1080
34.3.2. Using Cursors ............................................................................... 1081
34.3.3. Managing Transactions ................................................................... 1081
34.3.4. Prepared Statements ....................................................................... 1082
34.4. Using Host Variables ................................................................................ 1083
34.4.1. Overview ...................................................................................... 1083
34.4.2. Declare Sections ............................................................................ 1083
34.4.3. Retrieving Query Results ................................................................. 1084
34.4.4. Type Mapping ............................................................................... 1085
34.4.5. Handling Nonprimitive SQL Data Types ............................................ 1092
34.4.6. Indicators ...................................................................................... 1097
34.5. Dynamic SQL .......................................................................................... 1097
34.5.1. Executing Statements without a Result Set .......................................... 1098
34.5.2. Executing a Statement with Input Parameters ...................................... 1098
34.5.3. Executing a Statement with a Result Set ............................................. 1098
34.6. pgtypes Library ........................................................................................ 1099
34.6.1. Character Strings ........................................................................... 1100
34.6.2. The numeric Type .......................................................................... 1100
34.6.3. The date Type ............................................................................... 1103
34.6.4. The timestamp Type ....................................................................... 1107
34.6.5. The interval Type ........................................................................... 1110
34.6.6. The decimal Type .......................................................................... 1111
34.6.7. errno Values of pgtypeslib ............................................................... 1112
34.6.8. Special Constants of pgtypeslib ........................................................ 1113
34.7. Using Descriptor Areas ............................................................................. 1113
34.7.1. Named SQL Descriptor Areas .......................................................... 1113
34.7.2. SQLDA Descriptor Areas ................................................................ 1115
34.8. Error Handling ......................................................................................... 1126
34.8.1. Setting Callbacks ........................................................................... 1126
34.8.2. sqlca ............................................................................................ 1128
34.8.3. SQLSTATE vs. SQLCODE ............................................................... 1129
34.9. Preprocessor Directives ............................................................................. 1133
34.9.1. Including Files ............................................................................... 1133
34.9.2. The define and undef Directives ....................................................... 1134
34.9.3. ifdef, ifndef, elif, else, and endif Directives ......................................... 1134
34.10. Processing Embedded SQL Programs ......................................................... 1135
34.11. Library Functions .................................................................................... 1136
34.12. Large Objects ......................................................................................... 1137
34.13. C++ Applications .................................................................................... 1138
34.13.1. Scope for Host Variables ............................................................... 1139
957
Client Interfaces
34.13.2. C++ Application Development with External C Module ....................... 1140
34.14. Embedded SQL Commands ...................................................................... 1142
34.15. Informix Compatibility Mode .................................................................... 1166
34.15.1. Additional Types .......................................................................... 1166
34.15.2. Additional/Missing Embedded SQL Statements ................................. 1167
34.15.3. Informix-compatible SQLDA Descriptor Areas .................................. 1167
34.15.4. Additional Functions ..................................................................... 1170
34.15.5. Additional Constants ..................................................................... 1180
34.16. Oracle Compatibility Mode ...................................................................... 1181
34.17. Internals ................................................................................................ 1181
35. The Information Schema ...................................................................................... 1184
35.1. The Schema ............................................................................................. 1184
35.2. Data Types .............................................................................................. 1184
35.3. information_schema_catalog_name ................................................ 1185
35.4. administrable_role_authorizations ............................................ 1185
35.5. applicable_roles ............................................................................. 1185
35.6. attributes ......................................................................................... 1186
35.7. character_sets ................................................................................. 1188
35.8. check_constraint_routine_usage .................................................. 1189
35.9. check_constraints ........................................................................... 1189
35.10. collations ........................................................................................ 1190
35.11. collation_character_set_applicability .................................. 1190
35.12. column_column_usage ...................................................................... 1191
35.13. column_domain_usage ...................................................................... 1191
35.14. column_options ................................................................................ 1192
35.15. column_privileges .......................................................................... 1192
35.16. column_udt_usage ............................................................................ 1193
35.17. columns .............................................................................................. 1193
35.18. constraint_column_usage .............................................................. 1196
35.19. constraint_table_usage ................................................................ 1197
35.20. data_type_privileges .................................................................... 1197
35.21. domain_constraints ........................................................................ 1198
35.22. domain_udt_usage ............................................................................ 1199
35.23. domains .............................................................................................. 1199
35.24. element_types .................................................................................. 1201
35.25. enabled_roles .................................................................................. 1203
35.26. foreign_data_wrapper_options .................................................... 1203
35.27. foreign_data_wrappers .................................................................. 1204
35.28. foreign_server_options ................................................................ 1204
35.29. foreign_servers .............................................................................. 1204
35.30. foreign_table_options .................................................................. 1205
35.31. foreign_tables ................................................................................ 1205
35.32. key_column_usage ............................................................................ 1206
35.33. parameters ........................................................................................ 1206
35.34. referential_constraints .............................................................. 1208
35.35. role_column_grants ........................................................................ 1209
35.36. role_routine_grants ...................................................................... 1209
35.37. role_table_grants .......................................................................... 1210
35.38. role_udt_grants .............................................................................. 1211
35.39. role_usage_grants .......................................................................... 1211
35.40. routine_column_usage .................................................................... 1212
35.41. routine_privileges ........................................................................ 1213
35.42. routine_routine_usage .................................................................. 1213
35.43. routine_sequence_usage ................................................................ 1214
35.44. routine_table_usage ...................................................................... 1214
35.45. routines ............................................................................................ 1215
35.46. schemata ............................................................................................ 1219
35.47. sequences .......................................................................................... 1220
958
Client Interfaces
35.48. sql_features .................................................................................... 1220
35.49. sql_implementation_info .............................................................. 1221
35.50. sql_parts .......................................................................................... 1221
35.51. sql_sizing ........................................................................................ 1222
35.52. table_constraints .......................................................................... 1222
35.53. table_privileges ............................................................................ 1223
35.54. tables ................................................................................................ 1224
35.55. transforms ........................................................................................ 1224
35.56. triggered_update_columns ............................................................ 1225
35.57. triggers ............................................................................................ 1226
35.58. udt_privileges ................................................................................ 1227
35.59. usage_privileges ............................................................................ 1228
35.60. user_defined_types ........................................................................ 1228
35.61. user_mapping_options .................................................................... 1230
35.62. user_mappings .................................................................................. 1230
35.63. view_column_usage .......................................................................... 1231
35.64. view_routine_usage ........................................................................ 1231
35.65. view_table_usage ............................................................................ 1232
35.66. views .................................................................................................. 1232
959
