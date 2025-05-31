
use tauri::Manager;
use std::{fs};


// Save Data
#[tauri::command]
pub fn save_workspaces(app_handle: tauri::AppHandle, folders: Vec<String>) -> Result<(), String> {
    // Resolve the AppData/Roaming/WriteRight directory
    let mut app_data_dir = match app_handle.path().app_data_dir() {
        Ok(path) => path,
        Err(e) => return Err(format!("Failed to get app data dir: {}", e)),
    };
    app_data_dir.push("WriteRight");
            
    // Create the directory if it doesn't exist
    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Could not create directory {:?}: {}", app_data_dir, e))?;

    // Prepare file path
    let file_path = app_data_dir.join("workspaces.json");

    // Serialize folder list to pretty JSON
    let json = match serde_json::to_string_pretty(&folders) {
        Ok(out) => out,
        Err(e) => return Err(format!("Serialization error: {}", e)),
    };

     // Write JSON to file
    match fs::write(&file_path, json) {
        Ok(_) => {
            println!("Saved workspaces to {:?}", file_path);
            Ok(())
        }
        Err(e) => Err(format!("Failed to write file {:?}: {}", file_path, e)),
    }
}


// Load Data
#[tauri::command]
pub fn load_workspaces(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let mut app_data_dir = match app_handle.path().app_data_dir() {
        Ok(path) => path,
        Err(e) => return Err(format!("Failed to get app data dir: {}", e)),
    };
    app_data_dir.push("WriteRight");
    let file_path = app_data_dir.join("workspaces.json");

    // If file doesn't exist yet, return empty list
    if !file_path.exists() {
        return Ok(Vec::new());
    }

    // Read file contents
    let raw = match fs::read_to_string(&file_path) {
        Ok(s) => s,
        Err(e) => return Err(format!("Failed to read file {:?}: {}", file_path, e)),
    };

    // Deserialize JSON to Vec<String>
    match serde_json::from_str(&raw) {
        Ok(list) => {
            println!("Loaded workspaces from {:?}", file_path);
            Ok(list)
        },
        Err(e) => Err(format!("Deserialization error: {}", e)),
    }
}