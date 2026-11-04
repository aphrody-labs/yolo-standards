//! Analytical Signed Distance Field (SDF) 3D Surface Evaluator in Pure Rust
//! Zero HTML, Zero CSS, Zero JS: 100% GPU / Native Math.

#[derive(Debug, Clone, Copy)]
pub struct Vec3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Vec3 {
    pub fn new(x: f32, y: f32, z: f32) -> Self {
        Self { x, y, z }
    }

    pub fn length(&self) -> f32 {
        (self.x * self.x + self.y * self.y + self.z * self.z).sqrt()
    }

    pub fn sub(&self, other: &Self) -> Self {
        Self::new(self.x - other.x, self.y - other.y, self.z - other.z)
    }
}

pub struct SdfScene {
    pub sphere_radius: f32,
    pub sphere_center: Vec3,
}

impl SdfScene {
    pub fn new(radius: f32, center: Vec3) -> Self {
        Self {
            sphere_radius: radius,
            sphere_center: center,
        }
    }

    /// Evaluates exact analytical distance to the sphere surface
    pub fn distance_at(&self, point: Vec3) -> f32 {
        point.sub(&self.sphere_center).length() - self.sphere_radius
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sphere_sdf() {
        let scene = SdfScene::new(1.0, Vec3::new(0.0, 0.0, 0.0));
        assert!((scene.distance_at(Vec3::new(2.0, 0.0, 0.0)) - 1.0).abs() < 1e-5);
        assert!((scene.distance_at(Vec3::new(0.0, 0.0, 0.0)) - (-1.0)).abs() < 1e-5);
    }
}
