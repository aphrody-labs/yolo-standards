//! GNU Extensions: getopt_long, asprintf, canonicalize_file_name, program_invocation_name

use std::path::{Path, PathBuf};
use std::sync::OnceLock;

/// Argument requirement for getopt_long
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HasArg {
    NoArgument = 0,
    RequiredArgument = 1,
    OptionalArgument = 2,
}

/// Long option specification for getopt_long
#[derive(Debug, Clone)]
pub struct LongOption {
    pub name: &'static str,
    pub has_arg: HasArg,
    pub val: i32,
}

#[derive(Debug, PartialEq, Eq)]
pub enum GetoptResult {
    Opt(i32, Option<String>),
    NonOption(String),
    Unknown(char),
    MissingArg(char),
    Done,
}

/// GNU getopt_long parser state
pub struct GetoptContext<'a> {
    pub args: &'a [String],
    pub optstring: &'a str,
    pub longopts: &'a [LongOption],
    pub optind: usize,
    pub optarg: Option<String>,
    pub optopt: Option<char>,
}

impl<'a> GetoptContext<'a> {
    pub fn new(args: &'a [String], optstring: &'a str, longopts: &'a [LongOption]) -> Self {
        Self {
            args,
            optstring,
            longopts,
            optind: 0,
            optarg: None,
            optopt: None,
        }
    }

    pub fn next(&mut self) -> GetoptResult {
        if self.optind >= self.args.len() {
            return GetoptResult::Done;
        }

        let arg = &self.args[self.optind];
        if arg == "--" {
            self.optind += 1;
            return GetoptResult::Done;
        }

        // Long option: --name or --name=val
        if arg.starts_with("--") && arg.len() > 2 {
            let full_opt = &arg[2..];
            let (name, inline_val) = match full_opt.find('=') {
                Some(idx) => (&full_opt[..idx], Some(full_opt[idx + 1..].to_string())),
                None => (full_opt, None),
            };

            for opt in self.longopts {
                if opt.name == name {
                    self.optind += 1;
                    match opt.has_arg {
                        HasArg::NoArgument => {
                            self.optarg = None;
                            return GetoptResult::Opt(opt.val, None);
                        }
                        HasArg::RequiredArgument => {
                            if let Some(val) = inline_val {
                                self.optarg = Some(val.clone());
                                return GetoptResult::Opt(opt.val, Some(val));
                            } else if self.optind < self.args.len() {
                                let val = self.args[self.optind].clone();
                                self.optind += 1;
                                self.optarg = Some(val.clone());
                                return GetoptResult::Opt(opt.val, Some(val));
                            } else {
                                return GetoptResult::MissingArg('?');
                            }
                        }
                        HasArg::OptionalArgument => {
                            self.optarg = inline_val.clone();
                            return GetoptResult::Opt(opt.val, inline_val);
                        }
                    }
                }
            }
            self.optind += 1;
            return GetoptResult::Unknown('?');
        }

        // Short option: -a or -oval
        if arg.starts_with('-') && arg.len() > 1 && arg != "-" {
            let opt_char = arg.chars().nth(1).unwrap();
            self.optopt = Some(opt_char);

            // Find in optstring
            if let Some(pos) = self.optstring.find(opt_char) {
                let rest = &self.optstring[pos + 1..];
                let is_required = rest.starts_with(':') && !rest.starts_with("::");
                let is_optional = rest.starts_with("::");

                if is_required {
                    if arg.len() > 2 {
                        let val = arg[2..].to_string();
                        self.optind += 1;
                        self.optarg = Some(val.clone());
                        return GetoptResult::Opt(opt_char as i32, Some(val));
                    } else if self.optind + 1 < self.args.len() {
                        let val = self.args[self.optind + 1].clone();
                        self.optind += 2;
                        self.optarg = Some(val.clone());
                        return GetoptResult::Opt(opt_char as i32, Some(val));
                    } else {
                        self.optind += 1;
                        return GetoptResult::MissingArg(opt_char);
                    }
                } else if is_optional {
                    if arg.len() > 2 {
                        let val = arg[2..].to_string();
                        self.optind += 1;
                        self.optarg = Some(val.clone());
                        return GetoptResult::Opt(opt_char as i32, Some(val));
                    } else {
                        self.optind += 1;
                        self.optarg = None;
                        return GetoptResult::Opt(opt_char as i32, None);
                    }
                } else {
                    self.optind += 1;
                    self.optarg = None;
                    return GetoptResult::Opt(opt_char as i32, None);
                }
            } else {
                self.optind += 1;
                return GetoptResult::Unknown(opt_char);
            }
        }

        // Non-option argument
        let non_opt = self.args[self.optind].clone();
        self.optind += 1;
        GetoptResult::NonOption(non_opt)
    }
}

/// GNU getopt_long helper function
pub fn getopt_long(
    args: &[String],
    optstring: &str,
    longopts: &[LongOption],
) -> Vec<GetoptResult> {
    let mut ctx = GetoptContext::new(args, optstring, longopts);
    let mut results = Vec::new();
    loop {
        match ctx.next() {
            GetoptResult::Done => break,
            res => results.push(res),
        }
    }
    results
}

/// GNU asprintf formatting macro equivalent
#[macro_export]
macro_rules! asprintf {
    ($($arg:tt)*) => {
        format!($($arg)*)
    };
}

/// GNU canonicalize_file_name (resolves symlinks, relative segments, returns canonical PathBuf)
pub fn canonicalize_file_name<P: AsRef<Path>>(path: P) -> std::io::Result<PathBuf> {
    std::fs::canonicalize(path)
}

/// GNU program_invocation_name / program_invocation_short_name
static PROGRAM_INVOCATION_NAME: OnceLock<String> = OnceLock::new();
static PROGRAM_INVOCATION_SHORT_NAME: OnceLock<String> = OnceLock::new();

pub fn program_invocation_name() -> &'static str {
    PROGRAM_INVOCATION_NAME.get_or_init(|| {
        std::env::current_exe()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|_| "unknown".to_string())
    })
}

pub fn program_invocation_short_name() -> &'static str {
    PROGRAM_INVOCATION_SHORT_NAME.get_or_init(|| {
        std::env::current_exe()
            .ok()
            .and_then(|p| p.file_name().map(|n| n.to_string_lossy().to_string()))
            .unwrap_or_else(|| "unknown".to_string())
    })
}
