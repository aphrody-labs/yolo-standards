//! POSIX Pthreads Abstraction: Mutex, RwLock, Condvar, Thread

use std::sync::{
    Condvar as StdCondvar, Mutex as StdMutex, MutexGuard,
    RwLock as StdRwLock, RwLockReadGuard, RwLockWriteGuard,
};
use std::thread::{self, JoinHandle};
use std::time::Duration;
use crate::errno::{Errno, PosixResult};

/// POSIX pthread_mutex_t wrapper
pub struct PthreadMutex<T> {
    inner: StdMutex<T>,
}

impl<T> PthreadMutex<T> {
    pub const fn new(value: T) -> Self {
        Self {
            inner: StdMutex::new(value),
        }
    }

    pub fn lock(&self) -> PosixResult<MutexGuard<'_, T>> {
        self.inner.lock().map_err(|_| Errno::EDEADLK)
    }

    pub fn trylock(&self) -> PosixResult<MutexGuard<'_, T>> {
        self.inner.try_lock().map_err(|_| Errno::EBUSY)
    }
}

/// POSIX pthread_rwlock_t wrapper
pub struct PthreadRwLock<T> {
    inner: StdRwLock<T>,
}

impl<T> PthreadRwLock<T> {
    pub const fn new(value: T) -> Self {
        Self {
            inner: StdRwLock::new(value),
        }
    }

    pub fn read(&self) -> PosixResult<RwLockReadGuard<'_, T>> {
        self.inner.read().map_err(|_| Errno::EDEADLK)
    }

    pub fn write(&self) -> PosixResult<RwLockWriteGuard<'_, T>> {
        self.inner.write().map_err(|_| Errno::EDEADLK)
    }

    pub fn try_read(&self) -> PosixResult<RwLockReadGuard<'_, T>> {
        self.inner.try_read().map_err(|_| Errno::EBUSY)
    }

    pub fn try_write(&self) -> PosixResult<RwLockWriteGuard<'_, T>> {
        self.inner.try_write().map_err(|_| Errno::EBUSY)
    }
}

/// POSIX pthread_cond_t wrapper
pub struct PthreadCondvar {
    inner: StdCondvar,
}

impl PthreadCondvar {
    pub const fn new() -> Self {
        Self {
            inner: StdCondvar::new(),
        }
    }

    pub fn wait<'a, T>(&self, guard: MutexGuard<'a, T>) -> PosixResult<MutexGuard<'a, T>> {
        self.inner.wait(guard).map_err(|_| Errno::EINVAL)
    }

    pub fn timedwait<'a, T>(
        &self,
        guard: MutexGuard<'a, T>,
        duration: Duration,
    ) -> PosixResult<(MutexGuard<'a, T>, bool)> {
        let (g, timeout_result) = self.inner.wait_timeout(guard, duration).map_err(|_| Errno::EINVAL)?;
        Ok((g, timeout_result.timed_out()))
    }

    pub fn signal(&self) {
        self.inner.notify_one();
    }

    pub fn broadcast(&self) {
        self.inner.notify_all();
    }
}

impl Default for PthreadCondvar {
    fn default() -> Self {
        Self::new()
    }
}

/// POSIX pthread_t handle abstraction
pub struct Pthread<T> {
    handle: Option<JoinHandle<T>>,
}

impl<T: Send + 'static> Pthread<T> {
    pub fn create<F>(f: F) -> PosixResult<Self>
    where
        F: FnOnce() -> T + Send + 'static,
    {
        let builder = thread::Builder::new();
        let handle = builder.spawn(f).map_err(Errno::from)?;
        Ok(Self {
            handle: Some(handle),
        })
    }

    pub fn join(&mut self) -> PosixResult<T> {
        let handle = self.handle.take().ok_or(Errno::ESRCH)?;
        handle.join().map_err(|_| Errno::EINVAL)
    }
}
