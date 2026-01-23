Chapter 46. Background Worker
Processes
PostgreSQL can be extended to run user-supplied code in separate processes. Such processes are start-
ed, stopped and monitored by postgres, which permits them to have a lifetime closely linked to
the server's status. These processes are attached to PostgreSQL's shared memory area and have the
```
option to connect to databases internally; they can also run multiple transactions serially, just like a
```
regular client-connected server process. Also, by linking to libpq they can connect to the server and
behave like a regular client application.
Warning
There are considerable robustness and security risks in using background worker processes
because, being written in the C language, they have unrestricted access to data. Administra-
tors wishing to enable modules that include background worker processes should exercise ex-
treme caution. Only carefully audited modules should be permitted to run background worker
processes.
Background workers can be initialized at the time that PostgreSQL is started by including the mod-
ule name in shared_preload_libraries. A module wishing to run a background worker can
```
register it by calling RegisterBackgroundWorker(BackgroundWorker *worker) from
```
```
its _PG_init() function. Background workers can also be started after the system is up and run-
```
```
ning by calling RegisterDynamicBackgroundWorker(BackgroundWorker *worker,
```
```
BackgroundWorkerHandle **handle). Unlike RegisterBackgroundWorker, which
```
can only be called from within the postmaster process, RegisterDynamicBackgroundWorker
must be called from a regular backend or another background worker.
The structure BackgroundWorker is defined thus:
```
typedef void (*bgworker_main_type)(Datum main_arg);
```
typedef struct BackgroundWorker
```
{
```
```
char bgw_name[BGW_MAXLEN];
```
```
char bgw_type[BGW_MAXLEN];
```
```
int bgw_flags;
```
```
BgWorkerStartTime bgw_start_time;
```
```
int bgw_restart_time; /* in seconds, or
```
BGW_NEVER_RESTART */
```
char bgw_library_name[MAXPGPATH];
```
```
char bgw_function_name[BGW_MAXLEN];
```
```
Datum bgw_main_arg;
```
```
char bgw_extra[BGW_EXTRALEN];
```
```
pid_t bgw_notify_pid;
```
```
} BackgroundWorker;
```
bgw_name and bgw_type are strings to be used in log messages, process listings and similar con-
texts. bgw_type should be the same for all background workers of the same type, so that it is possible
to group such workers in a process listing, for example. bgw_name on the other hand can contain
```
additional information about the specific process. (Typically, the string for bgw_name will contain
```
```
the type somehow, but that is not strictly required.)
```
bgw_flags is a bitwise-or'd bit mask indicating the capabilities that the module wants. Possible
values are:
1561
Background Worker Processes
BGWORKER_SHMEM_ACCESS
Requests shared memory access. This flag is required.
BGWORKER_BACKEND_DATABASE_CONNECTION
Requests the ability to establish a database connection through which it can later run transactions
and queries. A background worker using BGWORKER_BACKEND_DATABASE_CONNECTION
to connect to a database must also attach shared memory using BGWORKER_SHMEM_ACCESS,
or worker start-up will fail.
```
bgw_start_time is the server state during which postgres should start the process; it can be
```
```
one of BgWorkerStart_PostmasterStart (start as soon as postgres itself has finished its
```
```
own initialization; processes requesting this are not eligible for database connections), BgWorkerS-
```
```
tart_ConsistentState (start as soon as a consistent state has been reached in a hot standby,
```
```
allowing processes to connect to databases and run read-only queries), and BgWorkerStart_Re-
```
```
coveryFinished (start as soon as the system has entered normal read-write state). Note the last
```
two values are equivalent in a server that's not a hot standby. Note that this setting only indicates when
```
the processes are to be started; they do not stop when a different state is reached.
```
bgw_restart_time is the interval, in seconds, that postgres should wait before restarting the
process in the event that it crashes. It can be any positive value, or BGW_NEVER_RESTART, indicating
not to restart the process in case of a crash.
bgw_library_name is the name of a library in which the initial entry point for the background
worker should be sought. The named library will be dynamically loaded by the worker process and
bgw_function_name will be used to identify the function to be called. If calling a function in the
core code, this must be set to "postgres".
bgw_function_name is the name of the function to use as the initial entry point for the new back-
ground worker. If this function is in a dynamically loaded library, it must be marked PGDLLEXPORT
```
(and not static).
```
bgw_main_arg is the Datum argument to the background worker main function. This main func-
tion should take a single argument of type Datum and return void. bgw_main_arg will be passed
as the argument. In addition, the global variable MyBgworkerEntry points to a copy of the Back-
```
groundWorker structure passed at registration time; the worker may find it helpful to examine this
```
structure.
```
On Windows (and anywhere else where EXEC_BACKEND is defined) or in dynamic background work-
```
ers it is not safe to pass a Datum by reference, only by value. If an argument is required, it is safest to
pass an int32 or other small value and use that as an index into an array allocated in shared memory. If
a value like a cstring or text is passed then the pointer won't be valid from the new background
worker process.
bgw_extra can contain extra data to be passed to the background worker. Unlike bgw_main_arg,
this data is not passed as an argument to the worker's main function, but it can be accessed via My-
BgworkerEntry, as discussed above.
bgw_notify_pid is the PID of a PostgreSQL backend process to which the postmaster should
send SIGUSR1 when the process is started or exits. It should be 0 for workers registered at postmaster
startup time, or when the backend registering the worker does not wish to wait for the worker to start
up. Otherwise, it should be initialized to MyProcPid.
Once running, the process can connect to a database by calling BackgroundWorkerInitial-
```
izeConnection(char *dbname, char *username, uint32 flags) or Back-
```
```
groundWorkerInitializeConnectionByOid(Oid dboid, Oid useroid, uint32
```
```
flags). This allows the process to run transactions and queries using the SPI interface. If dbname
```
is NULL or dboid is InvalidOid, the session is not connected to any particular database, but
shared catalogs can be accessed. If username is NULL or useroid is InvalidOid, the process
1562
Background Worker Processes
will run as the superuser created during initdb. If BGWORKER_BYPASS_ALLOWCONN is specified
as flags it is possible to bypass the restriction to connect to databases not allowing user connections.
If BGWORKER_BYPASS_ROLELOGINCHECK is specified as flags it is possible to bypass the login
check for the role used to connect to databases. A background worker can only call one of these two
functions, and only once. It is not possible to switch databases.
Signals are initially blocked when control reaches the background worker's main function, and must be
```
unblocked by it; this is to allow the process to customize its signal handlers, if necessary. Signals can
```
be unblocked in the new process by calling BackgroundWorkerUnblockSignals and blocked
by calling BackgroundWorkerBlockSignals.
If bgw_restart_time for a background worker is configured as BGW_NEVER_RESTART, or if
it exits with an exit code of 0 or is terminated by TerminateBackgroundWorker, it will be au-
tomatically unregistered by the postmaster on exit. Otherwise, it will be restarted after the time peri-
od configured via bgw_restart_time, or immediately if the postmaster reinitializes the cluster
due to a backend failure. Backends which need to suspend execution only temporarily should use an
```
interruptible sleep rather than exiting; this can be achieved by calling WaitLatch(). Make sure the
```
WL_POSTMASTER_DEATH flag is set when calling that function, and verify the return code for a
prompt exit in the emergency case that postgres itself has terminated.
When a background worker is registered using the RegisterDynamicBackgroundWorker
function, it is possible for the backend performing the registration to obtain information regarding the
status of the worker. Backends wishing to do this should pass the address of a BackgroundWork-
erHandle * as the second argument to RegisterDynamicBackgroundWorker. If the work-
er is successfully registered, this pointer will be initialized with an opaque handle that can subsequent-
```
ly be passed to GetBackgroundWorkerPid(BackgroundWorkerHandle *, pid_t *)
```
```
or TerminateBackgroundWorker(BackgroundWorkerHandle *). GetBackground-
```
WorkerPid can be used to poll the status of the worker: a return value of BGWH_NOT_YET_S-
```
TARTED indicates that the worker has not yet been started by the postmaster; BGWH_STOPPED in-
```
```
dicates that it has been started but is no longer running; and BGWH_STARTED indicates that it is cur-
```
rently running. In this last case, the PID will also be returned via the second argument. Terminate-
BackgroundWorker causes the postmaster to send SIGTERM to the worker if it is running, and
to unregister it as soon as it is not.
In some cases, a process which registers a background worker may wish to wait for the worker to start
up. This can be accomplished by initializing bgw_notify_pid to MyProcPid and then passing
the BackgroundWorkerHandle * obtained at registration time to WaitForBackground-
```
WorkerStartup(BackgroundWorkerHandle *handle, pid_t *) function. This func-
```
tion will block until the postmaster has attempted to start the background worker, or until the post-
master dies. If the background worker is running, the return value will be BGWH_STARTED, and the
PID will be written to the provided address. Otherwise, the return value will be BGWH_STOPPED or
BGWH_POSTMASTER_DIED.
A process can also wait for a background worker to shut down, by using the WaitForBackground-
```
WorkerShutdown(BackgroundWorkerHandle *handle) function and passing the Back-
```
groundWorkerHandle * obtained at registration. This function will block until the background
worker exits, or postmaster dies. When the background worker exits, the return value is BGWH_S-
TOPPED, if postmaster dies it will return BGWH_POSTMASTER_DIED.
Background workers can send asynchronous notification messages, either by using the NOTIFY com-
```
mand via SPI, or directly via Async_Notify(). Such notifications will be sent at transaction com-
```
mit. Background workers should not register to receive asynchronous notifications with the LISTEN
command, as there is no infrastructure for a worker to consume such notifications.
The src/test/modules/worker_spi module contains a working example, which demon-
strates some useful techniques.
The maximum number of registered background workers is limited by max_worker_processes.
1563
