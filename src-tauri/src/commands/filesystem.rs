use serde::Serialize;
use std::{fs, fs::File};
use std::io::{Read, Write};
use std::{path, path::Path};

/// Used for the explorer hierarchy
#[derive(Serialize)]
pub struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    children: Option<Vec<FileNode>>,
}

fn build_tree(path: &Path) -> Result<FileNode, String> {
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

/// Get the folder hierarchy (no sandboxing needed here; we assume the front‐end already passed in a valid folder_path)
#[tauri::command]
pub fn get_folder_hierarchy(folder_path: String) -> Result<FileNode, String> {
    let path = path::PathBuf::from(folder_path);
    println!("[DEBUG: RUST] Built tree for {:?}", path);
    build_tree(&path)
}

// Helper: Ensure that `target` lies under `workspace_root`. Both are absolute paths (or relative, but we canonicalize).
fn ensure_within_workspace(workspace_root: &Path, target: &Path) -> Result<(), String> {
    // Canonicalize both (resolves symlinks, “..”, etc.)
    let root_canon = workspace_root
        .canonicalize()
        .map_err(|e| format!("Failed to canonicalize workspace root: {}", e))?;
    let target_canon = target
        .canonicalize()
        .map_err(|e| format!("Failed to canonicalize target path: {}", e))?;

    if !target_canon.starts_with(&root_canon) {
        return Err(format!(
            "Path '{}' is not inside workspace '{}'",
            target_canon.display(),
            root_canon.display()
        ));
    }
    Ok(())
}

//
// === Reading ===
//

#[tauri::command]
pub fn read_file(file_path: String) -> Result<String, String> {
    let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
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

//
// === Saving / Creating / Renaming / Deleting (all sandboxed) ===
//

#[tauri::command]
pub fn save_file_contents(
    workspace_root: String,
    file_path: String,
    new_content: String,
) -> Result<(), String> {
    let root = Path::new(&workspace_root);
    let target = Path::new(&file_path);

    // 1) Ensure file_path is under workspace_root
    ensure_within_workspace(root, target)?;

    // 2) Write new contents
    let mut file = File::create(target).map_err(|e| e.to_string())?;
    file.write_all(new_content.as_bytes()).map_err(|e| e.to_string())?;
    println!("[DEBUG: RUST] \"{}\" saved successfully", target.display());
    Ok(())
}

#[tauri::command]
pub fn rename_file(
    workspace_root: String,
    old_path: String,
    new_name: String,
) -> Result<(), String> {
    let root = Path::new(&workspace_root);
    let old_path_ref = Path::new(&old_path);

    // 1) Validate old_path is under workspace_root
    let old_parent = old_path_ref
        .parent()
        .ok_or_else(|| format!("Cannot determine parent of {}", old_path_ref.display()))?;
    ensure_within_workspace(root, old_parent)?;

    if !old_path_ref.exists() || !old_path_ref.is_file() {
        return Err(format!("Source file does not exist: {}", old_path_ref.display()));
    }

    // 2) Compute new full path in the same parent
    let new_path = old_parent.join(&new_name);

    // 3) Ensure new_path’s parent (i.e. old_parent) is still under workspace
    ensure_within_workspace(root, old_parent)?;

    if new_path.exists() {
        return Err(format!(
            "A file already exists at destination: {}",
            new_path.display()
        ));
    }

    // 4) Perform rename
    fs::rename(old_path_ref, &new_path).map_err(|e| format!("Failed to rename file: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn rename_folder(
    workspace_root: String,
    old_path: String,
    new_name: String,
) -> Result<(), String> {
    let root = Path::new(&workspace_root);
    let old_path_ref = Path::new(&old_path);

    // 1) Validate old_path is under workspace_root
    let old_parent = old_path_ref
        .parent()
        .ok_or_else(|| format!("Cannot determine parent of {}", old_path_ref.display()))?;
    ensure_within_workspace(root, old_parent)?;

    if !old_path_ref.exists() || !old_path_ref.is_dir() {
        return Err(format!(
            "Source folder does not exist or is not a directory: {}",
            old_path_ref.display()
        ));
    }

    // 2) Compute new full path
    let new_path = old_parent.join(&new_name);

    // 3) Ensure new_path’s parent is still under workspace
    ensure_within_workspace(root, old_parent)?;

    if new_path.exists() {
        return Err(format!(
            "A folder already exists at destination: {}",
            new_path.display()
        ));
    }

    // 4) Perform rename
    fs::rename(old_path_ref, &new_path)
        .map_err(|e| format!("Failed to rename folder: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn create_file(
    workspace_root: String,
    folder_path: String,
    file_name: String,
) -> Result<(), String> {
    let root = Path::new(&workspace_root);
    let parent = Path::new(&folder_path);

    // 1) Ensure parent exists and is under workspace
    if !parent.exists() || !parent.is_dir() {
        return Err(format!("Parent folder does not exist: {}", parent.display()));
    }
    ensure_within_workspace(root, parent)?;

    // 2) Construct full path for the new file
    let full_path = parent.join(&file_name);

    // 3) Don’t canonicalize full_path (it doesn’t exist yet). Instead, ensure parent is under workspace.
    if full_path.exists() {
        return Err(format!("File already exists: {}", full_path.display()));
    }

    // 4) Create the file
    File::create(&full_path).map_err(|e| format!("Failed to create file: {}", e))?;
    Ok(())
}


#[tauri::command]
pub fn create_directory(
    workspace_root: String,
    folder_path: String,
    new_folder_name: String,
) -> Result<(), String> {
    let root = Path::new(&workspace_root);
    let parent = Path::new(&folder_path);

    // 1) Ensure parent exists and is under workspace
    if !parent.exists() || !parent.is_dir() {
        return Err(format!("Parent folder does not exist: {}", parent.display()));
    }
    ensure_within_workspace(root, parent)?;

    // 2) Construct the full path for the new directory
    let full_path = parent.join(&new_folder_name);

    // 3) Ensure parent is still under workspace (we already checked that)
    if full_path.exists() {
        return Err(format!("Directory already exists: {}", full_path.display()));
    }

    // 4) Create the directory (and any needed parents)
    fs::create_dir_all(&full_path)
        .map_err(|e| format!("Failed to create directory: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn delete_file(
    workspace_root: String,
    file_path: String,
) -> Result<(), String> {
    let root = Path::new(&workspace_root);
    let target = Path::new(&file_path);

    // 1) Ensure target is under workspace root
    ensure_within_workspace(root, target)?;

    // 2) Delete the file
    fs::remove_file(&target)
        .map_err(|e| format!("Failed to delete file: {}", e))?;
    println!("[DEBUG: RUST] File \"{}\" deleted successfully", target.display());
    Ok(())
}

#[tauri::command]
pub fn delete_directory(
    workspace_root: String,
    folder_path: String,
) -> Result<(), String> {
    let root = Path::new(&workspace_root);
    let target = Path::new(&folder_path);

    // 1) Ensure target is under workspace root
    ensure_within_workspace(root, target)?;

    // 2) Recursively delete the directory
    fs::remove_dir_all(&target)
        .map_err(|e| format!("Failed to delete directory: {}", e))?;
    println!(
        "[DEBUG: RUST] Directory \"{}\" deleted successfully",
        target.display()
    );
    Ok(())
}
