use serde::Serialize;
use std::fs;
use std::path;

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
    build_tree(&path)
}
