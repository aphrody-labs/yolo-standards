//! POSIX Termios & TTY / PTY support

use crate::errno::{Errno, PosixResult};

pub type TcFlag = u32;
pub type Cc = u8;
pub type Speed = u32;

pub const NCCS: usize = 32;

// c_iflag bits
pub const IGNBRK: TcFlag  = 0o000001;
pub const BRKINT: TcFlag  = 0o000002;
pub const IGNPAR: TcFlag  = 0o000004;
pub const PARMRK: TcFlag  = 0o000010;
pub const INPCK:  TcFlag  = 0o000020;
pub const ISTRIP: TcFlag  = 0o000040;
pub const INLCR:  TcFlag  = 0o000100;
pub const IGNCR:  TcFlag  = 0o000200;
pub const ICRNL:  TcFlag  = 0o000400;
pub const IXON:   TcFlag  = 0o002000;
pub const IXOFF:  TcFlag  = 0o010000;

// c_oflag bits
pub const OPOST:  TcFlag  = 0o000001;
pub const ONLCR:  TcFlag  = 0o000004;
pub const OCRNL:  TcFlag  = 0o000010;
pub const ONOCR:  TcFlag  = 0o000020;
pub const ONLRET: TcFlag  = 0o000040;

// c_cflag bits
pub const CSIZE:  TcFlag  = 0o000060;
pub const CS5:    TcFlag  = 0o000000;
pub const CS6:    TcFlag  = 0o000020;
pub const CS7:    TcFlag  = 0o000040;
pub const CS8:    TcFlag  = 0o000060;
pub const CSTOPB: TcFlag  = 0o000100;
pub const CREAD:  TcFlag  = 0o000200;
pub const PARENB: TcFlag  = 0o000400;
pub const PARODD: TcFlag  = 0o001000;
pub const HUPCL:  TcFlag  = 0o002000;
pub const CLOCAL: TcFlag  = 0o004000;

// c_lflag bits
pub const ISIG:   TcFlag  = 0o000001;
pub const ICANON: TcFlag  = 0o000002;
pub const ECHO:   TcFlag  = 0o000010;
pub const ECHOE:  TcFlag  = 0o000020;
pub const ECHOK:  TcFlag  = 0o000040;
pub const ECHONL: TcFlag  = 0o000100;
pub const NOFLSH: TcFlag  = 0o000200;
pub const TOSTOP: TcFlag  = 0o000400;
pub const IEXTEN: TcFlag  = 0o100000;

// Special control characters indices (c_cc)
pub const VINTR:    usize = 0;
pub const VQUIT:    usize = 1;
pub const VERASE:   usize = 2;
pub const VKILL:    usize = 3;
pub const VEOF:     usize = 4;
pub const VTIME:    usize = 5;
pub const VMIN:     usize = 6;
pub const VSTART:   usize = 8;
pub const VSTOP:    usize = 9;
pub const VSUSP:    usize = 10;
pub const VEOL:     usize = 11;

// Optional actions for tcsetattr
pub const TCSANOW:   i32 = 0;
pub const TCSADRAIN: i32 = 1;
pub const TCSAFLUSH: i32 = 2;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Termios {
    pub c_iflag: TcFlag,
    pub c_oflag: TcFlag,
    pub c_cflag: TcFlag,
    pub c_lflag: TcFlag,
    pub c_cc: [Cc; NCCS],
    pub c_ispeed: Speed,
    pub c_ospeed: Speed,
}

impl Default for Termios {
    fn default() -> Self {
        let mut cc = [0u8; NCCS];
        cc[VINTR] = 3;   // Ctrl-C
        cc[VQUIT] = 28;  // Ctrl-\
        cc[VERASE] = 127;// DEL
        cc[VKILL] = 21;  // Ctrl-U
        cc[VEOF] = 4;    // Ctrl-D
        cc[VMIN] = 1;
        cc[VTIME] = 0;
        cc[VSUSP] = 26;  // Ctrl-Z
        cc[VSTART] = 17; // Ctrl-Q
        cc[VSTOP] = 19;  // Ctrl-S

        Self {
            c_iflag: ICRNL | IXON,
            c_oflag: OPOST | ONLCR,
            c_cflag: CS8 | CREAD | CLOCAL,
            c_lflag: ISIG | ICANON | ECHO | ECHOE | ECHOK | IEXTEN,
            c_cc: cc,
            c_ispeed: 38400,
            c_ospeed: 38400,
        }
    }
}

/// Configure raw mode on termios struct (cfmakeraw)
pub fn cfmakeraw(termios: &mut Termios) {
    termios.c_iflag &= !(IGNBRK | BRKINT | PARMRK | ISTRIP | INLCR | IGNCR | ICRNL | IXON);
    termios.c_oflag &= !OPOST;
    termios.c_lflag &= !(ECHO | ECHONL | ICANON | ISIG | IEXTEN);
    termios.c_cflag &= !(CSIZE | PARENB);
    termios.c_cflag |= CS8;
    termios.c_cc[VMIN] = 1;
    termios.c_cc[VTIME] = 0;
}

/// Configure cbreak mode
pub fn cfmakecbreak(termios: &mut Termios) {
    termios.c_lflag &= !(ICANON | ECHO);
    termios.c_lflag |= ISIG;
    termios.c_cc[VMIN] = 1;
    termios.c_cc[VTIME] = 0;
}

/// Get terminal attributes (tcgetattr)
pub fn tcgetattr(fd: i32, termios: &mut Termios) -> PosixResult<()> {
    if fd < 0 {
        return Err(Errno::EBADF);
    }
    #[cfg(windows)]
    {
        // Query console mode when on Windows console handle
        use windows_sys::Win32::System::Console::{
            GetConsoleMode, GetStdHandle, STD_INPUT_HANDLE,
        };
        let handle = unsafe { GetStdHandle(STD_INPUT_HANDLE) };
        let mut mode: u32 = 0;
        let is_console = unsafe { GetConsoleMode(handle, &mut mode) } != 0;
        *termios = Termios::default();
        if is_console {
            // Reflected console mode
            if (mode & 0x0002) == 0 {
                termios.c_lflag &= !ICANON;
            }
            if (mode & 0x0004) == 0 {
                termios.c_lflag &= !ECHO;
            }
        }
        return Ok(());
    }

    #[cfg(not(windows))]
    {
        *termios = Termios::default();
        Ok(())
    }
}

/// Set terminal attributes (tcsetattr)
pub fn tcsetattr(fd: i32, _optional_actions: i32, termios: &Termios) -> PosixResult<()> {
    if fd < 0 {
        return Err(Errno::EBADF);
    }
    #[cfg(windows)]
    {
        use windows_sys::Win32::System::Console::{
            GetStdHandle, SetConsoleMode, STD_INPUT_HANDLE,
            ENABLE_ECHO_INPUT, ENABLE_LINE_INPUT, ENABLE_PROCESSED_INPUT,
        };
        let handle = unsafe { GetStdHandle(STD_INPUT_HANDLE) };
        let mut mode: u32 = 0;
        if (termios.c_lflag & ICANON) != 0 {
            mode |= ENABLE_LINE_INPUT;
        }
        if (termios.c_lflag & ECHO) != 0 {
            mode |= ENABLE_ECHO_INPUT;
        }
        if (termios.c_lflag & ISIG) != 0 {
            mode |= ENABLE_PROCESSED_INPUT;
        }
        unsafe {
            let _ = SetConsoleMode(handle, mode);
        }
        return Ok(());
    }

    #[cfg(not(windows))]
    {
        let _ = termios;
        Ok(())
    }
}
