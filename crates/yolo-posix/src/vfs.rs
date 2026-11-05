//! POSIX File Descriptors & Virtual File System Layer

use std::fs::{File, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::sync::atomic::{AtomicI32, Ordering};
use std::sync::{Arc, Mutex, RwLock};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use crate::errno::{Errno, PosixResult};

/// Open flags matching POSIX
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct OpenFlags(pub i32);

impl OpenFlags {
    pub const O_RDONLY: i32 = 0o0;
    pub const O_WRONLY: i32 = 0o1;
    pub const O_RDWR:   i32 = 0o2;
    pub const O_CREAT:  i32 = 0o100;
    pub const O_EXCL:   i32 = 0o200;
    pub const O_NOCTTY: i32 = 0o400;
    pub const O_TRUNC:  i32 = 0o1000;
    pub const O_APPEND: i32 = 0o2000;
    pub const O_NONBLOCK: i32 = 0o4000;
    pub const O_CLOEXEC:  i32 = 0o2000000;

    pub fn is_read_only(self) -> bool {
        (self.0 & 3) == Self::O_RDONLY
    }

    pub fn is_write_only(self) -> bool {
        (self.0 & 3) == Self::O_WRONLY
    }

    pub fn is_read_write(self) -> bool {
        (self.0 & 3) == Self::O_RDWR
    }

    pub fn is_create(self) -> bool {
        (self.0 & Self::O_CREAT) != 0
    }

    pub fn is_exclusive(self) -> bool {
        (self.0 & Self::O_EXCL) != 0
    }

    pub fn is_truncate(self) -> bool {
        (self.0 & Self::O_TRUNC) != 0
    }

    pub fn is_append(self) -> bool {
        (self.0 & Self::O_APPEND) != 0
    }
}

/// Seek origin matching POSIX lseek
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Whence {
    Set = 0, // SEEK_SET
    Cur = 1, // SEEK_CUR
    End = 2, // SEEK_END
}

impl Whence {
    pub const SEEK_SET: i32 = 0;
    pub const SEEK_CUR: i32 = 1;
    pub const SEEK_END: i32 = 2;

    pub fn from_i32(val: i32) -> PosixResult<Self> {
        match val {
            Self::SEEK_SET => Ok(Whence::Set),
            Self::SEEK_CUR => Ok(Whence::Cur),
            Self::SEEK_END => Ok(Whence::End),
            _ => Err(Errno::EINVAL),
        }
    }
}

/// POSIX stat structure representation
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FileStat {
    pub st_dev: u64,
    pub st_ino: u64,
    pub st_mode: u32,
    pub st_nlink: u64,
    pub st_uid: u32,
    pub st_gid: u32,
    pub st_rdev: u64,
    pub st_size: i64,
    pub st_atime: i64,
    pub st_mtime: i64,
    pub st_ctime: i64,
    pub st_blksize: i64,
    pub st_blocks: i64,
}

// Mode flags (POSIX file types & permissions)
pub const S_IFMT:   u32 = 0o170000;
pub const S_IFSOCK: u32 = 0o140000;
pub const S_IFLNK:  u32 = 0o120000;
pub const S_IFREG:  u32 = 0o100000;
pub const S_IFBLK:  u32 = 0o060000;
pub const S_IFDIR:  u32 = 0o040000;
pub const S_IFCHR:  u32 = 0o020000;
pub const S_IFIFO:  u32 = 0o010000;

pub const S_IRWXU:  u32 = 0o0700;
pub const S_IRUSR:  u32 = 0o0400;
pub const S_IWUSR:  u32 = 0o0200;
pub const S_IXUSR:  u32 = 0o0100;
pub const S_IRWXG:  u32 = 0o0070;
pub const S_IRGRP:  u32 = 0o0040;
pub const S_IWGRP:  u32 = 0o0020;
pub const S_IXGRP:  u32 = 0o0010;
pub const S_IRWXO:  u32 = 0o0007;
pub const S_IROTH:  u32 = 0o0004;
pub const S_IWOTH:  u32 = 0o0020;
pub const S_IXOTH:  u32 = 0o0001;

pub const AT_FDCWD: i32 = -100;
pub const AT_SYMLINK_NOFOLLOW: i32 = 0x100;

/// Internal file handle abstraction
pub trait FileHandle: Send + Sync {
    fn read(&mut self, buf: &mut [u8]) -> PosixResult<usize>;
    fn write(&mut self, buf: &[u8]) -> PosixResult<usize>;
    fn seek(&mut self, pos: SeekFrom) -> PosixResult<u64>;
    fn fstat(&self) -> PosixResult<FileStat>;
    fn flush(&mut self) -> PosixResult<()>;
}

/// OS File backed implementation
struct OsFileHandle {
    file: File,
    #[allow(dead_code)]
    path: Option<PathBuf>,
}

impl FileHandle for OsFileHandle {
    fn read(&mut self, buf: &mut [u8]) -> PosixResult<usize> {
        self.file.read(buf).map_err(Errno::from)
    }

    fn write(&mut self, buf: &[u8]) -> PosixResult<usize> {
        self.file.write(buf).map_err(Errno::from)
    }

    fn seek(&mut self, pos: SeekFrom) -> PosixResult<u64> {
        self.file.seek(pos).map_err(Errno::from)
    }

    fn fstat(&self) -> PosixResult<FileStat> {
        let meta = self.file.metadata().map_err(Errno::from)?;
        let mut mode: u32 = 0;
        if meta.is_dir() {
            mode |= S_IFDIR | 0o755;
        } else if meta.is_file() {
            mode |= S_IFREG | 0o644;
        }

        let mtime = meta.modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0);

        Ok(FileStat {
            st_dev: 1,
            st_ino: 1,
            st_mode: mode,
            st_nlink: 1,
            st_uid: 1000,
            st_gid: 1000,
            st_rdev: 0,
            st_size: meta.len() as i64,
            st_atime: mtime,
            st_mtime: mtime,
            st_ctime: mtime,
            st_blksize: 4096,
            st_blocks: (meta.len() as i64 + 511) / 512,
        })
    }

    fn flush(&mut self) -> PosixResult<()> {
        self.file.flush().map_err(Errno::from)
    }
}

/// In-memory file handle for pipes, ptys or virtual files
pub struct MemoryFileHandle {
    pub buffer: Vec<u8>,
    pub position: usize,
}

impl MemoryFileHandle {
    pub fn new() -> Self {
        Self {
            buffer: Vec::new(),
            position: 0,
        }
    }
}

impl Default for MemoryFileHandle {
    fn default() -> Self {
        Self::new()
    }
}

impl FileHandle for MemoryFileHandle {
    fn read(&mut self, buf: &mut [u8]) -> PosixResult<usize> {
        if self.position >= self.buffer.len() {
            return Ok(0);
        }
        let available = self.buffer.len() - self.position;
        let to_read = available.min(buf.len());
        buf[..to_read].copy_from_slice(&self.buffer[self.position..self.position + to_read]);
        self.position += to_read;
        Ok(to_read)
    }

    fn write(&mut self, buf: &[u8]) -> PosixResult<usize> {
        if self.position + buf.len() > self.buffer.len() {
            self.buffer.resize(self.position + buf.len(), 0);
        }
        self.buffer[self.position..self.position + buf.len()].copy_from_slice(buf);
        self.position += buf.len();
        Ok(buf.len())
    }

    fn seek(&mut self, pos: SeekFrom) -> PosixResult<u64> {
        let new_pos: i64 = match pos {
            SeekFrom::Start(offset) => offset as i64,
            SeekFrom::Current(offset) => self.position as i64 + offset,
            SeekFrom::End(offset) => self.buffer.len() as i64 + offset,
        };
        if new_pos < 0 {
            return Err(Errno::EINVAL);
        }
        self.position = new_pos as usize;
        Ok(self.position as u64)
    }

    fn fstat(&self) -> PosixResult<FileStat> {
        Ok(FileStat {
            st_dev: 0,
            st_ino: 0,
            st_mode: S_IFREG | 0o666,
            st_nlink: 1,
            st_uid: 0,
            st_gid: 0,
            st_rdev: 0,
            st_size: self.buffer.len() as i64,
            st_atime: 0,
            st_mtime: 0,
            st_ctime: 0,
            st_blksize: 4096,
            st_blocks: (self.buffer.len() as i64 + 511) / 512,
        })
    }

    fn flush(&mut self) -> PosixResult<()> {
        Ok(())
    }
}

/// Global Descriptor Table
pub struct PosixFdTable {
    descriptors: RwLock<HashMap<i32, Arc<Mutex<Box<dyn FileHandle>>>>>,
    next_fd: AtomicI32,
}

impl PosixFdTable {
    pub fn new() -> Self {
        Self {
            descriptors: RwLock::new(HashMap::new()),
            next_fd: AtomicI32::new(3), // 0, 1, 2 reserved for stdio
        }
    }

    pub fn insert(&self, handle: Box<dyn FileHandle>) -> i32 {
        let fd = self.next_fd.fetch_add(1, Ordering::SeqCst);
        let mut table = self.descriptors.write().unwrap();
        table.insert(fd, Arc::new(Mutex::new(handle)));
        fd
    }

    pub fn insert_at(&self, fd: i32, handle: Box<dyn FileHandle>) {
        let mut table = self.descriptors.write().unwrap();
        table.insert(fd, Arc::new(Mutex::new(handle)));
    }

    pub fn get(&self, fd: i32) -> PosixResult<Arc<Mutex<Box<dyn FileHandle>>>> {
        let table = self.descriptors.read().unwrap();
        table.get(&fd).cloned().ok_or(Errno::EBADF)
    }

    pub fn remove(&self, fd: i32) -> PosixResult<()> {
        let mut table = self.descriptors.write().unwrap();
        table.remove(&fd).map(|_| ()).ok_or(Errno::EBADF)
    }

    pub fn contains(&self, fd: i32) -> bool {
        let table = self.descriptors.read().unwrap();
        table.contains_key(&fd)
    }
}

// Global FD Table singleton
static GLOBAL_FD_TABLE: std::sync::OnceLock<PosixFdTable> = std::sync::OnceLock::new();

pub fn fd_table() -> &'static PosixFdTable {
    GLOBAL_FD_TABLE.get_or_init(PosixFdTable::new)
}

// -------------------------------------------------------------
// POSIX C-Style API Functions
// -------------------------------------------------------------

pub fn posix_open(path: &Path, flags: OpenFlags, _mode: u32) -> PosixResult<i32> {
    let mut opts = OpenOptions::new();
    if flags.is_read_only() {
        opts.read(true);
    } else if flags.is_write_only() {
        opts.write(true);
    } else if flags.is_read_write() {
        opts.read(true).write(true);
    }

    if flags.is_create() {
        opts.create(true);
        if flags.is_exclusive() {
            opts.create_new(true);
        }
    }

    if flags.is_truncate() {
        opts.truncate(true);
    }

    if flags.is_append() {
        opts.append(true);
    }

    let file = opts.open(path).map_err(Errno::from)?;
    let handle = OsFileHandle {
        file,
        path: Some(path.to_path_buf()),
    };

    Ok(fd_table().insert(Box::new(handle)))
}

pub fn posix_read(fd: i32, buf: &mut [u8]) -> PosixResult<usize> {
    let handle_arc = fd_table().get(fd)?;
    let mut handle = handle_arc.lock().map_err(|_| Errno::EIO)?;
    handle.read(buf)
}

pub fn posix_write(fd: i32, buf: &[u8]) -> PosixResult<usize> {
    let handle_arc = fd_table().get(fd)?;
    let mut handle = handle_arc.lock().map_err(|_| Errno::EIO)?;
    handle.write(buf)
}

pub fn posix_lseek(fd: i32, offset: i64, whence: i32) -> PosixResult<u64> {
    let whence_enum = Whence::from_i32(whence)?;
    let seek_from = match whence_enum {
        Whence::Set => {
            if offset < 0 {
                return Err(Errno::EINVAL);
            }
            SeekFrom::Start(offset as u64)
        }
        Whence::Cur => SeekFrom::Current(offset),
        Whence::End => SeekFrom::End(offset),
    };

    let handle_arc = fd_table().get(fd)?;
    let mut handle = handle_arc.lock().map_err(|_| Errno::EIO)?;
    handle.seek(seek_from)
}

pub fn posix_close(fd: i32) -> PosixResult<()> {
    fd_table().remove(fd)
}

pub fn posix_fstat(fd: i32) -> PosixResult<FileStat> {
    let handle_arc = fd_table().get(fd)?;
    let handle = handle_arc.lock().map_err(|_| Errno::EIO)?;
    handle.fstat()
}

pub fn posix_pread(fd: i32, buf: &mut [u8], offset: u64) -> PosixResult<usize> {
    let handle_arc = fd_table().get(fd)?;
    let mut handle = handle_arc.lock().map_err(|_| Errno::EIO)?;
    let current_pos = handle.seek(SeekFrom::Current(0))?;
    handle.seek(SeekFrom::Start(offset))?;
    let res = handle.read(buf);
    let _ = handle.seek(SeekFrom::Start(current_pos));
    res
}

pub fn posix_pwrite(fd: i32, buf: &[u8], offset: u64) -> PosixResult<usize> {
    let handle_arc = fd_table().get(fd)?;
    let mut handle = handle_arc.lock().map_err(|_| Errno::EIO)?;
    let current_pos = handle.seek(SeekFrom::Current(0))?;
    handle.seek(SeekFrom::Start(offset))?;
    let res = handle.write(buf);
    let _ = handle.seek(SeekFrom::Start(current_pos));
    res
}

pub fn posix_fstatat(dirfd: i32, path: &Path, flags: i32) -> PosixResult<FileStat> {
    let target_path = if path.is_absolute() || dirfd == AT_FDCWD {
        path.to_path_buf()
    } else {
        return Err(Errno::ENOTSUP);
    };

    let meta = if (flags & AT_SYMLINK_NOFOLLOW) != 0 {
        std::fs::symlink_metadata(&target_path).map_err(Errno::from)?
    } else {
        std::fs::metadata(&target_path).map_err(Errno::from)?
    };

    let mut mode: u32 = 0;
    if meta.file_type().is_symlink() {
        mode |= S_IFLNK | 0o777;
    } else if meta.is_dir() {
        mode |= S_IFDIR | 0o755;
    } else if meta.is_file() {
        mode |= S_IFREG | 0o644;
    }

    let mtime = meta.modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    Ok(FileStat {
        st_dev: 1,
        st_ino: 1,
        st_mode: mode,
        st_nlink: 1,
        st_uid: 1000,
        st_gid: 1000,
        st_rdev: 0,
        st_size: meta.len() as i64,
        st_atime: mtime,
        st_mtime: mtime,
        st_ctime: mtime,
        st_blksize: 4096,
        st_blocks: (meta.len() as i64 + 511) / 512,
    })
}
