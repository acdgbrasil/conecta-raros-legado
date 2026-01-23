Chapter 3. Advanced Features
3.1. Introduction
In the previous chapter we have covered the basics of using SQL to store and access your data in
PostgreSQL. We will now discuss some more advanced features of SQL that simplify management
and prevent loss or corruption of your data. Finally, we will look at some PostgreSQL extensions.
This chapter will on occasion refer to examples found in Chapter 2 to change or improve them, so
it will be useful to have read that chapter. Some examples from this chapter can also be found in
advanced.sql in the tutorial directory. This file also contains some sample data to load, which is
```
not repeated here. (Refer to Section 2.1 for how to use the file.)
```
3.2. Views
Refer back to the queries in Section 2.6. Suppose the combined listing of weather records and city
location is of particular interest to your application, but you do not want to type the query each time
you need it. You can create a view over the query, which gives a name to the query that you can refer
to like an ordinary table:
CREATE VIEW myview AS
SELECT name, temp_lo, temp_hi, prcp, date, location
FROM weather, cities
```
WHERE city = name;
```
```
SELECT * FROM myview;
```
Making liberal use of views is a key aspect of good SQL database design. Views allow you to en-
capsulate the details of the structure of your tables, which might change as your application evolves,
behind consistent interfaces.
Views can be used in almost any place a real table can be used. Building views upon other views is
not uncommon.
3.3. Foreign Keys
Recall the weather and cities tables from Chapter 2. Consider the following problem: You want
to make sure that no one can insert rows in the weather table that do not have a matching entry
in the cities table. This is called maintaining the referential integrity of your data. In simplistic
```
database systems this would be implemented (if at all) by first looking at the cities table to check
```
if a matching record exists, and then inserting or rejecting the new weather records. This approach
has a number of problems and is very inconvenient, so PostgreSQL can do this for you.
The new declaration of the tables would look like this:
```
CREATE TABLE cities (
```
```
name varchar(80) primary key,
```
location point
```
);
```
```
CREATE TABLE weather (
```
```
city varchar(80) references cities(name),
```
temp_lo int,
17
Advanced Features
temp_hi int,
prcp real,
date date
```
);
```
Now try inserting an invalid record:
```
INSERT INTO weather VALUES ('Berkeley', 45, 53, 0.0, '1994-11-28');
```
```
ERROR: insert or update on table "weather" violates foreign key
```
constraint "weather_city_fkey"
```
DETAIL: Key (city)=(Berkeley) is not present in table "cities".
```
The behavior of foreign keys can be finely tuned to your application. We will not go beyond this simple
example in this tutorial, but just refer you to Chapter 5 for more information. Making correct use of
foreign keys will definitely improve the quality of your database applications, so you are strongly
encouraged to learn about them.
3.4. Transactions
Transactions are a fundamental concept of all database systems. The essential point of a transaction is
that it bundles multiple steps into a single, all-or-nothing operation. The intermediate states between
the steps are not visible to other concurrent transactions, and if some failure occurs that prevents the
transaction from completing, then none of the steps affect the database at all.
For example, consider a bank database that contains balances for various customer accounts, as well as
total deposit balances for branches. Suppose that we want to record a payment of $100.00 from Alice's
account to Bob's account. Simplifying outrageously, the SQL commands for this might look like:
UPDATE accounts SET balance = balance - 100.00
```
WHERE name = 'Alice';
```
UPDATE branches SET balance = balance - 100.00
```
WHERE name = (SELECT branch_name FROM accounts WHERE name =
```
```
'Alice');
```
UPDATE accounts SET balance = balance + 100.00
```
WHERE name = 'Bob';
```
UPDATE branches SET balance = balance + 100.00
```
WHERE name = (SELECT branch_name FROM accounts WHERE name =
```
```
'Bob');
```
```
The details of these commands are not important here; the important point is that there are several
```
separate updates involved to accomplish this rather simple operation. Our bank's officers will want to
be assured that either all these updates happen, or none of them happen. It would certainly not do for
a system failure to result in Bob receiving $100.00 that was not debited from Alice. Nor would Alice
long remain a happy customer if she was debited without Bob being credited. We need a guarantee
that if something goes wrong partway through the operation, none of the steps executed so far will
take effect. Grouping the updates into a transaction gives us this guarantee. A transaction is said to be
```
atomic: from the point of view of other transactions, it either happens completely or not at all.
```
We also want a guarantee that once a transaction is completed and acknowledged by the database
system, it has indeed been permanently recorded and won't be lost even if a crash ensues shortly
thereafter. For example, if we are recording a cash withdrawal by Bob, we do not want any chance that
the debit to his account will disappear in a crash just after he walks out the bank door. A transactional
```
database guarantees that all the updates made by a transaction are logged in permanent storage (i.e.,
```
```
on disk) before the transaction is reported complete.
```
18
Advanced Features
Another important property of transactional databases is closely related to the notion of atomic up-
```
dates: when multiple transactions are running concurrently, each one should not be able to see the
```
incomplete changes made by others. For example, if one transaction is busy totalling all the branch
balances, it would not do for it to include the debit from Alice's branch but not the credit to Bob's
branch, nor vice versa. So transactions must be all-or-nothing not only in terms of their permanent
effect on the database, but also in terms of their visibility as they happen. The updates made so far by
an open transaction are invisible to other transactions until the transaction completes, whereupon all
the updates become visible simultaneously.
In PostgreSQL, a transaction is set up by surrounding the SQL commands of the transaction with
BEGIN and COMMIT commands. So our banking transaction would actually look like:
```
BEGIN;
```
UPDATE accounts SET balance = balance - 100.00
```
WHERE name = 'Alice';
```
-- etc etc
```
COMMIT;
```
```
If, partway through the transaction, we decide we do not want to commit (perhaps we just noticed that
```
```
Alice's balance went negative), we can issue the command ROLLBACK instead of COMMIT, and all
```
our updates so far will be canceled.
PostgreSQL actually treats every SQL statement as being executed within a transaction. If you do not
```
issue a BEGIN command, then each individual statement has an implicit BEGIN and (if successful)
```
COMMIT wrapped around it. A group of statements surrounded by BEGIN and COMMIT is sometimes
called a transaction block.
Note
Some client libraries issue BEGIN and COMMIT commands automatically, so that you might
get the effect of transaction blocks without asking. Check the documentation for the interface
you are using.
It's possible to control the statements in a transaction in a more granular fashion through the use of
savepoints. Savepoints allow you to selectively discard parts of the transaction, while committing the
rest. After defining a savepoint with SAVEPOINT, you can if needed roll back to the savepoint with
ROLLBACK TO. All the transaction's database changes between defining the savepoint and rolling
back to it are discarded, but changes earlier than the savepoint are kept.
After rolling back to a savepoint, it continues to be defined, so you can roll back to it several times.
Conversely, if you are sure you won't need to roll back to a particular savepoint again, it can be
released, so the system can free some resources. Keep in mind that either releasing or rolling back to
a savepoint will automatically release all savepoints that were defined after it.
All this is happening within the transaction block, so none of it is visible to other database sessions.
When and if you commit the transaction block, the committed actions become visible as a unit to other
sessions, while the rolled-back actions never become visible at all.
Remembering the bank database, suppose we debit $100.00 from Alice's account, and credit Bob's
account, only to find later that we should have credited Wally's account. We could do it using save-
points like this:
```
BEGIN;
```
UPDATE accounts SET balance = balance - 100.00
```
WHERE name = 'Alice';
```
```
SAVEPOINT my_savepoint;
```
19
Advanced Features
UPDATE accounts SET balance = balance + 100.00
```
WHERE name = 'Bob';
```
-- oops ... forget that and use Wally's account
```
ROLLBACK TO my_savepoint;
```
UPDATE accounts SET balance = balance + 100.00
```
WHERE name = 'Wally';
```
```
COMMIT;
```
This example is, of course, oversimplified, but there's a lot of control possible in a transaction block
through the use of savepoints. Moreover, ROLLBACK TO is the only way to regain control of a
transaction block that was put in aborted state by the system due to an error, short of rolling it back
completely and starting again.
3.5. Window Functions
A window function performs a calculation across a set of table rows that are somehow related to the
current row. This is comparable to the type of calculation that can be done with an aggregate function.
However, window functions do not cause rows to become grouped into a single output row like non-
window aggregate calls would. Instead, the rows retain their separate identities. Behind the scenes,
the window function is able to access more than just the current row of the query result.
Here is an example that shows how to compare each employee's salary with the average salary in his
or her department:
```
SELECT depname, empno, salary, avg(salary) OVER (PARTITION BY
```
```
depname) FROM empsalary;
```
depname | empno | salary | avg
-----------+-------+--------+-----------------------
develop | 11 | 5200 | 5020.0000000000000000
develop | 7 | 4200 | 5020.0000000000000000
develop | 9 | 4500 | 5020.0000000000000000
develop | 8 | 6000 | 5020.0000000000000000
develop | 10 | 5200 | 5020.0000000000000000
personnel | 5 | 3500 | 3700.0000000000000000
personnel | 2 | 3900 | 3700.0000000000000000
sales | 3 | 4800 | 4866.6666666666666667
sales | 1 | 5000 | 4866.6666666666666667
sales | 4 | 4800 | 4866.6666666666666667
```
(10 rows)
```
The first three output columns come directly from the table empsalary, and there is one output row
for each row in the table. The fourth column represents an average taken across all the table rows
```
that have the same depname value as the current row. (This actually is the same function as the
```
non-window avg aggregate, but the OVER clause causes it to be treated as a window function and
```
computed across the window frame.)
```
A window function call always contains an OVER clause directly following the window function's
```
name and argument(s). This is what syntactically distinguishes it from a normal function or non-
```
window aggregate. The OVER clause determines exactly how the rows of the query are split up for
processing by the window function. The PARTITION BY clause within OVER divides the rows into
```
groups, or partitions, that share the same values of the PARTITION BY expression(s). For each row,
```
the window function is computed across the rows that fall into the same partition as the current row.
You can also control the order in which rows are processed by window functions using ORDER BY
```
within OVER. (The window ORDER BY does not even have to match the order in which the rows are
```
```
output.) Here is an example:
```
20
Advanced Features
SELECT depname, empno, salary,
```
row_number() OVER (PARTITION BY depname ORDER BY salary
```
```
DESC)
```
```
FROM empsalary;
```
depname | empno | salary | row_number
-----------+-------+--------+------------
develop | 8 | 6000 | 1
develop | 10 | 5200 | 2
develop | 11 | 5200 | 3
develop | 9 | 4500 | 4
develop | 7 | 4200 | 5
personnel | 2 | 3900 | 1
personnel | 5 | 3500 | 2
sales | 1 | 5000 | 1
sales | 4 | 4800 | 2
sales | 3 | 4800 | 3
```
(10 rows)
```
As shown here, the row_number window function assigns sequential numbers to the rows within
```
each partition, in the order defined by the ORDER BY clause (with tied rows numbered in an unspec-
```
```
ified order). row_number needs no explicit parameter, because its behavior is entirely determined
```
by the OVER clause.
The rows considered by a window function are those of the “virtual table” produced by the query's
FROM clause as filtered by its WHERE, GROUP BY, and HAVING clauses if any. For example, a row
removed because it does not meet the WHERE condition is not seen by any window function. A query
can contain multiple window functions that slice up the data in different ways using different OVER
clauses, but they all act on the same collection of rows defined by this virtual table.
We already saw that ORDER BY can be omitted if the ordering of rows is not important. It is also
possible to omit PARTITION BY, in which case there is a single partition containing all rows.
There is another important concept associated with window functions: for each row, there is a set of
rows within its partition called its window frame. Some window functions act only on the rows of the
window frame, rather than of the whole partition. By default, if ORDER BY is supplied then the frame
consists of all rows from the start of the partition up through the current row, plus any following rows
that are equal to the current row according to the ORDER BY clause. When ORDER BY is omitted the
default frame consists of all rows in the partition. 1 Here is an example using sum:
```
SELECT salary, sum(salary) OVER () FROM empsalary;
```
salary | sum
--------+-------
5200 | 47100
5000 | 47100
3500 | 47100
4800 | 47100
3900 | 47100
4200 | 47100
4500 | 47100
4800 | 47100
6000 | 47100
1 There are options to define the window frame in other ways, but this tutorial does not cover them. See Section 4.2.8 for details.
21
Advanced Features
5200 | 47100
```
(10 rows)
```
Above, since there is no ORDER BY in the OVER clause, the window frame is the same as the partition,
```
which for lack of PARTITION BY is the whole table; in other words each sum is taken over the
```
whole table and so we get the same result for each output row. But if we add an ORDER BY clause,
we get very different results:
```
SELECT salary, sum(salary) OVER (ORDER BY salary) FROM empsalary;
```
salary | sum
--------+-------
3500 | 3500
3900 | 7400
4200 | 11600
4500 | 16100
4800 | 25700
4800 | 25700
5000 | 30700
5200 | 41100
5200 | 41100
6000 | 47100
```
(10 rows)
```
```
Here the sum is taken from the first (lowest) salary up through the current one, including any duplicates
```
```
of the current one (notice the results for the duplicated salaries).
```
Window functions are permitted only in the SELECT list and the ORDER BY clause of the query.
They are forbidden elsewhere, such as in GROUP BY, HAVING and WHERE clauses. This is because
they logically execute after the processing of those clauses. Also, window functions execute after
non-window aggregate functions. This means it is valid to include an aggregate function call in the
arguments of a window function, but not vice versa.
If there is a need to filter or group rows after the window calculations are performed, you can use a
sub-select. For example:
SELECT depname, empno, salary, enroll_date
FROM
```
(SELECT depname, empno, salary, enroll_date,
```
```
row_number() OVER (PARTITION BY depname ORDER BY salary DESC,
```
```
empno) AS pos
```
FROM empsalary
```
) AS ss
```
```
WHERE pos < 3;
```
```
The above query only shows the rows from the inner query having row_number less than 3 (that
```
```
is, the first two rows for each department).
```
When a query involves multiple window functions, it is possible to write out each one with a separate
OVER clause, but this is duplicative and error-prone if the same windowing behavior is wanted for
several functions. Instead, each windowing behavior can be named in a WINDOW clause and then
referenced in OVER. For example:
```
SELECT sum(salary) OVER w, avg(salary) OVER w
```
FROM empsalary
```
WINDOW w AS (PARTITION BY depname ORDER BY salary DESC);
```
22
Advanced Features
More details about window functions can be found in Section 4.2.8, Section 9.22, Section 7.2.5, and
the SELECT reference page.
3.6. Inheritance
Inheritance is a concept from object-oriented databases. It opens up interesting new possibilities of
database design.
Let's create two tables: A table cities and a table capitals. Naturally, capitals are also cities,
so you want some way to show the capitals implicitly when you list all cities. If you're really clever
you might invent some scheme like this:
```
CREATE TABLE capitals (
```
name text,
population real,
```
elevation int, -- (in ft)
```
```
state char(2)
```
```
);
```
```
CREATE TABLE non_capitals (
```
name text,
population real,
```
elevation int -- (in ft)
```
```
);
```
CREATE VIEW cities AS
SELECT name, population, elevation FROM capitals
UNION
```
SELECT name, population, elevation FROM non_capitals;
```
This works OK as far as querying goes, but it gets ugly when you need to update several rows, for
one thing.
A better solution is this:
```
CREATE TABLE cities (
```
name text,
population real,
```
elevation int -- (in ft)
```
```
);
```
```
CREATE TABLE capitals (
```
```
state char(2) UNIQUE NOT NULL
```
```
) INHERITS (cities);
```
```
In this case, a row of capitals inherits all columns (name, population, and elevation) from
```
its parent, cities. The type of the column name is text, a native PostgreSQL type for variable
length character strings. The capitals table has an additional column, state, which shows its
state abbreviation. In PostgreSQL, a table can inherit from zero or more other tables.
For example, the following query finds the names of all cities, including state capitals, that are located
at an elevation over 500 feet:
SELECT name, elevation
FROM cities
```
WHERE elevation > 500;
```
23
Advanced Features
which returns:
name | elevation
-----------+-----------
Las Vegas | 2174
Mariposa | 1953
Madison | 845
```
(3 rows)
```
On the other hand, the following query finds all the cities that are not state capitals and are situated
at an elevation over 500 feet:
SELECT name, elevation
FROM ONLY cities
```
WHERE elevation > 500;
```
name | elevation
-----------+-----------
Las Vegas | 2174
Mariposa | 1953
```
(2 rows)
```
Here the ONLY before cities indicates that the query should be run over only the cities table, and
not tables below cities in the inheritance hierarchy. Many of the commands that we have already
discussed — SELECT, UPDATE, and DELETE — support this ONLY notation.
Note
Although inheritance is frequently useful, it has not been integrated with unique constraints or
foreign keys, which limits its usefulness. See Section 5.11 for more detail.
3.7. Conclusion
PostgreSQL has many features not touched upon in this tutorial introduction, which has been oriented
toward newer users of SQL. These features are discussed in more detail in the remainder of this book.
If you feel you need more introductory material, please visit the PostgreSQL web site2 for links to
more resources.
2 https://www.postgresql.org
24
Part II. The SQL Language
This part describes the use of the SQL language in PostgreSQL. We start with describing the general syntax of
SQL, then how to create tables, how to populate the database, and how to query it. The middle part lists the
available data types and functions for use in SQL commands. Lastly, we address several aspects of importance
for tuning a database.
The information is arranged so that a novice user can follow it from start to end and gain a full understanding
of the topics without having to refer forward too many times. The chapters are intended to be self-contained, so
that advanced users can read the chapters individually as they choose. The information is presented in narrative
form with topical units. Readers looking for a complete description of a particular command are encouraged to
review the Part VI.
Readers should know how to connect to a PostgreSQL database and issue SQL commands. Readers that are
unfamiliar with these issues are encouraged to read Part I first. SQL commands are typically entered using the
PostgreSQL interactive terminal psql, but other programs that have similar functionality can be used as well.
Table of Contents
4. SQL Syntax ............................................................................................................ 33
4.1. Lexical Structure ........................................................................................... 33
4.1.1. Identifiers and Key Words .................................................................... 33
4.1.2. Constants ........................................................................................... 35
4.1.3. Operators ........................................................................................... 40
4.1.4. Special Characters ............................................................................... 40
4.1.5. Comments ......................................................................................... 41
4.1.6. Operator Precedence ............................................................................ 41
4.2. Value Expressions ......................................................................................... 42
4.2.1. Column References ............................................................................. 43
4.2.2. Positional Parameters ........................................................................... 43
4.2.3. Subscripts .......................................................................................... 43
4.2.4. Field Selection .................................................................................... 44
4.2.5. Operator Invocations ........................................................................... 44
4.2.6. Function Calls .................................................................................... 45
4.2.7. Aggregate Expressions ......................................................................... 45
4.2.8. Window Function Calls ........................................................................ 48
4.2.9. Type Casts ......................................................................................... 50
4.2.10. Collation Expressions ......................................................................... 51
4.2.11. Scalar Subqueries .............................................................................. 52
4.2.12. Array Constructors ............................................................................ 52
4.2.13. Row Constructors .............................................................................. 54
4.2.14. Expression Evaluation Rules ............................................................... 55
4.3. Calling Functions .......................................................................................... 56
4.3.1. Using Positional Notation ..................................................................... 57
4.3.2. Using Named Notation ......................................................................... 57
4.3.3. Using Mixed Notation ......................................................................... 58
5. Data Definition ........................................................................................................ 59
5.1. Table Basics ................................................................................................. 59
5.2. Default Values .............................................................................................. 60
5.3. Identity Columns ........................................................................................... 61
5.4. Generated Columns ........................................................................................ 62
5.5. Constraints ................................................................................................... 64
5.5.1. Check Constraints ............................................................................... 64
5.5.2. Not-Null Constraints ............................................................................ 66
5.5.3. Unique Constraints .............................................................................. 67
5.5.4. Primary Keys ..................................................................................... 69
5.5.5. Foreign Keys ...................................................................................... 70
5.5.6. Exclusion Constraints .......................................................................... 73
5.6. System Columns ........................................................................................... 74
5.7. Modifying Tables .......................................................................................... 74
5.7.1. Adding a Column ............................................................................... 75
5.7.2. Removing a Column ............................................................................ 75
5.7.3. Adding a Constraint ............................................................................ 76
5.7.4. Removing a Constraint ........................................................................ 76
5.7.5. Changing a Column's Default Value ....................................................... 76
5.7.6. Changing a Column's Data Type ............................................................ 77
5.7.7. Renaming a Column ............................................................................ 77
5.7.8. Renaming a Table ............................................................................... 77
5.8. Privileges ..................................................................................................... 77
5.9. Row Security Policies .................................................................................... 82
5.10. Schemas ..................................................................................................... 88
5.10.1. Creating a Schema ............................................................................. 89
5.10.2. The Public Schema ............................................................................ 90
5.10.3. The Schema Search Path .................................................................... 90
26
The SQL Language
5.10.4. Schemas and Privileges ...................................................................... 91
5.10.5. The System Catalog Schema ............................................................... 92
5.10.6. Usage Patterns .................................................................................. 92
5.10.7. Portability ........................................................................................ 93
5.11. Inheritance .................................................................................................. 93
5.11.1. Caveats ............................................................................................ 96
5.12. Table Partitioning ........................................................................................ 96
5.12.1. Overview ......................................................................................... 97
5.12.2. Declarative Partitioning ...................................................................... 97
5.12.3. Partitioning Using Inheritance ............................................................ 102
5.12.4. Partition Pruning ............................................................................. 107
5.12.5. Partitioning and Constraint Exclusion .................................................. 108
5.12.6. Best Practices for Declarative Partitioning ............................................ 109
5.13. Foreign Data ............................................................................................. 110
5.14. Other Database Objects ............................................................................... 110
5.15. Dependency Tracking ................................................................................. 111
6. Data Manipulation .................................................................................................. 113
6.1. Inserting Data ............................................................................................. 113
6.2. Updating Data ............................................................................................. 114
6.3. Deleting Data .............................................................................................. 115
6.4. Returning Data from Modified Rows ............................................................... 115
7. Queries ................................................................................................................. 117
7.1. Overview .................................................................................................... 117
7.2. Table Expressions ........................................................................................ 117
7.2.1. The FROM Clause .............................................................................. 118
7.2.2. The WHERE Clause ............................................................................ 126
7.2.3. The GROUP BY and HAVING Clauses .................................................. 127
7.2.4. GROUPING SETS, CUBE, and ROLLUP .............................................. 130
7.2.5. Window Function Processing .............................................................. 133
7.3. Select Lists ................................................................................................. 133
7.3.1. Select-List Items ............................................................................... 133
7.3.2. Column Labels .................................................................................. 134
7.3.3. DISTINCT ...................................................................................... 134
```
7.4. Combining Queries (UNION, INTERSECT, EXCEPT) ........................................ 135
```
```
7.5. Sorting Rows (ORDER BY) .......................................................................... 136
```
7.6. LIMIT and OFFSET .................................................................................... 137
7.7. VALUES Lists ............................................................................................. 137
```
7.8. WITH Queries (Common Table Expressions) .................................................... 138
```
7.8.1. SELECT in WITH ............................................................................. 139
7.8.2. Recursive Queries ............................................................................. 139
7.8.3. Common Table Expression Materialization ............................................ 144
7.8.4. Data-Modifying Statements in WITH .................................................... 145
8. Data Types ............................................................................................................ 148
8.1. Numeric Types ............................................................................................ 149
8.1.1. Integer Types .................................................................................... 150
8.1.2. Arbitrary Precision Numbers ............................................................... 150
8.1.3. Floating-Point Types .......................................................................... 152
8.1.4. Serial Types ..................................................................................... 154
8.2. Monetary Types ........................................................................................... 155
8.3. Character Types ........................................................................................... 155
8.4. Binary Data Types ....................................................................................... 158
8.4.1. bytea Hex Format ........................................................................... 158
8.4.2. bytea Escape Format ....................................................................... 158
8.5. Date/Time Types ......................................................................................... 160
8.5.1. Date/Time Input ................................................................................ 161
8.5.2. Date/Time Output .............................................................................. 165
8.5.3. Time Zones ...................................................................................... 166
8.5.4. Interval Input .................................................................................... 167
27
The SQL Language
8.5.5. Interval Output .................................................................................. 169
8.6. Boolean Type .............................................................................................. 170
8.7. Enumerated Types ....................................................................................... 171
8.7.1. Declaration of Enumerated Types ......................................................... 171
8.7.2. Ordering .......................................................................................... 171
8.7.3. Type Safety ...................................................................................... 172
8.7.4. Implementation Details ....................................................................... 172
8.8. Geometric Types ......................................................................................... 172
8.8.1. Points .............................................................................................. 173
8.8.2. Lines ............................................................................................... 173
8.8.3. Line Segments .................................................................................. 173
8.8.4. Boxes .............................................................................................. 174
8.8.5. Paths ............................................................................................... 174
8.8.6. Polygons .......................................................................................... 174
8.8.7. Circles ............................................................................................. 175
8.9. Network Address Types ................................................................................ 175
8.9.1. inet .............................................................................................. 175
8.9.2. cidr .............................................................................................. 175
8.9.3. inet vs. cidr ................................................................................ 176
8.9.4. macaddr ........................................................................................ 176
8.9.5. macaddr8 ...................................................................................... 177
8.10. Bit String Types ........................................................................................ 177
8.11. Text Search Types ...................................................................................... 178
8.11.1. tsvector ..................................................................................... 178
8.11.2. tsquery ....................................................................................... 180
8.12. UUID Type ............................................................................................... 181
8.13. XML Type ................................................................................................ 181
8.13.1. Creating XML Values ...................................................................... 182
8.13.2. Encoding Handling .......................................................................... 183
8.13.3. Accessing XML Values .................................................................... 183
8.14. JSON Types .............................................................................................. 184
8.14.1. JSON Input and Output Syntax .......................................................... 185
8.14.2. Designing JSON Documents .............................................................. 186
8.14.3. jsonb Containment and Existence ..................................................... 186
8.14.4. jsonb Indexing .............................................................................. 188
8.14.5. jsonb Subscripting ......................................................................... 191
8.14.6. Transforms ..................................................................................... 192
8.14.7. jsonpath Type ................................................................................. 192
8.15. Arrays ...................................................................................................... 194
8.15.1. Declaration of Array Types ............................................................... 194
8.15.2. Array Value Input ............................................................................ 195
8.15.3. Accessing Arrays ............................................................................. 196
8.15.4. Modifying Arrays ............................................................................ 198
8.15.5. Searching in Arrays ......................................................................... 201
8.15.6. Array Input and Output Syntax .......................................................... 202
8.16. Composite Types ....................................................................................... 203
8.16.1. Declaration of Composite Types ......................................................... 203
8.16.2. Constructing Composite Values .......................................................... 204
8.16.3. Accessing Composite Types .............................................................. 205
8.16.4. Modifying Composite Types .............................................................. 206
8.16.5. Using Composite Types in Queries ..................................................... 206
8.16.6. Composite Type Input and Output Syntax ............................................ 209
8.17. Range Types ............................................................................................. 209
8.17.1. Built-in Range and Multirange Types .................................................. 210
8.17.2. Examples ....................................................................................... 210
8.17.3. Inclusive and Exclusive Bounds ......................................................... 211
```
8.17.4. Infinite (Unbounded) Ranges ............................................................. 211
```
8.17.5. Range Input/Output .......................................................................... 211
28
The SQL Language
8.17.6. Constructing Ranges and Multiranges .................................................. 212
8.17.7. Discrete Range Types ....................................................................... 213
8.17.8. Defining New Range Types ............................................................... 213
8.17.9. Indexing ......................................................................................... 214
8.17.10. Constraints on Ranges .................................................................... 215
8.18. Domain Types ........................................................................................... 216
8.19. Object Identifier Types ............................................................................... 216
8.20. pg_lsn Type ........................................................................................... 219
8.21. Pseudo-Types ............................................................................................ 219
9. Functions and Operators .......................................................................................... 221
9.1. Logical Operators ........................................................................................ 221
9.2. Comparison Functions and Operators .............................................................. 222
9.3. Mathematical Functions and Operators ............................................................ 226
9.4. String Functions and Operators ...................................................................... 234
9.4.1. format .......................................................................................... 243
9.5. Binary String Functions and Operators ............................................................ 245
9.6. Bit String Functions and Operators ................................................................. 249
9.7. Pattern Matching ......................................................................................... 251
9.7.1. LIKE .............................................................................................. 252
9.7.2. SIMILAR TO Regular Expressions ..................................................... 253
9.7.3. POSIX Regular Expressions ................................................................ 255
9.8. Data Type Formatting Functions ..................................................................... 270
9.9. Date/Time Functions and Operators ................................................................ 279
9.9.1. EXTRACT, date_part .................................................................... 286
9.9.2. date_trunc .................................................................................. 290
9.9.3. date_bin ...................................................................................... 291
9.9.4. AT TIME ZONE and AT LOCAL ...................................................... 292
9.9.5. Current Date/Time ............................................................................. 294
9.9.6. Delaying Execution ........................................................................... 295
9.10. Enum Support Functions ............................................................................. 296
9.11. Geometric Functions and Operators ............................................................... 297
9.12. Network Address Functions and Operators ..................................................... 304
9.13. Text Search Functions and Operators ............................................................. 307
9.14. UUID Functions ........................................................................................ 313
9.15. XML Functions ......................................................................................... 314
9.15.1. Producing XML Content ................................................................... 314
9.15.2. XML Predicates .............................................................................. 319
9.15.3. Processing XML .............................................................................. 321
9.15.4. Mapping Tables to XML .................................................................. 325
9.16. JSON Functions and Operators ..................................................................... 329
9.16.1. Processing and Creating JSON Data .................................................... 330
9.16.2. The SQL/JSON Path Language .......................................................... 342
9.16.3. SQL/JSON Query Functions .............................................................. 354
9.16.4. JSON_TABLE ................................................................................ 356
9.17. Sequence Manipulation Functions ................................................................. 362
9.18. Conditional Expressions .............................................................................. 363
9.18.1. CASE ............................................................................................. 364
9.18.2. COALESCE ..................................................................................... 365
9.18.3. NULLIF ......................................................................................... 365
9.18.4. GREATEST and LEAST .................................................................... 366
9.19. Array Functions and Operators ..................................................................... 366
9.20. Range/Multirange Functions and Operators ..................................................... 370
9.21. Aggregate Functions ................................................................................... 376
9.22. Window Functions ..................................................................................... 384
9.23. Merge Support Functions ............................................................................. 385
9.24. Subquery Expressions ................................................................................. 386
9.24.1. EXISTS ......................................................................................... 386
9.24.2. IN ................................................................................................. 386
29
The SQL Language
9.24.3. NOT IN ........................................................................................ 387
9.24.4. ANY/SOME ...................................................................................... 387
9.24.5. ALL ............................................................................................... 388
9.24.6. Single-Row Comparison ................................................................... 388
9.25. Row and Array Comparisons ....................................................................... 389
9.25.1. IN ................................................................................................. 389
9.25.2. NOT IN ........................................................................................ 389
```
9.25.3. ANY/SOME (array) ............................................................................ 389
```
```
9.25.4. ALL (array) .................................................................................... 390
```
9.25.5. Row Constructor Comparison ............................................................ 390
9.25.6. Composite Type Comparison ............................................................. 391
9.26. Set Returning Functions .............................................................................. 391
9.27. System Information Functions and Operators .................................................. 395
9.27.1. Session Information Functions ........................................................... 395
9.27.2. Access Privilege Inquiry Functions ..................................................... 398
9.27.3. Schema Visibility Inquiry Functions .................................................... 401
9.27.4. System Catalog Information Functions ................................................ 402
9.27.5. Object Information and Addressing Functions ....................................... 408
9.27.6. Comment Information Functions ........................................................ 409
9.27.7. Data Validity Checking Functions ...................................................... 410
9.27.8. Transaction ID and Snapshot Information Functions ............................... 411
9.27.9. Committed Transaction Information Functions ...................................... 413
9.27.10. Control Data Functions ................................................................... 413
9.27.11. Version Information Functions ......................................................... 415
9.27.12. WAL Summarization Information Functions ....................................... 415
9.28. System Administration Functions .................................................................. 416
9.28.1. Configuration Settings Functions ........................................................ 416
9.28.2. Server Signaling Functions ................................................................ 417
9.28.3. Backup Control Functions ................................................................. 419
9.28.4. Recovery Control Functions .............................................................. 421
9.28.5. Snapshot Synchronization Functions ................................................... 422
9.28.6. Replication Management Functions ..................................................... 423
9.28.7. Database Object Management Functions .............................................. 426
9.28.8. Index Maintenance Functions ............................................................. 431
9.28.9. Generic File Access Functions ........................................................... 432
9.28.10. Advisory Lock Functions ................................................................ 434
9.29. Trigger Functions ....................................................................................... 436
9.30. Event Trigger Functions .............................................................................. 437
9.30.1. Capturing Changes at Command End .................................................. 437
9.30.2. Processing Objects Dropped by a DDL Command ................................. 437
9.30.3. Handling a Table Rewrite Event ......................................................... 439
9.31. Statistics Information Functions .................................................................... 439
9.31.1. Inspecting MCV Lists ...................................................................... 439
10. Type Conversion .................................................................................................. 441
10.1. Overview .................................................................................................. 441
10.2. Operators .................................................................................................. 442
10.3. Functions .................................................................................................. 446
10.4. Value Storage ............................................................................................ 450
10.5. UNION, CASE, and Related Constructs .......................................................... 451
10.6. SELECT Output Columns ............................................................................ 452
11. Indexes ............................................................................................................... 454
11.1. Introduction ............................................................................................... 454
11.2. Index Types .............................................................................................. 455
11.2.1. B-Tree ........................................................................................... 455
11.2.2. Hash .............................................................................................. 456
11.2.3. GiST ............................................................................................. 456
11.2.4. SP-GiST ......................................................................................... 456
11.2.5. GIN ............................................................................................... 456
30
The SQL Language
11.2.6. BRIN ............................................................................................. 457
11.3. Multicolumn Indexes .................................................................................. 457
11.4. Indexes and ORDER BY ............................................................................. 458
11.5. Combining Multiple Indexes ........................................................................ 459
11.6. Unique Indexes .......................................................................................... 460
11.7. Indexes on Expressions ............................................................................... 460
11.8. Partial Indexes ........................................................................................... 461
11.9. Index-Only Scans and Covering Indexes ........................................................ 464
11.10. Operator Classes and Operator Families ....................................................... 467
11.11. Indexes and Collations .............................................................................. 468
11.12. Examining Index Usage ............................................................................. 469
12. Full Text Search ................................................................................................... 470
12.1. Introduction ............................................................................................... 470
12.1.1. What Is a Document? ....................................................................... 471
12.1.2. Basic Text Matching ........................................................................ 471
12.1.3. Configurations ................................................................................. 473
12.2. Tables and Indexes ..................................................................................... 474
12.2.1. Searching a Table ............................................................................ 474
12.2.2. Creating Indexes .............................................................................. 475
12.3. Controlling Text Search .............................................................................. 476
12.3.1. Parsing Documents .......................................................................... 476
12.3.2. Parsing Queries ............................................................................... 477
12.3.3. Ranking Search Results .................................................................... 480
12.3.4. Highlighting Results ......................................................................... 482
12.4. Additional Features .................................................................................... 483
12.4.1. Manipulating Documents .................................................................. 483
12.4.2. Manipulating Queries ....................................................................... 484
12.4.3. Triggers for Automatic Updates ......................................................... 487
12.4.4. Gathering Document Statistics ........................................................... 488
12.5. Parsers ..................................................................................................... 489
12.6. Dictionaries ............................................................................................... 491
12.6.1. Stop Words .................................................................................... 492
12.6.2. Simple Dictionary ............................................................................ 492
12.6.3. Synonym Dictionary ........................................................................ 493
12.6.4. Thesaurus Dictionary ........................................................................ 495
12.6.5. Ispell Dictionary .............................................................................. 497
12.6.6. Snowball Dictionary ......................................................................... 500
12.7. Configuration Example ............................................................................... 500
12.8. Testing and Debugging Text Search .............................................................. 501
12.8.1. Configuration Testing ....................................................................... 502
12.8.2. Parser Testing ................................................................................. 504
12.8.3. Dictionary Testing ........................................................................... 505
12.9. Preferred Index Types for Text Search ........................................................... 506
12.10. psql Support ............................................................................................ 507
12.11. Limitations .............................................................................................. 510
13. Concurrency Control ............................................................................................. 512
13.1. Introduction ............................................................................................... 512
13.2. Transaction Isolation ................................................................................... 512
13.2.1. Read Committed Isolation Level ........................................................ 513
13.2.2. Repeatable Read Isolation Level ......................................................... 515
13.2.3. Serializable Isolation Level ................................................................ 516
13.3. Explicit Locking ........................................................................................ 518
13.3.1. Table-Level Locks ........................................................................... 519
13.3.2. Row-Level Locks ............................................................................ 521
13.3.3. Page-Level Locks ............................................................................ 522
13.3.4. Deadlocks ....................................................................................... 522
13.3.5. Advisory Locks ............................................................................... 523
13.4. Data Consistency Checks at the Application Level ........................................... 524
31
The SQL Language
13.4.1. Enforcing Consistency with Serializable Transactions ............................. 524
13.4.2. Enforcing Consistency with Explicit Blocking Locks .............................. 525
13.5. Serialization Failure Handling ...................................................................... 525
13.6. Caveats ..................................................................................................... 526
13.7. Locking and Indexes ................................................................................... 526
14. Performance Tips ................................................................................................. 528
14.1. Using EXPLAIN ........................................................................................ 528
14.1.1. EXPLAIN Basics ............................................................................. 528
14.1.2. EXPLAIN ANALYZE ...................................................................... 536
14.1.3. Caveats .......................................................................................... 542
14.2. Statistics Used by the Planner ...................................................................... 543
14.2.1. Single-Column Statistics ................................................................... 543
14.2.2. Extended Statistics ........................................................................... 545
14.3. Controlling the Planner with Explicit JOIN Clauses ......................................... 549
14.4. Populating a Database ................................................................................. 551
14.4.1. Disable Autocommit ........................................................................ 551
14.4.2. Use COPY ...................................................................................... 551
14.4.3. Remove Indexes .............................................................................. 551
14.4.4. Remove Foreign Key Constraints ....................................................... 552
14.4.5. Increase maintenance_work_mem ................................................. 552
14.4.6. Increase max_wal_size ................................................................ 552
14.4.7. Disable WAL Archival and Streaming Replication ................................. 552
14.4.8. Run ANALYZE Afterwards ................................................................ 552
14.4.9. Some Notes about pg_dump .............................................................. 553
14.5. Non-Durable Settings .................................................................................. 553
15. Parallel Query ...................................................................................................... 555
15.1. How Parallel Query Works .......................................................................... 555
15.2. When Can Parallel Query Be Used? .............................................................. 556
15.3. Parallel Plans ............................................................................................. 557
15.3.1. Parallel Scans .................................................................................. 557
15.3.2. Parallel Joins .................................................................................. 557
15.3.3. Parallel Aggregation ......................................................................... 558
15.3.4. Parallel Append ............................................................................... 558
15.3.5. Parallel Plan Tips ............................................................................ 558
15.4. Parallel Safety ........................................................................................... 559
15.4.1. Parallel Labeling for Functions and Aggregates ..................................... 559
32
