//! POSIX Signals & Signal Action Layer

use std::sync::{Arc, Mutex, OnceLock};
use std::collections::HashMap;
use crate::errno::{Errno, PosixResult};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[repr(i32)]
pub enum Signal {
    SIGHUP = 1,
    SIGINT = 2,
    SIGQUIT = 3,
    SIGILL = 4,
    SIGTRAP = 5,
    SIGABRT = 6,
    SIGBUS = 7,
    SIGFPE = 8,
    SIGKILL = 9,
    SIGUSR1 = 10,
    SIGSEGV = 11,
    SIGUSR2 = 12,
    SIGPIPE = 13,
    SIGALRM = 14,
    SIGTERM = 15,
    SIGCHLD = 17,
    SIGCONT = 18,
    SIGSTOP = 19,
    SIGTSTP = 20,
    SIGTTIN = 21,
    SIGTTOU = 22,
    SIGURG = 23,
    SIGXCPU = 24,
    SIGXFSZ = 25,
    SIGVTALRM = 26,
    SIGPROF = 27,
    SIGWINCH = 28,
    SIGIO = 29,
    SIGSYS = 31,
}

impl Signal {
    pub const fn num(self) -> i32 {
        self as i32
    }

    pub fn from_i32(val: i32) -> Option<Self> {
        match val {
            1 => Some(Signal::SIGHUP),
            2 => Some(Signal::SIGINT),
            3 => Some(Signal::SIGQUIT),
            4 => Some(Signal::SIGILL),
            5 => Some(Signal::SIGTRAP),
            6 => Some(Signal::SIGABRT),
            7 => Some(Signal::SIGBUS),
            8 => Some(Signal::SIGFPE),
            9 => Some(Signal::SIGKILL),
            10 => Some(Signal::SIGUSR1),
            11 => Some(Signal::SIGSEGV),
            12 => Some(Signal::SIGUSR2),
            13 => Some(Signal::SIGPIPE),
            14 => Some(Signal::SIGALRM),
            15 => Some(Signal::SIGTERM),
            17 => Some(Signal::SIGCHLD),
            18 => Some(Signal::SIGCONT),
            19 => Some(Signal::SIGSTOP),
            20 => Some(Signal::SIGTSTP),
            21 => Some(Signal::SIGTTIN),
            22 => Some(Signal::SIGTTOU),
            23 => Some(Signal::SIGURG),
            24 => Some(Signal::SIGXCPU),
            25 => Some(Signal::SIGXFSZ),
            26 => Some(Signal::SIGVTALRM),
            27 => Some(Signal::SIGPROF),
            28 => Some(Signal::SIGWINCH),
            29 => Some(Signal::SIGIO),
            31 => Some(Signal::SIGSYS),
            _ => None,
        }
    }
}

/// POSIX sigset_t bitset
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct SigSet(pub u64);

impl SigSet {
    pub const fn empty() -> Self {
        SigSet(0)
    }

    pub const fn fill() -> Self {
        SigSet(!0)
    }

    pub fn add(&mut self, sig: Signal) {
        self.0 |= 1 << (sig.num() - 1);
    }

    pub fn del(&mut self, sig: Signal) {
        self.0 &= !(1 << (sig.num() - 1));
    }

    pub fn has(&self, sig: Signal) -> bool {
        (self.0 & (1 << (sig.num() - 1))) != 0
    }
}

pub const SA_NOCLDSTOP: i32 = 0x00000001;
pub const SA_NOCLDWAIT: i32 = 0x00000002;
pub const SA_SIGINFO:   i32 = 0x00000004;
pub const SA_ONSTACK:   i32 = 0x08000000;
pub const SA_RESTART:   i32 = 0x10000000;
pub const SA_NODEFER:   i32 = 0x40000000;
pub const SA_RESETHAND: i32 = 0x80000000u32 as i32;

pub type SigHandlerFn = Arc<dyn Fn(Signal) + Send + Sync + 'static>;

#[derive(Clone)]
pub enum SigHandler {
    Default,
    Ignore,
    Handler(SigHandlerFn),
}

#[derive(Clone)]
pub struct SigAction {
    pub sa_handler: SigHandler,
    pub sa_mask: SigSet,
    pub sa_flags: i32,
}

impl Default for SigAction {
    fn default() -> Self {
        Self {
            sa_handler: SigHandler::Default,
            sa_mask: SigSet::empty(),
            sa_flags: 0,
        }
    }
}

/// Global signal manager supporting cross-platform signal dispatch and emulation
struct SignalManager {
    handlers: Mutex<HashMap<Signal, SigAction>>,
}

impl SignalManager {
    fn new() -> Self {
        Self {
            handlers: Mutex::new(HashMap::new()),
        }
    }
}

static SIGNAL_MANAGER: OnceLock<SignalManager> = OnceLock::new();

fn signal_manager() -> &'static SignalManager {
    SIGNAL_MANAGER.get_or_init(SignalManager::new)
}

/// Set action for a signal (posix sigaction)
pub fn posix_sigaction(
    sig: Signal,
    act: Option<&SigAction>,
    oldact: &mut Option<SigAction>,
) -> PosixResult<()> {
    if sig == Signal::SIGKILL || sig == Signal::SIGSTOP {
        return Err(Errno::EINVAL);
    }

    let mgr = signal_manager();
    let mut handlers = mgr.handlers.lock().unwrap();

    *oldact = handlers.get(&sig).cloned();

    if let Some(new_action) = act {
        handlers.insert(sig, new_action.clone());
    }

    Ok(())
}

/// Send a signal to a process (posix kill)
/// In emulation, if pid == current_pid or pid <= 0, dispatches signal to handlers
pub fn posix_kill(pid: i32, sig: Signal) -> PosixResult<()> {
    let current_pid = std::process::id() as i32;
    if pid != 0 && pid != current_pid && pid != -1 {
        // Can only dispatch to self or broadcast in pure userspace emulation
        #[cfg(unix)]
        {
            unsafe {
                if libc::kill(pid, sig.num()) != 0 {
                    return Err(Errno::from(std::io::Error::last_os_error()));
                }
                return Ok(());
            }
        }
        #[cfg(windows)]
        {
            return Err(Errno::EPERM);
        }
    }

    // Dispatch locally
    let mgr = signal_manager();
    let action = {
        let handlers = mgr.handlers.lock().unwrap();
        handlers.get(&sig).cloned()
    };

    match action {
        Some(SigAction { sa_handler: SigHandler::Handler(ref f), .. }) => {
            f(sig);
            Ok(())
        }
        Some(SigAction { sa_handler: SigHandler::Ignore, .. }) => {
            // Signal ignored
            Ok(())
        }
        _ => {
            // Default action
            match sig {
                Signal::SIGINT | Signal::SIGTERM | Signal::SIGHUP | Signal::SIGQUIT => {
                    // Default termination
                    Ok(())
                }
                Signal::SIGCHLD | Signal::SIGURG | Signal::SIGWINCH => {
                    // Ignored by default
                    Ok(())
                }
                _ => Ok(()),
            }
        }
    }
}
