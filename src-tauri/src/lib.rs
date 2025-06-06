#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub mod commands;

pub use commands::filesystem;
pub use commands::persistance;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                // File System
                    filesystem::get_folder_hierarchy,
                    // Delete
                    filesystem::delete_file,
                    filesystem::delete_directory,
                    // Create
                    filesystem::create_file,
                    filesystem::create_directory,
                    // Changes
                    filesystem::save_file_contents,
                    filesystem::rename_folder,
                    filesystem::rename_file,
                    // Reading
                    filesystem::read_file,
                    filesystem::read_resc_file,
                    filesystem::read_file_binary,
                    filesystem::read_resc_file_binary,

                // Persistance
                    persistance::save_workspaces,
                    persistance::load_workspaces])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
