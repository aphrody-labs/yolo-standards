use serde::{Deserialize, Serialize};

#[derive(Debug, thiserror::Error)]
pub enum StandardError {
    #[error("Serialization / Deserialization error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Schema validation failed: {0}")]
    Validation(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WasmSection {
    pub id: u8,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebAssemblySpec {
    pub version: String,
    #[serde(rename = "coreSpecUrl")]
    pub core_spec_url: String,
    #[serde(rename = "componentModelSpecUrl")]
    pub component_model_spec_url: String,
    #[serde(rename = "valTypes")]
    pub val_types: Vec<String>,
    #[serde(rename = "componentTypes")]
    pub component_types: Vec<String>,
    pub sections: Vec<WasmSection>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpCapabilities {
    pub server: McpServerCapabilities,
    pub client: McpClientCapabilities,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpServerCapabilities {
    pub tools: Option<bool>,
    pub resources: Option<bool>,
    pub prompts: Option<bool>,
    pub logging: Option<bool>,
    pub streaming: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpClientCapabilities {
    pub roots: Option<bool>,
    pub sampling: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpSpec2026 {
    pub version: String,
    #[serde(rename = "protocolVersion")]
    pub protocol_version: String,
    pub transports: Vec<String>,
    pub capabilities: McpCapabilities,
}

pub fn parse_mcp_spec(json_str: &str) -> Result<McpSpec2026, StandardError> {
    let spec: McpSpec2026 = serde_json::from_str(json_str)?;
    Ok(spec)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mcp_deserialization() {
        let json_data = r#"{
            "version": "2026.1.0",
            "protocolVersion": "2026-01-01",
            "transports": ["stdio", "sse", "websocket", "memory"],
            "capabilities": {
                "server": { "tools": true },
                "client": { "roots": true }
            }
        }"#;

        let spec = parse_mcp_spec(json_data).expect("Must parse MCP spec");
        assert_eq!(spec.version, "2026.1.0");
        assert!(spec.capabilities.server.tools.unwrap_or(false));
    }
}
