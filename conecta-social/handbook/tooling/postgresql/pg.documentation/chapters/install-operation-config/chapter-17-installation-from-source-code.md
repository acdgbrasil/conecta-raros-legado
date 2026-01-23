Chapter 17. Installation from Source
Code
This chapter describes the installation of PostgreSQL using the source code distribution. If you are
installing a pre-packaged distribution, such as an RPM or Debian package, ignore this chapter and
see Chapter 16 instead.
17.1. Requirements
In general, a modern Unix-compatible platform should be able to run PostgreSQL. The platforms that
had received specific testing at the time of release are described in Section 17.6 below.
The following software packages are required for building PostgreSQL:
```
• GNU make version 3.81 or newer is required; other make programs or older GNU make versions
```
```
will not work. (GNU make is sometimes installed under the name gmake.) To test for GNU make
```
```
enter:
```
make --version
• Alternatively, PostgreSQL can be built using Meson1. This is the only option for building Post-
greSQL on Windows using Visual Studio. For other platforms, using Meson is currently experi-
mental. If you choose to use Meson, then you don't need GNU make, but the other requirements
below still apply.
The minimum required version of Meson is 0.54.
```
• You need an ISO/ANSI C compiler (at least C99-compliant). Recent versions of GCC are recom-
```
mended, but PostgreSQL is known to build using a wide variety of compilers from different vendors.
• tar is required to unpack the source distribution, in addition to either gzip or bzip2.
• Flex and Bison are required. Other lex and yacc programs cannot be used. Bison needs to be
at least version 2.3.
```
• Perl 5.14 or later is needed during the build process and to run some test suites. (This requirement
```
```
is separate from the requirements for building PL/Perl; see below.)
```
```
• The GNU Readline library is used by default. It allows psql (the PostgreSQL command line SQL
```
```
interpreter) to remember each command you type, and allows you to use arrow keys to recall and edit
```
previous commands. This is very helpful and is strongly recommended. If you don't want to use it
then you must specify the --without-readline option to configure. As an alternative, you
can often use the BSD-licensed libedit library, originally developed on NetBSD. The libedit
library is GNU Readline-compatible and is used if libreadline is not found, or if --with-
libedit-preferred is used as an option to configure. If you are using a package-based
Linux distribution, be aware that you need both the readline and readline-devel packages,
if those are separate in your distribution.
• The zlib compression library is used by default. If you don't want to use it then you must specify
the --without-zlib option to configure. Using this option disables support for compressed
archives in pg_dump and pg_restore.
• The ICU library is used by default. If you don't want to use it then you must specify the --with-
out-icu option to configure. Using this option disables support for ICU collation features
```
(see Section 23.2).
```
1 https://mesonbuild.com/
569
Installation from Source Code
ICU support requires the ICU4C package to be installed. The minimum required version of ICU4C
is currently 4.2.
By default, pkg-config will be used to find the required compilation options. This is supported for
ICU4C version 4.6 and later. For older versions, or if pkg-config is not available, the variables
ICU_CFLAGS and ICU_LIBS can be specified to configure, like in this example:
./configure ... ICU_CFLAGS='-I/some/where/include' ICU_LIBS='-L/
some/where/lib -licui18n -licuuc -licudata'
```
(If ICU4C is in the default search path for the compiler, then you still need to specify nonempty
```
```
strings in order to avoid use of pkg-config, for example, ICU_CFLAGS=' '.)
```
The following packages are optional. They are not required in the default configuration, but they are
needed when certain build options are enabled, as explained below:
• To build the server programming language PL/Perl you need a full Perl installation, including the
libperl library and the header files. The minimum required version is Perl 5.14. Since PL/Perl
will be a shared library, the libperl library must be a shared library also on most platforms.
This appears to be the default in recent Perl versions, but it was not in earlier versions, and in any
case it is the choice of whomever installed Perl at your site. configure will fail if building PL/
Perl is selected but it cannot find a shared libperl. In that case, you will have to rebuild and
install Perl manually to be able to build PL/Perl. During the configuration process for Perl, request
a shared library.
If you intend to make more than incidental use of PL/Perl, you should ensure that the Perl installation
```
was built with the usemultiplicity option enabled (perl -V will show whether this is the
```
```
case).
```
• To build the PL/Python server programming language, you need a Python installation with the
header files and the sysconfig module. The minimum supported version is Python 3.6.8.
Since PL/Python will be a shared library, the libpython library must be a shared library also on
most platforms. This is not the case in a default Python installation built from source, but a shared
library is available in many operating system distributions. configure will fail if building PL/
Python is selected but it cannot find a shared libpython. That might mean that you either have
```
to install additional packages or rebuild (part of) your Python installation to provide this shared
```
library. When building from source, run Python's configure with the --enable-shared flag.
• To build the PL/Tcl procedural language, you of course need a Tcl installation. The minimum re-
quired version is Tcl 8.4.
```
• To enable Native Language Support (NLS), that is, the ability to display a program's messages in a
```
language other than English, you need an implementation of the Gettext API. Some operating sys-
```
tems have this built-in (e.g., Linux, NetBSD, Solaris), for other systems you can download an add-
```
on package from https://www.gnu.org/software/gettext/. If you are using the Gettext implementa-
tion in the GNU C library, then you will additionally need the GNU Gettext package for some utility
programs. For any of the other implementations you will not need it.
• You need OpenSSL, if you want to support encrypted client connections. OpenSSL is also required
```
for random number generation on platforms that do not have /dev/urandom (except Windows).
```
The minimum required version is 1.1.1.
Additionally, LibreSSL is supported using the OpenSSL compatibility layer. The minimum required
```
version is 3.4 (from OpenBSD version 7.0).
```
```
• You need MIT Kerberos (for GSSAPI), OpenLDAP, and/or PAM, if you want to support authen-
```
tication using those services.
570
Installation from Source Code
• You need Curl to build an optional module which implements the OAuth Device Authorization
flow for client applications.
```
• You need LZ4, if you want to support compression of data with that method; see default_toast_com-
```
pression and wal_compression.
```
• You need Zstandard, if you want to support compression of data with that method; see wal_com-
```
pression. The minimum required version is 1.4.0.
```
• To build the PostgreSQL documentation, there is a separate set of requirements; see Section J.2.
```
```
If you need to get a GNU package, you can find it at your local GNU mirror site (see https://
```
```
www.gnu.org/prep/ftp for a list) or at ftp://ftp.gnu.org/gnu/.
```
17.2. Getting the Source
The PostgreSQL source code for released versions can be obtained from the download section of our
```
website: https://www.postgresql.org/ftp/source/. Download the postgresql-version.tar.gz
```
or postgresql-version.tar.bz2 file you're interested in, then unpack it:
tar xf postgresql-version.tar.bz2
This will create a directory postgresql-version under the current directory with the Post-
greSQL sources. Change into that directory for the rest of the installation procedure.
```
Alternatively, you can use the Git version control system; see Section I.1 for more information.
```
17.3. Building and Installation with Autoconf
and Make
17.3.1. Short Version
./configure
make
su
make install
adduser postgres
mkdir -p /usr/local/pgsql/data
chown postgres /usr/local/pgsql/data
su - postgres
/usr/local/pgsql/bin/initdb -D /usr/local/pgsql/data
/usr/local/pgsql/bin/pg_ctl -D /usr/local/pgsql/data -l logfile
start
/usr/local/pgsql/bin/createdb test
/usr/local/pgsql/bin/psql test
The long version is the rest of this section.
17.3.2. Installation Procedure
1. Configuration
The first step of the installation procedure is to configure the source tree for your system and
choose the options you would like. This is done by running the configure script. For a default
installation simply enter:
571
Installation from Source Code
./configure
This script will run a number of tests to determine values for various system dependent variables
and detect any quirks of your operating system, and finally will create several files in the build
tree to record what it found.
You can also run configure in a directory outside the source tree, and then build there, if you
want to keep the build directory separate from the original source files. This procedure is called
a VPATH build. Here's how:
mkdir build_dir
cd build_dir
/path/to/source/tree/configure [options go here]
make
The default configuration will build the server and utilities, as well as all client applications and
interfaces that require only a C compiler. All files will be installed under /usr/local/pgsql
by default.
You can customize the build and installation process by supplying one or more command line
options to configure. Typically you would customize the install location, or the set of option-
al features that are built. configure has a large number of options, which are described in
Section 17.3.3.
Also, configure responds to certain environment variables, as described in Section 17.3.4.
These provide additional ways to customize the configuration.
2. Build
To start the build, type either of:
make
make all
```
(Remember to use GNU make.) The build will take a few minutes depending on your hardware.
```
```
If you want to build everything that can be built, including the documentation (HTML and man
```
```
pages), and the additional modules (contrib), type instead:
```
make world
```
If you want to build everything that can be built, including the additional modules (contrib),
```
but without the documentation, type instead:
make world-bin
If you want to invoke the build from another makefile rather than manually, you must unset
MAKELEVEL or set it to zero, for instance like this:
build-postgresql:
```
$(MAKE) -C postgresql MAKELEVEL=0 all
```
Failure to do that can lead to strange error messages, typically about missing header files.
572
Installation from Source Code
3. Regression Tests
If you want to test the newly built server before you install it, you can run the regression tests at
this point. The regression tests are a test suite to verify that PostgreSQL runs on your machine
in the way the developers expected it to. Type:
make check
```
(This won't work as root; do it as an unprivileged user.) See Chapter 31 for detailed information
```
about interpreting the test results. You can repeat this test at any later time by issuing the same
command.
4. Installing the Files
Note
If you are upgrading an existing system be sure to read Section 18.6, which has instruc-
tions about upgrading a cluster.
To install PostgreSQL enter:
make install
This will install files into the directories that were specified in Step 1. Make sure that you have
appropriate permissions to write into that area. Normally you need to do this step as root. Alter-
natively, you can create the target directories in advance and arrange for appropriate permissions
to be granted.
```
To install the documentation (HTML and man pages), enter:
```
make install-docs
If you built the world above, type instead:
make install-world
This also installs the documentation.
If you built the world without the documentation above, type instead:
make install-world-bin
You can use make install-strip instead of make install to strip the executable files
and libraries as they are installed. This will save some space. If you built with debugging support,
stripping will effectively remove the debugging support, so it should only be done if debugging
is no longer needed. install-strip tries to do a reasonable job saving space, but it does not
have perfect knowledge of how to strip every unneeded byte from an executable file, so if you
want to save all the disk space you possibly can, you will have to do manual work.
The standard installation provides all the header files needed for client application development
as well as for server-side program development, such as custom functions or data types written
in C.
573
Installation from Source Code
Client-only installation: If you want to install only the client applications and interface li-
braries, then you can use these commands:
make -C src/bin install
make -C src/include install
make -C src/interfaces install
make -C doc install
src/bin has a few binaries for server-only use, but they are small.
```
Uninstallation: To undo the installation use the command make uninstall. However, this
```
will not remove any created directories.
```
Cleaning: After the installation you can free disk space by removing the built files from the source
```
tree with the command make clean. This will preserve the files made by the configure program,
so that you can rebuild everything with make later on. To reset the source tree to the state in which
it was distributed, use make distclean. If you are going to build for several platforms within the
```
same source tree you must do this and re-configure for each platform. (Alternatively, use a separate
```
```
build tree for each platform, so that the source tree remains unmodified.)
```
If you perform a build and then discover that your configure options were wrong, or if you change
```
anything that configure investigates (for example, software upgrades), then it's a good idea to do
```
make distclean before reconfiguring and rebuilding. Without this, your changes in configuration
choices might not propagate everywhere they need to.
17.3.3. configure Options
```
configure's command line options are explained below. This list is not exhaustive (use ./con-
```
```
figure --help to get one that is). The options not covered here are meant for advanced use-cases
```
such as cross-compilation, and are documented in the standard Autoconf documentation.
17.3.3.1. Installation Locations
These options control where make install will put the files. The --prefix option is sufficient
for most cases. If you have special needs, you can customize the installation subdirectories with the
other options described in this section. Beware however that changing the relative locations of the dif-
ferent subdirectories may render the installation non-relocatable, meaning you won't be able to move
```
it after installation. (The man and doc locations are not affected by this restriction.) For relocatable
```
installs, you might want to use the --disable-rpath option described later.
--prefix=PREFIX
Install all files under the directory PREFIX instead of /usr/local/pgsql. The actual files
```
will be installed into various subdirectories; no files will ever be installed directly into the PRE-
```
FIX directory.
--exec-prefix=EXEC-PREFIX
You can install architecture-dependent files under a different prefix, EXEC-PREFIX, than what
PREFIX was set to. This can be useful to share architecture-independent files between hosts. If
you omit this, then EXEC-PREFIX is set equal to PREFIX and both architecture-dependent and
independent files will be installed under the same tree, which is probably what you want.
--bindir=DIRECTORY
Specifies the directory for executable programs. The default is EXEC-PREFIX/bin, which nor-
mally means /usr/local/pgsql/bin.
574
Installation from Source Code
--sysconfdir=DIRECTORY
Sets the directory for various configuration files, PREFIX/etc by default.
--libdir=DIRECTORY
Sets the location to install libraries and dynamically loadable modules. The default is EX-
EC-PREFIX/lib.
--includedir=DIRECTORY
Sets the directory for installing C and C++ header files. The default is PREFIX/include.
--datarootdir=DIRECTORY
Sets the root directory for various types of read-only data files. This only sets the default for some
of the following options. The default is PREFIX/share.
--datadir=DIRECTORY
Sets the directory for read-only data files used by the installed programs. The default is DATA-
ROOTDIR. Note that this has nothing to do with where your database files will be placed.
--localedir=DIRECTORY
Sets the directory for installing locale data, in particular message translation catalog files. The
default is DATAROOTDIR/locale.
--mandir=DIRECTORY
The man pages that come with PostgreSQL will be installed under this directory, in their respective
manx subdirectories. The default is DATAROOTDIR/man.
--docdir=DIRECTORY
Sets the root directory for installing documentation files, except “man” pages. This only sets the
default for the following options. The default value for this option is DATAROOTDIR/doc/
postgresql.
--htmldir=DIRECTORY
The HTML-formatted documentation for PostgreSQL will be installed under this directory. The
default is DATAROOTDIR.
Note
Care has been taken to make it possible to install PostgreSQL into shared installation loca-
```
tions (such as /usr/local/include) without interfering with the namespace of the rest
```
of the system. First, the string “/postgresql” is automatically appended to datadir,
sysconfdir, and docdir, unless the fully expanded directory name already contains the
string “postgres” or “pgsql”. For example, if you choose /usr/local as prefix, the
documentation will be installed in /usr/local/doc/postgresql, but if the prefix is /
opt/postgres, then it will be in /opt/postgres/doc. The public C header files of the
client interfaces are installed into includedir and are namespace-clean. The internal head-
er files and the server header files are installed into private directories under includedir.
See the documentation of each interface for information about how to access its header files.
Finally, a private subdirectory will also be created, if appropriate, under libdir for dynam-
ically loadable modules.
575
Installation from Source Code
17.3.3.2. PostgreSQL Features
The options described in this section enable building of various PostgreSQL features that are not built
by default. Most of these are non-default only because they require additional software, as described
in Section 17.1.
--enable-nls[=LANGUAGES]
```
Enables Native Language Support (NLS), that is, the ability to display a program's messages in
```
a language other than English. LANGUAGES is an optional space-separated list of codes of the
```
languages that you want supported, for example --enable-nls='de fr'. (The intersection
```
```
between your list and the set of actually provided translations will be computed automatically.)
```
If you do not specify a list, then all available translations are installed.
To use this option, you will need an implementation of the Gettext API.
--with-perl
Build the PL/Perl server-side language.
--with-python
Build the PL/Python server-side language.
--with-tcl
Build the PL/Tcl server-side language.
--with-tclconfig=DIRECTORY
Tcl installs the file tclConfig.sh, which contains configuration information needed to build
modules interfacing to Tcl. This file is normally found automatically at a well-known location,
but if you want to use a different version of Tcl you can specify the directory in which to look
for tclConfig.sh.
--with-llvm
```
Build with support for LLVM based JIT compilation (see Chapter 30). This requires the LLVM
```
library to be installed. The minimum required version of LLVM is currently 14.
llvm-config will be used to find the required compilation options. llvm-config will be
searched for in your PATH. If that would not yield the desired program, use LLVM_CONFIG to
specify a path to the correct llvm-config. For example
./configure ... --with-llvm LLVM_CONFIG='/path/to/llvm/bin/llvm-
config'
```
LLVM support requires a compatible clang compiler (specified, if necessary, using the CLANG
```
```
environment variable), and a working C++ compiler (specified, if necessary, using the CXX en-
```
```
vironment variable).
```
--with-lz4
Build with LZ4 compression support.
--with-zstd
Build with Zstandard compression support.
576
Installation from Source Code
--with-ssl=LIBRARY
```
Build with support for SSL (encrypted) connections. The only LIBRARY supported is openssl,
```
which is used for both OpenSSL and LibreSSL. This requires the OpenSSL package to be in-
stalled. configure will check for the required header files and libraries to make sure that your
OpenSSL installation is sufficient before proceeding.
--with-openssl
Obsolete equivalent of --with-ssl=openssl.
--with-gssapi
Build with support for GSSAPI authentication. MIT Kerberos is required to be installed for
```
GSSAPI. On many systems, the GSSAPI system (a part of the MIT Kerberos installation) is not
```
```
installed in a location that is searched by default (e.g., /usr/include, /usr/lib), so you
```
must use the options --with-includes and --with-libraries in addition to this op-
tion. configure will check for the required header files and libraries to make sure that your
GSSAPI installation is sufficient before proceeding.
--with-ldap
```
Build with LDAP support for authentication and connection parameter lookup (see Section 32.18
```
```
and Section 20.10 for more information). On Unix, this requires the OpenLDAP package to be
```
installed. On Windows, the default WinLDAP library is used. configure will check for the
required header files and libraries to make sure that your OpenLDAP installation is sufficient
before proceeding.
--with-pam
```
Build with PAM (Pluggable Authentication Modules) support.
```
--with-bsd-auth
```
Build with BSD Authentication support. (The BSD Authentication framework is currently only
```
```
available on OpenBSD.)
```
--with-systemd
Build with support for systemd service notifications. This improves integration if the server is
```
started under systemd but has no impact otherwise; see Section 18.3 for more information. lib-
```
systemd and the associated header files need to be installed to use this option.
--with-bonjour
Build with support for Bonjour automatic service discovery. This requires Bonjour support in
your operating system. Recommended on macOS.
--with-uuid=LIBRARY
```
Build the uuid-ossp module (which provides functions to generate UUIDs), using the specified
```
UUID library. LIBRARY must be one of:
• bsd to use the UUID functions found in FreeBSD and some other BSD-derived systems
```
• e2fs to use the UUID library created by the e2fsprogs project; this library is present in
```
most Linux systems and in macOS, and can be obtained for other platforms as well
• ossp to use the OSSP UUID library2
2 http://www.ossp.org/pkg/lib/uuid/
577
Installation from Source Code
--with-ossp-uuid
Obsolete equivalent of --with-uuid=ossp.
--with-libcurl
Build with libcurl support for OAuth 2.0 client flows. Libcurl version 7.61.0 or later is required
for this feature. Building with this will check for the required header files and libraries to make
sure that your curl installation is sufficient before proceeding.
--with-libnuma
Build with libnuma support for basic NUMA support. Only supported on platforms for which the
libnuma library is implemented.
--with-liburing
Build with liburing, enabling io_uring support for asynchronous I/O.
To detect the required compiler and linker options, PostgreSQL will query pkg-config.
To use a liburing installation that is in an unusual location, you can set pkg-config-related
```
environment variables (see its documentation).
```
--with-libxml
Build with libxml2, enabling SQL/XML support. Libxml2 version 2.6.23 or later is required for
this feature.
To detect the required compiler and linker options, PostgreSQL will query pkg-config, if that
is installed and knows about libxml2. Otherwise the program xml2-config, which is installed
by libxml2, will be used if it is found. Use of pkg-config is preferred, because it can deal with
multi-architecture installations better.
To use a libxml2 installation that is in an unusual location, you can set pkg-config-related
```
environment variables (see its documentation), or set the environment variable XML2_CONFIG
```
to point to the xml2-config program belonging to the libxml2 installation, or set the vari-
```
ables XML2_CFLAGS and XML2_LIBS. (If pkg-config is installed, then to override its idea
```
of where libxml2 is you must either set XML2_CONFIG or set both XML2_CFLAGS and XM-
```
L2_LIBS to nonempty strings.)
```
--with-libxslt
Build with libxslt, enabling the xml2 module to perform XSL transformations of XML. --with-
libxml must be specified as well.
--with-selinux
Build with SElinux support, enabling the sepgsql extension.
17.3.3.3. Anti-Features
The options described in this section allow disabling certain PostgreSQL features that are built by
default, but which might need to be turned off if the required software or system features are not
available. Using these options is not recommended unless really necessary.
--without-icu
```
Build without support for the ICU library, disabling the use of ICU collation features (see Sec-
```
```
tion 23.2).
```
578
Installation from Source Code
--without-readline
```
Prevents use of the Readline library (and libedit as well). This option disables command-line
```
editing and history in psql.
--with-libedit-preferred
Favors the use of the BSD-licensed libedit library rather than GPL-licensed Readline. This option
```
is significant only if you have both libraries installed; the default in that case is to use Readline.
```
--without-zlib
Prevents use of the Zlib library. This disables support for compressed archives in pg_dump and
pg_restore.
17.3.3.4. Build Process Details
--with-includes=DIRECTORIES
DIRECTORIES is a colon-separated list of directories that will be added to the list the compiler
```
searches for header files. If you have optional packages (such as GNU Readline) installed in a
```
non-standard location, you have to use this option and probably also the corresponding --with-
libraries option.
```
Example: --with-includes=/opt/gnu/include:/usr/sup/include.
```
--with-libraries=DIRECTORIES
DIRECTORIES is a colon-separated list of directories to search for libraries. You will probably
```
have to use this option (and the corresponding --with-includes option) if you have packages
```
installed in non-standard locations.
```
Example: --with-libraries=/opt/gnu/lib:/usr/sup/lib.
```
--with-system-tzdata=DIRECTORY
PostgreSQL includes its own time zone database, which it requires for date and time operations.
This time zone database is in fact compatible with the IANA time zone database provided by
many operating systems such as FreeBSD, Linux, and Solaris, so it would be redundant to install
it again. When this option is used, the system-supplied time zone database in DIRECTORY is used
instead of the one included in the PostgreSQL source distribution. DIRECTORY must be specified
as an absolute path. /usr/share/zoneinfo is a likely directory on some operating systems.
Note that the installation routine will not detect mismatching or erroneous time zone data. If you
use this option, you are advised to run the regression tests to verify that the time zone data you
have pointed to works correctly with PostgreSQL.
This option is mainly aimed at binary package distributors who know their target operating system
well. The main advantage of using this option is that the PostgreSQL package won't need to be
upgraded whenever any of the many local daylight-saving time rules change. Another advantage
is that PostgreSQL can be cross-compiled more straightforwardly if the time zone database files
do not need to be built during the installation.
--with-extra-version=STRING
Append STRING to the PostgreSQL version number. You can use this, for example, to mark
binaries built from unreleased Git snapshots or containing custom patches with an extra version
string, such as a git describe identifier or a distribution package release number.
--disable-rpath
Do not mark PostgreSQL's executables to indicate that they should search for shared libraries
```
in the installation's library directory (see --libdir). On most platforms, this marking uses an
```
579
Installation from Source Code
absolute path to the library directory, so that it will be unhelpful if you relocate the installation
later. However, you will then need to provide some other way for the executables to find the shared
libraries. Typically this requires configuring the operating system's dynamic linker to search the
```
library directory; see Section 17.5.1 for more detail.
```
17.3.3.5. Miscellaneous
It's fairly common, particularly for test builds, to adjust the default port number with --with-pg-
port. The other options in this section are recommended only for advanced users.
--with-pgport=NUMBER
Set NUMBER as the default port number for server and clients. The default is 5432. The port can
always be changed later on, but if you specify it here then both server and clients will have the
same default compiled in, which can be very convenient. Usually the only good reason to select
a non-default value is if you intend to run multiple PostgreSQL servers on the same machine.
--with-krb-srvnam=NAME
The default name of the Kerberos service principal used by GSSAPI. postgres is the default.
There's usually no reason to change this unless you are building for a Windows environment, in
which case it must be set to upper case POSTGRES.
--with-segsize=SEGSIZE
Set the segment size, in gigabytes. Large tables are divided into multiple operating-system files,
each of size equal to the segment size. This avoids problems with file size limits that exist on
many platforms. The default segment size, 1 gigabyte, is safe on all supported platforms. If your
```
operating system has “largefile” support (which most do, nowadays), you can use a larger segment
```
size. This can be helpful to reduce the number of file descriptors consumed when working with
very large tables. But be careful not to select a value larger than is supported by your platform and
the file systems you intend to use. Other tools you might wish to use, such as tar, could also set
limits on the usable file size. It is recommended, though not absolutely required, that this value
be a power of 2. Note that changing this value breaks on-disk database compatibility, meaning
you cannot use pg_upgrade to upgrade to a build with a different segment size.
--with-blocksize=BLOCKSIZE
Set the block size, in kilobytes. This is the unit of storage and I/O within tables. The default, 8
```
kilobytes, is suitable for most situations; but other values may be useful in special cases. The
```
```
value must be a power of 2 between 1 and 32 (kilobytes). Note that changing this value breaks on-
```
disk database compatibility, meaning you cannot use pg_upgrade to upgrade to a build with
a different block size.
--with-wal-blocksize=BLOCKSIZE
Set the WAL block size, in kilobytes. This is the unit of storage and I/O within the WAL log.
```
The default, 8 kilobytes, is suitable for most situations; but other values may be useful in special
```
```
cases. The value must be a power of 2 between 1 and 64 (kilobytes). Note that changing this value
```
breaks on-disk database compatibility, meaning you cannot use pg_upgrade to upgrade to a
build with a different WAL block size.
17.3.3.6. Developer Options
Most of the options in this section are only of interest for developing or debugging PostgreSQL. They
are not recommended for production builds, except for --enable-debug, which can be useful to
enable detailed bug reports in the unlucky event that you encounter a bug. On platforms supporting
DTrace, --enable-dtrace may also be reasonable to use in production.
580
Installation from Source Code
When building an installation that will be used to develop code inside the server, it is recommended
to use at least the options --enable-debug and --enable-cassert.
--enable-debug
Compiles all programs and libraries with debugging symbols. This means that you can run the
programs in a debugger to analyze problems. This enlarges the size of the installed executables
considerably, and on non-GCC compilers it usually also disables compiler optimization, causing
slowdowns. However, having the symbols available is extremely helpful for dealing with any
problems that might arise. Currently, this option is recommended for production installations only
if you use GCC. But you should always have it on if you are doing development work or running
a beta version.
--enable-cassert
Enables assertion checks in the server, which test for many “cannot happen” conditions. This is
invaluable for code development purposes, but the tests can slow down the server significantly.
Also, having the tests turned on won't necessarily enhance the stability of your server! The asser-
tion checks are not categorized for severity, and so what might be a relatively harmless bug will
still lead to server restarts if it triggers an assertion failure. This option is not recommended for
production use, but you should have it on for development work or when running a beta version.
--enable-tap-tests
Enable tests using the Perl TAP tools. This requires a Perl installation and the Perl module
```
IPC::Run. See Section 31.4 for more information.
```
--enable-depend
Enables automatic dependency tracking. With this option, the makefiles are set up so that all
affected object files will be rebuilt when any header file is changed. This is useful if you are doing
development work, but is just wasted overhead if you intend only to compile once and install. At
present, this option only works with GCC.
--enable-coverage
If using GCC, all programs and libraries are compiled with code coverage testing instrumentation.
When run, they generate files in the build directory with code coverage metrics. See Section 31.5
for more information. This option is for use only with GCC and when doing development work.
--enable-profiling
If using GCC, all programs and libraries are compiled so they can be profiled. On backend exit, a
subdirectory will be created that contains the gmon.out file containing profile data. This option
is for use only with GCC and when doing development work.
--enable-dtrace
Compiles PostgreSQL with support for the dynamic tracing tool DTrace. See Section 27.5 for
more information.
To point to the dtrace program, the environment variable DTRACE can be set. This will often
be necessary because dtrace is typically installed under /usr/sbin, which might not be in
your PATH.
Extra command-line options for the dtrace program can be specified in the environment vari-
able DTRACEFLAGS. On Solaris, to include DTrace support in a 64-bit binary, you must specify
```
DTRACEFLAGS="-64". For example, using the GCC compiler:
```
581
Installation from Source Code
./configure CC='gcc -m64' --enable-dtrace DTRACEFLAGS='-64' ...
Using Sun's compiler:
./configure CC='/opt/SUNWspro/bin/cc -xtarget=native64' --
enable-dtrace DTRACEFLAGS='-64' ...
--enable-injection-points
Compiles PostgreSQL with support for injection points in the server. Injection points allow to run
user-defined code from within the server in pre-defined code paths. This helps in testing and in the
investigation of concurrency scenarios in a controlled fashion. This option is disabled by default.
See Section 36.10.14 for more details. This option is intended to be used only by developers for
testing.
--with-segsize-blocks=SEGSIZE_BLOCKS
Specify the relation segment size in blocks. If both --with-segsize and this option are spec-
ified, this option wins. This option is only for developers, to test segment related code.
17.3.4. configure Environment Variables
In addition to the ordinary command-line options described above, configure responds to a number
of environment variables. You can specify environment variables on the configure command line,
for example:
./configure CC=/opt/bin/gcc CFLAGS='-O2 -pipe'
In this usage an environment variable is little different from a command-line option. You can also set
such variables beforehand:
export CC=/opt/bin/gcc
export CFLAGS='-O2 -pipe'
./configure
This usage can be convenient because many programs' configuration scripts respond to these variables
in similar ways.
The most commonly used of these environment variables are CC and CFLAGS. If you prefer a C
compiler different from the one configure picks, you can set the variable CC to the program of
```
your choice. By default, configure will pick gcc if available, else the platform's default (usually
```
```
cc). Similarly, you can override the default compiler flags if needed with the CFLAGS variable.
```
Here is a list of the significant variables that can be set in this manner:
BISON
Bison program
CC
C compiler
CFLAGS
options to pass to the C compiler
582
Installation from Source Code
CLANG
path to clang program used to process source code for inlining when compiling with --with-
llvm
CPP
C preprocessor
CPPFLAGS
options to pass to the C preprocessor
CXX
C++ compiler
CXXFLAGS
options to pass to the C++ compiler
DTRACE
location of the dtrace program
DTRACEFLAGS
options to pass to the dtrace program
FLEX
Flex program
LDFLAGS
options to use when linking either executables or shared libraries
LDFLAGS_EX
additional options for linking executables only
LDFLAGS_SL
additional options for linking shared libraries only
LLVM_CONFIG
llvm-config program used to locate the LLVM installation
MSGFMT
msgfmt program for native language support
PERL
Perl interpreter program. This will be used to determine the dependencies for building PL/Perl.
The default is perl.
PYTHON
Python interpreter program. This will be used to determine the dependencies for building PL/
Python. If this is not set, the following are probed in this order: python3 python.
583
Installation from Source Code
TCLSH
Tcl interpreter program. This will be used to determine the dependencies for building PL/Tcl.
If this is not set, the following are probed in this order: tclsh tcl tclsh8.6 tclsh86
tclsh8.5 tclsh85 tclsh8.4 tclsh84.
XML2_CONFIG
xml2-config program used to locate the libxml2 installation
Sometimes it is useful to add compiler flags after-the-fact to the set that were chosen by configure.
An important example is that gcc's -Werror option cannot be included in the CFLAGS passed to
configure, because it will break many of configure's built-in tests. To add such flags, include
them in the COPT environment variable while running make. The contents of COPT are added to the
CFLAGS, CXXFLAGS, and LDFLAGS options set up by configure. For example, you could do
make COPT='-Werror'
or
export COPT='-Werror'
make
Note
If using GCC, it is best to build with an optimization level of at least -O1, because using
```
no optimization (-O0) disables some important compiler warnings (such as the use of unini-
```
```
tialized variables). However, non-zero optimization levels can complicate debugging because
```
stepping through compiled code will usually not match up one-to-one with source code lines.
If you get confused while trying to debug optimized code, recompile the specific files of in-
terest with -O0. An easy way to do this is by passing an option to make: make PROFILE=-
O0 file.o.
The COPT and PROFILE environment variables are actually handled identically by the Post-
greSQL makefiles. Which to use is a matter of preference, but a common habit among devel-
opers is to use PROFILE for one-time flag adjustments, while COPT might be kept set all
the time.
17.4. Building and Installation with Meson
17.4.1. Short Version
meson setup build --prefix=/usr/local/pgsql
cd build
ninja
su
ninja install
adduser postgres
mkdir -p /usr/local/pgsql/data
chown postgres /usr/local/pgsql/data
su - postgres
/usr/local/pgsql/bin/initdb -D /usr/local/pgsql/data
/usr/local/pgsql/bin/pg_ctl -D /usr/local/pgsql/data -l logfile
start
584
Installation from Source Code
/usr/local/pgsql/bin/createdb test
/usr/local/pgsql/bin/psql test
The long version is the rest of this section.
17.4.2. Installation Procedure
1. Configuration
The first step of the installation procedure is to configure the build tree for your system and choose
the options you would like. To create and configure the build directory, you can start with the
meson setup command.
meson setup build
The setup command takes a builddir and a srcdir argument. If no srcdir is given, Meson
will deduce the srcdir based on the current directory and the location of meson.build. The
builddir is mandatory.
Running meson setup loads the build configuration file and sets up the build directory. Ad-
ditionally, you can also pass several build options to Meson. Some commonly used options are
mentioned in the subsequent sections. For example:
# configure with a different installation prefix
meson setup build --prefix=/home/user/pg-install
# configure to generate a debug build
meson setup build --buildtype=debug
# configure to build with OpenSSL support
meson setup build -Dssl=openssl
Setting up the build directory is a one-time step. To reconfigure before a new build, you can
simply use the meson configure command
meson configure -Dcassert=true
meson configure's commonly used command-line options are explained in Section 17.4.3.
2. Build
By default, Meson uses the Ninja3 build tool. To build PostgreSQL from source using Meson,
you can simply use the ninja command in the build directory.
ninja
Ninja will automatically detect the number of CPUs in your computer and parallelize itself ac-
cordingly. You can override the number of parallel processes used with the command line argu-
ment -j.
It should be noted that after the initial configure step, ninja is the only command you ever need
```
to type to compile. No matter how you alter your source tree (short of moving it to a completely
```
```
new location), Meson will detect the changes and regenerate itself accordingly. This is especially
```
```
handy if you have multiple build directories. Often one of them is used for development (the
```
3 https://ninja-build.org/
585
Installation from Source Code
```
"debug" build) and others only every now and then (such as a "static analysis" build). Any con-
```
figuration can be built just by cd'ing to the corresponding directory and running Ninja.
If you'd like to build with a backend other than ninja, you can use configure with the --backend
option to select the one you want to use and then build using meson compile. To learn more
about these backends and other arguments you can provide to ninja, you can refer to the Meson
documentation4.
3. Regression Tests
If you want to test the newly built server before you install it, you can run the regression tests at
this point. The regression tests are a test suite to verify that PostgreSQL runs on your machine
in the way the developers expected it to. Type:
meson test
```
(This won't work as root; do it as an unprivileged user.) See Chapter 31 for detailed information
```
about interpreting the test results. You can repeat this test at any later time by issuing the same
command.
To run pg_regress and pg_isolation_regress tests against a running postgres instance, specify --
setup running as an argument to meson test.
4. Installing the Files
Note
If you are upgrading an existing system be sure to read Section 18.6, which has instruc-
tions about upgrading a cluster.
Once PostgreSQL is built, you can install it by simply running the ninja install command.
ninja install
This will install files into the directories that were specified in Step 1. Make sure that you have
appropriate permissions to write into that area. You might need to do this step as root. Alterna-
tively, you can create the target directories in advance and arrange for appropriate permissions
to be granted. The standard installation provides all the header files needed for client application
development as well as for server-side program development, such as custom functions or data
types written in C.
```
ninja install should work for most cases, but if you'd like to use more options (such as --
```
```
quiet to suppress extra output), you could also use meson install instead. You can learn
```
more about meson install5 and its options in the Meson documentation.
```
Uninstallation: To undo the installation, you can use the ninja uninstall command.
```
```
Cleaning: After the installation, you can free disk space by removing the built files from the source
```
tree with the ninja clean command.
17.4.3. meson setup Options
```
meson setup's command-line options are explained below. This list is not exhaustive (use meson
```
```
configure --help to get one that is). The options not covered here are meant for advanced use-
```
4 https://mesonbuild.com/Running-Meson.html#building-from-the-source
5 https://mesonbuild.com/Commands.html#install
586
Installation from Source Code
cases, and are documented in the standard Meson documentation6. These arguments can be used with
meson setup as well.
17.4.3.1. Installation Locations
```
These options control where ninja install (or meson install) will put the files. The --
```
```
prefix option (example Section 17.4.1) is sufficient for most cases. If you have special needs, you
```
can customize the installation subdirectories with the other options described in this section. Beware
however that changing the relative locations of the different subdirectories may render the installa-
```
tion non-relocatable, meaning you won't be able to move it after installation. (The man and doc lo-
```
```
cations are not affected by this restriction.) For relocatable installs, you might want to use the -Dr-
```
```
path=false option described later.
```
--prefix=PREFIX
```
Install all files under the directory PREFIX instead of /usr/local/pgsql (on Unix based
```
```
systems) or current drive letter:/usr/local/pgsql (on Windows). The actual
```
```
files will be installed into various subdirectories; no files will ever be installed directly into the
```
PREFIX directory.
--bindir=DIRECTORY
Specifies the directory for executable programs. The default is PREFIX/bin.
--sysconfdir=DIRECTORY
Sets the directory for various configuration files, PREFIX/etc by default.
--libdir=DIRECTORY
Sets the location to install libraries and dynamically loadable modules. The default is PREFIX/
lib.
--includedir=DIRECTORY
Sets the directory for installing C and C++ header files. The default is PREFIX/include.
--datadir=DIRECTORY
Sets the directory for read-only data files used by the installed programs. The default is PREFIX/
share. Note that this has nothing to do with where your database files will be placed.
--localedir=DIRECTORY
Sets the directory for installing locale data, in particular message translation catalog files. The
default is DATADIR/locale.
--mandir=DIRECTORY
The man pages that come with PostgreSQL will be installed under this directory, in their respective
manx subdirectories. The default is DATADIR/man.
Note
Care has been taken to make it possible to install PostgreSQL into shared installation loca-
```
tions (such as /usr/local/include) without interfering with the namespace of the rest
```
of the system. First, the string “/postgresql” is automatically appended to datadir,
sysconfdir, and docdir, unless the fully expanded directory name already contains the
6 https://mesonbuild.com/Commands.html#configure
587
Installation from Source Code
string “postgres” or “pgsql”. For example, if you choose /usr/local as prefix, the
documentation will be installed in /usr/local/doc/postgresql, but if the prefix is /
opt/postgres, then it will be in /opt/postgres/doc. The public C header files of the
client interfaces are installed into includedir and are namespace-clean. The internal head-
er files and the server header files are installed into private directories under includedir.
See the documentation of each interface for information about how to access its header files.
Finally, a private subdirectory will also be created, if appropriate, under libdir for dynam-
ically loadable modules.
17.4.3.2. PostgreSQL Features
The options described in this section enable building of various optional PostgreSQL features. Most
of these require additional software, as described in Section 17.1, and will be automatically enabled
if the required software is found. You can change this behavior by manually setting these features to
enabled to require them or disabled to not build with them.
To specify PostgreSQL-specific options, the name of the option must be prefixed by -D.
```
-Dnls={ auto | enabled | disabled }
```
```
Enables or disables Native Language Support (NLS), that is, the ability to display a program's
```
messages in a language other than English. Defaults to auto and will be enabled automatically if
an implementation of the Gettext API is found.
```
-Dplperl={ auto | enabled | disabled }
```
Build the PL/Perl server-side language. Defaults to auto.
```
-Dplpython={ auto | enabled | disabled }
```
Build the PL/Python server-side language. Defaults to auto.
```
-Dpltcl={ auto | enabled | disabled }
```
Build the PL/Tcl server-side language. Defaults to auto.
-Dtcl_version=TCL_VERSION
Specifies the Tcl version to use when building PL/Tcl.
```
-Dicu={ auto | enabled | disabled }
```
```
Build with support for the ICU library, enabling use of ICU collation features (see Section 23.2).
```
Defaults to auto and requires the ICU4C package to be installed. The minimum required version
of ICU4C is currently 4.2.
```
-Dllvm={ auto | enabled | disabled }
```
```
Build with support for LLVM based JIT compilation (see Chapter 30). This requires the LLVM
```
library to be installed. The minimum required version of LLVM is currently 14. Disabled by
default.
llvm-config will be used to find the required compilation options. llvm-config, and then
llvm-config-$version for all supported versions, will be searched for in your PATH. If
that would not yield the desired program, use LLVM_CONFIG to specify a path to the correct
llvm-config.
```
-Dlz4={ auto | enabled | disabled }
```
Build with LZ4 compression support. Defaults to auto.
588
Installation from Source Code
```
-Dzstd={ auto | enabled | disabled }
```
Build with Zstandard compression support. Defaults to auto.
```
-Dssl={ auto | LIBRARY }
```
```
Build with support for SSL (encrypted) connections. The only LIBRARY supported is openssl.
```
This requires the OpenSSL package to be installed. Building with this will check for the required
header files and libraries to make sure that your OpenSSL installation is sufficient before pro-
ceeding. The default for this option is auto.
```
-Dgssapi={ auto | enabled | disabled }
```
Build with support for GSSAPI authentication. MIT Kerberos is required to be installed for
```
GSSAPI. On many systems, the GSSAPI system (a part of the MIT Kerberos installation) is not
```
```
installed in a location that is searched by default (e.g., /usr/include, /usr/lib). In those
```
cases, PostgreSQL will query pkg-config to detect the required compiler and linker options.
Defaults to auto. meson configure will check for the required header files and libraries to
make sure that your GSSAPI installation is sufficient before proceeding.
```
-Dldap={ auto | enabled | disabled }
```
```
Build with LDAP support for authentication and connection parameter lookup (see Section 32.18
```
```
and Section 20.10 for more information). On Unix, this requires the OpenLDAP package to be
```
installed. On Windows, the default WinLDAP library is used. Defaults to auto. meson con-
figure will check for the required header files and libraries to make sure that your OpenLDAP
installation is sufficient before proceeding.
```
-Dpam={ auto | enabled | disabled }
```
```
Build with PAM (Pluggable Authentication Modules) support. Defaults to auto.
```
```
-Dbsd_auth={ auto | enabled | disabled }
```
```
Build with BSD Authentication support. (The BSD Authentication framework is currently only
```
```
available on OpenBSD.) Defaults to auto.
```
```
-Dsystemd={ auto | enabled | disabled }
```
Build with support for systemd service notifications. This improves integration if the server is
```
started under systemd but has no impact otherwise; see Section 18.3 for more information. De-
```
faults to auto. libsystemd and the associated header files need to be installed to use this option.
```
-Dbonjour={ auto | enabled | disabled }
```
Build with support for Bonjour automatic service discovery. Defaults to auto and requires Bonjour
support in your operating system. Recommended on macOS.
-Duuid=LIBRARY
```
Build the uuid-ossp module (which provides functions to generate UUIDs), using the specified
```
UUID library. LIBRARY must be one of:
• none to not build the uuid module. This is the default.
• bsd to use the UUID functions found in FreeBSD, and some other BSD-derived systems
```
• e2fs to use the UUID library created by the e2fsprogs project; this library is present in
```
most Linux systems and in macOS, and can be obtained for other platforms as well
• ossp to use the OSSP UUID library7
7 http://www.ossp.org/pkg/lib/uuid/
589
Installation from Source Code
```
-Dlibcurl={ auto | enabled | disabled }
```
Build with libcurl support for OAuth 2.0 client flows. Libcurl version 7.61.0 or later is required
for this feature. Building with this will check for the required header files and libraries to make
sure that your Curl installation is sufficient before proceeding. The default for this option is auto.
```
-Dliburing={ auto | enabled | disabled }
```
Build with liburing, enabling io_uring support for asynchronous I/O. Defaults to auto.
To use a liburing installation that is in an unusual location, you can set pkg-config-related
```
environment variables (see its documentation).
```
```
-Dlibnuma={ auto | enabled | disabled }
```
Build with libnuma support for basic NUMA support. Only supported on platforms for which the
libnuma library is implemented. The default for this option is auto.
```
-Dlibxml={ auto | enabled | disabled }
```
Build with libxml2, enabling SQL/XML support. Defaults to auto. Libxml2 version 2.6.23 or later
is required for this feature.
To use a libxml2 installation that is in an unusual location, you can set pkg-config-related
```
environment variables (see its documentation).
```
```
-Dlibxslt={ auto | enabled | disabled }
```
Build with libxslt, enabling the xml2 module to perform XSL transformations of XML. -
Dlibxml must be specified as well. Defaults to auto.
```
-Dselinux={ auto | enabled | disabled }
```
Build with SElinux support, enabling the sepgsql extension. Defaults to auto.
17.4.3.3. Anti-Features
```
-Dreadline={ auto | enabled | disabled }
```
```
Allows use of the Readline library (and libedit as well). This option defaults to auto and enables
```
command-line editing and history in psql and is strongly recommended.
```
-Dlibedit_preferred={ true | false }
```
Setting this to true favors the use of the BSD-licensed libedit library rather than GPL-licensed
```
Readline. This option is significant only if you have both libraries installed; the default is false,
```
that is to use Readline.
```
-Dzlib={ auto | enabled | disabled }
```
Enables use of the Zlib library. It defaults to auto and enables support for compressed archives
in pg_dump, pg_restore and pg_basebackup and is recommended.
17.4.3.4. Build Process Details
```
--auto-features={ auto | enabled | disabled }
```
```
Setting this option allows you to override the value of all “auto” features (features that are enabled
```
```
automatically if the required software is found). This can be useful when you want to disable or
```
enable all the “optional” features at once without having to set each of them manually. The default
value for this parameter is auto.
590
Installation from Source Code
--backend=BACKEND
The default backend Meson uses is ninja and that should suffice for most use cases. However, if
you'd like to fully integrate with Visual Studio, you can set the BACKEND to vs.
-Dc_args=OPTIONS
This option can be used to pass extra options to the C compiler.
-Dc_link_args=OPTIONS
This option can be used to pass extra options to the C linker.
-Dextra_include_dirs=DIRECTORIES
DIRECTORIES is a comma-separated list of directories that will be added to the list the compiler
```
searches for header files. If you have optional packages (such as GNU Readline) installed in a
```
non-standard location, you have to use this option and probably also the corresponding -Dex-
tra_lib_dirs option.
```
Example: -Dextra_include_dirs=/opt/gnu/include,/usr/sup/include.
```
-Dextra_lib_dirs=DIRECTORIES
DIRECTORIES is a comma-separated list of directories to search for libraries. You will probably
```
have to use this option (and the corresponding -Dextra_include_dirs option) if you have
```
packages installed in non-standard locations.
```
Example: -Dextra_lib_dirs=/opt/gnu/lib,/usr/sup/lib.
```
-Dsystem_tzdata=DIRECTORY
PostgreSQL includes its own time zone database, which it requires for date and time operations.
This time zone database is in fact compatible with the IANA time zone database provided by
many operating systems such as FreeBSD, Linux, and Solaris, so it would be redundant to install
it again. When this option is used, the system-supplied time zone database in DIRECTORY is used
instead of the one included in the PostgreSQL source distribution. DIRECTORY must be specified
as an absolute path. /usr/share/zoneinfo is a likely directory on some operating systems.
Note that the installation routine will not detect mismatching or erroneous time zone data. If you
use this option, you are advised to run the regression tests to verify that the time zone data you
have pointed to works correctly with PostgreSQL.
This option is mainly aimed at binary package distributors who know their target operating system
well. The main advantage of using this option is that the PostgreSQL package won't need to be
upgraded whenever any of the many local daylight-saving time rules change. Another advantage
is that PostgreSQL can be cross-compiled more straightforwardly if the time zone database files
do not need to be built during the installation.
-Dextra_version=STRING
Append STRING to the PostgreSQL version number. You can use this, for example, to mark
binaries built from unreleased Git snapshots or containing custom patches with an extra version
string, such as a git describe identifier or a distribution package release number.
```
-Drpath={ true | false }
```
This option is set to true by default. If set to false, do not mark PostgreSQL's executables to
```
indicate that they should search for shared libraries in the installation's library directory (see --
```
```
libdir). On most platforms, this marking uses an absolute path to the library directory, so that
```
it will be unhelpful if you relocate the installation later. However, you will then need to provide
some other way for the executables to find the shared libraries. Typically this requires configuring
591
Installation from Source Code
```
the operating system's dynamic linker to search the library directory; see Section 17.5.1 for more
```
detail.
-DBINARY_NAME=PATH
```
If a program required to build PostgreSQL (with or without optional flags) is stored at a non-
```
standard path, you can specify it manually to meson configure. The complete list of programs
for which this is supported can be found by running meson configure. Example:
meson configure -DBISON=PATH_TO_BISON
17.4.3.5. Documentation
See Section J.2 for the tools needed for building the documentation.
```
-Ddocs={ auto | enabled | disabled }
```
Enables building the documentation in HTML and man format. It defaults to auto.
```
-Ddocs_pdf={ auto | enabled | disabled }
```
Enables building the documentation in PDF format. It defaults to auto.
```
-Ddocs_html_style={ simple | website }
```
Controls which CSS stylesheet is used. The default is simple. If set to website, the HTML
documentation will reference the stylesheet for postgresql.org8.
17.4.3.6. Miscellaneous
-Dpgport=NUMBER
Set NUMBER as the default port number for server and clients. The default is 5432. The port can
always be changed later on, but if you specify it here then both server and clients will have the
same default compiled in, which can be very convenient. Usually the only good reason to select
a non-default value is if you intend to run multiple PostgreSQL servers on the same machine.
-Dkrb_srvnam=NAME
The default name of the Kerberos service principal used by GSSAPI. postgres is the default.
There's usually no reason to change this unless you are building for a Windows environment, in
which case it must be set to upper case POSTGRES.
-Dsegsize=SEGSIZE
Set the segment size, in gigabytes. Large tables are divided into multiple operating-system files,
each of size equal to the segment size. This avoids problems with file size limits that exist on
many platforms. The default segment size, 1 gigabyte, is safe on all supported platforms. If your
```
operating system has “largefile” support (which most do, nowadays), you can use a larger segment
```
size. This can be helpful to reduce the number of file descriptors consumed when working with
very large tables. But be careful not to select a value larger than is supported by your platform and
the file systems you intend to use. Other tools you might wish to use, such as tar, could also set
limits on the usable file size. It is recommended, though not absolutely required, that this value
be a power of 2.
-Dblocksize=BLOCKSIZE
Set the block size, in kilobytes. This is the unit of storage and I/O within tables. The default, 8
```
kilobytes, is suitable for most situations; but other values may be useful in special cases. The
```
```
value must be a power of 2 between 1 and 32 (kilobytes).
```
8 https://www.postgresql.org/docs/current/
592
Installation from Source Code
-Dwal_blocksize=BLOCKSIZE
Set the WAL block size, in kilobytes. This is the unit of storage and I/O within the WAL log. The
```
default, 8 kilobytes, is suitable for most situations; but other values may be useful in special cases.
```
```
The value must be a power of 2 between 1 and 64 (kilobytes).
```
17.4.3.7. Developer Options
Most of the options in this section are only of interest for developing or debugging PostgreSQL. They
are not recommended for production builds, except for --debug, which can be useful to enable
detailed bug reports in the unlucky event that you encounter a bug. On platforms supporting DTrace,
-Ddtrace may also be reasonable to use in production.
When building an installation that will be used to develop code inside the server, it is recommended
to use at least the --buildtype=debug and -Dcassert options.
--buildtype=BUILDTYPE
```
This option can be used to specify the buildtype to use; defaults to debugoptimized. If you'd
```
like finer control on the debug symbols and optimization levels than what this option provides,
you can refer to the --debug and --optimization flags.
The following build types are generally used: plain, debug, debugoptimized and re-
lease. More information about them can be found in the Meson documentation9.
--debug
Compiles all programs and libraries with debugging symbols. This means that you can run the
programs in a debugger to analyze problems. This enlarges the size of the installed executables
considerably, and on non-GCC compilers it usually also disables compiler optimization, causing
slowdowns. However, having the symbols available is extremely helpful for dealing with any
problems that might arise. Currently, this option is recommended for production installations only
if you use GCC. But you should always have it on if you are doing development work or running
a beta version.
--optimization=LEVEL
```
Specify the optimization level. LEVEL can be set to any of {0,g,1,2,3,s}.
```
--werror
Setting this option asks the compiler to treat warnings as errors. This can be useful for code
development.
```
-Dcassert={ true | false }
```
Enables assertion checks in the server, which test for many “cannot happen” conditions. This is
invaluable for code development purposes, but the tests slow down the server significantly. Also,
having the tests turned on won't necessarily enhance the stability of your server! The assertion
checks are not categorized for severity, and so what might be a relatively harmless bug will still
lead to server restarts if it triggers an assertion failure. This option is not recommended for pro-
duction use, but you should have it on for development work or when running a beta version.
```
-Dtap_tests={ auto | enabled | disabled }
```
Enable tests using the Perl TAP tools. Defaults to auto and requires a Perl installation and the Perl
module IPC::Run. See Section 31.4 for more information.
9 https://mesonbuild.com/Running-Meson.html#configuring-the-build-directory
593
Installation from Source Code
-DPG_TEST_EXTRA=TEST_SUITES
Enable additional test suites, which are not run by default because they are not secure to run on
a multiuser system, require special software to run, or are resource intensive. The argument is a
whitespace-separated list of tests to enable. See Section 31.1.3 for details. If the PG_TEST_EX-
TRA environment variable is set when the tests are run, it overrides this setup-time option.
```
-Db_coverage={ true | false }
```
If using GCC, all programs and libraries are compiled with code coverage testing instrumentation.
When run, they generate files in the build directory with code coverage metrics. See Section 31.5
for more information. This option is for use only with GCC and when doing development work.
```
-Ddtrace={ auto | enabled | disabled }
```
Enabling this compiles PostgreSQL with support for the dynamic tracing tool DTrace. See Sec-
tion 27.5 for more information.
To point to the dtrace program, the DTRACE option can be set. This will often be necessary
because dtrace is typically installed under /usr/sbin, which might not be in your PATH.
```
-Dinjection_points={ true | false }
```
Compiles PostgreSQL with support for injection points in the server. Injection points allow to run
user-defined code from within the server in pre-defined code paths. This helps in testing and in the
investigation of concurrency scenarios in a controlled fashion. This option is disabled by default.
See Section 36.10.14 for more details. This option is intended to be used only by developers for
testing.
-Dsegsize_blocks=SEGSIZE_BLOCKS
Specify the relation segment size in blocks. If both -Dsegsize and this option are specified,
this option wins. This option is only for developers, to test segment related code.
17.4.4. meson Build Targets
Individual build targets can be built using ninja target. When no target is specified, everything
except documentation is built. Individual build products can be built using the path/filename as tar-
get.
17.4.4.1. Code Targets
all
Build everything other than documentation
backend
Build backend and related modules
bin
Build frontend binaries
contrib
Build contrib modules
pl
Build procedural languages
594
Installation from Source Code
17.4.4.2. Developer Targets
reformat-dat-files
Rewrite catalog data files into standard format
expand-dat-files
Expand all data files to include defaults
update-unicode
Update unicode data to new version
17.4.4.3. Documentation Targets
html
Build documentation in multi-page HTML format
man
Build documentation in man page format
docs
Build documentation in multi-page HTML and man page format
doc/src/sgml/postgres-A4.pdf
Build documentation in PDF format, with A4 pages
doc/src/sgml/postgres-US.pdf
Build documentation in PDF format, with US letter pages
doc/src/sgml/postgres.html
Build documentation in single-page HTML format
alldocs
Build documentation in all supported formats
17.4.4.4. Installation Targets
install
Install postgres, excluding documentation
install-docs
Install documentation in multi-page HTML and man page formats
install-html
Install documentation in multi-page HTML format
install-man
Install documentation in man page format
595
Installation from Source Code
install-quiet
Like "install", but installed files are not displayed
install-world
Install postgres, including multi-page HTML and man page documentation
uninstall
Remove installed files
17.4.4.5. Other Targets
clean
Remove all build products
test
```
Run all enabled tests (including contrib)
```
world
Build everything, including documentation
help
List important targets
17.5. Post-Installation Setup
17.5.1. Shared Libraries
On some systems with shared libraries you need to tell the system how to find the newly installed
shared libraries. The systems on which this is not necessary include FreeBSD, Linux, NetBSD, Open-
BSD, and Solaris.
The method to set the shared library search path varies between platforms, but the most widely-used
```
method is to set the environment variable LD_LIBRARY_PATH like so: In Bourne shells (sh, ksh,
```
```
bash, zsh):
```
```
LD_LIBRARY_PATH=/usr/local/pgsql/lib
```
export LD_LIBRARY_PATH
or in csh or tcsh:
setenv LD_LIBRARY_PATH /usr/local/pgsql/lib
Replace /usr/local/pgsql/lib with whatever you set --libdir to in Step 1. You should
put these commands into a shell start-up file such as /etc/profile or ~/.bash_profile.
Some good information about the caveats associated with this method can be found at http://xahlee.in-
fo/UnixResource_dir/_/ldpath.html.
On some systems it might be preferable to set the environment variable LD_RUN_PATH before build-
ing.
On Cygwin, put the library directory in the PATH or move the .dll files into the bin directory.
596
Installation from Source Code
```
If in doubt, refer to the manual pages of your system (perhaps ld.so or rld). If you later get a
```
message like:
```
psql: error in loading shared libraries
```
libpq.so.2.1: cannot open shared object file: No such file or
directory
then this step was necessary. Simply take care of it then.
If you are on Linux and you have root access, you can run:
/sbin/ldconfig /usr/local/pgsql/lib
```
(or equivalent directory) after installation to enable the run-time linker to find the shared libraries
```
faster. Refer to the manual page of ldconfig for more information. On FreeBSD, NetBSD, and
OpenBSD the command is:
/sbin/ldconfig -m /usr/local/pgsql/lib
instead. Other systems are not known to have an equivalent command.
17.5.2. Environment Variables
If you installed into /usr/local/pgsql or some other location that is not searched for programs
```
by default, you should add /usr/local/pgsql/bin (or whatever you set --bindir to in Step
```
```
1) into your PATH. Strictly speaking, this is not necessary, but it will make the use of PostgreSQL
```
much more convenient.
```
To do this, add the following to your shell start-up file, such as ~/.bash_profile (or /etc/
```
```
profile, if you want it to affect all users):
```
```
PATH=/usr/local/pgsql/bin:$PATH
```
export PATH
If you are using csh or tcsh, then use this command:
```
set path = ( /usr/local/pgsql/bin $path )
```
To enable your system to find the man documentation, you need to add lines like the following to a
shell start-up file unless you installed into a location that is searched by default:
```
MANPATH=/usr/local/pgsql/share/man:$MANPATH
```
export MANPATH
The environment variables PGHOST and PGPORT specify to client applications the host and port of
the database server, overriding the compiled-in defaults. If you are going to run client applications
remotely then it is convenient if every user that plans to use the database sets PGHOST. This is not re-
```
quired, however; the settings can be communicated via command line options to most client programs.
```
17.6. Supported Platforms
```
A platform (that is, a CPU architecture and operating system combination) is considered supported
```
by the PostgreSQL development community if the code contains provisions to work on that platform
597
Installation from Source Code
and it has recently been verified to build and pass its regression tests on that platform. Currently,
most testing of platform compatibility is done automatically by test machines in the PostgreSQL Build
Farm10. If you are interested in using PostgreSQL on a platform that is not represented in the build
farm, but on which the code works or can be made to work, you are strongly encouraged to set up a
build farm member machine so that continued compatibility can be assured.
In general, PostgreSQL can be expected to work on these CPU architectures: x86, PowerPC, S/390,
SPARC, ARM, MIPS, and RISC-V, including big-endian, little-endian, 32-bit, and 64-bit variants
where applicable.
PostgreSQL can be expected to work on current versions of these operating systems: Linux, Windows,
FreeBSD, OpenBSD, NetBSD, DragonFlyBSD, macOS, Solaris, and illumos. Other Unix-like sys-
tems may also work but are not currently being tested. In most cases, all CPU architectures supported
by a given operating system will work. Look in Section 17.7 below to see if there is information spe-
cific to your operating system, particularly if using an older system.
If you have installation problems on a platform that is known to be supported according to recent build
farm results, please report it to <pgsql-bugs@lists.postgresql.org>. If you are interested
in porting PostgreSQL to a new platform, <pgsql-hackers@lists.postgresql.org> is the
appropriate place to discuss that.
Historical versions of PostgreSQL or POSTGRES also ran on CPU architectures including Alpha,
Itanium, M32R, M68K, M88K, NS32K, PA-RISC, SuperH, and VAX, and operating systems includ-
ing 4.3BSD, AIX, BEOS, BSD/OS, DG/UX, Dynix, HP-UX, IRIX, NeXTSTEP, QNX, SCO, SINIX,
Sprite, SunOS, Tru64 UNIX, and ULTRIX.
17.7. Platform-Specific Notes
This section documents additional platform-specific issues regarding the installation and setup of Post-
greSQL. Be sure to read the installation instructions, and in particular Section 17.1 as well. Also, check
Chapter 31 regarding the interpretation of regression test results.
Platforms that are not covered here have no known platform-specific installation issues.
17.7.1. Cygwin
PostgreSQL can be built using Cygwin, a Linux-like environment for Windows, but that method is
inferior to the native Windows build and running a server under Cygwin is no longer recommended.
```
When building from source, proceed according to the Unix-style installation procedure (i.e., ./con-
```
```
figure; make; etc.), noting the following Cygwin-specific differences:
```
• Set your path to use the Cygwin bin directory before the Windows utilities. This will help prevent
problems with compilation.
```
• The adduser command is not supported; use the appropriate user management application on
```
Windows. Otherwise, skip this step.
```
• The su command is not supported; use ssh to simulate su on Windows. Otherwise, skip this step.
```
• OpenSSL is not supported.
• Start cygserver for shared memory support. To do this, enter the command /usr/sbin/
cygserver &. This program needs to be running anytime you start the PostgreSQL server or
```
initialize a database cluster (initdb). The default cygserver configuration may need to be
```
```
changed (e.g., increase SEMMNS) to prevent PostgreSQL from failing due to a lack of system re-
```
sources.
10 https://buildfarm.postgresql.org/
598
Installation from Source Code
• Building might fail on some systems where a locale other than C is in use. To fix this, set the locale
to C by doing export LANG=C.utf8 before building, and then setting it back to the previous
setting after you have installed PostgreSQL.
```
• The parallel regression tests (make check) can generate spurious regression test failures due to
```
```
overflowing the listen() backlog queue which causes connection refused errors or hangs. You
```
can limit the number of connections using the make variable MAX_CONNECTIONS thus:
make MAX_CONNECTIONS=5 check
```
(On some systems you can have up to about 10 simultaneous connections.)
```
It is possible to install cygserver and the PostgreSQL server as Windows NT services. For infor-
mation on how to do this, please refer to the README document included with the PostgreSQL binary
package on Cygwin. It is installed in the directory /usr/share/doc/Cygwin.
17.7.2. macOS
To build PostgreSQL from source on macOS, you will need to install Apple's command line developer
tools, which can be done by issuing
xcode-select --install
```
(note that this will pop up a GUI dialog window for confirmation). You may or may not wish to also
```
install Xcode.
On recent macOS releases, it's necessary to embed the “sysroot” path in the include switches used to
find some system header files. This results in the outputs of the configure script varying depending on
which SDK version was used during configure. That shouldn't pose any problem in simple scenarios,
but if you are trying to do something like building an extension on a different machine than the server
code was built on, you may need to force use of a different sysroot path. To do that, set PG_SYSROOT,
for example
make PG_SYSROOT=/desired/path all
To find out the appropriate path on your machine, run
xcrun --show-sdk-path
Note that building an extension using a different sysroot version than was used to build the core server
```
is not really recommended; in the worst case it could result in hard-to-debug ABI inconsistencies.
```
You can also select a non-default sysroot path when configuring, by specifying PG_SYSROOT to
```
configure:
```
./configure ... PG_SYSROOT=/desired/path
This would primarily be useful to cross-compile for some other macOS version. There is no guarantee
that the resulting executables will run on the current host.
To suppress the -isysroot options altogether, use
./configure ... PG_SYSROOT=none
```
(any nonexistent pathname will work). This might be useful if you wish to build with a non-Apple
```
compiler, but beware that that case is not tested or supported by the PostgreSQL developers.
599
Installation from Source Code
```
macOS's “System Integrity Protection” (SIP) feature breaks make check, because it prevents pass-
```
ing the needed setting of DYLD_LIBRARY_PATH down to the executables being tested. You can
work around that by doing make install before make check. Most PostgreSQL developers
just turn off SIP, though.
17.7.3. MinGW
PostgreSQL for Windows can be built using MinGW, a Unix-like build environment for Windows. It
is recommended to use the MSYS211 environment for this and also to install any prerequisite packages.
17.7.3.1. Collecting Crash Dumps
If PostgreSQL on Windows crashes, it has the ability to generate minidumps that can be used to track
down the cause for the crash, similar to core dumps on Unix. These dumps can be read using the
Windows Debugger Tools or using Visual Studio. To enable the generation of dumps on Windows,
create a subdirectory named crashdumps inside the cluster data directory. The dumps will then be
written into this directory with a unique name based on the identifier of the crashing process and the
current time of the crash.
17.7.4. Solaris
PostgreSQL is well-supported on Solaris. The more up to date your operating system, the fewer issues
you will experience.
17.7.4.1. Required Tools
You can build with either GCC or Sun's compiler suite. For better code optimization, Sun's compiler
is strongly recommended on the SPARC architecture. If you are using Sun's compiler, be careful not
```
to select /usr/ucb/cc; use /opt/SUNWspro/bin/cc.
```
You can download Sun Studio from https://www.oracle.com/technetwork/server-storage/solarisstu-
dio/downloads/. Many GNU tools are integrated into Solaris 10, or they are present on the Solaris
companion CD. If you need packages for older versions of Solaris, you can find these tools at http://
www.sunfreeware.com. If you prefer sources, look at https://www.gnu.org/prep/ftp.
17.7.4.2. configure Complains About a Failed Test Program
If configure complains about a failed test program, this is probably a case of the run-time linker
being unable to find some library, probably libz, libreadline or some other non-standard library such
as libssl. To point it to the right location, set the LDFLAGS environment variable on the configure
command line, e.g.,
configure ... LDFLAGS="-R /usr/sfw/lib:/opt/sfw/lib:/usr/local/lib"
See the ld man page for more information.
17.7.4.3. Compiling for Optimal Performance
On the SPARC architecture, Sun Studio is strongly recommended for compilation. Try using the -xO5
optimization flag to generate significantly faster binaries. Do not use any flags that modify behavior
```
of floating-point operations and errno processing (e.g., -fast).
```
If you do not have a reason to use 64-bit binaries on SPARC, prefer the 32-bit version. The 64-bit
operations are slower and 64-bit binaries are slower than the 32-bit variants. On the other hand, 32-
bit code on the AMD64 CPU family is not native, so 32-bit code is significantly slower on that CPU
family.
11 https://www.msys2.org/
600
Installation from Source Code
17.7.4.4. Using DTrace for Tracing PostgreSQL
Yes, using DTrace is possible. See Section 27.5 for further information.
If you see the linking of the postgres executable abort with an error message like:
Undefined first referenced
symbol in file
AbortTransaction utils/probes.o
CommitTransaction utils/probes.o
```
ld: fatal: Symbol referencing errors. No output written to postgres
```
```
collect2: ld returned 1 exit status
```
```
make: *** [postgres] Error 1
```
your DTrace installation is too old to handle probes in static functions. You need Solaris 10u4 or
newer to use DTrace.
17.7.5. Visual Studio
It is recommended that most users download the binary distribution for Windows, available as a graph-
ical installer package from the PostgreSQL website at https://www.postgresql.org/download/. Build-
ing from source is only intended for people developing PostgreSQL or extensions.
PostgreSQL for Windows with Visual Studio can be built using Meson, as described in Section 17.4.
The native Windows port requires a 32 or 64-bit version of Windows 10 or later.
Native builds of psql don't support command line editing. The Cygwin build does support command
line editing, so it should be used where psql is needed for interactive use on Windows.
PostgreSQL can be built using the Visual C++ compiler suite from Microsoft. These compilers can
be either from Visual Studio, Visual Studio Express or some versions of the Microsoft Windows
SDK. If you do not already have a Visual Studio environment set up, the easiest ways are to use the
compilers from Visual Studio 2022 or those in the Windows SDK 10, which are both free downloads
from Microsoft.
Both 32-bit and 64-bit builds are possible with the Microsoft Compiler suite. 32-bit PostgreSQL builds
are possible with Visual Studio 2015 to Visual Studio 2022, as well as standalone Windows SDK
releases 10 and above. 64-bit PostgreSQL builds are supported with Microsoft Windows SDK version
10 and above or Visual Studio 2015 and above.
If your build environment doesn't ship with a supported version of the Microsoft Windows SDK it
```
is recommended that you upgrade to the latest version (currently version 10), available for download
```
from https://www.microsoft.com/download.
You must always include the Windows Headers and Libraries part of the SDK. If you install a Win-
dows SDK including the Visual C++ Compilers, you don't need Visual Studio to build. Note that as of
Version 8.0a the Windows SDK no longer ships with a complete command-line build environment.
17.7.5.1. Requirements
The following additional products are required to build PostgreSQL on Windows.
Strawberry Perl
Strawberry Perl is required to run the build generation scripts. MinGW or Cygwin Perl will not
work. It must also be present in the PATH. Binaries can be downloaded from https://strawber-
ryperl.com.
601
Installation from Source Code
Bison and Flex
Binaries for Bison and Flex can be downloaded from https://github.com/lexxmark/winflexbison.
The following additional products are not required to get started, but are required to build the complete
package.
Magicsplat Tcl
Required for building PL/Tcl. Binaries can be downloaded from https://www.magicsplat.com/tcl-
installer/index.html.
Diff
Diff is required to run the regression tests, and can be downloaded from http://gnuwin32.source-
forge.net.
Gettext
Gettext is required to build with NLS support, and can be downloaded from http://
gnuwin32.sourceforge.net. Note that binaries, dependencies and developer files are all needed.
MIT Kerberos
Required for GSSAPI authentication support. MIT Kerberos can be downloaded from https://
web.mit.edu/Kerberos/dist/index.html.
libxml2 and libxslt
Required for XML support. Binaries can be downloaded from https://zlatkovic.com/pub/libxml
or source from http://xmlsoft.org. Note that libxml2 requires iconv, which is available from the
same download location.
LZ4
Required for supporting LZ4 compression. Binaries and source can be downloaded from https://
github.com/lz4/lz4/releases.
Zstandard
Required for supporting Zstandard compression. Binaries and source can be downloaded from
```
https://github.com/facebook/zstd/releases.
```
OpenSSL
Required for SSL support. Binaries can be downloaded from https://slproweb.com/prod-
ucts/Win32OpenSSL.html or source from https://www.openssl.org.
ossp-uuid
```
Required for UUID-OSSP support (contrib only). Source can be downloaded from http://www.os-
```
sp.org/pkg/lib/uuid/.
Python
Required for building PL/Python. Binaries can be downloaded from https://www.python.org.
zlib
Required for compression support in pg_dump and pg_restore. Binaries can be downloaded from
```
https://www.zlib.net.
```
602
Installation from Source Code
17.7.5.2. Special Considerations for 64-Bit Windows
PostgreSQL will only build for the x64 architecture on 64-bit Windows.
Mixing 32- and 64-bit versions in the same build tree is not supported. The build system will auto-
matically detect if it's running in a 32- or 64-bit environment, and build PostgreSQL accordingly. For
this reason, it is important to start the correct command prompt before building.
To use a server-side third party library such as Python or OpenSSL, this library must also be 64-bit.
There is no support for loading a 32-bit library in a 64-bit server. Several of the third party libraries
that PostgreSQL supports may only be available in 32-bit versions, in which case they cannot be used
with 64-bit PostgreSQL.
17.7.5.3. Collecting Crash Dumps
If PostgreSQL on Windows crashes, it has the ability to generate minidumps that can be used to track
down the cause for the crash, similar to core dumps on Unix. These dumps can be read using the
Windows Debugger Tools or using Visual Studio. To enable the generation of dumps on Windows,
create a subdirectory named crashdumps inside the cluster data directory. The dumps will then be
written into this directory with a unique name based on the identifier of the crashing process and the
current time of the crash.
603
