use serde::Serialize;
use std::{fs, fs::{File}};
use std::io::{Read, Write};
use std::{path, path::Path};


// Used for the explorer hierarchy
#[derive(Serialize)]
pub struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    children: Option<Vec<FileNode>>,
}

fn build_tree(path: &path::Path) -> Result<FileNode, String> {
    let metadata = fs::metadata(path).map_err(|e| e.to_string())?;

    let is_dir = metadata.is_dir();
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.display().to_string());

    let mut node = FileNode {
        name,
        path: path.display().to_string(),
        is_dir,
        children: None,
    };

    if is_dir {
        let mut children = Vec::new();
        let entries = fs::read_dir(path).map_err(|e| e.to_string())?;

        for entry in entries {
            match entry {
                Ok(entry) => {
                    let child_path = entry.path();
                    if let Ok(child_node) = build_tree(&child_path) {
                        children.push(child_node);
                    }
                }
                Err(_) => continue,
            }
        }

        node.children = Some(children);
    }

    Ok(node)
}

#[tauri::command]
pub fn get_folder_hierarchy(folder_path: String) -> Result<FileNode, String> {
    let path = path::PathBuf::from(folder_path);
    println!("[DEBUG: RUST] Built tree for {:?}", path);
    build_tree(&path)
}

// Used for interacting with the current file

// Reading
#[tauri::command]
pub fn read_file(file_path: String) -> Result<String, String> {
    let mut file = File::open(file_path).map_err(|e| e.to_string())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;
    println!("[DEBUG: RUST] Successfully read {} bytes", contents.len());
    Ok(contents)
}

#[tauri::command]
pub fn read_resc_file(file_path: String) -> Result<String, String> {
    // Determine the application's executable directory
    let exe_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or_else(|| "Failed to get executable directory".to_string())?
        .to_path_buf();

    // Construct the full path to the resource
    let resource_path = exe_dir.join("resources").join(file_path);

    let mut file = File::open(resource_path).map_err(|e| e.to_string())?;
    let mut contents = String::new();

    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;
    println!("[DEBUG: RUST] Successfully read {} bytes", contents.len());
    Ok(contents)
}

#[tauri::command]
pub fn read_file_binary(file_path: String) -> Result<Vec<u8>, String> {
    let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
    let mut contents = Vec::new();
    file.read_to_end(&mut contents).map_err(|e| e.to_string())?;
    println!("[DEBUG: RUST] Successfully read {} bytes", contents.len());
    Ok(contents)
}

#[tauri::command]
pub fn read_resc_file_binary(file_path: String) -> Result<Vec<u8>, String> {
    // Determine the application's executable directory
    let exe_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or_else(|| "Failed to get executable directory".to_string())?
        .to_path_buf();

    // Construct the full path to the resource
    let resource_path = exe_dir.join("resources").join(file_path);

    // Attempt to read the file
    match fs::read(&resource_path) {
        Ok(bytes) => {
            println!("[DEBUG: RUST] Reading {} bytes from bundled resource", bytes.len());
            Ok(bytes)
        }
        Err(e) => Err(e.to_string()),
    }
}



// Saving
#[tauri::command]
pub fn save_file_contents(file_path: String, new_content: String) -> Result<(), String> {
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(new_content.as_bytes()).map_err(|e| e.to_string())?;
    println!("[DEBUG: RUST] \"{}\" saved successfully", file_path);
    Ok(())
}

#[tauri::command]
pub fn rename_file(old_path: String, new_name: String) -> Result<(), String> {
    let old_path_ref = Path::new(&old_path);

    if !old_path_ref.exists() {
        return Err(format!("Source file does not exist: {}", old_path_ref.display()));
    }

    // Extract parent directory
    let parent_dir = old_path_ref
        .parent()
        .ok_or_else(|| format!("Cannot determine parent directory for: {}", old_path_ref.display()))?;

    let new_path = parent_dir.join(&new_name);

    if new_path.exists() {
        return Err(format!("A file already exists at destination: {}", new_path.display()));
    }

    fs::rename(&old_path_ref, &new_path)
        .map_err(|e| format!("Failed to rename file: {}", e))?;

    println!(
        "[DEBUG: RUST] File renamed from \"{}\" to \"{}\"",
        old_path_ref.display(),
        new_path.display()
    );
    Ok(())
}

#[tauri::command]
pub fn rename_folder(old_path: String, new_name: String) -> Result<(), String> {
    let old_path_ref = Path::new(&old_path);

    if !old_path_ref.exists() {
        return Err(format!("Source folder does not exist: {}", old_path_ref.display()));
    }

    if !old_path_ref.is_dir() {
        return Err(format!("Path is not a folder: {}", old_path_ref.display()));
    }

    // Extract parent directory
    let parent_dir = old_path_ref
        .parent()
        .ok_or_else(|| format!("Cannot determine parent directory for: {}", old_path_ref.display()))?;

    let new_path = parent_dir.join(&new_name);

    if new_path.exists() {
        return Err(format!("A folder already exists at destination: {}", new_path.display()));
    }

    fs::rename(&old_path_ref, &new_path)
        .map_err(|e| format!("Failed to rename folder: {}", e))?;

    println!(
        "[DEBUG: RUST] Folder renamed from \"{}\" to \"{}\"",
        old_path_ref.display(),
        new_path.display()
    );
    Ok(())
}


// Creating
#[tauri::command]
pub fn create_file(folder_path: String, file_name: String) -> Result<(), String> {
    let full_path = Path::new(&folder_path).join(&file_name);
    if full_path.exists() {
        return Err(format!("File already exists: {}", full_path.display()));
    }

    match File::create(&full_path) {
        Ok(_) => {
            println!("[DEBUG: RUST] \"{}\" created successfully", file_name);
            Ok(())
        },
        Err(e) => Err(format!("Failed to create file: {}", e)),
    }
}

#[tauri::command]
pub fn create_directory(path: String) -> Result<(), String> {
    let path_ref = Path::new(&path);

    if path_ref.exists() {
        return Err(format!("Directory already exists: {}", path_ref.display()));
    }

    match fs::create_dir_all(&path_ref) {
        Ok(_) => {
            println!("[DEBUG: RUST] Directory \"{}\" created successfully", path_ref.display());
            Ok(())
        },
        Err(e) => Err(format!("Failed to create directory: {}", e)),
    }
}

// Delete
#[tauri::command]
pub fn delete_file(file_path: String) -> Result<(), String> {
    match fs::remove_file(&file_path) {
        Ok(_) =>{ 
            println!("[DEBUG: RUST] File \"{}\" deleted successfully", file_path);
            Ok(())
        },
        Err(e) => Err(format!("Failed to delete file: {}", e)),
    }
}

#[tauri::command]
pub fn delete_directory(folder_path: String) -> Result<(), String> {
    match fs::remove_dir_all(&folder_path) {
        Ok(_) =>{ 
            println!("[DEBUG: RUST] Directory \"{}\" deleted successfully", folder_path);
            Ok(())
        },
        Err(e) => Err(format!("Failed to delete directory: {}", e)),
    }
}