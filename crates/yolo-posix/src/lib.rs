//! yolo-posix: POSIX.1-2024 & GNU compatibility layer

pub mod errno;
pub mod vfs;
pub mod signal;
pub mod pthread;
pub mod termios;
pub mod gnu;

pub use errno::*;
pub use vfs::*;
pub use signal::*;
pub use pthread::*;
pub use termios::*;
pub use gnu::*;
#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::sync::Arc;

    #[test]
    fn test_posix_errno_strerror() {
        assert_eq!(Errno::ENOENT.code(), 2);
        assert_eq!(strerror(2), "No such file or directory");
        assert_eq!(strerror(9), "Bad file descriptor");
        assert_eq!(strerror(22), "Invalid argument");
        assert_eq!(strerror(9999), "Unknown error");
    }

    #[test]
    fn test_posix_vfs_memory_and_file() {
        // Test memory file handle
        let mut mem_handle = MemoryFileHandle::new();
        assert_eq!(mem_handle.write(b"Hello POSIX 2024").unwrap(), 16);
        assert_eq!(mem_handle.seek(std::io::SeekFrom::Start(6)).unwrap(), 6);
        let mut buf = [0u8; 5];
        assert_eq!(mem_handle.read(&mut buf).unwrap(), 5);
        assert_eq!(&buf, b"POSIX");

        // Test global FD table registration
        let fd = fd_table().insert(Box::new(mem_handle));
        assert!(fd >= 3);

        let mut read_buf = [0u8; 4];
        let bytes_read = posix_pread(fd, &mut read_buf, 0).unwrap();
        assert_eq!(bytes_read, 4);
        assert_eq!(&read_buf, b"Hell");

        let pwritten = posix_pwrite(fd, b"YOLO", 0).unwrap();
        assert_eq!(pwritten, 4);

        let mut check_buf = [0u8; 4];
        posix_pread(fd, &mut check_buf, 0).unwrap();
        assert_eq!(&check_buf, b"YOLO");

        let st = posix_fstat(fd).unwrap();
        assert_eq!(st.st_size, 16);

        posix_close(fd).unwrap();
        assert!(posix_close(fd).is_err());
    }

    #[test]
    fn test_posix_file_io_real() {
        let temp_dir = std::env::temp_dir();
        let test_file = temp_dir.join("yolo_posix_test_file.txt");

        let fd = posix_open(
            &test_file,
            OpenFlags(OpenFlags::O_RDWR | OpenFlags::O_CREAT | OpenFlags::O_TRUNC),
            0o644,
        ).unwrap();

        assert_eq!(posix_write(fd, b"Hello from Rust VFS!").unwrap(), 20);

        let new_pos = posix_lseek(fd, 0, Whence::SEEK_SET).unwrap();
        assert_eq!(new_pos, 0);

        let mut buf = [0u8; 20];
        let read_count = posix_read(fd, &mut buf).unwrap();
        assert_eq!(read_count, 20);
        assert_eq!(&buf, b"Hello from Rust VFS!");

        let st = posix_fstat(fd).unwrap();
        assert_eq!(st.st_size, 20);

        posix_close(fd).unwrap();

        // fstatat check
        let statat = posix_fstatat(AT_FDCWD, &test_file, 0).unwrap();
        assert_eq!(statat.st_size, 20);

        let _ = std::fs::remove_file(test_file);
    }

    #[test]
    fn test_posix_signals() {
        let received = Arc::new(AtomicBool::new(false));
        let received_clone = Arc::clone(&received);

        let action = SigAction {
            sa_handler: SigHandler::Handler(Arc::new(move |_sig| {
                received_clone.store(true, Ordering::SeqCst);
            })),
            sa_mask: SigSet::empty(),
            sa_flags: SA_RESTART,
        };

        let mut old = None;
        posix_sigaction(Signal::SIGUSR1, Some(&action), &mut old).unwrap();

        // Send signal to ourselves
        posix_kill(0, Signal::SIGUSR1).unwrap();
        assert!(received.load(Ordering::SeqCst));

        // SigSet operations
        let mut set = SigSet::empty();
        assert!(!set.has(Signal::SIGTERM));
        set.add(Signal::SIGTERM);
        assert!(set.has(Signal::SIGTERM));
        set.del(Signal::SIGTERM);
        assert!(!set.has(Signal::SIGTERM));
    }

    #[test]
    fn test_posix_pthreads() {
        // Mutex test
        let mutex = PthreadMutex::new(42);
        {
            let mut guard = mutex.lock().unwrap();
            *guard = 100;
        }
        assert_eq!(*mutex.lock().unwrap(), 100);

        // RwLock test
        let rw = PthreadRwLock::new("read-write");
        {
            let r = rw.read().unwrap();
            assert_eq!(*r, "read-write");
        }
        {
            let mut w = rw.write().unwrap();
            *w = "modified";
        }
        assert_eq!(*rw.read().unwrap(), "modified");

        // Thread test
        let mut thr = Pthread::create(|| {
            let mut sum = 0;
            for i in 1..=10 {
                sum += i;
            }
            sum
        }).unwrap();

        let res = thr.join().unwrap();
        assert_eq!(res, 55);
    }

    #[test]
    fn test_posix_termios() {
        let mut term = Termios::default();
        assert_ne!(term.c_lflag & ICANON, 0);

        cfmakeraw(&mut term);
        assert_eq!(term.c_lflag & ICANON, 0);
        assert_eq!(term.c_lflag & ECHO, 0);

        cfmakecbreak(&mut term);
        assert_ne!(term.c_lflag & ISIG, 0);

        assert!(tcgetattr(0, &mut term).is_ok());
        assert!(tcsetattr(0, TCSANOW, &term).is_ok());
    }

    #[test]
    fn test_gnu_extensions() {
        // asprintf macro
        let msg = asprintf!("Format: {} + {} = {}", 1, 2, 3);
        assert_eq!(msg, "Format: 1 + 2 = 3");

        // getopt_long
        let args = vec![
            "--host".to_string(),
            "127.0.0.1".to_string(),
            "-p".to_string(),
            "8080".to_string(),
            "--verbose".to_string(),
            "target".to_string(),
        ];

        let longopts = [
            LongOption {
                name: "host",
                has_arg: HasArg::RequiredArgument,
                val: 'h' as i32,
            },
            LongOption {
                name: "verbose",
                has_arg: HasArg::NoArgument,
                val: 'v' as i32,
            },
        ];

        let results = getopt_long(&args, "h:p:v", &longopts);
        assert_eq!(
            results,
            vec![
                GetoptResult::Opt('h' as i32, Some("127.0.0.1".to_string())),
                GetoptResult::Opt('p' as i32, Some("8080".to_string())),
                GetoptResult::Opt('v' as i32, None),
                GetoptResult::NonOption("target".to_string()),
            ]
        );

        // program_invocation_name
        assert!(!program_invocation_name().is_empty());
        assert!(!program_invocation_short_name().is_empty());
    }
}
