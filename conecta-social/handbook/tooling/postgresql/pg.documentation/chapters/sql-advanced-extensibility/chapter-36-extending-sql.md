Chapter 36. Extending SQL
In the sections that follow, we will discuss how you can extend the PostgreSQL SQL query language
by adding:
```
• functions (starting in Section 36.3)
```
```
• aggregates (starting in Section 36.12)
```
```
• data types (starting in Section 36.13)
```
```
• operators (starting in Section 36.14)
```
```
• operator classes for indexes (starting in Section 36.16)
```
```
• packages of related objects (starting in Section 36.17)
```
36.1. How Extensibility Works
PostgreSQL is extensible because its operation is catalog-driven. If you are familiar with standard
relational database systems, you know that they store information about databases, tables, columns,
```
etc., in what are commonly known as system catalogs. (Some systems call this the data dictionary.)
```
The catalogs appear to the user as tables like any other, but the DBMS stores its internal bookkeep-
ing in them. One key difference between PostgreSQL and standard relational database systems is
that PostgreSQL stores much more information in its catalogs: not only information about tables and
columns, but also information about data types, functions, access methods, and so on. These tables
can be modified by the user, and since PostgreSQL bases its operation on these tables, this means
that PostgreSQL can be extended by users. By comparison, conventional database systems can only
be extended by changing hardcoded procedures in the source code or by loading modules specially
written by the DBMS vendor.
The PostgreSQL server can moreover incorporate user-written code into itself through dynamic load-
```
ing. That is, the user can specify an object code file (e.g., a shared library) that implements a new type
```
or function, and PostgreSQL will load it as required. Code written in SQL is even more trivial to add
to the server. This ability to modify its operation “on the fly” makes PostgreSQL uniquely suited for
rapid prototyping of new applications and storage structures.
36.2. The PostgreSQL Type System
PostgreSQL data types can be divided into base types, container types, domains, and pseudo-types.
36.2.1. Base Types
```
Base types are those, like integer, that are implemented below the level of the SQL language (typ-
```
```
ically in a low-level language such as C). They generally correspond to what are often known as ab-
```
stract data types. PostgreSQL can only operate on such types through functions provided by the user
and only understands the behavior of such types to the extent that the user describes them. The built-
in base types are described in Chapter 8.
```
Enumerated (enum) types can be considered as a subcategory of base types. The main difference is
```
that they can be created using just SQL commands, without any low-level programming. Refer to
Section 8.7 for more information.
36.2.2. Container Types
PostgreSQL has three kinds of “container” types, which are types that contain multiple values of other
types. These are arrays, composites, and ranges.
Arrays can hold multiple values that are all of the same type. An array type is automatically created
for each base type, composite type, range type, and domain type. But there are no arrays of arrays. So
far as the type system is concerned, multi-dimensional arrays are the same as one-dimensional arrays.
Refer to Section 8.15 for more information.
1240
Extending SQL
Composite types, or row types, are created whenever the user creates a table. It is also possible to use
CREATE TYPE to define a “stand-alone” composite type with no associated table. A composite type
is simply a list of types with associated field names. A value of a composite type is a row or record
of field values. Refer to Section 8.16 for more information.
A range type can hold two values of the same type, which are the lower and upper bounds of the
range. Range types are user-created, although a few built-in ones exist. Refer to Section 8.17 for more
information.
36.2.3. Domains
A domain is based on a particular underlying type and for many purposes is interchangeable with
its underlying type. However, a domain can have constraints that restrict its valid values to a subset
of what the underlying type would allow. Domains are created using the SQL command CREATE
DOMAIN. Refer to Section 8.18 for more information.
36.2.4. Pseudo-Types
There are a few “pseudo-types” for special purposes. Pseudo-types cannot appear as columns of tables
or components of container types, but they can be used to declare the argument and result types of
functions. This provides a mechanism within the type system to identify special classes of functions.
Table 8.27 lists the existing pseudo-types.
36.2.5. Polymorphic Types
Some pseudo-types of special interest are the polymorphic types, which are used to declare polymor-
phic functions. This powerful feature allows a single function definition to operate on many different
```
data types, with the specific data type(s) being determined by the data types actually passed to it in a
```
particular call. The polymorphic types are shown in Table 36.1. Some examples of their use appear
in Section 36.5.11.
Table 36.1. Polymorphic Types
Name Family Description
anyelement Simple Indicates that a function accepts any
data type
anyarray Simple Indicates that a function accepts any
array data type
anynonarray Simple Indicates that a function accepts any
non-array data type
anyenum Simple Indicates that a function accepts any
```
enum data type (see Section 8.7)
```
anyrange Simple Indicates that a function accepts any
```
range data type (see Section 8.17)
```
anymultirange Simple Indicates that a function accepts any
```
multirange data type (see Section 8.17)
```
anycompatible Common Indicates that a function accepts any
data type, with automatic promotion of
multiple arguments to a common data
type
anycompatiblearray Common Indicates that a function accepts any
array data type, with automatic promo-
tion of multiple arguments to a com-
mon data type
1241
Extending SQL
Name Family Description
anycompatiblenonarray Common Indicates that a function accepts any
non-array data type, with automatic
promotion of multiple arguments to a
common data type
anycompatiblerange Common Indicates that a function accepts any
range data type, with automatic pro-
motion of multiple arguments to a
common data type
anycompatiblemultirange Common Indicates that a function accepts any
multirange data type, with automatic
promotion of multiple arguments to a
common data type
Polymorphic arguments and results are tied to each other and are resolved to specific data types when
a query calling a polymorphic function is parsed. When there is more than one polymorphic argument,
the actual data types of the input values must match up as described below. If the function's result
type is polymorphic, or it has output parameters of polymorphic types, the types of those results are
deduced from the actual types of the polymorphic inputs as described below.
For the “simple” family of polymorphic types, the matching and deduction rules work like this:
```
Each position (either argument or return value) declared as anyelement is allowed to have any
```
specific actual data type, but in any given call they must all be the same actual type. Each position
declared as anyarray can have any array data type, but similarly they must all be the same type.
And similarly, positions declared as anyrange must all be the same range type. Likewise for any-
multirange.
Furthermore, if there are positions declared anyarray and others declared anyelement, the actual
array type in the anyarray positions must be an array whose elements are the same type appearing in
the anyelement positions. anynonarray is treated exactly the same as anyelement, but adds
the additional constraint that the actual type must not be an array type. anyenum is treated exactly the
same as anyelement, but adds the additional constraint that the actual type must be an enum type.
Similarly, if there are positions declared anyrange and others declared anyelement or an-
yarray, the actual range type in the anyrange positions must be a range whose subtype is the same
type appearing in the anyelement positions and the same as the element type of the anyarray
positions. If there are positions declared anymultirange, their actual multirange type must contain
ranges matching parameters declared anyrange and base elements matching parameters declared
anyelement and anyarray.
Thus, when more than one argument position is declared with a polymorphic type, the net effect is
that only certain combinations of actual argument types are allowed. For example, a function declared
```
as equal(anyelement, anyelement) will take any two input values, so long as they are of
```
the same data type.
When the return value of a function is declared as a polymorphic type, there must be at least one
```
argument position that is also polymorphic, and the actual data type(s) supplied for the polymorphic
```
arguments determine the actual result type for that call. For example, if there were not already an array
subscripting mechanism, one could define a function that implements subscripting as subscrip-
```
t(anyarray, integer) returns anyelement. This declaration constrains the actual first
```
argument to be an array type, and allows the parser to infer the correct result type from the actual
```
first argument's type. Another example is that a function declared as f(anyarray) returns
```
anyenum will only accept arrays of enum types.
In most cases, the parser can infer the actual data type for a polymorphic result type from arguments
```
that are of a different polymorphic type in the same family; for example anyarray can be deduced
```
from anyelement or vice versa. An exception is that a polymorphic result of type anyrange
1242
Extending SQL
```
requires an argument of type anyrange; it cannot be deduced from anyarray or anyelement
```
arguments. This is because there could be multiple range types with the same subtype.
```
Note that anynonarray and anyenum do not represent separate type variables; they are the
```
same type as anyelement, just with an additional constraint. For example, declaring a function as
```
f(anyelement, anyenum) is equivalent to declaring it as f(anyenum, anyenum): both
```
actual arguments have to be the same enum type.
For the “common” family of polymorphic types, the matching and deduction rules work approxi-
mately the same as for the “simple” family, with one major difference: the actual types of the argu-
ments need not be identical, so long as they can be implicitly cast to a single common type. The
```
common type is selected following the same rules as for UNION and related constructs (see Sec-
```
```
tion 10.5). Selection of the common type considers the actual types of anycompatible and any-
```
compatiblenonarray inputs, the array element types of anycompatiblearray inputs, the
range subtypes of anycompatiblerange inputs, and the multirange subtypes of anycompati-
blemultirange inputs. If anycompatiblenonarray is present then the common type is re-
quired to be a non-array type. Once a common type is identified, arguments in anycompatible
and anycompatiblenonarray positions are automatically cast to that type, and arguments in
anycompatiblearray positions are automatically cast to the array type for that type.
Since there is no way to select a range type knowing only its subtype, use of anycompatiblerange
and/or anycompatiblemultirange requires that all arguments declared with that type have the
same actual range and/or multirange type, and that that type's subtype agree with the selected common
type, so that no casting of the range values is required. As with anyrange and anymultirange,
use of anycompatiblerange and anymultirange as a function result type requires that there
be an anycompatiblerange or anycompatiblemultirange argument.
Notice that there is no anycompatibleenum type. Such a type would not be very useful, since
there normally are not any implicit casts to enum types, meaning that there would be no way to resolve
a common type for dissimilar enum inputs.
The “simple” and “common” polymorphic families represent two independent sets of type variables.
Consider for example
```
CREATE FUNCTION myfunc(a anyelement, b anyelement,
```
```
c anycompatible, d anycompatible)
```
RETURNS anycompatible AS ...
In an actual call of this function, the first two inputs must have exactly the same type. The last two
inputs must be promotable to a common type, but this type need not have anything to do with the type
of the first two inputs. The result will have the common type of the last two inputs.
```
A variadic function (one taking a variable number of arguments, as in Section 36.5.6) can be polymor-
```
```
phic: this is accomplished by declaring its last parameter as VARIADIC anyarray or VARIADIC
```
anycompatiblearray. For purposes of argument matching and determining the actual result type,
such a function behaves the same as if you had written the appropriate number of anynonarray or
anycompatiblenonarray parameters.
36.3. User-Defined Functions
PostgreSQL provides four kinds of functions:
```
• query language functions (functions written in SQL) (Section 36.5)
```
```
• procedural language functions (functions written in, for example, PL/pgSQL or PL/Tcl) (Sec-
```
```
tion 36.8)
```
```
• internal functions (Section 36.9)
```
1243
Extending SQL
```
• C-language functions (Section 36.10)
```
Every kind of function can take base types, composite types, or combinations of these as arguments
```
(parameters). In addition, every kind of function can return a base type or a composite type. Functions
```
can also be defined to return sets of base or composite values.
```
Many kinds of functions can take or return certain pseudo-types (such as polymorphic types), but the
```
available facilities vary. Consult the description of each kind of function for more details.
It's easiest to define SQL functions, so we'll start by discussing those. Most of the concepts presented
for SQL functions will carry over to the other types of functions.
Throughout this chapter, it can be useful to look at the reference page of the CREATE FUNCTION
command to understand the examples better. Some examples from this chapter can be found in func-
s.sql and funcs.c in the src/tutorial directory in the PostgreSQL source distribution.
36.4. User-Defined Procedures
A procedure is a database object similar to a function. The key differences are:
• Procedures are defined with the CREATE PROCEDURE command, not CREATE FUNCTION.
```
• Procedures do not return a function value; hence CREATE PROCEDURE lacks a RETURNS clause.
```
However, procedures can instead return data to their callers via output parameters.
• While a function is called as part of a query or DML command, a procedure is called in isolation
using the CALL command.
```
• A procedure can commit or roll back transactions during its execution (then automatically beginning
```
```
a new transaction), so long as the invoking CALL command is not part of an explicit transaction
```
block. A function cannot do that.
• Certain function attributes, such as strictness, don't apply to procedures. Those attributes control
how the function is used in a query, which isn't relevant to procedures.
The explanations in the following sections about how to define user-defined functions apply to pro-
cedures as well, except for the points made above.
Collectively, functions and procedures are also known as routines. There are commands such as AL-
TER ROUTINE and DROP ROUTINE that can operate on functions and procedures without having
to know which kind it is. Note, however, that there is no CREATE ROUTINE command.
```
36.5. Query Language (SQL) Functions
```
SQL functions execute an arbitrary list of SQL statements, returning the result of the last query in the
```
list. In the simple (non-set) case, the first row of the last query's result will be returned. (Bear in mind
```
```
that “the first row” of a multirow result is not well-defined unless you use ORDER BY.) If the last
```
query happens to return no rows at all, the null value will be returned.
```
Alternatively, an SQL function can be declared to return a set (that is, multiple rows) by specifying
```
the function's return type as SETOF sometype, or equivalently by declaring it as RETURNS TA-
```
BLE(columns). In this case all rows of the last query's result are returned. Further details appear
```
below.
The body of an SQL function must be a list of SQL statements separated by semicolons. A semicolon
after the last statement is optional. Unless the function is declared to return void, the last statement
must be a SELECT, or an INSERT, UPDATE, DELETE, or MERGE that has a RETURNING clause.
Any collection of commands in the SQL language can be packaged together and defined as a function.
```
Besides SELECT queries, the commands can include data modification queries (INSERT, UPDATE,
```
1244
Extending SQL
```
DELETE, and MERGE), as well as other SQL commands. (You cannot use transaction control com-
```
```
mands, e.g., COMMIT, SAVEPOINT, and some utility commands, e.g., VACUUM, in SQL functions.)
```
However, the final command must be a SELECT or have a RETURNING clause that returns whatever
is specified as the function's return type. Alternatively, if you want to define an SQL function that
performs actions but has no useful value to return, you can define it as returning void. For example,
this function removes rows with negative salaries from the emp table:
```
CREATE FUNCTION clean_emp() RETURNS void AS '
```
DELETE FROM emp
```
WHERE salary < 0;
```
```
' LANGUAGE SQL;
```
```
SELECT clean_emp();
```
clean_emp
-----------
```
(1 row)
```
You can also write this as a procedure, thus avoiding the issue of the return type. For example:
```
CREATE PROCEDURE clean_emp() AS '
```
DELETE FROM emp
```
WHERE salary < 0;
```
```
' LANGUAGE SQL;
```
```
CALL clean_emp();
```
In simple cases like this, the difference between a function returning void and a procedure is mostly
stylistic. However, procedures offer additional functionality such as transaction control that is not
available in functions. Also, procedures are SQL standard whereas returning void is a PostgreSQL
extension.
The syntax of the CREATE FUNCTION command requires the function body to be written as a string
```
constant. It is usually most convenient to use dollar quoting (see Section 4.1.2.4) for the string con-
```
stant. If you choose to use regular single-quoted string constant syntax, you must double single quote
```
marks (') and backslashes (\) (assuming escape string syntax) in the body of the function (see Sec-
```
```
tion 4.1.2.1).
```
36.5.1. Arguments for SQL Functions
Arguments of an SQL function can be referenced in the function body using either names or numbers.
Examples of both methods appear below.
To use a name, declare the function argument as having a name, and then just write that name in the
```
function body. If the argument name is the same as any column name in the current SQL command
```
within the function, the column name will take precedence. To override this, qualify the argument
```
name with the name of the function itself, that is function_name.argument_name. (If this
```
would conflict with a qualified column name, again the column name wins. You can avoid the ambi-
```
guity by choosing a different alias for the table within the SQL command.)
```
In the older numeric approach, arguments are referenced using the syntax $n: $1 refers to the first
input argument, $2 to the second, and so on. This will work whether or not the particular argument
was declared with a name.
If an argument is of a composite type, then the dot notation, e.g., argname.fieldname or
$1.fieldname, can be used to access attributes of the argument. Again, you might need to qualify
the argument's name with the function name to make the form with an argument name unambiguous.
1245
Extending SQL
SQL function arguments can only be used as data values, not as identifiers. Thus for example this
is reasonable:
```
INSERT INTO mytable VALUES ($1);
```
but this will not work:
```
INSERT INTO $1 VALUES (42);
```
Note
The ability to use names to reference SQL function arguments was added in PostgreSQL 9.2.
Functions to be used in older servers must use the $n notation.
36.5.2. SQL Functions on Base Types
The simplest possible SQL function has no arguments and simply returns a base type, such as in-
```
teger:
```
```
CREATE FUNCTION one() RETURNS integer AS $$
```
```
SELECT 1 AS result;
```
```
$$ LANGUAGE SQL;
```
-- Alternative syntax for string literal:
```
CREATE FUNCTION one() RETURNS integer AS '
```
```
SELECT 1 AS result;
```
```
' LANGUAGE SQL;
```
```
SELECT one();
```
one
-----
1
```
Notice that we defined a column alias within the function body for the result of the function (with the
```
```
name result), but this column alias is not visible outside the function. Hence, the result is labeled
```
one instead of result.
It is almost as easy to define SQL functions that take base types as arguments:
```
CREATE FUNCTION add_em(x integer, y integer) RETURNS integer AS $$
```
```
SELECT x + y;
```
```
$$ LANGUAGE SQL;
```
```
SELECT add_em(1, 2) AS answer;
```
answer
--------
3
Alternatively, we could dispense with names for the arguments and use numbers:
```
CREATE FUNCTION add_em(integer, integer) RETURNS integer AS $$
```
1246
Extending SQL
```
SELECT $1 + $2;
```
```
$$ LANGUAGE SQL;
```
```
SELECT add_em(1, 2) AS answer;
```
answer
--------
3
Here is a more useful function, which might be used to debit a bank account:
```
CREATE FUNCTION tf1 (accountno integer, debit numeric) RETURNS
```
numeric AS $$
UPDATE bank
SET balance = balance - debit
```
WHERE accountno = tf1.accountno;
```
```
SELECT 1;
```
```
$$ LANGUAGE SQL;
```
A user could execute this function to debit account 17 by $100.00 as follows:
```
SELECT tf1(17, 100.0);
```
In this example, we chose the name accountno for the first argument, but this is the same as the
name of a column in the bank table. Within the UPDATE command, accountno refers to the column
bank.accountno, so tf1.accountno must be used to refer to the argument. We could of course
avoid this by using a different name for the argument.
In practice one would probably like a more useful result from the function than a constant 1, so a more
likely definition is:
```
CREATE FUNCTION tf1 (accountno integer, debit numeric) RETURNS
```
numeric AS $$
UPDATE bank
SET balance = balance - debit
```
WHERE accountno = tf1.accountno;
```
```
SELECT balance FROM bank WHERE accountno = tf1.accountno;
```
```
$$ LANGUAGE SQL;
```
which adjusts the balance and returns the new balance. The same thing could be done in one command
using RETURNING:
```
CREATE FUNCTION tf1 (accountno integer, debit numeric) RETURNS
```
numeric AS $$
UPDATE bank
SET balance = balance - debit
WHERE accountno = tf1.accountno
```
RETURNING balance;
```
```
$$ LANGUAGE SQL;
```
If the final SELECT or RETURNING clause in an SQL function does not return exactly the function's
declared result type, PostgreSQL will automatically cast the value to the required type, if that is possi-
ble with an implicit or assignment cast. Otherwise, you must write an explicit cast. For example, sup-
pose we wanted the previous add_em function to return type float8 instead. It's sufficient to write
1247
Extending SQL
```
CREATE FUNCTION add_em(integer, integer) RETURNS float8 AS $$
```
```
SELECT $1 + $2;
```
```
$$ LANGUAGE SQL;
```
```
since the integer sum can be implicitly cast to float8. (See Chapter 10 or CREATE CAST for
```
```
more about casts.)
```
36.5.3. SQL Functions on Composite Types
When writing functions with arguments of composite types, we must not only specify which argument
```
we want but also the desired attribute (field) of that argument. For example, suppose that emp is a
```
table containing employee data, and therefore also the name of the composite type of each row of
the table. Here is a function double_salary that computes what someone's salary would be if it
were doubled:
```
CREATE TABLE emp (
```
name text,
salary numeric,
age integer,
cubicle point
```
);
```
```
INSERT INTO emp VALUES ('Bill', 4200, 45, '(2,1)');
```
```
CREATE FUNCTION double_salary(emp) RETURNS numeric AS $$
```
```
SELECT $1.salary * 2 AS salary;
```
```
$$ LANGUAGE SQL;
```
```
SELECT name, double_salary(emp.*) AS dream
```
FROM emp
```
WHERE emp.cubicle ~= point '(2,1)';
```
name | dream
------+-------
Bill | 8400
Notice the use of the syntax $1.salary to select one field of the argument row value. Also notice
how the calling SELECT command uses table_name.* to select the entire current row of a table
as a composite value. The table row can alternatively be referenced using just the table name, like this:
```
SELECT name, double_salary(emp) AS dream
```
FROM emp
```
WHERE emp.cubicle ~= point '(2,1)';
```
```
but this usage is deprecated since it's easy to get confused. (See Section 8.16.5 for details about these
```
```
two notations for the composite value of a table row.)
```
Sometimes it is handy to construct a composite argument value on-the-fly. This can be done with the
ROW construct. For example, we could adjust the data being passed to the function:
```
SELECT name, double_salary(ROW(name, salary*1.1, age, cubicle)) AS
```
dream
```
FROM emp;
```
It is also possible to build a function that returns a composite type. This is an example of a function
that returns a single emp row:
1248
Extending SQL
```
CREATE FUNCTION new_emp() RETURNS emp AS $$
```
SELECT text 'None' AS name,
1000.0 AS salary,
25 AS age,
```
point '(2,2)' AS cubicle;
```
```
$$ LANGUAGE SQL;
```
In this example we have specified each of the attributes with a constant value, but any computation
could have been substituted for these constants.
Note two important things about defining the function:
• The select list order in the query must be exactly the same as that in which the columns appear in
```
the composite type. (Naming the columns, as we did above, is irrelevant to the system.)
```
• We must ensure each expression's type can be cast to that of the corresponding column of the
composite type. Otherwise we'll get errors like this:
```
ERROR: return type mismatch in function declared to return emp
```
```
DETAIL: Final statement returns text instead of point at column
```
4.
As with the base-type case, the system will not insert explicit casts automatically, only implicit or
assignment casts.
A different way to define the same function is:
```
CREATE FUNCTION new_emp() RETURNS emp AS $$
```
```
SELECT ROW('None', 1000.0, 25, '(2,2)')::emp;
```
```
$$ LANGUAGE SQL;
```
Here we wrote a SELECT that returns just a single column of the correct composite type. This isn't
really better in this situation, but it is a handy alternative in some cases — for example, if we need
to compute the result by calling another function that returns the desired composite value. Another
example is that if we are trying to write a function that returns a domain over composite, rather than
a plain composite type, it is always necessary to write it as returning a single column, since there is
no way to cause a coercion of the whole row result.
We could call this function directly either by using it in a value expression:
```
SELECT new_emp();
```
new_emp
--------------------------
```
(None,1000.0,25,"(2,2)")
```
or by calling it as a table function:
```
SELECT * FROM new_emp();
```
name | salary | age | cubicle
------+--------+-----+---------
```
None | 1000.0 | 25 | (2,2)
```
1249
Extending SQL
The second way is described more fully in Section 36.5.8.
```
When you use a function that returns a composite type, you might want only one field (attribute) from
```
its result. You can do that with syntax like this:
```
SELECT (new_emp()).name;
```
name
------
None
The extra parentheses are needed to keep the parser from getting confused. If you try to do it without
them, you get something like this:
```
SELECT new_emp().name;
```
```
ERROR: syntax error at or near "."
```
```
LINE 1: SELECT new_emp().name;
```
^
Another option is to use functional notation for extracting an attribute:
```
SELECT name(new_emp());
```
name
------
None
As explained in Section 8.16.5, the field notation and functional notation are equivalent.
Another way to use a function returning a composite type is to pass the result to another function that
accepts the correct row type as input:
```
CREATE FUNCTION getname(emp) RETURNS text AS $$
```
```
SELECT $1.name;
```
```
$$ LANGUAGE SQL;
```
```
SELECT getname(new_emp());
```
getname
---------
None
```
(1 row)
```
36.5.4. SQL Functions with Output Parameters
An alternative way of describing a function's results is to define it with output parameters, as in this
```
example:
```
```
CREATE FUNCTION add_em (IN x int, IN y int, OUT sum int)
```
AS 'SELECT x + y'
```
LANGUAGE SQL;
```
```
SELECT add_em(3,7);
```
add_em
--------
10
1250
Extending SQL
```
(1 row)
```
This is not essentially different from the version of add_em shown in Section 36.5.2. The real value
of output parameters is that they provide a convenient way of defining functions that return several
columns. For example,
```
CREATE FUNCTION sum_n_product (x int, y int, OUT sum int, OUT
```
```
product int)
```
AS 'SELECT x + y, x * y'
```
LANGUAGE SQL;
```
```
SELECT * FROM sum_n_product(11,42);
```
sum | product
-----+---------
53 | 462
```
(1 row)
```
What has essentially happened here is that we have created an anonymous composite type for the
result of the function. The above example has the same end result as
```
CREATE TYPE sum_prod AS (sum int, product int);
```
```
CREATE FUNCTION sum_n_product (int, int) RETURNS sum_prod
```
AS 'SELECT $1 + $2, $1 * $2'
```
LANGUAGE SQL;
```
but not having to bother with the separate composite type definition is often handy. Notice that the
names attached to the output parameters are not just decoration, but determine the column names of
```
the anonymous composite type. (If you omit a name for an output parameter, the system will choose
```
```
a name on its own.)
```
Notice that output parameters are not included in the calling argument list when invoking such a
```
function from SQL. This is because PostgreSQL considers only the input parameters to define the
```
function's calling signature. That means also that only the input parameters matter when referencing
the function for purposes such as dropping it. We could drop the above function with either of
```
DROP FUNCTION sum_n_product (x int, y int, OUT sum int, OUT product
```
```
int);
```
```
DROP FUNCTION sum_n_product (int, int);
```
```
Parameters can be marked as IN (the default), OUT, INOUT, or VARIADIC. An INOUT parameter
```
```
serves as both an input parameter (part of the calling argument list) and an output parameter (part
```
```
of the result record type). VARIADIC parameters are input parameters, but are treated specially as
```
described below.
36.5.5. SQL Procedures with Output Parameters
Output parameters are also supported in procedures, but they work a bit differently from functions.
In CALL commands, output parameters must be included in the argument list. For example, the bank
account debiting routine from earlier could be written like this:
```
CREATE PROCEDURE tp1 (accountno integer, debit numeric, OUT
```
```
new_balance numeric) AS $$
```
UPDATE bank
SET balance = balance - debit
WHERE accountno = tp1.accountno
1251
Extending SQL
```
RETURNING balance;
```
```
$$ LANGUAGE SQL;
```
To call this procedure, an argument matching the OUT parameter must be included. It's customary to
write NULL:
```
CALL tp1(17, 100.0, NULL);
```
If you write something else, it must be an expression that is implicitly coercible to the declared type of
the parameter, just as for input parameters. Note however that such an expression will not be evaluated.
When calling a procedure from PL/pgSQL, instead of writing NULL you must write a variable that
will receive the procedure's output. See Section 41.6.3 for details.
36.5.6. SQL Functions with Variable Numbers of Argu-
ments
SQL functions can be declared to accept variable numbers of arguments, so long as all the “optional”
arguments are of the same data type. The optional arguments will be passed to the function as an
```
array. The function is declared by marking the last parameter as VARIADIC; this parameter must be
```
declared as being of an array type. For example:
```
CREATE FUNCTION mleast(VARIADIC arr numeric[]) RETURNS numeric AS $
```
$
```
SELECT min($1[i]) FROM generate_subscripts($1, 1) g(i);
```
```
$$ LANGUAGE SQL;
```
```
SELECT mleast(10, -1, 5, 4.4);
```
mleast
--------
-1
```
(1 row)
```
Effectively, all the actual arguments at or beyond the VARIADIC position are gathered up into a one-
dimensional array, as if you had written
```
SELECT mleast(ARRAY[10, -1, 5, 4.4]); -- doesn't work
```
You can't actually write that, though — or at least, it will not match this function definition. A para-
meter marked VARIADIC matches one or more occurrences of its element type, not of its own type.
```
Sometimes it is useful to be able to pass an already-constructed array to a variadic function; this is
```
particularly handy when one variadic function wants to pass on its array parameter to another one.
Also, this is the only secure way to call a variadic function found in a schema that permits untrusted
```
users to create objects; see Section 10.3. You can do this by specifying VARIADIC in the call:
```
```
SELECT mleast(VARIADIC ARRAY[10, -1, 5, 4.4]);
```
This prevents expansion of the function's variadic parameter into its element type, thereby allowing the
array argument value to match normally. VARIADIC can only be attached to the last actual argument
of a function call.
Specifying VARIADIC in the call is also the only way to pass an empty array to a variadic function,
for example:
1252
Extending SQL
```
SELECT mleast(VARIADIC ARRAY[]::numeric[]);
```
```
Simply writing SELECT mleast() does not work because a variadic parameter must match at least
```
```
one actual argument. (You could define a second function also named mleast, with no parameters,
```
```
if you wanted to allow such calls.)
```
The array element parameters generated from a variadic parameter are treated as not having any names
```
of their own. This means it is not possible to call a variadic function using named arguments (Sec-
```
```
tion 4.3), except when you specify VARIADIC. For example, this will work:
```
```
SELECT mleast(VARIADIC arr => ARRAY[10, -1, 5, 4.4]);
```
but not these:
```
SELECT mleast(arr => 10);
```
```
SELECT mleast(arr => ARRAY[10, -1, 5, 4.4]);
```
36.5.7. SQL Functions with Default Values for Argu-
ments
Functions can be declared with default values for some or all input arguments. The default values are
inserted whenever the function is called with insufficiently many actual arguments. Since arguments
can only be omitted from the end of the actual argument list, all parameters after a parameter with a
```
default value have to have default values as well. (Although the use of named argument notation could
```
allow this restriction to be relaxed, it's still enforced so that positional argument notation works sen-
```
sibly.) Whether or not you use it, this capability creates a need for precautions when calling functions
```
```
in databases where some users mistrust other users; see Section 10.3.
```
For example:
```
CREATE FUNCTION foo(a int, b int DEFAULT 2, c int DEFAULT 3)
```
RETURNS int
LANGUAGE SQL
AS $$
```
SELECT $1 + $2 + $3;
```
```
$$;
```
```
SELECT foo(10, 20, 30);
```
foo
-----
60
```
(1 row)
```
```
SELECT foo(10, 20);
```
foo
-----
33
```
(1 row)
```
```
SELECT foo(10);
```
foo
-----
15
```
(1 row)
```
1253
Extending SQL
```
SELECT foo(); -- fails since there is no default for the first
```
argument
```
ERROR: function foo() does not exist
```
```
The = sign can also be used in place of the key word DEFAULT.
```
36.5.8. SQL Functions as Table Sources
All SQL functions can be used in the FROM clause of a query, but it is particularly useful for functions
returning composite types. If the function is defined to return a base type, the table function produces
a one-column table. If the function is defined to return a composite type, the table function produces
a column for each attribute of the composite type.
Here is an example:
```
CREATE TABLE foo (fooid int, foosubid int, fooname text);
```
```
INSERT INTO foo VALUES (1, 1, 'Joe');
```
```
INSERT INTO foo VALUES (1, 2, 'Ed');
```
```
INSERT INTO foo VALUES (2, 1, 'Mary');
```
```
CREATE FUNCTION getfoo(int) RETURNS foo AS $$
```
```
SELECT * FROM foo WHERE fooid = $1;
```
```
$$ LANGUAGE SQL;
```
```
SELECT *, upper(fooname) FROM getfoo(1) AS t1;
```
fooid | foosubid | fooname | upper
-------+----------+---------+-------
1 | 1 | Joe | JOE
```
(1 row)
```
As the example shows, we can work with the columns of the function's result just the same as if they
were columns of a regular table.
Note that we only got one row out of the function. This is because we did not use SETOF. That is
described in the next section.
36.5.9. SQL Functions Returning Sets
When an SQL function is declared as returning SETOF sometype, the function's final query is
executed to completion, and each row it outputs is returned as an element of the result set.
This feature is normally used when calling the function in the FROM clause. In this case each row
returned by the function becomes a row of the table seen by the query. For example, assume that table
foo has the same contents as above, and we say:
```
CREATE FUNCTION getfoo(int) RETURNS SETOF foo AS $$
```
```
SELECT * FROM foo WHERE fooid = $1;
```
```
$$ LANGUAGE SQL;
```
```
SELECT * FROM getfoo(1) AS t1;
```
Then we would get:
fooid | foosubid | fooname
-------+----------+---------
1254
Extending SQL
1 | 1 | Joe
1 | 2 | Ed
```
(2 rows)
```
It is also possible to return multiple rows with the columns defined by output parameters, like this:
```
CREATE TABLE tab (y int, z int);
```
```
INSERT INTO tab VALUES (1, 2), (3, 4), (5, 6), (7, 8);
```
```
CREATE FUNCTION sum_n_product_with_tab (x int, OUT sum int, OUT
```
```
product int)
```
RETURNS SETOF record
AS $$
```
SELECT $1 + tab.y, $1 * tab.y FROM tab;
```
```
$$ LANGUAGE SQL;
```
```
SELECT * FROM sum_n_product_with_tab(10);
```
sum | product
-----+---------
11 | 10
13 | 30
15 | 50
17 | 70
```
(4 rows)
```
The key point here is that you must write RETURNS SETOF record to indicate that the function
returns multiple rows instead of just one. If there is only one output parameter, write that parameter's
type instead of record.
It is frequently useful to construct a query's result by invoking a set-returning function multiple times,
with the parameters for each invocation coming from successive rows of a table or subquery. The
preferred way to do this is to use the LATERAL key word, which is described in Section 7.2.1.5. Here
is an example using a set-returning function to enumerate elements of a tree structure:
```
SELECT * FROM nodes;
```
name | parent
-----------+--------
Top |
Child1 | Top
Child2 | Top
Child3 | Top
SubChild1 | Child1
SubChild2 | Child1
```
(6 rows)
```
```
CREATE FUNCTION listchildren(text) RETURNS SETOF text AS $$
```
SELECT name FROM nodes WHERE parent = $1
```
$$ LANGUAGE SQL STABLE;
```
```
SELECT * FROM listchildren('Top');
```
listchildren
--------------
Child1
Child2
Child3
```
(3 rows)
```
1255
Extending SQL
```
SELECT name, child FROM nodes, LATERAL listchildren(name) AS child;
```
name | child
--------+-----------
Top | Child1
Top | Child2
Top | Child3
Child1 | SubChild1
Child1 | SubChild2
```
(5 rows)
```
This example does not do anything that we couldn't have done with a simple join, but in more complex
calculations the option to put some of the work into a function can be quite convenient.
Functions returning sets can also be called in the select list of a query. For each row that the query
generates by itself, the set-returning function is invoked, and an output row is generated for each
element of the function's result set. The previous example could also be done with queries like these:
```
SELECT listchildren('Top');
```
listchildren
--------------
Child1
Child2
Child3
```
(3 rows)
```
```
SELECT name, listchildren(name) FROM nodes;
```
name | listchildren
--------+--------------
Top | Child1
Top | Child2
Top | Child3
Child1 | SubChild1
Child1 | SubChild2
```
(5 rows)
```
In the last SELECT, notice that no output row appears for Child2, Child3, etc. This happens
because listchildren returns an empty set for those arguments, so no result rows are generated.
This is the same behavior as we got from an inner join to the function result when using the LATERAL
syntax.
PostgreSQL's behavior for a set-returning function in a query's select list is almost exactly the same as
if the set-returning function had been written in a LATERAL FROM-clause item instead. For example,
```
SELECT x, generate_series(1,5) AS g FROM tab;
```
is almost equivalent to
```
SELECT x, g FROM tab, LATERAL generate_series(1,5) AS g;
```
It would be exactly the same, except that in this specific example, the planner could choose to put g
on the outside of the nested-loop join, since g has no actual lateral dependency on tab. That would
result in a different output row order. Set-returning functions in the select list are always evaluated
as though they are on the inside of a nested-loop join with the rest of the FROM clause, so that the
```
function(s) are run to completion before the next row from the FROM clause is considered.
```
If there is more than one set-returning function in the query's select list, the behavior is similar to what
```
you get from putting the functions into a single LATERAL ROWS FROM( ... ) FROM-clause item.
```
1256
Extending SQL
For each row from the underlying query, there is an output row using the first result from each function,
then an output row using the second result, and so on. If some of the set-returning functions produce
fewer outputs than others, null values are substituted for the missing data, so that the total number of
rows emitted for one underlying row is the same as for the set-returning function that produced the
most outputs. Thus the set-returning functions run “in lockstep” until they are all exhausted, and then
execution continues with the next underlying row.
Set-returning functions can be nested in a select list, although that is not allowed in FROM-clause items.
In such cases, each level of nesting is treated separately, as though it were a separate LATERAL ROWS
```
FROM( ... ) item. For example, in
```
```
SELECT srf1(srf2(x), srf3(y)), srf4(srf5(z)) FROM tab;
```
the set-returning functions srf2, srf3, and srf5 would be run in lockstep for each row of tab,
and then srf1 and srf4 would be applied in lockstep to each row produced by the lower functions.
Set-returning functions cannot be used within conditional-evaluation constructs, such as CASE or
COALESCE. For example, consider
```
SELECT x, CASE WHEN x > 0 THEN generate_series(1, 5) ELSE 0 END
```
```
FROM tab;
```
It might seem that this should produce five repetitions of input rows that have x > 0, and a single
```
repetition of those that do not; but actually, because generate_series(1, 5) would be run in
```
an implicit LATERAL FROM item before the CASE expression is ever evaluated, it would produce five
repetitions of every input row. To reduce confusion, such cases produce a parse-time error instead.
Note
If a function's last command is INSERT, UPDATE, DELETE, or MERGE with RETURNING,
that command will always be executed to completion, even if the function is not declared with
SETOF or the calling query does not fetch all the result rows. Any extra rows produced by the
RETURNING clause are silently dropped, but the commanded table modifications still happen
```
(and are all completed before returning from the function).
```
Note
Before PostgreSQL 10, putting more than one set-returning function in the same select list
did not behave very sensibly unless they always produced equal numbers of rows. Otherwise,
what you got was a number of output rows equal to the least common multiple of the numbers
of rows produced by the set-returning functions. Also, nested set-returning functions did not
```
work as described above; instead, a set-returning function could have at most one set-returning
```
argument, and each nest of set-returning functions was run independently. Also, conditional
```
execution (set-returning functions inside CASE etc.) was previously allowed, complicating
```
things even more. Use of the LATERAL syntax is recommended when writing queries that
need to work in older PostgreSQL versions, because that will give consistent results across
different versions. If you have a query that is relying on conditional execution of a set-returning
function, you may be able to fix it by moving the conditional test into a custom set-returning
function. For example,
```
SELECT x, CASE WHEN y > 0 THEN generate_series(1, z) ELSE 5
```
```
END FROM tab;
```
could become
1257
Extending SQL
```
CREATE FUNCTION case_generate_series(cond bool, start int, fin
```
```
int, els int)
```
RETURNS SETOF int AS $$
BEGIN
IF cond THEN
```
RETURN QUERY SELECT generate_series(start, fin);
```
ELSE
```
RETURN QUERY SELECT els;
```
```
END IF;
```
```
END$$ LANGUAGE plpgsql;
```
```
SELECT x, case_generate_series(y > 0, 1, z, 5) FROM tab;
```
This formulation will work the same in all versions of PostgreSQL.
36.5.10. SQL Functions Returning TABLE
There is another way to declare a function as returning a set, which is to use the syntax RETURNS
```
TABLE(columns). This is equivalent to using one or more OUT parameters plus marking the func-
```
```
tion as returning SETOF record (or SETOF a single output parameter's type, as appropriate). This
```
notation is specified in recent versions of the SQL standard, and thus may be more portable than using
SETOF.
For example, the preceding sum-and-product example could also be done this way:
```
CREATE FUNCTION sum_n_product_with_tab (x int)
```
```
RETURNS TABLE(sum int, product int) AS $$
```
```
SELECT $1 + tab.y, $1 * tab.y FROM tab;
```
```
$$ LANGUAGE SQL;
```
It is not allowed to use explicit OUT or INOUT parameters with the RETURNS TABLE notation —
you must put all the output columns in the TABLE list.
36.5.11. Polymorphic SQL Functions
SQL functions can be declared to accept and return the polymorphic types described in Section 36.2.5.
Here is a polymorphic function make_array that builds up an array from two arbitrary data type
```
elements:
```
```
CREATE FUNCTION make_array(anyelement, anyelement) RETURNS anyarray
```
AS $$
```
SELECT ARRAY[$1, $2];
```
```
$$ LANGUAGE SQL;
```
```
SELECT make_array(1, 2) AS intarray, make_array('a'::text, 'b') AS
```
```
textarray;
```
intarray | textarray
----------+-----------
```
{1,2} | {a,b}
```
```
(1 row)
```
Notice the use of the typecast 'a'::text to specify that the argument is of type text. This is
required if the argument is just a string literal, since otherwise it would be treated as type unknown,
and array of unknown is not a valid type. Without the typecast, you will get errors like this:
1258
Extending SQL
```
ERROR: could not determine polymorphic type because input has type
```
unknown
With make_array declared as above, you must provide two arguments that are of exactly the same
```
data type; the system will not attempt to resolve any type differences. Thus for example this does not
```
```
work:
```
```
SELECT make_array(1, 2.5) AS numericarray;
```
```
ERROR: function make_array(integer, numeric) does not exist
```
An alternative approach is to use the “common” family of polymorphic types, which allows the system
to try to identify a suitable common type:
```
CREATE FUNCTION make_array2(anycompatible, anycompatible)
```
RETURNS anycompatiblearray AS $$
```
SELECT ARRAY[$1, $2];
```
```
$$ LANGUAGE SQL;
```
```
SELECT make_array2(1, 2.5) AS numericarray;
```
numericarray
--------------
```
{1,2.5}
```
```
(1 row)
```
Because the rules for common type resolution default to choosing type text when all inputs are of
unknown types, this also works:
```
SELECT make_array2('a', 'b') AS textarray;
```
textarray
-----------
```
{a,b}
```
```
(1 row)
```
It is permitted to have polymorphic arguments with a fixed return type, but the converse is not. For
```
example:
```
```
CREATE FUNCTION is_greater(anyelement, anyelement) RETURNS boolean
```
AS $$
```
SELECT $1 > $2;
```
```
$$ LANGUAGE SQL;
```
```
SELECT is_greater(1, 2);
```
is_greater
------------
f
```
(1 row)
```
```
CREATE FUNCTION invalid_func() RETURNS anyelement AS $$
```
```
SELECT 1;
```
```
$$ LANGUAGE SQL;
```
```
ERROR: cannot determine result data type
```
```
DETAIL: A result of type anyelement requires at least one input of
```
type anyelement, anyarray, anynonarray, anyenum, or anyrange.
Polymorphism can be used with functions that have output arguments. For example:
1259
Extending SQL
```
CREATE FUNCTION dup (f1 anyelement, OUT f2 anyelement, OUT f3
```
```
anyarray)
```
```
AS 'select $1, array[$1,$1]' LANGUAGE SQL;
```
```
SELECT * FROM dup(22);
```
f2 | f3
----+---------
```
22 | {22,22}
```
```
(1 row)
```
Polymorphism can also be used with variadic functions. For example:
```
CREATE FUNCTION anyleast (VARIADIC anyarray) RETURNS anyelement AS
```
$$
```
SELECT min($1[i]) FROM generate_subscripts($1, 1) g(i);
```
```
$$ LANGUAGE SQL;
```
```
SELECT anyleast(10, -1, 5, 4);
```
anyleast
----------
-1
```
(1 row)
```
```
SELECT anyleast('abc'::text, 'def');
```
anyleast
----------
abc
```
(1 row)
```
```
CREATE FUNCTION concat_values(text, VARIADIC anyarray) RETURNS text
```
AS $$
```
SELECT array_to_string($2, $1);
```
```
$$ LANGUAGE SQL;
```
```
SELECT concat_values('|', 1, 4, 2);
```
concat_values
---------------
1|4|2
```
(1 row)
```
36.5.12. SQL Functions with Collations
When an SQL function has one or more parameters of collatable data types, a collation is identified
for each function call depending on the collations assigned to the actual arguments, as described in
```
Section 23.2. If a collation is successfully identified (i.e., there are no conflicts of implicit collations
```
```
among the arguments) then all the collatable parameters are treated as having that collation implicitly.
```
This will affect the behavior of collation-sensitive operations within the function. For example, using
the anyleast function described above, the result of
```
SELECT anyleast('abc'::text, 'ABC');
```
will depend on the database's default collation. In C locale the result will be ABC, but in many other
locales it will be abc. The collation to use can be forced by adding a COLLATE clause to any of the
arguments, for example
1260
Extending SQL
```
SELECT anyleast('abc'::text, 'ABC' COLLATE "C");
```
Alternatively, if you wish a function to operate with a particular collation regardless of what it is called
with, insert COLLATE clauses as needed in the function definition. This version of anyleast would
always use en_US locale to compare strings:
```
CREATE FUNCTION anyleast (VARIADIC anyarray) RETURNS anyelement AS
```
$$
```
SELECT min($1[i] COLLATE "en_US") FROM generate_subscripts($1,
```
```
1) g(i);
```
```
$$ LANGUAGE SQL;
```
But note that this will throw an error if applied to a non-collatable data type.
If no common collation can be identified among the actual arguments, then an SQL function treats
```
its parameters as having their data types' default collation (which is usually the database's default
```
```
collation, but could be different for parameters of domain types).
```
The behavior of collatable parameters can be thought of as a limited form of polymorphism, applicable
only to textual data types.
36.6. Function Overloading
More than one function can be defined with the same SQL name, so long as the arguments they take are
different. In other words, function names can be overloaded. Whether or not you use it, this capability
```
entails security precautions when calling functions in databases where some users mistrust other users;
```
see Section 10.3. When a query is executed, the server will determine which function to call from
the data types and the number of the provided arguments. Overloading can also be used to simulate
functions with a variable number of arguments, up to a finite maximum number.
When creating a family of overloaded functions, one should be careful not to create ambiguities. For
instance, given the functions:
```
CREATE FUNCTION test(int, real) RETURNS ...
```
```
CREATE FUNCTION test(smallint, double precision) RETURNS ...
```
```
it is not immediately clear which function would be called with some trivial input like test(1,
```
```
1.5). The currently implemented resolution rules are described in Chapter 10, but it is unwise to
```
design a system that subtly relies on this behavior.
A function that takes a single argument of a composite type should generally not have the same name
```
as any attribute (field) of that type. Recall that attribute(table) is considered equivalent to
```
table.attribute. In the case that there is an ambiguity between a function on a composite type
and an attribute of the composite type, the attribute will always be used. It is possible to override that
```
choice by schema-qualifying the function name (that is, schema.func(table) ) but it's better
```
to avoid the problem by not choosing conflicting names.
Another possible conflict is between variadic and non-variadic functions. For instance, it is possible to
```
create both foo(numeric) and foo(VARIADIC numeric[]). In this case it is unclear which
```
```
one should be matched to a call providing a single numeric argument, such as foo(10.1). The rule
```
is that the function appearing earlier in the search path is used, or if the two functions are in the same
schema, the non-variadic one is preferred.
When overloading C-language functions, there is an additional constraint: The C name of each function
in the family of overloaded functions must be different from the C names of all other functions, either
internal or dynamically loaded. If this rule is violated, the behavior is not portable. You might get a
```
run-time linker error, or one of the functions will get called (usually the internal one). The alternative
```
1261
Extending SQL
form of the AS clause for the SQL CREATE FUNCTION command decouples the SQL function name
from the function name in the C source code. For instance:
```
CREATE FUNCTION test(int) RETURNS int
```
AS 'filename', 'test_1arg'
```
LANGUAGE C;
```
```
CREATE FUNCTION test(int, int) RETURNS int
```
AS 'filename', 'test_2arg'
```
LANGUAGE C;
```
The names of the C functions here reflect one of many possible conventions.
36.7. Function Volatility Categories
Every function has a volatility classification, with the possibilities being VOLATILE, STABLE, or
IMMUTABLE. VOLATILE is the default if the CREATE FUNCTION command does not specify a
category. The volatility category is a promise to the optimizer about the behavior of the function:
• A VOLATILE function can do anything, including modifying the database. It can return different
results on successive calls with the same arguments. The optimizer makes no assumptions about
the behavior of such functions. A query using a volatile function will re-evaluate the function at
every row where its value is needed.
• A STABLE function cannot modify the database and is guaranteed to return the same results given
the same arguments for all rows within a single statement. This category allows the optimizer to
optimize multiple calls of the function to a single call. In particular, it is safe to use an expression
```
containing such a function in an index scan condition. (Since an index scan will evaluate the com-
```
parison value only once, not once at each row, it is not valid to use a VOLATILE function in an
```
index scan condition.)
```
• An IMMUTABLE function cannot modify the database and is guaranteed to return the same results
given the same arguments forever. This category allows the optimizer to pre-evaluate the function
when a query calls it with constant arguments. For example, a query like SELECT ... WHERE
```
x = 2 + 2 can be simplified on sight to SELECT ... WHERE x = 4, because the function
```
underlying the integer addition operator is marked IMMUTABLE.
For best optimization results, you should label your functions with the strictest volatility category that
is valid for them.
Any function with side-effects must be labeled VOLATILE, so that calls to it cannot be optimized
away. Even a function with no side-effects needs to be labeled VOLATILE if its value can change
```
within a single query; some examples are random(), currval(), timeofday().
```
Another important example is that the current_timestamp family of functions qualify as
STABLE, since their values do not change within a transaction.
There is relatively little difference between STABLE and IMMUTABLE categories when considering
simple interactive queries that are planned and immediately executed: it doesn't matter a lot whether
a function is executed once during planning or once during query execution startup. But there is a big
difference if the plan is saved and reused later. Labeling a function IMMUTABLE when it really isn't
might allow it to be prematurely folded to a constant during planning, resulting in a stale value being
re-used during subsequent uses of the plan. This is a hazard when using prepared statements or when
```
using function languages that cache plans (such as PL/pgSQL).
```
For functions written in SQL or in any of the standard procedural languages, there is a second important
property determined by the volatility category, namely the visibility of any data changes that have been
made by the SQL command that is calling the function. A VOLATILE function will see such changes,
a STABLE or IMMUTABLE function will not. This behavior is implemented using the snapshotting
```
behavior of MVCC (see Chapter 13): STABLE and IMMUTABLE functions use a snapshot established
```
1262
Extending SQL
as of the start of the calling query, whereas VOLATILE functions obtain a fresh snapshot at the start
of each query they execute.
Note
Functions written in C can manage snapshots however they want, but it's usually a good idea
to make C functions work this way too.
Because of this snapshotting behavior, a function containing only SELECT commands can safely be
marked STABLE, even if it selects from tables that might be undergoing modifications by concurrent
queries. PostgreSQL will execute all commands of a STABLE function using the snapshot established
for the calling query, and so it will see a fixed view of the database throughout that query.
The same snapshotting behavior is used for SELECT commands within IMMUTABLE functions. It
is generally unwise to select from database tables within an IMMUTABLE function at all, since the
immutability will be broken if the table contents ever change. However, PostgreSQL does not enforce
that you do not do that.
A common error is to label a function IMMUTABLE when its results depend on a configuration para-
meter. For example, a function that manipulates timestamps might well have results that depend on
the TimeZone setting. For safety, such functions should be labeled STABLE instead.
Note
PostgreSQL requires that STABLE and IMMUTABLE functions contain no SQL commands
```
other than SELECT to prevent data modification. (This is not a completely bulletproof test,
```
since such functions could still call VOLATILE functions that modify the database. If you do
that, you will find that the STABLE or IMMUTABLE function does not notice the database
```
changes applied by the called function, since they are hidden from its snapshot.)
```
36.8. Procedural Language Functions
PostgreSQL allows user-defined functions to be written in other languages besides SQL and C. These
```
other languages are generically called procedural languages (PLs). Procedural languages aren't built
```
```
into the PostgreSQL server; they are offered by loadable modules. See Chapter 40 and following
```
chapters for more information.
36.9. Internal Functions
Internal functions are functions written in C that have been statically linked into the PostgreSQL server.
The “body” of the function definition specifies the C-language name of the function, which need not
```
be the same as the name being declared for SQL use. (For reasons of backward compatibility, an empty
```
```
body is accepted as meaning that the C-language function name is the same as the SQL name.)
```
Normally, all internal functions present in the server are declared during the initialization of the data-
```
base cluster (see Section 18.2), but a user could use CREATE FUNCTION to create additional alias
```
names for an internal function. Internal functions are declared in CREATE FUNCTION with language
name internal. For instance, to create an alias for the sqrt function:
```
CREATE FUNCTION square_root(double precision) RETURNS double
```
precision
AS 'dsqrt'
LANGUAGE internal
```
STRICT;
```
1263
Extending SQL
```
(Most internal functions expect to be declared “strict”.)
```
Note
Not all “predefined” functions are “internal” in the above sense. Some predefined functions
are written in SQL.
36.10. C-Language Functions
```
User-defined functions can be written in C (or a language that can be made compatible with C, such as
```
```
C++). Such functions are compiled into dynamically loadable objects (also called shared libraries) and
```
are loaded by the server on demand. The dynamic loading feature is what distinguishes “C language”
functions from “internal” functions — the actual coding conventions are essentially the same for both.
```
(Hence, the standard internal function library is a rich source of coding examples for user-defined C
```
```
functions.)
```
```
Currently only one calling convention is used for C functions (“version 1”). Support for that calling
```
```
convention is indicated by writing a PG_FUNCTION_INFO_V1() macro call for the function, as
```
illustrated below.
36.10.1. Dynamic Loading
The first time a user-defined function in a particular loadable object file is called in a session, the
dynamic loader loads that object file into memory so that the function can be called. The CREATE
FUNCTION for a user-defined C function must therefore specify two pieces of information for the
```
function: the name of the loadable object file, and the C name (link symbol) of the specific function
```
to call within that object file. If the C name is not explicitly specified then it is assumed to be the same
as the SQL function name.
The following algorithm is used to locate the shared object file based on the name given in the CREATE
FUNCTION command:
1. If the name is an absolute path, the given file is loaded.
2. If the name starts with the string $libdir, that part is replaced by the PostgreSQL package
library directory name, which is determined at build time.
3. If the name does not contain a directory part, the file is searched for in the path specified by the
configuration variable dynamic_library_path.
4. Otherwise (the file was not found in the path, or it contains a non-absolute directory part), the
```
dynamic loader will try to take the name as given, which will most likely fail. (It is unreliable to
```
```
depend on the current working directory.)
```
```
If this sequence does not work, the platform-specific shared library file name extension (often .so)
```
is appended to the given name and this sequence is tried again. If that fails as well, the load will fail.
It is recommended to locate shared libraries either relative to $libdir or through the dynamic library
path. This simplifies version upgrades if the new installation is at a different location. The actual di-
rectory that $libdir stands for can be found out with the command pg_config --pkglibdir.
The user ID the PostgreSQL server runs as must be able to traverse the path to the file you intend to
load. Making the file or a higher-level directory not readable and/or not executable by the postgres
user is a common mistake.
In any case, the file name that is given in the CREATE FUNCTION command is recorded literally in
the system catalogs, so if the file needs to be loaded again the same procedure is applied.
1264
Extending SQL
Note
PostgreSQL will not compile a C function automatically. The object file must be compiled
before it is referenced in a CREATE FUNCTION command. See Section 36.10.5 for additional
information.
To ensure that a dynamically loaded object file is not loaded into an incompatible server, PostgreSQL
checks that the file contains a “magic block” with the appropriate contents. This allows the server to
detect obvious incompatibilities, such as code compiled for a different major version of PostgreSQL.
```
To include a magic block, write this in one (and only one) of the module source files, after having
```
included the header fmgr.h:
```
PG_MODULE_MAGIC;
```
or
```
PG_MODULE_MAGIC_EXT(parameters);
```
The PG_MODULE_MAGIC_EXT variant allows the specification of additional information about the
```
module; currently, a name and/or a version string can be added. (More fields might be allowed in
```
```
future.) Write something like this:
```
```
PG_MODULE_MAGIC_EXT(
```
.name = "my_module_name",
.version = "1.2.3"
```
);
```
```
Subsequently the name and version can be examined via the pg_get_loaded_modules() func-
```
tion. The meaning of the version string is not restricted by PostgreSQL, but use of semantic versioning
rules is recommended.
After it is used for the first time, a dynamically loaded object file is retained in memory. Future calls
```
in the same session to the function(s) in that file will only incur the small overhead of a symbol table
```
lookup. If you need to force a reload of an object file, for example after recompiling it, begin a fresh
session.
Optionally, a dynamically loaded file can contain an initialization function. If the file includes a func-
tion named _PG_init, that function will be called immediately after loading the file. The function
receives no parameters and should return void. There is presently no way to unload a dynamically
loaded file.
36.10.2. Base Types in C-Language Functions
To know how to write C-language functions, you need to know how PostgreSQL internally represents
base data types and how they can be passed to and from functions. Internally, PostgreSQL regards a
base type as a “blob of memory”. The user-defined functions that you define over a type in turn define
the way that PostgreSQL can operate on it. That is, PostgreSQL will only store and retrieve the data
from disk and use your user-defined functions to input, process, and output the data.
Base types can have one of three internal formats:
• pass by value, fixed-length
• pass by reference, fixed-length
1265
Extending SQL
• pass by reference, variable-length
```
By-value types can only be 1, 2, or 4 bytes in length (also 8 bytes, if sizeof(Datum) is 8 on your
```
```
machine). You should be careful to define your types such that they will be the same size (in bytes) on
```
all architectures. For example, the long type is dangerous because it is 4 bytes on some machines and
8 bytes on others, whereas int type is 4 bytes on most Unix machines. A reasonable implementation
of the int4 type on Unix machines might be:
/* 4-byte integer, passed by value */
```
typedef int int4;
```
```
(The actual PostgreSQL C code calls this type int32, because it is a convention in C that intXX
```
means XX bits. Note therefore also that the C type int8 is 1 byte in size. The SQL type int8 is
```
called int64 in C. See also Table 36.2.)
```
On the other hand, fixed-length types of any size can be passed by-reference. For example, here is a
sample implementation of a PostgreSQL type:
/* 16-byte structure, passed by reference */
typedef struct
```
{
```
```
double x, y;
```
```
} Point;
```
Only pointers to such types can be used when passing them in and out of PostgreSQL functions. To
return a value of such a type, allocate the right amount of memory with palloc, fill in the allocated
```
memory, and return a pointer to it. (Also, if you just want to return the same value as one of your input
```
arguments that's of the same data type, you can skip the extra palloc and just return the pointer to
```
the input value.)
```
Finally, all variable-length types must also be passed by reference. All variable-length types must
```
begin with an opaque length field of exactly 4 bytes, which will be set by SET_VARSIZE; never set
```
this field directly! All data to be stored within that type must be located in the memory immediately
following that length field. The length field contains the total length of the structure, that is, it includes
the size of the length field itself.
```
Another important point is to avoid leaving any uninitialized bits within data type values; for exam-
```
ple, take care to zero out any alignment padding bytes that might be present in structs. Without this,
logically-equivalent constants of your data type might be seen as unequal by the planner, leading to
```
inefficient (though not incorrect) plans.
```
Warning
Never modify the contents of a pass-by-reference input value. If you do so you are likely to
corrupt on-disk data, since the pointer you are given might point directly into a disk buffer.
The sole exception to this rule is explained in Section 36.12.
As an example, we can define the type text as follows:
```
typedef struct {
```
```
int32 length;
```
```
char data[FLEXIBLE_ARRAY_MEMBER];
```
```
} text;
```
The [FLEXIBLE_ARRAY_MEMBER] notation means that the actual length of the data part is not
specified by this declaration.
1266
Extending SQL
When manipulating variable-length types, we must be careful to allocate the correct amount of memory
and set the length field correctly. For example, if we wanted to store 40 bytes in a text structure,
we might use a code fragment like this:
#include "postgres.h"
...
```
char buffer[40]; /* our source data */
```
...
```
text *destination = (text *) palloc(VARHDRSZ + 40);
```
```
SET_VARSIZE(destination, VARHDRSZ + 40);
```
```
memcpy(destination->data, buffer, 40);
```
...
```
VARHDRSZ is the same as sizeof(int32), but it's considered good style to use the macro
```
VARHDRSZ to refer to the size of the overhead for a variable-length type. Also, the length field must
be set using the SET_VARSIZE macro, not by simple assignment.
Table 36.2 shows the C types corresponding to many of the built-in SQL data types of PostgreSQL.
The “Defined In” column gives the header file that needs to be included to get the type definition.
```
(The actual definition might be in a different file that is included by the listed file. It is recommended
```
```
that users stick to the defined interface.) Note that you should always include postgres.h first in
```
any source file of server code, because it declares a number of things that you will need anyway, and
because including other headers first can cause portability issues.
Table 36.2. Equivalent C Types for Built-in SQL Types
SQL Type C Type Defined In
```
boolean bool postgres.h (maybe compiler built-in)
```
box BOX* utils/geo_decls.h
bytea bytea* postgres.h
```
"char" char (compiler built-in)
```
character BpChar* postgres.h
cid CommandId postgres.h
date DateADT utils/date.h
```
float4 (real) float4 postgres.h
```
```
float8 (double
```
```
precision)
```
float8 postgres.h
```
int2 (smallint) int16 postgres.h
```
```
int4 (integer) int32 postgres.h
```
```
int8 (bigint) int64 postgres.h
```
interval Interval* datatype/timestamp.h
lseg LSEG* utils/geo_decls.h
name Name postgres.h
numeric Numeric utils/numeric.h
oid Oid postgres.h
oidvector oidvector* postgres.h
path PATH* utils/geo_decls.h
point POINT* utils/geo_decls.h
regproc RegProcedure postgres.h
1267
Extending SQL
SQL Type C Type Defined In
text text* postgres.h
tid ItemPointer storage/itemptr.h
time TimeADT utils/date.h
time with time
zone
TimeTzADT utils/date.h
timestamp Timestamp datatype/timestamp.h
timestamp with
time zone
TimestampTz datatype/timestamp.h
varchar VarChar* postgres.h
xid TransactionId postgres.h
Now that we've gone over all of the possible structures for base types, we can show some examples
of real functions.
36.10.3. Version 1 Calling Conventions
The version-1 calling convention relies on macros to suppress most of the complexity of passing
arguments and results. The C declaration of a version-1 function is always:
```
Datum funcname(PG_FUNCTION_ARGS)
```
In addition, the macro call:
```
PG_FUNCTION_INFO_V1(funcname);
```
```
must appear in the same source file. (Conventionally, it's written just before the function itself.) This
```
macro call is not needed for internal-language functions, since PostgreSQL assumes that all inter-
nal functions use the version-1 convention. It is, however, required for dynamically-loaded functions.
```
In a version-1 function, each actual argument is fetched using a PG_GETARG_xxx() macro that cor-
```
```
responds to the argument's data type. (In non-strict functions there needs to be a previous check about
```
```
argument null-ness using PG_ARGISNULL(); see below.) The result is returned using a PG_RE-
```
```
TURN_xxx() macro for the return type. PG_GETARG_xxx() takes as its argument the number of
```
```
the function argument to fetch, where the count starts at 0. PG_RETURN_xxx() takes as its argument
```
the actual value to return.
```
To call another version-1 function, you can use DirectFunctionCalln(func, arg1, ...,
```
```
argn). This is particularly useful when you want to call functions defined in the standard internal
```
library, by using an interface similar to their SQL signature.
These convenience functions and similar ones can be found in fmgr.h. The DirectFunction-
Calln family expect a C function name as their first argument. There are also OidFunctionCalln
which take the OID of the target function, and some other variants. All of these expect the function's
arguments to be supplied as Datums, and likewise they return Datum. Note that neither arguments
nor result are allowed to be NULL when using these convenience functions.
```
For example, to call the starts_with(text, text) function from C, you can search through
```
```
the catalog and find out that its C implementation is the Datum text_starts_with(PG_FUNC-
```
```
TION_ARGS) function. Typically you would use DirectFunctionCall2(text_start-
```
```
s_with, ...) to call such a function. However, starts_with(text, text) requires col-
```
lation information, so it will fail with “could not determine which collation to use for string com-
```
parison” if called that way. Instead you must use DirectFunctionCall2Coll(text_start-
```
```
s_with, ...) and provide the desired collation, which typically is just passed through from
```
```
PG_GET_COLLATION(), as shown in the example below.
```
1268
Extending SQL
fmgr.h also supplies macros that facilitate conversions between C types and Datum. For example
```
to turn Datum into text*, you can use DatumGetTextPP(X). While some types have macros
```
```
named like TypeGetDatum(X) for the reverse conversion, text* does not; it's sufficient to use
```
```
the generic macro PointerGetDatum(X) for that. If your extension defines additional types, it is
```
usually convenient to define similar macros for your types too.
Here are some examples using the version-1 calling convention:
#include "postgres.h"
#include <string.h>
#include "fmgr.h"
#include "utils/geo_decls.h"
#include "varatt.h"
```
PG_MODULE_MAGIC;
```
/* by value */
```
PG_FUNCTION_INFO_V1(add_one);
```
Datum
```
add_one(PG_FUNCTION_ARGS)
```
```
{
```
```
int32 arg = PG_GETARG_INT32(0);
```
```
PG_RETURN_INT32(arg + 1);
```
```
}
```
/* by reference, fixed length */
```
PG_FUNCTION_INFO_V1(add_one_float8);
```
Datum
```
add_one_float8(PG_FUNCTION_ARGS)
```
```
{
```
/* The macros for FLOAT8 hide its pass-by-reference nature. */
```
float8 arg = PG_GETARG_FLOAT8(0);
```
```
PG_RETURN_FLOAT8(arg + 1.0);
```
```
}
```
```
PG_FUNCTION_INFO_V1(makepoint);
```
Datum
```
makepoint(PG_FUNCTION_ARGS)
```
```
{
```
/* Here, the pass-by-reference nature of Point is not hidden.
*/
```
Point *pointx = PG_GETARG_POINT_P(0);
```
```
Point *pointy = PG_GETARG_POINT_P(1);
```
```
Point *new_point = (Point *) palloc(sizeof(Point));
```
```
new_point->x = pointx->x;
```
```
new_point->y = pointy->y;
```
```
PG_RETURN_POINT_P(new_point);
```
```
}
```
1269
Extending SQL
/* by reference, variable length */
```
PG_FUNCTION_INFO_V1(copytext);
```
Datum
```
copytext(PG_FUNCTION_ARGS)
```
```
{
```
```
text *t = PG_GETARG_TEXT_PP(0);
```
/*
- VARSIZE_ANY_EXHDR is the size of the struct in bytes, minus
the
- VARHDRSZ or VARHDRSZ_SHORT of its header. Construct the
copy with a
- full-length header.
*/
```
text *new_t = (text *) palloc(VARSIZE_ANY_EXHDR(t) +
```
```
VARHDRSZ);
```
```
SET_VARSIZE(new_t, VARSIZE_ANY_EXHDR(t) + VARHDRSZ);
```
/*
- VARDATA is a pointer to the data region of the new struct.
The source
- could be a short datum, so retrieve its data through
VARDATA_ANY.
*/
```
memcpy(VARDATA(new_t), /* destination */
```
```
VARDATA_ANY(t), /* source */
```
```
VARSIZE_ANY_EXHDR(t)); /* how many bytes */
```
```
PG_RETURN_TEXT_P(new_t);
```
```
}
```
```
PG_FUNCTION_INFO_V1(concat_text);
```
Datum
```
concat_text(PG_FUNCTION_ARGS)
```
```
{
```
```
text *arg1 = PG_GETARG_TEXT_PP(0);
```
```
text *arg2 = PG_GETARG_TEXT_PP(1);
```
```
int32 arg1_size = VARSIZE_ANY_EXHDR(arg1);
```
```
int32 arg2_size = VARSIZE_ANY_EXHDR(arg2);
```
```
int32 new_text_size = arg1_size + arg2_size + VARHDRSZ;
```
```
text *new_text = (text *) palloc(new_text_size);
```
```
SET_VARSIZE(new_text, new_text_size);
```
```
memcpy(VARDATA(new_text), VARDATA_ANY(arg1), arg1_size);
```
```
memcpy(VARDATA(new_text) + arg1_size, VARDATA_ANY(arg2),
```
```
arg2_size);
```
```
PG_RETURN_TEXT_P(new_text);
```
```
}
```
```
/* A wrapper around starts_with(text, text) */
```
```
PG_FUNCTION_INFO_V1(t_starts_with);
```
Datum
```
t_starts_with(PG_FUNCTION_ARGS)
```
1270
Extending SQL
```
{
```
```
text *t1 = PG_GETARG_TEXT_PP(0);
```
```
text *t2 = PG_GETARG_TEXT_PP(1);
```
```
Oid collid = PG_GET_COLLATION();
```
```
bool result;
```
```
result = DatumGetBool(DirectFunctionCall2Coll(text_starts_with,
```
collid,
```
PointerGetDatum(t1),
```
```
PointerGetDatum(t2)));
```
```
PG_RETURN_BOOL(result);
```
```
}
```
Supposing that the above code has been prepared in file funcs.c and compiled into a shared object,
we could define the functions to PostgreSQL with commands like this:
```
CREATE FUNCTION add_one(integer) RETURNS integer
```
AS 'DIRECTORY/funcs', 'add_one'
```
LANGUAGE C STRICT;
```
-- note overloading of SQL function name "add_one"
```
CREATE FUNCTION add_one(double precision) RETURNS double precision
```
AS 'DIRECTORY/funcs', 'add_one_float8'
```
LANGUAGE C STRICT;
```
```
CREATE FUNCTION makepoint(point, point) RETURNS point
```
AS 'DIRECTORY/funcs', 'makepoint'
```
LANGUAGE C STRICT;
```
```
CREATE FUNCTION copytext(text) RETURNS text
```
AS 'DIRECTORY/funcs', 'copytext'
```
LANGUAGE C STRICT;
```
```
CREATE FUNCTION concat_text(text, text) RETURNS text
```
AS 'DIRECTORY/funcs', 'concat_text'
```
LANGUAGE C STRICT;
```
```
CREATE FUNCTION t_starts_with(text, text) RETURNS boolean
```
AS 'DIRECTORY/funcs', 't_starts_with'
```
LANGUAGE C STRICT;
```
```
Here, DIRECTORY stands for the directory of the shared library file (for instance the PostgreSQL
```
```
tutorial directory, which contains the code for the examples used in this section). (Better style would
```
be to use just 'funcs' in the AS clause, after having added DIRECTORY to the search path. In any
```
case, we can omit the system-specific extension for a shared library, commonly .so.)
```
Notice that we have specified the functions as “strict”, meaning that the system should automatically
assume a null result if any input value is null. By doing this, we avoid having to check for null inputs in
the function code. Without this, we'd have to check for null values explicitly, using PG_ARGISNUL-
```
L().
```
```
The macro PG_ARGISNULL(n) allows a function to test whether each input is null. (Of course,
```
```
doing this is only necessary in functions not declared “strict”.) As with the PG_GETARG_xxx()
```
macros, the input arguments are counted beginning at zero. Note that one should refrain from executing
1271
Extending SQL
```
PG_GETARG_xxx() until one has verified that the argument isn't null. To return a null result, execute
```
```
PG_RETURN_NULL(); this works in both strict and nonstrict functions.
```
At first glance, the version-1 coding conventions might appear to be just pointless obscurantism, com-
pared to using plain C calling conventions. They do however allow us to deal with NULLable argu-
```
ments/return values, and “toasted” (compressed or out-of-line) values.
```
```
Other options provided by the version-1 interface are two variants of the PG_GETARG_xxx()
```
```
macros. The first of these, PG_GETARG_xxx_COPY(), guarantees to return a copy of the spec-
```
```
ified argument that is safe for writing into. (The normal macros will sometimes return a point-
```
er to a value that is physically stored in a table, which must not be written to. Using the
```
PG_GETARG_xxx_COPY() macros guarantees a writable result.) The second variant consists of the
```
```
PG_GETARG_xxx_SLICE() macros which take three arguments. The first is the number of the
```
```
function argument (as above). The second and third are the offset and length of the segment to be
```
returned. Offsets are counted from zero, and a negative length requests that the remainder of the value
be returned. These macros provide more efficient access to parts of large values in the case where they
```
have storage type “external”. (The storage type of a column can be specified using ALTER TABLE
```
tablename ALTER COLUMN colname SET STORAGE storagetype. storagetype is
```
one of plain, external, extended, or main.)
```
```
Finally, the version-1 function call conventions make it possible to return set results (Section 36.10.9)
```
```
and implement trigger functions (Chapter 37) and procedural-language call handlers (Chapter 57). For
```
more details see src/backend/utils/fmgr/README in the source distribution.
36.10.4. Writing Code
Before we turn to the more advanced topics, we should discuss some coding rules for PostgreSQL C-
language functions. While it might be possible to load functions written in languages other than C into
```
PostgreSQL, this is usually difficult (when it is possible at all) because other languages, such as C++,
```
FORTRAN, or Pascal often do not follow the same calling convention as C. That is, other languages
do not pass argument and return values between functions in the same way. For this reason, we will
assume that your C-language functions are actually written in C.
The basic rules for writing and building C functions are as follows:
• Use pg_config --includedir-server to find out where the PostgreSQL server header
```
files are installed on your system (or the system that your users will be running on).
```
• Compiling and linking your code so that it can be dynamically loaded into PostgreSQL always re-
quires special flags. See Section 36.10.5 for a detailed explanation of how to do it for your particular
operating system.
• Remember to define a “magic block” for your shared library, as described in Section 36.10.1.
• When allocating memory, use the PostgreSQL functions palloc and pfree instead of the corre-
sponding C library functions malloc and free. The memory allocated by palloc will be freed
automatically at the end of each transaction, preventing memory leaks.
```
• Always zero the bytes of your structures using memset (or allocate them with palloc0 in the
```
```
first place). Even if you assign to each field of your structure, there might be alignment padding
```
```
(holes in the structure) that contain garbage values. Without this, it's difficult to support hash indexes
```
or hash joins, as you must pick out only the significant bits of your data structure to compute a
hash. The planner also sometimes relies on comparing constants via bitwise equality, so you can
get undesirable planning results if logically-equivalent values aren't bitwise equal.
• Most of the internal PostgreSQL types are declared in postgres.h, while the function manager
```
interfaces (PG_FUNCTION_ARGS, etc.) are in fmgr.h, so you will need to include at least these
```
two files. For portability reasons it's best to include postgres.h first, before any other system or
user header files. Including postgres.h will also include elog.h and palloc.h for you.
1272
Extending SQL
• Symbol names defined within object files must not conflict with each other or with symbols defined
in the PostgreSQL server executable. You will have to rename your functions or variables if you
get error messages to this effect.
36.10.5. Compiling and Linking Dynamically-Loaded
Functions
Before you are able to use your PostgreSQL extension functions written in C, they must be compiled
and linked in a special way to produce a file that can be dynamically loaded by the server. To be
precise, a shared library needs to be created.
For information beyond what is contained in this section you should read the documentation of your
operating system, in particular the manual pages for the C compiler, cc, and the link editor, ld. In
addition, the PostgreSQL source code contains several working examples in the contrib directory.
If you rely on these examples you will make your modules dependent on the availability of the Post-
greSQL source code, however.
Creating shared libraries is generally analogous to linking executables: first the source files are com-
piled into object files, then the object files are linked together. The object files need to be created as
```
position-independent code (PIC), which conceptually means that they can be placed at an arbitrary
```
```
location in memory when they are loaded by the executable. (Object files intended for executables are
```
```
usually not compiled that way.) The command to link a shared library contains special flags to distin-
```
```
guish it from linking an executable (at least in theory — on some systems the practice is much uglier).
```
In the following examples we assume that your source code is in a file foo.c and we will create a
shared library foo.so. The intermediate object file will be called foo.o unless otherwise noted. A
shared library can contain more than one object file, but we only use one here.
FreeBSD
The compiler flag to create PIC is -fPIC. To create shared libraries the compiler flag is -
shared.
cc -fPIC -c foo.c
cc -shared -o foo.so foo.o
This is applicable as of version 13.0 of FreeBSD, older versions used the gcc compiler.
Linux
The compiler flag to create PIC is -fPIC. The compiler flag to create a shared library is -
shared. A complete example looks like this:
cc -fPIC -c foo.c
cc -shared -o foo.so foo.o
macOS
Here is an example. It assumes the developer tools are installed.
cc -c foo.c
cc -bundle -flat_namespace -undefined suppress -o foo.so foo.o
NetBSD
The compiler flag to create PIC is -fPIC. For ELF systems, the compiler with the flag -shared
is used to link shared libraries. On the older non-ELF systems, ld -Bshareable is used.
1273
Extending SQL
gcc -fPIC -c foo.c
gcc -shared -o foo.so foo.o
OpenBSD
The compiler flag to create PIC is -fPIC. ld -Bshareable is used to link shared libraries.
gcc -fPIC -c foo.c
ld -Bshareable -o foo.so foo.o
Solaris
The compiler flag to create PIC is -KPIC with the Sun compiler and -fPIC with GCC. To link
shared libraries, the compiler option is -G with either compiler or alternatively -shared with
GCC.
cc -KPIC -c foo.c
cc -G -o foo.so foo.o
or
gcc -fPIC -c foo.c
gcc -G -o foo.so foo.o
Tip
If this is too complicated for you, you should consider using GNU Libtool1, which hides the
platform differences behind a uniform interface.
The resulting shared library file can then be loaded into PostgreSQL. When specifying the file name
to the CREATE FUNCTION command, one must give it the name of the shared library file, not the
```
intermediate object file. Note that the system's standard shared-library extension (usually .so or .sl)
```
can be omitted from the CREATE FUNCTION command, and normally should be omitted for best
portability.
Refer back to Section 36.10.1 about where the server expects to find the shared library files.
36.10.6. Server API and ABI Stability Guidance
This section contains guidance to authors of extensions and other server plugins about API and ABI
stability in the PostgreSQL server.
36.10.6.1. General
The PostgreSQL server contains several well-demarcated APIs for server plugins, such as the function
```
manager (fmgr, described in this chapter), SPI (Chapter 45), and various hooks specifically designed
```
for extensions. These interfaces are carefully managed for long-term stability and compatibility. How-
ever, the entire set of global functions and variables in the server effectively constitutes the publicly
usable API, and most of it was not designed with extensibility and long-term stability in mind.
Therefore, while taking advantage of these interfaces is valid, the further one strays from the well-
trodden path, the likelier it will be that one might encounter API or ABI compatibility issues at some
1 https://www.gnu.org/software/libtool/
1274
Extending SQL
point. Extension authors are encouraged to provide feedback about their requirements, so that over
time, as new use patterns arise, certain interfaces can be considered more stabilized or new, better-de-
signed interfaces can be added.
36.10.6.2. API Compatibility
The API, or application programming interface, is the interface used at compile time.
36.10.6.2.1. Major Versions
There is no promise of API compatibility between PostgreSQL major versions. Extension code there-
fore might require source code changes to work with multiple major versions. These can usually be
managed with preprocessor conditions such as #if PG_VERSION_NUM >= 160000. Sophisticat-
ed extensions that use interfaces beyond the well-demarcated ones usually require a few such changes
for each major server version.
36.10.6.2.2. Minor Versions
PostgreSQL makes an effort to avoid server API breaks in minor releases. In general, extension code
that compiles and works with a minor release should also compile and work with any other minor
release of the same major version, past or future.
When a change is required, it will be carefully managed, taking the requirements of extensions into
```
account. Such changes will be communicated in the release notes (Appendix E).
```
36.10.6.3. ABI Compatibility
The ABI, or application binary interface, is the interface used at run time.
36.10.6.3.1. Major Versions
Servers of different major versions have intentionally incompatible ABIs. Extensions that use server
APIs must therefore be re-compiled for each major release. The inclusion of PG_MODULE_MAGIC
```
(see Section 36.10.1) ensures that code compiled for one major version will be rejected by other major
```
versions.
36.10.6.3.2. Minor Versions
PostgreSQL makes an effort to avoid server ABI breaks in minor releases. In general, an extension
compiled against any minor release should work with any other minor release of the same major
version, past or future.
When a change is required, PostgreSQL will choose the least invasive change possible, for example by
squeezing a new field into padding space or appending it to the end of a struct. These sorts of changes
should not impact extensions unless they use very unusual code patterns.
In rare cases, however, even such non-invasive changes may be impractical or impossible. In such an
event, the change will be carefully managed, taking the requirements of extensions into account. Such
```
changes will also be documented in the release notes (Appendix E).
```
Note, however, that many parts of the server are not designed or maintained as publicly-consumable
```
APIs (and that, in most cases, the actual boundary is also not well-defined). If urgent needs arise,
```
changes in those parts will naturally be made with less consideration for extension code than changes
in well-defined and widely used interfaces.
Also, in the absence of automated detection of such changes, this is not a guarantee, but historically
such breaking changes have been extremely rare.
1275
Extending SQL
36.10.7. Composite-Type Arguments
Composite types do not have a fixed layout like C structures. Instances of a composite type can contain
null fields. In addition, composite types that are part of an inheritance hierarchy can have different
fields than other members of the same inheritance hierarchy. Therefore, PostgreSQL provides a func-
tion interface for accessing fields of composite types from C.
Suppose we want to write a function to answer the query:
```
SELECT name, c_overpaid(emp, 1500) AS overpaid
```
FROM emp
```
WHERE name = 'Bill' OR name = 'Sam';
```
Using the version-1 calling conventions, we can define c_overpaid as:
#include "postgres.h"
```
#include "executor/executor.h" /* for GetAttributeByName() */
```
```
PG_MODULE_MAGIC;
```
```
PG_FUNCTION_INFO_V1(c_overpaid);
```
Datum
```
c_overpaid(PG_FUNCTION_ARGS)
```
```
{
```
```
HeapTupleHeader t = PG_GETARG_HEAPTUPLEHEADER(0);
```
```
int32 limit = PG_GETARG_INT32(1);
```
```
bool isnull;
```
```
Datum salary;
```
```
salary = GetAttributeByName(t, "salary", &isnull);
```
```
if (isnull)
```
```
PG_RETURN_BOOL(false);
```
```
/* Alternatively, we might prefer to do PG_RETURN_NULL() for
```
null salary. */
```
PG_RETURN_BOOL(DatumGetInt32(salary) > limit);
```
```
}
```
GetAttributeByName is the PostgreSQL system function that returns attributes out of the spec-
ified row. It has three arguments: the argument of type HeapTupleHeader passed into the func-
tion, the name of the desired attribute, and a return parameter that tells whether the attribute is null.
GetAttributeByName returns a Datum value that you can convert to the proper data type by
```
using the appropriate DatumGetXXX() function. Note that the return value is meaningless if the null
```
```
flag is set; always check the null flag before trying to do anything with the result.
```
There is also GetAttributeByNum, which selects the target attribute by column number instead
of name.
The following command declares the function c_overpaid in SQL:
```
CREATE FUNCTION c_overpaid(emp, integer) RETURNS boolean
```
AS 'DIRECTORY/funcs', 'c_overpaid'
```
LANGUAGE C STRICT;
```
1276
Extending SQL
Notice we have used STRICT so that we did not have to check whether the input arguments were
NULL.
```
36.10.8. Returning Rows (Composite Types)
```
To return a row or composite-type value from a C-language function, you can use a special API that
provides macros and functions to hide most of the complexity of building composite data types. To
use this API, the source file must include:
#include "funcapi.h"
```
There are two ways you can build a composite data value (henceforth a “tuple”): you can build it from
```
an array of Datum values, or from an array of C strings that can be passed to the input conversion
functions of the tuple's column data types. In either case, you first need to obtain or construct a Tu-
pleDesc descriptor for the tuple structure. When working with Datums, you pass the TupleDesc
to BlessTupleDesc, and then call heap_form_tuple for each row. When working with C
strings, you pass the TupleDesc to TupleDescGetAttInMetadata, and then call BuildTu-
pleFromCStrings for each row. In the case of a function returning a set of tuples, the setup steps
can all be done once during the first call of the function.
Several helper functions are available for setting up the needed TupleDesc. The recommended way
to do this in most functions returning composite values is to call:
```
TypeFuncClass get_call_result_type(FunctionCallInfo fcinfo,
```
Oid *resultTypeId,
```
TupleDesc *resultTupleDesc)
```
```
passing the same fcinfo struct passed to the calling function itself. (This of course requires that
```
```
you use the version-1 calling conventions.) resultTypeId can be specified as NULL or as the
```
address of a local variable to receive the function's result type OID. resultTupleDesc should be
```
the address of a local TupleDesc variable. Check that the result is TYPEFUNC_COMPOSITE; if so,
```
```
resultTupleDesc has been filled with the needed TupleDesc. (If it is not, you can report an
```
```
error along the lines of “function returning record called in context that cannot accept type record”.)
```
Tip
```
get_call_result_type can resolve the actual type of a polymorphic function result; so
```
it is useful in functions that return scalar polymorphic results, not only functions that return
composites. The resultTypeId output is primarily useful for functions returning polymor-
phic scalars.
Note
get_call_result_type has a sibling get_expr_result_type, which can be used
to resolve the expected output type for a function call represented by an expression tree. This
can be used when trying to determine the result type from outside the function itself. There is
also get_func_result_type, which can be used when only the function's OID is avail-
able. However these functions are not able to deal with functions declared to return record,
and get_func_result_type cannot resolve polymorphic types, so you should preferen-
tially use get_call_result_type.
Older, now-deprecated functions for obtaining TupleDescs are:
1277
Extending SQL
```
TupleDesc RelationNameGetTupleDesc(const char *relname)
```
to get a TupleDesc for the row type of a named relation, and:
```
TupleDesc TypeGetTupleDesc(Oid typeoid, List *colaliases)
```
to get a TupleDesc based on a type OID. This can be used to get a TupleDesc for a base or
composite type. It will not work for a function that returns record, however, and it cannot resolve
polymorphic types.
Once you have a TupleDesc, call:
```
TupleDesc BlessTupleDesc(TupleDesc tupdesc)
```
if you plan to work with Datums, or:
```
AttInMetadata *TupleDescGetAttInMetadata(TupleDesc tupdesc)
```
if you plan to work with C strings. If you are writing a function returning set, you can save the results
of these functions in the FuncCallContext structure — use the tuple_desc or attinmeta
field respectively.
When working with Datums, use:
```
HeapTuple heap_form_tuple(TupleDesc tupdesc, Datum *values, bool
```
```
*isnull)
```
to build a HeapTuple given user data in Datum form.
When working with C strings, use:
```
HeapTuple BuildTupleFromCStrings(AttInMetadata *attinmeta, char
```
```
**values)
```
to build a HeapTuple given user data in C string form. values is an array of C strings, one for
each attribute of the return row. Each C string should be in the form expected by the input function
of the attribute data type. In order to return a null value for one of the attributes, the corresponding
pointer in the values array should be set to NULL. This function will need to be called again for
each row you return.
Once you have built a tuple to return from your function, it must be converted into a Datum. Use:
```
HeapTupleGetDatum(HeapTuple tuple)
```
to convert a HeapTuple into a valid Datum. This Datum can be returned directly if you intend to
return just a single row, or it can be used as the current return value in a set-returning function.
An example appears in the next section.
36.10.9. Returning Sets
```
C-language functions have two options for returning sets (multiple rows). In one method, called Val-
```
```
uePerCall mode, a set-returning function is called repeatedly (passing the same arguments each time)
```
and it returns one new row on each call, until it has no more rows to return and signals that by returning
1278
Extending SQL
```
NULL. The set-returning function (SRF) must therefore save enough state across calls to remember
```
what it was doing and return the correct next item on each call. In the other method, called Materialize
```
mode, an SRF fills and returns a tuplestore object containing its entire result; then only one call occurs
```
for the whole result, and no inter-call state is needed.
When using ValuePerCall mode, it is important to remember that the query is not guaranteed to be
```
run to completion; that is, due to options such as LIMIT, the executor might stop making calls to the
```
set-returning function before all rows have been fetched. This means it is not safe to perform cleanup
activities in the last call, because that might not ever happen. It's recommended to use Materialize
mode for functions that need access to external resources, such as file descriptors.
```
The remainder of this section documents a set of helper macros that are commonly used (though
```
```
not required to be used) for SRFs using ValuePerCall mode. Additional details about Materialize
```
mode can be found in src/backend/utils/fmgr/README. Also, the contrib modules in
the PostgreSQL source distribution contain many examples of SRFs using both ValuePerCall and
Materialize mode.
To use the ValuePerCall support macros described here, include funcapi.h. These macros work
with a structure FuncCallContext that contains the state that needs to be saved across calls. Within
the calling SRF, fcinfo->flinfo->fn_extra is used to hold a pointer to FuncCallContext
across calls. The macros automatically fill that field on first use, and expect to find the same pointer
there on subsequent uses.
typedef struct FuncCallContext
```
{
```
/*
- Number of times we've been called before
*
- call_cntr is initialized to 0 for you by
```
SRF_FIRSTCALL_INIT(), and
```
- incremented for you every time SRF_RETURN_NEXT() is called.
*/
```
uint64 call_cntr;
```
/*
- OPTIONAL maximum number of calls
*
- max_calls is here for convenience only and setting it is
optional.
- If not set, you must provide alternative means to know when
the
- function is done.
*/
```
uint64 max_calls;
```
/*
- OPTIONAL pointer to miscellaneous user-provided context
information
*
- user_fctx is for use as a pointer to your own data to retain
- arbitrary context information between calls of your
function.
*/
```
void *user_fctx;
```
/*
- OPTIONAL pointer to struct containing attribute type input
metadata
1279
Extending SQL
*
- attinmeta is for use when returning tuples (i.e., composite
```
data types)
```
- and is not used when returning base data types. It is only
needed
- if you intend to use BuildTupleFromCStrings() to create the
return
- tuple.
*/
```
AttInMetadata *attinmeta;
```
/*
- memory context used for structures that must live for
multiple calls
*
- multi_call_memory_ctx is set by SRF_FIRSTCALL_INIT() for
you, and used
- by SRF_RETURN_DONE() for cleanup. It is the most appropriate
memory
- context for any memory that is to be reused across multiple
calls
- of the SRF.
*/
```
MemoryContext multi_call_memory_ctx;
```
/*
- OPTIONAL pointer to struct containing tuple description
*
- tuple_desc is for use when returning tuples (i.e., composite
```
data types)
```
- and is only needed if you are going to build the tuples with
- heap_form_tuple() rather than with BuildTupleFromCStrings().
Note that
- the TupleDesc pointer stored here should usually have been
run through
- BlessTupleDesc() first.
*/
```
TupleDesc tuple_desc;
```
```
} FuncCallContext;
```
The macros to be used by an SRF using this infrastructure are:
```
SRF_IS_FIRSTCALL()
```
Use this to determine if your function is being called for the first or a subsequent time. On the first
```
call (only), call:
```
```
SRF_FIRSTCALL_INIT()
```
to initialize the FuncCallContext. On every function call, including the first, call:
```
SRF_PERCALL_SETUP()
```
to set up for using the FuncCallContext.
If your function has data to return in the current call, use:
1280
Extending SQL
```
SRF_RETURN_NEXT(funcctx, result)
```
```
to return it to the caller. (result must be of type Datum, either a single value or a tuple prepared as
```
```
described above.) Finally, when your function is finished returning data, use:
```
```
SRF_RETURN_DONE(funcctx)
```
to clean up and end the SRF.
The memory context that is current when the SRF is called is a transient context that will be cleared
between calls. This means that you do not need to call pfree on everything you allocated using pal-
```
loc; it will go away anyway. However, if you want to allocate any data structures to live across calls,
```
you need to put them somewhere else. The memory context referenced by multi_call_memo-
ry_ctx is a suitable location for any data that needs to survive until the SRF is finished running.
In most cases, this means that you should switch into multi_call_memory_ctx while doing the
first-call setup. Use funcctx->user_fctx to hold a pointer to any such cross-call data structures.
```
(Data you allocate in multi_call_memory_ctx will go away automatically when the query ends,
```
```
so it is not necessary to free that data manually, either.)
```
Warning
While the actual arguments to the function remain unchanged between calls, if you detoast
```
the argument values (which is normally done transparently by the PG_GETARG_xxx macro)
```
in the transient context then the detoasted copies will be freed on each cycle. Accordingly,
if you keep references to such values in your user_fctx, you must either copy them into
the multi_call_memory_ctx after detoasting, or ensure that you detoast the values only
in that context.
A complete pseudo-code example looks like the following:
Datum
```
my_set_returning_function(PG_FUNCTION_ARGS)
```
```
{
```
```
FuncCallContext *funcctx;
```
```
Datum result;
```
further declarations as needed
```
if (SRF_IS_FIRSTCALL())
```
```
{
```
```
MemoryContext oldcontext;
```
```
funcctx = SRF_FIRSTCALL_INIT();
```
```
oldcontext = MemoryContextSwitchTo(funcctx-
```
```
>multi_call_memory_ctx);
```
/* One-time setup code appears here: */
user code
if returning composite
build TupleDesc, and perhaps AttInMetadata
endif returning composite
user code
```
MemoryContextSwitchTo(oldcontext);
```
```
}
```
/* Each-time setup code appears here: */
1281
Extending SQL
user code
```
funcctx = SRF_PERCALL_SETUP();
```
user code
/* this is just one way we might test whether we are done: */
```
if (funcctx->call_cntr < funcctx->max_calls)
```
```
{
```
/* Here we want to return another item: */
user code
obtain result Datum
```
SRF_RETURN_NEXT(funcctx, result);
```
```
}
```
else
```
{
```
/* Here we are done returning items, so just report that
fact. */
```
/* (Resist the temptation to put cleanup code here.) */
```
```
SRF_RETURN_DONE(funcctx);
```
```
}
```
```
}
```
A complete example of a simple SRF returning a composite type looks like:
```
PG_FUNCTION_INFO_V1(retcomposite);
```
Datum
```
retcomposite(PG_FUNCTION_ARGS)
```
```
{
```
```
FuncCallContext *funcctx;
```
```
int call_cntr;
```
```
int max_calls;
```
```
TupleDesc tupdesc;
```
```
AttInMetadata *attinmeta;
```
/* stuff done only on the first call of the function */
```
if (SRF_IS_FIRSTCALL())
```
```
{
```
```
MemoryContext oldcontext;
```
/* create a function context for cross-call persistence */
```
funcctx = SRF_FIRSTCALL_INIT();
```
/* switch to memory context appropriate for multiple
```
function calls */
```
```
oldcontext = MemoryContextSwitchTo(funcctx-
```
```
>multi_call_memory_ctx);
```
/* total number of tuples to be returned */
```
funcctx->max_calls = PG_GETARG_INT32(0);
```
/* Build a tuple descriptor for our result type */
```
if (get_call_result_type(fcinfo, NULL, &tupdesc) !=
```
```
TYPEFUNC_COMPOSITE)
```
```
ereport(ERROR,
```
```
(errcode(ERRCODE_FEATURE_NOT_SUPPORTED),
```
```
errmsg("function returning record called in
```
context "
1282
Extending SQL
```
"that cannot accept type record")));
```
/*
- generate attribute metadata needed later to produce
tuples from raw
- C strings
*/
```
attinmeta = TupleDescGetAttInMetadata(tupdesc);
```
```
funcctx->attinmeta = attinmeta;
```
```
MemoryContextSwitchTo(oldcontext);
```
```
}
```
/* stuff done on every call of the function */
```
funcctx = SRF_PERCALL_SETUP();
```
```
call_cntr = funcctx->call_cntr;
```
```
max_calls = funcctx->max_calls;
```
```
attinmeta = funcctx->attinmeta;
```
```
if (call_cntr < max_calls) /* do when there is more left to
```
send */
```
{
```
```
char **values;
```
```
HeapTuple tuple;
```
```
Datum result;
```
/*
- Prepare a values array for building the returned tuple.
- This should be an array of C strings which will
- be processed later by the type input functions.
*/
```
values = (char **) palloc(3 * sizeof(char *));
```
```
values[0] = (char *) palloc(16 * sizeof(char));
```
```
values[1] = (char *) palloc(16 * sizeof(char));
```
```
values[2] = (char *) palloc(16 * sizeof(char));
```
```
snprintf(values[0], 16, "%d", 1 * PG_GETARG_INT32(1));
```
```
snprintf(values[1], 16, "%d", 2 * PG_GETARG_INT32(1));
```
```
snprintf(values[2], 16, "%d", 3 * PG_GETARG_INT32(1));
```
/* build a tuple */
```
tuple = BuildTupleFromCStrings(attinmeta, values);
```
/* make the tuple into a datum */
```
result = HeapTupleGetDatum(tuple);
```
```
/* clean up (this is not really necessary) */
```
```
pfree(values[0]);
```
```
pfree(values[1]);
```
```
pfree(values[2]);
```
```
pfree(values);
```
```
SRF_RETURN_NEXT(funcctx, result);
```
```
}
```
else /* do when there is no more left */
```
{
```
```
SRF_RETURN_DONE(funcctx);
```
1283
Extending SQL
```
}
```
```
}
```
One way to declare this function in SQL is:
```
CREATE TYPE __retcomposite AS (f1 integer, f2 integer, f3 integer);
```
```
CREATE OR REPLACE FUNCTION retcomposite(integer, integer)
```
RETURNS SETOF __retcomposite
AS 'filename', 'retcomposite'
```
LANGUAGE C IMMUTABLE STRICT;
```
A different way is to use OUT parameters:
```
CREATE OR REPLACE FUNCTION retcomposite(IN integer, IN integer,
```
```
OUT f1 integer, OUT f2 integer, OUT f3 integer)
```
RETURNS SETOF record
AS 'filename', 'retcomposite'
```
LANGUAGE C IMMUTABLE STRICT;
```
Notice that in this method the output type of the function is formally an anonymous record type.
36.10.10. Polymorphic Arguments and Return Types
C-language functions can be declared to accept and return the polymorphic types described in Sec-
tion 36.2.5. When a function's arguments or return types are defined as polymorphic types, the function
author cannot know in advance what data type it will be called with, or need to return. There are two
routines provided in fmgr.h to allow a version-1 C function to discover the actual data types of its ar-
```
guments and the type it is expected to return. The routines are called get_fn_expr_rettype(Fm-
```
```
grInfo *flinfo) and get_fn_expr_argtype(FmgrInfo *flinfo, int argnum).
```
They return the result or argument type OID, or InvalidOid if the information is not available.
The structure flinfo is normally accessed as fcinfo->flinfo. The parameter argnum is ze-
ro based. get_call_result_type can also be used as an alternative to get_fn_expr_ret-
type. There is also get_fn_expr_variadic, which can be used to find out whether variadic
arguments have been merged into an array. This is primarily useful for VARIADIC "any" functions,
since such merging will always have occurred for variadic functions taking ordinary array types.
For example, suppose we want to write a function to accept a single element of any type, and return
a one-dimensional array of that type:
```
PG_FUNCTION_INFO_V1(make_array);
```
Datum
```
make_array(PG_FUNCTION_ARGS)
```
```
{
```
```
ArrayType *result;
```
```
Oid element_type = get_fn_expr_argtype(fcinfo->flinfo,
```
```
0);
```
```
Datum element;
```
```
bool isnull;
```
```
int16 typlen;
```
```
bool typbyval;
```
```
char typalign;
```
```
int ndims;
```
```
int dims[MAXDIM];
```
```
int lbs[MAXDIM];
```
1284
Extending SQL
```
if (!OidIsValid(element_type))
```
```
elog(ERROR, "could not determine data type of input");
```
/* get the provided element, being careful in case it's NULL */
```
isnull = PG_ARGISNULL(0);
```
```
if (isnull)
```
```
element = (Datum) 0;
```
else
```
element = PG_GETARG_DATUM(0);
```
/* we have one dimension */
```
ndims = 1;
```
/* and one element */
```
dims[0] = 1;
```
/* and lower bound is 1 */
```
lbs[0] = 1;
```
/* get required info about the element type */
```
get_typlenbyvalalign(element_type, &typlen, &typbyval,
```
```
&typalign);
```
/* now build the array */
```
result = construct_md_array(&element, &isnull, ndims, dims,
```
lbs,
element_type, typlen, typbyval,
```
typalign);
```
```
PG_RETURN_ARRAYTYPE_P(result);
```
```
}
```
The following command declares the function make_array in SQL:
```
CREATE FUNCTION make_array(anyelement) RETURNS anyarray
```
AS 'DIRECTORY/funcs', 'make_array'
```
LANGUAGE C IMMUTABLE;
```
There is a variant of polymorphism that is only available to C-language functions: they can be declared
```
to take parameters of type "any". (Note that this type name must be double-quoted, since it's also an
```
```
SQL reserved word.) This works like anyelement except that it does not constrain different "any"
```
arguments to be the same type, nor do they help determine the function's result type. A C-language
```
function can also declare its final parameter to be VARIADIC "any". This will match one or more
```
```
actual arguments of any type (not necessarily the same type). These arguments will not be gathered into
```
```
an array as happens with normal variadic functions; they will just be passed to the function separately.
```
```
The PG_NARGS() macro and the methods described above must be used to determine the number of
```
actual arguments and their types when using this feature. Also, users of such a function might wish
to use the VARIADIC keyword in their function call, with the expectation that the function would
treat the array elements as separate arguments. The function itself must implement that behavior if
wanted, after using get_fn_expr_variadic to detect that the actual argument was marked with
VARIADIC.
36.10.11. Shared Memory
36.10.11.1. Requesting Shared Memory at Startup
Add-ins can reserve shared memory on server startup. To do so, the add-in's shared library must
be preloaded by specifying it in shared_preload_libraries. The shared library should also register a
1285
Extending SQL
shmem_request_hook in its _PG_init function. This shmem_request_hook can reserve
shared memory by calling:
```
void RequestAddinShmemSpace(Size size)
```
Each backend should obtain a pointer to the reserved shared memory by calling:
```
void *ShmemInitStruct(const char *name, Size size, bool *foundPtr)
```
If this function sets foundPtr to false, the caller should proceed to initialize the contents of the
reserved shared memory. If foundPtr is set to true, the shared memory was already initialized by
another backend, and the caller need not initialize further.
To avoid race conditions, each backend should use the LWLock AddinShmemInitLock when
initializing its allocation of shared memory, as shown here:
```
static mystruct *ptr = NULL;
```
```
bool found;
```
```
LWLockAcquire(AddinShmemInitLock, LW_EXCLUSIVE);
```
```
ptr = ShmemInitStruct("my struct name", size, &found);
```
```
if (!found)
```
```
{
```
... initialize contents of shared memory ...
```
ptr->locks = GetNamedLWLockTranche("my tranche name");
```
```
}
```
```
LWLockRelease(AddinShmemInitLock);
```
shmem_startup_hook provides a convenient place for the initialization code, but it is not strict-
```
ly required that all such code be placed in this hook. On Windows (and anywhere else where EX-
```
```
EC_BACKEND is defined), each backend executes the registered shmem_startup_hook shortly
```
after it attaches to shared memory, so add-ins should still acquire AddinShmemInitLock within
this hook, as shown in the example above. On other platforms, only the postmaster process executes the
shmem_startup_hook, and each backend automatically inherits the pointers to shared memory.
An example of a shmem_request_hook and shmem_startup_hook can be found in con-
trib/pg_stat_statements/pg_stat_statements.c in the PostgreSQL source tree.
36.10.11.2. Requesting Shared Memory After Startup
There is another, more flexible method of reserving shared memory that can be done after server startup
and outside a shmem_request_hook. To do so, each backend that will use the shared memory
should obtain a pointer to it by calling:
```
void *GetNamedDSMSegment(const char *name, size_t size,
```
```
void (*init_callback) (void *ptr),
```
```
bool *found)
```
If a dynamic shared memory segment with the given name does not yet exist, this function will allocate
it and initialize it with the provided init_callback callback function. If the segment has already
been allocated and initialized by another backend, this function simply attaches the existing dynamic
shared memory segment to the current backend.
Unlike shared memory reserved at server startup, there is no need to acquire AddinShmemInit-
Lock or otherwise take action to avoid race conditions when reserving shared memory with Get-
1286
Extending SQL
NamedDSMSegment. This function ensures that only one backend allocates and initializes the seg-
ment and that all other backends receive a pointer to the fully allocated and initialized segment.
A complete usage example of GetNamedDSMSegment can be found in src/test/mod-
ules/test_dsm_registry/test_dsm_registry.c in the PostgreSQL source tree.
36.10.12. LWLocks
36.10.12.1. Requesting LWLocks at Startup
Add-ins can reserve LWLocks on server startup. As with shared memory reserved at server startup, the
add-in's shared library must be preloaded by specifying it in shared_preload_libraries, and the shared
library should register a shmem_request_hook in its _PG_init function. This shmem_re-
quest_hook can reserve LWLocks by calling:
```
void RequestNamedLWLockTranche(const char *tranche_name, int
```
```
num_lwlocks)
```
This ensures that an array of num_lwlocks LWLocks is available under the name tranche_name.
A pointer to this array can be obtained by calling:
```
LWLockPadded *GetNamedLWLockTranche(const char *tranche_name)
```
36.10.12.2. Requesting LWLocks After Startup
There is another, more flexible method of obtaining LWLocks that can be done after server startup
and outside a shmem_request_hook. To do so, first allocate a tranche_id by calling:
```
int LWLockNewTrancheId(void)
```
Next, initialize each LWLock, passing the new tranche_id as an argument:
```
void LWLockInitialize(LWLock *lock, int tranche_id)
```
Similar to shared memory, each backend should ensure that only one process allocates a new
tranche_id and initializes each new LWLock. One way to do this is to only call these functions
in your shared memory initialization code with the AddinShmemInitLock held exclusively. If
using GetNamedDSMSegment, calling these functions in the init_callback callback function
is sufficient to avoid race conditions.
Finally, each backend using the tranche_id should associate it with a tranche_name by calling:
```
void LWLockRegisterTranche(int tranche_id, const char
```
```
*tranche_name)
```
A complete usage example of LWLockNewTrancheId, LWLockInitialize, and LWLock-
RegisterTranche can be found in contrib/pg_prewarm/autoprewarm.c in the Post-
greSQL source tree.
36.10.13. Custom Wait Events
Add-ins can define custom wait events under the wait event type Extension by calling:
1287
Extending SQL
```
uint32 WaitEventExtensionNew(const char *wait_event_name)
```
The wait event is associated to a user-facing custom string. An example can be found in src/test/
modules/worker_spi in the PostgreSQL source tree.
Custom wait events can be viewed in pg_stat_activity:
=# SELECT wait_event_type, wait_event FROM pg_stat_activity
```
WHERE backend_type ~ 'worker_spi';
```
wait_event_type | wait_event
-----------------+---------------
Extension | WorkerSpiMain
```
(1 row)
```
36.10.14. Injection Points
An injection point with a given name is declared using macro:
```
INJECTION_POINT(name, arg);
```
There are a few injection points already declared at strategic points within the server code. After adding
a new injection point the code needs to be compiled in order for that injection point to be available
in the binary. Add-ins written in C-language can declare injection points in their own code using the
same macro. The injection point names should use lower-case characters, with terms separated by
dashes. arg is an optional argument value given to the callback at run-time.
Executing an injection point can require allocating a small amount of memory, which can fail. If you
need to have an injection point in a critical section where dynamic allocations are not allowed, you
can use a two-step approach with the following macros:
```
INJECTION_POINT_LOAD(name);
```
```
INJECTION_POINT_CACHED(name, arg);
```
Before entering the critical section, call INJECTION_POINT_LOAD. It checks the shared memory
state, and loads the callback into backend-private memory if it is active. Inside the critical section, use
INJECTION_POINT_CACHED to execute the callback.
Add-ins can attach callbacks to an already-declared injection point by calling:
```
extern void InjectionPointAttach(const char *name,
```
const char *library,
const char *function,
const void *private_data,
```
int private_data_size);
```
name is the name of the injection point, which when reached during execution will execute the func-
tion loaded from library. private_data is a private area of data of size private_da-
ta_size given as argument to the callback when executed.
Here is an example of callback for InjectionPointCallback:
static void
```
custom_injection_callback(const char *name,
```
1288
Extending SQL
const void *private_data,
```
void *arg)
```
```
{
```
```
uint32 wait_event_info = WaitEventInjectionPointNew(name);
```
```
pgstat_report_wait_start(wait_event_info);
```
```
elog(NOTICE, "%s: executed custom callback", name);
```
```
pgstat_report_wait_end();
```
```
}
```
This callback prints a message to server error log with severity NOTICE, but callbacks may implement
more complex logic.
An alternative way to define the action to take when an injection point is reached is to add the testing
code alongside the normal source code. This can be useful if the action e.g. depends on local variables
that are not accessible to loaded modules. The IS_INJECTION_POINT_ATTACHED macro can
then be used to check if an injection point is attached, for example:
#ifdef USE_INJECTION_POINTS
```
if (IS_INJECTION_POINT_ATTACHED("before-foobar"))
```
```
{
```
/* change a local variable if injection point is attached */
```
local_var = 123;
```
/* also execute the callback */
```
INJECTION_POINT_CACHED("before-foobar", NULL);
```
```
}
```
#endif
Note that the callback attached to the injection point will not be executed by the IS_INJEC-
TION_POINT_ATTACHED macro. If you want to execute the callback, you must also call INJEC-
TION_POINT_CACHED like in the above example.
Optionally, it is possible to detach an injection point by calling:
```
extern bool InjectionPointDetach(const char *name);
```
On success, true is returned, false otherwise.
A callback attached to an injection point is available across all the backends including the backends
started after InjectionPointAttach is called. It remains attached while the server is running or
until the injection point is detached using InjectionPointDetach.
An example can be found in src/test/modules/injection_points in the PostgreSQL
source tree.
Enabling injections points requires --enable-injection-points with configure or -
```
Dinjection_points=true with Meson.
```
36.10.15. Custom Cumulative Statistics
It is possible for add-ins written in C-language to use custom types of cumulative statistics registered
in the Cumulative Statistics System.
First, define a PgStat_KindInfo that includes all the information related to the custom type reg-
istered. For example:
1289
Extending SQL
```
static const PgStat_KindInfo custom_stats = {
```
.name = "custom_stats",
.fixed_amount = false,
```
.shared_size = sizeof(PgStatShared_Custom),
```
```
.shared_data_off = offsetof(PgStatShared_Custom, stats),
```
```
.shared_data_len = sizeof(((PgStatShared_Custom *) 0)->stats),
```
```
.pending_size = sizeof(PgStat_StatCustomEntry),
```
```
}
```
Then, each backend that needs to use this custom type needs to register it with pgstat_regis-
ter_kind and a unique ID used to store the entries related to this type of statistics:
```
extern PgStat_Kind pgstat_register_kind(PgStat_Kind kind,
```
const PgStat_KindInfo
```
*kind_info);
```
While developing a new extension, use PGSTAT_KIND_EXPERIMENTAL for kind. When you are
ready to release the extension to users, reserve a kind ID at the Custom Cumulative Statistics2 page.
The details of the API for PgStat_KindInfo can be found in src/include/utils/pg-
stat_internal.h.
The type of statistics registered is associated with a name and a unique ID shared across the server
in shared memory. Each backend using a custom type of statistics maintains a local cache storing the
information of each custom PgStat_KindInfo.
Place the extension module implementing the custom cumulative statistics type in shared_preload_li-
braries so that it will be loaded early during PostgreSQL startup.
An example describing how to register and use custom statistics can be found in src/test/mod-
ules/injection_points.
36.10.16. Using C++ for Extensibility
Although the PostgreSQL backend is written in C, it is possible to write extensions in C++ if these
guidelines are followed:
```
• All functions accessed by the backend must present a C interface to the backend; these C functions
```
can then call C++ functions. For example, extern C linkage is required for backend-accessed
functions. This is also necessary for any functions that are passed as pointers between the backend
and C++ code.
• Free memory using the appropriate deallocation method. For example, most backend memory is
```
allocated using palloc(), so use pfree() to free it. Using C++ delete in such cases will fail.
```
```
• Prevent exceptions from propagating into the C code (use a catch-all block at the top level of all
```
```
extern C functions). This is necessary even if the C++ code does not explicitly throw any ex-
```
ceptions, because events like out-of-memory can still throw exceptions. Any exceptions must be
caught and appropriate errors passed back to the C interface. If possible, compile C++ with -fno-
```
exceptions to eliminate exceptions entirely; in such cases, you must check for failures in your
```
```
C++ code, e.g., check for NULL returned by new().
```
• If calling backend functions from C++ code, be sure that the C++ call stack contains only plain old
```
data structures (POD). This is necessary because backend errors generate a distant longjmp()
```
that does not properly unroll a C++ call stack with non-POD objects.
2 https://wiki.postgresql.org/wiki/CustomCumulativeStats
1290
Extending SQL
In summary, it is best to place C++ code behind a wall of extern C functions that interface to the
backend, and avoid exception, memory, and call stack leakage.
36.11. Function Optimization Information
By default, a function is just a “black box” that the database system knows very little about the behavior
of. However, that means that queries using the function may be executed much less efficiently than
they could be. It is possible to supply additional knowledge that helps the planner optimize function
calls.
Some basic facts can be supplied by declarative annotations provided in the CREATE FUNCTION
```
command. Most important of these is the function's volatility category (IMMUTABLE, STABLE, or
```
```
VOLATILE); one should always be careful to specify this correctly when defining a function. The
```
```
parallel safety property (PARALLEL UNSAFE, PARALLEL RESTRICTED, or PARALLEL SAFE)
```
must also be specified if you hope to use the function in parallelized queries. It can also be useful to
specify the function's estimated execution cost, and/or the number of rows a set-returning function is
estimated to return. However, the declarative way of specifying those two facts only allows specifying
a constant value, which is often inadequate.
```
It is also possible to attach a planner support function to an SQL-callable function (called its target
```
```
function), and thereby provide knowledge about the target function that is too complex to be repre-
```
```
sented declaratively. Planner support functions have to be written in C (although their target functions
```
```
might not be), so this is an advanced feature that relatively few people will use.
```
A planner support function must have the SQL signature
```
supportfn(internal) returns internal
```
It is attached to its target function by specifying the SUPPORT clause when creating the target function.
The details of the API for planner support functions can be found in file src/include/nodes/
supportnodes.h in the PostgreSQL source code. Here we provide just an overview of what plan-
ner support functions can do. The set of possible requests to a support function is extensible, so more
things might be possible in future versions.
Some function calls can be simplified during planning based on properties specific to the function.
```
For example, int4mul(n, 1) could be simplified to just n. This type of transformation can be
```
performed by a planner support function, by having it implement the SupportRequestSimplify
request type. The support function will be called for each instance of its target function found in a
query parse tree. If it finds that the particular call can be simplified into some other form, it can build
and return a parse tree representing that expression. This will automatically work for operators based
```
on the function, too — in the example just given, n * 1 would also be simplified to n. (But note that
```
```
this is just an example; this particular optimization is not actually performed by standard PostgreSQL.)
```
We make no guarantee that PostgreSQL will never call the target function in cases that the support
```
function could simplify. Ensure rigorous equivalence between the simplified expression and an actual
```
execution of the target function.
For target functions that return boolean, it is often useful to estimate the fraction of rows that will be
selected by a WHERE clause using that function. This can be done by a support function that implements
the SupportRequestSelectivity request type.
If the target function's run time is highly dependent on its inputs, it may be useful to provide a non-
constant cost estimate for it. This can be done by a support function that implements the Support-
RequestCost request type.
For target functions that return sets, it is often useful to provide a non-constant estimate for the number
of rows that will be returned. This can be done by a support function that implements the Support-
RequestRows request type.
1291
Extending SQL
For target functions that return boolean, it may be possible to convert a function call appearing in
WHERE into an indexable operator clause or clauses. The converted clauses might be exactly equivalent
```
to the function's condition, or they could be somewhat weaker (that is, they might accept some values
```
```
that the function condition does not). In the latter case the index condition is said to be lossy; it can
```
still be used to scan an index, but the function call will have to be executed for each row returned by
the index to see if it really passes the WHERE condition or not. To create such conditions, the support
```
function must implement the SupportRequestIndexCondition request type.
```
36.12. User-Defined Aggregates
Aggregate functions in PostgreSQL are defined in terms of state values and state transition functions.
That is, an aggregate operates using a state value that is updated as each successive input row is
processed. To define a new aggregate function, one selects a data type for the state value, an initial
value for the state, and a state transition function. The state transition function takes the previous state
```
value and the aggregate's input value(s) for the current row, and returns a new state value. A final
```
```
function can also be specified, in case the desired result of the aggregate is different from the data
```
that needs to be kept in the running state value. The final function takes the ending state value and
returns whatever is wanted as the aggregate result. In principle, the transition and final functions are
```
just ordinary functions that could also be used outside the context of the aggregate. (In practice, it's
```
often helpful for performance reasons to create specialized transition functions that can only work
```
when called as part of an aggregate.)
```
Thus, in addition to the argument and result data types seen by a user of the aggregate, there is an
internal state-value data type that might be different from both the argument and result types.
If we define an aggregate that does not use a final function, we have an aggregate that computes a
running function of the column values from each row. sum is an example of this kind of aggregate.
sum starts at zero and always adds the current row's value to its running total. For example, if we
want to make a sum aggregate to work on a data type for complex numbers, we only need the addition
```
function for that data type. The aggregate definition would be:
```
```
CREATE AGGREGATE sum (complex)
```
```
(
```
```
sfunc = complex_add,
```
```
stype = complex,
```
```
initcond = '(0,0)'
```
```
);
```
which we might use like this:
```
SELECT sum(a) FROM test_complex;
```
sum
-----------
```
(34,53.9)
```
```
(Notice that we are relying on function overloading: there is more than one aggregate named sum, but
```
```
PostgreSQL can figure out which kind of sum applies to a column of type complex.)
```
```
The above definition of sum will return zero (the initial state value) if there are no nonnull input
```
values. Perhaps we want to return null in that case instead — the SQL standard expects sum to behave
that way. We can do this simply by omitting the initcond phrase, so that the initial state value is
null. Ordinarily this would mean that the sfunc would need to check for a null state-value input. But
for sum and some other simple aggregates like max and min, it is sufficient to insert the first nonnull
input value into the state variable and then start applying the transition function at the second nonnull
input value. PostgreSQL will do that automatically if the initial state value is null and the transition
```
function is marked “strict” (i.e., not to be called for null inputs).
```
1292
Extending SQL
Another bit of default behavior for a “strict” transition function is that the previous state value is
retained unchanged whenever a null input value is encountered. Thus, null values are ignored. If you
```
need some other behavior for null inputs, do not declare your transition function as strict; instead code
```
it to test for null inputs and do whatever is needed.
```
avg (average) is a more complex example of an aggregate. It requires two pieces of running state:
```
the sum of the inputs and the count of the number of inputs. The final result is obtained by dividing
these quantities. Average is typically implemented by using an array as the state value. For example,
```
the built-in implementation of avg(float8) looks like:
```
```
CREATE AGGREGATE avg (float8)
```
```
(
```
```
sfunc = float8_accum,
```
```
stype = float8[],
```
```
finalfunc = float8_avg,
```
```
initcond = '{0,0,0}'
```
```
);
```
Note
float8_accum requires a three-element array, not just two elements, because it accumulates
the sum of squares as well as the sum and count of the inputs. This is so that it can be used
for some other aggregates as well as avg.
Aggregate function calls in SQL allow DISTINCT and ORDER BY options that control which rows
are fed to the aggregate's transition function and in what order. These options are implemented behind
the scenes and are not the concern of the aggregate's support functions.
For further details see the CREATE AGGREGATE command.
36.12.1. Moving-Aggregate Mode
Aggregate functions can optionally support moving-aggregate mode, which allows substantially faster
```
execution of aggregate functions within windows with moving frame starting points. (See Section 3.5
```
```
and Section 4.2.8 for information about use of aggregate functions as window functions.) The basic
```
idea is that in addition to a normal “forward” transition function, the aggregate provides an inverse
transition function, which allows rows to be removed from the aggregate's running state value when
they exit the window frame. For example a sum aggregate, which uses addition as the forward tran-
sition function, would use subtraction as the inverse transition function. Without an inverse transition
function, the window function mechanism must recalculate the aggregate from scratch each time the
frame starting point moves, resulting in run time proportional to the number of input rows times the
average frame length. With an inverse transition function, the run time is only proportional to the
number of input rows.
```
The inverse transition function is passed the current state value and the aggregate input value(s) for
```
the earliest row included in the current state. It must reconstruct what the state value would have been
if the given input row had never been aggregated, but only the rows following it. This sometimes
requires that the forward transition function keep more state than is needed for plain aggregation mode.
Therefore, the moving-aggregate mode uses a completely separate implementation from the plain
```
mode: it has its own state data type, its own forward transition function, and its own final function
```
if needed. These can be the same as the plain mode's data type and functions, if there is no need for
extra state.
As an example, we could extend the sum aggregate given above to support moving-aggregate mode
like this:
1293
Extending SQL
```
CREATE AGGREGATE sum (complex)
```
```
(
```
```
sfunc = complex_add,
```
```
stype = complex,
```
```
initcond = '(0,0)',
```
```
msfunc = complex_add,
```
```
minvfunc = complex_sub,
```
```
mstype = complex,
```
```
minitcond = '(0,0)'
```
```
);
```
The parameters whose names begin with m define the moving-aggregate implementation. Except for
the inverse transition function minvfunc, they correspond to the plain-aggregate parameters without
m.
The forward transition function for moving-aggregate mode is not allowed to return null as the new
state value. If the inverse transition function returns null, this is taken as an indication that the inverse
```
function cannot reverse the state calculation for this particular input, and so the aggregate calculation
```
will be redone from scratch for the current frame starting position. This convention allows moving-ag-
gregate mode to be used in situations where there are some infrequent cases that are impractical to
reverse out of the running state value. The inverse transition function can “punt” on these cases, and
yet still come out ahead so long as it can work for most cases. As an example, an aggregate working
```
with floating-point numbers might choose to punt when a NaN (not a number) input has to be removed
```
from the running state value.
When writing moving-aggregate support functions, it is important to be sure that the inverse transition
```
function can reconstruct the correct state value exactly. Otherwise there might be user-visible differ-
```
ences in results depending on whether the moving-aggregate mode is used. An example of an aggregate
for which adding an inverse transition function seems easy at first, yet where this requirement cannot
```
be met is sum over float4 or float8 inputs. A naive declaration of sum(float8) could be
```
```
CREATE AGGREGATE unsafe_sum (float8)
```
```
(
```
```
stype = float8,
```
```
sfunc = float8pl,
```
```
mstype = float8,
```
```
msfunc = float8pl,
```
```
minvfunc = float8mi
```
```
);
```
This aggregate, however, can give wildly different results than it would have without the inverse
transition function. For example, consider
SELECT
```
unsafe_sum(x) OVER (ORDER BY n ROWS BETWEEN CURRENT ROW AND 1
```
```
FOLLOWING)
```
```
FROM (VALUES (1, 1.0e20::float8),
```
```
(2, 1.0::float8)) AS v (n,x);
```
This query returns 0 as its second result, rather than the expected answer of 1. The cause is the limited
precision of floating-point values: adding 1 to 1e20 results in 1e20 again, and so subtracting 1e20
from that yields 0, not 1. Note that this is a limitation of floating-point arithmetic in general, not a
limitation of PostgreSQL.
36.12.2. Polymorphic and Variadic Aggregates
1294
Extending SQL
Aggregate functions can use polymorphic state transition functions or final functions, so that the same
functions can be used to implement multiple aggregates. See Section 36.2.5 for an explanation of
polymorphic functions. Going a step further, the aggregate function itself can be specified with poly-
```
morphic input type(s) and state type, allowing a single aggregate definition to serve for multiple input
```
data types. Here is an example of a polymorphic aggregate:
```
CREATE AGGREGATE array_accum (anycompatible)
```
```
(
```
```
sfunc = array_append,
```
```
stype = anycompatiblearray,
```
```
initcond = '{}'
```
```
);
```
Here, the actual state type for any given aggregate call is the array type having the actual input type as
```
elements. The behavior of the aggregate is to concatenate all the inputs into an array of that type. (Note:
```
the built-in aggregate array_agg provides similar functionality, with better performance than this
```
definition would have.)
```
Here's the output using two different actual data types as arguments:
```
SELECT attrelid::regclass, array_accum(attname)
```
FROM pg_attribute
WHERE attnum > 0 AND attrelid = 'pg_tablespace'::regclass
```
GROUP BY attrelid;
```
attrelid | array_accum
---------------+---------------------------------------
```
pg_tablespace | {spcname,spcowner,spcacl,spcoptions}
```
```
(1 row)
```
```
SELECT attrelid::regclass, array_accum(atttypid::regtype)
```
FROM pg_attribute
WHERE attnum > 0 AND attrelid = 'pg_tablespace'::regclass
```
GROUP BY attrelid;
```
attrelid | array_accum
---------------+---------------------------
```
pg_tablespace | {name,oid,aclitem[],text[]}
```
```
(1 row)
```
Ordinarily, an aggregate function with a polymorphic result type has a polymorphic state type, as in
the above example. This is necessary because otherwise the final function cannot be declared sensibly:
it would need to have a polymorphic result type but no polymorphic argument type, which CREATE
FUNCTION will reject on the grounds that the result type cannot be deduced from a call. But sometimes
it is inconvenient to use a polymorphic state type. The most common case is where the aggregate
support functions are to be written in C and the state type should be declared as internal because
there is no SQL-level equivalent for it. To address this case, it is possible to declare the final function
as taking extra “dummy” arguments that match the input arguments of the aggregate. Such dummy
arguments are always passed as null values since no specific value is available when the final function
is called. Their only use is to allow a polymorphic final function's result type to be connected to
```
the aggregate's input type(s). For example, the definition of the built-in aggregate array_agg is
```
equivalent to
```
CREATE FUNCTION array_agg_transfn(internal, anynonarray)
```
```
RETURNS internal ...;
```
1295
Extending SQL
```
CREATE FUNCTION array_agg_finalfn(internal, anynonarray)
```
```
RETURNS anyarray ...;
```
```
CREATE AGGREGATE array_agg (anynonarray)
```
```
(
```
```
sfunc = array_agg_transfn,
```
```
stype = internal,
```
```
finalfunc = array_agg_finalfn,
```
finalfunc_extra
```
);
```
Here, the finalfunc_extra option specifies that the final function receives, in addition to the
```
state value, extra dummy argument(s) corresponding to the aggregate's input argument(s). The extra
```
anynonarray argument allows the declaration of array_agg_finalfn to be valid.
An aggregate function can be made to accept a varying number of arguments by declaring its last ar-
```
gument as a VARIADIC array, in much the same fashion as for regular functions; see Section 36.5.6.
```
```
The aggregate's transition function(s) must have the same array type as their last argument. The tran-
```
```
sition function(s) typically would also be marked VARIADIC, but this is not strictly required.
```
Note
```
Variadic aggregates are easily misused in connection with the ORDER BY option (see Sec-
```
```
tion 4.2.7), since the parser cannot tell whether the wrong number of actual arguments have
```
been given in such a combination. Keep in mind that everything to the right of ORDER BY is
a sort key, not an argument to the aggregate. For example, in
```
SELECT myaggregate(a ORDER BY a, b, c) FROM ...
```
the parser will see this as a single aggregate function argument and three sort keys. However,
the user might have intended
```
SELECT myaggregate(a, b, c ORDER BY a) FROM ...
```
If myaggregate is variadic, both these calls could be perfectly valid.
For the same reason, it's wise to think twice before creating aggregate functions with the same
names and different numbers of regular arguments.
36.12.3. Ordered-Set Aggregates
The aggregates we have been describing so far are “normal” aggregates. PostgreSQL also supports
ordered-set aggregates, which differ from normal aggregates in two key ways. First, in addition to
ordinary aggregated arguments that are evaluated once per input row, an ordered-set aggregate can
have “direct” arguments that are evaluated only once per aggregation operation. Second, the syntax
for the ordinary aggregated arguments specifies a sort ordering for them explicitly. An ordered-set
aggregate is usually used to implement a computation that depends on a specific row ordering, for
instance rank or percentile, so that the sort ordering is a required aspect of any call. For example, the
built-in definition of percentile_disc is equivalent to:
```
CREATE FUNCTION ordered_set_transition(internal, anyelement)
```
```
RETURNS internal ...;
```
```
CREATE FUNCTION percentile_disc_final(internal, float8, anyelement)
```
1296
Extending SQL
```
RETURNS anyelement ...;
```
```
CREATE AGGREGATE percentile_disc (float8 ORDER BY anyelement)
```
```
(
```
```
sfunc = ordered_set_transition,
```
```
stype = internal,
```
```
finalfunc = percentile_disc_final,
```
finalfunc_extra
```
);
```
```
This aggregate takes a float8 direct argument (the percentile fraction) and an aggregated input that
```
can be of any sortable data type. It could be used to obtain a median household income like this:
```
SELECT percentile_disc(0.5) WITHIN GROUP (ORDER BY income) FROM
```
```
households;
```
percentile_disc
-----------------
50489
```
Here, 0.5 is a direct argument; it would make no sense for the percentile fraction to be a value varying
```
across rows.
Unlike the case for normal aggregates, the sorting of input rows for an ordered-set aggregate is not
done behind the scenes, but is the responsibility of the aggregate's support functions. The typical im-
plementation approach is to keep a reference to a “tuplesort” object in the aggregate's state value,
feed the incoming rows into that object, and then complete the sorting and read out the data in the
final function. This design allows the final function to perform special operations such as injecting
additional “hypothetical” rows into the data to be sorted. While normal aggregates can often be imple-
mented with support functions written in PL/pgSQL or another PL language, ordered-set aggregates
```
generally have to be written in C, since their state values aren't definable as any SQL data type. (In
```
```
the above example, notice that the state value is declared as type internal — this is typical.) Also,
```
because the final function performs the sort, it is not possible to continue adding input rows by exe-
```
cuting the transition function again later. This means the final function is not READ_ONLY; it must be
```
declared in CREATE AGGREGATE as READ_WRITE, or as SHAREABLE if it's possible for additional
final-function calls to make use of the already-sorted state.
The state transition function for an ordered-set aggregate receives the current state value plus the ag-
gregated input values for each row, and returns the updated state value. This is the same definition as
```
for normal aggregates, but note that the direct arguments (if any) are not provided. The final function
```
```
receives the last state value, the values of the direct arguments if any, and (if finalfunc_extra is
```
```
specified) null values corresponding to the aggregated input(s). As with normal aggregates, final-
```
```
func_extra is only really useful if the aggregate is polymorphic; then the extra dummy argumen-
```
```
t(s) are needed to connect the final function's result type to the aggregate's input type(s).
```
Currently, ordered-set aggregates cannot be used as window functions, and therefore there is no need
for them to support moving-aggregate mode.
36.12.4. Partial Aggregation
Optionally, an aggregate function can support partial aggregation. The idea of partial aggregation is
to run the aggregate's state transition function over different subsets of the input data independently,
and then to combine the state values resulting from those subsets to produce the same state value
that would have resulted from scanning all the input in a single operation. This mode can be used
for parallel aggregation by having different worker processes scan different portions of a table. Each
worker produces a partial state value, and at the end those state values are combined to produce a final
```
state value. (In the future this mode might also be used for purposes such as combining aggregations
```
```
over local and remote tables; but that is not implemented yet.)
```
1297
Extending SQL
To support partial aggregation, the aggregate definition must provide a combine function, which takes
```
two values of the aggregate's state type (representing the results of aggregating over two subsets of
```
```
the input rows) and produces a new value of the state type, representing what the state would have
```
been after aggregating over the combination of those sets of rows. It is unspecified what the relative
order of the input rows from the two sets would have been. This means that it's usually impossible to
define a useful combine function for aggregates that are sensitive to input row order.
As simple examples, MAX and MIN aggregates can be made to support partial aggregation by specify-
ing the combine function as the same greater-of-two or lesser-of-two comparison function that is used
```
as their transition function. SUM aggregates just need an addition function as combine function. (Again,
```
```
this is the same as their transition function, unless the state value is wider than the input data type.)
```
The combine function is treated much like a transition function that happens to take a value of the
state type, not of the underlying input type, as its second argument. In particular, the rules for dealing
with null values and strict functions are similar. Also, if the aggregate definition specifies a non-null
initcond, keep in mind that that will be used not only as the initial state for each partial aggregation
run, but also as the initial state for the combine function, which will be called to combine each partial
result into that state.
If the aggregate's state type is declared as internal, it is the combine function's responsibility that
its result is allocated in the correct memory context for aggregate state values. This means in particular
that when the first input is NULL it's invalid to simply return the second input, as that value will be in
the wrong context and will not have sufficient lifespan.
When the aggregate's state type is declared as internal, it is usually also appropriate for the ag-
gregate definition to provide a serialization function and a deserialization function, which allow such
a state value to be copied from one process to another. Without these functions, parallel aggregation
cannot be performed, and future applications such as local/remote aggregation will probably not work
either.
A serialization function must take a single argument of type internal and return a result of type
bytea, which represents the state value packaged up into a flat blob of bytes. Conversely, a deserial-
ization function reverses that conversion. It must take two arguments of types bytea and internal,
```
and return a result of type internal. (The second argument is unused and is always zero, but it is
```
```
required for type-safety reasons.) The result of the deserialization function should simply be allocated
```
in the current memory context, as unlike the combine function's result, it is not long-lived.
Worth noting also is that for an aggregate to be executed in parallel, the aggregate itself must be
marked PARALLEL SAFE. The parallel-safety markings on its support functions are not consulted.
36.12.5. Support Functions for Aggregates
A function written in C can detect that it is being called as an aggregate support function by calling
AggCheckCallContext, for example:
```
if (AggCheckCallContext(fcinfo, NULL))
```
One reason for checking this is that when it is true, the first input must be a temporary state value and
```
can therefore safely be modified in-place rather than allocating a new copy. See int8inc() for an
```
```
example. (While aggregate transition functions are always allowed to modify the transition value in-
```
```
place, aggregate final functions are generally discouraged from doing so; if they do so, the behavior
```
```
must be declared when creating the aggregate. See CREATE AGGREGATE for more detail.)
```
The second argument of AggCheckCallContext can be used to retrieve the memory context in
which aggregate state values are being kept. This is useful for transition functions that wish to use
```
“expanded” objects (see Section 36.13.1) as their state values. On first call, the transition function
```
should return an expanded object whose memory context is a child of the aggregate state context, and
```
then keep returning the same expanded object on subsequent calls. See array_append() for an
```
1298
Extending SQL
```
example. (array_append() is not the transition function of any built-in aggregate, but it is written
```
```
to behave efficiently when used as transition function of a custom aggregate.)
```
Another support routine available to aggregate functions written in C is AggGetAggref, which
returns the Aggref parse node that defines the aggregate call. This is mainly useful for ordered-set
aggregates, which can inspect the substructure of the Aggref node to find out what sort ordering
they are supposed to implement. Examples can be found in orderedsetaggs.c in the PostgreSQL
source code.
36.13. User-Defined Types
As described in Section 36.2, PostgreSQL can be extended to support new data types. This section
describes how to define new base types, which are data types defined below the level of the SQL
language. Creating a new base type requires implementing functions to operate on the type in a low-
level language, usually C.
The examples in this section can be found in complex.sql and complex.c in the src/tuto-
rial directory of the source distribution. See the README file in that directory for instructions about
running the examples.
A user-defined type must always have input and output functions. These functions determine how
```
the type appears in strings (for input by the user and output to the user) and how the type is organized
```
in memory. The input function takes a null-terminated character string as its argument and returns the
```
internal (in memory) representation of the type. The output function takes the internal representation
```
of the type as argument and returns a null-terminated character string. If we want to do anything
more with the type than merely store it, we must provide additional functions to implement whatever
operations we'd like to have for the type.
Suppose we want to define a type complex that represents complex numbers. A natural way to
represent a complex number in memory would be the following C structure:
```
typedef struct Complex {
```
```
double x;
```
```
double y;
```
```
} Complex;
```
We will need to make this a pass-by-reference type, since it's too large to fit into a single Datum value.
```
As the external string representation of the type, we choose a string of the form (x,y).
```
The input and output functions are usually not hard to write, especially the output function. But when
defining the external string representation of the type, remember that you must eventually write a
complete and robust parser for that representation as your input function. For instance:
```
PG_FUNCTION_INFO_V1(complex_in);
```
Datum
```
complex_in(PG_FUNCTION_ARGS)
```
```
{
```
```
char *str = PG_GETARG_CSTRING(0);
```
double x,
```
y;
```
```
Complex *result;
```
```
if (sscanf(str, " ( %lf , %lf )", &x, &y) != 2)
```
```
ereport(ERROR,
```
```
(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
```
1299
Extending SQL
```
errmsg("invalid input syntax for type %s: \"%s\"",
```
```
"complex", str)));
```
```
result = (Complex *) palloc(sizeof(Complex));
```
```
result->x = x;
```
```
result->y = y;
```
```
PG_RETURN_POINTER(result);
```
```
}
```
The output function can simply be:
```
PG_FUNCTION_INFO_V1(complex_out);
```
Datum
```
complex_out(PG_FUNCTION_ARGS)
```
```
{
```
```
Complex *complex = (Complex *) PG_GETARG_POINTER(0);
```
```
char *result;
```
```
result = psprintf("(%g,%g)", complex->x, complex->y);
```
```
PG_RETURN_CSTRING(result);
```
```
}
```
You should be careful to make the input and output functions inverses of each other. If you do not,
you will have severe problems when you need to dump your data into a file and then read it back in.
This is a particularly common problem when floating-point numbers are involved.
Optionally, a user-defined type can provide binary input and output routines. Binary I/O is normally
faster but less portable than textual I/O. As with textual I/O, it is up to you to define exactly what
the external binary representation is. Most of the built-in data types try to provide a machine-indepen-
dent binary representation. For complex, we will piggy-back on the binary I/O converters for type
```
float8:
```
```
PG_FUNCTION_INFO_V1(complex_recv);
```
Datum
```
complex_recv(PG_FUNCTION_ARGS)
```
```
{
```
```
StringInfo buf = (StringInfo) PG_GETARG_POINTER(0);
```
```
Complex *result;
```
```
result = (Complex *) palloc(sizeof(Complex));
```
```
result->x = pq_getmsgfloat8(buf);
```
```
result->y = pq_getmsgfloat8(buf);
```
```
PG_RETURN_POINTER(result);
```
```
}
```
```
PG_FUNCTION_INFO_V1(complex_send);
```
Datum
```
complex_send(PG_FUNCTION_ARGS)
```
```
{
```
```
Complex *complex = (Complex *) PG_GETARG_POINTER(0);
```
```
StringInfoData buf;
```
1300
Extending SQL
```
pq_begintypsend(&buf);
```
```
pq_sendfloat8(&buf, complex->x);
```
```
pq_sendfloat8(&buf, complex->y);
```
```
PG_RETURN_BYTEA_P(pq_endtypsend(&buf));
```
```
}
```
Once we have written the I/O functions and compiled them into a shared library, we can define the
complex type in SQL. First we declare it as a shell type:
```
CREATE TYPE complex;
```
This serves as a placeholder that allows us to reference the type while defining its I/O functions. Now
we can define the I/O functions:
```
CREATE FUNCTION complex_in(cstring)
```
RETURNS complex
AS 'filename'
```
LANGUAGE C IMMUTABLE STRICT;
```
```
CREATE FUNCTION complex_out(complex)
```
RETURNS cstring
AS 'filename'
```
LANGUAGE C IMMUTABLE STRICT;
```
```
CREATE FUNCTION complex_recv(internal)
```
RETURNS complex
AS 'filename'
```
LANGUAGE C IMMUTABLE STRICT;
```
```
CREATE FUNCTION complex_send(complex)
```
RETURNS bytea
AS 'filename'
```
LANGUAGE C IMMUTABLE STRICT;
```
Finally, we can provide the full definition of the data type:
```
CREATE TYPE complex (
```
```
internallength = 16,
```
```
input = complex_in,
```
```
output = complex_out,
```
```
receive = complex_recv,
```
```
send = complex_send,
```
```
alignment = double
```
```
);
```
When you define a new base type, PostgreSQL automatically provides support for arrays of that
```
type. The array type typically has the same name as the base type with the underscore character (_)
```
prepended.
Once the data type exists, we can declare additional functions to provide useful operations on the data
type. Operators can then be defined atop the functions, and if needed, operator classes can be created
to support indexing of the data type. These additional layers are discussed in following sections.
If the internal representation of the data type is variable-length, the internal representation must follow
the standard layout for variable-length data: the first four bytes must be a char[4] field which is
1301
Extending SQL
```
never accessed directly (customarily named vl_len_). You must use the SET_VARSIZE() macro
```
```
to store the total size of the datum (including the length field itself) in this field and VARSIZE() to
```
```
retrieve it. (These macros exist because the length field may be encoded depending on platform.)
```
For further details see the description of the CREATE TYPE command.
36.13.1. TOAST Considerations
```
If the values of your data type vary in size (in internal form), it's usually desirable to make the data
```
```
type TOAST-able (see Section 66.2). You should do this even if the values are always too small to
```
be compressed or stored externally, because TOAST can save space on small data too, by reducing
header overhead.
To support TOAST storage, the C functions operating on the data type must always be careful to un-
```
pack any toasted values they are handed by using PG_DETOAST_DATUM. (This detail is customarily
```
```
hidden by defining type-specific GETARG_DATATYPE_P macros.) Then, when running the CREATE
```
TYPE command, specify the internal length as variable and select some appropriate storage option
other than plain.
```
If data alignment is unimportant (either just for a specific function or because the data type speci-
```
```
fies byte alignment anyway) then it's possible to avoid some of the overhead of PG_DETOAST_DA-
```
```
TUM. You can use PG_DETOAST_DATUM_PACKED instead (customarily hidden by defining a
```
```
GETARG_DATATYPE_PP macro) and using the macros VARSIZE_ANY_EXHDR and VARDA-
```
TA_ANY to access a potentially-packed datum. Again, the data returned by these macros is not aligned
even if the data type definition specifies an alignment. If the alignment is important you must go
through the regular PG_DETOAST_DATUM interface.
Note
Older code frequently declares vl_len_ as an int32 field instead of char[4]. This is OK
as long as the struct definition has other fields that have at least int32 alignment. But it is
```
dangerous to use such a struct definition when working with a potentially unaligned datum;
```
the compiler may take it as license to assume the datum actually is aligned, leading to core
dumps on architectures that are strict about alignment.
Another feature that's enabled by TOAST support is the possibility of having an expanded in-memory
data representation that is more convenient to work with than the format that is stored on disk. The
```
regular or “flat” varlena storage format is ultimately just a blob of bytes; it cannot for example contain
```
pointers, since it may get copied to other locations in memory. For complex data types, the flat format
may be quite expensive to work with, so PostgreSQL provides a way to “expand” the flat format into
a representation that is more suited to computation, and then pass that format in-memory between
functions of the data type.
To use expanded storage, a data type must define an expanded format that follows the rules given
in src/include/utils/expandeddatum.h, and provide functions to “expand” a flat varlena
value into expanded format and “flatten” the expanded format back to the regular varlena represen-
tation. Then ensure that all C functions for the data type can accept either representation, possibly
by converting one into the other immediately upon receipt. This does not require fixing all existing
functions for the data type at once, because the standard PG_DETOAST_DATUM macro is defined to
convert expanded inputs into regular flat format. Therefore, existing functions that work with the flat
```
varlena format will continue to work, though slightly inefficiently, with expanded inputs; they need
```
not be converted until and unless better performance is important.
C functions that know how to work with an expanded representation typically fall into two categories:
those that can only handle expanded format, and those that can handle either expanded or flat varlena
inputs. The former are easier to write but may be less efficient overall, because converting a flat input to
1302
Extending SQL
expanded form for use by a single function may cost more than is saved by operating on the expanded
format. When only expanded format need be handled, conversion of flat inputs to expanded form
can be hidden inside an argument-fetching macro, so that the function appears no more complex than
one working with traditional varlena input. To handle both types of input, write an argument-fetching
```
function that will detoast external, short-header, and compressed varlena inputs, but not expanded
```
inputs. Such a function can be defined as returning a pointer to a union of the flat varlena format and
```
the expanded format. Callers can use the VARATT_IS_EXPANDED_HEADER() macro to determine
```
which format they received.
The TOAST infrastructure not only allows regular varlena values to be distinguished from expanded
values, but also distinguishes “read-write” and “read-only” pointers to expanded values. C functions
that only need to examine an expanded value, or will only change it in safe and non-semantically-visi-
ble ways, need not care which type of pointer they receive. C functions that produce a modified version
of an input value are allowed to modify an expanded input value in-place if they receive a read-write
```
pointer, but must not modify the input if they receive a read-only pointer; in that case they have to copy
```
the value first, producing a new value to modify. A C function that has constructed a new expanded
value should always return a read-write pointer to it. Also, a C function that is modifying a read-write
expanded value in-place should take care to leave the value in a sane state if it fails partway through.
For examples of working with expanded values, see the standard array infrastructure, particularly
src/backend/utils/adt/array_expanded.c.
36.14. User-Defined Operators
```
Every operator is “syntactic sugar” for a call to an underlying function that does the real work; so
```
you must first create the underlying function before you can create the operator. However, an operator
is not merely syntactic sugar, because it carries additional information that helps the query planner
optimize queries that use the operator. The next section will be devoted to explaining that additional
information.
```
PostgreSQL supports prefix and infix operators. Operators can be overloaded; that is, the same operator
```
name can be used for different operators that have different numbers and types of operands. When
a query is executed, the system determines the operator to call from the number and types of the
provided operands.
Here is an example of creating an operator for adding two complex numbers. We assume we've already
```
created the definition of type complex (see Section 36.13). First we need a function that does the
```
work, then we can define the operator:
```
CREATE FUNCTION complex_add(complex, complex)
```
RETURNS complex
AS 'filename', 'complex_add'
```
LANGUAGE C IMMUTABLE STRICT;
```
```
CREATE OPERATOR + (
```
```
leftarg = complex,
```
```
rightarg = complex,
```
```
function = complex_add,
```
```
commutator = +
```
```
);
```
Now we could execute a query like this:
```
SELECT (a + b) AS c FROM test_complex;
```
c
1303
Extending SQL
-----------------
```
(5.2,6.05)
```
```
(133.42,144.95)
```
We've shown how to create a binary operator here. To create a prefix operator, just omit the leftarg.
The function clause and the argument clauses are the only required items in CREATE OPERATOR.
The commutator clause shown in the example is an optional hint to the query optimizer. Further
details about commutator and other optimizer hints appear in the next section.
36.15. Operator Optimization Information
A PostgreSQL operator definition can include several optional clauses that tell the system useful things
about how the operator behaves. These clauses should be provided whenever appropriate, because they
can make for considerable speedups in execution of queries that use the operator. But if you provide
them, you must be sure that they are right! Incorrect use of an optimization clause can result in slow
queries, subtly wrong output, or other Bad Things. You can always leave out an optimization clause
```
if you are not sure about it; the only consequence is that queries might run slower than they need to.
```
Additional optimization clauses might be added in future versions of PostgreSQL. The ones described
here are all the ones that release 18.1 understands.
It is also possible to attach a planner support function to the function that underlies an operator, pro-
viding another way of telling the system about the behavior of the operator. See Section 36.11 for
more information.
36.15.1. COMMUTATOR
The COMMUTATOR clause, if provided, names an operator that is the commutator of the operator being
```
defined. We say that operator A is the commutator of operator B if (x A y) equals (y B x) for all
```
possible input values x, y. Notice that B is also the commutator of A. For example, operators < and >
for a particular data type are usually each others' commutators, and operator + is usually commutative
with itself. But operator - is usually not commutative with anything.
The left operand type of a commutable operator is the same as the right operand type of its commutator,
and vice versa. So the name of the commutator operator is all that PostgreSQL needs to be given to
look up the commutator, and that's all that needs to be provided in the COMMUTATOR clause.
It's critical to provide commutator information for operators that will be used in indexes and join
clauses, because this allows the query optimizer to “flip around” such a clause to the forms needed for
different plan types. For example, consider a query with a WHERE clause like tab1.x = tab2.y,
where tab1.x and tab2.y are of a user-defined type, and suppose that tab2.y is indexed. The
optimizer cannot generate an index scan unless it can determine how to flip the clause around to
tab2.y = tab1.x, because the index-scan machinery expects to see the indexed column on the
left of the operator it is given. PostgreSQL will not simply assume that this is a valid transformation
— the creator of the = operator must specify that it is valid, by marking the operator with commutator
information.
36.15.2. NEGATOR
The NEGATOR clause, if provided, names an operator that is the negator of the operator being defined.
```
We say that operator A is the negator of operator B if both return Boolean results and (x A y) equals
```
```
NOT (x B y) for all possible inputs x, y. Notice that B is also the negator of A. For example, < and
```
>= are a negator pair for most data types. An operator can never validly be its own negator.
```
Unlike commutators, a pair of unary operators could validly be marked as each other's negators; that
```
```
would mean (A x) equals NOT (B x) for all x.
```
1304
Extending SQL
An operator's negator must have the same left and/or right operand types as the operator to be defined,
so just as with COMMUTATOR, only the operator name need be given in the NEGATOR clause.
```
Providing a negator is very helpful to the query optimizer since it allows expressions like NOT (x
```
```
= y) to be simplified into x <> y. This comes up more often than you might think, because NOT
```
operations can be inserted as a consequence of other rearrangements.
36.15.3. RESTRICT
The RESTRICT clause, if provided, names a restriction selectivity estimation function for the operator.
```
(Note that this is a function name, not an operator name.) RESTRICT clauses only make sense for
```
binary operators that return boolean. The idea behind a restriction selectivity estimator is to guess
what fraction of the rows in a table will satisfy a WHERE-clause condition of the form:
column OP constant
for the current operator and a particular constant value. This assists the optimizer by giving it some
```
idea of how many rows will be eliminated by WHERE clauses that have this form. (What happens if
```
the constant is on the left, you might be wondering? Well, that's one of the things that COMMUTATOR
```
is for...)
```
Writing new restriction selectivity estimation functions is far beyond the scope of this chapter, but
fortunately you can usually just use one of the system's standard estimators for many of your own
operators. These are the standard restriction estimators:
eqsel for =
neqsel for <>
scalarltsel for <
scalarlesel for <=
scalargtsel for >
scalargesel for >=
You can frequently get away with using either eqsel or neqsel for operators that have very high
or very low selectivity, even if they aren't really equality or inequality. For example, the approxi-
mate-equality geometric operators use eqsel on the assumption that they'll usually only match a
small fraction of the entries in a table.
You can use scalarltsel, scalarlesel, scalargtsel and scalargesel for compar-
isons on data types that have some sensible means of being converted into numeric scalars for range
comparisons. If possible, add the data type to those understood by the function convert_to_s-
```
calar() in src/backend/utils/adt/selfuncs.c. (Eventually, this function should be
```
```
replaced by per-data-type functions identified through a column of the pg_type system catalog; but
```
```
that hasn't happened yet.) If you do not do this, things will still work, but the optimizer's estimates
```
won't be as good as they could be.
Another useful built-in selectivity estimation function is matchingsel, which will work for almost
```
any binary operator, if standard MCV and/or histogram statistics are collected for the input data type(s).
```
Its default estimate is set to twice the default estimate used in eqsel, making it most suitable for
```
comparison operators that are somewhat less strict than equality. (Or you could call the underlying
```
```
generic_restriction_selectivity function, providing a different default estimate.)
```
There are additional selectivity estimation functions designed for geometric operators in src/back-
end/utils/adt/geo_selfuncs.c: areasel, positionsel, and contsel. At this writ-
```
ing these are just stubs, but you might want to use them (or even better, improve them) anyway.
```
36.15.4. JOIN
```
The JOIN clause, if provided, names a join selectivity estimation function for the operator. (Note that
```
```
this is a function name, not an operator name.) JOIN clauses only make sense for binary operators
```
1305
Extending SQL
that return boolean. The idea behind a join selectivity estimator is to guess what fraction of the rows
in a pair of tables will satisfy a WHERE-clause condition of the form:
table1.column1 OP table2.column2
for the current operator. As with the RESTRICT clause, this helps the optimizer very substantially by
letting it figure out which of several possible join sequences is likely to take the least work.
As before, this chapter will make no attempt to explain how to write a join selectivity estimator func-
tion, but will just suggest that you use one of the standard estimators if one is applicable:
eqjoinsel for =
neqjoinsel for <>
scalarltjoinsel for <
scalarlejoinsel for <=
scalargtjoinsel for >
scalargejoinsel for >=
matchingjoinsel for generic matching operators
areajoinsel for 2D area-based comparisons
positionjoinsel for 2D position-based comparisons
contjoinsel for 2D containment-based comparisons
36.15.5. HASHES
The HASHES clause, if present, tells the system that it is permissible to use the hash join method for
a join based on this operator. HASHES only makes sense for a binary operator that returns boolean,
and in practice the operator must represent equality for some data type or pair of data types.
The assumption underlying hash join is that the join operator can only return true for pairs of left and
right values that hash to the same hash code. If two values get put in different hash buckets, the join
will never compare them at all, implicitly assuming that the result of the join operator must be false.
So it never makes sense to specify HASHES for operators that do not represent some form of equality.
In most cases it is only practical to support hashing for operators that take the same data type on both
sides. However, sometimes it is possible to design compatible hash functions for two or more data
```
types; that is, functions that will generate the same hash codes for “equal” values, even though the
```
values have different representations. For example, it's fairly simple to arrange this property when
hashing integers of different widths.
To be marked HASHES, the join operator must appear in a hash index operator family. This is not
enforced when you create the operator, since of course the referencing operator family couldn't exist
yet. But attempts to use the operator in hash joins will fail at run time if no such operator family exists.
```
The system needs the operator family to find the data-type-specific hash function(s) for the operator's
```
```
input data type(s). Of course, you must also create suitable hash functions before you can create the
```
operator family.
Care should be exercised when preparing a hash function, because there are machine-dependent ways
in which it might fail to do the right thing. For example, if your data type is a structure in which there
```
might be uninteresting pad bits, you cannot simply pass the whole structure to hash_any. (Unless
```
you write your other operators and functions to ensure that the unused bits are always zero, which is
```
the recommended strategy.) Another example is that on machines that meet the IEEE floating-point
```
```
standard, negative zero and positive zero are different values (different bit patterns) but they are de-
```
fined to compare equal. If a float value might contain negative zero then extra steps are needed to
ensure it generates the same hash value as positive zero.
```
A hash-joinable operator must have a commutator (itself if the two operand data types are the same, or
```
```
a related equality operator if they are different) that appears in the same operator family. If this is not
```
```
the case, planner errors might occur when the operator is used. Also, it is a good idea (but not strictly
```
1306
Extending SQL
```
required) for a hash operator family that supports multiple data types to provide equality operators for
```
```
every combination of the data types; this allows better optimization.
```
Note
The function underlying a hash-joinable operator must be marked immutable or stable. If it is
volatile, the system will never attempt to use the operator for a hash join.
Note
If a hash-joinable operator has an underlying function that is marked strict, the function must
also be complete: that is, it should return true or false, never null, for any two nonnull inputs.
If this rule is not followed, hash-optimization of IN operations might generate wrong results.
```
(Specifically, IN might return false where the correct answer according to the standard would
```
```
be null; or it might yield an error complaining that it wasn't prepared for a null result.)
```
36.15.6. MERGES
The MERGES clause, if present, tells the system that it is permissible to use the merge-join method for
a join based on this operator. MERGES only makes sense for a binary operator that returns boolean,
and in practice the operator must represent equality for some data type or pair of data types.
Merge join is based on the idea of sorting the left- and right-hand tables into order and then scanning
them in parallel. So, both data types must be capable of being fully ordered, and the join operator
must be one that can only succeed for pairs of values that fall at the “same place” in the sort order.
In practice this means that the join operator must behave like equality. But it is possible to merge-
join two distinct data types so long as they are logically compatible. For example, the smallint-
versus-integer equality operator is merge-joinable. We only need sorting operators that will bring
both data types into a logically compatible sequence.
To be marked MERGES, the join operator must appear as an equality member of a btree index
operator family. This is not enforced when you create the operator, since of course the referencing
operator family couldn't exist yet. But the operator will not actually be used for merge joins unless a
matching operator family can be found. The MERGES flag thus acts as a hint to the planner that it's
worth looking for a matching operator family.
```
A merge-joinable operator must have a commutator (itself if the two operand data types are the same,
```
```
or a related equality operator if they are different) that appears in the same operator family. If this is
```
```
not the case, planner errors might occur when the operator is used. Also, it is a good idea (but not
```
```
strictly required) for a btree operator family that supports multiple data types to provide equality
```
```
operators for every combination of the data types; this allows better optimization.
```
Note
The function underlying a merge-joinable operator must be marked immutable or stable. If it
is volatile, the system will never attempt to use the operator for a merge join.
36.16. Interfacing Extensions to Indexes
The procedures described thus far let you define new types, new functions, and new operators. How-
ever, we cannot yet define an index on a column of a new data type. To do this, we must define an
operator class for the new data type. Later in this section, we will illustrate this concept in an example:
1307
Extending SQL
a new operator class for the B-tree index method that stores and sorts complex numbers in ascending
absolute value order.
Operator classes can be grouped into operator families to show the relationships between semantically
compatible classes. When only a single data type is involved, an operator class is sufficient, so we'll
focus on that case first and then return to operator families.
36.16.1. Index Methods and Operator Classes
Operator classes are associated with an index access method, such as B-Tree or GIN. Custom index
access method may be defined with CREATE ACCESS METHOD. See Chapter 63 for details.
The routines for an index method do not directly know anything about the data types that the index
method will operate on. Instead, an operator class identifies the set of operations that the index method
needs to use to work with a particular data type. Operator classes are so called because one thing they
```
specify is the set of WHERE-clause operators that can be used with an index (i.e., can be converted
```
```
into an index-scan qualification). An operator class can also specify some support function that are
```
needed by the internal operations of the index method, but do not directly correspond to any WHERE-
clause operator that can be used with the index.
It is possible to define multiple operator classes for the same data type and index method. By doing
this, multiple sets of indexing semantics can be defined for a single data type. For example, a B-tree
index requires a sort ordering to be defined for each data type it works on. It might be useful for a
complex-number data type to have one B-tree operator class that sorts the data by complex absolute
value, another that sorts by real part, and so on. Typically, one of the operator classes will be deemed
most commonly useful and will be marked as the default operator class for that data type and index
method.
```
The same operator class name can be used for several different index methods (for example, both
```
```
B-tree and hash index methods have operator classes named int4_ops), but each such class is an
```
independent entity and must be defined separately.
36.16.2. Index Method Strategies
The operators associated with an operator class are identified by “strategy numbers”, which serve to
identify the semantics of each operator within the context of its operator class. For example, B-trees
impose a strict ordering on keys, lesser to greater, and so operators like “less than” and “greater than
or equal to” are interesting with respect to a B-tree. Because PostgreSQL allows the user to define
```
operators, PostgreSQL cannot look at the name of an operator (e.g., < or >=) and tell what kind of
```
comparison it is. Instead, the index method defines a set of “strategies”, which can be thought of as
generalized operators. Each operator class specifies which actual operator corresponds to each strategy
for a particular data type and interpretation of the index semantics.
The B-tree index method defines five strategies, shown in Table 36.3.
Table 36.3. B-Tree Strategies
Operation Strategy Number
less than 1
less than or equal 2
equal 3
greater than or equal 4
greater than 5
Hash indexes support only equality comparisons, and so they use only one strategy, shown in Ta-
ble 36.4.
1308
Extending SQL
Table 36.4. Hash Strategies
Operation Strategy Number
equal 1
GiST indexes are more flexible: they do not have a fixed set of strategies at all. Instead, the “consis-
tency” support routine of each particular GiST operator class interprets the strategy numbers however
it likes. As an example, several of the built-in GiST index operator classes index two-dimensional
geometric objects, providing the “R-tree” strategies shown in Table 36.5. Four of these are true two-
```
dimensional tests (overlaps, same, contains, contained by); four of them consider only the X direction;
```
and the other four provide the same tests in the Y direction.
Table 36.5. GiST Two-Dimensional “R-tree” Strategies
Operation Strategy Number
strictly left of 1
does not extend to right of 2
overlaps 3
does not extend to left of 4
strictly right of 5
same 6
contains 7
contained by 8
does not extend above 9
strictly below 10
strictly above 11
does not extend below 12
SP-GiST indexes are similar to GiST indexes in flexibility: they don't have a fixed set of strategies.
Instead the support routines of each operator class interpret the strategy numbers according to the
operator class's definition. As an example, the strategy numbers used by the built-in operator classes
for points are shown in Table 36.6.
Table 36.6. SP-GiST Point Strategies
Operation Strategy Number
strictly left of 1
strictly right of 5
same 6
contained by 8
strictly below 10
strictly above 11
GIN indexes are similar to GiST and SP-GiST indexes, in that they don't have a fixed set of strategies
either. Instead the support routines of each operator class interpret the strategy numbers according to
the operator class's definition. As an example, the strategy numbers used by the built-in operator class
for arrays are shown in Table 36.7.
Table 36.7. GIN Array Strategies
Operation Strategy Number
overlap 1
1309
Extending SQL
Operation Strategy Number
contains 2
is contained by 3
equal 4
BRIN indexes are similar to GiST, SP-GiST and GIN indexes in that they don't have a fixed set of
strategies either. Instead the support routines of each operator class interpret the strategy numbers
according to the operator class's definition. As an example, the strategy numbers used by the built-in
Minmax operator classes are shown in Table 36.8.
Table 36.8. BRIN Minmax Strategies
Operation Strategy Number
less than 1
less than or equal 2
equal 3
greater than or equal 4
greater than 5
Notice that all the operators listed above return Boolean values. In practice, all operators defined as
index method search operators must return type boolean, since they must appear at the top level of a
```
WHERE clause to be used with an index. (Some index access methods also support ordering operators,
```
```
which typically don't return Boolean values; that feature is discussed in Section 36.16.7.)
```
36.16.3. Index Method Support Routines
Strategies aren't usually enough information for the system to figure out how to use an index. In
practice, the index methods require additional support routines in order to work. For example, the B-
tree index method must be able to compare two keys and determine whether one is greater than, equal
to, or less than the other. Similarly, the hash index method must be able to compute hash codes for
```
key values. These operations do not correspond to operators used in qualifications in SQL commands;
```
they are administrative routines used by the index methods, internally.
Just as with strategies, the operator class identifies which specific functions should play each of these
roles for a given data type and semantic interpretation. The index method defines the set of functions
it needs, and the operator class identifies the correct functions to use by assigning them to the “support
```
function numbers” specified by the index method.
```
Additionally, some opclasses allow users to specify parameters which control their behavior. Each
builtin index access method has an optional options support function, which defines a set of op-
class-specific parameters.
B-trees require a comparison support function, and allow four additional support functions to be sup-
plied at the operator class author's option, as shown in Table 36.9. The requirements for these support
functions are explained further in Section 65.1.3.
Table 36.9. B-Tree Support Functions
Function Support Number
Compare two keys and return an integer less than zero, zero, or greater
than zero, indicating whether the first key is less than, equal to, or greater
than the second
1
```
Return the addresses of C-callable sort support function(s) (optional) 2
```
Compare a test value to a base value plus/minus an offset, and return true
```
or false according to the comparison result (optional)
```
3
1310
Extending SQL
Function Support Number
Determine if it is safe for indexes that use the operator class to apply the
```
btree deduplication optimization (optional)
```
4
```
Define options that are specific to this operator class (optional) 5
```
```
Return the addresses of C-callable skip support function(s) (optional) 6
```
Hash indexes require one support function, and allow two additional ones to be supplied at the operator
class author's option, as shown in Table 36.10.
Table 36.10. Hash Support Functions
Function Support Number
Compute the 32-bit hash value for a key 1
```
Compute the 64-bit hash value for a key given a 64-bit salt; if the salt is
```
0, the low 32 bits of the result must match the value that would have been
```
computed by function 1 (optional)
```
2
```
Define options that are specific to this operator class (optional) 3
```
GiST indexes have twelve support functions, seven of which are optional, as shown in Table 36.11.
```
(For more information see Section 65.2.)
```
Table 36.11. GiST Support Functions
Function Description Support Num-
ber
consistent determine whether key satisfies the query quali-
fier
1
union compute union of a set of keys 2
compress compute a compressed representation of a key or
```
value to be indexed (optional)
```
3
decompress compute a decompressed representation of a
```
compressed key (optional)
```
4
penalty compute penalty for inserting new key into sub-
tree with given subtree's key
5
picksplit determine which entries of a page are to be
moved to the new page and compute the union
keys for resulting pages
6
same compare two keys and return true if they are
equal
7
```
distance determine distance from key to query value (op-
```
```
tional)
```
8
fetch compute original representation of a compressed
```
key for index-only scans (optional)
```
9
options define options that are specific to this operator
```
class (optional)
```
10
sortsupport provide a sort comparator to be used in fast in-
```
dex builds (optional)
```
11
translate_cmptype translate compare types to strategy numbers used
```
by the operator class (optional)
```
12
```
SP-GiST indexes have six support functions, one of which is optional, as shown in Table 36.12. (For
```
```
more information see Section 65.3.)
```
1311
Extending SQL
Table 36.12. SP-GiST Support Functions
Function Description Support Num-
ber
config provide basic information about the operator
class
1
choose determine how to insert a new value into an in-
ner tuple
2
picksplit determine how to partition a set of values 3
inner_consistent determine which sub-partitions need to be
searched for a query
4
leaf_consistent determine whether key satisfies the query quali-
fier
5
options define options that are specific to this operator
```
class (optional)
```
6
```
GIN indexes have seven support functions, four of which are optional, as shown in Table 36.13. (For
```
```
more information see Section 65.4.)
```
Table 36.13. GIN Support Functions
Function Description Support Num-
ber
compare compare two keys and return an integer less
than zero, zero, or greater than zero, indicating
whether the first key is less than, equal to, or
greater than the second
1
extractValue extract keys from a value to be indexed 2
extractQuery extract keys from a query condition 3
consistent determine whether value matches query condi-
```
tion (Boolean variant) (optional if support func-
```
```
tion 6 is present)
```
4
comparePartial compare partial key from query and key from
index, and return an integer less than zero, ze-
ro, or greater than zero, indicating whether GIN
should ignore this index entry, treat the entry as
```
a match, or stop the index scan (optional)
```
5
triConsistent determine whether value matches query condi-
```
tion (ternary variant) (optional if support func-
```
```
tion 4 is present)
```
6
options define options that are specific to this operator
```
class (optional)
```
7
BRIN indexes have five basic support functions, one of which is optional, as shown in Table 36.14.
```
Some versions of the basic functions require additional support functions to be provided. (For more
```
```
information see Section 65.5.3.)
```
Table 36.14. BRIN Support Functions
Function Description Support Num-
ber
opcInfo return internal information describing the in-
dexed columns' summary data
1
1312
Extending SQL
Function Description Support Num-
ber
add_value add a new value to an existing summary index
tuple
2
consistent determine whether value matches query condi-
tion
3
union compute union of two summary tuples 4
options define options that are specific to this operator
```
class (optional)
```
5
Unlike search operators, support functions return whichever data type the particular index method
```
expects; for example in the case of the comparison function for B-trees, a signed integer. The number
```
and types of the arguments to each support function are likewise dependent on the index method. For
B-tree and hash the comparison and hashing support functions take the same input data types as do
the operators included in the operator class, but this is not the case for most GiST, SP-GiST, GIN,
and BRIN support functions.
36.16.4. An Example
Now that we have seen the ideas, here is the promised example of creating a new operator class.
```
(You can find a working copy of this example in src/tutorial/complex.c and src/tuto-
```
```
rial/complex.sql in the source distribution.) The operator class encapsulates operators that sort
```
complex numbers in absolute value order, so we choose the name complex_abs_ops. First, we
need a set of operators. The procedure for defining operators was discussed in Section 36.14. For an
operator class on B-trees, the operators we require are:
```
• absolute-value less-than (strategy 1)
```
```
• absolute-value less-than-or-equal (strategy 2)
```
```
• absolute-value equal (strategy 3)
```
```
• absolute-value greater-than-or-equal (strategy 4)
```
```
• absolute-value greater-than (strategy 5)
```
The least error-prone way to define a related set of comparison operators is to write the B-tree com-
parison support function first, and then write the other functions as one-line wrappers around the sup-
port function. This reduces the odds of getting inconsistent results for corner cases. Following this
approach, we first write:
```
#define Mag(c) ((c)->x*(c)->x + (c)->y*(c)->y)
```
static int
```
complex_abs_cmp_internal(Complex *a, Complex *b)
```
```
{
```
```
double amag = Mag(a),
```
```
bmag = Mag(b);
```
```
if (amag < bmag)
```
```
return -1;
```
```
if (amag > bmag)
```
```
return 1;
```
```
return 0;
```
```
}
```
Now the less-than function looks like:
1313
Extending SQL
```
PG_FUNCTION_INFO_V1(complex_abs_lt);
```
Datum
```
complex_abs_lt(PG_FUNCTION_ARGS)
```
```
{
```
```
Complex *a = (Complex *) PG_GETARG_POINTER(0);
```
```
Complex *b = (Complex *) PG_GETARG_POINTER(1);
```
```
PG_RETURN_BOOL(complex_abs_cmp_internal(a, b) < 0);
```
```
}
```
The other four functions differ only in how they compare the internal function's result to zero.
Next we declare the functions and the operators based on the functions to SQL:
```
CREATE FUNCTION complex_abs_lt(complex, complex) RETURNS bool
```
AS 'filename', 'complex_abs_lt'
```
LANGUAGE C IMMUTABLE STRICT;
```
```
CREATE OPERATOR < (
```
```
leftarg = complex, rightarg = complex, procedure =
```
complex_abs_lt,
```
commutator = > , negator = >= ,
```
```
restrict = scalarltsel, join = scalarltjoinsel
```
```
);
```
It is important to specify the correct commutator and negator operators, as well as suitable restriction
and join selectivity functions, otherwise the optimizer will be unable to make effective use of the index.
Other things worth noting are happening here:
• There can only be one operator named, say, = and taking type complex for both operands. In this
case we don't have any other operator = for complex, but if we were building a practical data
```
type we'd probably want = to be the ordinary equality operation for complex numbers (and not
```
```
the equality of the absolute values). In that case, we'd need to use some other operator name for
```
complex_abs_eq.
• Although PostgreSQL can cope with functions having the same SQL name as long as they have
different argument data types, C can only cope with one global function having a given name. So
we shouldn't name the C function something simple like abs_eq. Usually it's a good practice to
include the data type name in the C function name, so as not to conflict with functions for other
data types.
• We could have made the SQL name of the function abs_eq, relying on PostgreSQL to distinguish
it by argument data types from any other SQL function of the same name. To keep the example
simple, we make the function have the same names at the C level and SQL level.
The next step is the registration of the support routine required by B-trees. The example C code that
implements this is in the same file that contains the operator functions. This is how we declare the
```
function:
```
```
CREATE FUNCTION complex_abs_cmp(complex, complex)
```
RETURNS integer
AS 'filename'
```
LANGUAGE C IMMUTABLE STRICT;
```
1314
Extending SQL
Now that we have the required operators and support routine, we can finally create the operator class:
CREATE OPERATOR CLASS complex_abs_ops
DEFAULT FOR TYPE complex USING btree AS
OPERATOR 1 < ,
OPERATOR 2 <= ,
OPERATOR 3 = ,
OPERATOR 4 >= ,
OPERATOR 5 > ,
```
FUNCTION 1 complex_abs_cmp(complex, complex);
```
And we're done! It should now be possible to create and use B-tree indexes on complex columns.
We could have written the operator entries more verbosely, as in:
```
OPERATOR 1 < (complex, complex) ,
```
but there is no need to do so when the operators take the same data type we are defining the operator
class for.
The above example assumes that you want to make this new operator class the default B-tree operator
class for the complex data type. If you don't, just leave out the word DEFAULT.
36.16.5. Operator Classes and Operator Families
So far we have implicitly assumed that an operator class deals with only one data type. While there
certainly can be only one data type in a particular index column, it is often useful to index operations
that compare an indexed column to a value of a different data type. Also, if there is use for a cross-
data-type operator in connection with an operator class, it is often the case that the other data type
has a related operator class of its own. It is helpful to make the connections between related classes
```
explicit, because this can aid the planner in optimizing SQL queries (particularly for B-tree operator
```
```
classes, since the planner contains a great deal of knowledge about how to work with them).
```
To handle these needs, PostgreSQL uses the concept of an operator family. An operator family contains
one or more operator classes, and can also contain indexable operators and corresponding support
functions that belong to the family as a whole but not to any single class within the family. We say
that such operators and functions are “loose” within the family, as opposed to being bound into a
specific class. Typically each operator class contains single-data-type operators while cross-data-type
operators are loose in the family.
All the operators and functions in an operator family must have compatible semantics, where the
compatibility requirements are set by the index method. You might therefore wonder why bother to
```
single out particular subsets of the family as operator classes; and indeed for many purposes the class
```
divisions are irrelevant and the family is the only interesting grouping. The reason for defining operator
classes is that they specify how much of the family is needed to support any particular index. If there
is an index using an operator class, then that operator class cannot be dropped without dropping the
index — but other parts of the operator family, namely other operator classes and loose operators,
could be dropped. Thus, an operator class should be specified to contain the minimum set of operators
and functions that are reasonably needed to work with an index on a specific data type, and then related
but non-essential operators can be added as loose members of the operator family.
As an example, PostgreSQL has a built-in B-tree operator family integer_ops, which includes
```
operator classes int8_ops, int4_ops, and int2_ops for indexes on bigint (int8), inte-
```
```
ger (int4), and smallint (int2) columns respectively. The family also contains cross-data-type
```
comparison operators allowing any two of these types to be compared, so that an index on one of these
1315
Extending SQL
types can be searched using a comparison value of another type. The family could be duplicated by
these definitions:
```
CREATE OPERATOR FAMILY integer_ops USING btree;
```
CREATE OPERATOR CLASS int8_ops
DEFAULT FOR TYPE int8 USING btree FAMILY integer_ops AS
-- standard int8 comparisons
OPERATOR 1 < ,
OPERATOR 2 <= ,
OPERATOR 3 = ,
OPERATOR 4 >= ,
OPERATOR 5 > ,
```
FUNCTION 1 btint8cmp(int8, int8) ,
```
```
FUNCTION 2 btint8sortsupport(internal) ,
```
```
FUNCTION 3 in_range(int8, int8, int8, boolean, boolean) ,
```
```
FUNCTION 4 btequalimage(oid) ,
```
```
FUNCTION 6 btint8skipsupport(internal) ;
```
CREATE OPERATOR CLASS int4_ops
DEFAULT FOR TYPE int4 USING btree FAMILY integer_ops AS
-- standard int4 comparisons
OPERATOR 1 < ,
OPERATOR 2 <= ,
OPERATOR 3 = ,
OPERATOR 4 >= ,
OPERATOR 5 > ,
```
FUNCTION 1 btint4cmp(int4, int4) ,
```
```
FUNCTION 2 btint4sortsupport(internal) ,
```
```
FUNCTION 3 in_range(int4, int4, int4, boolean, boolean) ,
```
```
FUNCTION 4 btequalimage(oid) ,
```
```
FUNCTION 6 btint4skipsupport(internal) ;
```
CREATE OPERATOR CLASS int2_ops
DEFAULT FOR TYPE int2 USING btree FAMILY integer_ops AS
-- standard int2 comparisons
OPERATOR 1 < ,
OPERATOR 2 <= ,
OPERATOR 3 = ,
OPERATOR 4 >= ,
OPERATOR 5 > ,
```
FUNCTION 1 btint2cmp(int2, int2) ,
```
```
FUNCTION 2 btint2sortsupport(internal) ,
```
```
FUNCTION 3 in_range(int2, int2, int2, boolean, boolean) ,
```
```
FUNCTION 4 btequalimage(oid) ,
```
```
FUNCTION 6 btint2skipsupport(internal) ;
```
ALTER OPERATOR FAMILY integer_ops USING btree ADD
-- cross-type comparisons int8 vs int2
```
OPERATOR 1 < (int8, int2) ,
```
```
OPERATOR 2 <= (int8, int2) ,
```
```
OPERATOR 3 = (int8, int2) ,
```
```
OPERATOR 4 >= (int8, int2) ,
```
```
OPERATOR 5 > (int8, int2) ,
```
```
FUNCTION 1 btint82cmp(int8, int2) ,
```
-- cross-type comparisons int8 vs int4
1316
Extending SQL
```
OPERATOR 1 < (int8, int4) ,
```
```
OPERATOR 2 <= (int8, int4) ,
```
```
OPERATOR 3 = (int8, int4) ,
```
```
OPERATOR 4 >= (int8, int4) ,
```
```
OPERATOR 5 > (int8, int4) ,
```
```
FUNCTION 1 btint84cmp(int8, int4) ,
```
-- cross-type comparisons int4 vs int2
```
OPERATOR 1 < (int4, int2) ,
```
```
OPERATOR 2 <= (int4, int2) ,
```
```
OPERATOR 3 = (int4, int2) ,
```
```
OPERATOR 4 >= (int4, int2) ,
```
```
OPERATOR 5 > (int4, int2) ,
```
```
FUNCTION 1 btint42cmp(int4, int2) ,
```
-- cross-type comparisons int4 vs int8
```
OPERATOR 1 < (int4, int8) ,
```
```
OPERATOR 2 <= (int4, int8) ,
```
```
OPERATOR 3 = (int4, int8) ,
```
```
OPERATOR 4 >= (int4, int8) ,
```
```
OPERATOR 5 > (int4, int8) ,
```
```
FUNCTION 1 btint48cmp(int4, int8) ,
```
-- cross-type comparisons int2 vs int8
```
OPERATOR 1 < (int2, int8) ,
```
```
OPERATOR 2 <= (int2, int8) ,
```
```
OPERATOR 3 = (int2, int8) ,
```
```
OPERATOR 4 >= (int2, int8) ,
```
```
OPERATOR 5 > (int2, int8) ,
```
```
FUNCTION 1 btint28cmp(int2, int8) ,
```
-- cross-type comparisons int2 vs int4
```
OPERATOR 1 < (int2, int4) ,
```
```
OPERATOR 2 <= (int2, int4) ,
```
```
OPERATOR 3 = (int2, int4) ,
```
```
OPERATOR 4 >= (int2, int4) ,
```
```
OPERATOR 5 > (int2, int4) ,
```
```
FUNCTION 1 btint24cmp(int2, int4) ,
```
-- cross-type in_range functions
```
FUNCTION 3 in_range(int4, int4, int8, boolean, boolean) ,
```
```
FUNCTION 3 in_range(int4, int4, int2, boolean, boolean) ,
```
```
FUNCTION 3 in_range(int2, int2, int8, boolean, boolean) ,
```
```
FUNCTION 3 in_range(int2, int2, int4, boolean, boolean) ;
```
Notice that this definition “overloads” the operator strategy and support function numbers: each num-
ber occurs multiple times within the family. This is allowed so long as each instance of a particular
number has distinct input data types. The instances that have both input types equal to an operator
class's input type are the primary operators and support functions for that operator class, and in most
cases should be declared as part of the operator class rather than as loose members of the family.
In a B-tree operator family, all the operators in the family must sort compatibly, as is specified in
detail in Section 65.1.2. For each operator in the family there must be a support function having the
same two input data types as the operator. It is recommended that a family be complete, i.e., for each
combination of data types, all operators are included. Each operator class should include just the non-
cross-type operators and support function for its data type.
1317
Extending SQL
To build a multiple-data-type hash operator family, compatible hash support functions must be created
for each data type supported by the family. Here compatibility means that the functions are guaranteed
to return the same hash code for any two values that are considered equal by the family's equality
operators, even when the values are of different types. This is usually difficult to accomplish when the
types have different physical representations, but it can be done in some cases. Furthermore, casting
a value from one data type represented in the operator family to another data type also represented
in the operator family via an implicit or binary coercion cast must not change the computed hash
value. Notice that there is only one support function per data type, not one per equality operator. It
is recommended that a family be complete, i.e., provide an equality operator for each combination
of data types. Each operator class should include just the non-cross-type equality operator and the
support function for its data type.
GiST, SP-GiST, and GIN indexes do not have any explicit notion of cross-data-type operations. The
set of operators supported is just whatever the primary support functions for a given operator class
can handle.
In BRIN, the requirements depends on the framework that provides the operator classes. For operator
classes based on minmax, the behavior required is the same as for B-tree operator families: all the
operators in the family must sort compatibly, and casts must not change the associated sort ordering.
Note
Prior to PostgreSQL 8.3, there was no concept of operator families, and so any cross-data-type
operators intended to be used with an index had to be bound directly into the index's operator
class. While this approach still works, it is deprecated because it makes an index's dependen-
cies too broad, and because the planner can handle cross-data-type comparisons more effec-
tively when both data types have operators in the same operator family.
36.16.6. System Dependencies on Operator Classes
PostgreSQL uses operator classes to infer the properties of operators in more ways than just whether
they can be used with indexes. Therefore, you might want to create operator classes even if you have
no intention of indexing any columns of your data type.
In particular, there are SQL features such as ORDER BY and DISTINCT that require comparison and
sorting of values. To implement these features on a user-defined data type, PostgreSQL looks for the
default B-tree operator class for the data type. The “equals” member of this operator class defines the
system's notion of equality of values for GROUP BY and DISTINCT, and the sort ordering imposed
by the operator class defines the default ORDER BY ordering.
If there is no default B-tree operator class for a data type, the system will look for a default hash
operator class. But since that kind of operator class only provides equality, it is only able to support
grouping not sorting.
When there is no default operator class for a data type, you will get errors like “could not identify an
ordering operator” if you try to use these SQL features with the data type.
Note
In PostgreSQL versions before 7.4, sorting and grouping operations would implicitly use op-
erators named =, <, and >. The new behavior of relying on default operator classes avoids
having to make any assumption about the behavior of operators with particular names.
Sorting by a non-default B-tree operator class is possible by specifying the class's less-than operator
in a USING option, for example
1318
Extending SQL
```
SELECT * FROM mytable ORDER BY somecol USING ~<~;
```
Alternatively, specifying the class's greater-than operator in USING selects a descending-order sort.
Comparison of arrays of a user-defined type also relies on the semantics defined by the type's default
B-tree operator class. If there is no default B-tree operator class, but there is a default hash operator
class, then array equality is supported, but not ordering comparisons.
Another SQL feature that requires even more data-type-specific knowledge is the RANGE offset
```
PRECEDING/FOLLOWING framing option for window functions (see Section 4.2.8). For a query such
```
as
```
SELECT sum(x) OVER (ORDER BY x RANGE BETWEEN 5 PRECEDING AND 10
```
```
FOLLOWING)
```
```
FROM mytable;
```
```
it is not sufficient to know how to order by x; the database must also understand how to “subtract
```
5” or “add 10” to the current row's value of x to identify the bounds of the current window frame.
Comparing the resulting bounds to other rows' values of x is possible using the comparison operators
provided by the B-tree operator class that defines the ORDER BY ordering — but addition and sub-
traction operators are not part of the operator class, so which ones should be used? Hard-wiring that
```
choice would be undesirable, because different sort orders (different B-tree operator classes) might
```
need different behavior. Therefore, a B-tree operator class can specify an in_range support function
that encapsulates the addition and subtraction behaviors that make sense for its sort order. It can even
provide more than one in_range support function, in case there is more than one data type that makes
sense to use as the offset in RANGE clauses. If the B-tree operator class associated with the window's
ORDER BY clause does not have a matching in_range support function, the RANGE offset PRE-
CEDING/FOLLOWING option is not supported.
Another important point is that an equality operator that appears in a hash operator family is a candidate
for hash joins, hash aggregation, and related optimizations. The hash operator family is essential here
```
since it identifies the hash function(s) to use.
```
36.16.7. Ordering Operators
```
Some index access methods (currently, only GiST and SP-GiST) support the concept of ordering op-
```
erators. What we have been discussing so far are search operators. A search operator is one for which
the index can be searched to find all rows satisfying WHERE indexed_column operator con-
stant. Note that nothing is promised about the order in which the matching rows will be returned.
In contrast, an ordering operator does not restrict the set of rows that can be returned, but instead
determines their order. An ordering operator is one for which the index can be scanned to return rows
in the order represented by ORDER BY indexed_column operator constant. The reason for
defining ordering operators that way is that it supports nearest-neighbor searches, if the operator is
one that measures distance. For example, a query like
```
SELECT * FROM places ORDER BY location <-> point '(101,456)' LIMIT
```
```
10;
```
finds the ten places closest to a given target point. A GiST index on the location column can do this
efficiently because <-> is an ordering operator.
While search operators have to return Boolean results, ordering operators usually return some other
type, such as float or numeric for distances. This type is normally not the same as the data type being
indexed. To avoid hard-wiring assumptions about the behavior of different data types, the definition of
1319
Extending SQL
an ordering operator is required to name a B-tree operator family that specifies the sort ordering of the
result data type. As was stated in the previous section, B-tree operator families define PostgreSQL's
notion of ordering, so this is a natural representation. Since the point <-> operator returns float8,
it could be specified in an operator class creation command like this:
```
OPERATOR 15 <-> (point, point) FOR ORDER BY float_ops
```
where float_ops is the built-in operator family that includes operations on float8. This decla-
ration states that the index is able to return rows in order of increasing values of the <-> operator.
36.16.8. Special Features of Operator Classes
There are two special features of operator classes that we have not discussed yet, mainly because they
are not useful with the most commonly used index methods.
```
Normally, declaring an operator as a member of an operator class (or family) means that the index
```
method can retrieve exactly the set of rows that satisfy a WHERE condition using the operator. For
```
example:
```
```
SELECT * FROM table WHERE integer_column < 4;
```
can be satisfied exactly by a B-tree index on the integer column. But there are cases where an index
is useful as an inexact guide to the matching rows. For example, if a GiST index stores only bound-
ing boxes for geometric objects, then it cannot exactly satisfy a WHERE condition that tests overlap
between nonrectangular objects such as polygons. Yet we could use the index to find objects whose
bounding box overlaps the bounding box of the target object, and then do the exact overlap test only on
the objects found by the index. If this scenario applies, the index is said to be “lossy” for the operator.
Lossy index searches are implemented by having the index method return a recheck flag when a row
might or might not really satisfy the query condition. The core system will then test the original query
condition on the retrieved row to see whether it should be returned as a valid match. This approach
works if the index is guaranteed to return all the required rows, plus perhaps some additional rows,
which can be eliminated by performing the original operator invocation. The index methods that sup-
```
port lossy searches (currently, GiST, SP-GiST and GIN) allow the support functions of individual
```
operator classes to set the recheck flag, and so this is essentially an operator-class feature.
Consider again the situation where we are storing in the index only the bounding box of a complex
object such as a polygon. In this case there's not much value in storing the whole polygon in the index
entry — we might as well store just a simpler object of type box. This situation is expressed by the
STORAGE option in CREATE OPERATOR CLASS: we'd write something like:
CREATE OPERATOR CLASS polygon_ops
DEFAULT FOR TYPE polygon USING gist AS
...
```
STORAGE box;
```
At present, only the GiST, SP-GiST, GIN and BRIN index methods support a STORAGE type that's
different from the column data type. The GiST compress and decompress support routines must
deal with data-type conversion when STORAGE is used. SP-GiST likewise requires a compress sup-
```
port function to convert to the storage type, when that is different; if an SP-GiST opclass also supports
```
retrieving data, the reverse conversion must be handled by the consistent function. In GIN, the
STORAGE type identifies the type of the “key” values, which normally is different from the type of the
indexed column — for example, an operator class for integer-array columns might have keys that are
just integers. The GIN extractValue and extractQuery support routines are responsible for
extracting keys from indexed values. BRIN is similar to GIN: the STORAGE type identifies the type of
1320
Extending SQL
the stored summary values, and operator classes' support procedures are responsible for interpreting
the summary values correctly.
36.17. Packaging Related Objects into an Ex-
tension
```
A useful extension to PostgreSQL typically includes multiple SQL objects; for example, a new data
```
type will require new functions, new operators, and probably new index operator classes. It is helpful
to collect all these objects into a single package to simplify database management. PostgreSQL calls
such a package an extension. To define an extension, you need at least a script file that contains the
SQL commands to create the extension's objects, and a control file that specifies a few basic properties
of the extension itself. If the extension includes C code, there will typically also be a shared library
file into which the C code has been built. Once you have these files, a simple CREATE EXTENSION
command loads the objects into your database.
The main advantage of using an extension, rather than just running the SQL script to load a bunch
of “loose” objects into your database, is that PostgreSQL will then understand that the objects of the
```
extension go together. You can drop all the objects with a single DROP EXTENSION command (no
```
```
need to maintain a separate “uninstall” script). Even more useful, pg_dump knows that it should not
```
dump the individual member objects of the extension — it will just include a CREATE EXTENSION
command in dumps, instead. This vastly simplifies migration to a new version of the extension that
might contain more or different objects than the old version. Note however that you must have the
extension's control, script, and other files available when loading such a dump into a new database.
PostgreSQL will not let you drop an individual object contained in an extension, except by dropping
```
the whole extension. Also, while you can change the definition of an extension member object (for
```
```
example, via CREATE OR REPLACE FUNCTION for a function), bear in mind that the modified
```
definition will not be dumped by pg_dump. Such a change is usually only sensible if you concurrently
```
make the same change in the extension's script file. (But there are special provisions for tables con-
```
```
taining configuration data; see Section 36.17.3.) In production situations, it's generally better to create
```
an extension update script to perform changes to extension member objects.
The extension script may set privileges on objects that are part of the extension, using GRANT and
```
REVOKE statements. The final set of privileges for each object (if any are set) will be stored in the
```
pg_init_privs system catalog. When pg_dump is used, the CREATE EXTENSION command
will be included in the dump, followed by the set of GRANT and REVOKE statements necessary to set
the privileges on the objects to what they were at the time the dump was taken.
PostgreSQL does not currently support extension scripts issuing CREATE POLICY or SECURITY
LABEL statements. These are expected to be set after the extension has been created. All RLS policies
and security labels on extension objects will be included in dumps created by pg_dump.
The extension mechanism also has provisions for packaging modification scripts that adjust the de-
finitions of the SQL objects contained in an extension. For example, if version 1.1 of an extension
adds one function and changes the body of another function compared to 1.0, the extension author
can provide an update script that makes just those two changes. The ALTER EXTENSION UPDATE
command can then be used to apply these changes and track which version of the extension is actually
installed in a given database.
The kinds of SQL objects that can be members of an extension are shown in the description of AL-
TER EXTENSION. Notably, objects that are database-cluster-wide, such as databases, roles, and ta-
```
blespaces, cannot be extension members since an extension is only known within one database. (Al-
```
though an extension script is not prohibited from creating such objects, if it does so they will not be
```
tracked as part of the extension.) Also notice that while a table can be a member of an extension, its
```
subsidiary objects such as indexes are not directly considered members of the extension. Another im-
portant point is that schemas can belong to extensions, but not vice versa: an extension as such has an
unqualified name and does not exist “within” any schema. The extension's member objects, however,
1321
Extending SQL
will belong to schemas whenever appropriate for their object types. It may or may not be appropriate
```
for an extension to own the schema(s) its member objects are within.
```
```
If an extension's script creates any temporary objects (such as temp tables), those objects are treated as
```
extension members for the remainder of the current session, but are automatically dropped at session
end, as any temporary object would be. This is an exception to the rule that extension member objects
cannot be dropped without dropping the whole extension.
36.17.1. Extension Files
The CREATE EXTENSION command relies on a control file for each extension, which must be
named the same as the extension with a suffix of .control, and must be placed in the installation's
SHAREDIR/extension directory. There must also be at least one SQL script file, which follows
```
the naming pattern extension--version.sql (for example, foo--1.0.sql for version 1.0
```
```
of extension foo). By default, the script file(s) are also placed in the SHAREDIR/extension di-
```
```
rectory; but the control file can specify a different directory for the script file(s).
```
Additional locations for extension control files can be configured using the parameter extension_con-
trol_path.
The file format for an extension control file is the same as for the postgresql.conf file, namely a
list of parameter_name = value assignments, one per line. Blank lines and comments introduced
by # are allowed. Be sure to quote any value that is not a single word or number.
A control file can set the following parameters:
```
directory (string)
```
```
The directory containing the extension's SQL script file(s). Unless an absolute path is given, the
```
name is relative to the directory where the control file was found. By default, the script files are
looked for in the same directory where the control file was found.
```
default_version (string)
```
```
The default version of the extension (the one that will be installed if no version is specified in
```
```
CREATE EXTENSION). Although this can be omitted, that will result in CREATE EXTENSION
```
failing if no VERSION option appears, so you generally don't want to do that.
```
comment (string)
```
```
A comment (any string) about the extension. The comment is applied when initially creating an
```
```
extension, but not during extension updates (since that might override user-added comments).
```
Alternatively, the extension's comment can be set by writing a COMMENT command in the script
file.
```
encoding (string)
```
```
The character set encoding used by the script file(s). This should be specified if the script files
```
contain any non-ASCII characters. Otherwise the files will be assumed to be in the database
encoding.
```
module_pathname (string)
```
The value of this parameter will be substituted for each occurrence of MODULE_PATHNAME in
```
the script file(s). If it is not set, no substitution is made. Typically, this is set to just shared_li-
```
brary_name and then MODULE_PATHNAME is used in CREATE FUNCTION commands for C-
language functions, so that the script files do not need to hard-wire the name of the shared library.
```
requires (string)
```
A list of names of extensions that this extension depends on, for example requires = 'foo,
bar'. Those extensions must be installed before this one can be installed.
1322
Extending SQL
```
no_relocate (string)
```
A list of names of extensions that this extension depends on that should be barred from changing
their schemas via ALTER EXTENSION ... SET SCHEMA. This is needed if this extension's
```
script references the name of a required extension's schema (using the @extschema:name@
```
```
syntax) in a way that cannot track renames.
```
```
superuser (boolean)
```
```
If this parameter is true (which is the default), only superusers can create the extension or update
```
```
it to a new version (but see also trusted, below). If it is set to false, just the privileges required
```
to execute the commands in the installation or update script are required. This should normally be
```
set to true if any of the script commands require superuser privileges. (Such commands would
```
```
fail anyway, but it's more user-friendly to give the error up front.)
```
```
trusted (boolean)
```
```
This parameter, if set to true (which is not the default), allows some non-superusers to install
```
an extension that has superuser set to true. Specifically, installation will be permitted for
anyone who has CREATE privilege on the current database. When the user executing CREATE
EXTENSION is not a superuser but is allowed to install by virtue of this parameter, then the
installation or update script is run as the bootstrap superuser, not as the calling user. This parameter
is irrelevant if superuser is false. Generally, this should not be set true for extensions that
could allow access to otherwise-superuser-only abilities, such as file system access. Also, marking
an extension trusted requires significant extra effort to write the extension's installation and update
```
script(s) securely; see Section 36.17.6.
```
```
relocatable (boolean)
```
An extension is relocatable if it is possible to move its contained objects into a different schema
after initial creation of the extension. The default is false, i.e., the extension is not relocatable.
See Section 36.17.2 for more information.
```
schema (string)
```
This parameter can only be set for non-relocatable extensions. It forces the extension to be loaded
into exactly the named schema and not any other. The schema parameter is consulted only when
initially creating an extension, not during extension updates. See Section 36.17.2 for more infor-
mation.
In addition to the primary control file extension.control, an extension can have secondary
control files named in the style extension--version.control. If supplied, these must be
located in the script file directory. Secondary control files follow the same format as the primary
control file. Any parameters set in a secondary control file override the primary control file when
installing or updating to that version of the extension. However, the parameters directory and
default_version cannot be set in a secondary control file.
An extension's SQL script files can contain any SQL commands, except for transaction control com-
```
mands (BEGIN, COMMIT, etc.) and commands that cannot be executed inside a transaction block
```
```
(such as VACUUM). This is because the script files are implicitly executed within a transaction block.
```
An extension's SQL script files can also contain lines beginning with \echo, which will be ignored
```
(treated as comments) by the extension mechanism. This provision is commonly used to throw an error
```
```
if the script file is fed to psql rather than being loaded via CREATE EXTENSION (see example script
```
```
in Section 36.17.7). Without that, users might accidentally load the extension's contents as “loose”
```
objects rather than as an extension, a state of affairs that's a bit tedious to recover from.
```
If the extension script contains the string @extowner@, that string is replaced with the (suitably
```
```
quoted) name of the user calling CREATE EXTENSION or ALTER EXTENSION. Typically this
```
1323
Extending SQL
feature is used by extensions that are marked trusted to assign ownership of selected objects to the
```
calling user rather than the bootstrap superuser. (One should be careful about doing so, however. For
```
example, assigning ownership of a C-language function to a non-superuser would create a privilege
```
escalation path for that user.)
```
While the script files can contain any characters allowed by the specified encoding, control files should
contain only plain ASCII, because there is no way for PostgreSQL to know what encoding a control
file is in. In practice this is only an issue if you want to use non-ASCII characters in the extension's
comment. Recommended practice in that case is to not use the control file comment parameter, but
instead use COMMENT ON EXTENSION within a script file to set the comment.
36.17.2. Extension Relocatability
Users often wish to load the objects contained in an extension into a different schema than the exten-
sion's author had in mind. There are three supported levels of relocatability:
• A fully relocatable extension can be moved into another schema at any time, even after it's been
loaded into a database. This is done with the ALTER EXTENSION SET SCHEMA command,
which automatically renames all the member objects into the new schema. Normally, this is only
possible if the extension contains no internal assumptions about what schema any of its objects are
```
in. Also, the extension's objects must all be in one schema to begin with (ignoring objects that do
```
```
not belong to any schema, such as procedural languages). Mark a fully relocatable extension by
```
setting relocatable = true in its control file.
• An extension might be relocatable during installation but not afterwards. This is typically the case
if the extension's script file needs to reference the target schema explicitly, for example in set-
ting search_path properties for SQL functions. For such an extension, set relocatable =
false in its control file, and use @extschema@ to refer to the target schema in the script file.
```
All occurrences of this string will be replaced by the actual target schema's name (double-quoted
```
```
if necessary) before the script is executed. The user can set the target schema using the SCHEMA
```
option of CREATE EXTENSION.
• If the extension does not support relocation at all, set relocatable = false in its control file,
and also set schema to the name of the intended target schema. This will prevent use of the SCHEMA
option of CREATE EXTENSION, unless it specifies the same schema named in the control file. This
choice is typically necessary if the extension contains internal assumptions about its schema name
that can't be replaced by uses of @extschema@. The @extschema@ substitution mechanism is
available in this case too, although it is of limited use since the schema name is determined by the
control file.
```
In all cases, the script file will be executed with search_path initially set to point to the target schema;
```
that is, CREATE EXTENSION does the equivalent of this:
```
SET LOCAL search_path TO @extschema@, pg_temp;
```
This allows the objects created by the script file to go into the target schema. The script file can
change search_path if it wishes, but that is generally undesirable. search_path is restored to
its previous setting upon completion of CREATE EXTENSION.
The target schema is determined by the schema parameter in the control file if that is given, other-
wise by the SCHEMA option of CREATE EXTENSION if that is given, otherwise the current default
```
object creation schema (the first one in the caller's search_path). When the control file schema
```
parameter is used, the target schema will be created if it doesn't already exist, but in the other two
cases it must already exist.
If any prerequisite extensions are listed in requires in the control file, their target schemas are added
to the initial setting of search_path, following the new extension's target schema. This allows their
objects to be visible to the new extension's script file.
1324
Extending SQL
For security, pg_temp is automatically appended to the end of search_path in all cases.
Although a non-relocatable extension can contain objects spread across multiple schemas, it is usually
desirable to place all the objects meant for external use into a single schema, which is considered
the extension's target schema. Such an arrangement works conveniently with the default setting of
search_path during creation of dependent extensions.
If an extension references objects belonging to another extension, it is recommended to schema-qualify
those references. To do that, write @extschema:name@ in the extension's script file, where name
```
is the name of the other extension (which must be listed in this extension's requires list). This
```
```
string will be replaced by the name (double-quoted if necessary) of that extension's target schema.
```
Although this notation avoids the need to make hard-wired assumptions about schema names in the
extension's script file, its use may embed the other extension's schema name into the installed objects
```
of this extension. (Typically, that happens when @extschema:name@ is used inside a string literal,
```
such as a function body or a search_path setting. In other cases, the object reference is reduced to
```
an OID during parsing and does not require subsequent lookups.) If the other extension's schema name
```
is so embedded, you should prevent the other extension from being relocated after yours is installed,
by adding the name of the other extension to this one's no_relocate list.
36.17.3. Extension Configuration Tables
Some extensions include configuration tables, which contain data that might be added or changed by
the user after installation of the extension. Ordinarily, if a table is part of an extension, neither the
table's definition nor its content will be dumped by pg_dump. But that behavior is undesirable for a
```
configuration table; any data changes made by the user need to be included in dumps, or the extension
```
will behave differently after a dump and restore.
To solve this problem, an extension's script file can mark a table or a sequence it has created as a con-
```
figuration relation, which will cause pg_dump to include the table's or the sequence's contents (not its
```
```
definition) in dumps. To do that, call the function pg_extension_config_dump(regclass,
```
```
text) after creating the table or the sequence, for example
```
```
CREATE TABLE my_config (key text, value text);
```
```
CREATE SEQUENCE my_config_seq;
```
```
SELECT pg_catalog.pg_extension_config_dump('my_config', '');
```
```
SELECT pg_catalog.pg_extension_config_dump('my_config_seq', '');
```
Any number of tables or sequences can be marked this way. Sequences associated with serial or
bigserial columns can be marked as well.
When the second argument of pg_extension_config_dump is an empty string, the entire con-
tents of the table are dumped by pg_dump. This is usually only correct if the table is initially empty as
created by the extension script. If there is a mixture of initial data and user-provided data in the table,
the second argument of pg_extension_config_dump provides a WHERE condition that selects
the data to be dumped. For example, you might do
```
CREATE TABLE my_config (key text, value text, standard_entry
```
```
boolean);
```
```
SELECT pg_catalog.pg_extension_config_dump('my_config', 'WHERE NOT
```
```
standard_entry');
```
and then make sure that standard_entry is true only in the rows created by the extension's script.
For sequences, the second argument of pg_extension_config_dump has no effect.
1325
Extending SQL
More complicated situations, such as initially-provided rows that might be modified by users, can
be handled by creating triggers on the configuration table to ensure that modified rows are marked
correctly.
You can alter the filter condition associated with a configuration table by calling pg_exten-
```
sion_config_dump again. (This would typically be useful in an extension update script.) The on-
```
ly way to mark a table as no longer a configuration table is to dissociate it from the extension with
ALTER EXTENSION ... DROP TABLE.
Note that foreign key relationships between these tables will dictate the order in which the tables
are dumped out by pg_dump. Specifically, pg_dump will attempt to dump the referenced-by table
before the referencing table. As the foreign key relationships are set up at CREATE EXTENSION
```
time (prior to data being loaded into the tables) circular dependencies are not supported. When circular
```
dependencies exist, the data will still be dumped out but the dump will not be able to be restored
directly and user intervention will be required.
Sequences associated with serial or bigserial columns need to be directly marked to dump
their state. Marking their parent relation is not enough for this purpose.
36.17.4. Extension Updates
One advantage of the extension mechanism is that it provides convenient ways to manage updates to
the SQL commands that define an extension's objects. This is done by associating a version name or
number with each released version of the extension's installation script. In addition, if you want users
to be able to update their databases dynamically from one version to the next, you should provide
update scripts that make the necessary changes to go from one version to the next. Update scripts
```
have names following the pattern extension--old_version--target_version.sql (for
```
example, foo--1.0--1.1.sql contains the commands to modify version 1.0 of extension foo
```
into version 1.1).
```
Given that a suitable update script is available, the command ALTER EXTENSION UPDATE will
update an installed extension to the specified new version. The update script is run in the same envi-
ronment that CREATE EXTENSION provides for installation scripts: in particular, search_path
is set up in the same way, and any new objects created by the script are automatically added to the
extension. Also, if the script chooses to drop extension member objects, they are automatically disso-
ciated from the extension.
If an extension has secondary control files, the control parameters that are used for an update script
```
are those associated with the script's target (new) version.
```
ALTER EXTENSION is able to execute sequences of update script files to achieve a requested update.
For example, if only foo--1.0--1.1.sql and foo--1.1--2.0.sql are available, ALTER
EXTENSION will apply them in sequence if an update to version 2.0 is requested when 1.0 is
currently installed.
PostgreSQL doesn't assume anything about the properties of version names: for example, it does not
know whether 1.1 follows 1.0. It just matches up the available version names and follows the path
```
that requires applying the fewest update scripts. (A version name can actually be any string that doesn't
```
```
contain -- or leading or trailing -.)
```
Sometimes it is useful to provide “downgrade” scripts, for example foo--1.1--1.0.sql to allow
reverting the changes associated with version 1.1. If you do that, be careful of the possibility that a
downgrade script might unexpectedly get applied because it yields a shorter path. The risky case is
where there is a “fast path” update script that jumps ahead several versions as well as a downgrade
script to the fast path's start point. It might take fewer steps to apply the downgrade and then the fast
path than to move ahead one version at a time. If the downgrade script drops any irreplaceable objects,
this will yield undesirable results.
To check for unexpected update paths, use this command:
1326
Extending SQL
```
SELECT * FROM pg_extension_update_paths('extension_name');
```
This shows each pair of distinct known version names for the specified extension, together with the
update path sequence that would be taken to get from the source version to the target version, or NULL
if there is no available update path. The path is shown in textual form with -- separators. You can
```
use regexp_split_to_array(path,'--') if you prefer an array format.
```
36.17.5. Installing Extensions Using Update Scripts
An extension that has been around for awhile will probably exist in several versions, for which
the author will need to write update scripts. For example, if you have released a foo exten-
sion in versions 1.0, 1.1, and 1.2, there should be update scripts foo--1.0--1.1.sql
and foo--1.1--1.2.sql. Before PostgreSQL 10, it was necessary to also create new script
files foo--1.1.sql and foo--1.2.sql that directly build the newer extension versions, or
else the newer versions could not be installed directly, only by installing 1.0 and then updat-
ing. That was tedious and duplicative, but now it's unnecessary, because CREATE EXTENSION
can follow update chains automatically. For example, if only the script files foo--1.0.sql,
foo--1.0--1.1.sql, and foo--1.1--1.2.sql are available then a request to install version
1.2 is honored by running those three scripts in sequence. The processing is the same as if you'd
```
first installed 1.0 and then updated to 1.2. (As with ALTER EXTENSION UPDATE, if multiple
```
```
pathways are available then the shortest is preferred.) Arranging an extension's script files in this style
```
can reduce the amount of maintenance effort needed to produce small updates.
```
If you use secondary (version-specific) control files with an extension maintained in this style, keep
```
in mind that each version needs a control file even if it has no stand-alone installation script, as
that control file will determine how the implicit update to that version is performed. For example, if
foo--1.0.control specifies requires = 'bar' but foo's other control files do not, the
extension's dependency on bar will be dropped when updating from 1.0 to another version.
36.17.6. Security Considerations for Extensions
Widely-distributed extensions should assume little about the database they occupy. Therefore, it's
appropriate to write functions provided by an extension in a secure style that cannot be compromised
by search-path-based attacks.
An extension that has the superuser property set to true must also consider security hazards for the
actions taken within its installation and update scripts. It is not terribly difficult for a malicious user
to create trojan-horse objects that will compromise later execution of a carelessly-written extension
script, allowing that user to acquire superuser privileges.
If an extension is marked trusted, then its installation schema can be selected by the installing user,
who might intentionally use an insecure schema in hopes of gaining superuser privileges. Therefore,
a trusted extension is extremely exposed from a security standpoint, and all its script commands must
be carefully examined to ensure that no compromise is possible.
Advice about writing functions securely is provided in Section 36.17.6.1 below, and advice about
writing installation scripts securely is provided in Section 36.17.6.2.
36.17.6.1. Security Considerations for Extension Functions
SQL-language and PL-language functions provided by extensions are at risk of search-path-based
attacks when they are executed, since parsing of these functions occurs at execution time not creation
time.
The CREATE FUNCTION reference page contains advice about writing SECURITY DEFINER
functions safely. It's good practice to apply those techniques for any function provided by an extension,
since the function might be called by a high-privilege user.
1327
Extending SQL
If you cannot set the search_path to contain only secure schemas, assume that each unqualified
name could resolve to an object that a malicious user has defined. Beware of constructs that depend
```
on search_path implicitly; for example, IN and CASE expression WHEN always select an
```
```
operator using the search path. In their place, use OPERATOR(schema.=) ANY and CASE WHEN
```
expression.
A general-purpose extension usually should not assume that it's been installed into a secure schema,
which means that even schema-qualified references to its own objects are not entirely risk-free. For
```
example, if the extension has defined a function myschema.myfunc(bigint) then a call such as
```
```
myschema.myfunc(42) could be captured by a hostile function myschema.myfunc(inte-
```
```
ger). Be careful that the data types of function and operator parameters exactly match the declared
```
argument types, using explicit casts where necessary.
36.17.6.2. Security Considerations for Extension Scripts
An extension installation or update script should be written to guard against search-path-based attacks
occurring when the script executes. If an object reference in the script can be made to resolve to some
other object than the script author intended, then a compromise might occur immediately, or later
when the mis-defined extension object is used.
DDL commands such as CREATE FUNCTION and CREATE OPERATOR CLASS are generally se-
cure, but beware of any command having a general-purpose expression as a component. For example,
CREATE VIEW needs to be vetted, as does a DEFAULT expression in CREATE FUNCTION.
Sometimes an extension script might need to execute general-purpose SQL, for example to make
catalog adjustments that aren't possible via DDL. Be careful to execute such commands with a secure
```
search_path; do not trust the path provided by CREATE/ALTER EXTENSION to be secure. Best
```
practice is to temporarily set search_path to pg_catalog, pg_temp and insert references to
```
the extension's installation schema explicitly where needed. (This practice might also be helpful for
```
```
creating views.) Examples can be found in the contrib modules in the PostgreSQL source code
```
distribution.
Secure cross-extension references typically require schema-qualification of the names of the other
extension's objects, using the @extschema:name@ syntax, in addition to careful matching of argu-
ment types for functions and operators.
36.17.7. Extension Example
Here is a complete example of an SQL-only extension, a two-element composite type that can store
any type of value in its slots, which are named “k” and “v”. Non-text values are automatically coerced
to text for storage.
The script file pair--1.0.sql looks like this:
-- complain if script is sourced in psql, rather than via CREATE
EXTENSION
\echo Use "CREATE EXTENSION pair" to load this file. \quit
```
CREATE TYPE pair AS ( k text, v text );
```
```
CREATE FUNCTION pair(text, text)
```
```
RETURNS pair LANGUAGE SQL AS 'SELECT ROW($1,
```
```
$2)::@extschema@.pair;';
```
```
CREATE OPERATOR ~> (LEFTARG = text, RIGHTARG = text, FUNCTION =
```
```
pair);
```
1328
Extending SQL
-- "SET search_path" is easy to get right, but qualified names
perform better.
```
CREATE FUNCTION lower(pair)
```
RETURNS pair LANGUAGE SQL
```
AS 'SELECT ROW(lower($1.k), lower($1.v))::@extschema@.pair;'
```
```
SET search_path = pg_temp;
```
```
CREATE FUNCTION pair_concat(pair, pair)
```
RETURNS pair LANGUAGE SQL
```
AS 'SELECT ROW($1.k OPERATOR(pg_catalog.||) $2.k,
```
```
$1.v OPERATOR(pg_catalog.||)
```
```
$2.v)::@extschema@.pair;';
```
The control file pair.control looks like this:
# pair extension
```
comment = 'A key/value pair data type'
```
```
default_version = '1.0'
```
# cannot be relocatable because of use of @extschema@
```
relocatable = false
```
While you hardly need a makefile to install these two files into the correct directory, you could use
a Makefile containing this:
```
EXTENSION = pair
```
```
DATA = pair--1.0.sql
```
```
PG_CONFIG = pg_config
```
```
PGXS := $(shell $(PG_CONFIG) --pgxs)
```
```
include $(PGXS)
```
This makefile relies on PGXS, which is described in Section 36.18. The command make install
will install the control and script files into the correct directory as reported by pg_config.
Once the files are installed, use the CREATE EXTENSION command to load the objects into any
particular database.
36.18. Extension Building Infrastructure
If you are thinking about distributing your PostgreSQL extension modules, setting up a portable build
system for them can be fairly difficult. Therefore the PostgreSQL installation provides a build infra-
structure for extensions, called PGXS, so that simple extension modules can be built simply against
an already installed server. PGXS is mainly intended for extensions that include C code, although it
can be used for pure-SQL extensions too. Note that PGXS is not intended to be a universal build sys-
```
tem framework that can be used to build any software interfacing to PostgreSQL; it simply automates
```
common build rules for simple server extension modules. For more complicated packages, you might
need to write your own build system.
To use the PGXS infrastructure for your extension, you must write a simple makefile. In the makefile,
you need to set some variables and include the global PGXS makefile. Here is an example that builds
an extension module named isbn_issn, consisting of a shared library containing some C code,
```
an extension control file, an SQL script, an include file (only needed if other modules might need to
```
```
access the extension functions without going via SQL), and a documentation text file:
```
```
MODULES = isbn_issn
```
1329
Extending SQL
```
EXTENSION = isbn_issn
```
```
DATA = isbn_issn--1.0.sql
```
```
DOCS = README.isbn_issn
```
```
HEADERS_isbn_issn = isbn_issn.h
```
```
PG_CONFIG = pg_config
```
```
PGXS := $(shell $(PG_CONFIG) --pgxs)
```
```
include $(PGXS)
```
The last three lines should always be the same. Earlier in the file, you assign variables or add custom
make rules.
Set one of these three variables to specify what is built:
MODULES
```
list of shared-library objects to be built from source files with same stem (do not include library
```
```
suffixes in this list)
```
MODULE_big
```
a shared library to build from multiple source files (list object files in OBJS)
```
PROGRAM
```
an executable program to build (list object files in OBJS)
```
The following variables can also be set:
EXTENSION
```
extension name(s); for each name you must provide an extension.control file, which will
```
be installed into prefix/share/extension
MODULEDIR
```
subdirectory of prefix/share into which DATA and DOCS files should be installed (if not
```
```
set, default is extension if EXTENSION is set, or contrib if not)
```
DATA
random files to install into prefix/share/$MODULEDIR
DATA_built
random files to install into prefix/share/$MODULEDIR, which need to be built first
DATA_TSEARCH
random files to install under prefix/share/tsearch_data
DOCS
random files to install under prefix/doc/$MODULEDIR
HEADERS
HEADERS_built
```
Files to (optionally build and) install under prefix/include/server/$MOD-
```
ULEDIR/$MODULE_big.
```
Unlike DATA_built, files in HEADERS_built are not removed by the clean target; if you
```
want them removed, also add them to EXTRA_CLEAN or add your own rules to do it.
1330
Extending SQL
HEADERS_$MODULE
HEADERS_built_$MODULE
```
Files to install (after building if specified) under prefix/include/server/$MOD-
```
ULEDIR/$MODULE, where $MODULE must be a module name used in MODULES or MOD-
ULE_big.
Unlike DATA_built, files in HEADERS_built_$MODULE are not removed by the clean
```
target; if you want them removed, also add them to EXTRA_CLEAN or add your own rules to do it.
```
It is legal to use both variables for the same module, or any combination, unless you have
two module names in the MODULES list that differ only by the presence of a prefix built_,
```
which would cause ambiguity. In that (hopefully unlikely) case, you should use only the HEAD-
```
ERS_built_$MODULE variables.
SCRIPTS
```
script files (not binaries) to install into prefix/bin
```
SCRIPTS_built
```
script files (not binaries) to install into prefix/bin, which need to be built first
```
REGRESS
```
list of regression test cases (without suffix), see below
```
REGRESS_OPTS
additional switches to pass to pg_regress
ISOLATION
list of isolation test cases, see below for more details
ISOLATION_OPTS
additional switches to pass to pg_isolation_regress
TAP_TESTS
switch defining if TAP tests need to be run, see below
NO_INSTALL
don't define an install target, useful for test modules that don't need their build products to
be installed
NO_INSTALLCHECK
don't define an installcheck target, useful e.g., if tests require special configuration, or don't
use pg_regress
EXTRA_CLEAN
extra files to remove in make clean
PG_CPPFLAGS
will be prepended to CPPFLAGS
PG_CFLAGS
will be appended to CFLAGS
1331
Extending SQL
PG_CXXFLAGS
will be appended to CXXFLAGS
PG_LDFLAGS
will be prepended to LDFLAGS
PG_LIBS
will be added to PROGRAM link line
SHLIB_LINK
will be added to MODULE_big link line
PG_CONFIG
```
path to pg_config program for the PostgreSQL installation to build against (typically just
```
```
pg_config to use the first one in your PATH)
```
Put this makefile as Makefile in the directory which holds your extension. Then you can do make
to compile, and then make install to install your module. By default, the extension is compiled
and installed for the PostgreSQL installation that corresponds to the first pg_config program found
in your PATH. You can use a different installation by setting PG_CONFIG to point to its pg_config
program, either within the makefile or on the make command line.
You can select a separate directory prefix in which to install your extension's files, by setting the make
variable prefix when executing make install like so:
make install prefix=/usr/local/postgresql
This will install the extension control and SQL files into /usr/local/postgresql/share and
the shared modules into /usr/local/postgresql/lib. If the prefix does not include the strings
postgres or pgsql, such as
make install prefix=/usr/local/extras
then postgresql will be appended to the directory names, installing the control and SQL files
into /usr/local/extras/share/postgresql/extension and the shared modules into /
usr/local/extras/lib/postgresql. Either way, you'll need to set extension_control_path
and dynamic_library_path to enable the PostgreSQL server to find the files:
```
extension_control_path = '/usr/local/extras/share/postgresql:
```
$system'
```
dynamic_library_path = '/usr/local/extras/lib/postgresql:$libdir'
```
You can also run make in a directory outside the source tree of your extension, if you want to keep
the build directory separate. This procedure is also called a VPATH build. Here's how:
mkdir build_dir
cd build_dir
make -f /path/to/extension/source/tree/Makefile
make -f /path/to/extension/source/tree/Makefile install
Alternatively, you can set up a directory for a VPATH build in a similar way to how it is done for the
core code. One way to do this is using the core script config/prep_buildtree. Once this has
been done you can build by setting the make variable VPATH like this:
1332
Extending SQL
make VPATH=/path/to/extension/source/tree
make VPATH=/path/to/extension/source/tree install
This procedure can work with a greater variety of directory layouts.
The scripts listed in the REGRESS variable are used for regression testing of your module, which can
be invoked by make installcheck after doing make install. For this to work you must
have a running PostgreSQL server. The script files listed in REGRESS must appear in a subdirectory
named sql/ in your extension's directory. These files must have extension .sql, which must not
be included in the REGRESS list in the makefile. For each test there should also be a file containing
the expected output in a subdirectory named expected/, with the same stem and extension .out.
make installcheck executes each test script with psql, and compares the resulting output to the
matching expected file. Any differences will be written to the file regression.diffs in diff
-c format. Note that trying to run a test that is missing its expected file will be reported as “trouble”,
so make sure you have all expected files.
The scripts listed in the ISOLATION variable are used for tests stressing behavior of concurrent ses-
sion with your module, which can be invoked by make installcheck after doing make in-
stall. For this to work you must have a running PostgreSQL server. The script files listed in ISO-
LATION must appear in a subdirectory named specs/ in your extension's directory. These files must
have extension .spec, which must not be included in the ISOLATION list in the makefile. For each
test there should also be a file containing the expected output in a subdirectory named expected/,
with the same stem and extension .out. make installcheck executes each test script, and com-
pares the resulting output to the matching expected file. Any differences will be written to the file
output_iso/regression.diffs in diff -c format. Note that trying to run a test that is
missing its expected file will be reported as “trouble”, so make sure you have all expected files.
TAP_TESTS enables the use of TAP tests. Data from each run is present in a subdirectory named
tmp_check/. See also Section 31.4 for more details.
Tip
```
The easiest way to create the expected files is to create empty files, then do a test run (which
```
```
will of course report differences). Inspect the actual result files found in the results/ di-
```
```
rectory (for tests in REGRESS), or output_iso/results/ directory (for tests in ISO-
```
```
LATION), then copy them to expected/ if they match what you expect from the test.
```
1333
