Chapter 8. Data Types
PostgreSQL has a rich set of native data types available to users. Users can add new types to Post-
greSQL using the CREATE TYPE command.
Table 8.1 shows all the built-in general-purpose data types. Most of the alternative names listed in
the “Aliases” column are the names used internally by PostgreSQL for historical reasons. In addition,
some internally used or deprecated types are available, but are not listed here.
Table 8.1. Data Types
Name Aliases Description
bigint int8 signed eight-byte integer
bigserial serial8 autoincrementing eight-byte integer
```
bit [ (n) ] fixed-length bit string
```
```
bit varying [ (n) ] varbit
```
```
[ (n) ]
```
variable-length bit string
```
boolean bool logical Boolean (true/false)
```
box rectangular box on a plane
```
bytea binary data (“byte array”)
```
```
character [ (n) ] char [ (n) ] fixed-length character string
```
```
character varying [ (n) ] varchar
```
```
[ (n) ]
```
variable-length character string
cidr IPv4 or IPv6 network address
circle circle on a plane
```
date calendar date (year, month, day)
```
double precision float, float8 double precision floating-point num-
```
ber (8 bytes)
```
inet IPv4 or IPv6 host address
integer int, int4 signed four-byte integer
interval [ fields ]
```
[ (p) ]
```
time span
json textual JSON data
jsonb binary JSON data, decomposed
line infinite line on a plane
lseg line segment on a plane
```
macaddr MAC (Media Access Control) address
```
```
macaddr8 MAC (Media Access Control) address
```
```
(EUI-64 format)
```
money currency amount
```
numeric [ (p, s) ] decimal
```
```
[ (p, s) ]
```
exact numeric of selectable precision
path geometric path on a plane
pg_lsn PostgreSQL Log Sequence Number
pg_snapshot user-level transaction ID snapshot
point geometric point on a plane
148
Data Types
Name Aliases Description
polygon closed geometric path on a plane
real float4 single precision floating-point number
```
(4 bytes)
```
smallint int2 signed two-byte integer
smallserial serial2 autoincrementing two-byte integer
serial serial4 autoincrementing four-byte integer
text variable-length character string
```
time [ (p) ] [ without
```
time zone ]
```
time of day (no time zone)
```
```
time [ (p) ] with time
```
zone
timetz time of day, including time zone
```
timestamp [ (p) ] [ with-
```
out time zone ]
```
date and time (no time zone)
```
```
timestamp [ (p) ] with
```
time zone
timestamptz date and time, including time zone
tsquery text search query
tsvector text search document
txid_snapshot user-level transaction ID snapshot
```
(deprecated; see pg_snapshot)
```
uuid universally unique identifier
xml XML data
Compatibility
```
The following types (or spellings thereof) are specified by SQL: bigint, bit, bit vary-
```
ing, boolean, char, character varying, character, varchar, date, dou-
ble precision, integer, interval, numeric, decimal, real, smallint,
```
time (with or without time zone), timestamp (with or without time zone), xml.
```
Each data type has an external representation determined by its input and output functions. Many of the
built-in types have obvious external formats. However, several types are either unique to PostgreSQL,
such as geometric paths, or have several possible formats, such as the date and time types. Some of the
input and output functions are not invertible, i.e., the result of an output function might lose accuracy
when compared to the original input.
8.1. Numeric Types
Numeric types consist of two-, four-, and eight-byte integers, four- and eight-byte floating-point num-
bers, and selectable-precision decimals. Table 8.2 lists the available types.
Table 8.2. Numeric Types
Name Storage Size Description Range
smallint 2 bytes small-range integer -32768 to +32767
integer 4 bytes typical choice for integer -2147483648 to
+2147483647
bigint 8 bytes large-range integer -9223372036854775808 to
+9223372036854775807
149
Data Types
Name Storage Size Description Range
decimal variable user-specified precision,
exact
up to 131072 digits before
```
the decimal point; up to
```
16383 digits after the deci-
mal point
numeric variable user-specified precision,
exact
up to 131072 digits before
```
the decimal point; up to
```
16383 digits after the deci-
mal point
real 4 bytes variable-precision, inexact 6 decimal digits precision
double precision 8 bytes variable-precision, inexact 15 decimal digits precision
smallserial 2 bytes small autoincrementing in-
teger
1 to 32767
serial 4 bytes autoincrementing integer 1 to 2147483647
bigserial 8 bytes large autoincrementing in-
teger
1 to
9223372036854775807
The syntax of constants for the numeric types is described in Section 4.1.2. The numeric types have a
full set of corresponding arithmetic operators and functions. Refer to Chapter 9 for more information.
The following sections describe the types in detail.
8.1.1. Integer Types
The types smallint, integer, and bigint store whole numbers, that is, numbers without frac-
tional components, of various ranges. Attempts to store values outside of the allowed range will result
in an error.
The type integer is the common choice, as it offers the best balance between range, storage size, and
performance. The smallint type is generally only used if disk space is at a premium. The bigint
type is designed to be used when the range of the integer type is insufficient.
```
SQL only specifies the integer types integer (or int), smallint, and bigint. The type names
```
int2, int4, and int8 are extensions, which are also used by some other SQL database systems.
8.1.2. Arbitrary Precision Numbers
The type numeric can store numbers with a very large number of digits. It is especially recommend-
ed for storing monetary amounts and other quantities where exactness is required. Calculations with
numeric values yield exact results where possible, e.g., addition, subtraction, multiplication. How-
ever, calculations on numeric values are very slow compared to the integer types, or to the float-
ing-point types described in the next section.
We use the following terms below: The precision of a numeric is the total count of significant digits
in the whole number, that is, the number of digits to both sides of the decimal point. The scale of a
numeric is the count of decimal digits in the fractional part, to the right of the decimal point. So the
number 23.5141 has a precision of 6 and a scale of 4. Integers can be considered to have a scale of zero.
Both the maximum precision and the maximum scale of a numeric column can be configured. To
declare a column of type numeric use the syntax:
```
NUMERIC(precision, scale)
```
```
The precision must be positive, while the scale may be positive or negative (see below). Alternatively:
```
150
Data Types
```
NUMERIC(precision)
```
selects a scale of 0. Specifying:
NUMERIC
without any precision or scale creates an “unconstrained numeric” column in which numeric values
of any length can be stored, up to the implementation limits. A column of this kind will not coerce
input values to any particular scale, whereas numeric columns with a declared scale will coerce
```
input values to that scale. (The SQL standard requires a default scale of 0, i.e., coercion to integer
```
precision. We find this a bit useless. If you're concerned about portability, always specify the precision
```
and scale explicitly.)
```
Note
The maximum precision that can be explicitly specified in a numeric type declaration is
1000. An unconstrained numeric column is subject to the limits described in Table 8.2.
If the scale of a value to be stored is greater than the declared scale of the column, the system will
round the value to the specified number of fractional digits. Then, if the number of digits to the left
of the decimal point exceeds the declared precision minus the declared scale, an error is raised. For
example, a column declared as
```
NUMERIC(3, 1)
```
will round values to 1 decimal place and can store values between -99.9 and 99.9, inclusive.
Beginning in PostgreSQL 15, it is allowed to declare a numeric column with a negative scale. Then
values will be rounded to the left of the decimal point. The precision still represents the maximum
number of non-rounded digits. Thus, a column declared as
```
NUMERIC(2, -3)
```
will round values to the nearest thousand and can store values between -99000 and 99000, inclusive.
It is also allowed to declare a scale larger than the declared precision. Such a column can only hold
fractional values, and it requires the number of zero digits just to the right of the decimal point to be
at least the declared scale minus the declared precision. For example, a column declared as
```
NUMERIC(3, 5)
```
will round values to 5 decimal places and can store values between -0.00999 and 0.00999, inclusive.
Note
PostgreSQL permits the scale in a numeric type declaration to be any value in the range
-1000 to 1000. However, the SQL standard requires the scale to be in the range 0 to preci-
sion. Using scales outside that range may not be portable to other database systems.
Numeric values are physically stored without any extra leading or trailing zeroes. Thus, the declared
```
precision and scale of a column are maximums, not fixed allocations. (In this sense the numeric
```
```
type is more akin to varchar(n) than to char(n).) The actual storage requirement is two bytes
```
for each group of four decimal digits, plus three to eight bytes overhead.
151
Data Types
In addition to ordinary numeric values, the numeric type has several special values:
Infinity
-Infinity
NaN
These are adapted from the IEEE 754 standard, and represent “infinity”, “negative infinity”, and “not-
a-number”, respectively. When writing these values as constants in an SQL command, you must put
quotes around them, for example UPDATE table SET x = '-Infinity'. On input, these
strings are recognized in a case-insensitive manner. The infinity values can alternatively be spelled
inf and -inf.
The infinity values behave as per mathematical expectations. For example, Infinity plus any finite
```
value equals Infinity, as does Infinity plus Infinity; but Infinity minus Infinity
```
```
yields NaN (not a number), because it has no well-defined interpretation. Note that an infinity can only
```
be stored in an unconstrained numeric column, because it notionally exceeds any finite precision
limit.
```
The NaN (not a number) value is used to represent undefined calculational results. In general, any
```
operation with a NaN input yields another NaN. The only exception is when the operation's other inputs
are such that the same output would be obtained if the NaN were to be replaced by any finite or infinite
```
numeric value; then, that output value is used for NaN too. (An example of this principle is that NaN
```
```
raised to the zero power yields one.)
```
Note
In most implementations of the “not-a-number” concept, NaN is not considered equal to any
```
other numeric value (including NaN). In order to allow numeric values to be sorted and used
```
in tree-based indexes, PostgreSQL treats NaN values as equal, and greater than all non-NaN
values.
The types decimal and numeric are equivalent. Both types are part of the SQL standard.
```
When rounding values, the numeric type rounds ties away from zero, while (on most machines) the
```
real and double precision types round ties to the nearest even number. For example:
SELECT x,
```
round(x::numeric) AS num_round,
```
```
round(x::double precision) AS dbl_round
```
```
FROM generate_series(-3.5, 3.5, 1) as x;
```
x | num_round | dbl_round
------+-----------+-----------
-3.5 | -4 | -4
-2.5 | -3 | -2
-1.5 | -2 | -2
-0.5 | -1 | -0
0.5 | 1 | 0
1.5 | 2 | 2
2.5 | 3 | 2
3.5 | 4 | 4
```
(8 rows)
```
8.1.3. Floating-Point Types
The data types real and double precision are inexact, variable-precision numeric types. On
all currently supported platforms, these types are implementations of IEEE Standard 754 for Binary
152
Data Types
```
Floating-Point Arithmetic (single and double precision, respectively), to the extent that the underlying
```
processor, operating system, and compiler support it.
Inexact means that some values cannot be converted exactly to the internal format and are stored as
approximations, so that storing and retrieving a value might show slight discrepancies. Managing these
errors and how they propagate through calculations is the subject of an entire branch of mathematics
and computer science and will not be discussed here, except for the following points:
```
• If you require exact storage and calculations (such as for monetary amounts), use the numeric
```
type instead.
• If you want to do complicated calculations with these types for anything important, especially if
```
you rely on certain behavior in boundary cases (infinity, underflow), you should evaluate the im-
```
plementation carefully.
• Comparing two floating-point values for equality might not always work as expected.
On all currently supported platforms, the real type has a range of around 1E-37 to 1E+37 with a
precision of at least 6 decimal digits. The double precision type has a range of around 1E-307
to 1E+308 with a precision of at least 15 digits. Values that are too large or too small will cause an
error. Rounding might take place if the precision of an input number is too high. Numbers too close
to zero that are not representable as distinct from zero will cause an underflow error.
By default, floating point values are output in text form in their shortest precise decimal representa-
```
tion; the decimal value produced is closer to the true stored binary value than to any other value rep-
```
```
resentable in the same binary precision. (However, the output value is currently never exactly midway
```
between two representable values, in order to avoid a widespread bug where input routines do not
```
properly respect the round-to-nearest-even rule.) This value will use at most 17 significant decimal
```
digits for float8 values, and at most 9 digits for float4 values.
Note
This shortest-precise output format is much faster to generate than the historical rounded for-
mat.
For compatibility with output generated by older versions of PostgreSQL, and to allow the output
precision to be reduced, the extra_float_digits parameter can be used to select rounded decimal output
```
instead. Setting a value of 0 restores the previous default of rounding the value to 6 (for float4)
```
```
or 15 (for float8) significant decimal digits. Setting a negative value reduces the number of digits
```
```
further; for example -2 would round output to 4 or 13 digits respectively.
```
Any value of extra_float_digits greater than 0 selects the shortest-precise format.
Note
Applications that wanted precise values have historically had to set extra_float_digits to 3 to
obtain them. For maximum compatibility between versions, they should continue to do so.
In addition to ordinary numeric values, the floating-point types have several special values:
Infinity
-Infinity
NaN
These represent the IEEE 754 special values “infinity”, “negative infinity”, and “not-a-number”, re-
spectively. When writing these values as constants in an SQL command, you must put quotes around
153
Data Types
them, for example UPDATE table SET x = '-Infinity'. On input, these strings are recog-
nized in a case-insensitive manner. The infinity values can alternatively be spelled inf and -inf.
Note
```
IEEE 754 specifies that NaN should not compare equal to any other floating-point value (in-
```
```
cluding NaN). In order to allow floating-point values to be sorted and used in tree-based in-
```
dexes, PostgreSQL treats NaN values as equal, and greater than all non-NaN values.
```
PostgreSQL also supports the SQL-standard notations float and float(p) for specifying inexact
```
numeric types. Here, p specifies the minimum acceptable precision in binary digits. PostgreSQL ac-
```
cepts float(1) to float(24) as selecting the real type, while float(25) to float(53)
```
select double precision. Values of p outside the allowed range draw an error. float with no
precision specified is taken to mean double precision.
8.1.4. Serial Types
Note
This section describes a PostgreSQL-specific way to create an autoincrementing column. An-
other way is to use the SQL-standard identity column feature, described at Section 5.3.
The data types smallserial, serial and bigserial are not true types, but merely a notation-
```
al convenience for creating unique identifier columns (similar to the AUTO_INCREMENT property
```
```
supported by some other databases). In the current implementation, specifying:
```
```
CREATE TABLE tablename (
```
colname SERIAL
```
);
```
is equivalent to specifying:
```
CREATE SEQUENCE tablename_colname_seq AS integer;
```
```
CREATE TABLE tablename (
```
colname integer NOT NULL DEFAULT
```
nextval('tablename_colname_seq')
```
```
);
```
```
ALTER SEQUENCE tablename_colname_seq OWNED BY tablename.colname;
```
Thus, we have created an integer column and arranged for its default values to be assigned from a
sequence generator. A NOT NULL constraint is applied to ensure that a null value cannot be inserted.
```
(In most cases you would also want to attach a UNIQUE or PRIMARY KEY constraint to prevent
```
```
duplicate values from being inserted by accident, but this is not automatic.) Lastly, the sequence is
```
marked as “owned by” the column, so that it will be dropped if the column or table is dropped.
Note
Because smallserial, serial and bigserial are implemented using sequences, there
may be "holes" or gaps in the sequence of values which appears in the column, even if no rows
are ever deleted. A value allocated from the sequence is still "used up" even if a row containing
that value is never successfully inserted into the table column. This may happen, for example,
```
if the inserting transaction rolls back. See nextval() in Section 9.17 for details.
```
154
Data Types
To insert the next value of the sequence into the serial column, specify that the serial column
should be assigned its default value. This can be done either by excluding the column from the list of
columns in the INSERT statement, or through the use of the DEFAULT key word.
The type names serial and serial4 are equivalent: both create integer columns. The type
names bigserial and serial8 work the same way, except that they create a bigint column.
bigserial should be used if you anticipate the use of more than 231 identifiers over the lifetime of
the table. The type names smallserial and serial2 also work the same way, except that they
create a smallint column.
The sequence created for a serial column is automatically dropped when the owning column is
dropped. You can drop the sequence without dropping the column, but this will force removal of the
column default expression.
8.2. Monetary Types
```
The money type stores a currency amount with a fixed fractional precision; see Table 8.3. The frac-
```
tional precision is determined by the database's lc_monetary setting. The range shown in the table
assumes there are two fractional digits. Input is accepted in a variety of formats, including integer
and floating-point literals, as well as typical currency formatting, such as '$1,000.00'. Output is
generally in the latter form but depends on the locale.
Table 8.3. Monetary Types
Name Storage Size Description Range
money 8 bytes currency amount -92233720368547758.08
to
+92233720368547758.07
Since the output of this data type is locale-sensitive, it might not work to load money data into a
database that has a different setting of lc_monetary. To avoid problems, before restoring a dump
into a new database make sure lc_monetary has the same or equivalent value as in the database
that was dumped.
Values of the numeric, int, and bigint data types can be cast to money. Conversion from the
real and double precision data types can be done by casting to numeric first, for example:
```
SELECT '12.34'::float8::numeric::money;
```
However, this is not recommended. Floating point numbers should not be used to handle money due
to the potential for rounding errors.
A money value can be cast to numeric without loss of precision. Conversion to other types could
potentially lose precision, and must also be done in two stages:
```
SELECT '52093.89'::money::numeric::float8;
```
Division of a money value by an integer value is performed with truncation of the fractional part
towards zero. To get a rounded result, divide by a floating-point value, or cast the money value to
```
numeric before dividing and back to money afterwards. (The latter is preferable to avoid risking
```
```
precision loss.) When a money value is divided by another money value, the result is double pre-
```
```
cision (i.e., a pure number, not money); the currency units cancel each other out in the division.
```
8.3. Character Types
155
Data Types
Table 8.4. Character Types
Name Description
```
character varying(n), varchar(n) variable-length with limit
```
```
character(n), char(n), bpchar(n) fixed-length, blank-padded
```
bpchar variable unlimited length, blank-trimmed
text variable unlimited length
Table 8.4 shows the general-purpose character types available in PostgreSQL.
```
SQL defines two primary character types: character varying(n) and character(n), where
```
```
n is a positive integer. Both of these types can store strings up to n characters (not bytes) in length. An
```
attempt to store a longer string into a column of these types will result in an error, unless the excess
```
characters are all spaces, in which case the string will be truncated to the maximum length. (This
```
```
somewhat bizarre exception is required by the SQL standard.) However, if one explicitly casts a value
```
```
to character varying(n) or character(n), then an over-length value will be truncated to
```
```
n characters without raising an error. (This too is required by the SQL standard.) If the string to be
```
```
stored is shorter than the declared length, values of type character will be space-padded; values
```
of type character varying will simply store the shorter string.
In addition, PostgreSQL provides the text type, which stores strings of any length. Although the
text type is not in the SQL standard, several other SQL database management systems have it as
well. text is PostgreSQL's native string data type, in that most built-in functions operating on strings
are declared to take or return text not character varying. For many purposes, character
varying acts as though it were a domain over text.
```
The type name varchar is an alias for character varying, while bpchar (with length spec-
```
```
ifier) and char are aliases for character. The varchar and char aliases are defined in the SQL
```
```
standard; bpchar is a PostgreSQL extension.
```
If specified, the length n must be greater than zero and cannot exceed 10,485,760. If character
```
varying (or varchar) is used without length specifier, the type accepts strings of any length. If
```
bpchar lacks a length specifier, it also accepts strings of any length, but trailing spaces are semanti-
```
cally insignificant. If character (or char) lacks a specifier, it is equivalent to character(1).
```
Values of type character are physically padded with spaces to the specified width n, and are stored
and displayed that way. However, trailing spaces are treated as semantically insignificant and disre-
garded when comparing two values of type character. In collations where whitespace is signifi-
```
cant, this behavior can produce unexpected results; for example SELECT 'a '::CHAR(2) col-
```
```
late "C" < E'a\n'::CHAR(2) returns true, even though C locale would consider a space
```
to be greater than a newline. Trailing spaces are removed when converting a character value to
one of the other string types. Note that trailing spaces are semantically significant in character
varying and text values, and when using pattern matching, that is LIKE and regular expressions.
The characters that can be stored in any of these data types are determined by the database character set,
which is selected when the database is created. Regardless of the specific character set, the character
```
with code zero (sometimes called NUL) cannot be stored. For more information refer to Section 23.3.
```
```
The storage requirement for a short string (up to 126 bytes) is 1 byte plus the actual string, which
```
includes the space padding in the case of character. Longer strings have 4 bytes of overhead instead
of 1. Long strings are compressed by the system automatically, so the physical requirement on disk
might be less. Very long values are also stored in background tables so that they do not interfere with
rapid access to shorter column values. In any case, the longest possible character string that can be
```
stored is about 1 GB. (The maximum value that will be allowed for n in the data type declaration is less
```
than that. It wouldn't be useful to change this because with multibyte character encodings the number
of characters and bytes can be quite different. If you desire to store long strings with no specific upper
limit, use text or character varying without a length specifier, rather than making up an
```
arbitrary length limit.)
```
156
Data Types
Tip
There is no performance difference among these three types, apart from increased storage
space when using the blank-padded type, and a few extra CPU cycles to check the length
```
when storing into a length-constrained column. While character(n) has performance ad-
```
```
vantages in some other database systems, there is no such advantage in PostgreSQL; in fact
```
```
character(n) is usually the slowest of the three because of its additional storage costs. In
```
most situations text or character varying should be used instead.
Refer to Section 4.1.2.1 for information about the syntax of string literals, and to Chapter 9 for infor-
mation about available operators and functions.
Example 8.1. Using the Character Types
```
CREATE TABLE test1 (a character(4));
```
```
INSERT INTO test1 VALUES ('ok');
```
```
SELECT a, char_length(a) FROM test1; -- 1
```
a | char_length
------+-------------
ok | 2
```
CREATE TABLE test2 (b varchar(5));
```
```
INSERT INTO test2 VALUES ('ok');
```
```
INSERT INTO test2 VALUES ('good ');
```
```
INSERT INTO test2 VALUES ('too long');
```
```
ERROR: value too long for type character varying(5)
```
```
INSERT INTO test2 VALUES ('too long'::varchar(5)); -- explicit
```
truncation
```
SELECT b, char_length(b) FROM test2;
```
b | char_length
-------+-------------
ok | 2
good | 5
too l | 5
1 The char_length function is discussed in Section 9.4.
There are two other fixed-length character types in PostgreSQL, shown in Table 8.5. These are not
intended for general-purpose use, only for use in the internal system catalogs. The name type is used
```
to store identifiers. Its length is currently defined as 64 bytes (63 usable characters plus terminator)
```
but should be referenced using the constant NAMEDATALEN in C source code. The length is set at
```
compile time (and is therefore adjustable for special uses); the default maximum length might change
```
```
in a future release. The type "char" (note the quotes) is different from char(1) in that it only uses
```
one byte of storage, and therefore can store only a single ASCII character. It is used in the system
catalogs as a simplistic enumeration type.
Table 8.5. Special Character Types
Name Storage Size Description
"char" 1 byte single-byte internal type
157
Data Types
Name Storage Size Description
name 64 bytes internal type for object names
8.4. Binary Data Types
```
The bytea data type allows storage of binary strings; see Table 8.6.
```
Table 8.6. Binary Data Types
Name Storage Size Description
bytea 1 or 4 bytes plus the actual binary string variable-length binary string
```
A binary string is a sequence of octets (or bytes). Binary strings are distinguished from character
```
strings in two ways. First, binary strings specifically allow storing octets of value zero and other “non-
```
printable” octets (usually, octets outside the decimal range 32 to 126). Character strings disallow zero
```
octets, and also disallow any other octet values and sequences of octet values that are invalid according
to the database's selected character set encoding. Second, operations on binary strings process the
actual bytes, whereas the processing of character strings depends on locale settings. In short, binary
strings are appropriate for storing data that the programmer thinks of as “raw bytes”, whereas character
strings are appropriate for storing text.
The bytea type supports two formats for input and output: “hex” format and PostgreSQL's histori-
cal “escape” format. Both of these are always accepted on input. The output format depends on the
```
configuration parameter bytea_output; the default is hex. (Note that the hex format was introduced in
```
```
PostgreSQL 9.0; earlier versions and some tools don't understand it.)
```
The SQL standard defines a different binary string type, called BLOB or BINARY LARGE OBJECT.
The input format is different from bytea, but the provided functions and operators are mostly the
same.
8.4.1. bytea Hex Format
The “hex” format encodes binary data as 2 hexadecimal digits per byte, most significant nibble first.
```
The entire string is preceded by the sequence \x (to distinguish it from the escape format). In some
```
```
contexts, the initial backslash may need to be escaped by doubling it (see Section 4.1.2.1). For input,
```
the hexadecimal digits can be either upper or lower case, and whitespace is permitted between digit
```
pairs (but not within a digit pair nor in the starting \x sequence). The hex format is compatible with a
```
wide range of external applications and protocols, and it tends to be faster to convert than the escape
format, so its use is preferred.
```
Example:
```
```
SET bytea_output = 'hex';
```
```
SELECT '\xDEADBEEF'::bytea;
```
bytea
------------
\xdeadbeef
8.4.2. bytea Escape Format
The “escape” format is the traditional PostgreSQL format for the bytea type. It takes the approach of
representing a binary string as a sequence of ASCII characters, while converting those bytes that cannot
be represented as an ASCII character into special escape sequences. If, from the point of view of the
application, representing bytes as characters makes sense, then this representation can be convenient.
158
Data Types
But in practice it is usually confusing because it fuzzes up the distinction between binary strings and
character strings, and also the particular escape mechanism that was chosen is somewhat unwieldy.
Therefore, this format should probably be avoided for most new applications.
When entering bytea values in escape format, octets of certain values must be escaped, while all
octet values can be escaped. In general, to escape an octet, convert it into its three-digit octal value and
```
precede it by a backslash. Backslash itself (octet decimal value 92) can alternatively be represented
```
by double backslashes. Table 8.7 shows the characters that must be escaped, and gives the alternative
escape sequences where applicable.
Table 8.7. bytea Literal Escaped Octets
Decimal Octet
Value
Description Escaped Input
Representation
Example Hex Representa-
tion
0 zero octet '\000' '\000'::bytea \x00
39 single quote '''' or
'\047'
''''::bytea \x27
92 backslash '\\' or
'\134'
'\\'::bytea \x5c
0 to 31 and 127
to 255
“non-printable”
octets
```
'\xxx' (octal
```
```
value)
```
'\001'::bytea \x01
The requirement to escape non-printable octets varies depending on locale settings. In some instances
you can get away with leaving them unescaped.
The reason that single quotes must be doubled, as shown in Table 8.7, is that this is true for any string
literal in an SQL command. The generic string-literal parser consumes the outermost single quotes
and reduces any pair of single quotes to one data character. What the bytea input function sees is just
one single quote, which it treats as a plain data character. However, the bytea input function treats
backslashes as special, and the other behaviors shown in Table 8.7 are implemented by that function.
In some contexts, backslashes must be doubled compared to what is shown above, because the generic
```
string-literal parser will also reduce pairs of backslashes to one data character; see Section 4.1.2.1.
```
Bytea octets are output in hex format by default. If you change bytea_output to escape, “non-
printable” octets are converted to their equivalent three-digit octal value and preceded by one back-
slash. Most “printable” octets are output by their standard representation in the client character set, e.g.:
```
SET bytea_output = 'escape';
```
```
SELECT 'abc \153\154\155 \052\251\124'::bytea;
```
bytea
----------------
abc klm *\251T
```
The octet with decimal value 92 (backslash) is doubled in the output. Details are in Table 8.8.
```
Table 8.8. bytea Output Escaped Octets
Decimal Octet
Value
Description Escaped Output
Representation
Example Output Result
92 backslash \\ '\134'::bytea \\
0 to 31 and 127
to 255
“non-printable”
octets
```
\xxx (octal val-
```
```
ue)
```
'\001'::bytea \001
32 to 126 “printable” octets client character
set representation
'\176'::bytea ~
159
Data Types
Depending on the front end to PostgreSQL you use, you might have additional work to do in terms of
escaping and unescaping bytea strings. For example, you might also have to escape line feeds and
carriage returns if your interface automatically translates these.
8.5. Date/Time Types
PostgreSQL supports the full set of SQL date and time types, shown in Table 8.9. The operations
available on these data types are described in Section 9.9. Dates are counted according to the Gregorian
```
calendar, even in years before that calendar was introduced (see Section B.6 for more information).
```
Table 8.9. Date/Time Types
Name Storage Size Description Low Value High Value Resolution
timestamp
```
[ (p) ]
```
[ with-
out time
zone ]
8 bytes both date and
```
time (no time
```
```
zone)
```
4713 BC 294276 AD 1 microsecond
timestamp
```
[ (p) ]
```
with time
zone
8 bytes both date and
time, with time
zone
4713 BC 294276 AD 1 microsecond
```
date 4 bytes date (no time
```
```
of day)
```
4713 BC 5874897 AD 1 day
time
```
[ (p) ]
```
[ with-
out time
zone ]
```
8 bytes time of day (no
```
```
date)
```
00:00:00 24:00:00 1 microsecond
time
```
[ (p) ]
```
with time
zone
12 bytes time of day
```
(no date), with
```
time zone
00:00:00+1559 24:00:00-1559 1 microsecond
interval
[ fields ]
```
[ (p) ]
```
16 bytes time interval -178000000
years
178000000
years
1 microsecond
Note
The SQL standard requires that writing just timestamp be equivalent to timestamp
without time zone, and PostgreSQL honors that behavior. timestamptz is accepted
```
as an abbreviation for timestamp with time zone; this is a PostgreSQL extension.
```
time, timestamp, and interval accept an optional precision value p which specifies the number
of fractional digits retained in the seconds field. By default, there is no explicit bound on precision.
The allowed range of p is from 0 to 6.
The interval type has an additional option, which is to restrict the set of stored fields by writing
one of these phrases:
YEAR
MONTH
DAY
160
Data Types
HOUR
MINUTE
SECOND
YEAR TO MONTH
DAY TO HOUR
DAY TO MINUTE
DAY TO SECOND
HOUR TO MINUTE
HOUR TO SECOND
MINUTE TO SECOND
Note that if both fields and p are specified, the fields must include SECOND, since the precision
applies only to the seconds.
The type time with time zone is defined by the SQL standard, but the definition exhibits prop-
erties which lead to questionable usefulness. In most cases, a combination of date, time, time-
stamp without time zone, and timestamp with time zone should provide a complete
range of date/time functionality required by any application.
8.5.1. Date/Time Input
Date and time input is accepted in almost any reasonable format, including ISO 8601, SQL-compati-
ble, traditional POSTGRES, and others. For some formats, ordering of day, month, and year in date
input is ambiguous and there is support for specifying the expected ordering of these fields. Set the
DateStyle parameter to MDY to select month-day-year interpretation, DMY to select day-month-year
interpretation, or YMD to select year-month-day interpretation.
PostgreSQL is more flexible in handling date/time input than the SQL standard requires. See Appen-
dix B for the exact parsing rules of date/time input and for the recognized text fields including months,
days of the week, and time zones.
Remember that any date or time literal input needs to be enclosed in single quotes, like text strings.
Refer to Section 4.1.2.7 for more information. SQL requires the following syntax
```
type [ (p) ] 'value'
```
where p is an optional precision specification giving the number of fractional digits in the seconds
field. Precision can be specified for time, timestamp, and interval types, and can range from
0 to 6. If no precision is specified in a constant specification, it defaults to the precision of the literal
```
value (but not more than 6 digits).
```
8.5.1.1. Dates
Table 8.10 shows some possible inputs for the date type.
Table 8.10. Date Input
Example Description
```
1999-01-08 ISO 8601; January 8 in any mode (recommended format)
```
January 8, 1999 unambiguous in any datestyle input mode
```
1/8/1999 January 8 in MDY mode; August 1 in DMY mode
```
```
1/18/1999 January 18 in MDY mode; rejected in other modes
```
```
01/02/03 January 2, 2003 in MDY mode; February 1, 2003 in DMY mode;
```
February 3, 2001 in YMD mode
1999-Jan-08 January 8 in any mode
161
Data Types
Example Description
Jan-08-1999 January 8 in any mode
08-Jan-1999 January 8 in any mode
99-Jan-08 January 8 in YMD mode, else error
08-Jan-99 January 8, except error in YMD mode
Jan-08-99 January 8, except error in YMD mode
```
19990108 ISO 8601; January 8, 1999 in any mode
```
```
990108 ISO 8601; January 8, 1999 in any mode
```
1999.008 year and day of year
J2451187 Julian date
January 8, 99 BC year 99 BC
8.5.1.2. Times
```
The time-of-day types are time [ (p) ] without time zone and time [ (p) ] with
```
time zone. time alone is equivalent to time without time zone.
```
Valid input for these types consists of a time of day followed by an optional time zone. (See Table 8.11
```
```
and Table 8.12.) If a time zone is specified in the input for time without time zone, it is silently
```
ignored. You can also specify a date but it will be ignored, except when you use a time zone name
that involves a daylight-savings rule, such as America/New_York. In this case specifying the date
is required in order to determine whether standard or daylight-savings time applies. The appropriate
```
time zone offset is recorded in the time with time zone value and is output as stored; it is
```
not adjusted to the active time zone.
Table 8.11. Time Input
Example Description
04:05:06.789 ISO 8601
04:05:06 ISO 8601
04:05 ISO 8601
040506 ISO 8601
```
04:05 AM same as 04:05; AM does not affect
```
value
```
04:05 PM same as 16:05; input hour must be <=
```
12
04:05:06.789-8 ISO 8601, with time zone as UTC off-
set
04:05:06-08:00 ISO 8601, with time zone as UTC off-
set
04:05-08:00 ISO 8601, with time zone as UTC off-
set
040506-08 ISO 8601, with time zone as UTC off-
set
040506+0730 ISO 8601, with fractional-hour time
zone as UTC offset
```
040506+07:30:00 UTC offset specified to seconds (not
```
```
allowed in ISO 8601)
```
04:05:06 PST time zone specified by abbreviation
162
Data Types
Example Description
2003-04-12 04:05:06 America/New_York time zone specified by full name
Table 8.12. Time Zone Input
Example Description
```
PST Abbreviation (for Pacific Standard Time)
```
America/New_York Full time zone name
PST8PDT POSIX-style time zone specification
-8:00:00 UTC offset for PST
```
-8:00 UTC offset for PST (ISO 8601 extended format)
```
```
-800 UTC offset for PST (ISO 8601 basic format)
```
```
-8 UTC offset for PST (ISO 8601 basic format)
```
zulu Military abbreviation for UTC
```
z Short form of zulu (also in ISO 8601)
```
Refer to Section 8.5.3 for more information on how to specify time zones.
8.5.1.3. Time Stamps
Valid input for the time stamp types consists of the concatenation of a date and a time, followed by
```
an optional time zone, followed by an optional AD or BC. (Alternatively, AD/BC can appear before the
```
```
time zone, but this is not the preferred ordering.) Thus:
```
1999-01-08 04:05:06
```
and:
```
1999-01-08 04:05:06 -8:00
are valid values, which follow the ISO 8601 standard. In addition, the common format:
January 8 04:05:06 1999 PST
is supported.
The SQL standard differentiates timestamp without time zone and timestamp with
time zone literals by the presence of a “+” or “-” symbol and time zone offset after the time. Hence,
according to the standard,
TIMESTAMP '2004-10-19 10:23:54'
is a timestamp without time zone, while
TIMESTAMP '2004-10-19 10:23:54+02'
is a timestamp with time zone. PostgreSQL never examines the content of a literal string
before determining its type, and therefore will treat both of the above as timestamp without
time zone. To ensure that a literal is treated as timestamp with time zone, give it the
correct explicit type:
163
Data Types
TIMESTAMP WITH TIME ZONE '2004-10-19 10:23:54+02'
In a value that has been determined to be timestamp without time zone, PostgreSQL will
silently ignore any time zone indication. That is, the resulting value is derived from the date/time fields
in the input string, and is not adjusted for time zone.
For timestamp with time zone values, an input string that includes an explicit time zone
```
will be converted to UTC (Universal Coordinated Time) using the appropriate offset for that time
```
zone. If no time zone is stated in the input string, then it is assumed to be in the time zone indicated
by the system's TimeZone parameter, and is converted to UTC using the offset for the timezone
zone. In either case, the value is stored internally as UTC, and the originally stated or assumed time
zone is not retained.
When a timestamp with time zone value is output, it is always converted from UTC to the
current timezone zone, and displayed as local time in that zone. To see the time in another time
```
zone, either change timezone or use the AT TIME ZONE construct (see Section 9.9.4).
```
Conversions between timestamp without time zone and timestamp with time zone
normally assume that the timestamp without time zone value should be taken or given as
timezone local time. A different time zone can be specified for the conversion using AT TIME
ZONE.
8.5.1.4. Special Values
PostgreSQL supports several special date/time input values for convenience, as shown in Table 8.13.
The values infinity and -infinity are specially represented inside the system and will be
```
displayed unchanged; but the others are simply notational shorthands that will be converted to ordinary
```
```
date/time values when read. (In particular, now and related strings are converted to a specific time
```
```
value as soon as they are read.) All of these values need to be enclosed in single quotes when used
```
as constants in SQL commands.
Table 8.13. Special Date/Time Inputs
Input String Valid Types Description
```
epoch date, timestamp 1970-01-01 00:00:00+00 (Unix
```
```
system time zero)
```
infinity date, timestamp, inter-
val
later than all other time stamps
-infinity date, timestamp, inter-
val
earlier than all other time
stamps
now date, time, timestamp current transaction's start time
```
today date, timestamp midnight (00:00) today
```
```
tomorrow date, timestamp midnight (00:00) tomorrow
```
```
yesterday date, timestamp midnight (00:00) yesterday
```
allballs time 00:00:00.00 UTC
The following SQL-compatible functions can also be used to obtain the current time value for the cor-
responding data type: CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP, LOCALTIME,
```
LOCALTIMESTAMP. (See Section 9.9.5.) Note that these are SQL functions and are not recognized
```
in data input strings.
Caution
While the input strings now, today, tomorrow, and yesterday are fine to use in inter-
active SQL commands, they can have surprising behavior when the command is saved to be
164
Data Types
executed later, for example in prepared statements, views, and function definitions. The string
can be converted to a specific time value that continues to be used long after it becomes stale.
Use one of the SQL functions instead in such contexts. For example, CURRENT_DATE + 1
is safer than 'tomorrow'::date.
8.5.2. Date/Time Output
```
The output format of the date/time types can be set to one of the four styles ISO 8601, SQL (Ingres),
```
```
traditional POSTGRES (Unix date format), or German. The default is the ISO format. (The SQL
```
standard requires the use of the ISO 8601 format. The name of the “SQL” output format is a historical
```
accident.) Table 8.14 shows examples of each output style. The output of the date and time types is
```
generally only the date or time part in accordance with the given examples. However, the POSTGRES
style outputs date-only values in ISO format.
Table 8.14. Date/Time Output Styles
Style Specification Description Example
ISO ISO 8601, SQL stan-
dard
1997-12-17 07:37:16-08
SQL traditional style 12/17/1997 07:37:16.00 PST
Postgres original style Wed Dec 17 07:37:16 1997 PST
German regional style 17.12.1997 07:37:16.00 PST
Note
ISO 8601 specifies the use of uppercase letter T to separate the date and time. PostgreSQL
accepts that format on input, but on output it uses a space rather than T, as shown above. This
is for readability and for consistency with RFC 33391 as well as some other database systems.
In the SQL and POSTGRES styles, day appears before month if DMY field ordering has been spec-
```
ified, otherwise month appears before day. (See Section 8.5.1 for how this setting also affects inter-
```
```
pretation of input values.) Table 8.15 shows examples.
```
Table 8.15. Date Order Conventions
datestyle Setting Input Ordering Example Output
SQL, DMY day/month/year 17/12/1997 15:37:16.00 CET
SQL, MDY month/day/year 12/17/1997 07:37:16.00 PST
Postgres, DMY day/month/year Wed 17 Dec 07:37:16 1997 PST
In the ISO style, the time zone is always shown as a signed numeric offset from UTC, with positive
```
sign used for zones east of Greenwich. The offset will be shown as hh (hours only) if it is an integral
```
```
number of hours, else as hh:mm if it is an integral number of minutes, else as hh:mm:ss. (The third case
```
is not possible with any modern time zone standard, but it can appear when working with timestamps
```
that predate the adoption of standardized time zones.) In the other date styles, the time zone is shown
```
as an alphabetic abbreviation if one is in common use in the current zone. Otherwise it appears as a
```
signed numeric offset in ISO 8601 basic format (hh or hhmm). The alphabetic abbreviations shown
```
in these styles are taken from the IANA time zone database entry currently selected by the TimeZone
```
run-time parameter; they are not affected by the timezone_abbreviations setting.
```
1 https://datatracker.ietf.org/doc/html/rfc3339
165
Data Types
The date/time style can be selected by the user using the SET datestyle command, the DateStyle
parameter in the postgresql.conf configuration file, or the PGDATESTYLE environment vari-
able on the server or client.
```
The formatting function to_char (see Section 9.8) is also available as a more flexible way to format
```
date/time output.
8.5.3. Time Zones
Time zones, and time-zone conventions, are influenced by political decisions, not just earth geometry.
Time zones around the world became somewhat standardized during the 1900s, but continue to be
prone to arbitrary changes, particularly with respect to daylight-savings rules. PostgreSQL uses the
```
widely-used IANA (Olson) time zone database for information about historical time zone rules. For
```
times in the future, the assumption is that the latest known rules for a given time zone will continue
to be observed indefinitely far into the future.
PostgreSQL endeavors to be compatible with the SQL standard definitions for typical usage. However,
the SQL standard has an odd mix of date and time types and capabilities. Two obvious problems are:
• Although the date type cannot have an associated time zone, the time type can. Time zones in
the real world have little meaning unless associated with a date as well as a time, since the offset
can vary through the year with daylight-saving time boundaries.
• The default time zone is specified as a constant numeric offset from UTC. It is therefore impossible
to adapt to daylight-saving time when doing date/time arithmetic across DST boundaries.
To address these difficulties, we recommend using date/time types that contain both date and time
```
when using time zones. We do not recommend using the type time with time zone (though
```
```
it is supported by PostgreSQL for legacy applications and for compliance with the SQL standard).
```
PostgreSQL assumes your local time zone for any type containing only date or time.
All timezone-aware dates and times are stored internally in UTC. They are converted to local time in
the zone specified by the TimeZone configuration parameter before being displayed to the client.
PostgreSQL allows you to specify time zones in three different forms:
• A full time zone name, for example America/New_York. The recognized time zone names are
```
listed in the pg_timezone_names view (see Section 53.34). PostgreSQL uses the widely-used
```
IANA time zone data for this purpose, so the same time zone names are also recognized by other
software.
• A time zone abbreviation, for example PST. Such a specification merely defines a particular offset
from UTC, in contrast to full time zone names which can imply a set of daylight savings transition
```
rules as well. The recognized abbreviations are listed in the pg_timezone_abbrevs view (see
```
```
Section 53.33). You cannot set the configuration parameters TimeZone or log_timezone to a time
```
zone abbreviation, but you can use abbreviations in date/time input values and with the AT TIME
ZONE operator.
• In addition to the timezone names and abbreviations, PostgreSQL will accept POSIX-style time
zone specifications, as described in Section B.5. This option is not normally preferable to using a
named time zone, but it may be necessary if no suitable IANA time zone entry is available.
In short, this is the difference between abbreviations and full names: abbreviations represent a specific
offset from UTC, whereas many of the full names imply a local daylight-savings time rule, and so have
two possible UTC offsets. As an example, 2014-06-04 12:00 America/New_York represents
```
noon local time in New York, which for this particular date was Eastern Daylight Time (UTC-4). So
```
2014-06-04 12:00 EDT specifies that same time instant. But 2014-06-04 12:00 EST
```
specifies noon Eastern Standard Time (UTC-5), regardless of whether daylight savings was nominally
```
in effect on that date.
166
Data Types
Note
The sign in POSIX-style time zone specifications has the opposite meaning of the sign in
ISO-8601 datetime values. For example, the POSIX time zone for 2014-06-04 12:00+04
would be UTC-4.
To complicate matters, some jurisdictions have used the same timezone abbreviation to mean different
```
UTC offsets at different times; for example, in Moscow MSK has meant UTC+3 in some years and
```
```
UTC+4 in others. PostgreSQL interprets such abbreviations according to whatever they meant (or had
```
```
most recently meant) on the specified date; but, as with the EST example above, this is not necessarily
```
the same as local civil time on that date.
```
In all cases, timezone names and abbreviations are recognized case-insensitively. (This is a change
```
```
from PostgreSQL versions prior to 8.2, which were case-sensitive in some contexts but not others.)
```
```
Neither timezone names nor abbreviations are hard-wired into the server; they are obtained from con-
```
figuration files stored under .../share/timezone/ and .../share/timezonesets/ of
```
the installation directory (see Section B.4).
```
The TimeZone configuration parameter can be set in the file postgresql.conf, or in any of the
other standard ways described in Chapter 19. There are also some special ways to set it:
• The SQL command SET TIME ZONE sets the time zone for the session. This is an alternative
spelling of SET TIMEZONE TO with a more SQL-spec-compatible syntax.
• The PGTZ environment variable is used by libpq clients to send a SET TIME ZONE command
to the server upon connection.
8.5.4. Interval Input
interval values can be written using the following verbose syntax:
[@] quantity unit [quantity unit...] [direction]
```
where quantity is a number (possibly signed); unit is microsecond, millisecond, sec-
```
ond, minute, hour, day, week, month, year, decade, century, millennium, or abbrevi-
```
ations or plurals of these units; direction can be ago or empty. The at sign (@) is optional noise.
```
The amounts of the different units are implicitly added with appropriate sign accounting. ago negates
all the fields. This syntax is also used for interval output, if IntervalStyle is set to postgres_ver-
bose.
Quantities of days, hours, minutes, and seconds can be specified without explicit unit markings. For
example, '1 12:59:10' is read the same as '1 day 12 hours 59 min 10 sec'. Also,
```
a combination of years and months can be specified with a dash; for example '200-10' is read the
```
```
same as '200 years 10 months'. (These shorter forms are in fact the only ones allowed by the
```
```
SQL standard, and are used for output when IntervalStyle is set to sql_standard.)
```
Interval values can also be written as ISO 8601 time intervals, using either the “format with designa-
tors” of the standard's section 4.4.3.2 or the “alternative format” of section 4.4.3.3. The format with
designators looks like this:
P quantity unit [ quantity unit ...] [ T [ quantity unit ...]]
The string must start with a P, and may include a T that introduces the time-of-day units. The available
unit abbreviations are given in Table 8.16. Units may be omitted, and may be specified in any order,
167
Data Types
but units smaller than a day must appear after T. In particular, the meaning of M depends on whether
it is before or after T.
Table 8.16. ISO 8601 Interval Unit Abbreviations
Abbreviation Meaning
Y Years
```
M Months (in the date part)
```
W Weeks
D Days
H Hours
```
M Minutes (in the time part)
```
S Seconds
In the alternative format:
P [ years-months-days ] [ T hours:minutes:seconds ]
the string must begin with P, and a T separates the date and time parts of the interval. The values are
given as numbers similar to ISO 8601 dates.
When writing an interval constant with a fields specification, or when assigning a string to an in-
terval column that was defined with a fields specification, the interpretation of unmarked quantities
depends on the fields. For example INTERVAL '1' YEAR is read as 1 year, whereas INTER-
VAL '1' means 1 second. Also, field values “to the right” of the least significant field allowed by the
fields specification are silently discarded. For example, writing INTERVAL '1 day 2:03:04'
HOUR TO MINUTE results in dropping the seconds field, but not the day field.
According to the SQL standard all fields of an interval value must have the same sign, so a leading
```
negative sign applies to all fields; for example the negative sign in the interval literal '-1 2:03:04'
```
applies to both the days and hour/minute/second parts. PostgreSQL allows the fields to have different
signs, and traditionally treats each field in the textual representation as independently signed, so that
the hour/minute/second part is considered positive in this example. If IntervalStyle is set to
```
sql_standard then a leading sign is considered to apply to all fields (but only if no additional
```
```
signs appear). Otherwise the traditional PostgreSQL interpretation is used. To avoid ambiguity, it's
```
recommended to attach an explicit sign to each field if any field is negative.
Internally, interval values are stored as three integral fields: months, days, and microseconds.
These fields are kept separate because the number of days in a month varies, while a day can have 23 or
25 hours if a daylight savings time transition is involved. An interval input string that uses other units
is normalized into this format, and then reconstructed in a standardized way for output, for example:
SELECT '2 years 15 months 100 weeks 99 hours 123456789
```
milliseconds'::interval;
```
interval
---------------------------------------
3 years 3 mons 700 days 133:17:36.789
Here weeks, which are understood as “7 days”, have been kept separate, while the smaller and larger
time units were combined and normalized.
Input field values can have fractional parts, for example '1.5 weeks' or '01:02:03.45'. How-
ever, because interval internally stores only integral fields, fractional values must be converted
into smaller units. Fractional parts of units greater than months are rounded to be an integer number
of months, e.g. '1.5 years' becomes '1 year 6 mons'. Fractional parts of weeks and days
are computed to be an integer number of days and microseconds, assuming 30 days per month and
168
Data Types
24 hours per day, e.g., '1.75 months' becomes 1 mon 22 days 12:00:00. Only seconds
will ever be shown as fractional on output.
Table 8.17 shows some examples of valid interval input.
Table 8.17. Interval Input
Example Description
1-2 SQL standard format: 1 year 2 months
3 4:05:06 SQL standard format: 3 days 4 hours 5 minutes 6
seconds
1 year 2 months 3 days 4 hours 5
minutes 6 seconds
Traditional Postgres format: 1 year 2 months 3
days 4 hours 5 minutes 6 seconds
P1Y2M3DT4H5M6S ISO 8601 “format with designators”: same
meaning as above
P0001-02-03T04:05:06 ISO 8601 “alternative format”: same meaning as
above
8.5.5. Interval Output
As previously explained, PostgreSQL stores interval values as months, days, and microseconds.
For output, the months field is converted to years and months by dividing by 12. The days field is
shown as-is. The microseconds field is converted to hours, minutes, seconds, and fractional seconds.
Thus months, minutes, and seconds will never be shown as exceeding the ranges 0–11, 0–59, and 0–
```
59 respectively, while the displayed years, days, and hours fields can be quite large. (The justi-
```
fy_days and justify_hours functions can be used if it is desirable to transpose large days or
```
hours values into the next higher field.)
```
The output format of the interval type can be set to one of the four styles sql_standard, post-
gres, postgres_verbose, or iso_8601, using the command SET intervalstyle. The
default is the postgres format. Table 8.18 shows examples of each output style.
The sql_standard style produces output that conforms to the SQL standard's specification for
```
interval literal strings, if the interval value meets the standard's restrictions (either year-month only or
```
```
day-time only, with no mixing of positive and negative components). Otherwise the output looks like
```
a standard year-month literal string followed by a day-time literal string, with explicit signs added to
disambiguate mixed-sign intervals.
The output of the postgres style matches the output of PostgreSQL releases prior to 8.4 when the
DateStyle parameter was set to ISO.
The output of the postgres_verbose style matches the output of PostgreSQL releases prior to
8.4 when the DateStyle parameter was set to non-ISO output.
The output of the iso_8601 style matches the “format with designators” described in section 4.4.3.2
of the ISO 8601 standard.
Table 8.18. Interval Output Style Examples
Style Specification Year-Month Interval Day-Time Interval Mixed Interval
sql_standard 1-2 3 4:05:06 -1-2 +3 -4:05:06
postgres 1 year 2 mons 3 days 04:05:06 -1 year -2 mons +3
days -04:05:06
postgres_verbose @ 1 year 2 mons @ 3 days 4 hours 5
mins 6 secs
@ 1 year 2 mons -3
days 4 hours 5 mins 6
secs ago
169
Data Types
Style Specification Year-Month Interval Day-Time Interval Mixed Interval
iso_8601 P1Y2M P3DT4H5M6S P-1Y-2M3D
T-4H-5M-6S
8.6. Boolean Type
```
PostgreSQL provides the standard SQL type boolean; see Table 8.19. The boolean type can have
```
several states: “true”, “false”, and a third state, “unknown”, which is represented by the SQL null value.
Table 8.19. Boolean Data Type
Name Storage Size Description
boolean 1 byte state of true or false
Boolean constants can be represented in SQL queries by the SQL key words TRUE, FALSE, and NULL.
The datatype input function for type boolean accepts these string representations for the “true” state:
true
yes
on
1
and these representations for the “false” state:
false
no
off
0
Unique prefixes of these strings are also accepted, for example t or n. Leading or trailing whitespace
is ignored, and case does not matter.
The datatype output function for type boolean always emits either t or f, as shown in Example 8.2.
Example 8.2. Using the boolean Type
```
CREATE TABLE test1 (a boolean, b text);
```
```
INSERT INTO test1 VALUES (TRUE, 'sic est');
```
```
INSERT INTO test1 VALUES (FALSE, 'non est');
```
```
SELECT * FROM test1;
```
a | b
---+---------
t | sic est
f | non est
```
SELECT * FROM test1 WHERE a;
```
a | b
---+---------
t | sic est
```
The key words TRUE and FALSE are the preferred (SQL-compliant) method for writing Boolean
```
constants in SQL queries. But you can also use the string representations by following the generic
string-literal constant syntax described in Section 4.1.2.7, for example 'yes'::boolean.
Note that the parser automatically understands that TRUE and FALSE are of type boolean, but this
is not so for NULL because that can have any type. So in some contexts you might have to cast NULL
170
Data Types
to boolean explicitly, for example NULL::boolean. Conversely, the cast can be omitted from a
string-literal Boolean value in contexts where the parser can deduce that the literal must be of type
boolean.
8.7. Enumerated Types
```
Enumerated (enum) types are data types that comprise a static, ordered set of values. They are equiv-
```
alent to the enum types supported in a number of programming languages. An example of an enum
type might be the days of the week, or a set of status values for a piece of data.
8.7.1. Declaration of Enumerated Types
Enum types are created using the CREATE TYPE command, for example:
```
CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');
```
Once created, the enum type can be used in table and function definitions much like any other type:
```
CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');
```
```
CREATE TABLE person (
```
name text,
current_mood mood
```
);
```
```
INSERT INTO person VALUES ('Moe', 'happy');
```
```
SELECT * FROM person WHERE current_mood = 'happy';
```
name | current_mood
------+--------------
Moe | happy
```
(1 row)
```
8.7.2. Ordering
The ordering of the values in an enum type is the order in which the values were listed when the
type was created. All standard comparison operators and related aggregate functions are supported
for enums. For example:
```
INSERT INTO person VALUES ('Larry', 'sad');
```
```
INSERT INTO person VALUES ('Curly', 'ok');
```
```
SELECT * FROM person WHERE current_mood > 'sad';
```
name | current_mood
-------+--------------
Moe | happy
Curly | ok
```
(2 rows)
```
SELECT * FROM person WHERE current_mood > 'sad' ORDER BY
```
current_mood;
```
name | current_mood
-------+--------------
Curly | ok
Moe | happy
```
(2 rows)
```
SELECT name
FROM person
171
Data Types
```
WHERE current_mood = (SELECT MIN(current_mood) FROM person);
```
name
-------
Larry
```
(1 row)
```
8.7.3. Type Safety
Each enumerated data type is separate and cannot be compared with other enumerated types. See this
```
example:
```
```
CREATE TYPE happiness AS ENUM ('happy', 'very happy', 'ecstatic');
```
```
CREATE TABLE holidays (
```
num_weeks integer,
happiness happiness
```
);
```
```
INSERT INTO holidays(num_weeks,happiness) VALUES (4, 'happy');
```
```
INSERT INTO holidays(num_weeks,happiness) VALUES (6, 'very happy');
```
```
INSERT INTO holidays(num_weeks,happiness) VALUES (8, 'ecstatic');
```
```
INSERT INTO holidays(num_weeks,happiness) VALUES (2, 'sad');
```
```
ERROR: invalid input value for enum happiness: "sad"
```
SELECT person.name, holidays.num_weeks FROM person, holidays
```
WHERE person.current_mood = holidays.happiness;
```
```
ERROR: operator does not exist: mood = happiness
```
If you really need to do something like that, you can either write a custom operator or add explicit
casts to your query:
SELECT person.name, holidays.num_weeks FROM person, holidays
```
WHERE person.current_mood::text = holidays.happiness::text;
```
name | num_weeks
------+-----------
Moe | 4
```
(1 row)
```
8.7.4. Implementation Details
Enum labels are case sensitive, so 'happy' is not the same as 'HAPPY'. White space in the labels
is significant too.
Although enum types are primarily intended for static sets of values, there is support for adding new
```
values to an existing enum type, and for renaming values (see ALTER TYPE). Existing values cannot
```
be removed from an enum type, nor can the sort ordering of such values be changed, short of dropping
and re-creating the enum type.
An enum value occupies four bytes on disk. The length of an enum value's textual label is limited by
```
the NAMEDATALEN setting compiled into PostgreSQL; in standard builds this means at most 63 bytes.
```
The translations from internal enum values to textual labels are kept in the system catalog pg_enum.
Querying this catalog directly can be useful.
8.8. Geometric Types
Geometric data types represent two-dimensional spatial objects. Table 8.20 shows the geometric types
available in PostgreSQL.
172
Data Types
Table 8.20. Geometric Types
Name Storage Size Description Representation
```
point 16 bytes Point on a plane (x,y)
```
```
line 24 bytes Infinite line {A,B,C}
```
```
lseg 32 bytes Finite line segment [(x1,y1),(x2,y2)]
```
```
box 32 bytes Rectangular box (x1,y1),(x2,y2)
```
```
path 16+16n bytes Closed path (similar to polygon) ((x1,y1),...)
```
```
path 16+16n bytes Open path [(x1,y1),...]
```
```
polygon 40+16n bytes Polygon (similar to closed path) ((x1,y1),...)
```
```
circle 24 bytes Circle <(x,y),r> (center
```
```
point and radius)
```
```
In all these types, the individual coordinates are stored as double precision (float8) numbers.
```
A rich set of functions and operators is available to perform various geometric operations such as
scaling, translation, rotation, and determining intersections. They are explained in Section 9.11.
8.8.1. Points
Points are the fundamental two-dimensional building block for geometric types. Values of type point
are specified using either of the following syntaxes:
```
( x , y )
```
x , y
where x and y are the respective coordinates, as floating-point numbers.
Points are output using the first syntax.
8.8.2. Lines
Lines are represented by the linear equation Ax + By + C = 0, where A and B are not both zero. Values
of type line are input and output in the following form:
```
{ A, B, C }
```
Alternatively, any of the following forms can be used for input:
```
[ ( x1 , y1 ) , ( x2 , y2 ) ]
```
```
( ( x1 , y1 ) , ( x2 , y2 ) )
```
```
( x1 , y1 ) , ( x2 , y2 )
```
x1 , y1 , x2 , y2
```
where (x1,y1) and (x2,y2) are two different points on the line.
```
8.8.3. Line Segments
Line segments are represented by pairs of points that are the endpoints of the segment. Values of type
lseg are specified using any of the following syntaxes:
```
[ ( x1 , y1 ) , ( x2 , y2 ) ]
```
```
( ( x1 , y1 ) , ( x2 , y2 ) )
```
173
Data Types
```
( x1 , y1 ) , ( x2 , y2 )
```
x1 , y1 , x2 , y2
```
where (x1,y1) and (x2,y2) are the end points of the line segment.
```
Line segments are output using the first syntax.
8.8.4. Boxes
Boxes are represented by pairs of points that are opposite corners of the box. Values of type box are
specified using any of the following syntaxes:
```
( ( x1 , y1 ) , ( x2 , y2 ) )
```
```
( x1 , y1 ) , ( x2 , y2 )
```
x1 , y1 , x2 , y2
```
where (x1,y1) and (x2,y2) are any two opposite corners of the box.
```
Boxes are output using the second syntax.
Any two opposite corners can be supplied on input, but the values will be reordered as needed to store
the upper right and lower left corners, in that order.
8.8.5. Paths
Paths are represented by lists of connected points. Paths can be open, where the first and last points in
the list are considered not connected, or closed, where the first and last points are considered connected.
Values of type path are specified using any of the following syntaxes:
```
[ ( x1 , y1 ) , ... , ( xn , yn ) ]
```
```
( ( x1 , y1 ) , ... , ( xn , yn ) )
```
```
( x1 , y1 ) , ... , ( xn , yn )
```
```
( x1 , y1 , ... , xn , yn )
```
x1 , y1 , ... , xn , yn
```
where the points are the end points of the line segments comprising the path. Square brackets ([])
```
```
indicate an open path, while parentheses (()) indicate a closed path. When the outermost parentheses
```
are omitted, as in the third through fifth syntaxes, a closed path is assumed.
Paths are output using the first or second syntax, as appropriate.
8.8.6. Polygons
```
Polygons are represented by lists of points (the vertices of the polygon). Polygons are very similar
```
```
to closed paths; the essential semantic difference is that a polygon is considered to include the area
```
within it, while a path is not.
An important implementation difference between polygons and paths is that the stored representation
of a polygon includes its smallest bounding box. This speeds up certain search operations, although
computing the bounding box adds overhead while constructing new polygons.
Values of type polygon are specified using any of the following syntaxes:
```
( ( x1 , y1 ) , ... , ( xn , yn ) )
```
```
( x1 , y1 ) , ... , ( xn , yn )
```
```
( x1 , y1 , ... , xn , yn )
```
174
Data Types
x1 , y1 , ... , xn , yn
where the points are the end points of the line segments comprising the boundary of the polygon.
Polygons are output using the first syntax.
8.8.7. Circles
Circles are represented by a center point and radius. Values of type circle are specified using any
of the following syntaxes:
```
< ( x , y ) , r >
```
```
( ( x , y ) , r )
```
```
( x , y ) , r
```
x , y , r
```
where (x,y) is the center point and r is the radius of the circle.
```
Circles are output using the first syntax.
8.9. Network Address Types
PostgreSQL offers data types to store IPv4, IPv6, and MAC addresses, as shown in Table 8.21. It is
better to use these types instead of plain text types to store network addresses, because these types
```
offer input error checking and specialized operators and functions (see Section 9.12).
```
Table 8.21. Network Address Types
Name Storage Size Description
cidr 7 or 19 bytes IPv4 and IPv6 networks
inet 7 or 19 bytes IPv4 and IPv6 hosts and networks
macaddr 6 bytes MAC addresses
```
macaddr8 8 bytes MAC addresses (EUI-64 format)
```
When sorting inet or cidr data types, IPv4 addresses will always sort before IPv6 addresses, in-
cluding IPv4 addresses encapsulated or mapped to IPv6 addresses, such as ::10.2.3.4 or ::ffff:10.4.3.2.
8.9.1. inet
The inet type holds an IPv4 or IPv6 host address, and optionally its subnet, all in one field. The subnet
```
is represented by the number of network address bits present in the host address (the “netmask”). If
```
the netmask is 32 and the address is IPv4, then the value does not indicate a subnet, only a single host.
In IPv6, the address length is 128 bits, so 128 bits specify a unique host address. Note that if you want
to accept only networks, you should use the cidr type rather than inet.
The input format for this type is address/y where address is an IPv4 or IPv6 address and y is
the number of bits in the netmask. If the /y portion is omitted, the netmask is taken to be 32 for IPv4
or 128 for IPv6, so the value represents just a single host. On display, the /y portion is suppressed
if the netmask specifies a single host.
8.9.2. cidr
The cidr type holds an IPv4 or IPv6 network specification. Input and output formats follow Classless
Internet Domain Routing conventions. The format for specifying networks is address/y where
address is the network's lowest address represented as an IPv4 or IPv6 address, and y is the number
of bits in the netmask. If y is omitted, it is calculated using assumptions from the older classful network
175
Data Types
numbering system, except it will be at least large enough to include all of the octets written in the
input. It is an error to specify a network address that has bits set to the right of the specified netmask.
Table 8.22 shows some examples.
Table 8.22. cidr Type Input Examples
```
cidr Input cidr Output abbrev(cidr)
```
192.168.100.128/25 192.168.100.128/25 192.168.100.128/25
192.168/24 192.168.0.0/24 192.168.0/24
192.168/25 192.168.0.0/25 192.168.0.0/25
192.168.1 192.168.1.0/24 192.168.1/24
192.168 192.168.0.0/24 192.168.0/24
128.1 128.1.0.0/16 128.1/16
128 128.0.0.0/16 128.0/16
128.1.2 128.1.2.0/24 128.1.2/24
10.1.2 10.1.2.0/24 10.1.2/24
10.1 10.1.0.0/16 10.1/16
10 10.0.0.0/8 10/8
10.1.2.3/32 10.1.2.3/32 10.1.2.3/32
2001:4f8:3:ba::/64 2001:4f8:3:ba::/64 2001:4f8:3:ba/64
2001:4f8:3:ba:2e0:81f-
```
f:fe22:d1f1/128
```
2001:4f8:3:ba:2e0:81f-
```
f:fe22:d1f1/128
```
2001:4f8:3:ba:2e0:81f-
```
f:fe22:d1f1/128
```
::ffff:1.2.3.0/120 ::ffff:1.2.3.0/120 ::ffff:1.2.3/120
::ffff:1.2.3.0/128 ::ffff:1.2.3.0/128 ::ffff:1.2.3.0/128
8.9.3. inet vs. cidr
The essential difference between inet and cidr data types is that inet accepts values with nonzero
bits to the right of the netmask, whereas cidr does not. For example, 192.168.0.1/24 is valid
for inet but not for cidr.
Tip
If you do not like the output format for inet or cidr values, try the functions host, text,
and abbrev.
8.9.4. macaddr
The macaddr type stores MAC addresses, known for example from Ethernet card hardware addresses
```
(although MAC addresses are used for other purposes as well). Input is accepted in the following
```
```
formats:
```
'08:00:2b:01:02:03'
'08-00-2b-01-02-03'
'08002b:010203'
'08002b-010203'
'0800.2b01.0203'
'0800-2b01-0203'
'08002b010203'
176
Data Types
These examples all specify the same address. Upper and lower case is accepted for the digits a through
f. Output is always in the first of the forms shown.
```
IEEE Standard 802-2001 specifies the second form shown (with hyphens) as the canonical form for
```
```
MAC addresses, and specifies the first form (with colons) as used with bit-reversed, MSB-first nota-
```
tion, so that 08-00-2b-01-02-03 = 10:00:D4:80:40:C0. This convention is widely ignored nowadays,
```
and it is relevant only for obsolete network protocols (such as Token Ring). PostgreSQL makes no
```
```
provisions for bit reversal; all accepted formats use the canonical LSB order.
```
The remaining five input formats are not part of any standard.
8.9.5. macaddr8
The macaddr8 type stores MAC addresses in EUI-64 format, known for example from Ethernet
```
card hardware addresses (although MAC addresses are used for other purposes as well). This type
```
can accept both 6 and 8 byte length MAC addresses and stores them in 8 byte length format. MAC
addresses given in 6 byte format will be stored in 8 byte length format with the 4th and 5th bytes set
to FF and FE, respectively. Note that IPv6 uses a modified EUI-64 format where the 7th bit should
be set to one after the conversion from EUI-48. The function macaddr8_set7bit is provided to
```
make this change. Generally speaking, any input which is comprised of pairs of hex digits (on byte
```
```
boundaries), optionally separated consistently by one of ':', '-' or '.', is accepted. The number
```
```
of hex digits must be either 16 (8 bytes) or 12 (6 bytes). Leading and trailing whitespace is ignored.
```
The following are examples of input formats that are accepted:
'08:00:2b:01:02:03:04:05'
'08-00-2b-01-02-03-04-05'
'08002b:0102030405'
'08002b-0102030405'
'0800.2b01.0203.0405'
'0800-2b01-0203-0405'
'08002b01:02030405'
'08002b0102030405'
These examples all specify the same address. Upper and lower case is accepted for the digits a through
f. Output is always in the first of the forms shown.
The last six input formats shown above are not part of any standard.
To convert a traditional 48 bit MAC address in EUI-48 format to modified EUI-64 format to be in-
cluded as the host portion of an IPv6 address, use macaddr8_set7bit as shown:
```
SELECT macaddr8_set7bit('08:00:2b:01:02:03');
```
macaddr8_set7bit
-------------------------
0a:00:2b:ff:fe:01:02:03
```
(1 row)
```
8.10. Bit String Types
Bit strings are strings of 1's and 0's. They can be used to store or visualize bit masks. There are two
```
SQL bit types: bit(n) and bit varying(n), where n is a positive integer.
```
```
bit type data must match the length n exactly; it is an error to attempt to store shorter or longer bit
```
```
strings. bit varying data is of variable length up to the maximum length n; longer strings will
```
```
be rejected. Writing bit without a length is equivalent to bit(1), while bit varying without
```
a length specification means unlimited length.
177
Data Types
Note
```
If one explicitly casts a bit-string value to bit(n), it will be truncated or zero-padded on the
```
right to be exactly n bits, without raising an error. Similarly, if one explicitly casts a bit-string
```
value to bit varying(n), it will be truncated on the right if it is more than n bits.
```
Refer to Section 4.1.2.5 for information about the syntax of bit string constants. Bit-logical operators
```
and string manipulation functions are available; see Section 9.6.
```
Example 8.3. Using the Bit String Types
```
CREATE TABLE test (a BIT(3), b BIT VARYING(5));
```
```
INSERT INTO test VALUES (B'101', B'00');
```
```
INSERT INTO test VALUES (B'10', B'101');
```
```
ERROR: bit string length 2 does not match type bit(3)
```
```
INSERT INTO test VALUES (B'10'::bit(3), B'101');
```
```
SELECT * FROM test;
```
a | b
-----+-----
101 | 00
100 | 101
A bit string value requires 1 byte for each group of 8 bits, plus 5 or 8 bytes overhead depending on
```
the length of the string (but long values may be compressed or moved out-of-line, as explained in
```
```
Section 8.3 for character strings).
```
8.11. Text Search Types
PostgreSQL provides two data types that are designed to support full text search, which is the activity
of searching through a collection of natural-language documents to locate those that best match a
```
query. The tsvector type represents a document in a form optimized for text search; the tsquery
```
type similarly represents a text query. Chapter 12 provides a detailed explanation of this facility, and
Section 9.13 summarizes the related functions and operators.
8.11.1. tsvector
A tsvector value is a sorted list of distinct lexemes, which are words that have been normalized
```
to merge different variants of the same word (see Chapter 12 for details). Sorting and duplicate-elim-
```
ination are done automatically during input, as shown in this example:
```
SELECT 'a fat cat sat on a mat and ate a fat rat'::tsvector;
```
tsvector
----------------------------------------------------
'a' 'and' 'ate' 'cat' 'fat' 'mat' 'on' 'rat' 'sat'
To represent lexemes containing whitespace or punctuation, surround them with quotes:
```
SELECT $$the lexeme ' ' contains spaces$$::tsvector;
```
tsvector
178
Data Types
-------------------------------------------
' ' 'contains' 'lexeme' 'spaces' 'the'
```
(We use dollar-quoted string literals in this example and the next one to avoid the confusion of having
```
```
to double quote marks within the literals.) Embedded quotes and backslashes must be doubled:
```
```
SELECT $$the lexeme 'Joe''s' contains a quote$$::tsvector;
```
tsvector
------------------------------------------------
'Joe''s' 'a' 'contains' 'lexeme' 'quote' 'the'
Optionally, integer positions can be attached to lexemes:
SELECT 'a:1 fat:2 cat:3 sat:4 on:5 a:6 mat:7 and:8 ate:9 a:10
```
fat:11 rat:12'::tsvector;
```
tsvector
-------------------------------------------------------------------
------------
'a':1,6,10 'and':8 'ate':9 'cat':3 'fat':2,11 'mat':7 'on':5
'rat':12 'sat':4
A position normally indicates the source word's location in the document. Positional information can
```
be used for proximity ranking. Position values can range from 1 to 16383; larger numbers are silently
```
set to 16383. Duplicate positions for the same lexeme are discarded.
Lexemes that have positions can further be labeled with a weight, which can be A, B, C, or D. D is the
default and hence is not shown on output:
```
SELECT 'a:1A fat:2B,4C cat:5D'::tsvector;
```
tsvector
----------------------------
'a':1A 'cat':5 'fat':2B,4C
Weights are typically used to reflect document structure, for example by marking title words differ-
ently from body words. Text search ranking functions can assign different priorities to the different
weight markers.
```
It is important to understand that the tsvector type itself does not perform any word normalization;
```
it assumes the words it is given are normalized appropriately for the application. For example,
```
SELECT 'The Fat Rats'::tsvector;
```
tsvector
--------------------
'Fat' 'Rats' 'The'
For most English-text-searching applications the above words would be considered non-normalized,
but tsvector doesn't care. Raw document text should usually be passed through to_tsvector
to normalize the words appropriately for searching:
```
SELECT to_tsvector('english', 'The Fat Rats');
```
to_tsvector
-----------------
'fat':2 'rat':3
Again, see Chapter 12 for more detail.
179
Data Types
8.11.2. tsquery
A tsquery value stores lexemes that are to be searched for, and can combine them using the Boolean
```
operators & (AND), | (OR), and ! (NOT), as well as the phrase search operator <-> (FOLLOWED
```
```
BY). There is also a variant <N> of the FOLLOWED BY operator, where N is an integer constant that
```
specifies the distance between the two lexemes being searched for. <-> is equivalent to <1>.
```
Parentheses can be used to enforce grouping of these operators. In the absence of parentheses, ! (NOT)
```
```
binds most tightly, <-> (FOLLOWED BY) next most tightly, then & (AND), with | (OR) binding
```
the least tightly.
Here are some examples:
```
SELECT 'fat & rat'::tsquery;
```
tsquery
---------------
'fat' & 'rat'
```
SELECT 'fat & (rat | cat)'::tsquery;
```
tsquery
---------------------------
```
'fat' & ( 'rat' | 'cat' )
```
```
SELECT 'fat & rat & ! cat'::tsquery;
```
tsquery
------------------------
'fat' & 'rat' & !'cat'
Optionally, lexemes in a tsquery can be labeled with one or more weight letters, which restricts
them to match only tsvector lexemes with one of those weights:
```
SELECT 'fat:ab & cat'::tsquery;
```
tsquery
------------------
'fat':AB & 'cat'
Also, lexemes in a tsquery can be labeled with * to specify prefix matching:
```
SELECT 'super:*'::tsquery;
```
tsquery
-----------
'super':*
This query will match any word in a tsvector that begins with “super”.
```
Quoting rules for lexemes are the same as described previously for lexemes in tsvector; and, as with
```
tsvector, any required normalization of words must be done before converting to the tsquery
type. The to_tsquery function is convenient for performing such normalization:
```
SELECT to_tsquery('Fat:ab & Cats');
```
to_tsquery
------------------
'fat':AB & 'cat'
Note that to_tsquery will process prefixes in the same way as other words, which means this
comparison returns true:
180
Data Types
```
SELECT to_tsvector( 'postgraduate' ) @@ to_tsquery( 'postgres:*' );
```
?column?
----------
t
because postgres gets stemmed to postgr:
```
SELECT to_tsvector( 'postgraduate' ), to_tsquery( 'postgres:*' );
```
to_tsvector | to_tsquery
---------------+------------
'postgradu':1 | 'postgr':*
which will match the stemmed form of postgraduate.
8.12. UUID Type
```
The data type uuid stores Universally Unique Identifiers (UUID) as defined by RFC 95622, ISO/
```
```
IEC 9834-8:2005, and related standards. (Some systems refer to this data type as a globally unique
```
```
identifier, or GUID, instead.) This identifier is a 128-bit quantity that is generated by an algorithm
```
chosen to make it very unlikely that the same identifier will be generated by anyone else in the known
universe using the same algorithm. Therefore, for distributed systems, these identifiers provide a better
uniqueness guarantee than sequence generators, which are only unique within a single database.
RFC 9562 defines 8 different UUID versions. Each version has specific requirements for generating
new UUID values, and each version provides distinct benefits and drawbacks. PostgreSQL provides
native support for generating UUIDs using the UUIDv4 and UUIDv7 algorithms. Alternatively, UUID
values can be generated outside of the database using any algorithm. The data type uuid can be used
to store any UUID, regardless of the origin and the UUID version.
A UUID is written as a sequence of lower-case hexadecimal digits, in several groups separated by
hyphens, specifically a group of 8 digits followed by three groups of 4 digits followed by a group of 12
digits, for a total of 32 digits representing the 128 bits. An example of a UUID in this standard form is:
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
PostgreSQL also accepts the following alternative forms for input: use of upper-case digits, the stan-
dard format surrounded by braces, omitting some or all hyphens, adding a hyphen after any group of
four digits. Examples are:
A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11
```
{a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11}
```
a0eebc999c0b4ef8bb6d6bb9bd380a11
a0ee-bc99-9c0b-4ef8-bb6d-6bb9-bd38-0a11
```
{a0eebc99-9c0b4ef8-bb6d6bb9-bd380a11}
```
Output is always in the standard form.
See Section 9.14 for how to generate a UUID in PostgreSQL.
8.13. XML Type
The xml data type can be used to store XML data. Its advantage over storing XML data in a text
field is that it checks the input values for well-formedness, and there are support functions to perform
2 https://datatracker.ietf.org/doc/html/rfc9562
181
Data Types
```
type-safe operations on it; see Section 9.15. Use of this data type requires the installation to have been
```
built with configure --with-libxml.
The xml type can store well-formed “documents”, as defined by the XML standard, as well as “con-
tent” fragments, which are defined by reference to the more permissive “document node”3 of the
XQuery and XPath data model. Roughly, this means that content fragments can have more than one
top-level element or character node. The expression xmlvalue IS DOCUMENT can be used to
evaluate whether a particular xml value is a full document or only a content fragment.
Limits and compatibility notes for the xml data type can be found in Section D.3.
8.13.1. Creating XML Values
To produce a value of type xml from character data, use the function xmlparse:
```
XMLPARSE ( { DOCUMENT | CONTENT } value)
```
```
Examples:
```
```
XMLPARSE (DOCUMENT '<?xml version="1.0"?><book><title>Manual</
```
```
title><chapter>...</chapter></book>')
```
```
XMLPARSE (CONTENT 'abc<foo>bar</foo><bar>foo</bar>')
```
While this is the only way to convert character strings into XML values according to the SQL standard,
the PostgreSQL-specific syntaxes:
xml '<foo>bar</foo>'
'<foo>bar</foo>'::xml
can also be used.
```
The xml type does not validate input values against a document type declaration (DTD), even when
```
the input value specifies a DTD. There is also currently no built-in support for validating against other
XML schema languages such as XML Schema.
The inverse operation, producing a character string value from xml, uses the function xmlserial-
```
ize:
```
```
XMLSERIALIZE ( { DOCUMENT | CONTENT } value AS type [ [ NO ]
```
```
INDENT ] )
```
```
type can be character, character varying, or text (or an alias for one of those). Again,
```
according to the SQL standard, this is the only way to convert between type xml and character types,
but PostgreSQL also allows you to simply cast the value.
```
The INDENT option causes the result to be pretty-printed, while NO INDENT (which is the default)
```
just emits the original input string. Casting to a character type likewise produces the original string.
When a character string value is cast to or from type xml without going through XMLPARSE or XM-
LSERIALIZE, respectively, the choice of DOCUMENT versus CONTENT is determined by the “XML
option” session configuration parameter, which can be set using the standard command:
```
SET XML OPTION { DOCUMENT | CONTENT };
```
3 https://www.w3.org/TR/2010/REC-xpath-datamodel-20101214/#DocumentNode
182
Data Types
or the more PostgreSQL-like syntax
```
SET xmloption TO { DOCUMENT | CONTENT };
```
The default is CONTENT, so all forms of XML data are allowed.
8.13.2. Encoding Handling
Care must be taken when dealing with multiple character encodings on the client, server, and in the
XML data passed through them. When using the text mode to pass queries to the server and query
```
results to the client (which is the normal mode), PostgreSQL converts all character data passed be-
```
```
tween the client and the server and vice versa to the character encoding of the respective end; see
```
Section 23.3. This includes string representations of XML values, such as in the above examples. This
would ordinarily mean that encoding declarations contained in XML data can become invalid as the
character data is converted to other encodings while traveling between client and server, because the
embedded encoding declaration is not changed. To cope with this behavior, encoding declarations
contained in character strings presented for input to the xml type are ignored, and content is assumed
to be in the current server encoding. Consequently, for correct processing, character strings of XML
data must be sent from the client in the current client encoding. It is the responsibility of the client
to either convert documents to the current client encoding before sending them to the server, or to
adjust the client encoding appropriately. On output, values of type xml will not have an encoding
declaration, and clients should assume all data is in the current client encoding.
When using binary mode to pass query parameters to the server and query results back to the client, no
encoding conversion is performed, so the situation is different. In this case, an encoding declaration
```
in the XML data will be observed, and if it is absent, the data will be assumed to be in UTF-8 (as
```
```
required by the XML standard; note that PostgreSQL does not support UTF-16). On output, data will
```
have an encoding declaration specifying the client encoding, unless the client encoding is UTF-8, in
which case it will be omitted.
Needless to say, processing XML data with PostgreSQL will be less error-prone and more efficient if
the XML data encoding, client encoding, and server encoding are the same. Since XML data is inter-
nally processed in UTF-8, computations will be most efficient if the server encoding is also UTF-8.
Caution
Some XML-related functions may not work at all on non-ASCII data when the server encoding
```
is not UTF-8. This is known to be an issue for xmltable() and xpath() in particular.
```
8.13.3. Accessing XML Values
The xml data type is unusual in that it does not provide any comparison operators. This is because
there is no well-defined and universally useful comparison algorithm for XML data. One consequence
of this is that you cannot retrieve rows by comparing an xml column against a search value. XML
values should therefore typically be accompanied by a separate key field such as an ID. An alternative
solution for comparing XML values is to convert them to character strings first, but note that character
string comparison has little to do with a useful XML comparison method.
Since there are no comparison operators for the xml data type, it is not possible to create an index
directly on a column of this type. If speedy searches in XML data are desired, possible workarounds
include casting the expression to a character string type and indexing that, or indexing an XPath ex-
pression. Of course, the actual query would have to be adjusted to search by the indexed expression.
The text-search functionality in PostgreSQL can also be used to speed up full-document searches of
XML data. The necessary preprocessing support is, however, not yet available in the PostgreSQL
distribution.
183
Data Types
8.14. JSON Types
```
JSON data types are for storing JSON (JavaScript Object Notation) data, as specified in RFC 71594.
```
Such data can also be stored as text, but the JSON data types have the advantage of enforcing that
each stored value is valid according to the JSON rules. There are also assorted JSON-specific functions
```
and operators available for data stored in these data types; see Section 9.16.
```
PostgreSQL offers two types for storing JSON data: json and jsonb. To implement efficient query
mechanisms for these data types, PostgreSQL also provides the jsonpath data type described in
Section 8.14.7.
The json and jsonb data types accept almost identical sets of values as input. The major practical
difference is one of efficiency. The json data type stores an exact copy of the input text, which pro-
```
cessing functions must reparse on each execution; while jsonb data is stored in a decomposed binary
```
format that makes it slightly slower to input due to added conversion overhead, but significantly faster
to process, since no reparsing is needed. jsonb also supports indexing, which can be a significant
advantage.
Because the json type stores an exact copy of the input text, it will preserve semantically-insignificant
white space between tokens, as well as the order of keys within JSON objects. Also, if a JSON object
```
within the value contains the same key more than once, all the key/value pairs are kept. (The processing
```
```
functions consider the last value as the operative one.) By contrast, jsonb does not preserve white
```
space, does not preserve the order of object keys, and does not keep duplicate object keys. If duplicate
keys are specified in the input, only the last value is kept.
In general, most applications should prefer to store JSON data as jsonb, unless there are quite spe-
cialized needs, such as legacy assumptions about ordering of object keys.
RFC 7159 specifies that JSON strings should be encoded in UTF8. It is therefore not possible for the
JSON types to conform rigidly to the JSON specification unless the database encoding is UTF8. At-
```
tempts to directly include characters that cannot be represented in the database encoding will fail; con-
```
versely, characters that can be represented in the database encoding but not in UTF8 will be allowed.
RFC 7159 permits JSON strings to contain Unicode escape sequences denoted by \uXXXX. In the
input function for the json type, Unicode escapes are allowed regardless of the database encoding,
```
and are checked only for syntactic correctness (that is, that four hex digits follow \u). However,
```
the input function for jsonb is stricter: it disallows Unicode escapes for characters that cannot be
```
represented in the database encoding. The jsonb type also rejects \u0000 (because that cannot
```
```
be represented in PostgreSQL's text type), and it insists that any use of Unicode surrogate pairs to
```
designate characters outside the Unicode Basic Multilingual Plane be correct. Valid Unicode escapes
```
are converted to the equivalent single character for storage; this includes folding surrogate pairs into
```
a single character.
Note
Many of the JSON processing functions described in Section 9.16 will convert Unicode es-
capes to regular characters, and will therefore throw the same types of errors just described
even if their input is of type json not jsonb. The fact that the json input function does not
make these checks may be considered a historical artifact, although it does allow for simple
```
storage (without processing) of JSON Unicode escapes in a database encoding that does not
```
support the represented characters.
When converting textual JSON input into jsonb, the primitive types described by RFC 7159 are
effectively mapped onto native PostgreSQL types, as shown in Table 8.23. Therefore, there are some
minor additional constraints on what constitutes valid jsonb data that do not apply to the json type,
4 https://datatracker.ietf.org/doc/html/rfc7159
184
Data Types
nor to JSON in the abstract, corresponding to limits on what can be represented by the underlying data
type. Notably, jsonb will reject numbers that are outside the range of the PostgreSQL numeric
data type, while json will not. Such implementation-defined restrictions are permitted by RFC 7159.
However, in practice such problems are far more likely to occur in other implementations, as it is
common to represent JSON's number primitive type as IEEE 754 double precision floating point
```
(which RFC 7159 explicitly anticipates and allows for). When using JSON as an interchange format
```
with such systems, the danger of losing numeric precision compared to data originally stored by Post-
greSQL should be considered.
Conversely, as noted in the table there are some minor restrictions on the input format of JSON prim-
itive types that do not apply to the corresponding PostgreSQL types.
Table 8.23. JSON Primitive Types and Corresponding PostgreSQL Types
JSON primitive type PostgreSQL type Notes
string text \u0000 is disallowed, as are Unicode escapes
representing characters not available in the data-
base encoding
number numeric NaN and infinity values are disallowed
boolean boolean Only lowercase true and false spellings are
accepted
```
null (none) SQL NULL is a different concept
```
8.14.1. JSON Input and Output Syntax
The input/output syntax for the JSON data types is as specified in RFC 7159.
```
The following are all valid json (or jsonb) expressions:
```
-- Simple scalar/primitive value
-- Primitive values can be numbers, quoted strings, true, false, or
null
```
SELECT '5'::json;
```
```
-- Array of zero or more elements (elements need not be of same
```
```
type)
```
```
SELECT '[1, 2, "foo", null]'::json;
```
-- Object containing pairs of keys and values
-- Note that object keys must always be quoted strings
```
SELECT '{"bar": "baz", "balance": 7.77, "active": false}'::json;
```
-- Arrays and objects can be nested arbitrarily
```
SELECT '{"foo": [true, "bar"], "tags": {"a": 1, "b": null}}'::json;
```
As previously stated, when a JSON value is input and then printed without any additional processing,
json outputs the same text that was input, while jsonb does not preserve semantically-insignificant
details such as whitespace. For example, note the differences here:
```
SELECT '{"bar": "baz", "balance": 7.77, "active":false}'::json;
```
json
-------------------------------------------------
```
{"bar": "baz", "balance": 7.77, "active":false}
```
```
(1 row)
```
185
Data Types
```
SELECT '{"bar": "baz", "balance": 7.77, "active":false}'::jsonb;
```
jsonb
--------------------------------------------------
```
{"bar": "baz", "active": false, "balance": 7.77}
```
```
(1 row)
```
One semantically-insignificant detail worth noting is that in jsonb, numbers will be printed according
to the behavior of the underlying numeric type. In practice this means that numbers entered with E
notation will be printed without it, for example:
```
SELECT '{"reading": 1.230e-5}'::json, '{"reading":
```
```
1.230e-5}'::jsonb;
```
json | jsonb
-----------------------+-------------------------
```
{"reading": 1.230e-5} | {"reading": 0.00001230}
```
```
(1 row)
```
However, jsonb will preserve trailing fractional zeroes, as seen in this example, even though those
are semantically insignificant for purposes such as equality checks.
For the list of built-in functions and operators available for constructing and processing JSON values,
see Section 9.16.
8.14.2. Designing JSON Documents
Representing data as JSON can be considerably more flexible than the traditional relational data mod-
el, which is compelling in environments where requirements are fluid. It is quite possible for both
approaches to co-exist and complement each other within the same application. However, even for
applications where maximal flexibility is desired, it is still recommended that JSON documents have
```
a somewhat fixed structure. The structure is typically unenforced (though enforcing some business
```
```
rules declaratively is possible), but having a predictable structure makes it easier to write queries that
```
```
usefully summarize a set of “documents” (datums) in a table.
```
JSON data is subject to the same concurrency-control considerations as any other data type when
stored in a table. Although storing large documents is practicable, keep in mind that any update ac-
quires a row-level lock on the whole row. Consider limiting JSON documents to a manageable size
in order to decrease lock contention among updating transactions. Ideally, JSON documents should
each represent an atomic datum that business rules dictate cannot reasonably be further subdivided
into smaller datums that could be modified independently.
8.14.3. jsonb Containment and Existence
Testing containment is an important capability of jsonb. There is no parallel set of facilities for the
json type. Containment tests whether one jsonb document has contained within it another one.
These examples return true except as noted:
-- Simple scalar/primitive values contain only the identical value:
```
SELECT '"foo"'::jsonb @> '"foo"'::jsonb;
```
-- The array on the right side is contained within the one on the
```
left:
```
```
SELECT '[1, 2, 3]'::jsonb @> '[1, 3]'::jsonb;
```
-- Order of array elements is not significant, so this is also
```
true:
```
```
SELECT '[1, 2, 3]'::jsonb @> '[3, 1]'::jsonb;
```
186
Data Types
-- Duplicate array elements don't matter either:
```
SELECT '[1, 2, 3]'::jsonb @> '[1, 2, 2]'::jsonb;
```
-- The object with a single pair on the right side is contained
-- within the object on the left side:
```
SELECT '{"product": "PostgreSQL", "version": 9.4, "jsonb":
```
```
true}'::jsonb @> '{"version": 9.4}'::jsonb;
```
-- The array on the right side is not considered contained within
the
-- array on the left, even though a similar array is nested within
```
it:
```
```
SELECT '[1, 2, [1, 3]]'::jsonb @> '[1, 3]'::jsonb; -- yields false
```
-- But with a layer of nesting, it is contained:
```
SELECT '[1, 2, [1, 3]]'::jsonb @> '[[1, 3]]'::jsonb;
```
-- Similarly, containment is not reported here:
```
SELECT '{"foo": {"bar": "baz"}}'::jsonb @> '{"bar": "baz"}'::jsonb;
```
-- yields false
-- A top-level key and an empty object is contained:
```
SELECT '{"foo": {"bar": "baz"}}'::jsonb @> '{"foo": {}}'::jsonb;
```
The general principle is that the contained object must match the containing object as to structure and
data contents, possibly after discarding some non-matching array elements or object key/value pairs
from the containing object. But remember that the order of array elements is not significant when
doing a containment match, and duplicate array elements are effectively considered only once.
As a special exception to the general principle that the structures must match, an array may contain
a primitive value:
-- This array contains the primitive string value:
```
SELECT '["foo", "bar"]'::jsonb @> '"bar"'::jsonb;
```
-- This exception is not reciprocal -- non-containment is reported
```
here:
```
```
SELECT '"bar"'::jsonb @> '["bar"]'::jsonb; -- yields false
```
jsonb also has an existence operator, which is a variation on the theme of containment: it tests
```
whether a string (given as a text value) appears as an object key or array element at the top level of
```
the jsonb value. These examples return true except as noted:
-- String exists as array element:
```
SELECT '["foo", "bar", "baz"]'::jsonb ? 'bar';
```
-- String exists as object key:
```
SELECT '{"foo": "bar"}'::jsonb ? 'foo';
```
-- Object values are not considered:
```
SELECT '{"foo": "bar"}'::jsonb ? 'bar'; -- yields false
```
-- As with containment, existence must match at the top level:
```
SELECT '{"foo": {"bar": "baz"}}'::jsonb ? 'bar'; -- yields false
```
-- A string is considered to exist if it matches a primitive JSON
```
string:
```
187
Data Types
```
SELECT '"foo"'::jsonb ? 'foo';
```
JSON objects are better suited than arrays for testing containment or existence when there are many
keys or elements involved, because unlike arrays they are internally optimized for searching, and do
not need to be searched linearly.
Tip
Because JSON containment is nested, an appropriate query can skip explicit selection of sub-
objects. As an example, suppose that we have a doc column containing objects at the top level,
with most objects containing tags fields that contain arrays of sub-objects. This query finds
entries in which sub-objects containing both "term":"paris" and "term":"food" ap-
pear, while ignoring any such keys outside the tags array:
SELECT doc->'site_name' FROM websites
```
WHERE doc @> '{"tags":[{"term":"paris"}, {"term":"food"}]}';
```
One could accomplish the same thing with, say,
SELECT doc->'site_name' FROM websites
```
WHERE doc->'tags' @> '[{"term":"paris"}, {"term":"food"}]';
```
but that approach is less flexible, and often less efficient as well.
On the other hand, the JSON existence operator is not nested: it will only look for the specified
key or array element at top level of the JSON value.
The various containment and existence operators, along with all other JSON operators and functions
are documented in Section 9.16.
8.14.4. jsonb Indexing
GIN indexes can be used to efficiently search for keys or key/value pairs occurring within a large
```
number of jsonb documents (datums). Two GIN “operator classes” are provided, offering different
```
performance and flexibility trade-offs.
The default GIN operator class for jsonb supports queries with the key-exists operators ?, ?| and
```
?&, the containment operator @>, and the jsonpath match operators @? and @@. (For details of the
```
```
semantics that these operators implement, see Table 9.48.) An example of creating an index with this
```
operator class is:
```
CREATE INDEX idxgin ON api USING GIN (jdoc);
```
The non-default GIN operator class jsonb_path_ops does not support the key-exists operators,
but it does support @>, @? and @@. An example of creating an index with this operator class is:
```
CREATE INDEX idxginp ON api USING GIN (jdoc jsonb_path_ops);
```
Consider the example of a table that stores JSON documents retrieved from a third-party web service,
with a documented schema definition. A typical document is:
```
{
```
"guid": "9c36adc1-7fb5-4d5b-83b4-90356a46061a",
"name": "Angela Barton",
188
Data Types
"is_active": true,
"company": "Magnafone",
"address": "178 Howard Place, Gulf, Washington, 702",
"registered": "2009-11-07T08:53:22 +08:00",
"latitude": 19.793713,
"longitude": 86.513373,
"tags": [
"enim",
"aliquip",
"qui"
]
```
}
```
We store these documents in a table named api, in a jsonb column named jdoc. If a GIN index is
created on this column, queries like the following can make use of the index:
-- Find documents in which the key "company" has value "Magnafone"
SELECT jdoc->'guid', jdoc->'name' FROM api WHERE jdoc @>
```
'{"company": "Magnafone"}';
```
However, the index could not be used for queries like the following, because though the operator ? is
indexable, it is not applied directly to the indexed column jdoc:
-- Find documents in which the key "tags" contains key or array
element "qui"
SELECT jdoc->'guid', jdoc->'name' FROM api WHERE jdoc -> 'tags' ?
```
'qui';
```
Still, with appropriate use of expression indexes, the above query can use an index. If querying for
particular items within the "tags" key is common, defining an index like this may be worthwhile:
```
CREATE INDEX idxgintags ON api USING GIN ((jdoc -> 'tags'));
```
Now, the WHERE clause jdoc -> 'tags' ? 'qui' will be recognized as an application of the
```
indexable operator ? to the indexed expression jdoc -> 'tags'. (More information on expression
```
```
indexes can be found in Section 11.7.)
```
Another approach to querying is to exploit containment, for example:
-- Find documents in which the key "tags" contains array element
"qui"
```
SELECT jdoc->'guid', jdoc->'name' FROM api WHERE jdoc @> '{"tags":
```
```
["qui"]}';
```
A simple GIN index on the jdoc column can support this query. But note that such an index will
store copies of every key and value in the jdoc column, whereas the expression index of the previous
example stores only data found under the tags key. While the simple-index approach is far more
```
flexible (since it supports queries about any key), targeted expression indexes are likely to be smaller
```
and faster to search than a simple index.
GIN indexes also support the @? and @@ operators, which perform jsonpath matching. Examples
are
SELECT jdoc->'guid', jdoc->'name' FROM api WHERE jdoc @?
```
'$.tags[*] ? (@ == "qui")';
```
189
Data Types
SELECT jdoc->'guid', jdoc->'name' FROM api WHERE jdoc @@ '$.tags[*]
```
== "qui"';
```
For these operators, a GIN index extracts clauses of the form accessors_chain == constant
out of the jsonpath pattern, and does the index search based on the keys and values mentioned
in these clauses. The accessors chain may include .key, [*], and [index] accessors. The json-
b_ops operator class also supports .* and .** accessors, but the jsonb_path_ops operator class
does not.
Although the jsonb_path_ops operator class supports only queries with the @>, @? and @@ oper-
ators, it has notable performance advantages over the default operator class jsonb_ops. A json-
b_path_ops index is usually much smaller than a jsonb_ops index over the same data, and the
specificity of searches is better, particularly when queries contain keys that appear frequently in the
data. Therefore search operations typically perform better than with the default operator class.
The technical difference between a jsonb_ops and a jsonb_path_ops GIN index is that the
former creates independent index items for each key and value in the data, while the latter creates
index items only for each value in the data. 5 Basically, each jsonb_path_ops index item is a
```
hash of the value and the key(s) leading to it; for example to index {"foo": {"bar": "baz"}},
```
a single index item would be created incorporating all three of foo, bar, and baz into the hash
value. Thus a containment query looking for this structure would result in an extremely specific index
```
search; but there is no way at all to find out whether foo appears as a key. On the other hand, a
```
```
jsonb_ops index would create three index items representing foo, bar, and baz separately; then
```
to do the containment query, it would look for rows containing all three of these items. While GIN
indexes can perform such an AND search fairly efficiently, it will still be less specific and slower
than the equivalent jsonb_path_ops search, especially if there are a very large number of rows
containing any single one of the three index items.
A disadvantage of the jsonb_path_ops approach is that it produces no index entries for JSON
```
structures not containing any values, such as {"a": {}}. If a search for documents containing such
```
a structure is requested, it will require a full-index scan, which is quite slow. jsonb_path_ops is
therefore ill-suited for applications that often perform such searches.
jsonb also supports btree and hash indexes. These are usually useful only if it's important to
check equality of complete JSON documents. The btree ordering for jsonb datums is seldom of
great interest, but for completeness it is:
Object > Array > Boolean > Number > String > null
Object with n pairs > object with n - 1 pairs
Array with n elements > array with n - 1 elements
```
with the exception that (for historical reasons) an empty top level array sorts less than null. Objects
```
with equal numbers of pairs are compared in the order:
key-1, value-1, key-2 ...
```
Note that object keys are compared in their storage order; in particular, since shorter keys are stored
```
before longer keys, this can lead to results that might be unintuitive, such as:
```
{ "aa": 1, "c": 1} > {"b": 1, "d": 1}
```
Similarly, arrays with equal numbers of elements are compared in the order:
5 For this purpose, the term “value” includes array elements, though JSON terminology sometimes considers array elements distinct from
values within objects.
190
Data Types
element-1, element-2 ...
Primitive JSON values are compared using the same comparison rules as for the underlying Post-
greSQL data type. Strings are compared using the default database collation.
8.14.5. jsonb Subscripting
The jsonb data type supports array-style subscripting expressions to extract and modify elements.
Nested values can be indicated by chaining subscripting expressions, following the same rules as the
path argument in the jsonb_set function. If a jsonb value is an array, numeric subscripts start
at zero, and negative integers count backwards from the last element of the array. Slice expressions
are not supported. The result of a subscripting expression is always of the jsonb data type.
UPDATE statements may use subscripting in the SET clause to modify jsonb values. Subscript paths
must be traversable for all affected values insofar as they exist. For instance, the path val['a']
['b']['c'] can be traversed all the way to c if every val, val['a'], and val['a']['b']
is an object. If any val['a'] or val['a']['b'] is not defined, it will be created as an empty
object and filled as necessary. However, if any val itself or one of the intermediary values is defined
as a non-object such as a string, number, or jsonb null, traversal cannot proceed so an error is
raised and the transaction aborted.
An example of subscripting syntax:
-- Extract object value by key
```
SELECT ('{"a": 1}'::jsonb)['a'];
```
-- Extract nested object value by key path
```
SELECT ('{"a": {"b": {"c": 1}}}'::jsonb)['a']['b']['c'];
```
-- Extract array element by index
```
SELECT ('[1, "2", null]'::jsonb)[1];
```
-- Update object value by key. Note the quotes around '1': the
assigned
-- value must be of the jsonb type as well
```
UPDATE table_name SET jsonb_field['key'] = '1';
```
-- This will raise an error if any record's jsonb_field['a']['b']
is something
```
-- other than an object. For example, the value {"a": 1} has a
```
numeric value
-- of the key 'a'.
```
UPDATE table_name SET jsonb_field['a']['b']['c'] = '1';
```
-- Filter records using a WHERE clause with subscripting. Since the
result of
-- subscripting is jsonb, the value we compare it against must also
be jsonb.
-- The double quotes make "value" also a valid jsonb string.
```
SELECT * FROM table_name WHERE jsonb_field['key'] = '"value"';
```
jsonb assignment via subscripting handles a few edge cases differently from jsonb_set. When a
source jsonb value is NULL, assignment via subscripting will proceed as if it was an empty JSON
```
value of the type (object or array) implied by the subscript key:
```
191
Data Types
```
-- Where jsonb_field was NULL, it is now {"a": 1}
```
```
UPDATE table_name SET jsonb_field['a'] = '1';
```
-- Where jsonb_field was NULL, it is now [1]
```
UPDATE table_name SET jsonb_field[0] = '1';
```
If an index is specified for an array containing too few elements, NULL elements will be appended
until the index is reachable and the value can be set.
```
-- Where jsonb_field was [], it is now [null, null, 2];
```
-- where jsonb_field was [0], it is now [0, null, 2]
```
UPDATE table_name SET jsonb_field[2] = '2';
```
A jsonb value will accept assignments to nonexistent subscript paths as long as the last existing
```
element to be traversed is an object or array, as implied by the corresponding subscript (the element
```
```
indicated by the last subscript in the path is not traversed and may be anything). Nested array and
```
object structures will be created, and in the former case null-padded, as specified by the subscript
path until the assigned value can be placed.
```
-- Where jsonb_field was {}, it is now {"a": [{"b": 1}]}
```
```
UPDATE table_name SET jsonb_field['a'][0]['b'] = '1';
```
```
-- Where jsonb_field was [], it is now [null, {"a": 1}]
```
```
UPDATE table_name SET jsonb_field[1]['a'] = '1';
```
8.14.6. Transforms
Additional extensions are available that implement transforms for the jsonb type for different pro-
cedural languages.
The extensions for PL/Perl are called jsonb_plperl and jsonb_plperlu. If you use them,
jsonb values are mapped to Perl arrays, hashes, and scalars, as appropriate.
The extension for PL/Python is called jsonb_plpython3u. If you use it, jsonb values are mapped
to Python dictionaries, lists, and scalars, as appropriate.
Of these extensions, jsonb_plperl is considered “trusted”, that is, it can be installed by non-
superusers who have CREATE privilege on the current database. The rest require superuser privilege
to install.
8.14.7. jsonpath Type
The jsonpath type implements support for the SQL/JSON path language in PostgreSQL to effi-
ciently query JSON data. It provides a binary representation of the parsed SQL/JSON path expression
that specifies the items to be retrieved by the path engine from the JSON data for further processing
with the SQL/JSON query functions.
The semantics of SQL/JSON path predicates and operators generally follow SQL. At the same time,
to provide a natural way of working with JSON data, SQL/JSON path syntax uses some JavaScript
```
conventions:
```
```
• Dot (.) is used for member access.
```
```
• Square brackets ([]) are used for array access.
```
• SQL/JSON arrays are 0-relative, unlike regular SQL arrays that start from 1.
192
Data Types
Numeric literals in SQL/JSON path expressions follow JavaScript rules, which are different from both
SQL and JSON in some minor details. For example, SQL/JSON path allows .1 and 1., which are
invalid in JSON. Non-decimal integer literals and underscore separators are supported, for example,
```
1_000_000, 0x1EEE_FFFF, 0o273, 0b100101. In SQL/JSON path (and in JavaScript, but not
```
```
in SQL proper), there must not be an underscore separator directly after the radix prefix.
```
An SQL/JSON path expression is typically written in an SQL query as an SQL character string literal,
so it must be enclosed in single quotes, and any single quotes desired within the value must be doubled
```
(see Section 4.1.2.1). Some forms of path expressions require string literals within them. These em-
```
bedded string literals follow JavaScript/ECMAScript conventions: they must be surrounded by double
quotes, and backslash escapes may be used within them to represent otherwise-hard-to-type charac-
ters. In particular, the way to write a double quote within an embedded string literal is \", and to write
a backslash itself, you must write \\. Other special backslash sequences include those recognized in
JavaScript strings: \b, \f, \n, \r, \t, \v for various ASCII control characters, \xNN for a character
code written with only two hex digits, \uNNNN for a Unicode character identified by its 4-hex-digit
```
code point, and \u{N...} for a Unicode character code point written with 1 to 6 hex digits.
```
A path expression consists of a sequence of path elements, which can be any of the following:
• Path literals of JSON primitive types: Unicode text, numeric, true, false, or null.
• Path variables listed in Table 8.24.
• Accessor operators listed in Table 8.25.
• jsonpath operators and methods listed in Section 9.16.2.3.
• Parentheses, which can be used to provide filter expressions or define the order of path evaluation.
For details on using jsonpath expressions with SQL/JSON query functions, see Section 9.16.2.
Table 8.24. jsonpath Variables
Variable Description
```
$ A variable representing the JSON value being queried (the con-
```
```
text item).
```
$varname A named variable. Its value can be set by the parameter vars of
```
several JSON processing functions; see Table 9.51 for details.
```
@ A variable representing the result of path evaluation in filter ex-
pressions.
Table 8.25. jsonpath Accessors
Accessor Operator Description
.key
."$varname"
Member accessor that returns an object member with the speci-
fied key. If the key name matches some named variable starting
with $ or does not meet the JavaScript rules for an identifier, it
must be enclosed in double quotes to make it a string literal.
.* Wildcard member accessor that returns the values of all members
located at the top level of the current object.
.** Recursive wildcard member accessor that processes all levels of
the JSON hierarchy of the current object and returns all the mem-
ber values, regardless of their nesting level. This is a PostgreSQL
extension of the SQL/JSON standard.
```
.**{level} Like .**, but selects only the specified levels of the JSON hier-
```
archy. Nesting levels are specified as integers. Level zero corre-
sponds to the current object. To access the lowest nesting level,
193
Data Types
Accessor Operator Description
```
.**{start_level to
```
```
end_level}
```
you can use the last keyword. This is a PostgreSQL extension
of the SQL/JSON standard.
[subscript, ...] Array element accessor. subscript can be given in two forms:
index or start_index to end_index. The first form re-
turns a single array element by its index. The second form returns
an array slice by the range of indexes, including the elements that
correspond to the provided start_index and end_index.
The specified index can be an integer, as well as an expression
returning a single numeric value, which is automatically cast to
integer. Index zero corresponds to the first array element. You
can also use the last keyword to denote the last array element,
which is useful for handling arrays of unknown length.
[*] Wildcard array element accessor that returns all array elements.
8.15. Arrays
PostgreSQL allows columns of a table to be defined as variable-length multidimensional arrays. Arrays
of any built-in or user-defined base type, enum type, composite type, range type, or domain can be
created.
8.15.1. Declaration of Array Types
To illustrate the use of array types, we create this table:
```
CREATE TABLE sal_emp (
```
name text,
pay_by_quarter integer[],
schedule text[][]
```
);
```
```
As shown, an array data type is named by appending square brackets ([]) to the data type name of
```
the array elements. The above command will create a table named sal_emp with a column of type
```
text (name), a one-dimensional array of type integer (pay_by_quarter), which represents
```
```
the employee's salary by quarter, and a two-dimensional array of text (schedule), which repre-
```
sents the employee's weekly schedule.
The syntax for CREATE TABLE allows the exact size of arrays to be specified, for example:
```
CREATE TABLE tictactoe (
```
squares integer[3][3]
```
);
```
However, the current implementation ignores any supplied array size limits, i.e., the behavior is the
same as for arrays of unspecified length.
The current implementation does not enforce the declared number of dimensions either. Arrays of
a particular element type are all considered to be of the same type, regardless of size or number of
dimensions. So, declaring the array size or number of dimensions in CREATE TABLE is simply
```
documentation; it does not affect run-time behavior.
```
An alternative syntax, which conforms to the SQL standard by using the keyword ARRAY, can be used
for one-dimensional arrays. pay_by_quarter could have been defined as:
194
Data Types
pay_by_quarter integer ARRAY[4],
Or, if no array size is to be specified:
pay_by_quarter integer ARRAY,
As before, however, PostgreSQL does not enforce the size restriction in any case.
8.15.2. Array Value Input
To write an array value as a literal constant, enclose the element values within curly braces and separate
```
them by commas. (If you know C, this is not unlike the C syntax for initializing structures.) You can
```
put double quotes around any element value, and must do so if it contains commas or curly braces.
```
(More details appear below.) Thus, the general format of an array constant is the following:
```
```
'{ val1 delim val2 delim ... }'
```
where delim is the delimiter character for the type, as recorded in its pg_type entry. Among the
```
standard data types provided in the PostgreSQL distribution, all use a comma (,), except for type box
```
```
which uses a semicolon (;). Each val is either a constant of the array element type, or a subarray.
```
An example of an array constant is:
```
'{{1,2,3},{4,5,6},{7,8,9}}'
```
This constant is a two-dimensional, 3-by-3 array consisting of three subarrays of integers.
```
To set an element of an array constant to NULL, write NULL for the element value. (Any upper- or
```
```
lower-case variant of NULL will do.) If you want an actual string value “NULL”, you must put double
```
quotes around it.
```
(These kinds of array constants are actually only a special case of the generic type constants discussed
```
in Section 4.1.2.7. The constant is initially treated as a string and passed to the array input conversion
```
routine. An explicit type specification might be necessary.)
```
Now we can show some INSERT statements:
INSERT INTO sal_emp
```
VALUES ('Bill',
```
```
'{10000, 10000, 10000, 10000}',
```
```
'{{"meeting", "lunch"}, {"training", "presentation"}}');
```
INSERT INTO sal_emp
```
VALUES ('Carol',
```
```
'{20000, 25000, 25000, 25000}',
```
```
'{{"breakfast", "consulting"}, {"meeting", "lunch"}}');
```
The result of the previous two inserts looks like this:
```
SELECT * FROM sal_emp;
```
name | pay_by_quarter | schedule
-------+---------------------------
+-------------------------------------------
```
Bill | {10000,10000,10000,10000} | {{meeting,lunch},
```
```
{training,presentation}}
```
```
Carol | {20000,25000,25000,25000} | {{breakfast,consulting},
```
```
{meeting,lunch}}
```
195
Data Types
```
(2 rows)
```
Multidimensional arrays must have matching extents for each dimension. A mismatch causes an error,
for example:
INSERT INTO sal_emp
```
VALUES ('Bill',
```
```
'{10000, 10000, 10000, 10000}',
```
```
'{{"meeting", "lunch"}, {"meeting"}}');
```
```
ERROR: malformed array literal: "{{"meeting", "lunch"},
```
```
{"meeting"}}"
```
```
DETAIL: Multidimensional arrays must have sub-arrays with matching
```
dimensions.
The ARRAY constructor syntax can also be used:
INSERT INTO sal_emp
```
VALUES ('Bill',
```
ARRAY[10000, 10000, 10000, 10000],
```
ARRAY[['meeting', 'lunch'], ['training', 'presentation']]);
```
INSERT INTO sal_emp
```
VALUES ('Carol',
```
ARRAY[20000, 25000, 25000, 25000],
```
ARRAY[['breakfast', 'consulting'], ['meeting', 'lunch']]);
```
```
Notice that the array elements are ordinary SQL constants or expressions; for instance, string literals
```
are single quoted, instead of double quoted as they would be in an array literal. The ARRAY constructor
syntax is discussed in more detail in Section 4.2.12.
8.15.3. Accessing Arrays
Now, we can run some queries on the table. First, we show how to access a single element of an array.
This query retrieves the names of the employees whose pay changed in the second quarter:
SELECT name FROM sal_emp WHERE pay_by_quarter[1] <>
```
pay_by_quarter[2];
```
name
-------
Carol
```
(1 row)
```
The array subscript numbers are written within square brackets. By default PostgreSQL uses a one-
based numbering convention for arrays, that is, an array of n elements starts with array[1] and
ends with array[n].
This query retrieves the third quarter pay of all employees:
```
SELECT pay_by_quarter[3] FROM sal_emp;
```
pay_by_quarter
----------------
10000
25000
196
Data Types
```
(2 rows)
```
We can also access arbitrary rectangular slices of an array, or subarrays. An array slice is denoted by
writing lower-bound:upper-bound for one or more array dimensions. For example, this query
retrieves the first item on Bill's schedule for the first two days of the week:
```
SELECT schedule[1:2][1:1] FROM sal_emp WHERE name = 'Bill';
```
schedule
------------------------
```
{{meeting},{training}}
```
```
(1 row)
```
If any dimension is written as a slice, i.e., contains a colon, then all dimensions are treated as slices.
```
Any dimension that has only a single number (no colon) is treated as being from 1 to the number
```
specified. For example, [2] is treated as [1:2], as in this example:
```
SELECT schedule[1:2][2] FROM sal_emp WHERE name = 'Bill';
```
schedule
-------------------------------------------
```
{{meeting,lunch},{training,presentation}}
```
```
(1 row)
```
To avoid confusion with the non-slice case, it's best to use slice syntax for all dimensions, e.g., [1:2]
[1:1], not [2][1:1].
```
It is possible to omit the lower-bound and/or upper-bound of a slice specifier; the missing
```
bound is replaced by the lower or upper limit of the array's subscripts. For example:
```
SELECT schedule[:2][2:] FROM sal_emp WHERE name = 'Bill';
```
schedule
------------------------
```
{{lunch},{presentation}}
```
```
(1 row)
```
```
SELECT schedule[:][1:1] FROM sal_emp WHERE name = 'Bill';
```
schedule
------------------------
```
{{meeting},{training}}
```
```
(1 row)
```
An array subscript expression will return null if either the array itself or any of the subscript expressions
```
are null. Also, null is returned if a subscript is outside the array bounds (this case does not raise
```
```
an error). For example, if schedule currently has the dimensions [1:3][1:2] then referencing
```
schedule[3][3] yields NULL. Similarly, an array reference with the wrong number of subscripts
yields a null rather than an error.
An array slice expression likewise yields null if the array itself or any of the subscript expressions are
null. However, in other cases such as selecting an array slice that is completely outside the current array
```
bounds, a slice expression yields an empty (zero-dimensional) array instead of null. (This does not
```
```
match non-slice behavior and is done for historical reasons.) If the requested slice partially overlaps
```
the array bounds, then it is silently reduced to just the overlapping region instead of returning null.
The current dimensions of any array value can be retrieved with the array_dims function:
197
Data Types
```
SELECT array_dims(schedule) FROM sal_emp WHERE name = 'Carol';
```
array_dims
------------
[1:2][1:2]
```
(1 row)
```
array_dims produces a text result, which is convenient for people to read but perhaps incon-
venient for programs. Dimensions can also be retrieved with array_upper and array_lower,
which return the upper and lower bound of a specified array dimension, respectively:
```
SELECT array_upper(schedule, 1) FROM sal_emp WHERE name = 'Carol';
```
array_upper
-------------
2
```
(1 row)
```
array_length will return the length of a specified array dimension:
```
SELECT array_length(schedule, 1) FROM sal_emp WHERE name = 'Carol';
```
array_length
--------------
2
```
(1 row)
```
cardinality returns the total number of elements in an array across all dimensions. It is effectively
the number of rows a call to unnest would yield:
```
SELECT cardinality(schedule) FROM sal_emp WHERE name = 'Carol';
```
cardinality
-------------
4
```
(1 row)
```
8.15.4. Modifying Arrays
An array value can be replaced completely:
```
UPDATE sal_emp SET pay_by_quarter = '{25000,25000,27000,27000}'
```
```
WHERE name = 'Carol';
```
or using the ARRAY expression syntax:
UPDATE sal_emp SET pay_by_quarter = ARRAY[25000,25000,27000,27000]
```
WHERE name = 'Carol';
```
An array can also be updated at a single element:
UPDATE sal_emp SET pay_by_quarter[4] = 15000
```
WHERE name = 'Bill';
```
198
Data Types
or updated in a slice:
```
UPDATE sal_emp SET pay_by_quarter[1:2] = '{27000,27000}'
```
```
WHERE name = 'Carol';
```
The slice syntaxes with omitted lower-bound and/or upper-bound can be used too, but only
```
when updating an array value that is not NULL or zero-dimensional (otherwise, there is no existing
```
```
subscript limit to substitute).
```
A stored array value can be enlarged by assigning to elements not already present. Any positions be-
tween those previously present and the newly assigned elements will be filled with nulls. For exam-
ple, if array myarray currently has 4 elements, it will have six elements after an update that assigns
```
to myarray[6]; myarray[5] will contain null. Currently, enlargement in this fashion is only al-
```
lowed for one-dimensional arrays, not multidimensional arrays.
Subscripted assignment allows creation of arrays that do not use one-based subscripts. For example
one might assign to myarray[-2:7] to create an array with subscript values from -2 to 7.
New array values can also be constructed using the concatenation operator, ||:
```
SELECT ARRAY[1,2] || ARRAY[3,4];
```
?column?
-----------
```
{1,2,3,4}
```
```
(1 row)
```
```
SELECT ARRAY[5,6] || ARRAY[[1,2],[3,4]];
```
?column?
---------------------
```
{{5,6},{1,2},{3,4}}
```
```
(1 row)
```
The concatenation operator allows a single element to be pushed onto the beginning or end of a one-
dimensional array. It also accepts two N-dimensional arrays, or an N-dimensional and an N+1-dimen-
sional array.
When a single element is pushed onto either the beginning or end of a one-dimensional array, the
result is an array with the same lower bound subscript as the array operand. For example:
```
SELECT array_dims(1 || '[0:1]={2,3}'::int[]);
```
array_dims
------------
[0:2]
```
(1 row)
```
```
SELECT array_dims(ARRAY[1,2] || 3);
```
array_dims
------------
[1:3]
```
(1 row)
```
When two arrays with an equal number of dimensions are concatenated, the result retains the lower
bound subscript of the left-hand operand's outer dimension. The result is an array comprising every
element of the left-hand operand followed by every element of the right-hand operand. For example:
```
SELECT array_dims(ARRAY[1,2] || ARRAY[3,4,5]);
```
199
Data Types
array_dims
------------
[1:5]
```
(1 row)
```
```
SELECT array_dims(ARRAY[[1,2],[3,4]] || ARRAY[[5,6],[7,8],[9,0]]);
```
array_dims
------------
[1:5][1:2]
```
(1 row)
```
When an N-dimensional array is pushed onto the beginning or end of an N+1-dimensional array, the
result is analogous to the element-array case above. Each N-dimensional sub-array is essentially an
element of the N+1-dimensional array's outer dimension. For example:
```
SELECT array_dims(ARRAY[1,2] || ARRAY[[3,4],[5,6]]);
```
array_dims
------------
[1:3][1:2]
```
(1 row)
```
An array can also be constructed by using the functions array_prepend, array_append, or
array_cat. The first two only support one-dimensional arrays, but array_cat supports multidi-
mensional arrays. Some examples:
```
SELECT array_prepend(1, ARRAY[2,3]);
```
array_prepend
---------------
```
{1,2,3}
```
```
(1 row)
```
```
SELECT array_append(ARRAY[1,2], 3);
```
array_append
--------------
```
{1,2,3}
```
```
(1 row)
```
```
SELECT array_cat(ARRAY[1,2], ARRAY[3,4]);
```
array_cat
-----------
```
{1,2,3,4}
```
```
(1 row)
```
```
SELECT array_cat(ARRAY[[1,2],[3,4]], ARRAY[5,6]);
```
array_cat
---------------------
```
{{1,2},{3,4},{5,6}}
```
```
(1 row)
```
```
SELECT array_cat(ARRAY[5,6], ARRAY[[1,2],[3,4]]);
```
array_cat
---------------------
```
{{5,6},{1,2},{3,4}}
```
In simple cases, the concatenation operator discussed above is preferred over direct use of these func-
tions. However, because the concatenation operator is overloaded to serve all three cases, there are
situations where use of one of the functions is helpful to avoid ambiguity. For example consider:
200
Data Types
```
SELECT ARRAY[1, 2] || '{3, 4}'; -- the untyped literal is taken as
```
an array
?column?
-----------
```
{1,2,3,4}
```
```
SELECT ARRAY[1, 2] || '7'; -- so is this one
```
```
ERROR: malformed array literal: "7"
```
```
SELECT ARRAY[1, 2] || NULL; -- so is an undecorated
```
NULL
?column?
----------
```
{1,2}
```
```
(1 row)
```
```
SELECT array_append(ARRAY[1, 2], NULL); -- this might have been
```
meant
array_append
--------------
```
{1,2,NULL}
```
In the examples above, the parser sees an integer array on one side of the concatenation operator,
and a constant of undetermined type on the other. The heuristic it uses to resolve the constant's type
is to assume it's of the same type as the operator's other input — in this case, integer array. So the
concatenation operator is presumed to represent array_cat, not array_append. When that's the
```
wrong choice, it could be fixed by casting the constant to the array's element type; but explicit use of
```
array_append might be a preferable solution.
8.15.5. Searching in Arrays
To search for a value in an array, each value must be checked. This can be done manually, if you know
the size of the array. For example:
SELECT * FROM sal_emp WHERE pay_by_quarter[1] = 10000 OR
pay_by_quarter[2] = 10000 OR
pay_by_quarter[3] = 10000 OR
```
pay_by_quarter[4] = 10000;
```
However, this quickly becomes tedious for large arrays, and is not helpful if the size of the array is
unknown. An alternative method is described in Section 9.25. The above query could be replaced by:
```
SELECT * FROM sal_emp WHERE 10000 = ANY (pay_by_quarter);
```
In addition, you can find rows where the array has all values equal to 10000 with:
```
SELECT * FROM sal_emp WHERE 10000 = ALL (pay_by_quarter);
```
Alternatively, the generate_subscripts function can be used. For example:
SELECT * FROM
```
(SELECT pay_by_quarter,
```
```
generate_subscripts(pay_by_quarter, 1) AS s
```
```
FROM sal_emp) AS foo
```
201
Data Types
```
WHERE pay_by_quarter[s] = 10000;
```
This function is described in Table 9.70.
You can also search an array using the && operator, which checks whether the left operand overlaps
with the right operand. For instance:
```
SELECT * FROM sal_emp WHERE pay_by_quarter && ARRAY[10000];
```
This and other array operators are further described in Section 9.19. It can be accelerated by an ap-
propriate index, as described in Section 11.2.
You can also search for specific values in an array using the array_position and array_po-
```
sitions functions. The former returns the subscript of the first occurrence of a value in an array;
```
the latter returns an array with the subscripts of all occurrences of the value in the array. For example:
SELECT
```
array_position(ARRAY['sun','mon','tue','wed','thu','fri','sat'],
```
```
'mon');
```
array_position
----------------
2
```
(1 row)
```
```
SELECT array_positions(ARRAY[1, 4, 3, 1, 3, 4, 2, 1], 1);
```
array_positions
-----------------
```
{1,4,8}
```
```
(1 row)
```
Tip
```
Arrays are not sets; searching for specific array elements can be a sign of database misdesign.
```
Consider using a separate table with a row for each item that would be an array element. This
will be easier to search, and is likely to scale better for a large number of elements.
8.15.6. Array Input and Output Syntax
The external text representation of an array value consists of items that are interpreted according to
the I/O conversion rules for the array's element type, plus decoration that indicates the array structure.
```
The decoration consists of curly braces ({ and }) around the array value plus delimiter characters
```
```
between adjacent items. The delimiter character is usually a comma (,) but can be something else: it
```
is determined by the typdelim setting for the array's element type. Among the standard data types
provided in the PostgreSQL distribution, all use a comma, except for type box, which uses a semicolon
```
(;). In a multidimensional array, each dimension (row, plane, cube, etc.) gets its own level of curly
```
braces, and delimiters must be written between adjacent curly-braced entities of the same level.
The array output routine will put double quotes around element values if they are empty strings, con-
tain curly braces, delimiter characters, double quotes, backslashes, or white space, or match the word
NULL. Double quotes and backslashes embedded in element values will be backslash-escaped. For
numeric data types it is safe to assume that double quotes will never appear, but for textual data types
one should be prepared to cope with either the presence or absence of quotes.
By default, the lower bound index value of an array's dimensions is set to one. To represent arrays
with other lower bounds, the array subscript ranges can be specified explicitly before writing the array
```
contents. This decoration consists of square brackets ([]) around each array dimension's lower and
```
202
Data Types
```
upper bounds, with a colon (:) delimiter character in between. The array dimension decoration is
```
```
followed by an equal sign (=). For example:
```
SELECT f1[1][-2][3] AS e1, f1[1][-1][5] AS e2
```
FROM (SELECT '[1:1][-2:-1][3:5]={{{1,2,3},{4,5,6}}}'::int[] AS f1)
```
```
AS ss;
```
e1 | e2
----+----
1 | 6
```
(1 row)
```
The array output routine will include explicit dimensions in its result only when there are one or more
lower bounds different from one.
```
If the value written for an element is NULL (in any case variant), the element is taken to be NULL.
```
The presence of any quotes or backslashes disables this and allows the literal string value “NULL”
to be entered. Also, for backward compatibility with pre-8.2 versions of PostgreSQL, the array_nulls
configuration parameter can be turned off to suppress recognition of NULL as a NULL.
As shown previously, when writing an array value you can use double quotes around any individual
array element. You must do so if the element value would otherwise confuse the array-value parser.
```
For example, elements containing curly braces, commas (or the data type's delimiter character), dou-
```
ble quotes, backslashes, or leading or trailing whitespace must be double-quoted. Empty strings and
strings matching the word NULL must be quoted, too. To put a double quote or backslash in a quoted
array element value, precede it with a backslash. Alternatively, you can avoid quotes and use back-
slash-escaping to protect all data characters that would otherwise be taken as array syntax.
You can add whitespace before a left brace or after a right brace. You can also add whitespace before
or after any individual item string. In all of these cases the whitespace will be ignored. However,
whitespace within double-quoted elements, or surrounded on both sides by non-whitespace characters
of an element, is not ignored.
Tip
```
The ARRAY constructor syntax (see Section 4.2.12) is often easier to work with than the ar-
```
ray-literal syntax when writing array values in SQL commands. In ARRAY, individual element
values are written the same way they would be written when not members of an array.
8.16. Composite Types
```
A composite type represents the structure of a row or record; it is essentially just a list of field names
```
and their data types. PostgreSQL allows composite types to be used in many of the same ways that
simple types can be used. For example, a column of a table can be declared to be of a composite type.
8.16.1. Declaration of Composite Types
Here are two simple examples of defining composite types:
```
CREATE TYPE complex AS (
```
r double precision,
i double precision
```
);
```
203
Data Types
```
CREATE TYPE inventory_item AS (
```
name text,
supplier_id integer,
price numeric
```
);
```
```
The syntax is comparable to CREATE TABLE, except that only field names and types can be specified;
```
```
no constraints (such as NOT NULL) can presently be included. Note that the AS keyword is essential;
```
without it, the system will think a different kind of CREATE TYPE command is meant, and you will
get odd syntax errors.
Having defined the types, we can use them to create tables:
```
CREATE TABLE on_hand (
```
item inventory_item,
count integer
```
);
```
```
INSERT INTO on_hand VALUES (ROW('fuzzy dice', 42, 1.99), 1000);
```
or functions:
```
CREATE FUNCTION price_extension(inventory_item, integer) RETURNS
```
numeric
```
AS 'SELECT $1.price * $2' LANGUAGE SQL;
```
```
SELECT price_extension(item, 10) FROM on_hand;
```
Whenever you create a table, a composite type is also automatically created, with the same name as
the table, to represent the table's row type. For example, had we said:
```
CREATE TABLE inventory_item (
```
name text,
supplier_id integer REFERENCES suppliers,
```
price numeric CHECK (price > 0)
```
```
);
```
then the same inventory_item composite type shown above would come into being as a byprod-
uct, and could be used just as above. Note however an important restriction of the current implemen-
```
tation: since no constraints are associated with a composite type, the constraints shown in the table
```
```
definition do not apply to values of the composite type outside the table. (To work around this, cre-
```
ate a domain over the composite type, and apply the desired constraints as CHECK constraints of the
```
domain.)
```
8.16.2. Constructing Composite Values
To write a composite value as a literal constant, enclose the field values within parentheses and separate
them by commas. You can put double quotes around any field value, and must do so if it contains
```
commas or parentheses. (More details appear below.) Thus, the general format of a composite constant
```
is the following:
```
'( val1 , val2 , ... )'
```
An example is:
204
Data Types
```
'("fuzzy dice",42,1.99)'
```
which would be a valid value of the inventory_item type defined above. To make a field be
NULL, write no characters at all in its position in the list. For example, this constant specifies a NULL
third field:
```
'("fuzzy dice",42,)'
```
If you want an empty string rather than NULL, write double quotes:
```
'("",42,)'
```
Here the first field is a non-NULL empty string, the third is NULL.
```
(These constants are actually only a special case of the generic type constants discussed in Sec-
```
tion 4.1.2.7. The constant is initially treated as a string and passed to the composite-type input con-
version routine. An explicit type specification might be necessary to tell which type to convert the
```
constant to.)
```
The ROW expression syntax can also be used to construct composite values. In most cases this is
considerably simpler to use than the string-literal syntax since you don't have to worry about multiple
layers of quoting. We already used this method above:
```
ROW('fuzzy dice', 42, 1.99)
```
```
ROW('', 42, NULL)
```
The ROW keyword is actually optional as long as you have more than one field in the expression,
so these can be simplified to:
```
('fuzzy dice', 42, 1.99)
```
```
('', 42, NULL)
```
The ROW expression syntax is discussed in more detail in Section 4.2.13.
8.16.3. Accessing Composite Types
To access a field of a composite column, one writes a dot and the field name, much like selecting a
field from a table name. In fact, it's so much like selecting from a table name that you often have to use
parentheses to keep from confusing the parser. For example, you might try to select some subfields
from our on_hand example table with something like:
```
SELECT item.name FROM on_hand WHERE item.price > 9.99;
```
This will not work since the name item is taken to be a table name, not a column name of on_hand,
per SQL syntax rules. You must write it like this:
```
SELECT (item).name FROM on_hand WHERE (item).price > 9.99;
```
```
or if you need to use the table name as well (for instance in a multitable query), like this:
```
```
SELECT (on_hand.item).name FROM on_hand WHERE (on_hand.item).price
```
```
> 9.99;
```
Now the parenthesized object is correctly interpreted as a reference to the item column, and then the
subfield can be selected from it.
205
Data Types
Similar syntactic issues apply whenever you select a field from a composite value. For instance, to
select just one field from the result of a function that returns a composite value, you'd need to write
something like:
```
SELECT (my_func(...)).field FROM ...
```
Without the extra parentheses, this will generate a syntax error.
The special field name * means “all fields”, as further explained in Section 8.16.5.
8.16.4. Modifying Composite Types
Here are some examples of the proper syntax for inserting and updating composite columns. First,
inserting or updating a whole column:
```
INSERT INTO mytab (complex_col) VALUES((1.1,2.2));
```
```
UPDATE mytab SET complex_col = ROW(1.1,2.2) WHERE ...;
```
```
The first example omits ROW, the second uses it; we could have done it either way.
```
We can update an individual subfield of a composite column:
```
UPDATE mytab SET complex_col.r = (complex_col).r + 1 WHERE ...;
```
```
Notice here that we don't need to (and indeed cannot) put parentheses around the column name ap-
```
pearing just after SET, but we do need parentheses when referencing the same column in the expres-
sion to the right of the equal sign.
And we can specify subfields as targets for INSERT, too:
```
INSERT INTO mytab (complex_col.r, complex_col.i) VALUES(1.1, 2.2);
```
Had we not supplied values for all the subfields of the column, the remaining subfields would have
been filled with null values.
8.16.5. Using Composite Types in Queries
There are various special syntax rules and behaviors associated with composite types in queries. These
rules provide useful shortcuts, but can be confusing if you don't know the logic behind them.
```
In PostgreSQL, a reference to a table name (or alias) in a query is effectively a reference to the com-
```
posite value of the table's current row. For example, if we had a table inventory_item as shown
above, we could write:
```
SELECT c FROM inventory_item c;
```
This query produces a single composite-valued column, so we might get output like:
c
------------------------
```
("fuzzy dice",42,1.99)
```
```
(1 row)
```
206
Data Types
Note however that simple names are matched to column names before table names, so this example
works only because there is no column named c in the query's tables.
The ordinary qualified-column-name syntax table_name.column_name can be understood as
```
applying field selection to the composite value of the table's current row. (For efficiency reasons, it's
```
```
not actually implemented that way.)
```
When we write
```
SELECT c.* FROM inventory_item c;
```
then, according to the SQL standard, we should get the contents of the table expanded into separate
```
columns:
```
name | supplier_id | price
------------+-------------+-------
fuzzy dice | 42 | 1.99
```
(1 row)
```
as if the query were
```
SELECT c.name, c.supplier_id, c.price FROM inventory_item c;
```
PostgreSQL will apply this expansion behavior to any composite-valued expression, although as
shown above, you need to write parentheses around the value that .* is applied to whenever it's not a
```
simple table name. For example, if myfunc() is a function returning a composite type with columns
```
a, b, and c, then these two queries have the same result:
```
SELECT (myfunc(x)).* FROM some_table;
```
```
SELECT (myfunc(x)).a, (myfunc(x)).b, (myfunc(x)).c FROM some_table;
```
Tip
PostgreSQL handles column expansion by actually transforming the first form into the second.
```
So, in this example, myfunc() would get invoked three times per row with either syntax. If
```
it's an expensive function you may wish to avoid that, which you can do with a query like:
```
SELECT m.* FROM some_table, LATERAL myfunc(x) AS m;
```
Placing the function in a LATERAL FROM item keeps it from being invoked more than once per
row. m.* is still expanded into m.a, m.b, m.c, but now those variables are just references
```
to the output of the FROM item. (The LATERAL keyword is optional here, but we show it to
```
```
clarify that the function is getting x from some_table.)
```
The composite_value.* syntax results in column expansion of this kind when it appears at the
top level of a SELECT output list, a RETURNING list in INSERT/UPDATE/DELETE/MERGE, a VAL-
```
UES clause, or a row constructor. In all other contexts (including when nested inside one of those
```
```
constructs), attaching .* to a composite value does not change the value, since it means “all columns”
```
```
and so the same composite value is produced again. For example, if somefunc() accepts a com-
```
posite-valued argument, these queries are the same:
```
SELECT somefunc(c.*) FROM inventory_item c;
```
```
SELECT somefunc(c) FROM inventory_item c;
```
207
Data Types
In both cases, the current row of inventory_item is passed to the function as a single compos-
ite-valued argument. Even though .* does nothing in such cases, using it is good style, since it makes
clear that a composite value is intended. In particular, the parser will consider c in c.* to refer to a
```
table name or alias, not to a column name, so that there is no ambiguity; whereas without .*, it is not
```
clear whether c means a table name or a column name, and in fact the column-name interpretation
will be preferred if there is a column named c.
Another example demonstrating these concepts is that all these queries mean the same thing:
```
SELECT * FROM inventory_item c ORDER BY c;
```
```
SELECT * FROM inventory_item c ORDER BY c.*;
```
```
SELECT * FROM inventory_item c ORDER BY ROW(c.*);
```
All of these ORDER BY clauses specify the row's composite value, resulting in sorting the rows ac-
cording to the rules described in Section 9.25.6. However, if inventory_item contained a column
named c, the first case would be different from the others, as it would mean to sort by that column
only. Given the column names previously shown, these queries are also equivalent to those above:
```
SELECT * FROM inventory_item c ORDER BY ROW(c.name, c.supplier_id,
```
```
c.price);
```
```
SELECT * FROM inventory_item c ORDER BY (c.name, c.supplier_id,
```
```
c.price);
```
```
(The last case uses a row constructor with the key word ROW omitted.)
```
Another special syntactical behavior associated with composite values is that we can use functional
notation for extracting a field of a composite value. The simple way to explain this is that the notations
```
field(table) and table.field are interchangeable. For example, these queries are equiva-
```
```
lent:
```
```
SELECT c.name FROM inventory_item c WHERE c.price > 1000;
```
```
SELECT name(c) FROM inventory_item c WHERE price(c) > 1000;
```
Moreover, if we have a function that accepts a single argument of a composite type, we can call it
with either notation. These queries are all equivalent:
```
SELECT somefunc(c) FROM inventory_item c;
```
```
SELECT somefunc(c.*) FROM inventory_item c;
```
```
SELECT c.somefunc FROM inventory_item c;
```
This equivalence between functional notation and field notation makes it possible to use functions on
composite types to implement “computed fields”. An application using the last query above wouldn't
need to be directly aware that somefunc isn't a real column of the table.
Tip
Because of this behavior, it's unwise to give a function that takes a single composite-type
argument the same name as any of the fields of that composite type. If there is ambiguity, the
field-name interpretation will be chosen if field-name syntax is used, while the function will
be chosen if function-call syntax is used. However, PostgreSQL versions before 11 always
chose the field-name interpretation, unless the syntax of the call required it to be a function
call. One way to force the function interpretation in older versions is to schema-qualify the
```
function name, that is, write schema.func(compositevalue).
```
208
Data Types
8.16.6. Composite Type Input and Output Syntax
The external text representation of a composite value consists of items that are interpreted according
to the I/O conversion rules for the individual field types, plus decoration that indicates the composite
```
structure. The decoration consists of parentheses (( and )) around the whole value, plus commas (,)
```
between adjacent items. Whitespace outside the parentheses is ignored, but within the parentheses it
is considered part of the field value, and might or might not be significant depending on the input
conversion rules for the field data type. For example, in:
```
'( 42)'
```
the whitespace will be ignored if the field type is integer, but not if it is text.
As shown previously, when writing a composite value you can write double quotes around any indi-
vidual field value. You must do so if the field value would otherwise confuse the composite-value
parser. In particular, fields containing parentheses, commas, double quotes, or backslashes must be
double-quoted. To put a double quote or backslash in a quoted composite field value, precede it with
```
a backslash. (Also, a pair of double quotes within a double-quoted field value is taken to represent a
```
```
double quote character, analogously to the rules for single quotes in SQL literal strings.) Alternatively,
```
you can avoid quoting and use backslash-escaping to protect all data characters that would otherwise
be taken as composite syntax.
```
A completely empty field value (no characters at all between the commas or parentheses) represents
```
a NULL. To write a value that is an empty string rather than NULL, write "".
The composite output routine will put double quotes around field values if they are empty strings or
```
contain parentheses, commas, double quotes, backslashes, or white space. (Doing so for white space
```
```
is not essential, but aids legibility.) Double quotes and backslashes embedded in field values will be
```
doubled.
Note
Remember that what you write in an SQL command will first be interpreted as a string literal,
```
and then as a composite. This doubles the number of backslashes you need (assuming escape
```
```
string syntax is used). For example, to insert a text field containing a double quote and a
```
backslash in a composite value, you'd need to write:
```
INSERT ... VALUES ('("\"\\")');
```
The string-literal processor removes one level of backslashes, so that what arrives at the com-
```
posite-value parser looks like ("\"\\"). In turn, the string fed to the text data type's input
```
```
routine becomes "\. (If we were working with a data type whose input routine also treated
```
backslashes specially, bytea for example, we might need as many as eight backslashes in
```
the command to get one backslash into the stored composite field.) Dollar quoting (see Sec-
```
```
tion 4.1.2.4) can be used to avoid the need to double backslashes.
```
Tip
The ROW constructor syntax is usually easier to work with than the composite-literal syntax
when writing composite values in SQL commands. In ROW, individual field values are written
the same way they would be written when not members of a composite.
8.17. Range Types
209
Data Types
```
Range types are data types representing a range of values of some element type (called the range's
```
```
subtype). For instance, ranges of timestamp might be used to represent the ranges of time that a
```
```
meeting room is reserved. In this case the data type is tsrange (short for “timestamp range”), and
```
timestamp is the subtype. The subtype must have a total order so that it is well-defined whether
element values are within, before, or after a range of values.
Range types are useful because they represent many element values in a single range value, and be-
cause concepts such as overlapping ranges can be expressed clearly. The use of time and date ranges
```
for scheduling purposes is the clearest example; but price ranges, measurement ranges from an instru-
```
ment, and so forth can also be useful.
Every range type has a corresponding multirange type. A multirange is an ordered list of non-contigu-
ous, non-empty, non-null ranges. Most range operators also work on multiranges, and they have a few
functions of their own.
8.17.1. Built-in Range and Multirange Types
PostgreSQL comes with the following built-in range types:
• int4range — Range of integer, int4multirange — corresponding Multirange
• int8range — Range of bigint, int8multirange — corresponding Multirange
• numrange — Range of numeric, nummultirange — corresponding Multirange
• tsrange — Range of timestamp without time zone, tsmultirange — correspond-
ing Multirange
• tstzrange — Range of timestamp with time zone, tstzmultirange — corre-
sponding Multirange
• daterange — Range of date, datemultirange — corresponding Multirange
```
In addition, you can define your own range types; see CREATE TYPE for more information.
```
8.17.2. Examples
```
CREATE TABLE reservation (room int, during tsrange);
```
INSERT INTO reservation VALUES
```
(1108, '[2010-01-01 14:30, 2010-01-01 15:30)');
```
-- Containment
```
SELECT int4range(10, 20) @> 3;
```
-- Overlaps
```
SELECT numrange(11.1, 22.2) && numrange(20.0, 30.0);
```
-- Extract the upper bound
```
SELECT upper(int8range(15, 25));
```
-- Compute the intersection
```
SELECT int4range(10, 20) * int4range(15, 25);
```
-- Is the range empty?
```
SELECT isempty(numrange(1, 5));
```
See Table 9.58 and Table 9.60 for complete lists of operators and functions on range types.
210
Data Types
8.17.3. Inclusive and Exclusive Bounds
Every non-empty range has two bounds, the lower bound and the upper bound. All points between
these values are included in the range. An inclusive bound means that the boundary point itself is
included in the range as well, while an exclusive bound means that the boundary point is not included
in the range.
In the text form of a range, an inclusive lower bound is represented by “[” while an exclusive lower
```
bound is represented by “(”. Likewise, an inclusive upper bound is represented by “]”, while an
```
```
exclusive upper bound is represented by “)”. (See Section 8.17.5 for more details.)
```
The functions lower_inc and upper_inc test the inclusivity of the lower and upper bounds of
a range value, respectively.
```
8.17.4. Infinite (Unbounded) Ranges
```
The lower bound of a range can be omitted, meaning that all values less than the upper bound are
```
included in the range, e.g., (,3]. Likewise, if the upper bound of the range is omitted, then all values
```
greater than the lower bound are included in the range. If both lower and upper bounds are omitted, all
values of the element type are considered to be in the range. Specifying a missing bound as inclusive
```
is automatically converted to exclusive, e.g., [,] is converted to (,). You can think of these missing
```
values as +/-infinity, but they are special range type values and are considered to be beyond any range
element type's +/-infinity values.
Element types that have the notion of “infinity” can use them as explicit bound values. For example,
```
with timestamp ranges, [today,infinity) excludes the special timestamp value infinity,
```
```
while [today,infinity] include it, as does [today,) and [today,].
```
The functions lower_inf and upper_inf test for infinite lower and upper bounds of a range,
respectively.
8.17.5. Range Input/Output
The input for a range value must follow one of the following patterns:
```
(lower-bound,upper-bound)
```
```
(lower-bound,upper-bound]
```
```
[lower-bound,upper-bound)
```
[lower-bound,upper-bound]
empty
The parentheses or brackets indicate whether the lower and upper bounds are exclusive or inclusive,
```
as described previously. Notice that the final pattern is empty, which represents an empty range (a
```
```
range that contains no points).
```
The lower-bound may be either a string that is valid input for the subtype, or empty to indicate
no lower bound. Likewise, upper-bound may be either a string that is valid input for the subtype,
or empty to indicate no upper bound.
```
Each bound value can be quoted using " (double quote) characters. This is necessary if the bound
```
value contains parentheses, brackets, commas, double quotes, or backslashes, since these characters
would otherwise be taken as part of the range syntax. To put a double quote or backslash in a quoted
```
bound value, precede it with a backslash. (Also, a pair of double quotes within a double-quoted bound
```
value is taken to represent a double quote character, analogously to the rules for single quotes in SQL
```
literal strings.) Alternatively, you can avoid quoting and use backslash-escaping to protect all data
```
characters that would otherwise be taken as range syntax. Also, to write a bound value that is an empty
string, write "", since writing nothing means an infinite bound.
211
Data Types
Whitespace is allowed before and after the range value, but any whitespace between the parentheses
```
or brackets is taken as part of the lower or upper bound value. (Depending on the element type, it
```
```
might or might not be significant.)
```
Note
These rules are very similar to those for writing field values in composite-type literals. See
Section 8.16.6 for additional commentary.
```
Examples:
```
-- includes 3, does not include 7, and does include all points in
between
```
SELECT '[3,7)'::int4range;
```
-- does not include either 3 or 7, but includes all points in
between
```
SELECT '(3,7)'::int4range;
```
-- includes only the single point 4
```
SELECT '[4,4]'::int4range;
```
```
-- includes no points (and will be normalized to 'empty')
```
```
SELECT '[4,4)'::int4range;
```
```
The input for a multirange is curly brackets ({ and }) containing zero or more valid ranges, separated
```
by commas. Whitespace is permitted around the brackets and commas. This is intended to be reminis-
cent of array syntax, although multiranges are much simpler: they have just one dimension and there
```
is no need to quote their contents. (The bounds of their ranges may be quoted as above however.)
```
```
Examples:
```
```
SELECT '{}'::int4multirange;
```
```
SELECT '{[3,7)}'::int4multirange;
```
```
SELECT '{[3,7), [8,9)}'::int4multirange;
```
8.17.6. Constructing Ranges and Multiranges
Each range type has a constructor function with the same name as the range type. Using the constructor
```
function is frequently more convenient than writing a range literal constant, since it avoids the need
```
for extra quoting of the bound values. The constructor function accepts two or three arguments. The
```
two-argument form constructs a range in standard form (lower bound inclusive, upper bound exclu-
```
```
sive), while the three-argument form constructs a range with bounds of the form specified by the third
```
```
argument. The third argument must be one of the strings “()”, “(]”, “[)”, or “[]”. For example:
```
-- The full form is: lower bound, upper bound, and text argument
indicating
-- inclusivity/exclusivity of bounds.
```
SELECT numrange(1.0, 14.0, '(]');
```
```
-- If the third argument is omitted, '[)' is assumed.
```
```
SELECT numrange(1.0, 14.0);
```
```
-- Although '(]' is specified here, on display the value will be
```
converted to
212
Data Types
```
-- canonical form, since int8range is a discrete range type (see
```
```
below).
```
```
SELECT int8range(1, 14, '(]');
```
-- Using NULL for either bound causes the range to be unbounded on
that side.
```
SELECT numrange(NULL, 2.2);
```
Each range type also has a multirange constructor with the same name as the multirange type. The
constructor function takes zero or more arguments which are all ranges of the appropriate type. For
```
example:
```
```
SELECT nummultirange();
```
```
SELECT nummultirange(numrange(1.0, 14.0));
```
```
SELECT nummultirange(numrange(1.0, 14.0), numrange(20.0, 25.0));
```
8.17.7. Discrete Range Types
A discrete range is one whose element type has a well-defined “step”, such as integer or date.
In these types two elements can be said to be adjacent, when there are no valid values between them.
```
This contrasts with continuous ranges, where it's always (or almost always) possible to identify other
```
element values between two given values. For example, a range over the numeric type is continu-
```
ous, as is a range over timestamp. (Even though timestamp has limited precision, and so could
```
theoretically be treated as discrete, it's better to consider it continuous since the step size is normally
```
not of interest.)
```
Another way to think about a discrete range type is that there is a clear idea of a “next” or “previous”
value for each element value. Knowing that, it is possible to convert between inclusive and exclusive
representations of a range's bounds, by choosing the next or previous element value instead of the one
```
originally given. For example, in an integer range type [4,8] and (3,9) denote the same set of
```
```
values; but this would not be so for a range over numeric.
```
A discrete range type should have a canonicalization function that is aware of the desired step size for
the element type. The canonicalization function is charged with converting equivalent values of the
range type to have identical representations, in particular consistently inclusive or exclusive bounds.
If a canonicalization function is not specified, then ranges with different formatting will always be
treated as unequal, even though they might represent the same set of values in reality.
The built-in range types int4range, int8range, and daterange all use a canonical form that
```
includes the lower bound and excludes the upper bound; that is, [). User-defined range types can use
```
other conventions, however.
8.17.8. Defining New Range Types
Users can define their own range types. The most common reason to do this is to use ranges over
subtypes not provided among the built-in range types. For example, to define a new range type of
subtype float8:
```
CREATE TYPE floatrange AS RANGE (
```
```
subtype = float8,
```
```
subtype_diff = float8mi
```
```
);
```
```
SELECT '[1.234, 5.678]'::floatrange;
```
Because float8 has no meaningful “step”, we do not define a canonicalization function in this ex-
ample.
213
Data Types
When you define your own range you automatically get a corresponding multirange type.
Defining your own range type also allows you to specify a different subtype B-tree operator class or
collation to use, so as to change the sort ordering that determines which values fall into a given range.
If the subtype is considered to have discrete rather than continuous values, the CREATE TYPE com-
mand should specify a canonical function. The canonicalization function takes an input range val-
ue, and must return an equivalent range value that may have different bounds and formatting. The
canonical output for two ranges that represent the same set of values, for example the integer ranges
```
[1, 7] and [1, 8), must be identical. It doesn't matter which representation you choose to be the
```
canonical one, so long as two equivalent values with different formattings are always mapped to the
same value with the same formatting. In addition to adjusting the inclusive/exclusive bounds format, a
canonicalization function might round off boundary values, in case the desired step size is larger than
what the subtype is capable of storing. For instance, a range type over timestamp could be defined
to have a step size of an hour, in which case the canonicalization function would need to round off
bounds that weren't a multiple of an hour, or perhaps throw an error instead.
In addition, any range type that is meant to be used with GiST or SP-GiST indexes should define a sub-
```
type difference, or subtype_diff, function. (The index will still work without subtype_diff,
```
```
but it is likely to be considerably less efficient than if a difference function is provided.) The subtype
```
```
difference function takes two input values of the subtype, and returns their difference (i.e., X minus
```
```
Y) represented as a float8 value. In our example above, the function float8mi that underlies the
```
```
regular float8 minus operator can be used; but for any other subtype, some type conversion would
```
be necessary. Some creative thought about how to represent differences as numbers might be needed,
too. To the greatest extent possible, the subtype_diff function should agree with the sort ordering
```
implied by the selected operator class and collation; that is, its result should be positive whenever its
```
first argument is greater than its second according to the sort ordering.
A less-oversimplified example of a subtype_diff function is:
```
CREATE FUNCTION time_subtype_diff(x time, y time) RETURNS float8 AS
```
```
'SELECT EXTRACT(EPOCH FROM (x - y))' LANGUAGE sql STRICT IMMUTABLE;
```
```
CREATE TYPE timerange AS RANGE (
```
```
subtype = time,
```
```
subtype_diff = time_subtype_diff
```
```
);
```
```
SELECT '[11:10, 23:00]'::timerange;
```
See CREATE TYPE for more information about creating range types.
8.17.9. Indexing
GiST and SP-GiST indexes can be created for table columns of range types. GiST indexes can be also
created for table columns of multirange types. For instance, to create a GiST index:
```
CREATE INDEX reservation_idx ON reservation USING GIST (during);
```
A GiST or SP-GiST index on ranges can accelerate queries involving these range operators: =, &&,
<@, @>, <<, >>, -|-, &<, and &>. A GiST index on multiranges can accelerate queries involving the
same set of multirange operators. A GiST index on ranges and GiST index on multiranges can also
accelerate queries involving these cross-type range to multirange and multirange to range operators
```
correspondingly: &&, <@, @>, <<, >>, -|-, &<, and &>. See Table 9.58 for more information.
```
In addition, B-tree and hash indexes can be created for table columns of range types. For these index
types, basically the only useful range operation is equality. There is a B-tree sort ordering defined for
214
Data Types
range values, with corresponding < and > operators, but the ordering is rather arbitrary and not usually
useful in the real world. Range types' B-tree and hash support is primarily meant to allow sorting and
hashing internally in queries, rather than creation of actual indexes.
8.17.10. Constraints on Ranges
While UNIQUE is a natural constraint for scalar values, it is usually unsuitable for range types. In-
```
stead, an exclusion constraint is often more appropriate (see CREATE TABLE ... CONSTRAINT ...
```
```
EXCLUDE). Exclusion constraints allow the specification of constraints such as “non-overlapping”
```
on a range type. For example:
```
CREATE TABLE reservation (
```
during tsrange,
```
EXCLUDE USING GIST (during WITH &&)
```
```
);
```
That constraint will prevent any overlapping values from existing in the table at the same time:
INSERT INTO reservation VALUES
```
('[2010-01-01 11:30, 2010-01-01 15:00)');
```
INSERT 0 1
INSERT INTO reservation VALUES
```
('[2010-01-01 14:45, 2010-01-01 15:45)');
```
```
ERROR: conflicting key value violates exclusion constraint
```
"reservation_during_excl"
```
DETAIL: Key (during)=(["2010-01-01 14:45:00","2010-01-01
```
```
15:45:00")) conflicts
```
```
with existing key (during)=(["2010-01-01 11:30:00","2010-01-01
```
```
15:00:00")).
```
You can use the btree_gist extension to define exclusion constraints on plain scalar data types,
which can then be combined with range exclusions for maximum flexibility. For example, after
btree_gist is installed, the following constraint will reject overlapping ranges only if the meeting
room numbers are equal:
```
CREATE EXTENSION btree_gist;
```
```
CREATE TABLE room_reservation (
```
room text,
during tsrange,
```
EXCLUDE USING GIST (room WITH =, during WITH &&)
```
```
);
```
INSERT INTO room_reservation VALUES
```
('123A', '[2010-01-01 14:00, 2010-01-01 15:00)');
```
INSERT 0 1
INSERT INTO room_reservation VALUES
```
('123A', '[2010-01-01 14:30, 2010-01-01 15:30)');
```
```
ERROR: conflicting key value violates exclusion constraint
```
"room_reservation_room_during_excl"
```
DETAIL: Key (room, during)=(123A, ["2010-01-01
```
```
14:30:00","2010-01-01 15:30:00")) conflicts
```
```
with existing key (room, during)=(123A, ["2010-01-01
```
```
14:00:00","2010-01-01 15:00:00")).
```
215
Data Types
INSERT INTO room_reservation VALUES
```
('123B', '[2010-01-01 14:30, 2010-01-01 15:30)');
```
INSERT 0 1
8.18. Domain Types
A domain is a user-defined data type that is based on another underlying type. Optionally, it can have
constraints that restrict its valid values to a subset of what the underlying type would allow. Otherwise
it behaves like the underlying type — for example, any operator or function that can be applied to the
underlying type will work on the domain type. The underlying type can be any built-in or user-defined
base type, enum type, array type, composite type, range type, or another domain.
For example, we could create a domain over integers that accepts only positive integers:
```
CREATE DOMAIN posint AS integer CHECK (VALUE > 0);
```
```
CREATE TABLE mytable (id posint);
```
```
INSERT INTO mytable VALUES(1); -- works
```
```
INSERT INTO mytable VALUES(-1); -- fails
```
When an operator or function of the underlying type is applied to a domain value, the domain is
automatically down-cast to the underlying type. Thus, for example, the result of mytable.id - 1 is
```
considered to be of type integer not posint. We could write (mytable.id - 1)::posint
```
to cast the result back to posint, causing the domain's constraints to be rechecked. In this case, that
would result in an error if the expression had been applied to an id value of 1. Assigning a value of
the underlying type to a field or variable of the domain type is allowed without writing an explicit
cast, but the domain's constraints will be checked.
For additional information see CREATE DOMAIN.
8.19. Object Identifier Types
```
Object identifiers (OIDs) are used internally by PostgreSQL as primary keys for various system tables.
```
Type oid represents an object identifier. There are also several alias types for oid, each named
regsomething. Table 8.26 shows an overview.
The oid type is currently implemented as an unsigned four-byte integer. Therefore, it is not large
enough to provide database-wide uniqueness in large databases, or even in large individual tables.
The oid type itself has few operations beyond comparison. It can be cast to integer, however, and
```
then manipulated using the standard integer operators. (Beware of possible signed-versus-unsigned
```
```
confusion if you do this.)
```
The OID alias types have no operations of their own except for specialized input and output routines.
These routines are able to accept and display symbolic names for system objects, rather than the raw
numeric value that type oid would use. The alias types allow simplified lookup of OID values for
objects. For example, to examine the pg_attribute rows related to a table mytable, one could
```
write:
```
```
SELECT * FROM pg_attribute WHERE attrelid = 'mytable'::regclass;
```
rather than:
SELECT * FROM pg_attribute
```
WHERE attrelid = (SELECT oid FROM pg_class WHERE relname =
```
```
'mytable');
```
216
Data Types
While that doesn't look all that bad by itself, it's still oversimplified. A far more complicated sub-
select would be needed to select the right OID if there are multiple tables named mytable in different
schemas. The regclass input converter handles the table lookup according to the schema path
setting, and so it does the “right thing” automatically. Similarly, casting a table's OID to regclass
is handy for symbolic display of a numeric OID.
Table 8.26. Object Identifier Types
Name References Description Value Example
oid any numeric object identifi-
er
564182
regclass pg_class relation name pg_type
regcollation pg_collation collation name "POSIX"
regconfig pg_ts_config text search configura-
tion
english
regdictionary pg_ts_dict text search dictionary simple
regnamespace pg_namespace namespace name pg_catalog
regoper pg_operator operator name +
regoperator pg_operator operator with argument
types
```
*(integer,inte-
```
```
ger) or -(NONE,
```
```
integer)
```
regproc pg_proc function name sum
regprocedure pg_proc function with argument
types
```
sum(int4)
```
regrole pg_authid role name smithee
regtype pg_type data type name integer
All of the OID alias types for objects that are grouped by namespace accept schema-qualified names,
and will display schema-qualified names on output if the object would not be found in the current
search path without being qualified. For example, myschema.mytable is acceptable input for
```
regclass (if there is such a table). That value might be output as myschema.mytable, or just
```
mytable, depending on the current search path. The regproc and regoper alias types will on-
```
ly accept input names that are unique (not overloaded), so they are of limited use; for most uses
```
regprocedure or regoperator are more appropriate. For regoperator, unary operators are
identified by writing NONE for the unused operand.
The input functions for these types allow whitespace between tokens, and will fold upper-case letters
```
to lower case, except within double quotes; this is done to make the syntax rules similar to the way
```
object names are written in SQL. Conversely, the output functions will use double quotes if needed
```
to make the output be a valid SQL identifier. For example, the OID of a function named Foo (with
```
```
upper case F) taking two integer arguments could be entered as ' "Foo" ( int, integer )
```
```
'::regprocedure. The output would look like "Foo"(integer,integer). Both the func-
```
tion name and the argument type names could be schema-qualified, too.
Many built-in PostgreSQL functions accept the OID of a table, or another kind of database object, and
```
for convenience are declared as taking regclass (or the appropriate OID alias type). This means
```
you do not have to look up the object's OID by hand, but can just enter its name as a string literal.
```
For example, the nextval(regclass) function takes a sequence relation's OID, so you could call
```
it like this:
```
nextval('foo') operates on sequence foo
```
```
nextval('FOO') same as above
```
```
nextval('"Foo"') operates on sequence Foo
```
217
Data Types
```
nextval('myschema.foo') operates on myschema.foo
```
```
nextval('"myschema".foo') same as above
```
```
nextval('foo') searches search path for foo
```
Note
When you write the argument of such a function as an unadorned literal string, it becomes
```
a constant of type regclass (or the appropriate type). Since this is really just an OID, it
```
will track the originally identified object despite later renaming, schema reassignment, etc.
This “early binding” behavior is usually desirable for object references in column defaults and
views. But sometimes you might want “late binding” where the object reference is resolved
at run time. To get late-binding behavior, force the constant to be stored as a text constant
instead of regclass:
```
nextval('foo'::text) foo is looked up at runtime
```
```
The to_regclass() function and its siblings can also be used to perform run-time lookups.
```
See Table 9.76.
Another practical example of use of regclass is to look up the OID of a table listed in the infor-
mation_schema views, which don't supply such OIDs directly. One might for example wish to call
```
the pg_relation_size() function, which requires the table OID. Taking the above rules into
```
account, the correct way to do that is
SELECT table_schema, table_name,
```
pg_relation_size((quote_ident(table_schema) || '.' ||
```
```
quote_ident(table_name))::regclass)
```
FROM information_schema.tables
WHERE ...
```
The quote_ident() function will take care of double-quoting the identifiers where needed. The
```
seemingly easier
```
SELECT pg_relation_size(table_name)
```
FROM information_schema.tables
WHERE ...
is not recommended, because it will fail for tables that are outside your search path or have names
that require quoting.
An additional property of most of the OID alias types is the creation of dependencies. If a constant
```
of one of these types appears in a stored expression (such as a column default expression or view),
```
it creates a dependency on the referenced object. For example, if a column has a default expres-
```
sion nextval('my_seq'::regclass), PostgreSQL understands that the default expression de-
```
pends on the sequence my_seq, so the system will not let the sequence be dropped without first re-
```
moving the default expression. The alternative of nextval('my_seq'::text) does not create
```
```
a dependency. (regrole is an exception to this property. Constants of this type are not allowed in
```
```
stored expressions.)
```
```
Another identifier type used by the system is xid, or transaction (abbreviated xact) identifier. This
```
is the data type of the system columns xmin and xmax. Transaction identifiers are 32-bit quantities.
In some contexts, a 64-bit variant xid8 is used. Unlike xid values, xid8 values increase strictly
monotonically and cannot be reused in the lifetime of a database cluster. See Section 67.1 for more
details.
218
Data Types
A third identifier type used by the system is cid, or command identifier. This is the data type of the
system columns cmin and cmax. Command identifiers are also 32-bit quantities.
```
A final identifier type used by the system is tid, or tuple identifier (row identifier). This is the data
```
```
type of the system column ctid. A tuple ID is a pair (block number, tuple index within block) that
```
identifies the physical location of the row within its table.
```
(The system columns are further explained in Section 5.6.)
```
8.20. pg_lsn Type
```
The pg_lsn data type can be used to store LSN (Log Sequence Number) data which is a pointer to
```
a location in the WAL. This type is a representation of XLogRecPtr and an internal system type
of PostgreSQL.
Internally, an LSN is a 64-bit integer, representing a byte position in the write-ahead log stream. It
```
is printed as two hexadecimal numbers of up to 8 digits each, separated by a slash; for example,
```
16/B374D848. The pg_lsn type supports the standard comparison operators, like = and >. Two
```
LSNs can be subtracted using the - operator; the result is the number of bytes separating those write-
```
ahead log locations. Also the number of bytes can be added into and subtracted from LSN using the
```
+(pg_lsn,numeric) and -(pg_lsn,numeric) operators, respectively. Note that the calcu-
```
lated LSN should be in the range of pg_lsn type, i.e., between 0/0 and FFFFFFFF/FFFFFFFF.
8.21. Pseudo-Types
The PostgreSQL type system contains a number of special-purpose entries that are collectively called
pseudo-types. A pseudo-type cannot be used as a column data type, but it can be used to declare a
function's argument or result type. Each of the available pseudo-types is useful in situations where a
function's behavior does not correspond to simply taking or returning a value of a specific SQL data
type. Table 8.27 lists the existing pseudo-types.
Table 8.27. Pseudo-Types
Name Description
any Indicates that a function accepts any input data type.
```
anyelement Indicates that a function accepts any data type (see Sec-
```
```
tion 36.2.5).
```
```
anyarray Indicates that a function accepts any array data type (see
```
```
Section 36.2.5).
```
anynonarray Indicates that a function accepts any non-array data type
```
(see Section 36.2.5).
```
```
anyenum Indicates that a function accepts any enum data type (see
```
```
Section 36.2.5 and Section 8.7).
```
```
anyrange Indicates that a function accepts any range data type (see
```
```
Section 36.2.5 and Section 8.17).
```
anymultirange Indicates that a function accepts any multirange data type
```
(see Section 36.2.5 and Section 8.17).
```
anycompatible Indicates that a function accepts any data type, with auto-
matic promotion of multiple arguments to a common data
```
type (see Section 36.2.5).
```
anycompatiblearray Indicates that a function accepts any array data type, with
automatic promotion of multiple arguments to a common
```
data type (see Section 36.2.5).
```
219
Data Types
Name Description
anycompatiblenonarray Indicates that a function accepts any non-array data type,
with automatic promotion of multiple arguments to a com-
```
mon data type (see Section 36.2.5).
```
anycompatiblerange Indicates that a function accepts any range data type, with
automatic promotion of multiple arguments to a common
```
data type (see Section 36.2.5 and Section 8.17).
```
anycompatiblemultirange Indicates that a function accepts any multirange data type,
with automatic promotion of multiple arguments to a com-
```
mon data type (see Section 36.2.5 and Section 8.17).
```
cstring Indicates that a function accepts or returns a null-terminat-
ed C string.
internal Indicates that a function accepts or returns a server-internal
data type.
language_handler A procedural language call handler is declared to return
language_handler.
fdw_handler A foreign-data wrapper handler is declared to return fd-
w_handler.
table_am_handler A table access method handler is declared to return ta-
ble_am_handler.
index_am_handler An index access method handler is declared to return in-
dex_am_handler.
tsm_handler A tablesample method handler is declared to return
tsm_handler.
record Identifies a function taking or returning an unspecified row
type.
trigger A trigger function is declared to return trigger.
event_trigger An event trigger function is declared to return even-
t_trigger.
pg_ddl_command Identifies a representation of DDL commands that is avail-
able to event triggers.
void Indicates that a function returns no value.
unknown Identifies a not-yet-resolved type, e.g., of an undecorated
string literal.
```
Functions coded in C (whether built-in or dynamically loaded) can be declared to accept or return any
```
of these pseudo-types. It is up to the function author to ensure that the function will behave safely
when a pseudo-type is used as an argument type.
Functions coded in procedural languages can use pseudo-types only as allowed by their implemen-
tation languages. At present most procedural languages forbid use of a pseudo-type as an argument
```
type, and allow only void and record as a result type (plus trigger or event_trigger when
```
```
the function is used as a trigger or event trigger). Some also support polymorphic functions using the
```
polymorphic pseudo-types, which are shown above and discussed in detail in Section 36.2.5.
The internal pseudo-type is used to declare functions that are meant only to be called internally
by the database system, and not by direct invocation in an SQL query. If a function has at least one
internal-type argument then it cannot be called from SQL. To preserve the type safety of this
restriction it is important to follow this coding rule: do not create any function that is declared to return
internal unless it has at least one internal argument.
220
