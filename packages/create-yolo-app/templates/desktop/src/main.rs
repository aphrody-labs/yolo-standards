mod sdf_renderer;
use dioxus::prelude::*;
use sdf_renderer::{SdfScene, Vec3};

fn main() {
    println!("[YOLO DESKTOP] Initializing 2026 Native SDF Pipeline...");
    dioxus::launch(app);
}

#[component]
fn app() -> Element {
    let mut count = use_signal(|| 0);
    let scene = SdfScene::new(2.5, Vec3::new(0.0, 0.0, 0.0));
    let sample_dist = scene.distance_at(Vec3::new(3.0, 0.0, 0.0));

    rsx! {
        div {
            h1 { "YOLO Desktop - Pure Dioxus RSX" }
            p { "Analytical SDF Distance: {sample_dist}" }
            p { "Count: {count}" }
            button {
                onclick: move |_| count += 1,
                "Increment State"
            }
        }
    }
}
