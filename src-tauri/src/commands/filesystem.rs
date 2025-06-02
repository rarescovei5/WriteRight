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
#[tauri::command]
pub fn read_file(file_path: String) -> Result<String, String> {
    let mut file = File::open(file_path).map_err(|e| e.to_string())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;
    println!("[DEBUG: RUST] Successfully read {} bytes", contents.len());
    Ok(contents)
}

#[tauri::command]
pub fn save_file(file_path: String) -> Result<(), String> {
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(b"").map_err(|e| e.to_string())?;
    println!("[DEBUG: RUST] \"{}\" saved successfully", file_path);
    Ok(())
}

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
pub fn delete_file(file_path: String) -> Result<(), String> {
    match fs::remove_file(&file_path) {
        Ok(_) =>{ 
            println!("[DEBUG: RUST] File \"{}\" deleted successfully", file_path);
            Ok(())
        },
        Err(e) => Err(format!("Failed to delete file: {}", e)),
    }
}