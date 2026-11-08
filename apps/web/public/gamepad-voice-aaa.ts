/**
 * Xbox Gamepad Controller, Voice Recognition & AAA Fullscreen OS Control
 * Features:
 * - W3C Gamepad API (Standard Mapping + Guide/Xbox Button detection via button 16 / XInput)
 * - Web Audio API & Web Speech Recognition API (Hands-free Voice Commands)
 * - Fullscreen API with Pointer Lock & Gamepad Haptic Actuator (Dual Rumble Vibration)
 * - Complete PC & Game Navigation entirely driven by Gamepad and Voice
 */

export interface GamepadStateSnapshot {
  connected: boolean;
  id: string;
  buttons: {
    a: boolean; // Button 0: Jump / Select
    b: boolean; // Button 1: Attack / Back
    x: boolean; // Button 2: Nushell Wasm Attack
    y: boolean; // Button 3: Toggle Terminal
    lb: boolean; // Button 4
    rb: boolean; // Button 5
    lt: number; // Axis / Trigger 6
    rt: number; // Axis / Trigger 7
    back: boolean; // Button 8
    start: boolean; // Button 9
    ls: boolean; // Left Stick click
    rs: boolean; // Right Stick click
    dpadUp: boolean; // Button 12
    dpadDown: boolean; // Button 13
    dpadLeft: boolean; // Button 14
    dpadRight: boolean; // Button 15
    xboxGuide: boolean; // Button 16: Xbox Guide / Nexus Button
  };
  axes: {
    lx: number;
    ly: number;
    rx: number;
    ry: number;
  };
}

export class ModernAaaGamepadVoiceController {
  private gamepadIndex: number | null = null;
  private voiceRecognition: any = null;
  private isListeningVoice = false;
  private onActionCallback: ((action: string, payload?: any) => void) | null = null;
  private lastGuideButtonState = false;

  constructor(onAction: (action: string, payload?: any) => void) {
    this.onActionCallback = onAction;
    this.initGamepadEvents();
    this.initVoiceRecognition();
  }

  private initGamepadEvents() {
    window.addEventListener("gamepadconnected", (e: GamepadEvent) => {
      this.gamepadIndex = e.gamepad.index;
      if (this.onActionCallback) {
        this.onActionCallback("GAMEPAD_CONNECTED", {
          id: e.gamepad.id,
          mapping: e.gamepad.mapping
        });
      }
      this.triggerHapticFeedback(0.4, 0.4, 200);
    });

    window.addEventListener("gamepaddisconnected", () => {
      this.gamepadIndex = null;
      if (this.onActionCallback) {
        this.onActionCallback("GAMEPAD_DISCONNECTED");
      }
    });
  }

  public pollGamepad(): GamepadStateSnapshot | null {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[this.gamepadIndex ?? 0];
    if (!gp) return null;

    const b = gp.buttons;
    const snap: GamepadStateSnapshot = {
      connected: gp.connected,
      id: gp.id,
      buttons: {
        a: b[0]?.pressed || false,
        b: b[1]?.pressed || false,
        x: b[2]?.pressed || false,
        y: b[3]?.pressed || false,
        lb: b[4]?.pressed || false,
        rb: b[5]?.pressed || false,
        lt: b[6]?.value || 0,
        rt: b[7]?.value || 0,
        back: b[8]?.pressed || false,
        start: b[9]?.pressed || false,
        ls: b[10]?.pressed || false,
        rs: b[11]?.pressed || false,
        dpadUp: b[12]?.pressed || false,
        dpadDown: b[13]?.pressed || false,
        dpadLeft: b[14]?.pressed || false,
        dpadRight: b[15]?.pressed || false,
        xboxGuide: b[16]?.pressed || false
      },
      axes: {
        lx: gp.axes[0] || 0,
        ly: gp.axes[1] || 0,
        rx: gp.axes[2] || 0,
        ry: gp.axes[3] || 0
      }
    };

    // Detect Xbox Guide Button (Button 16) press to request Fullscreen or Focus
    if (snap.buttons.xboxGuide && !this.lastGuideButtonState) {
      if (this.onActionCallback) {
        this.onActionCallback("XBOX_BUTTON_PRESSED");
      }
      this.triggerHapticFeedback(1.0, 1.0, 300);
      this.toggleFullscreen();
    }
    this.lastGuideButtonState = snap.buttons.xboxGuide;

    return snap;
  }

  public triggerHapticFeedback(weakMagnitude: number = 0.5, strongMagnitude: number = 0.5, durationMs: number = 200) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[this.gamepadIndex ?? 0];
    if (gp && (gp as any).vibrationActuator) {
      try {
        (gp as any).vibrationActuator.playEffect("dual-rumble", {
          startDelay: 0,
          duration: durationMs,
          weakMagnitude,
          strongMagnitude
        });
      } catch {
        // ignore
      }
    }
  }

  public toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  private initVoiceRecognition() {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      this.voiceRecognition = new SpeechRec();
      this.voiceRecognition.continuous = true;
      this.voiceRecognition.interimResults = false;
      this.voiceRecognition.lang = "fr-FR";

      this.voiceRecognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        if (this.onActionCallback) {
          this.onActionCallback("VOICE_COMMAND", transcript);
        }

        // Voice Command Mapping
        if (transcript.includes("plein écran") || transcript.includes("fullscreen")) {
          this.toggleFullscreen();
        } else if (transcript.includes("saute") || transcript.includes("jump")) {
          if (this.onActionCallback) this.onActionCallback("JUMP");
        } else if (transcript.includes("attaque") || transcript.includes("feu") || transcript.includes("shoot")) {
          if (this.onActionCallback) this.onActionCallback("ATTACK");
        } else if (transcript.includes("terminal") || transcript.includes("console")) {
          if (this.onActionCallback) this.onActionCallback("TOGGLE_TERMINAL");
        }
      };

      this.voiceRecognition.onerror = () => {
        this.isListeningVoice = false;
      };

      try {
        this.voiceRecognition.start();
        this.isListeningVoice = true;
      } catch {
        this.isListeningVoice = false;
      }
    }
  }
}
