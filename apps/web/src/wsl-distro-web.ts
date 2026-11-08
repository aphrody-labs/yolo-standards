/**
 * WSL Distribution & WSLg Registration Simulator / Manifest
 * Registers the 'web' distribution identity conforming to WSL2 and WSLg specs.
 */

export interface WslDistributionConfig {
  distroName: string;
  version: 2;
  wslgEnabled: boolean;
  baseKernel: string;
  initPath: string;
  defaultUser: string;
  env: Record<string, string>;
  network: {
    mode: "mirrored" | "nat";
    dnsTunneling: boolean;
    autoProxy: boolean;
  };
  graphics: {
    wslgWaylandSocket: string;
    x11Display: string;
    dxgDevice: string;
  };
}

export function getWebDistributionConfig(): WslDistributionConfig {
  return {
    distroName: "web",
    version: 2,
    wslgEnabled: true,
    baseKernel: "C:\\Program Files\\WSL\\tools\\kernel",
    initPath: "/init",
    defaultUser: "aphrody",
    env: {
      "WSL_DISTRO_NAME": "web",
      "WAYLAND_DISPLAY": "wayland-0",
      "DISPLAY": ":0",
      "PULSE_SERVER": "/mnt/wslg/PulseServer",
      "XDG_RUNTIME_DIR": "/mnt/wslg/runtime-dir"
    },
    network: {
      mode: "mirrored",
      dnsTunneling: true,
      autoProxy: true
    },
    graphics: {
      wslgWaylandSocket: "/mnt/wslg/runtime-dir/wayland-0",
      x11Display: "/mnt/wslg/.X11-unix/X0",
      dxgDevice: "/dev/dxg"
    }
  };
}
